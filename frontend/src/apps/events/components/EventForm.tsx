import type {
  DiscussionEvent,
  EventItem,
  EventKind,
} from "@/apps/events/services/events.service";
import { Button } from "@/components/forms";
import { useEffect, useMemo, useState } from "react";

type Props = {
  kind: EventKind;
  initial?: Partial<EventItem>;
  onSubmit: (payload: Partial<EventItem> & { kind: EventKind }) => Promise<void> | void;
  submitLabel?: string;
};

export default function EventForm({
  kind,
  initial,
  onSubmit,
  submitLabel = "Guardar",
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAtISO, setStartsAtISO] = useState("");
  const [endsAtISO, setEndsAtISO] = useState<string>("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [platform, setPlatform] = useState<"zoom" | "meet" | "teams" | "custom">("custom");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [location, setLocation] = useState("");
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [rsvpRequired, setRsvpRequired] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<DiscussionEvent["status"]>("open");
  const [agenda, setAgenda] = useState("");
  const [decisions, setDecisions] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [saving, setSaving] = useState(false);

  const showForumFields = kind === "forum" || kind === "discussion";
  const showDiscussionExtras = kind === "discussion";
  const showMeetingField = kind === "virtual";
  const showLocationField = kind === "inperson";

  useEffect(() => {
    const init: any = initial ?? {};
    if (initial?.title) setTitle(initial.title);
    if (initial?.description) setDescription(initial.description);
    if (initial?.startsAt)
      setStartsAtISO(new Date(initial.startsAt).toISOString().slice(0, 16));
    if (initial?.endsAt)
      setEndsAtISO(new Date(initial.endsAt).toISOString().slice(0, 16));
    if (initial?.visibility) setVisibility(initial.visibility);
    if (init.meetingUrl) setMeetingUrl(init.meetingUrl);
    if (init.platform) setPlatform(init.platform);
    if (init.recordingUrl) setRecordingUrl(init.recordingUrl);
    if (typeof init.maxParticipants === "number")
      setMaxParticipants(String(init.maxParticipants));
    if (typeof init.waitingRoom === "boolean")
      setWaitingRoom(Boolean(init.waitingRoom));
    if (init.location) setLocation(init.location);
    if (init.room) setRoom(init.room);
    if (typeof init.capacity === "number")
      setCapacity(String(init.capacity));
    if (typeof init.rsvpRequired === "boolean")
      setRsvpRequired(Boolean(init.rsvpRequired));
    if (init.checkInCode) setCheckInCode(init.checkInCode);
    if (Array.isArray(init.tags)) setTags(init.tags.join(", "));
    if (typeof init.pinned === "boolean") setPinned(Boolean(init.pinned));
    if (typeof init.locked === "boolean") setLocked(Boolean(init.locked));
    if (init.status) setStatus(init.status);
    if (Array.isArray(init.agenda)) setAgenda(init.agenda.join("\n"));
    if (Array.isArray(init.decisions)) setDecisions(init.decisions.join("\n"));
  }, [initial]);

  const canSubmit = useMemo(() => {
    const okTitle = title.trim().length >= 3;
    const okStart = startsAtISO.length > 0;
    const endOk =
      !endsAtISO ||
      new Date(endsAtISO).getTime() >= new Date(startsAtISO).getTime();
    const virtualOk =
      !showMeetingField || (!!meetingUrl && /^https?:\/\//i.test(meetingUrl));
    const inpersonOk = !showLocationField || location.trim().length >= 3;
    return okTitle && okStart && endOk && virtualOk && inpersonOk && !saving;
  }, [title, startsAtISO, endsAtISO, meetingUrl, saving, showMeetingField, showLocationField, location]);

  const parseList = (value: string, separator: RegExp | string) =>
    value
      .split(separator)
      .map((v) => v.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const payload: any = {
        kind,
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: new Date(startsAtISO).getTime(),
        endsAt: endsAtISO ? new Date(endsAtISO).getTime() : null,
        visibility,
      };

      if (showForumFields) {
        payload.tags = parseList(tags, /[,#]/);
        payload.pinned = pinned;
        payload.locked = locked;
      }
      if (showDiscussionExtras) {
        payload.status = status;
        payload.agenda = parseList(agenda, /\n/);
        payload.decisions = parseList(decisions, /\n/);
      }
      if (showMeetingField) {
        payload.meetingUrl = meetingUrl.trim();
        payload.platform = platform;
        payload.recordingUrl = recordingUrl.trim() || undefined;
        payload.maxParticipants = maxParticipants ? Number(maxParticipants) : null;
        payload.waitingRoom = waitingRoom;
      }
      if (showLocationField) {
        payload.location = location.trim();
        payload.room = room.trim() || undefined;
        payload.capacity = capacity ? Number(capacity) : null;
        payload.rsvpRequired = rsvpRequired;
        payload.checkInCode = checkInCode.trim() || undefined;
      }

      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
          required
          minLength={3}
          maxLength={120}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
          rows={3}
          maxLength={1000}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Inicio
          </label>
          <input
            type="datetime-local"
            value={startsAtISO}
            onChange={(e) => setStartsAtISO(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fin</label>
          <input
            type="datetime-local"
            value={endsAtISO}
            onChange={(e) => setEndsAtISO(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
          />
        </div>
      </div>

      {showForumFields && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Etiquetas (separadas por coma)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#bienestar, comunidad"
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              Fijar
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={locked}
                onChange={(e) => setLocked(e.target.checked)}
              />
              Bloquear comentarios
            </label>
          </div>
        </div>
      )}

      {showDiscussionExtras && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            >
              <option value="open">Abierta</option>
              <option value="closed">Cerrada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Agenda (1 por línea)
            </label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Decisiones (1 por línea)
            </label>
            <textarea
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              rows={3}
            />
          </div>
        </div>
      )}

      {showMeetingField && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enlace de reunión
            </label>
            <input
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Plataforma
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="mt-1 rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            >
              <option value="custom">Otro</option>
              <option value="zoom">Zoom</option>
              <option value="meet">Google Meet</option>
              <option value="teams">Microsoft Teams</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grabación (opcional)
            </label>
            <input
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Aforo máximo
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                min={1}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={waitingRoom}
                onChange={(e) => setWaitingRoom(e.target.checked)}
              />
              Sala de espera
            </label>
          </div>
        </div>
      )}

      {showLocationField && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lugar
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sala / Ambiente
            </label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Capacidad
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min={1}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="mt-6 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rsvpRequired}
                onChange={(e) => setRsvpRequired(e.target.checked)}
              />
              Requiere confirmación
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código de check-in
              </label>
              <input
                value={checkInCode}
                onChange={(e) => setCheckInCode(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Visibilidad
        </label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as any)}
          className="mt-1 rounded-2xl border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none"
        >
          <option value="private">Privado</option>
          <option value="public">Público</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-500">
          Asegúrate que la fecha fin no sea anterior al inicio.
        </span>

        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
