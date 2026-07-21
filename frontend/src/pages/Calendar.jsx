import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../services/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ── Day Detail Modal ───────────────────────────────────────────
function DayModal({ date, topics, onClose, onUpdate }) {
  const [updating, setUpdating] = useState(null);

  const handleToggle = async (topic) => {
    const newStatus = topic.status === "done" ? "pending" : "done";
    setUpdating(topic._id);
    try {
      await api.patch(`/api/topics/${topic._id}/status`, { status: newStatus });
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const dateLabel = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const completedCount = topics.filter(t => t.status === "done").length;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{dateLabel}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {completedCount}/{topics.length} topics completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${topics.length > 0 ? (completedCount / topics.length) * 100 : 0}%` }}
          ></div>
        </div>

        {/* Topics list */}
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {topics.map((topic) => (
            <div
              key={topic._id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                topic.status === "done"
                  ? "bg-primary-50 border-primary-100"
                  : "bg-surface-50 border-surface-200"
              }`}
            >
              <button
                onClick={() => handleToggle(topic)}
                disabled={updating === topic._id}
                className="shrink-0"
              >
                {updating === topic._id ? (
                  <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                ) : topic.status === "done" ? (
                  <CheckCircle2 size={20} className="text-primary-500" />
                ) : (
                  <Circle size={20} className="text-gray-300 hover:text-primary-400 transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${
                  topic.status === "done" ? "line-through text-gray-400" : "text-gray-800"
                }`}>
                  {topic.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={11} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{topic.estimatedHours}h</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: `${topic.subjectColor}15`,
                      color: topic.subjectColor
                    }}
                  >
                    {topic.subjectName?.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl bg-surface-100 text-gray-600 text-sm font-semibold hover:bg-surface-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Calendar Page ─────────────────────────────────────────
export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const year = current.getFullYear();
  const month = current.getMonth();

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const subjectsRes = await api.get("/api/subjects");
      const subjectList = subjectsRes.data.data;

      let topics = [];
      for (const subject of subjectList) {
        const res = await api.get(`/api/topics/${subject._id}`);
        const withSubject = res.data.data
          .filter(t => t.scheduledDate)
          .map(t => ({
            ...t,
            subjectName: subject.name,
            subjectColor: subject.color,
          }));
        topics = [...topics, ...withSubject];
      }
      setAllTopics(topics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTopics(); }, []);

  // Get topics for a specific date
  const getTopicsForDate = (day) => {
    const date = new Date(year, month, day).toISOString().split("T")[0];
    return allTopics.filter(t =>
      new Date(t.scheduledDate).toISOString().split("T")[0] === date
    );
  };

  // Calendar grid setup
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date().toISOString().split("T")[0];

  // Stats for current month
  const monthTopics = allTopics.filter(t => {
    const d = new Date(t.scheduledDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const completedThisMonth = monthTopics.filter(t => t.status === "done").length;
  const pendingThisMonth = monthTopics.filter(t => t.status !== "done").length;

  // Get subject dots for a day (max 3)
  const getSubjectDots = (day) => {
    const topics = getTopicsForDate(day);
    const subjects = [...new Map(topics.map(t => [t.subjectName, t.subjectColor])).entries()];
    return subjects.slice(0, 3);
  };

  const handleDayClick = (day) => {
    const topics = getTopicsForDate(day);
    if (topics.length === 0) return;
    const date = new Date(year, month, day).toISOString().split("T")[0];
    setSelectedDate(date);
  };

  const selectedTopics = selectedDate
    ? allTopics.filter(t =>
        new Date(t.scheduledDate).toISOString().split("T")[0] === selectedDate
      )
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Your study schedule at a glance — click any date to see topics
          </p>
        </div>

        {/* Month stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-black text-gray-900">{monthTopics.length}</p>
            <p className="text-xs text-gray-400 mt-1">Topics this month</p>
          </div>
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-primary-600">{completedThisMonth}</p>
            <p className="text-xs text-gray-400 mt-1">Completed</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-amber-600">{pendingThisMonth}</p>
            <p className="text-xs text-gray-400 mt-1">Remaining</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrent(new Date(year, month - 1))}
              className="p-2.5 rounded-xl hover:bg-surface-100 transition-colors border border-surface-200"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-900">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={() => setCurrent(new Date())}
                className="text-xs text-primary-600 font-semibold hover:underline mt-0.5"
              >
                Back to today
              </button>
            </div>
            <button
              onClick={() => setCurrent(new Date(year, month + 1))}
              className="p-2.5 rounded-xl hover:bg-surface-100 transition-colors border border-surface-200"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells */}
              {Array(adjustedFirst).fill(null).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1;
                const dateStr = new Date(year, month, day).toISOString().split("T")[0];
                const dayTopics = getTopicsForDate(day);
                const dots = getSubjectDots(day);
                const isToday = dateStr === today;
                const isPast = dateStr < today;
                const hasTopics = dayTopics.length > 0;
                const allDone = hasTopics && dayTopics.every(t => t.status === "done");
                const someDone = hasTopics && dayTopics.some(t => t.status === "done");
                const isSelected = selectedDate === dateStr;

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative min-h-[70px] p-2 rounded-xl transition-all
                      ${hasTopics ? "cursor-pointer hover:shadow-md" : "cursor-default"}
                      ${isToday ? "bg-primary-600 text-white" : ""}
                      ${isSelected && !isToday ? "bg-primary-50 border-2 border-primary-300" : ""}
                      ${!isToday && !isSelected ? "hover:bg-surface-50 border border-transparent hover:border-surface-200" : ""}
                      ${allDone && !isToday ? "bg-green-50 border border-green-200" : ""}
                    `}
                  >
                    {/* Day number */}
                    <span className={`
                      text-sm font-bold block mb-1
                      ${isToday ? "text-white" : isPast && !allDone && hasTopics ? "text-red-400" : "text-gray-700"}
                    `}>
                      {day}
                    </span>

                    {/* Topic count badge */}
                    {hasTopics && (
                      <div className={`
                        text-xs font-bold px-1.5 py-0.5 rounded-lg inline-block mb-1
                        ${isToday
                          ? "bg-white/20 text-white"
                          : allDone
                          ? "bg-green-100 text-green-600"
                          : "bg-primary-100 text-primary-600"
                        }
                      `}>
                        {dayTopics.length} {allDone ? "✓" : ""}
                      </div>
                    )}

                    {/* Subject color dots */}
                    {dots.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap">
                        {dots.map(([name, color]) => (
                          <span
                            key={name}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: isToday ? "rgba(255,255,255,0.7)" : color }}
                            title={name}
                          />
                        ))}
                      </div>
                    )}

                    {/* All done checkmark */}
                    {allDone && !isToday && (
                      <CheckCircle2
                        size={14}
                        className="absolute top-2 right-2 text-green-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-surface-100 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary-600"></div>
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary-100 border border-primary-200"></div>
              <span className="text-xs text-gray-500">Has topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
              <span className="text-xs text-gray-500">All done ✓</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-100"></div>
              <span className="text-xs text-gray-500">Missed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day detail modal */}
      {selectedDate && selectedTopics.length > 0 && (
        <DayModal
          date={selectedDate}
          topics={selectedTopics}
          onClose={() => setSelectedDate(null)}
          onUpdate={() => {
            fetchTopics();
          }}
        />
      )}
    </Layout>
  );
}