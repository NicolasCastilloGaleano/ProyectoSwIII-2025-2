import { Router } from "express";
import * as controller from "./reports.controller";
import { validateReportQuery } from "./reports.validators";

const router = Router();

/**
 * Rutas de reportes semanales.
 */
router.get(
  "/weekly",
  validateReportQuery,
  controller.listWeeklyReportsController,
);
router.get(
  "/weekly/generate",
  validateReportQuery,
  controller.generateWeeklyReportController,
);
router.get("/weekly/:reportId", controller.getWeeklyReportController);

/**
 * Rutas de informes de pacientes.
 */
router.get(
  "/patients/:userId/evolution",
  validateReportQuery,
  controller.generatePatientEvolutionController,
);

/**
 * Rutas de agrupación de pacientes.
 */
router.get(
  "/patients/grouping",
  validateReportQuery,
  controller.groupPatientsController,
);

export default router;
