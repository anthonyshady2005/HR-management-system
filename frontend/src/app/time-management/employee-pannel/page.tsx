"use client";

import { useEffect, useMemo, useState } from "react";
import { exceptionRequestService } from "../services/exception-request.service";
import {
  AttendanceCorrectionRequest,
  CorrectionRequestStatus,
  TimeException,
  TimeExceptionType,
  TimeExceptionStatus,
} from "../models";
import { useAuth } from "@/providers/auth-provider";
import { useRequireRole } from "@/hooks/use-require-role";
const ALLOWED_ROLES = ["department employee"];

/* ======================================================
   Helper UI
====================================================== */
const statusBadge = (status: string) => {
  switch (status) {
    case CorrectionRequestStatus.APPROVED:
    case TimeExceptionStatus.APPROVED:
      return "bg-emerald-500/10 text-emerald-300 border-emerald-600/40";
    case CorrectionRequestStatus.REJECTED:
    case TimeExceptionStatus.REJECTED:
      return "bg-red-500/10 text-red-300 border-red-600/40";
    case CorrectionRequestStatus.ESCALATED:
    case TimeExceptionStatus.ESCALATED:
      return "bg-amber-500/10 text-amber-300 border-amber-600/40";
    case CorrectionRequestStatus.IN_REVIEW:
      return "bg-sky-500/10 text-sky-300 border-sky-600/40";
    default:
      return "bg-slate-500/10 text-slate-300 border-slate-600/40";
  }
};

export default function TimeManagementEmployeePage() {
  const { status, user } = useAuth();
  useRequireRole(ALLOWED_ROLES, "/home");
  const isAuthLoading = status === "loading";
    
  /* ======================================================
     EMPLOYEE ID
  ====================================================== */
  const employeeId = useMemo(() => {
    if (!user) return null;
    const u: any = user;
    return (
      u.employeeProfileId ||
      u.employeeId ||
      u.employeeProfile?._id ||
      u._id ||
      u.id ||
      null
    );
  }, [user]);

  /* ======================================================
     ATTENDANCE CORRECTIONS
  ====================================================== */
  const [correctionDate, setCorrectionDate] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [corrections, setCorrections] =
    useState<AttendanceCorrectionRequest[]>([]);
  const [loadingCorrections, setLoadingCorrections] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  /* ======================================================
     PERMISSIONS (US15)
  ====================================================== */
  const [permissionDate, setPermissionDate] = useState("");
  const [permissionType, setPermissionType] =
    useState<TimeExceptionType>(TimeExceptionType.EARLY_LEAVE);
  const [minutesRequested, setMinutesRequested] = useState(30);
  const [permissionReason, setPermissionReason] = useState("");
  const [permissions, setPermissions] = useState<TimeException[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  /* ======================================================
     LOAD DATA
  ====================================================== */
  const loadCorrections = async () => {
    if (!employeeId) return;
    setLoadingCorrections(true);
    try {
      const data =
        await exceptionRequestService.getMyCorrectionRequests(
          String(employeeId),
        );
      setCorrections(data);
    } finally {
      setLoadingCorrections(false);
    }
  };

  const loadPermissions = async () => {
    if (!employeeId) return;
    setLoadingPermissions(true);
    try {
      const data = await exceptionRequestService.getMyPermissions();
      setPermissions(data);
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (!employeeId) return;
    loadCorrections();
    loadPermissions();
  }, [employeeId]);

  /* ======================================================
     SUBMIT HANDLERS
  ====================================================== */
  const submitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !correctionDate || !correctionReason) return;

    try {
      setCorrectionError(null);

      await exceptionRequestService.submitCorrectionRequestByDate({
        employeeId: String(employeeId),
        date: correctionDate,
        reason: correctionReason.trim(),
      });

      setCorrectionDate("");
      setCorrectionReason("");
      loadCorrections();
    } catch (err: any) {
      setCorrectionError(
        err?.response?.data?.message ||
          "Failed to submit correction request.",
      );
    }
  };

  const submitPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionDate || minutesRequested <= 0) return;

    try {
      setPermissionError(null);

      await exceptionRequestService.submitPermissionRequestByDate({
        date: permissionDate,
        type: permissionType,
        minutesRequested,
        reason: permissionReason || undefined,
      });

      setPermissionDate("");
      setMinutesRequested(30);
      setPermissionReason("");
      loadPermissions();
    } catch (err: any) {
      setPermissionError(
        err?.response?.data?.message ||
          "Permission requests require an existing attendance record.",
      );
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-white">
            My Attendance & Time
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Submit attendance corrections and permission requests, and track
            their status.
          </p>
        </header>

        {!employeeId && !isAuthLoading && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded-md px-3 py-2">
            Your account is not linked to an employee profile yet. Please contact
            HR.
          </p>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — FORMS */}
          <div className="space-y-6">
            {/* Attendance Correction */}
            <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 text-slate-200">
              <h2 className="text-lg font-semibold text-white">
                Attendance Correction
              </h2>

              <form onSubmit={submitCorrection} className="mt-4 space-y-4">
                <input
                  type="date"
                  value={correctionDate}
                  onChange={(e) => setCorrectionDate(e.target.value)}
                  className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />

                <textarea
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full min-h-[100px] rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />

                {correctionError && (
                  <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                    {correctionError}
                  </p>
                )}

                <button className="bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-md text-sm text-white">
                  Submit Correction
                </button>
              </form>
            </section>

            {/* Permission Request */}
            <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 text-slate-200">
              <h2 className="text-lg font-semibold text-white">
                Permission Request
              </h2>

              <form onSubmit={submitPermission} className="mt-4 space-y-4">
                <input
                  type="date"
                  value={permissionDate}
                  onChange={(e) => setPermissionDate(e.target.value)}
                  className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />

                <select
                  value={permissionType}
                  onChange={(e) =>
                    setPermissionType(e.target.value as TimeExceptionType)
                  }
                  className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                >
                  <option value={TimeExceptionType.EARLY_LEAVE}>
                    Early Leave
                  </option>
                  <option value={TimeExceptionType.SHORT_TIME}>
                    Short Time
                  </option>
                  <option value={TimeExceptionType.OVERTIME_REQUEST}>
                    Overtime
                  </option>
                </select>

                <input
                  type="number"
                  min={1}
                  value={minutesRequested}
                  onChange={(e) => setMinutesRequested(+e.target.value)}
                  className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />

                <textarea
                  value={permissionReason}
                  onChange={(e) => setPermissionReason(e.target.value)}
                  className="w-full min-h-[80px] rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />

                {permissionError && (
                  <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                    {permissionError}
                  </p>
                )}

                <button className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md text-sm text-white">
                  Submit Permission
                </button>
              </form>
            </section>
          </div>

          {/* RIGHT — LISTS */}
          <div className="space-y-6">
            {/* Corrections List */}
            <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white">
                My Correction Requests
              </h2>

              <div className="mt-3 space-y-3">
                {corrections.map((r) => (
                  <div
                    key={r._id}
                    className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm"
                  >
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${statusBadge(
                        r.status,
                      )}`}
                    >
                      {r.status}
                    </span>
                    {r.reason && (
                      <p className="mt-1 text-xs text-slate-300">
                        {r.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Permissions List */}
            <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white">
                My Permission Requests
              </h2>

              <div className="mt-3 space-y-3">
                {permissions.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="text-xs">{p.type}</span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${statusBadge(
                          p.status,
                        )}`}
                      >
                        {p.status}
                      </span>
                    </div>
                    {p.reason && (
                      <p className="mt-1 text-xs text-slate-300">
                        {p.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
