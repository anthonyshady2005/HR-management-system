"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import { ArrowLeft, Archive, Lock, Play, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

type Cycle = {
  _id: string;
  name: string;
  cycleType: string;
  startDate: string;
  endDate: string;
  status: string;
  closedAt?: string;
  archivedAt?: string;
};

export default function CycleManagementPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const response = await api.get('/performance/cycles');
      setCycles(response.data);
    } catch (error) {
      console.error("Failed to fetch cycles:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCycleStatus = async (cycleId: string, newStatus: string) => {
    setUpdating(cycleId);
    try {
      await api.put(`/performance/cycles/${cycleId}/status`, { status: newStatus });
      await fetchCycles(); // Refresh the list
    } catch (error) {
      console.error("Failed to update cycle status:", error);
      alert("Failed to update cycle status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'ACTIVE':
        return <Play className="w-4 h-4 text-green-400" />;
      case 'CLOSED':
        return <Lock className="w-4 h-4 text-orange-400" />;
      case 'ARCHIVED':
        return <Archive className="w-4 h-4 text-slate-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'CLOSED':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'ARCHIVED':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default:
        return 'bg-red-500/20 text-red-300 border-red-500/40';
    }
  };

  const canCloseCycle = (cycle: Cycle) => {
    const now = new Date();
    const endDate = parseISO(cycle.endDate);
    return cycle.status === 'ACTIVE' && endDate <= now;
  };

  const canArchiveCycle = (cycle: Cycle) => {
    return cycle.status === 'CLOSED';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-slate-400">Loading cycles...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["HR Manager"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">

        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl animate-pulse delay-2000 -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="mb-8">
            <Link href="/performance" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Performance
            </Link>
            <h1 className="text-3xl text-white mb-2">Cycle Management</h1>
            <p className="text-slate-400">Manage the lifecycle of appraisal cycles - close completed cycles and archive old ones</p>
          </div>

          {/* Status Legend */}
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-sm font-medium text-white mb-3">Status Legend</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400">Planned - Cycle scheduled but not started</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-green-400" />
                <span className="text-slate-400">Active - Cycle currently running</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-400" />
                <span className="text-slate-400">Closed - Cycle ended, evaluations complete</span>
              </div>
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Archived - Cycle stored for historical reference</span>
              </div>
            </div>
          </div>

          {/* Cycles List */}
          <div className="space-y-4">
            {cycles.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg text-white mb-2">No Cycles Found</h3>
                <p className="text-slate-400">No appraisal cycles have been created yet.</p>
              </div>
            ) : (
              cycles.map((cycle) => (
                <div
                  key={cycle._id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(cycle.status)}
                        <h3 className="text-xl text-white font-medium">{cycle.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(cycle.status)}`}>
                          {cycle.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(parseISO(cycle.startDate), 'MMM dd, yyyy')} - {format(parseISO(cycle.endDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{cycle.cycleType}</span>
                        </div>
                      </div>
                      {(cycle.closedAt || cycle.archivedAt) && (
                        <div className="mt-2 text-xs text-slate-500">
                          {cycle.closedAt && `Closed: ${format(parseISO(cycle.closedAt), 'MMM dd, yyyy')}`}
                          {cycle.archivedAt && ` • Archived: ${format(parseISO(cycle.archivedAt), 'MMM dd, yyyy')}`}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {canCloseCycle(cycle) && (
                        <button
                          onClick={() => updateCycleStatus(cycle._id, 'CLOSED')}
                          disabled={updating === cycle._id}
                          className="px-4 py-2 bg-orange-600/20 border border-orange-500/40 rounded-xl text-orange-300 hover:bg-orange-600/40 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Lock className="w-4 h-4" />
                          {updating === cycle._id ? 'Closing...' : 'Close Cycle'}
                        </button>
                      )}
                      {canArchiveCycle(cycle) && (
                        <button
                          onClick={() => updateCycleStatus(cycle._id, 'ARCHIVED')}
                          disabled={updating === cycle._id}
                          className="px-4 py-2 bg-slate-600/20 border border-slate-500/40 rounded-xl text-slate-300 hover:bg-slate-600/40 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Archive className="w-4 h-4" />
                          {updating === cycle._id ? 'Archiving...' : 'Archive'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Auto-Archive Info */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">Automatic Lifecycle Management</h4>
                <p className="text-sm text-slate-300">
                  Cycles are automatically closed when their end date passes and archived after 30 days.
                  You can also manually manage cycle statuses using the buttons above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}