import { NextFunction, Request, Response } from "express";
import { z } from "zod";

/**
 * Validación básica de fechas en formato YYYY-MM-DD para los filtros.
 */
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function validateReportQuery(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { startDate, endDate, months, date } = req.query;

    if (startDate && !dateSchema.safeParse(startDate).success) {
      return res.status(400).json({
        success: false,
        message: "startDate debe tener formato YYYY-MM-DD",
      });
    }

    if (endDate && !dateSchema.safeParse(endDate).success) {
      return res.status(400).json({
        success: false,
        message: "endDate debe tener formato YYYY-MM-DD",
      });
    }

    if (date && !dateSchema.safeParse(date).success) {
      return res.status(400).json({
        success: false,
        message: "date debe tener formato YYYY-MM-DD",
      });
    }

    if (months) {
      const monthsNum = parseInt(String(months), 10);
      if (Number.isNaN(monthsNum) || monthsNum < 1 || monthsNum > 12) {
        return res.status(400).json({
          success: false,
          message: "months debe ser un número entre 1 y 12",
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
