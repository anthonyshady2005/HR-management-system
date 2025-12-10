"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, redirect } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FlagTriangleRight,
  Loader2,
  ShieldCheck,
  Users,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LeaveCategory,
  LeaveRequest,
  LeaveType,
  LeavePolicy,
  CalendarResponse,
  Holiday,
  HOLIDAY_TYPES,
  calculateResetDates,
  cancelLeaveRequest,
  createAdjustment,
  createLeaveCategory,
  createLeaveType,
  fetchPolicies,
  createLeavePolicy,
  updateLeavePolicy,
  deleteLeavePolicy,
  deleteLeaveCategory,
  deleteLeaveType,
  fetchAllRequests,
  fetchLeaveCategories,
  fetchLeaveTypes,
  flagIrregularRequest,
  overrideRequest,
  runAccrual,
  runCarryForward,
  updateLeaveCategory,
  updateLeaveType,
  createEntitlement,
  createPersonalizedEntitlement,
  updateEntitlementBalance,
  fetchEntitlementById,
  createCalendar,
  fetchCalendar,
  addBlockedPeriod,
  removeBlockedPeriod,
  addHolidayToCalendar,
  removeHolidayFromCalendar,
  createHoliday,
  fetchHolidays,
  updateRequestStatus,
  fetchMyProfile,
  fetchNotifications,
  NotificationLog,
  getAttachmentDownloadUrl, fetchEntitlementsByEmployee, LeaveEntitlement,
} from "@/app/leaves/services/leaves";

const ALLOWED_ROLES = ["department head", "HR Manager", "HR Admin", "System Admin"];

type Capability =
    | "canApprove"
    | "canOverride"
    | "canAdjust"
    | "canRunOps"
    | "canManageCatalog"
    | "canManagePolicies"
    | "canSeeAllRequests";

const ROLE_CAPABILITIES: Record<Capability, string[]> = {
  canApprove: ["department head", "HR Manager", "HR Admin", "System Admin"],
  canOverride: ["HR Admin", "System Admin"],
  canAdjust: ["HR Manager", "HR Admin", "System Admin"],
  canRunOps: ["HR Admin", "System Admin"],
  canManageCatalog: ["HR Manager", "HR Admin", "System Admin"],
  canManagePolicies: ["HR Admin", "System Admin"],
  canSeeAllRequests: ["HR Manager", "HR Admin", "System Admin"],
};

const normalizeRole = (role?: string | null) => (role || "").trim().toLowerCase();

type Filters = {
  status: string;
  leaveTypeId: string;
  employeeId: string;
  departmentId?: string;
};

