import { useState, useEffect } from "react";
import {
  Sparkles, Bookmark, BookmarkCheck, ExternalLink,
  Trash2, Search, Filter, FileText,
  BookOpen, Code, Loader2, X
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../services/api";


// 2. Define a local Youtube icon (brand icons were removed from lucide-react v1+)
const Youtube = ({ size = 24, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);



// Type config
const TYPE_CONFIG = {
  video: { label: "Video", icon: Youtube, color: "#dc2626", bg: "#fee2e2" },
  article: { label: "Article", icon: FileText, color: "#2563eb", bg: "#dbeafe" },
  documentation: { label: "Docs", icon: Code, color: "#7c3aed", bg: "#ede9fe" },
  book: { label: "Book", icon: BookOpen, color: "#ca8a04", bg: "#fef9c3" },
  other: { label: "Other", icon: FileText, color: "#6b7280", bg: "#f3f4f6" },
};

// ── Resource Card ──────────────────────────────────────────────
function ResourceCard({ resource, onSave, onDelete, isSaved }) {
  const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.other;
  const Icon = config.icon;
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(resource);
    setSaving(false);
  };

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-4 hover:shadow-md transition-all">
      {/* Type badge + source */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          <Icon size={12} />
          {config.label}
        </span>
        {resource.source && (
          <span className="text-xs text-gray-400 font-medium">{resource.source}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
        {resource.title}
      </h3>

      {/* Topic tag */}
      {resource.topicId?.title && (
        <div className="mb-3">
          <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 border border-primary-100 rounded-lg">
            📌 {resource.topicId.title}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-surface-50 border border-surface-200 text-xs font-semibold text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-all"
        >
          <ExternalLink size={13} />
          Open
        </a>

        {isSaved ? (
          <button
            onClick={() => onDelete(resource._id)}
            className="p-2 rounded-xl hover:bg-red-50 border border-surface-200 hover:border-red-200 transition-all"
            title="Remove bookmark"
          >
            <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-2 rounded-xl hover:bg-primary-50 border border-surface-200 hover:border-primary-200 transition-all"
            title="Save bookmark"
          >
            {saving
              ? <Loader2 size={15} className="text-primary-500 animate-spin" />
              : <Bookmark size={15} className="text-gray-400 hover:text-primary-500" />
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ── AI Suggest Modal ───────────────────────────────────────────
function SuggestModal({ topics, subjects, onClose, onSaved }) {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [error, setError] = useState("");

  const handleSuggest = async () => {
    if (!selectedTopic) return;

    const topic = topics.find(t => t._id === selectedTopic);
    if (!topic) return;

    setLoading(true);
    setError("");
    setSuggestions([]);
    try {
      const res = await api.post("/api/resources/suggest", {
        topicTitle: topic.title,
        subjectName: topic.subjectName,
        topicId: topic._id,
        subjectId: topic.subjectId,
      });
      setSuggestions(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "AI suggestion failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (resource) => {
    try {
      await api.post("/api/resources/save", {
        ...resource,
        topicId: resource.topicId || selectedTopic,
      });
      setSavedIds(prev => [...prev, resource.url]);
      onSaved();
    } catch (err) {
      if (err.response?.data?.message === "Resource already saved") {
        setSavedIds(prev => [...prev, resource.url]);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">AI Resource Suggester</h2>
              <p className="text-xs text-gray-400">Select a topic to get AI-curated resources</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Topic selector */}
          <div className="flex gap-3 mb-5">
            <select
              value={selectedTopic}
              onChange={(e) => { setSelectedTopic(e.target.value); setSuggestions([]); }}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
            >
              <option value="">-- Select a topic --</option>
              {topics.map(t => (
                <option key={t._id} value={t._id}>
                  [{t.subjectName}] {t.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleSuggest}
              disabled={!selectedTopic || loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Finding...</>
                : <><Sparkles size={15} /> Suggest</>
              }
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Suggestions */}
          {loading && (
            <div className="text-center py-10">
              <Loader2 size={28} className="animate-spin text-primary-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-600">AI is finding best resources...</p>
              <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {suggestions.length} resources found — click bookmark to save
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((resource, i) => (
                  <ResourceCard
                    key={i}
                    resource={resource}
                    isSaved={savedIds.includes(resource.url)}
                    onSave={handleSave}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Resources Page ────────────────────────────────────────
export default function Resources() {
  const [saved, setSaved] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [savedRes, subjectsRes] = await Promise.all([
        api.get("/api/resources"),
        api.get("/api/subjects"),
      ]);

      setSaved(savedRes.data.data);

      // Fetch all topics
      const subjectList = subjectsRes.data.data;
      let allTopics = [];
      for (const subject of subjectList) {
        const res = await api.get(`/api/topics/${subject._id}`);
        const withSubject = res.data.data.map(t => ({
          ...t,
          subjectName: subject.name,
          subjectColor: subject.color,
          subjectId: subject._id,
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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/resources/${id}`);
      setSaved(prev => prev.filter(r => r._id !== id));
      setMessage({ type: "success", text: "Resource removed!" });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filters
  const filtered = saved.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.source.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  // Stats
  const stats = Object.entries(TYPE_CONFIG).map(([key, val]) => ({
    type: key,
    label: val.label,
    count: saved.filter(r => r.type === key).length,
    color: val.color,
    bg: val.bg,
  })).filter(s => s.count > 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Resources</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              AI-suggested learning resources — save the ones you like
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Sparkles size={15} />
            AI Suggest Resources
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-primary-50 border border-primary-200 text-primary-700"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}>
            {message.text}
          </div>
        )}

        {/* Quick stats */}
        {stats.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                typeFilter === "all"
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-600 border-surface-200 hover:border-primary-200"
              }`}
            >
              All ({saved.length})
            </button>
            {stats.map(s => (
              <button
                key={s.type}
                onClick={() => setTypeFilter(s.type)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  typeFilter === s.type
                    ? "border-transparent text-white"
                    : "bg-white text-gray-600 border-surface-200 hover:border-primary-200"
                }`}
                style={typeFilter === s.type ? { backgroundColor: s.color } : {}}
              >
                {s.label} ({s.count})
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search saved resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        {/* Saved resources grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-surface-200">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookmarkCheck size={28} className="text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No saved resources yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              Click "AI Suggest Resources", select a topic, and bookmark the ones you like!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <Sparkles size={15} />
              Get AI Suggestions
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-surface-200">
            <p className="text-sm text-gray-500">No resources match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(resource => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                isSaved={true}
                onSave={() => {}}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Suggest Modal */}
      {showModal && (
        <SuggestModal
          topics={topics}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            fetchData();
            setMessage({ type: "success", text: "Resource saved to bookmarks!" });
            setTimeout(() => setMessage(null), 2000);
          }}
        />
      )}
    </Layout>
  );
}