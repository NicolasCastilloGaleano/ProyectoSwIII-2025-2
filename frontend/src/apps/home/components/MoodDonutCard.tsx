interface MoodDonutCardProps {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    wellbeingScore: number;
    riskScore: number;
  };
}

const MoodDonutCard = ({ sentiment }: MoodDonutCardProps) => {
  const positiveEnd = sentiment.positive;
  const neutralEnd = sentiment.positive + sentiment.neutral;
  const donutBackground = `conic-gradient(#22c55e 0% ${positiveEnd}%, #facc15 ${positiveEnd}% ${neutralEnd}%, #f87171 ${neutralEnd}% 100%)`;

  return (
    <article className="shadow-soft flex h-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 text-center">
      <p className="text-sm font-semibold text-gray-500">Balance diario</p>
      <div className="mt-4 flex flex-col items-center gap-4">
        <div
          className="relative h-40 w-40 rounded-full"
          style={{ background: donutBackground }}
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-3xl font-bold text-gray-900">
              {sentiment.wellbeingScore.toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500">Bienestar</span>
          </div>
        </div>
        <div className="w-full space-y-2 text-left text-sm">
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700">
            <span>Positivo</span>
            <span className="font-semibold">
              {sentiment.positive.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-3 py-2 text-amber-700">
            <span>Neutro</span>
            <span className="font-semibold">
              {sentiment.neutral.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-3 py-2 text-rose-700">
            <span>Negativo</span>
            <span className="font-semibold">
              {sentiment.negative.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MoodDonutCard;
