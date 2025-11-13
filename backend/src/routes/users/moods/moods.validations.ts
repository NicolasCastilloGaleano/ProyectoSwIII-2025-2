import { RequestHandler, Response } from "express";
import { MoodRouteLocals } from "./moods.types";

const YYMM_RE = /^\d{4}-(0[1-9]|1[0-2])$/; // 2025-11
const DAY_RE = /^(0[1-9]|[12]\d|3[01])$/; // 01..31
const YEAR_RE = /^(19|20)\d{2}$/; // 1900..2099

/** Helper central para responder 400 */
function bad(res: Response, msg: string) {
  return res.status(400).json({ error: msg });
}

/** Garantiza que res.locals exista y retornamos la referencia tipada */
function ensureLocals(res: Response): MoodRouteLocals {
  if (!res.locals) (res as any).locals = {};
  return res.locals as MoodRouteLocals;
}

/** Valida :id (uid de usuario) y lo guarda en res.locals.moodParams.uid */
export const validateUserIdParam: RequestHandler = (req, res, next) => {
  const uid = req.params.id?.trim();
  if (!uid) return bad(res, "Missing :id (user id)");
  if (uid.length > 128) return bad(res, "Invalid :id length");
  const locals = ensureLocals(res);
  locals.moodParams = { ...(locals.moodParams ?? {}), uid };
  next();
};

/** router.param handler para :yyyymm */
export const validateYYYYMMParam: RequestHandler = (req, res, next) => {
  const { yyyymm } = req.params;
  if (!YYMM_RE.test(yyyymm)) {
    return bad(res, "Invalid yyyymm. Use YYYY-MM (e.g., 2025-11)");
  }
  const [y, m] = yyyymm.split("-").map(Number);
  const locals = ensureLocals(res);
  if (!locals.moodParams?.uid) {
    return bad(res, "User ID is required");
  }
  locals.moodParams = {
    ...locals.moodParams,
    yyyymm,
    year: y,
    month: m,
  };
  next();
};

/** router.param handler para :day */
export const validateDayParam: RequestHandler = (req, res, next) => {
  const { day } = req.params;
  if (!DAY_RE.test(day)) return bad(res, "Invalid day. Use 01..31");
  const locals = ensureLocals(res);
  if (!locals.moodParams?.uid) {
    return bad(res, "User ID is required");
  }
  locals.moodParams = { ...locals.moodParams, day };
  next();
};

/** router.param handler para :yyyy */
export const validateYearParam: RequestHandler = (req, res, next) => {
  const { yyyy } = req.params;
  if (!YEAR_RE.test(yyyy)) return bad(res, "Invalid year. Use YYYY");
  const locals = ensureLocals(res);
  if (!locals.moodParams?.uid) return bad(res, "User ID is required");
  locals.moodParams = { ...locals.moodParams, year: Number(yyyy) };
  next();
};

/** Validación del body para upsert de día */
export const validateUpsertDayBody: RequestHandler = (req, res, next) => {
  const moods = req.body?.moods;
  if (!Array.isArray(moods) || moods.length === 0) {
    return bad(res, "Debe enviar al menos una emoción");
  }
  moods.forEach((mood: any) => {
    const { moodId, note, at } = mood;
    if (typeof moodId !== "string" || moodId.trim().length === 0) {
      return bad(res, "moodId (string) is required");
    }
    if (note != null && typeof note !== "string") {
      return bad(res, "note must be a string if provided");
    }
    if (at != null && typeof at !== "string") {
      return bad(res, "at must be an ISO string if provided");
    }
  });

  // si quisieras, valida ISO: !isNaN(Date.parse(at))

  next();
};

/** Middlewares para query ?month=YYYY-MM o ?year=YYYY (ruta GET /) */
export const validateQueryMonthOrYear: RequestHandler = (req, res, next) => {
  const month = (req.query.month as string | undefined)?.trim();
  const year = (req.query.year as string | undefined)?.trim();

  if (!month && !year) {
    return bad(res, "Provide ?month=YYYY-MM or ?year=YYYY");
  }

  const locals = ensureLocals(res);
  const uid = locals.moodParams?.uid ?? "";
  locals.moodParams = locals.moodParams ?? { uid };

  if (month) {
    if (!YYMM_RE.test(month)) return bad(res, "Invalid month. Use YYYY-MM");
    const [y, m] = month.split("-").map(Number);
    locals.moodParams.yyyymm = month;
    locals.moodParams.year = y;
    locals.moodParams.month = m;
  }

  if (year) {
    if (!YEAR_RE.test(year)) return bad(res, "Invalid year. Use YYYY");
    locals.moodParams.year = Number(year);
  }

  next();
};

export const validateAnalyticsQuery: RequestHandler = (req, res, next) => {
  const month = (req.query.month as string | undefined)?.trim();
  const rangeRaw = req.query.range as string | undefined;

  if (month && !YYMM_RE.test(month)) {
    return bad(res, "Invalid month. Use YYYY-MM");
  }

  let range: number | undefined;
  if (rangeRaw !== undefined) {
    const numeric = Number(rangeRaw);
    if (Number.isNaN(numeric) || numeric < 1 || numeric > 12) {
      return bad(res, "range debe estar entre 1 y 12 meses");
    }
    range = numeric;
  }

  const locals = ensureLocals(res);
  if (!locals.moodParams?.uid) return bad(res, "User ID is required");

  locals.moodParams = {
    ...locals.moodParams,
    ...(month && { yyyymm: month }),
    ...(range !== undefined && { range }),
  };

  next();
};
