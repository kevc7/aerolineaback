import { Router } from "express";
import {
  iniciarPago,
  verificarYConfirmarPago,
  iniciarPagoMultiple,
  verificarYConfirmarPagoMultiple,
  obtenerPagos,
  obtenerPagoPorId,
  actualizarEstadoPago,
} from "../controllers/pagos.controller";

const router = Router();

// 🔹 Iniciar pago (genera código de verificación)
router.post("/iniciar", iniciarPago);

// 🔹 Verificar código y confirmar pago
router.post("/verificar", verificarYConfirmarPago);

// 🔹 Iniciar pago múltiple (pagar todo el carrito)
router.post("/iniciar-multiple", iniciarPagoMultiple);

// 🔹 Verificar código y confirmar pago múltiple
router.post("/verificar-multiple", verificarYConfirmarPagoMultiple);

// 🔹 Listar todos los pagos
router.get("/", obtenerPagos);

// 🔹 Obtener pago por ID
router.get("/:id", obtenerPagoPorId);

// 🔹 Actualizar estado de un pago
router.put("/:id", actualizarEstadoPago);

export default router;
