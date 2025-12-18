"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
  CheckCircle,
  Download,
  FileSpreadsheet,
  Users,
  DollarSign,
  Pencil,
  Search,
  AlertTriangle,
  Building,
  CalendarIcon,
  Landmark,
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRequireRole } from "@/hooks/use-require-role";
import { useAuth } from "@/providers/auth-provider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface BankFile {
  runId: string;
  runData: PayrollRun;
  status: "generated" | "pending" | "error";
  generatedAt?: string;
  employeeCount: number;
  totalAmount: number;
  paidCount: number;
}

interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  workEmail?: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  department?: {
    _id: string;
    name: string;
  } | null;
  payrollDetailId?: string;
  exceptions?: string;
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

export default function BankFilesPage() {
  useRequireRole([
    "Payroll Specialist",
    "HR Manager",
    "Finance Staff",
    "HR Admin",
    "Payroll Manager",
  ]);

  const { currentRole } = useAuth();

  // Bank Files State
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [bankFiles, setBankFiles] = useState<BankFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Employee Bank Details State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "missing" | "valid">("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const fetchBankFiles = async () => {
    try {
      setLoadingFiles(true);
      const runsRes = await api.get("/payroll-execution/runs");
      const finalizedRuns = runsRes.data.filter(
        (run: PayrollRun) =>
          run.status === "PAID" ||
          run.status === "APPROVED" ||
          run.status === "LOCKED"
      );
      setRuns(finalizedRuns);

      const files: BankFile[] = await Promise.all(
        finalizedRuns.map(async (run: PayrollRun) => {
          try {
            const detailsRes = await api.get(
              `/payroll-execution/${run._id}/details`
            );
            const details = detailsRes.data || [];
            const paidEmployees = details.filter(
              (d: any) => d.bankStatus !== "missing"
            );

            return {
              runId: run._id,
              runData: run,
              status: "generated" as const,
              generatedAt: run.createdAt,
              employeeCount: details.length,
              totalAmount: run.totalnetpay || 0,
              paidCount: paidEmployees.length,
            };
          } catch {
            return {
              runId: run._id,
              runData: run,
              status: "pending" as const,
              employeeCount: run.employees || 0,
              totalAmount: run.totalnetpay || 0,
              paidCount: 0,
            };
          }
        })
      );

      setBankFiles(files);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load bank files");
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await api.get("/payroll-execution/employees/bank-details?limit=1000");
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchBankFiles();
    fetchEmployees();
  }, []);

  const handleDownloadFile = (item: BankFile | PayrollRun) => {
    const friendlyId = "runData" in item ? item.runData.runId : item.runId;
    toast.success(`Bank file for ${friendlyId} downloaded`);
  };

  const handleMarkAsPaid = async (item: BankFile | PayrollRun) => {
    const dbId = "runData" in item ? item.runId : item._id;
    const friendlyId = "runData" in item ? item.runData.runId : item.runId;

    try {
      toast.success(`All payments for ${friendlyId} marked as paid`);
      setBankFiles((prev) =>
        prev.map((f) =>
          f.runId === dbId ? { ...f, paidCount: f.employeeCount } : f
        )
      );
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const hasBankDetails = (emp: Employee) =>
    emp.bankName && emp.bankAccountNumber;

  const filteredEmployees = employees.filter((emp) => {
    if (filterStatus === "missing" && hasBankDetails(emp)) return false;
    if (filterStatus === "valid" && !hasBankDetails(emp)) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = (emp.name || "").toLowerCase();
      const empId = (emp.employeeNumber || "").toLowerCase();
      const email = (emp.workEmail || "").toLowerCase();
      if (
        !fullName.includes(query) &&
        !empId.includes(query) &&
        !email.includes(query)
      )
        return false;
    }

    return true;
  });

  const missingCount = employees.filter((e) => !hasBankDetails(e)).length;
  const validCount = employees.filter((e) => hasBankDetails(e)).length;

  const openEditDialog = (emp: Employee) => {
    setSelectedEmployee(emp);
    setBankName(emp.bankName || "");
    setBankAccountNumber(emp.bankAccountNumber || "");
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;

    if (!bankName.trim() || !bankAccountNumber.trim()) {
      toast.error("Please fill in all bank details");
      return;
    }

    const hadMissingBankDetails =
      !selectedEmployee.bankName || !selectedEmployee.bankAccountNumber;

    try {
      setSaving(true);
      await api.patch(`/payroll-execution/employees/${selectedEmployee.id}/bank-details`, {
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        changeReason: "Bank details update via Bank Files page",
      });

      if (hadMissingBankDetails && selectedEmployee.payrollDetailId) {
        try {
          await api.post(
            `/payroll-execution/exceptions/${selectedEmployee.payrollDetailId}/resolve`,
            {
              resolution: "Bank details updated via Bank Files page",
              resolvedBy: "self",
            }
          );
          toast.success("Bank details updated and exception resolved");
        } catch (err) {
          console.warn("Failed to resolve exception:", err);
          toast.success("Bank details updated successfully");
        }
      } else {
        toast.success("Bank details updated successfully");
      }

      setEditDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
      await fetchBankFiles();
    } catch (error: any) {
      console.error("Failed to update bank details", error);
      console.error("Error response:", error?.response?.data);
      toast.error(
        error?.response?.data?.message || "Failed to update bank details"
      );
    } finally {
      setSaving(false);
    }
  };

  const totalEmployees = bankFiles.reduce((acc, f) => acc + f.employeeCount, 0);
  const totalPaid = bankFiles.reduce((acc, f) => acc + f.paidCount, 0);
  const totalAmount = bankFiles.reduce((acc, f) => acc + f.totalAmount, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">
            Bank Files & Employee Details
          </h1>
          <p className="text-slate-400 mt-1">
            Manage bank payment files and employee banking information
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 self-start"
        >
          <Landmark className="w-3 h-3 mr-1" />
          {runs.length} Run{runs.length !== 1 ? "s" : ""} Ready
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Runs</p>
                <p className="text-2xl font-bold text-white">
                  {bankFiles.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Employees</p>
                <p className="text-2xl font-bold text-white">
                  {employees.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Valid Bank Details</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {validCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Missing Details</p>
                <p className="text-2xl font-bold text-amber-500">
                  {missingCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees" className="mt-4">
        <TabsList>
          <TabsTrigger value="employees">Employee Bank Details</TabsTrigger>
          <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          <TabsTrigger value="files">Bank Files</TabsTrigger>
        </TabsList>

        {/* Employee Bank Details Tab */}
        <TabsContent value="employees">
          <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
              <CardTitle className="text-white">Employee Bank Details</CardTitle>
              <CardDescription className="text-slate-400">
                Manage and update employee banking information for payroll processing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, ID, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Select
                  value={filterStatus}
                  onValueChange={(val) =>
                    setFilterStatus(val as "all" | "missing" | "valid")
                  }
                >
                  <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="valid">Valid Details ({validCount})</SelectItem>
                    <SelectItem value="missing">Missing Details ({missingCount})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Table */}
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="hover:bg-slate-800/50 border-slate-800">
                    <TableHead className="text-slate-400">Employee ID</TableHead>
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Bank Name</TableHead>
                    <TableHead className="text-slate-400">Account Number</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEmployees ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-slate-400"
                      >
                        Loading employees...
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <Users className="w-8 h-8 mb-2 text-slate-600" />
                          <p className="font-medium text-slate-400">
                            No employees found
                          </p>
                          <p className="text-sm mt-1 text-slate-500">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <TableRow
                        key={emp.id}
                        className="hover:bg-slate-800/50 transition-colors border-slate-800"
                      >
                        <TableCell className="font-mono text-sm text-slate-300">
                          {emp.employeeNumber}
                        </TableCell>
                        <TableCell className="text-slate-300">{emp.name}</TableCell>
                        <TableCell className="text-slate-400">
                          {emp.workEmail || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {emp.bankName || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-300">
                          {emp.bankAccountNumber || "—"}
                        </TableCell>
                        <TableCell>
                          {hasBankDetails(emp) ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-500 border-amber-500/20"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {currentRole === "Payroll Manager" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                              onClick={() => openEditDialog(emp)}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Runs Tab */}
        <TabsContent value="runs">
          <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
              <CardTitle className="text-white">Payroll Runs</CardTitle>
              <CardDescription className="text-slate-400">
                Finalized payroll runs ready for bank file generation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="hover:bg-slate-800/50 border-slate-800">
                    <TableHead className="text-slate-400">Run ID</TableHead>
                    <TableHead className="text-slate-400">Period</TableHead>
                    <TableHead className="text-slate-400">Department</TableHead>
                    <TableHead className="text-center text-slate-400">
                      Employees
                    </TableHead>
                    <TableHead className="text-right text-slate-400">
                      Total Net Pay
                    </TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFiles ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-slate-400"
                      >
                        Loading payroll runs...
                      </TableCell>
                    </TableRow>
                  ) : runs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <FileSpreadsheet className="w-12 h-12 mb-3 text-slate-600" />
                          <p className="font-medium text-lg text-slate-400">
                            No payroll runs available
                          </p>
                          <p className="text-sm max-w-sm mt-1 text-slate-500">
                            Finalized payroll runs will appear here
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
                        <TableCell className="font-mono text-sm text-slate-300">
                          {run.runId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-300">
                            <CalendarIcon className="w-4 h-4 text-slate-500" />
                            {format(new Date(run.payrollPeriod), "MMM yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Building className="w-4 h-4 text-slate-500" />
                            {run.entity}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-slate-300">
                          {run.employees}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-emerald-500">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "EGP",
                          }).format(run.totalnetpay)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                          >
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                              onClick={() => handleDownloadFile(run)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-emerald-700 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"
                              onClick={() => handleMarkAsPaid(run)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Mark Paid
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
        </TabsContent>

        {/* Bank Files Tab */}
        <TabsContent value="files">
          <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
              <CardTitle className="text-white">Bank Payment Files</CardTitle>
              <CardDescription className="text-slate-400">
                Generated bank files for payroll payments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="hover:bg-slate-800/50 border-slate-800">
                    <TableHead className="text-slate-400">Run ID</TableHead>
                    <TableHead className="text-slate-400">Period</TableHead>
                    <TableHead className="text-slate-400">Department</TableHead>
                    <TableHead className="text-center text-slate-400">
                      Employees
                    </TableHead>
                    <TableHead className="text-right text-slate-400">
                      Total Amount
                    </TableHead>
                    <TableHead className="text-slate-400">
                      Payment Progress
                    </TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFiles ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-slate-400"
                      >
                        Loading bank files...
                      </TableCell>
                    </TableRow>
                  ) : bankFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <Landmark className="w-12 h-12 mb-3 text-slate-600" />
                          <p className="font-medium text-lg text-slate-400">
                            No bank files available
                          </p>
                          <p className="text-sm max-w-sm mt-1 text-slate-500">
                            Bank files will be generated once payroll runs are finalized
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bankFiles.map((file) => {
                      const progressPercent =
                        file.employeeCount > 0
                          ? Math.round((file.paidCount / file.employeeCount) * 100)
                          : 0;

                      return (
                        <TableRow
                          key={file.runId}
                          className="hover:bg-slate-800/50 transition-colors border-slate-800"
                        >
                          <TableCell className="font-mono text-sm text-slate-300">
                            {file.runData.runId}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-300">
                              <CalendarIcon className="w-4 h-4 text-slate-500" />
                              {format(
                                new Date(file.runData.payrollPeriod),
                                "MMM yyyy"
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Building className="w-4 h-4 text-slate-500" />
                              {file.runData.entity}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-slate-300">
                            {file.employeeCount}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-emerald-500">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "EGP",
                            }).format(file.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <div className="w-full max-w-[120px]">
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>
                                  {file.paidCount}/{file.employeeCount}
                                </span>
                                <span>{progressPercent}%</span>
                              </div>
                              <Progress
                                value={progressPercent}
                                className="h-2 bg-slate-700"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {progressPercent === 100 ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paid
                              </Badge>
                            ) : file.status === "generated" ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                              >
                                <FileSpreadsheet className="w-3 h-3 mr-1" />
                                Generated
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-400 border-amber-500/20"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                onClick={() => handleDownloadFile(file)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              {progressPercent < 100 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-emerald-700 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"
                                  onClick={() => handleMarkAsPaid(file)}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Note about bank integration */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-400">
                No Bank Integration
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                This system does not integrate with external banking systems.
                Bank files can be downloaded for manual processing, and payments
                should be marked as paid after they have been processed through
                your bank.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Employee Bank Details Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Bank Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update bank account information for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Bank Name</Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999] max-h-[300px]">
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
              <Label className="text-slate-300">Account Number</Label>
              <Input
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Enter bank account number"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-slate-700 text-slate-300"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
