import {
  addComment,
  deleteEvent,
  getEvent,
  joinEventApi,
  leaveEventApi,
  listComments,
  removeComment,
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
  const [comments, setComments] = useState<
    Array<{ id: string; text: string; authorName?: string; createdAt: number }>
  >([]);
  const [newComment, setNewComment] = useState("");
  const showSnackbar = useStore((s) => s.showSnackbar);
  const currentUser = useStore((s) => s.authState.auth.currentUser);

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

  const toggleJoin = async () => {
    if (!item) return;
    const updated = isParticipant
      ? await leaveEventApi(item.id)
      : await joinEventApi(item.id);
    setItem(updated);
    showSnackbar(
      isParticipant ? "Has salido del evento" : "Te uniste al evento",
      "success",
    );
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

  return (
    <div className="space-y-4 px-4 py-6 md:px-8">
      <PageBreadcrumbs items={breadcrumbItems} />

      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
          {item.description && (
            <p className="text-gray-700">{item.description}</p>
          )}
        </div>
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
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">Inicio</p>
          <p className="font-medium">
            {new Date(item.startsAt).toLocaleString("es-ES")}
          </p>
          {item.endsAt && (
            <>
              <p className="mt-2 text-sm text-gray-500">Fin</p>
              <p className="font-medium">
                {new Date(item.endsAt).toLocaleString("es-ES")}
              </p>
            </>
          )}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          {item.meetingUrl && (
            <p>
              <span className="text-sm text-gray-500">Enlace:</span>
              <a
                className="ml-2 text-indigo-600 hover:underline"
                href={item.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir
              </a>
            </p>
          )}
          {item.location && (
            <p>
              <span className="text-sm text-gray-500">Lugar:</span>{" "}
              <span className="ml-2">{item.location}</span>
            </p>
          )}
          <p className="mt-2">
            <span className="text-sm text-gray-500">Visibilidad:</span>{" "}
            <span className="ml-2">{item.visibility}</span>
          </p>
          {canJoin && (
            <div className="mt-4">
              <button
                onClick={toggleJoin}
                className="rounded-2xl bg-indigo-600 px-3 py-2 text-sm text-white"
              >
                {isParticipant ? "Salir del evento" : "Unirme al evento"}
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Participantes: {item.participants?.length ?? 0}
              </p>
            </div>
          )}
        </div>
      </section>
      {canComment && (
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
                  <button
                    onClick={() => handleRemoveComment(c.id)}
                    className="text-rose-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
            {!comments.length && (
              <p className="text-sm text-gray-500">Aún no hay comentarios.</p>
            )}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario…"
              className="flex-1 rounded-2xl border border-gray-200 px-3 py-2"
            />
            <button
              onClick={handleAddComment}
              className="rounded-2xl bg-indigo-600 px-3 py-2 text-sm text-white"
            >
              Publicar
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
