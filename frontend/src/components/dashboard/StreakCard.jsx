import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import api from "../../services/api";

export default function StreakCard() {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    api
      .get("/api/sessions/streak")
      .then((res) => setStreak(res.data.data.streak))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
        <Flame size={22} className="text-amber-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">Study Streak</p>
        <p className="text-2xl font-black text-gray-900">
          {streak === null ? "—" : `${streak} day${streak === 1 ? "" : "s"}`}
        </p>
        <p className="text-xs text-gray-400">
          {streak >= 3 ? "Bonus XP active 🔥" : "3 din streak par bonus XP milega"}
        </p>
      </div>
    </div>
  );
}