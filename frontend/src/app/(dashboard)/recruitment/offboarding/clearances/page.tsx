"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Laptop,
  DollarSign,
  Building2,
  User,
  Shield,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { offboardingApi } from "@/lib/recruitment-api";
import { useAuth } from "@/providers/auth-provider";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PendingClearance {
  terminationId: string;
  terminationRequest: any;
  checklistId: string;
  pendingItems: Array<{
    department: string;
    status: string;
    comments?: string;
  }>;
}

export default function ClearancesPage() {
  const router = useRouter();
  const { currentRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clearances, setClearances] = useState<PendingClearance[]>([]);
  const [approving, setApproving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    terminationId: string;
    department: string;
  } | null>(null);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null);
  const [comments, setComments] = useState("");

  useEffect(() => {
    loadPendingClearances();
  }, []);

  const loadPendingClearances = async () => {
    try {
      setLoading(true);
      const data = await offboardingApi.getPendingClearances();
      setClearances(data);
    } catch (error) {
      console.error("Error loading pending clearances:", error);
      toast.error("Failed to load pending clearances");
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "IT":
        return <Laptop className="w-5 h-5" />;
      case "Finance":
        return <DollarSign className="w-5 h-5" />;
      case "Facilities":
        return <Building2 className="w-5 h-5" />;
      case "Line Manager":
        return <User className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const handleApproveClick = (terminationId: string, department: string) => {
    setSelectedItem({ terminationId, department });
    setApprovalAction("approve");
    setComments("");
  };

  const handleRejectClick = (terminationId: string, department: string) => {
    setSelectedItem({ terminationId, department });
    setApprovalAction("reject");
    setComments("");
  };

  const handleApproveReject = async () => {
    if (!selectedItem || !approvalAction) return;

    try {
      setApproving(true);
      await offboardingApi.updateClearanceItem(selectedItem.terminationId, selectedItem.department, {
        status: approvalAction === "approve" ? "approved" : "rejected",
        comments: comments || undefined,
      });

      toast.success(
        `Clearance item ${approvalAction === "approve" ? "approved" : "rejected"} successfully`
      );
      setSelectedItem(null);
      setApprovalAction(null);
      setComments("");
      await loadPendingClearances();
    } catch (error: any) {
      console.error("Error updating clearance item:", error);
      toast.error(
        error?.response?.data?.message || `Failed to ${approvalAction} clearance item`
      );
    } finally {
      setApproving(false);
    }
  };

  const getEmployeeName = (employee: any): string => {
    if (!employee) return "Unknown Employee";
    if (typeof employee === "object") {
      return (
        employee.fullName ||
        `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
        employee.employeeNumber ||
        "Unknown Employee"
      );
    }
    return "Unknown Employee";
  };

  if (loading) {
    return (
      <ProtectedRoute
        allowedRoles={[
          "HR Manager",
          "HR Admin",
          "System Admin",
          "Finance Staff",
          "Payroll Manager",
          "Payroll Specialist",
          "department head",
        ]}
      >
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      allowedRoles={[
        "HR Manager",
        "HR Admin",
        "System Admin",
        "Finance Staff",
        "Payroll Manager",
        "Payroll Specialist",
        "department head",
      ]}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Pending Clearances</h1>
            <p className="text-slate-400 text-sm mt-1">
              Approve or reject clearance items assigned to your department
            </p>
          </div>
          <Button
            onClick={loadPendingClearances}
            variant="outline"
            size="sm"
            className="border-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Clearances List */}
        {clearances.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400 opacity-50" />
            <p className="text-slate-400 text-lg">No pending clearances</p>
            <p className="text-slate-500 text-sm mt-2">
              All clearance items assigned to you have been processed
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {clearances.map((clearance) => (
              <div
                key={clearance.terminationId}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                {/* Termination Request Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {getEmployeeName(clearance.terminationRequest?.employeeId)}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Termination Request ID: {clearance.terminationId.slice(-8)}
                    </p>
                    {clearance.terminationRequest?.reason && (
                      <p className="text-slate-500 text-sm mt-1">
                        Reason: {clearance.terminationRequest.reason}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/recruitment/offboarding/terminations/${clearance.terminationId}`}
                  >
                    <Button variant="outline" size="sm" className="border-white/10">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Pending Items */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                    Pending Clearance Items
                  </h3>
                  {clearance.pendingItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        {getDepartmentIcon(item.department)}
                        <div>
                          <p className="text-white font-medium">{item.department}</p>
                          {item.comments && (
                            <p className="text-slate-400 text-sm mt-1">{item.comments}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                        <Button
                          onClick={() => handleApproveClick(clearance.terminationId, item.department)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectClick(clearance.terminationId, item.department)}
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval/Rejection Dialog */}
        <Dialog
          open={selectedItem !== null && approvalAction !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedItem(null);
              setApprovalAction(null);
              setComments("");
            }
          }}
        >
          <DialogContent className="bg-slate-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {approvalAction === "approve" ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                {approvalAction === "approve"
                  ? "Approve Clearance Item"
                  : "Reject Clearance Item"}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {approvalAction === "approve"
                  ? `Approve the ${selectedItem?.department} clearance item for this termination request?`
                  : `Reject the ${selectedItem?.department} clearance item for this termination request?`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Comments {approvalAction === "reject" && "(Required)"}
                </Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    approvalAction === "approve"
                      ? "Add any comments or notes (optional)"
                      : "Please provide a reason for rejection"
                  }
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  required={approvalAction === "reject"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItem(null);
                  setApprovalAction(null);
                  setComments("");
                }}
                className="border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveReject}
                disabled={approving || (approvalAction === "reject" && !comments.trim())}
                className={
                  approvalAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {approving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : approvalAction === "approve" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}

