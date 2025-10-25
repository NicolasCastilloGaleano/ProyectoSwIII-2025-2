import { useState } from "react";
import {
    SentimentVerySatisfied,
    EmojiEmotions,
    SelfImprovement,
    Hotel,
    SentimentDissatisfied,
    MoodBad,
    SentimentVeryDissatisfied,
    SentimentNeutral,
    Favorite,
} from "@mui/icons-material";

import { SideBar } from "../components/sideBar";

export default function DashboardPage() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const moods = [
        { id: "feliz", label: "Feliz", icon: <SentimentVerySatisfied className="text-yellow-400 " /> },
        { id: "motivado", label: "Motivado", icon: <EmojiEmotions className="text-orange-400" /> },
        { id: "tranquilo", label: "Tranquilo", icon: <SelfImprovement className="text-green-400" /> },
        { id: "cansado", label: "Cansado", icon: <Hotel className="text-blue-400" /> },
        { id: "estresado", label: "Estresado", icon: <SentimentNeutral className="text-red-400" /> },
        { id: "triste", label: "Triste", icon: <SentimentDissatisfied className="text-blue-600" /> },
        { id: "enojado", label: "Enojado", icon: <MoodBad className="text-red-600" /> },
        { id: "ansioso", label: "Ansioso", icon: <SentimentVeryDissatisfied className="text-purple-500" /> },
        { id: "agradecido", label: "Agradecido", icon: <Favorite className="text-pink-500" /> },
    ];

    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [moodHistory, setMoodHistory] = useState<Record<string, string>>({});

    const handleSelectMood = (moodId: string) => {
        setSelectedMood(moodId);
        const dateKey = today.toLocaleDateString("en-CA");
        setMoodHistory((prev) => ({
            ...prev,
            [dateKey]: moodId,
        }));
    };

    // Cálculo del calendario del mes actual
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const renderCalendar = () => (

        <div className="grid grid-cols-7 gap-2 text-center mt-6">
            {["D", "L", "M", "M", "J", "V", "S"].map((d) => (
                <div key={d} className="font-semibold text-sm text-gray-500 ">
                    {d}
                </div>
            ))}

            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} />
            ))}

            {/* Días del mes */}
            {daysArray.map((day) => {
                const dateKey = new Date(year, month, day).toLocaleDateString("en-CA");
                const mood = moods.find((m) => m.id === moodHistory[dateKey]);
                const isToday = day === today.getDate();

                return (
                    <div
                        key={day}
                        className={`border rounded-xl p-2 flex flex-col items-center justify-center h-20 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-violet-500 justify-items-end
                        ${isToday ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
                    >
                        <span className="text-sm font-semibold text-gray-600">{day}</span>
                        <div className="mt-1">{mood ? mood.icon : <span className="text-gray-300">–</span>}</div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="flex h-screen flex-row">
            <SideBar></SideBar>
            <div className="w-screen p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido, usuario</h1>
                <p className="text-gray-600 mb-6">Selecciona cómo te sientes hoy y revisa tu historial emocional.</p>

                {/* Bloque de selección de moods */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 ">
                    {moods.map((mood) => (
                        <button
                            key={mood.id}
                            onClick={() => handleSelectMood(mood.id)}
                            className={`flex flex-col items-center p-4 rounded-xl border transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-violet-500 justify-items-end hover:shadow-sm
              ${selectedMood === mood.id ? "bg-blue-50 border-blue-400" : "border-gray-200 hover:bg-gray-50"}`}
                        >
                            {mood.icon}
                            <span className="mt-2 text-sm font-medium text-gray-700">{mood.label}</span>
                        </button>
                    ))}
                </div>


                {/* Calendario del mes actual */}
                <div className="bg-white shadow-md rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Historial de estados de ánimo - {today.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                    </h2>
                    {renderCalendar()}
                </div>
            </div>
        </div>
    );
}
