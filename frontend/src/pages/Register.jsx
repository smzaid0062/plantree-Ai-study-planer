import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", dailyStudyHours: 4 });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", form);
      login(res.data.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Brain size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Study Planner</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account and start learning smarter.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create account</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Md Zaid"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="zaid@example.com"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Daily study hours: <span className="text-primary-600 font-bold">{form.dailyStudyHours}h</span>
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={form.dailyStudyHours}
                onChange={(e) => setForm({ ...form, dailyStudyHours: Number(e.target.value) })}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1h</span><span>6h</span><span>12h</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" />Creating account...</>
              ) : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}