"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  AlertTriangle,
  Building2,
  Target,
  BarChart3,
  FileText,
  UserCheck,
} from "lucide-react";
import {
  onboardingApi,
  type Onboarding,
  type OnboardingTask,
} from "@/lib/recruitment-api";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const COLORS = {
  blue: "#3b82f6",
  cyan: "#06b6d4",
  indigo: "#6366f1",
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  gray: "#6b7280",
  orange: "#f97316",
};

interface OnboardingStats {
  activeOnboarding: {
    total: number;
    inProgress: number;
    completedThisMonth: number;
    overdue: number;
  };
  taskCompletion: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  averageCompletionTime: {
    average: number;
    fastest: number;
    slowest: number;
    onTrack: number;
  };
  departmentBreakdown: {
    topDepartment: string;
    activeOnboarding: number;
    completionRate: number;
  };
}

interface OnboardingWithEmployee extends Onboarding {
  employeeName?: string;
  employeeDepartment?: string;
  startDate?: string;
}

export default function OnboardingDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [onboardings, setOnboardings] = useState<OnboardingWithEmployee[]>([]);
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState("30"); // days

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 3 minutes
    const interval = setInterval(loadDashboardData, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      const startDateStr = startDate.toISOString();
      
      const response = await onboardingApi.getOnboardings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        startDate: startDateStr,
        endDate
      });
      
      // Map the response to include employee information
      const onboardingsWithEmployee = response.map((onboarding: Onboarding) => {
        const employee = onboarding.employeeId as any;
        const department = employee?.primaryDepartmentId;
        return {
          ...onboarding,
          employeeName: employee?.fullName || `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim(),
          employeeDepartment: typeof department === 'object' ? department?.name : undefined,
          startDate: onboarding.createdAt || new Date().toISOString(),
        };
      });
      
      setOnboardings(onboardingsWithEmployee);
      calculateStats(onboardingsWithEmployee);
    } catch (error) {
      console.error("Error loading onboarding data:", error);
      setOnboardings([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: OnboardingWithEmployee[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const activeOnboarding = data.filter((o) => !o.completed);
    const inProgress = activeOnboarding.filter(
      (o) => o.tasks.some((t) => t.status === "in_progress")
    );
    const completedThisMonth = data.filter(
      (o) =>
        o.completed &&
        o.completedAt &&
        new Date(o.completedAt) >= startOfMonth
    );
    const overdue = activeOnboarding.filter((o) =>
      o.tasks.some(
        (t) =>
          t.status !== "completed" &&
          t.deadline &&
          new Date(t.deadline) < now
      )
    );

    const allTasks = data.flatMap((o) => o.tasks);
    const completedTasks = allTasks.filter((t) => t.status === "completed");
    const pendingTasks = allTasks.filter((t) => t.status === "pending");
    const overdueTasks = allTasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.deadline &&
        new Date(t.deadline) < now
    );

    const completionRate =
      allTasks.length > 0
        ? (completedTasks.length / allTasks.length) * 100
        : 0;

    // Calculate average completion time
    const completedOnboardings = data.filter((o) => o.completed && o.completedAt);
    const completionTimes = completedOnboardings.map((o) => {
      if (o.createdAt && o.completedAt) {
        const start = new Date(o.createdAt);
        const end = new Date(o.completedAt);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }
      return 0;
    }).filter((t) => t > 0);

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;
    const fastest = completionTimes.length > 0 ? Math.min(...completionTimes) : 0;
    const slowest = completionTimes.length > 0 ? Math.max(...completionTimes) : 0;

    // Department breakdown
    const departmentMap = new Map<string, { count: number; completed: number }>();
    data.forEach((o) => {
      const dept = o.employeeDepartment || "Unknown";
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, { count: 0, completed: 0 });
      }
      const deptData = departmentMap.get(dept)!;
      deptData.count++;
      if (o.completed) deptData.completed++;
    });

    let topDepartment = "N/A";
    let topDeptActive = 0;
    let topDeptRate = 0;

    if (departmentMap.size > 0) {
      const sorted = Array.from(departmentMap.entries()).sort(
        (a, b) => b[1].count - a[1].count
      );
      const [dept, data] = sorted[0];
      topDepartment = dept;
      topDeptActive = data.count;
      topDeptRate = data.count > 0 ? (data.completed / data.count) * 100 : 0;
    }

    setStats({
      activeOnboarding: {
        total: activeOnboarding.length,
        inProgress: inProgress.length,
        completedThisMonth: completedThisMonth.length,
        overdue: overdue.length,
      },
      taskCompletion: {
        total: allTasks.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
        overdue: overdueTasks.length,
        completionRate: Math.round(completionRate * 10) / 10,
      },
      averageCompletionTime: {
        average: Math.round(averageCompletionTime * 10) / 10,
        fastest,
        slowest,
        onTrack: data.length > 0 ? Math.round((completionTimes.filter((t) => t <= 30).length / data.length) * 100) : 0,
      },
      departmentBreakdown: {
        topDepartment,
        activeOnboarding: topDeptActive,
        completionRate: Math.round(topDeptRate * 10) / 10,
      },
    });
  };

  const filteredOnboardings = onboardings.filter((onboarding) => {
    const matchesSearch =
      !searchQuery ||
      onboarding.employeeName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" ||
      onboarding.employeeDepartment === departmentFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && onboarding.completed) ||
      (statusFilter === "in_progress" &&
        !onboarding.completed &&
        onboarding.tasks.some((t) => t.status === "in_progress")) ||
      (statusFilter === "at_risk" &&
        !onboarding.completed &&
        onboarding.tasks.some(
          (t) =>
            t.status !== "completed" &&
            t.deadline &&
            new Date(t.deadline) < new Date()
        ));

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Separate active (incomplete) and completed onboarding records
  const activeOnboardings = filteredOnboardings.filter((o) => !o.completed);
  const completedOnboardings = filteredOnboardings.filter((o) => o.completed);

  const getProgress = (onboarding: Onboarding) => {
    if (onboarding.tasks.length === 0) return 0;
    const completed = onboarding.tasks.filter(
      (t) => t.status === "completed"
    ).length;
    return Math.round((completed / onboarding.tasks.length) * 100);
  };

  const getStatusBadge = (onboarding: Onboarding) => {
    if (onboarding.completed) {
      return { label: "Completed", color: "bg-green-500/20 text-green-300 border border-green-500/30" };
    }
    const hasOverdue = onboarding.tasks.some(
      (t) =>
        t.status !== "completed" &&
        t.deadline &&
        new Date(t.deadline) < new Date()
    );
    if (hasOverdue) {
      return { label: "Overdue", color: "bg-red-500/20 text-red-300 border border-red-500/30" };
    }
    const progress = getProgress(onboarding);
    if (progress < 50) {
      return { label: "At Risk", color: "bg-orange-500/20 text-orange-300 border border-orange-500/30" };
    }
    return { label: "On Track", color: "bg-blue-500/20 text-blue-300 border border-blue-500/30" };
  };

  const getDaysSinceStart = (onboarding: Onboarding) => {
    if (!onboarding.createdAt) return 0;
    const start = new Date(onboarding.createdAt);
    const now = new Date();
    return Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Prepare chart data
  const taskStatusData = stats
    ? [
        {
          name: "Completed",
          value: stats.taskCompletion.completed,
          color: COLORS.green,
        },
        {
          name: "In Progress",
          value:
            stats.taskCompletion.total -
            stats.taskCompletion.completed -
            stats.taskCompletion.pending,
          color: COLORS.yellow,
        },
        {
          name: "Pending",
          value: stats.taskCompletion.pending,
          color: COLORS.gray,
        },
        {
          name: "Overdue",
          value: stats.taskCompletion.overdue,
          color: COLORS.red,
        },
      ]
    : [];

  const departmentData = onboardings.reduce((acc, o) => {
    const dept = o.employeeDepartment || "Unknown";
    if (!acc[dept]) {
      acc[dept] = { completed: 0, pending: 0, inProgress: 0, overdue: 0 };
    }
    o.tasks.forEach((task) => {
      if (task.status === "completed") {
        acc[dept].completed++;
      } else if (task.status === "in_progress") {
        acc[dept].inProgress++;
      } else {
        // Task is pending - check if it's overdue
        if (task.deadline && new Date(task.deadline) < new Date()) {
          acc[dept].overdue++;
        } else {
          acc[dept].pending++;
        }
      }
    });
    return acc;
  }, {} as Record<string, { completed: number; pending: number; inProgress: number; overdue: number }>);

  const departmentChartData = Object.entries(departmentData).map(
    ([dept, data]) => ({
      department: dept,
      completed: data.completed,
      inProgress: data.inProgress,
      pending: data.pending,
      overdue: data.overdue,
    })
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading onboarding data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Onboarding Dashboard</h1>
                    <p className="text-xs text-slate-400">
                      Track employee onboarding progress and task completion
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
                >
                  <option value="7" className="bg-slate-900 text-white">Last 7 days</option>
                  <option value="30" className="bg-slate-900 text-white">Last 30 days</option>
                  <option value="90" className="bg-slate-900 text-white">Last 90 days</option>
                  <option value="365" className="bg-slate-900 text-white">Last year</option>
                </select>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2 text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">

          {/* Filter Bar */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by employee name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-500/50"
                  />
                </div>
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              >
                <option value="all" className="bg-slate-900 text-white">All Departments</option>
                {Array.from(new Set(onboardings.map((o) => o.employeeDepartment).filter(Boolean))).map(
                  (dept, index) => (
                    <option key={dept || `dept-${index}`} value={dept} className="bg-slate-900 text-white">
                      {dept || "Unknown"}
                    </option>
                  )
                )}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              >
                <option value="all" className="bg-slate-900 text-white">All Status</option>
                <option value="in_progress" className="bg-slate-900 text-white">In Progress</option>
                <option value="completed" className="bg-slate-900 text-white">Completed</option>
                <option value="at_risk" className="bg-slate-900 text-white">At Risk</option>
              </select>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Onboarding Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">
                    Active Onboarding
                  </h3>
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl text-white mb-1">{stats.activeOnboarding.total}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-yellow-400">
                      {stats.activeOnboarding.inProgress} In Progress
                    </span>
                    <span className="text-green-400">
                      {stats.activeOnboarding.completedThisMonth} Completed
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    {stats.activeOnboarding.overdue} Overdue
                  </div>
                </div>
              </div>

              {/* Task Completion Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">
                    Task Completion
                  </h3>
                  <CheckCircle className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl text-white mb-1">{stats.taskCompletion.total}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-green-400">
                      {stats.taskCompletion.completed} Completed
                    </span>
                    <span className="text-yellow-400">
                      {stats.taskCompletion.pending} Pending
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Completion Rate: <span className="text-white font-medium">{stats.taskCompletion.completionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Average Completion Time Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">
                    Avg. Completion Time
                  </h3>
                  <Clock className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl text-white mb-1">
                    {stats.averageCompletionTime.average}
                    <span className="text-lg text-slate-400"> days</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Fastest: {stats.averageCompletionTime.fastest} days</span>
                    <span>Slowest: {stats.averageCompletionTime.slowest} days</span>
                  </div>
                  <div className="text-sm text-green-400">
                    On Track: {stats.averageCompletionTime.onTrack}%
                  </div>
                </div>
          </div>

              {/* Department Breakdown Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">
                    Top Department
                  </h3>
                  <Building2 className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-white">
                    {stats.departmentBreakdown.topDepartment}
                  </p>
                  <div className="text-sm text-slate-400">
                    Active: {stats.departmentBreakdown.activeOnboarding}
                  </div>
                  <div className="text-sm text-slate-400">
                    Completion Rate: <span className="text-white font-medium">{stats.departmentBreakdown.completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Onboarding List */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white font-bold">Active Onboarding</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-500/50 text-sm w-64"
                />
              </div>
            </div>
            {activeOnboardings.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active onboarding records found</p>
                <p className="text-sm mt-2">
                  {statusFilter === "completed" 
                    ? "Switch to 'All' or 'In Progress' status filter to see active onboarding records"
                    : "Onboarding records will appear here once they are created"}
                </p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium text-slate-400">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">Department</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">Days Since Start</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {activeOnboardings.slice(0, 10).map((onboarding) => {
                      const progress = getProgress(onboarding);
                      const status = getStatusBadge(onboarding);
                      const daysSince = getDaysSinceStart(onboarding);
                      return (
                        <tr key={onboarding._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white">
                            {onboarding.employeeName || `Employee ${onboarding.employeeId}`}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {onboarding.employeeDepartment || "Unknown"}
                      </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-slate-600 to-slate-700 h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                              <span className="text-sm text-slate-400 w-12 text-right">
                                {progress}%
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {onboarding.tasks.filter((t) => t.status === "completed").length}{" "}
                              of {onboarding.tasks.length} tasks
                        </div>
                      </td>
                          <td className="py-3 px-4 text-slate-400">{daysSince} days</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                            >
                              {status.label}
                        </span>
                      </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                router.push(`/recruitment/onboarding/${onboarding._id}`)
                              }
                              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                        </button>
                      </td>
                    </tr>
                      );
                    })}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Task Status Distribution */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white font-bold mb-4">Task Status Distribution</h2>
              {taskStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                  No task data available
                </div>
              )}
            </div>

            {/* Task Completion by Department */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white font-bold mb-4">
                Task Completion by Department
              </h2>
              {departmentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="department" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill={COLORS.green} />
                    <Bar dataKey="inProgress" stackId="a" fill={COLORS.yellow} />
                    <Bar dataKey="pending" stackId="a" fill={COLORS.gray} />
                    <Bar dataKey="overdue" stackId="a" fill={COLORS.red} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                  No department data available
                </div>
              )}
            </div>
          </div>

          {/* At-Risk Onboarding */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white font-bold">At-Risk Onboarding</h2>
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            {activeOnboardings.filter(
              (o) =>
                o.tasks.some(
                  (t) =>
                    t.status !== "completed" &&
                    t.deadline &&
                    new Date(t.deadline) < new Date()
                ) ||
                getProgress(o) < 50
            ).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400 opacity-50" />
                <p>No at-risk onboarding found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOnboardings
                  .filter(
                    (o) =>
                      o.tasks.some(
                        (t) =>
                          t.status !== "completed" &&
                          t.deadline &&
                          new Date(t.deadline) < new Date()
                      ) ||
                      getProgress(o) < 50
                  )
                  .slice(0, 5)
                  .map((onboarding) => {
                    const progress = getProgress(onboarding);
                    const daysSince = getDaysSinceStart(onboarding);
                    return (
                      <div
                        key={onboarding._id}
                        className="border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-white">
                                {onboarding.employeeName ||
                                  `Employee ${onboarding.employeeId}`}
                              </h3>
                              <span className="text-sm text-slate-400">
                                {onboarding.employeeDepartment || "Unknown"}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                              <span>Progress: {progress}%</span>
                              <span>Days: {daysSince}</span>
                              <span className="text-red-400">
                                Overdue Tasks:{" "}
                                {
                                  onboarding.tasks.filter(
                                    (t) =>
                                      t.status !== "completed" &&
                                      t.deadline &&
                                      new Date(t.deadline) < new Date()
                                  ).length
                                }
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              router.push(`/recruitment/onboarding/${onboarding._id}`)
                            }
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all text-sm"
                          >
                            Take Action
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
