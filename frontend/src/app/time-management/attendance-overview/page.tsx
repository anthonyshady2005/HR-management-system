"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Clock,
  UserCheck,
  AlertCircle,
  XCircle,
  Calendar,
  Filter,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileText,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  ClipboardCheck,
} from "lucide-react";
const normalizeRole = (role?: string | null) => (role || "").trim().toLowerCase();
/* ✅ USE REAL SERVICE */
import { attendanceOverviewService as attendanceService } from "../services/attendance.service";

/* ✅ Exception / Correction services + models */
import { exceptionRequestService } from "../services/exception-request.service";
import { 
  AttendanceCorrectionRequest, 
  CorrectionRequestStatus,
  TimeException,
  TimeExceptionStatus,
  TimeExceptionType,
} from "../models";
type Capability =
    | "canApprove"
    | "canOverride"
    | "canAdjust"
    | "canRunOps"
    | "canViewEntitlements"
    | "canManageCatalog"
    | "canManagePolicies"
    | "canSeeAllRequests";

const ROLE_CAPABILITIES: Record<Capability, string[]> = {
    canApprove: ["department head", "HR Manager", "HR Admin", "System Admin"],
    canOverride: ["HR Admin", "HR Manager", "System Admin"],
    canAdjust: ["HR Manager", "HR Admin", "System Admin"],
    canRunOps: ["HR Admin", "System Admin"],
    canViewEntitlements: ["department head", "HR Manager", "HR Admin", "System Admin"],
    canManageCatalog: ["HR Manager", "HR Admin", "System Admin"],
    canManagePolicies: ["HR Admin", "System Admin"],
    canSeeAllRequests: ["HR Manager", "HR Admin", "System Admin"],
};
/* ✅ Auth (to get current logged-in user) */
import { useAuth } from "@/providers/auth-provider";

type ViewMode = "records" | "import" | "corrections" | "permissions";
type PunchType = "IN" | "OUT";

