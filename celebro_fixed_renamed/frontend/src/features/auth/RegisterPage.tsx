import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

type Role = "customer" | "planner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        role,
      });
      toast.success("Account created — please log in");
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
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ink-900">Celebro</h1>
          <p className="text-sm text-ink-500 mt-1">Plan. Celebrate. Surprise.</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-medium text-ink-900 mb-5">Create your account</h2>

          <div className="flex mb-5 border border-ink-200 rounded-xl overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                role === "customer" ? "bg-ink-900 text-white" : "bg-white text-ink-600 hover:bg-ink-50"
              }`}
              onClick={() => setRole("customer")}
            >
              I'm celebrating
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                role === "planner" ? "bg-ink-900 text-white" : "bg-white text-ink-600 hover:bg-ink-50"
              }`}
              onClick={() => setRole("planner")}
            >
              I'm a planner
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="input-field"
              placeholder="Phone number (optional)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <button className="btn-primary w-full mt-2" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </div>

        <p className="text-sm text-ink-500 mt-5 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-ink-900 font-medium underline underline-offset-2">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
