import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import MiniCalendar from "@/components/ui/MiniCalendar";
import Avatar from "@/components/ui/Avatar";

interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
}

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface PortfolioPhoto {
  id: number;
  image_url: string;
  caption: string;
}

interface Planner {
  id: number;
  business_name: string;
  category: string;
  city: string;
  about: string;
  experience_years: number;
  is_verified: boolean;
  is_saved: boolean;
  packages: Package[];
  portfolio_photos: PortfolioPhoto[];
  whatsapp_number: string | null;
}

interface EventOption {
  id: number;
  name: string;
  date: string;
}

export default function PlannerDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event"); // which event we're booking for, if opened from a workspace
  const navigate = useNavigate();

  const [planner, setPlanner] = useState<Planner | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<number | null>(null);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Only needed when the page was opened without an event context —
  // lets the person pick which of their events this booking is for,
  // right here, instead of bouncing them away with an error.
  const [myEvents, setMyEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.get(`/planners/${id}/`);
        setPlanner(data);
      } finally {
        setLoading(false);
      }
    };
    load();

    const loadReviews = async () => {
      const { data } = await apiClient.get("/reviews/", { params: { planner: id } });
      setReviews(data.results ?? data);
    };
    loadReviews();

    const loadAvailability = async () => {
      const { data } = await apiClient.get(`/planners/${id}/availability/`);
      setBlockedDates(data.blocked_dates);
    };
    loadAvailability();

    if (!eventId) {
      const loadMyEvents = async () => {
        try {
          const { data } = await apiClient.get("/events/");
          setMyEvents(data.results ?? data);
        } catch {
          // Not a customer, or no events yet — the banner below handles this gracefully.
        }
      };
      loadMyEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const effectiveEventId = eventId || selectedEventId;

  const handleBook = async (packageId: number) => {
    if (!effectiveEventId) {
      toast("Pick which event this is for, above, then try again.", { icon: "👆" });
      return;
    }
    setBooking(packageId);
    try {
      await apiClient.post("/bookings/", {
        event: Number(effectiveEventId),
        planner: Number(id),
        package: packageId,
      });
      toast.success("Booking requested!");
      navigate(`/events/${effectiveEventId}`);
    } catch {
      toast.error("Could not create booking — please try again.");
    } finally {
      setBooking(null);
    }
  };

  const toggleSave = async () => {
    if (!planner) return;
    setSavingWishlist(true);
    try {
      const { data } = await apiClient.post(`/planners/${planner.id}/save/`);
      setPlanner({ ...planner, is_saved: data.saved });
      toast.success(data.saved ? "Saved to your wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setSavingWishlist(false);
    }
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;
  if (!planner) return <p className="text-neutral-500">Planner not found.</p>;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Hero Cover Header */}
      <div className="relative rounded-[16px] overflow-hidden bg-[#3B176D] border border-[#E9E4F5] p-8 text-white shadow-md">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/wedding_hero.png"
            alt={planner.business_name}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3B176D] via-[#3B176D]/80 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={planner.business_name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-white">{planner.business_name}</h1>
                {planner.is_verified && (
                  <span className="badge-success text-[10px] uppercase tracking-wider">
                    ✓ Verified Master Planner
                  </span>
                )}
              </div>
              <p className="text-sm text-[#EDE9FE] font-medium capitalize mt-1">
                🌸 {planner.category.replace("_", " ")} • 📍 {planner.city} • {planner.experience_years} Years Experience
              </p>
              <p className="text-xs text-[#EDE9FE]/80 mt-1 font-bold">★ 4.9 Rating • 124 Verified Reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSave}
              disabled={savingWishlist}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:scale-105 transition-transform"
              title={planner.is_saved ? "Remove from wishlist" : "Save to wishlist"}
            >
              {planner.is_saved ? "❤️" : "🤍"}
            </button>

            {planner.whatsapp_number && (
              <a
                href={`https://wa.me/${planner.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hi ${planner.business_name}, I found you on Celebro and I'm interested in your services!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs px-5 py-3 flex items-center gap-1.5"
              >
                💬 Message Planner
              </a>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-7 shadow-[0_4px_20px_rgba(91,33,182,0.06)] space-y-3">
        <h2 className="font-display text-xl font-bold text-[#17142A]">About The Planner</h2>
        <p className="text-sm text-[#6B6780] leading-relaxed font-medium">
          {planner.about || "Experienced luxury event specialist creating unforgettable celebrations with personalized themes, custom floral decor, and seamless milestone coordination."}
        </p>
      </div>

      {/* Event Picker if not in context */}
      {!eventId && (
        <div className="border border-[#E9E4F5] bg-[#F5F3FF] rounded-[16px] p-5 shadow-xs">
          {myEvents.length === 0 ? (
            <p className="text-xs text-[#6B6780] font-medium">
              You don't have any celebrations created yet —{" "}
              <Link to="/events/create" className="text-[#5B21B6] font-bold underline">
                create one first
              </Link>{" "}
              to book this planner.
            </p>
          ) : (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] block mb-2">
                Which celebration is this booking for?
              </label>
              <select
                className="input-field"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="">Select an event from your workspace...</option>
                {myEvents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.date}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Packages System */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#17142A]">Curated Packages</h2>
        {planner.packages.length === 0 ? (
          <p className="text-[#6B6780] text-sm font-medium">Custom pricing available upon request.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {planner.packages.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-[#E9E4F5] rounded-[16px] p-6 shadow-[0_4px_20px_rgba(91,33,182,0.06)] flex flex-col justify-between hover:border-[#5B21B6] transition-all">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#17142A]">{pkg.title}</h3>
                  <p className="text-xs text-[#6B6780] mt-2 leading-relaxed font-medium">{pkg.description}</p>
                  <p className="font-display text-2xl font-bold text-[#5B21B6] mt-4">₹{pkg.price}</p>
                </div>
                <button
                  className="w-full mt-6 btn-primary text-xs py-3"
                  disabled={booking === pkg.id || (!eventId && myEvents.length === 0)}
                  onClick={() => handleBook(pkg.id)}
                >
                  {booking === pkg.id ? "Requesting..." : "Book This Package"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Gallery */}
      {planner.portfolio_photos && planner.portfolio_photos.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#17142A]">Portfolio Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {planner.portfolio_photos.map((photo) => (
              <div key={photo.id} className="rounded-[16px] overflow-hidden border border-[#E9E4F5] bg-white shadow-xs">
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Portfolio item"}
                  className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#17142A]">
          Client Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-[#6B6780] text-sm font-medium">No reviews yet for this planner.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-[#E9E4F5] rounded-[16px] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#17142A] text-sm">{r.customer_name}</p>
                  <p className="text-xs text-[#D08A24] font-bold">{"★".repeat(r.rating)}</p>
                </div>
                {r.comment && <p className="text-xs text-[#6B6780] mt-2 font-medium leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
