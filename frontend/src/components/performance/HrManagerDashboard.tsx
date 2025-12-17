import Link from "next/link";
import { DashboardProps } from "./types";
import { Settings, FileText, AlertCircle, BarChart, Plus, Shield } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";

export function HrManagerDashboard({ currentRole }: DashboardProps) {
  return (
    <ProtectedRoute allowedRoles={["HR Manager"]}>
      <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Template Definition Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="text-lg text-white">Template Definition</h3>
            </div>
            <p className="text-sm text-slate-400">
              Configure appraisal templates and competencies
            </p>
          </div>
          <Link
            href="/performance/createTemplate"
            className="mt-4 inline-flex items-center gap-2 justify-center px-4 py-2 bg-purple-600/20 border border-purple-500/40 rounded-xl text-white hover:bg-purple-600/40 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Create Template
          </Link>
        </div>

        {/* Cycle Management Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300">
              <BarChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg text-white">Cycle Management</h3>
          </div>
          <p className="text-sm text-slate-400">Create and monitor performance cycles</p>
          <Link
            href="/performance/createCycle"
            className="mt-4 inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-white hover:bg-blue-600/40 transition-all duration-300 w-full"
          >
            <Plus className="w-5 h-5" />
            Schedule Cycle
          </Link>
        </div>

        {/* Appraisal Cycles Dashboard Link Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-600/20 text-slate-300">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg text-white">Appraisal Cycles</h3>
            </div>
            <p className="text-sm text-slate-400">
              View and manage all appraisal cycles
            </p>
          </div>
          <Link
            href="/performance/cycles"
            className="mt-4 inline-flex items-center gap-2 justify-center px-4 py-2 bg-slate-600/20 border border-slate-500/40 rounded-xl text-white hover:bg-slate-600/40 transition-all duration-300 w-full"
          >
            <Plus className="w-5 h-5" />
            View Cycles
          </Link>
        </div>

        {/* Reports & Analytics Card */}
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
      </div>

      {/* Dispute Resolution Card */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg text-white">Dispute Resolution</h3>
          </div>
          <p className="text-sm text-slate-400">
            Review and resolve employee appraisal disputes
          </p>
        </div>
        <Link
          href="/performance/disputes"
          className="mt-4 inline-flex items-center gap-2 justify-center px-4 py-2 bg-amber-600/20 border border-amber-500/40 rounded-xl text-white hover:bg-amber-600/40 transition-all duration-300 w-full"
        >
          <AlertCircle className="w-5 h-5" />
          Manage Disputes
        </Link>
      </div>
      </div>
    </ProtectedRoute>
  );
}
