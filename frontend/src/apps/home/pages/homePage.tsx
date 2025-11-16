import { CreateMoodModal } from "@/apps/moods/components";
import { moods } from "@/apps/moods/data/moods";
import type {
  MoodAnalytics,
  MoodTimelineEntry,
  MoodTone,
} from "@/apps/moods/services/mood.interface";
import { PRIVATEROUTES } from "@/routes/private.routes";
import useStore from "@/store/useStore";
import Bolt from "@mui/icons-material/Bolt";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import CalendarToday from "@mui/icons-material/CalendarToday";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import Group from "@mui/icons-material/Group";
import Insights from "@mui/icons-material/Insights";
import Mood from "@mui/icons-material/Mood";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Avatar } from "@mui/material";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const toneStyles: Record<MoodTone, string> = {
  positivo: "bg-emerald-50 text-emerald-600",
  negativo: "bg-rose-50 text-rose-600",
  neutral: "bg-amber-50 text-amber-600",
};

const scoreColor = (score: number) => {
  if (score >= 0.5) return "bg-emerald-300";
  if (score >= 0.1) return "bg-emerald-200";
  if (score <= -0.5) return "bg-rose-300";
  if (score <= -0.1) return "bg-rose-200";
  return "bg-gray-200";
};

const formatDateLabel = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const padMonth = (month: number) => String(month).padStart(2, "0");

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const today = new Date();
  const focusMonth = `${today.getFullYear()}-${padMonth(today.getMonth() + 1)}`;

  const { auth } = useStore((state) => state.authState);
  const { analytics, analyticsLoading, loadAnalytics } = useStore(
    (state) => state.moodsState,
  );

  useEffect(() => {
    if (!auth.currentUser?.id) return;
    void loadAnalytics({
      userId: auth.currentUser.id,
      month: focusMonth,
      range: 3,
    });
  }, [auth.currentUser?.id, focusMonth, loadAnalytics]);

  const moodDictionary = useMemo(
    () => new Map(moods.map((item) => [item.moodId, item])),
    [],
  );

  const heroAccent = auth.currentUser?.accentColor ?? "#6366F1";
  const heroAvatar = auth.currentUser?.photoURL ?? null;
  const heroDisplayName =
    auth.currentUser?.name ?? auth.currentUser?.email ?? "Bienvenido";

  const timeline = useMemo<MoodTimelineEntry[]>(() => {
    if (!analytics?.timeline) return [];
    return analytics.timeline.slice(-9).reverse();
  }, [analytics]);

  const heatmapData = useMemo<MoodTimelineEntry[]>(() => {
    if (!analytics?.timeline) return [];
    return analytics.timeline.slice(-24);
  }, [analytics]);

  const timelineMap = useMemo(() => {
    const map = new Map<string, MoodTimelineEntry>();
    analytics?.timeline.forEach((entry) => map.set(entry.date, entry));
    return map;
  }, [analytics]);

  const sentiment = analytics?.sentiment ?? {
    positive: 0,
    neutral: 0,
    negative: 0,
    wellbeingScore: 0,
    riskScore: 0,
  };

  const availableMonths = analytics?.period.months ?? [focusMonth];
  const [selectedMonth, setSelectedMonth] = useState(focusMonth);

  useEffect(() => {
    if (!availableMonths.includes(selectedMonth)) {
      setSelectedMonth(focusMonth);
    }
  }, [availableMonths, focusMonth, selectedMonth]);

  const handleMonthChange = (direction: "prev" | "next") => {
    if (!availableMonths.length) return;
    const index = availableMonths.indexOf(selectedMonth);
    if (index === -1) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
      return;
    }
    if (direction === "prev" && index > 0) {
      setSelectedMonth(availableMonths[index - 1]);
    }
    if (direction === "next" && index < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[index + 1]);
    }
  };

  return (
    <div className="space-y-8 px-2 py-6 md:px-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <HeroTodayCard
          onCreateMood={() => setIsModalOpen(true)}
          analytics={analytics}
          loading={analyticsLoading}
          accentColor={heroAccent}
          avatar={heroAvatar}
          displayName={heroDisplayName}
        />
        <AnalyticsSummaryCard
          analytics={analytics}
          loading={analyticsLoading}
        />
      </section>

      <QuickActionsRow
        onPatients={() => navigate(PRIVATEROUTES.USERS_LIST)}
        onInsights={() => navigate(PRIVATEROUTES.ANALYTICS)}
        onEvents={() => navigate(PRIVATEROUTES.EVENTS)}
        onCalendar={() =>
          calendarRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      />

      <section ref={calendarRef} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyMoodCalendar
            month={selectedMonth}
            timelineMap={timelineMap}
            moodDictionary={moodDictionary}
            onPrev={() => handleMonthChange("prev")}
            onNext={() => handleMonthChange("next")}
          />
        </div>
        <MoodDonutCard sentiment={sentiment} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <MoodTimelineBoard
          timeline={timeline}
          moodDictionary={moodDictionary}
          loading={analyticsLoading}
        />
        <MoodHeatmapBoard data={heatmapData} loading={analyticsLoading} />
        <TopMoodsBoard analytics={analytics} loading={analyticsLoading} />
      </section>

      {isModalOpen && (
        <CreateMoodModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface HeroProps {
  analytics: MoodAnalytics | null | undefined;
  loading: boolean;
  onCreateMood: () => void;
  accentColor?: string;
  avatar?: string | null;
  displayName?: string;
}

const HeroTodayCard = ({
  analytics,
  loading,
  onCreateMood,
  accentColor,
  avatar,
  displayName,
}: HeroProps) => {
  const today = new Date();
  const todayLabel = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl lg:col-span-2"
      style={{
        background: `linear-gradient(120deg, ${accentColor ?? "#0ea5e9"}, #1E1B4B)`,
      }}
    >
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm tracking-widest text-white/80 uppercase">
            {todayLabel}
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-bold">
            {displayName
              ? `${displayName}, Â¿cÃ³mo te sientes hoy?`
              : "Â¿CÃ³mo te sientes hoy?"}
          </h1>
          <p className="mt-2 text-white/80">
            Lleva un seguimiento visual y rÃ¡pido de tus estados emocionales.
            Cada registro alimenta el anÃ¡lisis inteligente y actualiza los
            tableros de tus profesionales.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <HighlightPill
              icon={<CalendarMonth fontSize="small" />}
              label="DÃ­as con registro"
              value={analytics?.summary.daysTracked ?? 0}
              loading={loading}
            />
            <HighlightPill
              icon={<EmojiEvents fontSize="small" />}
              label="Racha activa"
              value={analytics?.summary.currentStreak ?? 0}
              loading={loading}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={avatar ?? undefined}
              sx={{
                width: 56,
                height: 56,
                border: "2px solid rgba(255,255,255,0.7)",
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            >
              {displayName?.[0]}
            </Avatar>
            <div>
              <p className="text-sm tracking-widest text-white/60 uppercase">
                Resumen del dÃ­a
              </p>
              <p className="text-lg font-semibold text-white">
                Selecciona hasta 3 emociones
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCreateMood}
            className="w-full rounded-2xl bg-white/90 px-5 py-3 text-lg font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
          >
            Registrar emociones
          </button>
          <p className="text-xs text-white/70">
            Tip: Puedes combinar hasta 3 emociones en un mismo dÃ­a para capturar
            matices.
          </p>
        </div>
      </div>
    </div>
  );
};

interface HighlightProps {
  icon: ReactNode;
  label: string;
  value: number;
  loading: boolean;
}

const HighlightPill = ({ icon, label, value, loading }: HighlightProps) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2">
    {icon}
    <span className="text-white">
      <strong className="font-semibold">
        {loading ? "â€”" : value.toString().padStart(2, "0")}
      </strong>{" "}
      <span className="text-white/70">{label}</span>
    </span>
  </span>
);

interface SummaryProps {
  analytics: MoodAnalytics | null | undefined;
  loading: boolean;
}

const AnalyticsSummaryCard = ({ analytics, loading }: SummaryProps) => {
  const cards = [
    {
      label: "Promedio bienestar",
      value: analytics?.sentiment.wellbeingScore ?? 0,
      suffix: "%",
      icon: <Mood fontSize="small" />,
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      label: "Nivel de riesgo",
      value: analytics?.sentiment.riskScore ?? 0,
      suffix: "%",
      icon: <Bolt fontSize="small" />,
      gradient: "from-rose-500 to-orange-400",
    },
    {
      label: "Total de registros",
      value: analytics?.summary.totalEntries ?? 0,
      icon: <TimelineIcon fontSize="small" />,
      gradient: "from-sky-500 to-indigo-400",
    },
    {
      label: "Mayor racha",
      value: analytics?.summary.longestStreak ?? 0,
      icon: <EmojiEvents fontSize="small" />,
      gradient: "from-violet-500 to-purple-400",
    },
  ];

  return (
    <div className="shadow-soft rounded-3xl border border-gray-100 bg-white p-4">
      <p className="text-sm font-semibold text-gray-500">Resumen emocional</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${card.gradient} text-white`}
            >
              {card.icon}
            </div>
            <p className="mt-2 text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "â€”" : card.value}
              <span className="text-base font-semibold text-gray-400">
                {card.suffix ?? ""}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface QuickActionsProps {
  onPatients: () => void;
  onInsights: () => void;
  onEvents: () => void;
  onCalendar: () => void;
}

const QuickActionsRow = ({
  onPatients,
  onInsights,
  onEvents,
  onCalendar,
}: QuickActionsProps) => {
  const actions = [
    {
      label: "Directorio",
      description: "Explora y filtra tu lista de pacientes.",
      icon: <Group fontSize="large" />,
      onClick: onPatients,
    },
    {
      label: "AnalÃ­tica",
      description: "Profundiza en grÃ¡ficos y tendencias.",
      icon: <Insights fontSize="large" />,
      onClick: onInsights,
    },
    {
      label: "Eventos",
      description: "Foros, discusiones y reuniones.",
      icon: <EmojiEvents fontSize="large" />,
      onClick: onEvents,
    },
    {
      label: "Calendario",
      description: "Visualiza tu mes emocional completo.",
      icon: <CalendarToday fontSize="large" />,
      onClick: onCalendar,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className="shadow-soft flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200"
        >
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
            {action.icon}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {action.label}
            </p>
            <p className="text-sm text-gray-500">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

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

interface MoodDonutCardProps {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    wellbeingScore: number;
    riskScore: number;
  };
}

const MoodDonutCard = ({ sentiment }: MoodDonutCardProps) => {
  const positiveEnd = sentiment.positive;
  const neutralEnd = sentiment.positive + sentiment.neutral;
  const donutBackground = `conic-gradient(#22c55e 0% ${positiveEnd}%, #facc15 ${positiveEnd}% ${neutralEnd}%, #f87171 ${neutralEnd}% 100%)`;

  return (
    <article className="shadow-soft flex h-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 text-center">
      <p className="text-sm font-semibold text-gray-500">Balance diario</p>
      <div className="mt-4 flex flex-col items-center gap-4">
        <div
          className="relative h-40 w-40 rounded-full"
          style={{ background: donutBackground }}
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-3xl font-bold text-gray-900">
              {sentiment.wellbeingScore.toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500">Bienestar</span>
          </div>
        </div>
        <div className="w-full space-y-2 text-left text-sm">
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700">
            <span>Positivo</span>
            <span className="font-semibold">
              {sentiment.positive.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-3 py-2 text-amber-700">
            <span>Neutro</span>
            <span className="font-semibold">
              {sentiment.neutral.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-3 py-2 text-rose-700">
            <span>Negativo</span>
            <span className="font-semibold">
              {sentiment.negative.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

interface TimelineProps {
  timeline: MoodTimelineEntry[];
  moodDictionary: Map<string, (typeof moods)[number]>;
  loading: boolean;
}

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
          Ãšltimos registros destacados
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

interface HeatmapProps {
  data: MoodTimelineEntry[];
  loading: boolean;
}

const MoodHeatmapBoard = ({ data, loading }: HeatmapProps) => (
  <div className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5">
    <p className="text-sm font-semibold text-gray-500">Mapa de energÃ­a</p>
    <h2 className="text-xl font-bold text-gray-900">
      Tendencia de los Ãºltimos dÃ­as
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

interface TopProps {
  analytics: MoodAnalytics | null | undefined;
  loading: boolean;
}

const TopMoodsBoard = ({ analytics, loading }: TopProps) => (
  <div className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5">
    <p className="text-sm font-semibold text-gray-500">Top emociones</p>
    <h2 className="text-xl font-bold text-gray-900">
      Frecuencias mÃ¡s repetidas
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
          AÃºn no hay suficientes datos para calcular los favoritos.
        </p>
      )}
    </div>
  </div>
);
