"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useRequireRole } from "@/hooks/use-require-role";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { ProfileCard } from "../components/ProfileCard";
import { CreateEmployeeDialog } from "../components/CreateEmployeeDialog";
import { searchEmployees } from "../api";
import type {
  EmployeeProfile,
  SearchEmployeesParams,
  EmployeeStatus,
} from "../types";

const ALLOWED_ROLES = ["HR Employee", "HR Manager", "HR Admin", "System Admin"];

export default function DirectoryPage() {
  const { status, roles } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search filters
  const [searchText, setSearchText] = useState(
    searchParams.get("name") || ""
  );
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "">(
    (searchParams.get("status") as EmployeeStatus) || ""
  );
  const [emailFilter, setEmailFilter] = useState(
    searchParams.get("email") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [showFilters, setShowFilters] = useState(false);

  useRequireRole(ALLOWED_ROLES, "/employee/profile");

  type SearchOverride = {
    page?: number;
    name?: string;
    status?: EmployeeStatus | "";
  };

  const performSearch = useCallback(
    async (overrides: SearchOverride = {}) => {
      try {
        setLoading(true);

        const page = overrides.page ?? currentPage;
        const searchValue = overrides.name ?? searchText;
        const statusValue = overrides.status ?? statusFilter;

        const params: SearchEmployeesParams = {
          page,
          limit: 20,
        };

        if (searchValue) params.name = searchValue;
        if (statusValue) params.status = statusValue;

        const result = await searchEmployees(params);
        // Handle both response formats: {data, total, ...} and {employees, pagination}
        type LegacyFormat = { employees: EmployeeProfile[]; pagination: { total: number; totalPages: number } };
        const legacyResult = result as unknown as LegacyFormat;
        const employees = legacyResult.employees || result.data || [];
        const pagination = legacyResult.pagination || result;
        setEmployees(employees);
        setTotalPages(pagination.totalPages || 1);
        setTotalCount(pagination.total || 0);

        // Update URL params
        const newParams = new URLSearchParams();
        if (searchValue) newParams.set("name", searchValue);
        if (statusValue) newParams.set("status", statusValue);
        if (page > 1) newParams.set("page", page.toString());

        router.replace(
          newParams.toString()
            ? `/employee/directory?${newParams.toString()}`
            : "/employee/directory",
          { scroll: false }
        );
      } catch (error) {
        console.error("Failed to search employees:", error);
        const message = isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Failed to search employees";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, router, searchText, statusFilter]
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }

    if (status === "authenticated") {
      performSearch();
    }
  }, [status, performSearch, router]);

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch({
      page: 1,
      name: searchText,
      status: statusFilter,
    });
  };

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setCurrentPage(1);
    performSearch({ page: 1, name: "", status: "" });
  };

  const handleViewDetails = (employeeId: string) => {
    router.push(`/employee/${employeeId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Employee Directory</h1>
              <p className="text-slate-400 text-sm">
                Search and manage employee profiles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Only show Create Employee button to authorized roles */}
            {(roles.includes("HR Admin") || roles.includes("HR Manager") || roles.includes("System Admin")) && (
              <CreateEmployeeDialog onSuccess={() => performSearch({})} />
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/5 border-white/10 text-white mb-6">
          <CardContent className="pt-6">
            {/* Quick Search */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <Label className="text-slate-300 mb-2 block">Email</Label>
                  <Input
                    type="email"
                    placeholder="Filter by email..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Status</Label>
                  <Select
                    value={statusFilter || undefined}
                    onValueChange={(value) => {
                      if (value === "ALL") {
                        setStatusFilter("");
                      } else {
                        setStatusFilter(value as EmployeeStatus);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="PROBATION">Probation</SelectItem>
                      <SelectItem value="RETIRED">Retired</SelectItem>
                      <SelectItem value="TERMINATED">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-400 text-sm">
            {loading ? (
              "Searching..."
            ) : (
              <>
                Found {totalCount} employee{totalCount !== 1 ? "s" : ""}
                {searchText && (
                  <span className="text-white ml-1">
                    matching &ldquo;{searchText}&rdquo;
                  </span>
                )}
              </>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-slate-400 text-sm">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="bg-white/5 border-white/10 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <Card className="bg-white/5 border-white/10 text-white">
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No employees found</p>
              <p className="text-sm text-slate-500 mt-2">
                Try adjusting your search filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <ProfileCard
                key={employee._id}
                employee={employee}
                onViewDetails={() => handleViewDetails(employee._id)}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
