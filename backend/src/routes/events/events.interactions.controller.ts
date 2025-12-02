import { Request, Response } from "express";
import * as service from "./events.service";

export async function join(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.authUser?.uid ?? req.user?.uid ?? "anonymous";
  const updated = await service.joinEvent(id, userId);
  if (!updated) return res.status(404).json({ error: "Evento no encontrado" });
  return res.json({ data: updated });
}

export async function leave(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.authUser?.uid ?? req.user?.uid ?? "anonymous";
  const updated = await service.leaveEvent(id, userId);
  if (!updated) return res.status(404).json({ error: "Evento no encontrado" });
  return res.json({ data: updated });
}
