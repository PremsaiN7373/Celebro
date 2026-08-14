import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNav from "../LandingNav";
import { EXPERIENCES } from "../data";
import type { Experience } from "../data";

export default function ExperiencesPage() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  const filtered = EXPERIENCES.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase()) || exp.blurb.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "all" || exp.location.includes(cityFilter);
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#17142A] font-sans">
      <LandingNav />

      {/* Header Banner */}
      <section className="pt-36 pb-16 bg-[#3B176D] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-[#EDE9FE] mb-3"
          >
            Curated Handpicked Packages
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-bold leading-tight"
          >
            Handpicked Experiences
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#EDE9FE]/90 mt-4 max-w-2xl mx-auto font-medium"
          >
            From rooftop birthday galas to private candlelight suite surprises — browse complete packages designed by top planners.
          </motion.p>
        </div>
      </section>

      {/* Search & Filter Control Bar */}
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[260px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiences (e.g. Candlelight, Rooftop, Proposal...)"
              className="w-full bg-[#F5F3FF] border border-[#E9E4F5] rounded-[10px] px-4 py-2.5 text-sm text-[#17142A] outline-none focus:border-[#5B21B6] font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6780]">Filter City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-[#F5F3FF] border border-[#E9E4F5] rounded-[10px] px-4 py-2.5 text-xs text-[#17142A] font-bold outline-none cursor-pointer"
            >
              <option value="all">All Cities</option>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Miami">Miami</option>
              <option value="Chicago">Chicago</option>
              <option value="Dallas">Dallas</option>
              <option value="San Francisco">San Francisco</option>
            </select>
          </div>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="py-8 pb-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((exp) => (
            <motion.div
              key={exp.id}
              whileHover={{ y: -6 }}
              className="bg-white border border-[#E9E4F5] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(91,33,182,0.06)] flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                  📍 {exp.location}
                </div>
                <div className="absolute top-3 right-3 bg-[#5B21B6] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Starts at {exp.price}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#5B21B6]">{exp.category}</span>
                    <span className="text-xs font-bold text-[#17142A]">⭐ {exp.rating}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#17142A] leading-snug">{exp.title}</h3>
                  <p className="text-xs text-[#6B6780] mt-2 leading-relaxed font-medium">{exp.blurb}</p>
                </div>

                <div className="pt-4 border-t border-[#E9E4F5] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedExp(exp)}
                    className="text-xs font-bold text-[#5B21B6] hover:underline"
                  >
                    View Details
                  </button>
                  <Link
                    to={`/register?exp=${exp.id}`}
                    className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold px-4 py-2 rounded-[8px] shadow-sm transition-all"
                  >
                    Book Experience
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Experience Details Modal */}
      {selectedExp && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedExp(null)}>
          <div className="bg-white border border-[#E9E4F5] rounded-[20px] max-w-lg w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-[#17142A]">{selectedExp.title}</h3>
              <button onClick={() => setSelectedExp(null)} className="text-[#6B6780] hover:text-[#17142A] font-bold">✕</button>
            </div>
            <img src={selectedExp.image} alt={selectedExp.title} className="w-full h-48 object-cover rounded-[12px]" />
            <p className="text-sm text-[#6B6780] leading-relaxed font-medium">{selectedExp.blurb}</p>
            <div className="flex items-center justify-between pt-4 border-t border-[#E9E4F5]">
              <span className="text-sm font-bold text-[#5B21B6]">Price: {selectedExp.price}</span>
              <Link
                to={`/register?exp=${selectedExp.id}`}
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-5 py-2.5 rounded-[10px]"
              >
                Proceed to Book
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#E9E4F5] py-8 text-center text-xs text-[#6B6780] font-medium">
        © {new Date().getFullYear()} Celebro Inc. All rights reserved. • Plan. Connect. Celebrate.
      </footer>
    </div>
  );
}
