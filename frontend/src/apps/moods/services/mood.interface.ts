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

export type MoodTone = "positivo" | "negativo" | "neutral";

export interface MoodTimelineMood {
  moodId: string;
  tone: MoodTone;
  at: string | null;
  note?: string | null;
}

export interface MoodTimelineEntry {
  date: string;
  dayScore: number;
  moods: MoodTimelineMood[];
}

export interface MoodAnalytics {
  period: {
    focusMonth: string;
    months: string[];
    from: string;
    to: string;
  };
  summary: {
    totalEntries: number;
    daysTracked: number;
    uniqueMoods: number;
    currentStreak: number;
    longestStreak: number;
    lastEntryAt: string | null;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    wellbeingScore: number;
    riskScore: number;
  };
  topMoods: Array<{
    moodId: string;
    label: string;
    tone: MoodTone;
    count: number;
    percentage: number;
  }>;
  timeline: MoodTimelineEntry[];
}
