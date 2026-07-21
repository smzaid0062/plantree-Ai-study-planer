import { useState, useEffect, useRef } from "react";
import {
  Play, Pause, Square, Clock, BookOpen,
  CheckCircle2, Loader2, RotateCcw, ChevronDown, ChevronUp
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../services/api";

// ── Format time helper ─────────────────────────────────────────
const formatTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatHours = (hours) => {
  const totalMins = Math.round(hours * 60);
  if (totalMins < 60) return `${totalMins}m`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ── Timer Component ────────────────────────────────────────────
function StudyTimer({ topics, lastStudiedTopic, onSessionComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(lastStudiedTopic || null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const intervalRef = useRef(null);

  // Auto select last studied topic
  useEffect(() => {
    if (lastStudiedTopic && !selectedTopic) {
      setSelectedTopic(lastStudiedTopic);
    }
  }, [lastStudiedTopic]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = () => {
    if (!selectedTopic) {
      alert("Please select a topic first!");
      return;
    }
    setIsRunning(true);
    setSaved(false);
  };

  const handlePause = () => setIsRunning(false);

  const handleStop = async () => {
    setIsRunning(false);
    if (seconds < 60) {
      alert("Study at least 1 minute before saving!");
      return;
    }
    setSaving(true);
    try {
      const hoursStudied = parseFloat((seconds / 3600).toFixed(2));
      await api.post("/api/sessions", {
        topicId: selectedTopic._id,
        hoursStudied,
        notes,
      });
      setSaved(true);
      setSeconds(0);
      setNotes("");
      onSessionComplete?.();
      // Keep same topic selected for "Continue studying"
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setSaved(false);
  };

  const ringColor = isRunning
    ? "#16a34a"
    : seconds > 0
    ? "#ca8a04"
    : "#e2e8f0";

  const circumference = 2 * Math.PI * 54;
  const progress = seconds > 0
    ? Math.min((seconds % 3600) / 3600, 1)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
        <Clock size={18} className="text-primary-600" />
        Study Timer
      </h2>

      {/* SVG ring timer */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-44 h-44 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-900 font-mono">
              {formatTime(seconds)}
            </span>
            <span className={`text-xs font-medium mt-1 ${
              isRunning ? "text-primary-600" : seconds > 0 ? "text-amber-500" : "text-gray-400"
            }`}>
              {isRunning ? "● Running" : seconds > 0 ? "⏸ Paused" : "Ready to start"}
            </span>
          </div>
        </div>

        {/* Saved confirmation */}
        {saved && (
          <div className="flex items-center gap-2 text-primary-600 text-sm font-semibold bg-primary-50 px-4 py-2 rounded-xl border border-primary-200 mb-2">
            <CheckCircle2 size={16} />
            Session saved! Same topic selected — continue studying?
          </div>
        )}
      </div>

      {/* Topic selector */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">Topic</label>
          {lastStudiedTopic && selectedTopic?._id === lastStudiedTopic._id && (
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <RotateCcw size={11} />
              Continue from last session
            </span>
          )}
        </div>
        <select
          value={selectedTopic?._id || ""}
          onChange={(e) => {
            const topic = topics.find(t => t._id === e.target.value);
            setSelectedTopic(topic || null);
          }}
          disabled={isRunning}
          className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white disabled:opacity-60"
        >
          <option value="">-- Select a topic --</option>
          {topics.map(t => (
            <option key={t._id} value={t._id}>
              [{t.subjectName}] {t.title}
            </option>
          ))}
        </select>

        {/* Selected topic info */}
        {selectedTopic && (
          <div
            className="mt-2 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
            style={{
              backgroundColor: `${selectedTopic.subjectColor}10`,
              color: selectedTopic.subjectColor
            }}
          >
            <BookOpen size={13} />
            {selectedTopic.subjectName} — {selectedTopic.estimatedHours}h estimated
            {selectedTopic.totalStudied > 0 && (
              <span className="ml-auto opacity-70">
                {formatHours(selectedTopic.totalStudied)} studied so far
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you study? Key points, doubts..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
          >
            <Play size={16} fill="white" />
            {seconds > 0 ? "Resume" : saved ? "Start New Session" : "Start Session"}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
          >
            <Pause size={16} />
            Pause
          </button>
        )}

        {seconds > 0 && (
          <>
            <button
              onClick={handleStop}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 size={15} className="animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 size={16} /> Save Session</>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-gray-500 text-sm hover:bg-surface-200 transition-colors"
              title="Reset timer"
            >
              <Square size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Grouped Session History ────────────────────────────────────
function GroupedSessionHistory({ sessions }) {
  const [expandedTopics, setExpandedTopics] = useState({});

  // Group sessions by topic
  const grouped = sessions.reduce((acc, session) => {
    const topicId = session.topicId?._id || "unknown";
    const topicTitle = session.topicId?.title || "Unknown Topic";

    if (!acc[topicId]) {
      acc[topicId] = {
        topicTitle,
        sessions: [],
        totalHours: 0,
      };
    }
    acc[topicId].sessions.push(session);
    acc[topicId].totalHours += session.hoursStudied;
    return acc;
  }, {});

  const toggleExpand = (topicId) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([topicId, group]) => (
        <div key={topicId} className="border border-surface-200 rounded-xl overflow-hidden">
          {/* Topic header */}
          <button
            onClick={() => toggleExpand(topicId)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-surface-50 hover:bg-surface-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
              <BookOpen size={15} className="text-primary-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{group.topicTitle}</p>
              <p className="text-xs text-gray-400">
                {group.sessions.length} session{group.sessions.length > 1 ? "s" : ""} · {formatHours(group.totalHours)} total
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-black text-primary-600">
                {formatHours(group.totalHours)}
              </span>
              {expandedTopics[topicId]
                ? <ChevronUp size={16} className="text-gray-400" />
                : <ChevronDown size={16} className="text-gray-400" />
              }
            </div>
          </button>

          {/* Individual sessions (expandable) */}
          {expandedTopics[topicId] && (
            <div className="divide-y divide-surface-100">
              {group.sessions.map((session, i) => (
                <div key={session._id} className="flex items-center gap-3 px-4 py-3 bg-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 ml-1"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short"
                      })} at {new Date(session.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                    {session.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate italic">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-primary-600 shrink-0">
                    {formatHours(session.hoursStudied)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function StudySessions() {
  const [sessions, setSessions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, subjectsRes] = await Promise.all([
        api.get("/api/sessions"),
        api.get("/api/subjects"),
      ]);

      setSessions(sessionsRes.data.data);
      setTotalHours(sessionsRes.data.totalHours || 0);

      // Fetch all pending/in_progress topics
      const subjectList = subjectsRes.data.data;
      let allTopics = [];
      for (const subject of subjectList) {
        const res = await api.get(`/api/topics/${subject._id}`);
        const withSubject = res.data.data
          .filter(t => t.status !== "done")
          .map(t => ({
            ...t,
            subjectName: subject.name,
            subjectColor: subject.color,
          }));
        allTopics = [...allTopics, ...withSubject];
      }
      setTopics(allTopics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Last studied topic — for "Continue studying" feature
  const lastStudiedTopicId = sessions[0]?.topicId?._id;
  const lastStudiedTopic = topics.find(t => t._id === lastStudiedTopicId) || null;

  // Today's sessions only
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter(s =>
    new Date(s.createdAt).toISOString().split("T")[0] === today
  );
  const todayHours = todaySessions.reduce((sum, s) => sum + s.hoursStudied, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">Study Sessions</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track your study time — multiple sessions per topic are grouped automatically
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Hours", value: formatHours(totalHours), color: "text-primary-600", bg: "bg-primary-50", border: "border-primary-100" },
            { label: "Today's Hours", value: formatHours(todayHours), color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Total Sessions", value: sessions.length, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Today's Sessions", value: todaySessions.length, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-4 text-center`}>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer */}
          <StudyTimer
            topics={topics}
            lastStudiedTopic={lastStudiedTopic}
            onSessionComplete={fetchData}
          />

          {/* Session history — grouped */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Session History</h3>
              <span className="text-xs text-gray-400 bg-surface-100 px-2 py-1 rounded-lg">
                Grouped by topic
              </span>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-7 h-7 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-10">
                  <Clock size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-400">No sessions yet</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Start your first study timer!
                  </p>
                </div>
              ) : (
                <GroupedSessionHistory sessions={sessions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}