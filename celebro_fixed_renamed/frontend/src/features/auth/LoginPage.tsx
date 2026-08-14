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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login/", { email, password });
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      const me = await apiClient.get("/auth/me/");
      dispatch(setUser(me.data));
      toast.success(`Welcome back, ${me.data.username || me.data.email}`);
      navigate("/dashboard");
    } catch (err: any) {
      const status = err?.response?.status;
      toast.error(
        status === 401
          ? "Invalid email or password"
          : "Could not log in — check the backend server is running"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-6">
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
          <h2 className="text-lg font-medium text-ink-900 mb-5">Log in</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-ink-500 mb-1 block">Email</label>
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
              <label className="text-xs font-medium text-ink-500 mb-1 block">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary w-full mt-2" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-sm text-ink-500 mt-5 text-center">
          New to Celebro?{" "}
          <Link to="/register" className="text-ink-900 font-medium underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
