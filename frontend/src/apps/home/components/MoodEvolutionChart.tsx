import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import type { MoodTimelineEntry } from "@/apps/moods/services/mood.interface";

interface MoodEvolutionChartProps {
    data: MoodTimelineEntry[];
    loading?: boolean;
}

const MoodEvolutionChart: React.FC<MoodEvolutionChartProps> = ({ data, loading }) => {
    const chartData = useMemo(() => {
        return data.map(entry => {
            const positive = entry.moods.filter(m => m.tone === 'positivo').length;
            const neutral = entry.moods.filter(m => m.tone === 'neutral').length;
            const negative = entry.moods.filter(m => m.tone === 'negativo').length;

            return {
                date: new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                fullDate: new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
                positive,
                neutral,
                negative,
                intensity: entry.dayScore,
                moods: entry.moods.map(m => m.moodId).join(', ')
            };
        });
    }, [data]);

    if (loading) {
        return <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100" />;
    }

    if (data.length === 0) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-400">
                No hay datos suficientes para mostrar la evolución.
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 0,
                    }}
                >
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        label={{ value: 'Cantidad de emociones', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[-1, 1]}
                        hide
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                    />

                    <Bar yAxisId="left" dataKey="positive" name="Positivas" stackId="a" fill="#34d399" radius={[0, 0, 4, 4]} barSize={20} />
                    <Bar yAxisId="left" dataKey="neutral" name="Neutras" stackId="a" fill="#fbbf24" barSize={20} />
                    <Bar yAxisId="left" dataKey="negative" name="Negativas" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />

                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="intensity"
                        name="Intensidad Promedio"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MoodEvolutionChart;
