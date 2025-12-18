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

// Types
interface PayGrade {
  _id: string;
  grade: string;
  baseSalary: number;
  grossSalary: number;
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

interface PayGradeFormData {
  grade: string;
  baseSalary: string; // Handle input as string then convert
}

export default function PayGradesPage() {
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

  const [payGrades, setPayGrades] = useState<PayGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPayGrade, setSelectedPayGrade] = useState<PayGrade | null>(null);

  const isPayrollManager = currentRole === "Payroll Manager";

  // Form states
  const [formData, setFormData] = useState<PayGradeFormData>({
    grade: "",
    baseSalary: "",
  });

  // Fetch Pay Grades
  const fetchPayGrades = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll-configuration/pay-grades");
      setPayGrades(res.data);
    } catch (error) {
      console.error("Failed to fetch pay grades:", error);
      toast.error("Failed to fetch pay grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayGrades();
  }, []);

  // Handlers
  const handleCreate = async () => {
    if (!formData.grade || !formData.baseSalary) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await api.post("/payroll-configuration/pay-grades", {
        grade: formData.grade,
        baseSalary: Number(formData.baseSalary),
      });
      toast.success("Pay Grade created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchPayGrades();
    } catch (error) {
      console.error("Failed to create pay grade:", error);
      toast.error("Failed to create pay grade");
    }
  };

  const handleUpdate = async () => {
    if (!selectedPayGrade || !formData.grade || !formData.baseSalary) return;

    try {
      await api.patch(`/payroll-configuration/pay-grades/${selectedPayGrade._id}`, {
        grade: formData.grade,
        baseSalary: Number(formData.baseSalary),
      });
      toast.success("Pay Grade updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchPayGrades();
    } catch (error) {
      console.error("Failed to update pay grade:", error);
      toast.error("Failed to update pay grade");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pay grade?")) return;

    try {
      await api.delete(`/payroll-configuration/pay-grades/${id}`);
      toast.success("Pay Grade deleted successfully");
      fetchPayGrades();
    } catch (error) {
      console.error("Failed to delete pay grade:", error);
      toast.error("Failed to delete pay grade");
    }
  };

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!selectedPayGrade) return;
    try {
      await api.patch(`/payroll-configuration/pay-grades/${selectedPayGrade._id}`, {
        status,
      });
      toast.success(`Pay Grade ${status} successfully`);
      setIsViewOpen(false);
      fetchPayGrades();
    } catch (error) {
      console.error(`Failed to ${status} pay grade:`, error);
      // @ts-ignore
      toast.error(error.response?.data?.message || `Failed to ${status} pay grade`);
    }
  };

  const openEdit = (payGrade: PayGrade) => {
    setSelectedPayGrade(payGrade);
    setFormData({
      grade: payGrade.grade,
      baseSalary: payGrade.baseSalary.toString(),
    });
    setIsEditOpen(true);
  };

  const openView = async (payGrade: PayGrade) => {
    try {
       const res = await api.get(`/payroll-configuration/pay-grades/${payGrade._id}`);
       setSelectedPayGrade(res.data);
       setIsViewOpen(true);
    } catch (error) {
        setSelectedPayGrade(payGrade);
        setIsViewOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({ grade: "", baseSalary: "" });
    setSelectedPayGrade(null);
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
            Pay Grades
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your employee pay grades and salary structures
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
            Create Pay Grade
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
        ) : payGrades.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No pay grades found. Create one to get started.
          </div>
        ) : (
          payGrades.map((payGrade) => (
            <Card
              key={payGrade._id}
              className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-white truncate pr-4">
                  {payGrade.grade}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(payGrade.status)} capitalize`}
                >
                  {payGrade.status || "Draft"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Base Salary</p>
                    <div className="text-2xl font-bold text-slate-200">
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(payGrade.baseSalary)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Gross Salary</p>
                    <div className="text-lg font-semibold text-emerald-400">
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(payGrade.grossSalary)}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openView(payGrade)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(payGrade)}
                  className="hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(payGrade._id)}
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
            <DialogTitle>Create New Pay Grade</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new pay grade to the payroll configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="e.g. Senior Developer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="baseSalary">Base Salary</Label>
              <Input
                id="baseSalary"
                type="number"
                value={formData.baseSalary}
                onChange={(e) =>
                  setFormData({ ...formData, baseSalary: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
                placeholder="6000.00"
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
              Create Pay Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pay Grade</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update details for {selectedPayGrade?.grade}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-grade">Grade</Label>
              <Input
                id="edit-grade"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-baseSalary">Base Salary</Label>
              <Input
                id="edit-baseSalary"
                type="number"
                value={formData.baseSalary}
                onChange={(e) =>
                  setFormData({ ...formData, baseSalary: e.target.value })
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
               Pay Grade Details
               <Badge className={getStatusColor(selectedPayGrade?.status || '')}>
                 {selectedPayGrade?.status || 'Draft'}
               </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Grade</label>
                   <p className="text-lg font-medium text-slate-200">{selectedPayGrade?.grade}</p>
                </div>
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Base Salary</label>
                   <p className="text-2xl font-bold text-white">
                      {selectedPayGrade?.baseSalary && new Intl.NumberFormat("en-US", {
                         minimumFractionDigits: 2,
                         maximumFractionDigits: 2,
                      }).format(selectedPayGrade.baseSalary)}
                   </p>
                </div>
                <div>
                   <label className="text-xs text-slate-500 uppercase tracking-wider">Gross Salary</label>
                   <p className="text-xl font-bold text-slate-300">
                      {selectedPayGrade?.grossSalary && new Intl.NumberFormat("en-US", {
                         minimumFractionDigits: 2,
                         maximumFractionDigits: 2,
                      }).format(selectedPayGrade.grossSalary)}
                   </p>
                </div>
             </div>
             <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedPayGrade?.createdBy && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Created By</label>
                     <p className="text-sm text-slate-300">
                        {typeof selectedPayGrade.createdBy === 'object' 
                           ? `${selectedPayGrade.createdBy.firstName} ${selectedPayGrade.createdBy.lastName}` 
                           : 'Unknown'}
                     </p>
                  </div>
                )}
                {selectedPayGrade?.approvedBy && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Approved By</label>
                     <p className="text-sm text-slate-300">
                        {typeof selectedPayGrade.approvedBy === 'object' 
                           ? `${selectedPayGrade.approvedBy.firstName} ${selectedPayGrade.approvedBy.lastName}` 
                           : 'Unknown'}
                     </p>
                  </div>
                )}
                {selectedPayGrade?.approvedAt && (
                  <div>
                     <label className="text-xs text-slate-500 uppercase tracking-wider">Approved At</label>
                     <p className="text-sm text-slate-300">
                        {new Date(selectedPayGrade.approvedAt).toLocaleString()}
                     </p>
                  </div>
                )}
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isPayrollManager && selectedPayGrade?.status === "draft" && (
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
              variant={isPayrollManager && selectedPayGrade?.status === "draft" ? "outline" : "default"}
              className={isPayrollManager && selectedPayGrade?.status === "draft" ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "w-full bg-slate-800 hover:bg-slate-700"}
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
