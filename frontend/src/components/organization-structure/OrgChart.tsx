"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import {
  canViewAllDepartments,
  canViewOwnDepartmentOnly,
} from "@/lib/organization-role-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCw, Building2, User, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

interface Position {
  id: string;
  title: string;
  code: string;
  description?: string;
  departmentId: string;
  reportsToPositionId?: string;
  isActive: boolean;
  employees?: Employee[];
  directReports?: Position[];
}

interface Employee {
  id: string;
  employeeNumber: string;
  firstName?: string;
  lastName?: string;
}

interface DepartmentHierarchy {
  department: Department;
  positions: Position[];
}

interface TreeNode {
  position: Position;
  children: TreeNode[];
  level: number;
}

export function OrgChart() {
  const { currentRole, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [hierarchy, setHierarchy] = useState<DepartmentHierarchy | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);

  // Fetch user's department if they can only view own department
  useEffect(() => {
    if (canViewOwnDepartmentOnly(currentRole) && user?.id) {
      fetchUserDepartment();
    } else if (canViewAllDepartments(currentRole)) {
      fetchDepartments();
    }
  }, [currentRole, user?.id]);

  useEffect(() => {
    if (selectedDepartmentId) {
      fetchDepartmentHierarchy(selectedDepartmentId);
    } else if (userDepartmentId && canViewOwnDepartmentOnly(currentRole)) {
      // Auto-select user's department if they can only view own
      setSelectedDepartmentId(userDepartmentId);
    } else {
      setHierarchy(null);
      setTree([]);
    }
  }, [selectedDepartmentId, userDepartmentId, currentRole]);

  const fetchUserDepartment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use my-structure endpoint (accessible to employees)
      const hierarchyResponse = await api.get("/organization-structure/hierarchy/my-structure");
      const myStructure = hierarchyResponse.data;
      
      if (myStructure?.currentPosition?.departmentId) {
        setUserDepartmentId(myStructure.currentPosition.departmentId);
        setSelectedDepartmentId(myStructure.currentPosition.departmentId);
      } else if (myStructure?.currentPosition === null || !myStructure?.currentPosition) {
        // Employee has no position assignment
        setError("You don't have a position assignment yet. Please contact HR to assign you to a position.");
      } else {
        setError("You are not assigned to a department or position");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch your department";
      setError(errorMessage);
      console.error("Error fetching user department:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use hierarchy endpoint to get departments (for users who can view all)
      const response = await api.get("/organization-structure/hierarchy");
      const hierarchy = response.data;
      const deptList: Department[] = hierarchy.departments?.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        isActive: dept.isActive,
      })) || [];
      setDepartments(deptList);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch departments";
      setError(errorMessage);
      console.error("Error fetching departments:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentHierarchy = async (departmentId: string) => {
    try {
      setLoadingHierarchy(true);
      setError(null);
      const response = await api.get(`/organization-structure/hierarchy/department/${departmentId}`);
      console.log("Department hierarchy response:", response.data);
      setHierarchy(response.data);
      buildTree(response.data);
      
      // Expand all nodes by default
      const allPositionIds = new Set<string>();
      response.data.positions?.forEach((pos: Position) => {
        allPositionIds.add(pos.id);
      });
      setExpandedNodes(allPositionIds);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch department hierarchy";
      setError(errorMessage);
      console.error("Error fetching department hierarchy:", err);
      toast.error(errorMessage);
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const buildTree = (data: DepartmentHierarchy) => {
    if (!data.positions || data.positions.length === 0) {
      setTree([]);
      return;
    }

    const positionMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];
    const processedIds = new Set<string>();

    // Create tree nodes for all positions
    data.positions.forEach((pos) => {
      const treeNode: TreeNode = {
        position: pos,
        children: [],
        level: 0,
      };
      // Store by both id and _id format for flexibility
      positionMap.set(pos.id, treeNode);
      if ((pos as any)._id && (pos as any)._id !== pos.id) {
        positionMap.set((pos as any)._id, treeNode);
      }
    });

    // Build parent-child relationships
    data.positions.forEach((pos) => {
      const node = positionMap.get(pos.id);
      if (!node) return;

      if (pos.reportsToPositionId) {
        // Try to find parent - check both id format and ObjectId string format
        const parentId = pos.reportsToPositionId;
        let parent = positionMap.get(parentId);
        
        // If not found, try string conversion
        if (!parent) {
          parent = positionMap.get(String(parentId));
        }
        
        // If still not found, try to find by checking all keys
        if (!parent) {
          for (const [key, value] of positionMap.entries()) {
            if (key.includes(parentId) || parentId.includes(key) || String(key) === String(parentId)) {
              parent = value;
              break;
            }
          }
        }
        
        if (parent && parent !== node) {
          parent.children.push(node);
          processedIds.add(pos.id);
        } else {
          // Parent not found in same department - treat as root
          console.warn(`Parent position ${parentId} not found for position ${pos.id} (${pos.title}), treating as root`);
          if (!rootNodes.includes(node)) {
            rootNodes.push(node);
          }
          processedIds.add(pos.id);
        }
      } else {
        // Root position (department head or top-level position)
        if (!rootNodes.includes(node)) {
          rootNodes.push(node);
        }
        processedIds.add(pos.id);
      }
    });

    // Ensure all positions are included (handle any edge cases)
    data.positions.forEach((pos) => {
      if (!processedIds.has(pos.id)) {
        // Position wasn't added anywhere, add as root
        const node = positionMap.get(pos.id);
        if (node && !rootNodes.includes(node)) {
          rootNodes.push(node);
        }
      }
    });

    // Update levels recursively
    const updateLevels = (node: TreeNode, level: number) => {
      node.level = level;
      node.children.forEach((child) => updateLevels(child, level + 1));
    };

    rootNodes.forEach((node) => updateLevels(node, 0));

    setTree(rootNodes);
  };

  const toggleNode = (positionId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(positionId)) {
      newExpanded.delete(positionId);
    } else {
      newExpanded.add(positionId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = expandedNodes.has(node.position.id);
    const hasChildren = node.children.length > 0;
    const hasEmployees = node.position.employees && node.position.employees.length > 0;

    return (
      <div key={node.position.id} className="flex flex-col items-center">
        <div className="relative mb-4">
          {/* Connector line from parent */}
          {node.level > 0 && (
            <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-slate-600 -translate-x-1/2" />
          )}

          <Card
            className={`w-64 cursor-pointer transition-all hover:scale-105 ${
              node.level === 0
                ? "bg-blue-500/20 border-blue-400/50"
                : "bg-purple-500/20 border-purple-400/50"
            }`}
            onClick={() => hasChildren && toggleNode(node.position.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {node.level === 0 ? (
                    <Building2 className="w-4 h-4 text-blue-400 mb-2" />
                  ) : (
                    <User className="w-4 h-4 text-purple-400 mb-2" />
                  )}
                  <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                    {node.position.title}
                  </h3>
                  {node.position.code && (
                    <p className="text-xs text-slate-400 font-mono mb-2">{node.position.code}</p>
                  )}
                  
                  {/* Employees in this position */}
                  {hasEmployees && (
                    <div className="mt-2 space-y-1">
                      {node.position.employees?.map((emp) => (
                        <div key={emp.id} className="text-xs text-slate-300 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>
                            {emp.firstName || ""} {emp.lastName || ""}
                            {!emp.firstName && !emp.lastName && emp.employeeNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        node.level === 0
                          ? "bg-blue-500/30 text-blue-200"
                          : "bg-purple-500/30 text-purple-200"
                      }`}
                    >
                      {node.level === 0 ? "Department Head" : "Position"}
                    </Badge>
                    {hasChildren && (
                      <Badge variant="outline" className="text-xs">
                        {node.children.length} report{node.children.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                {hasChildren && (
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex gap-8 items-start">
            {node.children.map((child, index) => (
              <div key={child.position.id} className="relative">
                {/* Horizontal connector */}
                {node.children.length > 1 && (
                  <>
                    {index === 0 && (
                      <div className="absolute top-0 left-1/2 w-1/2 h-0.5 bg-slate-600" />
                    )}
                    {index === node.children.length - 1 && (
                      <div className="absolute top-0 right-1/2 w-1/2 h-0.5 bg-slate-600" />
                    )}
                    {index > 0 && index < node.children.length - 1 && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-600" />
                    )}
                    {index > 0 && (
                      <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-slate-600 -translate-x-1/2" />
                    )}
                  </>
                )}
                {renderTreeNode(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">
          {canViewOwnDepartmentOnly(currentRole) 
            ? "Loading your department..." 
            : "Loading departments..."}
        </span>
      </div>
    );
  }

  if (error && !departments.length && !hierarchy) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button 
          onClick={() => {
            if (canViewAllDepartments(currentRole)) {
              fetchDepartments();
            } else if (canViewOwnDepartmentOnly(currentRole)) {
              fetchUserDepartment();
            }
          }} 
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Organizational Chart</h2>
          <p className="text-slate-400">
            Select a department to view its reporting structure and hierarchy
          </p>
        </div>
        <Button onClick={fetchDepartments} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Department Selector - Only show if user can view all departments */}
      {canViewAllDepartments(currentRole) && (
        <div className="max-w-md">
          <Label htmlFor="department-select" className="text-slate-300 mb-2 block">
            Select Department
          </Label>
          <Select
            value={selectedDepartmentId || undefined}
            onValueChange={(value) => setSelectedDepartmentId(value || "")}
            disabled={loading}
          >
            <SelectTrigger id="department-select" className="bg-white/5 border-white/10">
              <SelectValue placeholder="Choose a department..." />
            </SelectTrigger>
            <SelectContent>
              {departments
                .filter((dept) => dept.isActive)
                .map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {selectedDepartmentId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDepartmentId("")}
              className="mt-2 text-xs text-slate-400 hover:text-white"
            >
              Clear selection
            </Button>
          )}
        </div>
      )}

      {/* Show department name if employee viewing own department */}
      {canViewOwnDepartmentOnly(currentRole) && hierarchy && (
        <div className="max-w-md">
          <Label className="text-slate-300 mb-2 block">
            Your Department
          </Label>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white font-medium">{hierarchy.department.name}</p>
            <p className="text-slate-400 text-sm">{hierarchy.department.code}</p>
          </div>
        </div>
      )}

      {/* Loading Hierarchy */}
      {loadingHierarchy && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-400">Loading department hierarchy...</span>
        </div>
      )}

      {/* Error Loading Hierarchy */}
      {error && selectedDepartmentId && !loadingHierarchy && (
        <div className="text-center py-12 border border-red-400/20 rounded-xl bg-red-500/5">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={() => fetchDepartmentHierarchy(selectedDepartmentId)}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Department Hierarchy Tree */}
      {!loadingHierarchy && hierarchy && tree.length > 0 && (
        <div className="space-y-4">
          {/* Department Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              {hierarchy.department.name}
            </h3>
            {hierarchy.department.description && (
              <p className="text-slate-400 text-sm">{hierarchy.department.description}</p>
            )}
            <p className="text-slate-400 text-xs mt-2">
              {hierarchy.positions?.length || 0} position{hierarchy.positions?.length !== 1 ? "s" : ""} in this department
            </p>
          </div>

          {/* Tree Visualization */}
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-white/10 rounded-xl bg-white/5 p-8">
            <div className="flex flex-col items-center min-w-full">
              {tree.map((rootNode) => renderTreeNode(rootNode))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loadingHierarchy && selectedDepartmentId && hierarchy && tree.length === 0 && (
        <div className="text-center py-12 border border-white/10 rounded-xl bg-white/5">
          <p className="text-slate-400">
            No positions found in this department. The department hierarchy will appear here once positions are added.
          </p>
        </div>
      )}

      {/* No Selection */}
      {!selectedDepartmentId && !loadingHierarchy && (
        <div className="text-center py-12 border border-white/10 rounded-xl bg-white/5">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Select a department above to view its organizational structure</p>
        </div>
      )}
    </div>
  );
}