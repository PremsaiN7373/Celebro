import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

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

export default function PlannerDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event"); // which event we're booking for
  const navigate = useNavigate();

  const [planner, setPlanner] = useState<Planner | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

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
  }, [id]);

  const handleBook = async (packageId: number) => {
    if (!eventId) {
      toast.error("Open this planner from one of your events to book them.");
      return;
    }
    setBooking(true);
    try {
      await apiClient.post("/bookings/", {
        event: Number(eventId),
        planner: Number(id),
        package: packageId,
      });
      toast.success("Booking requested!");
      navigate(`/events/${eventId}`);
    } catch {
      toast.error("Could not create booking");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;
  if (!planner) return <p className="text-neutral-500">Planner not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">{planner.business_name}</h1>
        {planner.is_verified && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Verified
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-500 capitalize">{planner.category.replace("_", " ")}</p>
      <p className="text-sm text-neutral-500">{planner.city}</p>
      <p className="text-sm text-neutral-600 mt-3">{planner.about || "No description yet."}</p>
      <p className="text-xs text-neutral-400 mt-1">{planner.experience_years} yrs experience</p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Packages</h2>
      {planner.packages.length === 0 ? (
        <p className="text-neutral-500 text-sm">This planner hasn't added any packages yet.</p>
      ) : (
        <div className="space-y-3">
          {planner.packages.map((pkg) => (
            <div key={pkg.id} className="border rounded-xl p-4 bg-white flex items-center justify-between">
              <div>
                <p className="font-medium">{pkg.title}</p>
                <p className="text-sm text-neutral-500">{pkg.description}</p>
                <p className="text-sm font-semibold mt-1">₹{pkg.price}</p>
              </div>
              <button
                className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                disabled={booking}
                onClick={() => handleBook(pkg.id)}
              >
                {booking ? "Booking..." : "Book Now"}
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mt-8 mb-3">
        Reviews {reviews.length > 0 && (
          <span className="text-sm text-neutral-500 font-normal">
            ({(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}★, {reviews.length} review{reviews.length > 1 ? "s" : ""})
          </span>
        )}
      </h2>
      {reviews.length === 0 ? (
        <p className="text-neutral-500 text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="border rounded-xl p-3 bg-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{r.customer_name}</p>
                <p className="text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              </div>
              {r.comment && <p className="text-sm text-neutral-600 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {!eventId && (
        <p className="text-xs text-amber-600 mt-4">
          Tip: open this planner from inside one of your events to book them directly.
        </p>
      )}
    </div>
  );
}
