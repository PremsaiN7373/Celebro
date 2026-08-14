import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNav from "../LandingNav";
import CelebrationScene from "../CelebrationScene";
import CategoryCard from "../CategoryCard";
import { CATEGORIES } from "../data";
import type { SceneVariant } from "../data";
import { IconArrowRight } from "../icons";

export default function CelebrationsPage() {
  const [activeId, setActiveId] = useState<SceneVariant>(CATEGORIES[0].id);
  const current = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];

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
            Curated Milestone Catalog
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-bold leading-tight"
          >
            Every Celebration Tells A Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#EDE9FE]/90 mt-4 max-w-2xl mx-auto font-medium"
          >
            Explore handcrafted themes, luxury decor setups, floral arrangements, and dining experiences tailored to your special occasion.
          </motion.p>
        </div>
      </section>

      {/* Interactive Showcase Section */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          {/* Big Dynamic Card */}
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-[2rem] overflow-hidden border border-[#E9E4F5] bg-white shadow-xl aspect-[4/3]"
          >
            <CelebrationScene variant={current.id} className="w-full h-full" />
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#3B176D] via-[#3B176D]/80 to-transparent text-white">
              <span className="text-4xl">{current.emoji}</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 text-white">{current.title}</h2>
              <p className="text-white/80 mt-2 text-sm sm:text-base leading-relaxed font-medium">{current.description}</p>
              <div className="flex items-center gap-4 mt-6">
                <Link
                  to={`/register?celebrating=${current.id}`}
                  className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-sm px-6 py-3 rounded-[10px] shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                >
                  Plan This Celebration <IconArrowRight width={16} height={16} />
                </Link>
                <span className="text-xs text-white/80 font-bold bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20">
                  Starts at {current.startingPrice}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Selectable Categories Grid */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-[#17142A]">Select An Occasion Category</h3>
            <p className="text-sm text-[#6B6780] font-medium">Click any celebration below to preview setups, pricing, and themes.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
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

      {/* Package Features Comparison */}
      <section className="py-20 bg-white border-t border-[#E9E4F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">What Every Celebration Includes</h2>
            <p className="text-sm text-[#6B6780] mt-2 font-medium">All Celebro packages are backed by full service coordination and client protection.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[20px] bg-[#F5F3FF] border border-[#E9E4F5] space-y-4">
              <span className="text-3xl">💐</span>
              <h3 className="font-display text-xl font-bold text-[#17142A]">Custom Styling & Florals</h3>
              <p className="text-sm text-[#6B6780] leading-relaxed font-medium">Fresh luxury blooms, balloon arches, candles, and bespoke table settings customized to your color palette.</p>
            </div>

            <div className="p-8 rounded-[20px] bg-[#F5F3FF] border border-[#E9E4F5] space-y-4">
              <span className="text-3xl">🥂</span>
              <h3 className="font-display text-xl font-bold text-[#17142A]">Fine Dining & Hospitality</h3>
              <p className="text-sm text-[#6B6780] leading-relaxed font-medium">Private chef tasting menus, sommelier wine pairings, champagne toasts, and custom milestone birthday cakes.</p>
            </div>

            <div className="p-8 rounded-[20px] bg-[#F5F3FF] border border-[#E9E4F5] space-y-4">
              <span className="text-3xl">🎻</span>
              <h3 className="font-display text-xl font-bold text-[#17142A]">Atmosphere & Entertainment</h3>
              <p className="text-sm text-[#6B6780] leading-relaxed font-medium">Violinists, live acoustic guitarists, DJs, ambient warm lighting, sparkler fountains, and professional photography.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E9E4F5] py-8 text-center text-xs text-[#6B6780] font-medium">
        © {new Date().getFullYear()} Celebro Inc. All rights reserved. • Plan. Connect. Celebrate.
      </footer>
    </div>
  );
}
