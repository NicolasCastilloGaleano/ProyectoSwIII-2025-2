import { Router } from "express";
import verifyFirebaseJwt from "@middlewares/verifyFirebaseJwt";
import * as Ctrl from "./events.controller";

const router = Router();

router.get("/", verifyFirebaseJwt, Ctrl.list);
router.post("/", verifyFirebaseJwt, Ctrl.create);
router.get("/:id", verifyFirebaseJwt, Ctrl.getById);
router.put("/:id", verifyFirebaseJwt, Ctrl.update);
router.delete("/:id", verifyFirebaseJwt, Ctrl.remove);

// Interacciones
router.post("/:id/join", verifyFirebaseJwt, Ctrl.join);
router.post("/:id/leave", verifyFirebaseJwt, Ctrl.leave);

// Comentarios
import * as Comments from "./comments.controller";
router.get("/:id/comments", verifyFirebaseJwt, Comments.list);
router.post("/:id/comments", verifyFirebaseJwt, Comments.create);
router.delete("/:id/comments/:commentId", verifyFirebaseJwt, Comments.remove);

export default router;
