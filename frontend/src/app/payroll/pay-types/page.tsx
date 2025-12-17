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
interface PayType {
  _id: string;
  type: string;
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

interface PayTypeFormData {
  type: string;
  amount: string; // Handle input as string then convert
}

export default function PayTypesPage() {
  const { currentRole } = useAuth();
  
  // Authorization: Only Payroll Specialist and Payroll Manager can access
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

  const [payTypes, setPayTypes] = useState<PayType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPayType, setSelectedPayType] = useState<PayType | null>(null);

  const isPayrollManager = currentRole === "Payroll Manager";

  // Form states
  const [formData, setFormData] = useState<PayTypeFormData>({
    type: "",
    amount: "",
  });

  // Fetch Pay Types
  const fetchPayTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll-configuration/pay-types");
      setPayTypes(res.data);
    } catch (error) {
      console.error("Failed to fetch pay types:", error);
      toast.error("Failed to fetch pay types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayTypes();
  }, []);

  // Handlers
  const handleCreate = async () => {
    if (!formData.type || !formData.amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = Number(formData.amount);
    if (amount < 6000) {
      toast.error("Amount must be at least 6000");
      return;
    }

    try {
      await api.post("/payroll-configuration/pay-types", {
        type: formData.type,
        amount: amount,
      });
      toast.success("Pay type created successfully.");
      setIsCreateOpen(false);
      resetForm();
      fetchPayTypes();
    } catch (error) {
      console.error("Failed to create pay type:", error);
      toast.error("Failed to create pay type.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedPayType || !formData.type || !formData.amount) return;

    const amount = Number(formData.amount);
    if (amount < 6000) {
      toast.error("Amount must be at least 6000.");
      return;
    }

    try {
      await api.patch(`/payroll-configuration/pay-types/${selectedPayType._id}`, {
        type: formData.type,
        amount: amount,
      });
      toast.success("Pay type updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchPayTypes();
    } catch (error) {
      console.error("Failed to update pay type:", error);
      toast.error("Failed to update pay type");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pay type?")) return;

    try {
      await api.delete(`/payroll-configuration/pay-types/${id}`);
      toast.success("Pay type deleted successfully");
      fetchPayTypes();
    } catch (error) {
      console.error("Failed to delete pay type:", error);
      toast.error("Failed to delete pay type");
    }
  };
  
  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!selectedPayType) return;
    try {
      await api.patch(`/payroll-configuration/pay-types/${selectedPayType._id}`, {
        status,
      });
      toast.success(`Pay type ${status} successfully`);
      setIsViewOpen(false);
      fetchPayTypes();
    } catch (error) {
      console.error(`Failed to ${status} pay type:`, error);
      // @ts-ignore
      toast.error(error.response?.data?.message || `Failed to ${status} pay type`);
    }
  };

  const openEdit = (payType: PayType) => {
    setSelectedPayType(payType);
    setFormData({
      type: payType.type,
      amount: payType.amount.toString(),
    });
    setIsEditOpen(true);
  };

  const openView = async (payType: PayType) => {
    // Ideally fetch by ID to get full details if list is partial
    try {
       const res = await api.get(`/payroll-configuration/pay-types/${payType._id}`);
       setSelectedPayType(res.data);
       setIsViewOpen(true);
    } catch (error) {
        // Fallback to local data if fetch fails
        setSelectedPayType(payType);
        setIsViewOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({ type: "", amount: "" });
    setSelectedPayType(null);
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
            Pay Types
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your employee pay types and salary structures
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
            Create Pay Type
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
        ) : payTypes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No pay types found. Create one to get started.
          </div>
        ) : (
          payTypes.map((payType) => (
            <Card
              key={payType._id}
              className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-white truncate pr-4">
                  {payType.type}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(payType.status)} capitalize`}
                >
                  {payType.status || "Draft"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Amount</p>
                  <div className="text-2xl font-bold text-slate-200">
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(payType.amount)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openView(payType)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(payType)}
                  className="hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(payType._id)}
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
            <DialogTitle>Create New Pay Type</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new pay type to the payroll configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="e.g. Monthly Salary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (Min: 6000)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="6000.00"
                min="6000"
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
              Create Pay Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pay Type</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update details for {selectedPayType?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <Input
                id="edit-type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount (Min: 6000)</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
                min="6000"
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
               Pay Type Details
               <Badge className={getStatusColor(selectedPayType?.status || '')}>
                 {selectedPayType?.status || 'Draft'}
               </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Type</label>
                   <p className="text-lg font-medium text-slate-200">{selectedPayType?.type}</p>
                </div>
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Amount</label>
                   <p className="text-2xl font-bold text-white">
                      {selectedPayType?.amount && new Intl.NumberFormat("en-US", {
                         minimumFractionDigits: 2,
                         maximumFractionDigits: 2,
                      }).format(selectedPayType.amount)}
                   </p>
                </div>
             </div>
             <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedPayType?.createdBy && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Created By</label>
                     <p className="text-sm text-slate-300">
                        {typeof selectedPayType.createdBy === 'object' 
                           ? `${selectedPayType.createdBy.firstName} ${selectedPayType.createdBy.lastName}` 
                           : 'Unknown'}
                     </p>
                  </div>
                )}
                {selectedPayType?.approvedBy && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Approved By</label>
                     <p className="text-sm text-slate-300">
                        {typeof selectedPayType.approvedBy === 'object' 
                           ? `${selectedPayType.approvedBy.firstName} ${selectedPayType.approvedBy.lastName}` 
                           : 'Unknown'}
                     </p>
                  </div>
                )}
                {selectedPayType?.approvedAt && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Approved At</label>
                     <p className="text-sm text-slate-300">
                        {new Date(selectedPayType.approvedAt).toLocaleString()}
                     </p>
                  </div>
                )}
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isPayrollManager && selectedPayType?.status === "draft" && (
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
              variant={isPayrollManager && selectedPayType?.status === "draft" ? "outline" : "default"}
              className={isPayrollManager && selectedPayType?.status === "draft" ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "w-full bg-slate-800 hover:bg-slate-700"}
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

