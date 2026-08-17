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
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ink-900 dark:text-white mb-1 font-semibold">
        Your Portfolio
      </h1>
      <p className="text-sm text-ink-500 mb-6">
        Showcase past work — this shows on your public profile for customers browsing the Marketplace.
      </p>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-8 border rounded-xl p-4 bg-white max-w-xl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Upload Photo file</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Upload preview"
                className="w-10 h-10 object-cover rounded-lg border shrink-0"
              />
            )}
          </div>
        </div>

        <div className="text-xs text-neutral-400 font-semibold text-center my-1">— OR USE EXTERNAL URL —</div>

        <input
          className="input-field w-full"
          placeholder="Image URL (https://...)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <input
          className="input-field w-full"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button className="btn-primary self-start" disabled={adding} type="submit">
          {adding ? "Adding..." : "Add photo"}
        </button>
      </form>

      {loading ? (
        <p className="text-ink-400 text-sm">Loading portfolio...</p>
      ) : photos.length === 0 ? (
        <p className="text-ink-400 text-sm">No portfolio photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.image_url}
                alt={photo.caption || "Portfolio photo"}
                className="w-full h-32 object-cover rounded-lg border border-ink-200 dark:border-ink-700"
              />
              {photo.caption && (
                <p className="text-xs text-ink-500 mt-1 truncate">{photo.caption}</p>
              )}
              <button
                className="absolute top-1 right-1 bg-white/90 text-red-500 text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(photo.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
