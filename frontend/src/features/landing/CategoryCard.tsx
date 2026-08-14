import { motion } from "framer-motion";
import type { Category } from "./data";

// Re-export so any existing import of CATEGORIES from this module keeps working.
export { CATEGORIES } from "./data";
export type { Category } from "./data";

interface Props {
  category: Category;
  active: boolean;
  onSelect: () => void;
}

export default function CategoryCard({ category, active, onSelect }: Props) {
  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={onSelect}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      aria-pressed={active}
      className={`relative text-left rounded-2xl p-5 border transition-all duration-300 overflow-hidden ${
        active
          ? "border-transparent ring-2 ring-champagne-400 shadow-[0_20px_50px_-20px_rgba(245,158,11,0.5)]"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${category.gradient} transition-opacity duration-300 ${
          active ? "opacity-25" : "opacity-[0.08]"
        }`}
      />
      <div className="relative">
        <span className="text-3xl">{category.emoji}</span>
        <h3 className="font-cinematic text-lg text-white font-semibold mt-3">{category.title}</h3>
        <p className="text-xs text-white/60 mt-0.5">{category.tagline}</p>
      </div>
    </motion.button>
  );
}
