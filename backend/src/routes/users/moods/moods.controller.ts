// src/modules/moods/moods.controller.ts
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { UpsertDayMoodDto } from "./moods.interface";
import * as service from "./moods.service";
import { HttpError } from "./moods.service";
import { MoodRouteLocals } from "./moods.types";

/** Helpers */
function getLocals(res: Response): MoodRouteLocals {
  return (res.locals as MoodRouteLocals) ?? {};
}

function badRequest(res: Response, message = "Invalid params") {
  return res.status(400).json({
    success: false,
    message,
    error: { code: "BAD_REQUEST" },
  });
}

/** Esquema del body para upsert de un día */
const upsertDaySchema = z.object({
  moodId: z.string().min(1, "moodId is required"),
  note: z.string().max(2000).optional(),
  at: z.string().datetime().optional(), // ISO opcional
});

/** GET /api/users/:id/moods/month/:yyyymm */
export async function getMonthMoodsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { moodParams } = getLocals(res);
    if (!moodParams?.uid || !moodParams?.yyyymm) {
      return badRequest(res);
    }
    const out = await service.getMonth(moodParams.uid, moodParams.yyyymm);
    return res.status(200).json({
      success: true,
      message: "Month loaded",
      data: out,
    });
  } catch (e) {
    next(e);
  }
}

/** GET /api/users/:id/moods/year/:yyyy */
export async function listYearMoodsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { moodParams } = getLocals(res);
    if (!moodParams?.uid || typeof moodParams.year !== "number") {
      return badRequest(res);
    }
    const out = await service.listYear(moodParams.uid, moodParams.year);
    return res.status(200).json({
      success: true,
      message: "Year months loaded",
      data: out,
    });
  } catch (e) {
    next(e);
  }
}

/** GET /api/users/:id/moods/analytics */
export async function getMoodAnalyticsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { moodParams } = getLocals(res);
    if (!moodParams?.uid) {
      return badRequest(res);
    }

    const analytics = await service.getMoodAnalytics(moodParams.uid, {
      month: moodParams.yyyymm,
      range: moodParams.range,
    });

    return res.status(200).json({
      success: true,
      message: "Análisis emocional generado correctamente",
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}

/** PUT/PATCH /api/users/:id/moods/month/:yyyymm/days/:day */
export const upsertDayMoodController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id: userId, yyyymm, day } = req.params;
    const payload = req.body as UpsertDayMoodDto;

    const result = await service.upsertDay(userId, yyyymm, day, payload);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({
        success: false,
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Error updating mood",
    });
  }
};

/** GET /api/users/:id/moods/month/:yyyymm/days/:day */
export async function getDayMoodController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { moodParams } = getLocals(res);
    if (!moodParams?.uid || !moodParams?.yyyymm || !moodParams.day) {
      return badRequest(res);
    }
    const out = await service.getDay(
      moodParams.uid,
      moodParams.yyyymm,
      moodParams.day,
    );
    return res.status(200).json({
      success: true,
      message: "Day mood loaded",
      data: out,
    });
  } catch (e) {
    next(e);
  }
}

/** DELETE /api/users/:id/moods/month/:yyyymm/days/:day */
export const deleteDayMoodController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id: userId, yyyymm, day } = req.params;
    const { moodId } = req.query;

    if (!moodId) {
      return res.status(400).json({
        success: false,
        error: "moodId query parameter is required",
      });
    }

    await service.deleteDayMood(userId, yyyymm, day, moodId as string);

    return res.status(200).json({
      success: true,
      message: "Mood deleted successfully",
    });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({
        success: false,
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Error deleting mood",
    });
  }
};
