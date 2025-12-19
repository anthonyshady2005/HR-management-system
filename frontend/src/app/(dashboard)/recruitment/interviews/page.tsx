"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  Eye,
  Plus,
  Clock,
  Video,
  Phone,
  MapPin,
  Trash2,
} from "lucide-react";
import { recruitmentApi, type Interview } from "@/lib/recruitment-api";

export default function InterviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    applicationId: "",
  });

  useEffect(() => {
    loadInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [interviews, searchQuery, filters]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getInterviews({});
      setInterviews(data || []);
    } catch (error) {
      console.error("Error loading interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (interview) =>
          interview._id.toLowerCase().includes(query) ||
          (typeof interview.applicationId === 'object' && interview.applicationId?._id
            ? interview.applicationId._id.toString().toLowerCase().includes(query)
            : interview.applicationId?.toString().toLowerCase().includes(query))
      );
    }

    if (filters.status) {
      filtered = filtered.filter((interview) => interview.status === filters.status);
    }

    if (filters.applicationId) {
      filtered = filtered.filter(
        (interview) => {
          const appId = typeof interview.applicationId === 'object' && interview.applicationId?._id
            ? interview.applicationId._id.toString()
            : interview.applicationId?.toString();
          return appId === filters.applicationId;
        }
      );
    }

    setFilteredInterviews(filtered);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this interview? This action cannot be undone.")) {
      return;
    }

    try {
      await recruitmentApi.deleteInterview(id);
      await loadInterviews();
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const upcomingInterviews = filteredInterviews.filter((interview) => {
    if (!interview.scheduledDate) return false;
    const date = new Date(interview.scheduledDate);
    return date >= new Date() && interview.status === "scheduled";
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading interviews...</div>
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
                <Link
                  href="/recruitment"
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Interviews</h1>
                    <p className="text-xs text-slate-400">
                      Schedule and manage interviews
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadInterviews}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm"
                >
                  Refresh
                </button>
                <Link
                  href="/recruitment/interviews/new"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Interview
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "list"
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "calendar"
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              Calendar View
            </button>
          </div>

          {/* Filters */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => setFilters({ status: "", applicationId: "" })}
                className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* List View */}
          {activeTab === "list" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Interview ID
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Application
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Stage
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Scheduled Date
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Method
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterviews.length > 0 ? (
                      filteredInterviews.map((interview) => (
                        <tr
                          key={interview._id}
                          className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                          onClick={() =>
                            router.push(`/recruitment/interviews/${interview._id}`)
                          }
                        >
                          <td className="px-6 py-4">
                            <span className="text-white text-sm">
                              #{interview._id.slice(-8)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300">
                              {typeof interview.applicationId === 'object' && interview.applicationId?._id
                                ? interview.applicationId._id.toString().slice(-8)
                                : interview.applicationId?.toString().slice(-8) || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300 capitalize">
                              {interview.stage || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-300 text-sm">
                                {interview.scheduledDate
                                  ? new Date(interview.scheduledDate).toLocaleString()
                                  : "Not scheduled"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-300">
                              {getMethodIcon(interview.method || "")}
                              <span className="text-sm capitalize">
                                {interview.method || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                                interview.status
                              )}`}
                            >
                              {interview.status || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/recruitment/interviews/${interview._id}`}
                                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                                className="w-8 h-8 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all inline-flex"
                              >
                                <Eye className="w-4 h-4 text-slate-400" />
                              </Link>
                              <button
                                onClick={(e) => handleDelete(interview._id, e)}
                                className="w-8 h-8 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-all inline-flex"
                                title="Delete interview"
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-slate-400"
                        >
                          No interviews found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {activeTab === "calendar" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl text-white mb-6">Upcoming Interviews</h3>
              <div className="space-y-3">
                {upcomingInterviews.length > 0 ? (
                  upcomingInterviews
                    .sort(
                      (a, b) =>
                        new Date(a.scheduledDate || 0).getTime() -
                        new Date(b.scheduledDate || 0).getTime()
                    )
                    .map((interview) => (
                      <div
                        key={interview._id}
                        onClick={() =>
                          router.push(`/recruitment/interviews/${interview._id}`)
                        }
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">
                              {interview.stage || "Interview"} - Application #
                              {typeof interview.applicationId === 'object' && interview.applicationId?._id
                                ? interview.applicationId._id.toString().slice(-8)
                                : interview.applicationId?.toString().slice(-8)}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Clock className="w-4 h-4" />
                                {interview.scheduledDate
                                  ? new Date(interview.scheduledDate).toLocaleString()
                                  : "TBD"}
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 text-sm">
                                {getMethodIcon(interview.method || "")}
                                <span className="capitalize">
                                  {interview.method || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                              interview.status
                            )}`}
                          >
                            {interview.status}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No upcoming interviews
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

