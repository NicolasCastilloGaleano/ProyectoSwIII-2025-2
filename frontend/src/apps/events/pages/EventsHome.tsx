import { useNavigate } from "react-router-dom";
import { PRIVATEROUTES } from "@/routes/private.routes";

type EventKind = {
  key: string;
  title: string;
  description: string;
};

const kinds: EventKind[] = [
  {
    key: "forum",
    title: "Foros",
    description: "Espacios abiertos para temas de interés y comunidad.",
  },
  {
    key: "discussion",
    title: "Discusiones",
    description: "Hilos estructurados para debatir y tomar decisiones.",
  },
  {
    key: "virtual",
    title: "Reuniones virtuales",
    description: "Sesiones por videollamada con agenda y notas.",
  },
  {
    key: "inperson",
    title: "Reuniones presenciales",
    description: "Encuentros físicos con asistencia y seguimiento.",
  },
];

export default function EventsHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <p className="text-gray-600">
          Crea y gestiona foros, discusiones y reuniones. Este es un primer
          vistazo; luego conectaremos con el backend.
        </p>
      </header>

      <section className="shadow-soft rounded-3xl border border-gray-100 bg-white p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full gap-2 md:w-2/3">
            <input
              type="text"
              placeholder="Buscar eventos..."
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 focus:border-indigo-400 focus:outline-none"
              aria-label="Buscar eventos"
            />
            <select
              className="rounded-2xl border border-gray-200 px-3 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none"
              aria-label="Filtrar por tipo"
              defaultValue=""
            >
              <option value="" disabled>
                Tipo
              </option>
              {kinds.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-white shadow transition hover:bg-indigo-700"
              onClick={() => navigate(PRIVATEROUTES.HOMEPAGE)}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kinds.map((k) => (
          <article
            key={k.key}
            className="shadow-soft flex h-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{k.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{k.description}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-700"
                onClick={() => navigate(`/events/${k.key}`)}
              >
                Explorar
              </button>
              <button
                type="button"
                className="rounded-2xl bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                onClick={() => navigate(`/events/${k.key}`)}
              >
                Crear
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
