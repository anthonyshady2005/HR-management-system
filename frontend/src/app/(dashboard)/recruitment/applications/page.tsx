"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Plus,
  Calendar,
  FileText,
} from "lucide-react";
import { recruitmentApi, type Application } from "@/lib/recruitment-api";

export default function ApplicationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<"table" | "pipeline">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    stage: "",
    requisitionId: "",
  });

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, filters]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getApplications();
      setApplications(data || []);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((app) => {
        const candidateName = typeof app.candidateId === 'object' && app.candidateId !== null
          ? (app.candidateId as any).firstName && (app.candidateId as any).lastName
            ? `${(app.candidateId as any).firstName} ${(app.candidateId as any).lastName}`.toLowerCase()
            : (app.candidateId as any)._id?.toString().toLowerCase() || ''
          : app.candidateId?.toString().toLowerCase() || '';
        return (
          app._id.toLowerCase().includes(query) ||
          candidateName.includes(query)
        );
      });
    }

    if (filters.status) {
      filtered = filtered.filter((app) => app.status === filters.status);
    }

    if (filters.stage) {
      filtered = filtered.filter((app) => app.currentStage === filters.stage);
    }

    if (filters.requisitionId) {
      filtered = filtered.filter((app) => {
        const reqId = typeof app.requisitionId === 'object' && app.requisitionId !== null
          ? (app.requisitionId as any)._id?.toString() || ''
          : app.requisitionId?.toString() || '';
        return reqId === filters.requisitionId;
      });
    }

    setFilteredApplications(filtered);
  };

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

  const pipelineStages = [
    { key: "screening", label: "Screening", color: "blue" },
    { key: "department_interview", label: "Dept Interview", color: "cyan" },
    { key: "hr_interview", label: "HR Interview", color: "indigo" },
    { key: "offer", label: "Offer", color: "green" },
  ];

  const getApplicationsByStage = (stage: string) => {
    return filteredApplications.filter((app) => app.currentStage === stage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading applications...</div>
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
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Applications</h1>
                    <p className="text-xs text-slate-400">
                      Manage candidate applications
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadApplications}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm"
                >
                  Refresh
                </button>
                <span className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm">
                  {filteredApplications.length} applications
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab("table")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "table"
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "pipeline"
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              Pipeline View
            </button>
          </div>

          {/* Filters */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
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
                <option value="submitted">Submitted</option>
                <option value="in_process">In Process</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
              >
                <option value="">All Stages</option>
                <option value="screening">Screening</option>
                <option value="department_interview">Department Interview</option>
                <option value="hr_interview">HR Interview</option>
                <option value="offer">Offer</option>
              </select>
              <button
                onClick={() => setFilters({ status: "", stage: "", requisitionId: "" })}
                className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table View */}
          {activeTab === "table" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Application ID
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Candidate
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Requisition
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Stage
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Assigned HR
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Date
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-slate-400"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((app) => (
                        <tr
                          key={app._id}
                          className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                          onClick={() => router.push(`/recruitment/applications/${app._id}`)}
                        >
                          <td className="px-6 py-4">
                            <span className="text-white text-sm">
                              #{app._id.slice(-8)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300">
                              {typeof app.candidateId === 'object' && app.candidateId !== null
                                ? (app.candidateId as any).firstName && (app.candidateId as any).lastName
                                  ? `${(app.candidateId as any).firstName} ${(app.candidateId as any).lastName}`
                                  : (app.candidateId as any)._id?.toString().slice(-8) || "N/A"
                                : app.candidateId?.toString().slice(-8) || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300">
                              {typeof app.requisitionId === 'object' && app.requisitionId !== null
                                ? (app.requisitionId as any).title || (app.requisitionId as any)._id?.toString().slice(-8) || "N/A"
                                : app.requisitionId?.toString().slice(-8) || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs border ${getStageColor(
                                app.currentStage
                              )}`}
                            >
                              {app.currentStage || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                                app.status
                              )}`}
                            >
                              {app.status || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300 text-sm">
                              {typeof app.assignedHr === 'object' && app.assignedHr !== null
                                ? (app.assignedHr as any).fullName || (app.assignedHr as any).firstName && (app.assignedHr as any).lastName
                                  ? `${(app.assignedHr as any).firstName} ${(app.assignedHr as any).lastName}`
                                  : (app.assignedHr as any)._id?.toString().slice(-8) || "Unassigned"
                                : app.assignedHr
                                  ? app.assignedHr.toString().slice(-8)
                                  : "Unassigned"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300 text-sm">
                              {app.createdAt
                                ? new Date(app.createdAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/recruitment/applications/${app._id}`}
                              onClick={(e) => e.stopPropagation()}
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
                          colSpan={8}
                          className="px-6 py-8 text-center text-slate-400"
                        >
                          No applications found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pipeline/Kanban View */}
          {activeTab === "pipeline" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {pipelineStages.map((stage) => {
                const stageApps = getApplicationsByStage(stage.key);
                return (
                  <div
                    key={stage.key}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">{stage.label}</h3>
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white text-xs">
                        {stageApps.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {stageApps.map((app) => (
                        <div
                          key={app._id}
                          onClick={() =>
                            router.push(`/recruitment/applications/${app._id}`)
                          }
                          className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm">
                              #{app._id.slice(-6)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Candidate: {typeof app.candidateId === 'object' && app.candidateId !== null
                              ? (app.candidateId as any).firstName && (app.candidateId as any).lastName
                                ? `${(app.candidateId as any).firstName} ${(app.candidateId as any).lastName}`
                                : (app.candidateId as any)._id?.toString().slice(-8) || "N/A"
                              : app.candidateId?.toString().slice(-8) || "N/A"}
                          </p>
                          {app.assignedHr && (
                            <p className="text-xs text-slate-400 mt-1">
                              HR: {typeof app.assignedHr === 'object' && app.assignedHr !== null
                                ? (app.assignedHr as any).fullName || ((app.assignedHr as any).firstName && (app.assignedHr as any).lastName
                                  ? `${(app.assignedHr as any).firstName} ${(app.assignedHr as any).lastName}`
                                  : (app.assignedHr as any)._id?.toString().slice(-8) || "N/A")
                                : app.assignedHr.toString().slice(-8)}
                            </p>
                          )}
                        </div>
                      ))}
                      {stageApps.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">
                          No applications
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

