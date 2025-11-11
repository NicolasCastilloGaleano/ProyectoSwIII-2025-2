import type { MoodTimelineEntry } from "@/apps/moods/services/mood.interface";
import { scoreColor } from "../data";

interface HeatmapProps {
  data: MoodTimelineEntry[];
  loading: boolean;
}

const MoodHeatmapBoard = ({ data, loading }: HeatmapProps) => (
  <div className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5">
    <p className="text-sm font-semibold text-gray-500">Mapa de energía</p>
    <h2 className="text-xl font-bold text-gray-900">
      Tendencia de los últimos días
    </h2>
    <div className="mt-6 grid grid-cols-6 gap-2">
      {loading
        ? Array.from({ length: 18 }).map((_, idx) => (
            <div
              key={`heatmap-skeleton-${idx}`}
              className="h-10 animate-pulse rounded-xl bg-gray-100"
            />
          ))
        : data.map((entry) => {
            const bg = scoreColor(entry.dayScore);
            const textColor =
              entry.dayScore >= 0.1
                ? "text-emerald-900"
                : entry.dayScore <= -0.1
                  ? "text-rose-900"
                  : "text-gray-700";
            return (
              <div
                key={`heat-${entry.date}`}
                className={`flex h-12 flex-col items-center justify-center rounded-xl text-xs font-semibold ${bg} ${textColor}`}
              >
                <span>{new Date(entry.date).getDate()}</span>
              </div>
            );
          })}
    </div>
  </div>
);

export default MoodHeatmapBoard;
