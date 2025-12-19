"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import {
  Bell,
  User,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Check
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type PendingAssignment = {
  _id: string;
  status: string;
  employeeProfileId: {
    fullName: string;
    email: string;
    _id: string;
  } | null;
  managerProfileId: {
    fullName: string;
    email: string;
    _id: string;
  } | null;
  departmentId: {
    name: string;
  } | null;
};

export default function PendingAppraisals({ cycleId }: { cycleId: string }) {
  const [items, setItems] = useState<PendingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/performance/pending/${cycleId}`);
        setItems(res.data);
      } catch (err) {
        console.error("Failed to fetch pending appraisals", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, [cycleId]);

  const sendReminder = async (id: string, managerName: string) => {
    try {
      await api.post(`/performance/reminder/${id}`);
      setRemindedIds(prev => new Set(prev).add(id));
      toast.success(`Reminder sent to ${managerName}`);
      // Clear the reminder state after 3 seconds
      setTimeout(() => {
        setRemindedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 3000);
    } catch (err: unknown) {
      console.error("Failed to send reminder", err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to send reminder';
      toast.error(errorMessage || 'Failed to send reminder. Please try again.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={["HR Employee", "HR Manager", "department head"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">

        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Link href="/performance/cycles" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Cycles
                </Link>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Pending Appraisals</h1>
              <p className="text-slate-400">
                Monitor incomplete appraisals and send reminders to the responsible managers.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{items.length}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Pending Forms</p>
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-slate-400">There are no pending appraisals for this cycle.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map(item => (
                <div
                  key={item._id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-white/10 transition-all group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-center gap-6 lg:gap-12 flex-1">
                    {/* Employee */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Employee</p>
                        <p className="text-white font-semibold">{item.employeeProfileId?.fullName ?? 'Unknown Employee'}</p>
                        <p className="text-xs text-slate-400">{item.departmentId?.name ?? 'No Department'}</p>
                      </div>
                    </div>

                    {/* Manager */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                        <Users className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Manager/Reviewer</p>
                        <p className="text-white font-semibold">{item.managerProfileId?.fullName ?? 'Unknown Manager'}</p>
                        <p className="text-xs text-slate-400">Responsible for review</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-500/10 rounded-lg flex items-center justify-center border border-slate-500/20">
                        <Clock className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Status</p>
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20 font-bold uppercase">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => sendReminder(item._id, item.managerProfileId?.fullName ?? 'Manager')}
                      disabled={remindedIds.has(item._id) || !item.managerProfileId}
                      className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${remindedIds.has(item._id)
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : !item.managerProfileId
                            ? 'bg-slate-500/20 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 shadow-lg'
                        }`}
                    >
                      {remindedIds.has(item._id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Reminder Sent
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Send Reminder
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
