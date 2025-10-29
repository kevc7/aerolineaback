import { Request, Response } from "express";
import { prisma } from "../config/db";

// ========================
// REGISTRO DE USUARIO
// ========================
export const register = async (req: Request, res: Response) => {
  try {
    const { correo, contrasenia, cedula, nombre, telefono } = req.body;

    if (!correo || !contrasenia || !cedula || !nombre) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const existe = await prisma.usuario.findUnique({
      where: { usu_correo: correo },
    });

    if (existe) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        usu_correo: correo,
        usu_contrasenia: contrasenia,
        usu_cedula: cedula,
        usu_nombre: nombre,
        usu_telefono: telefono || null,
      },
    });

    res.status(201).json({
      message: "✅ Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario.usu_id,
        nombre: nuevoUsuario.usu_nombre,
        correo: nuevoUsuario.usu_correo,
      },
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ========================
// LOGIN DE USUARIO
// ========================
export const login = async (req: Request, res: Response) => {
  try {
    const { correo, contrasenia } = req.body;

    if (!correo || !contrasenia) {
      return res.status(400).json({ message: "Correo y contraseña son requeridos" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { usu_correo: correo },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (usuario.usu_contrasenia !== contrasenia) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    res.json({
      message: "✅ Inicio de sesión exitoso",
      usuario: {
        id: usuario.usu_id,
        nombre: usuario.usu_nombre,
        correo: usuario.usu_correo,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el inicio de sesión" });
  }
};

// ========================
// LISTAR USUARIOS (opcional)
// ========================
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { usu_id: "asc" },
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};
