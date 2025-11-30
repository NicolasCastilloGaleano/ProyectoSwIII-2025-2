import { useMemo } from 'react';
import { recommendationsData, defaultRecommendations } from '../data/recommendationsData';
import type { Recommendation } from '../types/recommendation.types';

export const useRecommendations = (moodId?: string | null): Recommendation[] => {
  const recommendations = useMemo(() => {
    if (!moodId) {
      return defaultRecommendations;
    }

    const moodRecs = recommendationsData[moodId.toLowerCase()];
    return moodRecs || defaultRecommendations;
  }, [moodId]);

  return recommendations;
};
