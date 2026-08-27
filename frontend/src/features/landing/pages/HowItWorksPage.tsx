import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNav from "../LandingNav";
import LandingFooter from "../LandingFooter";
import TimelineSection from "../TimelineSection";
import { getStepsCMS } from "../data";

export default function HowItWorksPage() {
  const steps = getStepsCMS();
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
            Seamless Celebration Workflow
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-bold leading-tight"
          >
            How Celebro Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#EDE9FE]/90 mt-4 max-w-2xl mx-auto font-medium"
          >
            From your first spark of an idea to stepping into your beautifully decorated venue — we make event planning effortless.
          </motion.p>
        </div>
      </section>

      {/* Main Interactive Timeline */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <TimelineSection />
      </section>

      {/* Deep Dive Step Cards */}
      <section className="py-20 bg-white border-t border-[#E9E4F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">Step-by-Step Experience Guide</h2>
            <p className="text-sm text-[#6B6780] mt-2 font-medium">Explore each phase of planning your milestone event on Celebro.</p>
          </div>

          <div className="space-y-12">
            {steps.map((step: any, idx: number) => (

              <motion.div
                key={step.n}
                whileHover={{ scale: 1.01 }}
                className={`p-8 rounded-[24px] border border-[#E9E4F5] flex flex-col md:flex-row gap-8 items-center ${
                  idx % 2 === 0 ? "bg-[#F5F3FF]" : "bg-white"
                }`}
              >
                <div className="w-16 h-16 rounded-[16px] bg-[#5B21B6] text-white font-display text-2xl font-bold flex items-center justify-center shrink-0 shadow-lg">
                  {step.n}
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="font-display text-2xl font-bold text-[#17142A]">{step.title}</h3>
                  <p className="text-base text-[#6B6780] leading-relaxed font-medium">{step.body}</p>
                </div>

                <Link
                  to="/register"
                  className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-6 py-3 rounded-[10px] shadow-sm shrink-0"
                >
                  Start Step {step.n} →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 bg-[#3B176D] text-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="font-display text-4xl sm:text-5xl font-bold">Ready To Celebrate Stress-Free?</h2>
          <p className="text-base text-[#EDE9FE] max-w-xl mx-auto font-medium">Join thousands of happy clients who created unforgettable memories with Celebro.</p>
          <Link
            to="/register"
            className="inline-block bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-sm px-8 py-4 rounded-[10px] shadow-xl transition-all hover:scale-105"
          >
            Get Started Now ✦
          </Link>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
