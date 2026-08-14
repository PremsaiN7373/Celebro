import { motion, useReducedMotion } from "framer-motion";
import { STATS, type StatItem } from "./data";

export default function StatsSection() {
  const reduce = !!useReducedMotion();

  return (
    <section className="py-20 relative overflow-hidden border-y border-[#E9E4F5] bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E9E4F5]">
          {STATS.map((stat: StatItem, idx: number) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: reduce ? 0 : idx * 0.1 }}
              className="text-center pt-6 md:pt-0 first:pt-0"
            >
              <p className="font-display text-4xl sm:text-5xl font-bold text-[#5B21B6]">
                {stat.number}
              </p>
              <p className="text-xs uppercase tracking-widest text-[#6B6780] font-bold mt-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



