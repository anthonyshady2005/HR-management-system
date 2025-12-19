"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Search,
  Filter,
  Eye,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { recruitmentApi, type JobRequisition } from "@/lib/recruitment-api";

export default function JobRequisitionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<JobRequisition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    department: "",
  });

  useEffect(() => {
    loadRequisitions();
  }, []);

  useEffect(() => {
    filterRequisitions();
  }, [requisitions, searchQuery, filters]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getJobRequisitions({});
      setRequisitions(data || []);
    } catch (error) {
      console.error("Error loading requisitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequisitions = () => {
    let filtered = [...requisitions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.title?.toLowerCase().includes(query) ||
          req.requisitionId?.toLowerCase().includes(query) ||
          getDepartmentLabel(req.department).toLowerCase().includes(query) ||
          req.location?.toLowerCase().includes(query)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((req) => req.publishStatus === filters.status);
    }

    if (filters.department) {
      filtered = filtered.filter(
        (req) => getDepartmentLabel(req.department) === filters.department
      );
    }

    setFilteredRequisitions(filtered);
  };

  const handlePublish = async (id: string) => {
    try {
      await recruitmentApi.publishJobRequisition(id);
      await loadRequisitions();
    } catch (error) {
      console.error("Error publishing requisition:", error);
      alert("Failed to publish requisition");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await recruitmentApi.closeJobRequisition(id);
      await loadRequisitions();
    } catch (error) {
      console.error("Error closing requisition:", error);
      alert("Failed to close requisition");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "closed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "draft":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getDepartmentLabel = (
    department: JobRequisition["department"]
  ): string => {
    if (!department) {
      return "";
    }
    if (typeof department === "string") {
      return department;
    }
    return department.name || department.code || department._id || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading requisitions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
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
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Job Requisitions</h1>
                    <p className="text-xs text-slate-400">
                      Manage job postings
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadRequisitions}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm"
                >
                  Refresh
                </button>
                <Link
                  href="/recruitment/job-requisitions/new"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Requisition
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requisitions..."
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
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={() => setFilters({ status: "", department: "" })}
                className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Requisition ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Title
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
                          <span className="text-white text-sm">
                            {req.requisitionId || req._id.slice(-8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">
                            {req.title || "Untitled"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">
                            {getDepartmentLabel(req.department) || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">
                            {req.location || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full backdrop-blur-xl bg-slate-500/20 text-slate-300 text-sm border border-slate-500/30">
                            {req.openings || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                              req.publishStatus || "draft"
                            )}`}
                          >
                            {req.publishStatus || "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300 text-sm">
                            {req.postingDate
                              ? new Date(req.postingDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/recruitment/job-requisitions/${req._id}`}
                              className="w-8 h-8 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                            >
                              <Eye className="w-4 h-4 text-slate-400" />
                            </Link>
                            {req.publishStatus === "draft" && (
                              <button
                                onClick={() => handlePublish(req._id)}
                                className="w-8 h-8 rounded-lg backdrop-blur-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-all"
                                title="Publish"
                              >
                                <CheckCircle className="w-4 h-4 text-green-300" />
                              </button>
                            )}
                            {req.publishStatus === "published" && (
                              <button
                                onClick={() => handleClose(req._id)}
                                className="w-8 h-8 rounded-lg backdrop-blur-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all"
                                title="Close"
                              >
                                <XCircle className="w-4 h-4 text-red-300" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        No requisitions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

