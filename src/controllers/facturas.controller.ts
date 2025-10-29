import { Request, Response } from "express";
import { prisma } from "../config/db";

/**
 * ==========================================
 * CREAR UNA FACTURA DESPUÉS DE UN PAGO EXITOSO
 * ==========================================
 */
export const crearFactura = async (req: Request, res: Response) => {
  try {
    const { orden_id, pago_id } = req.body;

    if (!orden_id || !pago_id) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Buscar orden y pago para validar
    const orden = await prisma.orden_compra.findUnique({
      where: { orden_id: Number(orden_id) },
      include: { reservas: true },
    });
    if (!orden) return res.status(404).json({ message: "Orden no encontrada" });

    const pago = await prisma.pago.findUnique({
      where: { pago_id: Number(pago_id) },
    });
    if (!pago) return res.status(404).json({ message: "Pago no encontrado" });

    if (pago.pago_estado !== "exitoso") {
      return res
        .status(400)
        .json({ message: "No se puede generar factura para un pago no exitoso" });
    }

    // Calcular subtotal e impuestos
    const subtotal = orden.orden_total || 0;
    const impuestos = subtotal * 0.12; // 12% IVA (ajústalo si deseas)
    const total = subtotal + impuestos;

    // Generar número de factura (ejemplo: 001-001-000123)
    const nextNumber = Math.floor(Math.random() * 900000 + 100000);
    const fac_numero = `001-001-${nextNumber}`;

    // Crear factura
    const factura = await prisma.factura.create({
      data: {
        orden_id: Number(orden_id),
        pago_id: Number(pago_id),
        fac_numero,
        fac_subtotal: subtotal,
        fac_impuestos: impuestos,
        fac_total: total,
      },
    });

    res.status(201).json({
      message: "Factura generada correctamente",
      factura,
    });
  } catch (error) {
    console.error("❌ Error al crear factura:", error);
    res.status(500).json({ message: "Error al crear factura" });
  }
};

/**
 * ==========================================
 * OBTENER TODAS LAS FACTURAS
 * ==========================================
 */
export const obtenerFacturas = async (_req: Request, res: Response) => {
  try {
    const facturas = await prisma.factura.findMany({
      include: {
        orden: {
          include: {
            usuario: true,
            reservas: {
              include: {
                vuelo: {
                  include: { aerolinea: true, origen: true, destino: true },
                },
              },
            },
          },
        },
        pago: true,
      },
      orderBy: { fac_fecha_emision: "desc" },
    });

    res.json(facturas);
  } catch (error) {
    console.error("❌ Error al obtener facturas:", error);
    res.status(500).json({ message: "Error al obtener facturas" });
  }
};

/**
 * ==========================================
 * OBTENER UNA FACTURA POR ID
 * ==========================================
 */
export const obtenerFacturaPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const factura = await prisma.factura.findUnique({
      where: { fac_id: id },
      include: {
        orden: {
          include: {
            usuario: true,
            reservas: {
              include: {
                vuelo: {
                  include: { aerolinea: true, origen: true, destino: true },
                },
              },
            },
          },
        },
        pago: true,
      },
    });

    if (!factura)
      return res.status(404).json({ message: "Factura no encontrada" });

    res.json(factura);
  } catch (error) {
    console.error("❌ Error al obtener factura:", error);
    res.status(500).json({ message: "Error al obtener factura" });
  }
};

/**
 * ==========================================
 * OBTENER FACTURAS POR USUARIO
 * ==========================================
 */
export const obtenerFacturasPorUsuario = async (req: Request, res: Response) => {
  try {
    const usu_id = Number(req.params.id);

    const facturas = await prisma.factura.findMany({
      where: { orden: { usu_id } },
      include: {
        orden: {
          include: { reservas: true },
        },
        pago: true,
      },
      orderBy: { fac_fecha_emision: "desc" },
    });

    res.json(facturas);
  } catch (error) {
    console.error("❌ Error al obtener facturas del usuario:", error);
    res.status(500).json({ message: "Error al obtener facturas del usuario" });
  }
};
