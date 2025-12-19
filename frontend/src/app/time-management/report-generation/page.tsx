"use client";

import { useState } from "react";
import { Download, FileText, AlertCircle, Calendar } from "lucide-react";
import { timeManagementReportsService } from "../services/report.service"; // ✅ fixed path

const formatDateInputValue = (date: Date) =>
  date.toISOString().split("T")[0];

export default function TimeManagementReportsPage() {
  // Default: last 30 days
  const today = new Date();
  const last30 = new Date();
  last30.setDate(today.getDate() - 30);

  const [start, setStart] = useState<string>(formatDateInputValue(last30));
  const [end, setEnd] = useState<string>(formatDateInputValue(today));
  const [employeeId, setEmployeeId] = useState<string>("");

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null,
  );

  const handleDownload = async (type: "overtime" | "exceptions") => {
    setIsDownloading(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      if (!start || !end) {
        throw new Error("Please select both start and end dates.");
      }

      const params = {
        start,
        end,
        employeeId: employeeId ? employeeId : undefined,
      };

      const blob =
        type === "overtime"
          ? await timeManagementReportsService.downloadOvertimeReportCsv(params)
          : await timeManagementReportsService.downloadExceptionReportCsv(
              params,
            );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        type === "overtime"
          ? `overtime-report-${start}-to-${end}.csv`
          : `exception-report-${start}-to-${end}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatusType("success");
      setStatusMessage(
        type === "overtime"
          ? "Overtime report downloaded successfully."
          : "Exception report downloaded successfully.",
      );
    } catch (err: any) {
      console.error(err);

      // Try to show backend message if it exists, otherwise fallback
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      setStatusType("error");
      setStatusMessage(
        backendMessage || "Failed to download the report. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">
              Time Management Reports
            </h1>
            <p className="text-sm text-slate-400">
              Download overtime and exception reports for payroll & compliance.
            </p>
          </div>
        </header>

        {/* Filters Card */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-50">
            <Calendar className="h-5 w-5 text-sky-400" />
            Filter by Period
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-300">
                Start Date
              </label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-300">
                End Date
              </label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Employee ID (optional) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-300">
                Employee ID (optional)
              </label>
              <input
                type="text"
                placeholder="Filter by employee (Mongo _id)"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </section>

        {/* Actions Card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-50">
            <FileText className="h-5 w-5 text-sky-400" />
            Download Reports
          </h2>

          <div className="flex flex-col gap-3 md:flex-row">
            <button
              onClick={() => handleDownload("overtime")}
              disabled={isDownloading}
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-sky-900/50 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Overtime CSV"}
            </button>

            <button
              onClick={() => handleDownload("exceptions")}
              disabled={isDownloading}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-900/50 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Exceptions CSV"}
            </button>
          </div>

          {/* Status message */}
          {statusMessage && (
            <div
              className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                statusType === "error"
                  ? "border-red-500/60 bg-red-950/40 text-red-200"
                  : "border-emerald-500/60 bg-emerald-950/40 text-emerald-200"
              }`}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Reports use attendance punches between the selected dates. Overtime
            is calculated as minutes worked beyond the assigned shift end time
            (only for records with approved shift assignments).
          </p>
        </section>
      </div>
    </div>
  );
}
