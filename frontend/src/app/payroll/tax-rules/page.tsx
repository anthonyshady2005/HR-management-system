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
import { Textarea } from "@/components/ui/textarea";

type ConfigStatus = "draft" | "approved" | "rejected";

interface TaxRule {
  _id: string;
  name: string;
  description?: string;
  rate: number;
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

interface TaxRuleFormData {
  name: string;
  description: string;
  rate: string;
  status: ConfigStatus;
}

export default function TaxRulesPage() {
  const { currentRole } = useAuth();

  const canEdit =
    currentRole === "Legal & Policy Admin" || currentRole === "Payroll Manager";
  const canApprove = currentRole === "Payroll Manager";
  const canCreate = currentRole === "Legal & Policy Admin";

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold text-slate-200 mb-4">Unauthorized</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access this resource. Required roles:
          Legal & Policy Admin or Payroll Manager.
        </p>
      </div>
    );
  }

  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<TaxRule | null>(null);

  const [formData, setFormData] = useState<TaxRuleFormData>({
    name: "",
    description: "",
    rate: "",
    status: "draft",
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll-configuration/tax-rules");
      setRules(res.data);
    } catch (error) {
      console.error("Failed to fetch tax rules:", error);
      toast.error("Failed to fetch tax rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.rate) {
      toast.error("Please fill in name and rate");
      return;
    }

    try {
      await api.post("/payroll-configuration/tax-rules", {
        name: formData.name,
        description: formData.description,
        rate: Number(formData.rate),
      });
      toast.success("Tax rule created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error("Failed to create tax rule:", error);
      toast.error("Failed to create tax rule");
    }
  };

  const handleUpdate = async () => {
    if (!selectedRule || !formData.name || !formData.rate) return;

    try {
      await api.patch(`/payroll-configuration/tax-rules/${selectedRule._id}`, {
        name: formData.name,
        description: formData.description,
        rate: Number(formData.rate),
        status: formData.status,
      });
      toast.success("Tax rule updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error("Failed to update tax rule:", error);
      toast.error("Failed to update tax rule");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tax rule?")) return;

    try {
      await api.delete(`/payroll-configuration/tax-rules/${id}`);
      toast.success("Tax rule deleted successfully");
      fetchRules();
    } catch (error) {
      console.error("Failed to delete tax rule:", error);
      toast.error("Failed to delete tax rule");
    }
  };

  const handleStatusChange = async (status: ConfigStatus) => {
    if (!selectedRule) return;
    try {
      await api.patch(`/payroll-configuration/tax-rules/${selectedRule._id}`, {
        status,
      });
      toast.success(`Tax rule ${status} successfully`);
      setIsViewOpen(false);
      fetchRules();
    } catch (error) {
      console.error(`Failed to ${status} tax rule:`, error);
      toast.error(`Failed to ${status} tax rule`);
    }
  };

  const openEdit = (rule: TaxRule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      rate: rule.rate.toString(),
      status: rule.status || "draft",
    });
    setIsEditOpen(true);
  };

  const openView = async (rule: TaxRule) => {
    try {
      const res = await api.get(`/payroll-configuration/tax-rules/${rule._id}`);
      setSelectedRule(res.data);
      setIsViewOpen(true);
    } catch (error) {
      setSelectedRule(rule);
      setIsViewOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      rate: "",
      status: "draft",
    });
    setSelectedRule(null);
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
            Tax Rules
          </h1>
          <p className="text-slate-400 mt-1">
            Manage tax rates and approval workflow for payroll calculations
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Tax Rule
          </Button>
        )}
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
        ) : rules.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No tax rules found. Create one to get started.
          </div>
        ) : (
          rules.map((rule) => (
            <Card
              key={rule._id}
              className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-white truncate pr-4">
                  {rule.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(rule.status)} capitalize`}
                >
                  {rule.status || "draft"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                      Rate
                    </p>
                    <div className="text-lg font-semibold text-emerald-400">
                      {rule.rate}%
                    </div>
                  </div>
                  {rule.description && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                        Description
                      </p>
                      <p className="text-sm text-slate-300 line-clamp-2">
                        {rule.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openView(rule)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(rule)}
                  className="hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(rule._id)}
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Create Tax Rule</DialogTitle>
            <DialogDescription className="text-slate-400">
              Define a new tax rate for payroll calculations.
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
                placeholder="e.g. Standard Income Tax"
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
                placeholder="Optional description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate">Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="15"
              />
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
              Create Tax Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Tax Rule</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update details for {selectedRule?.name}
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
            <div className="grid gap-2">
              <Label htmlFor="edit-rate">Rate (%)</Label>
              <Input
                id="edit-rate"
                type="number"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Tax Rule Details
              <Badge className={getStatusColor(selectedRule?.status || "")}>
                {selectedRule?.status || "draft"}
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
                    {selectedRule?.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Rate
                  </label>
                  <p className="text-lg font-bold text-emerald-400">
                    {selectedRule?.rate}%
                  </p>
                </div>
              </div>
              {selectedRule?.description && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">
                    Description
                  </label>
                  <p className="text-sm text-slate-300 mt-1">
                    {selectedRule.description}
                  </p>
                </div>
              )}
              <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedRule?.createdBy && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Created By
                    </label>
                    <p className="text-sm text-slate-300">
                      {typeof selectedRule.createdBy === "object"
                        ? `${selectedRule.createdBy.firstName} ${selectedRule.createdBy.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                )}
                {selectedRule?.approvedBy && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Approved By
                    </label>
                    <p className="text-sm text-slate-300">
                      {typeof selectedRule.approvedBy === "object"
                        ? `${selectedRule.approvedBy.firstName} ${selectedRule.approvedBy.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                )}
                {selectedRule?.approvedAt && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Approved At
                    </label>
                    <p className="text-sm text-slate-300">
                      {new Date(selectedRule.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {canApprove && selectedRule?.status === "draft" && (
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
                canApprove && selectedRule?.status === "draft"
                  ? "outline"
                  : "default"
              }
              className={
                canApprove && selectedRule?.status === "draft"
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

