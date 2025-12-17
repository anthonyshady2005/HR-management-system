"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Calendar,
  User,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

interface AppraisalAssignment {
  _id: string;
  status: string;
  employeeProfileId: {
    _id: string;
    firstName: string;
    lastName: string;
    position?: { title: string };
  };
  cycleId: {
    _id: string;
    name: string;
    managerDueDate?: string;
  };
  assignedAt: string;
}

export default function ManagerAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;

      try {
        const res = await api.get(`/performance/assignments/manager/${user.id}`);
        const fetchedAssignments: AppraisalAssignment[] = res.data;

        // Compute stats
        const now = new Date();
        const pending = fetchedAssignments.filter((a) =>
          ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED"].includes(a.status)
        ).length;

        const completed = fetchedAssignments.filter((a) =>
          ["PUBLISHED", "ACKNOWLEDGED", "COMPLETED"].includes(a.status)
        ).length;

        const overdue = fetchedAssignments.filter(
          (a) =>
            a.cycleId?.managerDueDate &&
            new Date(a.cycleId.managerDueDate) < now &&
            !["PUBLISHED", "ACKNOWLEDGED", "COMPLETED"].includes(a.status)
        ).length;

        setStats({
          total: fetchedAssignments.length,
          pending,
          completed,
          overdue,
        });

        setAssignments(fetchedAssignments);
      } catch (err) {
        console.error("Failed to load manager assignments", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "SUBMITTED":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "PUBLISHED":
      case "ACKNOWLEDGED":
      case "COMPLETED":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    `${a.employeeProfileId.firstName} ${a.employeeProfileId.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["department head"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">
                  Team Appraisals
                </span>
              </h1>
              <p className="text-slate-400">
                View and manage assigned appraisals for your team members.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard title="Total Assigned" count={stats.total} icon={ClipboardList} color="blue" subtitle="All active cycles" />
            <StatCard title="Pending" count={stats.pending} icon={Clock} color="amber" subtitle="Need attention" />
            <StatCard title="Completed" count={stats.completed} icon={CheckCircle2} color="green" subtitle="Finalized reviews" />
            <StatCard title="Overdue" count={stats.overdue} icon={AlertCircle} color="red" subtitle="Past due date" />
          </div>

          {/* Content Section */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Assigned Appraisals
              </h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cycle</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment._id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">
                              {assignment.employeeProfileId.firstName} {assignment.employeeProfileId.lastName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {assignment.employeeProfileId.position?.title || "Unknown Position"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {assignment.cycleId?.name || "Unknown Cycle"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                            {assignment.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/performance/evaluate/${assignment._id}`}>
                            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-sm flex items-center gap-2 group-hover:border-blue-500/30 group-hover:text-blue-300">
                              Evaluate
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                  <ClipboardList className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Assignments Found</h3>
                <p className="text-slate-400 max-w-sm">
                  There are currently no active appraisal assignments for your team.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ---------- StatCard Component ----------
interface StatCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  color: "blue" | "green" | "amber" | "red";
  subtitle?: string;
}
const StatCard = ({ title, count, icon: Icon, color, subtitle }: StatCardProps) => {
  const colors: any = {
    blue: "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30",
    green: "bg-green-500/20 text-green-400 group-hover:bg-green-500/30",
    amber: "bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30",
    red: "bg-red-500/20 text-red-400 group-hover:bg-red-500/30",
  };
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]} transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm text-slate-400">{title}</span>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{count}</h3>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
