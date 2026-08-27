import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getGalleryItemsCMS, type GalleryItem } from "./data";
import { IconClose, IconArrowRight } from "./icons";

const CATEGORY_TABS = [
  { id: "all", label: "All Celebrations" },
  { id: "birthday", label: "Birthdays" },
  { id: "anniversary", label: "Anniversaries" },
  { id: "love", label: "Love Surprises" },
  { id: "proposal", label: "Proposals" },
  { id: "corporate", label: "Corporate" },
];

export default function Gallery() {
  const reduce = !!useReducedMotion();
  const [activeTab, setActiveTab] = useState("all");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const galleryItems = getGalleryItemsCMS();
  const filteredItems =
    activeTab === "all"
      ? galleryItems
      : galleryItems.filter((item: GalleryItem) => item.category === activeTab);

  return (
    <>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase active:scale-95 transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-lg shadow-purple-600/15 border-transparent"
                : "bg-white border border-[#E9E4F5] text-[#6B6780] hover:text-[#5B21B6] hover:border-[#8B5CF6]/30 hover:bg-[#FCFAFF]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Grid Layout */}
      <motion.div 
        layout 
        className={
          filteredItems.length === 1 
            ? "flex justify-center w-full" 
            : filteredItems.length === 2 
            ? "grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto w-full" 
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        }
      >
        <AnimatePresence>
          {filteredItems.map((item: GalleryItem, idx: number) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => setLightboxItem(item)}
              className="group relative mb-6 w-full max-w-md rounded-[24px] overflow-hidden border border-[#E9E4F5] bg-white cursor-pointer shadow-[0_4px_25px_rgba(91,33,182,0.02)] hover:shadow-[0_20px_45px_rgba(91,33,182,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              {/* Photo Frame Container */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#8B5CF6]/5 to-[#5B21B6]/10 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#3B176D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Editorial Card Footer */}
              <div className="p-6 bg-white flex flex-col text-left border-t border-[#F5F3FF] relative z-10 flex-1 justify-between">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#8B5CF6] mb-1.5 block">
                    {item.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#17142A] group-hover:text-[#5B21B6] transition-colors leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F5F3FF] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider">Event Details</span>
                  <span className="text-xs font-bold text-[#5B21B6] flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-300">
                    View Photo <span className="text-xs">→</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center p-4 bg-[#3B176D]/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
          >
            <motion.div
              className="relative w-full max-w-4xl rounded-[16px] overflow-hidden border border-[#E9E4F5] bg-white shadow-2xl"
              initial={{ scale: reduce ? 1 : 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxItem(null)}
                aria-label="Close Lightbox"
                className="absolute top-4 right-4 z-10 grid place-items-center w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/90 transition-all"
              >
                <IconClose />
              </button>
              <div className="relative max-h-[70vh] overflow-hidden">
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#5B21B6] font-bold">
                    {lightboxItem.category}
                  </span>
                  <h3 className="font-display text-3xl font-bold text-[#17142A] mt-1">
                    {lightboxItem.title}
                  </h3>
                </div>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 btn-primary font-bold px-6 py-3 rounded-[10px] shadow-xs"
                >
                  Book Similar Celebration <IconArrowRight width={18} height={18} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}




