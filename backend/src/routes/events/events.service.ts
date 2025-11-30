import { db } from "@config/firebase";
import { COLLECTIONS } from "@data/constants";
import type {
  CreateEventInput,
  EventBase,
  ListEventsFilters,
  UpdateEventInput,
} from "./events.interface";

const collection = () => db.collection(COLLECTIONS.EVENTS);

export async function createEvent(payload: CreateEventInput): Promise<EventBase> {
  const now = Date.now();
  const ref = collection().doc();
  const data: EventBase = {
    id: ref.id,
    createdAt: now,
    updatedAt: now,
    visibility: "private",
    participants: [],
    ...payload,
  };
  await ref.set(data);
  return data;
}

export async function getEventById(id: string): Promise<EventBase | null> {
  const snap = await collection().doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as EventBase;
}

export async function updateEvent(
  id: string,
  patch: UpdateEventInput,
): Promise<EventBase | null> {
  const ref = collection().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const updated: Partial<EventBase> = { ...patch, updatedAt: Date.now() };
  await ref.update(updated);
  const newSnap = await ref.get();
  return newSnap.data() as EventBase;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const ref = collection().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.delete();
  return true;
}

export async function listEvents(
  filters: ListEventsFilters = {},
): Promise<EventBase[]> {
  let query: FirebaseFirestore.Query = collection();
  if (filters.kind) query = query.where("kind", "==", filters.kind);
  if (filters.from) query = query.where("startsAt", ">=", filters.from);
  if (filters.to) query = query.where("startsAt", "<=", filters.to);
  query = query.orderBy("startsAt", "desc").limit(100);
  const snap = await query.get();
  return snap.docs.map((d) => d.data() as EventBase);
}

export async function joinEvent(eventId: string, userId: string): Promise<EventBase | null> {
  const ref = collection().doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as EventBase;
  const set = new Set(data.participants || []);
  set.add(userId);
  await ref.update({ participants: Array.from(set), updatedAt: Date.now() });
  return (await ref.get()).data() as EventBase;
}

export async function leaveEvent(eventId: string, userId: string): Promise<EventBase | null> {
  const ref = collection().doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as EventBase;
  const next = (data.participants || []).filter((x) => x !== userId);
  await ref.update({ participants: next, updatedAt: Date.now() });
  return (await ref.get()).data() as EventBase;
}
