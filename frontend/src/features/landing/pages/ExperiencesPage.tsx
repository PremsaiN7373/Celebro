import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LandingNav from "../LandingNav";
import LandingFooter from "../LandingFooter";
import { IconArrowRight } from "../icons";
import { getExperiencesCatalogCMS, DetailedExperience, CATEGORIES } from "../data";

const INCLUSIONS: Record<string, string[]> = {
  birthday: [
    "Private rooftop or bespoke venue rentals",
    "Custom milestone birthday cake & candles",
    "Premium theme installations & florals",
    "Sparkler fountains & live DJ setup"
  ],
  anniversary: [
    "Exclusive candlelight table decor & roses",
    "Dedicated acoustic violinist performance",
    "Premium imported red rose displays",
    "Bespoke multi-course chef tasting menu"
  ],
  love: [
    "Luxurious hotel suite transformations",
    "Fresh rose petal pathways & ambient candles",
    "Giant illuminated marquee love setups",
    "Ethereal warm fairy-light canopy grids"
  ],
  proposal: [
    "Sunset rooftop rental & city panoramas",
    "Illuminated 'MARRY ME' marquee letters",
    "Floral arches, red carpet, & tea lights",
    "Dedicated proposal photographer"
  ],
  kids: [
    "Whimsical themed castle backdrops",
    "Pastel custom balloon arches",
    "Thematic candy carts & dessert bars",
    "Interactive kids' entertainment & hosts"
  ],
  corporate: [
    "Keynote stage design & high-end AV",
    "Ambient company branding LED light bars",
    "VIP velvet cocktail lounge arrangements",
    "Gourmet executive hospitality & catering"
  ]
};

const CATALOG_IMAGES: Record<string, string> = {
  birthday: "/images/birthday_catalog.png",
  anniversary: "/images/anniversary_catalog.png",
  love: "/images/surprise_catalog.png",
  proposal: "/images/proposal_catalog.png",
  kids: "/images/kids_catalog.png",
  corporate: "/images/corporate_catalog.png"
};

