import { motion, useReducedMotion } from "framer-motion";
import { TESTIMONIALS, type TestimonialItem } from "./data";

export default function TestimonialsSection() {
  const reduce = !!useReducedMotion();

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-2"
          >
            Client Stories
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl sm:text-5xl font-bold text-[#17142A]"
          >
            Loved By Celebrators Nationwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base text-[#6B6780] mt-3 font-medium"
          >
            Read how Celebro brought real dreams, magic, and tears of joy to life.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item: TestimonialItem, idx: number) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: reduce ? 0 : idx * 0.15 }}
              className="bg-white border border-[#E9E4F5] rounded-[16px] p-8 relative flex flex-col justify-between hover:border-[#5B21B6] transition-all duration-300 shadow-[0_4px_20px_rgba(91,33,182,0.06)] group"
            >
              <div>
                <div className="flex items-center gap-1 text-[#D08A24] text-sm mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-[#17142A] text-base italic leading-relaxed mb-6 font-display">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[#E9E4F5]">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#5B21B6]"
                />
                <div>
                  <h4 className="text-[#17142A] font-bold text-sm tracking-wide">{item.name}</h4>
                  <p className="text-xs text-[#5B21B6] font-bold">{item.event}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



