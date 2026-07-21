import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Library, FileText,
  Timer, BarChart3, Calendar, BookMarked,
  Settings, LogOut, Sparkles, Brain
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { name: "Dashboard",      icon: LayoutDashboard, path: "/" },
  { name: "My Plan",        icon: BookOpen,        path: "/plan" },
  { name: "Subjects",       icon: Library,         path: "/subjects" },
  { name: "Topics",         icon: FileText,        path: "/topics" },
  { name: "Study Sessions", icon: Timer,           path: "/sessions" },
  { name: "Analytics",      icon: BarChart3,       path: "/analytics" },
  { name: "Calendar",       icon: Calendar,        path: "/calendar" },
  { name: "Resources",      icon: BookMarked,      path: "/resources" },
  { name: "Settings",       icon: Settings,        path: "/settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // XP progress (placeholder — Week 4 mein gamification add karenge)
  const level = 3;
  const xp = 2450;
  const xpForNextLevel = 3000;
  const xpPercent = Math.round((xp / xpForNextLevel) * 100);

  return (
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col h-screen sticky top-0 shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-100">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
          <Brain size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-base leading-tight">
            PlanTree - AI Study Planner
          </h1>
          <p className="text-xs text-primary-600 font-medium">Smart Learning</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-gray-500 hover:bg-surface-50 hover:text-gray-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`p-1.5 rounded-lg ${isActive ? "bg-primary-100" : ""}`}>
                  <Icon size={16} className={isActive ? "text-primary-600" : "text-gray-400"} />
                </span>
                {name}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* AI Assistant CTA */}
      <div className="px-4 py-3">
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">AI Assistant</span>
          </div>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            Need help with your study plan?
          </p>
          <button
            onClick={() => navigate("/plan")}
            className="w-full bg-primary-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={12} />
            Ask AI →
          </button>
        </div>
      </div>

      {/* User profile */}
      <div className="border-t border-surface-100 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || "Student"}
            </p>
            <p className="text-xs text-gray-400 truncate">MCA Student</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut size={15} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* Level + XP bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-primary-600">
              Level {level}
            </span>
            <span className="text-xs text-gray-400">{xp} / {xpForNextLevel} XP</span>
          </div>
          <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  );
}