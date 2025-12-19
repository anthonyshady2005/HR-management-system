"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { onboardingApi, type Onboarding } from "@/lib/recruitment-api";

interface OnboardingWithEmployee extends Onboarding {
  employeeName?: string;
  employeeDepartment?: string;
  startDate?: string;
}

export default function OnboardingListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [onboardings, setOnboardings] = useState<OnboardingWithEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadOnboardings();
  }, [statusFilter]);

  const loadOnboardings = async () => {
    try {
      setLoading(true);
      const response = await onboardingApi.getOnboardings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      
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
    } catch (error) {
      console.error("Error loading onboardings:", error);
      setOnboardings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOnboardings = onboardings.filter((onboarding) => {
    const matchesSearch = !searchQuery || 
      onboarding.employeeName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (onboarding: OnboardingWithEmployee) => {
    if (onboarding.completed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
          Completed
        </span>
      );
    }
    
    const progress = onboarding.tasks.length > 0
      ? (onboarding.tasks.filter((t: any) => t.status === "completed").length / onboarding.tasks.length) * 100
      : 0;

    if (progress < 50) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
          At Risk
        </span>
      );
    }

    const hasInProgress = onboarding.tasks.some((t: any) => t.status === "in_progress");
    if (hasInProgress) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
          In Progress
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
        Pending
      </span>
    );
  };

  const getProgress = (onboarding: Onboarding) => {
    if (onboarding.tasks.length === 0) return 0;
    const completed = onboarding.tasks.filter((t: any) => t.status === "completed").length;
    return Math.round((completed / onboarding.tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading onboarding records...</div>
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">All Onboarding Records</h1>
            <p className="text-slate-400">View and manage all employee onboarding processes</p>
          </div>

          {/* Filters */}
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
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredOnboardings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No onboarding records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOnboardings.map((onboarding) => (
                      <tr key={onboarding._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white font-medium">
                            {onboarding.employeeName || "Unknown Employee"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                          {onboarding.employeeDepartment || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                style={{ width: `${getProgress(onboarding)}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-300 w-12 text-right">
                              {getProgress(onboarding)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(onboarding)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                          {onboarding.tasks.filter((t: any) => t.status === "completed").length} / {onboarding.tasks.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => router.push(`/recruitment/onboarding/${onboarding._id}`)}
                            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

