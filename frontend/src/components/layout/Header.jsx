import { Search, Bell, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Header({ missedCount = 0 }) {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <header className="bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Left — greeting */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          {greeting()}, {user?.name?.split(" ")[0] || "Student"}! 👋
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Let's continue your learning journey — {today}
        </p>
      </div>

      {/* Right — search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={15} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search topics, subjects..."
            className="pl-9 pr-4 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 w-60"
          />
        </div>

        {/* Notification bell */}
        <button className="relative p-2.5 rounded-xl bg-surface-50 border border-surface-200 hover:bg-surface-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
          {missedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {missedCount}
            </span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-surface-50 border border-surface-200 hover:bg-surface-100 transition-colors"
        >
          {darkMode
            ? <Sun size={18} className="text-yellow-500" />
            : <Moon size={18} className="text-gray-600" />
          }
        </button>
      </div>
    </header>
  );
}