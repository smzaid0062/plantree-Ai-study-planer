import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

export default function ReviseToday() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/revision/due")
      .then((res) => setTopics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RotateCcw size={18} className="text-primary-600" />
          <h3 className="font-bold text-gray-900">Revise Today</h3>
        </div>
        {!loading && topics.length > 0 && (
          <span className="text-xs font-bold text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-lg">
            {topics.length} due
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-7 h-7 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 size={28} className="text-primary-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">Nothing due today 🎉</p>
          <p className="text-xs text-gray-400 mt-1">If I give a quiz, then the revision schedule will be made.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.slice(0, 6).map((topic) => (
            <div
              key={topic._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200"
            >
              <span
                className="w-2 h-8 rounded-full shrink-0"
                style={{ backgroundColor: topic.subjectId?.color || "#16a34a" }}
              ></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{topic.title}</p>
                <p className="text-xs text-gray-400">
                  {topic.subjectId?.name} · every {topic.review?.interval || 1}d
                </p>
              </div>
              <Link
                to={`/quiz/${topic.subjectId?._id}`}
                className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:gap-2 transition-all shrink-0"
              >
                Quiz <ArrowRight size={13} />
              </Link>
            </div>
          ))}
          {topics.length > 6 && (
            <p className="text-xs text-gray-400 text-center pt-1">+{topics.length - 6} more</p>
          )}
        </div>
      )}
    </div>
  );
}