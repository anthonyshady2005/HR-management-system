"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, redirect } from "next/navigation";
import {
    AlertCircle,
    CheckCircle2,
    TicketCheck,
    TicketX,
    FlagTriangleRight, 
    Loader2,
    ShieldCheck,
    Users,
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
    cancelLeaveRequest,
    createAdjustment,
    createLeaveCategory,
    createLeaveType,
    fetchPolicies,
    fetchPositionOptions,
    createLeavePolicy,
    updateLeavePolicy,
    fetchAllRequests,
    fetchLeaveCategories,
    fetchLeaveTypes,
    flagIrregularRequest,
    overrideRequest,
    runAccrual,
    runStaleEscalations,
    updateLeaveCategory,
    updateLeaveType,
    createEntitlement,
    createPersonalizedEntitlement,
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
    getAttachmentDownloadUrl,
    fetchEntitlementsByEmployee,
    LeaveEntitlement,
    AuditTrailEntry,
    fetchAuditTrail,
    createBatchEntitlement,
    BatchEntitlementResponse,
    updateEntitlement,
    updateApprovalFlow,
    ApprovalFlowStep,
    fetchEmployeeRequests,
    fetchHeadDepartments,
    bulkUpdateRequests,
    fetchOverlappingLeaves,
    OverlappingLeavesResponse,
} from "@/app/leaves/services/leaves";

const ALLOWED_ROLES = ["department head", "HR Manager", "HR Admin", "System Admin"];

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

// Keep in sync with backend enums
const ACCRUAL_METHOD_OPTIONS = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "per-term", label: "Per term" },
] as const;

const ROUNDING_RULE_OPTIONS = [
    { value: "none", label: "None" },
    { value: "round", label: "Round to nearest" },
    { value: "round_up", label: "Round up" },
    { value: "round_down", label: "Round down" },
] as const;

// Mirror employee-profile enums (keep in sync if enums change) - used as fallback
const DEFAULT_JOB_POSITION_OPTIONS = [
    "INTERN",
    "JUNIOR",
    "MID",
    "SENIOR",
    "LEAD",
    "MANAGER",
    "DIRECTOR",
    "VP",
    "C_LEVEL",
] as const;

const CONTRACT_TYPE_OPTIONS = ["FULL_TIME_CONTRACT", "PART_TIME_CONTRACT"] as const;
const ATTACHMENT_TYPE_OPTIONS = ["medical", "document", "other"] as const;

const normalizeRole = (role?: string | null) => (role || "").trim().toLowerCase();

type Filters = {
    status: string;
    leaveTypeId: string;
    employeeId: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: "dates.from" | "createdAt";
    sortOrder?: "asc" | "desc";
    paid?: "all" | "paid" | "unpaid";
};

type PolicyFormState = {
    leaveTypeId: string;
    accrualMethod: string;
    monthlyRate: string;
    yearlyRate: string;
    carryForwardAllowed: boolean;
    maxCarryForward: string;
    expiryAfterMonths: string;
    roundingRule: string;
    minNoticeDays: string;
    maxConsecutiveDays: string;
    eligibilityMinTenureMonths: string;
    eligibilityPositions: string[];
    eligibilityContracts: string[];
};

