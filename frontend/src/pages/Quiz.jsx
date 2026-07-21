import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Brain, CheckCircle2, XCircle, ChevronRight,
  Trophy, RotateCcw, ArrowLeft, Loader2, Sparkles
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../services/api";

// ── Question Card ──────────────────────────────────────────────
function QuestionCard({ question, questionNumber, total, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (option) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    setTimeout(() => {
      onAnswer(option === question.correct);
      setSelected(null);
      setRevealed(false);
    }, 1800);
  };

  const getOptionStyle = (option) => {
    if (!revealed) {
      return "bg-white border-surface-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50 cursor-pointer";
    }
    if (option === question.correct) {
      return "bg-green-50 border-green-400 text-green-700 font-semibold";
    }
    if (option === selected && option !== question.correct) {
      return "bg-red-50 border-red-400 text-red-700";
    }
    return "bg-surface-50 border-surface-200 text-gray-400";
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400">
          Question {questionNumber} of {total}
        </span>
        <div className="flex gap-1">
          {Array(total).fill(null).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-all ${
                i < questionNumber - 1
                  ? "bg-primary-500"
                  : i === questionNumber - 1
                  ? "bg-primary-300"
                  : "bg-surface-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Brain size={16} className="text-white" />
          </div>
          <p className="text-base font-bold text-gray-900 leading-snug">
            {question.question}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {Object.entries(question.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            disabled={revealed}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${getOptionStyle(key)}`}
          >
            {/* Option label */}
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 transition-all ${
              revealed && key === question.correct
                ? "bg-green-500 text-white"
                : revealed && key === selected && key !== question.correct
                ? "bg-red-500 text-white"
                : "bg-surface-100 text-gray-600"
            }`}>
              {key}
            </span>

            <span className="text-sm flex-1">{value}</span>

            {/* Result icon */}
            {revealed && key === question.correct && (
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
            )}
            {revealed && key === selected && key !== question.correct && (
              <XCircle size={18} className="text-red-500 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in ${
          selected === question.correct
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          <p className="font-bold mb-0.5">
            {selected === question.correct ? "✅ Correct!" : `❌ Correct answer: ${question.correct}`}
          </p>
          <p className="font-normal text-xs opacity-80">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ── Result Screen ──────────────────────────────────────────────
function QuizResult({ score, total, subjectName, onRetry, onBack }) {
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage >= 90) return { text: "Outstanding! 🏆", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    if (percentage >= 70) return { text: "Great job! 🎉", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (percentage >= 50) return { text: "Good effort! 💪", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    return { text: "Keep practicing! 📚", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  };

  const msg = getMessage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-10 max-w-md w-full text-center">

        {/* Trophy icon */}
        <div className="w-20 h-20 bg-yellow-50 border-2 border-yellow-200 rounded-full flex items-center justify-center mx-auto mb-5">
          <Trophy size={36} className="text-yellow-500" />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1">Quiz Complete!</h2>
        <p className="text-gray-400 text-sm mb-6">{subjectName}</p>

        {/* Score ring */}
        <div className="relative w-32 h-32 mx-auto mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={percentage >= 70 ? "#16a34a" : percentage >= 50 ? "#ca8a04" : "#dc2626"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 * (1 - percentage / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-900">{percentage}%</span>
            <span className="text-xs text-gray-400">{score}/{total}</span>
          </div>
        </div>

        {/* Message */}
        <div className={`${msg.bg} border ${msg.border} rounded-xl px-4 py-3 mb-6`}>
          <p className={`text-base font-black ${msg.color}`}>{msg.text}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            You answered {score} out of {total} questions correctly
          </p>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <p className="text-xl font-black text-green-600">{score}</p>
            <p className="text-xs text-gray-400">Correct</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-xl font-black text-red-500">{total - score}</p>
            <p className="text-xs text-gray-400">Wrong</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xl font-black text-blue-600">{total}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-surface-200 text-sm font-semibold text-gray-600 hover:bg-surface-50 transition-colors"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <RotateCcw size={15} />
            Retry Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Quiz Page ─────────────────────────────────────────────
export default function Quiz() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    setError("");
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    try {
      const res = await api.post("/api/quiz/generate", { subjectId });
      setQuestions(res.data.data.questions);
      setSubjectName(res.data.data.subjectName);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generateQuiz(); }, [subjectId]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(prev => prev + 1);
    if (currentIndex + 1 >= questions.length) {
      setTimeout(() => setFinished(true), 300);
    } else {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Brain size={24} className="text-primary-600" />
              Knowledge Quiz
            </h1>
            {subjectName && (
              <p className="text-sm text-gray-400 mt-0.5">{subjectName}</p>
            )}
          </div>
          <button
            onClick={() => navigate("/subjects")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-16 text-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-gray-600">Generating your quiz with AI...</p>
            <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-10 text-center">
            <XCircle size={36} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
            <button
              onClick={generateQuiz}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <RotateCcw size={15} />
              Try Again
            </button>
          </div>
        ) : finished ? (
          <QuizResult
            score={score}
            total={questions.length}
            subjectName={subjectName}
            onRetry={generateQuiz}
            onBack={() => navigate("/subjects")}
          />
        ) : questions.length > 0 ? (
          <>
            {/* Live score */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-surface-200 px-5 py-3 shadow-sm">
              <span className="text-sm font-semibold text-gray-600">
                Score: <span className="text-primary-600 font-black">{score}</span>/{currentIndex}
              </span>
              <span className="text-sm font-semibold text-gray-400">
                {questions.length - currentIndex} remaining
              </span>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary-500" />
                <span className="text-xs font-semibold text-primary-600">AI Quiz</span>
              </div>
            </div>

            {/* Question */}
            <QuestionCard
              key={currentIndex}
              question={questions[currentIndex]}
              questionNumber={currentIndex + 1}
              total={questions.length}
              onAnswer={handleAnswer}
            />
          </>
        ) : null}
      </div>
    </Layout>
  );
}