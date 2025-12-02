import {
  listEvents,
  type EventItem,
} from "@/apps/events/services/events.service";
import { Button } from "@/components/forms";
import type { BreadcrumbItem } from "@/components/layouts/PageBreadcrumbs";
import PageBreadcrumbs from "@/components/layouts/PageBreadcrumbs";
import { PRIVATEROUTES } from "@/routes";
import useStore from "@/store/useStore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MeetingsVirtualList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useStore((s) => s.authState.auth.currentUser);
  const canManage = currentUser?.permissions?.includes("events:manage");

  useEffect(() => {
    (async () => {
      try {
        const data = await listEvents({ kind: "virtual" });
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Eventos", onClick: () => navigate(PRIVATEROUTES.EVENTS) },
    { label: "Reuniones virtuales" },
  ];

  return (
    <div className="space-y-8 px-2 py-6 md:px-8">
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <PageBreadcrumbs items={breadcrumbItems} />

            <p className="text-sm text-gray-600">Sesiones por videollamada.</p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  navigate(
                    PRIVATEROUTES.EVENTS_CREATE.replace(":kind", "virtual"),
                  )
                }
              >
                Crear reunión
              </Button>
            </div>
          )}
        </header>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => {
              if (e.kind !== "virtual") return null;
              const meeting = e as any;
              return (
                <li
                  key={e.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900">
                    <Link className="hover:underline" to={`/events/${e.id}`}>
                      {e.title}
                    </Link>
                  </h3>
                  {meeting.platform && (
                    <p className="text-xs uppercase text-gray-500">
                      Plataforma: {meeting.platform}
                    </p>
                  )}
                  {meeting.meetingUrl && (
                    <a
                      className="text-sm text-indigo-600 hover:underline"
                      href={meeting.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enlace a la reunión
                    </a>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(e.startsAt).toLocaleString("es-ES")}
                  </p>
                </li>
              );
            })}
            {!items.length && (
              <p className="text-gray-500">No hay reuniones virtuales aún.</p>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
