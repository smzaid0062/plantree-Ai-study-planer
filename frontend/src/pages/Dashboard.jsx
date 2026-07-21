import { BookOpen, CheckSquare, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import Layout from "../components/layout/Layout";
import StatCard from "../components/cards/StatCard";
import TodayPlan from "../components/dashboard/TodayPlan";
import ProgressOverview from "../components/dashboard/ProgressOverview";
import StudyHoursChart from "../components/dashboard/StudyHoursChart";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import ExamCountdown from "../components/dashboard/ExamCountdown";
import useDashboard from "../hooks/useDashboard";

export default function Dashboard() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      title: "Total Subjects",
      value: data?.totalSubjects || 0,
      subtitle: "Active subjects",
      icon: BookOpen,
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
    },
    {
      title: "Topics Completed",
      value: data?.completedTopics || 0,
      subtitle: `of ${data?.totalTopics || 0} topics`,
      icon: CheckSquare,
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      progress: data?.completionRate || 0,
    },
    {
      title: "Overall Progress",
      value: `${data?.completionRate || 0}%`,
      subtitle: "Keep going!",
      icon: TrendingUp,
      iconBg: "#ede9fe",
      iconColor: "#7c3aed",
      progress: data?.completionRate || 0,
      progressColor: "#7c3aed",
    },
    {
      title: "Today's Topics",
      value: data?.todayTopics?.length || 0,
      subtitle: "Scheduled for today",
      icon: Clock,
      iconBg: "#fef9c3",
      iconColor: "#ca8a04",
    },
    {
      title: "Missed Topics",
      value: data?.missedTopics || 0,
      subtitle: data?.missedTopics > 0 ? "Needs attention!" : "You're on track!",
      icon: AlertTriangle,
      iconBg: data?.missedTopics > 0 ? "#fee2e2" : "#dcfce7",
      iconColor: data?.missedTopics > 0 ? "#dc2626" : "#16a34a",
    },
  ];

  return (
    <Layout missedCount={data?.missedTopics || 0}>
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main content — 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's plan — 2 cols */}
          <div className="lg:col-span-2">
            <TodayPlan
              topics={data?.todayTopics || []}
              onStatusUpdate={refetch}
            />
          </div>

          {/* Calendar — 1 col */}
          <div>
            <CalendarWidget scheduledDates={[]} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProgressOverview
            completedTopics={data?.completedTopics || 0}
            pendingTopics={data?.pendingTopics || 0}
            totalTopics={data?.totalTopics || 0}
          />
          <StudyHoursChart weeklyProgress={data?.weeklyProgress || []} />
          <ExamCountdown subjects={data?.subjects || []} />
        </div>
      </div>
    </Layout>
  );
}