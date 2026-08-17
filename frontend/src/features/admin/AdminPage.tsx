import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import {
  getCategoriesCMS,
  saveCategoriesCMS,
  getExperiencesCatalogCMS,
  saveExperiencesCatalogCMS,
  DetailedExperience
} from "@/features/landing/data";

interface Stats {
  total_users: number;
  total_customers: number;
  total_planners: number;
  verified_planners: number;
  pending_verifications: number;
  featured_planners: number;
  total_events: number;
  total_bookings: number;
  bookings_by_status: { status: string; count: number }[];
  total_revenue: string;
  total_commission_earned: string;
  new_users_last_30_days: number;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

interface AdminPlanner {
  id: number;
  business_name: string;
  category: string;
  city: string;
  owner_email: string;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
}

interface AdminDispute {
  id: number;
  event_name: string;
  planner_name: string;
  amount: string;
  reason: string;
  status: "open" | "resolved" | "rejected";
  admin_notes: string;
  created_at: string;
}

type View = "stats" | "users" | "planners" | "disputes" | "celebrations" | "experiences";

export default function AdminPage() {
  const [view, setView] = useState<View>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [planners, setPlanners] = useState<AdminPlanner[]>([]);
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  
  // CMS state variables
  const [categories, setCategories] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<DetailedExperience[]>([]);
  const [selectedExpIdx, setSelectedExpIdx] = useState(0);

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const loadStats = async () => {
    const { data } = await apiClient.get("/admin-panel/stats/");
    setStats(data);
  };
  const loadUsers = async () => {
    const { data } = await apiClient.get("/admin-panel/users/");
    setUsers(data.results ?? data);
  };
  const loadPlanners = async () => {
    const { data } = await apiClient.get("/admin-panel/planners/");
    setPlanners(data.results ?? data);
  };
  const loadDisputes = async () => {
    const { data } = await apiClient.get("/admin-panel/disputes/");
    setDisputes(data);
  };

  useEffect(() => {
    setLoading(true);
    
    // Initial load for LocalStorage CMS data
    setCategories(getCategoriesCMS());
    setExperiences(getExperiencesCatalogCMS());

    Promise.all([loadStats(), loadUsers(), loadPlanners(), loadDisputes()])
      .catch((err) => {
        if (err?.response?.status === 403) {
          setAccessDenied(true);
        } else {
          toast.error("Could not load admin data — check backend status");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const resolveDispute = async (id: number) => {
    try {
      await apiClient.post(`/admin-panel/disputes/${id}/resolve/`);
      toast.success("Dispute resolved & refunded");
      loadDisputes();
    } catch {
      toast.error("Could not update dispute");
    }
  };

  const rejectDispute = async (id: number) => {
    try {
      await apiClient.post(`/admin-panel/disputes/${id}/reject/`);
      toast.success("Dispute rejected");
      loadDisputes();
    } catch {
      toast.error("Could not update dispute");
    }
  };

  const toggleUserActive = async (id: number) => {
    try {
      await apiClient.post(`/admin-panel/users/${id}/toggle-active/`);
      toast.success("User status updated");
      loadUsers();
    } catch {
      toast.error("Could not update user");
    }
  };

  const toggleVerify = async (id: number, verified: boolean) => {
    try {
      await apiClient.post(`/admin-panel/planners/${id}/${verified ? "unverify" : "verify"}/`);
      toast.success(verified ? "Verification revoked" : "Planner verified");
      loadPlanners();
      loadStats();
    } catch {
      toast.error("Could not update planner");
    }
  };

  const toggleFeatured = async (id: number) => {
    try {
      await apiClient.post(`/admin-panel/planners/${id}/toggle-featured/`);
      toast.success("Updated featured status");
      loadPlanners();
      loadStats();
    } catch {
      toast.error("Could not update planner");
    }
  };

  if (loading) return <p className="text-[#6B6780] text-sm">Loading admin control center...</p>;

  if (accessDenied) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-8 text-center shadow-xs">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="font-display text-2xl font-bold text-[#17142A] mb-2">
            Administrator Access Required
          </h1>
          <p className="text-sm text-[#6B6780] leading-relaxed font-medium">
            Your account role isn't configured as Admin. Contact system owner to elevate your role in Django admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-4xl font-bold text-[#17142A]">Admin Control Center</h1>
        <p className="text-sm text-[#6B6780] mt-1 font-medium">Manage users, verified planners, disputes, page copies, and platform governance.</p>
      </div>

      <div className="flex gap-2 border-b border-[#E9E4F5] pb-3 overflow-x-auto">
        {(["stats", "users", "planners", "disputes", "celebrations", "experiences"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-5 py-2.5 rounded-[10px] text-xs font-semibold capitalize transition-all ${
              view === v
                ? "bg-[#5B21B6] text-white shadow-xs font-bold"
                : "text-[#6B6780] hover:text-[#17142A] hover:bg-white"
            }`}
          >
            {v === "stats" ? "Overview Stats" : v}
          </button>
        ))}
      </div>

      {view === "stats" && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl">
          <StatCard label="Total Users" value={stats.total_users} />
          <StatCard label="Customers" value={stats.total_customers} />
          <StatCard label="Planners" value={stats.total_planners} />
          <StatCard label="Verified Planners" value={stats.verified_planners} />
          <StatCard label="Pending Verification" value={stats.pending_verifications} />
          <StatCard label="Total Events" value={stats.total_events} />
          <StatCard label="Total Bookings" value={stats.total_bookings} />
          <StatCard label="Total Revenue" value={`₹${Number(stats.total_revenue).toLocaleString()}`} />
          <StatCard label="Commission Earned" value={`₹${Number(stats.total_commission_earned).toLocaleString()}`} />
          <StatCard label="Featured Planners" value={stats.featured_planners} />
          <StatCard label="New Users (30d)" value={stats.new_users_last_30_days} />
          {stats.bookings_by_status.map((b) => (
            <StatCard key={b.status} label={`Bookings: ${b.status}`} value={b.count} />
          ))}
        </div>
      )}

      {view === "users" && (
        <div className="bg-white border border-[#E9E4F5] rounded-[16px] divide-y divide-[#E9E4F5] max-w-3xl shadow-xs overflow-hidden">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-bold text-[#17142A]">{u.username} <span className="text-xs text-[#6B6780] font-medium">({u.email})</span></p>
                <p className="text-xs text-[#5B21B6] font-bold uppercase tracking-wider mt-0.5">{u.role}</p>
              </div>
              <button
                className={`text-xs font-bold rounded-[10px] px-4 py-2 transition-colors ${
                  u.is_active ? "border border-[#C94B63] text-[#C94B63] hover:bg-[#C94B63]/10" : "btn-primary"
                }`}
                onClick={() => toggleUserActive(u.id)}
              >
                {u.is_active ? "Suspend" : "Reactivate"}
              </button>
            </div>
          ))}
        </div>
      )}

      {view === "planners" && (
        <div className="bg-white border border-[#E9E4F5] rounded-[16px] divide-y divide-[#E9E4F5] max-w-3xl shadow-xs overflow-hidden">
          {planners.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-bold text-[#17142A]">{p.business_name}</p>
                <p className="text-xs text-[#6B6780] mt-0.5 font-medium">{p.owner_email} • 📍 {p.city}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className={`text-xs font-bold rounded-[10px] px-3.5 py-2 transition-colors ${
                    p.is_verified ? "border border-[#C94B63] text-[#C94B63]" : "btn-primary"
                  }`}
                  onClick={() => toggleVerify(p.id, p.is_verified)}
                >
                  {p.is_verified ? "Revoke" : "Verify"}
                </button>
                <button
                  className={`text-xs font-bold rounded-[10px] px-3.5 py-2 transition-colors ${
                    p.is_featured ? "border border-[#D08A24] text-[#D08A24]" : "bg-[#D08A24] text-white"
                  }`}
                  onClick={() => toggleFeatured(p.id)}
                >
                  {p.is_featured ? "Unfeature" : "⭐ Feature"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "disputes" && (
        <div className="bg-white border border-[#E9E4F5] rounded-[16px] divide-y divide-[#E9E4F5] max-w-3xl shadow-xs overflow-hidden">
          {disputes.length === 0 ? (
            <p className="text-sm text-[#6B6780] p-6 font-medium">No disputes reported.</p>
          ) : (
            disputes.map((d) => (
              <div key={d.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#17142A]">{d.event_name} • {d.planner_name}</p>
                    <p className="text-xs text-[#6B6780] mt-0.5 font-medium">₹{d.amount} — {d.reason}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold ${
                      d.status === "open"
                        ? "bg-[#D08A24]/10 text-[#D08A24] border border-[#D08A24]/20"
                        : d.status === "resolved"
                        ? "bg-[#3A8D68]/10 text-[#3A8D68] border border-[#3A8D68]/20"
                        : "bg-[#C94B63]/10 text-[#C94B63] border border-[#C94B63]/20"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                {d.status === "open" && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-[#E9E4F5]">
                    <button
                      onClick={() => resolveDispute(d.id)}
                      className="btn-primary text-xs"
                    >
                      Resolve & Refund
                    </button>
                    <button
                      onClick={() => rejectDispute(d.id)}
                      className="btn-secondary text-xs"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {view === "celebrations" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white border border-[#E9E4F5] rounded-3xl p-6 shadow-soft space-y-2">
            <h2 className="text-lg font-bold text-[#17142A]">Celebration Category Copy Control</h2>
            <p className="text-xs text-[#6B6780] font-medium">Edit titles, prices, descriptions, and ratings shown on the main Celebrations Page catalog.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="bg-white border border-[#E9E4F5] rounded-3xl p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-3 border-b border-[#E9E4F5] pb-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-[#17142A]">{cat.title}</h3>
                    <span className="text-[10px] text-[#6B6780] font-semibold uppercase tracking-wider">ID: {cat.id}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Display Title</label>
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => {
                        const next = [...categories];
                        next[idx] = { ...cat, title: e.target.value };
                        setCategories(next);
                      }}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Starting Price</label>
                      <input
                        type="text"
                        value={cat.startingPrice}
                        onChange={(e) => {
                          const next = [...categories];
                          next[idx] = { ...cat, startingPrice: e.target.value };
                          setCategories(next);
                        }}
                        className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Rating</label>
                      <input
                        type="text"
                        value={cat.rating}
                        onChange={(e) => {
                          const next = [...categories];
                          next[idx] = { ...cat, rating: e.target.value };
                          setCategories(next);
                        }}
                        className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Tagline</label>
                    <input
                      type="text"
                      value={cat.tagline}
                      onChange={(e) => {
                        const next = [...categories];
                        next[idx] = { ...cat, tagline: e.target.value };
                        setCategories(next);
                      }}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={cat.description}
                      onChange={(e) => {
                        const next = [...categories];
                        next[idx] = { ...cat, description: e.target.value };
                        setCategories(next);
                      }}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6] resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    saveCategoriesCMS(categories);
                    toast.success(`"${cat.title}" updated in Celebrations catalog!`);
                  }}
                  className="w-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs"
                >
                  Save Category Changes
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "experiences" && (
        <div className="space-y-6 max-w-5xl">
          <div className="bg-white border border-[#E9E4F5] rounded-3xl p-6 shadow-soft space-y-2">
            <h2 className="text-lg font-bold text-[#17142A]">Signature Experiences Control</h2>
            <p className="text-xs text-[#6B6780] font-medium">Configure detailed timelines, amenities list, titles, locations, and price points shown on the Experiences detail page.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
            
            {/* Sidebar list selection */}
            <div className="bg-white border border-[#E9E4F5] rounded-3xl p-4 shadow-soft space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#6B6780] px-2 block">Choose Experience</span>
              {experiences.map((exp, expIdx) => (
                <button
                  key={exp.id}
                  onClick={() => setSelectedExpIdx(expIdx)}
                  className={`w-full text-left text-xs px-4 py-3 rounded-xl font-bold truncate transition-all ${
                    selectedExpIdx === expIdx
                      ? "bg-[#5B21B6] text-white"
                      : "text-[#17142A] hover:bg-[#FCFAFF] hover:text-[#5B21B6]"
                  }`}
                >
                  {exp.title}
                </button>
              ))}
            </div>

            {/* Active editing form */}
            {experiences[selectedExpIdx] && (
              <div className="bg-white border border-[#E9E4F5] rounded-3xl p-6 shadow-soft space-y-6">
                <div className="border-b border-[#E9E4F5] pb-3">
                  <h3 className="text-base font-bold text-[#17142A]">Editing: {experiences[selectedExpIdx].title}</h3>
                  <span className="text-[10px] text-[#6B6780] font-semibold uppercase tracking-wider">Category: {experiences[selectedExpIdx].category}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Display Title</label>
                    <input
                      type="text"
                      value={experiences[selectedExpIdx].title}
                      onChange={(e) => {
                        const next = [...experiences];
                        next[selectedExpIdx] = { ...next[selectedExpIdx], title: e.target.value };
                        setExperiences(next);
                      }}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Tagline</label>
                    <input
                      type="text"
                      value={experiences[selectedExpIdx].tagline}
                      onChange={(e) => {
                        const next = [...experiences];
                        next[selectedExpIdx] = { ...next[selectedExpIdx], tagline: e.target.value };
                        setExperiences(next);
                      }}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Location</label>
                    <input
                      type="text"
                      value={experiences[selectedExpIdx].location}
                      onChange={(e) => {
                        const next = [...experiences];
                        next[selectedExpIdx] = { ...next[selectedExpIdx], location: e.target.value };
                        setExperiences(next);
                      }}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Package Price</label>
                      <input
                        type="text"
                        value={experiences[selectedExpIdx].price}
                        onChange={(e) => {
                          const next = [...experiences];
                          next[selectedExpIdx] = { ...next[selectedExpIdx], price: e.target.value };
                          setExperiences(next);
                        }}
                        className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Rating</label>
                      <input
                        type="number"
                        step="0.01"
                        value={experiences[selectedExpIdx].rating}
                        onChange={(e) => {
                          const next = [...experiences];
                          next[selectedExpIdx] = { ...next[selectedExpIdx], rating: parseFloat(e.target.value) || 0 };
                          setExperiences(next);
                        }}
                        className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Detailed Overview</label>
                  <textarea
                    rows={4}
                    value={experiences[selectedExpIdx].overview}
                    onChange={(e) => {
                      const next = [...experiences];
                      next[selectedExpIdx] = { ...next[selectedExpIdx], overview: e.target.value };
                      setExperiences(next);
                    }}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                  />
                </div>

                <div className="h-px bg-[#E9E4F5]" />

                {/* Amenities editing */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#17142A] tracking-wider block">Amenities Checklist (One per line)</span>
                  <textarea
                    rows={4}
                    value={experiences[selectedExpIdx].amenities.join("\n")}
                    onChange={(e) => {
                      const next = [...experiences];
                      next[selectedExpIdx] = {
                        ...next[selectedExpIdx],
                        amenities: e.target.value.split("\n").filter(line => line.trim() !== "")
                      };
                      setExperiences(next);
                    }}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3 py-2.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                    placeholder="Enter one amenity per line..."
                  />
                </div>

                <div className="h-px bg-[#E9E4F5]" />

                {/* Itinerary steps editing */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-[#17142A] tracking-wider block">Itinerary Program Schedule</span>
                  <div className="space-y-4">
                    {experiences[selectedExpIdx].itinerary.map((item, idx) => (
                      <div key={idx} className="bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-[100px_1fr] gap-3">
                        <div>
                          <label className="text-[8px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Time</label>
                          <input
                            type="text"
                            value={item.time}
                            onChange={(e) => {
                              const next = [...experiences];
                              const nextItinerary = [...next[selectedExpIdx].itinerary];
                              nextItinerary[idx] = { ...item, time: e.target.value };
                              next[selectedExpIdx] = { ...next[selectedExpIdx], itinerary: nextItinerary };
                              setExperiences(next);
                            }}
                            className="w-full bg-white border border-[#E9E4F5] rounded-xl px-2 py-1.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                          />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[8px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Step Event Title</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const next = [...experiences];
                                const nextItinerary = [...next[selectedExpIdx].itinerary];
                                nextItinerary[idx] = { ...item, title: e.target.value };
                                next[selectedExpIdx] = { ...next[selectedExpIdx], itinerary: nextItinerary };
                                setExperiences(next);
                              }}
                              className="w-full bg-white border border-[#E9E4F5] rounded-xl px-3 py-1.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-[#6B6780] uppercase tracking-wider block mb-1">Step Description</label>
                            <input
                              type="text"
                              value={item.desc}
                              onChange={(e) => {
                                const next = [...experiences];
                                const nextItinerary = [...next[selectedExpIdx].itinerary];
                                nextItinerary[idx] = { ...item, desc: e.target.value };
                                next[selectedExpIdx] = { ...next[selectedExpIdx], itinerary: nextItinerary };
                                setExperiences(next);
                              }}
                              className="w-full bg-white border border-[#E9E4F5] rounded-xl px-3 py-1.5 text-xs font-medium text-[#17142A] outline-none focus:border-[#5B21B6]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E9E4F5] flex justify-end">
                  <button
                    onClick={() => {
                      saveExperiencesCatalogCMS(experiences);
                      toast.success(`Experience "${experiences[selectedExpIdx].title}" saved successfully!`);
                    }}
                    className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
                  >
                    Save Program Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-5 shadow-xs">
      <p className="text-xs uppercase tracking-wider text-[#6B6780] font-bold">{label}</p>
      <p className="text-2xl font-display font-bold text-[#17142A] mt-1">{value}</p>
    </div>
  );
}
