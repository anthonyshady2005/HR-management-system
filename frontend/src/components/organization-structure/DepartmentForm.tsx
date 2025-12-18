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

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  parent_dep_code?: string;
  headPositionId?: string;
}

interface DepartmentFormProps {
  department?: Department;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function DepartmentForm({ department, onSuccess, onCancel }: DepartmentFormProps) {
  const [formData, setFormData] = useState({
    dep_name: "",
    dep_code: "",
    description: "",
    parent_dep_code: "",
    status: "active" as "active" | "inactive",
    headPositionId: "",
  });
  const [loading, setLoading] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState<Array<{ code: string; name: string }>>([]);
  const [availablePositions, setAvailablePositions] = useState<Array<{ id: string; title: string; code: string }>>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

  const isEditing = !!department;

  // Fetch available departments for parent selection
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/organization-structure/hierarchy");
        const hierarchy = response.data;
        const depts = hierarchy.departments.map((dept: any) => ({
          code: dept.code,
          name: dept.name,
        }));
        setAvailableDepartments(depts);
      } catch (err) {
        console.error("Failed to fetch departments for parent selection:", err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch positions for department head selection
  useEffect(() => {
    const fetchPositions = async () => {
      if (isEditing && department?.id) {
        // When editing, fetch positions for this specific department only
        setLoadingPositions(true);
        try {
          const response = await api.get(
            `/organization-structure/hierarchy/department/${department.id}`
          );
          const positions = response.data.positions || [];
          console.log(`Fetched ${positions.length} positions for department ${department.id}:`, positions);
          setAvailablePositions(
            positions.map((pos: any) => ({
              id: pos.id || pos._id,
              title: pos.title,
              code: pos.code,
            }))
          );
        } catch (err: any) {
          console.error("Failed to fetch positions:", err);
          console.error("Error details:", err.response?.data);
          setAvailablePositions([]);
          // Show a more helpful error message
          if (err.response?.status === 404) {
            toast.error(`Department ${department.id} not found`);
          } else {
            toast.error("Failed to load positions. Please refresh and try again.");
          }
        } finally {
          setLoadingPositions(false);
        }
      } else {
        // When creating, fetch all active positions (user can assign any position initially)
        setLoadingPositions(true);
        try {
          const response = await api.get("/organization-structure/positions/list");
          const positions = response.data || [];
          setAvailablePositions(
            positions.map((pos: any) => ({
              id: pos._id?.toString() || pos.id?.toString() || pos._id || pos.id,
              title: pos.title,
              code: pos.code,
            }))
          );
        } catch (err) {
          console.error("Failed to fetch positions:", err);
          // It's okay if there are no positions when creating a new department
          setAvailablePositions([]);
        } finally {
          setLoadingPositions(false);
        }
      }
    };

    fetchPositions();
  }, [isEditing, department?.id]);

  // Initialize form with department data if editing
  useEffect(() => {
    if (department) {
      setFormData({
        dep_name: department.name,
        dep_code: department.code,
        description: department.description || "",
        parent_dep_code: (department as any).parent_dep_code || "",
        status: department.isActive ? "active" : "inactive",
        headPositionId: department.headPositionId || "",
      });
    } else {
      // Reset form when not editing
      setFormData({
        dep_name: "",
        dep_code: "",
        description: "",
        parent_dep_code: "",
        status: "active",
        headPositionId: "",
      });
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        dep_name: formData.dep_name,
        dep_code: formData.dep_code,
        status: formData.status,
      };

      if (formData.description) {
        payload.description = formData.description;
      }

      // Note: parent_dep_code is in the DTO but the backend service doesn't handle it
      // It's included here in case the backend is updated to support it in the future
      if (formData.parent_dep_code) {
        payload.parent_dep_code = formData.parent_dep_code;
      }

      // Add headPositionId if selected
      if (formData.headPositionId) {
        payload.headPositionId = formData.headPositionId;
      } else if (isEditing && formData.headPositionId === "") {
        // Allow clearing head position when editing
        payload.headPositionId = null;
      }

      if (isEditing) {
        await api.patch(`/organization-structure/departments/${department.id}`, payload);
      } else {
        await api.post("/organization-structure/departments", payload);
      }

      onSuccess();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} department`
      );
      console.error("Error submitting department form:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dep_name" className="text-slate-300">
          Department Name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="dep_name"
          value={formData.dep_name}
          onChange={(e) => setFormData({ ...formData, dep_name: e.target.value })}
          required
          className="bg-white/5 border-white/10 text-white placeholder-slate-500"
          placeholder="e.g., Engineering, Human Resources"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dep_code" className="text-slate-300">
          Department Code <span className="text-red-400">*</span>
        </Label>
        <Input
          id="dep_code"
          value={formData.dep_code}
          onChange={(e) => setFormData({ ...formData, dep_code: e.target.value.toUpperCase() })}
          required
          disabled={isEditing} // Code cannot be changed when editing
          className="bg-white/5 border-white/10 text-white placeholder-slate-500 disabled:opacity-50"
          placeholder="e.g., ENG, HR"
        />
        {isEditing && (
          <p className="text-xs text-slate-500">Department code cannot be changed after creation</p>
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
          placeholder="Optional description of the department"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent_dep_code" className="text-slate-300">
          Parent Department (Optional)
        </Label>
        <Select
          value={formData.parent_dep_code || undefined}
          onValueChange={(value) => setFormData({ ...formData, parent_dep_code: value })}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select parent department (optional)" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10 text-white">
            {availableDepartments
              .filter((dept) => dept.code !== formData.dep_code) // Don't allow self as parent
              .map((dept) => (
                <SelectItem key={dept.code} value={dept.code}>
                  {dept.name} ({dept.code})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {formData.parent_dep_code && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFormData({ ...formData, parent_dep_code: "" })}
            className="text-xs text-slate-400 hover:text-white h-auto p-1"
          >
            Clear selection
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="headPositionId" className="text-slate-300">
          Department Head Position (Optional)
        </Label>
        {loadingPositions ? (
          <p className="text-sm text-slate-400">Loading positions...</p>
        ) : availablePositions.length === 0 ? (
          <p className="text-sm text-slate-400">
            {isEditing
              ? "No positions found in this department. Create positions first to assign a department head."
              : "No positions available. You can assign a department head after creating positions in this department."}
          </p>
        ) : (
          <>
            <Select
              value={formData.headPositionId || "__none__"}
              onValueChange={(value) =>
                setFormData({ ...formData, headPositionId: value === "__none__" ? "" : value })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select department head position (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10 text-white">
                <SelectItem value="__none__">None (Clear selection)</SelectItem>
                {availablePositions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.title} ({pos.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.headPositionId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, headPositionId: "" })}
                className="text-xs text-slate-400 hover:text-white h-auto p-1"
              >
                Clear selection
              </Button>
            )}
            {!isEditing && (
              <p className="text-xs text-slate-500">
                Note: When editing, you can only select positions that belong to this department.
              </p>
            )}
          </>
        )}
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="status" className="text-slate-300">
            Status
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
      )}

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
          {loading ? "Saving..." : isEditing ? "Update Department" : "Create Department"}
        </Button>
      </div>
    </form>
  );
}
