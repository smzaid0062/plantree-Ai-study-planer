import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, Filter, Search, Loader2, BookOpen } from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../services/api";

const STATUS_OPTIONS = ["all", "pending", "done", "in_progress"];

function TopicRow({ topic, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const handleToggle = async () => {
    const newStatus = topic.status === "done" ? "pending" : "done";
    setUpdating(true);
    try {
      await api.patch(`/api/topics/${topic._id}/status`, { status: newStatus });
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const statusStyle = {
    done: "bg-green-50 text-green-600 border-green-200",
    in_progress: "bg-blue-50 text-blue-600 border-blue-200",
    pending: "bg-gray-50 text-gray-500 border-gray-200",
  };

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 border-b border-surface-100 hover:bg-surface-50 transition-colors ${
      topic.status === "done" ? "bg-green-50/30" : ""
    }`}>
      {/* Checkbox */}
      <button onClick={handleToggle} disabled={updating} className="shrink-0">
        {updating ? (
          <Loader2 size={20} className="animate-spin text-primary-500" />
        ) : topic.status === "done" ? (
          <CheckCircle2 size={20} className="text-primary-500" />
        ) : (
          <Circle size={20} className="text-gray-300 hover:text-primary-400 transition-colors" />
        )}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${
          topic.status === "done" ? "line-through text-gray-400" : "text-gray-800"
        }`}>
          {topic.title}
        </p>
        {topic.scheduledDate && (
          <p className="text-xs text-gray-400 mt-0.5">
            📅 {new Date(topic.scheduledDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric"
            })}
          </p>
        )}
      </div>

      {/* Subject badge */}
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 hidden sm:block"
        style={{
          backgroundColor: `${topic.subjectColor}15`,
          color: topic.subjectColor
        }}
      >
        {topic.subjectName}
      </span>

      {/* Hours */}
      <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
        <Clock size={12} />
        {topic.estimatedHours}h
      </div>

      {/* Status badge */}
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border shrink-0 capitalize ${statusStyle[topic.status]}`}>
        {topic.status === "in_progress" ? "In Progress" : topic.status}
      </span>
    </div>
  );
}

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const subjectsRes = await api.get("/api/subjects");
      const subjectList = subjectsRes.data.data;
      setSubjects(subjectList);

      let allTopics = [];
      for (const subject of subjectList) {
        const res = await api.get(`/api/topics/${subject._id}`);
        const withSubject = res.data.data.map(t => ({
          ...t,
          subjectName: subject.name,
          subjectColor: subject.color,
        }));
        allTopics = [...allTopics, ...withSubject];
      }

      allTopics.sort((a, b) => a.order - b.order);
      setTopics(allTopics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter topics
  const filtered = topics.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchSubject = subjectFilter === "all" || t.subjectName === subjectFilter;
    return matchSearch && matchStatus && matchSubject;
  });

  const completedCount = topics.filter(t => t.status === "done").length;
  const pendingCount = topics.filter(t => t.status === "pending").length;

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Topics</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {completedCount} completed · {pendingCount} pending · {topics.length} total
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s === "all" ? "All Status" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            {/* Subject filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s._id} value={s.name}>{s.name}</option>
              ))}
            </select>

            {/* Filter icon */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-200 text-sm text-gray-500">
              <Filter size={15} />
              {filtered.length} results
            </div>
          </div>
        </div>

        {/* Topics list */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 bg-surface-50 border-b border-surface-200">
            <div className="w-5 shrink-0"></div>
            <p className="flex-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Topic</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:block w-28">Subject</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-12">Hours</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">Status</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No topics found</p>
              <p className="text-xs text-gray-400 mt-1">Try changing your filters</p>
            </div>
          ) : (
            filtered.map((topic) => (
              <TopicRow key={topic._id} topic={topic} onUpdate={fetchData} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}