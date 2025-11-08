import { MoodTone } from "./moods.interface";

export interface MoodProfile {
  moodId: string;
  label: string;
  valence: number;
  activation: number;
  dominance: number;
  riskWeight: number;
  wellbeingWeight: number;
}

const RAW_PROFILES: MoodProfile[] = [
  {
    moodId: "euforia",
    label: "Eufórico",
    valence: 0.95,
    activation: 0.95,
    dominance: 0.85,
    riskWeight: 0.1,
    wellbeingWeight: 0.9,
  },
  {
    moodId: "entusiasmo",
    label: "Entusiasmado",
    valence: 0.8,
    activation: 0.8,
    dominance: 0.8,
    riskWeight: 0.15,
    wellbeingWeight: 0.8,
  },
  {
    moodId: "tranquilidad",
    label: "Tranquilo",
    valence: 0.7,
    activation: 0.3,
    dominance: 0.85,
    riskWeight: 0.05,
    wellbeingWeight: 0.75,
  },
  {
    moodId: "gratitud",
    label: "Agradecido",
    valence: 0.85,
    activation: 0.45,
    dominance: 0.75,
    riskWeight: 0.05,
    wellbeingWeight: 0.7,
  },
  {
    moodId: "satisfaccion",
    label: "Satisfecho",
    valence: 0.8,
    activation: 0.4,
    dominance: 0.8,
    riskWeight: 0.05,
    wellbeingWeight: 0.78,
  },
  {
    moodId: "ansiedad",
    label: "Ansioso",
    valence: -0.85,
    activation: 0.85,
    dominance: 0.3,
    riskWeight: 0.92,
    wellbeingWeight: 0,
  },
  {
    moodId: "estres",
    label: "Estresado",
    valence: -0.75,
    activation: 0.85,
    dominance: 0.4,
    riskWeight: 0.86,
    wellbeingWeight: 0,
  },
  {
    moodId: "miedo",
    label: "Asustado",
    valence: -0.95,
    activation: 0.95,
    dominance: 0.2,
    riskWeight: 0.95,
    wellbeingWeight: 0,
  },
  {
    moodId: "ira",
    label: "Bravo",
    valence: -0.8,
    activation: 0.8,
    dominance: 0.7,
    riskWeight: 0.7,
    wellbeingWeight: 0,
  },
  {
    moodId: "culpa",
    label: "Culpable",
    valence: -0.8,
    activation: 0.6,
    dominance: 0.25,
    riskWeight: 0.78,
    wellbeingWeight: 0,
  },
  {
    moodId: "verguenza",
    label: "Avergonzado",
    valence: -0.8,
    activation: 0.65,
    dominance: 0.2,
    riskWeight: 0.72,
    wellbeingWeight: 0,
  },
  {
    moodId: "tristeza",
    label: "Triste",
    valence: -0.85,
    activation: 0.35,
    dominance: 0.25,
    riskWeight: 0.9,
    wellbeingWeight: 0,
  },
  {
    moodId: "apatia",
    label: "Apático",
    valence: -0.75,
    activation: 0.2,
    dominance: 0.3,
    riskWeight: 0.85,
    wellbeingWeight: 0,
  },
  {
    moodId: "cansancio",
    label: "Cansado",
    valence: -0.4,
    activation: 0.2,
    dominance: 0.5,
    riskWeight: 0.5,
    wellbeingWeight: 0,
  },
  {
    moodId: "soledad",
    label: "Solo",
    valence: -0.8,
    activation: 0.35,
    dominance: 0.3,
    riskWeight: 0.88,
    wellbeingWeight: 0,
  },
  {
    moodId: "desesperanza",
    label: "Desesperado",
    valence: -0.95,
    activation: 0.4,
    dominance: 0.1,
    riskWeight: 0.98,
    wellbeingWeight: 0,
  },
];

const PROFILE_MAP = RAW_PROFILES.reduce<Record<string, MoodProfile>>(
  (acc, profile) => {
    acc[profile.moodId] = profile;
    return acc;
  },
  {},
);

const FALLBACK_PROFILE: MoodProfile = {
  moodId: "desconocido",
  label: "Emoción no clasificada",
  valence: 0,
  activation: 0.3,
  dominance: 0.5,
  riskWeight: 0.2,
  wellbeingWeight: 0.2,
};

export function getMoodProfile(moodId: string): MoodProfile {
  return PROFILE_MAP[moodId] ?? { ...FALLBACK_PROFILE, moodId, label: moodId };
}

export function getMoodTone(valence: number): MoodTone {
  if (valence >= 0.4) return "positivo";
  if (valence <= -0.4) return "negativo";
  return "neutral";
}
