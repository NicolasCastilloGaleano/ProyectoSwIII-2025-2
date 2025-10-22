import { Router } from "express";
import * as Ctrl from "./users.controller";
import { verifyFirebaseJwt } from "@middlewares/verifyFirebaseJwt";

const router = Router();

router.get("/", verifyFirebaseJwt, Ctrl.list);
router.post("/", verifyFirebaseJwt, Ctrl.create);
router.get("/:id", verifyFirebaseJwt, Ctrl.getById);
router.put("/:id", verifyFirebaseJwt, Ctrl.update);
router.delete("/:id", verifyFirebaseJwt, Ctrl.remove);

export default router;
