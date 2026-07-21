import { useState } from "react";
import { User, BookOpen, LogOut, Save, Loader2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    dailyStudyHours: user?.dailyStudyHours || 4,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      const res = await api.patch("/api/auth/me", form);
      setUser(res.data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-xl">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your profile and preferences</p>
        </div>

        {/* Profile section */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <User size={18} className="text-primary-600" />
            Profile
          </h2>

          {success && (
            <div className="bg-primary-50 border border-primary-200 text-primary-700 text-sm px-4 py-3 rounded-xl mb-4">
              ✅ Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm bg-surface-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Study Hours:
                <span className="text-primary-600 font-bold ml-1">{form.dailyStudyHours}h</span>
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
                <span>1h (Light)</span>
                <span>6h (Moderate)</span>
                <span>12h (Intensive)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={15} /> Save Changes</>
              )}
            </button>
          </form>
        </div>

        {/* Study preferences */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary-600" />
            Study Info
          </h2>
          <div className="space-y-3">
            {[
              { label: "Daily study target", value: `${user?.dailyStudyHours || 4} hours/day` },
              { label: "Account created", value: new Date(user?.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
          <h2 className="font-bold text-red-600 mb-4 flex items-center gap-2">
            <LogOut size={18} />
            Account
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Sign out from your account on this device.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </Layout>
  );
}