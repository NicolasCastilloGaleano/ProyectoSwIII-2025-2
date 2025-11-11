import type { SafeResponse } from "@/services/common.interface";
import type { StateCreator } from "zustand";
import {
  createMoods,
  getMoodAnalytics,
  type CreateMood,
  type MoodDTO,
} from "../services/mood.service";
import type { MoodAnalytics } from "../services/mood.interface";

interface Moods {
  moodHistory: Record<string, string[]>; // dateKey -> moodIds[]
}

type LoadingKind = "add" | "remove" | null;

interface MoodsState {
  moods: Moods;
  loadingMoods: LoadingKind;
  analytics: MoodAnalytics | null;
  analyticsLoading: boolean;
  addMoodsForToday: (props: CreateMood) => Promise<SafeResponse<null>>;
  getMoodsForDate: (date: string) => string[];
  loadAnalytics: (payload: {
    userId: string;
    month?: string;
    range?: number;
  }) => Promise<SafeResponse<MoodAnalytics | null>>;
}

export interface MoodsSlice {
  moodsState: MoodsState;
}

const todayKey = () => new Date().toLocaleDateString("en-CA");
const MAX_MOODS_PER_DAY = 3;

const sanitizeMoodPayload = (moods?: MoodDTO[]) => {
  const seen = new Set<string>();
  const sanitized: MoodDTO[] = [];
  (moods ?? []).forEach((mood) => {
    const id = mood?.moodId?.trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    sanitized.push({ ...mood, moodId: id });
  });
  return sanitized.slice(0, MAX_MOODS_PER_DAY);
};

export const createMoodsSlice: StateCreator<MoodsSlice> = (set, get) => ({
  moodsState: {
    moods: { moodHistory: {} },
    loadingMoods: null,
    analytics: null,
    analyticsLoading: false,

    addMoodsForToday: async (
      props: CreateMood,
    ): Promise<SafeResponse<null>> => {
      const today = todayKey();
      const sanitizedMoods = sanitizeMoodPayload(props.moods);
      const validCount = (props.moods ?? []).filter((m) => m?.moodId).length;

      if (sanitizedMoods.length === 0) {
        return {
          success: false,
          error: "Debes seleccionar al menos una emocion valida.",
        };
      }

      if (validCount > MAX_MOODS_PER_DAY) {
        return {
          success: false,
          error: "Solo puedes escoger hasta 3 emociones por dia.",
        };
      }

      const snapshot = get().moodsState.moods.moodHistory[today] ?? [];
      const nextIds = sanitizedMoods.map((m) => m.moodId);

      set((prev) => ({
        moodsState: {
          ...prev.moodsState,
          loadingMoods: "add",
          moods: {
            ...prev.moodsState.moods,
            moodHistory: {
              ...prev.moodsState.moods.moodHistory,
              [today]: nextIds,
            },
          },
        },
      }));

      try {
        const res = await createMoods({
          ...props,
          moods: sanitizedMoods,
        });

        if (!res?.success) {
          set((prev) => ({
            moodsState: {
              ...prev.moodsState,
              loadingMoods: null,
              moods: {
                ...prev.moodsState.moods,
                moodHistory: {
                  ...prev.moodsState.moods.moodHistory,
                  [today]: snapshot,
                },
              },
            },
          }));
          return {
            success: false,
            error: res?.error ?? "No se pudieron registrar las emociones.",
          };
        }

        set((prev) => ({
          moodsState: {
            ...prev.moodsState,
            loadingMoods: null,
          },
        }));

        return {
          success: true,
          data: null,
          message: res.message ?? "Emociones registradas correctamente.",
        };
      } catch {
        set((prev) => ({
          moodsState: {
            ...prev.moodsState,
            loadingMoods: null,
            moods: {
              ...prev.moodsState.moods,
              moodHistory: {
                ...prev.moodsState.moods.moodHistory,
                [today]: snapshot,
              },
            },
          },
        }));
        return {
          success: false,
          error: "Error de red/servidor al registrar las emociones.",
        };
      }
    },

    getMoodsForDate: (date: string) =>
      get().moodsState.moods.moodHistory[date] ?? [],

    loadAnalytics: async ({ userId, month, range }) => {
      if (!userId) {
        return {
          success: false,
          error: "No se puede cargar el análisis sin usuario.",
        };
      }

      set((prev) => ({
        moodsState: {
          ...prev.moodsState,
          analyticsLoading: true,
        },
      }));

      const response = await getMoodAnalytics(userId, { month, range });

      if (!response.success) {
        set((prev) => ({
          moodsState: {
            ...prev.moodsState,
            analyticsLoading: false,
          },
        }));

        return { success: false, error: response.error };
      }

      const timelineHistory: Record<string, string[]> = {};
      response.data?.timeline?.forEach((entry) => {
        timelineHistory[entry.date] = entry.moods.map((m) => m.moodId);
      });

      set((prev) => ({
        moodsState: {
          ...prev.moodsState,
          analyticsLoading: false,
          analytics: response.data,
          moods: {
            ...prev.moodsState.moods,
            moodHistory: {
              ...prev.moodsState.moods.moodHistory,
              ...timelineHistory,
            },
          },
        },
      }));

      return {
        success: true,
        data: response.data,
        message: response.message ?? "Análisis generado.",
      };
    },
  },
});

export default createMoodsSlice;
