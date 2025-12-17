"use client";

import React, { useState, useEffect } from "react";
import { Check, ClipboardList, Filter, Search, UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
// Importing a simple MultiSelect component or creating one inline for simplicity in this context
import { ChevronDown } from "lucide-react";

// Reusing the MultiSelect component logic from previous pages for consistency
const MultiSelect = ({
    options,
    selectedIds,
    onChange,
    placeholder = "Select options"
}: {
    options: { _id: string; name: string }[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    placeholder?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((item) => item !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const selectedNames = options
        .filter((opt) => selectedIds.includes(opt._id))
        .map((opt) => opt.name)
        .join(", ");

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
            >
                <span className="truncate block text-left">
                    {selectedNames || <span className="text-slate-500">{placeholder}</span>}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
                        {options.length > 0 ? (
                            options.map((opt) => (
                                <div
                                    key={opt._id}
                                    onClick={() => toggleSelection(opt._id)}
                                    className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${selectedIds.includes(opt._id)
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "hover:bg-white/5 text-slate-300"
                                        }`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center ${selectedIds.includes(opt._id)
                                            ? "bg-emerald-500 border-emerald-500"
                                            : "border-slate-500"
                                            }`}
                                    >
                                        {selectedIds.includes(opt._id) && <Check className="w-3 h-3 text-slate-900" />}
                                    </div>
                                    {opt.name}
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-slate-500 text-center text-sm">No options available</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default function BulkAppraisalAssignmentPage() {
    const [cycles, setCycles] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [positions, setPositions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    // Selection State
    const [selectedCycleId, setSelectedCycleId] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [filterDepartmentIds, setFilterDepartmentIds] = useState<string[]>([]);
    const [filterPositionIds, setFilterPositionIds] = useState<string[]>([]);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Load initial metadata
    useEffect(() => {
        const loadMetadata = async () => {
            try {
                const [cyclesRes, templatesRes, deptsRes, posRes] = await Promise.all([
                    api.get("/performance/cycles"),
                    api.get("/performance/templates"),
                    api.get("/organization-structure/departments"),
                    api.get("/organization-structure/positions"),
                ]);
                setCycles(cyclesRes.data);
                setTemplates(templatesRes.data);
                setDepartments(deptsRes.data);
                setPositions(posRes.data);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        loadMetadata();
    }, []);

    // Fetch employees based on filters
   useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employee-profile/search", { params: { limit: 1000 } });
      const employeesData = res.data.data || []; // <-- corrected path

      let filtered = employeesData;

      if (filterDepartmentIds.length > 0) {
        filtered = filtered.filter((e: any) =>
          filterDepartmentIds.includes(
            e.primaryDepartmentId?._id || e.primaryDepartmentId
          )
        );
      }
      if (filterPositionIds.length > 0) {
        filtered = filtered.filter((e: any) =>
          filterPositionIds.includes(
            e.primaryPositionId?._id || e.primaryPositionId
          )
        );
      }

      setEmployees(filtered);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };
  fetchEmployees();
}, [filterDepartmentIds, filterPositionIds]);

    const handleSelectAll = () => {
        if (selectedEmployeeIds.length === employees.length) {
            setSelectedEmployeeIds([]);
        } else {
            setSelectedEmployeeIds(employees.map(e => e._id));
        }
    };

    const submit = async () => {
        if (!selectedCycleId || !selectedTemplateId || selectedEmployeeIds.length === 0) {
            alert("Please select a cycle, template, and at least one employee.");
            return;
        }

        setIsLoading(true);
        try {

        const assignments = selectedEmployeeIds.map(empId => {
        const emp = employees.find(e => e._id === empId); // use _id

        return {
            cycleId: selectedCycleId,
            templateId: selectedTemplateId,
            employeeProfileId: empId,
            managerProfileId: emp?.reportTo?._id || null, // safely access manager
            departmentId: emp?.primaryDepartmentId?._id || emp?.primaryDepartmentId || undefined,
            positionId: emp?.primaryPositionId?._id || emp?.primaryPositionId || undefined,
            status: 'NOT_STARTED',
            assignedAt: new Date().toISOString()
        };
        });


            const validAssignments = assignments.filter(a => a.employeeProfileId); // Just safety.

            await api.post("/performance/assignments/bulk", validAssignments);

            setSuccessMessage(`Successfully assigned ${validAssignments.length} appraisals!`);
            setSelectedEmployeeIds([]);
            setTimeout(() => setSuccessMessage(""), 3000);

        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Error creating assignments");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={["HR Employee", "HR Manager", "System Admin"]}>
            <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -right-32 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <UserCheck className="w-8 h-8 text-emerald-500" />
                        <span className="text-white text-3xl">Bulk Appraisal Assignment</span>
                    </div>

                    {successMessage && (
                        <div className="mb-8 bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <Check className="w-5 h-5" />
                            {successMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-20">
                        {/* Left Column: Configuration & Filters */}
                        <div className="space-y-6">
                            {/* Metadata Selection */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition-all duration-300">
                                <h3 className="text-lg font-medium text-slate-200">Assignment Details</h3>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Appraisal Cycle</label>
                                    <select
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        value={selectedCycleId}
                                        onChange={e => setSelectedCycleId(e.target.value)}
                                    >
                                        <option value="">Select Cycle...</option>
                                        {cycles.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Template</label>
                                    <select
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        value={selectedTemplateId}
                                        onChange={e => setSelectedTemplateId(e.target.value)}
                                    >
                                        <option value="">Select Template...</option>
                                        {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-2 text-lg font-medium text-slate-200">
                                    <Filter className="w-5 h-5" />
                                    <h3>Filter Employees</h3>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Departments</label>
                                    <MultiSelect
                                        options={departments}
                                        selectedIds={filterDepartmentIds}
                                        onChange={setFilterDepartmentIds}
                                        placeholder="All Departments"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Positions</label>
                                    <MultiSelect
                                        options={positions}
                                        selectedIds={filterPositionIds}
                                        onChange={setFilterPositionIds}
                                        placeholder="All Positions"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Employee Selection */}
                        <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-[600px] hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-slate-200">
                                    Select Employees <span className="text-sm text-slate-500">({selectedEmployeeIds.length} selected)</span>
                                </h3>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    {selectedEmployeeIds.length === employees.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {employees.length > 0 ? (
                                employees.map(emp => {
                                    const isSelected = selectedEmployeeIds.includes(emp._id); // <-- always use _id

                                    return (
                                    <div
                                        key={emp._id}
                                        onClick={() => {
                                        if (isSelected) {
                                            setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== emp._id));
                                        } else {
                                            setSelectedEmployeeIds([...selectedEmployeeIds, emp._id]);
                                        }
                                        }}
                                        className={`
                                        p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group
                                        ${isSelected
                                            ? "bg-emerald-500/10 border-emerald-500/50"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                        }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                        <div className={`
                                            w-5 h-5 rounded border flex items-center justify-center transition-colors
                                            ${isSelected
                                            ? "bg-emerald-500 border-emerald-500"
                                            : "border-slate-500 group-hover:border-slate-400"
                                            }
                                        `}>
                                            {isSelected && <Check className="w-3 h-3 text-slate-900" />}
                                        </div>
                                        <div>
                                            <p className="text-slate-200 font-medium">{emp.firstName} {emp.lastName}</p>
                                            <p className="text-xs text-slate-500">
                                            {emp.employeeNumber} • {emp.primaryPositionId?.title || emp.primaryPositionId?.name || 'No Position'}
                                            </p>
                                        </div>
                                        </div>
                                        <div className="text-right">
                                        <p className="text-xs text-slate-400">
                                            Manager: {emp.reportTo?.firstName || 'None'} {emp.reportTo?.lastName || ''}
                                        </p>
                                        </div>
                                    </div>
                                    )
                                })
                                ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <Search className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No employees found matching filters</p>
                                </div>
                                )}

                            </div>

                            <div className="pt-6 mt-4 border-t border-white/10 flex justify-end">
                                <button
                                    onClick={submit}
                                    disabled={isLoading || selectedEmployeeIds.length === 0}
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-900 border border-emerald-500/20 rounded-xl text-white font-medium shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/30 hover:border-emerald-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    )}
                                    Assign Appraisals
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
