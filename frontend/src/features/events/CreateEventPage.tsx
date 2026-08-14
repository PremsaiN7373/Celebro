import { useState, useEffect } from "react";
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

interface Template {
  id: number;
  name: string;
  event_type: string;
  theme: string;
  notes: string;
}

export default function CreateEventPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/events/templates/")
      .then(({ data }) => setTemplates(data.results ?? data))
      .catch(() => {});
  }, []);

  const applyTemplate = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setSelectedTemplateId(templateId);
    setForm((f) => ({
      ...f,
      event_type: template.event_type,
      theme: template.theme,
      notes: template.notes,
    }));
    setStep(2);
  };

  const update = (field: keyof EventForm, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleCreate = async () => {
    setCreating(true);
    try {
      await apiClient.post("/events/", {
        ...form,
        budget: form.budget ? Number(form.budget) : null,
        time: form.time || null,
        template_id: selectedTemplateId,
      });
      toast.success("Event created successfully!");
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
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    active
                      ? "bg-[#5B21B6] text-white shadow-xs"
                      : done
                      ? "bg-[#3A8D68] text-white"
                      : "bg-white text-[#6B6780] border border-[#E9E4F5]"
                  }`}
                >
                  {done ? "✓" : n}
                </div>
                <span className={`text-sm font-semibold ${active ? "text-[#17142A] font-bold" : "text-[#6B6780]"}`}>
                  {label}
                </span>
              </div>
              {n < STEPS.length && <div className="h-px flex-1 bg-[#E9E4F5]" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#5B21B6] block mb-1">Step 1 of 3</span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">What are you celebrating?</h1>
              <p className="text-sm text-[#6B6780] mt-1 font-medium">Select an occasion to customize your event workspace.</p>
            </div>

            {templates.length > 0 && (
              <div className="p-4 border border-[#E9E4F5] rounded-[16px] bg-white shadow-xs">
                <p className="text-xs font-bold text-[#5B21B6] uppercase tracking-wider mb-2">Or start from a saved template</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t.id)}
                      className="text-xs font-bold border border-[#E9E4F5] rounded-[10px] px-3 py-2 bg-[#F5F3FF] hover:border-[#5B21B6] text-[#17142A] transition-colors"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    update("event_type", t.value);
                    setSelectedTemplateId(null);
                    setStep(2);
                  }}
                  className={`bg-white border rounded-[16px] p-5 text-left hover:border-[#5B21B6] hover:-translate-y-1 transition-all duration-200 group shadow-[0_4px_20px_rgba(91,33,182,0.06)] ${
                    form.event_type === t.value ? "border-[#5B21B6] ring-2 ring-[#5B21B6]/20" : "border-[#E9E4F5]"
                  }`}
                >
                  <span className="text-3xl block group-hover:scale-110 transition-transform">{t.emoji}</span>
                  <p className="text-sm font-bold text-[#17142A] mt-3 group-hover:text-[#5B21B6] transition-colors">{t.label}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#5B21B6] block mb-1">
                {selectedType?.emoji} {selectedType?.label}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">Event Details</h1>
              <p className="text-sm text-[#6B6780] mt-1 font-medium">Specify date, venue, guest count, and estimated budget.</p>
            </div>

            <div className="space-y-4 bg-white border border-[#E9E4F5] rounded-[16px] p-6 shadow-xs">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Event Title</label>
                <input
                  className="input-field"
                  placeholder="e.g. Sarah's Golden 30th Birthday"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Description</label>
                <textarea
                  className="input-field"
                  placeholder="Describe your vision or special surprise instructions..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Date</label>
                  <input
                    className="input-field"
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Time</label>
                  <input
                    className="input-field"
                    type="time"
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Venue Location</label>
                <input
                  className="input-field"
                  placeholder="e.g. Grand Palace Hotel Ballroom or Private Residence"
                  value={form.venue}
                  onChange={(e) => update("venue", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Target Budget (₹)</label>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="50,000"
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Estimated Guests</label>
                  <input
                    className="input-field"
                    type="number"
                    min={0}
                    placeholder="50"
                    value={form.guest_count}
                    onChange={(e) => update("guest_count", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Theme Style (Optional)</label>
                <input
                  className="input-field"
                  placeholder="e.g. Hollywood Glamour, Royal Gold & Lavender, Neon Nights"
                  value={form.theme}
                  onChange={(e) => update("theme", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="btn-primary"
                disabled={!form.name || !form.date}
                onClick={() => setStep(3)}
              >
                Continue to Review ➔
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#5B21B6] block mb-1">Final Step</span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">Confirm Celebration</h1>
              <p className="text-sm text-[#6B6780] mt-1 font-medium">Review your event parameters before initializing your workspace.</p>
            </div>

            <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-7 space-y-4 shadow-sm">
              <SummaryRow label="Occasion Type" value={`${selectedType?.emoji} ${selectedType?.label}`} />
              <SummaryRow label="Event Name" value={form.name} />
              <SummaryRow label="Scheduled Date" value={`${form.date}${form.time ? ` at ${form.time}` : ""}`} />
              <SummaryRow label="Venue Location" value={form.venue || "TBD"} />
              <SummaryRow label="Target Budget" value={form.budget ? `₹${Number(form.budget).toLocaleString()}` : "Flexible"} />
              <SummaryRow label="Guest Count" value={String(form.guest_count || 0)} />
              <SummaryRow label="Decor Theme" value={form.theme || "Custom Experience"} />
            </div>

            <div className="flex justify-between pt-4">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="btn-primary" disabled={creating} onClick={handleCreate}>
                {creating ? "Initializing Workspace..." : "🎉 Create Celebration"}
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
    <div className="flex items-center justify-between text-sm py-2 border-b border-[#E9E4F5] last:border-0">
      <span className="text-[#6B6780] font-medium">{label}</span>
      <span className="text-[#17142A] font-bold">{value}</span>
    </div>
  );
}




