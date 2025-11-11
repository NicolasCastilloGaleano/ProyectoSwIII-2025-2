import type { MoodAnalytics } from "@/apps/moods/services/mood.interface";
import Bolt from "@mui/icons-material/Bolt";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import Mood from "@mui/icons-material/Mood";
import TimelineIcon from "@mui/icons-material/Timeline";

interface SummaryProps {
  analytics: MoodAnalytics | null | undefined;
  loading: boolean;
}

const AnalyticsSummaryCard = ({ analytics, loading }: SummaryProps) => {
  const cards = [
    {
      label: "Promedio bienestar",
      value: analytics?.sentiment.wellbeingScore ?? 0,
      suffix: "%",
      icon: <Mood fontSize="small" />,
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      label: "Nivel de riesgo",
      value: analytics?.sentiment.riskScore ?? 0,
      suffix: "%",
      icon: <Bolt fontSize="small" />,
      gradient: "from-rose-500 to-orange-400",
    },
    {
      label: "Total de registros",
      value: analytics?.summary.totalEntries ?? 0,
      icon: <TimelineIcon fontSize="small" />,
      gradient: "from-sky-500 to-indigo-400",
    },
    {
      label: "Mayor racha",
      value: analytics?.summary.longestStreak ?? 0,
      icon: <EmojiEvents fontSize="small" />,
      gradient: "from-violet-500 to-purple-400",
    },
  ];

  return (
    <div className="shadow-soft rounded-3xl border border-gray-100 bg-white p-4">
      <p className="text-sm font-semibold text-gray-500">Resumen emocional</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${card.gradient} text-white`}
            >
              {card.icon}
            </div>
            <p className="mt-2 text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : card.value}
              <span className="text-base font-semibold text-gray-400">
                {card.suffix ?? ""}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsSummaryCard;
