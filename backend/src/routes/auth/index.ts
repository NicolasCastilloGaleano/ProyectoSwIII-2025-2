import express from "express";
import verifyFirebaseJwt from "../../middlewares/verifyFirebaseJwt";
import { getLoggedInUserController, registerUserController } from "./auth.controller";

const router = express.Router();

router.get("/", (_, res) => res.send("Auth Service activo"));
router.get("/me", verifyFirebaseJwt, getLoggedInUserController);

// Crear usuario con email/contraseña
router.post("/register", registerUserController);

export default router;
