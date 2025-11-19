import {
  listEvents,
  type EventItem,
} from "@/apps/events/services/events.service";
import { Button } from "@/components/forms";
import type { BreadcrumbItem } from "@/components/layouts/PageBreadcrumbs";
import PageBreadcrumbs from "@/components/layouts/PageBreadcrumbs";
import { PRIVATEROUTES } from "@/routes";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MeetingsInpersonList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listEvents({ kind: "inperson" });
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Eventos", onClick: () => navigate(PRIVATEROUTES.EVENTS) },
    { label: "Reuniones presenciales" },
  ];

  return (
    <div className="space-y-8 px-2 py-6 md:px-8">
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <PageBreadcrumbs items={breadcrumbItems} />

            <p className="text-sm text-gray-600">
              Encuentros físicos con seguimiento.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                navigate(
                  PRIVATEROUTES.EVENTS_CREATE.replace(":kind", "inperson"),
                )
              }
            >
              Crear reunión
            </Button>
          </div>
        </header>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <li
                key={e.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900">
                  <Link className="hover:underline" to={`/events/${e.id}`}>
                    {e.title}
                  </Link>
                </h3>
                {e.location && (
                  <p className="text-sm text-gray-600">Lugar: {e.location}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(e.startsAt).toLocaleString("es-ES")}
                </p>
              </li>
            ))}
            {!items.length && (
              <p className="text-gray-500">
                No hay reuniones presenciales aún.
              </p>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
