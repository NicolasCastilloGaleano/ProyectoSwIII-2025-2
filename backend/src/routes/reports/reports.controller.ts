import { NextFunction, Request, Response } from "express";
import * as service from "./reports.service";
import { ReportFilters } from "./reports.interface";

/**
 * Genera un reporte semanal puntual (útil para pruebas o recálculo manual).
 * GET /api/reports/weekly?date=YYYY-MM-DD
 */
export async function generateWeeklyReportController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { date } = req.query;
    const report = await service.generateWeeklyReport(
      date ? String(date) : undefined,
    );
    return res.status(200).json({
      success: true,
      message: "Reporte semanal generado correctamente",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene un reporte semanal almacenado previamente.
 * GET /api/reports/weekly/:reportId
 */
export async function getWeeklyReportController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { reportId } = req.params;
    const report = await service.getWeeklyReport(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado",
      });
    }
    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lista los reportes semanales disponibles ordenados por fecha de generación.
 * GET /api/reports/weekly
 */
export async function listWeeklyReportsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const limit = req.query.limit
      ? parseInt(String(req.query.limit), 10)
      : 50;
    const reports = await service.listWeeklyReports(limit);
    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Genera un informe consolidado de evolución para un paciente.
 * GET /api/reports/patients/:userId/evolution
 */
export async function generatePatientEvolutionController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req.params;
    const { startDate, endDate, months } = req.query;

    const filters: ReportFilters = {
      userId,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      months: months ? parseInt(String(months), 10) : undefined,
    };

    const report = await service.generatePatientEvolutionReport(userId, filters);
    return res.status(200).json({
      success: true,
      message: "Informe de evolución generado correctamente",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Agrupa pacientes según su estado emocional (mejores, promedio, peores).
 * GET /api/reports/patients/grouping
 */
export async function groupPatientsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { startDate, endDate, months } = req.query;

    const filters: ReportFilters = {
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      months: months ? parseInt(String(months), 10) : undefined,
    };

    const grouping = await service.groupPatientsByEmotionalState(filters);
    return res.status(200).json({
      success: true,
      message: "Agrupación de pacientes generada correctamente",
      data: grouping,
    });
  } catch (error) {
    next(error);
  }
}
