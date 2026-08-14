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
    <div className="min-h-screen bg-[#FCFAFF] text-[#17142A] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E9E4F5] rounded-[16px] p-8 text-center shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
        <img src="/images/celebro_icon.png" alt="Celebro" className="h-16 w-auto object-contain mx-auto mb-3" />


        <p className="text-xs uppercase tracking-[0.25em] text-[#5B21B6] font-bold mb-1">
          You're Invited To
        </p>
        <h1 className="font-display text-3xl font-bold text-[#17142A]">{event.name}</h1>
        <p className="text-xs text-[#6B6780] font-semibold uppercase tracking-wider mt-1">{event.event_type.replace(/_/g, " ")}</p>

        <div className="mt-6 p-4 rounded-[12px] bg-[#F5F3FF] border border-[#E9E4F5] text-sm text-[#17142A] space-y-1.5 font-medium">
          <p className="font-bold">{new Date(event.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          {event.time && <p className="text-[#5B21B6] font-bold">⏰ {event.time}</p>}
          {event.venue && <p>📍 {event.venue}</p>}
          {event.theme && <p className="text-xs text-[#6B6780]">Theme: {event.theme}</p>}
        </div>

        {event.custom_message && (
          <p className="mt-4 text-xs text-[#6B6780] italic leading-relaxed font-medium">"{event.custom_message}"</p>
        )}

        <div className="mt-8 border-t border-[#E9E4F5] pt-6">
          {submitted ? (
            <div className="p-4 rounded-[12px] bg-[#3A8D68]/10 text-[#3A8D68] font-bold text-sm border border-[#3A8D68]/20">
              ✓ Thanks — your RSVP has been recorded!
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-bold text-[#17142A]">Will you be attending?</p>
              <input
                className="input-field"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="input-field"
                placeholder="Phone or email (optional)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
              <div className="flex gap-3 justify-center pt-2">
                <button
                  className="btn-primary flex-1 py-3"
                  disabled={submitting}
                  onClick={() => submitRsvp("confirmed")}
                >
                  ✓ Accept Invitation
                </button>
                <button
                  className="btn-secondary flex-1 py-3"
                  disabled={submitting}
                  onClick={() => submitRsvp("declined")}
                >
                  ✕ Decline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
