import type { moods } from "@/apps/moods/data/moods";
import type { MoodTimelineEntry } from "@/apps/moods/services/mood.interface";
import { scoreColor, toneStyles } from "../data";

interface TimelineProps {
  timeline: MoodTimelineEntry[];
  moodDictionary: Map<string, (typeof moods)[number]>;
  loading: boolean;
}

const formatDateLabel = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const MoodTimelineBoard = ({
  timeline,
  moodDictionary,
  loading,
}: TimelineProps) => (
  <div className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5 lg:col-span-2">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-500">Latido emocional</p>
        <h2 className="text-xl font-bold text-gray-900">
          Últimos registros destacados
        </h2>
      </div>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {loading
        ? Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`timeline-skeleton-${idx}`}
              className="h-32 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
            />
          ))
        : timeline.map((entry) => (
            <article
              key={entry.date}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-indigo-200"
            >
              <p className="text-sm font-semibold text-gray-500">
                {formatDateLabel(entry.date)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.moods.map((mood) => {
                  const moodMeta = moodDictionary.get(mood.moodId);
                  const Icon = moodMeta?.Icon;
                  return (
                    <span
                      key={`${entry.date}-${mood.moodId}`}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${toneStyles[mood.tone]}`}
                    >
                      {Icon && (
                        <Icon
                          className={`${
                            moodMeta?.textColor ?? "text-gray-700"
                          } h-4 w-4`}
                        />
                      )}
                      {moodMeta?.label ?? mood.moodId}
                    </span>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>Intensidad promedio</span>
                <span className="font-semibold text-gray-800">
                  {entry.dayScore.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full ${scoreColor(entry.dayScore)}`}
                  style={{
                    width: `${Math.min(Math.abs(entry.dayScore) * 100, 100)}%`,
                  }}
                />
              </div>
            </article>
          ))}
    </div>
  </div>
);

export default MoodTimelineBoard;
