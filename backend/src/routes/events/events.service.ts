import { db } from "@config/firebase";
import { COLLECTIONS } from "@data/constants";
import type {
  CreateEventInput,
  Event,
  EventBase,
  EventKind,
  ListEventsFilters,
  UpdateEventInput,
} from "./events.interface";

const collection = () => db.collection(COLLECTIONS.EVENTS);

type ForumCreate = Extract<CreateEventInput, { kind: "forum" }>;
type DiscussionCreate = Extract<CreateEventInput, { kind: "discussion" }>;
type VirtualCreate = Extract<CreateEventInput, { kind: "virtual" }>;
type InPersonCreate = Extract<CreateEventInput, { kind: "inperson" }>;

function withDefaults(payload: CreateEventInput): Event {
  const now = Date.now();
  const base: EventBase = {
    id: "",
    createdAt: now,
    updatedAt: now,
    visibility: payload.visibility ?? "private",
    participants: payload.participants ?? [],
    createdBy: payload.createdBy,
    kind: payload.kind,
    title: payload.title,
    description: payload.description,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt ?? null,
  };

  if (payload.kind === "forum") {
    const forum = payload as ForumCreate;
    return {
      ...base,
      kind: "forum",
      tags: forum.tags ?? [],
      pinned: forum.pinned ?? false,
      locked: forum.locked ?? false,
      likes: 0,
      likedBy: [],
      views: 0,
      lastActivityAt: now,
    };
  }

  if (payload.kind === "discussion") {
    const discussion = payload as DiscussionCreate;
    return {
      ...base,
      kind: "discussion",
      tags: discussion.tags ?? [],
      pinned: discussion.pinned ?? false,
      locked: discussion.locked ?? false,
      likes: 0,
      likedBy: [],
      views: 0,
      lastActivityAt: now,
      status: discussion.status ?? "open",
      agenda: discussion.agenda ?? [],
      decisions: discussion.decisions ?? [],
      actionItems: discussion.actionItems ?? [],
    };
  }

  if (payload.kind === "virtual") {
    const virtual = payload as VirtualCreate;
    return {
      ...base,
      kind: "virtual",
      meetingUrl: virtual.meetingUrl,
      platform: virtual.platform ?? "custom",
      hostId: virtual.hostId ?? virtual.createdBy,
      recordingUrl: virtual.recordingUrl ?? null,
      maxParticipants: virtual.maxParticipants ?? null,
      waitingRoom: virtual.waitingRoom ?? false,
    };
  }

  const inperson = payload as InPersonCreate;
  return {
    ...base,
    kind: "inperson",
    location: inperson.location,
    room: inperson.room ?? null,
    capacity: inperson.capacity ?? null,
    rsvpRequired: inperson.rsvpRequired ?? false,
    checkInCode: inperson.checkInCode ?? null,
    attendees: inperson.attendees ?? [],
  };
}

function sanitizePatch(kind: EventKind, patch: UpdateEventInput): UpdateEventInput {
  const common: UpdateEventInput = {
    title: patch.title,
    description: patch.description,
    startsAt: patch.startsAt,
    endsAt: patch.endsAt,
    visibility: patch.visibility,
  };

  if (kind === "forum") {
    const forumPatch = patch as Extract<UpdateEventInput, { tags?: unknown }>;
    return {
      ...common,
      tags: forumPatch.tags,
      pinned: forumPatch.pinned,
      locked: forumPatch.locked,
    };
  }
  if (kind === "discussion") {
    const discussionPatch = patch as Extract<UpdateEventInput, { status?: unknown }>;
    return {
      ...common,
      tags: discussionPatch.tags,
      pinned: discussionPatch.pinned,
      locked: discussionPatch.locked,
      status: discussionPatch.status,
      agenda: discussionPatch.agenda,
      decisions: discussionPatch.decisions,
      actionItems: discussionPatch.actionItems,
    };
  }
  if (kind === "virtual") {
    const virtualPatch = patch as Extract<UpdateEventInput, { meetingUrl?: unknown }>;
    return {
      ...common,
      meetingUrl: virtualPatch.meetingUrl,
      platform: virtualPatch.platform,
      hostId: virtualPatch.hostId,
      recordingUrl: virtualPatch.recordingUrl,
      maxParticipants: virtualPatch.maxParticipants,
      waitingRoom: virtualPatch.waitingRoom,
    };
  }
  const inPersonPatch = patch as Extract<UpdateEventInput, { location?: unknown }>;
  return {
    ...common,
    location: inPersonPatch.location,
    room: inPersonPatch.room,
    capacity: inPersonPatch.capacity,
    rsvpRequired: inPersonPatch.rsvpRequired,
    checkInCode: inPersonPatch.checkInCode,
    attendees: inPersonPatch.attendees,
  };
}

