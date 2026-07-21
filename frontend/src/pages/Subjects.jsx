import { useState, useEffect } from "react";
import { Plus, Trash2, Upload, Sparkles, BookOpen, Calendar, Target, ChevronRight, Loader2, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
const COLORS = [
  "#16a34a", "#2563eb", "#7c3aed", "#dc2626",
  "#ca8a04", "#0891b2", "#db2777", "#ea580c",
];

// ── Add Subject Modal ──────────────────────────────────────────
function AddSubjectModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", examDate: "", color: COLORS[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/subjects", form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Add New Subject</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Data Structures, Web Dev..."
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Date</label>
            <input
              type="date"
              required
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-surface-200 text-sm font-semibold text-gray-600 hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Adding...</> : "Add Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Syllabus Upload Modal ──────────────────────────────────────
function SyllabusModal({ subject, onClose, onSuccess }) {
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (file) {
        const formData = new FormData();
        formData.append("syllabus", file);
        formData.append("subjectId", subject._id);
        await api.post("/api/ai/parse-syllabus", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/ai/parse-syllabus", {
          subjectId: subject._id,
          rawText,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to parse syllabus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upload Syllabus</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              AI will extract topics from your syllabus automatically
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subject.color }}></div>
          <span className="text-sm font-semibold text-gray-800">{subject.name}</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Upload PDF (optional)
            </label>
            <div
              className="border-2 border-dashed border-surface-200 rounded-xl p-4 text-center hover:border-primary-300 transition-colors cursor-pointer"
              onClick={() => document.getElementById("pdf-upload").click()}
            >
              <Upload size={20} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                {file ? file.name : "Click to upload PDF (max 5MB)"}
              </p>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => { setFile(e.target.files[0]); setRawText(""); }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-200"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-surface-200"></div>
          </div>

          {/* Raw text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Paste Syllabus Text
            </label>
            <textarea
              value={rawText}
              onChange={(e) => { setRawText(e.target.value); setFile(null); }}
              placeholder="Unit 1: Arrays and Linked Lists&#10;Unit 2: Stacks and Queues&#10;Unit 3: Trees and Graphs..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-surface-200 text-sm font-semibold text-gray-600 hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!rawText.trim() && !file)}
              className="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Parsing...</>
              ) : (
                <><Sparkles size={15} /> Parse with AI</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Subject Card ───────────────────────────────────────────────
function SubjectCard({ subject, onDelete, onUpload }) {
  const navigate = useNavigate();
  const progress = subject.totalTopics > 0
    ? Math.round((subject.completedTopics / subject.totalTopics) * 100)
    : 0;

  const daysLeft = Math.max(
    0, Math.floor((new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24))
  );

  const urgency = daysLeft <= 7
    ? "border-red-200 bg-red-50"
    : daysLeft <= 30
      ? "border-amber-200 bg-amber-50"
      : "border-surface-200 bg-white";

  return (
    <div className={`rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 ${urgency}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
            style={{ backgroundColor: subject.color }}
          >
            {subject.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{subject.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Calendar size={11} className="text-gray-400" />
              <span className="text-xs text-gray-400">
                {new Date(subject.examDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(subject._id)}
          className="p-2 hover:bg-red-50 rounded-xl transition-colors"
        >
          <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-white rounded-xl border border-surface-100">
          <p className="text-lg font-black text-gray-900">{subject.totalTopics}</p>
          <p className="text-xs text-gray-400">Topics</p>
        </div>
        <div className="text-center p-2 bg-white rounded-xl border border-surface-100">
          <p className="text-lg font-black" style={{ color: subject.color }}>{progress}%</p>
          <p className="text-xs text-gray-400">Done</p>
        </div>
        <div className="text-center p-2 bg-white rounded-xl border border-surface-100">
          <p className={`text-lg font-black ${daysLeft <= 7 ? "text-red-500" : daysLeft <= 30 ? "text-amber-500" : "text-gray-900"}`}>
            {daysLeft}
          </p>
          <p className="text-xs text-gray-400">Days left</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{subject.completedTopics} completed</span>
          <span>{subject.totalTopics - subject.completedTopics} remaining</span>
        </div>
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, backgroundColor: subject.color }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onUpload(subject)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-surface-200 text-xs font-semibold text-gray-600 hover:bg-surface-50 hover:border-primary-200 hover:text-primary-600 transition-all"
        >
          <Upload size={13} />
          {subject.totalTopics > 0 ? "Re-parse" : "Upload Syllabus"}
        </button>
        <button 
         onClick={() => navigate(`/topics`)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-600 hover:bg-primary-100 transition-all">
          <ChevronRight size={13} />
          View Topics
        </button>
        <button
          onClick={() => navigate(`/quiz/${subject._id}`)}
          className={` flex items-center justify-center gap-1 py-2.5   rounded-xl text-xs font-semibold mt-2 transition-all ${progress === 100
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-surface-100 text-gray-400 cursor-not-allowed"
            }`}
          disabled={progress !== 100}
          title={progress !== 100 ? "Complete all topics to unlock quiz!" : "Take knowledge quiz"}
        >
          {/* <Brain size={13} /> */}
          {progress === 100 ? "🎯 Take Quiz" : `🔒 Quiz (${progress}% done)`}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syllabusSubject, setSyllabusSubject] = useState(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/subjects");
      setSubjects(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject? All topics will also be deleted.")) return;
    try {
      await api.delete(`/api/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Subjects</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your subjects and upload syllabuses for AI to parse
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Subject
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-surface-200">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No subjects yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              Add your first subject and upload its syllabus — AI will extract all topics automatically!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <Plus size={15} />
              Add Your First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                onDelete={handleDelete}
                onUpload={setSyllabusSubject}
              />
            ))}
            {/* Add more card */}
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-2xl border-2 border-dashed border-surface-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-primary-300 hover:bg-primary-50 transition-all min-h-[200px]"
            >
              <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center">
                <Plus size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-400">Add Subject</p>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSubjectModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchSubjects}
        />
      )}
      {syllabusSubject && (
        <SyllabusModal
          subject={syllabusSubject}
          onClose={() => setSyllabusSubject(null)}
          onSuccess={fetchSubjects}
        />
      )}
    </Layout>
  );
}