import {
  fetchPatientEvolution,
  fetchPatientGrouping,
  fetchWeeklyReports,
  triggerWeeklyReport,
  type PatientEvolutionReport,
  type PatientGrouping,
  type PatientSummary,
  type WeeklyReport,
} from "@/apps/reports/services/reports.service";
import { listPatients } from "@/apps/users/services/users";
import {
  UserStatus,
  type User,
} from "@/apps/users/services/users.interfaces";
import { Button, Container } from "@/components/forms";
import { PRIVATEROUTES } from "@/routes/private.routes";
import useStore from "@/store/useStore";
import GroupsIcon from "@mui/icons-material/Groups";
import InsightsIcon from "@mui/icons-material/Insights";
import RefreshIcon from "@mui/icons-material/Refresh";
import SummarizeIcon from "@mui/icons-material/Summarize";
import TimelineIcon from "@mui/icons-material/Timeline";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAutomaticDiagnosis } from "../hooks/useAutomaticDiagnosis";

const clampScore = (value: number) => Math.max(-1, Math.min(1, value));

const InsightsPage = () => {
  const { auth } = useStore((state) => state.authState);
  const { analytics, analyticsLoading, loadAnalytics } = useStore(
    (state) => state.moodsState,
  );
  const showSnackbar = useStore((state) => state.showSnackbar);

  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const [grouping, setGrouping] = useState<PatientGrouping | null>(null);
  const [groupingLoading, setGroupingLoading] = useState(false);

  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [evolution, setEvolution] = useState<PatientEvolutionReport | null>(
    null,
  );
  const [evolutionLoading, setEvolutionLoading] = useState(false);

  const { generateDiagnosis } = useAutomaticDiagnosis();

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

  const loadWeekly = useCallback(async () => {
    setWeeklyLoading(true);
    const res = await fetchWeeklyReports(5);
    if (res.success) {
      setWeeklyReports(res.data);
    } else {
      showSnackbar(res.error, "error");
    }
    setWeeklyLoading(false);
  }, [showSnackbar]);

  const loadGrouping = useCallback(async () => {
    setGroupingLoading(true);
    const res = await fetchPatientGrouping({ months: 3 });
    if (res.success) {
      setGrouping(res.data);
    } else {
      showSnackbar(res.error, "error");
    }
    setGroupingLoading(false);
  }, [showSnackbar]);

  const loadEvolution = useCallback(
    async (patientId: string) => {
      if (!patientId) return;
      setEvolutionLoading(true);
      const res = await fetchPatientEvolution(patientId, { months: 3 });
      if (res.success) {
        setEvolution(res.data);
      } else {
        showSnackbar(res.error, "error");
      }
      setEvolutionLoading(false);
    },
    [showSnackbar],
  );

  const loadPatientList = useCallback(async () => {
    const res = await listPatients({
      status: UserStatus.ACTIVE,
      limit: 50,
    });

    if (!res.success) {
      showSnackbar(
        res.error ?? "No se pudieron cargar los pacientes.",
        "error",
      );
      return;
    }

    setPatients(res.data);
    const preferred =
      res.data.find((p) => p.id === auth.currentUser?.id) ?? res.data[0];
    if (preferred) {
      setSelectedPatientId(preferred.id);
      void loadEvolution(preferred.id);
    }
  }, [auth.currentUser?.id, loadEvolution, showSnackbar]);

  useEffect(() => {
    void loadWeekly();
    void loadGrouping();
  }, [loadGrouping, loadWeekly]);

  useEffect(() => {
    void loadPatientList();
  }, [loadPatientList]);

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
        const normalized = (clampScore(entry.dayScore) + 1) / 2;
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

  const handleGenerateWeekly = async () => {
    setWeeklyLoading(true);
    const res = await triggerWeeklyReport();
    if (res.success) {
      setWeeklyReports((prev) => {
        const filtered = prev.filter(
          (item) => item.reportId !== res.data.reportId,
        );
        return [res.data, ...filtered];
      });
      showSnackbar(res.message ?? "Reporte semanal generado.", "success");
      void loadGrouping();
    } else {
      showSnackbar(res.error, "error");
    }
    setWeeklyLoading(false);
  };

  const handlePatientChange = async (id: string) => {
    setSelectedPatientId(id);
    await loadEvolution(id);
  };

  const latestWeeklyReport = weeklyReports[0];

  return (
    <Container label="Panel analitico">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">
            Actividad acumulada
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Inteligencia emocional
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
            <StatBadge
              label="Registros"
              value={analytics?.summary.totalEntries ?? 0}
            />
            <StatBadge
              label="Días activos"
              value={analytics?.summary.daysTracked ?? 0}
            />
            <StatBadge
              label="Racha actual"
              value={analytics?.summary.currentStreak ?? 0}
            />
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

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyReportsPanel
            report={latestWeeklyReport}
            history={weeklyReports}
            loading={weeklyLoading}
            onGenerate={handleGenerateWeekly}
            onRefresh={loadWeekly}
          />
        </div>
        <PatientGroupingPanel
          grouping={grouping}
          loading={groupingLoading}
          onRefresh={loadGrouping}
        />
      </section>

      <section className="mt-6">
        <PatientEvolutionPanel
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={handlePatientChange}
          report={evolution}
          loading={evolutionLoading}
          onRefresh={() => loadEvolution(selectedPatientId)}
        />
      </section>

      <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Diagnóstico automático
            </h2>
            <p className="text-sm text-gray-500">
              Análisis basado en tus emociones registradas
            </p>
          </div>
        </header>

        <div className="mt-6 flex flex-col items-center text-center">
          <h3 className={`text-2xl font-semibold ${generateDiagnosis.color}`}>
            {generateDiagnosis.estado}
          </h3>
          <p className="mt-2 max-w-lg text-gray-600">
            {generateDiagnosis.resumen}
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-b from-gray-50 to-white p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-500">
            Evolución reciente
          </h4>
          {sparklinePoints ? (
            <svg viewBox="0 0 100 50" className="h-32 w-full">
              <defs>
                <linearGradient id="diagGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <polygon
                fill="url(#diagGradient)"
                points={`${sparklinePoints} 100,50 0,50`}
              />
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                points={sparklinePoints}
              />
            </svg>
          ) : (
            <div className="flex h-32 items-center justify-center text-gray-400">
              Sin datos suficientes para graficar.
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          *Este diagnostico es orientativo y no sustituye una evaluacion profesional.*
        </p>
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

interface WeeklyReportsPanelProps {
  report?: WeeklyReport;
  history: WeeklyReport[];
  loading: boolean;
  onGenerate: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

const WeeklyReportsPanel = ({
  report,
  history,
  loading,
  onGenerate,
  onRefresh,
}: WeeklyReportsPanelProps) => {
  const topPatients = useMemo(() => {
    if (!report) return [] as PatientSummary[];
    return [...report.patients]
      .sort((a, b) => b.averageWellbeing - a.averageWellbeing)
      .slice(0, 4);
  }, [report]);

  return (
    <article className="h-full rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-500">
            Reportes semanales automáticos
          </p>
          <h3 className="text-xl font-bold text-gray-900">
            {report
              ? `Semana ${report.weekNumber} (${report.weekStart} - ${report.weekEnd})`
              : "Aún sin datos"}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loading}
            onClick={onRefresh}
          >
            Actualizar
          </Button>
          <Button
            startIcon={<SummarizeIcon />}
            disabled={loading}
            onClick={onGenerate}
          >
            Generar ahora
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="mt-4 text-sm text-gray-500">
          Cargando reportes semanales...
        </div>
      ) : !report ? (
        <div className="mt-4 text-sm text-gray-500">
          Aún no hay reportes generados. Usa el botón para crear el primero.
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ReportStat
              label="Pacientes activos"
              value={report.summary.activePatients}
              helper={`Total: ${report.summary.totalPatients}`}
              icon={<GroupsIcon className="text-indigo-500" />}
            />
            <ReportStat
              label="Bienestar promedio"
              value={`${report.summary.averageWellbeing.toFixed(1)}%`}
              helper={`${report.summary.totalEntries} registros`}
              icon={<InsightsIcon className="text-emerald-500" />}
            />
            <ReportStat
              label="Riesgo promedio"
              value={`${report.summary.averageRisk.toFixed(1)}%`}
              helper={`${report.trends.declining} en declive`}
              icon={<TrendingDownIcon className="text-rose-500" />}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-indigo-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                <TrendingUpIcon fontSize="small" />
                Evolución semanal
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium text-gray-800">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                  Mejorando: {report.trends.improving}
                </span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                  Estables: {report.trends.stable}
                </span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                  En riesgo: {report.trends.declining}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-600">
                Mejores notas de la semana
              </p>
              <ul className="mt-3 space-y-2">
                {topPatients.map((patient) => (
                  <li
                    key={patient.userId}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-gray-800">
                      {patient.name || "Paciente"}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {patient.averageWellbeing.toFixed(1)}% bienestar
                    </span>
                  </li>
                ))}
                {topPatients.length === 0 && (
                  <li className="text-sm text-gray-500">
                    Sin datos de pacientes esta semana.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Historial
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
              {history.slice(0, 4).map((item) => (
                <span
                  key={item.reportId}
                  className="rounded-full border border-gray-200 px-3 py-1"
                >
                  {item.weekStart} · {item.summary.activePatients} pacientes
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </article>
  );
};

interface ReportStatProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
}

const ReportStat = ({ label, value, helper, icon }: ReportStatProps) => (
  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">{icon}</div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  </div>
);

interface PatientGroupingPanelProps {
  grouping: PatientGrouping | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const PatientGroupingPanel = ({
  grouping,
  loading,
  onRefresh,
}: PatientGroupingPanelProps) => {
  const renderList = (items: PatientSummary[]) =>
    items.slice(0, 4).map((item) => (
      <li
        key={item.userId}
        className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm shadow-sm"
      >
        <span className="font-medium text-gray-800">{item.name}</span>
        <span className="text-xs text-gray-500">
          {item.averageWellbeing.toFixed(1)}% · {item.averageRisk.toFixed(1)}%
          riesgo
        </span>
      </li>
    ));

  return (
    <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-500">
            Agrupación de pacientes
          </p>
          <h3 className="text-xl font-bold text-gray-900">
            Mejores / promedio / en riesgo
          </h3>
        </div>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          disabled={loading}
          onClick={onRefresh}
        >
          Refrescar
        </Button>
      </header>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Calculando agrupaciones...</p>
      ) : grouping ? (
        <>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-semibold text-emerald-700">
                Mejores emociones
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {grouping.statistics.bestCount} pacientes
              </span>
            </div>
            <ul className="space-y-2">{renderList(grouping.groups.best)}</ul>

            <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
              <span className="text-sm font-semibold text-amber-700">
                Emociones medias
              </span>
              <span className="text-xs font-bold text-amber-700">
                {grouping.statistics.averageCount} pacientes
              </span>
            </div>
            <ul className="space-y-2">{renderList(grouping.groups.average)}</ul>

            <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3">
              <span className="text-sm font-semibold text-rose-700">
                Mayor riesgo emocional
              </span>
              <span className="text-xs font-bold text-rose-700">
                {grouping.statistics.worstCount} pacientes
              </span>
            </div>
            <ul className="space-y-2">{renderList(grouping.groups.worst)}</ul>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Ventanas analizadas: {grouping.period.from} → {grouping.period.to}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          No hay datos suficientes para agrupar pacientes.
        </p>
      )}
    </article>
  );
};

interface PatientEvolutionPanelProps {
  patients: User[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  report: PatientEvolutionReport | null;
  loading: boolean;
  onRefresh: () => Promise<void> | void;
}

const PatientEvolutionPanel = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  report,
  loading,
  onRefresh,
}: PatientEvolutionPanelProps) => {
  const latestWeeks = useMemo(
    () => report?.evolution.weekly.slice(-3) ?? [],
    [report?.evolution.weekly],
  );

  return (
    <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-500">
            Informe consolidado por paciente
          </p>
          <h3 className="text-xl font-bold text-gray-900">
            Evolución emocional individual
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedPatientId}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loading || !selectedPatientId}
            onClick={() => onRefresh()}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Generando informe...</p>
      ) : report ? (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ReportStat
              label="Bienestar promedio"
              value={`${report.summary.averageWellbeing.toFixed(1)}%`}
              helper={`${report.summary.totalEntries} registros`}
              icon={<InsightsIcon className="text-emerald-500" />}
            />
            <ReportStat
              label="Riesgo promedio"
              value={`${report.summary.averageRisk.toFixed(1)}%`}
              helper={`${report.summary.daysTracked} días activos`}
              icon={<TrendingDownIcon className="text-rose-500" />}
            />
            <ReportStat
              label="Racha actual"
              value={report.summary.currentStreak}
              helper={`Mejor racha: ${report.summary.longestStreak}`}
              icon={<TrendingUpIcon className="text-indigo-500" />}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700">
                Últimas semanas
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {latestWeeks.map((week) => (
                  <li
                    key={week.weekStart}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm"
                  >
                    <span className="font-medium text-gray-800">
                      {week.weekStart} → {week.weekEnd}
                    </span>
                    <span className="text-xs text-gray-600">
                      {week.averageWellbeing.toFixed(1)}% bienestar ·{" "}
                      {week.averageRisk.toFixed(1)}% riesgo
                    </span>
                  </li>
                ))}
                {latestWeeks.length === 0 && (
                  <li className="text-sm text-gray-500">
                    No hay semanas suficientes para mostrar.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-700">Top emociones</p>
              <ul className="mt-3 space-y-2 text-sm">
                {report.topMoods.map((mood) => (
                  <li
                    key={mood.moodId}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                  >
                    <span className="font-medium text-gray-800">
                      {mood.label}
                    </span>
                    <span className="text-xs text-gray-600">
                      {mood.percentage.toFixed(1)}% · {mood.count} veces
                    </span>
                  </li>
                ))}
                {report.topMoods.length === 0 && (
                  <li className="text-sm text-gray-500">
                    No hay emociones registradas en el período.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          Selecciona un paciente para generar su informe consolidado.
        </p>
      )}
    </article>
  );
};

export default InsightsPage;