export async function createEvent(payload: CreateEventInput): Promise<Event> {
  const now = Date.now();
  const ref = collection().doc();
  const data = withDefaults(payload);
  data.id = ref.id;
  data.createdAt = now;
  data.updatedAt = now;
  await ref.set(data);
  return data;
}

export async function getEventById(id: string): Promise<Event | null> {
  const ref = collection().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as Event;
  // Incrementar vistas para foros/discusiones
  if (data.kind === "forum" || data.kind === "discussion") {
    const views = (data.views ?? 0) + 1;
    await ref.set({ views, lastActivityAt: Date.now() }, { merge: true });
    return { ...data, views };
  }
  return data;
}

export async function updateEvent(
  id: string,
  patch: UpdateEventInput,
): Promise<Event | null> {
  const ref = collection().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const current = snap.data() as Event;
  const sanitized = sanitizePatch(current.kind, patch);
  const updated = { ...sanitized, updatedAt: Date.now() };
  await ref.set(updated, { merge: true });
  const newSnap = await ref.get();
  return newSnap.data() as Event;
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
): Promise<Event[]> {
  let query: FirebaseFirestore.Query = collection();
  if (filters.kind) query = query.where("kind", "==", filters.kind);
  if (filters.from) query = query.where("startsAt", ">=", filters.from);
  if (filters.to) query = query.where("startsAt", "<=", filters.to);
  query = query.orderBy("startsAt", "desc").limit(100);
  const snap = await query.get();
  return snap.docs.map((d) => d.data() as Event);
}

export async function joinEvent(eventId: string, userId: string): Promise<Event | null> {
  const ref = collection().doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as Event;
  const set = new Set(data.participants || []);
  set.add(userId);
  const patch: Partial<Event> = { participants: Array.from(set), updatedAt: Date.now() };
  if (data.kind === "inperson") {
    const attendees = new Set(data.attendees || []);
    attendees.add(userId);
    Object.assign(patch, { attendees: Array.from(attendees) });
  }
  await ref.set(patch, { merge: true });
  const updated = await ref.get();
  return updated.data() as Event;
}

export async function leaveEvent(eventId: string, userId: string): Promise<Event | null> {
  const ref = collection().doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as Event;
  const nextParticipants = (data.participants || []).filter((x) => x !== userId);
  const patch: Partial<Event> = { participants: nextParticipants, updatedAt: Date.now() };
  if (data.kind === "inperson") {
    const nextAttendees = (data.attendees || []).filter((x) => x !== userId);
    Object.assign(patch, { attendees: nextAttendees });
  }
  await ref.set(patch, { merge: true });
  const updated = await ref.get();
  return updated.data() as Event;
}

export async function toggleLike(eventId: string, userId: string, like = true): Promise<Event | null> {
  const ref = collection().doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as Event;
  if (data.kind !== "forum" && data.kind !== "discussion") return data;
  const liked = new Set(data.likedBy || []);
  like ? liked.add(userId) : liked.delete(userId);
  const likes = liked.size;
  await ref.set({ likedBy: Array.from(liked), likes, updatedAt: Date.now() }, { merge: true });
  const updated = await ref.get();
  return updated.data() as Event;
}

export async function closeDiscussion(eventId: string): Promise<Event | null> {
  const ref = collection().doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as Event;
  if (data.kind !== "discussion") return data;
  await ref.set({ status: "closed", locked: true, updatedAt: Date.now() }, { merge: true });
  const updated = await ref.get();
  return updated.data() as Event;
}

export async function checkIn(
  eventId: string,
  userId: string,
  code: string | undefined,
): Promise<Event | null> {
  const ref = collection().doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as Event;
  if (data.kind !== "inperson") return data;
  if (data.checkInCode && data.checkInCode !== code) {
    const err: any = new Error("Código de check-in inválido");
    err.status = 403;
    throw err;
  }
  const attendees = new Set(data.attendees || []);
  attendees.add(userId);
  await ref.set(
    {
      attendees: Array.from(attendees),
      participants: Array.from(new Set([...(data.participants || []), userId])),
      updatedAt: Date.now(),
    },
    { merge: true },
  );
  const updated = await ref.get();
  return updated.data() as Event;
}
