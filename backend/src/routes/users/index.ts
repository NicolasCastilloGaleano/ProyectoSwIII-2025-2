import { Router } from "express";
import verifyFirebaseJwt, { requirePermission } from "../../middlewares/verifyFirebaseJwt";
import moodRoutes from "./moods";
import * as Ctrl from "./users.controller";

const router = Router();

router.use(verifyFirebaseJwt);

router.get(
  "/",
  requirePermission("users:read:any", {
    allowSelf: true,
    resourceResolver: (req) => req.authUser?.uid,
  }),
  Ctrl.list,
);
router.post("/", requirePermission("users:create"), Ctrl.create);
router.get(
  "/:id",
  requirePermission("users:read:any", {
    allowSelf: true,
    resourceResolver: (req) => req.params.id,
  }),
  Ctrl.getById,
);
router.put(
  "/:id",
  requirePermission("users:write:any", {
    allowSelf: true,
    resourceResolver: (req) => req.params.id,
  }),
  Ctrl.update,
);
router.delete("/:id", requirePermission("users:delete:any"), Ctrl.remove);

router.use(
  "/:id/moods",
  requirePermission(
    ["moods:read:any", "moods:write:any"],
    {
      allowSelf: true,
      resourceResolver: (req) => req.params.id,
    },
  ),
  moodRoutes,
);

export default router;
