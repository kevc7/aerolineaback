import { Router } from "express";
import {
  agregarTarjeta,
  obtenerTarjetasUsuario,
  obtenerTarjetaPorId,
  obtenerTodasLasTarjetas,
  actualizarTarjeta,
  desactivarTarjeta,
  eliminarTarjeta,
} from "../controllers/tarjetas.controller";

const router = Router();

router.post("/", agregarTarjeta);
router.get("/", obtenerTodasLasTarjetas);
router.get("/usuario/:id", obtenerTarjetasUsuario);
router.get("/:id", obtenerTarjetaPorId);
router.put("/:id", actualizarTarjeta);
router.patch("/:id/desactivar", desactivarTarjeta);
router.delete("/:id", eliminarTarjeta);

export default router;
