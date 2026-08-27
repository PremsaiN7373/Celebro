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
    <div className="max-w-6xl w-full space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#2e1065] via-[#1e1b4b] to-[#120e2e] text-white rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D8B4FE]">Profile Management</span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Your Business Profile</h2>
          <p className="text-xs text-[#C084FC] font-medium leading-relaxed mt-1">
            Update your business category, logo, banner, and details. Changes are updated immediately across the client marketplace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-[#E9E4F5] rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="font-display text-lg font-bold text-[#17142A] border-b border-[#F5F3FF] pb-3">Edit Business Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Business Name</label>
                <input
                  className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none font-medium"
                  placeholder="Business name"
                  value={profile.business_name}
                  onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Category</label>
                  <select
                    className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none font-medium capitalize"
                    value={profile.category}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">City</label>
                  <input
                    className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none font-medium"
                    placeholder="City"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">About your business</label>
                <textarea
                  className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none font-medium"
                  placeholder="Describe your design aesthetics, logistics processes, and event specialties..."
                  rows={4}
                  value={profile.about}
                  onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Years of experience</label>
                <input
                  className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none font-medium"
                  type="number"
                  min={0}
                  placeholder="Years of experience"
                  value={profile.experience_years}
                  onChange={(e) => setProfile({ ...profile, experience_years: Number(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F5F3FF] pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Business Logo</label>
                  <div className="border-2 border-dashed border-[#E9E4F5] rounded-xl p-4 flex flex-col items-center justify-center bg-[#FAF9FF] hover:bg-[#F3EEFF] transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {profile.logo_url ? (
                      <div className="flex items-center gap-3 w-full">
                        <img src={profile.logo_url} alt="Logo" className="w-12 h-12 object-cover rounded-full border border-[#E9E4F5] bg-white shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#17142A]">Logo Uploaded</p>
                          <p className="text-[10px] text-[#6B6780]">Click to replace logo</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs font-bold text-[#8B5CF6] group-hover:underline">Upload Logo</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Cover Banner Photo</label>
                  <div className="border-2 border-dashed border-[#E9E4F5] rounded-xl p-4 flex flex-col items-center justify-center bg-[#FAF9FF] hover:bg-[#F3EEFF] transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {profile.cover_image_url ? (
                      <div className="flex items-center gap-3 w-full">
                        <img src={profile.cover_image_url} alt="Cover preview" className="w-16 h-10 object-cover rounded-lg border border-[#E9E4F5] bg-white shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#17142A]">Cover Photo Uploaded</p>
                          <p className="text-[10px] text-[#6B6780]">Click to replace banner</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs font-bold text-[#8B5CF6] group-hover:underline">Upload Cover Banner</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-xs disabled:opacity-50 mt-4 hover:scale-102 active:scale-98 transition-all"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        </div>

        {/* Right side: Real-time Profile Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#17142A] border-b border-[#F5F3FF] pb-3">Public Preview</h2>
          <div className="bg-white border border-[#E9E4F5] rounded-[24px] overflow-hidden shadow-soft flex flex-col justify-between">
            {/* Cover Image */}
            <div className="h-44 bg-gradient-to-br from-purple-100 to-indigo-50 relative shrink-0">
              {profile.cover_image_url ? (
                <img src={profile.cover_image_url} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl select-none opacity-20">🌸</div>
              )}
              
              {/* Logo overlay */}
              <div className="absolute -bottom-8 left-6 p-0.5 rounded-full border border-purple-200 bg-white shadow-2xs">
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded-full" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#FAF9FF] flex items-center justify-center text-xl font-extrabold text-[#8B5CF6]">
                    {profile.business_name ? profile.business_name.slice(0,1).toUpperCase() : "C"}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Card Body */}
            <div className="p-6 pt-12 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#8B5CF6] bg-[#F5F3FF] border border-purple-100 px-2.5 py-0.5 rounded-full inline-block">
                    {profile.category.replace("_", " ")}
                  </span>
                  {profile.experience_years > 0 && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      ✨ {profile.experience_years} Yrs Exp
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-[#17142A] leading-snug mt-3">
                  {profile.business_name || "Your Business Name"}
                </h3>
                <p className="text-xs text-[#6B6780] font-semibold flex items-center gap-1.5 mt-1">
                  <span>📍</span> {profile.city || "Location unspecified"}
                </p>
                <p className="text-xs text-[#6B6780] mt-3 line-clamp-4 leading-relaxed">
                  {profile.about || "Your business description will display here."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
