"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
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
import { StructureRequestType } from "./ChangeRequests";
import { toast } from "sonner";
import {
  canViewAllDepartments,
  canViewOwnDepartmentOnly,
} from "@/lib/organization-role-utils";

interface ChangeRequest {
  _id: string;
  requestNumber: string;
  requestType: StructureRequestType;
  targetDepartmentId?: string;
  targetPositionId?: string;
  details?: string;
  reason?: string;
}

interface ChangeRequestFormProps {
  request?: ChangeRequest;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ChangeRequestForm({ request, onSuccess, onCancel }: ChangeRequestFormProps) {
  const { currentRole, user } = useAuth();
  const [formData, setFormData] = useState({
    requestType: StructureRequestType.NEW_POSITION,
    targetDepartmentId: "",
    targetPositionId: "",
    details: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [positions, setPositions] = useState<Array<{ id: string; title: string; code: string }>>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);

  const isEditing = !!request;

  // Fetch user's department if they can only view own department
  useEffect(() => {
    if (canViewOwnDepartmentOnly(currentRole) && user?.id) {
      const fetchUserDepartment = async () => {
        try {
          const hierarchyResponse = await api.get("/organization-structure/hierarchy/my-structure");
          const myStructure = hierarchyResponse.data;
          if (myStructure?.currentPosition?.departmentId) {
            setUserDepartmentId(myStructure.currentPosition.departmentId);
          }
        } catch (err) {
          console.error("Failed to fetch user department:", err);
        }
      };
      fetchUserDepartment();
    }
  }, [currentRole, user?.id]);

  // Fetch departments for selection based on role
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        if (canViewAllDepartments(currentRole)) {
          // Fetch all departments for System Admin, HR Manager, HR Admin
          const response = await api.get("/organization-structure/hierarchy");
          const hierarchy = response.data;
          const depts = hierarchy.departments.map((dept: any) => ({
            id: dept.id,
            name: dept.name,
            code: dept.code,
          }));
          setDepartments(depts);
        } else if (canViewOwnDepartmentOnly(currentRole) && userDepartmentId) {
          // Fetch user's own department for Department Head, Department Employee, HR Employee
          const response = await api.get(`/organization-structure/hierarchy/department/${userDepartmentId}`);
          const data = response.data;
          setDepartments([{
            id: data.department.id,
            name: data.department.name,
            code: data.department.code,
          }]);
          // Auto-select user's department for new position requests
          if (formData.requestType === StructureRequestType.NEW_POSITION && !formData.targetDepartmentId) {
            setFormData(prev => ({ ...prev, targetDepartmentId: data.department.id }));
          }
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        toast.error("Failed to load departments");
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [currentRole, userDepartmentId]);

  // Fetch positions when department-related request type is selected
  useEffect(() => {
    const fetchPositions = async () => {
      if (
        formData.targetDepartmentId &&
        (formData.requestType === StructureRequestType.UPDATE_POSITION ||
          formData.requestType === StructureRequestType.CLOSE_POSITION)
      ) {
        setLoadingPositions(true);
        try {
          const response = await api.get(
            `/organization-structure/hierarchy/department/${formData.targetDepartmentId}`
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
        } finally {
          setLoadingPositions(false);
        }
      } else {
        setPositions([]);
      }
    };

    fetchPositions();
  }, [formData.targetDepartmentId, formData.requestType]);

  // Initialize form with request data if editing
  useEffect(() => {
    if (request) {
      setFormData({
        requestType: request.requestType,
        targetDepartmentId: request.targetDepartmentId || "",
        targetPositionId: request.targetPositionId || "",
        details: request.details || "",
        reason: request.reason || "",
      });
    }
  }, [request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        requestType: formData.requestType,
      };

      if (formData.details) {
        payload.details = formData.details;
      }

      if (formData.reason) {
        payload.reason = formData.reason;
      }

      // Add target IDs based on request type
      if (
        formData.requestType === StructureRequestType.NEW_DEPARTMENT ||
        formData.requestType === StructureRequestType.UPDATE_DEPARTMENT
      ) {
        if (formData.targetDepartmentId) {
          payload.targetDepartmentId = formData.targetDepartmentId;
        }
      }

      if (
        formData.requestType === StructureRequestType.NEW_POSITION ||
        formData.requestType === StructureRequestType.UPDATE_POSITION ||
        formData.requestType === StructureRequestType.CLOSE_POSITION
      ) {
        if (formData.targetPositionId) {
          payload.targetPositionId = formData.targetPositionId;
        }
        // Include department ID for all position-related requests
        if (formData.targetDepartmentId) {
          payload.targetDepartmentId = formData.targetDepartmentId;
        }
      }

      if (isEditing) {
        await api.patch(`/organization-structure/change-requests/${request._id}`, payload);
      } else {
        await api.post("/organization-structure/change-requests", payload);
      }

      onSuccess();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} change request`
      );
      console.error("Error submitting change request form:", err);
    } finally {
      setLoading(false);
    }
  };

  const requiresDepartment = () => {
    return (
      formData.requestType === StructureRequestType.NEW_DEPARTMENT ||
      formData.requestType === StructureRequestType.UPDATE_DEPARTMENT ||
      formData.requestType === StructureRequestType.NEW_POSITION ||
      formData.requestType === StructureRequestType.UPDATE_POSITION ||
      formData.requestType === StructureRequestType.CLOSE_POSITION
    );
  };

  const requiresPosition = () => {
    return (
      formData.requestType === StructureRequestType.UPDATE_POSITION ||
      formData.requestType === StructureRequestType.CLOSE_POSITION
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="requestType" className="text-slate-300">
          Request Type <span className="text-red-400">*</span>
        </Label>
        <Select
          value={formData.requestType}
          onValueChange={(value) => {
            setFormData({
              ...formData,
              requestType: value as StructureRequestType,
              targetDepartmentId: "",
              targetPositionId: "",
            });
          }}
          disabled={isEditing}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10 text-white">
            <SelectItem value={StructureRequestType.NEW_DEPARTMENT}>
              New Department
            </SelectItem>
            <SelectItem value={StructureRequestType.UPDATE_DEPARTMENT}>
              Update Department
            </SelectItem>
            <SelectItem value={StructureRequestType.NEW_POSITION}>
              New Position
            </SelectItem>
            <SelectItem value={StructureRequestType.UPDATE_POSITION}>
              Update Position
            </SelectItem>
            <SelectItem value={StructureRequestType.CLOSE_POSITION}>
              Close Position
            </SelectItem>
          </SelectContent>
        </Select>
        {isEditing && (
          <p className="text-xs text-slate-500">Request type cannot be changed after creation</p>
        )}
      </div>

      {requiresDepartment() && (
        <div className="space-y-2">
          <Label htmlFor="targetDepartmentId" className="text-slate-300">
            {formData.requestType === StructureRequestType.NEW_DEPARTMENT
              ? "Parent Department (Optional)"
              : formData.requestType === StructureRequestType.UPDATE_POSITION ||
                formData.requestType === StructureRequestType.CLOSE_POSITION
              ? "Department"
              : "Department"}
            {(formData.requestType === StructureRequestType.NEW_POSITION ||
              formData.requestType === StructureRequestType.UPDATE_POSITION ||
              formData.requestType === StructureRequestType.CLOSE_POSITION ||
              formData.requestType === StructureRequestType.UPDATE_DEPARTMENT) && (
              <span className="text-red-400"> *</span>
            )}
          </Label>
          {loadingDepartments ? (
            <p className="text-sm text-slate-400">Loading departments...</p>
          ) : departments.length === 0 ? (
            <p className="text-sm text-slate-400">No departments available</p>
          ) : (
            <Select
              value={formData.targetDepartmentId || undefined}
              onValueChange={(value) =>
                setFormData({ ...formData, targetDepartmentId: value, targetPositionId: "" })
              }
              disabled={canViewOwnDepartmentOnly(currentRole) && formData.requestType === StructureRequestType.NEW_POSITION}
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
      )}

      {requiresPosition() && (
        <div className="space-y-2">
          <Label htmlFor="targetPositionId" className="text-slate-300">
            Position <span className="text-red-400">*</span>
          </Label>
          {!formData.targetDepartmentId ? (
            <p className="text-sm text-slate-400">
              Please select a department first to load positions
            </p>
          ) : loadingPositions ? (
            <p className="text-sm text-slate-400">Loading positions...</p>
          ) : (
            <Select
              value={formData.targetPositionId || undefined}
              onValueChange={(value) => setFormData({ ...formData, targetPositionId: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10 text-white">
                {positions.length === 0 ? (
                  <div className="p-2 text-sm text-slate-400">No positions found</div>
                ) : (
                  positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title} ({pos.code})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="details" className="text-slate-300">
          Details
        </Label>
        <Textarea
          id="details"
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder-slate-500"
          placeholder="Describe the change you want to make..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-slate-300">
          Reason
        </Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder-slate-500"
          placeholder="Explain why this change is needed..."
          rows={3}
        />
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
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Request"
              : "Create Request (Draft)"}
        </Button>
      </div>
    </form>
  );
}
