import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CalendarWidget({ scheduledDates = [] }) {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const monthName = current.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const hasActivity = (day) => {
    const d = new Date(year, month, day).toISOString().split("T")[0];
    return scheduledDates.includes(d);
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrent(new Date(year, month - 1))}
            className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <span className="text-xs font-semibold text-gray-600">{monthName}</span>
          <button
            onClick={() => setCurrent(new Date(year, month + 1))}
            className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array(adjustedFirstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          const active = hasActivity(day);

          return (
            <div
              key={day}
              className={`text-center py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isToday
                  ? "bg-primary-600 text-white font-bold"
                  : active
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-500 hover:bg-surface-100"
              }`}
            >
              {day}
              {active && !isToday && (
                <div className="w-1 h-1 bg-primary-400 rounded-full mx-auto mt-0.5"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}