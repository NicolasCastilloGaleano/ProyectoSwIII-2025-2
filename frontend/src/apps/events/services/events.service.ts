import { axiosAPI } from "@/services/axiosAPI";

export type EventKind = "forum" | "discussion" | "virtual" | "inperson";

export interface BaseEvent {
  id: string;
  kind: EventKind;
  title: string;
  description?: string;
  startsAt: number;
  endsAt?: number | null;
  visibility?: "public" | "private";
  participants?: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface ForumFields {
  tags?: string[];
  pinned?: boolean;
  locked?: boolean;
  views?: number;
  likes?: number;
  likedBy?: string[];
  lastActivityAt?: number | null;
}

export interface ForumEvent extends BaseEvent, ForumFields {
  kind: "forum";
}

export interface DiscussionEvent extends BaseEvent, ForumFields {
  kind: "discussion";
  status?: "open" | "closed";
  agenda?: string[];
  decisions?: string[];
  actionItems?: Array<{
    text: string;
    ownerId?: string | null;
    dueDate?: number | null;
    done?: boolean;
  }>;
}

export interface VirtualEvent extends BaseEvent {
  kind: "virtual";
  meetingUrl: string;
  platform?: "zoom" | "meet" | "teams" | "custom";
  hostId?: string | null;
  recordingUrl?: string | null;
  maxParticipants?: number | null;
  waitingRoom?: boolean;
}

export interface InPersonEvent extends BaseEvent {
  kind: "inperson";
  location: string;
  room?: string | null;
  capacity?: number | null;
  rsvpRequired?: boolean;
  checkInCode?: string | null;
  attendees?: string[];
}

export type EventItem =
  | ForumEvent
  | DiscussionEvent
  | VirtualEvent
  | InPersonEvent;

export async function listEvents(params?: { kind?: EventKind }): Promise<EventItem[]> {
  const res = await axiosAPI.get<{ data: EventItem[] }>("/events", { params });
  return res.data.data;
}

export async function getEvent(id: string): Promise<EventItem> {
  const res = await axiosAPI.get<{ data: EventItem }>(`/events/${id}`);
  return res.data.data;
}

export async function createEvent(payload: Omit<EventItem, "id" | "createdAt" | "updatedAt">): Promise<EventItem> {
  const res = await axiosAPI.post<{ data: EventItem }>("/events", payload);
  return res.data.data;
}

export async function updateEvent(id: string, patch: Partial<EventItem>): Promise<EventItem> {
  const res = await axiosAPI.put<{ data: EventItem }>(`/events/${id}`, patch);
  return res.data.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await axiosAPI.delete<{ ok: true }>(`/events/${id}`);
}

export interface EventComment {
  id: string;
  eventId: string;
  authorId: string;
  authorName?: string;
  text: string;
  createdAt: number;
}

export async function listComments(eventId: string): Promise<EventComment[]> {
  const res = await axiosAPI.get<{ data: EventComment[] }>(`/events/${eventId}/comments`);
  return res.data.data;
}

export async function addComment(eventId: string, text: string): Promise<EventComment> {
  const res = await axiosAPI.post<{ data: EventComment }>(`/events/${eventId}/comments`, { text });
  return res.data.data;
}

export async function removeComment(eventId: string, commentId: string): Promise<void> {
  await axiosAPI.delete<{ ok: true }>(`/events/${eventId}/comments/${commentId}`);
}

export async function joinEventApi(eventId: string): Promise<EventItem> {
  const res = await axiosAPI.post<{ data: EventItem }>(`/events/${eventId}/join`);
  return res.data.data;
}

export async function leaveEventApi(eventId: string): Promise<EventItem> {
  const res = await axiosAPI.post<{ data: EventItem }>(`/events/${eventId}/leave`);
  return res.data.data;
}

export async function likeEvent(eventId: string): Promise<EventItem> {
  const res = await axiosAPI.post<{ data: EventItem }>(`/events/${eventId}/like`);
  return res.data.data;
}

export async function unlikeEvent(eventId: string): Promise<EventItem> {
  const res = await axiosAPI.post<{ data: EventItem }>(`/events/${eventId}/unlike`);
  return res.data.data;
}

export async function closeDiscussion(eventId: string): Promise<EventItem> {
  const res = await axiosAPI.post<{ data: EventItem }>(`/events/${eventId}/close`);
  return res.data.data;
}

export async function checkInEvent(eventId: string, code?: string): Promise<EventItem> {
  const res = await axiosAPI.post<{ data: EventItem }>(`/events/${eventId}/checkin`, { code });
  return res.data.data;
}
