"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserMinus,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpRight,
  Eye,
  Calendar,
  Building2,
  Shield,
  Laptop,
  DollarSign,
  FileText,
  Key,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
} from "lucide-react";
import {
  offboardingApi,
  type TerminationRequest,
  type TerminationStats,
  type ClearanceChecklist,
  type DepartmentTurnover,
  type TerminationReason,
  type TerminationStatus,
  type TerminationType,
  type ClearanceItem,
  type EquipmentItem,
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

interface TerminationWithEmployee extends TerminationRequest {
  employeeName?: string;
  employeeDepartment?: string;
  employeePosition?: string;
  clearance?: ClearanceChecklist;
}

export default function OffboardingDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [terminations, setTerminations] = useState<TerminationWithEmployee[]>([]);
  const [stats, setStats] = useState<TerminationStats | null>(null);
  const [departmentTurnover, setDepartmentTurnover] = useState<DepartmentTurnover[]>([]);
  const [terminationReasons, setTerminationReasons] = useState<TerminationReason[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState("30"); // days

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      const startDateStr = startDate.toISOString();

      // Load all data in parallel
      const [
        terminationsData,
        statsData,
        turnoverData,
        reasonsData,
      ] = await Promise.allSettled([
        offboardingApi.getTerminations({
          startDate: startDateStr,
          endDate,
        }),
        offboardingApi.getTerminationStats({
          startDate: startDateStr,
          endDate,
        }),
        offboardingApi.getDepartmentTurnover({
          startDate: startDateStr,
          endDate,
        }),
        offboardingApi.getTerminationReasons({
          startDate: startDateStr,
          endDate,
        }),
      ]);

      // Process terminations data
      if (terminationsData.status === "fulfilled") {
        // Helper function to derive type from reason
        const deriveType = (reason?: string): "resignation" | "termination" => {
          if (!reason) return "termination";
          const reasonLower = reason.toLowerCase();
          if (reasonLower.includes("resign") || reasonLower.includes("resigned")) {
            return "resignation";
          }
          return "termination";
        };

        // Backend should populate employee information
        const terminationsToUse = terminationsData.value.map((t) => {
          const employee = t.employeeId;
          const employeeName = employee
            ? typeof employee === 'object'
              ? employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.employeeNumber || 'Unknown Employee'
              : 'Unknown Employee'
            : 'Unknown Employee';
          
          const employeeDepartment = employee
            ? typeof employee === 'object' && employee.primaryDepartmentId
              ? typeof employee.primaryDepartmentId === 'object'
                ? employee.primaryDepartmentId.name || 'Unknown'
                : 'Unknown'
              : 'Unknown'
            : 'Unknown';

          return {
            ...t,
            employeeName,
            employeeDepartment,
            type: t.type || deriveType(t.reason), // Use existing type or derive from reason
          };
        });
        setTerminations(terminationsToUse);
        
        // Calculate stats from terminations if stats API fails
        if (statsData.status !== "fulfilled" || !statsData.value) {
          calculateStatsFromData(terminationsToUse);
        }
      } else {
        setTerminations([]);
      }

      // Process stats data
      if (statsData.status === "fulfilled" && statsData.value) {
        setStats(statsData.value);
      } else if (terminationsData.status === "fulfilled" && terminationsData.value.length > 0) {
        // Helper function to derive type from reason
        const deriveType = (reason?: string): "resignation" | "termination" => {
          if (!reason) return "termination";
          const reasonLower = reason.toLowerCase();
          if (reasonLower.includes("resign") || reasonLower.includes("resigned")) {
            return "resignation";
          }
          return "termination";
        };

        // Calculate stats from terminations if stats API fails
        const terminationsToUse = terminationsData.value.map((t) => {
          const employee = t.employeeId;
          const employeeName = employee
            ? typeof employee === 'object'
              ? employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.employeeNumber || 'Unknown Employee'
              : 'Unknown Employee'
            : 'Unknown Employee';
          
          const employeeDepartment = employee
            ? typeof employee === 'object' && employee.primaryDepartmentId
              ? typeof employee.primaryDepartmentId === 'object'
                ? employee.primaryDepartmentId.name || 'Unknown'
                : 'Unknown'
              : 'Unknown'
            : 'Unknown';

          return {
            ...t,
            employeeName,
            employeeDepartment,
            type: t.type || deriveType(t.reason), // Use existing type or derive from reason
          };
        });
        calculateStatsFromData(terminationsToUse);
      } else {
        setStats(null);
      }

      // Process turnover data
      if (turnoverData.status === "fulfilled") {
        setDepartmentTurnover(turnoverData.value);
      } else {
        setDepartmentTurnover([]);
      }

      // Process reasons data
      if (reasonsData.status === "fulfilled") {
        setTerminationReasons(reasonsData.value);
      } else {
        setTerminationReasons([]);
      }
    } catch (error) {
      console.error("Error loading offboarding data:", error);
      setTerminations([]);
      setStats(null);
      setDepartmentTurnover([]);
      setTerminationReasons([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsFromData = (data: TerminationWithEmployee[]) => {
    const terminationRequests = {
      total: data.length,
      pending: data.filter((t) => t.status === "pending").length,
      approved: data.filter((t) => t.status === "approved").length,
      rejected: data.filter((t) => t.status === "rejected").length,
      completed: data.filter((t) => t.status === "completed").length,
    };

    const terminationTypes = {
      resignations: data.filter((t) => t.type === "resignation").length,
      terminations: data.filter((t) => t.type === "termination").length,
      ratio: 0,
    };
    terminationTypes.ratio =
      terminationTypes.terminations > 0
        ? terminationTypes.resignations / terminationTypes.terminations
        : 0;

    // Calculate average processing time
    const completedTerminations = data.filter(
      (t) => t.status === "completed" && t.createdAt && t.updatedAt
    );
    const processingTimes = completedTerminations.map((t) => {
      const start = new Date(t.createdAt!);
      const end = new Date(t.updatedAt!);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });
    const averageProcessingTime = {
      average:
        processingTimes.length > 0
          ? Math.round(
              (processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length) * 10
            ) / 10
          : 0,
      fastest: processingTimes.length > 0 ? Math.min(...processingTimes) : 0,
      slowest: processingTimes.length > 0 ? Math.max(...processingTimes) : 0,
      onTrack: 0, // Would need more data to calculate
    };

    setStats({
      terminationRequests,
      clearanceStatus: {
        total: 0,
        inProgress: 0,
        completed: 0,
        pendingItems: 0,
        completionRate: 0,
      },
      terminationTypes,
      averageProcessingTime,
    });
  };

  const filteredTerminations = terminations.filter((termination) => {
    const matchesSearch =
      !searchQuery ||
      termination.employeeName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || termination.status === statusFilter;
    const matchesType = typeFilter === "all" || termination.type === typeFilter;
    const matchesDepartment =
      departmentFilter === "all" ||
      termination.employeeDepartment === departmentFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDepartment;
  });

  const getStatusBadge = (status: TerminationStatus) => {
    const badges = {
      pending: {
        label: "Pending",
        color: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
      },
      approved: {
        label: "Approved",
        color: "bg-green-500/20 text-green-300 border border-green-500/30",
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-500/20 text-red-300 border border-red-500/30",
      },
      completed: {
        label: "Completed",
        color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
      },
    };
    return badges[status] || badges.pending;
  };

  const getDaysSinceRequest = (termination: TerminationRequest) => {
    if (!termination.requestDate) return 0;
    const request = new Date(termination.requestDate);
    const now = new Date();
    return Math.ceil((now.getTime() - request.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getClearanceProgress = (termination: TerminationWithEmployee) => {
    if (!termination.clearance) return 0;
    const total = termination.clearance.items.length;
    if (total === 0) return 100;
    const completed = termination.clearance.items.filter(
      (item) => item.status === "completed"
    ).length;
    return Math.round((completed / total) * 100);
  };

  // Prepare chart data
  const terminationTypeData = stats
    ? [
        {
          name: "Resignations",
          value: stats.terminationTypes.resignations,
          color: COLORS.blue,
        },
        {
          name: "Terminations",
          value: stats.terminationTypes.terminations,
          color: COLORS.red,
        },
      ]
    : [];

  const statusData = stats
    ? [
        {
          name: "Pending",
          value: stats.terminationRequests.pending,
          color: COLORS.yellow,
        },
        {
          name: "Approved",
          value: stats.terminationRequests.approved,
          color: COLORS.green,
        },
        {
          name: "Rejected",
          value: stats.terminationRequests.rejected,
          color: COLORS.red,
        },
        {
          name: "Completed",
          value: stats.terminationRequests.completed,
          color: COLORS.blue,
        },
      ]
    : [];

  const turnoverChartData = departmentTurnover.map((dept) => ({
    department: dept.department,
    turnoverRate: dept.turnoverRate,
    resignations: dept.resignations,
    terminations: dept.terminations,
  }));

  const reasonsChartData = terminationReasons
    .slice(0, 10)
    .map((reason) => ({
      reason: reason.reason,
      count: reason.count,
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading offboarding data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <UserMinus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Offboarding Dashboard</h1>
                    <p className="text-xs text-slate-400">
                      Manage employee terminations and exit procedures
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                  style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
                >
                  <option value="7" className="bg-slate-900 text-white">
                    Last 7 days
                  </option>
                  <option value="30" className="bg-slate-900 text-white">
                    Last 30 days
                  </option>
                  <option value="90" className="bg-slate-900 text-white">
                    Last 90 days
                  </option>
                  <option value="365" className="bg-slate-900 text-white">
                    Last year
                  </option>
                </select>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Termination Requests Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">
                    Termination Requests
                  </h3>
                  <UserMinus className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl text-white mb-1">
                    {stats.terminationRequests.total}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-yellow-400">
                      {stats.terminationRequests.pending} Pending
                    </span>
                    <span className="text-green-400">
                      {stats.terminationRequests.approved} Approved
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-red-400">
                      {stats.terminationRequests.rejected} Rejected
                    </span>
                    <span className="text-blue-400">
                      {stats.terminationRequests.completed} Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Clearance Status Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">
                    Clearance Status
                  </h3>
                  <CheckCircle className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl text-white mb-1">
                    {stats.clearanceStatus.total}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-yellow-400">
                      {stats.clearanceStatus.inProgress} In Progress
                    </span>
                    <span className="text-green-400">
                      {stats.clearanceStatus.completed} Completed
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Completion Rate:{" "}
                    <span className="text-white font-medium">
                      {stats.clearanceStatus.completionRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Termination Types Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">
                    Termination Types
                  </h3>
                  <BarChart3 className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-blue-400">
                      {stats.terminationTypes.resignations} Resignations
                    </span>
                    <span className="text-red-400">
                      {stats.terminationTypes.terminations} Terminations
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Ratio:{" "}
                    <span className="text-white font-medium">
                      {stats.terminationTypes.ratio.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Average Processing Time Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">
                    Avg. Processing Time
                  </h3>
                  <Clock className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl text-white mb-1">
                    {stats.averageProcessingTime.average}
                    <span className="text-lg text-slate-400"> days</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      Fastest: {stats.averageProcessingTime.fastest} days
                    </span>
                    <span>
                      Slowest: {stats.averageProcessingTime.slowest} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
              >
                <option value="all" className="bg-slate-900 text-white">
                  All Status
                </option>
                <option value="pending" className="bg-slate-900 text-white">
                  Pending
                </option>
                <option value="approved" className="bg-slate-900 text-white">
                  Approved
                </option>
                <option value="rejected" className="bg-slate-900 text-white">
                  Rejected
                </option>
                <option value="completed" className="bg-slate-900 text-white">
                  Completed
                </option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
              >
                <option value="all" className="bg-slate-900 text-white">
                  All Types
                </option>
                <option value="resignation" className="bg-slate-900 text-white">
                  Resignation
                </option>
                <option value="termination" className="bg-slate-900 text-white">
                  Termination
                </option>
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
              >
                <option value="all" className="bg-slate-900 text-white">
                  All Departments
                </option>
                {Array.from(
                  new Set(terminations.map((t) => t.employeeDepartment))
                ).map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900 text-white">
                    {dept || "Unknown"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Termination Requests Table */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white font-bold">
                Termination Requests
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by employee name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-500/50 text-sm"
                />
              </div>
            </div>
            {filteredTerminations.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <UserMinus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No termination requests found</p>
                <p className="text-sm mt-2">
                  Termination requests will appear here once they are created
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Employee
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Department
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Initiated By
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Termination Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Days Since Request
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTerminations.slice(0, 10).map((termination) => {
                      const status = getStatusBadge(termination.status);
                      const daysSince = getDaysSinceRequest(termination);
                      return (
                        <tr
                          key={termination._id}
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-white">
                            {termination.employeeName ||
                              `Employee ${termination.employeeId}`}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {termination.employeeDepartment || "Unknown"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                termination.type === "resignation"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : "bg-red-500/20 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {termination.type === "resignation"
                                ? "Resignation"
                                : "Termination"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {termination.initiator === "employee"
                              ? "Employee"
                              : termination.initiator === "hr"
                              ? "HR"
                              : termination.initiator === "manager"
                              ? "Manager"
                              : "Unknown"}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {termination.terminationDate
                              ? new Date(
                                  termination.terminationDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {daysSince} days
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                router.push(
                                  `/recruitment/offboarding/terminations/${termination._id}`
                                )
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
            {/* Termination Types Chart */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white font-bold mb-4">
                Termination Types
              </h2>
              {terminationTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={terminationTypeData}
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
                      {terminationTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                  No data available
                </div>
              )}
            </div>

            {/* Status Distribution Chart */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white font-bold mb-4">
                Status Distribution
              </h2>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Department Turnover */}
          {departmentTurnover.length > 0 && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-xl text-white font-bold mb-4">
                Department Turnover
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Department
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Total Terminations
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Resignations
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Terminations
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Turnover Rate
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-400">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentTurnover.map((dept) => (
                      <tr
                        key={dept.department}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-white">
                          {dept.department}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {dept.totalTerminations}
                        </td>
                        <td className="py-3 px-4 text-blue-400">
                          {dept.resignations}
                        </td>
                        <td className="py-3 px-4 text-red-400">
                          {dept.terminations}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-medium ${
                              dept.turnoverRate > 10
                                ? "text-red-400"
                                : dept.turnoverRate > 5
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {dept.turnoverRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {dept.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-red-400" />
                          ) : dept.trend === "down" ? (
                            <TrendingDown className="h-4 w-4 text-green-400" />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Termination Reasons */}
          {reasonsChartData.length > 0 && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-xl text-white font-bold mb-4">
                Termination Reasons
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reasonsChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis
                    dataKey="reason"
                    type="category"
                    width={150}
                    stroke="#9ca3af"
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pending Approvals */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-white font-bold">
                  Pending Approvals
                </h2>
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              {filteredTerminations.filter((t) => t.status === "pending")
                .length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400 opacity-50" />
                  <p>No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTerminations
                    .filter((t) => t.status === "pending")
                    .slice(0, 5)
                    .map((termination) => {
                      const daysSince = getDaysSinceRequest(termination);
                      return (
                        <div
                          key={termination._id}
                          className="border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-white">
                                {termination.employeeName ||
                                  `Employee ${termination.employeeId}`}
                              </h3>
                              <div className="mt-1 flex items-center gap-4 text-sm text-slate-400">
                                <span>
                                  {termination.type === "resignation"
                                    ? "Resignation"
                                    : "Termination"}
                                </span>
                                <span>{daysSince} days pending</span>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                router.push(
                                  `/recruitment/offboarding/terminations/${termination._id}`
                                )
                              }
                              className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all text-sm"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Overdue Clearances */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-white font-bold">
                  Overdue Clearances
                </h2>
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400 opacity-50" />
                <p>No overdue clearances</p>
                <p className="text-sm mt-2">
                  Clearance items that are past their due date will appear here
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
