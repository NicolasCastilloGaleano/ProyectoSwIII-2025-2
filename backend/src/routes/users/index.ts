import { Router } from "express";
import verifyFirebaseJwt from "../../middlewares/verifyFirebaseJwt";
import moodRoutes from "./moods";
import * as Ctrl from "./users.controller";

const router = Router();

router.get("/", verifyFirebaseJwt, Ctrl.list);
router.post("/", verifyFirebaseJwt, Ctrl.create);
router.get("/:id", verifyFirebaseJwt, Ctrl.getById);
router.put("/:id", verifyFirebaseJwt, Ctrl.update);
router.delete("/:id", verifyFirebaseJwt, Ctrl.remove);

router.use("/:id/moods", moodRoutes);

export default router;
