import type { moods } from "@/apps/moods/data/moods";
import type { MoodTimelineEntry } from "@/apps/moods/services/mood.interface";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";

interface MonthlyCalendarProps {
  month: string;
  timelineMap: Map<string, MoodTimelineEntry>;
  moodDictionary: Map<string, (typeof moods)[number]>;
  onPrev: () => void;
  onNext: () => void;
}

const MonthlyMoodCalendar = ({
  month,
  timelineMap,
  moodDictionary,
  onPrev,
  onNext,
}: MonthlyCalendarProps) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = new Date(year, (monthNumber ?? 1) - 1, 1);
  const daysInMonth = new Date(year, monthNumber ?? 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // lunes como inicio
  const weeks = [];
  const currentDate = new Date();

  let day = 1 - startOffset;
  while (day <= daysInMonth) {
    const week: Array<{ day?: number; entry?: MoodTimelineEntry }> = [];
    for (let i = 0; i < 7; i += 1) {
      if (day < 1 || day > daysInMonth) {
        week.push({});
      } else {
        const dateKey = `${month}-${String(day).padStart(2, "0")}`;
        week.push({
          day,
          entry: timelineMap.get(dateKey),
        });
      }
      day += 1;
    }
    weeks.push(week);
  }

  const monthLabel = new Date(year, (monthNumber ?? 1) - 1, 1).toLocaleString(
    "es-ES",
    { month: "long", year: "numeric" },
  );

  return (
    <article className="shadow-soft rounded-3xl border border-gray-100 bg-white p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">Calendario</p>
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {monthLabel}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            aria-label="Mes anterior"
          >
            <NavigateBefore fontSize="small" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            aria-label="Mes siguiente"
          >
            <NavigateNext fontSize="small" />
          </button>
        </div>
      </header>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold tracking-widest text-gray-400 uppercase">
        {["L", "M", "X", "J", "V", "S", "D"].map((dayLabel) => (
          <span key={dayLabel}>{dayLabel}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {weeks.map((week, weekIdx) =>
          week.map((cell, dayIdx) => {
            if (!cell.day) {
              return (
                <div
                  key={`empty-${weekIdx}-${dayIdx}`}
                  className="h-20 rounded-2xl border border-dashed border-gray-100 bg-gray-50"
                />
              );
            }

            const isToday =
              cell.day === currentDate.getDate() &&
              (monthNumber ?? 0) === currentDate.getMonth() + 1 &&
              year === currentDate.getFullYear();

            const tone =
              cell.entry?.moods.find((m) => m.tone !== undefined)?.tone ?? null;
            const cellClass =
              tone === "positivo"
                ? "border-emerald-100 bg-emerald-50"
                : tone === "negativo"
                  ? "border-rose-100 bg-rose-50"
                  : tone === "neutral"
                    ? "border-amber-100 bg-amber-50"
                    : "border-gray-100 bg-white";

            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={`flex h-24 flex-col rounded-2xl border p-2 transition ${cellClass}`}
              >
                <div
                  className={`flex items-center justify-between text-sm font-semibold ${
                    isToday ? "text-indigo-600" : "text-gray-600"
                  }`}
                >
                  <span>{cell.day}</span>
                  {isToday && (
                    <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      Hoy
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {cell.entry?.moods.slice(0, 3).map((mood) => {
                    const metadata = moodDictionary.get(mood.moodId);
                    const Icon = metadata?.Icon;
                    return Icon ? (
                      <Icon
                        key={`${cell.day}-${mood.moodId}`}
                        className={`h-5 w-5 ${
                          metadata?.textColor ?? "text-gray-500"
                        }`}
                      />
                    ) : (
                      <span
                        key={`${cell.day}-${mood.moodId}`}
                        className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {mood.moodId}
                      </span>
                    );
                  })}
                  {!cell.entry && (
                    <span className="text-xs text-gray-400">Sin registro</span>
                  )}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </article>
  );
};

export default MonthlyMoodCalendar;
