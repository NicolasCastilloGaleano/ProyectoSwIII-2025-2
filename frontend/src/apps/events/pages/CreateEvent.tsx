import EventForm from "@/apps/events/components/EventForm";
import {
  createEvent,
  type EventKind,
} from "@/apps/events/services/events.service";
import { PageBreadcrumbs } from "@/components/layouts";
import type { BreadcrumbItem } from "@/components/layouts/PageBreadcrumbs";
import { PRIVATEROUTES } from "@/routes";
import useStore from "@/store/useStore";
import { useNavigate, useParams } from "react-router-dom";

export default function CreateEvent() {
  const { kind = "forum" } = useParams<{ kind: EventKind }>();
  const navigate = useNavigate();
  const showSnackbar = useStore((s) => s.showSnackbar);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Eventos", onClick: () => navigate(PRIVATEROUTES.EVENTS) },
    { label: kind, onClick: () => navigate(`${PRIVATEROUTES.EVENTS}/${kind}`) },
    { label: `Crear ${kind}` },
  ];

  return (
    <div className="space-y-4 px-4 py-6 md:px-8">
      <PageBreadcrumbs items={breadcrumbItems} />

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
