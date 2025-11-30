import { axiosAPI } from "@/services/axiosAPI";
import type { SafeResponse } from "@/services/common.interface";

export interface PatientSummary {
  userId: string;
  name: string;
  email: string;
  photoURL?: string | null;
  averageWellbeing: number;
  averageRisk: number;
  averageValence: number;
  totalEntries: number;
  daysTracked: number;
  lastEntryAt: string | null;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface WeeklyReport {
  reportId: string;
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  year: number;
  generatedAt: string;
  summary: {
    totalPatients: number;
    activePatients: number;
    totalEntries: number;
    averageWellbeing: number;
    averageRisk: number;
    averageValence: number;
  };
  patients: PatientSummary[];
  trends: {
    improving: number;
    stable: number;
    declining: number;
  };
}

export interface PatientEvolutionReport {
  userId: string;
  patientName: string;
  email: string;
  photoURL?: string | null;
  period: {
    from: string;
    to: string;
    months: string[];
  };
  summary: {
    totalEntries: number;
    daysTracked: number;
    currentStreak: number;
    longestStreak: number;
    averageWellbeing: number;
    averageRisk: number;
    averageValence: number;
  };
  evolution: {
    weekly: Array<{
      weekStart: string;
      weekEnd: string;
      averageWellbeing: number;
      averageRisk: number;
      averageValence: number;
      entriesCount: number;
    }>;
    monthly: Array<{
      month: string;
      averageWellbeing: number;
      averageRisk: number;
      averageValence: number;
      entriesCount: number;
    }>;
  };
  topMoods: Array<{
    moodId: string;
    label: string;
    tone: "positivo" | "negativo" | "neutral";
    count: number;
    percentage: number;
  }>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    wellbeingScore: number;
    riskScore: number;
  };
  timeline: Array<{
    date: string;
    dayScore: number;
    wellbeing: number;
    risk: number;
    moodsCount: number;
  }>;
}

export interface PatientGrouping {
  generatedAt: string;
  period: {
    from: string;
    to: string;
  };
  groups: {
    best: PatientSummary[];
    average: PatientSummary[];
    worst: PatientSummary[];
  };
  thresholds: {
    best: {
      minWellbeing: number;
      maxRisk: number;
    };
    worst: {
      maxWellbeing: number;
      minRisk: number;
    };
  };
  statistics: {
    totalPatients: number;
    bestCount: number;
    averageCount: number;
    worstCount: number;
  };
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  months?: number;
}

type ApiResponse<T> = { success: boolean; data: T; message?: string };

const extractData = <T,>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in (payload as any)) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

const extractError = (error: any, fallback: string) => {
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;
  return message || fallback;
};

const sanitizeFilters = (filters: ReportFilters = {}) => {
  const params: Record<string, string | number> = {};
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.months) params.months = filters.months;
  return params;
};

export const fetchWeeklyReports = async (
  limit: number = 5,
): Promise<SafeResponse<WeeklyReport[]>> => {
  try {
    const res = await axiosAPI.get<ApiResponse<WeeklyReport[]> | WeeklyReport[]>(
      "/reports/weekly",
      { params: { limit } },
    );
    const data = extractData(res.data) ?? [];
    return {
      success: true,
      data,
      message: "Reportes semanales cargados.",
    };
  } catch (error) {
    return {
      success: false,
      error: extractError(error, "No se pudieron cargar los reportes semanales."),
    };
  }
};

export const triggerWeeklyReport = async (
  date?: string,
): Promise<SafeResponse<WeeklyReport>> => {
  try {
    const res = await axiosAPI.get<ApiResponse<WeeklyReport>>(
      "/reports/weekly/generate",
      {
        params: date ? { date } : undefined,
      },
    );
    return {
      success: true,
      data: extractData(res.data),
      message: res.data?.message ?? "Reporte semanal generado.",
    };
  } catch (error) {
    return {
      success: false,
      error: extractError(error, "No se pudo generar el reporte semanal."),
    };
  }
};

export const fetchPatientGrouping = async (
  filters: ReportFilters = {},
): Promise<SafeResponse<PatientGrouping>> => {
  try {
    const res = await axiosAPI.get<ApiResponse<PatientGrouping>>(
      "/reports/patients/grouping",
      {
        params: sanitizeFilters(filters),
      },
    );
    return {
      success: true,
      data: extractData(res.data),
      message: res.data?.message ?? "Agrupación generada.",
    };
  } catch (error) {
    return {
      success: false,
      error: extractError(error, "No se pudo obtener la agrupación de pacientes."),
    };
  }
};

export const fetchPatientEvolution = async (
  userId: string,
  filters: ReportFilters = {},
): Promise<SafeResponse<PatientEvolutionReport>> => {
  if (!userId) {
    return { success: false, error: "Debes seleccionar un paciente válido." };
  }

  try {
    const res = await axiosAPI.get<ApiResponse<PatientEvolutionReport>>(
      `/reports/patients/${userId}/evolution`,
      { params: sanitizeFilters(filters) },
    );
    return {
      success: true,
      data: extractData(res.data),
      message: res.data?.message ?? "Evolución consolidada generada.",
    };
  } catch (error) {
    return {
      success: false,
      error: extractError(
        error,
        "No se pudo obtener el informe consolidado del paciente.",
      ),
    };
  }
};
