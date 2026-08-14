import { useState } from "react";

interface MiniCalendarProps {
  highlightDates: string[]; // ISO date strings "YYYY-MM-DD"
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniCalendar({ highlightDates }: MiniCalendarProps) {
  const [cursor, setCursor] = useState(new Date());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const highlightSet = new Set(highlightDates);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const todayKey = new Date().toISOString().slice(0, 10);

  const changeMonth = (delta: number) => {
    setCursor(new Date(year, month + delta, 1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => changeMonth(-1)}
          className="text-ink-400 hover:text-ink-800 dark:hover:text-white text-sm px-1"
        >
          ‹
        </button>
        <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{monthLabel}</p>
        <button
          onClick={() => changeMonth(1)}
          className="text-ink-400 hover:text-ink-800 dark:hover:text-white text-sm px-1"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-[10px] text-ink-300 dark:text-ink-600 font-medium">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isEvent = highlightSet.has(key);
          const isToday = key === todayKey;
          return (
            <div
              key={i}
              className={`text-[11px] w-6 h-6 mx-auto flex items-center justify-center rounded-full ${
                isEvent
                  ? "bg-accent-500 text-white font-semibold"
                  : isToday
                  ? "border border-ink-400 text-ink-800 dark:text-ink-100"
                  : "text-ink-500 dark:text-ink-400"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
