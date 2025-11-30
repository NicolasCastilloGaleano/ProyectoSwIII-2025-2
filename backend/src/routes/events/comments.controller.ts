import { Request, Response } from "express";
import { createCommentSchema } from "./comments.validators";
import * as svc from "./comments.service";
import * as eventsSvc from "./events.service";

export async function list(req: Request, res: Response) {
  const { id } = req.params; // event id
  const comments = await svc.listComments(id);
  return res.json({ data: comments });
}

export async function create(req: Request, res: Response) {
  const { id } = req.params; // event id
  const userId = req.user?.uid ?? "anonymous";
  const { text } = createCommentSchema.parse(req.body);

  const event = await eventsSvc.getEventById(id);
  if (!event) return res.status(404).json({ error: "Evento no encontrado" });
  if (event.kind !== "forum" && event.kind !== "discussion") {
    return res.status(400).json({ error: "Los comentarios solo aplican a foros y discusiones" });
  }

  const comment = await svc.addComment(id, userId, text, req.user?.name || req.user?.email);
  return res.status(201).json({ data: comment });
}

export async function remove(req: Request, res: Response) {
  const { id, commentId } = req.params;
  const userId = req.user?.uid ?? "anonymous";
  const ok = await svc.deleteComment(id, commentId, userId);
  if (!ok) return res.status(403).json({ error: "No autorizado o no encontrado" });
  return res.json({ ok: true });
}

