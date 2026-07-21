import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2, CheckCircle2, Circle, Clock, Calendar, AlertTriangle } from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../services/api";

const STATUS_COLORS = {
  done: { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" },
  in_progress: { bg: "#dbeafe", text: "#2563eb", border: "#bfdbfe" },
  pending: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
};

const STATUS_LABELS = {
  done: "Done",
  in_progress: "In Progress",
  pending: "Pending",
};

function TopicCard({ topic, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);
  const colors = STATUS_COLORS[topic.status] || STATUS_COLORS.pending;

  const handleToggle = async () => {
    const newStatus = topic.status === "done" ? "pending" : "done";
    setUpdating(true);
    try {
      await api.patch(`/api/topics/${topic._id}/status`, { status: newStatus });
      onStatusUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <button onClick={handleToggle} disabled={updating} className="shrink-0">
        {updating ? (
          <Loader2 size={20} className="animate-spin text-primary-500" />
        ) : topic.status === "done" ? (
          <CheckCircle2 size={20} className="text-primary-500" />
        ) : (
          <Circle size={20} className="text-gray-300 hover:text-primary-400 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${topic.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>
          {topic.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={11} /> {topic.estimatedHours}h
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-lg"
            style={{ backgroundColor: `${topic.subjectId?.color}20`, color: topic.subjectId?.color }}
          >
            {topic.subjectId?.name?.split(" ")[0]}
          </span>
        </div>
      </div>

      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0"
        style={{ color: colors.text, backgroundColor: `${colors.text}15` }}
      >
        {STATUS_LABELS[topic.status]}
      </span>
    </div>
  );
}

export default function MyPlan() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replanning, setReplanning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const subjectsRes = await api.get("/api/subjects");
      const subjects = subjectsRes.data.data;

      let allTopics = [];
      for (const subject of subjects) {
        const res = await api.get(`/api/topics/${subject._id}`);
        const withSubject = res.data.data.map(t => ({
          ...t,
          subjectId: { _id: subject._id, name: subject.name, color: subject.color }
        }));
        allTopics = [...allTopics, ...withSubject];
      }

      allTopics.sort((a, b) => {
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      });

      setTopics(allTopics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await api.post("/api/ai/generate-plan", {});
      setMessage({ type: "success", text: res.data.message });
      fetchTopics();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to generate plan" });
    } finally {
      setGenerating(false);
    }
  };

  const handleReplan = async () => {
    setReplanning(true);
    setMessage(null);
    try {
      const res = await api.post("/api/ai/replan", {});
      setMessage({ type: "success", text: `Replanned! ${res.data.missedCount || 0} missed topics rescheduled.` });
      fetchTopics();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Replan failed" });
    } finally {
      setReplanning(false);
    }
  };

  // Group topics by date
  const grouped = topics.reduce((acc, topic) => {
    const date = topic.scheduledDate
      ? new Date(topic.scheduledDate).toISOString().split("T")[0]
      : "unscheduled";
    if (!acc[date]) acc[date] = [];
    acc[date].push(topic);
    return acc;
  }, {});

  const today = new Date().toISOString().split("T")[0];

  const formatDateLabel = (dateStr) => {
    if (dateStr === "unscheduled") return "📋 Unscheduled";
    if (dateStr === today) return "📅 Today";
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split("T")[0]) return "📅 Tomorrow";
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  const isPast = (dateStr) => dateStr !== "unscheduled" && dateStr < today;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Study Plan</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Your AI-generated day-by-day study schedule
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-200 bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors disabled:opacity-60"
            >
              {generating ? (
                <><Loader2 size={15} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={15} /> Generate Plan</>
              )}
            </button>
            <button
              onClick={handleReplan}
              disabled={replanning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              {replanning ? (
                <><Loader2 size={15} className="animate-spin" /> Replanning...</>
              ) : (
                <><RefreshCw size={15} /> AI Replan</>
              )}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-primary-50 border border-primary-200 text-primary-700"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}>
            {message.type === "success"
              ? <CheckCircle2 size={16} />
              : <AlertTriangle size={16} />
            }
            {message.text}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-surface-200">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No study plan yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              Add subjects, upload syllabuses, then click "Generate Plan" to let AI create your schedule!
            </p>
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <Sparkles size={15} />
              Generate My Plan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped)
              .sort(([a], [b]) => {
                if (a === "unscheduled") return 1;
                if (b === "unscheduled") return -1;
                return new Date(a) - new Date(b);
              })
              .map(([date, dateTopics]) => (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className={`text-sm font-bold ${
                      date === today
                        ? "text-primary-600"
                        : isPast(date)
                        ? "text-red-400"
                        : "text-gray-700"
                    }`}>
                      {formatDateLabel(date)}
                    </h2>
                    {isPast(date) && date !== "unscheduled" && (
                      <span className="text-xs font-semibold text-red-400 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <AlertTriangle size={11} /> Missed
                      </span>
                    )}
                    {date === today && (
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-lg">
                        Today
                      </span>
                    )}
                    <div className="flex-1 h-px bg-surface-200"></div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {dateTopics.filter(t => t.status === "done").length}/{dateTopics.length} done
                    </span>
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    {dateTopics.map((topic) => (
                      <TopicCard
                        key={topic._id}
                        topic={topic}
                        onStatusUpdate={fetchTopics}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
}