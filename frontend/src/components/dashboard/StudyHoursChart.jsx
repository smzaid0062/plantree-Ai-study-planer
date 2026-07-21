import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudyHoursChart({ weeklyProgress = [] }) {
  const data = weeklyProgress.map((d) => ({
    day: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
    completed: d.completed,
  }));

  const total = weeklyProgress.reduce((sum, d) => sum + d.completed, 0);

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Topics Completed</h3>
        <span className="text-sm font-bold text-primary-600">{total} this week</span>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
          />
          <Bar dataKey="completed" name="Topics" fill="#16a34a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}