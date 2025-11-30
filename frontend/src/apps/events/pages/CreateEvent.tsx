import { useNavigate, useParams, Link } from "react-router-dom";
import EventForm from "@/apps/events/components/EventForm";
import { createEvent, type EventKind } from "@/apps/events/services/events.service";
import useStore from "@/store/useStore";

export default function CreateEvent() {
  const { kind = "forum" } = useParams<{ kind: EventKind }>();
  const navigate = useNavigate();
  const showSnackbar = useStore((s) => s.showSnackbar);

  return (
    <div className="space-y-4 px-4 py-6 md:px-8">
      <nav className="text-sm text-gray-600">
        <Link to="/events" className="text-indigo-600 hover:underline">Eventos</Link> / Nuevo {kind}
      </nav>
      <h1 className="text-2xl font-bold text-gray-900">Crear {kind}</h1>
      <EventForm
        kind={kind as EventKind}
        submitLabel="Crear"
        onSubmit={async (payload) => {
          await createEvent(payload as any);
          showSnackbar("Evento creado", "success");
          navigate(`/events/${payload.kind}`);
        }}
      />
    </div>
  );
}
