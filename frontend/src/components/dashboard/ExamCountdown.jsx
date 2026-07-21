import { Target, Clock } from "lucide-react";

export default function ExamCountdown({ subjects = [] }) {
  const nearest = subjects
    .filter(s => s.daysLeft > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];

  if (!nearest) return null;

  const urgency = nearest.daysLeft <= 7
    ? "text-red-600 bg-red-50 border-red-200"
    : nearest.daysLeft <= 30
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-primary-600 bg-primary-50 border-primary-200";

  return (
    <div className={`rounded-2xl border p-5 ${urgency}`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={18} />
        <h3 className="font-bold text-sm">Exam Countdown</h3>
      </div>

      <p className="text-xs font-medium opacity-70 mb-1">{nearest.name}</p>
      <p className="text-xs opacity-60 mb-3">
        {new Date(nearest.examDate).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric"
        })}
      </p>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-black">{nearest.daysLeft}</span>
        <span className="text-sm font-semibold mb-2 opacity-70">Days Left</span>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold opacity-70">
        <Target size={14} />
        Daily Target: {Math.ceil((nearest.totalTopics - nearest.completedTopics) / Math.max(nearest.daysLeft, 1))} topics/day
      </div>
    </div>
  );
}