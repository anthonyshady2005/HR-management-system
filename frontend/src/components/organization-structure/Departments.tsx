"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import {
  canCreateDepartment,
  canUpdateSpecificDepartment,
  canDeactivateDepartment,
  canViewAllDepartments,
  canViewOwnDepartmentOnly,
} from "@/lib/organization-role-utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Trash2, Eye, Building2 } from "lucide-react";
import { DepartmentForm } from "./DepartmentForm";
import { DepartmentDetails } from "./DepartmentDetails";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  headPositionId?: string;
  positions?: number;
  employees?: number;
}

export function Departments() {
  const { currentRole, user } = useAuth();

  // Security: Early return if user doesn't have permission
  if (!canViewAllDepartments(currentRole)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Access denied. You do not have permission to view departments.</p>
      </div>
    );
  }
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [deactivatingDepartment, setDeactivatingDepartment] = useState<Department | null>(null);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Fetch user's department ID if they're a Department Head
  useEffect(() => {
    const fetchUserDepartment = async () => {
      if (currentRole && canViewOwnDepartmentOnly(currentRole) && user?.id) {
        try {
          // Try to get user's profile to find their department
          const response = await api.get(`/employee-profile/${user.id}`);
          const profile = response.data;
          if (profile?.primaryDepartmentId) {
            setUserDepartmentId(profile.primaryDepartmentId);
          } else if (profile?.departmentId) {
            // Fallback to departmentId if primaryDepartmentId doesn't exist
            setUserDepartmentId(profile.departmentId);
          }
        } catch (err) {
          console.error("Failed to fetch user department:", err);
          // If profile endpoint doesn't exist, we'll handle it gracefully
        }
      }
    };

    fetchUserDepartment();
  }, [currentRole, user?.id]);

  // Fetch departments based on role
  useEffect(() => {
    fetchDepartments();
  }, [currentRole, userDepartmentId]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (canViewAllDepartments(currentRole)) {
        // Fetch full hierarchy for System Admin, HR Manager, HR Admin
        const response = await api.get("/organization-structure/hierarchy");
        const hierarchy = response.data;
        const deptList: Department[] = hierarchy.departments.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          isActive: dept.isActive,
          headPositionId: dept.headPositionId,
          positions: dept.positions?.length || 0,
          employees: dept.positions?.reduce(
            (sum: number, pos: any) => sum + (pos.employees?.length || 0),
            0
          ) || 0,
        }));
        setDepartments(deptList);
      } else if (canViewOwnDepartmentOnly(currentRole) && userDepartmentId) {
        // Fetch single department for Department Head, Department Employee, HR Employee
        const response = await api.get(`/organization-structure/hierarchy/department/${userDepartmentId}`);
        const data = response.data;
        const dept: Department = {
          id: data.department.id,
          name: data.department.name,
          code: data.department.code,
          description: data.department.description,
          isActive: data.department.isActive,
          headPositionId: data.department.headPositionId,
          positions: data.positions?.length || 0,
          employees: data.positions?.reduce(
            (sum: number, pos: any) => sum + (pos.employees?.length || 0),
            0
          ) || 0,
        };
        setDepartments([dept]);
      } else {
        setDepartments([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch departments");
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchDepartments();
    toast.success("Department created successfully");
  };

  const handleUpdateSuccess = () => {
    setEditingDepartment(null);
    fetchDepartments();
    toast.success("Department updated successfully");
  };

  const handleDeactivate = async () => {
    if (!deactivatingDepartment) return;

    try {
      await api.patch(`/organization-structure/departments/${deactivatingDepartment.id}/deactivate`);
      toast.success("Department deactivated successfully");
      setDeactivatingDepartment(null);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to deactivate department");
    }
  };

  const handleActivate = async (department: Department) => {
    try {
      await api.patch(`/organization-structure/departments/${department.id}`, {
        status: "active",
      });
      toast.success("Department activated successfully");
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to activate department");
      console.error("Error activating department:", err);
    }
  };

  // Filter departments
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && dept.isActive) ||
      (statusFilter === "inactive" && !dept.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400">Loading departments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={fetchDepartments} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Departments</h2>
          <p className="text-slate-400">
            Manage organizational departments and their structure
          </p>
        </div>
        {canCreateDepartment(currentRole) && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Plus className="w-4 h-4 mr-2" />
                Create Department
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Fill in the details to create a new department
                </DialogDescription>
              </DialogHeader>
              <DepartmentForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Departments Table */}
      {filteredDepartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-white/10 rounded-xl bg-white/5">
          <Building2 className="w-12 h-12 text-slate-500 mb-4" />
          <p className="text-slate-400">No departments found</p>
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Code</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Positions</TableHead>
                <TableHead className="text-slate-300">Employees</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow
                  key={dept.id}
                  className="border-white/10 hover:bg-white/5 cursor-pointer"
                  onClick={() => setViewingDepartment(dept)}
                >
                  <TableCell className="font-medium text-white">{dept.name}</TableCell>
                  <TableCell className="text-slate-300">{dept.code}</TableCell>
                  <TableCell>
                    <Badge
                      variant={dept.isActive ? "default" : "secondary"}
                      className={dept.isActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}
                    >
                      {dept.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{dept.positions || 0}</TableCell>
                  <TableCell className="text-slate-300">{dept.employees || 0}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingDepartment(dept)}
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canUpdateSpecificDepartment(currentRole, dept.id, userDepartmentId) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingDepartment(dept)}
                          className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDeactivateDepartment(currentRole) && (
                        <>
                          {dept.isActive ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeactivatingDepartment(dept)}
                              className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-white/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivate(dept)}
                              className="text-green-400 hover:text-green-300"
                            >
                              Activate
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      {editingDepartment && (
        <Dialog open={!!editingDepartment} onOpenChange={(open) => !open && setEditingDepartment(null)}>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription className="text-slate-400">
                Update department information
              </DialogDescription>
            </DialogHeader>
            <DepartmentForm
              department={editingDepartment}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setEditingDepartment(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Details Dialog */}
      {viewingDepartment && (
        <DepartmentDetails
          department={viewingDepartment}
          onClose={() => setViewingDepartment(null)}
        />
      )}

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={!!deactivatingDepartment}
        onOpenChange={(open) => !open && setDeactivatingDepartment(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Department</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to deactivate "{deactivatingDepartment?.name}"? This action
              cannot be undone and will make all positions in this department inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
