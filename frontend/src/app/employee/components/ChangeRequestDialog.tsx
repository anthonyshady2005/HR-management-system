"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileEdit, Plus, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { submitChangeRequest, formatFieldName, getMyProfile } from "../api";
import { api } from "@/lib/api";
import type { FieldChange, Position, Department, EmployeeProfile } from "../types";

interface ChangeRequestDialogProps {
  onSuccess?: () => void;
}

const GOVERNED_FIELDS = [
  { value: "firstName", label: "First Name", type: "text" },
  { value: "lastName", label: "Last Name", type: "text" },
  { value: "nationalId", label: "National ID", type: "text" },
  { value: "dateOfBirth", label: "Date of Birth", type: "date" },
  { value: "gender", label: "Gender", type: "select", options: ["MALE", "FEMALE"] },
  {
    value: "maritalStatus",
    label: "Marital Status",
    type: "select",
    options: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"],
  },
  { value: "primaryPositionId", label: "Position", type: "position" },
  { value: "primaryDepartmentId", label: "Department", type: "department" },
  { value: "jobTitle", label: "Job Title", type: "text" },
];

export function ChangeRequestDialog({ onSuccess }: ChangeRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [reason, setReason] = useState("");

  // STEP 1: Separate profile (source of truth) from form state
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [form, setForm] = useState<Partial<EmployeeProfile>>({});

  // Field selection UI state (for adding fields one by one)
  const [selectedField, setSelectedField] = useState("");
  const [newValue, setNewValue] = useState("");

  // Load profile when dialog opens (STEP 1)
  useEffect(() => {
    if (open) {
      loadProfile();
      loadPositionsAndDepartments();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      const profileData = await getMyProfile();
      // Set profile as immutable source of truth
      setProfile(profileData);
      // Initialize form with current profile values
      setForm({
        firstName: profileData.firstName ?? "",
        lastName: profileData.lastName ?? "",
        nationalId: profileData.nationalId ?? "",
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : "",
        gender: profileData.gender ?? "",
        maritalStatus: profileData.maritalStatus ?? "",
        primaryPositionId: profileData.primaryPositionId?._id || profileData.primaryPositionId || "",
        primaryDepartmentId: profileData.primaryDepartmentId?._id || profileData.primaryDepartmentId || "",
        jobTitle: profileData.jobTitle ?? "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile data");
    }
  };

  const loadPositionsAndDepartments = async () => {
    try {
      const [posRes, deptRes] = await Promise.all([
        // NOTE: /positions is System Admin only. /positions/list is the intended dropdown endpoint.
        api.get("/organization-structure/positions/list"),
        api.get("/organization-structure/departments"),
      ]);
      setPositions(posRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (error) {
      console.error("Failed to load positions/departments:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to load positions/departments";
      toast.error(message);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleAddField = () => {
    if (!selectedField) {
      toast.error("Please select a field to change");
      return;
    }

    const trimmedValue = newValue?.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue === "null" || trimmedValue === "undefined") {
      toast.error("Please enter a valid new value");
      return;
    }

    // Update form state with the new value
    handleFieldChange(selectedField, getFieldConfig(selectedField)?.type === "text" ? trimmedValue : newValue);

    setSelectedField("");
    setNewValue("");
  };

  const getFieldConfig = (fieldName: string) => {
    return GOVERNED_FIELDS.find((f) => f.value === fieldName);
  };

  // STEP 3: Build change request fields by comparing PROFILE vs FORM
  const handleSubmit = async () => {
    if (!profile) {
      toast.error("Profile data not loaded. Please try again.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for this change request");
      return;
    }

    // Build fieldChanges by comparing profile (source of truth) vs form (user input)
    const fieldChanges: FieldChange[] = [];

    // Compare each governed field
    for (const fieldConfig of GOVERNED_FIELDS) {
      const fieldName = fieldConfig.value as keyof EmployeeProfile;
      
      // Get old value from PROFILE (source of truth)
      let oldValue: any = (profile as any)[fieldName];
      
      // Handle ObjectId references - normalize to string
      if (oldValue && typeof oldValue === 'object' && oldValue._id) {
        oldValue = oldValue._id.toString();
      } else if (oldValue && typeof oldValue === 'object') {
        // Handle other object types (convert to string)
        oldValue = String(oldValue);
      } else if (oldValue !== null && oldValue !== undefined) {
        // Convert to string for consistent comparison
        oldValue = String(oldValue);
      }
      
      // Normalize null/undefined to null
      if (oldValue === null || oldValue === undefined) {
        oldValue = null;
      }
      
      // Get new value from FORM (user input)
      let newValue: any = form[fieldName];
      
      // Normalize new value - convert empty strings to null, and ensure strings are trimmed
      if (newValue === "" || newValue === undefined) {
        newValue = null;
      } else if (typeof newValue === 'string') {
        newValue = newValue.trim();
        if (newValue === "") {
          newValue = null;
        }
      }
      
      // Compare normalized values
      // Both should be strings (or null) at this point
      const oldValueNormalized = oldValue === null ? null : String(oldValue).trim();
      const newValueNormalized = newValue === null ? null : String(newValue).trim();
      
      // Only add if values are different
      if (oldValueNormalized !== newValueNormalized) {
        fieldChanges.push({
          fieldName: fieldName,
          oldValue: oldValue, // ✅ ALWAYS FROM PROFILE
          newValue: newValue, // ✅ FROM FORM
        });
      }
    }

    if (fieldChanges.length === 0) {
      // Debug: Log what was compared to help diagnose the issue
      console.log("[ChangeRequestDialog] No changes detected. Comparison details:", {
        profile: profile,
        form: form,
        governedFields: GOVERNED_FIELDS.map(f => ({
          field: f.value,
          profileValue: (profile as any)[f.value],
          formValue: form[f.value as keyof EmployeeProfile],
        })),
      });
      toast.error("No changes detected. Please modify at least one field.");
      return;
    }

    console.log("[ChangeRequestDialog] Submitting change request with fields:", fieldChanges);
    console.log("[ChangeRequestDialog] Profile data:", profile);
    console.log("[ChangeRequestDialog] Form data:", form);

    try {
      setSubmitting(true);
      const result = await submitChangeRequest({
        fields: fieldChanges,
        reason: reason.trim(),
      });

      // Check if auto-approved
      if (result.status === "APPROVED") {
        toast.success(
          "Your change request was automatically approved! Changes have been applied to your profile.",
          { duration: 5000 }
        );
      } else {
        toast.success(
          "Change request submitted successfully. It will be reviewed by HR.",
          { duration: 5000 }
        );
      }

      // Reset form
      setForm({});
      setReason("");
      setSelectedField("");
      setNewValue("");
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to submit change request:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to submit change request";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <FileEdit className="w-4 h-4 mr-2" />
          Request Change
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="w-5 h-5" />
            Request Profile Change
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Submit a request to change governed fields in your profile. HR will
            review and approve/reject your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-blue-300 mb-1">
                  About Change Requests
                </p>
                <p>
                  These fields are governed by HR policies and require approval.
                  Some requests may be auto-approved based on workflow rules.
                </p>
              </div>
            </div>
          </div>

          {/* Add Field Section */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-medium text-sm">Add Field to Change</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Select Field
                </Label>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNED_FIELDS.map((field) => (
                      <SelectItem
                        key={field.value}
                        value={field.value}
                      >
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  New Value
                </Label>
                {selectedField &&
                getFieldConfig(selectedField)?.type === "position" ? (
                  <Select value={newValue || ""} onValueChange={setNewValue}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position._id} value={position._id}>
                          {position.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : selectedField &&
                  getFieldConfig(selectedField)?.type === "department" ? (
                  <Select value={newValue || ""} onValueChange={setNewValue}>
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
                ) : selectedField &&
                  getFieldConfig(selectedField)?.type === "select" ? (
                  <Select value={newValue || ""} onValueChange={setNewValue}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldConfig(selectedField)?.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={getFieldConfig(selectedField)?.type || "text"}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter new value"
                    disabled={!selectedField}
                  />
                )}
              </div>
            </div>
            <Button
              onClick={handleAddField}
              size="sm"
              variant="secondary"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          {/* Preview Changes */}
          {profile && Object.keys(form).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Preview Changes</h3>
              {GOVERNED_FIELDS.map((fieldConfig) => {
                const fieldName = fieldConfig.value as keyof EmployeeProfile;
                const oldVal = (profile as any)[fieldName];
                const newVal = form[fieldName];
                
                // Handle ObjectId references
                let oldValueStr = oldVal;
                if (oldVal && typeof oldVal === 'object' && oldVal._id) {
                  oldValueStr = oldVal._id.toString();
                } else if (oldVal && typeof oldVal === 'object') {
                  oldValueStr = String(oldVal);
                } else {
                  oldValueStr = oldVal === null || oldVal === undefined ? null : String(oldVal);
                }
                
                const newValueStr = newVal === null || newVal === undefined || newVal === "" ? null : String(newVal);
                
                if (oldValueStr !== newValueStr) {
                  return (
                    <div
                      key={fieldName}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {formatFieldName(fieldName)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          <span className="text-red-400">{oldValueStr ?? "—"}</span>
                          {" → "}
                          <span className="text-green-400">{newValueStr ?? "—"}</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          )}

          {/* Reason */}
          <div>
            <Label className="text-slate-300 mb-2 block">
              Reason for Change Request *
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
              placeholder="Explain why you need to change these fields..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !profile}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <FileEdit className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
