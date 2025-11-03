export type MoodRouteLocals = {
  moodParams?: {
    uid: string; // req.params.id
    yyyymm?: string; // "2025-11"
    year?: number; // 2025
    month?: number; // 11
    day?: string; // "01".."31"
  };
};
