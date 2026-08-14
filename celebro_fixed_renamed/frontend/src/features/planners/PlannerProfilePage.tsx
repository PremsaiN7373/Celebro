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
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.get("/planners/");
        const mine = (data.results ?? data)[0];
        if (mine) {
          setProfile(mine);
          setHasProfile(true);
        }
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
      if (hasProfile && profile.id) {
        await apiClient.patch(`/planners/${profile.id}/`, profile);
      } else {
        const { data } = await apiClient.post("/planners/", profile);
        setProfile(data);
        setHasProfile(true);
      }
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
      <h1 className="text-2xl font-semibold mb-6">Your Planner Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Business name"
          value={profile.business_name}
          onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
          required
        />
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={profile.category}
          onChange={(e) => setProfile({ ...profile, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace("_", " ")}</option>
          ))}
        </select>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="City"
          value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          required
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          placeholder="About your business"
          rows={4}
          value={profile.about}
          onChange={(e) => setProfile({ ...profile, about: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="number"
          min={0}
          placeholder="Years of experience"
          value={profile.experience_years}
          onChange={(e) => setProfile({ ...profile, experience_years: Number(e.target.value) })}
        />
        <button
          className="bg-black text-white rounded-lg px-4 py-2 disabled:opacity-50"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
