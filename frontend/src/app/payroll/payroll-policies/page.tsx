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
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Types
enum PolicyType {
  DEDUCTION = "Deduction",
  ALLOWANCE = "Allowance",
  BENEFIT = "Benefit",
  MISCONDUCT = "Misconduct",
  LEAVE = "Leave",
}

enum Applicability {
  AllEmployees = "All Employees",
  FULL_TIME = "Full Time Employees",
  PART_TIME = "Part Time Employees",
  CONTRACTORS = "Contractors",
}

interface RuleDefinition {
  percentage: number;
  fixedAmount: number;
  thresholdAmount: number;
}

interface PayrollPolicy {
  _id: string;
  policyName: string;
  policyType: PolicyType;
  description: string;
  effectiveDate: string;
  ruleDefinition: RuleDefinition;
  applicability: Applicability;
  status: "draft" | "approved" | "rejected";
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

interface PayrollPolicyFormData {
  policyName: string;
  policyType: string;
  description: string;
  effectiveDate: string;
  applicability: string;
  percentage: string;
  fixedAmount: string;
  thresholdAmount: string;
}

export default function PayrollPoliciesPage() {
  const { currentRole } = useAuth();

  if (
    currentRole !== "Payroll Specialist" &&
    currentRole !== "Payroll Manager"
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold text-slate-200 mb-4">Unauthorized</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access this resource. Required roles:
          Payroll Specialist or Payroll Manager.
        </p>
      </div>
    );
  }

  const [policies, setPolicies] = useState<PayrollPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PayrollPolicy | null>(
    null
  );

  const isPayrollManager = currentRole === "Payroll Manager";

  // Form states
  const [formData, setFormData] = useState<PayrollPolicyFormData>({
    policyName: "",
    policyType: "",
    description: "",
    effectiveDate: "",
    applicability: "",
    percentage: "",
    fixedAmount: "",
    thresholdAmount: "",
  });

