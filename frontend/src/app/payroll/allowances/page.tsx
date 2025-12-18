"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2, X } from "lucide-react";
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
import { CheckCircle, XCircle } from "lucide-react";

// Types
interface Allowance {
  _id: string;
  name: string;
  amount: number;
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

interface AllowanceFormData {
  name: string;
  amount: string; // Handle input as string then convert
}

export default function AllowancesPage() {
  const { currentRole } = useAuth();
  
  if (currentRole !== "Payroll Specialist" && currentRole !== "Payroll Manager") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold text-slate-200 mb-4">Unauthorized</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access this resource. Required roles: Payroll Specialist or Payroll Manager.
        </p>
      </div>
    );
  }

  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);

  const isPayrollManager = currentRole === "Payroll Manager";

  // Form states
  const [formData, setFormData] = useState<AllowanceFormData>({
    name: "",
    amount: "",
  });

  // Fetch Allowances
  const fetchAllowances = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll-configuration/allowances");
      setAllowances(res.data);
    } catch (error) {
      console.error("Failed to fetch allowances:", error);
      toast.error("Failed to fetch allowances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowances();
  }, []);

  // Handlers
  const handleCreate = async () => {
    if (!formData.name || !formData.amount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await api.post("/payroll-configuration/allowances", {
        name: formData.name,
        amount: Number(formData.amount),
      });
      toast.success("Allowance created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchAllowances();
    } catch (error) {
      console.error("Failed to create allowance:", error);
      toast.error("Failed to create allowance");
    }
  };

  const handleUpdate = async () => {
    if (!selectedAllowance || !formData.name || !formData.amount) return;

    try {
      await api.patch(`/payroll-configuration/allowances/${selectedAllowance._id}`, {
        name: formData.name,
        amount: Number(formData.amount),
      });
      toast.success("Allowance updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchAllowances();
    } catch (error) {
      console.error("Failed to update allowance:", error);
      toast.error("Failed to update allowance");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this allowance?")) return;

    try {
      await api.delete(`/payroll-configuration/allowances/${id}`);
      toast.success("Allowance deleted successfully");
      fetchAllowances();
    } catch (error) {
      console.error("Failed to delete allowance:", error);
      toast.error("Failed to delete allowance");
    }
  };
  
  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!selectedAllowance) return;
    try {
      await api.patch(`/payroll-configuration/allowances/${selectedAllowance._id}`, {
        status,
      });
      toast.success(`Allowance ${status} successfully`);
      setIsViewOpen(false);
      fetchAllowances();
    } catch (error) {
      console.error(`Failed to ${status} allowance:`, error);
      // @ts-ignore
      toast.error(error.response?.data?.message || `Failed to ${status} allowance`);
    }
  };

  const openEdit = (allowance: Allowance) => {
    setSelectedAllowance(allowance);
    setFormData({
      name: allowance.name,
      amount: allowance.amount.toString(),
    });
    setIsEditOpen(true);
  };

  const openView = async (allowance: Allowance) => {
    // Ideally fetch by ID to get full details if list is partial
    try {
       const res = await api.get(`/payroll-configuration/allowances/${allowance._id}`);
       setSelectedAllowance(res.data);
       setIsViewOpen(true);
    } catch (error) {
        // Fallback to local data if fetch fails
        setSelectedAllowance(allowance);
        setIsViewOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", amount: "" });
    setSelectedAllowance(null);
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
            Allowances
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your employee allowances and benefits
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
            Create Allowance
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           // Skeleton / Loading State
           Array.from({ length: 3 }).map((_, i) => (
             <Card key={i} className="h-48 animate-pulse bg-white/5 border-white/10" />
           ))
        ) : allowances.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No allowances found. Create one to get started.
          </div>
        ) : (
          allowances.map((allowance) => (
            <Card
              key={allowance._id}
              className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-white truncate pr-4">
                  {allowance.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(allowance.status)} capitalize`}
                >
                  {allowance.status || "Draft"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Amount</p>
                  <div className="text-2xl font-bold text-slate-200">
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(allowance.amount)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openView(allowance)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(allowance)}
                  className="hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(allowance._id)}
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Allowance</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new allowance to the payroll configuration.
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
                placeholder="e.g. Housing Allowance"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="0.00"
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
              Create Allowance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Allowance</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update details for {selectedAllowance?.name}
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
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               Allowance Details
               <Badge className={getStatusColor(selectedAllowance?.status || '')}>
                 {selectedAllowance?.status || 'Draft'}
               </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Name</label>
                   <p className="text-lg font-medium text-slate-200">{selectedAllowance?.name}</p>
                </div>
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Amount</label>
                   <p className="text-2xl font-bold text-white">
                      {selectedAllowance?.amount && new Intl.NumberFormat("en-US", {
                         minimumFractionDigits: 2,
                         maximumFractionDigits: 2,
                      }).format(selectedAllowance.amount)}
                   </p>
                </div>
             </div>
             <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedAllowance?.createdBy && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Created By</label>
                    <p className="text-sm text-slate-300">
                      {typeof selectedAllowance.createdBy === 'object' 
                        ? `${selectedAllowance.createdBy.firstName} ${selectedAllowance.createdBy.lastName}` 
                        : 'Unknown'}
                    </p>
                  </div>
                )}
                {selectedAllowance?.approvedBy && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Approved By</label>
                    <p className="text-sm text-slate-300">
                      {typeof selectedAllowance.approvedBy === 'object' 
                        ? `${selectedAllowance.approvedBy.firstName} ${selectedAllowance.approvedBy.lastName}` 
                        : 'Unknown'}
                    </p>
                  </div>
                )}
                {selectedAllowance?.approvedAt && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Approved At</label>
                    <p className="text-sm text-slate-300">
                      {new Date(selectedAllowance.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isPayrollManager && selectedAllowance?.status === "draft" && (
              <>
                <Button 
                   onClick={() => handleStatusChange('approved')}
                   className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button 
                   onClick={() => handleStatusChange('rejected')}
                   className="bg-red-600 hover:bg-red-700 text-white gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </>
            )}
             <Button
              variant={isPayrollManager && selectedAllowance?.status === "draft" ? "outline" : "default"}
              className={isPayrollManager && selectedAllowance?.status === "draft" ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "w-full bg-slate-800 hover:bg-slate-700"}
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
