import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  created_at: string;
}

interface Planner {
  id: number;
  business_name: string;
  category: string;
  city: string;
  about: string;
  experience_years: number;
  is_verified: boolean;
  is_featured: boolean;
  is_saved: boolean;
  avg_response_hours: number | null;
  cover_image_url?: string;
  packages?: Package[];
}

const MAX_COMPARE = 3;

const CATEGORY_ICONS: Record<string, string> = {
  decoration: "🌸",
  balloon_decor: "🎈",
  photography: "📸",
  videography: "🎥",
  dj: "🎧",
  live_music: "🎸",
  catering: "🍽️",
  cake_shop: "🎂",
  magician: "🪄",
  anchor: "🎤",
  lighting: "💡",
  stage_decor: "🏛️",
  entertainment: "🎭",
};

export default function MarketplacePage() {
  const [searchParams] = useSearchParams();
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const eventId = searchParams.get("event");
  const navigate = useNavigate();

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchPlanners = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (minRating) params.min_rating = minRating;
        if (availableDate) params.available_date = availableDate;
        const { data } = await apiClient.get("/planners/", { params });
        setPlanners(data.results ?? data);
      } catch {
        toast.error("Failed to fetch planners");
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchPlanners, 300);
    return () => clearTimeout(debounce);
  }, [search, minPrice, maxPrice, minRating, availableDate]);

  const toggleSave = async (e: React.MouseEvent, plannerId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await apiClient.post(`/planners/${plannerId}/save/`);
      setPlanners((prev) =>
        prev.map((p) => (p.id === plannerId ? { ...p, is_saved: data.saved } : p))
      );
      toast.success(data.saved ? "Saved to your wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  const toggleCompare = (plannerId: number) => {
    setCompareIds((prev) => {
      if (prev.includes(plannerId)) return prev.filter((id) => id !== plannerId);
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} planners at once`);
        return prev;
      }
      return [...prev, plannerId];
    });
  };

  const goToCompare = () => {
    navigate(`/compare?ids=${compareIds.join(",")}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">
          Find the Perfect Planner
        </h1>
        <p className="text-[#6B6780] text-sm mt-1 font-medium">
          Discover verified professionals and master event curators for your celebration.
        </p>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search planners, services, or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
          <span className="absolute left-3.5 top-3.5 text-sm text-[#6B6780]">🔍</span>
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="btn-secondary text-xs font-semibold"
        >
          {showFilters ? "✕ Hide Filters" : "⚙️ Filter Planners"}
        </button>
      </div>

      {/* Filter Expand Panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-5 border border-[#E9E4F5] rounded-[16px] bg-white shadow-xs">
          <div>
            <label className="text-xs text-[#17142A] font-bold block mb-1.5 uppercase tracking-wider">
              Min Price (₹)
            </label>
            <input
              className="input-field w-32 text-sm"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-[#17142A] font-bold block mb-1.5 uppercase tracking-wider">
              Max Price (₹)
            </label>
            <input
              className="input-field w-32 text-sm"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-[#17142A] font-bold block mb-1.5 uppercase tracking-wider">
              Min Rating
            </label>
            <select
              className="input-field w-28 text-sm"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Any</option>
              <option value="3">3+ ★</option>
              <option value="4">4+ ★</option>
              <option value="4.5">4.5+ ★</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#17142A] font-bold block mb-1.5 uppercase tracking-wider">
              Available On
            </label>
            <input
              className="input-field w-44 text-sm"
              type="date"
              value={availableDate}
              onChange={(e) => setAvailableDate(e.target.value)}
            />
          </div>
          {(minPrice || maxPrice || minRating || availableDate) && (
            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                setMinRating("");
                setAvailableDate("");
              }}
              className="text-xs font-bold text-[#C94B63] self-end mb-3 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Planner Grid */}
      {loading ? (
        <p className="text-[#6B6780] text-sm font-medium">Searching planners...</p>
      ) : planners.length === 0 ? (
        <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-12 text-center shadow-xs">
          <p className="text-[#17142A] font-semibold">No planners match your current search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {planners.map((p) => {
            const isComparing = compareIds.includes(p.id);
            return (
              <div
                key={p.id}
                className={`bg-white border border-[#E9E4F5] rounded-[16px] overflow-hidden relative hover:border-[#5B21B6] hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(91,33,182,0.06)] flex flex-col justify-between ${
                  isComparing ? "ring-2 ring-[#5B21B6] border-[#5B21B6]" : ""
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-48 bg-[#F5F3FF] overflow-hidden flex items-center justify-center">
                  <img
                    src="/images/wedding_hero.png"
                    alt={p.business_name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <button
                    onClick={(e) => toggleSave(e, p.id)}
                    className="absolute top-3 right-3 text-sm leading-none z-10 text-white bg-black/40 backdrop-blur-md p-2 rounded-full hover:scale-110 transition-transform"
                    title={p.is_saved ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    {p.is_saved ? "❤️" : "🤍"}
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                    <span className="text-xs font-bold text-white">★ 4.9 • 124 reviews</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                      📍 {p.city || "Chennai"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#17142A] truncate">
                      {p.business_name || "The Wedding Atelier"}
                    </h2>
                    <p className="text-xs text-[#5B21B6] font-bold mt-1 uppercase tracking-wider">
                      {CATEGORY_ICONS[p.category] || "🌸"} {p.category?.replace(/_/g, " ") || "Wedding"}
                    </p>
                    <p className="text-xs text-[#6B6780] mt-2 line-clamp-2 leading-relaxed font-medium">
                      {p.about || "Experienced event specialist creating memorable luxury celebrations."}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E9E4F5]">
                    <p className="text-xs text-[#6B6780] font-medium">
                      {p.packages && p.packages.length > 0 ? (
                        <>
                          Packages from <span className="text-base font-bold text-[#17142A]">₹{Math.min(...p.packages.map((pkg) => Number(pkg.price))).toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-xs text-[#6B6780] font-bold">Pricing upon request</span>
                      )}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        to={eventId ? `/planners/${p.id}?event=${eventId}` : `/planners/${p.id}`}
                        className="flex-1 text-center btn-primary text-xs py-2.5"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => toggleCompare(p.id)}
                        className={`text-xs font-bold px-3 py-2.5 rounded-[10px] border transition-colors ${
                          isComparing ? "bg-[#5B21B6] text-white border-[#5B21B6]" : "border-[#E9E4F5] bg-[#F5F3FF] text-[#5B21B6] hover:bg-[#EDE9FE]"
                        }`}
                      >
                        {isComparing ? "✓ Added" : "+ Compare"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Compare Banner */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 lg:left-72 bg-[#3B176D] border border-white/20 text-white px-6 py-4 rounded-[16px] flex items-center justify-between z-40 shadow-2xl backdrop-blur-md">
          <p className="text-sm font-semibold">
            {compareIds.length} planner{compareIds.length > 1 ? "s" : ""} selected for comparison
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setCompareIds([])}
              className="text-xs text-white/70 hover:text-white px-3 py-2 font-medium"
            >
              Clear
            </button>
            <button
              onClick={goToCompare}
              disabled={compareIds.length < 2}
              className="btn-primary text-xs bg-[#5B21B6]"
            >
              Compare Now →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
