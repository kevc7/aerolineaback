import { Router } from "express";
import {
  agregarPasajero,
  obtenerPasajeros,
  obtenerPasajeroPorId,
  actualizarPasajero,
  eliminarPasajero,
} from "../controllers/pasajeros.controller";

const router = Router();

router.post("/", agregarPasajero);
router.get("/", obtenerPasajeros);
router.get("/:id", obtenerPasajeroPorId);
router.put("/:id", actualizarPasajero);
router.delete("/:id", eliminarPasajero);

export default router;
