import { useAutomaticDiagnosis } from "./useAutomaticDiagnosis";
import { useMemo } from "react";

export const useCounseling = () => {
    const { generateDiagnosis } = useAutomaticDiagnosis();

    const counseling = useMemo(() => {
        const { estado } = generateDiagnosis;

        const base = {
            titulo: "",
            consejos: [],
            nivelRiesgo: "bajo" as "bajo" | "medio" | "alto",
        };

        switch (estado) {
            case "Tendencia Positiva":
                return {
                    ...base,
                    titulo: "Estás en una etapa positiva",
                    consejos: [
                        "Mantén las actividades que te han ayudado a sentirte bien.",
                        "Evita tomar decisiones impulsivas en momentos de euforia.",
                        "Registra también momentos tranquilos, no solo los muy positivos.",
                        "Haz pausas de relajación para mantener estabilidad emocional.",
                    ],
                    nivelRiesgo: "bajo",
                };

            case "Tendencia Negativa":
                return {
                    ...base,
                    titulo: "Detectamos una tendencia emocional negativa",
                    consejos: [
                        "Identifica eventos o pensamientos que influyen en tus emociones.",
                        "Haz ejercicios de respiración profunda por 5 minutos al día.",
                        "Habla con alguien de confianza sobre lo que sientes.",
                        "Acude a un profesional si la tendencia continúa varios días.",
                    ],
                    nivelRiesgo: "alto",
                };

            case "Estabilidad emocional":
                return {
                    ...base,
                    titulo: "Te encuentras estable emocionalmente",
                    consejos: [
                        "Mantén tus rutinas saludables.",
                        "Registra también emociones sutiles para mayor autoconciencia.",
                        "Realiza una evaluación personal semanal.",
                    ],
                    nivelRiesgo: "bajo",
                };

            default:
                return {
                    ...base,
                    titulo: "Necesitamos más información",
                    consejos: [
                        "Registra tu estado emocional por los próximos días.",
                        "Añade una pequeña nota diaria sobre cómo te sentiste.",
                    ],
                    nivelRiesgo: "medio",
                };
        }
    }, [generateDiagnosis]);

    return { counseling };
};
