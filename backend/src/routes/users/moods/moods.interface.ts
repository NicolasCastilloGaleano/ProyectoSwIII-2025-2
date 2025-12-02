export interface MoodSelection {
  moodId: string;
  note?: string;
  /**
   * Momento en el que el paciente registró la emoción (ISO8601).
   * Si no se envía, el backend asignará la hora actual.
   */
  at?: string;
}

export interface UpsertDayMoodDto {
  moods: MoodSelection[];
}

export interface DeleteDayMoodParams {
  userId: string;
  yyyymm: string;
  day: string;
  moodId: string;
}

export type MoodTone = "positivo" | "negativo" | "neutral";

export interface MoodTimelineEntry {
  date: string; // YYYY-MM-DD
  dayScore: number;
  moods: Array<{
    moodId: string;
    tone: MoodTone;
    at: string | null;
    note?: string | null;
  }>;
}

export interface MoodAnalyticsSummary {
  totalEntries: number;
  daysTracked: number;
  uniqueMoods: number;
  currentStreak: number;
  longestStreak: number;
  lastEntryAt: string | null;
}

export interface MoodAnalytics {
  period: {
    focusMonth: string;
    months: string[];
    from: string;
    to: string;
  };
  summary: MoodAnalyticsSummary;
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
