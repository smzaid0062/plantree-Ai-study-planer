export default function StatCard({
  title, value, subtitle, icon: Icon,
  iconBg, iconColor, progress, progressColor
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        {progress !== undefined && (
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
            {progress}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 font-medium mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>

      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, backgroundColor: progressColor || "#16a34a" }}
          ></div>
        </div>
      )}
    </div>
  );
}