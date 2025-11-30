import React from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import RecommendationCard from './RecommendationCard';
import AutoAwesome from '@mui/icons-material/AutoAwesome';

interface RecommendationsPanelProps {
    moodId?: string | null;
    accentColor?: string;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ moodId, accentColor }) => {
    const recommendations = useRecommendations(moodId);

    if (!recommendations.length) return null;

    return (
        <div className="rounded-3xl bg-white p-6 shadow-lg lg:col-span-3">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <AutoAwesome />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Sugerencias para ti
                    </h2>
                    <p className="text-sm text-slate-500">
                        Basado en tu estado emocional actual
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec) => (
                    <RecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        accentColor={accentColor}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecommendationsPanel;
