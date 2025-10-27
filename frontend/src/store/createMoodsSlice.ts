import type { JSX } from "react";
import type { StateCreator } from "zustand";

export interface Mood {
  id: string;
  label: string;
  valencia: number;
  activacion: number;
  dominancia: number;
  peso_riesgo: number;
  peso_bienestar: number;
  icon: JSX.Element;
}

export interface MoodEntry {
  date: string; // formato YYYY-MM-DD
  moods: string[]; // IDs de moods seleccionados en ese día
}

export interface MoodsState {
  moodHistory: Record<string, string[]>; // { "2025-10-26": ["happy", "tired", "calm"] }
  addMoodForToday: (moodId: string) => void;
  getMoodsForDate: (date: string) => string[];
}

export const createMoodsSlice: StateCreator<MoodsState> = (set, get) => ({
  moodHistory: {},

  addMoodForToday: (moodId) => {
    const today = new Date().toLocaleDateString("en-CA");
    const current = get().moodHistory[today] || [];

    // restricción: máximo 3 moods por día
    if (current.length >= 3) {
      console.warn("No puedes agregar más de 3 moods en un mismo día.");
      return;
    }

    // agregar el nuevo mood y actualizar el estado
    const updated = { ...get().moodHistory, [today]: [...current, moodId] };
    set({ moodHistory: updated });

    // solo para depuración
    console.log("Nuevo estado de moods:", updated);
  },

  getMoodsForDate: (date) => {
    return get().moodHistory[date] || [];
  },
});
