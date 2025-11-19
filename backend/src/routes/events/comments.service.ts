import { db } from "@config/firebase";
import type { EventComment } from "./events.interface";

const commentsCol = (eventId: string) => db.collection("events").doc(eventId).collection("comments");

export async function addComment(eventId: string, authorId: string, text: string, authorName?: string): Promise<EventComment> {
  const now = Date.now();
  const ref = commentsCol(eventId).doc();
  const payload: EventComment = {
    id: ref.id,
    eventId,
    authorId,
    authorName,
    text,
    createdAt: now,
  };
  await ref.set(payload);
  return payload;
}

export async function listComments(eventId: string): Promise<EventComment[]> {
  const snap = await commentsCol(eventId).orderBy("createdAt", "asc").limit(200).get();
  return snap.docs.map((d) => d.data() as EventComment);
}

export async function deleteComment(eventId: string, commentId: string, requesterId: string): Promise<boolean> {
  const ref = commentsCol(eventId).doc(commentId);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const data = snap.data() as EventComment;
  if (data.authorId !== requesterId) return false;
  await ref.delete();
  return true;
}

