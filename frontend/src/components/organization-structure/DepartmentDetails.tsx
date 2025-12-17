"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Briefcase, Loader2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

interface DepartmentDetailsProps {
  department: Department;
  onClose: () => void;
}

interface Position {
  id: string;
  title: string;
  code: string;
  employees?: Array<{
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
  }>;
  directReports?: Position[];
}

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail?: string;
}

export function DepartmentDetails({ department, onClose }: DepartmentDetailsProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartmentDetails();
  }, [department.id]);

  const fetchDepartmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch department hierarchy (includes positions)
      const hierarchyResponse = await api.get(
        `/organization-structure/hierarchy/department/${department.id}`
      );
      const hierarchyData = hierarchyResponse.data;
      // Positions may be in a nested structure with directReports
      setPositions(hierarchyData.positions || []);

      // Fetch employees in department
      const employeesResponse = await api.get(
        `/organization-structure/departments/${department.id}/employees`
      );
      setEmployees(employeesResponse.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch department details");
      console.error("Error fetching department details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten all positions (including nested direct reports)
  const flattenPositions = (positions: Position[]): Position[] => {
    const result: Position[] = [];
    positions.forEach((pos) => {
      result.push(pos);
      if (pos.directReports && pos.directReports.length > 0) {
        result.push(...flattenPositions(pos.directReports));
      }
    });
    return result;
  };

  const allPositions = flattenPositions(positions);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {department.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Department details, positions, and employees
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-12">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Department Information */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white">Department Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Code</p>
                  <p className="text-white font-medium">{department.code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge
                    variant={department.isActive ? "default" : "secondary"}
                    className={
                      department.isActive
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }
                  >
                    {department.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {department.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-400">Description</p>
                    <p className="text-white">{department.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-slate-400">Positions</p>
                </div>
                <p className="text-2xl font-bold text-white">{allPositions.length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-slate-400">Employees</p>
                </div>
                <p className="text-2xl font-bold text-white">{employees.length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <p className="text-sm text-slate-400">Filled Positions</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {allPositions.filter((p) => p.employees && p.employees.length > 0).length}
                </p>
              </div>
            </div>

            {/* Positions */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Positions</h3>
              {allPositions.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No positions in this department</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {allPositions.map((position) => (
                    <div
                      key={position.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-white">{position.title}</p>
                          <p className="text-sm text-slate-400">Code: {position.code}</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                          {position.employees?.length || 0} employee
                          {(position.employees?.length || 0) !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      {position.employees && position.employees.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-xs text-slate-400 mb-1">Employees:</p>
                          <div className="flex flex-wrap gap-2">
                            {position.employees.map((emp) => (
                              <Badge
                                key={emp.id}
                                variant="outline"
                                className="bg-white/5 border-white/10 text-slate-300"
                              >
                                {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Employees List */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">All Employees</h3>
              {employees.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No employees in this department</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-slate-400">
                          {employee.employeeNumber}
                          {employee.workEmail && ` • ${employee.workEmail}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
