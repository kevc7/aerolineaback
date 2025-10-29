import { Request, Response } from "express";
import { prisma } from "../config/db";
import { enviarCodigoVerificacion } from "../services/email.service";

/**
 * ==========================================
 * INICIAR PAGO (Genera código y lo "envía" por correo)
 * ==========================================
 */
export const iniciarPago = async (req: Request, res: Response) => {
  try {
    const { orden_id, tarj_id, tipo_entrega } = req.body;

    if (!orden_id || !tarj_id) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Verificar existencia de la orden
    const orden = await prisma.orden_compra.findUnique({
      where: { orden_id: Number(orden_id) },
      include: {
        usuario: true,
        reservas: true,
      },
    });
    
    if (!orden) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (orden.orden_estado !== "carrito") {
      return res.status(400).json({ message: "Esta orden ya no está en estado carrito" });
    }

    // Verificar existencia de la tarjeta y que sea del usuario
    const tarjeta = await prisma.tarjeta_credito.findUnique({
      where: { tarj_id: Number(tarj_id) },
    });
    
    if (!tarjeta) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    if (tarjeta.usu_id !== orden.usu_id) {
      return res.status(403).json({ message: "Esta tarjeta no pertenece al usuario de la orden" });
    }

    if (!tarjeta.tarj_activa) {
      return res.status(400).json({ message: "La tarjeta seleccionada está inactiva" });
    }

    // Generar código de verificación de 6 dígitos
    const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear el pago en estado "procesando" con el código
    const pago = await prisma.pago.create({
      data: {
        orden_id: Number(orden_id),
        tarj_id: Number(tarj_id),
        pago_monto: Number(orden.orden_total),
        pago_metodo: "tarjeta_credito",
        pago_estado: "procesando",
        pago_codigo_autorizacion: codigoVerificacion,
      },
    });

    // Actualizar tipo de entrega si se proporciona
    if (tipo_entrega) {
      await prisma.orden_compra.update({
        where: { orden_id: Number(orden_id) },
        data: { orden_tipo_entrega: tipo_entrega },
      });
    }

    // Enviar correo electrónico con el código
    try {
      await enviarCodigoVerificacion(
        orden.usuario.usu_correo,
        orden.usuario.usu_nombre,
        codigoVerificacion,
        Number(orden_id),
        Number(orden.orden_total)
      );
      console.log(`✅ Código de verificación enviado a: ${orden.usuario.usu_correo}`);
    } catch (emailError) {
      console.error("⚠️ Error al enviar correo, pero el pago se creó:", emailError);
      // Continuamos aunque falle el email
      // En producción, podrías querer revertir el pago si falla el email
    }

    // También mostramos en consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log("\n📧 ===== CÓDIGO DE VERIFICACIÓN (DESARROLLO) =====");
      console.log(`Para: ${orden.usuario.usu_correo}`);
      console.log(`🔐 Código: ${codigoVerificacion}`);
      console.log("===============================================\n");
    }

    res.status(201).json({
      message: "Código de verificación enviado a tu correo electrónico",
      pago_id: pago.pago_id,
      correo: orden.usuario.usu_correo,
      // En desarrollo, enviamos el código para facilitar pruebas
      codigo_desarrollo: process.env.NODE_ENV === 'development' ? codigoVerificacion : undefined,
    });
  } catch (error) {
    console.error("❌ Error al iniciar pago:", error);
    res.status(500).json({ message: "Error al iniciar pago" });
  }
};

/**
 * ==========================================
 * VERIFICAR CÓDIGO Y CONFIRMAR PAGO
 * ==========================================
 */