export default function LeavesDashboardPage() {
    const { status, user, currentRole } = useAuth();
    const router = useRouter();

    useRequireRole(ALLOWED_ROLES, "/");

    const normalizedRole = normalizeRole(currentRole);
    const can = (capability: Capability) =>
        ROLE_CAPABILITIES[capability].map(normalizeRole).includes(normalizedRole);
    const canEditApprovalFlow = ["hr admin", "system admin","department head", "HR Manager"].includes(normalizedRole);
    const canEditEntitlementsFully = ["hr admin", "system admin"].includes(normalizedRole);

    const [filters, setFilters] = useState<Filters>({
        status: "",
        leaveTypeId: "",
        employeeId: "",
        departmentId: "",
        startDate: "",
        endDate: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        paid: "all",
    });
    const [positionOptions, setPositionOptions] = useState<string[]>([...DEFAULT_JOB_POSITION_OPTIONS]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [submittingAdjustment, setSubmittingAdjustment] = useState(false);
    const [adjustment, setAdjustment] = useState({
        employeeId: "",
        leaveTypeId: "",
        leaveTypeLabel: "",
        adjustmentType: "add" as "add" | "deduct" | "encashment",
        amount: "",
        reason: "",
    });
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [policies, setPolicies] = useState<LeavePolicy[]>([]);
    const [policyForm, setPolicyForm] = useState<PolicyFormState>({
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
        eligibilityMinTenureMonths: "",
        eligibilityPositions: [],
        eligibilityContracts: [],
    });
    const [policyEdits, setPolicyEdits] = useState<Record<string, PolicyFormState>>({});
    const [policySavingId, setPolicySavingId] = useState<string | null>(null);
    const [expandedPolicyIds, setExpandedPolicyIds] = useState<Set<string>>(new Set());
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
    const [entitlementDetails, setEntitlementDetails] = useState<LeaveEntitlement | null>(null);
    const [entitlementEditForm, setEntitlementEditForm] = useState({
        yearlyEntitlement: "",
        accruedActual: "",
        accruedRounded: "",
        carryForward: "",
        taken: "",
        pending: "",
        remaining: "",
        lastAccrualDate: "",
        nextResetDate: "",
    });
    const [savingEntitlement, setSavingEntitlement] = useState(false);
    const [pendingEntitlementUpdate, setPendingEntitlementUpdate] = useState<{
        id: string;
        payload: any;
    } | null>(null);
    const [entitlementAdjustmentMode, setEntitlementAdjustmentMode] = useState(false);
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
        paid: true,
        deductible: true,
        requiresAttachment: false,
        attachmentType: "",
        minTenureMonths: "",
        maxDurationDays: "",
    });
    const [editType, setEditType] = useState({
        id: "",
        code: "",
        name: "",
        categoryId: "",
        description: "",
        paid: true,
        deductible: true,
        requiresAttachment: false,
        attachmentType: "",
        minTenureMonths: "",
        maxDurationDays: "",
    });
    const [profile, setProfile] = useState<any | null>(null);
    const [notifications, setNotifications] = useState<NotificationLog[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
    const [auditEmployeeId, setAuditEmployeeId] = useState("");
    const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    // Bulk selection state
    const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [bulkResult, setBulkResult] = useState<{
        successCount: number;
        failedCount: number;
        failures: Array<{ requestId: string; error: string }>;
    } | null>(null);

    // Batch entitlement state
    const [batchEntitlementForm, setBatchEntitlementForm] = useState({
        employeeIds: "",
        leaveTypeId: "",
        yearlyEntitlement: "",
        accruedActual: "",
        accruedRounded: "",
        carryForward: "",
        personalized: false,
    });
    const [batchResult, setBatchResult] = useState<BatchEntitlementResponse | null>(null);
    const [batchSubmitting, setBatchSubmitting] = useState(false);
    const [runningEscalations, setRunningEscalations] = useState(false);


    // Approval flow editing state
    const [showApprovalFlowModal, setShowApprovalFlowModal] = useState(false);
    const [editingApprovalFlow, setEditingApprovalFlow] = useState<ApprovalFlowStep[]>([]);
    const [savingApprovalFlow, setSavingApprovalFlow] = useState(false);

    // Department head diagnostics
    const [headDepartments, setHeadDepartments] = useState<Array<{ id: string; name?: string; code?: string }> | null>(null);

    // Overlapping leaves for department head
    const [overlappingLeaves, setOverlappingLeaves] = useState<OverlappingLeavesResponse | null>(null);
    const [overlappingLoading, setOverlappingLoading] = useState(false);
    const [showOverlappingOnly, setShowOverlappingOnly] = useState(true);

    const totalDurationDays = useMemo(
        () => requests.reduce((sum, req) => sum + getRequestDurationDays(req), 0),
        [requests],
    );

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/auth/login");
        }
    }, [status, router]);

    const loadBase = async () => {
        setError(null);
        try {
            const [types, cats, pols, hols, posOpts, depts] = await Promise.all([
                fetchLeaveTypes().catch(() => []),
                fetchLeaveCategories().catch(() => []),
                can("canManagePolicies") ? fetchPolicies().catch(() => []) : Promise.resolve([]),
                // Holidays endpoint may be restricted; skip for employees
                can("canSeeAllRequests") || normalizedRole === "department head"
                    ? fetchHolidays().catch(() => [])
                    : Promise.resolve([]),
                fetchPositionOptions().catch(() => DEFAULT_JOB_POSITION_OPTIONS),
                fetchHeadDepartments().catch(() => []),
            ]);
            setLeaveTypes(types || []);
            setCategories(cats || []);
            setPolicies(pols || []);
            setHolidays(hols || []);
            const mergedPositions = Array.from(
                new Set([...(posOpts || []), ...DEFAULT_JOB_POSITION_OPTIONS]),
            );
            setPositionOptions(mergedPositions);
            setHeadDepartments(depts || []);
        } catch (err: any) {
            setPositionOptions([...DEFAULT_JOB_POSITION_OPTIONS]);
            setError(err?.response?.data?.message || "Failed to load leave catalog.");
        }
    };

    const getPolicyId = (pol: any) => pol?.id?.toString?.() || pol?._id?.toString?.() || "";
    const getPolicyLeaveTypeId = (pol: any) =>
        pol?.leaveType?._id?.toString?.() ||
        pol?.leaveType?.id?.toString?.() ||
        pol?.leaveType?.toString?.() ||
        pol?.leaveTypeId?._id?.toString?.() ||
        pol?.leaveTypeId?.id?.toString?.() ||
        (typeof pol?.leaveTypeId === "string" ? pol.leaveTypeId : "") ||
        "";
    const toPolicyFormState = (pol?: any): PolicyFormState => {
        const leaveTypeId = pol ? getPolicyLeaveTypeId(pol) : "";
        return {
            leaveTypeId: leaveTypeId || "",
            accrualMethod: pol?.accrualMethod || "",
            monthlyRate: pol?.monthlyRate?.toString?.() || "",
            yearlyRate: pol?.yearlyRate?.toString?.() || "",
            carryForwardAllowed: Boolean(pol?.carryForwardAllowed),
            maxCarryForward: pol?.maxCarryForward?.toString?.() || "",
            expiryAfterMonths: pol?.expiryAfterMonths?.toString?.() || "",
            roundingRule: pol?.roundingRule || "",
            minNoticeDays: pol?.minNoticeDays?.toString?.() || "",
            maxConsecutiveDays: pol?.maxConsecutiveDays?.toString?.() || "",
            eligibilityMinTenureMonths: pol?.eligibility?.minTenureMonths?.toString?.() || "",
            eligibilityPositions: Array.isArray(pol?.eligibility?.positionsAllowed)
                ? pol.eligibility.positionsAllowed
                : [],
            eligibilityContracts: Array.isArray(pol?.eligibility?.contractTypesAllowed)
                ? pol.eligibility.contractTypesAllowed
                : [],
        };
    };

    const toPolicyPayload = (form: PolicyFormState) => ({
        leaveTypeId: form.leaveTypeId,
        accrualMethod: form.accrualMethod || undefined,
        monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
        yearlyRate: form.yearlyRate ? Number(form.yearlyRate) : undefined,
        carryForwardAllowed: form.carryForwardAllowed,
        maxCarryForward: form.maxCarryForward ? Number(form.maxCarryForward) : undefined,
        expiryAfterMonths: form.expiryAfterMonths ? Number(form.expiryAfterMonths) : undefined,
        roundingRule: form.roundingRule || undefined,
        minNoticeDays: form.minNoticeDays ? Number(form.minNoticeDays) : undefined,
        maxConsecutiveDays: form.maxConsecutiveDays ? Number(form.maxConsecutiveDays) : undefined,
        eligibility:
            form.eligibilityMinTenureMonths ||
            form.eligibilityPositions.length ||
            form.eligibilityContracts.length
                ? {
                    minTenureMonths: form.eligibilityMinTenureMonths
                        ? Number(form.eligibilityMinTenureMonths)
                        : undefined,
                    positionsAllowed: form.eligibilityPositions.length ? form.eligibilityPositions : undefined,
                    contractTypesAllowed: form.eligibilityContracts.length ? form.eligibilityContracts : undefined,
                }
                : undefined,
    });

    useEffect(() => {
        const mapped: Record<string, PolicyFormState> = {};
        policies.forEach((pol) => {
            const pid = getPolicyId(pol);
            if (!pid) return;
            mapped[pid] = toPolicyFormState(pol);
        });
        setPolicyEdits(mapped);
    }, [policies]);

    const togglePolicyExpanded = (pid: string) => {
        setExpandedPolicyIds((prev) => {
            const next = new Set(prev);
            if (next.has(pid)) {
                next.delete(pid);
            } else {
                next.add(pid);
            }
            return next;
        });
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
            } else if (normalizedRole === "department employee") {
                setFilters((prev) => ({ ...prev, employeeId: user.id }));
            }
        } catch (err) {
            // If the profile endpoint is forbidden for this role, fall back to backend scoping
            console.warn("Failed to load profile for scoped view", err);
            if (normalizedRole === "department employee") {
                setFilters((prev) => ({ ...prev, employeeId: user.id }));
            }
        }
    };

    const loadRequests = async () => {
        setError(null);
        setLoading(true);
        try {
            // Employee vs elevated roles
            if (normalizedRole === "department employee") {
                const myReqs = await fetchEmployeeRequests({
                    status: filters.status || undefined,
                    leaveTypeId: filters.leaveTypeId || undefined,
                    startDate: filters.startDate || undefined,
                    endDate: filters.endDate || undefined,
                    sortBy: filters.sortBy || "createdAt",
                    sortOrder: filters.sortOrder || "desc",
                });
                const reqs = (myReqs || []).map((r: any) => ({
                    ...r,
                    id: r?.id?.toString?.() || r?._id?.toString?.() || r?.id || r?._id,
                }));
                setRequests(reqs);
                return;
            }

            const baseFilters: any = {
                status: filters.status || undefined,
                leaveTypeId: filters.leaveTypeId || undefined,
                employeeId: filters.employeeId || undefined,
                departmentId: filters.departmentId || undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
                sortBy: filters.sortBy || "createdAt",
                sortOrder: filters.sortOrder || "desc",
                paid:
                    filters.paid === "paid"
                        ? true
                        : filters.paid === "unpaid"
                            ? false
                            : undefined,
            };

            if (!can("canSeeAllRequests")) {
                const deptId =
                    filters.departmentId ||
                    (profile as any)?.department?._id ||
                    (profile as any)?.department?.id ||
                    (profile as any)?.department?.toString?.();
                if (deptId) {
                    baseFilters.departmentId = deptId;
                } else if (normalizedRole === "department head") {
                    // Let backend auto-scope department heads to their managed departments
                    baseFilters.departmentId = headDepartments?.map((d) => d.id) || undefined;
                    baseFilters.employeeId = undefined;
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
            const data = await fetchNotifications(user.id);
            setNotifications(data || []);
        } catch (err) {
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
            // Department head, HR Admin, HR Manager, System Admin: load departments for dropdown
            if (
                normalizedRole === "department head" ||
                normalizedRole === "hr admin" ||
                normalizedRole === "hr manager" ||
                normalizedRole === "system admin"
            ) {
                fetchHeadDepartments()
                    .then((depts) => setHeadDepartments(depts || []))
                    .catch(() => setHeadDepartments([]));
            } else {
                setHeadDepartments(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, user?.id, normalizedRole]);

    useEffect(() => {
        if (status === "authenticated") {
            void loadRequests();
        }
    }, [
        status,
        filters.status,
        filters.leaveTypeId,
        filters.employeeId,
        filters.departmentId,
        filters.startDate,
        filters.endDate,
        filters.sortBy,
        filters.sortOrder,
        filters.paid,
        normalizedRole,
    ]);

    useEffect(() => {
        if (status === "authenticated" && user?.id) {
            void loadNotifications();
        }
    }, [status, user?.id]);
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

    const getPendingRole = (req: LeaveRequest): string | null => {
        const step = req.approvalFlow?.find((s) => s.status === "pending");
        return step?.role?.toLowerCase?.() || null;
    };

    const fetchAndSelectRequest = async (req: LeaveRequest) => {
        setSelectedRequest(req);
        return req;
    };

    const normalizeApprovalFlowForEdit = (flow?: any[]): ApprovalFlowStep[] =>
        (flow || []).map((step: any) => {
            const decidedByRaw =
                typeof step?.decidedBy === "string"
                    ? step.decidedBy
                    : step?.decidedBy?._id?.toString?.() ||
                      step?.decidedBy?.id?.toString?.() ||
                      step?.decidedBy?.toString?.();
            const decidedBy = decidedByRaw?.trim?.();

            return {
                role: step?.role || "",
                status: (step?.status as ApprovalFlowStep["status"]) || "pending",
                decidedBy: decidedBy || undefined,
                decidedAt: step?.decidedAt || undefined,
            };
        });

    // Check if the current user's approval step is pending
    const canUserApproveRequest = (req: LeaveRequest): boolean => {
        if (!can("canApprove")) return false;

        // Determine which step this user can approve
        const userStep = ["hr admin", "hr manager"].includes(normalizedRole) ? "HR" : "Manager";

        // Check if that step is pending
        const isPending = req.approvalFlow?.some(
            (s) => s.role === userStep && s.status === "pending"
        );

        return isPending || false;
    };

    // Check if user is HR role (for bulk operations)
    const isHRRole = ["hr admin", "hr manager"].includes(normalizedRole);

    const handleStatus = async (req: LeaveRequest, next: "approved" | "rejected") => {
        if (!user?.id) return;
        if (!can("canApprove")) return;
        const id = req.id;
        setBusyId(id);
        setActionMessage(null);
        setError(null);
        try {
            // Determine which step this user should approve based on their role
            // HR roles approve the HR step, others approve the Manager step
            const flowRole =
                ["hr admin", "hr manager"].includes(normalizedRole)
                    ? "HR"
                    : "Manager";
            await updateRequestStatus(id, next, user.id, flowRole as any);

            // Generate contextual message based on approval step and decision
            let message = "";
            if (next === "rejected") {
                message = `Request rejected at ${flowRole} step.`;
            } else {
                // Approval message depends on which step was approved
                if (flowRole === "HR") {
                    message = "HR step approved. Request will be fully approved if Manager also approves.";
                } else {
                    // Manager or Department Head approving
                    message = "Manager step approved. Waiting for HR approval to finalize.";
                }
            }
            setActionMessage(message);
            await loadRequests();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Action failed.");
        } finally {
            setBusyId(null);
        }
    };

    const toggleRequestSelection = (requestId: string) => {
        setSelectedRequestIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(requestId)) {
                newSet.delete(requestId);
            } else {
                newSet.add(requestId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        // Only select requests where HR step is pending and status is not cancelled
        const selectableRequests = requests.filter((req) => {
            const hrStep = req.approvalFlow?.find((s) => s.role === "HR");
            return hrStep?.status === "pending" && req.status !== "cancelled";
        });

        if (selectedRequestIds.size === selectableRequests.length && selectableRequests.length > 0) {
            setSelectedRequestIds(new Set());
        } else {
            setSelectedRequestIds(new Set(selectableRequests.map((r) => r.id)));
        }
    };

    const handleBulkAction = async (action: "approved" | "rejected") => {
        if (selectedRequestIds.size === 0) {
            setError("Please select at least one request");
            return;
        }

        // Bulk operations are only for HR roles
        if (!["hr admin", "hr manager"].includes(normalizedRole)) {
            setError("Bulk operations are only available for HR managers and HR admins");
            return;
        }

        setBulkProcessing(true);
        setError(null);
        setActionMessage(null);
        setBulkResult(null);

        try {
            // Bulk operations always apply to HR step
            const result = await bulkUpdateRequests(
                Array.from(selectedRequestIds),
                action,
                "HR",
            );

            setBulkResult(result);

            if (result.successCount > 0) {
                setActionMessage(
                    `Bulk ${action}: ${result.successCount} successful${
                        result.failedCount > 0 ? `, ${result.failedCount} failed` : ""
                    }`,
                );
            }

            if (result.failedCount > 0) {
                const errorSummary = result.failures.map((f) => `${f.requestId}: ${f.error}`).join("; ");
                setError(`Some requests failed: ${errorSummary}`);
            }

            // Clear selection and reload
            setSelectedRequestIds(new Set());
            await loadRequests();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Bulk action failed.");
        } finally {
            setBulkProcessing(false);
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
                paid: newType.paid,
                deductible: newType.deductible,
                requiresAttachment: newType.requiresAttachment,
                attachmentType: newType.attachmentType || undefined,
                minTenureMonths: newType.minTenureMonths !== "" ? Number(newType.minTenureMonths) : undefined,
                maxDurationDays: newType.maxDurationDays !== "" ? Number(newType.maxDurationDays) : undefined,
            });
            setNewType({
                code: "",
                name: "",
                categoryId: "",
                description: "",
                paid: true,
                deductible: true,
                requiresAttachment: false,
                attachmentType: "",
                minTenureMonths: "",
                maxDurationDays: "",
            });
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
                paid: editType.paid,
                deductible: editType.deductible,
                requiresAttachment: editType.requiresAttachment,
                attachmentType: editType.attachmentType || undefined,
                minTenureMonths: editType.minTenureMonths !== "" ? Number(editType.minTenureMonths) : undefined,
                maxDurationDays: editType.maxDurationDays !== "" ? Number(editType.maxDurationDays) : undefined,
            });
            setEditType({
                id: "",
                code: "",
                name: "",
                categoryId: "",
                description: "",
                paid: true,
                deductible: true,
                requiresAttachment: false,
                attachmentType: "",
                minTenureMonths: "",
                maxDurationDays: "",
            });
            await loadBase();
            setActionMessage("Leave type updated.");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Update leave type failed.");
        }
    };

    const resetPolicyForm = () => setPolicyForm(toPolicyFormState());

    const handleCreatePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!can("canManagePolicies")) return;
        if (!policyForm.leaveTypeId) {
            setError("Select a leave type to create a policy.");
            return;
        }
        setActionMessage(null);
        setError(null);
        const payload = toPolicyPayload(policyForm);
        try {
            await createLeavePolicy(payload);
            setActionMessage("Policy created.");
            resetPolicyForm();
            await loadBase();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Policy save failed.");
        }
    };

    const findPolicyById = (id: string) => policies.find((p) => getPolicyId(p) === id);

    const setPolicyEditState = (id: string, updates: Partial<PolicyFormState>) => {
        setPolicyEdits((prev) => {
            const base = prev[id] || toPolicyFormState(findPolicyById(id));
            return { ...prev, [id]: { ...base, ...updates } };
        });
    };

    const handleUpdatePolicyInline = async (id: string) => {
        const form = policyEdits[id] || toPolicyFormState(findPolicyById(id));
        if (!form || !form.leaveTypeId) {
            setError("Select a leave type before updating the policy.");
            return;
        }
        if (!can("canManagePolicies")) return;
        setActionMessage(null);
        setError(null);
        setPolicySavingId(id);
        const payload = toPolicyPayload(form);
        try {
            await updateLeavePolicy(id, payload);
            setActionMessage("Policy updated.");
            await loadBase();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Policy update failed.");
        } finally {
            setPolicySavingId(null);
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

    const handleLoadAuditTrail = async (employeeIdParam?: string) => {
        const targetId = normalizeId(employeeIdParam ?? auditEmployeeId);
        if (!targetId || !can("canManagePolicies")) return;
        setAuditEmployeeId(targetId);
        setAuditLoading(true);
    setError(null);
    setActionMessage(null);
    try {
      const entries = await fetchAuditTrail(targetId);
      setAuditTrail(entries || []);
    } catch (err: any) {
      setAuditTrail([]);
      setError(err?.response?.data?.message || "Failed to load audit trail.");
    } finally {
            setAuditLoading(false);
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

    const normalizeId = (raw: any) =>
        typeof raw === "string"
            ? raw
            : raw?._id?.toString?.() || raw?.id?.toString?.() || raw?.toString?.() || "";

    const getEntitlementLeaveTypeId = (ent: any) =>
        ent?.leaveTypeId?._id?.toString?.() ||
        ent?.leaveTypeId?.id?.toString?.() ||
        (typeof ent?.leaveTypeId === "string" ? ent.leaveTypeId : ent?.leaveTypeId?.toString?.()) ||
        ent?.leaveType?._id?.toString?.() ||
        ent?.leaveType?.id?.toString?.() ||
        "";

    const getEntitlementDisplay = (ent: any) => {
        const lt = ent?.leaveType;
        const ltId = getEntitlementLeaveTypeId(ent);
        const fromList = leaveTypes.find((ltItem) => {
            const lid = (ltItem as any).id || (ltItem as any)._id;
            return lid?.toString?.() === ltId;
        });
        const name =
            (typeof lt === "string" && lt) ||
            (lt as any)?.name ||
            (lt as any)?.code ||
            (ent as any)?.leaveTypeId?.name ||
            (ent as any)?.leaveTypeId?.code ||
            fromList?.name ||
            fromList?.code ||
            "Leave";
        const code =
            (lt as any)?.code ||
            (ent as any)?.leaveTypeId?.code ||
            (lt as any)?.id ||
            (lt as any)?._id ||
            fromList?.code ||
            fromList?.id ||
            fromList?._id ||
            "";
        return { name, code };
    };

    const getEntitlementId = (ent: any) =>
        ent?.id || ent?._id || (typeof ent?.entitlementId === "string" ? ent.entitlementId : "");

    const numToStr = (val: any) =>
        val === undefined || val === null || Number.isNaN(val) ? "" : `${val}`;

    const setEntitlementFormFromData = (ent: any) => {
        const toDateInput = (val?: string) => {
            if (!val) return "";
            const d = new Date(val);
            return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
        };

        setEntitlementEditForm({
            yearlyEntitlement: numToStr(ent?.yearlyEntitlement),
            accruedActual: numToStr(ent?.accruedActual),
            accruedRounded: numToStr(ent?.accruedRounded),
            carryForward: numToStr(ent?.carryForward),
            taken: numToStr(ent?.taken),
            pending: numToStr(ent?.pending),
            remaining: numToStr(ent?.remaining),
            lastAccrualDate: toDateInput(ent?.lastAccrualDate),
            nextResetDate: toDateInput(ent?.nextResetDate),
        });
    };

    const handleLoadEntitlements = async (employeeIdParam?: string | any) => {
        const targetEmployeeId = normalizeId(employeeIdParam ?? entitlementSearchEmployee);
        if (!targetEmployeeId) {
            setEntitlements([]);
            return;
        }
        setEntitlementSearchEmployee(targetEmployeeId);
        setError(null);
        try {
            const data = await fetchEntitlementsByEmployee(targetEmployeeId);
            setEntitlements(data || []);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load entitlements.");
        }
    };

    const openAdjustmentModal = (ent: any) => {
        const leaveTypeId = getEntitlementLeaveTypeId(ent);
        const empId = normalizeId(ent?.employeeId || entitlementSearchEmployee);
        if (!leaveTypeId || !empId) {
            setError("Missing employee or leave type for adjustment.");
            return;
        }
        const disp = getEntitlementDisplay(ent);
        setAdjustment({
            employeeId: empId,
            leaveTypeId,
            leaveTypeLabel: `${disp.name}${disp.code ? ` (${disp.code})` : ""}`,
            adjustmentType: "add",
            amount: "",
            reason: "",
        });
        setEntitlementAdjustmentMode(false);
        setPendingEntitlementUpdate(null);
        setShowAdjustmentModal(true);
    };

    const closeAdjustmentModal = () => {
        setShowAdjustmentModal(false);
        setEntitlementAdjustmentMode(false);
        setPendingEntitlementUpdate(null);
    };

    const openEntitlementDetails = (ent: any) => {
        setEntitlementDetails(ent as any);
        setEntitlementFormFromData(ent);
    };

    const handleSaveEntitlementDetails = async () => {
        if (!entitlementDetails) return;
        const entitlementId = getEntitlementId(entitlementDetails);
        if (!entitlementId) return;

        setError(null);
        setActionMessage(null);

        const payload: any = {};

        if (canEditEntitlementsFully) {
            const numericFields: Array<{ key: keyof typeof entitlementEditForm; name: string }> = [
                { key: "yearlyEntitlement", name: "yearlyEntitlement" },
                { key: "accruedActual", name: "accruedActual" },
                { key: "accruedRounded", name: "accruedRounded" },
                { key: "carryForward", name: "carryForward" },
                { key: "taken", name: "taken" },
                { key: "pending", name: "pending" },
            ];
            numericFields.forEach(({ key, name }) => {
                const raw = entitlementEditForm[key];
                if (raw !== undefined && raw !== null && raw !== "") {
                    const num = Number(raw);
                    if (Number.isFinite(num)) {
                        payload[name] = num;
                    }
                }
            });
        }

        if (entitlementEditForm.lastAccrualDate) {
            const d = new Date(entitlementEditForm.lastAccrualDate);
            if (!Number.isNaN(d.getTime())) {
                payload.lastAccrualDate = d.toISOString();
            }
        }

        if (entitlementEditForm.nextResetDate) {
            const d = new Date(entitlementEditForm.nextResetDate);
            if (!Number.isNaN(d.getTime())) {
                payload.nextResetDate = d.toISOString();
            }
        }

        setPendingEntitlementUpdate({ id: entitlementId, payload });

        const leaveTypeId = getEntitlementLeaveTypeId(entitlementDetails);
        const disp = getEntitlementDisplay(entitlementDetails);

        setAdjustment({
            employeeId: normalizeId(entitlementDetails.employeeId),
            leaveTypeId,
            leaveTypeLabel: `${disp.name}${disp.code ? ` (${disp.code})` : ""}`,
            adjustmentType: "add",
            amount: "0",
            reason: "",
        });

        setEntitlementAdjustmentMode(true);
        setShowAdjustmentModal(true);
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



    const handleAdjustment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!can("canAdjust")) return;
        if (!user?.id) return;
        const parsedAmount = Number(adjustment.amount);
        const isEntitlementUpdate = entitlementAdjustmentMode && pendingEntitlementUpdate;
        if (!adjustment.employeeId || !adjustment.leaveTypeId) {
            setError("Select an entitlement before creating an adjustment.");
            return;
        }
        if (!Number.isFinite(parsedAmount) || (!isEntitlementUpdate && parsedAmount <= 0)) {
            setError(isEntitlementUpdate ? "Amount must be a number." : "Enter a positive adjustment amount.");
            return;
        }
        const reason = adjustment.reason.trim();
        if (!reason) {
            setError("Adjustment reason is required.");
            return;
        }
        setSubmittingAdjustment(true);
        setError(null);
        setActionMessage(null);
        try {
            await createAdjustment({
                employeeId: adjustment.employeeId,
                leaveTypeId: adjustment.leaveTypeId,
                adjustmentType: adjustment.adjustmentType as any,
                amount: parsedAmount,
                reason,
                hrUserId: user.id,
            });
            if (isEntitlementUpdate && pendingEntitlementUpdate) {
                setSavingEntitlement(true);
                const updated = await updateEntitlement(pendingEntitlementUpdate.id, pendingEntitlementUpdate.payload);
                setEntitlementDetails(null);
                setEntitlementFormFromData(updated);
                setEntitlements((prev) =>
                    prev.map((e) => (getEntitlementId(e) === pendingEntitlementUpdate.id ? (updated as any) : e)),
                );
                setActionMessage("Entitlement updated.");
                setPendingEntitlementUpdate(null);
                setEntitlementAdjustmentMode(false);
                closeAdjustmentModal();
            } else {
                setActionMessage("Adjustment created.");
                const refreshEmployee = adjustment.employeeId;
                setAdjustment({
                    employeeId: "",
                    leaveTypeId: "",
                    leaveTypeLabel: "",
                    adjustmentType: "add",
                    amount: "",
                    reason: "",
                });
                closeAdjustmentModal();
                if (refreshEmployee) {
                    setEntitlementSearchEmployee(refreshEmployee);
                    await handleLoadEntitlements(refreshEmployee);
                    await handleLoadAuditTrail(refreshEmployee);
                }
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Adjustment failed.");
        } finally {
            setSubmittingAdjustment(false);
            setSavingEntitlement(false);
        }
    };

    const handleRunAccrual = async () => {
        if (!can("canRunOps")) return;
        setActionMessage(null);
        setError(null);
        setLoading(true);
        try {
            await runAccrual();
            setActionMessage("Accrual triggered successfully.");
            await loadRequests();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleRunStaleEscalations = async () => {
        if (!can("canRunOps")) return;
        setActionMessage(null);
        setError(null);
        setRunningEscalations(true);
        try {
            const res = await runStaleEscalations();
            setActionMessage(res?.message || "Stale approvals escalation triggered.");
            await loadRequests();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Operation failed.");
        } finally {
            setRunningEscalations(false);
        }
    };

    const handleBatchEntitlement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!can("canManagePolicies")) return;
        setActionMessage(null);
        setError(null);
        setBatchSubmitting(true);
        setBatchResult(null);
        try {
            const employeeIds = batchEntitlementForm.employeeIds
                .split(",")
                .map((id) => id.trim())
                .filter((id) => id.length > 0);

            if (employeeIds.length === 0) {
                setError("Please enter at least one employee ID");
                return;
            }

            const payload: any = {
                employeeIds,
                leaveTypeId: batchEntitlementForm.leaveTypeId,
                personalized: batchEntitlementForm.personalized,
            };

            if (batchEntitlementForm.yearlyEntitlement) {
                payload.yearlyEntitlement = Number(batchEntitlementForm.yearlyEntitlement);
            }
            if (batchEntitlementForm.accruedActual) {
                payload.accruedActual = Number(batchEntitlementForm.accruedActual);
            }
            if (batchEntitlementForm.accruedRounded) {
                payload.accruedRounded = Number(batchEntitlementForm.accruedRounded);
            }
            if (batchEntitlementForm.carryForward) {
                payload.carryForward = Number(batchEntitlementForm.carryForward);
            }

            const result = await createBatchEntitlement(payload);
            setBatchResult(result);
            setActionMessage(
                `Batch entitlement: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed.`
            );
            setBatchEntitlementForm({
                employeeIds: "",
                leaveTypeId: "",
                yearlyEntitlement: "",
                accruedActual: "",
                accruedRounded: "",
                carryForward: "",
                personalized: false,
            });
        } catch (err: any) {
            setError(err?.response?.data?.message || "Batch entitlement creation failed.");
        } finally {
            setBatchSubmitting(false);
        }
    };

    const openApprovalFlowEditor = (target?: LeaveRequest) => {
        if (!canEditApprovalFlow) return;
        const requestToEdit = target || selectedRequest;
        if (!requestToEdit || requestToEdit.status !== "pending") return;

        setSelectedRequest(requestToEdit);
        setEditingApprovalFlow(normalizeApprovalFlowForEdit(requestToEdit.approvalFlow));
        setShowApprovalFlowModal(true);
    };

    const handleUpdateApprovalFlow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEditApprovalFlow) return;
        if (!selectedRequest?.id) return;
        setSavingApprovalFlow(true);
        setError(null);
        setActionMessage(null);
        try {
            const flowPayload = editingApprovalFlow.map((step) => {
                const parsedDecidedAt = step.decidedAt ? new Date(step.decidedAt) : null;
                const decidedAt =
                    parsedDecidedAt && !Number.isNaN(parsedDecidedAt.getTime())
                        ? parsedDecidedAt.toISOString()
                        : undefined;

                return {
                    ...step,
                    decidedBy: step.decidedBy?.trim?.() || undefined,
                    decidedAt,
                };
            });

            const updated = await updateApprovalFlow(selectedRequest.id, flowPayload);
            setActionMessage("Approval flow updated successfully.");
            setShowApprovalFlowModal(false);
            await loadRequests();
            setSelectedRequest(updated);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Update approval flow failed.");
        } finally {
            setSavingApprovalFlow(false);
        }
    };

    const addApprovalStep = () => {
        setEditingApprovalFlow((prev) => [
            ...prev,
            { role: "", status: "pending", decidedBy: undefined, decidedAt: undefined },
        ]);
    };

    const removeApprovalStep = (index: number) => {
        setEditingApprovalFlow((prev) => prev.filter((_, i) => i !== index));
    };

    const updateApprovalStep = (index: number, updates: Partial<ApprovalFlowStep>) => {
        setEditingApprovalFlow((prev) =>
            prev.map((step, i) => (i === index ? { ...step, ...updates } : step))
        );
    };

    const handleLoadOverlappingLeaves = async () => {
        if (!user?.id || normalizedRole !== "department head") return;

        setOverlappingLoading(true);
        setError(null);
        try {
            const data = await fetchOverlappingLeaves(user.id, showOverlappingOnly);
            setOverlappingLeaves(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load overlapping leaves.");
            setOverlappingLeaves(null);
        } finally {
            setOverlappingLoading(false);
        }
    };

  if (status !== "authenticated" || !user || !currentRole) {
        return null;
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
                }
            `}} />
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
                <Navbar />
            <div className="flex gap-6 max-w-[95vw] mx-auto px-4 sm:px-6 py-10
                min-h-screen
                [&_input[type=number]]:[appearance:textfield]
                [&_input[type=number]::-webkit-inner-spin-button]:appearance-none
                [&_input[type=number]::-webkit-outer-spin-button]:appearance-none">

                <main className="flex-1 space-y-8">
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

                {normalizedRole === "department head" && (
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-200">Your Departments</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-200 space-y-2">
                            {headDepartments === null && <div className="text-slate-400">Loading departments…</div>}
                            {headDepartments !== null && headDepartments.length === 0 && (
                                <div className="text-amber-300">
                                    No managed departments found. Ensure headPositionId is set and you are assigned to the head position.
                                </div>
                            )}
                            {headDepartments && headDepartments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {headDepartments.map((d, idx) => (
                                        <Badge
                                            key={`${d.id || "dept"}-${d.code || ""}-${idx}`}
                                            variant="outline"
                                            className="border-white/30 text-white"
                                        >
                                            {d.name || d.code || d.id}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {normalizedRole === "department head" && (
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm text-slate-200">Overlapping Team Leaves</CardTitle>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 text-xs text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={showOverlappingOnly}
                                            onChange={(e) => setShowOverlappingOnly(e.target.checked)}
                                            className="cursor-pointer"
                                        />
                                        Show only overlapping
                                    </label>
                                    <Button
                                        type="button"
                                        onClick={handleLoadOverlappingLeaves}
                                        disabled={overlappingLoading}
                                    >
                                        {overlappingLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Load"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-200 space-y-2">
                            {overlappingLoading && (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading overlapping leaves...
                                </div>
                            )}
                            {!overlappingLoading && !overlappingLeaves && (
                                <div className="text-slate-400">
                                    Click "Load" to check for overlapping leaves (pending vs pending or pending vs approved) in your team.
                                </div>
                            )}
                            {!overlappingLoading && overlappingLeaves && overlappingLeaves.requests.length === 0 && (
                                <div className="text-emerald-300">
                                    {showOverlappingOnly
                                        ? "No overlapping pending leaves found."
                                        : "No pending leaves found in your team."}
                                </div>
                            )}
                            {!overlappingLoading && overlappingLeaves && overlappingLeaves.requests.length > 0 && (
                                <div className="space-y-3">
                                    <div className="text-xs text-slate-400">
                                        Found {overlappingLeaves.requests.length} pending request(s)
                                        {overlappingLeaves.overlaps.length > 0 && (
                                            <span className="text-amber-300">
                                                {" "}with {overlappingLeaves.overlaps.length} overlap(s)
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {overlappingLeaves.requests.map((req) => {
                                            const isOverlapping = overlappingLeaves.overlaps.some(
                                                (o) => o.requestA === req.id || o.requestB === req.id
                                            );
                                            return (
                                                <div
                                                    key={req.id}
                                                    className={`p-2 rounded border ${
                                                        isOverlapping
                                                            ? "bg-amber-500/10 border-amber-500/30"
                                                            : "bg-white/5 border-white/10"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-xs">
                                                                {renderEmployee(req, { allowId: false })}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                {req.leaveType?.name || "Leave"} •{" "}
                                                                {formatDate(req.dates.from)} - {formatDate(req.dates.to)}
                                                            </p>
                                                        </div>
                                                        {isOverlapping && (
                                                            <Badge variant="outline" className="border-amber-500/50 text-amber-300">
                                                                Overlaps
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {overlappingLeaves.overlaps.length > 0 && (
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-xs font-semibold text-amber-300 mb-1">
                                                Overlap Details:
                                            </p>
                                            <div className="space-y-1">
                                                {overlappingLeaves.overlaps.map((overlap, idx) => {
                                                    const reqA = overlappingLeaves.allRequests?.find(r =>
                                                        r.id === overlap.requestA || (r as any)._id === overlap.requestA
                                                    );
                                                    const reqB = overlappingLeaves.allRequests?.find(r =>
                                                        r.id === overlap.requestB || (r as any)._id === overlap.requestB
                                                    );
                                                    return (
                                                        <div key={`${overlap.requestA}-${overlap.requestB}-${idx}`} className="text-xs p-2 bg-white/5 rounded border border-amber-500/20">
                                                            <p className="text-slate-300">
                                                                <span className="font-medium">{renderEmployee(reqA, { allowId: false })}</span>{" "}
                                                                <span className="text-amber-400">({reqA?.status || "pending"})</span>
                                                                <br />
                                                                overlaps with{" "}
                                                                <span className="font-medium">{renderEmployee(reqB, { allowId: false })}</span>{" "}
                                                                <span className={reqB?.status === "approved" ? "text-emerald-400" : "text-amber-400"}>
                                                                    ({reqB?.status || "pending"})
                                                                </span>
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

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

                <div className="grid grid-cols-1 gap-4">
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
                                    <Label>Paid status</Label>
                                    <Select
                                        value={filters.paid || "all"}
                                        onValueChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                paid: value as Filters["paid"],
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 text-white border-white/10">
                                            <SelectItem value="all">Any</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="unpaid">Unpaid</SelectItem>
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
                                <div className="space-y-1">
                                    <Label>Date from</Label>
                                    <Input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) =>
                                            setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                                        }
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Date to</Label>
                                    <Input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Department</Label>
                                    <Select
                                        value={filters.departmentId || "__any_dept"}
                                        onValueChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                departmentId: value === "__any_dept" ? "" : value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 text-white border-white/10">
                                            <SelectItem value="__any_dept">Any</SelectItem>
                                            {headDepartments?.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name || dept.code || dept.id}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Sort by</Label>
                                    <Select
                                        value={filters.sortBy || "createdAt"}
                                        onValueChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                sortBy: value as "dates.from" | "createdAt",
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Created date" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 text-white border-white/10">
                                            <SelectItem value="createdAt">Created date</SelectItem>
                                            <SelectItem value="dates.from">Leave start date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Sort order</Label>
                                    <Select
                                        value={filters.sortOrder || "desc"}
                                        onValueChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                sortOrder: value as "asc" | "desc",
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Descending" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 text-white border-white/10">
                                            <SelectItem value="desc">Newest first</SelectItem>
                                            <SelectItem value="asc">Oldest first</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                <>
                                    {isHRRole && (
                                        <div className="mb-4 flex items-center gap-3">
                                            {selectedRequestIds.size > 0 && (
                                                <>
                                                    <p className="text-sm text-slate-300">
                                                        {selectedRequestIds.size} request(s) selected
                                                    </p>
                                                    <Button
                                                        disabled={bulkProcessing}
                                                        onClick={() => handleBulkAction("approved")}
                                                    >
                                                        {bulkProcessing ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                        ) : null}
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        className="text-rose-200"
                                                        disabled={bulkProcessing}
                                                        onClick={() => handleBulkAction("rejected")}
                                                    >
                                                        {bulkProcessing ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                        ) : null}
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedRequestIds(new Set())}
                                                    >
                                                        Clear Selection
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {bulkResult && (
                                        <div className="mb-4 p-3 rounded bg-white/5 border border-white/10">
                                            <p className="text-sm font-semibold text-emerald-200 mb-1">
                                                Bulk operation completed: {bulkResult.successCount} successful, {bulkResult.failedCount} failed
                                            </p>
                                            {bulkResult.failures.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-rose-200 mb-1">Failures:</p>
                                                    <div className="space-y-1">
                                                        {bulkResult.failures.map((f, idx) => (
                                                            <p key={idx} className="text-xs text-slate-300">
                                                                {f.requestId}: {f.error}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                                        <span>Showing {requests.length} request(s)</span>
                                        <Badge variant="outline" className="border-white/20 text-white">
                                            Total days: {totalDurationDays}
                                        </Badge>
                                    </div>
                                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                        <Table className="text-white">
                                        <TableHeader>
                                            <TableRow className="border-white/10">
                                                {isHRRole && (
                                                    <TableHead className="text-slate-300 w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                (() => {
                                                                    const selectableRequests = requests.filter((req) => {
                                                                        const hrStep = req.approvalFlow?.find((s) => s.role === "HR");
                                                                        return hrStep?.status === "pending" && req.status !== "cancelled";
                                                                    });
                                                                    return (
                                                                        selectableRequests.length > 0 &&
                                                                        selectableRequests.every((req) => {
                                                                            const reqId = req.id || (req as any)._id;
                                                                            return selectedRequestIds.has(reqId);
                                                                        })
                                                                    );
                                                                })()
                                                            }
                                                            onChange={toggleSelectAll}
                                                            className="cursor-pointer"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead className="text-slate-300">Employee</TableHead>
                                                <TableHead className="text-slate-300">Leave</TableHead>
                                                <TableHead className="text-slate-300">Dates</TableHead>
                                                <TableHead className="text-slate-300">Duration</TableHead>
                                                <TableHead className="text-slate-300">Status</TableHead>
                                                <TableHead className="text-slate-300">Flags</TableHead>
                                                <TableHead className="text-slate-300">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                    <TableBody>
                                        {requests.map((req, idx) => {
                                            const requestId = req.id || (req as any)._id || `req-${idx}`;
                                            const hrStep = req.approvalFlow?.find((s) => s.role === "HR");
                                            const canSelectForBulk = hrStep?.status === "pending" && req.status !== "cancelled";
                                            const isExpanded = expandedRequestId === requestId;

                                            return (
                                                <React.Fragment key={requestId}>
                                                    <TableRow
                                                        className="border-white/5 hover:bg-white/5"
                                                    >
                                                        {isHRRole && (
                                                            <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRequestIds.has(requestId)}
                                                                    onChange={() => toggleRequestSelection(requestId)}
                                                                    disabled={!canSelectForBulk}
                                                                    className={canSelectForBulk ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                                                                />
                                                            </TableCell>
                                                        )}
                                                        <TableCell
                                                            className="whitespace-nowrap text-slate-200 cursor-pointer"
                                                            onClick={() => setSelectedRequest(req)}
                                                        >
                                                            {renderEmployee(req, { allowId: false })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="cursor-pointer" onClick={() => setSelectedRequest(req)}>
                                                                    {req.leaveType?.name || "-"}
                                                                </span>
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
                                                    <TableCell
                                                        className="whitespace-nowrap cursor-pointer"
                                                        onClick={() => setSelectedRequest(req)}
                                                    >
                                                        {formatDate(req.dates.from)} - {formatDate(req.dates.to)}
                                                    </TableCell>
                                                    <TableCell
                                                        className="cursor-pointer"
                                                        onClick={() => setSelectedRequest(req)}
                                                    >
                                                        {getRequestDurationDays(req)} day(s)
                                                    </TableCell>
                                                    <TableCell
                                                        className="cursor-pointer"
                                                        onClick={() => setSelectedRequest(req)}
                                                    >
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
                                                    <TableCell
                                                        className="cursor-pointer"
                                                        onClick={() => setSelectedRequest(req)}
                                                    >
                                                        {req.irregularPatternFlag ? (
                                                            <Badge variant="destructive">Irregular</Badge>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="space-x-2 whitespace-nowrap">
                                                        {req.status === "pending" ? (
                                                            <>
                                                                {canUserApproveRequest(req) ? (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            disabled={busyId === requestId}
                                                                            onClick={() => handleStatus(req, "approved")}
                                                                        >
                                                                            Approve
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-rose-200"
                                                                            disabled={busyId === requestId}
                                                                            onClick={() => handleStatus(req, "rejected")}
                                                                        >
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                ) : null}
                                                            </>
                                                        ) : (
                                                            "-"
                                                        )}
                                                        {req.status !== "cancelled" && can("canOverride") ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-indigo-200"
                                                                    disabled={busyId === requestId}
                                                                    onClick={() => handleOverride(requestId, "approve")}
                                                                >
                                                                    Override 
                                                                    <TicketCheck className="w-4 h-4 mr-1/" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-rose-200 "
                                                                    disabled={busyId === requestId}
                                                                    onClick={() => handleOverride(requestId, "reject")}
                                                                >
                                                                    
                                                                    Override
                                                                    <TicketX className="w-4 h-4 mr-1" />
                                                                </Button>
                                                            </>
                                                        ) : null}
                                                        {req.status !== "cancelled" && can("canApprove") ? (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-purple-200"
                                                                disabled={busyId === requestId}
                                                                onClick={() => handleFlag(requestId)}
                                                            >
                                                                
                                                                Flag
                                                                <FlagTriangleRight className="w-4 h-4 mr-1" />
                                                            </Button>
                                                        ) : null}
                                                    </TableCell>
                                                </TableRow>
                                                {isExpanded && selectedRequest && (selectedRequest as any).id === requestId && (
                                                    <TableRow key={`${requestId}-details`} className="border-white/5">
                                                        <TableCell colSpan={isHRRole ? 8 : 7} className="bg-white/5">
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
                                                                        <p className="text-slate-400 mb-1">Employee</p>
                                                                        <p className="text-white">
                                                                            {renderEmployee((selectedRequest as any).employee || selectedRequest.employeeId, { allowId: false })}
                                                                        </p>
                                                                        <p className="text-xs text-slate-400 mt-1">
                                                                            ID: {normalizeId(selectedRequest.employeeId)}
                                                                        </p>
                                                                    </div>
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
                                                                    {selectedRequest.irregularPatternFlag && (
                                                                        <div>
                                                                            <p className="text-slate-400 mb-1">Flags</p>
                                                                            <Badge variant="destructive">Irregular Pattern</Badge>
                                                                        </div>
                                                                    )}
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
                                                                {selectedRequest.approvalFlow && selectedRequest.approvalFlow.length > 0 ? (
                                                                    <div className="space-y-1 pt-2 border-t border-white/10">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <p className="text-sm font-semibold text-white">Approval Workflow:</p>
                                                                            {canEditApprovalFlow && selectedRequest.status === "pending" ? (
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => openApprovalFlowEditor(selectedRequest)}
                                                                                >
                                                                                    Edit workflow
                                                                                </Button>
                                                                            ) : null}
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            {selectedRequest.approvalFlow.map((step, idx) => (
                                                                                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                                                                                    <span className="font-medium">{step.role}</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Badge
                                                                                            variant="secondary"
                                                                                            className={
                                                                                                step.status === "approved"
                                                                                                    ? "bg-emerald-500/30 text-emerald-100"
                                                                                                    : step.status === "rejected"
                                                                                                        ? "bg-rose-500/30 text-rose-100"
                                                                                                        : "bg-amber-500/30 text-amber-100"
                                                                                            }
                                                                                        >
                                                                                            {step.status}
                                                                                        </Badge>
                                                                                        {step.decidedBy && <span className="text-slate-400">by {step.decidedByName || step.decidedBy}</span>}
                                                                                        {step.decidedAt && (
                                                                                            <span className="text-slate-400">
                                                                                                {new Date(step.decidedAt).toLocaleDateString()}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                    </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                <div className="space-y-4">
                    {showAdjustmentModal ? (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
                            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 space-y-4 text-white">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Adjustment</h3>
                                    <Button variant="ghost" className="text-slate-200" onClick={closeAdjustmentModal}>
                                        Close
                                    </Button>
                                </div>
                                <form className="space-y-3" onSubmit={handleAdjustment}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label>Employee ID</Label>
                                            <Input value={adjustment.employeeId} disabled className="bg-white/5 border-white/10 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Leave type</Label>
                                            <Input
                                                value={adjustment.leaveTypeLabel || adjustment.leaveTypeId}
                                                disabled
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label>Type</Label>
                                            <Select
                                                value={adjustment.adjustmentType}
                                                disabled={entitlementAdjustmentMode}
                                                onValueChange={(value) =>
                                                    setAdjustment((prev) => ({ ...prev, adjustmentType: value as typeof adjustment.adjustmentType }))
                                                }
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white" disabled={entitlementAdjustmentMode}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 text-white border-white/10 z-[80]">
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
                                                disabled={entitlementAdjustmentMode}
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
                                            placeholder="Adjustment reason"
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
                            </div>
                        </div>
                    ) : null}

                    {showApprovalFlowModal ? (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                            <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 p-6 space-y-4 text-white max-h-[80vh] overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Edit Approval Workflow</h3>
                                    <Button variant="ghost" className="text-slate-200" onClick={() => setShowApprovalFlowModal(false)}>
                                        Close
                                    </Button>
                                </div>
                                <form className="space-y-3" onSubmit={handleUpdateApprovalFlow}>
                                    <div className="space-y-2">
                                        {editingApprovalFlow.map((step, idx) => (
                                            <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                                                     <div className="flex items-center justify-between">
                                                     <Label className="text-sm">Step {idx + 1}</Label>
                                                     <Button
                                                         type="button"
                                                         variant="ghost"
                                                         size="sm"
                                                         className="text-rose-200 cursor-not-allowed opacity-60"
                                                         disabled
                                                         onClick={() => removeApprovalStep(idx)}
                                                     >
                                                         Remove
                                                     </Button>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-2">
                                                     <div className="space-y-1">
                                                         <Label className="text-xs">Role</Label>
                                                         <Input
                                                             value={step.role}
                                                             disabled
                                                             onChange={(e) => updateApprovalStep(idx, { role: e.target.value })}
                                                             placeholder="e.g., Manager, HR"
                                                             required
                                                             className="bg-white/5 border-white/10 text-white"
                                                         />
                                                     </div>
                                                     <div className="space-y-1">
                                                         <Label className="text-xs">Status</Label>
                                                         <Select
                                                             value={step.status}
                                                             disabled
                                                             onValueChange={(value: any) => updateApprovalStep(idx, { status: value })}
                                                         >
                                                            <SelectTrigger disabled className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                             <SelectContent className="bg-slate-900 text-white border-white/10">
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="approved">Approved</SelectItem>
                                                                <SelectItem value="rejected">Rejected</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                     <div className="grid grid-cols-2 gap-2">
                                                         <div className="space-y-1">
                                                             <Label className="text-xs">Decided By (Employee ID)</Label>
                                                             <Input
                                                                 value={step.decidedBy || ""}
                                                            onChange={(e) => updateApprovalStep(idx, { decidedBy: e.target.value || undefined })}
                                                            placeholder="Optional"
                                                            className="bg-white/5 border-white/10 text-white"
                                                        />
                                                         </div>
                                                         <div className="space-y-1">
                                                             <Label className="text-xs">Decided At (Date)</Label>
                                                             <Input
                                                                 type="datetime-local"
                                                                 value={
                                                                     step.decidedAt
                                                                         ? new Date(step.decidedAt).toISOString().slice(0, 16)
                                                                         : ""
                                                                 }
                                                                 disabled
                                                                 onChange={(e) =>
                                                                     updateApprovalStep(idx, {
                                                                         decidedAt: e.target.value ? e.target.value : undefined,
                                                                     })
                                                                 }
                                                                 className="bg-white/5 border-white/10 text-white"
                                                             />
                                                         </div>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                         <Button
                                             type="button"
                                             variant="outline"
                                             disabled
                                             onClick={addApprovalStep}
                                             className="w-full border-white/20 text-white hover:bg-white/10 cursor-not-allowed opacity-60"
                                         >
                                             + Add Approval Step
                                         </Button>
                                    <div className="pt-3 border-t border-white/10">
                                        <Button
                                            type="submit"
                                            disabled={savingApprovalFlow}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500"
                                        >
                                            {savingApprovalFlow ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Update Approval Flow"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : null}

                    {entitlementDetails ? (() => {
                        const disp = getEntitlementDisplay(entitlementDetails);
                        const leaveLabel = `${disp.name}${disp.code ? ` (${disp.code})` : ""}`;
                        return (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                                <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-white/10 p-6 space-y-4 text-white max-h-[80vh] overflow-y-auto">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">Entitlement Details</h3>
                                            <p className="text-sm text-slate-300">{leaveLabel}</p>
                                        </div>
                                        <Button variant="ghost" className="text-slate-200" onClick={() => setEntitlementDetails(null)}>
                                            Close
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Employee ID</Label>
                                            <Input value={normalizeId(entitlementDetails.employeeId)} disabled className="bg-white/5 border-white/10 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Leave type</Label>
                                            <Input value={leaveLabel} disabled className="bg-white/5 border-white/10 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Yearly entitlement</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                value={entitlementEditForm.yearlyEntitlement}
                                                disabled={!canEditEntitlementsFully}
                                                onChange={(e) =>
                                                    setEntitlementEditForm((p) => ({
                                                        ...p,
                                                        yearlyEntitlement: e.target.value,
                                                    }))
                                                }
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Carry forward</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                value={entitlementEditForm.carryForward}
                                                disabled={!canEditEntitlementsFully}
                                                onChange={(e) =>
                                                    setEntitlementEditForm((p) => ({
                                                        ...p,
                                                        carryForward: e.target.value,
                                                    }))
                                                }
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Accrued (actual)</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                value={entitlementEditForm.accruedActual}
                                                disabled={!canEditEntitlementsFully}
                                                onChange={(e) =>
                                                    setEntitlementEditForm((p) => ({
                                                        ...p,
                                                        accruedActual: e.target.value,
                                                    }))
                                                }
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Accrued (rounded)</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                value={entitlementEditForm.accruedRounded}
                                                disabled={!canEditEntitlementsFully}
                                                onChange={(e) =>
                                                    setEntitlementEditForm((p) => ({
                                                        ...p,
                                                        accruedRounded: e.target.value,
                                                    }))
                                                }
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Taken</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                value={entitlementEditForm.taken}
                                                disabled={!canEditEntitlementsFully}
                                                onChange={(e) =>
                                                    setEntitlementEditForm((p) => ({
                                                        ...p,
                                                        taken: e.target.value,
                                                    }))
                                                }
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Pending</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                value={entitlementEditForm.pending}
                                                disabled={!canEditEntitlementsFully}
                                                onChange={(e) =>
                                                    setEntitlementEditForm((p) => ({
                                                        ...p,
                                                        pending: e.target.value,
                                                    }))
                                                }
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1 sm:col-span-2">
                                            <Label className="text-xs text-slate-400">Remaining</Label>
                                            <Input
                                                value={entitlementEditForm.remaining}
                                                disabled
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Last accrual</Label>
                                            <Input
                                                type="date"
                                                value={entitlementEditForm.lastAccrualDate}
                                                onChange={(e) =>
                                                    setEntitlementEditForm((p) => ({ ...p, lastAccrualDate: e.target.value }))
                                                }
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-400">Next reset</Label>
                                            <Input
                                                type="date"
                                                value={entitlementEditForm.nextResetDate}
                                                onChange={(e) =>
                                                    setEntitlementEditForm((p) => ({ ...p, nextResetDate: e.target.value }))
                                                }
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                        <Button
                                            className="w-full sm:w-auto"
                                            onClick={() => void handleSaveEntitlementDetails()}
                                            disabled={savingEntitlement}
                                        >
                                            {savingEntitlement ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save changes"
                                            )}
                                        </Button>
                                        <Button
                                            className="w-full sm:w-auto"
                                            variant="outline"
                                            onClick={() => setEntitlementDetails(null)}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })() : null}

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
                                <div className="space-y-1">
                                    <Label className="text-xs">Code</Label>
                                    <Input
                                        value={newType.code}
                                        onChange={(e) => setNewType((p) => ({ ...p, code: e.target.value }))}
                                        placeholder="Code (e.g., ANN)"
                                        required
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Name</Label>
                                    <Input
                                        value={newType.name}
                                        onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))}
                                        placeholder="Name"
                                        required
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Category</Label>
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
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        value={newType.description}
                                        onChange={(e) => setNewType((p) => ({ ...p, description: e.target.value }))}
                                        placeholder="Description (optional)"
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Paid</Label>
                                        <Select
                                            value={newType.paid ? "true" : "false"}
                                            onValueChange={(value) =>
                                                setNewType((p) => ({ ...p, paid: value === "true" }))
                                            }
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Deductible</Label>
                                        <Select
                                            value={newType.deductible ? "true" : "false"}
                                            onValueChange={(value) =>
                                                setNewType((p) => ({ ...p, deductible: value === "true" }))
                                            }
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Requires attachment</Label>
                                        <Select
                                            value={newType.requiresAttachment ? "true" : "false"}
                                            onValueChange={(value) =>
                                                setNewType((p) => ({ ...p, requiresAttachment: value === "true" }))
                                            }
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Attachment type</Label>
                                        <Select
                                            value={newType.attachmentType || "__none"}
                                            onValueChange={(value) =>
                                                setNewType((p) => ({
                                                    ...p,
                                                    attachmentType: value === "__none" ? "" : value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Select attachment type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                <SelectItem value="__none">None</SelectItem>
                                                {ATTACHMENT_TYPE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min tenure (months)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={newType.minTenureMonths}
                                            onChange={(e) =>
                                                setNewType((p) => ({
                                                    ...p,
                                                    minTenureMonths: e.target.value,
                                                }))
                                            }
                                            placeholder="e.g., 6"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max duration (days)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={newType.maxDurationDays}
                                            onChange={(e) =>
                                                setNewType((p) => ({
                                                    ...p,
                                                    maxDurationDays: e.target.value,
                                                }))
                                            }
                                            placeholder="e.g., 30"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                                <Button type="submit">Create leave type</Button>
                            </form>

                            <div className="space-y-3">
                                <Label className="text-sm">Edit leave type</Label>
                                <Select
                                    value={editType.id || "__none"}
                                    onValueChange={(value) => {
                                        if (value === "__none") {
                                            setEditType({
                                                id: "",
                                                code: "",
                                                name: "",
                                                categoryId: "",
                                                description: "",
                                                paid: true,
                                                deductible: true,
                                                requiresAttachment: false,
                                                attachmentType: "",
                                                minTenureMonths: "",
                                                maxDurationDays: "",
                                            });
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
                                            paid: typeof found?.paid === "boolean" ? !!found?.paid : true,
                                            deductible: typeof found?.deductible === "boolean" ? !!found?.deductible : true,
                                            requiresAttachment:
                                                typeof found?.requiresAttachment === "boolean"
                                                    ? !!found?.requiresAttachment
                                                    : false,
                                            attachmentType: (found as any)?.attachmentType || "",
                                            minTenureMonths:
                                                (found as any)?.minTenureMonths !== undefined &&
                                                (found as any)?.minTenureMonths !== null
                                                    ? (found as any)?.minTenureMonths?.toString?.() || ""
                                                    : "",
                                            maxDurationDays:
                                                (found as any)?.maxDurationDays !== undefined &&
                                                (found as any)?.maxDurationDays !== null
                                                    ? (found as any)?.maxDurationDays?.toString?.() || ""
                                                    : "",
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
                                        <div className="space-y-1">
                                            <Label className="text-xs">Code</Label>
                                            <Input
                                                value={editType.code}
                                                onChange={(e) => setEditType((p) => ({ ...p, code: e.target.value }))}
                                                placeholder="Code"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Name</Label>
                                            <Input
                                                value={editType.name}
                                                onChange={(e) => setEditType((p) => ({ ...p, name: e.target.value }))}
                                                placeholder="Name"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Category</Label>
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
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Description</Label>
                                            <Input
                                                value={editType.description}
                                                onChange={(e) => setEditType((p) => ({ ...p, description: e.target.value }))}
                                                placeholder="Description"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Paid</Label>
                                                <Select
                                                    value={editType.paid ? "true" : "false"}
                                                    onValueChange={(value) =>
                                                        setEditType((p) => ({ ...p, paid: value === "true" }))
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 text-white border-white/10">
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Deductible</Label>
                                                <Select
                                                    value={editType.deductible ? "true" : "false"}
                                                    onValueChange={(value) =>
                                                        setEditType((p) => ({ ...p, deductible: value === "true" }))
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 text-white border-white/10">
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Requires attachment</Label>
                                                <Select
                                                    value={editType.requiresAttachment ? "true" : "false"}
                                                    onValueChange={(value) =>
                                                        setEditType((p) => ({ ...p, requiresAttachment: value === "true" }))
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 text-white border-white/10">
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Attachment type</Label>
                                                <Select
                                                    value={editType.attachmentType || "__none"}
                                                    onValueChange={(value) =>
                                                        setEditType((p) => ({
                                                            ...p,
                                                            attachmentType: value === "__none" ? "" : value,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select attachment type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 text-white border-white/10">
                                                        <SelectItem value="__none">None</SelectItem>
                                                        {ATTACHMENT_TYPE_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Min tenure (months)</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={editType.minTenureMonths}
                                                    onChange={(e) =>
                                                        setEditType((p) => ({
                                                            ...p,
                                                            minTenureMonths: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="e.g., 6"
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Max duration (days)</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={editType.maxDurationDays}
                                                    onChange={(e) =>
                                                        setEditType((p) => ({
                                                            ...p,
                                                            maxDurationDays: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="e.g., 30"
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </div>
                                        </div>
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
                            <form className="space-y-3 h-full flex flex-col" onSubmit={handleCreatePolicy}>
                                <Label className="text-sm">Create leave policy</Label>
                                <div className="space-y-1">
                                    <Label className="text-xs">Leave type</Label>
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
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Accrual method</Label>
                                        <Select
                                            value={policyForm.accrualMethod || "__none"}
                                            onValueChange={(value) =>
                                                setPolicyForm((p) => ({ ...p, accrualMethod: value === "__none" ? "" : value }))
                                            }
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Select accrual method" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                <SelectItem value="__none">Select accrual method</SelectItem>
                                                {ACCRUAL_METHOD_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Rounding rule</Label>
                                        <Select
                                            value={policyForm.roundingRule || "__none"}
                                            onValueChange={(value) =>
                                                setPolicyForm((p) => ({ ...p, roundingRule: value === "__none" ? "" : value }))
                                            }
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Select rounding rule" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                <SelectItem value="__none">Select rounding rule</SelectItem>
                                                {ROUNDING_RULE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Monthly rate</Label>
                                        <Input
                                            type="number"
                                            value={policyForm.monthlyRate}
                                            onChange={(e) => setPolicyForm((p) => ({ ...p, monthlyRate: e.target.value }))}
                                            placeholder="Monthly rate"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Yearly rate</Label>
                                        <Input
                                            type="number"
                                            value={policyForm.yearlyRate}
                                            onChange={(e) => setPolicyForm((p) => ({ ...p, yearlyRate: e.target.value }))}
                                            placeholder="Yearly rate"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max carry forward</Label>
                                        <Input
                                            type="number"
                                            value={policyForm.maxCarryForward}
                                            onChange={(e) => setPolicyForm((p) => ({ ...p, maxCarryForward: e.target.value }))}
                                            placeholder="Max carry forward"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Expiry after months</Label>
                                        <Input
                                            type="number"
                                            value={policyForm.expiryAfterMonths}
                                            onChange={(e) => setPolicyForm((p) => ({ ...p, expiryAfterMonths: e.target.value }))}
                                            placeholder="Expiry after months"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min notice days</Label>
                                        <Input
                                            type="number"
                                            value={policyForm.minNoticeDays}
                                            onChange={(e) => setPolicyForm((p) => ({ ...p, minNoticeDays: e.target.value }))}
                                            placeholder="Min notice days"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max consecutive days</Label>
                                        <Input
                                            type="number"
                                            value={policyForm.maxConsecutiveDays}
                                            onChange={(e) => setPolicyForm((p) => ({ ...p, maxConsecutiveDays: e.target.value }))}
                                            placeholder="Max consecutive days"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
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
                                <div className="space-y-2 rounded-lg border border-white/10 p-3 bg-white/5">
                                    <p className="text-sm font-semibold">Eligibility</p>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Minimum tenure (months)</Label>
                                        <Input
                                            type="number"
                                            value={policyForm.eligibilityMinTenureMonths}
                                            onChange={(e) => setPolicyForm((p) => ({ ...p, eligibilityMinTenureMonths: e.target.value }))}
                                            placeholder="Minimum tenure (months)"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-300">Allowed positions (dropdown, multi-select)</p>
                                        <Select
                                            value="__none"
                                            onValueChange={(value) => {
                                                if (value === "__none") return;
                                                setPolicyForm((p) => {
                                                    const exists = p.eligibilityPositions.includes(value);
                                                    const next = exists
                                                        ? p.eligibilityPositions.filter((v) => v !== value)
                                                        : [...p.eligibilityPositions, value];
                                                    return { ...p, eligibilityPositions: next };
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Add position" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white border-white/10 max-h-60">
                                                <SelectItem value="__none">Add position</SelectItem>
                                                {positionOptions.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex flex-wrap gap-2">
                                            {policyForm.eligibilityPositions.map((pos) => (
                                                <Badge
                                                    key={pos}
                                                    className="bg-blue-500/30 border border-blue-400/40 text-blue-100 cursor-pointer"
                                                    onClick={() =>
                                                        setPolicyForm((p) => ({
                                                            ...p,
                                                            eligibilityPositions: p.eligibilityPositions.filter((v) => v !== pos),
                                                        }))
                                                    }
                                                >
                                                    {pos} x
                                                </Badge>
                                            ))}
                                            {!policyForm.eligibilityPositions.length ? (
                                                <span className="text-xs text-slate-400">No positions selected</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-300">Allowed contract types (dropdown, multi-select)</p>
                                        <Select
                                            value="__none"
                                            onValueChange={(value) => {
                                                if (value === "__none") return;
                                                setPolicyForm((p) => {
                                                    const exists = p.eligibilityContracts.includes(value);
                                                    const next = exists
                                                        ? p.eligibilityContracts.filter((v) => v !== value)
                                                        : [...p.eligibilityContracts, value];
                                                    return { ...p, eligibilityContracts: next };
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Add contract type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                <SelectItem value="__none">Add contract type</SelectItem>
                                                {CONTRACT_TYPE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex flex-wrap gap-2">
                                            {policyForm.eligibilityContracts.map((ct) => (
                                                <Badge
                                                    key={ct}
                                                    className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 cursor-pointer"
                                                    onClick={() =>
                                                        setPolicyForm((p) => ({
                                                            ...p,
                                                            eligibilityContracts: p.eligibilityContracts.filter((v) => v !== ct),
                                                        }))
                                                    }
                                                >
                                                    {ct} x
                                                </Badge>
                                            ))}
                                            {!policyForm.eligibilityContracts.length ? (
                                                <span className="text-xs text-slate-400">No contract types selected</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <Button type="submit" className="w-full mt-auto">
                                        Create policy
                                    </Button>
                                </div>
                            </form>

                            <div className="grid grid-rows-[auto_1fr] h-full gap-4">
                                <div className="space-y-3">
                                    <Label className="text-sm">Audit trail (HR)</Label>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Employee ID</Label>
                                            <Input
                                                value={auditEmployeeId}
                                                onChange={(e) => setAuditEmployeeId(e.target.value)}
                                                placeholder="Employee ID"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() => void handleLoadAuditTrail()}
                                          disabled={!auditEmployeeId || auditLoading}
                                        >
                                            {auditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load audit"}
                                        </Button>
                                    </div>
                                    {auditTrail.length ? (
                                        <div className="space-y-2 max-h-64 overflow-auto border border-white/10 rounded-xl p-3 bg-white/5">
                                            {auditTrail.map((entry) => (
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
                                        <p className="text-xs text-slate-400">No audit entries loaded.</p>
                                    )}
                                </div>
                                <form className="space-y-3 flex flex-col justify-end" onSubmit={handleCreateEntitlement}>
                                    <Label className="text-sm">Create entitlement</Label>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Employee ID</Label>
                                        <Input
                                            value={entitlementForm.employeeId}
                                            onChange={(e) => setEntitlementForm((p) => ({ ...p, employeeId: e.target.value }))}
                                            placeholder="Employee ID"
                                            required
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Leave type</Label>
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
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Yearly entitlement</Label>
                                            <Input
                                                type="number"
                                                value={entitlementForm.yearlyEntitlement}
                                                onChange={(e) =>
                                                    setEntitlementForm((p) => ({ ...p, yearlyEntitlement: e.target.value }))
                                                }
                                                placeholder="Yearly entitlement"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Carry forward</Label>
                                            <Input
                                                type="number"
                                                value={entitlementForm.carryForward}
                                                onChange={(e) => setEntitlementForm((p) => ({ ...p, carryForward: e.target.value }))}
                                                placeholder="Carry forward"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Accrued actual</Label>
                                            <Input
                                                type="number"
                                                value={entitlementForm.accruedActual}
                                                onChange={(e) => setEntitlementForm((p) => ({ ...p, accruedActual: e.target.value }))}
                                                placeholder="Accrued actual"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Accrued rounded</Label>
                                            <Input
                                                type="number"
                                                value={entitlementForm.accruedRounded}
                                                onChange={(e) => setEntitlementForm((p) => ({ ...p, accruedRounded: e.target.value }))}
                                                placeholder="Accrued rounded"
                                                className="bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
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
                                    <div className="pt-1">
                                        <Button type="submit" className="w-full">
                                            Create entitlement
                                        </Button>
                                    </div>
                                </form>
                            </div>


                        </CardContent>
                    </Card>
                ) : null}

                {can("canManagePolicies") ? (
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Batch Entitlement Creation</CardTitle>
                            <p className="text-sm text-slate-300">Create entitlements for multiple employees at once.</p>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-3" onSubmit={handleBatchEntitlement}>
                                <div className="space-y-2">
                                    <Label className="text-sm">Employee IDs (comma-separated)</Label>
                                    <textarea
                                        value={batchEntitlementForm.employeeIds}
                                        onChange={(e) =>
                                            setBatchEntitlementForm((p) => ({ ...p, employeeIds: e.target.value }))
                                        }
                                        placeholder="e.g., 507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012, ..."
                                        required
                                        rows={3}
                                        className="w-full rounded-md bg-white/5 border border-white/10 text-white p-2 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Leave Type</Label>
                                    <Select
                                        value={batchEntitlementForm.leaveTypeId || "__none"}
                                        onValueChange={(value) =>
                                            setBatchEntitlementForm((p) => ({
                                                ...p,
                                                leaveTypeId: value === "__none" ? "" : value,
                                            }))
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
                                                    <SelectItem key={id || `batch-lt-${idx}`} value={id}>
                                                        {lt.name} ({lt.code})
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Yearly Entitlement</Label>
                                        <Input
                                            type="number"
                                            value={batchEntitlementForm.yearlyEntitlement}
                                            onChange={(e) =>
                                                setBatchEntitlementForm((p) => ({ ...p, yearlyEntitlement: e.target.value }))
                                            }
                                            placeholder="Optional"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Carry Forward</Label>
                                        <Input
                                            type="number"
                                            value={batchEntitlementForm.carryForward}
                                            onChange={(e) =>
                                                setBatchEntitlementForm((p) => ({ ...p, carryForward: e.target.value }))
                                            }
                                            placeholder="Optional"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Accrued Actual</Label>
                                        <Input
                                            type="number"
                                            value={batchEntitlementForm.accruedActual}
                                            onChange={(e) =>
                                                setBatchEntitlementForm((p) => ({ ...p, accruedActual: e.target.value }))
                                            }
                                            placeholder="Optional"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Accrued Rounded</Label>
                                        <Input
                                            type="number"
                                            value={batchEntitlementForm.accruedRounded}
                                            onChange={(e) =>
                                                setBatchEntitlementForm((p) => ({ ...p, accruedRounded: e.target.value }))
                                            }
                                            placeholder="Optional"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-white/80">
                                    <input
                                        type="checkbox"
                                        checked={batchEntitlementForm.personalized}
                                        onChange={(e) =>
                                            setBatchEntitlementForm((p) => ({ ...p, personalized: e.target.checked }))
                                        }
                                    />
                                    Personalized (skip eligibility checks)
                                </label>
                                <Button type="submit" disabled={batchSubmitting} className="w-full">
                                    {batchSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Batch Entitlements"
                                    )}
                                </Button>
                            </form>

                            {batchResult ? (
                                <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                                    <p className="text-sm font-semibold">Batch Creation Results:</p>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="rounded bg-emerald-500/20 p-2 text-center">
                                            <p className="font-bold text-emerald-100">{batchResult.created}</p>
                                            <p className="text-emerald-200">Created</p>
                                        </div>
                                        <div className="rounded bg-amber-500/20 p-2 text-center">
                                            <p className="font-bold text-amber-100">{batchResult.skipped}</p>
                                            <p className="text-amber-200">Skipped</p>
                                        </div>
                                        <div className="rounded bg-rose-500/20 p-2 text-center">
                                            <p className="font-bold text-rose-100">{batchResult.failed}</p>
                                            <p className="text-rose-200">Failed</p>
                                        </div>
                                    </div>

                                    {batchResult.createdEmployeeIds.length > 0 && (
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-xs font-semibold text-emerald-200 mb-1">Created for:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {batchResult.createdEmployeeIds.slice(0, 10).map((eid) => (
                                                    <Badge
                                                        key={eid}
                                                        variant="secondary"
                                                        className="bg-emerald-500/30 text-emerald-100 text-xs"
                                                    >
                                                        {eid}
                                                    </Badge>
                                                ))}
                                                {batchResult.createdEmployeeIds.length > 10 && (
                                                    <span className="text-xs text-slate-400">
                                                        +{batchResult.createdEmployeeIds.length - 10} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {batchResult.skippedEmployeeIds.length > 0 && (
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-xs font-semibold text-amber-200 mb-1">Skipped (already exist):</p>
                                            <div className="flex flex-wrap gap-1">
                                                {batchResult.skippedEmployeeIds.slice(0, 10).map((eid) => (
                                                    <Badge
                                                        key={eid}
                                                        variant="secondary"
                                                        className="bg-amber-500/30 text-amber-100 text-xs"
                                                    >
                                                        {eid}
                                                    </Badge>
                                                ))}
                                                {batchResult.skippedEmployeeIds.length > 10 && (
                                                    <span className="text-xs text-slate-400">
                                                        +{batchResult.skippedEmployeeIds.length - 10} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {batchResult.errors.length > 0 && (
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-xs font-semibold text-rose-200 mb-1">Errors:</p>
                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                {batchResult.errors.map((err, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="text-xs bg-rose-500/10 border border-rose-500/20 rounded p-2"
                                                    >
                                                        <span className="font-semibold text-rose-200">{err.employeeId}:</span>{" "}
                                                        <span className="text-rose-100">{err.error}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                ) : null}

                {can("canManagePolicies") ? (
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Existing policies</CardTitle>
                            <p className="text-sm text-slate-300">Update current policies.</p>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[32rem] overflow-y-auto pr-2 custom-scrollbar">
                            {policies.length ? (
                                <div className="space-y-4">
                                    {policies.map((pol) => {
                                        const pid = getPolicyId(pol);
                                        if (!pid) return null;
                                        const form = policyEdits[pid] || toPolicyFormState(pol);
                                        const ltObj = (pol as any)?.leaveType || (pol as any)?.leaveTypeId;
                                        const ltLabel =
                                            typeof ltObj === "string"
                                                ? ltObj
                                                : ltObj?.name ||
                                                ltObj?.code ||
                                                ltObj?._id?.toString?.() ||
                                                "Leave type";
                                        const expanded = expandedPolicyIds.has(pid);
                                        return (
                                            <div key={pid} className="space-y-3 border border-white/10 rounded-xl p-3 bg-white/5">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold">{ltLabel}</p>
                                                        <p className="text-xs text-slate-300">ID: {pid}</p>
                                                        <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-200">
                                                            <span>Accrual: {form.accrualMethod || "—"}</span>
                                                            <span>Rounding: {form.roundingRule || "—"}</span>
                                                            <span>Yearly rate: {form.yearlyRate || "—"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => togglePolicyExpanded(pid)}
                                                        >
                                                            {expanded ? "Hide details" : "Details"}
                                                        </Button>
                                                        {expanded ? (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => void handleUpdatePolicyInline(pid)}
                                                                disabled={policySavingId === pid || !form.leaveTypeId}
                                                            >
                                                                {policySavingId === pid ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                                                                Update
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                {expanded ? (
                                                <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Leave type</Label>
                                                        <Select
                                                            value={form.leaveTypeId || "__none"}
                                                            disabled
                                                            onValueChange={(value) =>
                                                                setPolicyEditState(pid, { leaveTypeId: value === "__none" ? "" : value })
                                                            }
                                                        >
                                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue placeholder="Select leave type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                                <SelectItem value="__none">Select leave type</SelectItem>
                                                                {leaveTypes.map((lt) => {
                                                                    const ltId = (lt as any).id || (lt as any)._id;
                                                                    if (!ltId) return null;
                                                                    return (
                                                                        <SelectItem key={ltId.toString()} value={ltId.toString()}>
                                                                            {lt.name} ({lt.code})
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Accrual method</Label>
                                                        <Select
                                                            value={form.accrualMethod || "__none"}
                                                            onValueChange={(value) =>
                                                                setPolicyEditState(pid, { accrualMethod: value === "__none" ? "" : value })
                                                            }
                                                        >
                                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue placeholder="Select accrual method" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                                <SelectItem value="__none">Select accrual method</SelectItem>
                                                                {ACCRUAL_METHOD_OPTIONS.map((opt) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Rounding rule</Label>
                                                        <Select
                                                            value={form.roundingRule || "__none"}
                                                            onValueChange={(value) =>
                                                                setPolicyEditState(pid, { roundingRule: value === "__none" ? "" : value })
                                                            }
                                                        >
                                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue placeholder="Select rounding rule" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                                <SelectItem value="__none">Select rounding rule</SelectItem>
                                                                {ROUNDING_RULE_OPTIONS.map((opt) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Monthly rate</Label>
                                                            <Input
                                                                type="number"
                                                                value={form.monthlyRate}
                                                                onChange={(e) => setPolicyEditState(pid, { monthlyRate: e.target.value })}
                                                                placeholder="Monthly rate"
                                                                className="bg-white/5 border-white/10 text-white"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Yearly rate</Label>
                                                            <Input
                                                                type="number"
                                                                value={form.yearlyRate}
                                                                onChange={(e) => setPolicyEditState(pid, { yearlyRate: e.target.value })}
                                                                placeholder="Yearly rate"
                                                                className="bg-white/5 border-white/10 text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Max carry forward</Label>
                                                        <Input
                                                            type="number"
                                                            value={form.maxCarryForward}
                                                            onChange={(e) => setPolicyEditState(pid, { maxCarryForward: e.target.value })}
                                                            placeholder="Max carry forward"
                                                            className="bg-white/5 border-white/10 text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Expiry after months</Label>
                                                        <Input
                                                            type="number"
                                                            value={form.expiryAfterMonths}
                                                            onChange={(e) => setPolicyEditState(pid, { expiryAfterMonths: e.target.value })}
                                                            placeholder="Expiry after months"
                                                            className="bg-white/5 border-white/10 text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Min notice days</Label>
                                                        <Input
                                                            type="number"
                                                            value={form.minNoticeDays}
                                                            onChange={(e) => setPolicyEditState(pid, { minNoticeDays: e.target.value })}
                                                            placeholder="Min notice days"
                                                            className="bg-white/5 border-white/10 text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Max consecutive days</Label>
                                                        <Input
                                                            type="number"
                                                            value={form.maxConsecutiveDays}
                                                            onChange={(e) => setPolicyEditState(pid, { maxConsecutiveDays: e.target.value })}
                                                            placeholder="Max consecutive days"
                                                            className="bg-white/5 border-white/10 text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 rounded-lg border border-white/10 p-3 bg-white/5">
                                                    <p className="text-sm font-semibold">Eligibility</p>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Minimum tenure (months)</Label>
                                                        <Input
                                                            type="number"
                                                            value={form.eligibilityMinTenureMonths}
                                                            onChange={(e) =>
                                                                setPolicyEditState(pid, { eligibilityMinTenureMonths: e.target.value })
                                                            }
                                                            placeholder="Minimum tenure (months)"
                                                            className="bg-white/5 border-white/10 text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-slate-300">Allowed positions (dropdown, multi-select)</p>
                                                        <Select
                                                            value="__none"
                                                            onValueChange={(value) => {
                                                                if (value === "__none") return;
                                                                setPolicyEditState(pid, {
                                                                    eligibilityPositions: form.eligibilityPositions.includes(value)
                                                                        ? form.eligibilityPositions.filter((v) => v !== value)
                                                                        : [...form.eligibilityPositions, value],
                                                                });
                                                            }}
                                                        >
                                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue placeholder="Add position" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-900 text-white border-white/10 max-h-60">
                                                                <SelectItem value="__none">Add position</SelectItem>
                                                {positionOptions.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex flex-wrap gap-2">
                                                            {form.eligibilityPositions.map((pos) => (
                                                                <Badge
                                                                    key={pos}
                                                                    className="bg-blue-500/30 border border-blue-400/40 text-blue-100 cursor-pointer"
                                                                    onClick={() =>
                                                                        setPolicyEditState(pid, {
                                                                            eligibilityPositions: form.eligibilityPositions.filter((v) => v !== pos),
                                                                        })
                                                                    }
                                                                >
                                                                    {pos} x
                                                                </Badge>
                                                            ))}
                                                            {!form.eligibilityPositions.length ? (
                                                                <span className="text-xs text-slate-400">No positions selected</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-slate-300">Allowed contract types (dropdown, multi-select)</p>
                                                        <Select
                                                            value="__none"
                                                            onValueChange={(value) => {
                                                                if (value === "__none") return;
                                                                setPolicyEditState(pid, {
                                                                    eligibilityContracts: form.eligibilityContracts.includes(value)
                                                                        ? form.eligibilityContracts.filter((v) => v !== value)
                                                                        : [...form.eligibilityContracts, value],
                                                                });
                                                            }}
                                                        >
                                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue placeholder="Add contract type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                                                <SelectItem value="__none">Add contract type</SelectItem>
                                                                {CONTRACT_TYPE_OPTIONS.map((opt) => (
                                                                    <SelectItem key={opt} value={opt}>
                                                                        {opt}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex flex-wrap gap-2">
                                                            {form.eligibilityContracts.map((ct) => (
                                                                <Badge
                                                                    key={ct}
                                                                    className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 cursor-pointer"
                                                                    onClick={() =>
                                                                        setPolicyEditState(pid, {
                                                                            eligibilityContracts: form.eligibilityContracts.filter((v) => v !== ct),
                                                                        })
                                                                    }
                                                                >
                                                                    {ct} x
                                                                </Badge>
                                                            ))}
                                                            {!form.eligibilityContracts.length ? (
                                                                <span className="text-xs text-slate-400">No contract types selected</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-2 text-sm text-white/80">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.carryForwardAllowed}
                                                        onChange={(e) => setPolicyEditState(pid, { carryForwardAllowed: e.target.checked })}
                                                    />
                                                    Carry forward allowed
                                                </label>
                                                </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">No policies created yet.</p>
                            )}
                        </CardContent>
                    </Card>
                ) : null}

                {can("canViewEntitlements") ? (
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
                                    <Button type="button" onClick={() => void handleLoadEntitlements()}>
                                        Load
                                    </Button>
                                </div>
                                {entitlements.length > 0 ? (
                                    <div className="space-y-2 max-h-64 overflow-auto border border-white/10 rounded-xl p-3 bg-white/5">
                                        {entitlements.map((ent) => {
                                            const eid = (ent as any).id || (ent as any)._id;
                                            return (
                                            <div
                                                key={eid}
                                                className="flex items-start justify-between gap-3 text-sm px-3 py-2 rounded bg-white/5 border border-white/10"
                                            >
                                                <div>
                                                    <p className="font-semibold">
                                                        {getEntitlementDisplay(ent).name}
                                                        {getEntitlementDisplay(ent).code ? ` (${getEntitlementDisplay(ent).code})` : ""} - Remaining{" "}
                                                        {ent.remaining} (Pending {ent.pending})
                                                    </p>
                                                    <p className="text-xs text-slate-300">
                                                        Accrued {ent.accruedActual} / Rounded {ent.accruedRounded} • Carry forward{" "}
                                                        {ent.carryForward}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEntitlementDetails(ent as any)}
                                                    >
                                                        Details
                                                    </Button>
                                                    {can("canAdjust") ? (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="bg-blue-600/30 border border-blue-400/40"
                                                            onClick={() => openAdjustmentModal(ent)}
                                                        >
                                                            Adjust
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400">No entitlements loaded.</p>
                                )}
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
                                        variant="outline"
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
                
                {/*Right Side*/}
                <aside className="w-[320px] shrink-0 space-y-4">
                    {/* Notifications */}
                    <Card className="bg-white/5 border-white/10 text-white flex flex-col max-h-[60vh]">
                        <CardHeader className="flex-shrink-0 pb-3">
                            <CardTitle className="text-lg">Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
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

                    {/* Catalog Categories Management */}                
                    {can("canManageCatalog") ? (
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Catalog - Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <form className="space-y-2" onSubmit={handleCreateCategory}>
                                <Label className="text-sm">New category</Label>
                                <div className="space-y-1">
                                    <Label className="text-xs">Name</Label>
                                    <Input
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                                        placeholder="Name"
                                        required
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory((p) => ({ ...p, description: e.target.value }))}
                                        placeholder="Description (optional)"
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
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
                                            <div className="space-y-1">
                                                <Label className="text-xs">Name</Label>
                                                <Input
                                                    value={editCategory.name}
                                                    onChange={(e) => setEditCategory((p) => ({ ...p, name: e.target.value }))}
                                                    placeholder="Name"
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Description</Label>
                                                <Input
                                                    value={editCategory.description}
                                                    onChange={(e) =>
                                                        setEditCategory((p) => ({ ...p, description: e.target.value }))
                                                    }
                                                    placeholder="Description"
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                            </div>
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

                    {/* Run Accruals */}
                    {can("canRunOps") ? (
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader>
                                <CardTitle>Run operations </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    size ="full"
                                    onClick={handleRunAccrual}
                                    disabled={loading || runningEscalations}
                                >
                                    Run accrual
                                </Button>
                                <Button
                                    size="full"
                                    variant="outline"
                                    onClick={handleRunStaleEscalations}
                                    disabled={runningEscalations || loading}
                                >
                                    {runningEscalations ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Escalating...
                                        </span>
                                    ) : (
                                        "Escalate stale approvals"
                                    )}
                                </Button>
                             </CardContent>
                        </Card>
                        ) : null}
                </aside>
            </div>
        </div>
        </>
    );
}

function getRequestDurationDays(req: LeaveRequest) {
    if (typeof req.durationDays === "number") {
        return req.durationDays;
    }
    const from = req?.dates?.from ? new Date(req.dates.from) : null;
    const to = req?.dates?.to ? new Date(req.dates.to) : null;
    if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return 0;
    }
    const diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Number.isNaN(diffDays) ? 0 : diffDays;
}

function formatDate(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
}

function renderEmployee(employee: any, opts?: { allowId?: boolean }): string {
    if (!employee) return "Unknown";

    // If this is a request object, prefer computed display name or nested employee
    if ((employee as any).employeeDisplayName) {
        const disp = (employee as any).employeeDisplayName;
        if (opts?.allowId === false && isLikelyId(disp)) return "Unknown";
        return disp;
    }
    if ((employee as any).employee) {
        const nested: string = renderEmployee((employee as any).employee, opts);
        if (nested && nested !== "Unknown") return nested;
    }

    // Direct employee object fields
    if (employee?.displayName) return employee.displayName;
    if (employee?.fullName) return employee.fullName;
    if (employee?.firstName && employee?.lastName) {
        return `${employee.firstName} ${employee.lastName}`;
    }
    if (employee?.firstName) return employee.firstName;

    const id =
        typeof employee === "string"
            ? employee
            : employee?._id?.toString?.() ||
              employee?.id?.toString?.() ||
              employee?.employeeId?.toString?.();
    if (id) {
        if (opts?.allowId === false) {
            return "Unknown";
        }
        return id;
    }
    return "Unknown";
}

function isLikelyId(value?: string) {
    if (!value) return false;
    return /^[0-9a-fA-F]{24}$/.test(value);
}
