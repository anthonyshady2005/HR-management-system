"use client";

import { useEffect, useMemo, useState } from "react";
import { timeManagementService } from "../services/time-management.service";
import type { Shift, ShiftType, ShiftAssignment } from "../models";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Loader2,
  Pencil,
  Save,
  X,
  AlertCircle,
  Trash2,
  Filter,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

type AssignmentScope = "EMPLOYEE" | "DEPARTMENT" | "POSITION";

/* ===================== SAFE HELPERS ===================== */

const toDateOnly = (v?: string | null) => {
  if (!v) return "";
  return v.includes("T") ? v.split("T")[0] : v;
};

const isObj = (x: any) => x && typeof x === "object";

const getId = (x: any) => {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (isObj(x) && typeof x._id === "string") return x._id;
  return "";
};

const getName = (x: any) => {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (isObj(x) && typeof x.name === "string") return x.name;
  return "";
};

const getEmployeeEmailFromAssignment = (a: any) => {
  const emp = a?.employeeId;
  if (!emp) return "—";
  return emp.personalEmail || emp.personalemail || emp.email || "—";
};

const getDepartmentNameFromAssignment = (a: any) => {
  const emp = a?.employeeId;
  if (!emp) return "—";
  const dept = emp.primaryDepartmentId || emp.department;
  return getName(dept) || "—";
};

const getPositionNameFromAssignment = (a: any) => {
  const emp = a?.employeeId;
  if (!emp) return "—";
  const pos = emp.primaryPositionId || emp.position;
  return getName(pos) || "—";
};

const getShiftObjFromAssignment = (a: any) => a?.shiftId || null;
const getShiftIdFromAssignment = (a: any) => getId(a?.shiftId) || "";
const getShiftNameFromAssignment = (a: any) => getName(a?.shiftId) || "—";

const getShiftTypeNameFromAssignment = (a: any) => {
  const shift = a?.shiftId;
  if (!shift) return "—";
  return getName(shift.shiftType) || "—";
};

// schedule rule helper (ID from assignment)
const getScheduleRuleIdFromAssignment = (a: any) =>
  getId(a?.scheduleRuleId) || "";

const toSafeMinutesString = (v: any) => {
  const n = Number(v);
  if (Number.isFinite(n) && n >= 0) return String(n);
  return "0";
};

const toSafeMinutesNumber = (v: any) => {
  const n = Number(v);
  if (Number.isFinite(n) && n >= 0) return n;
  return 0;
};

/* ===================== PAGE ===================== */

