import type { ComponentType } from "react";

export interface MoodResponse {
  monthId: string;
  year: number;
  month: number;
  days: { [key: string]: Day };
  updatedAt: Date;
}

export interface Day {
  moods: Mood[];
}

export interface Mood {
  moodId: string;
  activacion?: number;
  at?: string;
  bgColor?: string;
  dominancia?: number;
  Icon?: ComponentType<{ className?: string }>;
  label?: string;
  note?: string;
  peso_bienestar?: number;
  peso_riesgo?: number;
  textColor?: string;
  valencia?: number;
}
