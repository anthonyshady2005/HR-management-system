"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";

type PendingAssignment = {
  _id: string;
  status: string;
  employeeProfileId: {
    fullName: string;
    email: string;
  };
  departmentId: {
    name: string;
  };
};

export default function PendingAppraisals({ cycleId }: { cycleId: string }) {
  const [items, setItems] = useState<PendingAssignment[]>([]);

  useEffect(() => {
    api.get(`/performance/pending/${cycleId}`)
      .then(res => setItems(res.data));
  }, [cycleId]);

  const sendReminder = async (id: string) => {
    await api.post(`/performance/reminder/${id}`);
  };

  return (
    <ProtectedRoute allowedRoles={["HR Manager"]}>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl text-white">Pending Appraisals</h1>
          <p className="text-slate-400 mt-2">
            Monitor incomplete appraisals and send reminder notifications.
          </p>
        </div>

        {/* List */}
        <div className="space-y-4">
          {items.map(item => (
            <div
              key={item._id}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-white/10 transition-all"
            >
              {/* Employee Info */}
              <div>
                <p className="text-white">{item.employeeProfileId.fullName}</p>
                <p className="text-sm text-slate-400">
                  {item.departmentId.name}
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={() => sendReminder(item._id)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2"
              >
                Send Reminder
              </button>
            </div>
          ))}
        </div>

      </main>
    </div>
    </ProtectedRoute>
  );
}
