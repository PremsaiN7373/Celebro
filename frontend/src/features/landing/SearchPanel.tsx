import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "./data";
import type { SceneVariant } from "./data";
import { IconSearch, IconPin, IconCalendar, IconUsers, IconWallet } from "./icons";

interface Props {
  activeId: SceneVariant;
  onActiveChange: (id: SceneVariant) => void;
}

const fieldClass =
  "w-full bg-transparent text-sm text-[#17142A] font-semibold placeholder:text-[#6B6780] outline-none";

export default function SearchPanel({ activeId, onActiveChange }: Props) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");

  const submit = () => {
    const params = new URLSearchParams({ celebrating: activeId });
    if (location) params.set("location", location);
    if (date) params.set("date", date);
    if (guests) params.set("guests", guests);
    if (budget) params.set("budget", budget);
    navigate(`/register?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-2.5 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-1.5">
        {/* Celebrating */}
        <label className="md:col-span-1 rounded-[12px] bg-[#F5F3FF] px-4 py-3 hover:bg-white transition-colors cursor-pointer border border-[#E9E4F5]">
          <span className="block text-[10px] uppercase tracking-wider text-[#5B21B6] font-bold mb-1">Celebrating</span>
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">{CATEGORIES.find((c) => c.id === activeId)?.emoji}</span>
            <select
              value={activeId}
              onChange={(e) => onActiveChange(e.target.value as SceneVariant)}
              className={`${fieldClass} appearance-none cursor-pointer`}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-[#17142A]">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </label>

        {/* Location */}
        <label className="rounded-[12px] bg-[#F5F3FF] px-4 py-3 hover:bg-white transition-colors border border-[#E9E4F5]">
          <span className="block text-[10px] uppercase tracking-wider text-[#6B6780] font-bold mb-1">Location</span>
          <div className="flex items-center gap-2 text-[#6B6780]">
            <IconPin width={15} height={15} />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or area" className={fieldClass} />
          </div>
        </label>

        {/* Date */}
        <label className="rounded-[12px] bg-[#F5F3FF] px-4 py-3 hover:bg-white transition-colors border border-[#E9E4F5]">
          <span className="block text-[10px] uppercase tracking-wider text-[#6B6780] font-bold mb-1">Date</span>
          <div className="flex items-center gap-2 text-[#6B6780]">
            <IconCalendar width={15} height={15} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
          </div>
        </label>

        {/* Guests */}
        <label className="rounded-[12px] bg-[#F5F3FF] px-4 py-3 hover:bg-white transition-colors border border-[#E9E4F5]">
          <span className="block text-[10px] uppercase tracking-wider text-[#6B6780] font-bold mb-1">Guests</span>
          <div className="flex items-center gap-2 text-[#6B6780]">
            <IconUsers width={15} height={15} />
            <select value={guests} onChange={(e) => setGuests(e.target.value)} className={`${fieldClass} appearance-none cursor-pointer`}>
              <option value="" className="bg-white">Any</option>
              <option value="1-10" className="bg-white">Up to 10</option>
              <option value="10-30" className="bg-white">10–30</option>
              <option value="30-75" className="bg-white">30–75</option>
              <option value="75+" className="bg-white">75+</option>
            </select>
          </div>
        </label>

        {/* Budget + submit */}
        <div className="flex gap-1.5">
          <label className="flex-1 rounded-[12px] bg-[#F5F3FF] px-4 py-3 hover:bg-white transition-colors border border-[#E9E4F5]">
            <span className="block text-[10px] uppercase tracking-wider text-[#6B6780] font-bold mb-1">Budget</span>
            <div className="flex items-center gap-2 text-[#6B6780]">
              <IconWallet width={15} height={15} />
              <select value={budget} onChange={(e) => setBudget(e.target.value)} className={`${fieldClass} appearance-none cursor-pointer`}>
                <option value="" className="bg-white">Any</option>
                <option value="budget" className="bg-white">Modest</option>
                <option value="mid" className="bg-white">Comfortable</option>
                <option value="premium" className="bg-white">Premium</option>
              </select>
            </div>
          </label>
          <button
            onClick={submit}
            aria-label="Find my celebration"
            className="shrink-0 grid place-items-center w-14 md:w-14 rounded-[12px] btn-primary shadow-xs active:scale-95 transition-all"
          >
            <IconSearch />
          </button>
        </div>
      </div>
    </div>
  );
}



