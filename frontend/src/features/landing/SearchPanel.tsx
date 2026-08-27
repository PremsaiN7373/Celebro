import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "./data";
import type { SceneVariant } from "./data";
import { IconSearch, IconPin, IconCalendar, IconUsers, IconWallet } from "./icons";

interface Props {
  activeId: SceneVariant;
  onActiveChange: (id: SceneVariant) => void;
}

const GUEST_OPTIONS = [
  { value: "", label: "Any Size" },
  { value: "1-10", label: "Up to 10 guests" },
  { value: "10-30", label: "10–30 guests" },
  { value: "30-75", label: "30–75 guests" },
  { value: "75+", label: "75+ guests" },
];

const BUDGET_OPTIONS = [
  { value: "", label: "Flexible" },
  { value: "budget", label: "Modest (< ₹50k)" },
  { value: "mid", label: "Comfortable (₹50k-₹2L)" },
  { value: "premium", label: "Luxury (₹2L+)" },
];

export default function SearchPanel({ activeId, onActiveChange }: Props) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");

  const [openDropdown, setOpenDropdown] = useState<"occasion" | "guests" | "budget" | null>(null);
  const panelRef = useRef<HTMLFormElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOpenDropdown(null);
    const params = new URLSearchParams({ celebrating: activeId });
    if (location) params.set("location", location);
    if (date) params.set("date", date);
    if (guests) params.set("guests", guests);
    if (budget) params.set("budget", budget);
    navigate(`/register?${params.toString()}`);
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === activeId) || CATEGORIES[0];
  const selectedGuests = GUEST_OPTIONS.find((g) => g.value === guests) || GUEST_OPTIONS[0];
  const selectedBudget = BUDGET_OPTIONS.find((b) => b.value === budget) || BUDGET_OPTIONS[0];

  return (
    <form
      ref={panelRef}
      onSubmit={submit}
      className="bg-white border border-[#E9E4F5] rounded-3xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(91,33,182,0.08)] hover:shadow-[0_16px_50px_rgba(91,33,182,0.12)] transition-all duration-300 space-y-3.5 relative z-30"
    >
      {/* Top Row: Occasion + Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Custom Occasion Dropdown */}
        <div className="relative">
          <div
            onClick={() => setOpenDropdown(openDropdown === "occasion" ? null : "occasion")}
            className={`flex flex-col bg-[#F5F3FF]/60 hover:bg-[#F5F3FF] border rounded-2xl px-4 py-3 transition-all cursor-pointer group select-none ${
              openDropdown === "occasion" ? "border-[#5B21B6] ring-2 ring-[#5B21B6]/15 bg-[#F5F3FF]" : "border-[#E9E4F5]"
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest text-[#5B21B6] font-bold mb-1">
              Celebrating Occasion
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-xl leading-none group-hover:scale-110 transition-transform shrink-0">
                  {selectedCategory.emoji}
                </span>
                <span className="text-sm font-bold text-[#17142A] truncate">
                  {selectedCategory.title}
                </span>
              </div>
              <span
                className={`text-xs text-[#6B6780] transition-transform duration-200 ${
                  openDropdown === "occasion" ? "rotate-180 text-[#5B21B6]" : ""
                }`}
              >
                ▼
              </span>
            </div>
          </div>

          {/* Occasion Floating Menu */}
          <AnimatePresence>
            {openDropdown === "occasion" && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-[#E9E4F5] rounded-2xl p-2 shadow-[0_20px_50px_rgba(91,33,182,0.22)] z-[100] max-h-64 overflow-y-auto space-y-1 scrollbar-none"
              >
                {CATEGORIES.map((c) => {
                  const isSelected = c.id === activeId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        onActiveChange(c.id);
                        setOpenDropdown(null);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#F5F3FF] text-[#5B21B6] font-bold"
                          : "text-[#17142A] hover:bg-[#F5F3FF]/70 hover:text-[#5B21B6]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg shrink-0">{c.emoji}</span>
                        <span className="text-sm font-semibold">{c.title}</span>
                      </div>
                      {isSelected && <span className="text-xs font-bold text-[#5B21B6]">✓</span>}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location Input */}
        <label className="flex flex-col bg-[#F5F3FF]/60 hover:bg-[#F5F3FF] border border-[#E9E4F5] focus-within:border-[#5B21B6] focus-within:ring-2 focus-within:ring-[#5B21B6]/15 rounded-2xl px-4 py-3 transition-all cursor-pointer group">
          <span className="text-[10px] uppercase tracking-widest text-[#6B6780] font-bold mb-1">
            City / Location
          </span>
          <div className="flex items-center gap-2 text-[#6B6780] group-hover:text-[#5B21B6] focus-within:text-[#5B21B6] transition-colors">
            <IconPin width={18} height={18} className="shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Chennai, Coimbatore, Bangalore"
              className="w-full bg-transparent text-sm text-[#17142A] font-bold placeholder:text-[#6B6780]/70 placeholder:font-normal outline-none border-0 p-0 focus:ring-0"
            />
          </div>
        </label>
      </div>

      {/* Bottom Row: Date, Guests, Budget & Search Button */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
        {/* Date */}
        <label className="relative flex flex-col bg-[#F5F3FF]/60 hover:bg-[#F5F3FF] border border-[#E9E4F5] focus-within:border-[#5B21B6] focus-within:ring-2 focus-within:ring-[#5B21B6]/15 rounded-2xl px-4 py-2.5 transition-all cursor-pointer group">
          <span className="text-[10px] uppercase tracking-widest text-[#6B6780] font-bold mb-1">
            Event Date
          </span>
          <div className="flex items-center gap-2 text-[#6B6780] group-hover:text-[#5B21B6] transition-colors relative">
            <IconCalendar width={16} height={16} className="shrink-0" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-[#17142A] font-bold outline-none border-0 p-0 focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </label>

        {/* Custom Guests Dropdown */}
        <div className="relative">
          <div
            onClick={() => setOpenDropdown(openDropdown === "guests" ? null : "guests")}
            className={`flex flex-col bg-[#F5F3FF]/60 hover:bg-[#F5F3FF] border rounded-2xl px-4 py-2.5 transition-all cursor-pointer group select-none ${
              openDropdown === "guests" ? "border-[#5B21B6] ring-2 ring-[#5B21B6]/15 bg-[#F5F3FF]" : "border-[#E9E4F5]"
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest text-[#6B6780] font-bold mb-1">
              Guest Count
            </span>
            <div className="flex items-center justify-between gap-1.5 text-[#6B6780] group-hover:text-[#5B21B6] transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <IconUsers width={16} height={16} className="shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-[#17142A] truncate">
                  {selectedGuests.label}
                </span>
              </div>
              <span className={`text-[10px] text-[#6B6780] transition-transform ${openDropdown === "guests" ? "rotate-180 text-[#5B21B6]" : ""}`}>
                ▼
              </span>
            </div>
          </div>

          <AnimatePresence>
            {openDropdown === "guests" && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-[#E9E4F5] rounded-2xl p-2 shadow-[0_20px_50px_rgba(91,33,182,0.22)] z-[100] space-y-1"
              >
                {GUEST_OPTIONS.map((g) => {
                  const isSelected = g.value === guests;
                  return (
                    <div
                      key={g.value}
                      onClick={() => {
                        setGuests(g.value);
                        setOpenDropdown(null);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl cursor-pointer text-xs sm:text-sm transition-colors ${
                        isSelected
                          ? "bg-[#F5F3FF] text-[#5B21B6] font-bold"
                          : "text-[#17142A] hover:bg-[#F5F3FF]/70 hover:text-[#5B21B6]"
                      }`}
                    >
                      <span className="font-semibold">{g.label}</span>
                      {isSelected && <span className="text-xs font-bold text-[#5B21B6]">✓</span>}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Budget Dropdown */}
        <div className="relative">
          <div
            onClick={() => setOpenDropdown(openDropdown === "budget" ? null : "budget")}
            className={`flex flex-col bg-[#F5F3FF]/60 hover:bg-[#F5F3FF] border rounded-2xl px-4 py-2.5 transition-all cursor-pointer group select-none ${
              openDropdown === "budget" ? "border-[#5B21B6] ring-2 ring-[#5B21B6]/15 bg-[#F5F3FF]" : "border-[#E9E4F5]"
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest text-[#6B6780] font-bold mb-1">
              Budget Tier
            </span>
            <div className="flex items-center justify-between gap-1.5 text-[#6B6780] group-hover:text-[#5B21B6] transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <IconWallet width={16} height={16} className="shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-[#17142A] truncate">
                  {selectedBudget.label}
                </span>
              </div>
              <span className={`text-[10px] text-[#6B6780] transition-transform ${openDropdown === "budget" ? "rotate-180 text-[#5B21B6]" : ""}`}>
                ▼
              </span>
            </div>
          </div>

          <AnimatePresence>
            {openDropdown === "budget" && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-[#E9E4F5] rounded-2xl p-2 shadow-[0_20px_50px_rgba(91,33,182,0.22)] z-[100] space-y-1"
              >
                {BUDGET_OPTIONS.map((b) => {
                  const isSelected = b.value === budget;
                  return (
                    <div
                      key={b.value}
                      onClick={() => {
                        setBudget(b.value);
                        setOpenDropdown(null);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl cursor-pointer text-xs sm:text-sm transition-colors ${
                        isSelected
                          ? "bg-[#F5F3FF] text-[#5B21B6] font-bold"
                          : "text-[#17142A] hover:bg-[#F5F3FF]/70 hover:text-[#5B21B6]"
                      }`}
                    >
                      <span className="font-semibold">{b.label}</span>
                      {isSelected && <span className="text-xs font-bold text-[#5B21B6]">✓</span>}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          className="col-span-1 sm:col-span-3 lg:col-span-1 w-full h-[48px] rounded-2xl bg-gradient-to-r from-[#5B21B6] to-[#8B5CF6] hover:from-[#4C1D95] hover:to-[#7C3AED] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(91,33,182,0.25)] hover:shadow-[0_6px_22px_rgba(91,33,182,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-200"
        >
          <IconSearch />
          <span>Find Planners</span>
        </button>
      </div>
    </form>
  );
}



