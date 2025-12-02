import { Button, Container } from "@/components/forms";
import { PRIVATEROUTES } from "@/routes/private.routes";
import useStore from "@/store/useStore";
import Add from "@mui/icons-material/Add";
import FilterList from "@mui/icons-material/FilterList";
import Groups from "@mui/icons-material/Groups";
import Person from "@mui/icons-material/Person";
import Refresh from "@mui/icons-material/Refresh";
import Search from "@mui/icons-material/Search";
import Verified from "@mui/icons-material/Verified";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { USER_NAMES } from "../data";
import { listPatients } from "../services/users";
import { UserRole, UserStatus, type User } from "../services/users.interfaces";

type StatusFilter = "ALL" | UserStatus;

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: "Todos", value: "ALL" },
  { label: "Activos", value: UserStatus.ACTIVE },
  { label: "Inactivos", value: UserStatus.INACTIVE },
  { label: "Suspendidos", value: UserStatus.SUSPENDED },
];

const STATUS_STYLES: Record<
  UserStatus,
  { bg: string; text: string; label: string }
> = {
  [UserStatus.ACTIVE]: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Activo",
    text: "text-emerald-600",
  },
  [UserStatus.INACTIVE]: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Inactivo",
    text: "text-amber-600",
  },
  [UserStatus.SUSPENDED]: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    label: "Suspendido",
    text: "text-rose-600",
  },
};

const UNKNOWN_STATUS_STYLE = {
  bg: "bg-gray-100 text-gray-600 border-gray-200",
  label: "Sin estado",
  text: "text-gray-600",
};

const getStatusChip = (status?: string | null) => {
  if (!status) return UNKNOWN_STATUS_STYLE;
  const normalized = status.toUpperCase() as UserStatus;
  return (
    STATUS_STYLES[normalized] ?? {
      ...UNKNOWN_STATUS_STYLE,
      label: status,
    }
  );
};

const AVATAR_GRADIENTS = [
  "from-rose-500 via-pink-500 to-orange-400",
  "from-indigo-500 via-blue-500 to-cyan-400",
  "from-emerald-500 via-lime-500 to-amber-400",
  "from-purple-500 via-fuchsia-500 to-rose-400",
];

const initialPatientSelection = (patients: User[]): User | null =>
  patients.length > 0 ? patients[0] : null;

const highlightText = (
  rawText: string | null | undefined,
  query: string,
): ReactNode => {
  const text = rawText ?? "";
  if (!query.trim() || text.length === 0) {
    return text || "N/A";
  }
  const regex = new RegExp(`(${query})`, "ig");
  const lowerQuery = query.toLowerCase();
  return text.split(regex).map((segment, idx) =>
    segment.toLowerCase() === lowerQuery ? (
      <mark key={`${segment}-${idx}`} className="rounded bg-yellow-200 px-1">
        {segment}
      </mark>
    ) : (
      <span key={`${segment}-${idx}`}>{segment}</span>
    ),
  );
};

