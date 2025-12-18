"use client";

import { useAuth } from "@/providers/auth-provider";
import { Trophy, Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { HrManagerDashboard } from "@/components/performance/HrManagerDashboard";
import { HrEmployeeDashboard } from "@/components/performance/HrEmployeeDashboard";
import { LineManagerDashboard } from "@/components/performance/LineManagerDashboard";
import { EmployeeDashboard } from "@/components/performance/EmployeeDashboard";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";

export default function PerformancePage() {
  const { currentRole, status } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const renderDashboard = () => {
    switch (currentRole) {
      case "HR Manager":
        return <HrManagerDashboard currentRole={currentRole} />;
      case "HR Employee":
        return <HrEmployeeDashboard currentRole={currentRole} />;
      case "department head":
        return <LineManagerDashboard currentRole={currentRole} />;
      case "department employee":
        return <EmployeeDashboard currentRole={currentRole} />;
      default:
        return (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-slate-400">
              Please select a valid role in the navbar to view Performance modules.
            </p>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={["HR Manager", "HR Employee", "department head", "department employee"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <Navbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/20">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Performance Management
                </h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>
                    {currentRole
                      ? `Viewing as ${currentRole}`
                      : "Select a role to continue"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                    Cycle 2024-Q4
                  </span>
                </p>
              </div>
            </div>
          </div>

          {renderDashboard()}
        </div>
      </div>
    </ProtectedRoute>
  );
}
