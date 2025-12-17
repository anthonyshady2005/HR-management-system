/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Search, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { getMyProfile, searchEmployees, addEmployeeToTeam } from "../api";
import type { EmployeeProfile } from "../types";

interface AddEmployeeToTeamDialogProps {
  onSuccess?: () => void;
}

export function AddEmployeeToTeamDialog({
  onSuccess,
}: AddEmployeeToTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<EmployeeProfile[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
  const [managerHasPosition, setManagerHasPosition] = useState<boolean | null>(null);

  const isMongoObjectId = (value: unknown) => {
    if (typeof value !== "string") return false;
    return /^[a-fA-F0-9]{24}$/.test(value);
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (!isAxiosError(error)) return fallback;
    const msg = (error.response?.data as any)?.message;
    if (Array.isArray(msg)) return msg.filter(Boolean).join(", ");
    if (typeof msg === "string" && msg.trim()) return msg;
    if (msg && typeof msg === "object") {
      try {
        return JSON.stringify(msg);
      } catch {
        // ignore
      }
    }
    return error.message || fallback;
  };

  useEffect(() => {
    if (!open) return;

    // Reset per-open state
    setManagerHasPosition(null);

    (async () => {
      try {
        const me = await getMyProfile();
        const pos = (me as any)?.primaryPositionId;
        const hasPos = Boolean(
          (typeof pos === "string" && pos.trim()) ||
            (pos && typeof pos === "object" && (pos as any)?._id),
        );
        setManagerHasPosition(hasPos);

        if (!hasPos) {
          toast.error(
            "Your manager account has no position assigned yet. Ask HR to assign a position before adding employees to your team.",
          );
        }
      } catch (e) {
        // If we can't verify, don't hard-block. Let backend decide.
        console.error("Failed to verify manager position:", e);
        setManagerHasPosition(null);
      }
    })();
  }, [open]);

  const handleSearch = async () => {
    if (managerHasPosition === false) {
      toast.error(
        "You can’t add team members until your position is assigned (ask HR).",
      );
      return;
    }

    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setSearching(true);
      const results = await searchEmployees({
        name: searchQuery,
        page: 1,
        limit: 20,
      });

      // Extract employees from paginated response
      const employees = (results as any).data || [];
      
      // Ensure each employee has a valid MongoDB _id as string
      const validEmployees = employees.filter((emp: any) => isMongoObjectId(emp?._id));
      
      setSearchResults(validEmployees);
      
      if (validEmployees.length === 0) {
        toast.info("No employees found matching your search");
      }
    } catch (error) {
      console.error("Failed to search employees:", error);
      toast.error(getErrorMessage(error, "Failed to search employees"));
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddToTeam = async () => {
    if (managerHasPosition === false) {
      toast.error(
        "You can’t add team members until your position is assigned (ask HR).",
      );
      return;
    }

    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    // Ensure employeeId is a string and valid
    const employeeId = typeof selectedEmployee._id === 'string' 
      ? selectedEmployee._id 
      : String(selectedEmployee._id);

    if (!isMongoObjectId(employeeId)) {
      toast.error("Invalid employee ID (expected a Mongo ObjectId)");
      console.error("Invalid employeeId:", selectedEmployee._id, "normalized:", employeeId);
      return;
    }

    try {
      setSubmitting(true);

      console.log("Adding employee to team with ID:", employeeId);
      await addEmployeeToTeam(employeeId);
      
      toast.success(`Successfully added ${selectedEmployee.fullName || selectedEmployee.firstName + " " + selectedEmployee.lastName} to your team!`);
      
      // Reset state
      setSelectedEmployee(null);
      setSearchQuery("");
      setSearchResults([]);
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to add employee to team:", error);
      if (isAxiosError(error)) {
        console.error("Backend error body:", error.response?.data);
      }
      toast.error(getErrorMessage(error, "Failed to add employee to team"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Employee to Team
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Employee to Team
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Search for an employee and assign them to your team. They will become your direct report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {managerHasPosition === false && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-300 mb-1">
                    Position required
                  </p>
                  <p className="text-sm text-slate-300">
                    Your account doesn’t have a position assigned. This feature updates the employee’s
                    <span className="font-mono"> supervisorPositionId</span>, so a manager position is required.
                    Please ask HR to assign your position, then try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-slate-300 mb-2 block text-sm">
                  Search for Employee
                </Label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Search by name or email..."
                  disabled={managerHasPosition === false}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={managerHasPosition === false || searching || !searchQuery.trim()}
                className="mt-6"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Select Employee:</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-white/10 rounded-lg p-2">
                {searchResults.map((employee) => {
                  const isSelected = selectedEmployee?._id === employee._id;
                  const positionName = typeof employee.primaryPositionId === "object" && employee.primaryPositionId
                    ? (employee.primaryPositionId as any).title
                    : "No position";
                  const departmentName = typeof employee.primaryDepartmentId === "object" && employee.primaryDepartmentId
                    ? (employee.primaryDepartmentId as any).name
                    : "No department";

                  return (
                    <div
                      key={employee._id}
                      onClick={() => setSelectedEmployee(employee)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-500/20 border-blue-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                          </p>
                          <p className="text-sm text-slate-400">{employee.workEmail}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-slate-500">{positionName}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">{departmentName}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-blue-300 mb-1">Ready to Add</p>
                  <p className="text-sm text-slate-300">
                    <strong>{selectedEmployee.fullName || `${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</strong> will be assigned to your team as a direct report.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">
              <strong>Note:</strong> This will update the employee's supervisor position to your position. 
              They will appear in your team view immediately after assignment.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setSelectedEmployee(null);
              setSearchQuery("");
              setSearchResults([]);
            }}
            disabled={submitting}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToTeam}
            disabled={managerHasPosition === false || submitting || !selectedEmployee}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add to Team
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

