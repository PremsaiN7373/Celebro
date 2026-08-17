import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import LoadingScreen from "./LoadingScreen";
import LandingNav from "./LandingNav";
import CinematicBackground from "./CinematicBackground";
import CelebrationScene from "./CelebrationScene";
import SearchPanel from "./SearchPanel";
import CategoryCard from "./CategoryCard";
import ExperienceSlider from "./ExperienceSlider";
import BeforeAfter from "./BeforeAfter";
import TimelineSection from "./TimelineSection";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import VideoStorySection from "./VideoStorySection";
import Gallery from "./Gallery";
import { CATEGORIES, TRUST_POINTS, fadeUp } from "./data";
import type { SceneVariant } from "./data";
import { TRUST_ICON, IconArrowRight } from "./icons";

const HERO_CHIPS = ["🎉 Verified Planners", "🔒 Milestone Security", "💬 Real-time Chat", "✨ Custom Experiences"];

export default function LandingPage() {
  const reduce = !!useReducedMotion();
  const [activeId, setActiveId] = useState<SceneVariant>(CATEGORIES[0].id);
  const current = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.06]);

  const rise = fadeUp(reduce);

  return (
    <div id="top" className="min-h-screen bg-[#FCFAFF] text-[#17142A] font-sans overflow-x-hidden">
      <LoadingScreen />
      <LandingNav />

      {/* ============================ HERO ============================ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-28 pb-20">
        <CinematicBackground tint={current.glow} />
        <div className="relative max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          {/* Left Column: Copy + Search */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-4"
            >
              Luxury Celebration & Event Marketplace
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] text-[#17142A]"
            >
              Plan. Connect.
              <br />
              <span className="text-[#5B21B6]">
                Celebrate.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-[#6B6780] mt-6 max-w-xl leading-relaxed font-medium"
            >
              Discover trusted event planners and manage every detail of your celebration in one beautiful place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-9"
            >
              <SearchPanel activeId={activeId} onActiveChange={setActiveId} />
            </motion.div>

            <div className="flex flex-wrap gap-3 mt-8">
              {HERO_CHIPS.map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                  className="bg-white border border-[#E9E4F5] backdrop-blur-md rounded-full px-4 py-2 text-xs font-semibold text-[#17142A] shadow-xs"
                >
                  {label}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Scene Card */}
          <motion.div
            style={{ y: sceneY }}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-[2rem] overflow-hidden border border-[#E9E4F5] bg-white shadow-[0_4px_20px_rgba(91,33,182,0.08)] aspect-[4/3]">
              <motion.div style={{ scale: sceneScale }} className="w-full h-full">
                <CelebrationScene variant={activeId} className="w-full h-full" decorated={false} />
              </motion.div>
            </div>

            <motion.div
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 top-10 bg-white/95 border border-[#E9E4F5] backdrop-blur-xl rounded-[12px] px-5 py-3.5 shadow-md z-20"
            >
              <p className="text-[11px] uppercase tracking-wider text-[#5B21B6] font-bold">Selected Experience</p>
              <p className="font-display text-lg text-[#17142A] font-bold">{current.emoji} {current.title}</p>
            </motion.div>

            <motion.div
              animate={reduce ? undefined : { y: [0, 10, 0] }}
              transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 bottom-12 bg-white/95 border border-[#E9E4F5] backdrop-blur-xl rounded-[12px] px-5 py-3.5 shadow-md z-20"
            >
              <p className="text-[11px] uppercase tracking-wider text-[#5B21B6] font-bold">Rating & Satisfaction</p>
              <p className="font-display text-lg text-[#17142A] font-bold">⭐ {current.rating} / 5.0 Rating</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ======================= STATS COUNTER ======================= */}
      <StatsSection />

      {/* ======================= CATEGORY SHOWCASE ======================= */}
      <section id="celebrations" className="relative py-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
            <p className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-2">
              Curated Occasions
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold max-w-xl text-[#17142A]">
              Every Celebration Tells A Story.
            </h2>
          </motion.div>

          <div className="mt-12 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
            {/* Big dynamic scene panel */}
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="relative rounded-[16px] overflow-hidden border border-[#E9E4F5] bg-white shadow-md aspect-[4/3]"
            >
              <CelebrationScene variant={current.id} className="w-full h-full" decorated={false} />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#3B176D] via-[#3B176D]/80 to-transparent text-white">
                <span className="text-4xl">{current.emoji}</span>
                <h3 className="font-display text-3xl font-bold mt-2 text-white">{current.title}</h3>
                <p className="text-white/80 mt-2 max-w-md text-sm leading-relaxed font-medium">{current.description}</p>
                <Link
                  to="/register"
                  className="mt-5 inline-flex items-center gap-2 btn-primary font-bold px-6 py-3 rounded-[10px] shadow-xs"
                >
                  Plan This Celebration <IconArrowRight width={16} height={16} />
                </Link>
              </div>
            </motion.div>

            {/* Selectable category cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  active={activeId === cat.id}
                  onSelect={() => setActiveId(cat.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================= EXPERIENCES SLIDER ======================= */}
      <section id="experiences" className="relative py-28 bg-white border-y border-[#E9E4F5]">
        <ExperienceSlider />
      </section>

      {/* ========================= BEFORE / AFTER ========================= */}
      <section className="relative py-28">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
            <p className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-2">
              The Transformation
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-[#17142A]">
              From Blank Space To Unforgettable.
            </h2>
            <p className="text-[#6B6780] mt-3 max-w-md text-base leading-relaxed font-medium">
              Drag the interactive handle to reveal how our luxury event stylists transform standard rooms into magical celebration worlds.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              {CATEGORIES.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`text-xs font-bold px-4 py-2.5 rounded-full border transition-all ${
                    activeId === c.id
                      ? "bg-[#5B21B6] border-transparent text-white shadow-xs"
                      : "border-[#E9E4F5] bg-white text-[#17142A] hover:border-[#5B21B6]"
                  }`}
                >
                  {c.emoji} {c.title}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
            <BeforeAfter variant={activeId} />
          </motion.div>
        </div>
      </section>

      {/* =========================== HOW IT WORKS =========================== */}
      <TimelineSection />

      {/* ========================= VIDEO STORY ========================= */}
      <VideoStorySection />

      {/* ============================== GALLERY ============================== */}
      <section id="gallery" className="relative py-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-2">Celebration Lookbook</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#17142A]">
              Set The Scene For Every Moment.
            </h2>
            <p className="text-[#6B6780] mt-2 text-base font-medium">
              Browse real celebration portfolios crafted by our elite network of event designers.
            </p>
          </motion.div>
          <Gallery />
        </div>
      </section>

      {/* ========================= TESTIMONIALS ========================= */}
      <TestimonialsSection />

      {/* ============================ TRUST / WHY ============================ */}
      <section className="relative py-28 bg-white border-y border-[#E9E4F5]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-2">Why Celebro</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#17142A]">Built For Lifelong Memories.</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_POINTS.map((point, i) => {
              const Icon = TRUST_ICON[point.icon];
              return (
                <motion.div
                  key={point.title}
                  custom={i}
                  variants={rise}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="bg-white border border-[#E9E4F5] rounded-[16px] p-7 hover:border-[#5B21B6] hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(91,33,182,0.06)]"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-[10px] bg-[#F5F3FF] text-[#5B21B6] border border-[#E9E4F5] font-bold">
                    {Icon ? <Icon /> : null}
                  </span>
                  <h3 className="font-display text-xl font-bold mt-5 text-[#17142A]">{point.title}</h3>
                  <p className="text-sm text-[#6B6780] mt-2 leading-relaxed font-medium">{point.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================= FINAL CTA ============================= */}
      <section className="relative py-32 overflow-hidden bg-[#3B176D] text-white">
        <div className="relative max-w-4xl mx-auto px-6 text-center z-10 text-white">
          <motion.h2 variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }} className="font-display text-4xl sm:text-6xl font-bold leading-tight">
            Your perfect celebration is closer than you think.
          </motion.h2>
          <motion.p variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-xl text-[#EDE9FE] mt-4 max-w-2xl mx-auto font-medium">
            Plan it beautifully with Celebro.
          </motion.p>
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap justify-center gap-5 mt-10">
            <Link to="/register" className="bg-[#5B21B6] text-white font-bold px-8 py-4 rounded-[10px] hover:bg-[#4C1D95] transition-all shadow-lg hover:scale-105">
              Start Planning
            </Link>
            <Link to="/marketplace" className="bg-white/10 border border-white/20 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-[10px] hover:bg-white/20 transition-all">
              Explore Planners
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <LandingFooter />
    </div>
  );
}

function LandingFooter() {
  const cols: { title: string; links: string[] }[] = [
    { title: "Celebrations", links: CATEGORIES.map((c) => c.title) },
    { title: "Company", links: ["About Us", "How It Works", "Verified Partners", "Careers"] },
    { title: "Support", links: ["Help Center", "Planner Portal", "Trust & Safety", "Terms of Service", "Privacy Policy"] },
  ];
  return (
    <footer className="relative bg-white border-t border-[#E9E4F5]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-block">
            <img src="/images/celebro_logo.png" alt="Celebro" className="h-24 sm:h-28 w-auto object-contain" />
          </Link>
          <p className="text-sm text-[#6B6780] mt-3 max-w-xs leading-relaxed font-medium">
            Plan. Connect. Celebrate. The ultimate luxury marketplace connecting dreamers with master event specialists.
          </p>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-[#6B6780] font-bold mb-3">Stay Inspired</p>
            <div className="flex gap-2 max-w-xs">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 bg-[#F5F3FF] border border-[#E9E4F5] rounded-[10px] px-4 py-3 text-sm text-[#17142A] placeholder:text-[#6B6780] outline-none focus:border-[#5B21B6] font-medium"
              />
              <Link to="/register" className="btn-primary text-sm font-semibold px-5 py-3 rounded-[10px] shadow-xs">
                Join
              </Link>
            </div>
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-xs uppercase tracking-widest text-[#6B6780] font-bold mb-4">{col.title}</p>
            <div className="flex flex-col gap-2.5 text-sm text-[#6B6780] font-medium">
              {col.links.map((l) => (
                <span key={l} className="hover:text-[#5B21B6] transition-colors cursor-pointer">{l}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-8 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B6780] border-t border-[#E9E4F5] pt-6 font-medium">
        <span>© {new Date().getFullYear()} Celebro Inc. All rights reserved.</span>
        <div className="flex gap-6">
          <span className="hover:text-[#5B21B6] cursor-pointer">Instagram</span>
          <span className="hover:text-[#5B21B6] cursor-pointer">Pinterest</span>
          <span className="hover:text-[#5B21B6] cursor-pointer">Twitter / X</span>
          <span className="hover:text-[#5B21B6] cursor-pointer">LinkedIn</span>
        </div>
      </div>
    </footer>
  );
}
