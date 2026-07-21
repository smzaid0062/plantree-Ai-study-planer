import { useState } from "react";
import { CheckCircle2, Circle, Clock, Play, ArrowRight, AlertTriangle } from "lucide-react";
import api from "../../services/api";

export default function TodayPlan({ topics = [], onStatusUpdate }) {
  const [updating, setUpdating] = useState(null);

  const handleToggle = async (topic) => {
    const newStatus = topic.status === "done" ? "pending" : "done";
    setUpdating(topic._id);
    try {
      await api.patch(`/api/topics/${topic._id}/status`, { status: newStatus });
      onStatusUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
        <div>
          <h3 className="font-bold text-gray-900">Today's Plan</h3>
          <p className="text-xs text-gray-400 mt-0.5">{today}</p>
        </div>
        <button className="text-xs font-semibold text-primary-600 flex items-center gap-1 hover:gap-2 transition-all">
          View Full Plan <ArrowRight size={13} />
        </button>
      </div>

      <div className="p-4 space-y-2">
        {topics.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-primary-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">All done for today!</p>
            <p className="text-xs text-gray-400 mt-1">No topics scheduled. Generate a plan.</p>
          </div>
        ) : (
          topics.map((topic) => (
            <div
              key={topic._id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                topic.status === "done"
                  ? "bg-primary-50 border-primary-100"
                  : "bg-surface-50 border-surface-200 hover:border-primary-200"
              }`}
            >
              <button
                onClick={() => handleToggle(topic)}
                disabled={updating === topic._id}
                className="shrink-0"
              >
                {topic.status === "done"
                  ? <CheckCircle2 size={22} className="text-primary-500" />
                  : <Circle size={22} className="text-gray-300 hover:text-primary-400 transition-colors" />
                }
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${
                  topic.status === "done" ? "line-through text-gray-400" : "text-gray-800"
                }`}>
                  {topic.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={11} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{topic.estimatedHours}h estimated</span>
                </div>
              </div>

              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0"
                style={{
                  backgroundColor: `${topic.subjectId?.color}15`,
                  color: topic.subjectId?.color || "#16a34a"
                }}
              >
                {topic.subjectId?.name?.split(" ")[0] || "Study"}
              </span>
            </div>
          ))
        )}
      </div>

      {topics.length > 0 && (
        <div className="px-4 pb-4">
          <button className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
            <Play size={15} />
            Start Study Session
          </button>
        </div>
      )}
    </div>
  );
}