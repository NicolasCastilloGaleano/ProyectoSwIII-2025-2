export type EventKind = "forum" | "discussion" | "virtual" | "inperson";

export interface EventBase {
  id: string;
  kind: EventKind;
  title: string;
  description?: string;
  startsAt: number; // epoch ms
  endsAt?: number | null; // epoch ms
  visibility?: "public" | "private";
  participants?: string[]; // user ids (RSVPs)
  createdBy: string; // uid
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface ForumLikeFields {
  tags?: string[];
  pinned?: boolean;
  locked?: boolean;
  views?: number;
  likes?: number;
  likedBy?: string[];
  lastActivityAt?: number | null;
}

export interface ForumEvent extends EventBase, ForumLikeFields {
  kind: "forum";
}

export interface DiscussionEvent
  extends EventBase,
    ForumLikeFields {
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

export interface VirtualEvent extends EventBase {
  kind: "virtual";
  meetingUrl: string;
  platform?: "zoom" | "meet" | "teams" | "custom";
  hostId?: string | null;
  recordingUrl?: string | null;
  maxParticipants?: number | null;
  waitingRoom?: boolean;
}

export interface InPersonEvent extends EventBase {
  kind: "inperson";
  location: string;
  room?: string | null;
  capacity?: number | null;
  rsvpRequired?: boolean;
  checkInCode?: string | null;
  attendees?: string[];
}

export type Event =
  | ForumEvent
  | DiscussionEvent
  | VirtualEvent
  | InPersonEvent;

export type CreateEventInput =
  | ({ kind: "forum" } & Omit<ForumEvent, "id" | "createdAt" | "updatedAt">)
  | ({ kind: "discussion" } & Omit<DiscussionEvent, "id" | "createdAt" | "updatedAt">)
  | ({ kind: "virtual" } & Omit<VirtualEvent, "id" | "createdAt" | "updatedAt">)
  | ({ kind: "inperson" } & Omit<InPersonEvent, "id" | "createdAt" | "updatedAt">);

export type UpdateEventInput =
  | ({ kind?: "forum" } & Partial<Omit<ForumEvent, "id" | "createdAt" | "updatedAt" | "createdBy">>)
  | ({ kind?: "discussion" } & Partial<Omit<DiscussionEvent, "id" | "createdAt" | "updatedAt" | "createdBy">>)
  | ({ kind?: "virtual" } & Partial<Omit<VirtualEvent, "id" | "createdAt" | "updatedAt" | "createdBy">>)
  | ({ kind?: "inperson" } & Partial<Omit<InPersonEvent, "id" | "createdAt" | "updatedAt" | "createdBy">>);

export interface ListEventsFilters {
  kind?: EventKind;
  from?: number; // >= startsAt
  to?: number; // <= startsAt
}

export interface EventComment {
  id: string;
  eventId: string;
  authorId: string;
  authorName?: string;
  text: string;
  createdAt: number;
}

