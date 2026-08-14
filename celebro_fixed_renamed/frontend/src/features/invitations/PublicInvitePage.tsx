import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface PublicEvent {
  name: string;
  event_type: string;
  date: string;
  time: string | null;
  venue: string;
  theme: string;
  custom_message: string;
}

export default function PublicInvitePage() {
  const { uuid } = useParams();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.get(`/invitations/public/${uuid}/`);
        setEvent(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uuid]);

  const submitRsvp = async (status: "confirmed" | "declined") => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(`/invitations/public/${uuid}/rsvp/`, {
        name,
        contact,
        rsvp_status: status,
      });
      setSubmitted(true);
      toast.success(status === "confirmed" ? "You're confirmed!" : "RSVP recorded");
    } catch {
      toast.error("Could not submit RSVP");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Loading invitation...</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">This invitation link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border rounded-2xl p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">
          You're invited to
        </p>
        <h1 className="text-2xl font-semibold">{event.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">{event.event_type}</p>

        <div className="mt-6 text-sm text-neutral-700 space-y-1">
          <p>{new Date(event.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          {event.time && <p>{event.time}</p>}
          {event.venue && <p>{event.venue}</p>}
          {event.theme && <p className="text-neutral-500">Theme: {event.theme}</p>}
        </div>

        {event.custom_message && (
          <p className="mt-4 text-sm text-neutral-600 italic">"{event.custom_message}"</p>
        )}

        <div className="mt-8 border-t pt-6">
          {submitted ? (
            <p className="text-sm text-green-700">Thanks — your RSVP has been recorded!</p>
          ) : (
            <>
              <p className="text-sm font-medium mb-3">Will you be attending?</p>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                placeholder="Phone or email (optional)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
              <div className="flex gap-2 justify-center">
                <button
                  className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                  disabled={submitting}
                  onClick={() => submitRsvp("confirmed")}
                >
                  Accept
                </button>
                <button
                  className="border rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                  disabled={submitting}
                  onClick={() => submitRsvp("declined")}
                >
                  Decline
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
