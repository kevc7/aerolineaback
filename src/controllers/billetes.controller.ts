import { Request, Response } from "express";
import { prisma } from "../config/db";
import { randomUUID } from "crypto";

/**
 * ==========================================
 * CREAR BILLETE (después del pago y factura)
 * ==========================================
 */
export const crearBillete = async (req: Request, res: Response) => {
  try {
    const { res_id, pas_id, fac_id } = req.body;

    if (!res_id || !pas_id || !fac_id) {
      return res.status(400).json({
        message: "Faltan datos: se requiere reserva, pasajero y factura",
      });
    }

    // Verificar existencia
    const reserva = await prisma.reserva.findUnique({ where: { res_id } });
    const pasajero = await prisma.pasajero.findUnique({ where: { pas_id } });
    const factura = await prisma.factura.findUnique({ where: { fac_id } });

    if (!reserva || !pasajero || !factura) {
      return res.status(404).json({
        message: "Reserva, pasajero o factura no encontrada",
      });
    }

    // Generar código único (ejemplo: TK-UUID)
    const codigo = "TK-" + randomUUID().split("-")[0].toUpperCase();

    const billete = await prisma.billete.create({
      data: {
        res_id,
        pas_id,
        fac_id,
        bill_codigo: codigo,
      },
      include: {
        reserva: {
          include: {
            vuelo: {
              include: { aerolinea: true, origen: true, destino: true },
            },
          },
        },
        pasajero: true,
        factura: true,
      },
    });

    res.status(201).json({
      message: "🎫 Billete emitido correctamente",
      billete,
    });
  } catch (error) {
    console.error("❌ Error al crear billete:", error);
    res.status(500).json({ message: "Error al crear billete" });
  }
};

/**
 * ==========================================
 * LISTAR TODOS LOS BILLETES
 * ==========================================
 */
export const obtenerBilletes = async (_req: Request, res: Response) => {
  try {
    const billetes = await prisma.billete.findMany({
      include: {
        pasajero: true,
        reserva: {
          include: {
            vuelo: {
              include: { aerolinea: true, origen: true, destino: true },
            },
            categoria: true,
          },
        },
        factura: true,
      },
      orderBy: { bill_fecha_emision: "desc" },
    });

    res.json(billetes);
  } catch (error) {
    console.error("❌ Error al obtener billetes:", error);
    res.status(500).json({ message: "Error al obtener billetes" });
  }
};

/**
 * ==========================================
 * OBTENER BILLETE POR ID
 * ==========================================
 */
export const obtenerBilletePorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const billete = await prisma.billete.findUnique({
      where: { bill_id: id },
      include: {
        pasajero: true,
        reserva: {
          include: {
            vuelo: {
              include: { aerolinea: true, origen: true, destino: true },
            },
            categoria: true,
          },
        },
        factura: true,
      },
    });

    if (!billete)
      return res.status(404).json({ message: "Billete no encontrado" });

    res.json(billete);
  } catch (error) {
    console.error("❌ Error al obtener billete:", error);
    res.status(500).json({ message: "Error al obtener billete" });
  }
};

/**
 * ==========================================
 * LISTAR BILLETES POR USUARIO
 * ==========================================
 */
export const obtenerBilletesUsuario = async (req: Request, res: Response) => {
  try {
    const usu_id = Number(req.params.id);

    const billetes = await prisma.billete.findMany({
      where: {
        reserva: {
          orden: {
            usu_id,
          },
        },
      },
      include: {
        pasajero: true,
        reserva: {
          include: {
            vuelo: {
              include: { aerolinea: true, origen: true, destino: true },
            },
            categoria: true,
          },
        },
        factura: true,
      },
      orderBy: { bill_fecha_emision: "desc" },
    });

    res.json(billetes);
  } catch (error) {
    console.error("❌ Error al obtener billetes de usuario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener billetes del usuario" });
  }
};

/**
 * ==========================================
 * CAMBIAR ESTADO DE BILLETE (usado/cancelado)
 * ==========================================
 */
export const actualizarEstadoBillete = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    const billete = await prisma.billete.update({
      where: { bill_id: id },
      data: { bill_estado: estado },
    });

    res.json({
      message: "Estado de billete actualizado correctamente",
      billete,
    });
  } catch (error) {
    console.error("❌ Error al actualizar billete:", error);
    res.status(500).json({ message: "Error al actualizar billete" });
  }
};
