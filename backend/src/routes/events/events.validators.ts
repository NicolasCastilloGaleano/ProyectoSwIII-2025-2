import { z } from "zod";
import type { EventKind } from "./events.interface";

export const eventKindSchema = z.enum(["forum", "discussion", "virtual", "inperson"]) as z.ZodType<EventKind>;

const baseSchema = {
  title: z.string().min(3).max(120),
  description: z.string().max(1000).optional(),
  startsAt: z.number().int().positive(),
  endsAt: z.number().int().positive().optional().nullable(),
  visibility: z.enum(["public", "private"]).optional(),
};

const forumFields = {
  tags: z.array(z.string().trim().min(1)).max(8).optional(),
  pinned: z.boolean().optional(),
  locked: z.boolean().optional(),
};

const discussionFields = {
  ...forumFields,
  status: z.enum(["open", "closed"]).optional(),
  agenda: z.array(z.string().trim().min(1)).max(10).optional(),
  decisions: z.array(z.string().trim().min(1)).max(20).optional(),
  actionItems: z
    .array(
      z.object({
        text: z.string().trim().min(1),
        ownerId: z.string().trim().min(1).optional().nullable(),
        dueDate: z.number().int().positive().optional().nullable(),
        done: z.boolean().optional(),
      }),
    )
    .max(30)
    .optional(),
};

const virtualFields = {
  meetingUrl: z.string().url(),
  platform: z.enum(["zoom", "meet", "teams", "custom"]).optional(),
  hostId: z.string().trim().min(1).optional().nullable(),
  recordingUrl: z.string().url().optional().nullable(),
  maxParticipants: z.number().int().positive().max(10000).optional().nullable(),
  waitingRoom: z.boolean().optional(),
};

const inPersonFields = {
  location: z.string().trim().min(3).max(200),
  room: z.string().trim().max(120).optional().nullable(),
  capacity: z.number().int().positive().max(50000).optional().nullable(),
  rsvpRequired: z.boolean().optional(),
  checkInCode: z.string().trim().max(20).optional().nullable(),
};

export const createEventSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("forum"),
    ...baseSchema,
    ...forumFields,
  }),
  z.object({
    kind: z.literal("discussion"),
    ...baseSchema,
    ...discussionFields,
  }),
  z.object({
    kind: z.literal("virtual"),
    ...baseSchema,
    ...virtualFields,
  }),
  z.object({
    kind: z.literal("inperson"),
    ...baseSchema,
    ...inPersonFields,
  }),
]);

export const updateEventSchema = z.object({
  kind: eventKindSchema.optional(),
  ...Object.fromEntries(
    Object.entries({
      ...baseSchema,
      ...forumFields,
      ...discussionFields,
      ...virtualFields,
      ...inPersonFields,
    }).map(([key, value]) => [key, (value as any).optional?.() ?? value.optional()]),
  ),
});

export type CreateEventDTO = z.infer<typeof createEventSchema>;
export type UpdateEventDTO = z.infer<typeof updateEventSchema>;

