import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

const EVENT_TYPES = [
  { value: "birthday", label: "Birthday Party", emoji: "🎂" },
  { value: "surprise_birthday", label: "Surprise Birthday", emoji: "🎉" },
  { value: "anniversary", label: "Anniversary", emoji: "💍" },
  { value: "baby_shower", label: "Baby Shower", emoji: "🍼" },
  { value: "proposal", label: "Proposal", emoji: "💐" },
  { value: "housewarming", label: "Housewarming", emoji: "🏡" },
  { value: "graduation", label: "Graduation Party", emoji: "🎓" },
  { value: "farewell", label: "Farewell Party", emoji: "👋" },
  { value: "family_gathering", label: "Family Gathering", emoji: "👨‍👩‍👧‍👦" },
  { value: "corporate_party", label: "Corporate Party", emoji: "🏢" },
  { value: "product_launch", label: "Product Launch", emoji: "🚀" },
  { value: "team_celebration", label: "Team Celebration", emoji: "🥂" },
  { value: "office_anniversary", label: "Office Anniversary", emoji: "🏆" },
  { value: "employee_appreciation", label: "Employee Appreciation", emoji: "🌟" },
  { value: "networking", label: "Networking Event", emoji: "🤝" },
  { value: "custom", label: "Custom Celebration", emoji: "✨" },
];

interface EventForm {
  event_type: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  budget: string;
  guest_count: number;
  theme: string;
  notes: string;
}

const initialForm: EventForm = {
  event_type: "",
  name: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  budget: "",
  guest_count: 0,
  theme: "",
  notes: "",
};

const STEPS = ["Type", "Details", "Confirm"];

export default function CreateEventPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const update = (field: keyof EventForm, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleCreate = async () => {
    setCreating(true);
    try {
      await apiClient.post("/events/", {
        ...form,
        budget: form.budget ? Number(form.budget) : null,
        time: form.time || null,
      });
      toast.success("Event created!");
      navigate("/dashboard");
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        (err?.response?.status === 403
          ? "Your account isn't set up as a Customer — only customers can create events."
          : "Could not create event");
      toast.error(detail);
    } finally {
      setCreating(false);
    }
  };

  const selectedType = EVENT_TYPES.find((t) => t.value === form.event_type);

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${
                    active
                      ? "bg-ink-900 text-white"
                      : done
                      ? "bg-accent-500 text-white"
                      : "bg-ink-100 text-ink-400"
                  }`}
                >
                  {done ? "✓" : n}
                </div>
                <span className={`text-sm ${active ? "text-ink-900 font-medium" : "text-ink-400"}`}>
                  {label}
                </span>
              </div>
              {n < STEPS.length && <div className="h-px flex-1 bg-ink-200" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <h1 className="font-display text-2xl text-ink-900 mb-1">What are you celebrating?</h1>
            <p className="text-sm text-ink-500 mb-6">Pick the type that fits best.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    update("event_type", t.value);
                    setStep(2);
                  }}
                  className={`card p-4 text-left hover:border-ink-300 hover:shadow-soft transition-all duration-150 ${
                    form.event_type === t.value ? "border-ink-900 ring-1 ring-ink-900" : ""
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <p className="text-sm font-medium text-ink-800 mt-2">{t.label}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <h1 className="font-display text-2xl text-ink-900 mb-1">Event details</h1>
            <p className="text-sm text-ink-500 mb-6">
              {selectedType?.emoji} {selectedType?.label}
            </p>
            <div className="space-y-4">
              <input
                className="input-field"
                placeholder="Event name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
              <textarea
                className="input-field"
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field"
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  type="time"
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                />
              </div>
              <input
                className="input-field"
                placeholder="Venue"
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input-field"
                  type="number"
                  placeholder="Budget (₹)"
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                />
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  placeholder="Guest count"
                  value={form.guest_count}
                  onChange={(e) => update("guest_count", Number(e.target.value))}
                />
              </div>
              <input
                className="input-field"
                placeholder="Theme (optional)"
                value={form.theme}
                onChange={(e) => update("theme", e.target.value)}
              />
              <textarea
                className="input-field"
                placeholder="Notes (optional)"
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
            <div className="flex justify-between mt-8">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="btn-primary"
                disabled={!form.name || !form.date}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <h1 className="font-display text-2xl text-ink-900 mb-1">Confirm your celebration</h1>
            <p className="text-sm text-ink-500 mb-6">Double check the details before creating.</p>

            <div className="card p-5 space-y-3">
              <SummaryRow label="Type" value={`${selectedType?.emoji} ${selectedType?.label}`} />
              <SummaryRow label="Name" value={form.name} />
              <SummaryRow label="Date" value={`${form.date}${form.time ? ` · ${form.time}` : ""}`} />
              <SummaryRow label="Venue" value={form.venue || "—"} />
              <SummaryRow label="Budget" value={form.budget ? `₹${form.budget}` : "—"} />
              <SummaryRow label="Guests" value={String(form.guest_count)} />
              <SummaryRow label="Theme" value={form.theme || "—"} />
            </div>

            <div className="flex justify-between mt-8">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="btn-primary" disabled={creating} onClick={handleCreate}>
                {creating ? "Creating..." : "Create celebration"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-400">{label}</span>
      <span className="text-ink-800 font-medium">{value}</span>
    </div>
  );
}
