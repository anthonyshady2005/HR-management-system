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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";

// Types
interface SigningBonus {
  _id: string;
  positionName: string;
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

interface SigningBonusFormData {
  positionName: string;
  amount: string; // string for input then cast
}

export default function SigningBonusesPage() {
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

  const [bonuses, setBonuses] = useState<SigningBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<SigningBonus | null>(null);

  const isPayrollManager = currentRole === "Payroll Manager";

  const [formData, setFormData] = useState<SigningBonusFormData>({
    positionName: "",
    amount: "",
  });

  // Fetch Signing Bonuses
  const fetchBonuses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll-configuration/signing-bonuses");
      setBonuses(res.data);
    } catch (error) {
      console.error("Failed to fetch signing bonuses:", error);
      toast.error("Failed to fetch signing bonuses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  // Handlers
  const handleCreate = async () => {
    if (!formData.positionName || !formData.amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = Number(formData.amount);
    if (amount < 0) {
      toast.error("Amount must be 0 or greater");
      return;
    }

    try {
      await api.post("/payroll-configuration/signing-bonuses", {
        positionName: formData.positionName,
        amount,
      });
      toast.success("Signing bonus created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchBonuses();
    } catch (error) {
      console.error("Failed to create signing bonus:", error);
      toast.error("Failed to create signing bonus");
    }
  };

  const handleUpdate = async () => {
    if (!selectedBonus || !formData.positionName || !formData.amount) return;

    const amount = Number(formData.amount);
    if (amount < 0) {
      toast.error("Amount must be 0 or greater");
      return;
    }

    try {
      await api.patch(`/payroll-configuration/signing-bonuses/${selectedBonus._id}`, {
        positionName: formData.positionName,
        amount,
      });
      toast.success("Signing bonus updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchBonuses();
    } catch (error) {
      console.error("Failed to update signing bonus:", error);
      toast.error("Failed to update signing bonus");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this signing bonus?")) return;

    try {
      await api.delete(`/payroll-configuration/signing-bonuses/${id}`);
      toast.success("Signing bonus deleted successfully");
      fetchBonuses();
    } catch (error) {
      console.error("Failed to delete signing bonus:", error);
      toast.error("Failed to delete signing bonus");
    }
  };

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!selectedBonus) return;
    try {
      await api.patch(`/payroll-configuration/signing-bonuses/${selectedBonus._id}`, {
        status,
      });
      toast.success(`Signing bonus ${status} successfully`);
      setIsViewOpen(false);
      fetchBonuses();
    } catch (error) {
      console.error(`Failed to ${status} signing bonus:`, error);
      // @ts-ignore
      toast.error(error.response?.data?.message || `Failed to ${status} signing bonus`);
    }
  };

  const openEdit = (bonus: SigningBonus) => {
    setSelectedBonus(bonus);
    setFormData({
      positionName: bonus.positionName,
      amount: bonus.amount.toString(),
    });
    setIsEditOpen(true);
  };

  const openView = async (bonus: SigningBonus) => {
    try {
      const res = await api.get(`/payroll-configuration/signing-bonuses/${bonus._id}`);
      setSelectedBonus(res.data);
      setIsViewOpen(true);
    } catch (error) {
      setSelectedBonus(bonus);
      setIsViewOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({ positionName: "", amount: "" });
    setSelectedBonus(null);
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
            Signing Bonuses
          </h1>
          <p className="text-slate-400 mt-1">
            Manage onboarding signing bonuses by position
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
            Create Signing Bonus
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-white/5 border-white/10" />
          ))
        ) : bonuses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No signing bonuses found. Create one to get started.
          </div>
        ) : (
          bonuses.map((bonus) => (
            <Card
              key={bonus._id}
              className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-white truncate pr-4">
                  {bonus.positionName}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(bonus.status)} capitalize`}
                >
                  {bonus.status || "Draft"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Amount</p>
                  <div className="text-2xl font-bold text-slate-200">
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(bonus.amount)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openView(bonus)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(bonus)}
                  className="hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(bonus._id)}
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
            <DialogTitle>Create New Signing Bonus</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new signing bonus to the payroll configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="positionName">Position Name</Label>
              <Input
                id="positionName"
                value={formData.positionName}
                onChange={(e) =>
                  setFormData({ ...formData, positionName: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="e.g. Senior TA"
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
                min="0"
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
              Create Signing Bonus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Signing Bonus</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update details for {selectedBonus?.positionName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-positionName">Position Name</Label>
              <Input
                id="edit-positionName"
                value={formData.positionName}
                onChange={(e) =>
                  setFormData({ ...formData, positionName: e.target.value })
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
                min="0"
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
               Signing Bonus Details
               <Badge className={getStatusColor(selectedBonus?.status || '')}>
                 {selectedBonus?.status || 'Draft'}
               </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Position</label>
                   <p className="text-lg font-medium text-slate-200">{selectedBonus?.positionName}</p>
                </div>
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Amount</label>
                   <p className="text-2xl font-bold text-white">
                      {selectedBonus?.amount && new Intl.NumberFormat("en-US", {
                         minimumFractionDigits: 2,
                         maximumFractionDigits: 2,
                      }).format(selectedBonus.amount)}
                   </p>
                </div>
             </div>
             <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedBonus?.createdBy && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Created By</label>
                     <p className="text-sm text-slate-300">
                        {typeof selectedBonus.createdBy === 'object' 
                           ? `${selectedBonus.createdBy.firstName} ${selectedBonus.createdBy.lastName}` 
                           : 'Unknown'}
                     </p>
                  </div>
                )}
                {selectedBonus?.approvedBy && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Approved By</label>
                     <p className="text-sm text-slate-300">
                        {typeof selectedBonus.approvedBy === 'object' 
                           ? `${selectedBonus.approvedBy.firstName} ${selectedBonus.approvedBy.lastName}` 
                           : 'Unknown'}
                     </p>
                  </div>
                )}
                {selectedBonus?.approvedAt && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Approved At</label>
                     <p className="text-sm text-slate-300">
                        {new Date(selectedBonus.approvedAt).toLocaleString()}
                     </p>
                  </div>
                )}
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isPayrollManager && selectedBonus?.status === "draft" && (
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
              variant={isPayrollManager && selectedBonus?.status === "draft" ? "outline" : "default"}
              className={isPayrollManager && selectedBonus?.status === "draft" ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "w-full bg-slate-800 hover:bg-slate-700"}
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

