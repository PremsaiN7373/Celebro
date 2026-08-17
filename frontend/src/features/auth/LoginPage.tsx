import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { setUser } from "./authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [awaiting2FA, setAwaiting2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const finishLogin = async (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    const me = await apiClient.get("/auth/me/");
    dispatch(setUser(me.data));
    toast.success(`Welcome back, ${me.data.username || me.data.email}`);
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login/", { email, password });
      if (data.requires_2fa) {
        setPendingUserId(data.user_id);
        setAwaiting2FA(true);
        toast("Check your email for a login code.", { icon: "📧" });
      } else {
        await finishLogin(data.access, data.refresh);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      toast.error(
        status === 401
          ? "Invalid email or password"
          : "Could not log in — check backend server status"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const { data } = await apiClient.post("/auth/verify-2fa/", {
        user_id: pendingUserId,
        code,
      });
      await finishLogin(data.access, data.refresh);
    } catch {
      toast.error("Invalid or expired code");
    } finally {
      setVerifying(false);
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
            Exclusive Celebration Platform
          </span>
          <blockquote className="font-display text-4xl font-bold leading-tight text-white mb-4">
            "Your celebration starts here."
          </blockquote>
          <p className="text-[#EDE9FE]/90 text-base leading-relaxed font-medium">
            Discover verified master planners, manage guest lists, track budgets, and curate your dream event in one luxury workspace.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Celebro Inc. All rights reserved.
        </div>
      </div>

      {/* Right Split Panel: Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block">
              <img src="/images/celebro_logo.png" alt="Celebro" className="h-12 w-auto object-contain mx-auto" />
            </Link>
          </div>


          {!awaiting2FA ? (
            <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-8 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
              <h2 className="font-display text-2xl font-bold text-[#17142A] mb-1">Welcome Back</h2>
              <p className="text-sm text-[#6B6780] mb-6 font-medium">Enter your credentials to access your workspace</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] mb-1.5 block">Email Address</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#17142A] block">Password</label>
                    <span className="text-xs text-[#5B21B6] font-semibold hover:underline cursor-pointer">Forgot?</span>
                  </div>
                  <input
                    className="input-field"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  className="w-full mt-2 btn-primary py-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-[#E9E4F5] rounded-[16px] p-8 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
              <h2 className="font-display text-2xl font-bold text-[#17142A] mb-1">Enter Verification Code</h2>
              <p className="text-xs text-[#6B6780] mb-6 leading-relaxed font-medium">
                We sent a 6-digit code to <span className="text-[#5B21B6] font-bold">{email}</span>.
              </p>
              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  className="input-field py-3.5 text-center text-xl font-bold tracking-[0.4em]"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  required
                />
                <button
                  className="w-full btn-primary py-3"
                  type="submit"
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Verify & Sign In"}
                </button>
                <button
                  type="button"
                  className="text-xs text-[#6B6780] hover:text-[#17142A] underline w-full text-center mt-2 block font-medium"
                  onClick={() => {
                    setAwaiting2FA(false);
                    setCode("");
                  }}
                >
                  ← Back to Login
                </button>
              </form>
            </div>
          )}

          <p className="text-sm text-[#6B6780] mt-6 text-center font-medium">
            New to Celebro?{" "}
            <Link to="/register" className="text-[#5B21B6] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
