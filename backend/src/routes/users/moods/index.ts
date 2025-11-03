import { Router } from "express";

import * as controller from "./moods.controller";

import * as validations from "./moods.validations";

const router = Router({ mergeParams: true });

/**
 * Este router se monta en /api/users/:id/moods desde el módulo users:
 *   usersRouter.use("/:id/moods", moodRoutes);
 *
 * Queremos que todas las rutas validen :id al inicio.
 */
router.use(validations.validateUserIdParam);

/** Param validators: se ejecutan automáticamente si el param aparece en la ruta */
router.param("yyyymm", validations.validateYYYYMMParam);
router.param("day", validations.validateDayParam);
router.param("yyyy", validations.validateYearParam);

/** ---- Rutas de MES ---- */
router.get("/month/:yyyymm", controller.getMonthMoodsController);

/** ---- Rutas de AÑO ---- */
router.get("/year/:yyyy", controller.listYearMoodsController);

/** ---- Rutas de DÍA ---- */
router.put(
  "/month/:yyyymm/days/:day",
  validations.validateUpsertDayBody,
  controller.upsertDayMoodController,
);
router.patch(
  "/month/:yyyymm/days/:day",
  validations.validateUpsertDayBody,
  controller.upsertDayMoodController,
);
router.get("/month/:yyyymm/days/:day", controller.getDayMoodController);
router.delete("/month/:yyyymm/days/:day", controller.deleteDayMoodController);

/** ---- Conveniencia por query (?month= / ?year=) ---- */
router.get("/", validations.validateQueryMonthOrYear, (req, res, next) => {
  // Redirigimos internamente según lo que validó el middleware
  const month = res.locals?.moodParams?.yyyymm as string | undefined;
  const year = res.locals?.moodParams?.year as number | undefined;

  if (month) {
    return controller.getMonthMoodsController(req, res, next);
  }
  if (typeof year === "number") {
    return controller.listYearMoodsController(req, res, next);
  }
  return res
    .status(400)
    .json({ error: "Provide ?month=YYYY-MM or ?year=YYYY" });
});

export default router;
