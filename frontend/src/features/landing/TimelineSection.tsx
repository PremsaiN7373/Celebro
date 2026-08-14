import { motion, useReducedMotion } from "framer-motion";
import { STEPS, type StepItem } from "./data";

export default function TimelineSection() {
  const reduce = !!useReducedMotion();

  return (
    <section id="how" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-2"
          >
            Seamless Journey
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl sm:text-5xl font-bold text-[#17142A]"
          >
            How Your Celebration Unfolds
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base text-[#6B6780] mt-3 font-medium"
          >
            From your first spark of inspiration to the moment you step into the venue.
          </motion.p>
        </div>

        {/* Timeline Steps Grid */}
        <div className="grid md:grid-cols-5 gap-6 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-[#5B21B6] opacity-20 z-0" />

          {STEPS.map((step: StepItem, idx: number) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: reduce ? 0 : idx * 0.12 }}
              className="relative z-10 bg-white border border-[#E9E4F5] rounded-[16px] p-6 hover:border-[#5B21B6] hover:-translate-y-1 transition-all duration-300 group shadow-[0_4px_20px_rgba(91,33,182,0.06)]"
            >
              <div className="w-11 h-11 rounded-[10px] bg-[#F5F3FF] border border-[#E9E4F5] flex items-center justify-center font-bold text-[#5B21B6] text-lg mb-5 group-hover:scale-110 transition-transform shadow-xs">
                {step.n}
              </div>
              <h3 className="font-display text-xl font-bold text-[#17142A] mb-2 group-hover:text-[#5B21B6] transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-[#6B6780] leading-relaxed font-medium">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



