import { Router } from "express";
import verifyFirebaseJwt, { requirePermission } from "@middlewares/verifyFirebaseJwt";
import * as Ctrl from "./events.controller";
import * as Interactions from "./events.interactions.controller";
import * as Comments from "./comments.controller";

const router = Router();

router.use(verifyFirebaseJwt);

router.get("/", requirePermission("events:read"), Ctrl.list);
router.post("/", requirePermission("events:manage"), Ctrl.create);
router.get("/:id", requirePermission("events:read"), Ctrl.getById);
router.put("/:id", requirePermission("events:manage"), Ctrl.update);
router.delete("/:id", requirePermission("events:manage"), Ctrl.remove);

// Interacciones
router.post("/:id/join", requirePermission("events:interact"), Interactions.join);
router.post("/:id/leave", requirePermission("events:interact"), Interactions.leave);
router.post("/:id/like", requirePermission("events:interact"), Ctrl.like);
router.post("/:id/unlike", requirePermission("events:interact"), Ctrl.unlike);
router.post("/:id/close", requirePermission("events:manage"), Ctrl.close);
router.post("/:id/checkin", requirePermission("events:interact"), Ctrl.checkIn);

// Comentarios
router.get("/:id/comments", requirePermission("events:read"), Comments.list);
router.post("/:id/comments", requirePermission("events:interact"), Comments.create);
router.delete(
  "/:id/comments/:commentId",
  requirePermission(["events:interact", "events:manage"]),
  Comments.remove,
);

export default router;
