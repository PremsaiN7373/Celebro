import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
}

export default function PlannerPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiClient.post("/planners/packages/", {
        title,
        description,
        price: Number(price),
      });
      setTitle("");
      setDescription("");
      setPrice("");
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
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Your Packages</h1>

      <form onSubmit={handleAdd} className="space-y-3 mb-8 border rounded-xl p-4 bg-white">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Package title (e.g. Standard Decoration)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="What's included"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          type="number"
          min={0}
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button
          className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          type="submit"
          disabled={adding}
        >
          {adding ? "Adding..." : "Add package"}
        </button>
      </form>

      {loading ? (
        <p className="text-neutral-500">Loading packages...</p>
      ) : packages.length === 0 ? (
        <p className="text-neutral-500">No packages yet — add your first one above.</p>
      ) : (
        <div className="border rounded-xl bg-white divide-y">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{pkg.title}</p>
                <p className="text-xs text-neutral-500">{pkg.description}</p>
                <p className="text-sm font-semibold mt-1">₹{pkg.price}</p>
              </div>
              <button
                className="text-xs text-red-500"
                onClick={() => handleDelete(pkg.id)}
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
