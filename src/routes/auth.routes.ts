import { Router } from "express";
import { register, login, listarUsuarios } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", listarUsuarios); // opcional para pruebas

export default router;
