"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
  ArrowLeft,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Send,
  Download,
  Eye,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: string;
  entity: string;
  status: string;
  employees: number;
  exceptions: number;
  totalnetpay: number;
  createdAt: string;
}

interface EmployeeDetail {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  exceptions?: string;
  bankStatus: string;
}

export default function RunDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, currentRole } = useAuth();
  const runId = params.id as string;

  const [run, setRun] = useState<PayrollRun | null>(null);
  const [details, setDetails] = useState<EmployeeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [rejectDialog, setRejectDialog] = useState(false);
  const [unlockDialog, setUnlockDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [unlockReason, setUnlockReason] = useState("");

  const fetchRunData = async () => {
    try {
      setLoading(true);
      const [runRes, detailsRes] = await Promise.all([
        api.get(`/payroll-execution/${runId}`),
        api.get(`/payroll-execution/${runId}/details`),
      ]);
      setRun(runRes.data);
      setDetails(detailsRes.data);
    } catch (error) {
      console.error("Failed to fetch run data", error);
      toast.error("Failed to load payroll run details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (runId) {
      fetchRunData();
    }
  }, [runId]);

  const handleReview = async () => {
    try {
      setActionLoading(true);
      await api.post(`/payroll-execution/${runId}/review`);
      toast.success("Payroll reviewed successfully");
      fetchRunData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to review payroll");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!user?.id) return;
    try {
      setActionLoading(true);
      const endpoint =
        currentRole === "Payroll Manager"
          ? `/payroll-execution/${runId}/approvePayrollManager/${user.id}`
          : `/payroll-execution/${runId}/approveFinanceStaff/${user.id}`;
      await api.post(endpoint);
      toast.success("Payroll approved successfully");
      fetchRunData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to approve payroll"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user?.id || !rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      const endpoint =
        currentRole === "Payroll Manager"
          ? `/payroll-execution/${runId}/rejectPayrollManager/${user.id}`
          : `/payroll-execution/${runId}/rejectFinanceStaff/${user.id}`;
      await api.post(endpoint, { reason: rejectionReason });
      toast.success("Payroll rejected");
      setRejectDialog(false);
      setRejectionReason("");
      fetchRunData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reject payroll");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLock = async () => {
    if (!user?.id) return;
    try {
      setActionLoading(true);
      await api.post(`/payroll-execution/${runId}/lock`, {
        managerId: user.id,
      });
      toast.success("Payroll locked successfully");
      fetchRunData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to lock payroll");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!user?.id || !unlockReason.trim()) return;
    try {
      setActionLoading(true);
      await api.post(`/payroll-execution/${runId}/unlock`, {
        managerId: user.id,
        reason: unlockReason,
      });
      toast.success("Payroll unlocked successfully");
      setUnlockDialog(false);
      setUnlockReason("");
      fetchRunData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to unlock payroll");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevertToUnderReview = async () => {
    if (!user?.id) return;
    try {
      setActionLoading(true);
      await api.post(
        `/payroll-execution/${runId}/revertToUnderReview/${user.id}`
      );
      toast.success("Payroll run reverted to under review");
      fetchRunData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to revert payroll run"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecute = async () => {
    try {
      setActionLoading(true);
      await api.post(`/payroll-execution/${runId}/execute`);
      toast.success("Payroll executed - payments status updated to PAID");
      fetchRunData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to execute payroll"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "draft")
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    if (statusLower === "under review")
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (statusLower === "pending finance approval")
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (statusLower === "approved")
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (statusLower === "paid")
      return "bg-green-500/10 text-green-500 border-green-500/20";
    if (statusLower === "rejected")
      return "bg-red-500/10 text-red-500 border-red-500/20";
    if (statusLower === "locked")
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  const statusLower = run?.status?.toLowerCase() || "";

  const canReview =
    currentRole === "Payroll Specialist" &&
    (statusLower === "draft" || statusLower === "pending");

  const canManagerApprove =
    currentRole === "Payroll Manager" && statusLower === "under review";

  const canFinanceApprove =
    currentRole === "Finance Staff" &&
    statusLower === "pending finance approval";

  const canLock =
    currentRole === "Payroll Manager" && statusLower === "approved";

  const canUnlock =
    currentRole === "Payroll Manager" && statusLower === "locked";

  const canExecute =
    currentRole === "Payroll Specialist" && statusLower === "approved";

  const canRevert =
    currentRole === "Payroll Specialist" && statusLower === "rejected";

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading payroll run...</div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Payroll run not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/payroll/runs")}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("rounded-md w-fit", getStatusColor(run.status))}
                >
                  {run.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-slate-200 tracking-tight">
                Payroll Preview -{" "}
                {format(new Date(run.payrollPeriod), "MMMM yyyy")}
              </h1>
            </div>
            <p className="text-slate-400 mt-1">
              {run.entity} • {run.runId}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => {
              // In a real implementation, this would generate and download a PDF
              toast.success(`Downloading PDF for ${run.runId}...`);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => {
              // In a real implementation, this would generate and download an Excel file
              toast.success(`Downloading Excel for ${run.runId}...`);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>

          {canReview && (
            <Button
              onClick={handleReview}
              disabled={actionLoading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Review Payroll
            </Button>
          )}

          {(canManagerApprove || canFinanceApprove) && (
            <>
              <Button
                onClick={() => setRejectDialog(true)}
                disabled={actionLoading}
                variant="outline"
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          )}

          {canLock && (
            <Button
              onClick={handleLock}
              disabled={actionLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock Payroll
            </Button>
          )}

          {canUnlock && (
            <Button
              onClick={() => setUnlockDialog(true)}
              disabled={actionLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Unlock Payroll
            </Button>
          )}

          {canExecute && (
            <Button
              onClick={handleExecute}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Execute Payroll
            </Button>
          )}

          {canRevert && (
            <Button
              onClick={handleRevertToUnderReview}
              disabled={actionLoading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Revert to Under Review
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Gross
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-slate-200">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "EGP",
                  minimumFractionDigits: 0,
                }).format(
                  details.reduce(
                    (sum, d) => sum + d.baseSalary + d.allowances,
                    0
                  )
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Deductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-slate-200">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "EGP",
                  minimumFractionDigits: 0,
                }).format(details.reduce((sum, d) => sum + d.deductions, 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span className="text-2xl font-bold text-slate-200">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "EGP",
                  minimumFractionDigits: 0,
                }).format(run.totalnetpay)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="text-2xl font-bold text-slate-200">
                {run.employees}
              </span>
            </div>
          </CardContent>
        </Card>

        {run.exceptions > 0 && (
          <Card
            className="border-red-500/20 bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition-colors"
            onClick={() => router.push(`/payroll/exceptions?run=${runId}`)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-400">
                Exceptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-red-500">
                  {run.exceptions}
                </span>
                <span className="text-xs text-red-400 ml-2">Click to view</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Employee Payroll Details */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Employee Payroll Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/80">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Employee</TableHead>
                <TableHead className="text-right text-slate-400">
                  Base Salary
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  Allowances
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  Deductions
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  Net Pay
                </TableHead>
                <TableHead className="text-slate-400">Bank Status</TableHead>
                <TableHead className="text-slate-400">Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail) => (
                <TableRow
                  key={detail._id}
                  className="border-slate-800 hover:bg-slate-800/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 border border-slate-700">
                        {detail.employeeId.firstName?.[0]}
                        {detail.employeeId.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-300">
                          {detail.employeeId.firstName}{" "}
                          {detail.employeeId.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {detail.employeeId.employeeId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-300">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EGP",
                    }).format(detail.baseSalary)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-500">
                    +
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EGP",
                    }).format(detail.allowances)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-500">
                    -
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EGP",
                    }).format(detail.deductions)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono font-bold",
                      detail.netPay < 0 ? "text-red-500" : "text-emerald-500"
                    )}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EGP",
                    }).format(detail.netPay)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        detail.bankStatus === "missing"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}
                    >
                      {detail.bankStatus === "missing" ? "Missing" : "Valid"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {detail.exceptions ? (
                      <div className="flex flex-wrap gap-1">
                        {detail.exceptions.split(",").map((exc, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-red-500/10 text-red-500 border-red-500/20"
                          >
                            {exc.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Payroll Run</DialogTitle>
            <DialogDescription className="text-slate-400">
              Please provide a reason for rejecting this payroll run.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="bg-slate-800 border-slate-700 text-white"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock Dialog */}
      <Dialog open={unlockDialog} onOpenChange={setUnlockDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Unlock Payroll Run</DialogTitle>
            <DialogDescription className="text-slate-400">
              Please provide a reason for unlocking this payroll run.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Unlock Reason</Label>
              <Textarea
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Enter reason for unlocking..."
                className="bg-slate-800 border-slate-700 text-white"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnlockDialog(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={!unlockReason.trim() || actionLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Unlock Payroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
