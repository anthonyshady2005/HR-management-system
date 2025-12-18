import Link from "next/link";
import { DashboardProps } from "./types";
import { ClipboardList, Users } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";

export function LineManagerDashboard({ currentRole }: DashboardProps) {
  return (
    <ProtectedRoute allowedRoles={["department head"]}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">Line Manager Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Team Appraisals / Evaluate Card */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:border-blue-500/50 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/20">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Evaluate Team</h3>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Access assigned appraisals. Monitor progress and complete performance evaluations for your direct reports.
              </p>
            </div>
            <Link
              href="/performance/manager/assignments"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all w-full font-medium shadow-lg group-hover:from-blue-600 group-hover:to-blue-700"
            >
              <ClipboardList className="w-5 h-5" />
              Start Evaluation
            </Link>
          </div>

          {/* My Evaluations / Results Card */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:border-green-500/50 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-900/20">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">My Evaluations</h3>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Review, edit, and view the status of all performance reviews you have submitted for your team members.
              </p>
            </div>
            <Link
              href="/performance/manager/evaluations"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all w-full font-medium shadow-lg group-hover:from-green-600 group-hover:to-green-700"
            >
              <ClipboardList className="w-5 h-5" />
              View My Reviews
            </Link>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
