"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Search,
  Filter,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

type DashboardRow = {
  departmentId: string;
  departmentName: string;
  total: number;
  acknowledged: number;
  completionRate: number;
};

export default function HrAppraisalDashboard({ cycleId }: { cycleId: string }) {
  const [data, setData] = useState<DashboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/performance/hr/dashboard/${cycleId}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [cycleId]);

  const totalAppraisals = data.reduce((acc, row) => acc + row.total, 0);
  const totalCompleted = data.reduce((acc, row) => acc + row.acknowledged, 0);
  const overallCompletionRate = totalAppraisals > 0 ? (totalCompleted / totalAppraisals) * 100 : 0;

  return (
    <ProtectedRoute allowedRoles={["HR Employee", "HR Manager"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">

        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl animate-pulse delay-2000 -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Link href="/performance/cycles" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Cycles
                </Link>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Cycle Dashboard</h1>
              <p className="text-slate-400">
                Comprehensive overview of performance evaluation progress across all departments.
              </p>
            </div>

            <Link href={`/performance/hr/pending/${cycleId}`}>
              <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium flex items-center gap-2 group">
                View All Pending
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-16 h-16 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-4">Overall Completion</p>
              <div className="flex items-end gap-2 mb-4">
                <h3 className="text-4xl font-bold text-white">{overallCompletionRate.toFixed(1)}%</h3>
                <p className="text-slate-400 text-sm mb-1 pb-0.5">Finished</p>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                  style={{ width: `${overallCompletionRate}%` }}
                />
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="w-16 h-16 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-4">Evaluations Status</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-3xl font-bold text-white">{totalCompleted}</h3>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-right">
                  <h3 className="text-3xl font-bold text-slate-400">{totalAppraisals - totalCompleted}</h3>
                  <p className="text-xs text-slate-400">Remaining</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">Total of {totalAppraisals} assignments</p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <LayoutDashboard className="w-16 h-16 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-4">Department Coverage</p>
              <h3 className="text-4xl font-bold text-white mb-2">{data.length}</h3>
              <p className="text-slate-400 text-sm">Active Departments</p>
            </div>
          </div>

          {/* Section Title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-slate-400" />
              Department Breakdown
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter department..."
                  className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-48 md:w-64"
                />
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map(row => (
                <div
                  key={row.departmentId}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 group"
                >
                  {/* Department Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{row.departmentName}</h2>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Progress Report</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total</p>
                      <p className="text-2xl font-bold text-white">{row.total}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Finished</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-green-400">{row.acknowledged}</p>
                        {row.acknowledged === row.total && row.total > 0 && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Completion Rate</span>
                      <span className={`font-bold ${row.completionRate === 100 ? 'text-green-400' : 'text-blue-400'}`}>
                        {row.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full bg-gradient-to-r transition-all duration-1000 ${row.completionRate === 100
                          ? 'from-green-500 to-emerald-500'
                          : 'from-blue-500 to-indigo-600'
                          }`}
                        style={{ width: `${row.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {row.completionRate < 100 && (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{row.total - row.acknowledged} Pending</span>
                        </>
                      )}
                      {row.completionRate === 100 && (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Fully Completed</span>
                        </>
                      )}
                    </div>
                    {/* Could add a specific filter page link here if needed */}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer info */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
