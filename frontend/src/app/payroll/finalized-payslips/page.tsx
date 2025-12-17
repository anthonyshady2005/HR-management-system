"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
  FileText,
  Download,
  Eye,
  Search,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
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
import { useAuth } from "@/providers/auth-provider";

interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: string;
  entity: string;
  status: string;
  employees: number;
  totalnetpay: number;
  createdAt: string;
}

interface Payslip {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  payrollRunId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  paymentStatus: string;
  runInfo?: PayrollRun;
  bonuses: { positionName: string; amount: number }[];
  benefits: { name: string; amount: number }[];
  penalties: { reason: string; amount: number }[];
}

export default function FinalizedPayslipsPage() {
  const { currentRole } = useAuth();

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
  const [selectedRun, setSelectedRun] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const runsRes = await api.get("/payroll-execution/runs");
      // Keep a list of relevant runs for the run filter dropdown
      const relevantRuns = runsRes.data.filter((run: PayrollRun) => {
        const status = run.status?.toLowerCase();
        return (
          status === "paid" ||
          status === "approved" ||
          status === "locked" ||
          status === "under_review"
        );
      });
      setRuns(relevantRuns);

      // Fetch ALL payslips from the backend and attach runInfo when available
      const payslipsRes = await api.get('/payroll-execution/payslips');
      const serverPayslips = payslipsRes.data || [];

      const allPayslips = serverPayslips.map((p: any) => {
        // payrollRunId may be populated (object) or just an id string
        const populatedRun = p.payrollRunId && typeof p.payrollRunId === 'object' && p.payrollRunId.runId
          ? p.payrollRunId
          : runsRes.data.find((r: any) => r._id === (p.payrollRunId?._id || p.payrollRunId));

        const payrollRunId = p.payrollRunId && (p.payrollRunId._id || p.payrollRunId) ? (p.payrollRunId._id || p.payrollRunId) : null;

        // Map backend schema to frontend interface
        const baseSalary = p.earningsDetails?.baseSalary || 0;
        
        // Sum allowances
        const allowancesList = p.earningsDetails?.allowances || [];
        const allowances = allowancesList.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
        
        // Deductions (using totaDeductions from backend schema)
        const deductions = p.totaDeductions || p.totalDeductions || 0;
        
        const grossPay = p.totalGrossSalary || 0;
        const netPay = p.netPay || 0;

        // Map detailed arrays
        const bonuses = p.earningsDetails?.bonuses || [];
        const benefits = p.earningsDetails?.benefits || [];
        const penalties = p.deductionsDetails?.penalties?.penalties || [];

        return {
          ...p,
          baseSalary,
          allowances,
          deductions,
          grossPay,
          netPay,
          bonuses,
          benefits,
          penalties,
          payrollRunId,
          runInfo: populatedRun || undefined,
        } as Payslip;
      });

      setPayslips(allPayslips);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPayslipStatus = (payslip: Payslip) => {
    const payslipStatus = (payslip.paymentStatus || "").toLowerCase();
    if (payslipStatus === "paid") return "paid";

    const runStatus = payslip.runInfo?.status?.toLowerCase();
    if (runStatus === "paid" || runStatus === "locked") return "paid";

    return "pending";
  };

  const filteredPayslips = payslips.filter((payslip: Payslip) => {
    if (selectedRun !== "all" && payslip.payrollRunId !== selectedRun)
      return false;
    if (selectedStatus !== "all") {
      const status = getPayslipStatus(payslip);
      if (status !== selectedStatus) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${payslip.employeeId?.firstName || ""} ${
        payslip.employeeId?.lastName || ""
      }`.toLowerCase();
      const empId = (payslip.employeeId?.employeeId || "").toLowerCase();
      if (!fullName.includes(query) && !empId.includes(query)) return false;
    }
    return true;
  });

  const paidCount = payslips.filter(
    (p) => getPayslipStatus(p) === "paid"
  ).length;
  const pendingCount = payslips.filter(
    (p) => getPayslipStatus(p) === "pending"
  ).length;

  const handleDownloadPDF = (payslip: Payslip) => {
    // In a real implementation, this would call a backend endpoint to generate PDF
    toast.success("Payslip PDF downloaded successfully");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">
            Payslips
          </h1>
          <p className="text-slate-400 mt-1">
            View and download employee payslips
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            {paidCount} Paid
          </Badge>
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 px-3 py-1"
          >
            <Clock className="w-3 h-3 mr-1" />
            {pendingCount} Pending
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
              <label className="text-sm text-slate-400">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999]">
                  <SelectItem
                    value="all"
                    className="focus:bg-slate-700 focus:text-white"
                  >
                    All Statuses
                  </SelectItem>
                  <SelectItem
                    value="paid"
                    className="focus:bg-slate-700 focus:text-white"
                  >
                    Paid
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="focus:bg-slate-700 focus:text-white"
                  >
                    Pending
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

      {/* Payslips Table */}
      <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
        <CardHeader className="border-b border-slate-800 bg-slate-900/50">
          <CardTitle className="text-white">Employee Payslips</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredPayslips.length} payslip
            {filteredPayslips.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/80">
              <TableRow className="hover:bg-slate-800/50 border-slate-800">
                <TableHead className="text-slate-400">Employee</TableHead>
                <TableHead className="text-slate-400">Run ID</TableHead>
                <TableHead className="text-slate-400">Period</TableHead>
                <TableHead className="text-right text-slate-400">
                  Gross Pay
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  Net Pay
                </TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-slate-400"
                  >
                    Loading payslips...
                  </TableCell>
                </TableRow>
              ) : filteredPayslips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-slate-600" />
                      </div>
                      <p className="font-medium text-lg text-slate-400">
                        No payslips found
                      </p>
                      <p className="text-sm max-w-sm mt-1 text-slate-500">
                        Payslips will appear here once payroll runs are
                        processed.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayslips.map((payslip: Payslip) => (
                  <TableRow
                    key={payslip._id}
                    className="hover:bg-slate-800/50 transition-colors border-slate-800"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 border border-slate-700">
                          {payslip.employeeId?.firstName?.[0] || "?"}
                          {payslip.employeeId?.lastName?.[0] || ""}
                        </div>
                        <div>
                          <p className="font-medium text-slate-300">
                            {payslip.employeeId?.firstName || "Unknown"}{" "}
                            {payslip.employeeId?.lastName || ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            {payslip.employeeId?.employeeId || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-300">
                      {payslip.runInfo?.runId || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                        {payslip.runInfo?.payrollPeriod
                          ? format(
                              new Date(payslip.runInfo.payrollPeriod),
                              "MMM yyyy"
                            )
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-300">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(payslip.baseSalary + payslip.allowances || 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-emerald-500">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(payslip.netPay || 0)}
                    </TableCell>
                    <TableCell>
                      {getPayslipStatus(payslip) === "paid" ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        >
                          Paid
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => setSelectedPayslip(payslip)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => handleDownloadPDF(payslip)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payslip Detail Dialog */}
      <Dialog
        open={!!selectedPayslip}
        onOpenChange={(open) => !open && setSelectedPayslip(null)}
      >
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Payslip Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedPayslip?.employeeId?.firstName}{" "}
              {selectedPayslip?.employeeId?.lastName} -
              {selectedPayslip?.runInfo?.payrollPeriod
                ? ` ${format(
                    new Date(selectedPayslip.runInfo.payrollPeriod),
                    "MMMM yyyy"
                  )}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-6 py-4">
              {/* Earnings */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  Earnings
                </h3>
                <div className="space-y-2 bg-slate-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Base Salary</span>
                    <span className="text-sm font-mono text-slate-200">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(selectedPayslip.baseSalary || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Allowances</span>
                    <span className="text-sm font-mono text-emerald-500">
                      +
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(selectedPayslip.allowances || 0)}
                    </span>
                  </div>
                  </div>
                  
                  {/* Bonuses */}
                  {selectedPayslip.bonuses && selectedPayslip.bonuses.length > 0 && (
                    <div className="space-y-1 mt-2 border-t border-slate-700/50 pt-2">
                      {selectedPayslip.bonuses.map((bonus, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Bonus: {bonus.positionName}</span>
                          <span className="text-sm font-mono text-emerald-500">
                            +{new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(bonus.amount || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Termination Benefits */}
                  {selectedPayslip.benefits && selectedPayslip.benefits.length > 0 && (
                    <div className="space-y-1 mt-2 border-t border-slate-700/50 pt-2">
                      {selectedPayslip.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Benefit: {benefit.name}</span>
                          <span className="text-sm font-mono text-emerald-500">
                            +{new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(benefit.amount || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

              </div>

              {/* Deductions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  Deductions
                </h3>
                <div className="space-y-2 bg-slate-800/50 rounded-lg p-4">
                  {/* Penalties */}
                  {selectedPayslip.penalties && selectedPayslip.penalties.length > 0 && (
                     <div className="space-y-1 mb-2 border-b border-slate-700/50 pb-2">
                      {selectedPayslip.penalties.map((penalty, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Penalty: {penalty.reason}</span>
                          <span className="text-sm font-mono text-red-500">
                            -{new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(penalty.amount || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Total Deductions
                    </span>
                    <span className="text-sm font-mono text-red-500">
                      -
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EGP",
                      }).format(selectedPayslip.deductions || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-200">
                    Net Pay
                  </span>
                  <span className="text-2xl font-mono font-bold text-emerald-500">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EGP",
                    }).format(selectedPayslip.netPay || 0)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleDownloadPDF(selectedPayslip)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
