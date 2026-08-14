import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

type Role = "customer" | "planner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/auth/register/", {
        email,
        username,
        password,
        phone_number: phoneNumber,
        referral_code: referralCode,
        role,
      });
      toast.success("Account created — please sign in");
      navigate("/login");
    } catch (err: any) {
      const data = err?.response?.data;
      const detail =
        data?.email?.[0] || data?.username?.[0] || data?.password?.[0] ||
        "Could not create account";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#17142A] flex font-sans">
      {/* Left Split Panel: Deep Purple Brand Presentation */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3B176D] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/proposal_hero.png"
            alt="Luxury Event Atmosphere"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3B176D] via-[#3B176D]/80 to-[#3B176D]/40" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-block">
            <img src="/images/celebro_logo.png" alt="Celebro" className="h-14 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="text-xs uppercase tracking-[0.25em] text-[#EDE9FE] font-semibold mb-3 block">
            Plan • Connect • Celebrate
          </span>
          <blockquote className="font-display text-4xl font-bold leading-tight text-white mb-4">
            "Every milestone deserves perfection."
          </blockquote>
          <p className="text-[#EDE9FE]/90 text-base leading-relaxed font-medium">
            Create an account to browse top-rated event specialists, send digital invitations, organize guest RSVPs, and keep your event budget on track.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Celebro Inc. All rights reserved.
        </div>
      </div>

      {/* Right Split Panel: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md my-auto"
        >
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block">
              <img src="/images/celebro_logo.png" alt="Celebro" className="h-12 w-auto object-contain mx-auto" />
            </Link>
          </div>


          <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-8 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
            <h2 className="font-display text-2xl font-bold text-[#17142A] mb-1">Create Your Account</h2>
            <p className="text-sm text-[#6B6780] mb-6 font-medium">Select your account type to get started</p>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#F5F3FF] border border-[#E9E4F5] rounded-[10px]">
              <button
                type="button"
                className={`py-2.5 text-xs font-bold rounded-[8px] transition-all ${
                  role === "customer"
                    ? "bg-[#5B21B6] text-white shadow-xs"
                    : "text-[#6B6780] hover:text-[#17142A]"
                }`}
                onClick={() => setRole("customer")}
              >
                🎉 I'm Planning an Event
              </button>
              <button
                type="button"
                className={`py-2.5 text-xs font-bold rounded-[8px] transition-all ${
                  role === "planner"
                    ? "bg-[#5B21B6] text-white shadow-xs"
                    : "text-[#6B6780] hover:text-[#17142A]"
                }`}
                onClick={() => setRole("planner")}
              >
                ✨ I'm An Event Planner
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Username</label>
                <input
                  className="input-field"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Email Address</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Phone Number (Optional)</label>
                <input
                  className="input-field"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Referral Code (Optional)</label>
                <input
                  className="input-field"
                  placeholder="CELEBRO2026"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>
              <button
                className="w-full mt-2 btn-primary py-3"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>

          <p className="text-sm text-[#6B6780] mt-6 text-center font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-[#5B21B6] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}




