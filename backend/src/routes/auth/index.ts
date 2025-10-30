import express from "express";
import verifyFirebaseJwt from "../../middlewares/verifyFirebaseJwt";
import { getLoggedInUserController } from "./auth.controller";

const router = express.Router();

router.get("/", (_, res) => res.send("Auth Service activo"));
router.get("/me", verifyFirebaseJwt, getLoggedInUserController);

export default router;
