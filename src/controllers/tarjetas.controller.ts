import { Request, Response } from "express";
import { prisma } from "../config/db";

/**
 * ==========================================
 * AGREGAR TARJETA DE CRÉDITO A UN USUARIO
 * ==========================================
 */
export const agregarTarjeta = async (req: Request, res: Response) => {
  try {
    const { usu_id, numero, titular, vencimiento, tipo } = req.body;

    if (!usu_id || !numero || !titular || !vencimiento || !tipo) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios: usu_id, numero, titular, vencimiento, tipo",
      });
    }

    // Validar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { usu_id: Number(usu_id) },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const fechaVencimiento = new Date(vencimiento);
    if (isNaN(fechaVencimiento.getTime())) {
      return res
        .status(400)
        .json({ message: "Formato de vencimiento inválido (YYYY-MM-DD)" });
    }

    // Validar tipo de tarjeta
    const tiposValidos = ["Visa", "Mastercard", "American Express", "Diners Club"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        message: `Tipo de tarjeta inválido. Opciones: ${tiposValidos.join(", ")}`,
      });
    }

    // Crear tarjeta
    const tarjeta = await prisma.tarjeta_credito.create({
      data: {
        usu_id: Number(usu_id),
        tarj_numero: numero,
        tarj_titular: titular,
        tarj_vencimiento: fechaVencimiento,
        tarj_tipo: tipo,
        tarj_activa: true,
      },
    });

    res.status(201).json({
      message: "✅ Tarjeta agregada correctamente",
      tarjeta: {
        ...tarjeta,
        tarj_numero: "****" + numero.slice(-4), // Mostrar solo últimos 4 dígitos
      },
    });
  } catch (error) {
    console.error("❌ Error al agregar tarjeta:", error);
    res.status(500).json({ message: "Error al agregar tarjeta" });
  }
};

/**
 * ==========================================
 * OBTENER TARJETAS DE UN USUARIO
 * ==========================================
 */
export const obtenerTarjetasUsuario = async (req: Request, res: Response) => {
  try {
    const usu_id = Number(req.params.id);

    const tarjetas = await prisma.tarjeta_credito.findMany({
      where: { usu_id },
      include: { usuario: true },
    });

    if (tarjetas.length === 0) {
      return res
        .status(404)
        .json({ message: "Este usuario no tiene tarjetas registradas" });
    }

    // Enmascarar números de tarjeta
    const tarjetasSeguras = tarjetas.map((t) => ({
      ...t,
      tarj_numero: "****" + t.tarj_numero.slice(-4),
    }));

    res.json(tarjetasSeguras);
  } catch (error) {
    console.error("❌ Error al obtener tarjetas:", error);
    res.status(500).json({ message: "Error al obtener tarjetas" });
  }
};

/**
 * ==========================================
 * OBTENER TARJETA POR ID
 * ==========================================
 */
export const obtenerTarjetaPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const tarjeta = await prisma.tarjeta_credito.findUnique({
      where: { tarj_id: id },
      include: { usuario: true },
    });

    if (!tarjeta) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    res.json({
      ...tarjeta,
      tarj_numero: "****" + tarjeta.tarj_numero.slice(-4),
    });
  } catch (error) {
    console.error("❌ Error al obtener tarjeta:", error);
    res.status(500).json({ message: "Error al obtener tarjeta" });
  }
};

/**
 * ==========================================
 * OBTENER TODAS LAS TARJETAS (admin/debugging)
 * ==========================================
 */
export const obtenerTodasLasTarjetas = async (
  _req: Request,
  res: Response
) => {
  try {
    const tarjetas = await prisma.tarjeta_credito.findMany({
      include: { usuario: true },
      orderBy: { tarj_fecha_registro: "desc" },
    });

    // Enmascarar números
    const tarjetasSeguras = tarjetas.map((t) => ({
      ...t,
      tarj_numero: "****" + t.tarj_numero.slice(-4),
    }));

    res.json(tarjetasSeguras);
  } catch (error) {
    console.error("❌ Error al obtener tarjetas:", error);
    res.status(500).json({ message: "Error al obtener tarjetas" });
  }
};

/**
 * ==========================================
 * ACTUALIZAR TARJETA (estado activa/inactiva)
 * ==========================================
 */
export const actualizarTarjeta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { titular, vencimiento, activa } = req.body;

    const tarjetaActualizada = await prisma.tarjeta_credito.update({
      where: { tarj_id: id },
      data: {
        tarj_titular: titular,
        tarj_vencimiento: vencimiento ? new Date(vencimiento) : undefined,
        tarj_activa: activa,
      },
    });

    res.json({
      message: "✅ Tarjeta actualizada correctamente",
      tarjeta: {
        ...tarjetaActualizada,
        tarj_numero: "****" + tarjetaActualizada.tarj_numero.slice(-4),
      },
    });
  } catch (error) {
    console.error("❌ Error al actualizar tarjeta:", error);
    res.status(500).json({ message: "Error al actualizar tarjeta" });
  }
};

/**
 * ==========================================
 * DESACTIVAR TARJETA
 * ==========================================
 */
export const desactivarTarjeta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const tarjeta = await prisma.tarjeta_credito.update({
      where: { tarj_id: id },
      data: { tarj_activa: false },
    });

    res.json({
      message: "✅ Tarjeta desactivada correctamente",
      tarjeta: {
        ...tarjeta,
        tarj_numero: "****" + tarjeta.tarj_numero.slice(-4),
      },
    });
  } catch (error) {
    console.error("❌ Error al desactivar tarjeta:", error);
    res.status(500).json({ message: "Error al desactivar tarjeta" });
  }
};

/**
 * ==========================================
 * ELIMINAR TARJETA
 * ==========================================
 */
export const eliminarTarjeta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const tarjeta = await prisma.tarjeta_credito.findUnique({
      where: { tarj_id: id },
    });

    if (!tarjeta) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    await prisma.tarjeta_credito.delete({
      where: { tarj_id: id },
    });

    res.json({ message: "✅ Tarjeta eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar tarjeta:", error);
    res.status(500).json({ message: "Error al eliminar tarjeta" });
  }
};
