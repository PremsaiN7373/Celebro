import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { EXPERIENCES } from "./data";
import { IconArrowLeft, IconArrowRight, IconHeart } from "./icons";

export default function ExperienceSlider() {
  const reduce = !!useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 380) * dir;
    el.scrollBy({ left: amount, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-2">
            Handpicked Curations
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#17142A]">
            Experiences they'll never forget.
          </h2>
          <p className="text-[#6B6780] mt-2 max-w-md font-medium">
            Explore top-rated celebration packages designed by luxury event specialists.
          </p>
        </div>
        <div className="hidden sm:flex gap-3">
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Previous"
            className="grid place-items-center w-11 h-11 rounded-full border border-[#E9E4F5] bg-white text-[#17142A] hover:border-[#5B21B6] hover:text-[#5B21B6] transition-all shadow-xs active:scale-95"
          >
            <IconArrowLeft />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Next"
            className="grid place-items-center w-11 h-11 rounded-full border border-[#E9E4F5] bg-white text-[#17142A] hover:border-[#5B21B6] hover:text-[#5B21B6] transition-all shadow-xs active:scale-95"
          >
            <IconArrowRight />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-8 flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none px-6 max-w-[100vw] scroll-px-6 pb-6"
        style={{ scrollPaddingLeft: 24 }}
      >
        <div className="shrink-0 w-0 lg:w-[calc((100vw-80rem)/2)]" aria-hidden />
        {EXPERIENCES.map((exp, i) => (
          <motion.article
            key={exp.id}
            initial={{ opacity: 0, y: reduce ? 0 : 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: reduce ? 0 : (i % 3) * 0.08 }}
            className="group relative shrink-0 w-[82vw] sm:w-[360px] snap-start rounded-[16px] overflow-hidden border border-[#E9E4F5] bg-white hover:border-[#5B21B6] transition-all duration-500 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(91,33,182,0.06)]"
          >
            {/* Card Image Header */}
            <div className="relative h-60 overflow-hidden">
              <img
                src={exp.image}
                alt={exp.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17142A]/70 via-transparent to-transparent" />

              {/* Location Tag & Price Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="bg-white/90 backdrop-blur-md border border-[#E9E4F5] text-[#17142A] text-xs px-3 py-1 rounded-full font-bold shadow-xs">
                  📍 {exp.location}
                </span>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setSaved((s) => ({ ...s, [exp.id]: !s[exp.id] }))}
                  aria-label={saved[exp.id] ? "Remove from wishlist" : "Save to wishlist"}
                  className={`grid place-items-center w-9 h-9 rounded-full backdrop-blur-md border transition-all duration-300 ${
                    saved[exp.id]
                      ? "bg-[#C94B63] border-[#C94B63] text-white shadow-xs scale-105"
                      : "bg-white/80 border-[#E9E4F5] text-[#17142A] hover:bg-white"
                  }`}
                >
                  <IconHeart width={16} height={16} fill={saved[exp.id] ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                <span className="bg-[#5B21B6] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  Starts {exp.price}
                </span>
                <span className="bg-white/90 backdrop-blur-md text-[#D08A24] text-xs font-bold px-3 py-1 rounded-full border border-[#E9E4F5] shadow-xs">
                  ★ {exp.rating}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#5B21B6]">
                {exp.category}
              </span>
              <h3 className="font-display text-2xl font-bold text-[#17142A] mt-1 group-hover:text-[#5B21B6] transition-colors">
                {exp.title}
              </h3>
              <p className="text-sm text-[#6B6780] mt-2 leading-relaxed line-clamp-2 font-medium">{exp.blurb}</p>
              <div className="mt-5 pt-4 border-t border-[#E9E4F5] flex items-center justify-between">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#5B21B6] group/cta"
                >
                  <span>Plan This Celebration</span>
                  <IconArrowRight
                    width={16}
                    height={16}
                    className="text-[#5B21B6] transition-transform group-hover/cta:translate-x-1.5"
                  />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
        <div className="shrink-0 w-2" aria-hidden />
      </div>
    </div>
  );
}




