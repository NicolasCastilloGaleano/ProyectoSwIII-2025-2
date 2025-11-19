export type EventKind = "forum" | "discussion" | "virtual" | "inperson";

export interface EventBase {
  id: string;
  kind: EventKind;
  title: string;
  description?: string;
  startsAt: number; // epoch ms
  endsAt?: number | null; // epoch ms
  // meeting/location info (one of them may apply depending on kind)
  meetingUrl?: string | null;
  location?: string | null;
  // access control
  visibility?: "public" | "private";
  participants?: string[]; // user ids
  createdBy: string; // uid
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export type CreateEventInput = Omit<EventBase, "id" | "createdAt" | "updatedAt">;
export type UpdateEventInput = Partial<Omit<EventBase, "id" | "createdAt" | "updatedAt" | "createdBy" >>;

export interface ListEventsFilters {
  kind?: EventKind;
  from?: number; // >= startsAt
  to?: number;   // <= startsAt
}

export interface EventComment {
  id: string;
  eventId: string;
  authorId: string;
  authorName?: string;
  text: string;
  createdAt: number;
}

