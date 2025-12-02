import {
  addComment,
  checkInEvent,
  closeDiscussion,
  deleteEvent,
  getEvent,
  joinEventApi,
  leaveEventApi,
  likeEvent,
  listComments,
  removeComment,
  unlikeEvent,
  type EventComment,
  type EventItem,
} from "@/apps/events/services/events.service";
import type { BreadcrumbItem } from "@/components/layouts/PageBreadcrumbs";
import PageBreadcrumbs from "@/components/layouts/PageBreadcrumbs";
import { PRIVATEROUTES } from "@/routes";
import useStore from "@/store/useStore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function EventDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const showSnackbar = useStore((s) => s.showSnackbar);
  const currentUser = useStore((s) => s.authState.auth.currentUser);

  const hasPermission = (perm: string) =>
    currentUser?.permissions?.includes(perm) ?? false;

  useEffect(() => {
    (async () => {
      try {
        const data = await getEvent(id);
        setItem(data);
        const cs = await listComments(id);
        setComments(cs);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm("¿Eliminar evento?")) return;
    await deleteEvent(item.id);
    showSnackbar("Evento eliminado", "success");
    navigate(`/events/${item.kind}`);
  };

  const handleAddComment = async () => {
    if (!item || !newComment.trim()) return;
    const c = await addComment(item.id, newComment.trim());
    setComments((prev) => [...prev, c]);
    setNewComment("");
    showSnackbar("Comentario publicado", "success");
  };

  const handleRemoveComment = async (commentId: string) => {
    if (!item) return;
    await removeComment(item.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    showSnackbar("Comentario eliminado", "info");
  };

  const isParticipant = item?.participants?.includes(currentUser?.id || "");
  const canComment = item?.kind === "forum" || item?.kind === "discussion";
  const canJoin = item?.kind === "virtual" || item?.kind === "inperson";
  const isOwner = item?.createdBy === currentUser?.id;
  const canManage = hasPermission("events:manage") || isOwner;
  const canInteract = hasPermission("events:interact") || canManage;
  const hasLiked =
    item?.kind === "forum" || item?.kind === "discussion"
      ? item.likedBy?.includes(currentUser?.id ?? "")
      : false;

  const toggleJoin = async () => {
    if (!item) return;
    if (!canInteract) {
      showSnackbar("No tienes permisos para participar en eventos.", "warning");
      return;
    }
    const updated = isParticipant
      ? await leaveEventApi(item.id)
      : await joinEventApi(item.id);
    setItem(updated);
    showSnackbar(
      isParticipant ? "Has salido del evento" : "Te uniste al evento",
      "success",
    );
  };
  const toggleLike = async () => {
    if (!item || !(item.kind === "forum" || item.kind === "discussion")) return;
    const updated = hasLiked
      ? await unlikeEvent(item.id)
      : await likeEvent(item.id);
    setItem(updated);
  };

  const handleCloseDiscussion = async () => {
    if (!item || item.kind !== "discussion") return;
    const updated = await closeDiscussion(item.id);
    setItem(updated);
    showSnackbar("Discusión cerrada", "info");
  };

  const handleCheckIn = async () => {
    if (!item || item.kind !== "inperson") return;
    if (item.checkInCode) {
      const code = prompt("Ingresa el código de check-in");
      if (code == null) return;
      const updated = await checkInEvent(item.id, code.trim());
      setItem(updated);
    } else {
      const updated = await checkInEvent(item.id);
      setItem(updated);
    }
    showSnackbar("Asistencia registrada", "success");
  };

  if (loading) return <div className="p-6">Cargando…</div>;
  if (!item) return <div className="p-6">No encontrado</div>;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Eventos", onClick: () => navigate(PRIVATEROUTES.EVENTS) },
    {
      label: item.kind,
      onClick: () => navigate(`${PRIVATEROUTES.EVENTS}/${item.kind}`),
    },
    { label: "Detalle" },
  ];

  const renderMetaByKind = () => {
    if (item.kind === "forum" || item.kind === "discussion") {
      return (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-sm text-gray-500">Participación</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-700">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
              {item.views ?? 0} vistas
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
              {item.likes ?? 0} reacciones
            </span>
            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-gray-700"
              >
                #{tag}
              </span>
            ))}
            {item.pinned && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                Fijado
              </span>
            )}
            {item.locked && (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">
                Comentarios bloqueados
              </span>
            )}
          </div>
          {item.kind === "discussion" && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Agenda
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                {(item.agenda ?? []).map((a, idx) => (
                  <li key={`${a}-${idx}`} className="rounded-xl bg-gray-50 px-3 py-2">
                    {a}
                  </li>
                ))}
                {!item.agenda?.length && (
                  <li className="text-sm text-gray-500">Sin agenda definida.</li>
                )}
              </ul>
              <p className="text-sm font-semibold text-gray-700">
                Decisiones
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                {(item.decisions ?? []).map((d, idx) => (
                  <li key={`${d}-${idx}`} className="rounded-xl bg-emerald-50 px-3 py-2">
                    {d}
                  </li>
                ))}
                {!item.decisions?.length && (
                  <li className="text-sm text-gray-500">Sin decisiones registradas.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (item.kind === "virtual") {
      return (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-sm text-gray-500">Reunión</p>
          <p className="text-sm text-gray-700 capitalize">
            Plataforma: {item.platform ?? "Otro"}
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Aforo: {item.maxParticipants ?? "Sin límite"}
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Sala de espera: {item.waitingRoom ? "Sí" : "No"}
          </p>
          {item.recordingUrl && (
            <a
              className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:underline"
              href={item.recordingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver grabación
            </a>
          )}
          {canJoin && canInteract && (
            <div className="mt-4">
              <button
                onClick={toggleJoin}
                className="rounded-2xl bg-indigo-600 px-3 py-2 text-sm text-white"
              >
                {isParticipant ? "Salir de la reunión" : "Unirme a la reunión"}
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Participantes: {item.participants?.length ?? 0}
              </p>
              <a
                className="mt-2 block text-sm text-indigo-600 hover:underline"
                href={item.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir enlace
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
        <p className="text-sm text-gray-500">Lugar</p>
        <p className="text-sm font-semibold text-gray-800">{item.location}</p>
        {item.room && (
          <p className="text-sm text-gray-700">Sala: {item.room}</p>
        )}
        {item.capacity && (
          <p className="text-sm text-gray-700">Capacidad: {item.capacity}</p>
        )}
        <p className="mt-1 text-sm text-gray-700">
          RSVP: {item.rsvpRequired ? "Requerido" : "Opcional"}
        </p>
        {item.checkInCode && (
          <p className="text-sm text-gray-700">Código de check-in: {item.checkInCode}</p>
        )}
        {canJoin && canInteract && (
          <div className="mt-4">
            <button
              onClick={toggleJoin}
              className="rounded-2xl bg-indigo-600 px-3 py-2 text-sm text-white"
            >
              {isParticipant ? "Cancelar asistencia" : "Confirmar asistencia"}
            </button>
            <p className="mt-2 text-sm text-gray-600">
              Confirmados: {item.participants?.length ?? 0}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 px-4 py-6 md:px-8">
      <PageBreadcrumbs items={breadcrumbItems} />

      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
          {item.description && (
            <p className="text-gray-700">{item.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>
              Inicio: {new Date(item.startsAt).toLocaleString("es-ES")}
            </span>
            {item.endsAt && (
              <span>
                Fin: {new Date(item.endsAt).toLocaleString("es-ES")}
              </span>
            )}
            <span>Visibilidad: {item.visibility}</span>
            {(item.kind === "forum" || item.kind === "discussion") && (
              <button
                onClick={toggleLike}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                  hasLiked
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {hasLiked ? "Te gusta" : "Me gusta"} ({item.likes ?? 0})
              </button>
            )}
            {item.kind === "discussion" && canManage && (
              <button
                onClick={handleCloseDiscussion}
                className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
              >
                Cerrar discusión
              </button>
            )}
            {item.kind === "inperson" && canInteract && (
              <button
                onClick={handleCheckIn}
                className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                Hacer check-in
              </button>
            )}
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link
              to={`/events/${item.id}/edit`}
              className="rounded-2xl border border-gray-200 px-3 py-2 text-sm"
            >
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-2xl bg-rose-600 px-3 py-2 text-sm text-white"
            >
              Eliminar
            </button>
          </div>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">Resumen</p>
          <p className="text-sm text-gray-700">
            {item.participants?.length ?? 0} participantes
          </p>
          {item.kind === "discussion" && (
            <p className="text-sm text-gray-700">
              Estado: {(item as any).status ?? "open"}
            </p>
          )}
        </div>
        {renderMetaByKind()}
      </section>

      {canComment && !item.locked && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Comentarios
          </h2>
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-xl border border-gray-100 p-3">
                <p className="text-sm text-gray-800">{c.text}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {c.authorName || "Anónimo"} ·{" "}
                    {new Date(c.createdAt).toLocaleString("es-ES")}
                  </span>
                  {(canManage || c.authorId === currentUser?.id) && (
                    <button
                      onClick={() => handleRemoveComment(c.id)}
                      className="text-rose-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            ))}
            {!comments.length && (
              <p className="text-sm text-gray-500">Aún no hay comentarios.</p>
            )}
          </ul>
          {canInteract && (
            <div className="mt-3 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 rounded-2xl border border-gray-200 px-3 py-2"
              />
              <button
                onClick={handleAddComment}
                className="rounded-2xl bg-indigo-600 px-3 py-2 text-sm text-white"
              >
                Publicar
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
