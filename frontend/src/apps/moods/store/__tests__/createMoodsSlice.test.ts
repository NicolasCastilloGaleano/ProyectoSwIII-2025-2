import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStore } from "zustand/vanilla";
import createMoodsSlice, { type MoodsSlice } from "../createMoodsSlice";
import {
  createMoods,
  getMoodAnalytics,
  type CreateMood,
} from "../../services/mood.service";

/**
 * Pruebas unitarias para la gestion de emociones almacenadas en el store.
 */
vi.mock("../../services/mood.service", () => ({
  createMoods: vi.fn(),
  getMoodAnalytics: vi.fn(),
}));

const createMoodsMock = createMoods as unknown as ReturnType<typeof vi.fn>;
const getMoodAnalyticsMock =
  getMoodAnalytics as unknown as ReturnType<typeof vi.fn>;

const buildPayload = (moods: string[]): CreateMood => ({
  day: "05",
  month: "08",
  year: "2024",
  userId: "user-123",
  moods: moods.map((moodId) => ({ moodId })),
});

const setupStore = () =>
  createStore<MoodsSlice>((...args) => ({
    ...createMoodsSlice(...args),
  }));

describe("createMoodsSlice", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-08-05T12:00:00Z"));
    vi.clearAllMocks();
  });

  it("rechaza solicitudes sin emociones validas", async () => {
    const store = setupStore();
    const response = await store
      .getState()
      .moodsState.addMoodsForToday(buildPayload([]));

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toMatch(/emocion/i);
    }
    expect(createMoodsMock).not.toHaveBeenCalled();
  });

  it("registra emociones nuevas y actualiza el historial del dia", async () => {
    const store = setupStore();
    createMoodsMock.mockResolvedValue({
      success: true,
      data: null,
      message: "Registro exitoso",
    });

    const response = await store
      .getState()
      .moodsState.addMoodsForToday(buildPayload(["feliz", "calma"]));

    expect(response).toMatchObject({
      success: true,
      message: "Registro exitoso",
    });
    const todayKey = new Date().toLocaleDateString("en-CA");
    expect(
      store.getState().moodsState.moods.moodHistory[todayKey],
    ).toEqual(["feliz", "calma"]);
  });

  it("impide registrar mas de tres emociones por dia", async () => {
    const store = setupStore();
    const response = await store
      .getState()
      .moodsState.addMoodsForToday(
        buildPayload(["feliz", "calma", "motivado", "agradecido"]),
      );

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toMatch(/solo puedes escoger/i);
    }
    expect(createMoodsMock).not.toHaveBeenCalled();
  });

  it("reemplaza las emociones existentes cuando se guarda nuevamente", async () => {
    const store = setupStore();
    const todayKey = new Date().toLocaleDateString("en-CA");

    store.setState((prev) => ({
      moodsState: {
        ...prev.moodsState,
        moods: {
          moodHistory: {
            [todayKey]: ["feliz", "calma"],
          },
        },
      },
    }));

    createMoodsMock.mockResolvedValue({
      success: true,
      data: null,
      message: "Actualizado",
    });

    const response = await store
      .getState()
      .moodsState.addMoodsForToday(buildPayload(["agradecido"]));

    expect(response).toMatchObject({
      success: true,
      message: "Actualizado",
    });
    expect(
      store.getState().moodsState.moods.moodHistory[todayKey],
    ).toEqual(["agradecido"]);
  });

  it("restablece el estado si la API responde con error", async () => {
    const store = setupStore();
    createMoodsMock.mockResolvedValue({
      success: false,
      error: "Error inesperado",
    });

    const response = await store
      .getState()
      .moodsState.addMoodsForToday(buildPayload(["feliz"]));

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe("Error inesperado");
    }

    const todayKey = new Date().toLocaleDateString("en-CA");
    expect(
      store.getState().moodsState.moods.moodHistory[todayKey],
    ).toEqual([]);
  });

  it("carga el analisis emocional y replica el timeline en el historial", async () => {
    const store = setupStore();

    getMoodAnalyticsMock.mockResolvedValue({
      success: true,
      data: {
        period: {
          focusMonth: "2025-02",
          months: ["2024-12", "2025-01", "2025-02"],
          from: "2024-12-01",
          to: "2025-02-28",
        },
        summary: {
          totalEntries: 5,
          daysTracked: 4,
          uniqueMoods: 3,
          currentStreak: 2,
          longestStreak: 3,
          lastEntryAt: "2025-02-14T13:00:00Z",
        },
        sentiment: {
          positive: 60,
          neutral: 20,
          negative: 20,
          wellbeingScore: 70,
          riskScore: 30,
        },
        topMoods: [],
        timeline: [
          {
            date: "2025-02-01",
            dayScore: 0.4,
            moods: [
              { moodId: "feliz", tone: "positivo", at: null, note: null },
            ],
          },
        ],
      },
      message: "OK",
    });

    const response = await store
      .getState()
      .moodsState.loadAnalytics({ userId: "user-123", month: "2025-02" });

    expect(response.success).toBe(true);
    expect(store.getState().moodsState.analyticsLoading).toBe(false);
    expect(store.getState().moodsState.analytics).toBeTruthy();
    expect(
      store.getState().moodsState.moods.moodHistory["2025-02-01"],
    ).toEqual(["feliz"]);
  });

  it("retorna error si no se proporciona userId al cargar analytics", async () => {
    const store = setupStore();
    const response = await store
      .getState()
      .moodsState.loadAnalytics({ userId: "" });

    expect(response.success).toBe(false);
    expect(getMoodAnalyticsMock).not.toHaveBeenCalled();
  });
});
