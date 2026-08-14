import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiClient } from "@/lib/api-client";

interface Planner {
  id: number;
  business_name: string;
  category: string;
  city: string;
  about: string;
  experience_years: number;
  is_verified: boolean;
}

export default function MarketplacePage() {
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");

  useEffect(() => {
    const fetchPlanners = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get("/planners/", {
          params: search ? { search } : {},
        });
        setPlanners(data.results ?? data);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchPlanners, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Planner Marketplace</h1>

      <input
        className="w-full max-w-sm border rounded-lg px-3 py-2 mb-6"
        placeholder="Search by name or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-neutral-500">Loading planners...</p>
      ) : planners.length === 0 ? (
        <p className="text-neutral-500">No planners found yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {planners.map((p) => (
            <Link
              key={p.id}
              to={eventId ? `/planners/${p.id}?event=${eventId}` : `/planners/${p.id}`}
              className="border rounded-xl p-4 bg-white hover:border-black transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">{p.business_name}</h2>
                {p.is_verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500 capitalize">{p.category.replace("_", " ")}</p>
              <p className="text-sm text-neutral-500">{p.city}</p>
              <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{p.about || "No description yet."}</p>
              <p className="text-xs text-neutral-400 mt-2">{p.experience_years} yrs experience</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