  // Fetch Policies
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll-configuration/policies");
      setPolicies(res.data);
    } catch (error) {
      console.error("Failed to fetch payroll policies:", error);
      toast.error("Failed to fetch payroll policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Handlers
  const handleCreate = async () => {
    if (
      !formData.policyName ||
      !formData.policyType ||
      !formData.description ||
      !formData.effectiveDate ||
      !formData.applicability
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/payroll-configuration/policies", {
        policyName: formData.policyName,
        policyType: formData.policyType,
        description: formData.description,
        effectiveDate: new Date(formData.effectiveDate),
        applicability: formData.applicability,
        ruleDefinition: {
          percentage: Number(formData.percentage) || 0,
          fixedAmount: Number(formData.fixedAmount) || 0,
          thresholdAmount: Number(formData.thresholdAmount) || 1,
        },
      });
      toast.success("Payroll Policy created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchPolicies();
    } catch (error) {
      console.error("Failed to create payroll policy:", error);
      toast.error("Failed to create payroll policy");
    }
  };

  const handleUpdate = async () => {
    if (!selectedPolicy || !formData.policyName) return;

    try {
      await api.patch(`/payroll-configuration/policies/${selectedPolicy._id}`, {
        policyName: formData.policyName,
        policyType: formData.policyType,
        description: formData.description,
        effectiveDate: new Date(formData.effectiveDate),
        applicability: formData.applicability,
        ruleDefinition: {
          percentage: Number(formData.percentage) || 0,
          fixedAmount: Number(formData.fixedAmount) || 0,
          thresholdAmount: Number(formData.thresholdAmount) || 1,
        },
      });
      toast.success("Payroll Policy updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchPolicies();
    } catch (error) {
      console.error("Failed to update payroll policy:", error);
      toast.error("Failed to update payroll policy");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payroll policy?"))
      return;

    try {
      await api.delete(`/payroll-configuration/policies/${id}`);
      toast.success("Payroll Policy deleted successfully");
      fetchPolicies();
    } catch (error) {
      console.error("Failed to delete payroll policy:", error);
      toast.error("Failed to delete payroll policy");
    }
  };

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!selectedPolicy) return;
    try {
      await api.patch(`/payroll-configuration/policies/${selectedPolicy._id}`, {
        status,
      });
      toast.success(`Payroll Policy ${status} successfully`);
      setIsViewOpen(false);
      fetchPolicies();
    } catch (error) {
      console.error(`Failed to ${status} payroll policy:`, error);
      toast.error(`Failed to ${status} payroll policy`);
    }
  };

  const openEdit = (policy: PayrollPolicy) => {
    setSelectedPolicy(policy);
    setFormData({
      policyName: policy.policyName,
      policyType: policy.policyType,
      description: policy.description,
      effectiveDate: policy.effectiveDate
        ? new Date(policy.effectiveDate).toISOString().split("T")[0]
        : "",
      applicability: policy.applicability,
      percentage: policy.ruleDefinition?.percentage?.toString() || "0",
      fixedAmount: policy.ruleDefinition?.fixedAmount?.toString() || "0",
      thresholdAmount:
        policy.ruleDefinition?.thresholdAmount?.toString() || "0",
    });
    setIsEditOpen(true);
  };

  const openView = async (policy: PayrollPolicy) => {
    try {
      const res = await api.get(
        `/payroll-configuration/policies/${policy._id}`
      );
      setSelectedPolicy(res.data);
      setIsViewOpen(true);
    } catch (error) {
      setSelectedPolicy(policy);
      setIsViewOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      policyName: "",
      policyType: "",
      description: "",
      effectiveDate: "",
      applicability: "",
      percentage: "",
      fixedAmount: "",
      thresholdAmount: "",
    });
    setSelectedPolicy(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
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
            Payroll Policies
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your payroll policies and rules
          </p>
        </div>
        {currentRole === "Payroll Specialist" && (
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Policy
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton / Loading State
          Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="h-48 animate-pulse bg-white/5 border-white/10"
            />
          ))
        ) : policies.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No payroll policies found. Create one to get started.
          </div>
        ) : (
          policies.map((policy) => (
            <Card
              key={policy._id}
              className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-white truncate pr-4">
                  {policy.policyName}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(policy.status)} capitalize`}
                >
                  {policy.status || "Draft"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                      Type
                    </p>
                    <div className="text-sm font-medium text-slate-200">
                      {policy.policyType}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                      Applicability
                    </p>
                    <div className="text-sm font-medium text-slate-300">
                      {policy.applicability}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openView(policy)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(policy)}
                  className="hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(policy._id)}
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Payroll Policy</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new payroll policy to the configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="policyName">Policy Name</Label>
              <Input
                id="policyName"
                value={formData.policyName}
                onChange={(e) =>
                  setFormData({ ...formData, policyName: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="e.g. Late Arrival Deduction"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="policyType">Policy Type</Label>
                <Select
                  value={formData.policyType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, policyType: value })
                  }
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-emerald-500/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {Object.values(PolicyType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="applicability">Applicability</Label>
                <Select
                  value={formData.applicability}
                  onValueChange={(value) =>
                    setFormData({ ...formData, applicability: value })
                  }
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-emerald-500/50">
                    <SelectValue placeholder="Select applicability" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {Object.values(Applicability).map((app) => (
                      <SelectItem key={app} value={app}>
                        {app}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveDate: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="Describe the policy..."
              />
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-4 mt-2">
              <h4 className="text-sm font-medium text-slate-300">
                Rule Definition
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                    className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fixedAmount">Fixed Amount</Label>
                  <Input
                    id="fixedAmount"
                    type="number"
                    value={formData.fixedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, fixedAmount: e.target.value })
                    }
                    className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="thresholdAmount">Threshold</Label>
                  <Input
                    id="thresholdAmount"
                    type="number"
                    value={formData.thresholdAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thresholdAmount: e.target.value,
                      })
                    }
                    className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                    placeholder="0"
                  />
                </div>
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
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payroll Policy</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update details for {selectedPolicy?.policyName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-policyName">Policy Name</Label>
              <Input
                id="edit-policyName"
                value={formData.policyName}
                onChange={(e) =>
                  setFormData({ ...formData, policyName: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-policyType">Policy Type</Label>
                <Select
                  value={formData.policyType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, policyType: value })
                  }
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-amber-500/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {Object.values(PolicyType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-applicability">Applicability</Label>
                <Select
                  value={formData.applicability}
                  onValueChange={(value) =>
                    setFormData({ ...formData, applicability: value })
                  }
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-amber-500/50">
                    <SelectValue placeholder="Select applicability" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {Object.values(Applicability).map((app) => (
                      <SelectItem key={app} value={app}>
                        {app}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-effectiveDate">Effective Date</Label>
              <Input
                id="edit-effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveDate: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-4 mt-2">
              <h4 className="text-sm font-medium text-slate-300">
                Rule Definition
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-percentage">Percentage (%)</Label>
                  <Input
                    id="edit-percentage"
                    type="number"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                    className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-fixedAmount">Fixed Amount</Label>
                  <Input
                    id="edit-fixedAmount"
                    type="number"
                    value={formData.fixedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, fixedAmount: e.target.value })
                    }
                    className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-thresholdAmount">Threshold</Label>
                  <Input
                    id="edit-thresholdAmount"
                    type="number"
                    value={formData.thresholdAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thresholdAmount: e.target.value,
                      })
                    }
                    className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
                  />
                </div>
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Policy Details
              <Badge className={getStatusColor(selectedPolicy?.status || "")}>
                {selectedPolicy?.status || "Draft"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Policy Name
                  </label>
                  <p className="text-lg font-medium text-slate-200">
                    {selectedPolicy?.policyName}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Type
                  </label>
                  <p className="text-lg font-medium text-slate-200">
                    {selectedPolicy?.policyType}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">
                  Description
                </label>
                <p className="text-sm text-slate-300 mt-1">
                  {selectedPolicy?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Applicability
                  </label>
                  <p className="text-sm font-medium text-slate-200">
                    {selectedPolicy?.applicability}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Effective Date
                  </label>
                  <p className="text-sm font-medium text-slate-200">
                    {selectedPolicy?.effectiveDate &&
                      new Date(
                        selectedPolicy.effectiveDate
                      ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                  Rule Definition
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Percentage</span>
                    <p className="text-lg font-bold text-emerald-400">
                      {selectedPolicy?.ruleDefinition?.percentage}%
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Fixed Amount</span>
                    <p className="text-lg font-bold text-white">
                      {selectedPolicy?.ruleDefinition?.fixedAmount &&
                        new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(selectedPolicy.ruleDefinition.fixedAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Threshold</span>
                    <p className="text-lg font-bold text-slate-300">
                      {selectedPolicy?.ruleDefinition?.thresholdAmount &&
                        new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          selectedPolicy.ruleDefinition.thresholdAmount
                        )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedPolicy?.createdBy && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Created By
                    </label>
                    <p className="text-sm text-slate-300">
                      {typeof selectedPolicy.createdBy === "object"
                        ? `${selectedPolicy.createdBy.firstName} ${selectedPolicy.createdBy.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                )}
                {selectedPolicy?.approvedBy && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Approved By
                    </label>
                    <p className="text-sm text-slate-300">
                      {typeof selectedPolicy.approvedBy === "object"
                        ? `${selectedPolicy.approvedBy.firstName} ${selectedPolicy.approvedBy.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                )}
                {selectedPolicy?.approvedAt && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Approved At
                    </label>
                    <p className="text-sm text-slate-300">
                      {new Date(selectedPolicy.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isPayrollManager && selectedPolicy?.status === "draft" && (
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
                isPayrollManager && selectedPolicy?.status === "draft"
                  ? "outline"
                  : "default"
              }
              className={
                isPayrollManager && selectedPolicy?.status === "draft"
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
