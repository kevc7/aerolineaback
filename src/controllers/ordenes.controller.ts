import { Request, Response } from "express";
import { prisma } from "../config/db";

/**
 * ==========================================
 * CREAR NUEVA ORDEN DE COMPRA
 * ==========================================
 */
export const crearOrden = async (req: Request, res: Response) => {
  try {
    const { usu_id } = req.body;

    console.log("📦 Intentando crear orden para usuario:", usu_id);

    if (!usu_id) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    // Verificar que el usuario existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { usu_id: Number(usu_id) },
    });

    if (!usuarioExiste) {
      console.error(`❌ Usuario con ID ${usu_id} no existe`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("✅ Usuario encontrado:", usuarioExiste.usu_nombre);

    // Crear una nueva orden vacía (carrito)
    const nuevaOrden = await prisma.orden_compra.create({
      data: {
        usu_id: Number(usu_id),
        orden_estado: "carrito",
        orden_total: 0,
      },
    });

    console.log("✅ Orden creada exitosamente:", nuevaOrden.orden_id);

    res.status(201).json({
      message: "Orden creada correctamente",
      orden: nuevaOrden,
    });
  } catch (error: any) {
    console.error("❌ Error al crear orden:", error);
    console.error("❌ Error detallado:", error.message);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({ 
      message: "Error al crear orden",
      error: error.message 
    });
  }
};

/**
 * ==========================================
 * OBTENER TODAS LAS ÓRDENES
 * ==========================================
 */
export const obtenerOrdenes = async (_req: Request, res: Response) => {
  try {
    const ordenes = await prisma.orden_compra.findMany({
      include: {
        usuario: true,
        reservas: {
          include: {
            vuelo: {
              include: { aerolinea: true, origen: true, destino: true },
            },
            categoria: true,
          },
        },
        pagos: true,
        factura: true,
      },
      orderBy: { orden_fecha_creacion: "desc" },
    });

    res.json(ordenes);
  } catch (error) {
    console.error("❌ Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error al obtener órdenes" });
  }
};

/**
 * ==========================================
 * OBTENER ÓRDENES DE UN USUARIO
 * ==========================================
 */
export const obtenerOrdenesUsuario = async (req: Request, res: Response) => {
  try {
    const usu_id = Number(req.params.id);

    const ordenes = await prisma.orden_compra.findMany({
      where: { usu_id },
      include: {
        reservas: {
          include: {
            vuelo: { include: { aerolinea: true, origen: true, destino: true } },
            categoria: true,
          },
        },
        pagos: true,
        factura: true,
      },
      orderBy: { orden_fecha_creacion: "desc" },
    });

    res.json(ordenes);
  } catch (error) {
    console.error("❌ Error al obtener órdenes del usuario:", error);
    res.status(500).json({ message: "Error al obtener órdenes del usuario" });
  }
};

/**
 * ==========================================
 * OBTENER UNA ORDEN POR ID
 * ==========================================
 */
export const obtenerOrdenPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const orden = await prisma.orden_compra.findUnique({
      where: { orden_id: id },
      include: {
        usuario: true,
        reservas: {
          include: {
            vuelo: { include: { aerolinea: true, origen: true, destino: true } },
            categoria: true,
          },
        },
        pagos: true,
        factura: true,
      },
    });

    if (!orden)
      return res.status(404).json({ message: "Orden no encontrada" });

    res.json(orden);
  } catch (error) {
    console.error("❌ Error al obtener orden:", error);
    res.status(500).json({ message: "Error al obtener orden" });
  }
};

/**
 * ==========================================
 * ACTUALIZAR ESTADO DE UNA ORDEN
 * ==========================================
 */
export const actualizarEstadoOrden = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    if (!["carrito", "pagada", "cancelada"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const orden = await prisma.orden_compra.update({
      where: { orden_id: id },
      data: { orden_estado: estado },
    });

    res.json({
      message: `Orden actualizada a estado '${estado}'`,
      orden,
    });
  } catch (error) {
    console.error("❌ Error al actualizar estado de orden:", error);
    res.status(500).json({ message: "Error al actualizar estado de orden" });
  }
};

/**
 * ==========================================
 * ACTUALIZAR TIPO DE ENTREGA DE UNA ORDEN
 * ==========================================
 */
export const actualizarTipoEntrega = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { tipo_entrega } = req.body;

    // Validar tipo de entrega
    const tiposValidos = ["recoger_aeropuerto", "domicilio"];
    if (!tiposValidos.includes(tipo_entrega)) {
      return res.status(400).json({ 
        message: "Tipo de entrega inválido. Opciones: 'recoger_aeropuerto' o 'domicilio'" 
      });
    }

    // Verificar que la orden existe
    const ordenExistente = await prisma.orden_compra.findUnique({
      where: { orden_id: id },
    });

    if (!ordenExistente) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Actualizar tipo de entrega
    const orden = await prisma.orden_compra.update({
      where: { orden_id: id },
      data: { orden_tipo_entrega: tipo_entrega },
    });

    res.json({
      message: `Tipo de entrega actualizado a '${tipo_entrega}'`,
      orden,
    });
  } catch (error) {
    console.error("❌ Error al actualizar tipo de entrega:", error);
    res.status(500).json({ message: "Error al actualizar tipo de entrega" });
  }
};

/**
 * ==========================================
 * ELIMINAR ORDEN (si está vacía o cancelada)
 * ==========================================
 */
export const eliminarOrden = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const orden = await prisma.orden_compra.findUnique({
      where: { orden_id: id },
      include: { reservas: true },
    });

    if (!orden)
      return res.status(404).json({ message: "Orden no encontrada" });

    if (orden.orden_estado !== "cancelada" && orden.reservas.length > 0) {
      return res.status(400).json({
        message: "Solo se pueden eliminar órdenes vacías o canceladas",
      });
    }

    await prisma.orden_compra.delete({ where: { orden_id: id } });

    res.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar orden:", error);
    res.status(500).json({ message: "Error al eliminar orden" });
  }
};
