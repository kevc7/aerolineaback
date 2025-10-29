import { Router } from "express";
import {
  crearOrden,
  obtenerOrdenes,
  obtenerOrdenesUsuario,
  obtenerOrdenPorId,
  actualizarEstadoOrden,
  actualizarTipoEntrega,
  eliminarOrden,
} from "../controllers/ordenes.controller";

const router = Router();

// 🔹 Crear nueva orden
router.post("/", crearOrden);

// 🔹 Obtener todas las órdenes
router.get("/", obtenerOrdenes);

// 🔹 Obtener órdenes de un usuario
router.get("/usuario/:id", obtenerOrdenesUsuario);

// 🔹 Obtener orden por ID
router.get("/:id", obtenerOrdenPorId);

// 🔹 Actualizar estado de orden
router.put("/:id/estado", actualizarEstadoOrden);

// 🔹 Actualizar tipo de entrega
router.put("/:id/tipo-entrega", actualizarTipoEntrega);

// 🔹 Eliminar orden
router.delete("/:id", eliminarOrden);

export default router;
