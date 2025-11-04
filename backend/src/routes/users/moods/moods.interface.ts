export interface Mood {
  id: string;
  userId: string;
  emotion: string;
  note?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface DayMood {
  emotion: string;
  note?: string;
  createdAt: string;
  id: string; // Unique identifier for each emotion entry
}

export interface DayMoods {
  userId: string;
  date: string; // YYYY-MM-DD
  moods: DayMood[];
}

export interface UpsertDayMoodDto {
  moods: Mood[];
}
export interface Mood {
  moodId: string;
  note?: string;
}

export interface DeleteDayMoodParams {
  userId: string;
  yyyymm: string;
  day: string;
  moodId: string; // Added to identify which emotion to delete
}
