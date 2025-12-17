"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Calendar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SigningBonusItem {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  signingBonusId?: {
    _id: string;
    positionName: string;
    amount: number;
  };
  givenAmount: number;
  status: string;
  createdAt: string;
  paymentDate?: string;
}

interface TerminationBenefitItem {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  benefitId?: {
    _id: string;
    terminationType: string;
    amount: number;
  };
  givenAmount: number;
  status: string;
  createdAt: string;
  terminationId?: string;
}

export default function PendingItemsPage() {
  const { user, currentRole } = useAuth();

  // Role-based access control: Only Payroll Specialist, Payroll Manager, and Finance Staff can access this page
  if (currentRole !== "Payroll Specialist" && currentRole !== "Payroll Manager" && currentRole !== "Finance Staff") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold text-slate-200 mb-4">Unauthorized</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access this resource. Required roles: Payroll Specialist, Payroll Manager, or Finance Staff.
        </p>
      </div>
    );
  }

  const [signingBonuses, setSigningBonuses] = useState<SigningBonusItem[]>([]);
  const [terminationBenefits, setTerminationBenefits] = useState<
    TerminationBenefitItem[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      
      // Fetch employee assignments (not configuration templates)
      const [bonusesRes, benefitsRes] = await Promise.all([
        api.get("/payroll-execution/employee-signing-bonuses"),
        api.get("/payroll-execution/employee-termination-benefits")
      ]);

      // Filter for PENDING status only (case-insensitive)
      const bonuses = Array.isArray(bonusesRes.data)
        ? bonusesRes.data.filter((b: any) => b.status?.toUpperCase() === "PENDING")
        : [];
      const benefits = Array.isArray(benefitsRes.data)
        ? benefitsRes.data.filter((b: any) => b.status?.toUpperCase() === "PENDING")
        : [];

      setSigningBonuses(bonuses);
      setTerminationBenefits(benefits);
    } catch (error) {
      console.error("Failed to fetch pending items", error);
      toast.error("Failed to load pending items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const handleApprove = async () => {
    if (!selectedItem) return;

    try {
      setActionLoading(true);
      const endpoint =
        selectedItem.type === "bonus"
          ? `/payroll-execution/employee-signing-bonuses/${selectedItem.id}`
          : `/payroll-execution/employee-termination-benefits/${selectedItem.id}`;

      // Update status to approved (lowercase for backend compatibility)
      const payload = {
        status: "approved",
      };

      await api.put(endpoint, payload);
      toast.success(
        `${
          selectedItem.type === "bonus"
            ? "Signing bonus"
            : "Termination benefit"
        } approved successfully`
      );
      setApproveDialog(false);
      setSelectedItem(null);
      setReason("");
      fetchPendingItems();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !reason.trim()) return;

    try {
      setActionLoading(true);
      const endpoint =
        selectedItem.type === "bonus"
          ? `/payroll-execution/employee-signing-bonuses/${selectedItem.id}`
          : `/payroll-execution/employee-termination-benefits/${selectedItem.id}`;

      // Update status to rejected (lowercase for backend compatibility)
      const payload = {
        status: "rejected",
      };

      await api.put(endpoint, payload);
      toast.success(
        `${
          selectedItem.type === "bonus"
            ? "Signing bonus"
            : "Termination benefit"
        } rejected`
      );
      setRejectDialog(false);
      setSelectedItem(null);
      setReason("");
      fetchPendingItems();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "UNDER_REVIEW":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "PAID":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">
            Pending Items
          </h1>
          <p className="text-slate-400 mt-1">
            Review and approve signing bonuses and termination benefits before
            payroll processing
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-slate-400">
              {signingBonuses.length + terminationBenefits.length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bonuses" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger
            value="bonuses"
            className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            Signing Bonuses ({signingBonuses.length})
          </TabsTrigger>
          <TabsTrigger
            value="benefits"
            className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            Termination Benefits ({terminationBenefits.length})
          </TabsTrigger>
        </TabsList>

        {/* Signing Bonuses Tab */}
        <TabsContent value="bonuses">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-white">
                Signing Bonuses Pending Approval
              </CardTitle>
              <CardDescription className="text-slate-400">
                Review and approve signing bonuses before they are included in
                payroll
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Employee</TableHead>
                    <TableHead className="text-right text-slate-400">
                      Amount
                    </TableHead>
                    <TableHead className="text-slate-400">
                      Effective Date
                    </TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Created</TableHead>
                    {currentRole === "Payroll Specialist" && (
                      <TableHead className="text-right text-slate-400">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={currentRole === "Payroll Specialist" ? 6 : 5}
                        className="h-24 text-center text-slate-400"
                      >
                        Loading pending bonuses...
                      </TableCell>
                    </TableRow>
                  ) : signingBonuses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={currentRole === "Payroll Specialist" ? 6 : 5} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CheckCircle className="w-8 h-8 text-slate-600 mb-2" />
                          <p className="text-sm">No pending signing bonuses</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    signingBonuses.map((bonus) => (
                      <TableRow
                        key={bonus._id}
                        className="border-slate-800 hover:bg-slate-800/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 border border-slate-700">
                              {bonus.employeeId?.firstName?.[0] || "?"}
                              {bonus.employeeId?.lastName?.[0] || ""}
                            </div>
                            <div>
                              <p className="font-medium text-slate-300">
                                {bonus.employeeId?.firstName || "Unknown"}{" "}
                                {bonus.employeeId?.lastName || ""}
                              </p>
                              <p className="text-xs text-slate-500">
                                {bonus.signingBonusId?.positionName ||
                                  bonus.employeeId?.employeeId ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-500">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "EGP",
                          }).format(bonus.givenAmount || 0)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {bonus.paymentDate
                            ? format(
                                new Date(bonus.paymentDate),
                                "MMM dd, yyyy"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getStatusColor(bonus.status)
                            )}
                          >
                            {bonus.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {bonus.createdAt
                            ? format(new Date(bonus.createdAt), "MMM dd, yyyy")
                            : "-"}
                        </TableCell>
                        {currentRole === "Payroll Specialist" && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem({
                                    id: bonus._id,
                                    type: "bonus",
                                  });
                                  setRejectDialog(true);
                                }}
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10 h-8"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedItem({
                                    id: bonus._id,
                                    type: "bonus",
                                  });
                                  setApproveDialog(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Termination Benefits Tab */}
        <TabsContent value="benefits">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-white">
                Termination Benefits Pending Approval
              </CardTitle>
              <CardDescription className="text-slate-400">
                Review and approve termination/resignation benefits before they
                are included in payroll
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Employee</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-right text-slate-400">
                      Benefit Amount
                    </TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Created</TableHead>
                    <TableHead className="text-right text-slate-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={currentRole === "Payroll Specialist" ? 7 : 6}
                        className="h-24 text-center text-slate-400"
                      >
                        Loading pending benefits...
                      </TableCell>
                    </TableRow>
                  ) : terminationBenefits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={currentRole === "Payroll Specialist" ? 7 : 6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CheckCircle className="w-8 h-8 text-slate-600 mb-2" />
                          <p className="text-sm">
                            No pending termination benefits
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    terminationBenefits.map((benefit) => (
                      <TableRow
                        key={benefit._id}
                        className="border-slate-800 hover:bg-slate-800/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 border border-slate-700">
                              {benefit.employeeId?.firstName?.[0] || "?"}
                              {benefit.employeeId?.lastName?.[0] || ""}
                            </div>
                            <div>
                              <p className="font-medium text-slate-300">
                                {benefit.employeeId?.firstName || "Unknown"}{" "}
                                {benefit.employeeId?.lastName || ""}
                              </p>
                              <p className="text-xs text-slate-500">
                                {benefit.employeeId?.employeeId || "N/A"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              benefit.benefitId?.terminationType ===
                                "RESIGNATION"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                            )}
                          >
                            {benefit.benefitId?.terminationType || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-500">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "EGP",
                          }).format(benefit.givenAmount || 0)}
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm">
                          {benefit.createdAt
                            ? format(
                                new Date(benefit.createdAt),
                                "MMM dd, yyyy"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getStatusColor(benefit.status)
                            )}
                          >
                            {benefit.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {benefit.createdAt
                            ? format(new Date(benefit.createdAt), "MMM dd, yyyy")
                            : "-"}
                        </TableCell>
                        {currentRole === "Payroll Specialist" && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem({
                                    id: benefit._id,
                                    type: "benefit",
                                  });
                                  setRejectDialog(true);
                                }}
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10 h-8"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedItem({
                                    id: benefit._id,
                                    type: "benefit",
                                  });
                                  setApproveDialog(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">
              Approve{" "}
              {selectedItem?.type === "bonus"
                ? "Signing Bonus"
                : "Termination Benefit"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to approve this item? It will be included in
              the next payroll run.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Notes (Optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add any notes or comments..."
                className="bg-slate-800 border-slate-700 text-white"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialog(false);
                setReason("");
              }}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">
              Reject{" "}
              {selectedItem?.type === "bonus"
                ? "Signing Bonus"
                : "Termination Benefit"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Please provide a reason for rejecting this item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Rejection Reason *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="bg-slate-800 border-slate-700 text-white"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog(false);
                setReason("");
              }}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!reason.trim() || actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
