import type { MoodTone } from "@/apps/moods/services/mood.interface";

export const toneStyles: Record<MoodTone, string> = {
  positivo: "bg-emerald-50 text-emerald-600",
  negativo: "bg-rose-50 text-rose-600",
  neutral: "bg-amber-50 text-amber-600",
};

export const scoreColor = (score: number) => {
  if (score >= 0.5) return "bg-emerald-300";
  if (score >= 0.1) return "bg-emerald-200";
  if (score <= -0.5) return "bg-rose-300";
  if (score <= -0.1) return "bg-rose-200";
  return "bg-gray-200";
};
