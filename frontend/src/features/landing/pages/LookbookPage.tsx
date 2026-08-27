import { motion } from "framer-motion";
import LandingNav from "../LandingNav";
import LandingFooter from "../LandingFooter";
import Gallery from "../Gallery";

export default function LookbookPage() {

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
            Luxury Event Photography
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-bold leading-tight"
          >
            Celebration Lookbook Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#EDE9FE]/90 mt-4 max-w-2xl mx-auto font-medium"
          >
            Browse real event styling portfolios, floral arches, illuminated marquee signs, and luxury tablescapes crafted by Celebro planners.
          </motion.p>
        </div>
      </section>

      {/* Main Gallery Grid */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <Gallery />
      </section>





      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
