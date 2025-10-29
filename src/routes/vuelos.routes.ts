import { Router } from "express";
import {
  obtenerVuelos,
  obtenerVueloPorId,
  buscarVuelos,
  buscarPorHorarios,
  buscarPorTarifas,
  vuelosDisponibles,
} from "../controllers/vuelos.controller";

const router = Router();

// Ruta raíz - listar todos los vuelos
router.get("/", obtenerVuelos);
router.get("/obtener", obtenerVuelos);
router.get("/disponibles", vuelosDisponibles);
router.get("/horarios", buscarPorHorarios);
router.get("/tarifas", buscarPorTarifas);
router.get("/buscar/filtros", buscarVuelos);
router.get("/:id", obtenerVueloPorId);

export default router;
