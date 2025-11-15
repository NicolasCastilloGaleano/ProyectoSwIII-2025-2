import { useMemo } from "react";
import useStore from "@/store/useStore";


export const useAutomaticDiagnosis = () => {
    const { analytics } = useStore((state) => state.moodsState);

    const timelineSlice = useMemo(
        () => analytics?.timeline?.slice(-12) ?? [],
        [analytics]
    );

    const generateDiagnosis = useMemo(() => {
        if (!timelineSlice.length) {
            return {
                estado: "Sin datos suficientes",
                resumen: "No se puede generar diagnóstico por falta de registros recientes.",
                color: "text-gray-400",
            };
        }

        const promedio = timelineSlice.reduce((acc: number, e: any) => acc + e.dayScore, 0) / timelineSlice.length;
        const positivos = timelineSlice.filter((e: any) => e.dayScore >= 0.3).length;
        const negativos = timelineSlice.filter((e: any) => e.dayScore <= -0.3).length;
        const neutros = timelineSlice.length - positivos - negativos;

        if (promedio > 0.2) {
            return {
                estado: "Tendencia Positiva",
                resumen: `Se observa una mejora emocional general, con ${positivos} días positivos y solo ${negativos} negativos.`,
                color: "text-emerald-600",
            };
        } else if (promedio < -0.2) {
            return {
                estado: "Tendencia Negativa",
                resumen: `Se detecta una posible carga emocional alta, con ${negativos} días negativos y solo ${positivos} positivos.`,
                color: "text-rose-600",
            };
        } else {
            return {
                estado: "Estabilidad emocional",
                resumen: `El promedio emocional se mantiene estable (${neutros} días neutros).`,
                color: "text-amber-600",
            };
        }
    }, [timelineSlice]);


    return { generateDiagnosis }
}

