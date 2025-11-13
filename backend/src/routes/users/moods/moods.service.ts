import admin, { db } from "@config/firebase";
import { getMoodProfile, getMoodTone } from "./moods.catalog";
import { MoodAnalytics, UpsertDayMoodDto } from "./moods.interface";

const { FieldValue, Timestamp } = admin.firestore;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type StoredMood = {
  moodId: string;
  note?: string | null;
  at?: FirebaseFirestore.Timestamp | null;
};

type MoodDayEntry = {
  moods?: StoredMood[];
};

type MonthDoc = {
  uid: string;
  year: number;
  month: number;
  days?: Record<string, MoodDayEntry>;
  createdAt?: FirebaseFirestore.Timestamp | null;
  updatedAt?: FirebaseFirestore.Timestamp | null;
};

const MAX_EMOTIONS_PER_DAY = 3;
const DEFAULT_ANALYTICS_RANGE = 3;
const MAX_ANALYTICS_RANGE = 12;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function monthRef(uid: string, yyyymm: string) {
  return db.collection("users").doc(uid).collection("moods").doc(yyyymm);
}

function toTimestamp(at?: string) {
  if (!at) return Timestamp.now();
  const date = new Date(at);
  return Number.isNaN(date.getTime()) ? Timestamp.now() : Timestamp.fromDate(date);
}

function padDay(day: string | number) {
  return day.toString().padStart(2, "0");
}

function sanitizeMonth(month?: string): string {
  if (month && MONTH_RE.test(month)) return month;
  const now = new Date();
  return `${now.getUTCFullYear()}-${padDay(now.getUTCMonth() + 1)}`;
}

function clampRange(range?: number) {
  if (typeof range !== "number" || Number.isNaN(range)) {
    return DEFAULT_ANALYTICS_RANGE;
  }
  return Math.max(1, Math.min(MAX_ANALYTICS_RANGE, Math.floor(range)));
}

function buildMonthSequence(focus: string, range: number) {
  const [year, month] = focus.split("-").map(Number);
  const months: string[] = [];
  const anchor = new Date(Date.UTC(year, month - 1, 1));
  for (let i = range - 1; i >= 0; i -= 1) {
    const clone = new Date(anchor);
    clone.setUTCMonth(anchor.getUTCMonth() - i);
    months.push(
      `${clone.getUTCFullYear()}-${padDay(clone.getUTCMonth() + 1)}`,
    );
  }
  return months;
}

function toIso(ts?: FirebaseFirestore.Timestamp | null) {
  return ts ? ts.toDate().toISOString() : null;
}

function dateKeyToUTC(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
}

function diffInDays(a: string, b: string) {
  return (dateKeyToUTC(a) - dateKeyToUTC(b)) / 86_400_000;
}

function computeStreaks(dates: string[]) {
  if (dates.length === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...dates].sort();
  let longest = 1;
  let streak = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const delta = diffInDays(sorted[i], sorted[i - 1]);
    if (delta === 1) {
      streak += 1;
      longest = Math.max(longest, streak);
    } else if (delta > 1) {
      streak = 1;
    }
  }

  let current = 1;
  for (let i = sorted.length - 1; i > 0; i -= 1) {
    if (diffInDays(sorted[i], sorted[i - 1]) === 1) {
      current += 1;
    } else {
      break;
    }
  }

  return {
    current: sorted.length ? current : 0,
    longest,
  };
}

/** GET mes completo */
export async function getMonth(uid: string, yyyymm: string) {
  const ref = monthRef(uid, yyyymm);
  const snap = await ref.get();

  if (!snap.exists) {
    const [y, m] = yyyymm.split("-").map(Number);
    return {
      monthId: yyyymm,
      year: y,
      month: m,
      days: {} as Record<string, MoodDayEntry>,
      updatedAt: null as string | null,
    };
  }

  const data = snap.data() as MonthDoc;
  return {
    monthId: yyyymm,
    year: data.year,
    month: data.month,
    days: data.days ?? {},
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
  };
}

/** GET 12 meses (metadatos por año) */
export async function listYear(uid: string, year: number) {
  const col = db.collection("users").doc(uid).collection("moods");
  const qs = await col.where("year", "==", year).orderBy("month", "asc").get();

  const months = qs.docs.map((doc) => {
    const d = doc.data() as MonthDoc;
    return {
      monthId: doc.id,
      year: d.year,
      month: d.month,
      days: d.days ?? {},
      updatedAt: d.updatedAt ? d.updatedAt.toDate().toISOString() : null,
    };
  });

  return { year, months };
}

