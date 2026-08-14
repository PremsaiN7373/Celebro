import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

const CATEGORIES = [
  "decoration", "balloon_decor", "photography", "videography", "dj",
  "live_music", "catering", "cake_shop", "magician", "anchor",
  "lighting", "stage_decor", "entertainment",
];

interface Profile {
  id?: number;
  business_name: string;
  category: string;
  city: string;
  about: string;
  experience_years: number;
}

export default function PlannerProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    business_name: "",
    category: "decoration",
    city: "",
    about: "",
    experience_years: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Always fetches THIS logged-in planner's own profile — never
        // another planner's listing. The backend creates an empty one
        // automatically on first visit if none exists yet.
        const { data } = await apiClient.get("/planners/me/");
        setProfile(data);
      } catch {
        toast.error("Could not load your profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiClient.patch("/planners/me/", profile);
      setProfile(data);
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-2">Your Planner Profile</h1>
      {profile.id && (
        <p className="text-xs text-ink-400 mb-6">Editing your profile — listing #{profile.id}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input-field"
          placeholder="Business name"
          value={profile.business_name}
          onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
          required
        />
        <select
          className="input-field"
          value={profile.category}
          onChange={(e) => setProfile({ ...profile, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace("_", " ")}</option>
          ))}
        </select>
        <input
          className="input-field"
          placeholder="City"
          value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          required
        />
        <textarea
          className="input-field"
          placeholder="About your business"
          rows={4}
          value={profile.about}
          onChange={(e) => setProfile({ ...profile, about: e.target.value })}
        />
        <input
          className="input-field"
          type="number"
          min={0}
          placeholder="Years of experience"
          value={profile.experience_years}
          onChange={(e) => setProfile({ ...profile, experience_years: Number(e.target.value) })}
        />
        <button
          className="btn-primary"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
