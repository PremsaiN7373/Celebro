import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GALLERY_ITEMS, type GalleryItem } from "./data";
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

  const filteredItems =
    activeTab === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item: GalleryItem) => item.category === activeTab);

  return (
    <>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-[#5B21B6] text-white shadow-xs"
                : "bg-white border border-[#E9E4F5] text-[#17142A] hover:bg-[#F5F3FF]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
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
              className="group relative mb-6 rounded-[16px] overflow-hidden border border-[#E9E4F5] bg-white break-inside-avoid cursor-pointer shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EDE9FE] mb-1">
                  {item.category}
                </span>
                <h3 className="font-display text-xl font-bold text-white group-hover:text-[#EDE9FE] transition-colors">
                  {item.title}
                </h3>
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




