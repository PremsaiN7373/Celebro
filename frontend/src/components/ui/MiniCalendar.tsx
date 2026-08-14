import { useState } from "react";

interface MiniCalendarProps {
  highlightDates: string[]; // ISO date strings "YYYY-MM-DD"
  blockedDates?: string[];
  onDateClick?: (dateKey: string) => void;
  highlightColor?: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniCalendar({
  highlightDates,
  blockedDates = [],
  onDateClick,
  highlightColor = "bg-[#5B21B6]",
}: MiniCalendarProps) {
  const [cursor, setCursor] = useState(new Date());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const highlightSet = new Set(highlightDates);
  const blockedSet = new Set(blockedDates);

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
    <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="text-[#6B6780] hover:text-[#5B21B6] text-base p-1 font-bold transition-colors"
        >
          ‹
        </button>
        <p className="font-display text-sm font-bold text-[#17142A]">{monthLabel}</p>
        <button
          onClick={() => changeMonth(1)}
          className="text-[#6B6780] hover:text-[#5B21B6] text-base p-1 font-bold transition-colors"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-[11px] text-[#6B6780] font-bold pb-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isEvent = highlightSet.has(key);
          const isBlocked = blockedSet.has(key);
          const isToday = key === todayKey;

          const cellClasses = isBlocked
            ? "bg-[#C94B63] text-white font-bold"
            : isEvent
            ? `${highlightColor} text-white font-bold shadow-xs`
            : isToday
            ? "border border-[#5B21B6] text-[#5B21B6] font-bold bg-[#F5F3FF]"
            : "text-[#17142A] hover:bg-[#F5F3FF]";

          return (
            <button
              key={i}
              type="button"
              disabled={!onDateClick}
              onClick={() => onDateClick?.(key)}
              className={`text-xs w-7 h-7 mx-auto flex items-center justify-center rounded-full transition-all ${cellClasses} ${
                onDateClick ? "cursor-pointer hover:scale-110" : ""
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

