import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface PortfolioPhoto {
  id: number;
  image_url: string;
  caption: string;
}

export default function PlannerPortfolioPage() {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [adding, setAdding] = useState(false);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/planners/portfolio/");
      setPhotos(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const uploadToast = toast.loading("Uploading portfolio photo...");
    try {
      const { data } = await apiClient.post("/planners/upload-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setImageUrl(data.url);
      toast.success("Photo uploaded!", { id: uploadToast });
    } catch {
      toast.error("Upload failed", { id: uploadToast });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiClient.post("/planners/portfolio/", { image_url: imageUrl, caption });
      setImageUrl("");
      setCaption("");
      toast.success("Added to portfolio");
      loadPhotos();
    } catch {
      toast.error("Could not add photo — check the URL is a valid image link");
    } finally {
      setAdding(false);
    }
  };

  const removePhoto = async (id: number) => {
    try {
      await apiClient.delete(`/planners/portfolio/${id}/`);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Could not remove photo");
    }
  };

  return (
    <div className="max-w-6xl w-full space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#2e1065] via-[#1e1b4b] to-[#120e2e] text-white rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10 max-w-2xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D8B4FE]">Luxury Showcase</span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Your Creative Portfolio</h2>
          <p className="text-xs text-[#C084FC] font-medium leading-relaxed mt-1">
            Showcase your finest weddings, birthdays, and decor setups. High-resolution imagery builds trust and helps celebrators select you on the marketplace.
          </p>
        </div>
        
        <div className="flex gap-4 shrink-0 relative z-10">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Photos</p>
            <p className="text-xl font-extrabold mt-1">{photos.length} Items</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[90px]">
            <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider">Visibility</p>
            <p className="text-xl font-extrabold text-green-400 mt-1">Public</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E9E4F5] rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="font-display text-lg font-bold text-[#17142A] border-b border-[#F5F3FF] pb-3">Add Portfolio Photo</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Upload Photo File</label>
                <div className="border-2 border-dashed border-[#E9E4F5] rounded-xl p-4 flex flex-col items-center justify-center bg-[#FAF9FF] hover:bg-[#F3EEFF] transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imageUrl ? (
                    <div className="flex items-center gap-3 w-full">
                      <img src={imageUrl} alt="Portfolio preview" className="w-12 h-12 object-cover rounded-lg border border-[#E9E4F5] bg-white shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#17142A] truncate">Photo Uploaded</p>
                        <p className="text-[10px] text-[#6B6780]">Click to replace image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-xl">📸</span>
                      <p className="text-xs font-bold text-[#8B5CF6] mt-1 group-hover:underline">Upload Photo File</p>
                      <p className="text-[9px] text-[#6B6780] mt-0.5">PNG, JPG, JPEG (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-[#A78BFA] font-extrabold text-center uppercase tracking-widest my-1">— OR USE EXTERNAL URL —</div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Image URL</label>
                <input
                  className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Caption</label>
                <input
                  className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none"
                  placeholder="Describe this celebration photo (e.g. Royal Banquet Table Arrangement)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-xs disabled:opacity-50 mt-2 hover:scale-102 active:scale-98 transition-all"
                type="submit"
                disabled={adding}
              >
                {adding ? "Adding..." : "Add to Portfolio"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Grid list */}
        <div className="lg:col-span-7 space-y-5">
          <h2 className="font-display text-lg font-bold text-[#17142A] border-b border-[#F5F3FF] pb-3">Active Showcase</h2>

          {loading ? (
            <p className="text-neutral-500 font-semibold">Loading portfolio...</p>
          ) : photos.length === 0 ? (
            <div className="bg-white border border-[#E9E4F5] rounded-2xl p-10 text-center shadow-2xs">
              <p className="text-[#17142A] font-bold text-lg">No portfolio photos yet</p>
              <p className="text-[#6B6780] text-sm mt-1">Use the editor on the left to build your photo showcase.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white border border-[#E9E4F5] rounded-2xl overflow-hidden shadow-2xs hover:border-[#8B5CF6]/30 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-[#FAF9FF] overflow-hidden shrink-0">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Portfolio item"}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-white/80 hover:bg-red-50 text-[#C94B63] hover:text-red-600 rounded-full backdrop-blur-xs shadow-2xs hover:scale-110 transition-all"
                      title="Delete photo"
                    >
                      🗑️
                    </button>
                  </div>

                  {photo.caption && (
                    <div className="p-3 bg-white border-t border-[#F5F3FF] shrink-0">
                      <p className="text-xs font-bold text-[#17142A] truncate">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
