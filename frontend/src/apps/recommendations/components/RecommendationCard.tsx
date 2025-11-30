import React from 'react';
import type { Recommendation } from '../types/recommendation.types';
import ArrowForward from '@mui/icons-material/ArrowForward';

interface RecommendationCardProps {
    recommendation: Recommendation;
    accentColor?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, accentColor = '#4F46E5' }) => {
    const Icon = recommendation.icon;

    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full opacity-5 transition-transform group-hover:scale-110"
                style={{ backgroundColor: accentColor }} />

            <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {Icon ? <Icon fontSize="small" /> : <div className="h-4 w-4 rounded-full bg-current" />}
                </div>

                <h3 className="mb-1 text-lg font-bold text-slate-800">
                    {recommendation.title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed">
                    {recommendation.description}
                </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: accentColor }}>
                <span>{recommendation.actionLabel}</span>
                <ArrowForward fontSize="inherit" className="transition-transform group-hover:translate-x-1" />
            </div>

            {/* redireccionamiento */}
            {recommendation.actionUrl && (
                <a
                    href={recommendation.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label={recommendation.actionLabel}
                />
            )}
        </div>
    );
};

export default RecommendationCard;
