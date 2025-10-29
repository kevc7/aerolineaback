import { Request, Response } from "express";
import { prisma } from "../config/db";

/**
 * ==========================================
 * FUNCIÓN AUXILIAR: Determinar tipo según edad
 * ==========================================
 */
const getTipoPorEdad = (edad: number): string => {
  if (edad >= 0 && edad <= 1) return "infante";
  if (edad >= 2 && edad <= 11) return "niño";
  return "adulto";
};

/**
 * ==========================================
 * AGREGAR PASAJERO A UNA RESERVA
 * ==========================================
 */
export const agregarPasajero = async (req: Request, res: Response) => {
  try {
    const { res_id, nombre, cedula, edad, tipo } = req.body;

    // Validar campos obligatorios
    if (!res_id || !nombre || !cedula || edad === undefined) {
      return res.status(400).json({
        message: "Faltan datos obligatorios: res_id, nombre, cedula, edad",
      });
    }

    // Validar edad
    const edadNum = Number(edad);
    if (isNaN(edadNum) || edadNum < 0 || edadNum > 120) {
      return res.status(400).json({
        message: "La edad debe ser un número entre 0 y 120",
      });
    }

    // Validar nombre
    if (nombre.trim().length < 3) {
      return res.status(400).json({
        message: "El nombre debe tener al menos 3 caracteres",
      });
    }

    // Validar cédula
    if (cedula.trim().length < 5) {
      return res.status(400).json({
        message: "La cédula/pasaporte debe tener al menos 5 caracteres",
      });
    }

    // Determinar tipo automáticamente basado en edad
    const tipoCalculado = getTipoPorEdad(edadNum);

    // Si se proporciona un tipo, validar que coincida
    if (tipo && tipo !== tipoCalculado) {
      return res.status(400).json({
        message: `El tipo "${tipo}" no corresponde a la edad ${edadNum}. Debería ser "${tipoCalculado}"`,
      });
    }

    // Verificar que la reserva existe
    const reserva = await prisma.reserva.findUnique({
      where: { res_id: Number(res_id) },
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Crear pasajero con el tipo calculado
    const pasajero = await prisma.pasajero.create({
      data: {
        res_id: Number(res_id),
        pas_nombre: nombre.trim(),
        pas_cedula: cedula.trim(),
        pas_edad: edadNum,
        pas_tipo: tipoCalculado, // Usar tipo calculado automáticamente
      },
    });

    res.status(201).json({
      message: "✅ Pasajero agregado correctamente",
      pasajero,
    });
  } catch (error) {
    console.error("❌ Error al agregar pasajero:", error);
    res.status(500).json({ message: "Error al agregar pasajero" });
  }
};

/**
 * ==========================================
 * OBTENER PASAJEROS DE UNA RESERVA
 * ==========================================
 */
export const obtenerPasajeros = async (req: Request, res: Response) => {
  try {
    const { res_id } = req.query;

    if (!res_id) {
      return res
        .status(400)
        .json({
          message: "Debe proporcionar res_id como parámetro de consulta",
        });
    }

    const pasajeros = await prisma.pasajero.findMany({
      where: { res_id: Number(res_id) },
      include: {
        reserva: {
          include: {
            vuelo: {
              include: { aerolinea: true, origen: true, destino: true },
            },
          },
        },
      },
    });

    if (pasajeros.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay pasajeros en esta reserva" });
    }

    res.json(pasajeros);
  } catch (error) {
    console.error("❌ Error al obtener pasajeros:", error);
    res.status(500).json({ message: "Error al obtener pasajeros" });
  }
};

/**
 * ==========================================
 * OBTENER PASAJERO POR ID
 * ==========================================
 */
export const obtenerPasajeroPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const pasajero = await prisma.pasajero.findUnique({
      where: { pas_id: id },
      include: {
        reserva: {
          include: {
            vuelo: {
              include: { aerolinea: true, origen: true, destino: true },
            },
          },
        },
      },
    });

    if (!pasajero) {
      return res.status(404).json({ message: "Pasajero no encontrado" });
    }

    res.json(pasajero);
  } catch (error) {
    console.error("❌ Error al obtener pasajero:", error);
    res.status(500).json({ message: "Error al obtener pasajero" });
  }
};

/**
 * ==========================================
 * ACTUALIZAR DATOS DEL PASAJERO
 * ==========================================
 */
export const actualizarPasajero = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nombre, cedula, edad, tipo } = req.body;

    const pasajeroActualizado = await prisma.pasajero.update({
      where: { pas_id: id },
      data: {
        pas_nombre: nombre,
        pas_cedula: cedula,
        pas_edad: edad,
        pas_tipo: tipo,
      },
    });

    res.json({
      message: "✅ Pasajero actualizado correctamente",
      pasajero: pasajeroActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar pasajero:", error);
    res.status(500).json({ message: "Error al actualizar pasajero" });
  }
};

/**
 * ==========================================
 * ELIMINAR PASAJERO DE UNA RESERVA
 * ==========================================
 */
export const eliminarPasajero = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const pasajero = await prisma.pasajero.findUnique({
      where: { pas_id: id },
    });

    if (!pasajero) {
      return res.status(404).json({ message: "Pasajero no encontrado" });
    }

    await prisma.pasajero.delete({
      where: { pas_id: id },
    });

    res.json({ message: "✅ Pasajero eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar pasajero:", error);
    res.status(500).json({ message: "Error al eliminar pasajero" });
  }
};