export default function AttendanceManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("records");

  /* ===================== AUTH: CURRENT EMPLOYEE / REVIEWER ID ===================== */

  const { user, currentRole } = useAuth();
  const normalizedRole = normalizeRole(currentRole);
    const can = (capability: Capability) =>
        ROLE_CAPABILITIES[capability].map(normalizeRole).includes(normalizedRole);

  const reviewerId = useMemo(() => {
    if (!user) {
      console.log(" No user found");
      return null;
    }

    const anyUser = user as any;
    console.log("👤 User object:", anyUser);

    const possibleId =
      anyUser._id ||
      anyUser.employeeProfileId ||
      anyUser.employeeId ||
      anyUser.id ||
      anyUser.userId ||
      null;

    console.log("🔍 Extracted reviewerId:", possibleId);
    return possibleId;
  }, [user]);

  /* ===================== STATE ===================== */

  const [refreshingDaily, setRefreshingDaily] = useState(false);
  const [refreshingRepeated, setRefreshingRepeated] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [processResult, setProcessResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employeeId: "",
  });
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 10;

  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editPunches, setEditPunches] = useState<{ type: PunchType; time: string }[]>([]);
  const [editReason, setEditReason] = useState("");

  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [loadingCorrections, setLoadingCorrections] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

  /* ===================== PERMISSIONS STATE (US15) ===================== */
  const [permissionRequests, setPermissionRequests] = useState<TimeException[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [expandedPermissions, setExpandedPermissions] = useState<Set<string>>(new Set());
  const [escalating, setEscalating] = useState(false);

  /* ===================== FINALIZE STATE (US9) ===================== */
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [finalizingAll, setFinalizingAll] = useState(false);

  /* ===================== FIX HELPERS (DATE + TIME) ===================== */

  const getRecordDay = (record: any): Date | null => {
    if (!record) return null;

    const firstPunchTime = record?.punches?.[0]?.time;
    if (firstPunchTime) {
      const d = new Date(firstPunchTime);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    if (record?.createdAt) {
      const d = new Date(record.createdAt);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    return null;
  };

  const toLocalYMD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const toLocalHM = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  /* ===================== HELPERS ===================== */

  const getAttendanceRecordLabel = (req: AttendanceCorrectionRequest): string => {
    const ar: any = (req as any).attendanceRecordId;
    if (!ar) return "-";
    if (typeof ar === "string") return ar;
    if (typeof ar === "object" && "_id" in ar) return String(ar._id);
    return String(ar);
  };

  const getAttendanceRecordDetails = (req: AttendanceCorrectionRequest | TimeException): any => {
    const ar: any = (req as any).attendanceRecordId;
    if (!ar || typeof ar === "string") return null;
    return ar;
  };

  const statusBadgeClass = (status: CorrectionRequestStatus | TimeExceptionStatus | string) => {
    const s = String(status);
    switch (s) {
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
      case TimeExceptionStatus.PENDING:
      case TimeExceptionStatus.OPEN:
      case CorrectionRequestStatus.SUBMITTED:
        return "bg-blue-500/10 text-blue-300 border-blue-600/40";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-600/40";
    }
  };

  const permissionTypeBadgeClass = (type: TimeExceptionType) => {
    switch (type) {
      case TimeExceptionType.LATE:
        return "bg-amber-500/10 text-amber-300";
      case TimeExceptionType.EARLY_LEAVE:
        return "bg-orange-500/10 text-orange-300";
      case TimeExceptionType.SHORT_TIME:
        return "bg-purple-500/10 text-purple-300";
      case TimeExceptionType.OVERTIME_REQUEST:
        return "bg-blue-500/10 text-blue-300";
      case TimeExceptionType.MISSED_PUNCH:
        return "bg-red-500/10 text-red-300";
      case TimeExceptionType.MANUAL_ADJUSTMENT:
        return "bg-slate-500/10 text-slate-300";
      default:
        return "bg-slate-500/10 text-slate-300";
    }
  };

  const isActionableStatus = (status: CorrectionRequestStatus | TimeExceptionStatus | string) => {
    const s = String(status);
    return [
      CorrectionRequestStatus.SUBMITTED,
      CorrectionRequestStatus.IN_REVIEW,
      CorrectionRequestStatus.ESCALATED,
      TimeExceptionStatus.PENDING,
      TimeExceptionStatus.OPEN,
      TimeExceptionStatus.ESCALATED,
    ].includes(s as any);
  };

  const toggleRequestExpansion = (requestId: string) => {
    setExpandedRequests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) newSet.delete(requestId);
      else newSet.add(requestId);
      return newSet;
    });
  };

  const togglePermissionExpansion = (permissionId: string) => {
    setExpandedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) newSet.delete(permissionId);
      else newSet.add(permissionId);
      return newSet;
    });
  };

  /* ===================== LOAD RECORDS ===================== */

  const loadRecords = async () => {
    setLoadingRecords(true);
    try {
      const [recordsRes, statsData] = await Promise.all([
        (attendanceService.getAttendanceRecords({
          ...filters,
          page,
          limit: PAGE_LIMIT,
        }) as any),
        attendanceService.getAttendanceStats(filters),
      ]);

      const data = (recordsRes as any)?.data ?? recordsRes;
      const metaTotalPages = (recordsRes as any)?.totalPages ?? 1;

      setRecords(Array.isArray(data) ? data : []);
      setTotalPages(metaTotalPages || 1);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (viewMode === "records") {
      loadRecords();
    }
  }, [viewMode, filters, page]);

  /* ===================== LOAD CORRECTION REQUESTS ===================== */

  const loadCorrectionRequests = async () => {
    setLoadingCorrections(true);
    setCorrectionError(null);
    try {
      const data = await exceptionRequestService.getPendingCorrectionRequests();
      setCorrectionRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load correction requests:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load correction requests.";
      setCorrectionError(message);
    } finally {
      setLoadingCorrections(false);
    }
  };

  useEffect(() => {
    if (viewMode === "corrections") {
      loadCorrectionRequests();
    }
  }, [viewMode]);

  /* ===================== LOAD PERMISSION REQUESTS (US15) ===================== */

  const loadPermissionRequests = async () => {
    setLoadingPermissions(true);
    setPermissionError(null);
    try {
      const data = await exceptionRequestService.getPendingPermissions();
      setPermissionRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load permission requests:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load permission requests.";
      setPermissionError(message);
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (viewMode === "permissions") {
      loadPermissionRequests();
    }
  }, [viewMode]);

  /* ===================== REVIEW CORRECTION REQUEST ===================== */

  const handleReviewCorrection = async (
    requestId: string,
    status: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED,
  ) => {
    if (!user) {
      alert("You must be logged in to review correction requests.");
      return;
    }

    if (!reviewerId) {
      console.error("❌ Failed to extract reviewerId from user:", user);
      alert(
        "Unable to determine your reviewer ID. Please check:\n\n" +
          "1. You are logged in as an employee\n" +
          "2. Your account has an associated employee profile\n" +
          "3. Contact your administrator if the issue persists"
      );
      return;
    }

    try {
      setReviewingId(requestId);
      console.log(`📝 Reviewing request ${requestId} as reviewer ${reviewerId}`);

      await exceptionRequestService.reviewCorrectionRequest(requestId, {
        reviewerId: String(reviewerId),
        status,
      });

      await loadCorrectionRequests();
      alert(`Correction request ${status.toLowerCase()} successfully!`);
    } catch (err: any) {
      console.error("Failed to review correction request:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update correction request. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setReviewingId(null);
    }
  };

  /* ===================== REVIEW PERMISSION REQUEST (US15) ===================== */

  const handleReviewPermission = async (
    permissionId: string,
    status: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED,
    comment?: string,
  ) => {
    if (!user) {
      alert("You must be logged in to review permission requests.");
      return;
    }

    try {
      setReviewingId(permissionId);
      console.log(`📝 Reviewing permission ${permissionId} with status ${status}`);

      await exceptionRequestService.reviewPermissionRequest(permissionId, {
        status,
        comment,
      });

      await loadPermissionRequests();
      alert(`Permission request ${status.toLowerCase()} successfully!`);
    } catch (err: any) {
      console.error("Failed to review permission request:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update permission request. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setReviewingId(null);
    }
  };

  /* ===================== AUTO-ESCALATE PERMISSIONS (US15) ===================== */

  const handleEscalatePermissions = async () => {
    if (!confirm("This will escalate all pending permissions older than 3 days. Continue?")) {
      return;
    }

    setEscalating(true);
    try {
      const result = await exceptionRequestService.autoEscalatePendingPermissions();
      alert(result.message || `${result.escalated} permission(s) escalated successfully!`);
      await loadPermissionRequests();
    } catch (err: any) {
      console.error("Failed to escalate permissions:", err);
      alert("Failed to escalate permissions. Please try again.");
    } finally {
      setEscalating(false);
    }
  };

  /* ===================== FINALIZE HANDLERS (US9) ===================== */

  const handleFinalizeSingle = async (recordId: string) => {
    if (!confirm("Finalize this record for payroll? This action cannot be undone.")) {
      return;
    }

    setFinalizingId(recordId);
    try {
      const result = await attendanceService.finalizeSingleRecord(recordId);
      alert(result.message);
      await loadRecords();
    } catch (err: any) {
      console.error("Failed to finalize record:", err);
      alert(err?.response?.data?.message || "Failed to finalize record. Please try again.");
    } finally {
      setFinalizingId(null);
    }
  };

  const handleFinalizeAllComplete = async () => {
    if (!confirm(
      "This will finalize ALL complete attendance records for payroll processing.\n\n" +
      "Records with missed punches will be skipped.\n" +
      "Continue?"
    )) {
      return;
    }

    setFinalizingAll(true);
    try {
      const result = await attendanceService.finalizeAllCompleteRecords({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      alert(result.message);
      await loadRecords();
    } catch (err: any) {
      console.error("Failed to finalize records:", err);
      alert("Failed to finalize records. Please try again.");
    } finally {
      setFinalizingAll(false);
    }
  };

  /* ===================== EDIT ATTENDANCE FROM REQUEST ===================== */

  const handleEditAttendanceFromRequest = (req: AttendanceCorrectionRequest) => {
    const recordDetails = getAttendanceRecordDetails(req);

    if (!recordDetails) {
      alert("Attendance record details not available for editing.");
      return;
    }

    const record = {
      _id: recordDetails._id,
      employeeId: (req as any).employeeId || recordDetails.employeeId,
      punches: recordDetails.punches || [],
      totalWorkMinutes: recordDetails.totalWorkMinutes || 0,
      hasMissedPunch: recordDetails.hasMissedPunch || false,
      createdAt: recordDetails.createdAt,
    };

    handleEditAttendance(record);
  };

  /* ===================== NOTIFICATION REFRESH ===================== */

  const refreshDailyLateness = async () => {
    setRefreshingDaily(true);
    setRefreshMessage(null);
    try {
      const res = await attendanceService.rebuildLatenessNotifications();
      setRefreshMessage(`Daily lateness notifications refreshed (${res.created} created).`);
    } catch (err) {
      console.error(err);
      setRefreshMessage("Failed to refresh daily lateness notifications.");
    } finally {
      setRefreshingDaily(false);
    }
  };

  const refreshRepeatedLateness = async () => {
    setRefreshingRepeated(true);
    setRefreshMessage(null);
    try {
      const res = await attendanceService.rebuildRepeatedLatenessNotifications();
      setRefreshMessage(`Repeated lateness notifications refreshed (${res.created} created).`);
    } catch (err) {
      console.error(err);
      setRefreshMessage("Failed to refresh repeated lateness notifications.");
    } finally {
      setRefreshingRepeated(false);
    }
  };

  /* ===================== EDIT HANDLER ===================== */

  const handleEditAttendance = (record: any) => {
    setSelectedRecord(record);

    const mappedPunches =
      Array.isArray(record.punches) && record.punches.length > 0
        ? record.punches.map((p: any) => {
            const d = new Date(p.time);
            return {
              type: p.type as PunchType,
              time: toLocalHM(d),
            };
          })
        : [];

    setEditPunches(mappedPunches);
    setEditReason("");
    setIsEditOpen(true);
  };

  const updatePunch = (index: number, field: "type" | "time", value: string) => {
    setEditPunches((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPunch = () => {
    setEditPunches((prev) => [...prev, { type: "OUT", time: "17:00" }]);
  };

  const removePunch = (index: number) => {
    setEditPunches((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    if (!editReason.trim()) {
      alert("Correction reason is required");
      return;
    }

    const recordDay = getRecordDay(selectedRecord);
    if (!recordDay) {
      alert("Cannot infer the attendance day for this record (no punches and no createdAt).");
      return;
    }

    const payload = {
      employee:
        selectedRecord.employeeId?.personalEmail ||
        selectedRecord.employeeId?.workEmail ||
        selectedRecord.employeeId,
      date: toLocalYMD(recordDay),
      newPunches: editPunches,
      reason: editReason,
    };

    try {
      await attendanceService.correctAttendanceManually(payload);
      await loadRecords();
      await loadCorrectionRequests();
      setIsEditOpen(false);
      alert("Attendance corrected successfully!");
    } catch (err) {
      console.error("Failed to save correction:", err);
      alert("Failed to save correction. Check backend logs.");
    }
  };

  /* ===================== EXCEL UPLOAD ===================== */

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadResult(null);
    setProcessResult(null);

    try {
      const result = await attendanceService.uploadExcelFile(file);
      setUploadResult(result);
      setShowPreview(true);
    } catch (err: any) {
      setError(err?.message || "Failed to upload Excel file");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessData = async () => {
    if (!uploadResult?.data) return;

    setLoading(true);
    setError(null);

    try {
      const result = await attendanceService.processExcelData(uploadResult.data);
      setProcessResult(result);

      if (result.successful > 0) {
        await loadRecords();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to process Excel data");
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    setProcessResult(null);
    setShowPreview(false);
    setError(null);
  };

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Attendance Management</h1>
            <p className="text-slate-400">
              Track employee attendance, import from Excel, and manage correction & permission requests.
            </p>
            {user && (
              <p className="text-xs text-slate-500 mt-2">
                Logged in as: {(user as any).email || (user as any).name || "User"}
                {reviewerId && ` (ID: ${reviewerId})`}
              </p>
            )}
          </div>

          <div className="flex flex-col items-stretch gap-3 md:items-end">
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg flex-wrap">
              <button
                onClick={() => setViewMode("records")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm ${
                  viewMode === "records"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="w-4 h-4" />
                Records
              </button>
              {can("canRunOps") ? (

              <button
                onClick={() => setViewMode("import")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm ${
                  viewMode === "import"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Upload className="w-4 h-4" />
                Excel Import
              </button>
         ) : null}
              <button
                onClick={() => setViewMode("corrections")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm ${
                  viewMode === "corrections"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                Corrections
              </button>
              <button
                onClick={() => setViewMode("permissions")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm ${
                  viewMode === "permissions"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                Permissions
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={refreshDailyLateness}
                disabled={refreshingDaily}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-blue-600 hover:bg-blue-700 text-white text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className={refreshingDaily ? "animate-spin" : ""} />
                {refreshingDaily ? "Refreshing..." : "Daily Lateness"}
              </button>

              <button
                onClick={refreshRepeatedLateness}
                disabled={refreshingRepeated}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-amber-600 hover:bg-amber-700 text-white text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle size={16} className={refreshingRepeated ? "animate-spin" : ""} />
                {refreshingRepeated ? "Refreshing..." : "Repeated Lateness"}
              </button>
            </div>
          </div>
        </div>

        {refreshMessage && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <span>{refreshMessage}</span>
          </div>
        )}

        {/* STATS */}
        {viewMode === "records" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Present Today", value: stats.presentToday, icon: UserCheck, color: "text-green-400" },
              { label: "Absent Today", value: stats.absentToday, icon: XCircle, color: "text-red-400" },
              { label: "Avg Hours", value: `${stats.averageHours?.toFixed(1) || 0}h`, icon: Clock, color: "text-blue-400" },
              { label: "Total Employees", value: stats.totalEmployees, icon: UserCheck, color: "text-purple-400" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                  <div>
                    <p className="text-slate-400 text-sm">{item.label}</p>
                    <p className="text-2xl font-bold text-white">{item.value || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RECORDS TABLE */}
        {viewMode === "records" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            {/* FINALIZE ALL BUTTON */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handleFinalizeAllComplete}
                disabled={finalizingAll || loadingRecords}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-green-600 hover:bg-green-700 text-white text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={16} className={finalizingAll ? "animate-spin" : ""} />
                {finalizingAll ? "Finalizing..." : "Finalize All Complete Records"}
              </button>
            </div>

            {/* FILTERS */}
            <div className="mb-6 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col">
                <label className="text-xs text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <button
                onClick={loadRecords}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm"
              >
                <Filter className="w-4 h-4" />
                Apply
              </button>
            </div>

            {loadingRecords ? (
              <div className="text-center text-slate-400 py-12">Loading records…</div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No attendance records found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-3 px-4 text-left">Employee</th>
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Punches</th>
                        <th className="py-3 px-4 text-left">Hours</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => {
                        const day = getRecordDay(r);
                        return (
                          <tr key={r._id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-3 px-4 text-white">
                              {r.employeeId.firstName} {r.employeeId.lastName}
                              <div className="text-xs text-slate-400">{r.employeeId.personalEmail}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {day ? day.toLocaleDateString() : "-"}
                            </td>
                            <td className="py-3 px-4">
                              {r.punches.map((p: any, i: number) => (
                                <div key={i} className="text-slate-400 text-xs">
                                  {p.type} – {new Date(p.time).toLocaleTimeString()}
                                </div>
                              ))}
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {(r.totalWorkMinutes / 60).toFixed(2)}h
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs ${
                                  r.hasMissedPunch
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-green-500/20 text-green-400"
                                }`}
                              >
                                {r.hasMissedPunch ? "Incomplete" : "Complete"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditAttendance(r)}
                                  className="px-3 py-1 text-xs rounded-md bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                >
                                  Edit
                                </button>
                                {!r.hasMissedPunch && (
                                  <button
                                    onClick={() => handleFinalizeSingle(r._id)}
                                    disabled={!!finalizingId}
                                    className="px-3 py-1 text-xs rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {finalizingId === r._id ? (
                                      <RefreshCw size={12} className="animate-spin" />
                                    ) : (
                                      <CheckCircle size={12} />
                                    )}
                                    Finalize
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CORRECTION REQUESTS */}
        {viewMode === "corrections" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  Correction Requests
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Review and manage employee correction requests
                </p>
              </div>
              <button
                onClick={loadCorrectionRequests}
                disabled={loadingCorrections}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-sm disabled:opacity-50"
              >
                <RefreshCw size={16} className={loadingCorrections ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {loadingCorrections ? (
              <div className="text-center text-slate-400 py-12">Loading...</div>
            ) : correctionError ? (
              <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                <AlertCircle className="w-4 h-4" />
                {correctionError}
              </div>
            ) : correctionRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-4 opacity-60" />
                No pending requests
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {correctionRequests.map((req) => {
                  const isExpanded = expandedRequests.has(String(req._id));
                  const recordDetails = getAttendanceRecordDetails(req);
                  const recordDay = recordDetails ? getRecordDay(recordDetails) : null;

                  return (
                    <div
                      key={req._id}
                      className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-slate-100 font-medium">
                              {(req as any).employeeId?.firstName} {(req as any).employeeId?.lastName}
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(
                                req.status,
                              )}`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {(req as any).employeeId?.personalEmail || (req as any).employeeId?.workEmail}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleRequestExpansion(String(req._id))}
                          className="text-slate-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>

                      {req.reason && (
                        <p className="mt-2 text-xs text-slate-300 italic">"{req.reason}"</p>
                      )}

                      {isExpanded && recordDetails && (
                        <div className="mt-3 p-3 bg-slate-800/50 rounded-md border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-slate-300">Attendance Record</h4>
                            <button
                              onClick={() => handleEditAttendanceFromRequest(req)}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit Record
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-slate-400">Date</p>
                              <p className="text-slate-200">
                                {recordDay ? recordDay.toLocaleDateString() : "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Total Hours</p>
                              <p className="text-slate-200">
                                {((recordDetails.totalWorkMinutes || 0) / 60).toFixed(2)}h
                              </p>
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-slate-400 text-xs mb-1">Punches</p>
                            <div className="space-y-1">
                              {recordDetails.punches && recordDetails.punches.length > 0 ? (
                                recordDetails.punches.map((punch: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs bg-slate-900/50 px-2 py-1 rounded"
                                  >
                                    <span className="text-slate-300">{punch.type}</span>
                                    <span className="text-slate-400">
                                      {new Date(punch.time).toLocaleTimeString()}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-slate-500 text-xs">No punches recorded</p>
                              )}
                            </div>
                          </div>

                          {recordDetails.hasMissedPunch && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                              <AlertCircle className="w-3 h-3" />
                              <span>Missing punch detected</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Submitted: {req.createdAt ? new Date(req.createdAt as any).toLocaleString() : "-"}
                        </span>
                      </div>

                      {isActionableStatus(req.status) && (
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReviewCorrection(String(req._id), CorrectionRequestStatus.REJECTED)}
                            disabled={!!reviewingId}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs
                                     bg-red-500/10 text-red-300 border border-red-500/40
                                     hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleReviewCorrection(String(req._id), CorrectionRequestStatus.APPROVED)}
                            disabled={!!reviewingId}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs
                                     bg-emerald-500/10 text-emerald-300 border border-emerald-500/40
                                     hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PERMISSION REQUESTS (US15) */}
        {viewMode === "permissions" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-purple-400" />
                  Permission Requests
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Review and manage employee permission requests (late, early leave, overtime, etc.)
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEscalatePermissions}
                  disabled={escalating}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm disabled:opacity-50"
                >
                  <AlertTriangle size={16} className={escalating ? "animate-spin" : ""} />
                  {escalating ? "Escalating..." : "Auto-Escalate"}
                </button>
                <button
                  onClick={loadPermissionRequests}
                  disabled={loadingPermissions}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-sm disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loadingPermissions ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>

            {loadingPermissions ? (
              <div className="text-center text-slate-400 py-12">Loading...</div>
            ) : permissionError ? (
              <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                <AlertCircle className="w-4 h-4" />
                {permissionError}
              </div>
            ) : permissionRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ClipboardCheck className="w-10 h-10 mx-auto mb-4 opacity-60" />
                No pending permission requests
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {permissionRequests.map((perm) => {
                  const isExpanded = expandedPermissions.has(String(perm._id));
                  const recordDetails = getAttendanceRecordDetails(perm);
                  const recordDay = recordDetails ? getRecordDay(recordDetails) : null;

                  return (
                    <div
                      key={perm._id}
                      className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-slate-100 font-medium">
                              {(perm as any).employeeId?.firstName} {(perm as any).employeeId?.lastName}
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(
                                perm.status,
                              )}`}
                            >
                              {perm.status}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${permissionTypeBadgeClass(
                                perm.type,
                              )}`}
                            >
                              {perm.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                              {(perm as any).employeeId?.personalEmail || (perm as any).employeeId?.workEmail}
                          </p>
                          <p className="text-xs text-slate-300 mt-1">
                            Requested: <span className="font-medium">{(perm as any).minutesRequested || 0} minutes</span> ({(((perm as any).minutesRequested || 0) / 60).toFixed(2)}h)
                          </p>
                        </div>

                        <button
                          onClick={() => togglePermissionExpansion(String(perm._id))}
                          className="text-slate-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>

                      {perm.reason && (
                        <p className="mt-2 text-xs text-slate-300 italic">"{perm.reason}"</p>
                      )}

                      {isExpanded && recordDetails && (
                        <div className="mt-3 p-3 bg-slate-800/50 rounded-md border border-slate-700">
                          <h4 className="text-xs font-semibold text-slate-300 mb-2">Attendance Record</h4>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-slate-400">Date</p>
                              <p className="text-slate-200">
                                {recordDay ? recordDay.toLocaleDateString() : "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Total Hours</p>
                              <p className="text-slate-200">
                                {((recordDetails.totalWorkMinutes || 0) / 60).toFixed(2)}h
                              </p>
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-slate-400 text-xs mb-1">Punches</p>
                            <div className="space-y-1">
                              {recordDetails.punches && recordDetails.punches.length > 0 ? (
                                recordDetails.punches.map((punch: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs bg-slate-900/50 px-2 py-1 rounded"
                                  >
                                    <span className="text-slate-300">{punch.type}</span>
                                    <span className="text-slate-400">
                                      {new Date(punch.time).toLocaleTimeString()}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-slate-500 text-xs">No punches recorded</p>
                              )}
                            </div>
                          </div>

                          {recordDetails.hasMissedPunch && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                              <AlertCircle className="w-3 h-3" />
                              <span>Missing punch detected</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Submitted: {perm.createdAt ? new Date(perm.createdAt as any).toLocaleString() : "-"}
                        </span>
                      </div>

                      {isActionableStatus(perm.status) && (
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReviewPermission(String(perm._id), TimeExceptionStatus.REJECTED)}
                            disabled={!!reviewingId}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs
                                     bg-red-500/10 text-red-300 border border-red-500/40
                                     hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleReviewPermission(String(perm._id), TimeExceptionStatus.APPROVED)}
                            disabled={!!reviewingId}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs
                                     bg-emerald-500/10 text-emerald-300 border border-emerald-500/40
                                     hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* EXCEL IMPORT */}
        {viewMode === "import" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            {!showPreview ? (
              <>
                <p className="text-slate-300 mb-4 text-sm">
                  Upload an Excel file with columns:
                  <span className="font-mono ml-1">
                    Employee Email, Date (YYYY-MM-DD), Time (HH:mm), Type (IN/OUT)
                  </span>
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-slate-300"
                />
                {error && (
                  <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <button
                  onClick={handleFileUpload}
                  disabled={loading}
                  className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {loading ? "Uploading…" : "Preview Data"}
                </button>
              </>
            ) : (
              <>
                <p className="text-slate-300 mb-2 text-sm">
                  Valid rows: {uploadResult.validRows} / {uploadResult.totalRows}
                </p>
                {processResult && (
                  <p className="text-slate-400 text-sm mb-2">
                    Successfully processed: {processResult.successful} / {processResult.totalProcessed}
                  </p>
                )}
                <button
                  onClick={handleProcessData}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {loading ? "Processing…" : "Process Valid Rows"}
                </button>
                <button onClick={resetUpload} className="mt-4 text-slate-400 underline text-sm">
                  Upload another file
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* EDIT SIDE PANEL */}
      {isEditOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-white font-semibold">Edit Attendance</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-slate-400 text-sm">Employee</p>
              <p className="text-white">
                {selectedRecord.employeeId.firstName} {selectedRecord.employeeId.lastName}
              </p>
              <p className="text-xs text-slate-500">{selectedRecord.employeeId.personalEmail}</p>
            </div>

            <div className="mb-4">
              <p className="text-slate-400 text-sm">Date</p>
              <p className="text-white">
                {getRecordDay(selectedRecord)?.toLocaleDateString() ?? "-"}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">Punches</p>
              {editPunches.map((p, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <select
                    value={p.type}
                    onChange={(e) => updatePunch(i, "type", e.target.value)}
                    className="bg-slate-800 text-white px-2 py-1 rounded text-sm"
                  >
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                  </select>
                  <input
                    type="time"
                    value={p.time}
                    onChange={(e) => updatePunch(i, "time", e.target.value)}
                    className="bg-slate-800 text-white px-2 py-1 rounded text-sm"
                  />
                  <button onClick={() => removePunch(i)} className="text-red-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={addPunch} className="flex items-center gap-2 text-blue-400 text-sm mt-2">
                <Plus size={16} /> Add Punch
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-1">Correction Reason *</p>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
                rows={3}
                placeholder="Why are you correcting this attendance?"
              />
            </div>

            <button
              onClick={handleSaveEdit}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Save Correction
            </button>

            <button
              onClick={() => setIsEditOpen(false)}
              className="mt-3 w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}