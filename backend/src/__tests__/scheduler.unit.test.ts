import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  setupWeeklyReportsScheduler,
  startScheduler,
} from "../utils/scheduler";

vi.mock("../routes/reports/reports.service", () => {
  return {
    generateWeeklyReport: vi.fn(async () => ({
      reportId: "week-2024-1",
      weekStart: "2024-01-01",
      weekEnd: "2024-01-07",
      weekNumber: 1,
      year: 2024,
    })),
  };
});

import * as reportsService from "../routes/reports/reports.service";

describe("Scheduler de reportes semanales", () => {
  const generateWeeklyReport = vi.mocked(reportsService.generateWeeklyReport);

  const resetEnv = () => {
    delete process.env.ENABLE_WEEKLY_REPORTS_SCHEDULER;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-02T10:00:00Z")); // martes
    vi.spyOn(global, "setTimeout");
    vi.spyOn(global, "setInterval");
    generateWeeklyReport.mockClear();
    resetEnv();
  });

  it("debe ejecutar un reporte inmediato al arrancar y programar el siguiente lunes", () => {
    startScheduler();

    expect(generateWeeklyReport).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    const delay = vi.mocked(setTimeout).mock.calls[0]?.[1] as number;
    expect(delay).toBeGreaterThan(0);
  });

  it("debe deshabilitar el scheduler cuando la variable de entorno es false", () => {
    process.env.ENABLE_WEEKLY_REPORTS_SCHEDULER = "false";

    startScheduler();

    expect(generateWeeklyReport).not.toHaveBeenCalled();
    expect(setTimeout).not.toHaveBeenCalled();
    expect(setInterval).not.toHaveBeenCalled();
  });

  it("debe ejecutar el reporte cuando vence el timeout inicial y luego dejar intervalos activos", async () => {
    const referenceMonday = new Date("2024-01-01T00:00:00Z");

    setupWeeklyReportsScheduler(referenceMonday);
    expect(generateWeeklyReport).not.toHaveBeenCalled();

    // Simula la ejecucion del timeout programado
    const timeoutCallback = vi.mocked(setTimeout).mock.calls[0]?.[0] as
      | (() => void)
      | undefined;
    expect(timeoutCallback).toBeTypeOf("function");
    timeoutCallback?.();

    expect(generateWeeklyReport).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1);
    const intervalDelay = vi.mocked(setInterval).mock.calls[0]?.[1] as number;
    expect(intervalDelay).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
