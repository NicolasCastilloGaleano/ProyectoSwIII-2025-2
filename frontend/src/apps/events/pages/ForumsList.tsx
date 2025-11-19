import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listEvents, type EventItem } from "@/apps/events/services/events.service";

export default function ForumsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listEvents({ kind: "forum" });
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-600">
            <Link to="/events" className="text-indigo-600 hover:underline">Eventos</Link> / Foros
          </nav>
          <h2 className="text-xl font-semibold text-gray-900">Foros</h2>
          <p className="text-sm text-gray-600">Temas abiertos de la comunidad.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/events/forum/new")} className="rounded-2xl bg-indigo-600 px-3 py-2 text-sm text-white">Crear foro</button>
        </div>
      </header>
      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <li key={e.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                <Link className="hover:underline" to={`/events/${e.id}`}>{e.title}</Link>
              </h3>
              {e.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{e.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {new Date(e.startsAt).toLocaleString("es-ES")}
              </p>
            </li>
          ))}
          {!items.length && <p className="text-gray-500">No hay foros aún.</p>}
        </ul>
      )}
    </section>
  );
}
