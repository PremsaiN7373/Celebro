import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { RootState } from "../../app/store";
import WidgetCard from "@/components/ui/WidgetCard";

export default function ReferralsPage() {
  const user = useSelector((s: RootState) => s.auth.user);

  const referralLink = user?.referral_code
    ? `${window.location.origin}/register?ref=${user.referral_code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied");
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold text-[#211F20]">
          Invite Friends & Celebrators
        </h1>
        <p className="text-sm text-[#756D6F] mt-1 font-medium">
          Share your custom referral link. Friends who join Celebro will unlock exclusive celebration benefits.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#E9DDD5] rounded-[16px] p-5 shadow-[0_4px_20px_rgba(33,31,32,0.06)]">
          <p className="text-xs uppercase tracking-widest text-[#756D6F] font-bold">Your Code</p>
          <p className="text-2xl font-display font-bold text-[#7A1F3D] mt-2">{user?.referral_code || "—"}</p>
        </div>
        <div className="bg-white border border-[#E9DDD5] rounded-[16px] p-5 shadow-[0_4px_20px_rgba(33,31,32,0.06)]">
          <p className="text-xs uppercase tracking-widest text-[#756D6F] font-bold">Total Referrals</p>
          <p className="text-2xl font-display font-bold text-[#211F20] mt-2">{user?.referral_count ?? 0}</p>
        </div>
      </div>

      <WidgetCard title="Personal Invitation Link">
        <div className="flex gap-3">
          <input
            readOnly
            className="input-field flex-1 text-xs font-semibold"
            value={referralLink}
          />
          <button onClick={copyLink} className="btn-primary text-xs shrink-0 font-semibold">
            Copy Link
          </button>
        </div>
        <p className="text-xs text-[#756D6F] mt-4 leading-relaxed font-medium">
          Friends can also enter your code (<span className="text-[#7A1F3D] font-bold">{user?.referral_code}</span>) directly during registration.
        </p>
      </WidgetCard>
    </div>
  );
}



