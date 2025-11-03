import admin, { db } from "@config/firebase"; // <-- ajusta la ruta si es necesario
import { COLLECTIONS } from "@data/constants";
import { DayMoods, UpsertDayMoodDto } from "./moods.interface";

const { FieldValue, Timestamp } = admin.firestore;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type MoodDayEntry = Array<{
  moodId: string;
  note?: string | null;
  at?: FirebaseFirestore.Timestamp;
}>;
type MonthDoc = {
  uid: string;
  year: number; // 2025
  month: number; // 1..12
  days?: Record<string, MoodDayEntry>; // "01".."31"
  createdAt?: FirebaseFirestore.Timestamp | null;
  updatedAt?: FirebaseFirestore.Timestamp | null;
};

function monthRef(uid: string, yyyymm: string) {
  return db.collection("users").doc(uid).collection("moods").doc(yyyymm);
}

/** GET mes completo */
export async function getMonth(uid: string, yyyymm: string) {
  const ref = monthRef(uid, yyyymm);
  const snap = await ref.get();

  if (!snap.exists) {
    // Si no existe el doc, devolvemos estructura vacía coherente
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
      monthId: doc.id, // "YYYY-MM"
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
  day: string, // "01".."31"
  body: UpsertDayMoodDto,
) {
  const [year, month] = yyyymm.split("-").map(Number);
  const ref = monthRef(uid, yyyymm);
  // Use a concrete Timestamp for nested fields (arrays),
  // since FieldValue.serverTimestamp() is not allowed inside arrays.
  const atTs = body.at
    ? Timestamp.fromDate(new Date(body.at))
    : Timestamp.now();

  try {
    return await db.runTransaction(async (tx) => {
      // Primero verificamos que exista el documento del usuario
      const userRef = db.collection("users").doc(uid);
      const userDoc = await tx.get(userRef);

      if (!userDoc.exists) {
        throw new HttpError(404, "Usuario no encontrado");
      }

      const snap = await tx.get(ref);
      const currentData = snap.exists ? (snap.data() as MonthDoc) : null;

      if (!snap.exists) {
        const initDoc: MonthDoc = {
          uid,
          year,
          month,
          days: {
            [day]: [
              {
                moodId: body.moodId.trim(),
                note: body.note ?? null,
                at: atTs,
              },
            ],
          },
          createdAt: FieldValue.serverTimestamp() as any,
          updatedAt: FieldValue.serverTimestamp() as any,
        };

        // Usar merge:true para asegurar que no falle si el documento ya existe
        tx.set(ref, initDoc, { merge: true });

        return {
          monthId: yyyymm,
          day,
          saved: {
            moodId: body.moodId,
            note: body.note ?? null,
            atClient: body.at ?? new Date().toISOString(),
          },
          ok: true,
        };
      }

      // Document exists, check current day's moods (ensure array)
      const currentDay = currentData?.days?.[day] as any;
      const currentMoods = Array.isArray(currentDay?.moods)
        ? (currentDay.moods as Array<{
            moodId: string;
            note?: string | null;
            at?: FirebaseFirestore.Timestamp;
          }>)
        : [];

      // Verify mood limit
      if (currentMoods.length >= 3) {
        throw new HttpError(
          400,
          "Maximum number of emotions (3) reached for this day",
        );
      }

      // Add new mood
      const updatedMoods = [
        ...currentMoods,
        {
          moodId: body.moodId.trim(),
          note: body.note ?? null,
          at: atTs,
        },
      ];

      // Update document
      tx.update(ref, {
        [`days.${day}`]: {
          moods: updatedMoods,
        },
        updatedAt: FieldValue.serverTimestamp(),
        // Ensure base fields are consistent
        uid,
        year,
        month,
      });

      return {
        monthId: yyyymm,
        day,
        saved: {
          moodId: body.moodId,
          note: body.note ?? null,
          atClient: body.at ?? new Date().toISOString(),
        },
        ok: true,
      };
    });
  } catch (error: any) {
    console.error("Error in upsertDay:", error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      500,
      `Error updating mood: ${error.message || "Unknown error"}`,
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

  return {
    monthId: yyyymm,
    day,
    // return the list of moods for the day, converting timestamps to ISO strings
    moods: Array.isArray((entry as any).moods)
      ? (entry as any).moods.map((m: any) => ({
          moodId: m.moodId,
          note: m.note ?? null,
          at: m.at
            ? (m.at as FirebaseFirestore.Timestamp).toDate().toISOString()
            : null,
        }))
      : [],
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

export const deleteDayMood = async (
  userId: string,
  yyyymm: string,
  day: string,
  moodId: string,
): Promise<void> => {
  const date = `${yyyymm}-${day}`;
  const ref = db
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection("moods")
    .doc(date);

  const doc = await ref.get();
  if (!doc.exists) {
    throw new Error("Mood not found");
  }

  const data = doc.data() as DayMoods;
  const moodIndex = data.moods.findIndex((m) => m.id === moodId);

  if (moodIndex === -1) {
    throw new Error("Specific mood not found");
  }

  // Remove the specific mood
  data.moods.splice(moodIndex, 1);

  // If no moods left, delete the document, otherwise update it
  if (data.moods.length === 0) {
    await ref.delete();
  } else {
    await ref.set(data);
  }
};
