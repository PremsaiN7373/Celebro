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
  cover_image_url: string;
  logo_url: string;
}

export default function PlannerProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    business_name: "",
    category: "decoration",
    city: "",
    about: "",
    experience_years: 0,
    cover_image_url: "",
    logo_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const uploadToast = toast.loading("Uploading business logo...");
    try {
      const { data } = await apiClient.post("/planners/upload-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile((prev) => ({ ...prev, logo_url: data.url }));
      toast.success("Logo uploaded!", { id: uploadToast });
    } catch {
      toast.error("Upload failed", { id: uploadToast });
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const uploadToast = toast.loading("Uploading cover banner...");
    try {
      const { data } = await apiClient.post("/planners/upload-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile((prev) => ({ ...prev, cover_image_url: data.url }));
      toast.success("Cover image uploaded!", { id: uploadToast });
    } catch {
      toast.error("Upload failed", { id: uploadToast });
    }
  };

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
      <h1 className="text-2xl font-semibold mb-2 font-display">Your Planner Profile</h1>
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

        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Business Logo</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
              />
              {profile.logo_url && (
                <img
                  src={profile.logo_url}
                  alt="Logo preview"
                  className="w-10 h-10 object-cover rounded-full border shrink-0"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Cover Banner Photo</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
              />
              {profile.cover_image_url && (
                <img
                  src={profile.cover_image_url}
                  alt="Cover preview"
                  className="w-16 h-10 object-cover rounded-lg border shrink-0"
                />
              )}
            </div>
          </div>
        </div>

        <button
          className="btn-primary mt-4"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
