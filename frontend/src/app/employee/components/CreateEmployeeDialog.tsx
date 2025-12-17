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
import { UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import axios from "axios";
import { createEmployee } from "../api";
import type {
  CreateEmployeeProfileDto,
  Position,
  Department,
  EmployeeStatus,
  Gender,
  MaritalStatus,
  ContractType,
  WorkType,
} from "../types";
import { api } from "@/lib/api";

interface CreateEmployeeDialogProps {
  onSuccess?: () => void;
}

export function CreateEmployeeDialog({ onSuccess }: CreateEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form state
  const [formData, setFormData] = useState<CreateEmployeeProfileDto>({
    firstName: "",
    lastName: "",
    dateOfHire: new Date().toISOString().split("T")[0],
    workEmail: "",
    status: "ACTIVE" as EmployeeStatus,
  });

  // Load positions and departments when dialog opens
  useEffect(() => {
    if (open) {
      loadPositionsAndDepartments();
    }
  }, [open]);

  const loadPositionsAndDepartments = async () => {
    try {
      const [posRes, deptRes] = await Promise.all([
        api.get("/organization-structure/positions", {
        }),
        api.get("/organization-structure/departments"),
      ]);
      setPositions(posRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (error) {
      console.error("Failed to load positions/departments:", error);
    }
  };

  const handleInputChange = (field: keyof CreateEmployeeProfileDto, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!formData.workEmail.trim()) {
      toast.error("Work email is required");
      return;
    }
    if (!formData.dateOfHire) {
      toast.error("Date of hire is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.workEmail)) {
      toast.error("Please enter a valid work email address");
      return;
    }

    try {
      setSubmitting(true);
      const result = await createEmployee(formData);

      toast.success(`Employee ${result.employee.fullName || formData.firstName + " " + formData.lastName} created successfully!`);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        dateOfHire: new Date().toISOString().split("T")[0],
        workEmail: "",
        status: "ACTIVE" as EmployeeStatus,
      });
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create employee:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to create employee";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Create Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create New Employee
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Create a new employee profile. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Required Fields */}
          <div className="space-y-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <h3 className="font-medium text-sm text-blue-300">Required Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  First Name *
                </Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Last Name *
                </Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Work Email *
                </Label>
                <Input
                  type="email"
                  value={formData.workEmail}
                  onChange={(e) => handleInputChange("workEmail", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="john.doe@company.com"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Date of Hire *
                </Label>
                <Input
                  type="date"
                  value={formData.dateOfHire}
                  onChange={(e) => handleInputChange("dateOfHire", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-medium text-sm">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Middle Name
                </Label>
                <Input
                  value={formData.middleName || ""}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Middle"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  National ID
                </Label>
                <Input
                  value={formData.nationalId || ""}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="123456789"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Gender
                </Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) => handleInputChange("gender", value as Gender)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Marital Status
                </Label>
                <Select
                  value={formData.maritalStatus || ""}
                  onValueChange={(value) => handleInputChange("maritalStatus", value as MaritalStatus)}
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
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Personal Email
                </Label>
                <Input
                  type="email"
                  value={formData.personalEmail || ""}
                  onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="john.personal@email.com"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Mobile Phone
                </Label>
                <Input
                  value={formData.mobilePhone || ""}
                  onChange={(e) => handleInputChange("mobilePhone", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-medium text-sm">Employment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Employee Number
                </Label>
                <Input
                  value={formData.employeeNumber || ""}
                  onChange={(e) => handleInputChange("employeeNumber", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Auto-generated if left empty"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Status
                </Label>
                <Select
                  value={formData.status || "ACTIVE"}
                  onValueChange={(value) => handleInputChange("status", value as EmployeeStatus)}
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Job Title
                </Label>
                <Input
                  value={formData.jobTitle || ""}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          </div>

          {/* Organization Structure */}
          <div className="space-y-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-sm text-green-300 mb-1">
                  Organization & Team Assignment
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Assign employee to a position, department, and optionally to a manager's team.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Position
                </Label>
                <Select
                  value={formData.primaryPositionId || ""}
                  onValueChange={(value) => handleInputChange("primaryPositionId", value)}
                >
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
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Department
                </Label>
                <Select
                  value={formData.primaryDepartmentId || ""}
                  onValueChange={(value) => handleInputChange("primaryDepartmentId", value)}
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
              </div>
              <div className="col-span-2">
                <Label className="text-slate-300 mb-2 block text-xs">
                  Supervisor Position (Assign to Manager Team)
                </Label>
                <Select
                  value={formData.supervisorPositionId || ""}
                  onValueChange={(value) => handleInputChange("supervisorPositionId", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select manager's position (optional - adds to team)" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions
                      .filter((p) => p.title.toLowerCase().includes("manager") || p.title.toLowerCase().includes("head") || p.title.toLowerCase().includes("director"))
                      .map((position) => (
                        <SelectItem key={position._id} value={position._id}>
                          {position.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 mt-1">
                  Select a manager's position to add this employee to their team
                </p>
              </div>
            </div>
          </div>

          {/* Contract Information */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-medium text-sm">Contract Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Contract Start Date
                </Label>
                <Input
                  type="date"
                  value={formData.contractStartDate || ""}
                  onChange={(e) => handleInputChange("contractStartDate", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Contract End Date
                </Label>
                <Input
                  type="date"
                  value={formData.contractEndDate || ""}
                  onChange={(e) => handleInputChange("contractEndDate", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Contract Type
                </Label>
                <Select
                  value={formData.contractType || ""}
                  onValueChange={(value) => handleInputChange("contractType", value as ContractType)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME_CONTRACT">Full Time</SelectItem>
                    <SelectItem value="PART_TIME_CONTRACT">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block text-xs">
                  Work Type
                </Label>
                <Select
                  value={formData.workType || ""}
                  onValueChange={(value) => handleInputChange("workType", value as WorkType)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div>
            <Label className="text-slate-300 mb-2 block">
              Biography
            </Label>
            <Textarea
              value={formData.biography || ""}
              onChange={(e) => handleInputChange("biography", e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
              placeholder="Employee biography or notes..."
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
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Employee
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

