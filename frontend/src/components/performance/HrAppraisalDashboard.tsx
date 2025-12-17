"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";

type DashboardRow = {
  departmentId: string;
  departmentName: string;
  total: number;
  acknowledged: number;
  completionRate: number;
};

export default function HrAppraisalDashboard({ cycleId }: { cycleId: string }) {
  const [data, setData] = useState<DashboardRow[]>([]);

  useEffect(() => {
    api.get(`/performance/hr/dashboard/${cycleId}`)
      .then(res => setData(res.data));
  }, [cycleId]);

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
        
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-3xl text-white">Appraisal Completion Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Monitor appraisal progress across departments and identify completion gaps.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map(row => (
            <div
              key={row.departmentId}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              {/* Department */}
              <div className="mb-6">
                <h2 className="text-xl text-white">{row.departmentName}</h2>
                <p className="text-sm text-slate-400">
                  {row.acknowledged} of {row.total} completed
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-slate-600 to-slate-800"
                    style={{ width: `${row.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Completion Rate */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Completion</span>
                <span className="text-sm text-white">
                  {row.completionRate.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
    </ProtectedRoute>
  );
}
