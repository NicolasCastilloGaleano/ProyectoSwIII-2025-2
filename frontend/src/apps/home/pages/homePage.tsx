import { CreateMoodModal } from "@/apps/moods/components";
import { moods } from "@/apps/moods/data/moods";
import { useState } from "react";
import useStore from "../../../store/useStore";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const { getMoodsForDate } = useStore((s) => s.moodsState);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const renderCalendar = () => (
    <div className="mt-6 grid grid-cols-7 gap-2 text-center">
      {["D", "L", "M", "M", "J", "V", "S"].map((d, index) => (
        <div key={index} className="text-sm font-semibold text-gray-500">
          {d}
        </div>
      ))}

      {Array.from({ length: firstDay }).map((_, i) => (
        <div key={`blank-${i}`} />
      ))}

      {daysArray.map((day) => {
        const date = new Date(year, month, day);
        const dateKey = date.toLocaleDateString("en-CA");
        const moodIds = getMoodsForDate(dateKey);
        const isToday = dateKey === new Date().toLocaleDateString("en-CA");

        const moodIcons = moodIds
          .map((id) => {
            const m = moods.find((mm) => mm.moodId === id);

            if (!m) return null;

            return (
              m.Icon && (
                <m.Icon key={`${dateKey}-${id}`} className={m.textColor} />
              )
            );
          })
          .filter(Boolean);

        return (
          <div
            key={day}
            className={`flex h-20 flex-col items-center justify-center rounded-xl border p-2 ${
              isToday ? "border-blue-400 bg-blue-50" : "border-gray-200"
            }`}
            onClick={() => isToday && setIsOpen(true)}
          >
            <span className="text-sm font-semibold text-gray-600">{day}</span>
            <div className="mt-1 flex space-x-1">
              {moodIcons.length > 0 ? (
                moodIcons
              ) : (
                <span className="text-gray-300">-</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-row">
      <div className="w-screen px-2 py-4 md:px-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Bienvenido</h1>
        <p className="mb-4 text-gray-600">Selecciona cómo te sientes hoy.</p>

        {/* calendario */}
        <div className="bg-white p-0 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            Historial emocional -{" "}
            {today.toLocaleString("es-ES", { month: "long", year: "numeric" })}
          </h2>
          {renderCalendar()}
        </div>

        {isOpen && (
          <CreateMoodModal onClose={() => setIsOpen(false)} open={isOpen} />
        )}
      </div>
    </div>
  );
}
