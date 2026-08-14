import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

interface Event {
  id: number;
  name: string;
  event_type: string;
  date: string;
  venue: string;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.get("/events/");
        setEvents(data.results ?? data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Your Celebrations</h1>
          <p className="text-sm text-ink-500 mt-0.5">Everything you're planning, in one place.</p>
        </div>
        <Link to="/events/create" className="btn-primary">
          + Create Event
        </Link>
      </div>

      {loading ? (
        <p className="text-ink-400 text-sm">Loading...</p>
      ) : events.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-500">No celebrations yet.</p>
          <Link to="/events/create" className="btn-primary inline-block mt-4">
            Create your first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <Link
                to={`/events/${e.id}`}
                className="card p-5 block hover:border-ink-300 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-150"
              >
                <p className="text-xs uppercase tracking-wide text-accent-600 font-medium mb-1">
                  {e.event_type.replace(/_/g, " ")}
                </p>
                <h2 className="font-display text-lg text-ink-900">{e.name}</h2>
                <p className="text-sm text-ink-500 mt-2">{e.date}</p>
                <p className="text-sm text-ink-400">{e.venue || "Venue TBD"}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
