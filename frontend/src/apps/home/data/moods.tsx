import type { JSX } from "react";

import Celebration from "@mui/icons-material/Celebration";
import EmojiEmotions from "@mui/icons-material/EmojiEmotions";
import SelfImprovement from "@mui/icons-material/SelfImprovement";
import VolunteerActivism from "@mui/icons-material/VolunteerActivism";
import SentimentSatisfiedAlt from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentVeryDissatisfied from "@mui/icons-material/SentimentVeryDissatisfied";
import Bolt from "@mui/icons-material/Bolt";
import Whatshot from "@mui/icons-material/Whatshot";
import Gavel from "@mui/icons-material/Gavel";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import WaterDrop from "@mui/icons-material/WaterDrop";
import Bedtime from "@mui/icons-material/Bedtime";
import Hotel from "@mui/icons-material/Hotel";
import PersonOff from "@mui/icons-material/PersonOff";

// --- React Icons (fallback) ---
import { FaGhost } from "react-icons/fa";
import { BiSad } from "react-icons/bi";

export interface moods {
  id: string,
  label: string,
  valencia: number, activacion: number, dominancia: number
  peso_riesgo: number, peso_bienestar: number,
  icon: JSX.Element
}

export const moods = [
  // POSITIVAS
  {
    id: "euforia",
    label: "Euforico",
    valencia: 0.95, activacion: 0.95, dominancia: 0.85,
    peso_riesgo: 0.10, peso_bienestar: 0.90,
    icon: <Celebration className="text-yellow-400" />,
  },
  {
    id: "entusiasmo",
    label: "Entusiasmado",
    valencia: 0.80, activacion: 0.80, dominancia: 0.80,
    peso_riesgo: 0.15, peso_bienestar: 0.80,
    icon: <EmojiEmotions className="text-orange-400" />,
  },
  {
    id: "tranquilidad",
    label: "Tranquilo",
    valencia: 0.70, activacion: 0.30, dominancia: 0.85,
    peso_riesgo: 0.05, peso_bienestar: 0.75,
    icon: <SelfImprovement className="text-green-400" />,
  },
  {
    id: "gratitud",
    label: "Agradecido",
    valencia: 0.85, activacion: 0.45, dominancia: 0.75,
    peso_riesgo: 0.05, peso_bienestar: 0.70,
    icon: <VolunteerActivism className="text-pink-500" />,
  },
  {
    id: "satisfaccion",
    label: "Satisfecho",
    valencia: 0.80, activacion: 0.40, dominancia: 0.80,
    peso_riesgo: 0.05, peso_bienestar: 0.78,
    icon: <SentimentSatisfiedAlt className="text-lime-500" />,
  },

  // NEGATIVAS
  {
    id: "ansiedad",
    label: "Ansioso",
    valencia: -0.85, activacion: 0.85, dominancia: 0.30,
    peso_riesgo: 0.92, peso_bienestar: 0.00,
    icon: <SentimentVeryDissatisfied className="text-purple-500" />,
  },
  {
    id: "estres",
    label: "Estresado",
    valencia: -0.75, activacion: 0.85, dominancia: 0.40,
    peso_riesgo: 0.86, peso_bienestar: 0.00,
    icon: <Bolt className="text-red-500" />,
  },
  {
    id: "miedo",
    label: "Asustado",
    valencia: -0.95, activacion: 0.95, dominancia: 0.20,
    peso_riesgo: 0.95, peso_bienestar: 0.00,
    icon: <FaGhost className="text-indigo-700" />,
  },
  {
    id: "ira",
    label: "Bravo",
    valencia: -0.80, activacion: 0.80, dominancia: 0.70,
    peso_riesgo: 0.70, peso_bienestar: 0.00,
    icon: <Whatshot className="text-red-600" />,
  },
  {
    id: "culpa",
    label: "Culpable",
    valencia: -0.80, activacion: 0.60, dominancia: 0.25,
    peso_riesgo: 0.78, peso_bienestar: 0.00,
    icon: <Gavel className="text-amber-700" />,
  },
  {
    id: "verguenza",
    label: "Avergonzado",
    valencia: -0.80, activacion: 0.65, dominancia: 0.20,
    peso_riesgo: 0.72, peso_bienestar: 0.00,
    icon: <VisibilityOff className="text-gray-500" />,
  },
  {
    id: "tristeza",
    label: "Triste",
    valencia: -0.85, activacion: 0.35, dominancia: 0.25,
    peso_riesgo: 0.90, peso_bienestar: 0.00,
    icon: <WaterDrop className="text-blue-600" />,
  },
  {
    id: "apatia",
    label: "Apático",
    valencia: -0.75, activacion: 0.20, dominancia: 0.30,
    peso_riesgo: 0.85, peso_bienestar: 0.00,
    icon: <Bedtime className="text-slate-500" />,
  },
  {
    id: "cansancio",
    label: "Cansado",
    valencia: -0.40, activacion: 0.20, dominancia: 0.50,
    peso_riesgo: 0.50, peso_bienestar: 0.00,
    icon: <Hotel className="text-blue-400" />,
  },
  {
    id: "soledad",
    label: "Solo",
    valencia: -0.80, activacion: 0.35, dominancia: 0.30,
    peso_riesgo: 0.88, peso_bienestar: 0.00,
    icon: <PersonOff className="text-gray-600" />,
  },
  {
    id: "desesperanza",
    label: "Desesperado",
    valencia: -0.95, activacion: 0.40, dominancia: 0.10,
    peso_riesgo: 0.98, peso_bienestar: 0.00,
    icon: <BiSad className="text-zinc-600" />,
  },
];