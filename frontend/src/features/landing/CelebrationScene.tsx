import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { SceneVariant } from "./data";
import { CATEGORIES } from "./data";

interface Props {
  variant: SceneVariant;
  decorated?: boolean;
  className?: string;
}

export default function CelebrationScene({ variant, decorated = true, className = "" }: Props) {
  const reduce = !!useReducedMotion();
  const currentCategory = CATEGORIES.find((c) => c.id === variant) || CATEGORIES[0];
  const imageSrc = currentCategory.image || `/images/birthday_hero.png`;

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-3xl group ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={variant}
          initial={{ opacity: 0, scale: reduce ? 1 : 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Main Cinematic Image */}
          <img
            src={imageSrc}
            alt={currentCategory.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Vignette & Ambient Glow Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/70 via-transparent to-noir/70 opacity-60" />

          {/* Dynamic Category Color Tint */}
          <div
            className="absolute inset-0 opacity-25 mix-blend-color-dodge transition-all duration-700"
            style={{ backgroundColor: currentCategory.glow }}
          />

          {/* Decorative Corner Light Leak */}
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-40"
            style={{ backgroundColor: currentCategory.glow }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating Glass Badges */}
      {decorated && (
        <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-wrap items-center justify-between gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3"
          >
            <span className="text-xl">{currentCategory.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-white tracking-wide">{currentCategory.title}</p>
              <p className="text-[11px] text-white/70">{currentCategory.tagline}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-noir/70 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-2 shadow-2xl flex items-center gap-2"
          >
            <span className="text-champagne-400 font-bold text-xs">★ {currentCategory.rating}</span>
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/80 text-xs font-medium">Starts at {currentCategory.startingPrice}</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
