import { useMemo } from 'react';
import useStore from '@/store/useStore';
import type { MoodTimelineEntry } from '@/apps/moods/services/mood.interface';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface RiskAlert {
  id: string;
  type: 'sustained_low' | 'sudden_drop' | 'high_volatility' | 'critical_mood';
  message: string;
  severity: AlertSeverity;
  date: string;
}

export const useRiskAlerts = () => {
  const { analytics } = useStore((state) => state.moodsState);

  const alerts = useMemo(() => {
    const generatedAlerts: RiskAlert[] = [];
    const timeline = analytics?.timeline || [];
    
    // We need at least a few days of data to detect patterns
    if (timeline.length < 3) return generatedAlerts;

    // Sort timeline by date ascending just in case, though usually it's sorted
    const sortedTimeline = [...timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recentDays = sortedTimeline.slice(-7); // Look at last 7 days for relevant alerts

    // 1. Sustained Low Mood (Last 3 days have score < -0.4)
    const last3Days = recentDays.slice(-3);
    if (last3Days.length === 3 && last3Days.every(day => day.dayScore < -0.4)) {
      generatedAlerts.push({
        id: 'sustained-low',
        type: 'sustained_low',
        message: 'Se ha detectado un estado de ánimo bajo sostenido en los últimos 3 días.',
        severity: 'warning',
        date: last3Days[last3Days.length - 1].date
      });
    }

    // 2. Sudden Drop (Drop of > 0.8 between consecutive days in the last 3 days)
    for (let i = recentDays.length - 1; i > 0; i--) {
        const current = recentDays[i];
        const prev = recentDays[i - 1];
        if (prev.dayScore - current.dayScore > 0.8) {
            generatedAlerts.push({
                id: `sudden-drop-${current.date}`,
                type: 'sudden_drop',
                message: `Caída abrupta en el estado emocional detectada el ${new Date(current.date).toLocaleDateString('es-ES')}.`,
                severity: 'critical',
                date: current.date
            });
            break; // Only report the most recent sudden drop to avoid noise
        }
    }

    // 3. Critical Moods (Presence of "Desesperanza" or "Soledad" in last 3 days)
    const criticalMoodIds = ['desesperanza', 'soledad', 'miedo'];
    const recentCriticalMoods = last3Days.flatMap(day => 
        day.moods.filter(m => criticalMoodIds.includes(m.moodId.toLowerCase()))
    );

    if (recentCriticalMoods.length > 0) {
        // Unique critical moods
        const uniqueMoods = Array.from(new Set(recentCriticalMoods.map(m => m.moodId)));
        generatedAlerts.push({
            id: 'critical-mood-detected',
            type: 'critical_mood',
            message: `Se han registrado emociones de riesgo (${uniqueMoods.join(', ')}) recientemente.`,
            severity: 'critical',
            date: last3Days[last3Days.length - 1].date
        });
    }

    // 4. High Volatility (Standard deviation check on last 5 days)
    const last5Days = recentDays.slice(-5);
    if (last5Days.length >= 5) {
        const scores = last5Days.map(d => d.dayScore);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev > 0.6) { // Threshold for high volatility
            generatedAlerts.push({
                id: 'high-volatility',
                type: 'high_volatility',
                message: 'Alta variabilidad emocional detectada en los últimos días.',
                severity: 'info',
                date: last5Days[last5Days.length - 1].date
            });
        }
    }

    return generatedAlerts;
  }, [analytics]);

  return { alerts };
};
