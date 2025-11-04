import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStore } from "zustand/vanilla";
import createMoodsSlice, {
  type MoodsSlice,
} from "../createMoodsSlice";
import { createMoods, type CreateMood } from "../../services/mood.service";

/**
 * Pruebas unitarias para la gestión de emociones en el store de Zustand.
 * Se validan reglas de negocio sin requerir modificaciones en el slice original.
 */
vi.mock("../../services/mood.service", () => ({
  createMoods: vi.fn(),
}));

const createMoodsMock = createMoods as unknown as ReturnType<typeof vi.fn>;

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

describe("createMoodsSlice - Gestión de emociones", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-08-05T12:00:00Z"));
    vi.clearAllMocks();
  });

  it("rechaza solicitudes sin emociones válidas", async () => {
    const store = setupStore();
    const response = await store
      .getState()
      .moodsState.addMoodsForToday(buildPayload([]));

    if (!response.success) {
      expect(response.error).toMatch(/emociones/i);
    } else {
      throw new Error("Se esperaba respuesta con éxito = false");
    }
    expect(createMoodsMock).not.toHaveBeenCalled();
  });

  it("registra emociones nuevas y persiste en el historial del día", async () => {
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

  it("limita el registro a tres emociones por día", async () => {
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
      message: "Registro parcial",
    });

    const response = await store
      .getState()
      .moodsState.addMoodsForToday(buildPayload(["agradecido", "enojado"]));

    expect(response).toMatchObject({
      success: true,
      message: expect.stringContaining("Se limitaron a 3 emociones"),
    });

    const stored = store
      .getState()
      .moodsState.moods.moodHistory[todayKey];
    expect(stored).toEqual(["feliz", "calma", "agradecido"]);
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

    if (!response.success) {
      expect(response.error).toBe("Error inesperado");
    } else {
      throw new Error("Se esperaba respuesta con éxito = false");
    }

    const todayKey = new Date().toLocaleDateString("en-CA");
    expect(
      store.getState().moodsState.moods.moodHistory[todayKey],
    ).toEqual([]);
  });
});
