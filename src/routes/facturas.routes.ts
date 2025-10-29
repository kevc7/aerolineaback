import { Router } from "express";
import {
  crearFactura,
  obtenerFacturas,
  obtenerFacturaPorId,
  obtenerFacturasPorUsuario,
} from "../controllers/facturas.controller";

const router = Router();

// Crear factura (requiere orden_id y pago_id)
router.post("/", crearFactura);

// Obtener todas las facturas
router.get("/", obtenerFacturas);

// Obtener una factura específica
router.get("/:id", obtenerFacturaPorId);

// Obtener facturas de un usuario
router.get("/usuario/:id", obtenerFacturasPorUsuario);

export default router;
