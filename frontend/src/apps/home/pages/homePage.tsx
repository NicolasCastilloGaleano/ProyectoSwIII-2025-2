import { moods } from "../data/moods";
import { SideBar } from "../components/sideBar";
import useStore from "../../../store/useStore"; // el store global que integra moodsSlice

export default function HomePage() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // obtenemos los métodos del store global
    const { addMoodForToday, getMoodsForDate, moodHistory } = useStore();

    // cálculo del calendario
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleSelectMood = (moodId: string) => {
        addMoodForToday(moodId);
    };

    const renderCalendar = () => (
        <div className="grid grid-cols-7 gap-2 text-center mt-6">
            {["D", "L", "M", "M", "J", "V", "S"].map((d) => (
                <div key={d} className="font-semibold text-sm text-gray-500">
                    {d}
                </div>
            ))}

            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} />
            ))}

            {/* Días del mes */}
            {daysArray.map((day) => {
                const date = new Date(year, month, day);
                const dateKey = date.toLocaleDateString("en-CA");
                const moodIds = getMoodsForDate(dateKey);

                // obtener íconos de esos moods
                const moodIcons = moodIds.map((id) => moods.find((m) => m.id === id)?.icon);

                // restricción: solo día actual es seleccionable
                const isToday = dateKey === today.toLocaleDateString("en-CA");
                const isPastOrFuture = date < new Date(today.setHours(0, 0, 0, 0)) || date > new Date();

                return (
                    <div
                        key={day}
                        className={`border rounded-xl p-2 flex flex-col items-center justify-center h-20 ${isToday ? "bg-blue-50 border-blue-400" : "border-gray-200"
                            }`}
                    >
                        <span className="text-sm font-semibold text-gray-600">{day}</span>
                        <div className="mt-1 flex space-x-1">
                            {moodIcons.length > 0
                                ? moodIcons
                                : <span className="text-gray-300">–</span>}
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
                <p className="text-gray-600 mb-6">
                    Selecciona cómo te sientes hoy.
                </p>

                {/* Selección de moods */}
                <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
                    {moods.map((mood) => (
                        <button
                            key={mood.id}
                            onClick={() => handleSelectMood(mood.id)}
                            className="flex flex-col items-center p-2  rounded-xl border hover:-translate-y-1 hover:scale-110 transition-all"
                        >
                            {mood.icon}
                            <span className="mt-2 text-sm font-medium text-gray-700">
                                {mood.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Calendario */}
                <div className="bg-white shadow-md rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Historial emocional - {today.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                    </h2>
                    {renderCalendar()}
                </div>
            </div>
        </div>
    );
}
