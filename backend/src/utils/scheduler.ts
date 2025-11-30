import * as reportsService from "../routes/reports/reports.service";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Calcula la siguiente ejecucion (lunes a medianoche) a partir de una fecha base.
 */
function nextMondayAtMidnight(reference: Date): Date {
  const result = new Date(reference);
  const dayOfWeek = reference.getDay(); // 0 domingo, 1 lunes...
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;

  result.setDate(reference.getDate() + daysUntilMonday);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Configura el temporizador que dispara la generacion de reportes semanales.
 */
export function setupWeeklyReportsScheduler(reference: Date = new Date()) {
  const nextRun = nextMondayAtMidnight(reference);
  const delay = Math.max(0, nextRun.getTime() - reference.getTime());

  console.log(
    `[reports] Scheduler configurado. Proxima ejecucion: ${nextRun.toISOString()}`,
  );

  setTimeout(() => {
    void generateWeeklyReportScheduled();
    setInterval(() => void generateWeeklyReportScheduled(), WEEK_MS);
  }, delay);
}

/**
 * Genera el reporte semanal de forma automatica y registra su resultado.
 */
async function generateWeeklyReportScheduled() {
  try {
    console.log("[reports] Generando reporte semanal automatico...");
    const report = await reportsService.generateWeeklyReport();
    console.log(
      `[reports] Reporte semanal generado: ${report.reportId} (${report.weekStart} - ${report.weekEnd})`,
    );
  } catch (error) {
    console.error("[reports] Error al generar el reporte semanal:", error);
  }
}

/**
 * Arranca el scheduler. Esta activo por defecto y solo se desactiva
 * si la variable ENABLE_WEEKLY_REPORTS_SCHEDULER se fuerza a "false" o "0".
 * El reporte manual sigue disponible via endpoint /reports/weekly/generate.
 */
export function startScheduler() {
  const flag = process.env.ENABLE_WEEKLY_REPORTS_SCHEDULER;
  const disabled = flag && ["false", "0"].includes(flag.trim().toLowerCase());

  if (disabled) {
    console.log(
      "[reports] Scheduler de reportes semanales deshabilitado por configuracion.",
    );
    return;
  }

  // Ejecuta inmediatamente al arrancar para no depender de una llamada manual
  void generateWeeklyReportScheduled();

  setupWeeklyReportsScheduler();
  console.log("[reports] Scheduler de reportes semanales habilitado");
}
