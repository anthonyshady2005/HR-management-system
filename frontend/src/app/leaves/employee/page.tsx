"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  Edit2,
  Shield,
  Users,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/auth-provider";
import { useRequireRole } from "@/hooks/use-require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LeaveEntitlement,
  LeaveRequest,
  LeaveType,
  NetDaysResponse,
  fetchEntitlementsByEmployee,
  fetchEmployeeRequests,
  fetchLeaveTypes,
  submitLeaveRequest,
  cancelLeaveRequest,
  calculateNetDays,
  validateBalance,
  validateDocuments,
  validateOverlap,
  fetchPolicyByLeaveType,
  uploadAttachments,
  getAttachmentDownloadUrl,
  fetchNotifications,
  NotificationLog,
  updateLeaveRequest,
  fetchMyRequestById,
  AuditTrailEntry,
  fetchEmployeeAuditTrail,
} from "@/app/leaves/services/leaves";

const ALLOWED_ROLES = ["department employee"];

type RequestCounts = {
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  totalThisMonth: number;
};

export default function EmployeeLeavesPage() {
  const { status, user, currentRole } = useAuth();
  const router = useRouter();

  useRequireRole(ALLOWED_ROLES, "/");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
  const [entitlementDetails, setEntitlementDetails] = useState<LeaveEntitlement | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [policyNote, setPolicyNote] = useState<string | null>(null);
  const [netDays, setNetDays] = useState<NetDaysResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFromDate, setAuditFromDate] = useState("");
  const [auditToDate, setAuditToDate] = useState("");
  const [auditTypeFilter, setAuditTypeFilter] = useState("all");

  const [form, setForm] = useState({
    leaveTypeId: "",
    from: "",
    to: "",
    justification: "",
    attachmentId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    from: "",
    to: "",
    justification: "",
    attachmentId: "",
  });
  const [editNetDays, setEditNetDays] = useState<NetDaysResponse | null>(null);
  const [editCalculating, setEditCalculating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [filters, setFilters] = useState({
    leaveTypeId: "all",
    status: "all",
    startDate: "",
    endDate: "",
    sortBy: "createdAt" as "dates.from" | "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    paid: "all" as "all" | "paid" | "unpaid",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  const normalizeLeaveType = (lt: any): LeaveType => ({
    ...(lt || {}),
    id: lt?.id?.toString?.() || lt?._id?.toString?.() || lt?.id || lt?._id,
  });

  const normalizeEntitlement = (ent: any): LeaveEntitlement => {
    const leaveTypeIdRaw =
      ent?.leaveTypeId ||
      ent?.leaveType?._id ||
      ent?.leaveType?.id ||
      ent?.leaveType ||
      undefined;
    const leaveTypeId =
      (leaveTypeIdRaw as any)?.toString?.() ||
      (typeof leaveTypeIdRaw === "string" ? leaveTypeIdRaw : undefined);
    const employeeIdRaw =
      ent?.employeeId?._id || ent?.employeeId?.id || ent?.employeeId || undefined;
    return {
      ...(ent || {}),
      id: ent?.id?.toString?.() || ent?._id?.toString?.() || ent?.id || ent?._id,
      leaveType: ent?.leaveType || ent?.leaveTypeId,
      leaveTypeId,
      employeeId:
        (employeeIdRaw as any)?.toString?.() ||
        (typeof employeeIdRaw === "string" ? employeeIdRaw : undefined),
    };
  };

  const normalizeRequest = (req: any): LeaveRequest => {
    const leaveTypeIdRaw =
      req?.leaveTypeId ||
      req?.leaveType?._id ||
      req?.leaveType?.id ||
      req?.leaveType ||
      undefined;
    const leaveTypeId =
      (leaveTypeIdRaw as any)?.toString?.() ||
      (typeof leaveTypeIdRaw === "string" ? leaveTypeIdRaw : undefined);
    const employeeIdRaw =
      req?.employeeId?._id || req?.employeeId?.id || req?.employeeId || undefined;
    const attachmentRaw = req?.attachmentId;
    const attachmentField = req?.attachment;

    return {
      ...(req || {}),
      id: req?.id?.toString?.() || req?._id?.toString?.() || req?.id || req?._id,
      leaveType: req?.leaveType || req?.leaveTypeId,
      leaveTypeId,
      employeeId:
        (employeeIdRaw as any)?.toString?.() ||
        (typeof employeeIdRaw === "string" ? employeeIdRaw : undefined),
      attachmentId: attachmentRaw,
      attachment: attachmentField,
    };
  };

  const getLeaveTypeLabel = (lt: any) => {
    if (!lt) return "Leave type";
    const name = lt?.name || "Leave type";
    const code = lt?.code ? ` (${lt.code})` : "";
    return `${name}${code}`;
  };

  const getCategoryName = (lt: any) => {
    const category = lt?.category || lt?.categoryId;
    if (!category) return "—";
    if (typeof category === "string") return category;
    return category?.name || category?.code || "—";
  };

  const formatDateLabel = (value?: string | Date) => {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  };

  const loadData = async (overrideFilters?: Partial<typeof filters>) => {
    if (!user?.id) return;
    setError(null);
    setRefreshing(true);
    const appliedFilters = { ...filters, ...(overrideFilters || {}) };
    try {
      const [types, ents, reqsAll] = await Promise.all([
        fetchLeaveTypes(),
        fetchEntitlementsByEmployee(user.id),
        fetchEmployeeRequests({
          leaveTypeId:
            appliedFilters.leaveTypeId && appliedFilters.leaveTypeId !== "all"
              ? appliedFilters.leaveTypeId
              : undefined,
          status:
            appliedFilters.status && appliedFilters.status !== "all"
              ? appliedFilters.status
              : undefined,
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined,
          sortBy: appliedFilters.sortBy,
          sortOrder: appliedFilters.sortOrder,
          paid:
            appliedFilters.paid === "paid"
              ? true
              : appliedFilters.paid === "unpaid"
                ? false
                : undefined,
        }),
      ]);

      const reqs: any[] = reqsAll || [];
      const normalizedTypes = types.map(normalizeLeaveType);
      const typeMap = normalizedTypes.reduce(
        (acc: Record<string, LeaveType>, t: LeaveType) => {
          const key = t.id?.toString?.() || t.id;
          if (key) acc[key] = t;
          return acc;
        },
        {} as Record<string, LeaveType>,
      );

      const normalizedEnts = ents
        .map((e: any) => normalizeEntitlement(e))
        .map((ent: LeaveEntitlement) => {
          const ltId = (ent as any).leaveTypeId?.toString?.() || (ent as any).leaveTypeId;
          return ltId && typeMap[ltId]
            ? { ...ent, leaveType: typeMap[ltId] }
            : ent;
        });

      const normalizedReqs = reqs
        .map((r: any) => normalizeRequest(r))
        .map((req: LeaveRequest) => {
          const ltId = (req as any).leaveTypeId?.toString?.() || (req as any).leaveTypeId;
          return ltId && typeMap[ltId]
            ? { ...req, leaveType: typeMap[ltId] }
            : req;
        });

      setLeaveTypes(normalizedTypes);
      setEntitlements(normalizedEnts);
      setRequests(normalizedReqs);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load leave data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAndSelectRequest = async (req: LeaveRequest) => {
    setSelectedRequest(req);
    return req;
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    setNotificationsLoading(true);
    try {
      const data = await fetchNotifications(user.id);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const loadAuditTrail = async () => {
    if (!user?.id) return;
    setAuditLoading(true);
    setError(null);
    try {
      const data = await fetchEmployeeAuditTrail(user.id);
      setAuditTrail(data || []);
    } catch (err: any) {
      setAuditTrail([]);
      setError(err?.response?.data?.message || "Failed to load audit trail.");
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && user?.id) {
      void loadData();
      void loadNotifications();
      void loadAuditTrail();
    }
  }, [status, user?.id]);

  useEffect(() => {
    const shouldCalculate = form.leaveTypeId && form.from && form.to && user?.id;
    if (!shouldCalculate) {
      setNetDays(null);
      setPolicyNote(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setCalculating(true);
      try {
        const [net, policy] = await Promise.all([
          calculateNetDays(user!.id, form.from, form.to),
          fetchPolicyByLeaveType(form.leaveTypeId),
        ]);
        if (!cancelled) {
          setNetDays(net);
          if (policy) {
            const max = policy.maxConsecutiveDays
              ? `Max consecutive days: ${policy.maxConsecutiveDays}. `
              : "";
            setPolicyNote(
              `${max}Min notice: ${policy.minNoticeDays} day(s). Accrual: ${policy.accrualMethod}.`,
            );
          } else {
            setPolicyNote(null);
          }
        }
      } catch {
        if (!cancelled) {
          setNetDays(null);
          setPolicyNote(null);
        }
      } finally {
        if (!cancelled) {
          setCalculating(false);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [form.leaveTypeId, form.from, form.to, user?.id]);

  useEffect(() => {
    if (!editingRequest) {
      setEditNetDays(null);
      return;
    }
    const shouldCalculate = editForm.from && editForm.to && user?.id;
    if (!shouldCalculate) {
      setEditNetDays(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setEditCalculating(true);
      try {
        const net = await calculateNetDays(user!.id, editForm.from, editForm.to);
        if (!cancelled) {
          setEditNetDays(net);
        }
      } catch {
        if (!cancelled) {
          setEditNetDays(null);
        }
      } finally {
        if (!cancelled) {
          setEditCalculating(false);
        }
      }
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [editForm.from, editForm.to, user?.id, editingRequest]);

  const stats: RequestCounts = useMemo(() => {
    const base: RequestCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      totalThisMonth: 0,
    };
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    for (const req of requests) {
      base[req.status] = (base as any)[req.status] + 1;
      const created = new Date(req.createdAt);
      if (
        created.getMonth() === currentMonth &&
        created.getFullYear() === currentYear
      ) {
        base.totalThisMonth += 1;
      }
    }
    return base;
  }, [requests]);
  const filteredAuditTrail = useMemo(() => {
    if (!auditTrail.length) return [];
    const typeFilter = (auditTypeFilter || "all").toLowerCase();
    const from = auditFromDate ? new Date(auditFromDate) : null;
    const to = auditToDate ? new Date(auditToDate) : null;
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);

    return auditTrail.filter((entry) => {
      const entryType = (entry.adjustmentType || "").toString().toLowerCase();
      if (typeFilter !== "all" && entryType !== typeFilter) return false;
      if (!from && !to) return true;
      if (!entry.createdAt) return false;
      const createdAt = new Date(entry.createdAt);
      if (Number.isNaN(createdAt.getTime())) return false;
      if (from && createdAt < from) return false;
      if (to && createdAt > to) return false;
      return true;
    });
  }, [auditTrail, auditTypeFilter, auditFromDate, auditToDate]);
  const filteredAuditAmountTotal = useMemo(() => {
    if (!filteredAuditTrail.length) return 0;
    return filteredAuditTrail.reduce((sum, entry) => {
      const amount = typeof entry.amount === "number" ? entry.amount : Number(entry.amount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [filteredAuditTrail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setFormError(null);
    setFormSuccess(null);
    const days =
      netDays?.netDays ||
      Math.max(
        0,
        Math.round(
          (new Date(form.to).getTime() - new Date(form.from).getTime()) /
            (1000 * 60 * 60 * 24) +
            1,
        ),
      );
    if (!form.leaveTypeId || !form.from || !form.to || days <= 0) {
      setFormError("Fill all fields and pick a valid date range.");
      return;
    }
    setSubmitting(true);
    try {
      const attachmentId = form.attachmentId;
      const leaveTypeId = typeof form.leaveTypeId === 'string'
        ? form.leaveTypeId
        : (form.leaveTypeId as any)?.id || (form.leaveTypeId as any)?._id || String(form.leaveTypeId);

      await validateBalance(user.id, leaveTypeId, days);
      await validateOverlap(user.id, form.from, form.to);
      await validateDocuments(leaveTypeId, days, Boolean(attachmentId));

      await submitLeaveRequest({
        employeeId: user.id,
        leaveTypeId: leaveTypeId,
        from: form.from,
        to: form.to,
        durationDays: days,
        justification: form.justification || undefined,
        attachmentId: attachmentId || undefined,
      });
      setFormSuccess("Leave request submitted.");
      setForm({
        leaveTypeId: "",
        from: "",
        to: "",
        justification: "",
        attachmentId: "",
      });
      setNetDays(null);
      await loadData();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || "Request failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = async (req: LeaveRequest) => {
    const hydrated = await fetchAndSelectRequest(req);
    setEditingRequest(hydrated);
    setEditError(null);
    setEditSuccess(null);
    setEditNetDays(null);
    const from = new Date(hydrated.dates.from);
    const to = new Date(hydrated.dates.to);
    const toInput = (d: Date) =>
      Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];

    let attachmentId = "";
    if (hydrated.attachmentId) {
      if (typeof hydrated.attachmentId === "object" && ((hydrated.attachmentId as any)._id || (hydrated.attachmentId as any).id)) {
        attachmentId = ((hydrated.attachmentId as any)._id || (hydrated.attachmentId as any).id).toString();
      } else if (typeof hydrated.attachmentId === "string") {
        attachmentId = hydrated.attachmentId;
      }
    }

    setEditForm({
      from: toInput(from),
      to: toInput(to),
      justification: req.justification || "",
      attachmentId: attachmentId,
    });
    setEditing(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingRequest) return;
    setEditError(null);
    setEditSuccess(null);
    const days =
      editNetDays?.netDays ||
      Math.max(
        0,
        Math.round(
          (new Date(editForm.to).getTime() - new Date(editForm.from).getTime()) /
            (1000 * 60 * 60 * 24) +
            1,
        ),
      );
    if (!editForm.from || !editForm.to || days <= 0) {
      setEditError("Fill all fields and pick a valid date range.");
      return;
    }

    let leaveTypeId: string;
    const rawLeaveTypeId = (editingRequest as any).leaveTypeId;
    const rawLeaveType = (editingRequest as any).leaveType;

    if (typeof rawLeaveTypeId === 'string') {
      leaveTypeId = rawLeaveTypeId;
    } else if (rawLeaveTypeId && typeof rawLeaveTypeId === 'object') {
      leaveTypeId = rawLeaveTypeId._id?.toString() || rawLeaveTypeId.id?.toString() || '';
    } else if (rawLeaveType && typeof rawLeaveType === 'object') {
      leaveTypeId = rawLeaveType._id?.toString() || rawLeaveType.id?.toString() || '';
    } else {
      leaveTypeId = String(rawLeaveTypeId || '');
    }

    if (!leaveTypeId) {
      setEditError("Unable to determine leave type for this request.");
      return;
    }

    try {
      const attachmentId = editForm.attachmentId;
      await validateBalance(user.id, leaveTypeId, days);
      await validateOverlap(user.id, editForm.from, editForm.to, editingRequest.id);
      await validateDocuments(leaveTypeId, days, Boolean(attachmentId));

      await updateLeaveRequest(editingRequest.id, {
        from: editForm.from,
        to: editForm.to,
        durationDays: days,
        justification: editForm.justification || undefined,
        attachmentId: attachmentId || undefined,
      });

      const refreshedRaw = await fetchMyRequestById(editingRequest.id);
      const refreshed = normalizeRequest(refreshedRaw);
      setEditSuccess("Leave request updated.");
      setEditing(false);
      setEditingRequest(null);
      setSelectedRequest(refreshed);
      await loadData();
    } catch (err: any) {
      setEditError(
        err?.response?.data?.message ||
          "Failed to update request. Please try again.",
      );
    }
  };

  const handleCancelClick = (requestId: string) => {
    setRequestToCancel(requestId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!requestToCancel) return;
    try {
      await cancelLeaveRequest(requestToCancel);
      setCancelDialogOpen(false);
      setRequestToCancel(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to cancel request.");
      setCancelDialogOpen(false);
      setRequestToCancel(null);
    }
  };

  if (status !== "authenticated" || !user || !currentRole) {
    return null;
  }

  const activeEntitlement = entitlements.find((ent) => {
    const ltId = (ent.leaveType as any)?.id || (ent.leaveType as any)?._id;
    return ltId === form.leaveTypeId;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">My Leaves</h1>
            <p className="text-slate-400 text-sm">
              Active role: {currentRole} - Employee ID: {user.id}
            </p>
          </div>
          <div className="ml-auto">
            <Button
              variant="secondary"
              onClick={() => loadData()}
              disabled={refreshing}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
            >
              {refreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your leave data...
          </div>
        ) : error ? (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-200 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Pending Requests",
                  value: stats.pending,
                  icon: Clock,
                  color: "from-amber-500 to-orange-500",
                },
                {
                  label: "Approved",
                  value: stats.approved,
                  icon: CheckCircle,
                  color: "from-emerald-500 to-green-500",
                },
                {
                  label: "Rejected",
                  value: stats.rejected,
                  icon: Shield,
                  color: "from-rose-500 to-red-500",
                },
                {
                  label: "Total This Month",
                  value: stats.totalThisMonth,
                  icon: Calendar,
                  color: "from-blue-500 to-cyan-500",
                },
              ].map((stat) => (
                <Card key={stat.label} className="bg-white/5 border-white/10 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                      >
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-semibold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* My Requests Table with Filters */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  My Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters & Sort */}
                <div className="pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <Label className="text-slate-300">Filter & Sort</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500"
                        onClick={() => void loadData()}
                      >
                        Apply
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="bg-white/10 border-white/20"
                        onClick={() => {
                            const reset = {
                              leaveTypeId: "all",
                              status: "all",
                              startDate: "",
                              endDate: "",
                              sortBy: "createdAt" as "createdAt",
                              sortOrder: "desc" as "desc",
                              paid: "all" as "all" | "paid" | "unpaid",
                            };
                          setFilters(reset as typeof filters);
                          void loadData(reset as Partial<typeof filters>);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-400 text-xs">Leave Type</Label>
                      <Select
                        value={filters.leaveTypeId}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, leaveTypeId: value }))}
                      >
                        <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white text-sm">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-white/10">
                          <SelectItem value="all">All types</SelectItem>
                          {leaveTypes.map((lt) => {
                            const id = (lt as any).id || (lt as any)._id;
                            if (!id) return null;
                            return (
                              <SelectItem key={id} value={id}>
                                {lt.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-400 text-xs">Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white text-sm">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-white/10">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-400 text-xs">Paid status</Label>
                      <Select
                        value={filters.paid}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, paid: value as typeof filters.paid }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white text-sm">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-white/10">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-400 text-xs">Date Range</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          placeholder="From"
                          value={filters.startDate}
                          onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                          className="h-9 bg-white/5 border-white/10 text-white text-sm"
                        />
                        <Input
                          type="date"
                          placeholder="To"
                          value={filters.endDate}
                          onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                          className="h-9 bg-white/5 border-white/10 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-400 text-xs">Sort By</Label>
                      <Select
                        value={`${filters.sortBy}:${filters.sortOrder}`}
                        onValueChange={(value) => {
                          const [sortBy, sortOrder] = value.split(":") as ["dates.from" | "createdAt", "asc" | "desc"];
                          setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
                        }}
                      >
                        <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white text-sm">
                          <SelectValue placeholder="Newest first" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-white/10">
                          <SelectItem value="createdAt:desc">Created: Newest</SelectItem>
                          <SelectItem value="createdAt:asc">Created: Oldest</SelectItem>
                          <SelectItem value="dates.from:desc">Start date: Latest</SelectItem>
                          <SelectItem value="dates.from:asc">Start date: Earliest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {requests.length === 0 ? (
                  <p className="text-sm text-slate-400">No requests yet.</p>
                ) : (
                  <Table className="text-white">
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Dates</TableHead>
                        <TableHead className="text-slate-300">Duration</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req, idx) => {
                        const requestId = (req as any).id || (req as any)._id || `req-${idx}`;
                        const isExpanded = expandedRequestId === requestId;
                        return (
                          <React.Fragment key={requestId}>
                            <TableRow
                              className="border-white/5 hover:bg-white/5"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{req.leaveType?.name || "-"}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-slate-400 hover:text-slate-300 hover:bg-white/5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedRequestId(isExpanded ? null : requestId);
                                      if (!isExpanded) {
                                        void fetchAndSelectRequest(req);
                                      }
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-3 h-3" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3" />
                                    )}
                                    <span className="text-xs ml-1">Details</span>
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(req.dates.from)} - {formatDate(req.dates.to)}
                              </TableCell>
                              <TableCell>{req.durationDays} day(s)</TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    req.status === "approved"
                                      ? "bg-emerald-500/20 text-emerald-100"
                                      : req.status === "rejected"
                                        ? "bg-rose-500/20 text-rose-100"
                                        : req.status === "cancelled"
                                          ? "bg-slate-500/30 text-slate-200"
                                          : "bg-amber-500/20 text-amber-100"
                                  }
                                >
                                  {req.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="space-x-2">
                                {req.status === "pending" ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-blue-200 hover:text-blue-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void startEdit(req);
                                      }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-amber-200 hover:text-amber-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelClick(requestId);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            </TableRow>
                            {isExpanded && selectedRequest && (selectedRequest as any).id === requestId && (
                              <TableRow key={`${requestId}-details`} className="border-white/5">
                                <TableCell colSpan={5} className="bg-white/5">
                                  <div className="p-4 space-y-3 text-sm text-slate-200">
                                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                      <span className="font-semibold text-white">
                                        {selectedRequest.leaveType?.name || "Leave request"}
                                      </span>
                                      <Badge variant="secondary" className={
                                        selectedRequest.status === "approved"
                                          ? "bg-emerald-500/20 text-emerald-100"
                                          : selectedRequest.status === "rejected"
                                            ? "bg-rose-500/20 text-rose-100"
                                            : selectedRequest.status === "cancelled"
                                              ? "bg-slate-500/30 text-slate-200"
                                              : "bg-amber-500/20 text-amber-100"
                                      }>
                                        {selectedRequest.status}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-slate-400 mb-1">Dates</p>
                                        <p className="text-white">
                                          {formatDate(selectedRequest.dates.from)} - {formatDate(selectedRequest.dates.to)}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-1">
                                          Duration: {selectedRequest.durationDays} day(s)
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400 mb-1">Timestamps</p>
                                        <p className="text-white text-xs">
                                          Created: {selectedRequest.createdAt
                                            ? new Date(selectedRequest.createdAt).toLocaleString()
                                            : "N/A"}
                                        </p>
                                        <p className="text-white text-xs">
                                          Updated: {selectedRequest.updatedAt
                                            ? new Date(selectedRequest.updatedAt).toLocaleString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                    {selectedRequest.justification && (
                                      <div>
                                        <p className="text-slate-400 mb-1">Justification</p>
                                        <p className="text-white">{selectedRequest.justification}</p>
                                      </div>
                                    )}
                                    {(() => {
                                      const attachmentObj = (selectedRequest as any).attachment || (selectedRequest as any).attachmentId;
                                      if (attachmentObj && typeof attachmentObj === "object" && (attachmentObj._id || attachmentObj.id)) {
                                        const attachmentId = (attachmentObj._id || attachmentObj.id).toString();
                                        const attachmentName = attachmentObj.originalName || attachmentObj.name || "Download Attachment";
                                        return (
                                          <div>
                                            <p className="text-slate-400 mb-1">Attachment</p>
                                            <a
                                              href={getAttachmentDownloadUrl(attachmentId)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:underline text-sm"
                                            >
                                              {attachmentName}
                                            </a>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* New Request & Entitlements - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Leave Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Leave Type</Label>
                      <Select
                        value={form.leaveTypeId}
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, leaveTypeId: value }))
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Choose a leave type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-white/10">
                          {leaveTypes.map((type, idx) => {
                            const value = (type as any).id || (type as any)._id;
                            if (!value) return null;
                            const key = value || `type-${idx}`;
                            return (
                              <SelectItem key={key} value={value}>
                                {type.name} ({type.code})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {policyNote ? (
                        <p className="text-xs text-slate-400">{policyNote}</p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>From</Label>
                        <Input
                          type="date"
                          value={form.from}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, from: e.target.value }))
                          }
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>To</Label>
                        <Input
                          type="date"
                          value={form.to}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, to: e.target.value }))
                          }
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Justification (Optional)</Label>
                      <Textarea
                        value={form.justification}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, justification: e.target.value }))
                        }
                        className="bg-white/5 border-white/10 text-white"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Attachment (Optional)</Label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.zip"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const uploaded = await uploadAttachments([file]);
                            if (uploaded && uploaded.length > 0) {
                              setForm((prev) => ({ ...prev, attachmentId: uploaded[0].id }));
                              setFormSuccess(`File uploaded: ${file.name}`);
                            }
                          } catch (err) {
                            setFormError('Upload failed');
                          }
                        }}
                        className="block w-full text-sm text-slate-300
                          file:mr-4 file:py-2 file:px-4
                          file:rounded file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700
                          file:cursor-pointer"
                      />
                      <p className="text-xs text-slate-400">PDF, JPG, PNG, ZIP (max 10MB). For multiple files, use ZIP.</p>
                      {form.attachmentId && (
                        <div className="mt-2">
                          <div className="bg-slate-800 px-3 py-2 rounded text-sm">
                            <span className="text-slate-300">File attached</span>
                          </div>
                        </div>
                      )}
                      {activeEntitlement ? (
                        <p className="text-xs text-slate-400">
                          Remaining days: {activeEntitlement.remaining} | Pending:{" "}
                          {activeEntitlement.pending}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      {calculating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Calculating net days...
                        </>
                      ) : netDays ? (
                        <>
                          <Badge variant="secondary">Net days: {netDays.netDays}</Badge>
                          <span className="text-slate-400">
                            Total: {netDays.totalDays} | Weekends excluded:{" "}
                            {netDays.weekendsExcluded} | Holidays excluded:{" "}
                            {netDays.holidaysExcluded}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">
                          Select dates to calculate working days.
                        </span>
                      )}
                    </div>

                    {formError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-200 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {formError}
                      </div>
                    )}
                    {formSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-200 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {formSuccess}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting || calculating}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    My Entitlements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entitlements.length === 0 ? (
                    <p className="text-sm text-slate-400">No entitlements found.</p>
                  ) : (
                    entitlements.map((ent, idx) => (
                      <div
                        key={ent.id || (ent as any)._id || `ent-${idx}`}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold">{ent.leaveType?.name || "Unknown leave type"}</p>
                          <p className="text-xs text-slate-400">
                            Yearly {ent.yearlyEntitlement} - Carry forward {ent.carryForward}
                          </p>
                        </div>
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center sm:gap-4 sm:justify-end">
                          <div className="text-left sm:text-right space-y-1 flex-1 sm:flex-none">
                            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-100">
                              Remaining: {ent.remaining}
                            </Badge>
                            <p className="text-xs text-slate-400">
                              Taken {ent.taken} - Pending {ent.pending}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="border-white/20 text-white mt-2 sm:mt-0"
                            onClick={() => setEntitlementDetails(ent)}
                          >
                            View details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <Dialog
              open={Boolean(entitlementDetails)}
              onOpenChange={(open) => {
                if (!open) {
                  setEntitlementDetails(null);
                }
              }}
            >
              <DialogContent className="bg-slate-900 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(71,85,105,0.7)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700/70 [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-slate-800/70 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/80">
                {entitlementDetails ? (() => {
                  const lt: any = entitlementDetails.leaveType || {};
                  const leaveLabel = getLeaveTypeLabel(lt);
                  const paidLabel = lt?.paid === true ? "Paid" : lt?.paid === false ? "Unpaid" : "—";
                  const deductibleLabel = lt?.deductible === true ? "Yes" : lt?.deductible === false ? "No" : "—";
                  const requiresAttachmentLabel =
                    lt?.requiresAttachment === true
                      ? `Yes${lt?.attachmentType ? ` (${lt.attachmentType})` : ""}`
                      : lt?.requiresAttachment === false
                        ? "No"
                        : "—";
                  const entitlementStats = [
                    { label: "Yearly entitlement", value: entitlementDetails.yearlyEntitlement ?? "—" },
                    { label: "Carry forward", value: entitlementDetails.carryForward ?? "—" },
                    { label: "Accrued (actual)", value: entitlementDetails.accruedActual ?? "—" },
                    { label: "Accrued (rounded)", value: entitlementDetails.accruedRounded ?? "—" },
                    { label: "Taken", value: entitlementDetails.taken ?? "—" },
                    { label: "Pending", value: entitlementDetails.pending ?? "—" },
                    { label: "Remaining", value: entitlementDetails.remaining ?? "—" },
                    { label: "Last accrual", value: formatDateLabel(entitlementDetails.lastAccrualDate as any) },
                    { label: "Next reset", value: formatDateLabel(entitlementDetails.nextResetDate as any) },
                  ];
                  const leaveTypeInfo = [
                    { label: "Code", value: lt?.code || "—" },
                    { label: "Category", value: getCategoryName(lt) },
                    { label: "Paid", value: paidLabel },
                    { label: "Deductible", value: deductibleLabel },
                    { label: "Requires attachment", value: requiresAttachmentLabel },
                    { label: "Attachment type", value: lt?.attachmentType || (lt?.requiresAttachment ? "Not specified" : "—") },
                    { label: "Min tenure (months)", value: lt?.minTenureMonths ?? "—" },
                    { label: "Max duration (days)", value: lt?.maxDurationDays ?? "—" },
                  ];

                  return (
                    <div className="space-y-5">
                      <DialogHeader>
                        <DialogTitle className="text-white flex flex-col gap-1">
                          Entitlement Details
                          <span className="text-sm text-slate-300 font-normal">{leaveLabel}</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Full breakdown of your balance and the underlying leave type rules.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Entitlement snapshot</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {entitlementStats.map((item) => (
                            <div key={item.label} className="p-3 rounded-lg bg-white/5 border border-white/10">
                              <p className="text-xs text-slate-400">{item.label}</p>
                              <p className="text-sm font-semibold text-white">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Leave type info</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {leaveTypeInfo.map((item) => (
                            <div key={item.label} className="p-3 rounded-lg bg-white/5 border border-white/10">
                              <p className="text-xs text-slate-400">{item.label}</p>
                              <p className="text-sm font-semibold text-white break-words">{item.value}</p>
                            </div>
                          ))}
                        </div>
                        {lt?.description ? (
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-slate-400">Description</p>
                            <p className="text-sm text-slate-200 leading-relaxed">{lt.description}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })() : null}
              </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Cancel Leave Request
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    Are you sure you want to cancel this leave request? This action cannot be undone.
                    The leave days will be returned to your balance if the request was already approved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setCancelDialogOpen(false);
                      setRequestToCancel(null);
                    }}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Keep Request
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelConfirm}
                    className="bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    Yes, Cancel Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Edit Request Modal */}
            <Dialog open={editing} onOpenChange={(open) => {
              if (!open) {
                setEditing(false);
                setEditingRequest(null);
                setEditError(null);
                setEditSuccess(null);
              }
            }}>
              <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    <Edit2 className="w-5 h-5" />
                    Edit Leave Request
                    {editingRequest && (
                      <span className="text-sm text-slate-400 font-normal">
                        - {editingRequest.leaveType?.name || "Leave type"}
                      </span>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Update your leave request details. Changes will be validated before submission.
                  </DialogDescription>
                </DialogHeader>
                {editingRequest && (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-slate-200">From</Label>
                        <Input
                          type="date"
                          value={editForm.from}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, from: e.target.value }))
                          }
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200">To</Label>
                        <Input
                          type="date"
                          value={editForm.to}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, to: e.target.value }))
                          }
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-200">Justification (Optional)</Label>
                      <Textarea
                        value={editForm.justification}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, justification: e.target.value }))
                        }
                        className="bg-white/5 border-white/10 text-white"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-200">Attachment (Optional)</Label>
                      <div className="space-y-2">
                        {editForm.attachmentId && (
                          <div className="bg-slate-800 px-3 py-2 rounded text-sm">
                            <span className="text-slate-200 truncate">
                              Current: {editingRequest?.attachmentId && typeof editingRequest.attachmentId === "object"
                                ? ((editingRequest.attachmentId as any).originalName || "Attachment")
                                : "Attachment"}
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.zip"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const uploaded = await uploadAttachments([file]);
                              if (uploaded && uploaded.length > 0) {
                                setEditForm((prev) => ({ ...prev, attachmentId: uploaded[0].id }));
                                setEditSuccess(`File uploaded: ${file.name}`);
                              }
                            } catch (err) {
                              setEditError('Upload failed');
                            }
                          }}
                          className="block w-full text-sm text-slate-300
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-600 file:text-white
                            hover:file:bg-blue-700
                            file:cursor-pointer"
                        />
                        <p className="text-xs text-slate-400">
                          {editForm.attachmentId ? "Choose a new file to replace the current one" : "PDF, JPG, PNG, ZIP (max 10MB)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      {editCalculating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Calculating net days...
                        </>
                      ) : editNetDays ? (
                        <>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-100">Net days: {editNetDays.netDays}</Badge>
                          <span className="text-slate-400">
                            Total: {editNetDays.totalDays} | Weekends excluded:{" "}
                            {editNetDays.weekendsExcluded} | Holidays excluded:{" "}
                            {editNetDays.holidaysExcluded}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">Select dates to calculate working days.</span>
                      )}
                    </div>

                    {editError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-200 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {editError}
                      </div>
                    )}
                    {editSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-200 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {editSuccess}
                      </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setEditing(false);
                          setEditingRequest(null);
                          setEditError(null);
                          setEditSuccess(null);
                        }}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={editCalculating}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                      >
                        {editCalculating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Showing only your adjustment history.
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={loadAuditTrail}
                    disabled={auditLoading}
                  >
                    {auditLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Refreshing...
                      </span>
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">From</Label>
                    <Input
                      type="date"
                      value={auditFromDate}
                      onChange={(e) => setAuditFromDate(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">To</Label>
                    <Input
                      type="date"
                      value={auditToDate}
                      onChange={(e) => setAuditToDate(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={auditTypeFilter}
                      onValueChange={(value) => setAuditTypeFilter(value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 text-white border-white/10">
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="add">Add</SelectItem>
                        <SelectItem value="deduct">Deduct</SelectItem>
                        <SelectItem value="encashment">Encashment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    Showing {filteredAuditTrail.length} of {auditTrail.length}
                  </span>
                  <span>
                    Total amount:{" "}
                    {filteredAuditAmountTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setAuditFromDate("");
                      setAuditToDate("");
                      setAuditTypeFilter("all");
                    }}
                    disabled={!auditFromDate && !auditToDate && auditTypeFilter === "all"}
                  >
                    Clear filters
                  </Button>
                </div>
                {auditLoading ? (
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading audit trail...
                  </div>
                ) : auditTrail.length === 0 ? (
                  <p className="text-sm text-slate-400">No audit entries.</p>
                ) : filteredAuditTrail.length ? (
                  <div className="space-y-2 max-h-64 overflow-auto border border-white/10 rounded-xl p-3 bg-white/5">
                    {filteredAuditTrail.map((entry) => (
                      <div
                        key={entry.adjustmentId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border border-white/10 rounded-lg px-3 py-2"
                      >
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">{entry.leaveType}</p>
                          <p className="text-xs text-slate-300">
                            {entry.adjustmentType} {entry.amount} - {entry.reason || "No reason"}
                          </p>
                          <p className="text-xs text-slate-400">
                            HR: {entry.hrUserName || entry.hrUserId || "N/A"} -{" "}
                            {entry.createdAt ? formatDate(entry.createdAt) : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No audit entries match the current filters.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notifications - Last */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {notificationsLoading ? (
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-slate-400">No notifications.</p>
                ) : (
                  <ul className="space-y-2">
                    {notifications.map((note) => (
                      <li
                        key={note._id}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{note.type}</span>
                          {note.createdAt ? (
                            <span className="text-xs text-slate-400">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                        {note.message ? (
                          <p className="text-slate-200 text-sm mt-1">{note.message}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}
