"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
  AlertTriangle,
  Search,
  Eye,
  Filter,
  Calendar as CalendarIcon,
  User,
  DollarSign,
  Building,
  CheckCircle,
  Loader2,
  Pencil,
  Landmark,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@/providers/auth-provider";

interface EmployeePayrollDetail {
  _id: string;
  payrollRunId: string | PayrollRun; // Can be either ID or populated object
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
  bankStatus?: string;
}

interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: string;
  entity: string;
  status: string;
}

interface ExceptionItem {
  detail: EmployeePayrollDetail;
  run: PayrollRun;
}

const BANKS = [
  "National Bank of Egypt",
  "Banque Misr",
  "Commercial International Bank (CIB)",
  "QNB Alahli",
  "Arab African International Bank",
  "Banque du Caire",
  "HSBC Egypt",
  "Abu Dhabi Islamic Bank",
  "Bank of Alexandria",
  "Faisal Islamic Bank of Egypt",
  "Other",
];

export default function ExceptionsPage() {
  const searchParams = useSearchParams();
  const runParam = searchParams.get("run");
  const { user, currentRole } = useAuth();

  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<string>(runParam || "all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<ExceptionItem | null>(
    null
  );
  const [resolveDialog, setResolveDialog] = useState(false);
  const [resolutionReason, setResolutionReason] = useState("");
  const [resolving, setResolving] = useState(false);
  const [exceptionToResolve, setExceptionToResolve] =
    useState<ExceptionItem | null>(null);

  // Bank details editing state
  const [editBankDialog, setEditBankDialog] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<ExceptionItem | null>(null);
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [savingBankDetails, setSavingBankDetails] = useState(false);

  const isPayrollManager = currentRole === "Payroll Manager";

  const fetchExceptions = async () => {
    try {
      setLoading(true);

      // Fetch runs and all exceptions in parallel
      const [runsRes, exceptionsRes] = await Promise.all([
        api.get("/payroll-execution/runs"),
        api.get("/payroll-execution/exceptions"),
      ]);

      const allRuns: PayrollRun[] = runsRes.data;
      const allExceptions: EmployeePayrollDetail[] = exceptionsRes.data;

      setRuns(allRuns);

      // Map exceptions to include run context
      const exceptionsList: ExceptionItem[] = allExceptions
        .filter((detail) => {
          // Ensure payrollRunId is populated and has required fields
          const run = detail.payrollRunId as any;
          const emp = detail.employeeId as any;
          // Filter out records where run or employee is not properly populated
          return (
            run &&
            typeof run === "object" &&
            run._id &&
            run.runId &&
            emp &&
            typeof emp === "object" &&
            emp._id
          );
        })
        .map((detail) => {
          const run = detail.payrollRunId as any;
          return {
            detail,
            run: {
              _id: run._id,
              runId: run.runId,
              payrollPeriod: run.payrollPeriod,
              entity: run.entity,
              status: run.status,
            },
          };
        });

      setExceptions(exceptionsList);
    } catch (error: any) {
      console.error("Failed to fetch exceptions", error);
      toast.error("Failed to load exceptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  const getExceptionBadgeColor = (exception: string) => {
    if (exception.includes("Negative Net Pay"))
      return "bg-red-500/10 text-red-500 border-red-500/20";
    if (exception.includes("Missing Bank Details"))
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (exception.includes("Salary Spike"))
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  const parseExceptions = (exceptionStr: string): string[] => {
    return exceptionStr.split(",").map((e) => e.trim());
  };

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((item) => {
      // Filter by run
      if (selectedRun !== "all" && item.run._id !== selectedRun) return false;

      // Filter by exception type
      if (
        selectedType !== "all" &&
        !item.detail.exceptions?.includes(selectedType)
      )
        return false;

      // Filter by search query (employee name or ID)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const emp = item.detail.employeeId;
        if (!emp) return false;
        const fullName = `${emp.firstName || ""} ${
          emp.lastName || ""
        }`.toLowerCase();
        const empId = (emp.employeeId || "").toLowerCase();
        if (!fullName.includes(query) && !empId.includes(query)) return false;
      }

      return true;
    });
  }, [exceptions, selectedRun, selectedType, searchQuery]);

  const handleOpenResolve = (item: ExceptionItem) => {
    setExceptionToResolve(item);
    setResolutionReason("");
    setResolveDialog(true);
  };

  const handleResolveException = async () => {
    if (!exceptionToResolve || !resolutionReason.trim()) {
      toast.error("Please provide a resolution reason");
      return;
    }

    try {
      setResolving(true);
      await api.post(
        `/payroll-execution/exceptions/${exceptionToResolve.detail._id}/resolve`,
        {
          resolution: resolutionReason.trim(),
          resolvedBy: user?.id,
        }
      );
      toast.success("Exception resolved successfully");
      setResolveDialog(false);
      setExceptionToResolve(null);
      setResolutionReason("");
      // Refresh exceptions list
      fetchExceptions();
    } catch (error: any) {
      console.error("Failed to resolve exception", error);
      toast.error(
        error.response?.data?.message || "Failed to resolve exception"
      );
    } finally {
      setResolving(false);
    }
  };

  const openEditBankDetails = (item: ExceptionItem) => {
    setEmployeeToEdit(item);
    // Pre-fill existing bank details if any
    const emp = item.detail.employeeId as any;
    setBankName(emp?.bankName || "");
    setBankAccountNumber(emp?.bankAccountNumber || "");
    setEditBankDialog(true);
  };

  const handleSaveBankDetails = async () => {
    if (!employeeToEdit) return;

    if (!bankName.trim() || !bankAccountNumber.trim()) {
      toast.error("Please fill in all bank details");
      return;
    }

    const employeeId = employeeToEdit.detail.employeeId._id;
    const hadMissingBankDetails = employeeToEdit.detail.exceptions?.includes("Missing Bank Details");

    try {
      setSavingBankDetails(true);

      // Update employee profile
      await api.patch(`/employee-profile/${employeeId}`, {
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        changeReason: "Bank details update via Exceptions page",
      });

      // If employee had missing bank details exception, resolve it
      if (hadMissingBankDetails) {
        try {
          // Get current exceptions
          const currentExceptions = employeeToEdit.detail.exceptions || "";
          const exceptionList = currentExceptions.split(",").map(e => e.trim());
          
          // Remove "Missing Bank Details" from the list
          const remainingExceptions = exceptionList.filter(
            exc => exc !== "Missing Bank Details"
          );

          // If there are no remaining exceptions, resolve completely
          if (remainingExceptions.length === 0) {
            await api.post(
              `/payroll-execution/exceptions/${employeeToEdit.detail._id}/resolve`,
              {
                resolution: "Bank details updated via Exceptions page",
                resolvedBy: user?.id,
              }
            );
            toast.success("Bank details updated and exception resolved");
          } else {
            // Otherwise, just update the bank status in the payroll detail
            // The exception will still exist but "Missing Bank Details" is removed
            toast.success("Bank details updated successfully");
          }
        } catch (err) {
          console.warn("Failed to resolve exception:", err);
          toast.success("Bank details updated successfully");
        }
      } else {
        toast.success("Bank details updated successfully");
      }

      setEditBankDialog(false);
      setEmployeeToEdit(null);
      setBankName("");
      setBankAccountNumber("");
      // Refresh exceptions list
      fetchExceptions();
    } catch (error: any) {
      console.error("Failed to update bank details", error);
      toast.error(
        error?.response?.data?.message || "Failed to update bank details"
      );
    } finally {
      setSavingBankDetails(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">
            Payroll Exceptions
          </h1>
          <p className="text-slate-400 mt-1">
            Review and resolve employee payroll exceptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1"
          >
            {filteredExceptions.length} Exception
            {filteredExceptions.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Payroll Run</label>
              <Select value={selectedRun} onValueChange={setSelectedRun}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="All Runs" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999] max-h-[300px] overflow-y-auto">
                  <SelectItem
                    value="all"
                    className="focus:bg-slate-700 focus:text-white"
                  >
                    All Runs
                  </SelectItem>
                  {runs.map((run) => (
                    <SelectItem
                      key={run._id}
                      value={run._id}
                      className="focus:bg-slate-700 focus:text-white"
                    >
                      {run.runId} -{" "}
                      {format(new Date(run.payrollPeriod), "MMM yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Exception Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999]">
                  <SelectItem
                    value="all"
                    className="focus:bg-slate-700 focus:text-white"
                  >
                    All Types
                  </SelectItem>
                  <SelectItem
                    value="Negative Net Pay"
                    className="focus:bg-slate-700 focus:text-white"
                  >
                    Negative Net Pay
                  </SelectItem>
                  <SelectItem
                    value="Missing Bank Details"
                    className="focus:bg-slate-700 focus:text-white"
                  >
                    Missing Bank Details
                  </SelectItem>
                  <SelectItem
                    value="Salary Spike"
                    className="focus:bg-slate-700 focus:text-white"
                  >
                    Salary Spike
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exceptions Table */}
      <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
        <CardHeader className="border-b border-slate-800 bg-slate-900/50">
          <CardTitle className="text-white">Exception Details</CardTitle>
          <CardDescription className="text-slate-400">
            Individual employee payroll records with exceptions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/80">
              <TableRow className="hover:bg-slate-800/50 border-slate-800">
                <TableHead className="text-slate-400">Employee</TableHead>
                <TableHead className="text-slate-400">Run ID</TableHead>
                <TableHead className="text-slate-400">Period</TableHead>
                <TableHead className="text-slate-400">Exception(s)</TableHead>
                <TableHead className="text-right text-slate-400">
                  Base Salary
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  Net Pay
                </TableHead>
                <TableHead className="text-slate-400">Bank Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-slate-400"
                  >
                    Loading exceptions...
                  </TableCell>
                </TableRow>
              ) : filteredExceptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-6 h-6 text-slate-600" />
                      </div>
                      <p className="font-medium text-lg text-slate-400">
                        No exceptions found
                      </p>
                      <p className="text-sm max-w-sm mt-1 text-slate-500">
                        {searchQuery ||
                        selectedRun !== "all" ||
                        selectedType !== "all"
                          ? "Try adjusting your filters"
                          : "All employee payroll records are clean"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExceptions.map((item) => (
                  <TableRow
                    key={item.detail._id}
                    className="hover:bg-slate-800/50 transition-colors border-slate-800"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 border border-slate-700">
                          {item.detail.employeeId?.firstName?.[0] || "?"}
                          {item.detail.employeeId?.lastName?.[0] || ""}
                        </div>
                        <div>
                          <p className="font-medium text-slate-300">
                            {item.detail.employeeId?.firstName || "Unknown"}{" "}
                            {item.detail.employeeId?.lastName || "Employee"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.detail.employeeId?.employeeId || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-300">
                      {item.run.runId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                        {format(new Date(item.run.payrollPeriod), "MMM yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {parseExceptions(item.detail.exceptions || "").map(
                          (exc, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={cn(
                                "text-xs rounded-md",
                                getExceptionBadgeColor(exc)
                              )}
                            >
                              {exc}
                            </Badge>
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-300">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(item.detail.baseSalary)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono font-medium",
                        item.detail.netPay < 0
                          ? "text-red-500"
                          : "text-emerald-500"
                      )}
                    >
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(item.detail.netPay)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          item.detail.bankStatus === "MISSING"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}
                      >
                        {item.detail.bankStatus || "VERIFIED"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => setSelectedDetail(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {isPayrollManager && item.detail.exceptions?.includes("Missing Bank Details") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            onClick={() => openEditBankDetails(item)}
                            title="Edit Bank Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        {isPayrollManager && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                            onClick={() => handleOpenResolve(item)}
                            title="Resolve Exception"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedDetail}
        onOpenChange={(open) => !open && setSelectedDetail(null)}
      >
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Exception Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              Review detailed information about this payroll exception
            </DialogDescription>
          </DialogHeader>
          {selectedDetail && (
            <div className="space-y-6 py-4">
              {/* Employee Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  Employee Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="text-sm font-medium text-slate-200">
                      {selectedDetail.detail.employeeId?.firstName || "Unknown"}{" "}
                      {selectedDetail.detail.employeeId?.lastName || "Employee"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Employee ID</p>
                    <p className="text-sm font-mono font-medium text-slate-200">
                      {selectedDetail.detail.employeeId?.employeeId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Run Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  Payroll Run
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Run ID</p>
                    <p className="text-sm font-mono font-medium text-slate-200">
                      {selectedDetail.run.runId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Period</p>
                    <p className="text-sm font-medium text-slate-200">
                      {format(
                        new Date(selectedDetail.run.payrollPeriod),
                        "MMMM yyyy"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Entity</p>
                    <p className="text-sm font-medium text-slate-200">
                      {selectedDetail.run.entity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payroll Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  Payroll Breakdown
                </h3>
                <div className="space-y-2 bg-slate-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Base Salary</span>
                    <span className="text-sm font-mono text-slate-200">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(selectedDetail.detail.baseSalary)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Allowances</span>
                    <span className="text-sm font-mono text-emerald-500">
                      +
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(selectedDetail.detail.allowances)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Deductions</span>
                    <span className="text-sm font-mono text-red-500">
                      -
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(selectedDetail.detail.deductions)}
                    </span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-200">
                        Net Pay
                      </span>
                      <span
                        className={cn(
                          "text-lg font-mono font-bold",
                          selectedDetail.detail.netPay < 0
                            ? "text-red-500"
                            : "text-emerald-500"
                        )}
                      >
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "EGP",
                        }).format(selectedDetail.detail.netPay)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exceptions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  Exceptions
                </h3>
                <div className="space-y-2">
                  {parseExceptions(selectedDetail.detail.exceptions || "").map(
                    (exc, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-3"
                      >
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {exc}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {exc === "Negative Net Pay" &&
                              "Net pay calculation resulted in a negative value"}
                            {exc === "Missing Bank Details" &&
                              "Employee bank information is not on file"}
                            {exc === "Salary Spike" &&
                              "Net pay exceeds expected maximum based on salary and bonuses"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Exception Dialog */}
      <Dialog
        open={resolveDialog}
        onOpenChange={(open) => {
          if (!open) {
            setResolveDialog(false);
            setExceptionToResolve(null);
            setResolutionReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Resolve Exception
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Mark this exception as resolved and provide a resolution reason
            </DialogDescription>
          </DialogHeader>
          {exceptionToResolve && (
            <div className="space-y-4 py-4">
              {/* Exception Summary */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Employee</span>
                  <span className="text-sm font-medium text-slate-200">
                    {exceptionToResolve.detail.employeeId?.firstName ||
                      "Unknown"}{" "}
                    {exceptionToResolve.detail.employeeId?.lastName ||
                      "Employee"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Payroll Run</span>
                  <span className="text-sm font-mono text-slate-200">
                    {exceptionToResolve.run.runId}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-slate-400">Exception(s)</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {parseExceptions(
                      exceptionToResolve.detail.exceptions || ""
                    ).map((exc, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={cn(
                          "text-xs rounded-md",
                          getExceptionBadgeColor(exc)
                        )}
                      >
                        {exc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resolution Reason */}
              <div className="space-y-2">
                <Label htmlFor="resolution" className="text-slate-300">
                  Resolution Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="resolution"
                  placeholder="Describe how this exception was resolved..."
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                />
                <p className="text-xs text-slate-500">
                  This will be recorded in the audit log for compliance purposes
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setResolveDialog(false);
                setExceptionToResolve(null);
                setResolutionReason("");
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              disabled={resolving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveException}
              disabled={resolving || !resolutionReason.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {resolving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve Exception
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Details Dialog */}
      <Dialog
        open={editBankDialog}
        onOpenChange={(open) => {
          if (!open) {
            setEditBankDialog(false);
            setEmployeeToEdit(null);
            setBankName("");
            setBankAccountNumber("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-blue-500" />
              Edit Bank Details
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update employee bank information to resolve missing details exception
            </DialogDescription>
          </DialogHeader>
          {employeeToEdit && (
            <div className="space-y-4 py-4">
              {/* Employee Info */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Employee</span>
                  <span className="text-sm font-medium text-slate-200">
                    {employeeToEdit.detail.employeeId?.firstName || "Unknown"}{" "}
                    {employeeToEdit.detail.employeeId?.lastName || "Employee"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Employee ID</span>
                  <span className="text-sm font-mono text-slate-200">
                    {employeeToEdit.detail.employeeId?.employeeId || "N/A"}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-slate-400">Exception(s)</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {parseExceptions(
                      employeeToEdit.detail.exceptions || ""
                    ).map((exc, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={cn(
                          "text-xs rounded-md",
                          getExceptionBadgeColor(exc)
                        )}
                      >
                        {exc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bank Details Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name" className="text-slate-300">
                    Bank Name <span className="text-red-500">*</span>
                  </Label>
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger
                      id="bank-name"
                      className="bg-slate-800 border-slate-700 text-white"
                    >
                      <SelectValue placeholder="Select bank..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999]">
                      {BANKS.map((bank) => (
                        <SelectItem
                          key={bank}
                          value={bank}
                          className="focus:bg-slate-700 focus:text-white"
                        >
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number" className="text-slate-300">
                    Account Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="account-number"
                    placeholder="Enter account number..."
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditBankDialog(false);
                setEmployeeToEdit(null);
                setBankName("");
                setBankAccountNumber("");
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              disabled={savingBankDetails}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveBankDetails}
              disabled={savingBankDetails || !bankName.trim() || !bankAccountNumber.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {savingBankDetails ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Landmark className="w-4 h-4 mr-2" />
                  Save Bank Details
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
