import { Router } from "express";
import {
  crearBillete,
  obtenerBilletes,
  obtenerBilletePorId,
  obtenerBilletesUsuario,
  actualizarEstadoBillete,
} from "../controllers/billetes.controller";

const router = Router();

// 🔹 Crear nuevo billete
router.post("/", crearBillete);

// 🔹 Listar todos los billetes
router.get("/", obtenerBilletes);

// 🔹 Obtener billete por ID
router.get("/:id", obtenerBilletePorId);

// 🔹 Obtener billetes por usuario
router.get("/usuario/:id", obtenerBilletesUsuario);

// 🔹 Cambiar estado (usado, cancelado)
router.put("/:id", actualizarEstadoBillete);

export default router;
