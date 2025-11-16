import { z } from "zod";
import type { EventKind } from "./events.interface";

export const eventKindSchema = z.enum(["forum", "discussion", "virtual", "inperson"]) as z.ZodType<EventKind>;

export const createEventSchema = z.object({
  kind: eventKindSchema,
  title: z.string().min(3).max(120),
  description: z.string().max(1000).optional(),
  startsAt: z.number().int().positive(),
  endsAt: z.number().int().positive().optional().nullable(),
  meetingUrl: z.string().url().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  visibility: z.enum(["public", "private"]).optional(),
  participants: z.array(z.string()).optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventDTO = z.infer<typeof createEventSchema>;
export type UpdateEventDTO = z.infer<typeof updateEventSchema>;