const ListUsers = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dataCountRef = useRef(0);

  const showSnackbar = useStore((state) => state.showSnackbar);
  const currentUser = useStore((state) => state.authState.auth.currentUser);
  const navigate = useNavigate();
  const isStaff = useMemo(
    () => [UserRole.ADMIN, UserRole.STAFF].includes(currentUser?.role ?? UserRole.USER),
    [currentUser?.role],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const fetchPatients = useCallback(async () => {
    if (!isStaff) return;
    const shouldShowSkeleton = dataCountRef.current === 0;
    if (shouldShowSkeleton) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    const response = await listPatients({
      search: normalizedQuery || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      limit: 80,
    });

    if (!response.success) {
      showSnackbar(response.error, "error");
      if (shouldShowSkeleton) {
        setIsLoading(false);
      }
      setIsRefreshing(false);
      return;
    }

    setPatients(response.data);
    dataCountRef.current = response.data.length;
    setSelectedPatient((prev) => {
      if (!prev) return initialPatientSelection(response.data);
      const stillExists = response.data.find((u) => u.id === prev.id);
      return stillExists ?? initialPatientSelection(response.data);
    });

    if (shouldShowSkeleton) {
      setIsLoading(false);
    }
    setIsRefreshing(false);
  }, [isStaff, normalizedQuery, showSnackbar, statusFilter]);

  useEffect(() => {
    if (!isStaff) {
      showSnackbar("Necesitas permisos de STAFF o ADMIN para ver pacientes.", "warning");
      navigate(PRIVATEROUTES.HOMEPAGE, { replace: true });
      return;
    }
    let handler: ReturnType<typeof setTimeout> | undefined;
    if (normalizedQuery.length > 0) {
      handler = setTimeout(() => {
        void fetchPatients();
      }, 250);
    } else {
      void fetchPatients();
    }
    return () => {
      if (handler) clearTimeout(handler);
    };
  }, [fetchPatients, isStaff, navigate, normalizedQuery, showSnackbar]);

  const metrics = useMemo(() => {
    const active = patients.filter((p) => p.status === UserStatus.ACTIVE).length;
    const inactive = patients.filter(
      (p) => p.status === UserStatus.INACTIVE,
    ).length;
    const suspended = patients.filter(
      (p) => p.status === UserStatus.SUSPENDED,
    ).length;

    return [
      {
        label: "Pacientes activos",
        value: active,
        icon: <Verified fontSize="small" />,
        color: "text-emerald-50",
      },
      {
        label: "En seguimiento",
        value: patients.length,
        icon: <Groups fontSize="small" />,
        color: "text-white",
      },
      {
        label: "Casos especiales",
        value: suspended,
        icon: <Person fontSize="small" />,
        color: "text-amber-100",
      },
      {
        label: "Pendientes",
        value: inactive,
        icon: <FilterList fontSize="small" />,
        color: "text-sky-100",
      },
    ];
  }, [patients]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSelectPatient = (patient: User) => {
    setSelectedPatient(patient);
  };

  const handleManualRefresh = () => {
    void fetchPatients();
  };

  const filteredQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "");

  if (!isStaff) {
    return (
      <div className="py-8">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Acceso restringido</p>
          <p className="mt-2 text-sm text-gray-600">
            Solo el personal autorizado puede gestionar el panel de pacientes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Container label="Directorio de pacientes">
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 p-6 text-white shadow-lg">
          <div className="absolute inset-0 opacity-20">
            <div className="hero-glow" />
          </div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/80">
                Overview emocional
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">
                Monitorea el estado emocional de tus pacientes
              </h1>
              <p className="mt-2 text-white/80">
                Busca por nombre o ID único, aplica filtros inteligentes y
                navega entre perfiles enriquecidos con información emocional.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => navigate(PRIVATEROUTES.USERS_CREATE)}
                startIcon={<Add />}
              >
                Crear {USER_NAMES.singular}
              </Button>
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isLoading || isRefreshing}
                className={`inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 ${
                  isLoading || isRefreshing ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <Refresh fontSize="small" />
                {isLoading || isRefreshing ? "Actualizando..." : "Refrescar lista"}
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/20 p-2">
                    <span className={metric.color}>{metric.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-white/80">{metric.label}</p>
                    <p className="text-2xl font-semibold">{metric.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-6 lg:flex-row">
          <section className="flex-1 space-y-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 shadow-inner">
                <Search className="text-gray-500" />
                <input
                  value={query}
                  onChange={handleSearchChange}
                  placeholder="Buscar por nombre, ID o correo"
                  className="w-full bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
                {(isLoading || isRefreshing) && (
                  <span className="text-xs font-semibold text-indigo-500">
                    {isLoading ? "Cargando..." : "Actualizando..."}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => {
                  const isActive = filter.value === statusFilter;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setStatusFilter(filter.value)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-inner animate-pulse"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-1/2 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div className="h-6 flex-1 rounded bg-gray-200" />
                      <div className="h-6 flex-1 rounded bg-gray-100" />
                    </div>
                  </div>
                ))
              ) : patients.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                  No encontramos pacientes que coincidan con tu búsqueda.
                  Intenta variar el nombre o pegar el identificador completo.
                </div>
              ) : (
                patients.map((patient, idx) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  const statusChip = getStatusChip(patient.status);
                  return (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handleSelectPatient(patient)}
                      className={`group rounded-2xl border border-gray-100 p-4 text-left transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg ${
                        isSelected ? "bg-indigo-50 border-indigo-200" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-14 w-14 flex-shrink-0 rounded-2xl bg-gradient-to-br ${
                            AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                          } p-[2px] shadow-lg`}
                        >
                          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/90 text-xl font-bold text-gray-700">
                            {patient.name?.[0] ?? "U"}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-gray-800">
                            {filteredQuery
                              ? highlightText(patient.name, filteredQuery)
                              : patient.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {filteredQuery
                              ? highlightText(patient.email, filteredQuery)
                              : patient.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
                          ID: {patient.id}
                        </span>
                        {patient.phone && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
                            Tel: {patient.phone}
                          </span>
                        )}
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusChip.bg} ${statusChip.text}`}
                        >
                          {statusChip.label}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <aside className="lg:w-1/3">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-soft">
              {selectedPatient ? (
                <>
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
                    Perfil seleccionado
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {selectedPatient.name}
                  </h2>
                  <p className="text-gray-500">{selectedPatient.email}</p>

                  <div className="mt-4 grid gap-3">
                    <DetailRow label="Identificador" value={`#${selectedPatient.id}`} />
                    <DetailRow
                      label="Número de contacto"
                      value={selectedPatient.phone ?? "No registrado"}
                    />
                    <DetailRow
                      label="Rol asignado"
                      value={selectedPatient.role}
                    />
                    <DetailRow
                      label="Estado"
                      value={getStatusChip(selectedPatient.status).label}
                      accent={getStatusChip(selectedPatient.status).text}
                    />
                  </div>

                  <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
                    <p className="font-semibold">Tip</p>
                    <p>
                      Usa el buscador para pegar un ID completo y saltar
                      directamente a su ficha. El directorio entiende tanto
                      nombres como identificadores únicos.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button.Secondary
                      onClick={() =>
                        navigate(`${PRIVATEROUTES.USERS_EDIT}${selectedPatient.id}`)
                      }
                    >
                      Editar paciente
                    </Button.Secondary>
                    <Button onClick={() => navigate(PRIVATEROUTES.USERS_CREATE)}>
                      Crear nuevo
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  Selecciona un paciente para ver sus detalles.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  accent?: string;
}

const DetailRow = ({ label, value, accent }: DetailRowProps) => (
  <div className="rounded-2xl border border-gray-100 px-4 py-3">
    <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
    <p className={`text-base font-semibold text-gray-800 ${accent ?? ""}`}>
      {value}
    </p>
  </div>
);

export default ListUsers;
