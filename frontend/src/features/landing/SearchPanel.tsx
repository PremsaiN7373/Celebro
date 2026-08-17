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
  "w-full bg-transparent text-sm text-[#17142A] font-bold placeholder:text-[#6B6780] outline-none border-0 p-0 focus:ring-0";

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
    <div className="bg-white border border-[#E9E4F5] rounded-3xl md:rounded-full p-2 shadow-[0_8px_30px_rgba(91,33,182,0.05)] hover:shadow-[0_12px_40px_rgba(91,33,182,0.08)] transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-0">
        {/* Celebrating */}
        <label className="flex-1 md:flex-[1.2] flex flex-col justify-center px-5 py-3 hover:bg-[#F5F3FF]/50 rounded-2xl md:rounded-l-full transition-colors cursor-pointer group">
          <span className="block text-[10px] uppercase tracking-widest text-[#5B21B6] font-bold mb-1">Celebrating</span>
          <div className="flex items-center gap-2.5">
            <span className="text-xl leading-none group-hover:scale-115 transition-transform duration-255">
              {CATEGORIES.find((c) => c.id === activeId)?.emoji}
            </span>
            <select
              value={activeId}
              onChange={(e) => onActiveChange(e.target.value as SceneVariant)}
              className={`${fieldClass} appearance-none cursor-pointer pr-4`}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-[#17142A]">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </label>

        {/* Divider 1 */}
        <div className="hidden md:block w-px h-8 bg-[#E9E4F5] self-center" />

        {/* Location */}
        <label className="flex-1 md:flex-[1.2] flex flex-col justify-center px-5 py-3 hover:bg-[#F5F3FF]/50 rounded-2xl transition-colors cursor-pointer group">
          <span className="block text-[10px] uppercase tracking-widest text-[#6B6780] font-bold mb-1">Location</span>
          <div className="flex items-center gap-2.5 text-[#6B6780] group-hover:text-[#5B21B6] transition-colors">
            <IconPin width={16} height={16} />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or area"
              className={fieldClass}
            />
          </div>
        </label>

        {/* Divider 2 */}
        <div className="hidden md:block w-px h-8 bg-[#E9E4F5] self-center" />

        {/* Date */}
        <label className="flex-1 md:flex-[1.1] flex flex-col justify-center px-5 py-3 hover:bg-[#F5F3FF]/50 rounded-2xl transition-colors cursor-pointer group">
          <span className="block text-[10px] uppercase tracking-widest text-[#6B6780] font-bold mb-1">Date</span>
          <div className="flex items-center gap-2.5 text-[#6B6780] group-hover:text-[#5B21B6] transition-colors">
            <IconCalendar width={16} height={16} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${fieldClass} cursor-pointer`}
            />
          </div>
        </label>

        {/* Divider 3 */}
        <div className="hidden md:block w-px h-8 bg-[#E9E4F5] self-center" />

        {/* Guests */}
        <label className="flex-1 md:flex-[0.9] flex flex-col justify-center px-5 py-3 hover:bg-[#F5F3FF]/50 rounded-2xl transition-colors cursor-pointer group">
          <span className="block text-[10px] uppercase tracking-widest text-[#6B6780] font-bold mb-1">Guests</span>
          <div className="flex items-center gap-2.5 text-[#6B6780] group-hover:text-[#5B21B6] transition-colors">
            <IconUsers width={16} height={16} />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className={`${fieldClass} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-white">Any</option>
              <option value="1-10" className="bg-white">Up to 10</option>
              <option value="10-30" className="bg-white">10–30</option>
              <option value="30-75" className="bg-white">30–75</option>
              <option value="75+" className="bg-white">75+</option>
            </select>
          </div>
        </label>

        {/* Divider 4 */}
        <div className="hidden md:block w-px h-8 bg-[#E9E4F5] self-center" />

        {/* Budget */}
        <label className="flex-1 md:flex-[0.9] flex flex-col justify-center px-5 py-3 hover:bg-[#F5F3FF]/50 rounded-2xl transition-colors cursor-pointer group">
          <span className="block text-[10px] uppercase tracking-widest text-[#6B6780] font-bold mb-1">Budget</span>
          <div className="flex items-center gap-2.5 text-[#6B6780] group-hover:text-[#5B21B6] transition-colors">
            <IconWallet width={16} height={16} />
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`${fieldClass} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-white">Any</option>
              <option value="budget" className="bg-white">Modest</option>
              <option value="mid" className="bg-white">Comfortable</option>
              <option value="premium" className="bg-white">Premium</option>
            </select>
          </div>
        </label>

        {/* Submit Button */}
        <div className="px-2 py-1 flex items-center justify-end shrink-0">
          <button
            onClick={submit}
            aria-label="Find my celebration"
            className="w-full md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(91,33,182,0.3)] hover:shadow-[0_6px_20px_rgba(91,33,182,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <IconSearch />
          </button>
        </div>
      </div>
    </div>
  );
}



