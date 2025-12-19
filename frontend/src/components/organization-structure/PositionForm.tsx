"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
import { toast } from "sonner";

interface Position {
  _id: string;
  code: string;
  title: string;
  description?: string;
  departmentId: string | { _id: string; name: string; code?: string };
  reportsToPositionId?: string | { _id: string; title: string; code: string };
  payGradeId?: string | { _id: string; grade: string };
  isActive: boolean;
}

interface PositionFormProps {
  position?: Position;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PositionForm({ position, onSuccess, onCancel }: PositionFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    departmentId: "",
    reportsTo: "",
    status: "active" as "active" | "inactive",
    payGradeId: "",
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [positions, setPositions] = useState<Array<{ id: string; title: string; code: string }>>([]);
  const [payGrades, setPayGrades] = useState<Array<{ _id: string; grade: string; baseSalary: number; grossSalary: number }>>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingPayGrades, setLoadingPayGrades] = useState(false);

  const isEditing = !!position;

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await api.get("/organization-structure/hierarchy");
        const hierarchy = response.data;
        const depts = hierarchy.departments.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          code: dept.code,
        }));
        setDepartments(depts);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        toast.error("Failed to load departments");
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch paygrades
  useEffect(() => {
    const fetchPayGrades = async () => {
      setLoadingPayGrades(true);
      try {
        const response = await api.get("/payroll-configuration/pay-grades");
        // Filter to only show approved paygrades (status === 'APPROVED')
        const approvedPayGrades = (response.data || []).filter(
          (pg: any) => pg.status === 'approved'
        );
        setPayGrades(approvedPayGrades);
      } catch (err) {
        console.error("Failed to fetch paygrades:", err);
        // Don't show error toast - paygrade is optional
        setPayGrades([]);
      } finally {
        setLoadingPayGrades(false);
      }
    };

    fetchPayGrades();
  }, []);

  // Fetch positions when department is selected
  useEffect(() => {
    const fetchPositions = async () => {
      if (!formData.departmentId) {
        setPositions([]);
        return;
      }

      setLoadingPositions(true);
      try {
        const response = await api.get(
          `/organization-structure/hierarchy/department/${formData.departmentId}`
        );
        const data = response.data;
        const posList = data.positions.map((pos: any) => ({
          id: pos.id,
          title: pos.title,
          code: pos.code,
        }));
        setPositions(posList);
      } catch (err) {
        console.error("Failed to fetch positions:", err);
        toast.error("Failed to load positions");
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, [formData.departmentId]);

  // Initialize form with position data if editing
  useEffect(() => {
    if (position) {
      const departmentId = typeof position.departmentId === 'string' 
        ? position.departmentId 
        : position.departmentId._id.toString();
      
      const reportsTo = position.reportsToPositionId
        ? (typeof position.reportsToPositionId === 'string'
            ? position.reportsToPositionId
            : position.reportsToPositionId._id.toString())
        : "";

      const payGradeId = position.payGradeId
        ? (typeof position.payGradeId === 'string'
            ? position.payGradeId
            : position.payGradeId._id?.toString() || "")
        : "";

      setFormData({
        title: position.title,
        code: position.code,
        description: position.description || "",
        departmentId,
        reportsTo,
        payGradeId,
        status: position.isActive ? "active" : "inactive",
      });
    }
  }, [position]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        title: formData.title,
        code: formData.code,
        departmentId: formData.departmentId,
        status: formData.status,
      };

      if (formData.description) {
        payload.description = formData.description;
      }

      if (formData.reportsTo && formData.reportsTo.trim() !== "") {
        payload.reportsTo = formData.reportsTo;
      }

      // Add payGradeId if selected
      if (formData.payGradeId && formData.payGradeId.trim() !== "") {
        payload.payGradeId = formData.payGradeId;
      } else if (isEditing && formData.payGradeId === "") {
        // Allow clearing paygrade when editing
        payload.payGradeId = null;
      }

      if (isEditing) {
        await api.patch(`/organization-structure/positions/${position._id}`, payload);
        toast.success("Position updated successfully");
      } else {
        await api.post("/organization-structure/positions", payload);
        toast.success("Position created successfully");
      }

      onSuccess();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} position`
      );
      console.error("Error submitting position form:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-slate-300">
          Position Title <span className="text-red-400">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-white/5 border-white/10 text-white"
          placeholder="e.g., Senior Software Engineer"
          required
          disabled={isEditing && !formData.code} // Disable if editing and code exists (unique constraint)
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-slate-300">
          Position Code <span className="text-red-400">*</span>
        </Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          className="bg-white/5 border-white/10 text-white"
          placeholder="e.g., ENG-SE-001"
          required
          disabled={isEditing} // Code cannot be changed after creation
        />
        {isEditing && (
          <p className="text-xs text-slate-500">Position code cannot be changed after creation</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="departmentId" className="text-slate-300">
          Department <span className="text-red-400">*</span>
        </Label>
        {loadingDepartments ? (
          <p className="text-sm text-slate-400">Loading departments...</p>
        ) : (
          <Select
            value={formData.departmentId || undefined}
            onValueChange={(value) =>
              setFormData({ ...formData, departmentId: value, reportsTo: "" })
            }
            required
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10 text-white">
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reportsTo" className="text-slate-300">
          Reports To Position (Optional)
        </Label>
        {!formData.departmentId ? (
          <p className="text-sm text-slate-400">
            Please select a department first to load positions
          </p>
        ) : loadingPositions ? (
          <p className="text-sm text-slate-400">Loading positions...</p>
        ) : (
          <div className="relative">
            <Select
              value={formData.reportsTo || undefined}
              onValueChange={(value) => setFormData({ ...formData, reportsTo: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select reporting position (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10 text-white">
                {positions
                  .filter((pos) => pos.id !== position?._id) // Exclude current position when editing
                  .map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title} ({pos.code})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {formData.reportsTo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, reportsTo: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder-slate-500"
          placeholder="Describe the position's responsibilities..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payGradeId" className="text-slate-300">
          Pay Grade (Optional)
        </Label>
        {loadingPayGrades ? (
          <p className="text-sm text-slate-400">Loading pay grades...</p>
        ) : payGrades.length === 0 ? (
          <p className="text-sm text-slate-400">
            No approved pay grades available. Create pay grades in the payroll configuration module.
          </p>
        ) : (
          <Select
            value={formData.payGradeId || "__none__"}
            onValueChange={(value) =>
              setFormData({ ...formData, payGradeId: value === "__none__" ? "" : value })
            }
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select pay grade (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10 text-white">
              <SelectItem value="__none__">None (No pay grade)</SelectItem>
              {payGrades.map((pg) => (
                <SelectItem key={pg._id} value={pg._id}>
                  {pg.grade} (Base: ${pg.baseSalary?.toLocaleString() || 'N/A'}, Gross: ${pg.grossSalary?.toLocaleString() || 'N/A'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {formData.payGradeId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFormData({ ...formData, payGradeId: "" })}
            className="text-xs text-slate-400 hover:text-white h-auto p-1"
          >
            Clear selection
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-slate-300">
          Status <span className="text-red-400">*</span>
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value as "active" | "inactive" })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10 text-white">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-white text-slate-950 hover:bg-slate-200"
        >
          {loading ? "Saving..." : isEditing ? "Update Position" : "Create Position"}
        </Button>
      </div>
    </form>
  );
}
