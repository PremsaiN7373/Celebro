import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNav from "../LandingNav";
import Gallery from "../Gallery";
import { GALLERY_ITEMS } from "../data";

export default function LookbookPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

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

      {/* Detailed Portfolio Cards Grid */}
      <section className="py-16 bg-white border-t border-[#E9E4F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">Featured Celebration Portfolios</h2>
            <p className="text-sm text-[#6B6780] mt-2 font-medium">Click any portfolio card to expand high-resolution photos and planner attributions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {GALLERY_ITEMS.map((item: any) => (

              <motion.div
                key={item.id}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedPhoto(item)}
                className="bg-[#F5F3FF] border border-[#E9E4F5] rounded-[20px] overflow-hidden shadow-sm cursor-pointer group"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-[#5B21B6] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                    {item.category}
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-[#17142A]">{item.title}</h3>
                  <span className="text-xs font-bold text-[#5B21B6] group-hover:translate-x-1 transition-transform">View Photo →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white border border-[#E9E4F5] rounded-[20px] max-w-3xl w-full p-6 shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white font-bold grid place-items-center hover:bg-black"
            >
              ✕
            </button>
            <img src={selectedPhoto.image} alt={selectedPhoto.title} className="w-full h-[400px] object-cover rounded-[14px]" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B21B6]">{selectedPhoto.category}</span>
                <h3 className="font-display text-2xl font-bold text-[#17142A]">{selectedPhoto.title}</h3>
              </div>
              <Link
                to="/register"
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-5 py-2.5 rounded-[10px]"
              >
                Request Similar Setup ✦
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#E9E4F5] py-8 text-center text-xs text-[#6B6780] font-medium">
        © {new Date().getFullYear()} Celebro Inc. All rights reserved. • Plan. Connect. Celebrate.
      </footer>
    </div>
  );
}