export const verificarYConfirmarPago = async (req: Request, res: Response) => {
  try {
    const { pago_id, codigo } = req.body;

    if (!pago_id || !codigo) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Buscar el pago
    const pago = await prisma.pago.findUnique({
      where: { pago_id: Number(pago_id) },
      include: {
        orden: {
          include: {
            reservas: {
              include: {
                pasajeros: true,
              },
            },
          },
        },
      },
    });

    if (!pago) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    if (pago.pago_estado !== "procesando") {
      return res.status(400).json({ message: "Este pago ya fue procesado" });
    }

    // Verificar el código
    if (pago.pago_codigo_autorizacion !== codigo) {
      return res.status(401).json({ message: "Código de verificación incorrecto" });
    }

    // Código correcto - Procesar pago
    console.log("\n💳 === PROCESANDO PAGO ===");
    console.log(`   Pago ID: ${pago_id}`);
    console.log(`   Monto: $${pago.pago_monto}`);

    // 1. Actualizar estado del pago a "exitoso"
    await prisma.pago.update({
      where: { pago_id: Number(pago_id) },
      data: { pago_estado: "exitoso" },
    });

    // 2. Actualizar estado de la orden a "pagada"
    await prisma.orden_compra.update({
      where: { orden_id: pago.orden_id },
      data: { orden_estado: "pagada" },
    });

    console.log("   ✅ Pago confirmado");
    console.log("   ✅ Orden actualizada a 'pagada'");

    // 3. Generar factura
      const numeroFactura = `FAC-${Date.now()}-${pago.orden_id}`;
      const subtotal = Number(pago.pago_monto);
      const impuestos = subtotal * 0.12; // 12% IVA
      const total = subtotal + impuestos;

    const factura = await prisma.factura.create({
      data: {
        orden_id: pago.orden_id,
        pago_id: pago.pago_id,
        fac_numero: numeroFactura,
        fac_subtotal: subtotal,
        fac_impuestos: impuestos,
        fac_total: total,
      },
    });

    console.log(`   ✅ Factura generada: ${numeroFactura}`);

    // 4. Emitir billetes para cada pasajero
    const billetes = [];
    
    for (const reserva of pago.orden.reservas) {
      for (const pasajero of reserva.pasajeros) {
        const codigoBillete = `TICKET-${Date.now()}-${reserva.res_id}-${pasajero.pas_id}`;
        
        const billete = await prisma.billete.create({
          data: {
            res_id: reserva.res_id,
            pas_id: pasajero.pas_id,
            fac_id: factura.fac_id,
            bill_codigo: codigoBillete,
            bill_estado: "emitido",
          },
        });
        
        billetes.push(billete);
      }
    }

    console.log(`   ✅ ${billetes.length} billete(s) emitido(s)`);
    console.log("💳 === PAGO COMPLETADO ===\n");

    res.json({
      message: "✅ Pago confirmado exitosamente",
      pago: { ...pago, pago_estado: "exitoso" },
      factura,
      billetes_emitidos: billetes.length,
    });
  } catch (error) {
    console.error("❌ Error al verificar y confirmar pago:", error);
    res.status(500).json({ message: "Error al verificar y confirmar pago" });
  }
};

/**
 * ==========================================
 * INICIAR PAGO MÚLTIPLE (Pagar todo el carrito)
 * ==========================================
 */
