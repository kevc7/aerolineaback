import { Router } from "express";
import { obtenerCiudades } from "../controllers/ciudades.controller";

const router = Router();

// Obtener todas las ciudades
router.get("/", obtenerCiudades);

export default router;

