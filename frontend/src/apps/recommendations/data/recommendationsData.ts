import type { Recommendation } from "../types/recommendation.types";
import SelfImprovement from "@mui/icons-material/SelfImprovement";
import MenuBook from "@mui/icons-material/MenuBook";
import Call from "@mui/icons-material/Call";
import FitnessCenter from "@mui/icons-material/FitnessCenter";
import Spa from "@mui/icons-material/Spa";

export const recommendationsData: Record<string, Recommendation[]> = {
  // --- POSITIVAS ---
  euforia: [
    {
      id: "rec-euforia-1",
      type: "exercise",
      title: "Canaliza tu energía",
      description: "Aprovecha este momento de alta energía con una sesión de cardio intenso.",
      actionLabel: "Ver rutina HIIT",
      icon: FitnessCenter,
    },
    {
      id: "rec-euforia-2",
      type: "reading",
      title: "Registra tu éxito",
      description: "Escribe qué te hizo sentir así para replicarlo en el futuro.",
      actionLabel: "Ir al diario",
      icon: MenuBook,
    },
  ],
  entusiasmo: [
    {
      id: "rec-entusiasmo-1",
      type: "reading",
      title: "Planifica nuevos proyectos",
      description: "Tu motivación es alta. Es el mejor momento para trazar metas.",
      actionLabel: "Crear meta",
      icon: MenuBook,
    },
  ],
  tranquilidad: [
    {
      id: "rec-tranquilidad-1",
      type: "exercise",
      title: "Meditación Mindfulness",
      description: "Mantén este estado de paz con una sesión guiada de 10 minutos.",
      actionLabel: "Iniciar",
      icon: SelfImprovement,
    },
  ],
  gratitud: [
    {
      id: "rec-gratitud-1",
      type: "reading",
      title: "Diario de Gratitud",
      description: "Anota 3 cosas por las que estás agradecido hoy.",
      actionLabel: "Escribir",
      icon: MenuBook,
    },
  ],
  satisfaccion: [
    {
      id: "rec-satisfaccion-1",
      type: "reading",
      title: "Reflexión de Logros",
      description: "Revisa tus avances de la semana y celébralos.",
      actionLabel: "Ver estadísticas",
      icon: MenuBook,
    },
  ],

  // --- NEGATIVAS ---
  ansiedad: [
    {
      id: "rec-ansiedad-1",
      type: "exercise",
      title: "Respiración 4-7-8",
      description: "Técnica probada para reducir la ansiedad rápidamente.",
      actionLabel: "Comenzar guía",
      icon: Spa,
    },
    {
      id: "rec-ansiedad-2",
      type: "contact",
      title: "Línea de Apoyo",
      description: "Si sientes que no puedes manejarlo, habla con un profesional.",
      actionLabel: "Llamar ahora",
      icon: Call,
    },
  ],
  estres: [
    {
      id: "rec-estres-1",
      type: "exercise",
      title: "Estiramiento de Cuello",
      description: "Libera la tensión acumulada en hombros y cuello.",
      actionLabel: "Ver ejercicios",
      icon: FitnessCenter,
    },
    {
      id: "rec-estres-2",
      type: "reading",
      title: "Técnica Pomodoro",
      description: "Organiza tus tareas en bloques para reducir la carga mental.",
      actionLabel: "Leer más",
      icon: MenuBook,
    },
  ],
  miedo: [
    {
      id: "rec-miedo-1",
      type: "reading",
      title: "Afirmaciones Positivas",
      description: "Lee estas frases para recuperar tu confianza y seguridad.",
      actionLabel: "Leer",
      icon: MenuBook,
    },
    {
      id: "rec-miedo-2",
      type: "contact",
      title: "Contactar a un amigo",
      description: "Hablar con alguien de confianza puede disipar tus temores.",
      actionLabel: "Ver contactos",
      icon: Call,
    },
  ],
  ira: [
    {
      id: "rec-ira-1",
      type: "exercise",
      title: "Boxeo de Sombra",
      description: "Libera la energía agresiva de forma segura y física.",
      actionLabel: "Ver rutina",
      icon: FitnessCenter,
    },
    {
      id: "rec-ira-2",
      type: "exercise",
      title: "Tiempo Fuera",
      description: "Aléjate de la situación y cuenta hasta 10 respirando profundo.",
      actionLabel: "Iniciar contador",
      icon: Spa,
    },
  ],
  tristeza: [
    {
      id: "rec-tristeza-1",
      type: "reading",
      title: "Escritura Terapéutica",
      description: "Expresa tus sentimientos en papel sin juzgarte.",
      actionLabel: "Abrir notas",
      icon: MenuBook,
    },
    {
      id: "rec-tristeza-2",
      type: "exercise",
      title: "Caminata Suave",
      description: "El movimiento suave y el aire fresco pueden mejorar tu ánimo.",
      actionLabel: "Salir",
      icon: FitnessCenter,
    },
  ],
  soledad: [
    {
      id: "rec-soledad-1",
      type: "contact",
      title: "Comunidad",
      description: "Conecta con grupos de interés o foros de apoyo.",
      actionLabel: "Buscar grupos",
      icon: Call,
    },
  ],
  desesperanza: [
    {
      id: "rec-desesperanza-1",
      type: "contact",
      title: "Ayuda Profesional",
      description: "No estás solo. Hay personas capacitadas para ayudarte ahora.",
      actionLabel: "Ver recursos",
      icon: Call,
    },
  ],
};

export const defaultRecommendations: Recommendation[] = [
  {
    id: "rec-default-1",
    type: "reading",
    title: "Explora tu bienestar",
    description: "Descubre artículos sobre salud emocional y mental.",
    actionLabel: "Explorar",
    icon: MenuBook,
  },
];
