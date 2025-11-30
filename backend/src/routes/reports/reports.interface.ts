import { MoodTone } from "../users/moods/moods.interface";

/**
 * Información de un paciente incluida en reportes y agrupaciones.
 */
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

/**
 * Reporte semanal consolidado.
 */
export interface WeeklyReport {
  reportId: string;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  weekNumber: number;
  year: number;
  generatedAt: string; // ISO timestamp
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
    improving: number; // pacientes mejorando
    stable: number; // pacientes estables
    declining: number; // pacientes empeorando
  };
}

/**
 * Informe consolidado de evolución de un paciente.
 */
export interface PatientEvolutionReport {
  userId: string;
  patientName: string;
  email: string;
  photoURL?: string | null;
  period: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
    months: string[]; // YYYY-MM
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
      month: string; // YYYY-MM
      averageWellbeing: number;
      averageRisk: number;
      averageValence: number;
      entriesCount: number;
    }>;
  };
  topMoods: Array<{
    moodId: string;
    label: string;
    tone: MoodTone;
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
    date: string; // YYYY-MM-DD
    dayScore: number;
    wellbeing: number;
    risk: number;
    moodsCount: number;
  }>;
}

/**
 * Agrupación de pacientes por estado emocional.
 */
export interface PatientGrouping {
  generatedAt: string; // ISO timestamp
  period: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
  };
  groups: {
    best: PatientSummary[]; // Mejores emociones (mayor wellbeing, menor risk)
    average: PatientSummary[]; // Emociones medias
    worst: PatientSummary[]; // Peores emociones (menor wellbeing, mayor risk)
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

/**
 * Filtros para generar reportes.
 */
export interface ReportFilters {
  userId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  months?: number; // número de meses hacia atrás
  includeInactive?: boolean;
}
