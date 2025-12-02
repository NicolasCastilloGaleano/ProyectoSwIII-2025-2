import { Router } from "express";
import verifyFirebaseJwt, { requirePermission } from "@middlewares/verifyFirebaseJwt";
import * as controller from "./reports.controller";
import { validateReportQuery } from "./reports.validators";

const router = Router();

router.use(verifyFirebaseJwt);

/**
 * Rutas de reportes semanales.
 */
router.get(
  "/weekly",
  requirePermission("reports:view:any"),
  validateReportQuery,
  controller.listWeeklyReportsController,
);
router.get(
  "/weekly/generate",
  requirePermission("reports:generate"),
  validateReportQuery,
  controller.generateWeeklyReportController,
);
router.get(
  "/weekly/:reportId",
  requirePermission("reports:view:any"),
  controller.getWeeklyReportController,
);

/**
 * Rutas de informes de pacientes.
 */
router.get(
  "/patients/:userId/evolution",
  requirePermission("reports:view:any", {
    allowSelf: true,
    resourceResolver: (req) => req.params.userId,
  }),
  validateReportQuery,
  controller.generatePatientEvolutionController,
);

/**
 * Rutas de agrupación de pacientes.
 */
router.get(
  "/patients/grouping",
  requirePermission("reports:view:any"),
  validateReportQuery,
  controller.groupPatientsController,
);

export default router;
