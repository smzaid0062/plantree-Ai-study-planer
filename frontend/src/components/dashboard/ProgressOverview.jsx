import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function ProgressOverview({ completedTopics, pendingTopics, totalTopics }) {
  const inProgress = 0;
  const data = [
    { name: "Completed", value: completedTopics, color: "#16a34a" },
    { name: "In Progress", value: inProgress, color: "#3b82f6" },
    { name: "Pending", value: pendingTopics, color: "#e2e8f0" },
  ].filter(d => d.value > 0);

  const rate = totalTopics > 0
    ? Math.round((completedTopics / totalTopics) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4">Progress Overview</h3>

      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length > 0 ? data : [{ name: "Empty", value: 1, color: "#e2e8f0" }]}
                dataKey="value"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                stroke="none"
              >
                {(data.length > 0 ? data : [{ color: "#e2e8f0" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-gray-900">{rate}%</span>
            <span className="text-xs text-gray-400">Overall</span>
          </div>
        </div>

        <div className="space-y-2.5 flex-1">
          {[
            { label: "Completed", value: completedTopics, color: "#16a34a" },
            { label: "In Progress", value: inProgress, color: "#3b82f6" },
            { label: "Pending", value: pendingTopics, color: "#94a3b8" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-400">
                  ({totalTopics > 0 ? Math.round((item.value / totalTopics) * 100) : 0}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}