/** PUT/PATCH de un día dentro del doc mensual */
export async function upsertDay(
  uid: string,
  yyyymm: string,
  day: string,
  body: UpsertDayMoodDto,
) {
  const [year, month] = yyyymm.split("-").map(Number);
  const ref = monthRef(uid, yyyymm);

  const sanitizedMoods: StoredMood[] = Array.isArray(body.moods)
    ? body.moods.map((m) => ({
        moodId: m.moodId,
        note: m.note ?? null,
        at: toTimestamp(m.at),
      }))
    : [];

  if (sanitizedMoods.length === 0) {
    throw new HttpError(400, "Debes registrar al menos una emoción.");
  }

  if (sanitizedMoods.length > MAX_EMOTIONS_PER_DAY) {
    throw new HttpError(
      400,
      `Maximum number of emotions (${MAX_EMOTIONS_PER_DAY}) reached for this day`,
    );
  }

  try {
    return await db.runTransaction(async (tx) => {
      const userRef = db.collection("users").doc(uid);
      const userDoc = await tx.get(userRef);

      if (!userDoc.exists) {
        throw new HttpError(404, "Usuario no encontrado");
      }

      const snap = await tx.get(ref);

      const payload = {
        [`days.${day}`]: {
          moods: sanitizedMoods,
        },
        uid,
        year,
        month,
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (!snap.exists) {
        tx.set(
          ref,
          {
            ...payload,
            createdAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        tx.update(ref, payload);
      }

      return {
        monthId: yyyymm,
        day,
        saved: sanitizedMoods.map((m) => ({
          moodId: m.moodId,
          note: m.note ?? null,
          at: toIso(m.at),
        })),
        ok: true,
      };
    });
  } catch (error: any) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      500,
      `Error updating mood: ${error?.message ?? "Unknown error"}`,
    );
  }
}

/** GET un día puntual */
export async function getDay(uid: string, yyyymm: string, day: string) {
  const ref = monthRef(uid, yyyymm);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpError(404, "Month not found");
  }
  const data = snap.data() as MonthDoc;
  const entry = data.days?.[day];
  if (!entry) {
    throw new HttpError(404, "Day not found");
  }

  const moods = Array.isArray(entry.moods) ? entry.moods : [];
  return {
    monthId: yyyymm,
    day,
    moods: moods.map((m) => ({
      moodId: m.moodId,
      note: m.note ?? null,
      at: toIso(m.at),
    })),
  };
}

