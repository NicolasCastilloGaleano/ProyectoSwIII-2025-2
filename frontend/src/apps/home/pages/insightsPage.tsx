import { Button, Container } from "@/components/forms";
import useStore from "@/store/useStore";
import GroupsIcon from "@mui/icons-material/Groups";
import RefreshIcon from "@mui/icons-material/Refresh";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRIVATEROUTES } from "@/routes/private.routes";

const clampScore = (value: number) => Math.max(-1, Math.min(1, value));

const InsightsPage = () => {
  const { auth } = useStore((state) => state.authState);
  const { analytics, analyticsLoading, loadAnalytics } = useStore(
    (state) => state.moodsState,
  );
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const today = new Date();
  const focusMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (!auth.currentUser?.id) return;
    void loadAnalytics({
      userId: auth.currentUser.id,
      month: focusMonth,
      range: 6,
    });
  }, [auth.currentUser?.id, focusMonth, loadAnalytics]);

  const sentiment = analytics?.sentiment ?? {
    positive: 0,
    neutral: 0,
    negative: 0,
    wellbeingScore: 0,
    riskScore: 0,
  };

  const donutBackground = useMemo(() => {
    const positiveEnd = sentiment.positive;
    const neutralEnd = sentiment.positive + sentiment.neutral;
    return `conic-gradient(#22c55e 0% ${positiveEnd}%, #facc15 ${positiveEnd}% ${neutralEnd}%, #f87171 ${neutralEnd}% 100%)`;
  }, [sentiment.positive, sentiment.neutral]);

  const timelineSlice = useMemo(
    () => analytics?.timeline.slice(-12) ?? [],
    [analytics],
  );

  const sparklinePoints = useMemo(() => {
    if (timelineSlice.length === 0) return "";
    const total = timelineSlice.length - 1 || 1;
    return timelineSlice
      .map((entry, index) => {
        const normalized = (clampScore(entry.dayScore) + 1) / 2; // 0..1
        const x = (index / total) * 100;
        const y = 45 - normalized * 35;
        return `${x},${y}`;
      })
      .join(" ");
  }, [timelineSlice]);

  const handleRefresh = async () => {
    if (!auth.currentUser?.id) return;
    setIsRefreshing(true);
    await loadAnalytics({
      userId: auth.currentUser.id,
      month: focusMonth,
      range: 6,
    });
    setIsRefreshing(false);
  };

  return (
    <Container label="Panel analítico">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">
            Actividad acumulada
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Intelligence emocional
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outlined"
            startIcon={<GroupsIcon />}
            onClick={() => navigate(PRIVATEROUTES.USERS_LIST)}
          >
            Ver pacientes
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            disabled={analyticsLoading || isRefreshing}
            onClick={handleRefresh}
          >
            {isRefreshing ? "Actualizando..." : "Actualizar datos"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px,1fr]">
        <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-gray-500">
            Distribución de emociones
          </p>
          <div className="mt-4 flex flex-col items-center gap-4">
            <div
              className="relative h-48 w-48 rounded-full"
              style={{ background: donutBackground }}
            >
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white text-center">
                <span className="text-2xl font-semibold text-gray-900">
                  {sentiment.wellbeingScore.toFixed(0)}%
                </span>
                <span className="text-xs text-gray-500">Índice bienestar</span>
              </div>
            </div>
            <dl className="grid w-full grid-cols-3 gap-2 text-center text-sm font-semibold">
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700">
                <dt>Positivo</dt>
                <dd className="text-lg">{sentiment.positive.toFixed(1)}%</dd>
              </div>
              <div className="rounded-2xl bg-amber-50 px-3 py-2 text-amber-700">
                <dt>Neutro</dt>
                <dd className="text-lg">{sentiment.neutral.toFixed(1)}%</dd>
              </div>
              <div className="rounded-2xl bg-rose-50 px-3 py-2 text-rose-700">
                <dt>Negativo</dt>
                <dd className="text-lg">{sentiment.negative.toFixed(1)}%</dd>
              </div>
            </dl>
          </div>
        </article>

        <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Pulso emocional
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                Últimas 12 anotaciones
              </h2>
            </div>
            <TimelineIcon className="text-indigo-500" />
          </div>
          <div className="mt-4 h-44 rounded-2xl bg-gradient-to-b from-indigo-50 to-white p-4">
            {sparklinePoints ? (
              <svg viewBox="0 0 100 50" className="h-full w-full">
                <defs>
                  <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#sparkGradient)"
                  points={`${sparklinePoints} 100,50 0,50`}
                />
                <polyline
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  points={sparklinePoints}
                />
              </svg>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Sin datos suficientes todavía.
              </div>
            )}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <StatBadge label="Registros" value={analytics?.summary.totalEntries ?? 0} />
            <StatBadge label="Días activos" value={analytics?.summary.daysTracked ?? 0} />
            <StatBadge label="Racha actual" value={analytics?.summary.currentStreak ?? 0} />
          </div>
        </article>
      </div>

      <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-500">
              Tendencias por jornada
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              Cronología detallada
            </h2>
          </div>
        </header>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="py-3 pr-4">Fecha</th>
                <th className="py-3 pr-4">Intensidad</th>
                <th className="py-3 pr-4">Emociones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {timelineSlice.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-400">
                    Todavía no hay registros para mostrar.
                  </td>
                </tr>
              )}
              {timelineSlice
                .slice()
                .reverse()
                .map((entry) => (
                  <tr key={entry.date}>
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {new Date(entry.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        weekday: "short",
                      })}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          entry.dayScore >= 0.3
                            ? "bg-emerald-50 text-emerald-700"
                            : entry.dayScore <= -0.3
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {entry.dayScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {entry.moods.map((mood) => (
                          <span
                            key={`${entry.date}-${mood.moodId}`}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              mood.tone === "positivo"
                                ? "bg-emerald-50 text-emerald-700"
                                : mood.tone === "negativo"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {mood.moodId}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
};

interface StatBadgeProps {
  label: string;
  value: number;
}

const StatBadge = ({ label, value }: StatBadgeProps) => (
  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center">
    <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default InsightsPage;
