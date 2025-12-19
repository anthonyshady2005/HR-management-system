"use client";

import { useState, useEffect } from "react";
import { attendanceOverviewService as attendanceService } from "../services/attendance.service";
import { RefreshCw, Calendar } from "lucide-react";

export default function PayrollSyncStatusPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const PAGE_LIMIT = 10;

  useEffect(() => {
    loadFinalizedRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadFinalizedRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await attendanceService.getAttendanceRecordsFinalized({
        page,
        limit: PAGE_LIMIT,
      });

      /**
       * Normalize backend response safely
       */
      const data =
        res?.data ??
        res?.records ??
        (Array.isArray(res) ? res : []);

      const metaTotalPages =
        res?.totalPages ??
        res?.meta?.totalPages ??
        1;

      setRecords(Array.isArray(data) ? data : []);
      setTotalPages(metaTotalPages || 1);

      // 🔒 Safety: clamp page if backend says fewer pages
      if (page > metaTotalPages && metaTotalPages > 0) {
        setPage(metaTotalPages);
      }
    } catch (err: any) {
      console.error("Failed to load finalized records:", err);
      setError("Failed to load finalized attendance records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getRecordDay = (record: any): Date | null => {
    const firstPunchTime = record?.punches?.[0]?.time;
    if (!firstPunchTime) return null;

    const d = new Date(firstPunchTime);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Finalized Records</h1>
            <p className="text-slate-400">
              Attendance records ready for payroll
            </p>
          </div>

          <button
            onClick={loadFinalizedRecords}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          {loading ? (
            <div className="text-center text-slate-400 py-12">
              Loading finalized records...
            </div>
          ) : error ? (
            <div className="text-center text-red-400 py-12">
              {error}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              No finalized records found
            </div>
          ) : (
            <>
              {/* Table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 px-4 text-left">Employee</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Punches</th>
                    <th className="py-3 px-4 text-left">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const day = getRecordDay(r);

                    return (
                      <tr
                        key={r._id}
                        className="border-b border-slate-700 hover:bg-slate-700/50"
                      >
                        <td className="py-3 px-4 text-white">
                          {r.employeeId?.firstName} {r.employeeId?.lastName}
                          <div className="text-xs text-slate-400">
                            {r.employeeId?.personalEmail}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {day ? day.toLocaleDateString() : "-"}
                        </td>

                        <td className="py-3 px-4">
                          {r.punches?.map((p: any, i: number) => (
                            <div key={i} className="text-slate-400 text-xs">
                              {p.type} –{" "}
                              {new Date(p.time).toLocaleTimeString()}
                            </div>
                          ))}
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {(r.totalWorkMinutes / 60).toFixed(2)}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Page {page} of {totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