export default function ShiftManagementPage() {
  /* ===================== DATA ===================== */

  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [scheduleRules, setScheduleRules] = useState<any[]>([]);

  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  /* ===================== LOAD STATES ===================== */

  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* ===================== CREATE STATES ===================== */

  const [isCreatingShiftType, setIsCreatingShiftType] = useState(false);
  const [isCreatingShift, setIsCreatingShift] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  const [shiftTypeName, setShiftTypeName] = useState("");

  const [shiftName, setShiftName] = useState("");
  const [createShiftTypeId, setCreateShiftTypeId] = useState("");
  const [createStartTime, setCreateStartTime] = useState("");
  const [createEndTime, setCreateEndTime] = useState("");

  // Grace minutes for create
  const [createGraceInMinutes, setCreateGraceInMinutes] = useState("0");
  const [createGraceOutMinutes, setCreateGraceOutMinutes] = useState("0");

  const [newRuleName, setNewRuleName] = useState("");
  const [newRulePattern, setNewRulePattern] = useState("");

  const [scope, setScope] = useState<AssignmentScope>("EMPLOYEE");
  const [targetId, setTargetId] = useState("");
  const [selectedShiftId, setSelectedShiftId] = useState("");
  // choose schedule rule when assigning
  const [selectedScheduleRuleId, setSelectedScheduleRuleId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");

  /* ===================== FILTER STATES ===================== */

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  /* ===================== INLINE EDIT STATES ===================== */

  const [editingShiftTypeId, setEditingShiftTypeId] = useState<string | null>(
    null,
  );
  const [draftShiftTypeName, setDraftShiftTypeName] = useState<string>("");

  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [draftShift, setDraftShift] = useState<{
    name: string;
    shiftTypeId: string;
    startTime: string;
    endTime: string;
    // Grace minutes for edit
    graceInMinutes: string;
    graceOutMinutes: string;
  } | null>(null);

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [draftRule, setDraftRule] = useState<{
    name: string;
    pattern: string;
  } | null>(null);

  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(
    null,
  );
  const [draftAssignment, setDraftAssignment] = useState<{
    shiftId: string;
    scheduleRuleId?: string;
    startDate: string;
    endDate?: string;
  } | null>(null);

  const [isSavingRow, setIsSavingRow] = useState(false);

  /* ===================== REVOKE DIALOG ===================== */

  const [revokeDialog, setRevokeDialog] = useState<{
    open: boolean;
    type: "assignment" | null;
    id: string | null;
    name: string | null;
  }>({
    open: false,
    type: null,
    id: null,
    name: null,
  });

  const [isRevoking, setIsRevoking] = useState(false);

  /* ===================== LOADERS ===================== */

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    void loadTargets();
  }, [scope]);

  const loadAll = async () => {
    setIsLoadingAll(true);
    setLoadError(null);
    try {
      const [types, s, a, rules] = await Promise.all([
        timeManagementService.getAllShiftTypes(),
        timeManagementService.getAllShifts(),
        timeManagementService.getShiftAssignments(),
        timeManagementService.getScheduleRules(),
      ]);
      setShiftTypes(Array.isArray(types) ? types : []);
      setShifts(Array.isArray(s) ? s : []);
      setAssignments(Array.isArray(a) ? a : []);
      setScheduleRules(Array.isArray(rules) ? rules : []);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load shift data.";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const loadTargets = async () => {
    setIsLoadingTargets(true);
    setTargetId("");
    try {
      if (scope === "EMPLOYEE") {
        const res = await timeManagementService.getAllEmployees();
        setEmployees(Array.isArray(res) ? res : []);
      } else if (scope === "DEPARTMENT") {
        const res = await timeManagementService.getAllDepartments();
        setDepartments(Array.isArray(res) ? res : []);
      } else {
        const res = await timeManagementService.getAllPositions();
        setPositions(Array.isArray(res) ? res : []);
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to load targets.",
      );
    } finally {
      setIsLoadingTargets(false);
    }
  };

  /* ===================== TARGET HELPERS ===================== */

  const targetOptions = useMemo(() => {
    if (scope === "EMPLOYEE") return employees;
    if (scope === "DEPARTMENT") return departments;
    return positions;
  }, [scope, employees, departments, positions]);

  const targetLabel = useMemo(() => {
    if (scope === "EMPLOYEE") return "Employee";
    if (scope === "DEPARTMENT") return "Department";
    return "Position";
  }, [scope]);

  const targetDisplay = (item: any) => {
    if (scope === "EMPLOYEE") {
      return (
        item.personalemail ||
        item.personalEmail ||
        item.email ||
        item.name ||
        "Unknown Employee"
      );
    }
    return item.name || "Unknown";
  };

  /* ===================== SHIFT HELPERS ===================== */

  const shiftTypeIdFromShift = (s: any) => {
    const st = (s as any)?.shiftType;
    return getId(st) || (typeof st === "string" ? st : "");
  };

  const shiftTypeNameById = (id: string) =>
    shiftTypes.find((t) => t._id === id)?.name || "—";

  /* ===================== SCHEDULE RULE HELPERS ===================== */

  const scheduleRuleNameById = (id: string) =>
    scheduleRules.find((r) => r._id === id)?.name || "—";

  /* ===================== SCHEDULE RULE PATTERN EXAMPLES ===================== */

  const patternExamples = [
    { label: "4 on, 3 off", value: "4on-3off" },
    { label: "5 on, 2 off", value: "5on-2off" },
    { label: "Mon, Wed, Fri", value: "Mon,Wed,Fri" },
    { label: "Mon-Fri", value: "Mon,Tue,Wed,Thu,Fri" },
    { label: "Flex Hours", value: "Flex(08:00-10:00,16:00-18:00)" },
    { label: "Compressed", value: "Compressed(10h x 4d)" },
  ];

  /* ===================== FILTERED ASSIGNMENTS ===================== */

  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];

    if (filterStatus) {
      filtered = filtered.filter((a: any) => {
        const status = a?.status || "";
        return status === filterStatus;
      });
    }

    if (filterEmployee.trim()) {
      filtered = filtered.filter((a: any) => {
        const email = getEmployeeEmailFromAssignment(a).toLowerCase();
        const searchTerm = filterEmployee.toLowerCase();
        return email.includes(searchTerm);
      });
    }

    return filtered;
  }, [assignments, filterStatus, filterEmployee]);

  /* ===================== CREATE HANDLERS ===================== */

  const handleCreateShiftType = async () => {
    const name = shiftTypeName.trim();
    if (!name) return toast.error("Shift type name is required.");

    const exists = shiftTypes.some(
      (t) => (t.name || "").toLowerCase() === name.toLowerCase(),
    );
    if (exists) return toast.error("Shift type already exists.");

    setIsCreatingShiftType(true);
    try {
      await timeManagementService.createShiftType({ name });
      toast.success("Shift type created successfully.");
      setShiftTypeName("");
      await loadAll();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to create shift type.",
      );
    } finally {
      setIsCreatingShiftType(false);
    }
  };

  const handleCreateShift = async () => {
    const name = shiftName.trim();
    if (!name || !createShiftTypeId || !createStartTime || !createEndTime) {
      return toast.error("Please fill all required shift fields.");
    }

    const graceInMinutes = toSafeMinutesNumber(createGraceInMinutes);
    const graceOutMinutes = toSafeMinutesNumber(createGraceOutMinutes);

    setIsCreatingShift(true);
    try {
      await timeManagementService.createShift({
        name,
        shiftType: createShiftTypeId,
        startTime: createStartTime,
        endTime: createEndTime,
        // Grace minutes
        graceInMinutes,
        graceOutMinutes,
      } as any);

      toast.success("Shift created successfully.");
      setShiftName("");
      setCreateShiftTypeId("");
      setCreateStartTime("");
      setCreateEndTime("");
      setCreateGraceInMinutes("0");
      setCreateGraceOutMinutes("0");
      await loadAll();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to create shift.",
      );
    } finally {
      setIsCreatingShift(false);
    }
  };

  const handleCreateScheduleRule = async () => {
    const name = newRuleName.trim();
    const pattern = newRulePattern.trim();

    if (!name || !pattern) {
      return toast.error("Name and pattern are required.");
    }

    setIsCreatingRule(true);
    try {
      await timeManagementService.createScheduleRule({ name, pattern });
      toast.success("Schedule rule created successfully.");
      setNewRuleName("");
      setNewRulePattern("");
      await loadAll();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to create schedule rule.",
      );
    } finally {
      setIsCreatingRule(false);
    }
  };

  const handleAssignShift = async () => {
    if (!targetId || !selectedShiftId || !assignStartDate) {
      return toast.error("Target, shift, and start date are required.");
    }
    if (assignEndDate && assignStartDate > assignEndDate) {
      return toast.error("End date must be on or after start date.");
    }

    setIsAssigning(true);
    try {
      const payload: any = {
        shiftId: selectedShiftId,
        startDate: assignStartDate,
        endDate: assignEndDate || undefined,
      };

      // attach schedule rule if chosen
      if (selectedScheduleRuleId) {
        payload.scheduleRuleId = selectedScheduleRuleId;
      }

      if (scope === "EMPLOYEE") {
        await timeManagementService.assignShiftToEmployee({
          employeeId: targetId,
          ...payload,
        });
      } else if (scope === "DEPARTMENT") {
        await timeManagementService.assignShiftToDepartment(targetId, payload);
      } else {
        await timeManagementService.assignShiftToPosition(targetId, payload);
      }

      toast.success("Shift assigned successfully.");
      setTargetId("");
      setSelectedShiftId("");
      setSelectedScheduleRuleId("");
      setAssignStartDate("");
      setAssignEndDate("");
      await loadAll();
    } catch (e: any) {
      const errorData = e?.response?.data;

      if (errorData?.error === "NO_EMPLOYEES_IN_DEPARTMENT") {
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">{errorData.message}</p>
            {errorData.suggestion && (
              <p className="text-sm opacity-90">{errorData.suggestion}</p>
            )}
          </div>,
          { duration: 6000 },
        );
      } else if (errorData?.error === "NO_EMPLOYEES_IN_POSITION") {
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">{errorData.message}</p>
            {errorData.suggestion && (
              <p className="text-sm opacity-90">{errorData.suggestion}</p>
            )}
          </div>,
          { duration: 6000 },
        );
      } else {
        toast.error(errorData?.message || e?.message || "Failed to assign shift.");
      }
    } finally {
      setIsAssigning(false);
    }
  };

  /* ===================== INLINE EDIT: SHIFT TYPES ===================== */

  const startEditShiftType = (t: ShiftType) => {
    setEditingShiftId(null);
    setDraftShift(null);
    setEditingRuleId(null);
    setDraftRule(null);
    setEditingAssignmentId(null);
    setDraftAssignment(null);

    setEditingShiftTypeId(t._id);
    setDraftShiftTypeName(t.name || "");
  };

  const cancelEditShiftType = () => {
    setEditingShiftTypeId(null);
    setDraftShiftTypeName("");
  };

  const saveEditShiftType = async (id: string) => {
    const name = draftShiftTypeName.trim();
    if (!name) return toast.error("Shift type name is required.");

    setIsSavingRow(true);
    try {
      await timeManagementService.updateShiftType(id, { name });
      toast.success("Shift type updated successfully.");
      cancelEditShiftType();
      await loadAll();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to update shift type.",
      );
    } finally {
      setIsSavingRow(false);
    }
  };

  /* ===================== INLINE EDIT: SHIFTS ===================== */

  const startEditShift = (s: Shift) => {
    setEditingShiftTypeId(null);
    setDraftShiftTypeName("");
    setEditingRuleId(null);
    setDraftRule(null);
    setEditingAssignmentId(null);
    setDraftAssignment(null);

    setEditingShiftId((s as any)._id);
    setDraftShift({
      name: (s as any).name || "",
      shiftTypeId: shiftTypeIdFromShift(s),
      startTime: (s as any).startTime || "",
      endTime: (s as any).endTime || "",
      // Grace minutes for edit
      graceInMinutes: toSafeMinutesString((s as any).graceInMinutes),
      graceOutMinutes: toSafeMinutesString((s as any).graceOutMinutes),
    });
  };

  const cancelEditShift = () => {
    setEditingShiftId(null);
    setDraftShift(null);
  };

  const saveEditShift = async (id: string) => {
    if (!draftShift) return;

    const name = draftShift.name.trim();
    if (
      !name ||
      !draftShift.shiftTypeId ||
      !draftShift.startTime ||
      !draftShift.endTime
    ) {
      return toast.error("Please fill all required fields.");
    }

    const graceInMinutes = toSafeMinutesNumber(draftShift.graceInMinutes);
    const graceOutMinutes = toSafeMinutesNumber(draftShift.graceOutMinutes);

    setIsSavingRow(true);
    try {
      await timeManagementService.updateShift(
        id,
        {
          name,
          shiftType: draftShift.shiftTypeId,
          startTime: draftShift.startTime,
          endTime: draftShift.endTime,
          // Grace minutes
          graceInMinutes,
          graceOutMinutes,
        } as any,
      );

      toast.success("Shift updated successfully.");
      cancelEditShift();
      await loadAll();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to update shift.",
      );
    } finally {
      setIsSavingRow(false);
    }
  };

  /* ===================== INLINE EDIT: SCHEDULE RULES ===================== */

  const startEditScheduleRule = (rule: any) => {
    setEditingShiftTypeId(null);
    setDraftShiftTypeName("");
    setEditingShiftId(null);
    setDraftShift(null);
    setEditingAssignmentId(null);
    setDraftAssignment(null);

    setEditingRuleId(rule._id);
    setDraftRule({
      name: rule.name || "",
      pattern: rule.pattern || "",
    });
  };

  const cancelEditScheduleRule = () => {
    setEditingRuleId(null);
    setDraftRule(null);
  };

  const saveEditScheduleRule = async (id: string) => {
    if (!draftRule) return;

    const name = draftRule.name.trim();
    const pattern = draftRule.pattern.trim();

    if (!name || !pattern) {
      return toast.error("Name and pattern are required.");
    }

    setIsSavingRow(true);
    try {
      await timeManagementService.updateScheduleRule(id, {
        name,
        pattern,
      });
      toast.success("Schedule rule updated successfully.");
      cancelEditScheduleRule();
      await loadAll();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to update schedule rule.",
      );
    } finally {
      setIsSavingRow(false);
    }
  };

  const applyPatternExample = (pattern: string) => {
    setNewRulePattern(pattern);
  };

  /* ===================== INLINE EDIT: ASSIGNMENTS ===================== */

  const startEditAssignment = (a: any) => {
    setEditingShiftTypeId(null);
    setDraftShiftTypeName("");
    setEditingShiftId(null);
    setDraftShift(null);
    setEditingRuleId(null);
    setDraftRule(null);

    const id = a?._id || a?.id;
    if (!id) return;

    setEditingAssignmentId(id);
    setDraftAssignment({
      shiftId: getShiftIdFromAssignment(a),
      scheduleRuleId: getScheduleRuleIdFromAssignment(a) || undefined,
      startDate: toDateOnly(a?.startDate),
      endDate: a?.endDate ? toDateOnly(a?.endDate) : undefined,
    });
  };

  const cancelEditAssignment = () => {
    setEditingAssignmentId(null);
    setDraftAssignment(null);
  };

  const saveEditAssignment = async (id: string) => {
    if (!draftAssignment) return;

    if (!draftAssignment.shiftId || !draftAssignment.startDate) {
      return toast.error("Shift and start date are required.");
    }
    if (
      draftAssignment.endDate &&
      draftAssignment.startDate > draftAssignment.endDate
    ) {
      return toast.error("End date must be on or after start date.");
    }

    setIsSavingRow(true);
    try {
      await timeManagementService.updateShiftAssignment(id, {
        shiftId: draftAssignment.shiftId,
        startDate: draftAssignment.startDate,
        endDate: draftAssignment.endDate || undefined,
        // include schedule rule when editing
        scheduleRuleId: draftAssignment.scheduleRuleId || undefined,
      });
      toast.success("Assignment updated successfully.");
      cancelEditAssignment();
      await loadAll();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to update assignment.",
      );
    } finally {
      setIsSavingRow(false);
    }
  };

  /* ===================== REVOKE HANDLERS ===================== */

  const openRevokeDialog = (type: "assignment", id: string, name: string) => {
    setRevokeDialog({
      open: true,
      type,
      id,
      name,
    });
  };

  const closeRevokeDialog = () => {
    setRevokeDialog({
      open: false,
      type: null,
      id: null,
      name: null,
    });
  };

  const confirmRevoke = async () => {
    if (!revokeDialog.id || !revokeDialog.type) return;

    setIsRevoking(true);
    try {
      if (revokeDialog.type === "assignment") {
        await timeManagementService.deleteShiftAssignment(revokeDialog.id);
        toast.success("Shift assignment revoked successfully.");
      }

      closeRevokeDialog();
      await loadAll();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to revoke assignment.",
      );
    } finally {
      setIsRevoking(false);
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Shift Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage shift types, shifts, schedule rules, and assignments with inline
          editing.
        </p>
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {/* ===================== CREATE SHIFT TYPE ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Create Shift Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="e.g., Normal, Night Shift"
            value={shiftTypeName}
            onChange={(e) => setShiftTypeName(e.target.value)}
            disabled={isCreatingShiftType}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isCreatingShiftType) {
                void handleCreateShiftType();
              }
            }}
          />
          <Button
            onClick={() => void handleCreateShiftType()}
            disabled={isCreatingShiftType || !shiftTypeName.trim()}
            className="w-full sm:w-auto"
          >
            {isCreatingShiftType && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Shift Type
          </Button>
        </CardContent>
      </Card>

      {/* ===================== SHIFT TYPES TABLE ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Types</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAll ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : shiftTypes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No shift types.</div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full border text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftTypes.map((t) => {
                    const isEditing = editingShiftTypeId === t._id;
                    return (
                      <tr key={t._id} className="border-t">
                        <td className="p-2">
                          {isEditing ? (
                            <Input
                              value={draftShiftTypeName}
                              onChange={(e) =>
                                setDraftShiftTypeName(e.target.value)
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            t.name
                          )}
                        </td>
                        <td className="p-2">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                onClick={() => void saveEditShiftType(t._id)}
                                disabled={isSavingRow}
                                title="Save"
                              >
                                {isSavingRow ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={cancelEditShiftType}
                                disabled={isSavingRow}
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => startEditShiftType(t)}
                              disabled={
                                isSavingRow ||
                                !!editingShiftId ||
                                !!editingRuleId ||
                                !!editingAssignmentId
                              }
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===================== CREATE SHIFT ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Create Shift</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Shift name (e.g., Morning Shift)"
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value)}
            disabled={isCreatingShift}
          />

          <Select
            value={createShiftTypeId}
            onValueChange={setCreateShiftTypeId}
            disabled={isCreatingShift}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shift type" />
            </SelectTrigger>
            <SelectContent>
              {shiftTypes.length === 0 ? (
                <SelectItem value="__NONE__" disabled>
                  No shift types available
                </SelectItem>
              ) : (
                shiftTypes.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Start Time *
              </label>
              <Input
                type="time"
                value={createStartTime}
                onChange={(e) => setCreateStartTime(e.target.value)}
                disabled={isCreatingShift}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Time *</label>
              <Input
                type="time"
                value={createEndTime}
                onChange={(e) => setCreateEndTime(e.target.value)}
                disabled={isCreatingShift}
              />
            </div>
          </div>

          {/* Grace minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Grace In Minutes
              </label>
              <Input
                type="number"
                min={0}
                value={createGraceInMinutes}
                onChange={(e) => setCreateGraceInMinutes(e.target.value)}
                disabled={isCreatingShift}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Grace Out Minutes
              </label>
              <Input
                type="number"
                min={0}
                value={createGraceOutMinutes}
                onChange={(e) => setCreateGraceOutMinutes(e.target.value)}
                disabled={isCreatingShift}
              />
            </div>
          </div>

          <Button
            onClick={() => void handleCreateShift()}
            disabled={isCreatingShift}
            className="w-full sm:w-auto"
          >
            {isCreatingShift && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Shift
          </Button>
        </CardContent>
      </Card>

      {/* ===================== SHIFTS TABLE ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAll ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No shifts.</div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full border text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Shift Type</th>
                    <th className="p-2 text-left">Start Time</th>
                    <th className="p-2 text-left">End Time</th>
                    <th className="p-2 text-left">Grace In</th>
                    <th className="p-2 text-left">Grace Out</th>
                    <th className="p-2 text-left">Duration</th>
                    <th className="p-2 text-left w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s: any) => {
                    const isEditing = editingShiftId === s._id;
                    const stId = shiftTypeIdFromShift(s);

                    // Use computed fields from backend
                    const isOvernight = s.isOvernight || false;
                    const duration = s.durationHours || 0;

                    const graceIn = toSafeMinutesNumber(s.graceInMinutes);
                    const graceOut = toSafeMinutesNumber(s.graceOutMinutes);

                    return (
                      <tr key={s._id} className="border-t">
                        {/* NAME COLUMN */}
                        <td className="p-2">
                          {isEditing && draftShift ? (
                            <Input
                              value={draftShift.name}
                              onChange={(e) =>
                                setDraftShift({
                                  ...draftShift,
                                  name: e.target.value,
                                })
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{s.name}</span>
                              {isOvernight && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                                  Overnight
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* SHIFT TYPE COLUMN */}
                        <td className="p-2 min-w-[220px]">
                          {isEditing && draftShift ? (
                            <Select
                              value={draftShift.shiftTypeId}
                              onValueChange={(v) =>
                                setDraftShift({ ...draftShift, shiftTypeId: v })
                              }
                              disabled={isSavingRow}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select shift type" />
                              </SelectTrigger>
                              <SelectContent>
                                {shiftTypes.map((t) => (
                                  <SelectItem key={t._id} value={t._id}>
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{shiftTypeNameById(stId)}</span>
                          )}
                        </td>

                        {/* START TIME COLUMN */}
                        <td className="p-2">
                          {isEditing && draftShift ? (
                            <Input
                              type="time"
                              value={draftShift.startTime}
                              onChange={(e) =>
                                setDraftShift({
                                  ...draftShift,
                                  startTime: e.target.value,
                                })
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            s.startTime
                          )}
                        </td>

                        {/* END TIME COLUMN */}
                        <td className="p-2">
                          {isEditing && draftShift ? (
                            <Input
                              type="time"
                              value={draftShift.endTime}
                              onChange={(e) =>
                                setDraftShift({
                                  ...draftShift,
                                  endTime: e.target.value,
                                })
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            s.endTime
                          )}
                        </td>

                        {/* GRACE IN COLUMN */}
                        <td className="p-2">
                          {isEditing && draftShift ? (
                            <Input
                              type="number"
                              min={0}
                              value={draftShift.graceInMinutes}
                              onChange={(e) =>
                                setDraftShift({
                                  ...draftShift,
                                  graceInMinutes: e.target.value,
                                })
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              {graceIn}m
                            </span>
                          )}
                        </td>

                        {/* GRACE OUT COLUMN */}
                        <td className="p-2">
                          {isEditing && draftShift ? (
                            <Input
                              type="number"
                              min={0}
                              value={draftShift.graceOutMinutes}
                              onChange={(e) =>
                                setDraftShift({
                                  ...draftShift,
                                  graceOutMinutes: e.target.value,
                                })
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              {graceOut}m
                            </span>
                          )}
                        </td>

                        {/* DURATION COLUMN */}
                        <td className="p-2">
                          <span className="text-muted-foreground">
                            {Number(duration).toFixed(1)}h
                          </span>
                        </td>

                        {/* ACTIONS COLUMN */}
                        <td className="p-2">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                onClick={() => void saveEditShift(s._id)}
                                disabled={isSavingRow}
                                title="Save"
                              >
                                {isSavingRow ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={cancelEditShift}
                                disabled={isSavingRow}
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => startEditShift(s)}
                              disabled={
                                isSavingRow ||
                                !!editingShiftTypeId ||
                                !!editingRuleId ||
                                !!editingAssignmentId
                              }
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===================== SCHEDULE RULES SECTION ===================== */}

      {/* Pattern Guide */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Supported Pattern Formats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-blue-900">Rotation Pattern:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                4on-3off
              </code>
              <p className="text-muted-foreground text-xs mt-1">
                4 days on, 3 days off
              </p>
            </div>

            <div>
              <p className="font-semibold text-blue-900">Weekly Specific Days:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                Mon,Wed,Fri
              </code>
              <p className="text-muted-foreground text-xs mt-1">
                Work on Monday, Wednesday, Friday
              </p>
            </div>

            <div>
              <p className="font-semibold text-blue-900">Flexible Hours:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                Flex(08:00-10:00,16:00-18:00)
              </code>
              <p className="text-muted-foreground text-xs mt-1">
                Flex in: 8-10 AM, Flex out: 4-6 PM
              </p>
            </div>

            <div>
              <p className="font-semibold text-blue-900">Compressed Week:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                Compressed(10h x 4d)
              </code>
              <p className="text-muted-foreground text-xs mt-1">
                10 hours × 4 days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Schedule Rule */}
      <Card>
        <CardHeader>
          <CardTitle>Create Schedule Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rule Name *</label>
            <Input
              placeholder="e.g., 4-3 Rotation, Flex Hours"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              disabled={isCreatingRule}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pattern *</label>
            <Input
              placeholder="e.g., 4on-3off"
              value={newRulePattern}
              onChange={(e) => setNewRulePattern(e.target.value)}
              disabled={isCreatingRule}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Quick examples:</span>
              {patternExamples.map((ex) => (
                <Button
                  key={ex.value}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPatternExample(ex.value)}
                  disabled={isCreatingRule}
                  className="text-xs h-7"
                  title={ex.value}
                >
                  {ex.label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => void handleCreateScheduleRule()}
            disabled={
              isCreatingRule || !newRuleName.trim() || !newRulePattern.trim()
            }
            className="w-full sm:w-auto"
          >
            {isCreatingRule && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Schedule Rule
          </Button>
        </CardContent>
      </Card>

      {/* Schedule Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAll ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : scheduleRules.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No schedule rules created yet.
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full border text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Pattern</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRules.map((rule) => {
                    const isEditing = editingRuleId === rule._id;
                    return (
                      <tr key={rule._id} className="border-t">
                        <td className="p-2">
                          {isEditing && draftRule ? (
                            <Input
                              value={draftRule.name}
                              onChange={(e) =>
                                setDraftRule({
                                  ...draftRule,
                                  name: e.target.value,
                                })
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            rule.name
                          )}
                        </td>

                        <td className="p-2">
                          {isEditing && draftRule ? (
                            <Input
                              value={draftRule.pattern}
                              onChange={(e) =>
                                setDraftRule({
                                  ...draftRule,
                                  pattern: e.target.value,
                                })
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {rule.pattern || "—"}
                            </code>
                          )}
                        </td>

                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              rule.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rule.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="p-2">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                onClick={() => void saveEditScheduleRule(rule._id)}
                                disabled={isSavingRow}
                                title="Save"
                              >
                                {isSavingRow ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={cancelEditScheduleRule}
                                disabled={isSavingRow}
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => startEditScheduleRule(rule)}
                              disabled={
                                isSavingRow ||
                                !!editingShiftTypeId ||
                                !!editingShiftId ||
                                !!editingAssignmentId
                              }
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===================== ASSIGN SHIFT FORM ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Shift</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={scope}
            onValueChange={(v) => setScope(v as AssignmentScope)}
            disabled={isAssigning}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPLOYEE">Assign to Employee</SelectItem>
              <SelectItem value="DEPARTMENT">Assign to Department</SelectItem>
              <SelectItem value="POSITION">Assign to Position</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={targetId}
            onValueChange={setTargetId}
            disabled={isAssigning || isLoadingTargets}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${targetLabel.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingTargets ? (
                <SelectItem value="__LOADING__" disabled>
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </SelectItem>
              ) : targetOptions.length === 0 ? (
                <SelectItem value="__NONE__" disabled>
                  No {targetLabel.toLowerCase()}s available
                </SelectItem>
              ) : (
                targetOptions.map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {targetDisplay(item)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select
            value={selectedShiftId}
            onValueChange={setSelectedShiftId}
            disabled={isAssigning || isLoadingAll}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              {shifts.length === 0 ? (
                <SelectItem value="__NONE__" disabled>
                  No shifts available
                </SelectItem>
              ) : (
                shifts.map((s: any) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Select schedule rule to apply (optional) */}
          <Select
            value={selectedScheduleRuleId || "__NONE__"}
            onValueChange={(v) =>
              setSelectedScheduleRuleId(v === "__NONE__" ? "" : v)
            }
            disabled={isAssigning || isLoadingAll}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select schedule rule (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">No rule (none)</SelectItem>
              {scheduleRules.length === 0 ? (
                <SelectItem value="__NO_RULES__" disabled>
                  No schedule rules available
                </SelectItem>
              ) : (
                scheduleRules.map((rule: any) => (
                  <SelectItem key={rule._id} value={rule._id}>
                    {rule.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Start Date *
              </label>
              <Input
                type="date"
                value={assignStartDate}
                onChange={(e) => setAssignStartDate(e.target.value)}
                disabled={isAssigning}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                End Date (optional)
              </label>
              <Input
                type="date"
                value={assignEndDate}
                onChange={(e) => setAssignEndDate(e.target.value)}
                disabled={isAssigning}
                min={assignStartDate}
              />
            </div>
          </div>

          <Button
            onClick={() => void handleAssignShift()}
            disabled={isAssigning}
            className="w-full sm:w-auto"
          >
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Shift
          </Button>
        </CardContent>
      </Card>

      {/* ===================== ASSIGNMENTS TABLE ===================== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assigned Shifts</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <label className="text-sm font-medium mb-1 block">
                  Filter by Status
                </label>
                <div className="flex items-center gap-2">
                  <Select
                    value={filterStatus || "ALL"}
                    onValueChange={(v) => setFilterStatus(v === "ALL" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {filterStatus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterStatus("")}
                      className="shrink-0"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium mb-1 block">
                  Filter by Employee
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search by email..."
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                  />
                  {filterEmployee && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterEmployee("")}
                      className="shrink-0"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLoadingAll ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {filterStatus || filterEmployee
                ? "No assignments match your filters."
                : "No assignments found."}
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full border text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left whitespace-nowrap">
                      Employee Email
                    </th>
                    <th className="p-2 text-left whitespace-nowrap">Department</th>
                    <th className="p-2 text-left whitespace-nowrap">Position</th>
                    <th className="p-2 text-left whitespace-nowrap">Shift Type</th>
                    <th className="p-2 text-left whitespace-nowrap">Shift</th>
                    {/* Schedule rule column */}
                    <th className="p-2 text-left whitespace-nowrap">
                      Schedule Rule
                    </th>
                    <th className="p-2 text-left whitespace-nowrap">Start</th>
                    <th className="p-2 text-left whitespace-nowrap">End</th>
                    <th className="p-2 text-left whitespace-nowrap">Status</th>
                    <th className="p-2 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssignments.map((a: any) => {
                    const id = a?._id || a?.id;
                    const isEditing = editingAssignmentId === id;

                    const empEmail = getEmployeeEmailFromAssignment(a);
                    const dep = getDepartmentNameFromAssignment(a);
                    const pos = getPositionNameFromAssignment(a);

                    const shiftName = getShiftNameFromAssignment(a);
                    const shiftTypeName = getShiftTypeNameFromAssignment(a);

                    const displayShiftName =
                      isEditing && draftAssignment
                        ? shifts.find((s) => s._id === draftAssignment.shiftId)
                            ?.name || "—"
                        : shiftName;

                    const displayShiftType =
                      isEditing && draftAssignment
                        ? shiftTypeNameById(
                            shiftTypeIdFromShift(
                              shifts.find((s) => s._id === draftAssignment.shiftId),
                            ),
                          )
                        : shiftTypeName;

                    const scheduleRuleId = getScheduleRuleIdFromAssignment(a);
                    const displayScheduleRuleName =
                      isEditing && draftAssignment
                        ? scheduleRuleNameById(
                            draftAssignment.scheduleRuleId || "",
                          )
                        : scheduleRuleNameById(scheduleRuleId);

                    const isCancelled = a?.status === "CANCELLED";
                    const isExpired = a?.status === "EXPIRED";
                    const isDisabled = isCancelled || isExpired;

                    return (
                      <tr key={id} className="border-t">
                        <td className="p-2 whitespace-nowrap">{empEmail}</td>
                        <td className="p-2 whitespace-nowrap">{dep}</td>
                        <td className="p-2 whitespace-nowrap">{pos}</td>
                        <td className="p-2 whitespace-nowrap">
                          {displayShiftType}
                        </td>

                        <td className="p-2 min-w-[260px]">
                          {isEditing && draftAssignment ? (
                            <Select
                              value={draftAssignment.shiftId}
                              onValueChange={(v) =>
                                setDraftAssignment({
                                  ...draftAssignment,
                                  shiftId: v,
                                })
                              }
                              disabled={isSavingRow}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select shift" />
                              </SelectTrigger>
                              <SelectContent>
                                {shifts.map((s: any) => (
                                  <SelectItem key={s._id} value={s._id}>
                                    {s.name} ({s.startTime} - {s.endTime})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="whitespace-nowrap">
                              {displayShiftName}
                            </span>
                          )}
                        </td>

                        {/* schedule rule cell */}
                        <td className="p-2 whitespace-nowrap min-w-[220px]">
                          {isEditing && draftAssignment ? (
                            <Select
                              value={draftAssignment.scheduleRuleId || "__NONE__"}
                              onValueChange={(v) =>
                                setDraftAssignment({
                                  ...draftAssignment,
                                  scheduleRuleId:
                                    v === "__NONE__" ? undefined : v,
                                })
                              }
                              disabled={isSavingRow}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="No rule (none)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__NONE__">
                                  No rule (none)
                                </SelectItem>
                                {scheduleRules.length === 0 ? (
                                  <SelectItem value="__NO_RULES__" disabled>
                                    No schedule rules available
                                  </SelectItem>
                                ) : (
                                  scheduleRules.map((rule: any) => (
                                    <SelectItem key={rule._id} value={rule._id}>
                                      {rule.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="whitespace-nowrap">
                              {scheduleRuleId
                                ? displayScheduleRuleName
                                : "—"}
                            </span>
                          )}
                        </td>

                        <td className="p-2 whitespace-nowrap">
                          {isEditing && draftAssignment ? (
                            <Input
                              type="date"
                              value={draftAssignment.startDate}
                              onChange={(e) =>
                                setDraftAssignment({
                                  ...draftAssignment,
                                  startDate: e.target.value,
                                })
                              }
                              disabled={isSavingRow}
                            />
                          ) : (
                            toDateOnly(a?.startDate) || "—"
                          )}
                        </td>

                        <td className="p-2 whitespace-nowrap">
                          {isEditing && draftAssignment ? (
                            <Input
                              type="date"
                              value={draftAssignment.endDate ?? ""}
                              onChange={(e) =>
                                setDraftAssignment({
                                  ...draftAssignment,
                                  endDate: e.target.value || undefined,
                                })
                              }
                              disabled={isSavingRow}
                              min={draftAssignment.startDate}
                            />
                          ) : (
                            toDateOnly(a?.endDate) || "—"
                          )}
                        </td>

                        <td className="p-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              a?.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : a?.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : a?.status === "EXPIRED"
                                    ? "bg-gray-100 text-gray-800"
                                    : a?.status === "CANCELLED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {a?.status || "—"}
                          </span>
                        </td>

                        <td className="p-2 whitespace-nowrap">
                          {isEditing && draftAssignment ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                onClick={() => void saveEditAssignment(id)}
                                disabled={isSavingRow}
                                title="Save"
                              >
                                {isSavingRow ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={cancelEditAssignment}
                                disabled={isSavingRow}
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => startEditAssignment(a)}
                                disabled={
                                  isSavingRow ||
                                  !!editingShiftTypeId ||
                                  !!editingShiftId ||
                                  !!editingRuleId ||
                                  isDisabled
                                }
                                title={
                                  isCancelled
                                    ? "Cannot edit cancelled assignment"
                                    : isExpired
                                      ? "Cannot edit expired assignment"
                                      : "Edit"
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() =>
                                  openRevokeDialog(
                                    "assignment",
                                    id,
                                    `${empEmail}'s assignment`,
                                  )
                                }
                                disabled={isSavingRow || isDisabled}
                                title={
                                  isCancelled
                                    ? "Already cancelled"
                                    : isExpired
                                      ? "Cannot revoke expired assignment"
                                      : "Revoke Assignment"
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="text-xs text-muted-foreground mt-2">
                Showing {filteredAssignments.length} of {assignments.length} assignments
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===================== REVOKE CONFIRMATION DIALOG ===================== */}
      <AlertDialog
        open={revokeDialog.open}
        onOpenChange={(open) => !open && closeRevokeDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Shift Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the shift assignment for "{revokeDialog.name}".
              The assignment will be marked as CANCELLED and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevoke}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