/** DELETE un día puntual */
export async function deleteDay(uid: string, yyyymm: string, day: string) {
  const ref = monthRef(uid, yyyymm);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpError(404, "Month not found");

  await ref.update({
    [`days.${day}`]: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { monthId: yyyymm, day, deleted: true };
}

export async function deleteDayMood(
  userId: string,
  yyyymm: string,
  day: string,
  moodId: string,
) {
  const ref = monthRef(userId, yyyymm);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      throw new HttpError(404, "Month not found");
    }

    const data = snap.data() as MonthDoc;
    const entry = data.days?.[day];
    const moodsArr = Array.isArray(entry?.moods) ? entry!.moods : [];

    const idx = moodsArr.findIndex((m) => m.moodId === moodId);
    if (idx === -1) {
      throw new HttpError(404, "Specific mood not found");
    }

    const next = moodsArr.slice();
    next.splice(idx, 1);

    if (next.length === 0) {
      tx.update(ref, {
        [`days.${day}`]: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      tx.update(ref, {
        [`days.${day}`]: { moods: next },
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  });
}

export async function getMoodAnalytics(
  uid: string,
  opts: { month?: string; range?: number } = {},
): Promise<MoodAnalytics> {
  const focusMonth = sanitizeMonth(opts.month);
  const range = clampRange(opts.range);
  const months = buildMonthSequence(focusMonth, range);

  const docs = await Promise.all(
    months.map(async (monthId) => {
      const snap = await monthRef(uid, monthId).get();
      return snap.exists ? (snap.data() as MonthDoc) : null;
    }),
  );

  const timelineAccumulator = new Map<
    string,
    { moods: MoodAnalytics["timeline"][number]["moods"]; score: number }
  >();
  const entries: Array<{
    date: string;
    moodId: string;
    at: string | null;
    note?: string | null;
    tone: "positivo" | "negativo" | "neutral";
    label: string;
    wellbeing: number;
    risk: number;
  }> = [];

  docs.forEach((doc, index) => {
    if (!doc?.days) return;
    const monthId = months[index];
    Object.entries(doc.days).forEach(([dayKey, entry]) => {
      const moods = Array.isArray(entry?.moods) ? entry!.moods : [];
      if (moods.length === 0) return;
      const date = `${monthId}-${padDay(dayKey)}`;
      const bucket =
        timelineAccumulator.get(date) ?? { moods: [], score: 0 };

      moods.forEach((stored) => {
        const profile = getMoodProfile(stored.moodId);
        const tone = getMoodTone(profile.valence);
        const atIso = toIso(stored.at);
        const note =
          stored.note == null ? null : String(stored.note).slice(0, 2000);

        bucket.moods.push({
          moodId: stored.moodId,
          tone,
          at: atIso,
          note,
        });
        bucket.score += profile.valence;

        entries.push({
          date,
          moodId: stored.moodId,
          at: atIso,
          note,
          tone,
          label: profile.label,
          wellbeing: profile.wellbeingWeight,
          risk: profile.riskWeight,
        });
      });

      timelineAccumulator.set(date, bucket);
    });
  });

  const timeline = Array.from(timelineAccumulator.entries())
    .map(([date, payload]) => ({
      date,
      dayScore:
        payload.moods.length === 0
          ? 0
          : Number((payload.score / payload.moods.length).toFixed(2)),
      moods: payload.moods,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalEntries = entries.length;
  const uniqueDates = Array.from(new Set(entries.map((e) => e.date)));
  const uniqueMoods = new Set(entries.map((e) => e.moodId));
  const streaks = computeStreaks(uniqueDates);

  const sentimentCounters = { positive: 0, neutral: 0, negative: 0 };
  let wellbeingScore = 0;
  let riskScore = 0;
  let lastEntryAt: string | null = null;

  const moodHistogram = new Map<
    string,
    { count: number; label: string; tone: "positivo" | "negativo" | "neutral" }
  >();

  entries.forEach((entry) => {
    if (entry.tone === "positivo") sentimentCounters.positive += 1;
    if (entry.tone === "negativo") sentimentCounters.negative += 1;
    if (entry.tone === "neutral") sentimentCounters.neutral += 1;

    wellbeingScore += entry.wellbeing;
    riskScore += entry.risk;

    const current = moodHistogram.get(entry.moodId);
    if (current) {
      current.count += 1;
    } else {
      moodHistogram.set(entry.moodId, {
        count: 1,
        label: entry.label,
        tone: entry.tone,
      });
    }

    if (!lastEntryAt || (entry.at && entry.at > lastEntryAt)) {
      lastEntryAt = entry.at;
    }
  });

  const pct = (value: number) =>
    totalEntries === 0 ? 0 : Number(((value / totalEntries) * 100).toFixed(1));

  const sentiment = {
    positive: pct(sentimentCounters.positive),
    neutral: pct(sentimentCounters.neutral),
    negative: pct(sentimentCounters.negative),
    wellbeingScore:
      totalEntries === 0
        ? 0
        : Number(((wellbeingScore / totalEntries) * 100).toFixed(1)),
    riskScore:
      totalEntries === 0
        ? 0
        : Number(((riskScore / totalEntries) * 100).toFixed(1)),
  };

  const topMoods = Array.from(moodHistogram.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([moodId, info]) => ({
      moodId,
      label: info.label,
      tone: info.tone,
      count: info.count,
      percentage: pct(info.count),
    }));

  const [fromMonth] = months;
  const toMonth = months[months.length - 1];
  const [fromYearNum, fromMonthNum] = fromMonth.split("-").map(Number);
  const [toYearNum, toMonthNum] = toMonth.split("-").map(Number);
  const toLastDay = new Date(toYearNum, toMonthNum, 0).getDate();

  return {
    period: {
      focusMonth,
      months,
      from: `${fromMonth}-01`,
      to: `${toMonth}-${padDay(toLastDay)}`,
    },
    summary: {
      totalEntries,
      daysTracked: uniqueDates.length,
      uniqueMoods: uniqueMoods.size,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      lastEntryAt,
    },
    sentiment,
    topMoods,
    timeline,
  };
}
