"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ConfigStatus = "draft" | "approved" | "rejected";

interface InsuranceBracket {
  _id: string;
  name: string;

  minSalary: number;
  maxSalary: number;
  employeeRate: number;
  employerRate: number;
  status: ConfigStatus;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  approvedAt?: string;
}

interface InsuranceBracketFormData {
  name: string;

  minSalary: string;
  maxSalary: string;
  employeeRate: string;
  employerRate: string;
  status: ConfigStatus;
}

export default function InsuranceBracketsPage() {
  const { currentRole } = useAuth();

  const canEdit =
    currentRole === "Payroll Specialist" || currentRole === "HR Manager";
  const canApprove = currentRole === "HR Manager";

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold text-slate-200 mb-4">Unauthorized</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access this resource. Required roles:
          Payroll Specialist or HR Manager.
        </p>
      </div>
    );
  }

  const [brackets, setBrackets] = useState<InsuranceBracket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBracket, setSelectedBracket] =
    useState<InsuranceBracket | null>(null);

  const [formData, setFormData] = useState<InsuranceBracketFormData>({
    name: "",

    minSalary: "",
    maxSalary: "",
    employeeRate: "",
    employerRate: "",
    status: "draft",
  });

  const fetchBrackets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll-configuration/insurance-brackets");
      setBrackets(res.data);
    } catch (error) {
      console.error("Failed to fetch insurance brackets:", error);
      toast.error("Failed to fetch insurance brackets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrackets();
  }, []);

  const handleCreate = async () => {
    if (
      !formData.name ||

      !formData.minSalary ||
      !formData.maxSalary ||
      !formData.employeeRate ||
      !formData.employerRate
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await api.post("/payroll-configuration/insurance-brackets", {
        name: formData.name,

        minSalary: Number(formData.minSalary),
        maxSalary: Number(formData.maxSalary),
        employeeRate: Number(formData.employeeRate),
        employerRate: Number(formData.employerRate),
      });
      toast.success("Insurance bracket created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchBrackets();
    } catch (error) {
      console.error("Failed to create insurance bracket:", error);
      toast.error("Failed to create insurance bracket");
    }
  };

  const handleUpdate = async () => {
    if (
      !selectedBracket ||
      !formData.name ||

      !formData.minSalary ||
      !formData.maxSalary ||
      !formData.employeeRate ||
      !formData.employerRate
    )
      return;

    try {
      await api.patch(
        `/payroll-configuration/insurance-brackets/${selectedBracket._id}`,
        {
          name: formData.name,

          minSalary: Number(formData.minSalary),
          maxSalary: Number(formData.maxSalary),
          employeeRate: Number(formData.employeeRate),
          employerRate: Number(formData.employerRate),
          status: formData.status,
        }
      );
      toast.success("Insurance bracket updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchBrackets();
    } catch (error) {
      console.error("Failed to update insurance bracket:", error);
      toast.error("Failed to update insurance bracket");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this insurance bracket?"))
      return;

    try {
      await api.delete(`/payroll-configuration/insurance-brackets/${id}`);
      toast.success("Insurance bracket deleted successfully");
      fetchBrackets();
    } catch (error) {
      console.error("Failed to delete insurance bracket:", error);
      toast.error("Failed to delete insurance bracket");
    }
  };

  const handleStatusChange = async (status: ConfigStatus) => {
    if (!selectedBracket) return;
    try {
      await api.patch(
        `/payroll-configuration/insurance-brackets/${selectedBracket._id}`,
        {
          status,
        }
      );
      toast.success(`Insurance bracket ${status} successfully`);
      setIsViewOpen(false);
      fetchBrackets();
    } catch (error) {
      console.error(`Failed to ${status} insurance bracket:`, error);
      toast.error(`Failed to ${status} insurance bracket`);
    }
  };

  const openEdit = (bracket: InsuranceBracket) => {
    setSelectedBracket(bracket);
    setFormData({
      name: bracket.name,

      minSalary: bracket.minSalary.toString(),
      maxSalary: bracket.maxSalary.toString(),
      employeeRate: bracket.employeeRate.toString(),
      employerRate: bracket.employerRate.toString(),
      status: bracket.status || "draft",
    });
    setIsEditOpen(true);
  };

  const openView = async (bracket: InsuranceBracket) => {
    try {
      const res = await api.get(
        `/payroll-configuration/insurance-brackets/${bracket._id}`
      );
      setSelectedBracket(res.data);
      setIsViewOpen(true);
    } catch (error) {
      setSelectedBracket(bracket);
      setIsViewOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",

      minSalary: "",
      maxSalary: "",
      employeeRate: "",
      employerRate: "",
      status: "draft",
    });
    setSelectedBracket(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Insurance Brackets
          </h1>
          <p className="text-slate-400 mt-1">
            Manage salary ranges and contribution rates for insurance
            calculations
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Bracket
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="h-48 animate-pulse bg-white/5 border-white/10"
            />
          ))
        ) : brackets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No insurance brackets found. Create one to get started.
          </div>
        ) : (
          brackets.map((bracket) => (
            <Card
              key={bracket._id}
              className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-white truncate pr-4">
                  {bracket.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(bracket.status)} capitalize`}
                >
                  {bracket.status || "draft"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                        Min Salary
                      </p>
                      <div className="text-lg font-semibold text-slate-200">
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(bracket.minSalary)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                        Max Salary
                      </p>
                      <div className="text-lg font-semibold text-slate-200">
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(bracket.maxSalary)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                        Employee Rate
                      </p>
                      <div className="text-sm font-medium text-emerald-400">
                        {bracket.employeeRate}%
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                        Employer Rate
                      </p>
                      <div className="text-sm font-medium text-emerald-400">
                        {bracket.employerRate}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openView(bracket)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(bracket)}
                  className="hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(bracket._id)}
                  className="hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Insurance Bracket</DialogTitle>
            <DialogDescription className="text-slate-400">
              Define salary range and contribution rates.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="e.g. Health Insurance"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minSalary">Min Salary</Label>
                <Input
                  id="minSalary"
                  type="number"
                  value={formData.minSalary}
                  onChange={(e) =>
                    setFormData({ ...formData, minSalary: e.target.value })
                  }
                  className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxSalary">Max Salary</Label>
                <Input
                  id="maxSalary"
                  type="number"
                  value={formData.maxSalary}
                  onChange={(e) =>
                    setFormData({ ...formData, maxSalary: e.target.value })
                  }
                  className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="employeeRate">Employee Rate (%)</Label>
                <Input
                  id="employeeRate"
                  type="number"
                  value={formData.employeeRate}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeRate: e.target.value })
                  }
                  className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                  placeholder="10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employerRate">Employer Rate (%)</Label>
                <Input
                  id="employerRate"
                  type="number"
                  value={formData.employerRate}
                  onChange={(e) =>
                    setFormData({ ...formData, employerRate: e.target.value })
                  }
                  className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                  placeholder="15"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Create Bracket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Insurance Bracket</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update details for {selectedBracket?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-minSalary">Min Salary</Label>
                <Input
                  id="edit-minSalary"
                  type="number"
                  value={formData.minSalary}
                  onChange={(e) =>
                    setFormData({ ...formData, minSalary: e.target.value })
                  }
                  className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maxSalary">Max Salary</Label>
                <Input
                  id="edit-maxSalary"
                  type="number"
                  value={formData.maxSalary}
                  onChange={(e) =>
                    setFormData({ ...formData, maxSalary: e.target.value })
                  }
                  className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-employeeRate">Employee Rate (%)</Label>
                <Input
                  id="edit-employeeRate"
                  type="number"
                  value={formData.employeeRate}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeRate: e.target.value })
                  }
                  className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-employerRate">Employer Rate (%)</Label>
                <Input
                  id="edit-employerRate"
                  type="number"
                  value={formData.employerRate}
                  onChange={(e) =>
                    setFormData({ ...formData, employerRate: e.target.value })
                  }
                  className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(["draft", "approved", "rejected"] as ConfigStatus[]).map(
                  (status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={formData.status === status ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, status })}
                      className={
                        formData.status === status
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "border-slate-700 text-slate-300 hover:bg-slate-800"
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Update Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Insurance Bracket Details
              <Badge className={getStatusColor(selectedBracket?.status || "")}>
                {selectedBracket?.status || "draft"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Name
                  </label>
                  <p className="text-lg font-medium text-slate-200">
                    {selectedBracket?.name}
                  </p>
                </div>

              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Min Salary
                  </label>
                  <p className="text-lg font-medium text-slate-200">
                    {selectedBracket?.minSalary !== undefined &&
                      new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(selectedBracket.minSalary)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Max Salary
                  </label>
                  <p className="text-lg font-medium text-slate-200">
                    {selectedBracket?.maxSalary !== undefined &&
                      new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(selectedBracket.maxSalary)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Employee Rate
                  </label>
                  <p className="text-lg font-bold text-emerald-400">
                    {selectedBracket?.employeeRate}%
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Employer Rate
                  </label>
                  <p className="text-lg font-bold text-emerald-400">
                    {selectedBracket?.employerRate}%
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedBracket?.createdBy && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Created By
                    </label>
                    <p className="text-sm text-slate-300">
                      {typeof selectedBracket.createdBy === "object"
                        ? `${selectedBracket.createdBy.firstName} ${selectedBracket.createdBy.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                )}
                {selectedBracket?.approvedBy && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Approved By
                    </label>
                    <p className="text-sm text-slate-300">
                      {typeof selectedBracket.approvedBy === "object"
                        ? `${selectedBracket.approvedBy.firstName} ${selectedBracket.approvedBy.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                )}
                {selectedBracket?.approvedAt && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Approved At
                    </label>
                    <p className="text-sm text-slate-300">
                      {new Date(selectedBracket.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {canApprove && selectedBracket?.status === "draft" && (
              <>
                <Button
                  onClick={() => handleStatusChange("approved")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusChange("rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </>
            )}
            <Button
              variant={
                canApprove && selectedBracket?.status === "draft"
                  ? "outline"
                  : "default"
              }
              className={
                canApprove && selectedBracket?.status === "draft"
                  ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                  : "w-full bg-slate-800 hover:bg-slate-700"
              }
              onClick={() => setIsViewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

