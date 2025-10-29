import { Request, Response } from "express";
import { prisma } from "../config/db";

/**
 * ==========================================
 * CREAR UNA NUEVA RESERVA
 * ==========================================
 */
export const crearReserva = async (req: Request, res: Response) => {
  try {
    const { orden_id, vl_id, cat_id, cantidad_asientos } = req.body;

    console.log(`\n🎫 === INICIANDO CREACIÓN DE RESERVA === [${new Date().toISOString()}]`);
    console.log(`   STACK TRACE:`, new Error().stack);
    console.log(`   Orden ID: ${orden_id}`);
    console.log(`   Vuelo ID: ${vl_id}`);
    console.log(`   Categoría ID: ${cat_id}`);
    console.log(`   Cantidad asientos: ${cantidad_asientos}`);

    if (!orden_id || !vl_id || !cat_id || !cantidad_asientos) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Buscar la categoría del vuelo
    const vueloCat = await prisma.vuelo_categoria.findFirst({
      where: { vl_id: Number(vl_id), cat_id: Number(cat_id) },
    });

    console.log(`   Asientos disponibles ANTES: ${vueloCat?.vlcat_asientos_disponibles}`);

    if (!vueloCat) {
      return res
        .status(404)
        .json({ message: "No existe la categoría seleccionada para este vuelo" });
    }

    if (vueloCat.vlcat_asientos_disponibles < cantidad_asientos) {
      return res.status(400).json({
        message: `Solo hay ${vueloCat.vlcat_asientos_disponibles} asientos disponibles`,
      });
    }

    // El precio unitario se toma de la categoría del vuelo
    const precioUnitario = vueloCat.vlcat_precio_base;

    // Crear la reserva (res_subtotal se calcula automáticamente en la BD)
    // NOTA: El trigger 'trg_validar_disponibilidad' se encarga automáticamente de:
    //       1. Validar que hay asientos disponibles
    //       2. Decrementar los asientos disponibles
    const reserva = await prisma.reserva.create({
      data: {
        orden_id: Number(orden_id),
        vl_id: Number(vl_id),
        cat_id: Number(cat_id),
        res_cantidad_asientos: cantidad_asientos,
        res_precio_unitario: precioUnitario,
        // res_subtotal se calcula automáticamente: cantidad * precio_unitario
      },
    });

    console.log(`   ✅ Reserva creada (trigger automático decrementó asientos)`);
    
    // Verificar el estado actualizado
    const vueloCatActualizado = await prisma.vuelo_categoria.findFirst({
      where: { vl_id: Number(vl_id), cat_id: Number(cat_id) },
    });
    
    console.log(`   Asientos disponibles DESPUÉS: ${vueloCatActualizado?.vlcat_asientos_disponibles}`);
    console.log(`🎫 === RESERVA COMPLETADA ===\n`);

    res.status(201).json({
      message: "Reserva creada correctamente",
      reserva,
    });
  } catch (error) {
    console.error("❌ Error al crear reserva:", error);
    res.status(500).json({ message: "Error al crear reserva" });
  }
};

/**
 * ==========================================
 * OBTENER TODAS LAS RESERVAS
 * ==========================================
 */
export const obtenerReservas = async (_req: Request, res: Response) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        vuelo: {
          include: {
            aerolinea: true,
            origen: true,
            destino: true,
          },
        },
        categoria: true,
        orden: {
          include: { usuario: true },
        },
      },
      orderBy: { res_fecha_reserva: "desc" },
    });

    res.json(reservas);
  } catch (error) {
    console.error("❌ Error al obtener reservas:", error);
    res.status(500).json({ message: "Error al obtener reservas" });
  }
};

/**
 * ==========================================
 * OBTENER RESERVAS DE UN USUARIO
 * ==========================================
 */
export const obtenerReservasUsuario = async (req: Request, res: Response) => {
  try {
    const usu_id = Number(req.params.id);

    const reservas = await prisma.reserva.findMany({
      where: { orden: { usu_id } },
      include: {
        vuelo: {
          include: { aerolinea: true, origen: true, destino: true },
        },
        categoria: true,
      },
      orderBy: { res_fecha_reserva: "desc" },
    });

    res.json(reservas);
  } catch (error) {
    console.error("❌ Error al obtener reservas del usuario:", error);
    res.status(500).json({ message: "Error al obtener reservas del usuario" });
  }
};

/**
 * ==========================================
 * OBTENER UNA RESERVA POR ID
 * ==========================================
 */
export const obtenerReservaPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const reserva = await prisma.reserva.findUnique({
      where: { res_id: id },
      include: {
        vuelo: {
          include: { aerolinea: true, origen: true, destino: true },
        },
        categoria: true,
        orden: { include: { usuario: true } },
      },
    });

    if (!reserva)
      return res.status(404).json({ message: "Reserva no encontrada" });

    res.json(reserva);
  } catch (error) {
    console.error("❌ Error al obtener reserva:", error);
    res.status(500).json({ message: "Error al obtener reserva" });
  }
};

/**
 * ==========================================
 * CANCELAR UNA RESERVA (opcional)
 * ==========================================
 */
export const cancelarReserva = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Buscar reserva existente
    const reserva = await prisma.reserva.findUnique({ where: { res_id: id } });
    if (!reserva)
      return res.status(404).json({ message: "Reserva no encontrada" });

    // Eliminar la reserva
    // NOTA: El trigger 'trg_devolver_asientos' se encarga automáticamente de
    //       devolver los asientos disponibles cuando se elimina una reserva
    await prisma.reserva.delete({ where: { res_id: id } });

    res.json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    console.error("❌ Error al cancelar reserva:", error);
    res.status(500).json({ message: "Error al cancelar reserva" });
  }
};
