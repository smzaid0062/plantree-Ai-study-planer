import { useEffect, useMemo, useState } from "react";
import { Flame, CalendarDays, Clock } from "lucide-react";
import api from "../../services/api";

const WEEKS = 53;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const LEVEL_CLASSES = [
  "bg-surface-100",
  "bg-primary-200",
  "bg-primary-300",
  "bg-primary-500",
  "bg-primary-700",
];

// Local date as YYYY-MM-DD
const toKey = (d) => d.toLocaleDateString("en-CA");

// Hours to intensity level (0–4)
const getLevel = (h) => {
  if (h <= 0) return 0;
  if (h < 1) return 1;
  if (h < 2) return 2;
  if (h < 4) return 3;
  return 4;
};

export default function ActivityHeatmap() {
  const [hoursMap, setHoursMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/sessions/activity?days=365")
      .then((res) => {
        const map = {};
        res.data.data.forEach((d) => {
          map[d.date] = d.hours;
        });
        setHoursMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Build 53 weeks × 7 days grid, Sunday-first, ending at today
  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);

    const grid = [];
    for (let w = 0; w < WEEKS; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        col.push({ date, key: toKey(date), future: date > today });
      }
      grid.push(col);
    }
    return grid;
  }, []);

  // Stats
  const { totalHours, activeDays, currentStreak, maxStreak } = useMemo(() => {
    const days = weeks.flat().filter((c) => !c.future);

    let total = 0;
    let active = 0;
    let max = 0;
    let run = 0;

    days.forEach((c) => {
      const h = hoursMap[c.key] || 0;
      total += h;
      if (h > 0) {
        active++;
        run++;
        max = Math.max(max, run);
      } else {
        run = 0;
      }
    });

    // Current streak: count back from today; if today is empty, skip it
    let current = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const h = hoursMap[days[i].key] || 0;
      if (h > 0) current++;
      else if (i === days.length - 1) continue;
      else break;
    }

    return {
      totalHours: total,
      activeDays: active,
      currentStreak: current,
      maxStreak: max,
    };
  }, [weeks, hoursMap]);

  // Month labels: show month name when a new month starts
  const monthLabels = weeks.map((col, i) => {
    const month = col[0].date.getMonth();
    const prevMonth = i > 0 ? weeks[i - 1][0].date.getMonth() : -1;
    return month !== prevMonth
      ? col[0].date.toLocaleDateString("en-IN", { month: "short" })
      : "";
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5 h-44 flex items-center justify-center">
        <div className="w-7 h-7 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-gray-900">Study Activity</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeDays} active days in the past year
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 border border-primary-100">
            <Clock size={14} className="text-primary-600" />
            <span className="text-xs text-gray-500">Total</span>
            <span className="text-sm font-black text-primary-600">
              {totalHours.toFixed(1)}h
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
            <Flame size={14} className="text-amber-500" />
            <span className="text-xs text-gray-500">Current streak</span>
            <span className="text-sm font-black text-amber-600">
              {currentStreak}d
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 border border-surface-200">
            <CalendarDays size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">Max streak</span>
            <span className="text-sm font-black text-gray-900">{maxStreak}d</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex gap-1 mb-1 ml-9">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-3 text-[10px] text-gray-400 whitespace-nowrap overflow-visible">
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-3 w-7 text-[10px] text-gray-400 leading-3">
                  {label}
                </div>
              ))}
            </div>

            {/* Cells */}
            {weeks.map((col, w) => (
              <div key={w} className="flex flex-col gap-1">
                {col.map((cell, d) => {
                  const h = hoursMap[cell.key] || 0;
                  const level = getLevel(h);
                  return (
                    <div
                      key={d}
                      title={
                        cell.future
                          ? ""
                          : `${cell.date.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}: ${h > 0 ? `${h.toFixed(1)}h studied` : "No activity"}`
                      }
                      className={`w-3 h-3 rounded-sm transition-transform hover:scale-125 ${
                        cell.future ? "opacity-0" : LEVEL_CLASSES[level]
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-gray-400">
        <span>Less</span>
        {LEVEL_CLASSES.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`}></div>
        ))}
        <span>More</span>
      </div>
    </div>
  );
}