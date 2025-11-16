import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EventForm from "@/apps/events/components/EventForm";
import { getEvent, updateEvent, type EventItem, type EventKind } from "@/apps/events/services/events.service";
import useStore from "@/store/useStore";

export default function EditEvent() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showSnackbar = useStore((s) => s.showSnackbar);
  const [item, setItem] = useState<EventItem | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getEvent(id);
      setItem(data);
    })();
  }, [id]);

  if (!item) return <div className="p-6">Cargando…</div>;

  return (
    <div className="space-y-4 px-4 py-6 md:px-8">
      <nav className="text-sm text-gray-600">
        <Link to="/events" className="text-indigo-600 hover:underline">Eventos</Link> /
        <Link to={`/events/${item.kind}`} className="text-indigo-600 hover:underline"> {item.kind}</Link> / Editar
      </nav>
      <h1 className="text-2xl font-bold text-gray-900">Editar {item.kind}</h1>
      <EventForm
        kind={item.kind as EventKind}
        initial={item}
        submitLabel="Guardar cambios"
        onSubmit={async (payload) => {
          await updateEvent(item.id, payload as Partial<EventItem>);
          showSnackbar("Cambios guardados", "success");
          navigate(`/events/${item.id}`);
        }}
      />
    </div>
  );
}
