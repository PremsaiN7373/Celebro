import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url?: string;
}

export default function PlannerPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/planners/packages/");
      setPackages(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const uploadToast = toast.loading("Uploading package photo...");
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
      await apiClient.post("/planners/packages/", {
        title,
        description,
        price: Number(price),
        image_url: imageUrl,
      });
      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      toast.success("Package added");
      loadPackages();
    } catch (err: any) {
      const detail =
        err?.response?.data?.non_field_errors?.[0] ||
        "Could not add package — make sure your planner profile is saved first.";
      toast.error(detail);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/planners/packages/${id}/`);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      toast.success("Package removed");
    } catch {
      toast.error("Could not remove package");
    }
  };

  return (
    <div className="max-w-6xl w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#17142A]">Your Packages</h1>
        <p className="text-sm text-[#6B6780] font-medium mt-1">
          Create, edit, and offer services packages to showcase in the planner marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Add package form */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E9E4F5] rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="font-display text-lg font-bold text-[#17142A] border-b border-[#F5F3FF] pb-3">Create New Package</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Package Title</label>
                <input
                  className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none"
                  placeholder="e.g. Premium Wedding Decoration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">What's Included</label>
                <textarea
                  className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none"
                  placeholder="Describe inclusions (e.g. Stage backdrop, centerpieces, floral arches, basic lightings...)"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Package Price (₹)</label>
                <input
                  className="w-full border border-[#E9E4F5] rounded-xl px-4 py-2.5 text-sm bg-[#FCFAFF] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all outline-none"
                  type="number"
                  min={0}
                  placeholder="e.g. 75000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block">Cover Photo</label>
                <div className="border-2 border-dashed border-[#E9E4F5] rounded-xl p-4 flex flex-col items-center justify-center bg-[#FAF9FF] hover:bg-[#F3EEFF] transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imageUrl ? (
                    <div className="flex items-center gap-3 w-full">
                      <img src={imageUrl} alt="Package cover" className="w-12 h-12 object-cover rounded-lg border border-[#E9E4F5] bg-white shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#17142A] truncate">Cover Photo Uploaded</p>
                        <p className="text-[10px] text-[#6B6780]">Click to replace image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-xl">📸</span>
                      <p className="text-xs font-bold text-[#8B5CF6] mt-1 group-hover:underline">Upload Cover Photo</p>
                      <p className="text-[9px] text-[#6B6780] mt-0.5">Supports PNG, JPG, JPEG (Optional)</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-xs disabled:opacity-50 mt-2 hover:scale-102 active:scale-98 transition-all"
                type="submit"
                disabled={adding}
              >
                {adding ? "Creating..." : "Add Package"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Package listing cards */}
        <div className="lg:col-span-7 space-y-5">
          <h2 className="font-display text-lg font-bold text-[#17142A] border-b border-[#F5F3FF] pb-3">Active Packages</h2>

          {loading ? (
            <p className="text-neutral-500 font-semibold">Loading packages...</p>
          ) : packages.length === 0 ? (
            <div className="bg-white border border-[#E9E4F5] rounded-2xl p-10 text-center shadow-2xs">
              <p className="text-[#17142A] font-bold text-lg">No active packages yet</p>
              <p className="text-[#6B6780] text-sm mt-1">Use the form on the left to add your first service package.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white border border-[#E9E4F5] rounded-2xl overflow-hidden shadow-2xs hover:border-[#8B5CF6]/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-100 to-indigo-50 relative shrink-0">
                    {pkg.image_url ? (
                      <img
                        src={pkg.image_url}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl select-none opacity-40">
                        🎁
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-red-50 text-[#C94B63] hover:text-red-600 rounded-full backdrop-blur-xs shadow-2xs hover:scale-110 transition-all"
                      title="Delete package"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-display text-base font-bold text-[#17142A] leading-snug">{pkg.title}</h3>
                      <p className="text-xs text-[#6B6780] mt-1.5 line-clamp-3 leading-relaxed">
                        {pkg.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F5F3FF] flex items-center justify-between">
                      <span className="text-xs text-[#6B6780] font-semibold">Pricing</span>
                      <span className="text-base font-extrabold text-[#17142A]">
                        ₹{Number(pkg.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
