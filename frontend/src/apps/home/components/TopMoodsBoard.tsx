import type { MoodAnalytics } from "@/apps/moods/services/mood.interface";
import { toneStyles } from "../data";

interface TopProps {
  analytics: MoodAnalytics | null | undefined;
  loading: boolean;
}

const TopMoodsBoard = ({ analytics, loading }: TopProps) => (
  <div className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5">
    <p className="text-sm font-semibold text-gray-500">Top emociones</p>
    <h2 className="text-xl font-bold text-gray-900">
      Frecuencias más repetidas
    </h2>
    <div className="mt-4 space-y-4">
      {loading
        ? Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`top-skeleton-${idx}`}
              className="h-16 animate-pulse rounded-2xl bg-gray-100"
            />
          ))
        : (analytics?.topMoods ?? []).slice(0, 4).map((mood) => (
            <div
              key={mood.moodId}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-gray-800">{mood.label}</p>
                <p className="text-sm text-gray-500">
                  {mood.count} apariciones
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${toneStyles[mood.tone]}`}
              >
                {mood.percentage}% del total
              </span>
            </div>
          ))}
      {!loading && (analytics?.topMoods?.length ?? 0) === 0 && (
        <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
          Aún no hay suficientes datos para calcular los favoritos.
        </p>
      )}
    </div>
  </div>
);

export default TopMoodsBoard;
