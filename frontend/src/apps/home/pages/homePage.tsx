import { moods } from "../data/moods";
import { SideBar } from "../components/sideBar";
import useStore from "../../../store/useStore";
import { useState } from "react";

export default function HomePage() {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const { addMoodForToday, removeMoodForToday, getMoodsForDate } = useStore();

    // calendario
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Si el mood existe lo elimina, si no existe lo adiciona
    const handleSelectMood = (moodId: string) => {
        const todayKey = new Date().toLocaleDateString("en-CA");
        const todayMoods = getMoodsForDate(todayKey);

        if (todayMoods.includes(moodId)) {
            removeMoodForToday(moodId);
            setSelectedMood(null);
        } else {
            addMoodForToday(moodId);
            setSelectedMood(moodId);
        }
    };

    const renderCalendar = () => (
        <div className="grid grid-cols-7 gap-2 text-center mt-6">
            {["D", "L", "M", "M", "J", "V", "S"].map((d) => (
                <div key={d} className="font-semibold text-sm text-gray-500">
                    {d}
                </div>
            ))}

            {/* espacios vacíos antes del primer día */}
            {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} />
            ))}

            {/* días */}
            {daysArray.map((day) => {
                const date = new Date(year, month, day);
                const dateKey = date.toLocaleDateString("en-CA");
                const moodIds = getMoodsForDate(dateKey);
                const moodIcons = moodIds
                    .map((id) => moods.find((m) => m.id === id)?.icon)
                    .filter(Boolean);

                const isToday = dateKey === new Date().toLocaleDateString("en-CA");

                return (
                    <div
                        key={day}
                        className={`border rounded-xl p-2 flex flex-col items-center justify-center h-20 ${isToday ? "bg-blue-50 border-blue-400" : "border-gray-200"
                            }`}
                    >
                        <span className="text-sm font-semibold text-gray-600">{day}</span>
                        <div className="mt-1 flex space-x-1">
                            {moodIcons.length > 0 ? (
                                moodIcons
                            ) : (
                                <span className="text-gray-300">–</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="flex h-screen flex-row">
            <SideBar />
            <div className="w-screen p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h1>
                <p className="text-gray-600 mb-6">Selecciona cómo te sientes hoy.</p>

                {/* selección de moods */}
                <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
                    {moods.map((mood) => (
                        <button
                            key={mood.id}
                            onClick={() => handleSelectMood(mood.id)}
                            className={`flex flex-col items-center p-2 rounded-xl border hover:-translate-y-1 hover:scale-110 transition-all ${getMoodsForDate(new Date().toLocaleDateString("en-CA")).includes(
                                mood.id
                            )
                                ? "bg-violet-600 text-white"
                                : "bg-white text-gray-700"
                                }`}
                        >
                            {mood.icon}
                            <span className="mt-2 text-sm font-medium">{mood.label}</span>
                        </button>
                    ))}
                </div>

                {/* calendario */}
                <div className="bg-white shadow-md rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Historial emocional -{" "}
                        {today.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                    </h2>
                    {renderCalendar()}
                </div>
            </div>
        </div>
    );
}
