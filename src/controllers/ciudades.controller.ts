import { Request, Response } from "express";
import { prisma } from "../config/db";

/**
 * ==========================================
 * OBTENER TODAS LAS CIUDADES
 * ==========================================
 */
export const obtenerCiudades = async (_req: Request, res: Response) => {
  try {
    const ciudades = await prisma.ciudad.findMany({
      orderBy: { ciu_nom: "asc" },
    });

    res.json(ciudades);
  } catch (error) {
    console.error("❌ Error al obtener ciudades:", error);
    res.status(500).json({ message: "Error al obtener ciudades" });
  }
};

