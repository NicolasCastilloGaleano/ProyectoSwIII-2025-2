import { useEffect, useMemo, useState } from "react";
import type { EventItem, EventKind } from "@/apps/events/services/events.service";

type Props = {
  kind: EventKind;
  initial?: Partial<EventItem>;
  onSubmit: (payload: {
    kind: EventKind;
    title: string;
    description?: string;
    startsAt: number;
    endsAt?: number | null;
    meetingUrl?: string | null;
    location?: string | null;
    visibility?: "public" | "private";
  }) => Promise<void> | void;
  submitLabel?: string;
};

export default function EventForm({ kind, initial, onSubmit, submitLabel = "Guardar" }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAtISO, setStartsAtISO] = useState("");
  const [endsAtISO, setEndsAtISO] = useState<string>("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [saving, setSaving] = useState(false);

  const showMeetingField = kind === "virtual";
  const showLocationField = kind === "inperson";

  useEffect(() => {
    if (initial?.title) setTitle(initial.title);
    if (initial?.description) setDescription(initial.description);
    if (initial?.startsAt) setStartsAtISO(new Date(initial.startsAt).toISOString().slice(0, 16));
    if (initial?.endsAt) setEndsAtISO(new Date(initial.endsAt).toISOString().slice(0, 16));
    if (initial?.meetingUrl) setMeetingUrl(initial.meetingUrl);
    if (initial?.location) setLocation(initial.location);
    if (initial?.visibility) setVisibility(initial.visibility);
  }, [initial]);

  const canSubmit = useMemo(() => {
    const okTitle = title.trim().length >= 3;
    const okStart = startsAtISO.length > 0;
    const endOk = !endsAtISO || new Date(endsAtISO).getTime() >= new Date(startsAtISO).getTime();
    const virtualOk = !showMeetingField || !meetingUrl || /^https?:\/\//i.test(meetingUrl);
    return okTitle && okStart && endOk && virtualOk && !saving;
  }, [title, startsAtISO, endsAtISO, meetingUrl, saving, showMeetingField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onSubmit({
        kind,
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: new Date(startsAtISO).getTime(),
        endsAt: endsAtISO ? new Date(endsAtISO).getTime() : null,
        meetingUrl: showMeetingField ? meetingUrl || null : undefined,
        location: showLocationField ? location || null : undefined,
        visibility,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none" required minLength={3} maxLength={120} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none" rows={3} maxLength={1000} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Inicio</label>
          <input type="datetime-local" value={startsAtISO} onChange={(e) => setStartsAtISO(e.target.value)} className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fin</label>
          <input type="datetime-local" value={endsAtISO} onChange={(e) => setEndsAtISO(e.target.value)} className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none" />
        </div>
      </div>
      {showMeetingField && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Enlace</label>
          <input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none" />
        </div>
      )}
      {showLocationField && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Lugar</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Visibilidad</label>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="mt-1 rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none">
          <option value="private">Privado</option>
          <option value="public">Público</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={!canSubmit} className="rounded-2xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-60">{submitLabel}</button>
        <span className="text-xs text-gray-500">Asegúrate que la fecha fin no sea anterior al inicio.</span>
      </div>
    </form>
  );
}
