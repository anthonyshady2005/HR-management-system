"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";

type Cycle = {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export default function HrDashboard() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Fetch currently active cycles
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await api.get<Cycle[]>("/performance/cycles/active");
        setCycles(res.data);
      } catch (err) {
        console.error("Failed to fetch active cycles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

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
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50 mb-8">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-3xl text-white">HR Manager Dashboard</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl text-white mb-6">Active Appraisal Cycles</h2>
          {cycles.length === 0 ? (
            <p className="text-slate-400">No active cycles right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cycles.map((cycle) => (
                <div
                  key={cycle._id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 cursor-pointer transition-all duration-300"
                  onClick={() =>
                    router.push(`/performance/hr/pending/${cycle._id}`)
                  }
                >
                  <h3 className="text-xl text-white mb-2">{cycle.name}</h3>
                  <p className="text-slate-400 text-sm">
                    {new Date(cycle.startDate).toLocaleDateString()} -{" "}
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
