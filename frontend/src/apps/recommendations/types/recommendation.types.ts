export type RecommendationType = 'exercise' | 'reading' | 'contact';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  actionLabel: string;
  actionUrl?: string;
  icon?: React.ElementType;
}
