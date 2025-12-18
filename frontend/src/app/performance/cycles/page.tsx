"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/providers/auth-provider";

type Cycle = {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { currentRole } = useAuth();

  // Fetch active appraisal cycles
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await api.get<Cycle[]>("/performance/cycles/active");
        setCycles(res.data);
      } catch (err) {
        console.error("Failed to fetch cycles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

  const handleCycleClick = (cycleId: string) => {
    if (!currentRole) return;

    if (currentRole === "HR Manager") {
      router.push(`/performance/hr/dashboard/${cycleId}`);
      return;
    }

    if (currentRole === "HR Employee") {
      router.push(`/performance/hr/pending/${cycleId}`);
      return;
    }

    console.warn("No cycle route defined for role:", currentRole);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        Loading cycles...
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["HR Employee", "HR Manager", "department head"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden p-6">
        {/* Background orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50 mb-8">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-3xl text-white">Appraisal Cycles</h1>
            {currentRole && (
              <p className="text-slate-400 text-sm mt-1">
                Current role: <span className="text-white">{currentRole}</span>
              </p>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl text-white mb-6">Active Cycles</h2>

          {cycles.length === 0 ? (
            <p className="text-slate-400">No active cycles right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cycles.map((cycle) => (
                <div
                  key={cycle._id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300"
                  onClick={() => handleCycleClick(cycle._id)}
                >
                  <h3 className="text-xl text-white mb-2">{cycle.name}</h3>
                  <p className="text-slate-400 text-sm">
                    {new Date(cycle.startDate).toLocaleDateString()} –{" "}
                    {new Date(cycle.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
