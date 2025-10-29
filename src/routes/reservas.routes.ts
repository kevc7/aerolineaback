import { Router } from "express";
import { crearReserva, obtenerReservas, obtenerReservaPorId, obtenerReservasUsuario, cancelarReserva,} from "../controllers/reservas.controller";

const router = Router();

// 🔹 Crear nueva reserva
router.post("/", crearReserva);

// 🔹 Obtener todas las reservas
router.get("/", obtenerReservas);

// 🔹 Obtener reservas de un usuario
router.get("/usuario/:id", obtenerReservasUsuario);

// 🔹 Obtener reserva por ID
router.get("/:id", obtenerReservaPorId);

// 🔹 Cancelar reserva
router.delete("/:id", cancelarReserva);

export default router;
