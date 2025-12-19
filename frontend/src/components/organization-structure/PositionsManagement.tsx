"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
import { Label } from "@/components/ui/label";
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
import { Input } from "@/components/ui/input";
import { Plus, Edit, Eye, Trash2, RefreshCw, Search } from "lucide-react";
import { PositionForm } from "./PositionForm";
import { toast } from "sonner";

interface Position {
  _id: string;
  code: string;
  title: string;
  description?: string;
  departmentId: string | { _id: string; name: string; code?: string };
  reportsToPositionId?: string | { _id: string; title: string; code: string };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function PositionsManagement() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [viewingPosition, setViewingPosition] = useState<Position | null>(null);
  const [deactivatingPosition, setDeactivatingPosition] = useState<Position | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const isDepartmentRef = (
    department: Position["departmentId"]
  ): department is { _id: string; name: string; code?: string } => {
    return Boolean(department) && typeof department === "object" && "_id" in department;
  };

  const getDepartmentId = (department: Position["departmentId"]): string => {
    if (typeof department === "string") {
      return department;
    }
    return department._id;
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/organization-structure/positions");
      setPositions(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch positions";
      setError(errorMessage);
      console.error("Error fetching positions:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchPositions();
  };

  const handleUpdateSuccess = () => {
    setEditingPosition(null);
    fetchPositions();
  };

  const handleDeactivate = async () => {
    if (!deactivatingPosition) return;

    try {
      await api.patch(`/organization-structure/positions/${deactivatingPosition._id}/deactivate`);
      toast.success("Position deactivated successfully");
      setDeactivatingPosition(null);
      fetchPositions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to deactivate position");
      console.error("Error deactivating position:", err);
    }
  };

  const handleActivate = async (position: Position) => {
    try {
      await api.patch(`/organization-structure/positions/${position._id}`, {
        status: "active",
      });
      toast.success("Position activated successfully");
      fetchPositions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to activate position");
      console.error("Error activating position:", err);
    }
  };

  const getDepartmentName = (
    dept: string | { _id: string; name: string; code?: string } | undefined
  ) => {
    if (!dept) return "-";
    if (typeof dept === "string") return dept;
    return dept.name || dept.code || "Unknown";
  };

  const getReportsToName = (pos: string | { _id: string; title: string; code: string } | undefined) => {
    if (!pos) return "—";
    if (typeof pos === 'string') return pos;
    return pos.title || pos.code || 'Unknown';
  };

  // Filter positions
  const filteredPositions = positions.filter((pos) => {
    const matchesSearch =
      pos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pos.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && pos.isActive) ||
      (statusFilter === "inactive" && !pos.isActive);

    const matchesDepartment =
      departmentFilter === "all" ||
      getDepartmentId(pos.departmentId) === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = Array.from(
    new Map(
      positions
        .map((pos) => pos.departmentId)
        .filter(isDepartmentRef)
        .map((dept) => [dept._id, dept])
    ).values()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Loading positions...</span>
      </div>
    );
  }

  if (error && positions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchPositions} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">All Positions</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage all positions in the organization
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white text-slate-950 hover:bg-slate-200">
              <Plus className="w-4 h-4 mr-2" />
              Create Position
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Position</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new position in the organization structure
              </DialogDescription>
            </DialogHeader>
            <PositionForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-white/10 text-white pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Positions Table */}
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 border-b border-white/10">
              <TableHead className="text-slate-300">Code</TableHead>
              <TableHead className="text-slate-300">Title</TableHead>
              <TableHead className="text-slate-300">Department</TableHead>
              <TableHead className="text-slate-300">Reports To</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                  No positions found
                </TableCell>
              </TableRow>
            ) : (
              filteredPositions.map((position) => (
                <TableRow key={position._id} className="border-b border-white/5">
                  <TableCell className="font-mono text-sm text-white">
                    {position.code}
                  </TableCell>
                  <TableCell className="text-white">{position.title}</TableCell>
                  <TableCell className="text-slate-300">
                    {getDepartmentName(position.departmentId)}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {getReportsToName(position.reportsToPositionId)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={position.isActive ? "default" : "secondary"}
                      className={
                        position.isActive
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {position.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingPosition(position)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPosition(position)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {position.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeactivatingPosition(position)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivate(position)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingPosition && (
        <Dialog open={!!editingPosition} onOpenChange={(open) => !open && setEditingPosition(null)}>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Position</DialogTitle>
              <DialogDescription className="text-slate-400">
                Update position details
              </DialogDescription>
            </DialogHeader>
            <PositionForm
              position={editingPosition}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setEditingPosition(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      {viewingPosition && (
        <Dialog open={!!viewingPosition} onOpenChange={(open) => !open && setViewingPosition(null)}>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewingPosition.title}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Position Details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-400 text-sm">Code</Label>
                <p className="text-white font-mono">{viewingPosition.code}</p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Department</Label>
                <p className="text-white">{getDepartmentName(viewingPosition.departmentId)}</p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Reports To</Label>
                <p className="text-white">{getReportsToName(viewingPosition.reportsToPositionId)}</p>
              </div>
              {viewingPosition.description && (
                <div>
                  <Label className="text-slate-400 text-sm">Description</Label>
                  <p className="text-white">{viewingPosition.description}</p>
                </div>
              )}
              <div>
                <Label className="text-slate-400 text-sm">Status</Label>
                <Badge
                  variant={viewingPosition.isActive ? "default" : "secondary"}
                  className={
                    viewingPosition.isActive
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }
                >
                  {viewingPosition.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={!!deactivatingPosition} onOpenChange={(open) => !open && setDeactivatingPosition(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Position</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to deactivate the position "{deactivatingPosition?.title}"? 
              This will prevent new assignments but preserve historical data.
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
