import type { MoodAnalytics } from "@/apps/moods/services/mood.interface";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import Avatar from "@mui/material/Avatar";
import HighlightPill from "./HighlightPill";

interface HeroProps {
  analytics: MoodAnalytics | null | undefined;
  loading: boolean;
  onCreateMood: () => void;
  accentColor?: string;
  avatar?: string | null;
  displayName?: string;
}

const HeroTodayCard = ({
  analytics,
  loading,
  onCreateMood,
  accentColor,
  avatar,
  displayName,
}: HeroProps) => {
  const today = new Date();
  const todayLabel = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl lg:col-span-2"
      style={{
        background: `linear-gradient(120deg, ${accentColor ?? "#0ea5e9"}, #1E1B4B)`,
      }}
    >
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm tracking-widest text-white/80 uppercase">
            {todayLabel}
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-bold">
            {displayName
              ? `${displayName}, ¿cómo te sientes hoy?`
              : "¿Cómo te sientes hoy?"}
          </h1>
          <p className="mt-2 text-white/80">
            Lleva un seguimiento visual y rápido de tus estados emocionales.
            Cada registro alimenta el análisis inteligente y actualiza los
            tableros de tus profesionales.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <HighlightPill
              icon={<CalendarMonth fontSize="small" />}
              label="Días con registro"
              value={analytics?.summary.daysTracked ?? 0}
              loading={loading}
            />
            <HighlightPill
              icon={<EmojiEvents fontSize="small" />}
              label="Racha activa"
              value={analytics?.summary.currentStreak ?? 0}
              loading={loading}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={avatar ?? undefined}
              sx={{
                width: 56,
                height: 56,
                border: "2px solid rgba(255,255,255,0.7)",
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            >
              {displayName?.[0]}
            </Avatar>
            <div>
              <p className="text-sm tracking-widest text-white/60 uppercase">
                Resumen del día
              </p>
              <p className="text-lg font-semibold text-white">
                Selecciona hasta 3 emociones
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCreateMood}
            className="w-full rounded-2xl bg-white/90 px-5 py-3 text-lg font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
          >
            Registrar emociones
          </button>
          <p className="text-xs text-white/70">
            Tip: Puedes combinar hasta 3 emociones en un mismo día para capturar
            matices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroTodayCard;
