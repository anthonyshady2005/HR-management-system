import Link from "next/link";
import { DashboardProps } from "./types";
import { PlayCircle, Search, Plus, UserCheck, FileText, User } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { EmployeeDashboard } from "./EmployeeDashboard";

export function HrEmployeeDashboard({ currentRole }: DashboardProps) {
  return (
    <ProtectedRoute allowedRoles={["HR Employee", "HR Manager"]}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Cycle Execution Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg text-white">Cycle Execution</h3>
              </div>
              <p className="text-sm text-slate-400">Launch and manage active appraisal cycles</p>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Link
                href="/performance/cycles"
                className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-purple-600/20 border border-purple-500/40 rounded-xl text-white hover:bg-purple-600/40 transition-all duration-300 w-full"
              >
                <Search className="w-5 h-5" />
                View Cycles
              </Link>
              <Link
                href="/performance/createCycle"
                className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-white hover:bg-blue-600/40 transition-all duration-300 w-full"
              >
                <Plus className="w-5 h-5" />
                Schedule Cycle
              </Link>
              <Link
                href="/performance/assignBulk"
                className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-white hover:bg-emerald-600/40 transition-all duration-300 w-full"
              >
                <UserCheck className="w-5 h-5" />
                Bulk Assign
              </Link>
            </div>
          </div>

          {/* Monitoring Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg text-white">Monitoring</h3>
            </div>
            <p className="text-sm text-slate-400">Track progress and completion rates</p>
          </div>

          {/* Reports Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-green-500/20 text-green-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg text-white">Reports & Analytics</h3>
              </div>
              <p className="text-sm text-slate-400">
                Generate outcome reports and performance analytics
              </p>
            </div>
            <Link
              href="/performance/reports"
              className="mt-4 inline-flex items-center gap-2 justify-center px-4 py-2 bg-green-600/20 border border-green-500/40 rounded-xl text-white hover:bg-green-600/40 transition-all duration-300 w-full"
            >
              <FileText className="w-5 h-5" />
              View Reports
            </Link>
          </div>

          {/* Pending Appraisals Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg text-white">Pending Appraisals</h3>
              </div>
              <p className="text-sm text-slate-400">
                View all pending appraisals assigned to you
              </p>
            </div>
            <Link
              href="/performance/hr/pending/:"
              className="mt-4 inline-flex items-center gap-2 justify-center px-4 py-2 bg-amber-600/20 border border-amber-500/40 rounded-xl text-white hover:bg-amber-600/40 transition-all duration-300 w-full"
            >
              <Plus className="w-5 h-5" />
              View Pending
            </Link>
          </div>

        </div>
      </div>

      {/* My Appraisals Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-2xl text-white">My Performance Appraisals</h3>
        </div>
        <EmployeeDashboard currentRole={currentRole} />
      </div>
    </ProtectedRoute>
  );
}
