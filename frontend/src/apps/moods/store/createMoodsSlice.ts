import type { SafeResponse } from "@/services/common.interface";
import type { StateCreator } from "zustand";
import { createMoods, type CreateMood } from "../services/mood.service";

interface Moods {
  moodHistory: Record<string, string[]>; // dateKey -> moodIds[]
}

type LoadingKind = "add" | "remove" | null;

interface MoodsState {
  moods: Moods;
  loadingMoods: LoadingKind;
  addMoodsForToday: (props: CreateMood) => Promise<SafeResponse<null>>;
  getMoodsForDate: (date: string) => string[];
}

export interface MoodsSlice {
  moodsState: MoodsState;
}

const todayKey = () => new Date().toLocaleDateString("en-CA");

export const createMoodsSlice: StateCreator<MoodsSlice> = (set, get) => ({
  moodsState: {
    moods: { moodHistory: {} },
    loadingMoods: null,

    addMoodsForToday: async (
      props: CreateMood,
    ): Promise<SafeResponse<null>> => {
      const today = todayKey();
      const state = get().moodsState;
      const current = state.moods.moodHistory[today] ?? [];

      // extrae ids del payload y normaliza
      const incomingIds = Array.from(
        new Set((props.moods ?? []).map((m) => m.moodId).filter(Boolean)),
      );

      if (incomingIds.length === 0) {
        return { success: false, error: "No se enviaron emociones válidas." };
      }

      // filtra los que ya existen
      const newIds = incomingIds.filter((id) => !current.includes(id));
      if (newIds.length === 0) {
        return {
          success: false,
          error: "No hay emociones nuevas por agregar.",
        };
      }

      // tope de 3
      if (current.length >= 3) {
        return {
          success: false,
          error: "Solo puedes escoger hasta 3 emociones por día.",
        };
      }

      // recorta si excede el máximo permitido
      const availableSlots = 3 - current.length;
      const idsToAdd = newIds.slice(0, availableSlots);

      // si algunas quedaron por fuera, lo reportamos pero igual intentamos agregar las posibles
      const willTruncate = newIds.length > idsToAdd.length;

      const snapshot = current;
      const optimisticNext = [...current, ...idsToAdd];

      // optimistic update
      set((prev) => ({
        moodsState: {
          ...prev.moodsState,
          loadingMoods: "add",
          moods: {
            ...prev.moodsState.moods,
            moodHistory: {
              ...prev.moodsState.moods.moodHistory,
              [today]: optimisticNext,
            },
          },
        },
      }));

      try {
        // Llamada real al API (batch)
        const res = await createMoods(props);

        if (!res?.success) {
          // rollback
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

        // éxito
        set((prev) => ({
          moodsState: {
            ...prev.moodsState,
            loadingMoods: null,
          },
        }));

        const baseMessage =
          res.message ?? "Emociones registradas correctamente.";
        const message = willTruncate
          ? `${baseMessage} (Se limitaron a 3 emociones para hoy).`
          : baseMessage;

        return { success: true, data: null, message };
      } catch {
        // rollback on exception
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
  },
});

export default createMoodsSlice;
