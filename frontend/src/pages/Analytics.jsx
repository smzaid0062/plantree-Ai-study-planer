import { useState, useEffect } from "react";
import { TrendingUp, Target, Clock, Award } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";
import Layout from "../components/layout/Layout";
import api from "../services/api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/ai/dashboard")
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    </Layout>
  );

  const completionRate = data?.completionRate || 0;
  const totalTopics = data?.totalTopics || 0;
  const completedTopics = data?.completedTopics || 0;
  const missedTopics = data?.missedTopics || 0;
  const weeklyProgress = data?.weeklyProgress || [];
  const subjects = data?.subjects || [];

  // Subject wise data for bar chart
  const subjectData = subjects.map(s => ({
    name: s.name.split(" ")[0],
    total: s.totalTopics,
    completed: s.completedTopics,
    progress: s.progress,
    color: s.color || "#16a34a",
  }));

  const summaryCards = [
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      subtitle: `${completedTopics} of ${totalTopics} topics`,
      icon: TrendingUp,
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
    },
    {
      title: "Topics Completed",
      value: completedTopics,
      subtitle: "All time",
      icon: Award,
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
    },
    {
      title: "Missed Topics",
      value: missedTopics,
      subtitle: missedTopics > 0 ? "Need attention" : "You're on track!",
      icon: Target,
      iconBg: missedTopics > 0 ? "#fee2e2" : "#dcfce7",
      iconColor: missedTopics > 0 ? "#dc2626" : "#16a34a",
    },
    {
      title: "Active Subjects",
      value: subjects.length,
      subtitle: `${subjects.filter(s => s.daysLeft > 0).length} upcoming exams`,
      icon: Clock,
      iconBg: "#fef9c3",
      iconColor: "#ca8a04",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your study performance over time</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <card.icon size={18} style={{ color: card.iconColor }} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-1">{card.title}</p>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Weekly progress line chart */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { weekday: "short" })}
              />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                labelFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Topics Completed"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#16a34a" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject progress bar chart */}
        {subjectData.length > 0 && (
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Subject-wise Progress</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="total" name="Total Topics" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" radius={[6, 6, 0, 0]}>
                  {subjectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Subject cards */}
        {subjects.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Subject Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div key={subject._id} className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{subject.name}</h3>
                      <p className="text-xs text-gray-400">{subject.daysLeft} days left</p>
                    </div>
                    <span
                      className="ml-auto text-sm font-black"
                      style={{ color: subject.color }}
                    >
                      {subject.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">{subject.completedTopics} done</span>
                    <span className="text-xs text-gray-400">{subject.totalTopics} total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}