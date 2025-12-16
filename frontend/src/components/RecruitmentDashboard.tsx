"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Search,
  Plus,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  recruitmentApi,
  type RecruitmentMetrics,
  type PipelineView,
  type ApplicationsByStatus,
  type JobRequisition,
  type Application,
  type Interview,
  type Offer,
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
};

export default function RecruitmentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RecruitmentMetrics | null>(null);
  const [pipeline, setPipeline] = useState<PipelineView | null>(null);
  const [applicationsByStatus, setApplicationsByStatus] =
    useState<ApplicationsByStatus | null>(null);
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>(
    []
  );
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>(
    []
  );
  const [pendingOffers, setPendingOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("30"); // days

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      const startDateStr = startDate.toISOString();

      // Load all data in parallel with error handling for each
      const [
        metricsData,
        pipelineData,
        statusData,
        requisitionsData,
        applicationsData,
        interviewsData,
        offersData,
      ] = await Promise.allSettled([
        recruitmentApi.getMetrics({ startDate: startDateStr, endDate }),
        recruitmentApi.getPipelineView(),
        recruitmentApi.getApplicationsByStatus(),
        recruitmentApi.getJobRequisitions({ status: "published" }),
        recruitmentApi.getApplications({ status: "in_process" }),
        recruitmentApi.getInterviews({
          status: "scheduled",
          startDate: new Date().toISOString(),
        }),
        recruitmentApi.getOffers({ status: "pending" }),
      ]);

      // Handle each result
      if (metricsData.status === "fulfilled") {
        setMetrics(metricsData.value);
      } else {
        console.error("Error loading metrics:", metricsData.reason);
      }

      if (pipelineData.status === "fulfilled") {
        setPipeline(pipelineData.value);
      } else {
        console.error("Error loading pipeline:", pipelineData.reason);
      }

      if (statusData.status === "fulfilled") {
        setApplicationsByStatus(statusData.value);
      } else {
        console.error("Error loading status:", statusData.reason);
      }

      if (requisitionsData.status === "fulfilled") {
        setRequisitions(requisitionsData.value || []);
      } else {
        console.error("Error loading requisitions:", requisitionsData.reason);
      }

      if (applicationsData.status === "fulfilled") {
        setRecentApplications((applicationsData.value || []).slice(0, 10));
      } else {
        console.error("Error loading applications:", applicationsData.reason);
      }

      if (interviewsData.status === "fulfilled") {
        setUpcomingInterviews((interviewsData.value || []).slice(0, 5));
      } else {
        console.error("Error loading interviews:", interviewsData.reason);
      }

      if (offersData.status === "fulfilled") {
        setPendingOffers(offersData.value || []);
      } else {
        console.error("Error loading offers:", offersData.reason);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const pipelineChartData = pipeline
    ? [
        {
          name: "Screening",
          value: pipeline.screening,
          color: COLORS.blue,
        },
        {
          name: "Dept Interview",
          value: pipeline.departmentInterview,
          color: COLORS.cyan,
        },
        {
          name: "HR Interview",
          value: pipeline.hrInterview,
          color: COLORS.indigo,
        },
        {
          name: "Offer",
          value: pipeline.offer,
          color: COLORS.green,
        },
      ]
    : [];

  const statusChartData = applicationsByStatus
    ? [
        {
          name: "Submitted",
          value: applicationsByStatus.submitted,
          color: COLORS.gray,
        },
        {
          name: "In Process",
          value: applicationsByStatus.inProcess,
          color: COLORS.blue,
        },
        {
          name: "Offer",
          value: applicationsByStatus.offer,
          color: COLORS.purple,
        },
        {
          name: "Hired",
          value: applicationsByStatus.hired,
          color: COLORS.green,
        },
        {
          name: "Rejected",
          value: applicationsByStatus.rejected,
          color: COLORS.red,
        },
      ]
    : [];

  const filteredRequisitions = requisitions.filter((req) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.title?.toLowerCase().includes(query) ||
      req.department?.toLowerCase().includes(query) ||
      req.location?.toLowerCase().includes(query)
    );
  });

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "screening":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "department_interview":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "hr_interview":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "offer":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "in_process":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "offer":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "hired":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
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
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Recruitment Dashboard</h1>
                    <p className="text-xs text-slate-400">
                      Manage hiring pipeline
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2 text-sm"
                >
                  Refresh
                </button>
                <Link
                  href="/recruitment/job-requisitions/new"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2"
                >
                <Plus className="w-4 h-4" />
                <span>New Job Posting</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Requisitions Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
                <Link
                  href="/recruitment/job-requisitions"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  View All →
                </Link>
              </div>
              <p className="text-3xl text-white mb-1">
                {metrics?.requisitions.total || 0}
              </p>
              <p className="text-sm text-slate-400 mb-2">Total Requisitions</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-green-400">
                  {metrics?.requisitions.open || 0} Open
                </span>
                <span className="text-slate-400">
                  {metrics?.requisitions.closed || 0} Closed
                </span>
              </div>
            </div>

            {/* Applications Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-slate-400" />
                <Link
                  href="/recruitment/applications"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  View All →
                </Link>
              </div>
              <p className="text-3xl text-white mb-1">
                {metrics?.applications.total || 0}
              </p>
              <p className="text-sm text-slate-400 mb-2">Total Applications</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-blue-400">
                  {metrics?.applications.active || 0} Active
                </span>
                <span className="text-green-400">
                  {metrics?.applications.hired || 0} Hired
                </span>
                <span className="text-red-400">
                  {metrics?.applications.rejected || 0} Rejected
                </span>
              </div>
            </div>

            {/* Offers Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
                <Link
                  href="/recruitment/offers"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  View All →
                </Link>
              </div>
              <p className="text-3xl text-white mb-1">
                {metrics?.offers.total || 0}
              </p>
              <p className="text-sm text-slate-400 mb-2">Total Offers</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-yellow-400">
                  {metrics?.offers.pending || 0} Pending
                </span>
                <span className="text-green-400">
                  {metrics?.offers.accepted || 0} Accepted
                </span>
                <span className="text-red-400">
                  {metrics?.offers.rejected || 0} Rejected
                </span>
              </div>
            </div>

            {/* Interviews Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
                <Link
                  href="/recruitment/interviews"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  View Calendar →
                </Link>
              </div>
              <p className="text-3xl text-white mb-1">
                {metrics?.interviews.total || 0}
              </p>
              <p className="text-sm text-slate-400 mb-2">Total Interviews</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-blue-400">
                  {metrics?.interviews.scheduled || 0} Scheduled
                </span>
                <span className="text-green-400">
                  {metrics?.interviews.completed || 0} Completed
                </span>
                <span className="text-red-400">
                  {metrics?.interviews.cancelled || 0} Cancelled
                </span>
              </div>
            </div>
          </div>

          {/* Time to Hire & Offer Acceptance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Time to Hire */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white">Time to Hire</h3>
                <TrendingUp className="w-6 h-6 text-slate-400" />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-3xl text-white mb-1">
                    {metrics?.timeToHire.average || 0}
                  </p>
                  <p className="text-xs text-slate-400">Avg Days</p>
                </div>
                <div>
                  <p className="text-3xl text-green-400 mb-1">
                    {metrics?.timeToHire.min || 0}
                  </p>
                  <p className="text-xs text-slate-400">Min</p>
                </div>
                <div>
                  <p className="text-3xl text-red-400 mb-1">
                    {metrics?.timeToHire.max || 0}
                  </p>
                  <p className="text-xs text-slate-400">Max</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Based on {metrics?.timeToHire.count || 0} hires
              </p>
            </div>

            {/* Offer Acceptance Rate */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white">Offer Acceptance Rate</h3>
                <CheckCircle className="w-6 h-6 text-slate-400" />
              </div>
              {metrics && metrics.offers.total > 0 ? (
                <>
                  <p className="text-4xl text-white mb-2">
                    {Math.round(
                      (metrics.offers.accepted /
                        (metrics.offers.accepted + metrics.offers.rejected)) *
                        100
                    ) || 0}
                    %
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-400">
                      {metrics.offers.accepted} Accepted
                    </span>
                    <span className="text-red-400">
                      {metrics.offers.rejected} Rejected
                    </span>
                    <span className="text-yellow-400">
                      {metrics.offers.pending} Pending
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-slate-400">No offers data available</p>
              )}
            </div>
          </div>

          {/* Pipeline & Status Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Pipeline View */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl text-white mb-6">Hiring Pipeline</h3>
              {pipelineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pipelineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="name"
                      stroke="#9ca3af"
                      tick={{ fill: "#9ca3af" }}
                    />
                    <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {pipelineChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                  No pipeline data available
                </div>
              )}
              <div className="grid grid-cols-4 gap-4 mt-4">
                {pipelineChartData.map((stage) => (
                  <div
                    key={stage.name}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3"
                  >
                    <div
                      className="w-3 h-3 rounded-full mb-2"
                      style={{ backgroundColor: stage.color }}
                    ></div>
                    <p className="text-2xl text-white mb-1">{stage.value}</p>
                    <p className="text-xs text-slate-400">{stage.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications by Status */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl text-white mb-6">
                Applications by Status
              </h3>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                  No status data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Recent Applications */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-white">Recent Applications</h3>
                <Link
                  href="/recruitment/applications"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentApplications.slice(0, 5).map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        Application #{app._id.slice(-6)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs border ${getStageColor(
                            app.currentStage
                          )}`}
                        >
                          {app.currentStage || "N/A"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status || "N/A"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/recruitment/applications/${app._id}`}
                      className="text-slate-400 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
                {recentApplications.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No recent applications
                  </p>
                )}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-white">Upcoming Interviews</h3>
                <Link
                  href="/recruitment/interviews"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  View Calendar →
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingInterviews.slice(0, 5).map((interview) => (
                  <div
                    key={interview._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {interview.stage || "Interview"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {interview.scheduledDate
                          ? new Date(
                              interview.scheduledDate
                            ).toLocaleDateString()
                          : "Date TBD"}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {interview.method || "TBD"}
                    </span>
                </div>
              ))}
                {upcomingInterviews.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No upcoming interviews
                  </p>
                )}
              </div>
            </div>

            {/* Pending Actions */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-white">Pending Actions</h3>
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="space-y-3">
                {pendingOffers.length > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-sm text-white font-medium">
                      {pendingOffers.length} Offers Awaiting Response
                    </p>
                    <Link
                      href="/recruitment/offers"
                      className="text-xs text-yellow-400 hover:text-yellow-300 mt-1 inline-block"
                    >
                      View Offers →
                    </Link>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-white font-medium">
                    Review Applications
                  </p>
                  <Link
                    href="/recruitment/applications"
                    className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
                  >
                    View Applications →
                  </Link>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm text-white font-medium">
                    Schedule Interviews
                  </p>
                  <Link
                    href="/recruitment/interviews/new"
                    className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block"
                  >
                    Schedule Now →
                  </Link>
                </div>
                {pendingOffers.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No pending actions
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Job Requisitions Table */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl text-white">Active Job Requisitions</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                      placeholder="Search requisitions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50 text-sm"
              />
            </div>
                  <button className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Job Title
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Department
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Location
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Openings
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Posted
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.length > 0 ? (
                    filteredRequisitions.map((req) => (
                      <tr
                        key={req._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-all"
                      >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                            <span className="text-white">
                              {req.title || req.requisitionId || "Untitled"}
                            </span>
                        </div>
                      </td>
                        <td className="px-6 py-4 text-slate-300">
                          {req.department || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {req.location || "N/A"}
                        </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full backdrop-blur-xl bg-slate-500/20 text-slate-300 text-sm border border-slate-500/30">
                            {req.openings || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              req.publishStatus === "published"
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : req.publishStatus === "closed"
                                ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                                : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            }`}
                          >
                            {req.publishStatus || "Draft"}
                        </span>
                      </td>
                        <td className="px-6 py-4 text-slate-300">
                          {req.postingDate
                            ? new Date(req.postingDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                      <td className="px-6 py-4">
                          <Link
                            href={`/recruitment/job-requisitions/${req._id}`}
                            className="w-8 h-8 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all inline-flex"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        {searchQuery
                          ? "No requisitions match your search"
                          : "No active requisitions"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Onboarding Dashboard (r→o)</span>
            </Link>
            <Link
              href="/offboarding"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-700 hover:to-rose-800 transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Offboarding Dashboard (r→of)</span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
