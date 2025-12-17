"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
  BarChart3,
  Building,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  Loader2,
  Users,
  Wallet,
  Shield,
  Gift,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface PayrollReport {
  totalGrossSalary: number;
  totalNetPay: number;
  totalDeductions: number;
  count: number;
}

interface SummaryReport {
  totalGrossSalary: number;
  totalNetPay: number;
  totalDeductions: number;
  count: number;
}

interface DeductionsBenefitsReport {
  totalTaxes: number;
  totalInsurance: number;
  totalBenefits: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

const ALLOWED_ROLES = ["Payroll Specialist", "Finance Staff"];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

// Helper function to get days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Reusable Date Dropdowns Component
function DateDropdowns({
  value,
  onChange,
  label
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label: string;
}) {
  const selectedYear = value?.getFullYear();
  const selectedMonth = value?.getMonth();
  const selectedDay = value?.getDate();

  const daysInMonth = selectedYear !== undefined && selectedMonth !== undefined
    ? getDaysInMonth(selectedYear, selectedMonth)
    : 31;

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr);
    const month = selectedMonth ?? 0;
    const day = Math.min(selectedDay ?? 1, getDaysInMonth(year, month));
    onChange(new Date(year, month, day));
  };

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr);
    const year = selectedYear ?? new Date().getFullYear();
    const day = Math.min(selectedDay ?? 1, getDaysInMonth(year, month));
    onChange(new Date(year, month, day));
  };

  const handleDayChange = (dayStr: string) => {
    const day = parseInt(dayStr);
    const year = selectedYear ?? new Date().getFullYear();
    const month = selectedMonth ?? 0;
    onChange(new Date(year, month, day));
  };

  return (
    <div className="space-y-2">
      <Label className="text-slate-300">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {/* Year */}
        <Select value={selectedYear?.toString() ?? ""} onValueChange={handleYearChange}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999] max-h-60 overflow-auto">
            {YEARS.map((year) => (
              <SelectItem key={year} value={year.toString()} className="focus:bg-slate-700 focus:text-white">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month */}
        <Select value={selectedMonth?.toString() ?? ""} onValueChange={handleMonthChange}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999] max-h-60 overflow-auto">
            {MONTHS.map((month, idx) => (
              <SelectItem key={idx} value={idx.toString()} className="focus:bg-slate-700 focus:text-white">
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Day */}
        <Select value={selectedDay?.toString() ?? ""} onValueChange={handleDayChange}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999] max-h-60 overflow-auto">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <SelectItem key={day} value={day.toString()} className="focus:bg-slate-700 focus:text-white">
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {value && (
        <p className="text-xs text-slate-500">
          Selected: {format(value, "MMMM d, yyyy")}
        </p>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { currentRole } = useAuth();

  // Derived role checks (computed before hooks for consistency)
  const isPayrollSpecialist = currentRole === "Payroll Specialist";
  const isFinanceStaff = currentRole === "Finance Staff";

  // All hooks must be called before any conditional returns (React rules of hooks)
  // Department Report State (Payroll Specialist)
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [deptStartDate, setDeptStartDate] = useState<Date | undefined>(undefined);
  const [deptEndDate, setDeptEndDate] = useState<Date | undefined>(undefined);
  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [deptReport, setDeptReport] = useState<PayrollReport | null>(null);

  // Summary Report State (Finance Staff)
  const [summaryType, setSummaryType] = useState<"MONTH" | "YEAR">("MONTH");
  const [summaryDate, setSummaryDate] = useState<Date | undefined>(new Date());
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryReport, setSummaryReport] = useState<SummaryReport | null>(null);

  // Deductions/Benefits Report State (Finance Staff)
  const [dbStartDate, setDbStartDate] = useState<Date | undefined>(undefined);
  const [dbEndDate, setDbEndDate] = useState<Date | undefined>(undefined);
  const [loadingDB, setLoadingDB] = useState(false);
  const [dbReport, setDbReport] = useState<DeductionsBenefitsReport | null>(null);

  // Fetch departments on mount (for Payroll Specialist only)
  useEffect(() => {
    if (currentRole !== "Payroll Specialist") {
      return;
    }

    let isMounted = true;

    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const res = await api.get("/organization-structure/departments");
        if (isMounted) {
          setDepartments(res.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        if (isMounted) {
          toast.error("Failed to load departments");
        }
      } finally {
        if (isMounted) {
          setLoadingDepartments(false);
        }
      }
    };

    fetchDepartments();

    return () => {
      isMounted = false;
    };
  }, [currentRole]);

  // Authorization: Only Payroll Specialist or Finance Staff can access
  if (!ALLOWED_ROLES.includes(currentRole || "")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold text-slate-200 mb-4">Unauthorized</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access this resource. Required roles: Payroll Specialist or Finance Staff.
        </p>
      </div>
    );
  }

  // Department Report Handler (Payroll Specialist)
  const handleGenerateDeptReport = async () => {
    if (!selectedDepartment) {
      toast.error("Please select a department");
      return;
    }

    // Validate dates only if both are provided
    if (deptStartDate && deptEndDate && deptStartDate > deptEndDate) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      setLoadingDept(true);
      const payload: { startDate?: string; endDate?: string } = {};

      // Only include dates if both are provided
      if (deptStartDate && deptEndDate) {
        payload.startDate = deptStartDate.toISOString();
        payload.endDate = deptEndDate.toISOString();
      }

      const res = await api.post(`/payroll-tracking/reports/department/${selectedDepartment}`, payload);
      setDeptReport(res.data);
      toast.success("Department report generated successfully");
    } catch (error: unknown) {
      console.error("Failed to generate report:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to generate report");
      setDeptReport(null);
    } finally {
      setLoadingDept(false);
    }
  };

  // Summary Report Handler (Finance Staff)
  const handleGenerateSummaryReport = async () => {
    if (!summaryDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      setLoadingSummary(true);
      const res = await api.post("/payroll-tracking/reports/summary", {
        type: summaryType,
        date: summaryDate.toISOString(),
      });
      setSummaryReport(res.data);
      toast.success(`${summaryType === "MONTH" ? "Month-end" : "Year-end"} summary generated successfully`);
    } catch (error: unknown) {
      console.error("Failed to generate summary:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to generate summary");
      setSummaryReport(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Deductions/Benefits Report Handler (Finance Staff)
  const handleGenerateDBReport = async () => {
    if (!dbStartDate || !dbEndDate) {
      toast.error("Please select a date range");
      return;
    }

    if (dbStartDate > dbEndDate) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      setLoadingDB(true);
      const res = await api.post("/payroll-tracking/reports/deductions-benefits", {
        startDate: dbStartDate.toISOString(),
        endDate: dbEndDate.toISOString(),
      });
      setDbReport(res.data);
      toast.success("Deductions & benefits report generated successfully");
    } catch (error: unknown) {
      console.error("Failed to generate report:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to generate report");
      setDbReport(null);
    } finally {
      setLoadingDB(false);
    }
  };

  const selectedDeptName = departments.find((d) => d._id === selectedDepartment)?.name || "";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(amount || 0);

  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-200 tracking-tight">Payroll Reports</h1>
        <p className="text-slate-400">
          Generate payroll reports and summaries.
          {isPayrollSpecialist && " Department-level payroll analysis."}
          {isFinanceStaff && " Organization-wide financial summaries."}
        </p>
      </div>

      {/* Payroll Specialist Section - Department Reports */}
      {isPayrollSpecialist && (
        <>
          <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-500" />
                Department Payroll Report
              </CardTitle>
              <CardDescription className="text-slate-400">
                Select a department to generate a payroll summary. Date range is optional - if not provided, shows all-time data.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Department Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                    disabled={loadingDepartments}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder={loadingDepartments ? "Loading..." : "Select department"} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999]">
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id} className="focus:bg-slate-700 focus:text-white">
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <DateDropdowns value={deptStartDate} onChange={setDeptStartDate} label="Start Date" />

                {/* End Date */}
                <DateDropdowns value={deptEndDate} onChange={setDeptEndDate} label="End Date" />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleGenerateDeptReport}
                  disabled={loadingDept || !selectedDepartment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-900/20"
                >
                  {loadingDept ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Department Report Results */}
          {deptReport && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Department Report: {selectedDeptName}</h2>
                <div className="text-sm text-slate-400">
                  {deptStartDate && deptEndDate && (
                    <>
                      {format(deptStartDate, "MMM d, yyyy")} - {format(deptEndDate, "MMM d, yyyy")}
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400">Total Gross Salary</p>
                        <p className="text-2xl font-bold text-white mt-1">{formatCurrency(deptReport.totalGrossSalary)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400">Total Net Pay</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(deptReport.totalNetPay)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400">Total Deductions</p>
                        <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(deptReport.totalDeductions)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400">Payslips</p>
                        <p className="text-2xl font-bold text-white mt-1">{deptReport.count || 0}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* Finance Staff Section */}
      {isFinanceStaff && (
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="summary" className="text-slate-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Payroll Summaries
            </TabsTrigger>
            <TabsTrigger value="deductions" className="text-slate-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Deductions & Benefits
            </TabsTrigger>
          </TabsList>

          {/* Month/Year Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Month-End / Year-End Payroll Summary
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Generate organization-wide payroll summaries for month-end or year-end reporting.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className={cn("grid gap-6", summaryType === "MONTH" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
                  {/* Report Type */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Report Type</Label>
                    <Select value={summaryType} onValueChange={(v) => setSummaryType(v as "MONTH" | "YEAR")}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999]">
                        <SelectItem value="MONTH" className="focus:bg-slate-700 focus:text-white">Month-End Summary</SelectItem>
                        <SelectItem value="YEAR" className="focus:bg-slate-700 focus:text-white">Year-End Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Month/Year Selection */}
                  {summaryType === "MONTH" ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Select Month</Label>
                        <Select
                          value={summaryDate ? String(summaryDate.getMonth()) : ""}
                          onValueChange={(v) => {
                            const newDate = summaryDate ? new Date(summaryDate) : new Date();
                            newDate.setMonth(parseInt(v));
                            setSummaryDate(newDate);
                          }}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999] max-h-60 overflow-auto">
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, idx) => (
                              <SelectItem key={idx} value={String(idx)} className="focus:bg-slate-700 focus:text-white">{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Select Year</Label>
                        <Select
                          value={summaryDate ? String(summaryDate.getFullYear()) : ""}
                          onValueChange={(v) => {
                            const newDate = summaryDate ? new Date(summaryDate) : new Date();
                            newDate.setFullYear(parseInt(v));
                            setSummaryDate(newDate);
                          }}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999] max-h-60 overflow-auto">
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                              <SelectItem key={year} value={String(year)} className="focus:bg-slate-700 focus:text-white">{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Select Year</Label>
                      <Select
                        value={summaryDate ? String(summaryDate.getFullYear()) : ""}
                        onValueChange={(v) => {
                          const newDate = new Date(parseInt(v), 0, 1);
                          setSummaryDate(newDate);
                        }}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white z-[9999] max-h-60 overflow-auto">
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                            <SelectItem key={year} value={String(year)} className="focus:bg-slate-700 focus:text-white">{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleGenerateSummaryReport}
                    disabled={loadingSummary || !summaryDate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    {loadingSummary ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Results */}
            {summaryReport && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold text-white">
                  {summaryType === "MONTH" ? "Month-End" : "Year-End"} Summary
                  {summaryDate && ` - ${format(summaryDate, summaryType === "MONTH" ? "MMMM yyyy" : "yyyy")}`}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-slate-400">Total Gross Salary</p>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-white">{formatCurrency(summaryReport.totalGrossSalary)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-slate-400">Total Net Pay</p>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-blue-500" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-emerald-400">{formatCurrency(summaryReport.totalNetPay)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-slate-400">Total Deductions</p>
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-red-500" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-red-400">{formatCurrency(summaryReport.totalDeductions)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-slate-400">Payslips Processed</p>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-500" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-white">{summaryReport.count || 0}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Deductions & Benefits Tab */}
          <TabsContent value="deductions" className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Taxes, Insurance & Benefits Report
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Generate detailed reports on tax contributions, insurance deductions, and employee benefits.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <DateDropdowns value={dbStartDate} onChange={setDbStartDate} label="Start Date" />

                  {/* End Date */}
                  <DateDropdowns value={dbEndDate} onChange={setDbEndDate} label="End Date" />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleGenerateDBReport}
                    disabled={loadingDB || !dbStartDate || !dbEndDate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    {loadingDB ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deductions/Benefits Results */}
            {dbReport && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Taxes, Insurance & Benefits Report</h2>
                  <div className="text-sm text-slate-400">
                    {dbStartDate && dbEndDate && (
                      <>
                        {format(dbStartDate, "MMM d, yyyy")} - {format(dbEndDate, "MMM d, yyyy")}
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-400">Total Taxes</p>
                          <p className="text-2xl font-bold text-orange-400 mt-1">{formatCurrency(dbReport.totalTaxes)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-orange-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-400">Total Insurance</p>
                          <p className="text-2xl font-bold text-blue-400 mt-1">{formatCurrency(dbReport.totalInsurance)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-400">Total Benefits</p>
                          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(dbReport.totalBenefits)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Gift className="w-6 h-6 text-emerald-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
