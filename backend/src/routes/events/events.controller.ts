import { Request, Response } from "express";
import type { ListEventsFilters } from "./events.interface";
import { createEventSchema, updateEventSchema } from "./events.validators";
import * as service from "./events.service";

export async function list(req: Request, res: Response) {
  const filters: ListEventsFilters = {};
  const { kind, from, to } = req.query;
  if (typeof kind === "string") filters.kind = kind as any;
  if (typeof from === "string" && from) filters.from = Number(from);
  if (typeof to === "string" && to) filters.to = Number(to);

  const items = await service.listEvents(filters);
  return res.json({ data: items });
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const item = await service.getEventById(id);
  if (!item) return res.status(404).json({ error: "Evento no encontrado" });
  return res.json({ data: item });
}

export async function create(req: Request, res: Response) {
  const parsed = createEventSchema.parse(req.body);
  const userId = req.user?.uid ?? "anonymous";
  const created = await service.createEvent({ ...parsed, createdBy: userId });
  return res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const patch = updateEventSchema.parse(req.body);
  const current = await service.getEventById(id);
  if (!current) return res.status(404).json({ error: "Evento no encontrado" });
  const requester = req.user?.uid;
  if (current.createdBy !== requester) {
    return res.status(403).json({ error: "No autorizado" });
  }
  const updated = await service.updateEvent(id, patch);
  if (!updated) return res.status(404).json({ error: "Evento no encontrado" });
  return res.json({ data: updated });
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const current = await service.getEventById(id);
  if (!current) return res.status(404).json({ error: "Evento no encontrado" });
  const requester = req.user?.uid;
  if (current.createdBy !== requester) {
    return res.status(403).json({ error: "No autorizado" });
  }
  const ok = await service.deleteEvent(id);
  if (!ok) return res.status(404).json({ error: "Evento no encontrado" });
  return res.json({ ok: true });
}

export async function join(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user?.uid ?? "anonymous";
  const updated = await service.joinEvent(id, userId);
  if (!updated) return res.status(404).json({ error: "Evento no encontrado" });
  return res.json({ data: updated });
}

export async function leave(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user?.uid ?? "anonymous";
  const updated = await service.leaveEvent(id, userId);
  if (!updated) return res.status(404).json({ error: "Evento no encontrado" });
  return res.json({ data: updated });
}