export default function ExperiencesPage() {
  const [activeTab, setActiveTab] = useState<"occasions" | "experiences">("occasions");

  // Occasions Filter State
  const [occasionFilter, setOccasionFilter] = useState("all");

  // Experiences List State
  const [searchParams] = useSearchParams();
  const experiences = getExperiencesCatalogCMS();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [cityFilter, setCityFilter] = useState("all");
  const [activeId, setActiveId] = useState(experiences[0]?.id || "");
  const [selectedExp, setSelectedExp] = useState<DetailedExperience | null>(null);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Filters for Occasions (Celebrations)
  const filteredCategories = CATEGORIES.filter((cat) => {
    if (occasionFilter === "all") return true;
    if (occasionFilter === "social") return cat.id === "birthday" || cat.id === "kids";
    if (occasionFilter === "romantic") return cat.id === "anniversary" || cat.id === "love" || cat.id === "proposal";
    if (occasionFilter === "corporate") return cat.id === "corporate";
    return true;
  });

  // Filters for Experiences
  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      exp.tagline.toLowerCase().includes(search.toLowerCase()) ||
      exp.overview.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "all" || exp.location.includes(cityFilter);
    return matchesSearch && matchesCity;
  });

  const currentExp = experiences.find((e) => e.id === activeId) || experiences[0];

  const handleSelectExp = (exp: DetailedExperience) => {
    setActiveId(exp.id);
    setSelectedExp(exp);
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#17142A] font-sans selection:bg-[#8B5CF6]/30">
      <LandingNav />

      {/* Header Banner */}
      <section className="pt-40 pb-20 bg-[#3B176D] text-white relative overflow-hidden">
        {/* Abstract Light Leaks */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#5B21B6]/30 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-purple-200"
          >
            Bespoke Milestone Planning & Packages
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-bold leading-tight max-w-4xl mx-auto text-white"
          >
            Occasions & Signature Experiences
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-purple-100 mt-4 max-w-2xl mx-auto font-medium"
          >
            Explore custom event concepts and hand-crafted luxury packages. Whether you're looking for curated occasion themes or completely styled turn-key experiences, we bring your vision to life.
          </motion.p>
        </div>
      </section>

      {/* Primary Tab Selector Section */}
      <section className="bg-white border-b border-[#E9E4F5] sticky top-[73px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
          {/* Tabs */}
          <div className="flex gap-4 border-b sm:border-b-0 border-[#E9E4F5] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("occasions")}
              className={`pb-2 sm:pb-0 px-4 py-2 font-display text-lg font-bold transition-all relative ${
                activeTab === "occasions"
                  ? "text-[#5B21B6]"
                  : "text-[#6B6780] hover:text-[#17142A]"
              }`}
            >
              Occasions & Themes
              {activeTab === "occasions" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#5B21B6]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("experiences")}
              className={`pb-2 sm:pb-0 px-4 py-2 font-display text-lg font-bold transition-all relative ${
                activeTab === "experiences"
                  ? "text-[#5B21B6]"
                  : "text-[#6B6780] hover:text-[#17142A]"
              }`}
            >
              Signature Experiences
              {activeTab === "experiences" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#5B21B6]"
                />
              )}
            </button>
          </div>

          {/* Contextual description or actions */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#6B6780] font-medium">
              {activeTab === "occasions"
                ? "Handcrafted luxury theme setups for milestones"
                : "Bespoke full-service luxury packages & itineraries"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main>
        {activeTab === "occasions" ? (
          <>
            {/* OCCASIONS FILTER SUB-NAV */}
            <section className="py-6 bg-[#FCFAFF] border-b border-[#E9E4F5]">
              <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <h2 className="font-display text-xl font-bold text-[#17142A]">Occasion Catalog</h2>
                  <p className="text-xs text-[#6B6780] font-medium">Filter by category to explore custom event packages</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All Occasions" },
                    { id: "social", label: "Birthdays & Social" },
                    { id: "romantic", label: "Romantic & Love" },
                    { id: "corporate", label: "Corporate Galas" }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setOccasionFilter(btn.id)}
                      className={`text-xs font-bold px-4 py-2.5 rounded-full border transition-all ${
                        occasionFilter === btn.id
                          ? "bg-[#5B21B6] border-transparent text-white shadow-md shadow-[#5B21B6]/20"
                          : "border-[#E9E4F5] bg-white text-[#17142A] hover:border-[#5B21B6]"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* OCCASIONS GRID */}
            <section className="py-16 max-w-7xl mx-auto px-6">
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredCategories.map((cat) => {
                    const inclusions = INCLUSIONS[cat.id] || [];
                    return (
                      <motion.div
                        key={cat.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white border border-[#E9E4F5] rounded-3xl overflow-hidden shadow-soft hover:shadow-[0_20px_45px_rgba(91,33,182,0.08)] transition-all duration-300 group flex flex-col h-full"
                      >
                        {/* Image header */}
                        <div className="relative h-60 overflow-hidden shrink-0">
                          <img
                            src={CATALOG_IMAGES[cat.id] || cat.image}
                            alt={cat.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div
                            className="absolute inset-0 opacity-15 mix-blend-color-dodge"
                            style={{ backgroundColor: cat.glow }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#17142A]/80 via-transparent to-transparent" />
                          {/* Emoji badge */}
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl w-11 h-11 flex items-center justify-center text-xl shadow-md border border-white/20">
                            {cat.emoji}
                          </div>
                          {/* Price Tag floating */}
                          <div className="absolute bottom-4 right-4 bg-[#5B21B6] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
                            Starts at {cat.startingPrice}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-[#5B21B6] tracking-widest">
                                  {cat.id === "corporate" ? "Business" : cat.id === "kids" || cat.id === "birthday" ? "Social" : "Romantic"}
                                </span>
                                <span className="text-purple-200 text-xs">•</span>
                                <span className="text-[11px] font-bold text-[#6B6780]">⭐ {cat.rating} Rating</span>
                              </div>
                              <h3 className="font-display text-2xl font-bold text-[#17142A] mt-1 group-hover:text-[#5B21B6] transition-colors duration-200">
                                {cat.title}
                              </h3>
                              <p className="text-xs font-semibold text-[#6B6780] mt-0.5">{cat.tagline}</p>
                            </div>

                            <p className="text-xs text-[#6B6780] leading-relaxed font-medium">
                              {cat.description}
                            </p>

                            <div className="h-px bg-[#E9E4F5]" />

                            {/* Inclusions */}
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-[#17142A] tracking-wider block">Signature Inclusions</span>
                              <ul className="space-y-2">
                                {inclusions.map((inc, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-[#6B6780]">
                                    <span className="text-[#3A8D68] font-bold text-sm leading-none shrink-0">✓</span>
                                    <span>{inc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-6 mt-auto">
                            <Link
                              to={`/register?celebrating=${cat.id}`}
                              className="w-full btn-primary text-xs font-bold py-3.5 rounded-[12px] flex items-center justify-center gap-2 group-hover:bg-[#4C1D95] shadow-xs hover:shadow-[0_4px_14px_rgba(91,33,182,0.2)] transition-all duration-200"
                            >
                              Plan {cat.title} <IconArrowRight width={14} height={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </section>

            {/* OCCASIONS COMPARISON SECTION */}
            <section className="py-20 bg-white border-t border-[#E9E4F5]">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-14">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">Uncompromising Luxury Standards</h2>
                  <p className="text-sm text-[#6B6780] mt-2 font-medium">Every custom celebration is coordinate-managed to perfection by verified local specialists.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-[20px] bg-[#FCFAFF] border border-[#E9E4F5] space-y-4 hover:shadow-soft transition-all duration-300">
                    <span className="text-3xl">💐</span>
                    <h3 className="font-display text-xl font-bold text-[#17142A]">Custom Styling & Florals</h3>
                    <p className="text-sm text-[#6B6780] leading-relaxed font-medium">Fresh luxury blooms, custom balloon installations, candles, and bespoke table settings customized to your exact aesthetic.</p>
                  </div>

                  <div className="p-8 rounded-[20px] bg-[#FCFAFF] border border-[#E9E4F5] space-y-4 hover:shadow-soft transition-all duration-300">
                    <span className="text-3xl">🥂</span>
                    <h3 className="font-display text-xl font-bold text-[#17142A]">Fine Dining & Hospitality</h3>
                    <p className="text-sm text-[#6B6780] leading-relaxed font-medium">Private chef tasting menus, sommelier wine pairings, custom champagne fountains, and luxury signature desserts.</p>
                  </div>

                  <div className="p-8 rounded-[20px] bg-[#FCFAFF] border border-[#E9E4F5] space-y-4 hover:shadow-soft transition-all duration-300">
                    <span className="text-3xl">🎻</span>
                    <h3 className="font-display text-xl font-bold text-[#17142A]">Atmosphere & Entertainment</h3>
                    <p className="text-sm text-[#6B6780] leading-relaxed font-medium">Live violinists, acoustic guitarists, visual light mapping, sparkler fountains, and professional digital videography.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* EXPERIENCES SECTION */
          <section className="py-12 max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
              {/* LEFT COLUMN: List & Search */}
              <div className="space-y-6">
                {/* Search and Filters inside list side */}
                <div className="bg-white border border-[#E9E4F5] rounded-3xl p-4 shadow-soft space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search experiences..."
                      className="flex-1 bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-2.5 text-xs text-[#17142A] placeholder:text-[#6B6780] outline-none focus:border-[#5B21B6] font-medium"
                    />
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-2.5 text-xs text-[#17142A] font-bold outline-none cursor-pointer"
                    >
                      <option value="all">All Cities</option>
                      <option value="New York">New York</option>
                      <option value="Los Angeles">Los Angeles</option>
                      <option value="Miami">Miami</option>
                      <option value="Chicago">Chicago</option>
                      <option value="Dallas">Dallas</option>
                      <option value="San Francisco">San Francisco</option>
                    </select>
                  </div>
                </div>

                {/* Scrolling list */}
                <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {filteredExperiences.map((exp) => {
                      const isActive = exp.id === activeId;
                      return (
                        <motion.div
                          key={exp.id}
                          onClick={() => handleSelectExp(exp)}
                          whileHover={{ x: 4 }}
                          layout
                          className={`border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex gap-4 ${
                            isActive
                              ? "border-[#5B21B6] bg-[#F5F3FF]/40 shadow-xs"
                              : "border-[#E9E4F5] bg-white hover:border-[#8B5CF6]/50 shadow-[0_2px_10px_rgba(91,33,182,0.02)]"
                          }`}
                        >
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                            <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] uppercase font-bold text-[#5B21B6] tracking-wider truncate">
                                  {exp.category}
                                </span>
                                <span className="text-[10px] font-bold text-[#6B6780] shrink-0">⭐ {exp.rating}</span>
                              </div>
                              <h4 className="text-sm font-bold text-[#17142A] truncate leading-snug mt-0.5">
                                {exp.title}
                              </h4>
                              <p className="text-[11px] text-[#6B6780] truncate font-medium mt-1">
                                {exp.tagline}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className="text-[10px] font-bold text-[#6B6780]">📍 {exp.location}</span>
                              <span className="font-bold text-[#5B21B6]">{exp.price}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {filteredExperiences.length === 0 && (
                    <p className="text-center text-xs text-[#6B6780] py-12 font-medium">No experiences match your query.</p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Sticky Detail preview workspace (only on large screens) */}
              <div className="hidden lg:block sticky top-[150px] bg-white border border-[#E9E4F5] rounded-3xl p-6 shadow-soft space-y-6">
                {/* Header / Info */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#5B21B6] tracking-wider block">{currentExp.category}</span>
                  <h3 className="font-display text-2xl font-bold text-[#17142A] leading-snug">{currentExp.title}</h3>
                  <p className="text-xs font-semibold text-[#6B6780] italic">{currentExp.tagline}</p>
                </div>

                {/* Banner image */}
                <div className="relative h-60 rounded-2xl overflow-hidden shadow-xs">
                  <img src={currentExp.image} alt={currentExp.title} className="w-full h-full object-cover" />
                </div>

                {/* Description / Overview */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#17142A] tracking-wider block mb-1">Overview</span>
                    <p className="text-xs text-[#6B6780] leading-relaxed font-medium">{currentExp.overview}</p>
                  </div>

                  <div className="h-px bg-[#E9E4F5]" />

                  {/* Amenities */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#17142A] tracking-wider block">Signature Inclusions</span>
                    <ul className="space-y-1.5">
                      {currentExp.amenities.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-medium text-[#6B6780]">
                          <span className="text-[#3A8D68] font-bold text-sm leading-none">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px bg-[#E9E4F5]" />

                  {/* Timeline */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[#17142A] tracking-wider block">Bespoke Timeline</span>
                    <div className="relative border-l border-purple-100 pl-4 ml-2 space-y-3.5">
                      {currentExp.itinerary.map((item, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#5B21B6] border-2 border-white shadow-sm" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#5B21B6] tracking-wider block">{item.time} — {item.title}</span>
                            <p className="text-[11px] text-[#6B6780] font-medium leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom booking actions */}
                <div className="flex items-center justify-between pt-5 border-t border-[#E9E4F5]">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#6B6780]">Package Price</span>
                    <span className="text-xl font-bold text-[#5B21B6]">{currentExp.price}</span>
                  </div>
                  <Link
                    to={`/register?exp=${currentExp.id}`}
                    className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-6 py-3.5 rounded-[12px] flex items-center gap-2 shadow-md shadow-[#5B21B6]/15 hover:scale-105 active:scale-95 transition-all animate-none"
                  >
                    Book Experience <IconArrowRight width={14} height={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Experience Details Modal for Mobile/Tablet */}
      {selectedExp && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-xs lg:hidden" onClick={() => setSelectedExp(null)}>
          <div className="bg-white border border-[#E9E4F5] rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#5B21B6] tracking-wider block">{selectedExp.category}</span>
                <h3 className="font-display text-2xl font-bold text-[#17142A] leading-snug">{selectedExp.title}</h3>
              </div>
              <button onClick={() => setSelectedExp(null)} className="text-[#6B6780] hover:text-[#17142A] text-xl font-bold p-1">✕</button>
            </div>

            <img src={selectedExp.image} alt={selectedExp.title} className="w-full h-52 object-cover rounded-2xl shadow-xs" />

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#17142A] italic">{selectedExp.tagline}</p>
                <p className="text-xs text-[#6B6780] leading-relaxed mt-2 font-medium">{selectedExp.overview}</p>
              </div>

              <div className="h-px bg-[#E9E4F5]" />

              {/* Amenities */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#17142A] tracking-wider block">Signature Amenities</span>
                <ul className="space-y-1.5">
                  {selectedExp.amenities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-[#6B6780]">
                      <span className="text-[#3A8D68] font-bold text-sm leading-none">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px bg-[#E9E4F5]" />

              {/* Itinerary */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#17142A] tracking-wider block">Timeline & Itinerary</span>
                <div className="relative border-l border-purple-100 pl-4 ml-2 space-y-3">
                  {selectedExp.itinerary.map((item, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#5B21B6] border-2 border-white shadow-sm" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#5B21B6] tracking-wider block">{item.time} — {item.title}</span>
                        <p className="text-[11px] text-[#6B6780] font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-[#E9E4F5]">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#6B6780]">Package Price</span>
                <span className="text-lg font-bold text-[#5B21B6]">{selectedExp.price}</span>
              </div>
              <Link
                to={`/register?exp=${selectedExp.id}`}
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-6 py-3.5 rounded-[12px] shadow-md shadow-[#5B21B6]/15 hover:scale-105 active:scale-95 transition-all"
              >
                Book Experience Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
