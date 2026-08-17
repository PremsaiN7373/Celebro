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
          ? "border-transparent ring-2 ring-[#8B5CF6] shadow-[0_10px_25px_-5px_rgba(91,33,182,0.3)]"
          : "border-[#E9E4F5] dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[#8B5CF6]/50 dark:hover:border-white/20 shadow-[0_4px_20px_rgba(91,33,182,0.02)]"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${category.gradient} transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-[0.08] dark:opacity-[0.12]"
        }`}
      />
      <div className="relative z-10">
        <span className="text-3xl">{category.emoji}</span>
        <h3 className={`font-cinematic text-lg font-semibold mt-3 transition-colors ${
          active ? "text-white" : "text-[#17142A] dark:text-white"
        }`}>
          {category.title}
        </h3>
        <p className={`text-xs mt-0.5 transition-colors ${
          active ? "text-white/80" : "text-[#6B6780] dark:text-white/60"
        }`}>
          {category.tagline}
        </p>
      </div>
    </motion.button>
  );
}