export const iniciarPagoMultiple = async (req: Request, res: Response) => {
  try {
    const { ordenes_ids, tarj_id, tipo_entrega } = req.body;

    if (!ordenes_ids || !Array.isArray(ordenes_ids) || ordenes_ids.length === 0 || !tarj_id) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Obtener todas las órdenes
    const ordenes = await prisma.orden_compra.findMany({
      where: {
        orden_id: { in: ordenes_ids.map(id => Number(id)) },
        orden_estado: "carrito"
      },
      include: {
        usuario: true,
        reservas: true,
      },
    });

    if (ordenes.length === 0) {
      return res.status(404).json({ message: "No se encontraron órdenes en estado carrito" });
    }

    // Verificar que todas las órdenes sean del mismo usuario
    const primerUsuarioId = ordenes[0].usu_id;
    if (!ordenes.every(orden => orden.usu_id === primerUsuarioId)) {
      return res.status(403).json({ message: "Las órdenes pertenecen a diferentes usuarios" });
    }

    const usuario = ordenes[0].usuario;

    // Verificar tarjeta
    const tarjeta = await prisma.tarjeta_credito.findUnique({
      where: { tarj_id: Number(tarj_id) },
    });
    
    if (!tarjeta || tarjeta.usu_id !== primerUsuarioId || !tarjeta.tarj_activa) {
      return res.status(400).json({ message: "Tarjeta no válida o inactiva" });
    }

    // Calcular monto total
    const montoTotal = ordenes.reduce((sum, orden) => sum + Number(orden.orden_total), 0);

    // Generar código de verificación único
    const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear un pago para cada orden
    const pagosCreados = [];
    for (const orden of ordenes) {
      const pago = await prisma.pago.create({
        data: {
          orden_id: orden.orden_id,
          tarj_id: Number(tarj_id),
          pago_monto: Number(orden.orden_total),
          pago_metodo: "tarjeta_credito",
          pago_estado: "procesando",
          pago_codigo_autorizacion: codigoVerificacion, // Mismo código para todas
        },
      });
      pagosCreados.push(pago);

      // Actualizar tipo de entrega si se proporciona
      if (tipo_entrega) {
        await prisma.orden_compra.update({
          where: { orden_id: orden.orden_id },
          data: { orden_tipo_entrega: tipo_entrega },
        });
      }
    }

    // Enviar correo con el código
    try {
      await enviarCodigoVerificacion(
        usuario.usu_correo,
        usuario.usu_nombre,
        codigoVerificacion,
        Number(ordenes[0].orden_id), // Usamos el ID de la primera orden como referencia
        montoTotal
      );
      console.log(`✅ Código de verificación enviado a: ${usuario.usu_correo}`);
    } catch (emailError) {
      console.error("⚠️ Error al enviar correo:", emailError);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("\n📧 ===== CÓDIGO DE VERIFICACIÓN (DESARROLLO) =====");
      console.log(`Para: ${usuario.usu_correo}`);
      console.log(`🔐 Código: ${codigoVerificacion}`);
      console.log(`📦 Órdenes: ${ordenes.map(o => o.orden_id).join(', ')}`);
      console.log(`💰 Total: $${montoTotal.toFixed(2)}`);
      console.log("===============================================\n");
    }

    res.status(201).json({
      message: "Código de verificación enviado para pago múltiple",
      pagos_ids: pagosCreados.map(p => p.pago_id),
      codigo_verificacion: codigoVerificacion,
      correo: usuario.usu_correo,
      ordenes_count: ordenes.length,
      monto_total: montoTotal,
      codigo_desarrollo: process.env.NODE_ENV === 'development' ? codigoVerificacion : undefined,
    });
  } catch (error) {
    console.error("❌ Error al iniciar pago múltiple:", error);
    res.status(500).json({ message: "Error al iniciar pago múltiple" });
  }
};

/**
 * ==========================================
 * VERIFICAR CÓDIGO Y CONFIRMAR PAGO MÚLTIPLE
 * ==========================================
 */
