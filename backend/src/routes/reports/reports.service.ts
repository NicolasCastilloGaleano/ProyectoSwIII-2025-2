import admin, { db } from "@config/firebase";
import { COLLECTIONS } from "@data/constants";
import { MoodTimelineEntry } from "../users/moods/moods.interface";
import { getMoodAnalytics } from "../users/moods/moods.service";
import { getMoodProfile } from "../users/moods/moods.catalog";
import { User, UserStatus } from "../users/users.interface";
import * as usersService from "../users/users.service";
import {
  PatientEvolutionReport,
  PatientGrouping,
  PatientSummary,
  ReportFilters,
  WeeklyReport,
} from "./reports.interface";

const { Timestamp } = admin.firestore;
const DEFAULT_MONTHS_RANGE = 3;
const MAX_MONTHS_RANGE = 12;

type DateRange = {
  start: Date;
  end: Date;
  focusMonth: string;
  monthsRange: number;
};

type AggregatedMetrics = {
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
  totals: {
    wellbeing: number;
    risk: number;
    valence: number;
  };
};

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = clone.getDate() - day + (day === 0 ? -6 : 1); // lunes como inicio

  const start = new Date(clone);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getWeekNumber(date: Date): number {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseDateOnly(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function monthsBetween(start: Date, end: Date): number {
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  return Math.min(MAX_MONTHS_RANGE, Math.max(1, months));
}

function resolveDateRange(filters: ReportFilters): DateRange {
  const now = new Date();

  const end = parseDateOnly(filters.endDate) ?? new Date(now);
  end.setHours(23, 59, 59, 999);

  let start =
    parseDateOnly(filters.startDate) ??
    (() => {
      const fallback = new Date(end);
      const months = filters.months ?? DEFAULT_MONTHS_RANGE;
      fallback.setMonth(end.getMonth() - Math.max(0, months - 1));
      return fallback;
    })();
  start.setHours(0, 0, 0, 0);

  if (start.getTime() > end.getTime()) {
    const temp = new Date(start);
    start = new Date(end);
    start.setHours(0, 0, 0, 0);
    end.setTime(temp.getTime());
    end.setHours(23, 59, 59, 999);
  }

  const monthsRange = Math.min(
    MAX_MONTHS_RANGE,
    Math.max(1, filters.months ?? monthsBetween(start, end)),
  );

  return { start, end, focusMonth: formatMonth(end), monthsRange };
}

function parseEntryDate(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
}

function filterTimelineByRange(
  timeline: MoodTimelineEntry[],
  range: { start: Date; end: Date },
): MoodTimelineEntry[] {
  const startTs = Date.UTC(
    range.start.getFullYear(),
    range.start.getMonth(),
    range.start.getDate(),
  );
  const endTs = Date.UTC(
    range.end.getFullYear(),
    range.end.getMonth(),
    range.end.getDate(),
    23,
    59,
    59,
    999,
  );

  return timeline.filter((entry) => {
    const ts = parseEntryDate(entry.date);
    return ts >= startTs && ts <= endTs;
  });
}

function summarizeTimeline(timeline: MoodTimelineEntry[]): AggregatedMetrics {
  let totalWellbeing = 0;
  let totalRisk = 0;
  let totalValence = 0;
  let totalEntries = 0;
  let lastEntryAt: string | null = null;

  const sentiments = { positive: 0, neutral: 0, negative: 0 };

  timeline.forEach((day) => {
    day.moods.forEach((mood) => {
      const profile = getMoodProfile(mood.moodId);
      totalWellbeing += profile.wellbeingWeight;
      totalRisk += profile.riskWeight;
      totalValence += profile.valence;
      totalEntries += 1;

      if (mood.at && (!lastEntryAt || mood.at > lastEntryAt)) {
        lastEntryAt = mood.at;
      }

      if (mood.tone === "positivo") sentiments.positive += 1;
      else if (mood.tone === "negativo") sentiments.negative += 1;
      else sentiments.neutral += 1;
    });
  });

  const pct = (value: number) =>
    totalEntries === 0 ? 0 : Number(((value / totalEntries) * 100).toFixed(1));

  return {
    averageWellbeing:
      totalEntries > 0
        ? Number(((totalWellbeing / totalEntries) * 100).toFixed(2))
        : 0,
    averageRisk:
      totalEntries > 0
        ? Number(((totalRisk / totalEntries) * 100).toFixed(2))
        : 0,
    averageValence:
      totalEntries > 0 ? Number((totalValence / totalEntries).toFixed(2)) : 0,
    totalEntries,
    daysTracked: timeline.length,
    lastEntryAt:
      lastEntryAt ??
      (timeline.length > 0
        ? `${timeline[timeline.length - 1].date}T00:00:00.000Z`
        : null),
    sentimentDistribution: {
      positive: pct(sentiments.positive),
      neutral: pct(sentiments.neutral),
      negative: pct(sentiments.negative),
    },
    totals: {
      wellbeing: totalWellbeing,
      risk: totalRisk,
      valence: totalValence,
    },
  };
}

async function generatePatientSummary(
  user: User,
  filters: ReportFilters,
): Promise<PatientSummary | null> {
  const range = resolveDateRange(filters);
  const analytics = await getMoodAnalytics(user.id, {
    month: range.focusMonth,
    range: range.monthsRange,
  });

  const filteredTimeline = filterTimelineByRange(analytics.timeline, {
    start: range.start,
    end: range.end,
  });

  if (filteredTimeline.length === 0) {
    return null;
  }

  const metrics = summarizeTimeline(filteredTimeline);

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    averageWellbeing: metrics.averageWellbeing,
    averageRisk: metrics.averageRisk,
    averageValence: metrics.averageValence,
    totalEntries: metrics.totalEntries,
    daysTracked: metrics.daysTracked,
    lastEntryAt: metrics.lastEntryAt,
    sentimentDistribution: metrics.sentimentDistribution,
  };
}

export async function generateWeeklyReport(
  targetDate?: string,
): Promise<WeeklyReport> {
  const date = targetDate ? new Date(targetDate) : new Date();
  const { start, end } = getWeekBounds(date);
  const weekStartStr = formatDate(start);
  const weekEndStr = formatDate(end);
  const weekNumber = getWeekNumber(start);
  const year = start.getFullYear();

  const patients = await usersService.list({
    status: UserStatus.ACTIVE,
    limit: 1000,
  });

  const patientSummaries = (
    await Promise.all(
      patients.map((patient) =>
        generatePatientSummary(patient, {
          startDate: weekStartStr,
          endDate: weekEndStr,
        }),
      ),
    )
  ).filter((summary): summary is PatientSummary => summary !== null);

  const totals = patientSummaries.reduce(
    (acc, current) => {
      acc.entries += current.totalEntries;
      acc.wellbeing += current.averageWellbeing;
      acc.risk += current.averageRisk;
      acc.valence += current.averageValence;
      return acc;
    },
    { entries: 0, wellbeing: 0, risk: 0, valence: 0 },
  );

  const activePatients = patientSummaries.length;
  const averagesDenominator = activePatients || 1;

  const previousRangeStart = new Date(start);
  previousRangeStart.setDate(start.getDate() - 7);
  const previousRangeEnd = new Date(end);
  previousRangeEnd.setDate(end.getDate() - 7);

  let improving = 0;
  let stable = 0;
  let declining = 0;

  for (const summary of patientSummaries) {
    const patient = patients.find((p) => p.id === summary.userId);
    if (!patient) {
      stable += 1;
      continue;
    }

    const previousSummary = await generatePatientSummary(patient, {
      startDate: formatDate(previousRangeStart),
      endDate: formatDate(previousRangeEnd),
    });

    if (!previousSummary) {
      stable += 1;
      continue;
    }

    const diff = summary.averageWellbeing - previousSummary.averageWellbeing;
    if (diff > 5) improving += 1;
    else if (diff < -5) declining += 1;
    else stable += 1;
  }

  const reportId = `week-${year}-${weekNumber}`;

  const report: WeeklyReport = {
    reportId,
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    weekNumber,
    year,
    generatedAt: new Date().toISOString(),
    summary: {
      totalPatients: patients.length,
      activePatients,
      totalEntries: totals.entries,
      averageWellbeing: Number((totals.wellbeing / averagesDenominator).toFixed(2)),
      averageRisk: Number((totals.risk / averagesDenominator).toFixed(2)),
      averageValence: Number((totals.valence / averagesDenominator).toFixed(2)),
    },
    patients: patientSummaries,
    trends: {
      improving,
      stable,
      declining,
    },
  };

  await db
    .collection(COLLECTIONS.USERS)
    .doc("_reports")
    .collection("weekly")
    .doc(reportId)
    .set({
      ...report,
      generatedAt: Timestamp.now(),
    });

  return report;
}

export async function generatePatientEvolutionReport(
  userId: string,
  filters: ReportFilters = {},
): Promise<PatientEvolutionReport> {
  const user = await usersService.getById(userId);
  const range = resolveDateRange(filters);

  const analytics = await getMoodAnalytics(userId, {
    month: range.focusMonth,
    range: range.monthsRange,
  });

  const filteredTimeline = filterTimelineByRange(analytics.timeline, {
    start: range.start,
    end: range.end,
  });

  const metrics = summarizeTimeline(filteredTimeline);

  const sentimentCounters = { positive: 0, neutral: 0, negative: 0 };
  const moodHistogram = new Map<
    string,
    { count: number; label: string; tone: "positivo" | "negativo" | "neutral" }
  >();

  filteredTimeline.forEach((day) => {
    day.moods.forEach((mood) => {
      const profile = getMoodProfile(mood.moodId);

      if (mood.tone === "positivo") sentimentCounters.positive += 1;
      else if (mood.tone === "negativo") sentimentCounters.negative += 1;
      else sentimentCounters.neutral += 1;

      const current = moodHistogram.get(mood.moodId);
      if (current) {
        current.count += 1;
      } else {
        moodHistogram.set(mood.moodId, {
          count: 1,
          label: profile.label,
          tone: mood.tone,
        });
      }
    });
  });

  const topMoods = Array.from(moodHistogram.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([moodId, info]) => ({
      moodId,
      label: info.label,
      tone: info.tone,
      count: info.count,
      percentage:
        metrics.totalEntries === 0
          ? 0
          : Number(((info.count / metrics.totalEntries) * 100).toFixed(1)),
    }));

  const pct = (value: number) =>
    metrics.totalEntries === 0
      ? 0
      : Number(((value / metrics.totalEntries) * 100).toFixed(1));

  const sentiment = {
    positive: pct(sentimentCounters.positive),
    neutral: pct(sentimentCounters.neutral),
    negative: pct(sentimentCounters.negative),
    wellbeingScore:
      metrics.totalEntries === 0
        ? 0
        : Number(
            ((metrics.totals.wellbeing / metrics.totalEntries) * 100).toFixed(1),
          ),
    riskScore:
      metrics.totalEntries === 0
        ? 0
        : Number(((metrics.totals.risk / metrics.totalEntries) * 100).toFixed(1)),
  };

  const weeklyEvolution: PatientEvolutionReport["evolution"]["weekly"] = [];
  const weeklyCursor = new Date(range.start);
  weeklyCursor.setHours(0, 0, 0, 0);

  while (weeklyCursor <= range.end) {
    const { start: weekStart, end: weekEnd } = getWeekBounds(weeklyCursor);
    const boundedEnd = weekEnd > range.end ? range.end : weekEnd;
    const entries = filteredTimeline.filter((entry) => {
      const ts = parseEntryDate(entry.date);
      const startTs = Date.UTC(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate(),
      );
      const endTs = Date.UTC(
        boundedEnd.getFullYear(),
        boundedEnd.getMonth(),
        boundedEnd.getDate(),
        23,
        59,
        59,
        999,
      );
      return ts >= startTs && ts <= endTs;
    });

    const weekMetrics = summarizeTimeline(entries);
    weeklyEvolution.push({
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(boundedEnd),
      averageWellbeing: weekMetrics.averageWellbeing,
      averageRisk: weekMetrics.averageRisk,
      averageValence: weekMetrics.averageValence,
      entriesCount: weekMetrics.totalEntries,
    });

    weeklyCursor.setDate(weeklyCursor.getDate() + 7);
  }

  const monthlyEvolution: PatientEvolutionReport["evolution"]["monthly"] = [];
  const monthCursor = new Date(range.start);
  monthCursor.setDate(1);

  while (monthCursor <= range.end) {
    const monthLabel = formatMonth(monthCursor);
    const entries = filteredTimeline.filter((entry) =>
      entry.date.startsWith(monthLabel),
    );
    const monthMetrics = summarizeTimeline(entries);

    monthlyEvolution.push({
      month: monthLabel,
      averageWellbeing: monthMetrics.averageWellbeing,
      averageRisk: monthMetrics.averageRisk,
      averageValence: monthMetrics.averageValence,
      entriesCount: monthMetrics.totalEntries,
    });

    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }

  const timeline = filteredTimeline.map((day) => {
    let wellbeing = 0;
    let risk = 0;
    let moodsCount = 0;

    day.moods.forEach((mood) => {
      const profile = getMoodProfile(mood.moodId);
      wellbeing += profile.wellbeingWeight;
      risk += profile.riskWeight;
      moodsCount += 1;
    });

    return {
      date: day.date,
      dayScore: day.dayScore,
      wellbeing:
        moodsCount > 0 ? Number(((wellbeing / moodsCount) * 100).toFixed(2)) : 0,
      risk: moodsCount > 0 ? Number(((risk / moodsCount) * 100).toFixed(2)) : 0,
      moodsCount,
    };
  });

  const report: PatientEvolutionReport = {
    userId: user.id,
    patientName: user.name,
    email: user.email,
    photoURL: user.photoURL,
    period: {
      from: formatDate(range.start),
      to: formatDate(range.end),
      months: analytics.period.months,
    },
    summary: {
      totalEntries: metrics.totalEntries,
      daysTracked: metrics.daysTracked,
      currentStreak: analytics.summary.currentStreak,
      longestStreak: analytics.summary.longestStreak,
      averageWellbeing: metrics.averageWellbeing,
      averageRisk: metrics.averageRisk,
      averageValence: metrics.averageValence,
    },
    evolution: {
      weekly: weeklyEvolution,
      monthly: monthlyEvolution,
    },
    topMoods,
    sentiment,
    timeline,
  };

  return report;
}

export async function groupPatientsByEmotionalState(
  filters: ReportFilters = {},
): Promise<PatientGrouping> {
  const range = resolveDateRange(filters);
  const patients = await usersService.list({
    status: filters.includeInactive ? undefined : UserStatus.ACTIVE,
    limit: 1000,
  });

  const patientSummaries = (
    await Promise.all(
      patients.map((patient) => generatePatientSummary(patient, filters)),
    )
  ).filter((summary): summary is PatientSummary => summary !== null);

  if (patientSummaries.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      period: {
        from: formatDate(range.start),
        to: formatDate(range.end),
      },
      groups: {
        best: [],
        average: [],
        worst: [],
      },
      thresholds: {
        best: { minWellbeing: 70, maxRisk: 30 },
        worst: { maxWellbeing: 40, minRisk: 60 },
      },
      statistics: {
        totalPatients: patients.length,
        bestCount: 0,
        averageCount: 0,
        worstCount: 0,
      },
    };
  }

  const wellbeingValues = patientSummaries
    .map((p) => p.averageWellbeing)
    .sort((a, b) => a - b);
  const riskValues = patientSummaries
    .map((p) => p.averageRisk)
    .sort((a, b) => a - b);

  const p75Wellbeing =
    wellbeingValues[Math.floor(wellbeingValues.length * 0.75)] ?? 70;
  const p25Wellbeing =
    wellbeingValues[Math.floor(wellbeingValues.length * 0.25)] ?? 40;
  const p75Risk = riskValues[Math.floor(riskValues.length * 0.75)] ?? 60;
  const p25Risk = riskValues[Math.floor(riskValues.length * 0.25)] ?? 30;

  const minWellbeingBest = p75Wellbeing;
  const maxRiskBest = p25Risk;
  const maxWellbeingWorst = p25Wellbeing;
  const minRiskWorst = p75Risk;

  const best: PatientSummary[] = [];
  const average: PatientSummary[] = [];
  const worst: PatientSummary[] = [];

  patientSummaries.forEach((patient) => {
    const isBest =
      patient.averageWellbeing >= minWellbeingBest &&
      patient.averageRisk <= maxRiskBest;
    const isWorst =
      patient.averageWellbeing <= maxWellbeingWorst &&
      patient.averageRisk >= minRiskWorst;

    if (isBest) {
      best.push(patient);
    } else if (isWorst) {
      worst.push(patient);
    } else {
      average.push(patient);
    }
  });

  best.sort(
    (a, b) =>
      b.averageWellbeing - a.averageWellbeing || a.averageRisk - b.averageRisk,
  );
  average.sort(
    (a, b) =>
      b.averageWellbeing - a.averageWellbeing || a.averageRisk - b.averageRisk,
  );
  worst.sort(
    (a, b) =>
      a.averageWellbeing - b.averageWellbeing || b.averageRisk - a.averageRisk,
  );

  return {
    generatedAt: new Date().toISOString(),
    period: {
      from: formatDate(range.start),
      to: formatDate(range.end),
    },
    groups: {
      best,
      average,
      worst,
    },
    thresholds: {
      best: {
        minWellbeing: Number(minWellbeingBest.toFixed(2)),
        maxRisk: Number(maxRiskBest.toFixed(2)),
      },
      worst: {
        maxWellbeing: Number(maxWellbeingWorst.toFixed(2)),
        minRisk: Number(minRiskWorst.toFixed(2)),
      },
    },
    statistics: {
      totalPatients: patients.length,
      bestCount: best.length,
      averageCount: average.length,
      worstCount: worst.length,
    },
  };
}

export async function getWeeklyReport(
  reportId: string,
): Promise<WeeklyReport | null> {
  const doc = await db
    .collection(COLLECTIONS.USERS)
    .doc("_reports")
    .collection("weekly")
    .doc(reportId)
    .get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  if (!data) return null;

  return {
    ...data,
    generatedAt:
      data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
  } as WeeklyReport;
}

export async function listWeeklyReports(
  limit: number = 50,
): Promise<WeeklyReport[]> {
  const snapshot = await db
    .collection(COLLECTIONS.USERS)
    .doc("_reports")
    .collection("weekly")
    .orderBy("generatedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      generatedAt:
        data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
    } as WeeklyReport;
  });
}
