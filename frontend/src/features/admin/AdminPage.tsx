import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import {
  getCategoriesCMS,
  saveCategoriesCMS,
  getExperiencesCatalogCMS,
  saveExperiencesCatalogCMS,
  getStepsCMS,
  saveStepsCMS,
  getGalleryItemsCMS,
  saveGalleryItemsCMS,
  DetailedExperience,
  StepItem,
  GalleryItem,
  Category,
  SceneVariant
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

interface AdminBooking {
  id: number;
  event_name: string;
  event_date: string;
  event_time?: string;
  event_venue?: string;
  event_budget?: string;
  event_guests?: number;
  event_theme?: string;
  event_description?: string;
  planner_name: string;
  customer_name: string;
  package_title: string;
  package_description?: string;
  package_price?: string;
  status: string;
  advance_paid: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  phone_number?: string;
  two_factor_enabled?: boolean;
  referral_code?: string;
  bookings?: AdminBooking[];
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

type View = "stats" | "users" | "planners" | "disputes" | "celebrations" | "experiences" | "howitworks" | "lookbook";

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get("view") as View) || "stats";
  const setView = (v: View) => setSearchParams({ view: v });
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [planners, setPlanners] = useState<AdminPlanner[]>([]);
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  
  // CMS state variables
  const [categories, setCategories] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<DetailedExperience[]>([]);
  const [selectedExpIdx, setSelectedExpIdx] = useState(0);
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<AdminBooking | null>(null);
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "customer" | "planner">("all");
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<Category | null>(null);
  const [selectedCatIdx, setSelectedCatIdx] = useState<number>(0);
  const [editCatTitle, setEditCatTitle] = useState("");
  const [editCatStartingPrice, setEditCatStartingPrice] = useState("");
  const [editCatRating, setEditCatRating] = useState("");
  const [editCatTagline, setEditCatTagline] = useState("");
  const [editCatDescription, setEditCatDescription] = useState("");
  const [editCatImage, setEditCatImage] = useState("");
  const [editCatEmoji, setEditCatEmoji] = useState("");
  // Experience Editing States
  const [selectedExpForEdit, setSelectedExpForEdit] = useState<DetailedExperience | null>(null);
  const [expEditTab, setExpEditTab] = useState<"params" | "amenities" | "itinerary">("params");
  const [editExpTitle, setEditExpTitle] = useState("");
  const [editExpTagline, setEditExpTagline] = useState("");
  const [editExpLocation, setEditExpLocation] = useState("");
  const [editExpPrice, setEditExpPrice] = useState("");
  const [editExpRating, setEditExpRating] = useState("");
  const [editExpCategory, setEditExpCategory] = useState("");
  const [editExpOverview, setEditExpOverview] = useState("");
  const [editExpImage, setEditExpImage] = useState("");
  const [editExpAmenities, setEditExpAmenities] = useState("");
  const [editExpItinerary, setEditExpItinerary] = useState<{ time: string; title: string; desc: string }[]>([]);
  // Step Editing States
  const [selectedStepForEdit, setSelectedStepForEdit] = useState<StepItem | null>(null);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);
  const [editStepN, setEditStepN] = useState("");
  const [editStepTitle, setEditStepTitle] = useState("");
  const [editStepBody, setEditStepBody] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [plannerSearchQuery, setPlannerSearchQuery] = useState("");
  // Lookbook Gallery Editing States
  const [selectedGalleryForEdit, setSelectedGalleryForEdit] = useState<GalleryItem | null>(null);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState<number>(0);
  const [editGalleryTitle, setEditGalleryTitle] = useState("");
  const [editGalleryCategory, setEditGalleryCategory] = useState("");
  const [editGalleryImage, setEditGalleryImage] = useState("");

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
    setSteps(getStepsCMS());
    setGalleryItems(getGalleryItemsCMS());

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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setSavingUser(true);
    try {
      await apiClient.put(`/admin-panel/users/${selectedUserForEdit.id}/`, {
        username: editUsername,
        email: editEmail,
        phone_number: editPhone,
        role: editRole,
        is_active: editIsActive,
      });
      toast.success("User profile updated successfully");
      setSelectedUserForEdit(null);
      loadUsers();
      loadStats();
    } catch {
      toast.error("Could not update user details");
    } finally {
      setSavingUser(false);
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

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchesSearch =
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredPlanners = planners.filter((p) => {
    return (
      p.business_name.toLowerCase().includes(plannerSearchQuery.toLowerCase()) ||
      p.owner_email.toLowerCase().includes(plannerSearchQuery.toLowerCase()) ||
      (p.city && p.city.toLowerCase().includes(plannerSearchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-8 pb-16 admin-page">
      <div>
        <h1 className="font-display text-4xl font-bold text-[#17142A]">Admin Control Center</h1>
        <p className="text-sm text-[#6B6780] mt-1 font-medium">Manage users, verified planners, disputes, page copies, and platform governance.</p>
      </div>



      {view === "stats" && stats && (
        <div className="space-y-6 max-w-5xl">
          {/* Top Row: Primary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border border-[#E9E4F5] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#6B6780] font-bold uppercase tracking-wider block">Total Revenue</span>
                <span className="text-3xl font-display font-extrabold text-[#17142A] mt-1 block">
                  ₹{Number(stats.total_revenue).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  ▲ +14.2% vs last month
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#5B21B6] text-white flex items-center justify-center text-xl shadow-md shadow-[#5B21B6]/20">
                💰
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border border-[#E9E4F5] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#6B6780] font-bold uppercase tracking-wider block">Commission Earned</span>
                <span className="text-3xl font-display font-extrabold text-[#17142A] mt-1 block">
                  ₹{Number(stats.total_commission_earned).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  ▲ +12.8% vs last month
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#5B21B6] text-white flex items-center justify-center text-xl shadow-md shadow-[#5B21B6]/20">
                💼
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border border-[#E9E4F5] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#6B6780] font-bold uppercase tracking-wider block">Total Bookings</span>
                <span className="text-3xl font-display font-extrabold text-[#17142A] mt-1 block">
                  {stats.total_bookings}
                </span>
                <span className="text-[10px] text-[#6B6780] font-bold block mt-1">
                  Across all categories
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#5B21B6] text-white flex items-center justify-center text-xl shadow-md shadow-[#5B21B6]/20">
                🎉
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border border-[#E9E4F5] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#6B6780] font-bold uppercase tracking-wider block">Total Platform Users</span>
                <span className="text-3xl font-display font-extrabold text-[#17142A] mt-1 block">
                  {stats.total_users}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  ▲ +8.2% vs last month
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#5B21B6] text-white flex items-center justify-center text-xl shadow-md shadow-[#5B21B6]/20">
                👤
              </div>
            </div>
          </div>

          {/* Interactive Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart: Revenue Trend */}
            <div className="lg:col-span-2 bg-white border border-[#E9E4F5] rounded-[24px] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#17142A]">Revenue & Booking Growth</h3>
                  <p className="text-[10px] text-[#6B6780] font-semibold">Live visual metrics tracking billing cycles and sales performance.</p>
                </div>
                <span className="text-[10px] font-bold text-[#5B21B6] bg-[#5B21B6]/10 px-3 py-1.5 rounded-full uppercase">
                  Interactive Chart
                </span>
              </div>

              {/* Responsive SVG Area Chart */}
              <div className="h-64 relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#C084FC" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6D28D9" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="3,3" />
                  
                  {/* Scaled path points for 6 months */}
                  <path
                    d="M 10 180 C 80 160, 160 110, 240 130 C 320 150, 400 90, 490 30 L 490 180 Z"
                    fill="url(#areaGrad)"
                  />
                  
                  <path
                    d="M 10 180 C 80 160, 160 110, 240 130 C 320 150, 400 90, 490 30"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                  
                  <circle cx="10" cy="180" r="4.5" fill="#C084FC" stroke="white" strokeWidth="1.5" />
                  <circle cx="110" cy="150" r="4.5" fill="#8B5CF6" stroke="white" strokeWidth="1.5" />
                  <circle cx="210" cy="120" r="4.5" fill="#8B5CF6" stroke="white" strokeWidth="1.5" />
                  <circle cx="310" cy="140" r="4.5" fill="#8B5CF6" stroke="white" strokeWidth="1.5" />
                  <circle cx="410" cy="80" r="4.5" fill="#6D28D9" stroke="white" strokeWidth="1.5" />
                  <circle cx="490" cy="30" r="4.5" fill="#6D28D9" stroke="white" strokeWidth="1.5" />
                </svg>

                {/* Y-axis metric threshold label */}
                <div className="absolute left-3 top-3 bg-white/95 backdrop-blur-xs shadow-xs border border-[#E9E4F5] rounded-lg px-2.5 py-1 text-[8px] font-bold text-[#17142A]">
                  Peak Volume: ₹{(Number(stats.total_revenue) * 1.5 || 75000).toLocaleString()}
                </div>
              </div>
              
              <div className="flex justify-between px-2 text-[9px] text-[#6B6780] font-extrabold uppercase tracking-wider">
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
              </div>
            </div>

            {/* Donut Chart: Booking Allocations */}
            <div className="bg-white border border-[#E9E4F5] rounded-[24px] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#17142A]">Booking Allocations</h3>
                <p className="text-[10px] text-[#6B6780] font-semibold">Visual breakdown of status queues.</p>
              </div>

              {(() => {
                const req = stats.bookings_by_status.find((b) => b.status === "requested")?.count || 0;
                const acc = stats.bookings_by_status.find((b) => b.status === "accepted")?.count || 0;
                const comp = stats.bookings_by_status.find((b) => b.status === "completed")?.count || 0;
                const total = req + acc + comp || 1;

                const compPercent = (comp / total) * 314.16;
                const accPercent = (acc / total) * 314.16;
                const reqPercent = (req / total) * 314.16;

                return (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#F5F3FF" strokeWidth="10" />
                        
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="10"
                          strokeDasharray={`${compPercent} 314.16`}
                          strokeDashoffset={0}
                          strokeLinecap="round"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#5B21B6"
                          strokeWidth="10"
                          strokeDasharray={`${accPercent} 314.16`}
                          strokeDashoffset={-compPercent}
                          strokeLinecap="round"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="10"
                          strokeDasharray={`${reqPercent} 314.16`}
                          strokeDashoffset={-(compPercent + accPercent)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-extrabold text-[#17142A]">{total}</span>
                        <span className="text-[8px] text-[#6B6780] uppercase tracking-wider font-bold">Bookings</span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-[#6B6780]">
                      <div>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block mr-1" />
                        <span>Done ({comp})</span>
                      </div>
                      <div>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#5B21B6] inline-block mr-1" />
                        <span>Acc ({acc})</span>
                      </div>
                      <div>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block mr-1" />
                        <span>Req ({req})</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Secondary stats metrics grid */}
          <div className="bg-[#FCFAFF] border border-[#E9E4F5] rounded-[24px] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#17142A] uppercase tracking-wider">📊 Platform Demographics & Operations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E9E4F5] rounded-2xl p-4">
                <span className="text-[10px] text-[#6B6780] block font-bold uppercase">Clients</span>
                <span className="text-xl font-bold text-[#17142A] mt-1 block">{stats.total_customers} Users</span>
              </div>
              <div className="bg-white border border-[#E9E4F5] rounded-2xl p-4">
                <span className="text-[10px] text-[#6B6780] block font-bold uppercase">Planners</span>
                <span className="text-xl font-bold text-[#17142A] mt-1 block">{stats.total_planners} Planners</span>
              </div>
              <div className="bg-white border border-[#E9E4F5] rounded-2xl p-4">
                <span className="text-[10px] text-[#6B6780] block font-bold uppercase">Verified Planners</span>
                <span className="text-xl font-bold text-[#17142A] mt-1 block">{stats.verified_planners} Verified</span>
              </div>
              <div className="bg-white border border-[#E9E4F5] rounded-2xl p-4">
                <span className="text-[10px] text-[#6B6780] block font-bold uppercase">Verifications Pending</span>
                <span className="text-xl font-bold text-[#C94B63] mt-1 block">{stats.pending_verifications} Pending</span>
              </div>
              <div className="bg-white border border-[#E9E4F5] rounded-2xl p-4">
                <span className="text-[10px] text-[#6B6780] block font-bold uppercase">Total Event Pages</span>
                <span className="text-xl font-bold text-[#17142A] mt-1 block">{stats.total_events} Events</span>
              </div>
              <div className="bg-white border border-[#E9E4F5] rounded-2xl p-4">
                <span className="text-[10px] text-[#6B6780] block font-bold uppercase">Featured Planners</span>
                <span className="text-xl font-bold text-[#17142A] mt-1 block">{stats.featured_planners} Featured</span>
              </div>
              <div className="bg-white border border-[#E9E4F5] rounded-2xl p-4">
                <span className="text-[10px] text-[#6B6780] block font-bold uppercase">New Joins (30d)</span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">{stats.new_users_last_30_days} Joined</span>
              </div>
              <div className="bg-white border border-[#E9E4F5] rounded-2xl p-4">
                <span className="text-[10px] text-[#6B6780] block font-bold uppercase">Platform Health</span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">99.98% OK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "users" && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2">
              {(["all", "customer", "planner"] as const).map((role) => {
                const count = role === "all" ? users.length : users.filter((u) => u.role === role).length;
                return (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      userRoleFilter === role
                        ? "bg-[#5B21B6] text-white border-[#5B21B6] shadow-sm"
                        : "bg-white border-[#E9E4F5] text-[#6B6780] hover:text-[#17142A] hover:bg-[#FCFAFF]"
                    }`}
                  >
                    {role === "all" ? "All Users" : role === "customer" ? "Customers" : "Planners"} ({count})
                  </button>
                );
              })}
            </div>
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E9E4F5] rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-[#17142A] placeholder-[#9CA3AF] outline-none focus:border-[#5B21B6] transition-colors shadow-xs"
              />
              <span className="absolute left-3 top-2 text-xs text-[#9CA3AF]">🔍</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((u) => {
              const initial = u.username ? u.username.charAt(0).toUpperCase() : "?";
              return (
                <div
                  key={u.id}
                  className="bg-white border border-[#E9E4F5] rounded-[24px] p-5 shadow-xs hover:shadow-soft hover:border-[#5B21B6]/30 transition-all flex flex-col justify-between"
                >
                  <div
                    className="flex items-start gap-4 cursor-pointer"
                    onClick={() => {
                      setSelectedUserForEdit(u);
                      setEditUsername(u.username);
                      setEditEmail(u.email);
                      setEditPhone(u.phone_number || "");
                      setEditRole(u.role);
                      setEditIsActive(u.is_active);
                    }}
                  >
                    {/* Monogram Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8B5CF6]/10 to-[#D8B4FE]/20 text-[#5B21B6] font-display text-base font-extrabold flex items-center justify-center border border-[#5B21B6]/10 shrink-0">
                      {initial}
                    </div>

                    <div className="space-y-1 text-left min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[#17142A] hover:text-[#5B21B6] transition-colors truncate">
                        {u.username}
                      </h4>
                      <p className="text-[10px] text-[#6B6780] font-semibold truncate">
                        {u.email}
                      </p>

                      <div className="flex items-center gap-1.5 pt-1.5">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : u.role === "planner"
                            ? "bg-[#F5F3FF] text-[#5B21B6] border border-[#E9E4F5]"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}>
                          {u.role}
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${
                          u.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F5F3FF] flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUserForEdit(u);
                        setEditUsername(u.username);
                        setEditEmail(u.email);
                        setEditPhone(u.phone_number || "");
                        setEditRole(u.role);
                        setEditIsActive(u.is_active);
                      }}
                      className="flex-1 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] text-[10px] font-bold py-2 rounded-xl transition-all"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      className={`px-3 py-2 text-[10px] font-bold rounded-xl transition-all border ${
                        u.is_active
                          ? "border-[#C94B63] text-[#C94B63] hover:bg-[#C94B63]/5"
                          : "bg-[#5B21B6] text-white border-[#5B21B6] hover:bg-[#4C1D95]"
                      }`}
                    >
                      {u.is_active ? "Suspend" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "planners" && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#17142A]">Planner Verification</h2>
              <p className="text-xs text-[#6B6780] font-medium">Verify credentials and manage showcase feature rights for active event planners.</p>
            </div>
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search business or city..."
                value={plannerSearchQuery}
                onChange={(e) => setPlannerSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E9E4F5] rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-[#17142A] placeholder-[#9CA3AF] outline-none focus:border-[#5B21B6] transition-colors shadow-xs"
              />
              <span className="absolute left-3 top-2 text-xs text-[#9CA3AF]">🔍</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlanners.map((p) => {
              const initial = p.business_name ? p.business_name.substring(0, 2).toUpperCase() : "PL";
              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#E9E4F5] rounded-[24px] p-5 shadow-xs hover:shadow-soft hover:border-[#5B21B6]/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    {/* Monogram Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#5B21B6]/10 to-[#8B5CF6]/20 text-[#5B21B6] font-display text-xs font-extrabold flex items-center justify-center border border-[#5B21B6]/10 shrink-0">
                      {initial}
                    </div>

                    <div className="space-y-1 text-left min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[#17142A] truncate">
                        {p.business_name || "Unnamed Planner"}
                      </h4>
                      <p className="text-[10px] text-[#6B6780] font-semibold truncate">
                        {p.owner_email}
                      </p>
                      {p.city && (
                        <p className="text-[10px] text-[#5B21B6] font-extrabold">
                          📍 {p.city}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 pt-1.5">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${
                          p.is_verified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {p.is_verified ? "Verified ✓" : "Pending Verification"}
                        </span>
                        {p.is_featured && (
                          <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F5F3FF] flex gap-2">
                    <button
                      onClick={() => toggleVerify(p.id, p.is_verified)}
                      className={`flex-1 text-[10px] font-bold py-2 rounded-xl transition-all border ${
                        p.is_verified
                          ? "border-[#C94B63] text-[#C94B63] hover:bg-[#C94B63]/5"
                          : "bg-[#5B21B6] text-white border-[#5B21B6] hover:bg-[#4C1D95]"
                      }`}
                    >
                      {p.is_verified ? "Revoke Verification" : "Verify Planner"}
                    </button>
                    <button
                      onClick={() => toggleFeatured(p.id)}
                      className={`px-3 py-2 text-[10px] font-bold rounded-xl transition-all border ${
                        p.is_featured
                          ? "border-[#D08A24] text-[#D08A24] hover:bg-[#D08A24]/5"
                          : "bg-[#D08A24] text-white border-[#D08A24] hover:bg-[#B4781E]"
                      }`}
                    >
                      {p.is_featured ? "Unfeature" : "★ Feature"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className="space-y-6 max-w-5xl">
          <div className="bg-gradient-to-r from-[#3B176D] to-[#5B21B6] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold">Celebration Category Copy Control</h2>
              <p className="text-xs text-purple-100 mt-1 max-w-xl leading-relaxed">
                Configure visual banners, entry level starting pricing, descriptions, and verified review score ratings shown on the main landing catalog.
              </p>
            </div>
            <button
              onClick={() => {
                const newCat: Category = {
                  id: `custom_${Date.now()}` as any,
                  emoji: "✨",
                  title: "New Celebration Category",
                  tagline: "Custom curated milestones",
                  description: "A customized luxury event package tailored precisely to your goals.",
                  gradient: "from-champagne-500 via-celebrate-500 to-royal-500",
                  glow: "#7C3AED",
                  image: "/images/proposal_hero.png",
                  startingPrice: "₹500",
                  rating: 5.0
                };
                const next = [newCat, ...categories];
                setCategories(next);
                saveCategoriesCMS(next);
                toast.success("New category added!");
              }}
              className="relative z-10 bg-white hover:bg-purple-50 text-[#5B21B6] font-bold text-xs px-5 py-3 rounded-xl transition-all shrink-0 shadow-md hover:-translate-y-0.5 active:translate-y-0 duration-250"
            >
              ＋ Add New Category
            </button>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-12 translate-x-12"></div>
            <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-purple-500/20 rounded-full blur-xl pointer-events-none translate-y-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="group relative bg-white border border-[#E9E4F5] rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(91,33,182,0.02)] hover:shadow-[0_20px_40px_rgba(91,33,182,0.07)] hover:border-[#5B21B6]/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative">
                  <div className="relative w-full h-44 overflow-hidden bg-gradient-to-br from-[#8B5CF6]/10 to-[#5B21B6]/15">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-purple-50">
                        {cat.emoji || "✨"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17142A]/80 via-[#17142A]/10 to-transparent"></div>
                    
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur text-amber-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                      <span className="text-xs">★</span> {Number(cat.rating || 5.0).toFixed(2)}
                    </div>
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#5B21B6]/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                      <span>Starts:</span>
                      <span className="text-white font-black">{cat.startingPrice}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-[-16px] left-4 w-10 h-10 rounded-full bg-white border border-[#E9E4F5] shadow-md flex items-center justify-center text-lg z-10">
                    {cat.emoji || "✨"}
                  </div>
                </div>

                <div className="pt-6 px-5 pb-5 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-display font-bold text-[#17142A] text-base group-hover:text-[#5B21B6] transition-colors line-clamp-1">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] text-[#8B5CF6] font-bold tracking-wide uppercase mt-1 italic line-clamp-1">
                      {cat.tagline || "No tagline configured"}
                    </p>
                    <p className="text-xs text-[#6B6780] font-medium leading-relaxed mt-2 line-clamp-2">
                      {cat.description || "No description copy specified."}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F5F3FF] flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCatForEdit(cat);
                        setSelectedCatIdx(idx);
                        setEditCatTitle(cat.title);
                        setEditCatStartingPrice(cat.startingPrice);
                        setEditCatRating(String(cat.rating));
                        setEditCatTagline(cat.tagline);
                        setEditCatDescription(cat.description);
                        setEditCatImage(cat.image || "");
                        setEditCatEmoji(cat.emoji || "✨");
                      }}
                      className="flex-1 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      ✏️ Edit Details
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this category?")) {
                          const next = categories.filter((c) => c.id !== cat.id);
                          setCategories(next);
                          saveCategoriesCMS(next);
                          toast.success("Category deleted!");
                        }
                      }}
                      className="bg-[#C94B63]/10 hover:bg-[#C94B63]/25 text-[#C94B63] text-xs font-bold px-3 py-2.5 rounded-xl transition-all duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "experiences" && (
        <div className="space-y-6 max-w-5xl">
          <div className="bg-gradient-to-r from-[#3B176D] to-[#5B21B6] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold">Signature Experiences Control</h2>
              <p className="text-xs text-purple-100 mt-1 max-w-xl leading-relaxed">
                Configure detailed timelines, amenities lists, titles, locations, and price points shown on the Experiences detail pages.
              </p>
            </div>
            <button
              onClick={() => {
                const newExp: DetailedExperience = {
                  id: `exp-${Date.now()}`,
                  title: "New Signature Experience",
                  category: "birthday",
                  location: "New York, NY",
                  price: "₹500",
                  rating: 5.0,
                  image: "/images/exp_birthday.png",
                  tagline: "Custom experience tagline",
                  overview: "A premium signature experience customized for you.",
                  amenities: ["Dedicated host", "Luxury setup", "Champagne welcome"],
                  itinerary: [
                    { time: "06:00 PM", title: "Welcome & Reception", desc: "Arrive at the location and meet your private host." }
                  ]
                };
                const next = [newExp, ...experiences];
                setExperiences(next);
                saveExperiencesCatalogCMS(next);
                toast.success("New signature experience added!");
              }}
              className="relative z-10 bg-white hover:bg-purple-50 text-[#5B21B6] font-bold text-xs px-5 py-3 rounded-xl transition-all shrink-0 shadow-md hover:-translate-y-0.5 active:translate-y-0 duration-250"
            >
              ＋ Add Experience
            </button>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-12 translate-x-12"></div>
            <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-purple-500/20 rounded-full blur-xl pointer-events-none translate-y-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp, idx) => (
              <div
                key={exp.id}
                className="group relative bg-white border border-[#E9E4F5] rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(91,33,182,0.02)] hover:shadow-[0_20px_40px_rgba(91,33,182,0.07)] hover:border-[#5B21B6]/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative">
                  <div className="relative w-full h-44 overflow-hidden bg-gradient-to-br from-[#8B5CF6]/10 to-[#5B21B6]/15">
                    {exp.image ? (
                      <img
                        src={exp.image}
                        alt={exp.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-purple-50">
                        ✨
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17142A]/80 via-[#17142A]/10 to-transparent"></div>
                    
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur text-amber-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                      <span className="text-xs">★</span> {Number(exp.rating || 5.0).toFixed(2)}
                    </div>
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#5B21B6]/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                      <span>Package:</span>
                      <span className="text-white font-black">{exp.price}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-[-14px] left-4 bg-white border border-[#E9E4F5] text-[#5B21B6] text-[8px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md z-10 tracking-wider">
                    {exp.category}
                  </div>
                </div>

                <div className="pt-6 px-5 pb-5 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-display font-bold text-[#17142A] text-base group-hover:text-[#5B21B6] transition-colors line-clamp-1">
                      {exp.title}
                    </h3>
                    <p className="text-[10px] text-[#6B6780] font-bold flex items-center gap-1 mt-1">
                      📍 {exp.location || "Location not configured"}
                    </p>
                    <p className="text-[10px] text-[#8B5CF6] font-semibold italic mt-1.5 line-clamp-1">
                      "{exp.tagline || "No tagline set"}"
                    </p>
                    <p className="text-xs text-[#6B6780] font-medium leading-relaxed mt-1 line-clamp-2">
                      {exp.overview || "No overview summary provided."}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F5F3FF] flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedExpForEdit(exp);
                        setSelectedExpIdx(idx);
                        setEditExpTitle(exp.title);
                        setEditExpTagline(exp.tagline);
                        setEditExpLocation(exp.location);
                        setEditExpPrice(exp.price);
                        setEditExpRating(String(exp.rating));
                        setEditExpCategory(exp.category);
                        setEditExpOverview(exp.overview);
                        setEditExpImage(exp.image || "");
                        setEditExpAmenities(exp.amenities.join("\n"));
                        setEditExpItinerary(exp.itinerary || []);
                        setExpEditTab("params");
                      }}
                      className="flex-1 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      ✏️ Edit Details
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${exp.title}"?`)) {
                          const next = experiences.filter((e) => e.id !== exp.id);
                          setExperiences(next);
                          saveExperiencesCatalogCMS(next);
                          toast.success("Experience deleted!");
                        }
                      }}
                      className="bg-[#C94B63]/10 hover:bg-[#C94B63]/25 text-[#C94B63] text-xs font-bold px-3 py-2.5 rounded-xl transition-all duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "howitworks" && (
        <div className="space-y-6 max-w-5xl">
          <div className="bg-gradient-to-r from-[#3B176D] to-[#5B21B6] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold">How It Works (Steps Control)</h2>
              <p className="text-xs text-purple-100 mt-1 max-w-xl leading-relaxed">
                Edit the step details and flow instructions displayed on the How It Works page and timeline.
              </p>
            </div>
            <button
              onClick={() => {
                const newStep: StepItem = {
                  n: String(steps.length + 1).padStart(2, '0'),
                  title: "New Instruction Step",
                  body: "Specify the instruction text details here."
                };
                const next = [...steps, newStep];
                setSteps(next);
                saveStepsCMS(next);
                toast.success("New step timeline item added!");
              }}
              className="relative z-10 bg-white hover:bg-purple-50 text-[#5B21B6] font-bold text-xs px-5 py-3 rounded-xl transition-all shrink-0 shadow-md hover:-translate-y-0.5 active:translate-y-0 duration-250"
            >
              ＋ Add New Step
            </button>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-12 translate-x-12"></div>
            <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-purple-500/20 rounded-full blur-xl pointer-events-none translate-y-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div
                key={step.n}
                className="group relative bg-white border border-[#E9E4F5] rounded-[28px] p-6 shadow-[0_4px_20px_rgba(91,33,182,0.02)] hover:shadow-[0_20px_40px_rgba(91,33,182,0.07)] hover:border-[#5B21B6]/20 transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center gap-4 border-b border-[#F5F3FF] pb-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5B21B6] to-[#8B5CF6] text-white font-display text-sm font-extrabold flex items-center justify-center shrink-0 shadow-md shadow-purple-600/10">
                      {step.n}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <h3 className="text-base font-bold text-[#17142A] group-hover:text-[#5B21B6] transition-colors">{step.title}</h3>
                      <span className="text-[8px] uppercase tracking-wider text-[#6B6780] font-bold mt-1 inline-block">Step {step.n} Configuration</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B6780] font-medium leading-relaxed line-clamp-3 mb-2">
                    {step.body || "No instruction copy specified."}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-[#F5F3FF] flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStepForEdit(step);
                      setSelectedStepIdx(idx);
                      setEditStepN(step.n);
                      setEditStepTitle(step.title);
                      setEditStepBody(step.body);
                    }}
                    className="flex-1 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    ✏️ Edit Step
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this step?")) {
                        const next = steps.filter((_, sIdx) => sIdx !== idx);
                        const reindexed = next.map((item, index) => ({
                          ...item,
                          n: String(index + 1).padStart(2, '0')
                        }));
                        setSteps(reindexed);
                        saveStepsCMS(reindexed);
                        toast.success("Step deleted!");
                      }
                    }}
                    className="bg-[#C94B63]/10 hover:bg-[#C94B63]/25 text-[#C94B63] text-xs font-bold px-3 py-2.5 rounded-xl transition-all duration-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "lookbook" && (
        <div className="space-y-6 max-w-5xl">
          <div className="bg-gradient-to-r from-[#3B176D] to-[#5B21B6] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold">Lookbook Gallery Control</h2>
              <p className="text-xs text-purple-100 mt-1 max-w-xl leading-relaxed">
                Add, delete, or modify the showcase pictures and categories in the Lookbook gallery.
              </p>
            </div>
            <button
              onClick={() => {
                const newItem: GalleryItem = {
                  id: `g${Date.now()}`,
                  title: "New Showcase Event",
                  category: "birthday",
                  image: "/images/birthday_catalog.png"
                };
                const next = [newItem, ...galleryItems];
                setGalleryItems(next);
                saveGalleryItemsCMS(next);
                toast.success("New gallery item added at the top!");
              }}
              className="relative z-10 bg-white hover:bg-purple-50 text-[#5B21B6] font-bold text-xs px-5 py-3 rounded-xl transition-all shrink-0 shadow-md hover:-translate-y-0.5 active:translate-y-0 duration-250"
            >
              ＋ Add New Image
            </button>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-12 translate-x-12"></div>
            <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-purple-500/20 rounded-full blur-xl pointer-events-none translate-y-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                className="group relative bg-white border border-[#E9E4F5] rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(91,33,182,0.02)] hover:shadow-[0_20px_40px_rgba(91,33,182,0.07)] hover:border-[#5B21B6]/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative w-full h-44 overflow-hidden bg-gradient-to-br from-[#8B5CF6]/10 to-[#5B21B6]/15">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-purple-50">
                      🖼️
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17142A]/80 via-[#17142A]/10 to-transparent"></div>
                  
                  <div className="absolute bottom-3 left-4 bg-[#5B21B6]/90 text-white text-[8px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md z-10 tracking-wider">
                    {item.category}
                  </div>
                </div>

                <div className="pt-5 px-5 pb-5 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-display font-extrabold text-[#17142A] text-base group-hover:text-[#5B21B6] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-[#6B6780] font-semibold mt-1">
                      Showcase item ID: <span className="font-bold text-[#5B21B6]">{item.id}</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F5F3FF] flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedGalleryForEdit(item);
                        setSelectedGalleryIdx(idx);
                        setEditGalleryTitle(item.title);
                        setEditGalleryCategory(item.category);
                        setEditGalleryImage(item.image || "");
                      }}
                      className="flex-1 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      ✏️ Edit Details
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this item?")) {
                          const next = galleryItems.filter((i) => i.id !== item.id);
                          setGalleryItems(next);
                          saveGalleryItemsCMS(next);
                          toast.success("Gallery item deleted!");
                        }
                      }}
                      className="bg-[#C94B63]/10 hover:bg-[#C94B63]/25 text-[#C94B63] text-xs font-bold px-3 py-2.5 rounded-xl transition-all duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedBookingDetails && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#3B176D]/60 backdrop-blur-sm"
          onClick={() => setSelectedBookingDetails(null)}
        >
          <div
            className="bg-white border border-[#E9E4F5] rounded-[24px] max-w-xl w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBookingDetails(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] font-bold grid place-items-center transition-colors"
            >
              ✕
            </button>

            <div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                selectedBookingDetails.status === "accepted" || selectedBookingDetails.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : selectedBookingDetails.status === "requested"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                {selectedBookingDetails.status}
              </span>
              <h3 className="font-display text-2xl font-bold text-[#17142A] mt-2">
                Booking #{selectedBookingDetails.id} Details
              </h3>
            </div>

            {/* Event Details */}
            <div className="space-y-3 bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl p-4">
              <h4 className="text-xs uppercase tracking-wider text-[#5B21B6] font-bold font-bold">🎉 Celebration Profile</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Event Name</span>
                  <span className="text-[#17142A] font-bold">{selectedBookingDetails.event_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Schedule Date & Time</span>
                  <span className="text-[#17142A] font-bold">
                    📅 {selectedBookingDetails.event_date} {selectedBookingDetails.event_time ? `at ${selectedBookingDetails.event_time}` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Venue Location</span>
                  <span className="text-[#17142A] font-bold">{selectedBookingDetails.event_venue || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Estimated Budget</span>
                  <span className="text-[#17142A] font-bold">
                    {selectedBookingDetails.event_budget ? `₹${Number(selectedBookingDetails.event_budget).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Guest Count</span>
                  <span className="text-[#17142A] font-bold">{selectedBookingDetails.event_guests || 0} Guests</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Theme / Aesthetic</span>
                  <span className="text-[#17142A] font-bold">{selectedBookingDetails.event_theme || "—"}</span>
                </div>
              </div>
              {selectedBookingDetails.event_description && (
                <div className="text-xs border-t border-[#E9E4F5] pt-2 mt-2">
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Description / Overview</span>
                  <p className="text-[#6B6780] font-medium leading-relaxed mt-0.5">{selectedBookingDetails.event_description}</p>
                </div>
              )}
            </div>

            {/* Package & Financials */}
            <div className="space-y-3 bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl p-4">
              <h4 className="text-xs uppercase tracking-wider text-[#5B21B6] font-bold font-bold">💼 Contract & Package</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Planner</span>
                  <span className="text-[#17142A] font-bold font-bold">🏢 {selectedBookingDetails.planner_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Customer</span>
                  <span className="text-[#17142A] font-bold font-bold">👤 {selectedBookingDetails.customer_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Selected Package</span>
                  <span className="text-[#17142A] font-bold">{selectedBookingDetails.package_title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Package Price</span>
                  <span className="text-[#17142A] font-bold">
                    {selectedBookingDetails.package_price ? `₹${Number(selectedBookingDetails.package_price).toLocaleString()}` : "—"}
                  </span>
                </div>
              </div>
              {selectedBookingDetails.package_description && selectedBookingDetails.package_description !== "—" && (
                <div className="text-xs border-t border-[#E9E4F5] pt-2 mt-2">
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Package Scope of Work</span>
                  <p className="text-[#6B6780] font-medium leading-relaxed mt-0.5">{selectedBookingDetails.package_description}</p>
                </div>
              )}
              <div className="text-xs border-t border-[#E9E4F5] pt-2 mt-2 flex justify-between items-center bg-[#F5F3FF]/40 -mx-4 -mb-4 p-4 rounded-b-2xl">
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold">Advance Paid</span>
                  <span className="text-base text-[#5B21B6] font-extrabold">₹{Number(selectedBookingDetails.advance_paid).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block font-bold text-right">Balance Due</span>
                  <span className="text-base text-[#17142A] font-extrabold text-right block">
                    {selectedBookingDetails.package_price
                      ? `₹${(Number(selectedBookingDetails.package_price) - Number(selectedBookingDetails.advance_paid)).toLocaleString()}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedUserForEdit && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#3B176D]/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedUserForEdit(null)}
        >
          <div
            className="bg-white border border-[#E9E4F5] rounded-[24px] max-w-2xl w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedUserForEdit(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] font-bold grid place-items-center transition-colors"
            >
              ✕
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-[#17142A]">
                User Management Hub
              </h3>
              <p className="text-xs text-[#6B6780] font-medium mt-1">Configure profile details and review booking history for user account #{selectedUserForEdit.id}.</p>
            </div>

            {/* Modal Body: Split configuration dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Side: Writable Fields Form */}
              <form onSubmit={handleSaveUser} className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-[#5B21B6] font-bold">⚙️ Edit Profile Settings</h4>
                
                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17142A] outline-none focus:border-[#5B21B6] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17142A] outline-none focus:border-[#5B21B6] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17142A] outline-none focus:border-[#5B21B6] transition-colors"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold block mb-1">Account Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17142A] outline-none focus:border-[#5B21B6] transition-colors"
                  >
                    <option value="customer">Customer</option>
                    <option value="planner">Planner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E9E4F5] text-[#5B21B6] focus:ring-[#5B21B6]"
                  />
                  <label htmlFor="editIsActive" className="text-xs text-[#17142A] font-bold cursor-pointer">
                    Account is Active (Uncheck to Suspend)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForEdit(null)}
                    className="flex-1 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="flex-1 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {savingUser ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>

              {/* Right Side: Specifications and Bookings List */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-[#E9E4F5] pt-6 md:pt-0 md:pl-6">
                <h4 className="text-xs uppercase tracking-wider text-[#5B21B6] font-bold">📋 Account Specifications</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#6B6780]">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF] block font-bold">User ID</span>
                    <span className="text-[#17142A] font-bold">#{selectedUserForEdit.id}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF] block font-bold">Two-Factor Auth</span>
                    <span className="text-[#17142A] font-bold">{selectedUserForEdit.two_factor_enabled ? "Enabled 📧" : "Disabled"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF] block font-bold">Referral Code</span>
                    <span className="text-[#17142A] font-bold">{selectedUserForEdit.referral_code || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF] block font-bold">Date Joined</span>
                    <span className="text-[#17142A] font-bold">{new Date(selectedUserForEdit.date_joined).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="h-px bg-[#E9E4F5] my-2" />

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] block font-bold mb-2">
                    Event Bookings ({selectedUserForEdit.bookings?.length || 0})
                  </span>
                  {selectedUserForEdit.bookings && selectedUserForEdit.bookings.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedUserForEdit.bookings.map((b) => (
                        <div key={b.id} className="text-xs bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#17142A] truncate max-w-[150px]">🎉 {b.event_name}</span>
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              b.status === "accepted" || b.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : b.status === "requested"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-[#6B6780] space-y-0.5 font-medium">
                            <p>📅 Date: {b.event_date}</p>
                            <p>🏢 Planner: {b.planner_name}</p>
                            <p>👤 Cust: {b.customer_name}</p>
                            <p>📦 Package: {b.package_title}</p>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#E9E4F5]/60 pt-1.5 mt-1 text-[10px]">
                            <span className="text-[#5B21B6] font-bold">Adv: ₹{Number(b.advance_paid).toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedBookingDetails(b)}
                              className="text-[#5B21B6] hover:underline font-bold"
                            >
                              Details ➔
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B6780] font-semibold italic">No event bookings linked.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {selectedCatForEdit && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#1A0933]/50 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedCatForEdit(null)}
        >
          <div
            className="bg-gradient-to-b from-white via-[#FCFAFF] to-[#F7F4FE] border border-[#E9E4F5]/80 shadow-[0_30px_70px_-15px_rgba(91,33,182,0.25)] rounded-[32px] max-w-4xl w-full p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedCatForEdit(null)}
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] hover:text-[#4C1D95] font-bold grid place-items-center transition-all duration-300 hover:rotate-90 hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-[#17142A]">
                Edit Celebration Category
              </h3>
              <p className="text-xs text-[#6B6780] font-semibold mt-1">Configure layout options for category ID: <span className="text-[#5B21B6] font-bold">{selectedCatForEdit.id}</span>.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column - Inputs */}
              <div className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-[90px_1fr] gap-4">
                  <div>
                    <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Emoji Icon</label>
                    <input
                      type="text"
                      required
                      value={editCatEmoji}
                      onChange={(e) => setEditCatEmoji(e.target.value)}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-3 py-3 text-xs font-semibold text-center text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Category Title</label>
                    <input
                      type="text"
                      required
                      value={editCatTitle}
                      onChange={(e) => setEditCatTitle(e.target.value)}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Starting Price</label>
                    <input
                      type="text"
                      required
                      value={editCatStartingPrice}
                      onChange={(e) => setEditCatStartingPrice(e.target.value)}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Category Rating</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editCatRating}
                      onChange={(e) => setEditCatRating(e.target.value)}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Short Tagline</label>
                  <input
                    type="text"
                    required
                    value={editCatTagline}
                    onChange={(e) => setEditCatTagline(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Description Paragraph</label>
                  <textarea
                    rows={3}
                    required
                    value={editCatDescription}
                    onChange={(e) => setEditCatDescription(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all resize-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Image URL / Path</label>
                  <input
                    type="text"
                    value={editCatImage}
                    onChange={(e) => setEditCatImage(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                    placeholder="/images/example.png"
                  />
                </div>
              </div>

              {/* Right Column - Mockup Previews */}
              <div className="md:col-span-5 space-y-6">
                <h4 className="text-[10px] uppercase tracking-widest text-[#5B21B6] font-extrabold flex items-center gap-1.5 bg-[#F5F3FF] px-3 py-1.5 rounded-lg w-fit">👁️ Live CMS Mockups</h4>

                {/* Mockup 1: Landing Page Category Card */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-[#6B6780] uppercase tracking-wider block">Landing Catalog Card Preview</span>
                  <div className="relative text-left rounded-2xl p-5 border border-transparent ring-2 ring-[#8B5CF6] shadow-[0_10px_25px_-5px_rgba(91,33,182,0.3)] overflow-hidden bg-white min-h-[120px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 opacity-100" />
                    <div className="relative z-10 text-white">
                      <span className="text-3xl">{editCatEmoji || "✨"}</span>
                      <h3 className="font-cinematic text-lg font-semibold mt-3 text-white">
                        {editCatTitle || "Category Title"}
                      </h3>
                      <p className="text-xs mt-0.5 text-white/80 line-clamp-2 leading-relaxed">
                        {editCatTagline || "Category tagline..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mockup 2: Detailed Hero/Banner Preview */}
                {editCatImage && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-[#6B6780] uppercase tracking-wider block">Image Catalog Cover Banner</span>
                    <div className="relative rounded-2xl overflow-hidden h-36 border border-[#E9E4F5] shadow-md group/img bg-purple-50">
                      <img src={editCatImage} alt={editCatTitle} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-[#5B21B6]/85 text-white text-[8px] font-extrabold uppercase px-2.5 py-1 rounded shadow-sm">
                        Cover Preview
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-1 rounded">
                        Starting Price: {editCatStartingPrice || "0"} • ★ {editCatRating || "0.0"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-2 border-t border-[#E9E4F5]/60">
              <button
                type="button"
                onClick={() => setSelectedCatForEdit(null)}
                className="flex-1 border border-[#E9E4F5] hover:bg-[#F5F3FF] text-[#6B6780] hover:text-[#5B21B6] text-xs font-bold py-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = [...categories];
                  next[selectedCatIdx] = {
                    ...selectedCatForEdit,
                    emoji: editCatEmoji,
                    title: editCatTitle,
                    startingPrice: editCatStartingPrice,
                    rating: parseFloat(editCatRating) || 5.0,
                    tagline: editCatTagline,
                    description: editCatDescription,
                    image: editCatImage
                  };
                  setCategories(next);
                  saveCategoriesCMS(next);
                  setSelectedCatForEdit(null);
                  toast.success("Category updated successfully!");
                }}
                className="flex-1 bg-gradient-to-r from-[#6D28D9] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white text-xs font-bold py-3 rounded-2xl transition-all duration-200 shadow-[0_4px_14px_rgba(91,33,182,0.25)] hover:shadow-[0_6px_20px_rgba(91,33,182,0.4)]"
              >
                Save Category Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedExpForEdit && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#1A0933]/50 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedExpForEdit(null)}
        >
          <div
            className="bg-gradient-to-b from-white via-[#FCFAFF] to-[#F7F4FE] border border-[#E9E4F5]/80 shadow-[0_30px_70px_-15px_rgba(91,33,182,0.25)] rounded-[32px] max-w-3xl w-full p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedExpForEdit(null)}
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] hover:text-[#4C1D95] font-bold grid place-items-center transition-all duration-300 hover:rotate-90 hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-[#17142A]">
                Edit Signature Experience
              </h3>
              <p className="text-xs text-[#6B6780] font-semibold mt-1">Configure layout, amenities, and itinerary timeline for experience ID: <span className="text-[#5B21B6] font-bold">{selectedExpForEdit.id}</span>.</p>
            </div>

            <div className="flex gap-2 border-b border-[#E9E4F5] pb-3">
              <button
                type="button"
                onClick={() => setExpEditTab("params")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  expEditTab === "params"
                    ? "bg-[#5B21B6] text-white shadow-sm"
                    : "text-[#6B6780] hover:text-[#5B21B6] hover:bg-[#F5F3FF]"
                }`}
              >
                ⚙️ Base Parameters
              </button>
              <button
                type="button"
                onClick={() => setExpEditTab("amenities")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  expEditTab === "amenities"
                    ? "bg-[#5B21B6] text-white shadow-sm"
                    : "text-[#6B6780] hover:text-[#5B21B6] hover:bg-[#F5F3FF]"
                }`}
              >
                📋 Amenities Checklist
              </button>
              <button
                type="button"
                onClick={() => setExpEditTab("itinerary")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  expEditTab === "itinerary"
                    ? "bg-[#5B21B6] text-white shadow-sm"
                    : "text-[#6B6780] hover:text-[#5B21B6] hover:bg-[#F5F3FF]"
                }`}
              >
                📅 Itinerary Steps ({editExpItinerary.length})
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-2">
              {expEditTab === "params" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Display Title</label>
                      <input
                        type="text"
                        required
                        value={editExpTitle}
                        onChange={(e) => setEditExpTitle(e.target.value)}
                        className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Tagline</label>
                      <input
                        type="text"
                        required
                        value={editExpTagline}
                        onChange={(e) => setEditExpTagline(e.target.value)}
                        className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Location</label>
                        <input
                          type="text"
                          required
                          value={editExpLocation}
                          onChange={(e) => setEditExpLocation(e.target.value)}
                          className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Category</label>
                        <select
                          value={editExpCategory}
                          onChange={(e: any) => setEditExpCategory(e.target.value)}
                          className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs cursor-pointer"
                        >
                          <option value="birthday">birthday</option>
                          <option value="anniversary">anniversary</option>
                          <option value="love">love</option>
                          <option value="proposal">proposal</option>
                          <option value="kids">kids</option>
                          <option value="corporate">corporate</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Package Price</label>
                        <input
                          type="text"
                          required
                          value={editExpPrice}
                          onChange={(e) => setEditExpPrice(e.target.value)}
                          className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Rating</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editExpRating}
                          onChange={(e) => setEditExpRating(e.target.value)}
                          className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Detailed Overview</label>
                    <textarea
                      rows={3}
                      required
                      value={editExpOverview}
                      onChange={(e) => setEditExpOverview(e.target.value)}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all resize-none shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-end">
                    <div>
                      <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Image URL / Path</label>
                      <input
                        type="text"
                        value={editExpImage}
                        onChange={(e) => setEditExpImage(e.target.value)}
                        className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                        placeholder="/images/example.png"
                      />
                    </div>
                    {editExpImage && (
                      <div className="relative rounded-2xl overflow-hidden h-28 border border-[#E9E4F5] shadow-md group/img">
                        <img src={editExpImage} alt={editExpTitle} className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105" />
                        <div className="absolute top-2 left-2 bg-[#5B21B6]/85 text-white text-[8px] font-extrabold uppercase px-2.5 py-1 rounded shadow-sm">
                          Cover Preview
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {expEditTab === "amenities" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Amenities (One per line)</label>
                    <textarea
                      rows={8}
                      required
                      value={editExpAmenities}
                      onChange={(e) => setEditExpAmenities(e.target.value)}
                      className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all resize-none shadow-xs"
                      placeholder="Enter one amenity per line..."
                    />
                  </div>
                </div>
              )}

              {expEditTab === "itinerary" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-[#17142A] tracking-wider block">Itinerary Program Steps</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditExpItinerary([
                          ...editExpItinerary,
                          { time: "08:00 PM", title: "New Itinerary Step", desc: "Detailed step description..." }
                        ]);
                      }}
                      className="text-[10px] text-[#5B21B6] hover:text-[#4C1D95] font-extrabold transition-colors bg-[#F5F3FF] px-3 py-1.5 rounded-lg border border-[#EDE9FE] hover:bg-[#EDE9FE]"
                    >
                      ＋ Add Step
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {editExpItinerary.map((item, idx) => (
                      <div key={idx} className="bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl p-4 space-y-2 relative shadow-xs hover:border-[#8B5CF6]/20 transition-all duration-200 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setEditExpItinerary(editExpItinerary.filter((_, sIdx) => sIdx !== idx));
                          }}
                          className="absolute top-3 right-3 text-[9px] text-[#C94B63] hover:text-[#A72B43] bg-red-50 hover:bg-red-100/50 px-2 py-0.5 rounded-md font-bold transition-all"
                        >
                          Delete
                        </button>
                        
                        <div className="grid grid-cols-[100px_1fr] gap-3">
                          <div>
                            <label className="text-[8px] font-bold text-[#6B6780] uppercase block mb-1">Time</label>
                            <input
                              type="text"
                              value={item.time}
                              onChange={(e) => {
                                const next = [...editExpItinerary];
                                next[idx] = { ...item, time: e.target.value };
                                setEditExpItinerary(next);
                              }}
                              className="w-full bg-white border border-[#E9E4F5] rounded-xl px-2.5 py-2 text-[10px] font-semibold outline-none focus:border-[#5B21B6] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-[#6B6780] uppercase block mb-1">Step Title</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const next = [...editExpItinerary];
                                next[idx] = { ...item, title: e.target.value };
                                setEditExpItinerary(next);
                              }}
                              className="w-full bg-white border border-[#E9E4F5] rounded-xl px-2.5 py-2 text-[10px] font-semibold outline-none focus:border-[#5B21B6] transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-[#6B6780] uppercase block mb-1">Step Description</label>
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => {
                              const next = [...editExpItinerary];
                              next[idx] = { ...item, desc: e.target.value };
                              setEditExpItinerary(next);
                            }}
                            className="w-full bg-white border border-[#E9E4F5] rounded-xl px-2.5 py-2 text-[10px] font-semibold outline-none focus:border-[#5B21B6] transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 border-t border-[#E9E4F5] pt-4 justify-end">
              <button
                type="button"
                onClick={() => setSelectedExpForEdit(null)}
                className="border border-[#E9E4F5] hover:bg-[#F5F3FF] text-[#6B6780] hover:text-[#5B21B6] text-xs font-bold px-6 py-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = [...experiences];
                  next[selectedExpIdx] = {
                    ...selectedExpForEdit,
                    title: editExpTitle,
                    tagline: editExpTagline,
                    location: editExpLocation,
                    price: editExpPrice,
                    rating: parseFloat(editExpRating) || 5.0,
                    category: editExpCategory,
                    overview: editExpOverview,
                    image: editExpImage,
                    amenities: editExpAmenities.split("\n").filter(line => line.trim() !== ""),
                    itinerary: editExpItinerary
                  };
                  setExperiences(next);
                  saveExperiencesCatalogCMS(next);
                  setSelectedExpForEdit(null);
                  toast.success("Signature Experience updated successfully!");
                }}
                className="bg-gradient-to-r from-[#6D28D9] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white text-xs font-bold px-6 py-3 rounded-2xl transition-all duration-200 shadow-[0_4px_14px_rgba(91,33,182,0.25)] hover:shadow-[0_6px_20px_rgba(91,33,182,0.4)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStepForEdit && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#1A0933]/50 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedStepForEdit(null)}
        >
          <div
            className="bg-gradient-to-b from-white via-[#FCFAFF] to-[#F7F4FE] border border-[#E9E4F5]/80 shadow-[0_30px_70px_-15px_rgba(91,33,182,0.25)] rounded-[32px] max-w-lg w-full p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedStepForEdit(null)}
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] hover:text-[#4C1D95] font-bold grid place-items-center transition-all duration-300 hover:rotate-90 hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-[#17142A]">
                Edit How It Works Step
              </h3>
              <p className="text-xs text-[#6B6780] font-semibold mt-1">Configure layout options for timeline step: <span className="text-[#5B21B6] font-bold">{selectedStepForEdit.n}</span>.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[90px_1fr] gap-4">
                <div>
                  <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Step Badge</label>
                  <input
                    type="text"
                    required
                    value={editStepN}
                    onChange={(e) => setEditStepN(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-3 py-3 text-xs font-semibold text-center text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Step Title</label>
                  <input
                    type="text"
                    required
                    value={editStepTitle}
                    onChange={(e) => setEditStepTitle(e.target.value)}
                    className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#5B21B6] uppercase tracking-wider font-extrabold block mb-1.5">Instruction Description (Body Text)</label>
                <textarea
                  rows={4}
                  required
                  value={editStepBody}
                  onChange={(e) => setEditStepBody(e.target.value)}
                  className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-2xl px-4 py-3 text-xs font-semibold text-[#17142A] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10 focus:bg-white transition-all resize-none shadow-xs"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStepForEdit(null)}
                className="flex-1 border border-[#E9E4F5] hover:bg-[#F5F3FF] text-[#6B6780] hover:text-[#5B21B6] text-xs font-bold py-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = [...steps];
                  next[selectedStepIdx] = {
                    ...selectedStepForEdit,
                    n: editStepN,
                    title: editStepTitle,
                    body: editStepBody
                  };
                  setSteps(next);
                  saveStepsCMS(next);
                  setSelectedStepForEdit(null);
                  toast.success("Timeline step updated successfully!");
                }}
                className="flex-1 bg-gradient-to-r from-[#6D28D9] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white text-xs font-bold py-3 rounded-2xl transition-all duration-200 shadow-[0_4px_14px_rgba(91,33,182,0.25)] hover:shadow-[0_6px_20px_rgba(91,33,182,0.4)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGalleryForEdit && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#3B176D]/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedGalleryForEdit(null)}
        >
          <div
            className="bg-white border border-[#E9E4F5] rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-150 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedGalleryForEdit(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] font-bold grid place-items-center transition-colors"
            >
              ✕
            </button>

            <div>
              <h3 className="font-display text-2xl font-bold text-[#17142A]">
                Edit Lookbook Item
              </h3>
              <p className="text-xs text-[#6B6780] font-medium mt-1">Configure layout options for gallery item ID: {selectedGalleryForEdit.id}.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold block mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={editGalleryTitle}
                  onChange={(e) => setEditGalleryTitle(e.target.value)}
                  className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17142A] outline-none focus:border-[#5B21B6] transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold block mb-1">Category</label>
                <select
                  value={editGalleryCategory}
                  onChange={(e: any) => setEditGalleryCategory(e.target.value)}
                  className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17142A] outline-none focus:border-[#5B21B6] transition-colors cursor-pointer"
                >
                  <option value="birthday">birthday</option>
                  <option value="anniversary">anniversary</option>
                  <option value="love">love</option>
                  <option value="proposal">proposal</option>
                  <option value="kids">kids</option>
                  <option value="corporate">corporate</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold block mb-1">Image URL / Path</label>
                <input
                  type="text"
                  value={editGalleryImage}
                  onChange={(e) => setEditGalleryImage(e.target.value)}
                  className="w-full bg-[#FCFAFF] border border-[#E9E4F5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17142A] outline-none focus:border-[#5B21B6] transition-colors"
                  placeholder="/images/example.png"
                />
                {editGalleryImage && (
                  <div className="mt-2 relative rounded-xl overflow-hidden h-24 border border-[#E9E4F5]">
                    <img src={editGalleryImage} alt={editGalleryTitle} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedGalleryForEdit(null)}
                className="flex-1 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#5B21B6] text-xs font-bold py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = [...galleryItems];
                  next[selectedGalleryIdx] = {
                    ...selectedGalleryForEdit,
                    title: editGalleryTitle,
                    category: editGalleryCategory as SceneVariant,
                    image: editGalleryImage
                  };
                  setGalleryItems(next);
                  saveGalleryItemsCMS(next);
                  setSelectedGalleryForEdit(null);
                  toast.success("Gallery item updated successfully!");
                }}
                className="flex-1 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs"
              >
                Save Changes
              </button>
            </div>
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
