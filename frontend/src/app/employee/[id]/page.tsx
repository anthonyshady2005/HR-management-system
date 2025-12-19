/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Edit,
  Save,
  X,
  User,
  Shield,
  Clock,
  AlertTriangle,
  Ban,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../components/StatusBadge";
import {
  getEmployeeById,
  updateEmployeeById,
  deactivateEmployee,
  assignRoles,
  getEmployeeRoles,
  getAuditHistory,
  getPopulatedValue,
  getDepartments,
  getPositions,
} from "../api";
import { getTeamMemberProfile } from "../api-manager";
import { sanitizeHrUpdatePayload } from "../utils/sanitizeHrUpdate";
import { SystemRole, PayGradeEnum } from "../types";
import type {
  EmployeeProfile,
  UpdateEmployeeProfileDto,
  HrUpdateEmployeeProfileDto,
  Position,
  Department,
  EmployeeStatus,
  Gender,
  MaritalStatus,
  ContractType,
  WorkType,
  DeactivationReason,
  ProfileAuditLog,
} from "../types";

const ALLOWED_ROLES = ["HR Admin", "HR Manager", "department head", "System Admin"];

export default function EmployeeDetailPage() {
  const { status, currentRole } = useAuth();
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [auditLogs, setAuditLogs] = useState<ProfileAuditLog[]>([]);
  const [employeeRoles, setEmployeeRoles] = useState<SystemRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // Edit data state - use HR-specific DTO
  const [editData, setEditData] = useState<HrUpdateEmployeeProfileDto>({
    firstName: "",
    lastName: "",
  });
  
  // Deactivation state
  const [deactivateData, setDeactivateData] = useState({
    reason: "" as DeactivationReason | "",
    notes: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  // Role assignment state
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [rolesToAssign, setRolesToAssign] = useState<SystemRole[]>([]);

  useEffect(() => {
    if (status === "authenticated" && employeeId) {
      loadEmployeeData();
    }
  }, [status, employeeId]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Determine if user is HR/Admin or just a Manager
      const isHrOrAdmin = currentRole === "HR Admin" || currentRole === "HR Manager" || currentRole === "System Admin";
      
      if (isHrOrAdmin) {
        const [profileData, rolesData, auditData, departmentsData, positionsData] = await Promise.all([
          getEmployeeById(employeeId),
          getEmployeeRoles(employeeId).catch(() => ({ roles: [] })),
          getAuditHistory(employeeId, 1, 20).catch(() => ({ data: [] })),
          getDepartments().catch(() => []),
          getPositions().catch(() => []),
        ]);
        
        setProfile(profileData);
        setEmployeeRoles(rolesData.roles || []);
        setAuditLogs(auditData.data || []);
        setDepartments(departmentsData || []);
        setPositions(positionsData || []);
        initializeEditData(profileData);
      } else {
        // Manager View - Restricted Data
        const profileData = await getTeamMemberProfile(employeeId);
        setProfile(profileData);
        // Managers don't see roles or audit logs
        setEmployeeRoles([]);
        setAuditLogs([]);
      }
    } catch (error: any) {
      console.error("Failed to load employee:", error);
      toast.error(
        error.response?.data?.message || "Failed to load employee profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const initializeEditData = (data: EmployeeProfile) => {
    setEditData({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      personalEmail: data.personalEmail || "",
      mobilePhone: data.mobilePhone || "",
      workEmail: data.workEmail || "",
      gender: data.gender,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split("T")[0]
        : "",
      maritalStatus: data.maritalStatus,
      nationalId: data.nationalId || "",
      biography: data.biography || "",
      profilePictureUrl: data.profilePictureUrl || "",
      dateOfHire: data.dateOfHire
        ? new Date(data.dateOfHire).toISOString().split("T")[0]
        : "",
      contractType: data.contractType,
      workType: data.workType,
      status: data.status,
      address: data.address || {},
      primaryPositionId: typeof data.primaryPositionId === 'string' 
        ? data.primaryPositionId 
        : (data.primaryPositionId as any)?._id || "",
      primaryDepartmentId: typeof data.primaryDepartmentId === 'string'
        ? data.primaryDepartmentId
        : (data.primaryDepartmentId as any)?._id || "",
      payGradeId: typeof data.payGradeId === 'string'
        ? data.payGradeId
        : (data.payGradeId as any)?._id || "",
    });
  };

  const handleSave = async () => {
    if (!profile) return;

    // Check for sync-triggering changes
    const profilePositionId = typeof profile.primaryPositionId === 'string' 
      ? profile.primaryPositionId 
      : (profile.primaryPositionId as any)?._id;
    const profileDepartmentId = typeof profile.primaryDepartmentId === 'string'
      ? profile.primaryDepartmentId
      : (profile.primaryDepartmentId as any)?._id;
    const profilePayGradeId = typeof profile.payGradeId === 'string'
      ? profile.payGradeId
      : (profile.payGradeId as any)?._id;

    try {
      setSaving(true);
      
      // Build payload matching HrUpdateEmployeeProfileDto
      const payload: any = {
        firstName: editData.firstName || undefined,
        lastName: editData.lastName || undefined,
        personalEmail: editData.personalEmail || undefined,
        workEmail: editData.workEmail || undefined,
        mobilePhone: editData.mobilePhone || undefined,
        
        // Use correct field names from backend DTO
        primaryPositionId: editData.primaryPositionId || undefined,
        primaryDepartmentId: editData.primaryDepartmentId || undefined,
        payGradeId: editData.payGradeId || undefined,
        
        // Map workPhone to homePhone (backend field name)
        homePhone: (editData as any).workPhone || undefined,
        
        status: editData.status || undefined,
        contractType: editData.contractType || undefined,
        workType: editData.workType || undefined,
        
        // Personal information
        gender: editData.gender || undefined,
        dateOfBirth: editData.dateOfBirth 
          ? new Date(editData.dateOfBirth).toISOString()
          : undefined,
        maritalStatus: editData.maritalStatus || undefined,
        nationalId: editData.nationalId || undefined,
        biography: editData.biography || undefined,
        profilePictureUrl: editData.profilePictureUrl || undefined,
        
        // Employment dates
        dateOfHire: editData.dateOfHire 
          ? new Date(editData.dateOfHire).toISOString()
          : undefined,
        
        // Address
        address: editData.address || undefined,
        
        // Optional but useful for audit
        changeReason: "HR updated employee profile",
      };
      
      // Sanitize payload: strip empty values, convert objects to IDs, remove server-managed fields
      const sanitized = sanitizeHrUpdatePayload(payload);
      
      const updated = await updateEmployeeById(employeeId, sanitized);

      // Update roles if changed
      const currentRolesSorted = [...employeeRoles].sort();
      const newRolesSorted = [...rolesToAssign].sort();
      if (JSON.stringify(currentRolesSorted) !== JSON.stringify(newRolesSorted)) {
        await assignRoles(employeeId, {
          roles: rolesToAssign,
          reason: "Role assignment update during profile edit",
        });
        setEmployeeRoles(rolesToAssign);
      }

      setEditing(false);
      toast.success("Profile updated successfully");
      
      // Reload all employee data to get fresh populated references
      await loadEmployeeData();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateData.reason || !deactivateData.notes) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await deactivateEmployee(employeeId, {
        deactivationReason: deactivateData.reason as DeactivationReason,
        notes: deactivateData.notes,
        effectiveDate: deactivateData.effectiveDate,
      });
      
      toast.success("Employee account permanently deleted");
      setShowDeactivateDialog(false);
      
      // Redirect to directory since employee no longer exists
      router.push("/employee/directory");
    } catch (error: any) {
      console.error("Failed to deactivate employee:", error);
      toast.error(
        error.response?.data?.message || "Failed to deactivate employee"
      );
    }
  };

  const handleCancel = () => {
    if (profile) {
      initializeEditData(profile);
    }
    setEditing(false);
  };

  const handleAssignRoles = async () => {
    try {
      await assignRoles(employeeId, {
        roles: rolesToAssign,
        reason: "Role assignment update by admin",
      });
      toast.success("Roles updated successfully");
      setShowRoleDialog(false);
      // Refresh roles
      const rolesData = await getEmployeeRoles(employeeId);
      setEmployeeRoles(rolesData.roles || []);
    } catch (error: any) {
      console.error("Failed to assign roles:", error);
      toast.error(error.response?.data?.message || "Failed to update roles");
    }
  };

  const position = profile?.primaryPositionId as Position | undefined;
  const department = profile?.primaryDepartmentId as Department | undefined;
  
  const isHrOrAdmin = currentRole === "HR Admin" || currentRole === "HR Manager" || currentRole === "System Admin";

  return (
    <ProtectedRoute allowedRoles={ALLOWED_ROLES}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <Navbar />
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-slate-400">Loading employee profile...</p>
            </div>
          </div>
        ) : !profile ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-slate-400">Failed to load profile</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-lg font-bold">
                  {profile.firstName?.[0]}
                  {profile.lastName?.[0]}
                </div>
              )}
            </Avatar>
            <div>
              <h1 className="text-3xl font-semibold">{profile.fullName}</h1>
              <p className="text-slate-400 text-sm">
                ID: {profile.employeeId} • {getPopulatedValue(position, "title")}
              </p>
            </div>
            <StatusBadge status={profile.status} className="ml-4" />
          </div>
          <div className="flex gap-2">
            {!editing && isHrOrAdmin && (
              <>
                <Button
                  onClick={() => setShowDeactivateDialog(true)}
                  variant="destructive"
                  size="sm"
                  disabled={
                    profile.status === "TERMINATED" ||
                    profile.status === "RETIRED"
                  }
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  onClick={() => {
                    setEditing(true);
                    setRolesToAssign(employeeRoles);
                  }}
                  variant="secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </>
            )}
            {editing && (
              <>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="default"
                  size="sm"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isHrOrAdmin && (
              <>
                <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                <TabsTrigger value="audit">Audit History</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* 
              BR 18b & BR 41b: Manager View Privacy Controls
              
              MANAGERS CAN SEE:
              - ✓ Full name
              - ✓ Position (shown in header)
              - ✓ Department  
              - ✓ Hire date
              - ✓ Employment status
              - ✓ Work email
              - ✓ Profile picture
              - ✓ Employee number
              
              MANAGERS CANNOT SEE (HR/Admin only):
              - ✗ National ID
              - ✗ Date of birth
              - ✗ Marital status
              - ✗ Personal email
              - ✗ Mobile phone
              - ✗ Salary/Pay grade
              - ✗ Bank details
              - ✗ Address
              - ✗ Personal contact information
            */}
            
            {/* Personal Information */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">First Name</Label>
                  {editing ? (
                    <Input
                      value={editData.firstName}
                      onChange={(e) =>
                        setEditData({ ...editData, firstName: e.target.value })
                      }
                      className="bg-white/5 border-white/10 text-white"
                    />
                  ) : (
                    <p className="text-white">{profile.firstName}</p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Last Name</Label>
                  {editing ? (
                    <Input
                      value={editData.lastName}
                      onChange={(e) =>
                        setEditData({ ...editData, lastName: e.target.value })
                      }
                      className="bg-white/5 border-white/10 text-white"
                    />
                  ) : (
                    <p className="text-white">{profile.lastName}</p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Gender</Label>
                  {editing ? (
                    <Select
                      value={editData.gender ?? ""}
                      onValueChange={(value) =>
                        setEditData({ ...editData, gender: value as Gender })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">{profile.gender || "—"}</p>
                  )}
                </div>
                {/* BR 18b: Hide sensitive personal data from managers */}
                {isHrOrAdmin && (
                  <>
                    <div>
                      <Label className="text-slate-300 mb-2 block">Date of Birth</Label>
                      {editing ? (
                        <Input
                          type="date"
                          value={
                            typeof editData.dateOfBirth === "string"
                              ? editData.dateOfBirth
                              : editData.dateOfBirth
                              ? new Date(editData.dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditData({ ...editData, dateOfBirth: e.target.value })
                          }
                          className="bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <p className="text-white">
                          {profile.dateOfBirth
                            ? new Date(profile.dateOfBirth).toLocaleDateString()
                            : "—"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-slate-300 mb-2 block">Marital Status</Label>
                      {editing ? (
                        <Select
                          value={editData.maritalStatus ?? ""}
                          onValueChange={(value) =>
                            setEditData({
                              ...editData,
                              maritalStatus: value as MaritalStatus,
                            })
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SINGLE">Single</SelectItem>
                            <SelectItem value="MARRIED">Married</SelectItem>
                            <SelectItem value="DIVORCED">Divorced</SelectItem>
                            <SelectItem value="WIDOWED">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white">{profile.maritalStatus || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-slate-300 mb-2 block">National ID</Label>
                      {editing ? (
                        <Input
                          value={editData.nationalId}
                          onChange={(e) =>
                            setEditData({ ...editData, nationalId: e.target.value })
                          }
                          className="bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <p className="text-white">{profile.nationalId || "—"}</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BR 18b: Hide personal contact info from managers */}
                {isHrOrAdmin && (
                  <>
                    <div>
                      <Label className="text-slate-300 mb-2 block">Personal Email</Label>
                      {editing ? (
                        <Input
                          type="email"
                          value={editData.personalEmail || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              personalEmail: e.target.value,
                            })
                          }
                          className="bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <p className="text-white">{profile.personalEmail}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-slate-300 mb-2 block">Mobile Phone</Label>
                      {editing ? (
                        <Input
                          value={editData.mobilePhone}
                          onChange={(e) =>
                            setEditData({ ...editData, mobilePhone: e.target.value })
                          }
                          className="bg-white/5 border-white/10 text-white"
                        />
                      ) : (
                        <p className="text-white">{profile.mobilePhone || "—"}</p>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <Label className="text-slate-300 mb-2 block">Work Email</Label>
                  {editing ? (
                    <Input
                      type="email"
                      value={editData.workEmail}
                      onChange={(e) =>
                        setEditData({ ...editData, workEmail: e.target.value })
                      }
                      className="bg-white/5 border-white/10 text-white"
                    />
                  ) : (
                    <p className="text-white">{profile.workEmail || "—"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">Department</Label>
                  {editing ? (
                    <Select
                      value={editData.primaryDepartmentId ?? ""}
                      onValueChange={(value) =>
                        setEditData({ ...editData, primaryDepartmentId: value })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">
                      {getPopulatedValue(department, "name")}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Position</Label>
                  {editing ? (
                    <Select
                      value={editData.primaryPositionId ?? ""}
                      onValueChange={(value) =>
                        setEditData({ ...editData, primaryPositionId: value })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos._id} value={pos._id}>
                            {pos.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">
                      {getPopulatedValue(position, "title")}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Pay Grade</Label>
                  {editing ? (
                    <Select
                      value={editData.payGradeId ?? ""}
                      onValueChange={(value) =>
                        setEditData({ ...editData, payGradeId: value })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select pay grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PayGradeEnum).map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">
                      {typeof profile.payGradeId === 'string' ? profile.payGradeId : "—"}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Employee Status</Label>
                  {editing ? (
                    <Select
                      value={editData.status ?? ""}
                      onValueChange={(value) =>
                        setEditData({ ...editData, status: value as EmployeeStatus })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="PROBATION">Probation</SelectItem>
                        <SelectItem value="RETIRED">Retired</SelectItem>
                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <StatusBadge status={profile.status} />
                  )}
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Date of Hire</Label>
                  {editing ? (
                    <Input
                      type="date"
                      value={
                        typeof editData.dateOfHire === "string"
                          ? editData.dateOfHire
                          : editData.dateOfHire
                          ? new Date(editData.dateOfHire)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditData({ ...editData, dateOfHire: e.target.value })
                      }
                      className="bg-white/5 border-white/10 text-white"
                    />
                  ) : (
                    <p className="text-white">
                      {new Date(profile.dateOfHire).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Contract Type</Label>
                  {editing ? (
                    <Select
                      value={editData.contractType ?? ""}
                      onValueChange={(value) =>
                        setEditData({
                          ...editData,
                          contractType: value as ContractType,
                        })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME_CONTRACT">Full-Time Contract</SelectItem>
                        <SelectItem value="PART_TIME_CONTRACT">Part-Time Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">{profile.contractType || "—"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Work Type</Label>
                  {editing ? (
                    <Select
                      value={editData.workType ?? ""}
                      onValueChange={(value) =>
                        setEditData({ ...editData, workType: value as WorkType })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                        <SelectItem value="PART_TIME">Part-Time</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">{profile.workType || "—"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          {isHrOrAdmin && (
            <TabsContent value="roles">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    System Roles
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRolesToAssign(employeeRoles);
                      setShowRoleDialog(true);
                    }}
                  >
                    Manage Roles
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employeeRoles.length > 0 ? (
                      employeeRoles.map((role, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"
                        >
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span>{role}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No roles assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Audit History Tab */}
          {isHrOrAdmin && (
            <TabsContent value="audit">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Audit History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <div
                          key={log._id}
                          className="p-4 bg-white/5 rounded-lg border-l-4 border-blue-500"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{log.action}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {log.description && (
                            <p className="text-sm text-slate-300 mb-2">
                              {log.description}
                            </p>
                          )}
                          {log.fieldsModified && log.fieldsModified.length > 0 && (
                            <p className="text-xs text-slate-400">
                              Modified fields: {log.fieldsModified.join(", ")}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No audit logs available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Role Assignment Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Manage System Roles</DialogTitle>
              <DialogDescription className="text-slate-400">
                Select the roles to assign to this employee.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {Object.values(SystemRole).map((role) => (
                <div key={role} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded">
                  <Checkbox
                    id={`role-${role}`}
                    checked={rolesToAssign.includes(role)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setRolesToAssign([...rolesToAssign, role]);
                      } else {
                        setRolesToAssign(rolesToAssign.filter((r) => r !== role));
                      }
                    }}
                  />
                  <Label
                    htmlFor={`role-${role}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                  >
                    {role}
                  </Label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowRoleDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleAssignRoles} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deactivation Dialog */}
        <AlertDialog
          open={showDeactivateDialog}
          onOpenChange={setShowDeactivateDialog}
        >
          <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Permanently Delete Employee
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                ⚠️ This action will PERMANENTLY DELETE {profile.fullName}'s account and all related data.
                This cannot be undone. The deletion will trigger synchronization with other systems.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Deactivation Reason *
                </Label>
                <Select
                  value={deactivateData.reason ?? ""}
                  onValueChange={(value) =>
                    setDeactivateData({
                      ...deactivateData,
                      reason: value as DeactivationReason,
                    })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                    <SelectItem value="RESIGNED">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Effective Date
                </Label>
                <Input
                  type="date"
                  value={deactivateData.effectiveDate}
                  onChange={(e) =>
                    setDeactivateData({
                      ...deactivateData,
                      effectiveDate: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">Notes *</Label>
                <Textarea
                  value={deactivateData.notes}
                  onChange={(e) =>
                    setDeactivateData({
                      ...deactivateData,
                      notes: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="Enter deactivation details..."
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivate}
                className="bg-red-600 hover:bg-red-700"
              >
                Permanently Delete Employee
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
