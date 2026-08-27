import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

interface GuestItem {
  id: number;
  name: string;
  contact: string;
  group: string;
  rsvp_status: "confirmed" | "pending" | "declined";
  is_vip: boolean;
}

const INITIAL_GUESTS: GuestItem[] = [
  { id: 1, name: "Aarav Sharma", contact: "+91 98765 43210", group: "Family", rsvp_status: "confirmed", is_vip: true },
  { id: 2, name: "Priya Patel", contact: "priya@example.com", group: "Bride Side", rsvp_status: "confirmed", is_vip: false },
  { id: 3, name: "Vikram Malhotra", contact: "+91 98123 45678", group: "Groom Side", rsvp_status: "pending", is_vip: true },
  { id: 4, name: "Ananya Roy", contact: "ananya@example.com", group: "Friends", rsvp_status: "pending", is_vip: false },
  { id: 5, name: "Rohan Varma", contact: "+91 99887 76655", group: "College Friends", rsvp_status: "declined", is_vip: false },
];

export default function GuestsPage() {
  const [searchParams] = useSearchParams();
  const [guests, setGuests] = useState<GuestItem[]>(INITIAL_GUESTS);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [group, setGroup] = useState("Family");
  const [isVip, setIsVip] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const totalGuests = guests.length;
  const confirmedCount = guests.filter((g) => g.rsvp_status === "confirmed").length;
  const pendingCount = guests.filter((g) => g.rsvp_status === "pending").length;
  const declinedCount = guests.filter((g) => g.rsvp_status === "declined").length;

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.contact.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = !filterGroup || g.group === filterGroup;
    const matchesRsvp = !filterRsvp || g.rsvp_status === filterRsvp;
    return matchesSearch && matchesGroup && matchesRsvp;
  });

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newGuest: GuestItem = {
      id: Date.now(),
      name,
      contact,
      group: group || "Family",
      rsvp_status: "pending",
      is_vip: isVip,
    };
    setGuests([newGuest, ...guests]);
    setName("");
    setContact("");
    setIsVip(false);
    setShowAddForm(false);
    toast.success("Guest added successfully!");
  };

  const handleStatusChange = (id: number, status: GuestItem["rsvp_status"]) => {
    setGuests(guests.map((g) => (g.id === id ? { ...g, rsvp_status: status } : g)));
    toast.success("RSVP updated");
  };

  const handleDelete = (id: number) => {
    setGuests(guests.filter((g) => g.id !== id));
    toast.success("Guest removed");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#17142A]">
            Guest Management
          </h1>
          <p className="text-[#6B6780] text-sm mt-1 font-medium">
            Manage your attendee list, VIP access, group tags, and real-time RSVPs.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="btn-primary text-xs font-semibold self-start sm:self-auto"
        >
          {showAddForm ? "✕ Close Form" : "+ Add New Guest"}
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-5 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
          <p className="text-xs text-[#6B6780] font-bold uppercase tracking-wider">Total Guests</p>
          <p className="font-display text-3xl font-bold text-[#17142A] mt-2">{totalGuests}</p>
        </div>

        <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-5 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
          <p className="text-xs text-[#3A8D68] font-bold uppercase tracking-wider">Confirmed</p>
          <p className="font-display text-3xl font-bold text-[#3A8D68] mt-2">{confirmedCount}</p>
        </div>

        <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-5 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
          <p className="text-xs text-[#D08A24] font-bold uppercase tracking-wider">Pending</p>
          <p className="font-display text-3xl font-bold text-[#D08A24] mt-2">{pendingCount}</p>
        </div>

        <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-5 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
          <p className="text-xs text-[#C94B63] font-bold uppercase tracking-wider">Declined</p>
          <p className="font-display text-3xl font-bold text-[#C94B63] mt-2">{declinedCount}</p>
        </div>
      </div>

      {/* Add Guest Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddGuest}
          className="bg-white border border-[#E9E4F5] rounded-[16px] p-6 shadow-xs space-y-4"
        >
          <h3 className="font-display text-lg font-bold text-[#17142A]">Add New Guest</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1 block">
                Guest Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1 block">
                Contact Information
              </label>
              <input
                type="text"
                placeholder="Phone or Email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1 block">
                Group Tag
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="input-field"
              >
                <option value="Family">Family</option>
                <option value="Bride Side">Bride Side</option>
                <option value="Groom Side">Groom Side</option>
                <option value="Friends">Friends</option>
                <option value="VIP">VIP Guests</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#17142A] cursor-pointer">
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="w-4 h-4 accent-[#5B21B6]"
              />
              Mark as VIP Attendee
            </label>
            <button type="submit" className="btn-primary text-xs px-6 py-2.5">
              Save Guest
            </button>
          </div>
        </form>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search guests by name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
          <span className="absolute left-3.5 top-3.5 text-sm text-[#6B6780]">🔍</span>
        </div>

        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="input-field w-full sm:w-44 text-xs font-semibold"
        >
          <option value="">All Groups</option>
          <option value="Family">Family</option>
          <option value="Bride Side">Bride Side</option>
          <option value="Groom Side">Groom Side</option>
          <option value="Friends">Friends</option>
        </select>

        <select
          value={filterRsvp}
          onChange={(e) => setFilterRsvp(e.target.value)}
          className="input-field w-full sm:w-44 text-xs font-semibold"
        >
          <option value="">All RSVP States</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Guest Table */}
      <div className="bg-white border border-[#E9E4F5] rounded-[16px] overflow-hidden shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F3FF] border-b border-[#E9E4F5] text-[#17142A] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Group</th>
                <th className="px-6 py-4">RSVP Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E4F5] text-[#17142A]">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6B6780] font-medium">
                    No guests match your criteria.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((g) => (
                  <tr key={g.id} className="hover:bg-[#FCFAFF] transition-colors">
                    <td className="px-6 py-4 font-bold">
                      <span className="flex items-center gap-2">
                        {g.name}
                        {g.is_vip && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#EDE9FE] text-[#5B21B6] font-bold">
                            ★ VIP
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6B6780] font-medium">{g.contact || "—"}</td>
                    <td className="px-6 py-4 font-semibold text-[#5B21B6]">{g.group}</td>
                    <td className="px-6 py-4">
                      <select
                        value={g.rsvp_status}
                        onChange={(e) =>
                          handleStatusChange(g.id, e.target.value as GuestItem["rsvp_status"])
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-full border outline-none cursor-pointer ${
                          g.rsvp_status === "confirmed"
                            ? "bg-[#3A8D68]/10 text-[#3A8D68] border-[#3A8D68]/30"
                            : g.rsvp_status === "pending"
                            ? "bg-[#D08A24]/10 text-[#D08A24] border-[#D08A24]/30"
                            : "bg-[#C94B63]/10 text-[#C94B63] border-[#C94B63]/30"
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="text-xs font-bold text-[#C94B63] hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