export default function LeavesDashboardPage() {
  const { status, user, currentRole } = useAuth();
  const router = useRouter();

  useRequireRole(ALLOWED_ROLES, "/home");

  const normalizedRole = normalizeRole(currentRole);
  const can = (capability: Capability) =>
      ROLE_CAPABILITIES[capability].map(normalizeRole).includes(normalizedRole);

  const [filters, setFilters] = useState<Filters>({
    status: "",
    leaveTypeId: "",
    employeeId: "",
    departmentId: "",
  });
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);
  const [adjustment, setAdjustment] = useState({
    employeeId: "",
    leaveTypeId: "",
    adjustmentType: "add",
    amount: "",
    reason: "",
  });
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [policyForm, setPolicyForm] = useState({
    id: "",
    leaveTypeId: "",
    accrualMethod: "",
    monthlyRate: "",
    yearlyRate: "",
    carryForwardAllowed: false,
    maxCarryForward: "",
    expiryAfterMonths: "",
    roundingRule: "",
    minNoticeDays: "",
    maxConsecutiveDays: "",
  });
  const [entitlementForm, setEntitlementForm] = useState({
    employeeId: "",
    leaveTypeId: "",
    yearlyEntitlement: "",
    accruedActual: "",
    accruedRounded: "",
    carryForward: "",
    personalized: false,
  });
  const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
  const [entitlementSearchEmployee, setEntitlementSearchEmployee] = useState("");
  const [entitlementEdit, setEntitlementEdit] = useState<{
    id: string;
    yearlyEntitlement: string;
    accruedActual: string;
    accruedRounded: string;
    carryForward: string;
    taken: string;
    pending: string;
  }>({
    id: "",
    yearlyEntitlement: "",
    accruedActual: "",
    accruedRounded: "",
    carryForward: "",
    taken: "",
    pending: "",
  });
  const [calendarYear, setCalendarYear] = useState("");
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [blockedForm, setBlockedForm] = useState({ from: "", to: "", reason: "" });
  const [holidayId, setHolidayId] = useState("");
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [categories, setCategories] = useState<LeaveCategory[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editCategory, setEditCategory] = useState({ id: "", name: "", description: "" });
  const [newType, setNewType] = useState({
    code: "",
    name: "",
    categoryId: "",
    description: "",
  });
  const [editType, setEditType] = useState({
    id: "",
    code: "",
    name: "",
    categoryId: "",
    description: "",
  });
  const [profile, setProfile] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  const loadBase = async () => {
    setError(null);
    try {
      const [types, cats, pols, hols] = await Promise.all([
        fetchLeaveTypes(),
        fetchLeaveCategories(),
        fetchPolicies(),
        fetchHolidays(),
      ]);
      setLeaveTypes(types);
      setCategories(cats);
      setPolicies(pols);
      setHolidays(hols);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load leave catalog.");
    }
  };

  const loadProfileForScope = async () => {
    if (can("canSeeAllRequests")) return;
    if (!user?.id) return;
    try {
      const me = await fetchMyProfile();
      setProfile(me);
      const deptId =
          (me as any)?.department?._id ||
          (me as any)?.department?.id ||
          (me as any)?.department?.toString?.();
      if (deptId) {
        setFilters((prev) => ({ ...prev, departmentId: deptId }));
      }
    } catch (err) {
      console.warn("Failed to load profile for scoped view", err);
    }
  };

  const loadRequests = async () => {
    setError(null);
    setLoading(true);
    try {
      const baseFilters: any = {
        status: filters.status || undefined,
        leaveTypeId: filters.leaveTypeId || undefined,
        employeeId: filters.employeeId || undefined,
        departmentId: filters.departmentId || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (!can("canSeeAllRequests")) {
        const deptId =
            filters.departmentId ||
            (profile as any)?.department?._id ||
            (profile as any)?.department?.id ||
            (profile as any)?.department?.toString?.();
        if (deptId) {
          baseFilters.departmentId = deptId;
        } else if (user?.id) {
          baseFilters.employeeId = user.id;
        }
      }

      const rawReqs = await fetchAllRequests(baseFilters);
      const reqs = (rawReqs || []).map((r: any) => ({
        ...r,
        id: r?.id?.toString?.() || r?._id?.toString?.() || r?.id || r?._id,
      }));
      setRequests(reqs);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    setNotificationsLoading(true);
    try {
      const toParam = can("canSeeAllRequests") ? undefined : user.id;
      const data = await fetchNotifications(toParam ? { to: toParam } : undefined);
      setNotifications(data || []);
    } catch (err) {
      // Swallow errors for notifications; do not block page
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      void loadBase();
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      void loadProfileForScope();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user?.id, normalizedRole]);

  useEffect(() => {
    if (status === "authenticated") {
      void loadRequests();
      void loadNotifications();
    }
  }, [status, filters.status, filters.leaveTypeId, filters.employeeId, filters.departmentId, normalizedRole]);

  const stats = useMemo(() => {
    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      irregular: 0,
    };
    requests.forEach((r) => {
      result[r.status] = (result as any)[r.status] + 1;
      if (r.irregularPatternFlag) result.irregular += 1;
    });
    return result;
  }, [requests]);

  const handleStatus = async (id: string, next: "approved" | "rejected") => {
    if (!user?.id) return;
    if (!can("canApprove")) return;
    setBusyId(id);
    setActionMessage(null);
    setError(null);
    try {
      await updateRequestStatus(id, next, user.id);
      setActionMessage(`Request ${next}.`);
      await loadRequests();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can("canManageCatalog")) return;
    setActionMessage(null);
    setError(null);
    try {
      await createLeaveCategory({
        name: newCategory.name,
        description: newCategory.description || undefined,
      });
      setNewCategory({ name: "", description: "" });
      await loadBase();
      setActionMessage("Category created.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Create category failed.");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory.id) return;
    if (!can("canManageCatalog")) return;
    setActionMessage(null);
    setError(null);
    try {
      await updateLeaveCategory(editCategory.id, {
        name: editCategory.name || undefined,
        description: editCategory.description || undefined,
      });
      setEditCategory({ id: "", name: "", description: "" });
      await loadBase();
      setActionMessage("Category updated.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Update category failed.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!can("canManageCatalog")) return;
    setActionMessage(null);
    setError(null);
    try {
      await deleteLeaveCategory(id);
      await loadBase();
      setActionMessage("Category deleted.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Delete category failed.");
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can("canManageCatalog")) return;
    setActionMessage(null);
    setError(null);
    try {
      await createLeaveType({
        code: newType.code,
        name: newType.name,
        categoryId: newType.categoryId,
        description: newType.description || undefined,
      });
      setNewType({ code: "", name: "", categoryId: "", description: "" });
      await loadBase();
      setActionMessage("Leave type created.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Create leave type failed.");
    }
  };

  const handleUpdateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editType.id) return;
    if (!can("canManageCatalog")) return;
    setActionMessage(null);
    setError(null);
    try {
      await updateLeaveType(editType.id, {
        code: editType.code || undefined,
        name: editType.name || undefined,
        categoryId: editType.categoryId || undefined,
        description: editType.description || undefined,
      });
      setEditType({ id: "", code: "", name: "", categoryId: "", description: "" });
      await loadBase();
      setActionMessage("Leave type updated.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Update leave type failed.");
    }
  };

  const resetPolicyForm = () =>
    setPolicyForm({
      id: "",
      leaveTypeId: "",
      accrualMethod: "",
      monthlyRate: "",
      yearlyRate: "",
      carryForwardAllowed: false,
      maxCarryForward: "",
      expiryAfterMonths: "",
      roundingRule: "",
      minNoticeDays: "",
      maxConsecutiveDays: "",
    });

  const handleCreateOrUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can("canManagePolicies")) return;
    setActionMessage(null);
    setError(null);
    const payload: any = {
      leaveTypeId: policyForm.leaveTypeId,
      accrualMethod: policyForm.accrualMethod || undefined,
      monthlyRate: policyForm.monthlyRate ? Number(policyForm.monthlyRate) : undefined,
      yearlyRate: policyForm.yearlyRate ? Number(policyForm.yearlyRate) : undefined,
      carryForwardAllowed: policyForm.carryForwardAllowed,
      maxCarryForward: policyForm.maxCarryForward ? Number(policyForm.maxCarryForward) : undefined,
      expiryAfterMonths: policyForm.expiryAfterMonths ? Number(policyForm.expiryAfterMonths) : undefined,
      roundingRule: policyForm.roundingRule || undefined,
      minNoticeDays: policyForm.minNoticeDays ? Number(policyForm.minNoticeDays) : undefined,
      maxConsecutiveDays: policyForm.maxConsecutiveDays ? Number(policyForm.maxConsecutiveDays) : undefined,
    };
    try {
      if (policyForm.id) {
        await updateLeavePolicy(policyForm.id, payload);
        setActionMessage("Policy updated.");
      } else {
        await createLeavePolicy(payload);
        setActionMessage("Policy created.");
      }
      resetPolicyForm();
      await loadBase();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Policy save failed.");
    }
  };

  const handleSelectPolicy = (id: string) => {
    if (id === "__none") {
      resetPolicyForm();
      return;
    }
    const pol = policies.find((p) => {
      const pid = (p as any).id || (p as any)._id;
      return pid?.toString?.() === id;
    });
    if (!pol) return;
    const leaveTypeId =
      (pol as any).leaveType?._id?.toString?.() ||
      (pol as any).leaveType?.id?.toString?.() ||
      (pol as any).leaveType?.toString?.() ||
      (pol as any).leaveTypeId?.toString?.();
    setPolicyForm({
      id,
      leaveTypeId: leaveTypeId || "",
      accrualMethod: pol.accrualMethod || "",
      monthlyRate: pol.monthlyRate?.toString() || "",
      yearlyRate: pol.yearlyRate?.toString() || "",
      carryForwardAllowed: Boolean(pol.carryForwardAllowed),
      maxCarryForward: pol.maxCarryForward?.toString() || "",
      expiryAfterMonths: pol.expiryAfterMonths?.toString() || "",
      roundingRule: pol.roundingRule || "",
      minNoticeDays: pol.minNoticeDays?.toString() || "",
      maxConsecutiveDays: pol.maxConsecutiveDays?.toString() || "",
    });
  };

  const handleDeletePolicy = async () => {
    if (!policyForm.id || !can("canManagePolicies")) return;
    setActionMessage(null);
    setError(null);
    try {
      await deleteLeavePolicy(policyForm.id);
      resetPolicyForm();
      await loadBase();
      setActionMessage("Policy deleted.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Delete policy failed.");
    }
  };

  const handleCreateEntitlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can("canManagePolicies")) return;
    setActionMessage(null);
    setError(null);
    const payload: any = {
      employeeId: entitlementForm.employeeId,
      leaveTypeId: entitlementForm.leaveTypeId,
      yearlyEntitlement: entitlementForm.yearlyEntitlement ? Number(entitlementForm.yearlyEntitlement) : undefined,
      accruedActual: entitlementForm.accruedActual ? Number(entitlementForm.accruedActual) : undefined,
      accruedRounded: entitlementForm.accruedRounded ? Number(entitlementForm.accruedRounded) : undefined,
      carryForward: entitlementForm.carryForward ? Number(entitlementForm.carryForward) : undefined,
    };
    try {
      if (entitlementForm.personalized) {
        await createPersonalizedEntitlement(payload);
      } else {
        await createEntitlement(payload);
      }
      setEntitlementForm({
        employeeId: "",
        leaveTypeId: "",
        yearlyEntitlement: "",
        accruedActual: "",
        accruedRounded: "",
        carryForward: "",
        personalized: false,
      });
      setActionMessage("Entitlement created.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Create entitlement failed.");
    }
  };

  const handleLoadCalendar = async () => {
    if (!calendarYear) return;
    setCalendarLoading(true);
    setError(null);
    try {
      const yearNum = Number(calendarYear);
      const data = await fetchCalendar(yearNum);
      setCalendar(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load calendar.");
      setCalendar(null);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleCreateCalendar = async () => {
    if (!calendarYear) return;
    setCalendarLoading(true);
    setError(null);
    try {
      const yearNum = Number(calendarYear);
      const data = await createCalendar({ year: yearNum });
      setCalendar(data);
      setActionMessage("Calendar created.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Create calendar failed.");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleAddBlocked = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarYear) return;
    setCalendarLoading(true);
    setError(null);
    try {
      const data = await addBlockedPeriod(Number(calendarYear), blockedForm);
      setCalendar(data);
      setBlockedForm({ from: "", to: "", reason: "" });
      setActionMessage("Blocked period added.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Add blocked period failed.");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleRemoveBlocked = async (index: number) => {
    if (!calendarYear) return;
    setCalendarLoading(true);
    setError(null);
    try {
      const data = await removeBlockedPeriod(Number(calendarYear), index);
      setCalendar(data);
      setActionMessage("Blocked period removed.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Remove blocked period failed.");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarYear || !holidayId) return;
    setCalendarLoading(true);
    setError(null);
    try {
      const data = await addHolidayToCalendar(Number(calendarYear), holidayId.trim());
      setCalendar(data);
      setHolidayId("");
      setActionMessage("Holiday added.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Add holiday failed.");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalendarLoading(true);
    setError(null);
    try {
      const created = await createHoliday({
        name: holidayForm.name,
        type: holidayForm.type,
        startDate: holidayForm.startDate,
        endDate: holidayForm.endDate || undefined,
      });
      // If a calendar year is loaded, optionally prefill the holidayId input for quick linking
      const hid = (created as any).id || (created as any)._id;
      if (hid) {
        setHolidayId(hid.toString());
      }
      setHolidayForm({ name: "", type: "", startDate: "", endDate: "" });
      setActionMessage("Holiday created.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Create holiday failed.");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleRemoveHoliday = async (hid: string) => {
    if (!calendarYear) return;
    setCalendarLoading(true);
    setError(null);
    try {
      const data = await removeHolidayFromCalendar(Number(calendarYear), hid);
      setCalendar(data);
      setActionMessage("Holiday removed.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Remove holiday failed.");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleLoadEntitlements = async () => {
    if (!entitlementSearchEmployee) {
      setEntitlements([]);
      return;
    }
    setError(null);
    try {
      const data = await fetchEntitlementsByEmployee(entitlementSearchEmployee);
      setEntitlements(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load entitlements.");
    }
  };

  const handleSelectEntitlement = async (id: string) => {
    setError(null);
    try {
      const ent =
        entitlements.find((e) => {
          const eid = (e as any).id || (e as any)._id;
          return eid?.toString?.() === id;
        }) || (await fetchEntitlementById(id));
      if (!ent) return;
      const eid = (ent as any).id || (ent as any)._id || id;
      setEntitlementEdit({
        id: eid.toString(),
        yearlyEntitlement: ent.yearlyEntitlement?.toString() || "",
        accruedActual: ent.accruedActual?.toString() || "",
        accruedRounded: ent.accruedRounded?.toString() || "",
        carryForward: ent.carryForward?.toString() || "",
        taken: ent.taken?.toString() || "",
        pending: ent.pending?.toString() || "",
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load entitlement.");
    }
  };

  const handleUpdateEntitlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entitlementEdit.id) return;
    setActionMessage(null);
    setError(null);
    try {
      await updateEntitlementBalance(entitlementEdit.id, {
        yearlyEntitlement: entitlementEdit.yearlyEntitlement ? Number(entitlementEdit.yearlyEntitlement) : undefined,
        accruedActual: entitlementEdit.accruedActual ? Number(entitlementEdit.accruedActual) : undefined,
        accruedRounded: entitlementEdit.accruedRounded ? Number(entitlementEdit.accruedRounded) : undefined,
        carryForward: entitlementEdit.carryForward ? Number(entitlementEdit.carryForward) : undefined,
        taken: entitlementEdit.taken ? Number(entitlementEdit.taken) : undefined,
        pending: entitlementEdit.pending ? Number(entitlementEdit.pending) : undefined,
      });
      setActionMessage("Entitlement updated.");
      await handleLoadEntitlements();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Update entitlement failed.");
    }
  };


  const handleDeleteType = async (id: string) => {
    if (!can("canManageCatalog")) return;
    setActionMessage(null);
    setError(null);
    try {
      await deleteLeaveType(id);
      await loadBase();
      setActionMessage("Leave type deleted.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Delete leave type failed.");
    }
  };

  const handleOverride = async (id: string, decision: "approve" | "reject") => {
    if (!can("canOverride")) return;
    const justification = window.prompt("Add justification for override (required):") || "";
    if (!justification.trim()) return;
    setBusyId(id);
    setActionMessage(null);
    setError(null);
    try {
      await overrideRequest(id, decision, justification.trim());
      setActionMessage("Override submitted.");
      await loadRequests();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Override failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleFlag = async (id: string) => {
    if (!can("canApprove")) return;
    setBusyId(id);
    setError(null);
    try {
      await flagIrregularRequest(id);
      await loadRequests();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Flag failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await cancelLeaveRequest(id);
      await loadRequests();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Cancel failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can("canAdjust")) return;
    if (!user?.id) return;
    setSubmittingAdjustment(true);
    setError(null);
    setActionMessage(null);
    try {
      await createAdjustment({
        employeeId: adjustment.employeeId,
        leaveTypeId: adjustment.leaveTypeId,
        adjustmentType: adjustment.adjustmentType as any,
        amount: Number(adjustment.amount),
        reason: adjustment.reason,
        hrUserId: user.id,
      });
      setActionMessage("Adjustment created.");
      setAdjustment({
        employeeId: "",
        leaveTypeId: "",
        adjustmentType: "add",
        amount: "",
        reason: "",
      });
      await loadRequests();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Adjustment failed.");
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  const handleOps = async (op: "monthly" | "quarterly" | "yearly" | "carry" | "reset") => {
    if (!can("canRunOps")) return;
    setActionMessage(null);
    setError(null);
    setLoading(true);
    try {
      if (op === "carry") {
        await runCarryForward();
      } else if (op === "reset") {
        await calculateResetDates();
      } else {
        await runAccrual(op);
      }
      setActionMessage("Operation triggered successfully.");
      await loadRequests();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  if (status !== "authenticated" || !user || !currentRole) {
    return null;
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Leaves Dashboard</h1>
              <p className="text-slate-400 text-sm">
                Dashboard role: {currentRole}
                {can("canSeeAllRequests") ? " (full visibility)" : " (scoped to your department/team)"}
              </p>
            </div>
            <div className="ml-auto">
              <Button
                  variant="secondary"
                  onClick={() => loadRequests()}
                  disabled={loading}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
              >
                {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading
                    </>
                ) : (
                    "Refresh"
                )}
              </Button>
            </div>
          </div>

          {error ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-200 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
          ) : null}
          {actionMessage ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-200 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {actionMessage}
              </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500" },
              { label: "Approved", value: stats.approved, color: "from-emerald-500 to-green-500" },
              { label: "Rejected", value: stats.rejected, color: "from-rose-500 to-red-500" },
              { label: "Cancelled", value: stats.cancelled, color: "from-slate-500 to-slate-400" },
              { label: "Irregular flags", value: stats.irregular, color: "from-purple-500 to-indigo-500" },
            ].map((stat) => (
                <Card key={stat.label} className="bg-white/5 border-white/10 text-white">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm text-slate-300">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-semibold">{stat.value}</p>
                  </CardContent>
                </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10 text-white lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select
                        value={filters.status || "__any_status"}
                        onValueChange={(value) =>
                            setFilters((prev) => ({
                              ...prev,
                              status: value === "__any_status" ? "" : value,
                            }))
                        }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 text-white border-white/10">
                        <SelectItem value="__any_status">Any</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Leave type</Label>
                    <Select
                        value={filters.leaveTypeId || "__any_lt"}
                        onValueChange={(value) =>
                            setFilters((prev) => ({
                              ...prev,
                              leaveTypeId: value === "__any_lt" ? "" : value,
                            }))
                        }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 text-white border-white/10">
                        <SelectItem value="__any_lt">Any</SelectItem>
                        {leaveTypes.map((lt, idx) => {
                          const key = (lt as any).id || (lt as any)._id || lt.code || `lt-${idx}`;
                          const value = (lt as any).id || (lt as any)._id || lt.code || `lt-${idx}`;
                          return (
                              <SelectItem key={key} value={value}>
                                {lt.name}
                              </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Employee ID</Label>
                    <Input
                        value={filters.employeeId}
                        onChange={(e) => setFilters((prev) => ({ ...prev, employeeId: e.target.value }))}
                        placeholder="Optional"
                        className="bg-white/5 border-white/10 text-white"
                        disabled={!can("canSeeAllRequests")}
                    />
                  </div>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading requests...
                    </div>
                ) : requests.length === 0 ? (
                    <p className="text-sm text-slate-400">No requests match these filters.</p>
                ) : (
                    <Table className="text-white">
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-slate-300">Employee</TableHead>
                          <TableHead className="text-slate-300">Leave</TableHead>
                          <TableHead className="text-slate-300">Dates</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {requests.map((req, idx) => {
                        const requestId = req.id || (req as any)._id || `req-${idx}`;
                        return (
                        <TableRow
                          key={requestId}
                          className="border-white/5 cursor-pointer hover:bg-white/5"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <TableCell className="whitespace-nowrap text-slate-200">
                            {renderEmployee(req.employeeId)}
                          </TableCell>
                          <TableCell>{req.leaveType?.name || "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">
                                  {formatDate(req.dates.from)} - {formatDate(req.dates.to)}
                                </TableCell>
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
                                <TableCell className="space-x-2 whitespace-nowrap">
                                  {req.status === "pending" ? (
                                      <>
                                        {can("canApprove") ? (
                                            <>
                                              <Button
                                                  size="sm"
                                                  variant="secondary"
                                                  disabled={busyId === requestId}
                                                  onClick={() => handleStatus(requestId, "approved")}
                                              >
                                                Approve
                                              </Button>
                                              <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="text-rose-200"
                                                  disabled={busyId === requestId}
                                                  onClick={() => handleStatus(requestId, "rejected")}
                                              >
                                                Reject
                                              </Button>
                                            </>
                                        ) : null}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-amber-200 border-amber-500/30"
                                            disabled={busyId === requestId}
                                            onClick={() => handleCancel(requestId)}
                                        >
                                          Cancel
                                        </Button>
                                      </>
                                  ) : (
                                      "-"
                                  )}
                                  {can("canOverride") ? (
                                      <>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-indigo-200"
                                            disabled={busyId === requestId}
                                            onClick={() => handleOverride(requestId, "approve")}
                                        >
                                          Override +
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-rose-200"
                                            disabled={busyId === requestId}
                                            onClick={() => handleOverride(requestId, "reject")}
                                        >
                                          Override ?
                                        </Button>
                                      </>
                                  ) : null}
                                  {can("canApprove") ? (
                                      <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-purple-200"
                                          disabled={busyId === requestId}
                                          onClick={() => handleFlag(requestId)}
                                      >
                                        <FlagTriangleRight className="w-4 h-4 mr-1" />
                                        Flag
                                      </Button>
                                  ) : null}
                                </TableCell>
                              </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                )}
            </CardContent>
          </Card>

          {selectedRequest ? (
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Request details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{selectedRequest.leaveType?.name || "Leave request"}</span>
                  <Badge
                    variant="secondary"
                    className={
                      selectedRequest.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-100"
                        : selectedRequest.status === "rejected"
                          ? "bg-rose-500/20 text-rose-100"
                          : selectedRequest.status === "cancelled"
                            ? "bg-slate-500/30 text-slate-200"
                            : "bg-amber-500/20 text-amber-100"
                    }
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
                <p>Employee: {renderEmployee(selectedRequest.employeeId)}</p>
                <p>
                  Dates: {formatDate(selectedRequest.dates.from)} - {formatDate(selectedRequest.dates.to)} (
                  {selectedRequest.durationDays} day(s))
                </p>
                {selectedRequest.justification ? (
                  <p>Justification: {selectedRequest.justification}</p>
                ) : null}
                {(() => {
                  // Handle single attachment - check populated attachment object
                  const attachmentObj = (selectedRequest as any).attachment || (selectedRequest as any).attachmentId;
                  if (attachmentObj && typeof attachmentObj === "object" && (attachmentObj._id || attachmentObj.id)) {
                    const attachmentId = (attachmentObj._id || attachmentObj.id).toString();
                    const attachmentName = attachmentObj.originalName || attachmentObj.name || "Download Attachment";
                    return (
                      <p>
                        Attachment:{" "}
                        <a
                          href={getAttachmentDownloadUrl(attachmentId)}
                          target="_blank"
                          className="text-blue-400 hover:underline"
                        >
                          {attachmentName}
                        </a>
                      </p>
                    );
                  }
                  return null;
                })()}
                <p>Created: {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "N/A"}</p>
                <p>Updated: {selectedRequest.updatedAt ? new Date(selectedRequest.updatedAt).toLocaleString() : "N/A"}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
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
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-sm"
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

            {can("canManageCatalog") ? (
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Catalog - Categories</CardTitle>
                </CardHeader>
                    <CardContent className="space-y-3">
                      <form className="space-y-2" onSubmit={handleCreateCategory}>
                        <Label className="text-sm">New category</Label>
                        <Input
                            value={newCategory.name}
                            onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Name"
                            required
                            className="bg-white/5 border-white/10 text-white"
                        />
                        <Input
                            value={newCategory.description}
                            onChange={(e) => setNewCategory((p) => ({ ...p, description: e.target.value }))}
                            placeholder="Description (optional)"
                            className="bg-white/5 border-white/10 text-white"
                        />
                        <Button type="submit" className="w-full">
                          Create category
                        </Button>
                      </form>

                      <div className="border-t border-white/10 pt-3">
                        <Label className="text-sm">Edit category</Label>
                        <div className="space-y-2">
                          <Select
                              value={editCategory.id || "__none"}
                              onValueChange={(value) => {
                                if (value === "__none") {
                                  setEditCategory({ id: "", name: "", description: "" });
                                  return;
                                }
                                const found = categories.find((c) => {
                                  const cid =
                                    (c as any).id ||
                                    (c as any)._id ||
                                    (c as any).categoryId;
                                  return cid?.toString?.() === value;
                                });
                                setEditCategory({
                                  id: value,
                                  name: found?.name || "",
                                  description: found?.description || "",
                                });
                              }}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white border-white/10">
                              <SelectItem value="__none">None</SelectItem>
                              {categories.map((cat, idx) => {
                                const cid =
                                  (cat as any).id ||
                                  (cat as any)._id ||
                                  (cat as any).categoryId;
                                if (!cid) return null;
                                const value = cid.toString();
                                return (
                                    <SelectItem key={value} value={value}>
                                      {cat.name}
                                    </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {editCategory.id ? (
                              <>
                                <Input
                                    value={editCategory.name}
                                    onChange={(e) => setEditCategory((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="Name"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                                <Input
                                    value={editCategory.description}
                                    onChange={(e) =>
                                        setEditCategory((p) => ({ ...p, description: e.target.value }))
                                    }
                                    placeholder="Description"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                                <Button type="button" variant="secondary" onClick={handleUpdateCategory}>
                                  Update
                                </Button>
                              </>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ) : null}

              {can("canRunOps") ? (
                  <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                      <CardTitle>Run operations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="secondary"
                            className="bg-white/5"
                            onClick={() => handleOps("monthly")}
                            disabled={loading}
                        >
                          Accrual - Monthly
                        </Button>
                        <Button
                            variant="secondary"
                            className="bg-white/5"
                            onClick={() => handleOps("quarterly")}
                            disabled={loading}
                        >
                          Accrual - Quarterly
                        </Button>
                        <Button
                            variant="secondary"
                            className="bg-white/5"
                            onClick={() => handleOps("yearly")}
                            disabled={loading}
                        >
                          Accrual - Yearly
                        </Button>
                        <Button
                            variant="secondary"
                            className="bg-white/5"
                            onClick={() => handleOps("carry")}
                            disabled={loading}
                        >
                          Carry-forward
                        </Button>
                      </div>
                      <Button
                          variant="outline"
                          className="w-full text-white border-white/20"
                          onClick={() => handleOps("reset")}
                          disabled={loading}
                      >
                        Reset dates
                      </Button>
                    </CardContent>
                  </Card>
              ) : null}

              {can("canAdjust") ? (
                  <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                      <CardTitle>Quick adjustment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-3" onSubmit={handleAdjustment}>
                        <div className="space-y-1">
                          <Label>Employee ID</Label>
                          <Input
                              value={adjustment.employeeId}
                              onChange={(e) => setAdjustment((p) => ({ ...p, employeeId: e.target.value }))}
                              required
                              className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Leave type</Label>
                          <Select
                              value={adjustment.leaveTypeId}
                              onValueChange={(value) =>
                                  setAdjustment((prev) => ({
                                    ...prev,
                                    leaveTypeId: value,
                                  }))
                              }
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white border-white/10">
                              {leaveTypes.map((lt, idx) => {
                                const key = (lt as any).id || (lt as any)._id || lt.code || `adj-${idx}`;
                                const value = (lt as any).id || (lt as any)._id || lt.code || `adj-${idx}`;
                                return (
                                    <SelectItem key={key} value={value}>
                                      {lt.name}
                                    </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label>Type</Label>
                            <Select
                                value={adjustment.adjustmentType}
                                onValueChange={(value) =>
                                    setAdjustment((prev) => ({ ...prev, adjustmentType: value }))
                                }
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 text-white border-white/10">
                                <SelectItem value="add">Add</SelectItem>
                                <SelectItem value="deduct">Deduct</SelectItem>
                                <SelectItem value="encashment">Encashment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Amount (days)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={adjustment.amount}
                                onChange={(e) => setAdjustment((p) => ({ ...p, amount: e.target.value }))}
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Reason</Label>
                          <Input
                              value={adjustment.reason}
                              onChange={(e) => setAdjustment((p) => ({ ...p, reason: e.target.value }))}
                              required
                              className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <Button
                            type="submit"
                            disabled={submittingAdjustment}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500"
                        >
                          {submittingAdjustment ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                          ) : (
                              "Create adjustment"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
              ) : null}
            </div>
          </div>

          {can("canManageCatalog") ? (
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Catalog - Leave types</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <form className="space-y-3" onSubmit={handleCreateType}>
                    <Label className="text-sm">Create leave type</Label>
                    <Input
                        value={newType.code}
                        onChange={(e) => setNewType((p) => ({ ...p, code: e.target.value }))}
                        placeholder="Code (e.g., ANN)"
                        required
                        className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                        value={newType.name}
                        onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Name"
                        required
                        className="bg-white/5 border-white/10 text-white"
                    />
                    <Select
                        value={newType.categoryId || "__none"}
                        onValueChange={(value) =>
                            setNewType((p) => ({ ...p, categoryId: value === "__none" ? "" : value }))
                        }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 text-white border-white/10">
                        <SelectItem value="__none">Select category</SelectItem>
                        {categories.map((cat, idx) => {
                          const catId =
                            (cat as any).id ||
                            (cat as any)._id ||
                            (cat as any).categoryId;
                          if (!catId) return null;
                          const value = catId.toString();
                          return (
                            <SelectItem key={value} value={value}>
                              {cat.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Input
                        value={newType.description}
                        onChange={(e) => setNewType((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Description (optional)"
                        className="bg-white/5 border-white/10 text-white"
                    />
                    <Button type="submit">Create leave type</Button>
                  </form>

                  <div className="space-y-3">
                    <Label className="text-sm">Edit leave type</Label>
                    <Select
                        value={editType.id || "__none"}
                        onValueChange={(value) => {
                          if (value === "__none") {
                            setEditType({ id: "", code: "", name: "", categoryId: "", description: "" });
                            return;
                          }
                          const found = leaveTypes.find((lt) => {
                            const ltId = (lt as any).id || (lt as any)._id || lt.code;
                            return ltId?.toString?.() === value;
                          });
                          const catId =
                            (found as any)?.category?.id ||
                            (found as any)?.category?._id ||
                            (found as any)?.categoryId?._id ||
                            (found as any)?.categoryId ||
                            "";
                          setEditType({
                            id: value,
                            code: found?.code || "",
                            name: found?.name || "",
                            categoryId: catId ? catId.toString() : "",
                            description: found?.description || "",
                          });
                        }}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 text-white border-white/10">
                        <SelectItem value="__none">None</SelectItem>
                        {leaveTypes.map((lt, idx) => {
                          const key = (lt as any).id || (lt as any)._id || lt.code || `edit-lt-${idx}`;
                          const value = (lt as any).id || (lt as any)._id || lt.code || `edit-lt-${idx}`;
                          return (
                              <SelectItem key={key} value={value}>
                                {lt.name} ({lt.code})
                              </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {editType.id ? (
                        <>
                          <Input
                              value={editType.code}
                              onChange={(e) => setEditType((p) => ({ ...p, code: e.target.value }))}
                              placeholder="Code"
                              className="bg-white/5 border-white/10 text-white"
                          />
                          <Input
                              value={editType.name}
                              onChange={(e) => setEditType((p) => ({ ...p, name: e.target.value }))}
                              placeholder="Name"
                              className="bg-white/5 border-white/10 text-white"
                          />
                    <Select
                        value={editType.categoryId || "__none"}
                        onValueChange={(value) =>
                            setEditType((p) => ({ ...p, categoryId: value === "__none" ? "" : value }))
                        }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 text-white border-white/10">
                        <SelectItem value="__none">Select category</SelectItem>
                        {categories.map((cat, idx) => {
                          const catId =
                            (cat as any).id ||
                            (cat as any)._id ||
                            (cat as any).categoryId;
                          if (!catId) return null;
                          const value = catId.toString();
                          return (
                            <SelectItem key={value} value={value}>
                              {cat.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                          <Input
                              value={editType.description}
                              onChange={(e) => setEditType((p) => ({ ...p, description: e.target.value }))}
                              placeholder="Description"
                              className="bg-white/5 border-white/10 text-white"
                          />
                          <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={handleUpdateType}>
                              Update
                            </Button>
                          </div>
                        </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
          ) : null}

          {can("canManagePolicies") ? (
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Policies & Entitlements</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form className="space-y-3" onSubmit={handleCreateOrUpdatePolicy}>
                  <Label className="text-sm">Leave policy</Label>
                  <Select
                    value={policyForm.id || "__none"}
                    onValueChange={(value) => handleSelectPolicy(value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select policy (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10">
                      <SelectItem value="__none">New policy</SelectItem>
                      {policies.map((p, idx) => {
                        const pid = (p as any).id || (p as any)._id || `pol-${idx}`;
                        const ltName = (p as any).leaveType?.name || (p as any).leaveType?.code || "Leave type";
                        return (
                          <SelectItem key={pid} value={pid}>
                            {ltName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Select
                    value={policyForm.leaveTypeId || "__none"}
                    onValueChange={(value) =>
                      setPolicyForm((p) => ({ ...p, leaveTypeId: value === "__none" ? "" : value }))
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10">
                      <SelectItem value="__none">Select leave type</SelectItem>
                      {leaveTypes.map((lt, idx) => {
                        const id = (lt as any).id || (lt as any)._id;
                        if (!id) return null;
                        return (
                          <SelectItem key={id || `lt-${idx}`} value={id}>
                            {lt.name} ({lt.code})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={policyForm.accrualMethod}
                      onChange={(e) => setPolicyForm((p) => ({ ...p, accrualMethod: e.target.value }))}
                      placeholder="Accrual method (monthly/yearly)"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                      value={policyForm.roundingRule}
                      onChange={(e) => setPolicyForm((p) => ({ ...p, roundingRule: e.target.value }))}
                      placeholder="Rounding rule (round/up/down)"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={policyForm.monthlyRate}
                      onChange={(e) => setPolicyForm((p) => ({ ...p, monthlyRate: e.target.value }))}
                      placeholder="Monthly rate"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                      type="number"
                      value={policyForm.yearlyRate}
                      onChange={(e) => setPolicyForm((p) => ({ ...p, yearlyRate: e.target.value }))}
                      placeholder="Yearly rate"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={policyForm.maxCarryForward}
                      onChange={(e) => setPolicyForm((p) => ({ ...p, maxCarryForward: e.target.value }))}
                      placeholder="Max carry forward"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                      type="number"
                      value={policyForm.expiryAfterMonths}
                      onChange={(e) => setPolicyForm((p) => ({ ...p, expiryAfterMonths: e.target.value }))}
                      placeholder="Expiry after months"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={policyForm.minNoticeDays}
                      onChange={(e) => setPolicyForm((p) => ({ ...p, minNoticeDays: e.target.value }))}
                      placeholder="Min notice days"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                      type="number"
                      value={policyForm.maxConsecutiveDays}
                      onChange={(e) => setPolicyForm((p) => ({ ...p, maxConsecutiveDays: e.target.value }))}
                      placeholder="Max consecutive days"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={policyForm.carryForwardAllowed}
                      onChange={(e) =>
                        setPolicyForm((p) => ({ ...p, carryForwardAllowed: e.target.checked }))
                      }
                    />
                    Carry forward allowed
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {policyForm.id ? "Update policy" : "Create policy"}
                    </Button>
                    {policyForm.id ? (
                      <Button type="button" variant="ghost" className="text-rose-200" onClick={handleDeletePolicy}>
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </form>

                <form className="space-y-3" onSubmit={handleCreateEntitlement}>
                  <Label className="text-sm">Create entitlement</Label>
                  <Input
                    value={entitlementForm.employeeId}
                    onChange={(e) => setEntitlementForm((p) => ({ ...p, employeeId: e.target.value }))}
                    placeholder="Employee ID"
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Select
                    value={entitlementForm.leaveTypeId || "__none"}
                    onValueChange={(value) =>
                      setEntitlementForm((p) => ({ ...p, leaveTypeId: value === "__none" ? "" : value }))
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10">
                      <SelectItem value="__none">Select leave type</SelectItem>
                      {leaveTypes.map((lt, idx) => {
                        const id = (lt as any).id || (lt as any)._id;
                        if (!id) return null;
                        return (
                          <SelectItem key={id || `lt-ent-${idx}`} value={id}>
                            {lt.name} ({lt.code})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={entitlementForm.yearlyEntitlement}
                      onChange={(e) =>
                        setEntitlementForm((p) => ({ ...p, yearlyEntitlement: e.target.value }))
                      }
                      placeholder="Yearly entitlement"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                      type="number"
                      value={entitlementForm.carryForward}
                      onChange={(e) => setEntitlementForm((p) => ({ ...p, carryForward: e.target.value }))}
                      placeholder="Carry forward"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={entitlementForm.accruedActual}
                      onChange={(e) => setEntitlementForm((p) => ({ ...p, accruedActual: e.target.value }))}
                      placeholder="Accrued actual"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                      type="number"
                      value={entitlementForm.accruedRounded}
                      onChange={(e) => setEntitlementForm((p) => ({ ...p, accruedRounded: e.target.value }))}
                      placeholder="Accrued rounded"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={entitlementForm.personalized}
                      onChange={(e) =>
                        setEntitlementForm((p) => ({ ...p, personalized: e.target.checked }))
                      }
                    />
                    Personalized (skip eligibility)
                  </label>
                  <Button type="submit" className="w-full">
                    Create entitlement
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {can("canManagePolicies") ? (
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Entitlements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm">Find entitlements by employee</Label>
                  <div className="flex gap-2">
                    <Input
                      value={entitlementSearchEmployee}
                      onChange={(e) => setEntitlementSearchEmployee(e.target.value)}
                      placeholder="Employee ID"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Button type="button" onClick={handleLoadEntitlements}>
                      Load
                    </Button>
                  </div>
                  {entitlements.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-auto border border-white/10 rounded-xl p-3 bg-white/5">
                      {entitlements.map((ent) => {
                        const eid = (ent as any).id || (ent as any)._id;
                        return (
                          <button
                            key={eid}
                            className={`w-full text-left text-sm px-3 py-2 rounded ${
                              entitlementEdit.id === eid ? "bg-blue-600/40 border border-blue-400/40" : "bg-white/5"
                            }`}
                            onClick={() => void handleSelectEntitlement(eid)}
                          >
                            {(ent.leaveType as any)?.name || "Leave"} — Remaining {ent.remaining} (Pending {ent.pending})
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No entitlements loaded.</p>
                  )}

                  {entitlementEdit.id ? (
                    <form className="space-y-2" onSubmit={handleUpdateEntitlement}>
                      <Label className="text-sm">Edit entitlement balance</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={entitlementEdit.yearlyEntitlement}
                          onChange={(e) =>
                            setEntitlementEdit((p) => ({ ...p, yearlyEntitlement: e.target.value }))
                          }
                          placeholder="Yearly entitlement"
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Input
                          type="number"
                          value={entitlementEdit.carryForward}
                          onChange={(e) => setEntitlementEdit((p) => ({ ...p, carryForward: e.target.value }))}
                          placeholder="Carry forward"
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Input
                          type="number"
                          value={entitlementEdit.accruedActual}
                          onChange={(e) => setEntitlementEdit((p) => ({ ...p, accruedActual: e.target.value }))}
                          placeholder="Accrued actual"
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Input
                          type="number"
                          value={entitlementEdit.accruedRounded}
                          onChange={(e) => setEntitlementEdit((p) => ({ ...p, accruedRounded: e.target.value }))}
                          placeholder="Accrued rounded"
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Input
                          type="number"
                          value={entitlementEdit.taken}
                          onChange={(e) => setEntitlementEdit((p) => ({ ...p, taken: e.target.value }))}
                          placeholder="Taken"
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Input
                          type="number"
                          value={entitlementEdit.pending}
                          onChange={(e) => setEntitlementEdit((p) => ({ ...p, pending: e.target.value }))}
                          placeholder="Pending"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Update entitlement
                      </Button>
                    </form>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {can("canManagePolicies") ? (
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Calendars</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                  <div className="flex-1">
                    <Label className="text-sm">Year</Label>
                    <Input
                      type="number"
                      value={calendarYear}
                      onChange={(e) => setCalendarYear(e.target.value)}
                      placeholder="e.g. 2025"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleLoadCalendar} disabled={calendarLoading || !calendarYear}>
                      {calendarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load calendar"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCreateCalendar}
                      disabled={calendarLoading || !calendarYear}
                    >
                      Create calendar
                    </Button>
                  </div>
                </div>

                {calendar ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold">Blocked periods</h4>
                      {calendar.blockedPeriods?.length ? (
                        <div className="space-y-2">
                          {calendar.blockedPeriods.map((bp, idx) => (
                            <div
                              key={`${bp.from}-${bp.to}-${idx}`}
                              className="flex items-center justify-between bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                            >
                              <div>
                                {bp.from?.toString()?.slice(0, 10)} - {bp.to?.toString()?.slice(0, 10)} ({bp.reason})
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-rose-200"
                                onClick={() => void handleRemoveBlocked(idx)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No blocked periods.</p>
                      )}
                      <form className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2" onSubmit={handleAddBlocked}>
                        <Input
                          type="date"
                          value={blockedForm.from}
                          onChange={(e) => setBlockedForm((p) => ({ ...p, from: e.target.value }))}
                          min={calendarYear ? `${calendarYear}-01-01` : undefined}
                          max={calendarYear ? `${calendarYear}-12-31` : undefined}
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                        <Input
                          type="date"
                          value={blockedForm.to}
                          onChange={(e) => setBlockedForm((p) => ({ ...p, to: e.target.value }))}
                          min={calendarYear ? `${calendarYear}-01-01` : undefined}
                          max={calendarYear ? `${calendarYear}-12-31` : undefined}
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                        <div className="flex gap-2">
                          <Input
                            value={blockedForm.reason}
                            onChange={(e) => setBlockedForm((p) => ({ ...p, reason: e.target.value }))}
                            placeholder="Reason"
                            className="bg-white/5 border-white/10 text-white"
                            required
                          />
                          <Button type="submit" disabled={calendarLoading}>
                            Add
                          </Button>
                        </div>
                      </form>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold">Holidays</h4>
                      {calendar.holidays?.length ? (
                        <div className="space-y-2">
                          {calendar.holidays.map((h, idx) => {
                            const hid = (h as any)?._id || (h as any)?.id || h;
                            const name = (h as any)?.name || (h as any)?.type || "Holiday";
                            const start = (h as any)?.startDate
                              ? (h as any).startDate.toString().slice(0, 10)
                              : undefined;
                            const end = (h as any)?.endDate
                              ? (h as any).endDate.toString().slice(0, 10)
                              : undefined;
                            const label = `${name}${start ? ` (${start}${end ? ` - ${end}` : ""})` : ""}`;
                            return (
                              <div
                                key={`${hid}-${idx}`}
                                className="flex items-center justify-between bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                              >
                                <span>{label}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-rose-200"
                                  onClick={() => void handleRemoveHoliday(hid.toString())}
                                >
                                  Remove
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No holidays linked.</p>
                      )}
                      <form className="flex flex-col sm:flex-row gap-2 mt-2" onSubmit={handleAddHoliday}>
                        <Select
                          value={holidayId || "__none"}
                          onValueChange={(value) => {
                            setHolidayId(value === "__none" ? "" : value);
                          }}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select holiday to link" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 text-white border-white/10 max-h-64 overflow-auto">
                            <SelectItem value="__none">Select holiday</SelectItem>
                            {holidays.map((h) => {
                              const hid = (h as any).id || (h as any)._id;
                              if (!hid) return null;
                              const label = `${h.name || h.type || "Holiday"} (${h.startDate?.slice(0, 10)}${
                                h.endDate ? ` - ${h.endDate.slice(0, 10)}` : ""
                              })`;
                              return (
                                <SelectItem key={hid} value={hid.toString()}>
                                  {label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button type="submit" disabled={calendarLoading || !holidayId}>
                          Add holiday
                        </Button>
                      </form>
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3" onSubmit={handleCreateHoliday}>
                        <Input
                          value={holidayForm.name}
                          onChange={(e) => setHolidayForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Holiday name"
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                        <Select
                          value={holidayForm.type || "__none"}
                          onValueChange={(value) =>
                            setHolidayForm((p) => ({ ...p, type: value === "__none" ? "" : value }))
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 text-white border-white/10">
                            <SelectItem value="__none">Select type</SelectItem>
                            {HOLIDAY_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={holidayForm.startDate}
                          onChange={(e) => setHolidayForm((p) => ({ ...p, startDate: e.target.value }))}
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                        <Input
                          type="date"
                          value={holidayForm.endDate}
                          onChange={(e) => setHolidayForm((p) => ({ ...p, endDate: e.target.value }))}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="End date (optional)"
                        />
                        <Button type="submit" className="md:col-span-2" disabled={calendarLoading}>
                          Create holiday
                        </Button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Load a calendar to view blocked periods and holidays.</p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </main>
      </div>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function renderEmployee(employee: any) {
  if (typeof employee === "string") return employee;
  if (employee?.fullName) return employee.fullName;
  if (employee?._id) return employee._id;
  return "Unknown";
}
