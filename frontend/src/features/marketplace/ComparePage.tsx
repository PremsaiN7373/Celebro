import { useEffect, useState, Fragment } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import Avatar from "@/components/ui/Avatar";

interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
}

interface Planner {
  id: number;
  business_name: string;
  category: string;
  city: string;
  about: string;
  experience_years: number;
  is_verified: boolean;
  packages: Package[];
}

interface Review {
  id: number;
  rating: number;
}

interface PlannerWithRating extends Planner {
  avgRating: number | null;
  reviewCount: number;
}

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");
  const navigate = useNavigate();
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [planners, setPlanners] = useState<PlannerWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<number | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const [plannerRes, reviewsRes] = await Promise.all([
              apiClient.get(`/planners/${id}/`),
              apiClient.get("/reviews/", { params: { planner: id } }),
            ]);
            const reviews: Review[] = reviewsRes.data.results ?? reviewsRes.data;
            const avgRating =
              reviews.length > 0
                ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                : null;
            return { ...plannerRes.data, avgRating, reviewCount: reviews.length };
          })
        );
        setPlanners(results);
      } catch {
        toast.error("Could not load comparison");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = async (plannerId: number, packageId: number) => {
    if (!eventId) {
      toast("Open Compare from inside one of your events to book directly.", { icon: "👆" });
      return;
    }
    setBooking(packageId);
    try {
      await apiClient.post("/bookings/", {
        event: Number(eventId),
        planner: plannerId,
        package: packageId,
      });
      toast.success("Booking requested!");
      navigate(`/events/${eventId}`);
    } catch {
      toast.error("Could not create booking");
    } finally {
      setBooking(null);
    }
  };

  if (ids.length === 0) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold mb-2">Compare Planners</h1>
        <p className="text-ink-500">
          Nothing to compare yet —{" "}
          <Link to="/marketplace" className="underline text-accent-600">
            head to the Marketplace
          </Link>{" "}
          and select a few planners to compare side by side.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-ink-400 text-sm">Loading comparison...</p>;

  // All packages across all compared planners, used as row labels so
  // each planner's matching package (by title) lines up in the same row.
  const allPackageTitles = Array.from(
    new Set(planners.flatMap((p) => p.packages.map((pkg) => pkg.title)))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#17142A]">Compare Planners</h1>
          <p className="text-xs text-[#6B6780] font-medium mt-1">Side-by-side service, rating, and package analysis</p>
        </div>
        <Link to="/marketplace" className="btn-secondary text-xs">
          ← Back to Marketplace
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-4 min-w-[640px]"
          style={{ gridTemplateColumns: `160px repeat(${planners.length}, 1fr)` }}
        >
          {/* Header row: names */}
          <div />
          {planners.map((p) => (
            <div key={p.id} className="bg-white border border-[#E9E4F5] rounded-[16px] p-5 text-center shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
              <div className="flex justify-center mb-2">
                <Avatar name={p.business_name} />
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="font-display text-lg font-bold text-[#17142A]">{p.business_name}</h2>
                {p.is_verified && <span className="text-xs">✅</span>}
              </div>
              <p className="text-xs text-[#5B21B6] font-bold capitalize mt-0.5">
                {p.category.replace(/_/g, " ")}
              </p>
              <Link
                to={eventId ? `/planners/${p.id}?event=${eventId}` : `/planners/${p.id}`}
                className="text-xs text-[#5B21B6] font-bold hover:underline mt-2 inline-block"
              >
                View Profile →
              </Link>
            </div>
          ))}

          {/* Rating */}
          <div className="flex items-center text-sm font-medium text-ink-500 py-2">Rating</div>
          {planners.map((p) => (
            <div key={p.id} className="flex items-center justify-center py-2 text-sm">
              {p.avgRating ? (
                <span>
                  {"★".repeat(Math.round(p.avgRating))}
                  {"☆".repeat(5 - Math.round(p.avgRating))}{" "}
                  <span className="text-ink-400">({p.reviewCount})</span>
                </span>
              ) : (
                <span className="text-ink-400">No reviews yet</span>
              )}
            </div>
          ))}

          {/* City */}
          <div className="flex items-center text-sm font-medium text-ink-500 py-2 border-t border-ink-100 dark:border-ink-700">
            City
          </div>
          {planners.map((p) => (
            <div key={p.id} className="flex items-center justify-center py-2 text-sm border-t border-ink-100 dark:border-ink-700">
              {p.city}
            </div>
          ))}

          {/* Experience */}
          <div className="flex items-center text-sm font-medium text-ink-500 py-2 border-t border-ink-100 dark:border-ink-700">
            Experience
          </div>
          {planners.map((p) => (
            <div key={p.id} className="flex items-center justify-center py-2 text-sm border-t border-ink-100 dark:border-ink-700">
              {p.experience_years} yrs
            </div>
          ))}

          {/* About */}
          <div className="flex items-center text-sm font-medium text-ink-500 py-2 border-t border-ink-100 dark:border-ink-700">
            About
          </div>
          {planners.map((p) => (
            <div key={p.id} className="py-2 text-xs text-ink-500 border-t border-ink-100 dark:border-ink-700 text-center">
              {p.about || "—"}
            </div>
          ))}

          {/* Packages, row per package title so matching services line up */}
          {allPackageTitles.length === 0 ? (
            <>
              <div className="flex items-center text-sm font-medium text-ink-500 py-2 border-t border-ink-100 dark:border-ink-700">
                Packages
              </div>
              {planners.map((p) => (
                <div key={p.id} className="py-2 text-xs text-ink-400 border-t border-ink-100 dark:border-ink-700 text-center">
                  None listed
                </div>
              ))}
            </>
          ) : (
            allPackageTitles.map((title) => (
              <Fragment key={title}>
                <div
                  className="flex items-center text-sm font-medium text-ink-500 py-2 border-t border-ink-100 dark:border-ink-700"
                >
                  {title}
                </div>
                {planners.map((p) => {
                  const pkg = p.packages.find((x) => x.title === title);
                  return (
                    <div
                      key={`${p.id}-${title}`}
                      className="py-2 text-center border-t border-ink-100 dark:border-ink-700"
                    >
                      {pkg ? (
                        <div>
                          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                            ₹{pkg.price}
                          </p>
                          <button
                            onClick={() => handleBook(p.id, pkg.id)}
                            disabled={booking === pkg.id}
                            className="text-xs bg-black dark:bg-white dark:text-ink-900 text-white rounded-lg px-2.5 py-1 mt-1 disabled:opacity-50"
                          >
                            {booking === pkg.id ? "Booking..." : "Book"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))
          )}
        </div>
      </div>

      {!eventId && (
        <p className="text-xs text-amber-600 mt-4">
          Tip: open Compare from inside one of your events to book directly from here.
        </p>
      )}
    </div>
  );
}