export const verificarYConfirmarPagoMultiple = async (req: Request, res: Response) => {
  try {
    const { codigo_verificacion, codigo } = req.body;

    if (!codigo_verificacion || !codigo) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Buscar todos los pagos con ese código
    const pagos = await prisma.pago.findMany({
      where: { 
        pago_codigo_autorizacion: codigo_verificacion,
        pago_estado: "procesando"
      },
      include: {
        orden: {
          include: {
            reservas: {
              include: {
                pasajeros: true,
              },
            },
          },
        },
      },
    });

    if (pagos.length === 0) {
      return res.status(404).json({ message: "No se encontraron pagos pendientes con ese código" });
    }

    // Verificar el código
    if (codigo_verificacion !== codigo) {
      return res.status(401).json({ message: "Código de verificación incorrecto" });
    }

    console.log("\n💳 === PROCESANDO PAGO MÚLTIPLE ===");
    console.log(`   Órdenes: ${pagos.length}`);
    console.log(`   Monto Total: $${pagos.reduce((sum, p) => sum + Number(p.pago_monto), 0).toFixed(2)}`);

    const facturasCreadas = [];
    let billetesCreados = 0;

    // Procesar cada pago
    for (const pago of pagos) {
      // 1. Actualizar estado del pago
      await prisma.pago.update({
        where: { pago_id: pago.pago_id },
        data: { pago_estado: "exitoso" },
      });

      // 2. Actualizar estado de la orden
      await prisma.orden_compra.update({
        where: { orden_id: pago.orden_id },
        data: { orden_estado: "pagada" },
      });

      // 3. Generar factura
      const numeroFactura = `FAC-${Date.now()}-${pago.orden_id}`;
      const subtotal = Number(pago.pago_monto);
      const impuestos = subtotal * 0.12;
      const total = subtotal + impuestos;

      const factura = await prisma.factura.create({
        data: {
          orden_id: pago.orden_id,
          pago_id: pago.pago_id,
          fac_numero: numeroFactura,
          fac_subtotal: subtotal,
          fac_impuestos: impuestos,
          fac_total: total,
        },
      });

      facturasCreadas.push(factura);

      // 4. Emitir billetes
      for (const reserva of pago.orden.reservas) {
        for (const pasajero of reserva.pasajeros) {
          const codigoBillete = `TICKET-${Date.now()}-${reserva.res_id}-${pasajero.pas_id}`;
          
          await prisma.billete.create({
            data: {
              res_id: reserva.res_id,
              pas_id: pasajero.pas_id,
              fac_id: factura.fac_id,
              bill_codigo: codigoBillete,
              bill_estado: "emitido",
            },
          });
          
          billetesCreados++;
        }
      }

      console.log(`   ✅ Orden #${pago.orden_id} procesada`);
    }

    console.log(`   ✅ ${facturasCreadas.length} factura(s) generada(s)`);
    console.log(`   ✅ ${billetesCreados} billete(s) emitido(s)`);
    console.log("💳 === PAGO MÚLTIPLE COMPLETADO ===\n");

    res.json({
      message: "✅ Pago múltiple confirmado exitosamente",
      ordenes_procesadas: pagos.length,
      facturas_generadas: facturasCreadas.length,
      billetes_emitidos: billetesCreados,
      monto_total: pagos.reduce((sum, p) => sum + Number(p.pago_monto), 0),
    });
  } catch (error) {
    console.error("❌ Error al verificar pago múltiple:", error);
    res.status(500).json({ message: "Error al verificar pago múltiple" });
  }
};

/**
 * ==========================================
 * OBTENER TODOS LOS PAGOS
 * ==========================================
 */
export const obtenerPagos = async (_req: Request, res: Response) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: {
        orden: true,
        tarjeta: {
          include: {
            usuario: true,
          },
        },
      },
      orderBy: { pago_fecha: "desc" },
    });

    res.json(pagos);
  } catch (error) {
    console.error("❌ Error al obtener pagos:", error);
    res.status(500).json({ message: "Error al obtener pagos" });
  }
};

/**
 * ==========================================
 * OBTENER PAGO POR ID
 * ==========================================
 */
export const obtenerPagoPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const pago = await prisma.pago.findUnique({
      where: { pago_id: id },
      include: {
        orden: true,
        tarjeta: { include: { usuario: true } },
      },
    });

    if (!pago) return res.status(404).json({ message: "Pago no encontrado" });

    res.json(pago);
  } catch (error) {
    console.error("❌ Error al obtener pago:", error);
    res.status(500).json({ message: "Error al obtener pago" });
  }
};

/**
 * ==========================================
 * ACTUALIZAR ESTADO DE UN PAGO
 * ==========================================
 */
export const actualizarEstadoPago = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    if (!estado)
      return res.status(400).json({ message: "Debe enviar un estado" });

    if (!["procesando", "exitoso", "rechazado"].includes(estado)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const pago = await prisma.pago.update({
      where: { pago_id: id },
      data: { pago_estado: estado },
    });

    res.json({
      message: "Estado de pago actualizado correctamente",
      pago,
    });
  } catch (error) {
    console.error("❌ Error al actualizar pago:", error);
    res.status(500).json({ message: "Error al actualizar pago" });
  }
};
