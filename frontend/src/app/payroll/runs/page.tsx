"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Eye,
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Building,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: string;
  entity: string;
  status: string;
  employees: number;
  exceptions: number;
  totalnetpay: number;
  payrollSpecialistId?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
}

export default function RunsPage() {
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

  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);

  // Check if current active role is Payroll Specialist (for button visibility)
  const isPayrollSpecialist = currentRole === 'Payroll Specialist';
  
  // Form State
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [period, setPeriod] = useState<Date | undefined>(new Date());

  // Period Approval State (Frontend-Only Workflow per REQ-PY-24)
  const [periodApproved, setPeriodApproved] = useState(false);
  const [showPeriodReview, setShowPeriodReview] = useState(false);

  // Pending Items State
  const [pendingItems, setPendingItems] = useState<{ pendingBonuses: number; pendingBenefits: number } | null>(null);
  const [checkingPending, setCheckingPending] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch runs & departments in parallel
      const [runsRes, depsRes] = await Promise.all([
        api.get("/payroll-execution/runs"),
        api.get("/payroll-execution/departments"),
      ]);
      setRuns(runsRes.data);
      setDepartments(depsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check for pending items when dialog opens
  useEffect(() => {
    const checkPendingItems = async () => {
      if (!isCreateOpen) {
        // Optional: clear pending items when closed, or keep them cached
        return;
      }

      try {
        setCheckingPending(true);
        const res = await api.get(`/payroll-execution/pending-payroll-items`);
        setPendingItems(res.data);
      } catch (error) {
        console.error("Failed to check pending items", error);
      } finally {
        setCheckingPending(false);
      }
    };

    checkPendingItems();
  }, [isCreateOpen]);

  // REQ-PY-4: Auto-generate draft payroll runs
  const handleAutoGenerate = async () => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setAutoGenerating(true);
      const response = await api.post(
        "/payroll-execution/auto-generate-drafts",
        {
          triggeredBy: user.id,
        }
      );

      const result = response.data;
      toast.success(result.message || "Auto-generate completed");

      // Refresh the runs list
      fetchData();
    } catch (error: any) {
      console.error("Auto-generate failed", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to auto-generate draft payrolls"
      );
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedDepartment || !period || !user?.id) return;

    try {
      setCreating(true);
      const dept = departments.find((d) => d._id === selectedDepartment);

      const payload = {
        period: period.toISOString(),
        entity: dept?.name || "Unknown Entity",
        primaryDepartmentId: selectedDepartment,
        payrollSpecialistId: user.id,
        payrollManagerId: user.id,
      };

      await api.post("/payroll-execution/initiate", payload);

      setIsCreateOpen(false);
      fetchData(); // Refresh list
      // Reset form
      setSelectedDepartment("");
      setPeriod(new Date());
      toast.success("Payroll run initiated successfully");
    } catch (error: any) {
      console.error("Create failed", error);
      toast.error(
        error?.response?.data?.message || "Failed to initiate payroll run"
      );
    } finally {
      setCreating(false);
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
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (statusLower === "rejected")
      return "bg-red-500/10 text-red-500 border-red-500/20";
    if (statusLower === "locked")
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">
            Payroll Runs
          </h1>
          <p className="text-slate-400 mt-1">
            Manage and monitor payroll execution cycles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <FileText className="w-4 h-4" />
            Export Reports
          </Button>
          {isPayrollSpecialist && (
            <>
              <Button
                variant="outline"
                className="gap-2 border-amber-700 text-amber-400 hover:bg-amber-900/30 hover:text-amber-300"
                onClick={handleAutoGenerate}
                disabled={autoGenerating}
              >
                <Wand2 className="w-4 h-4" />
                {autoGenerating ? "Generating..." : "Auto-Generate Drafts"}
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-900/20">
                    <Plus className="w-4 h-4" />
                    Create Payroll Run
                  </Button>
                </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-200">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {showPeriodReview
                    ? "Review Payroll Period"
                    : "Initiate Payroll Run"}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {showPeriodReview
                    ? "Review and approve the payroll period before creating the run."
                    : "Start a new payroll cycle for a specific department and period."}
                </DialogDescription>
              </DialogHeader>

              {!showPeriodReview ? (
                <>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="department" className="text-slate-300">
                        Department
                      </Label>
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999]">
                          {departments.map((dept) => (
                            <SelectItem
                              key={dept._id}
                              value={dept._id}
                              className="focus:bg-slate-700 focus:text-white"
                            >
                              {dept.name} ({dept.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Period</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
                              !period && "text-slate-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {period ? (
                              format(period, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-slate-900 border-slate-800"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={period}
                            onSelect={(date) => {
                              setPeriod(date);
                              setPeriodApproved(false); // Reset approval when period changes
                            }}
                            initialFocus
                            className="bg-slate-900 text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-slate-500">
                        The selected date determines the payroll month.
                      </p>
                    </div>

                    {/* Pending Items Warning */}
                    {pendingItems && (pendingItems.pendingBonuses > 0 || pendingItems.pendingBenefits > 0) && (
                      <div className="p-3 rounded-lg border bg-red-500/10 border-red-500/30">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                          <div className="text-sm text-red-500">
                            <strong>Cannot Initiate Payroll:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {pendingItems.pendingBonuses > 0 && (
                                <li>{pendingItems.pendingBonuses} pending signing bonus(es)</li>
                              )}
                              {pendingItems.pendingBenefits > 0 && (
                                <li>{pendingItems.pendingBenefits} pending termination benefit(s)</li>
                              )}
                            </ul>
                            <p className="mt-1 text-xs text-red-400">
                              Please resolve these items before continuing.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Period Approval Status */}
                    {selectedDepartment && period && (
                      <div
                        className={cn(
                          "p-3 rounded-lg border",
                          periodApproved
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-yellow-500/10 border-yellow-500/30"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {periodApproved ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span
                            className={
                              periodApproved
                                ? "text-emerald-400"
                                : "text-yellow-400"
                            }
                          >
                            {periodApproved
                              ? "Period approved - Ready to create run"
                              : "Period must be reviewed and approved"}
                          </span>
                        </div>
                        {!periodApproved && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                            onClick={() => setShowPeriodReview(true)}
                          >
                            Review Period
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setPeriodApproved(false);
                        setShowPeriodReview(false);
                      }}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={
                        creating ||
                        !selectedDepartment ||
                        !period ||
                        !periodApproved ||
                        !!(pendingItems && (pendingItems.pendingBonuses > 0 || pendingItems.pendingBenefits > 0)) ||
                        checkingPending
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                    >
                      {creating ? "Initiating..." : "Create Payroll Run"}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  {/* Period Review Screen */}
                  <div className="py-4 space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Department</span>
                        <span className="text-white font-medium">
                          {departments.find((d) => d._id === selectedDepartment)
                            ?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Payroll Period</span>
                        <span className="text-white font-medium">
                          {period ? format(period, "MMMM yyyy") : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Pay Date</span>
                        <span className="text-white font-medium">
                          End of{" "}
                          {period ? format(period, "MMMM yyyy") : "month"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm text-blue-400">
                        <strong>Note:</strong> By approving this period, you
                        confirm that:
                      </p>
                      <ul className="text-sm text-blue-300 mt-2 space-y-1 list-disc list-inside">
                        <li>The payroll period is correct</li>
                        <li>All pending Phase 0 items have been reviewed</li>
                        <li>The department selection is accurate</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPeriodReview(false)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Back
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPeriodApproved(false);
                        setShowPeriodReview(false);
                        toast.info(
                          "Period rejected. Please select a different period."
                        );
                      }}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Period
                    </Button>
                    <Button
                      onClick={() => {
                        setPeriodApproved(true);
                        setShowPeriodReview(false);
                        toast.success(
                          "Period approved! You can now create the payroll run."
                        );
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Period
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
            </>
          )}
        </div>
      </div>

      {/* content */}
      <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
        <CardHeader className="border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">All Runs</CardTitle>
              <CardDescription className="text-slate-400">
                View status and details of all payroll executions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search runs..."
                  className="pl-9 w-[250px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/80">
              <TableRow className="hover:bg-slate-800/50 border-slate-800">
                <TableHead className="w-[120px] text-slate-400">
                  Run ID
                </TableHead>
                <TableHead className="text-slate-400">Period</TableHead>
                <TableHead className="text-slate-400">Entity</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-right text-slate-400">
                  Employees
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  Exceptions
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  Total Net Pay
                </TableHead>
                <TableHead className="text-slate-400">Created By</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-slate-400"
                  >
                    Loading payroll runs...
                  </TableCell>
                </TableRow>
              ) : runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-slate-600" />
                      </div>
                      <p className="font-medium text-lg text-slate-400">
                        No payroll runs found
                      </p>
                      <p className="text-sm max-w-sm mt-1 text-slate-500">
                        Start by clicking "Create Payroll Run" to initiate a new
                        payroll cycle.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => (
                  <TableRow
                    key={run._id}
                    className="hover:bg-slate-800/50 transition-colors border-slate-800"
                  >
                    <TableCell className="font-medium text-slate-300">
                      {run.runId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                        {format(new Date(run.payrollPeriod), "MMMM yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Building className="w-4 h-4 text-slate-500" />
                        {run.entity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-md px-2 py-0.5 border",
                          getStatusColor(run.status)
                        )}
                      >
                        {run.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-300">
                      {run.employees}
                    </TableCell>
                    <TableCell className="text-right">
                      {run.exceptions > 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/payroll/exceptions?run=${run._id}`;
                          }}
                        >
                          {run.exceptions} Issues
                        </Badge>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-emerald-500">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(run.totalnetpay)}
                    </TableCell>
                    <TableCell>
                      {run.payrollSpecialistId &&
                      typeof run.payrollSpecialistId === "object" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 border border-slate-700">
                            {run.payrollSpecialistId.firstName?.[0]}
                            {run.payrollSpecialistId.lastName?.[0]}
                          </div>
                          <span className="text-sm text-slate-400">
                            {run.payrollSpecialistId.firstName}{" "}
                            {run.payrollSpecialistId.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">System</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() =>
                          (window.location.href = `/payroll/runs/${run._id}`)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
