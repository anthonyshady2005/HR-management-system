"use client";

import React, { useState, useEffect } from "react";
import {
    ClipboardCheck,
    Calendar,
    User,
    Search,
    Edit,
    FileText,
    CheckCircle2,
    Clock,
    ChevronRight,
    Filter
} from "lucide-react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

interface AppraisalRecord {
    _id: string;
    status: string;
    employeeProfileId: {
        _id: string;
        firstName: string;
        lastName: string;
        fullName?: string;
        position?: { title: string };
    };
    assignmentId?: { _id: string };
    cycleId: {
        _id: string;
        name: string;
    };
    totalScore?: number;
    overallRatingLabel?: string;
    updatedAt: string;
}

export default function MyEvaluationsPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<AppraisalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user?.id) return;

            try {
                setIsLoading(true);
                const res = await api.get(`/performance/records/manager/${user.id}`);
                setRecords(res.data);
            } catch (err) {
                console.error("Failed to load manager evaluations", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, [user]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "DRAFT":
                return "bg-slate-500/10 text-slate-400 border-slate-500/20";
            case "MANAGER_SUBMITTED":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "HR_PUBLISHED":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            default:
                return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const filteredRecords = records.filter((r) => {
        const matchesSearch = (r.employeeProfileId.fullName || `${r.employeeProfileId.firstName} ${r.employeeProfileId.lastName}`)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <ProtectedRoute allowedRoles={["department head"]}>
            <div className="min-h-screen bg-slate-950 text-slate-200">
                <main className="max-w-7xl mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">My Evaluations</h1>
                            <p className="text-slate-400">Manage and review appraisals you've completed.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/performance/manager/assignments">
                                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                                    <ClipboardCheck className="w-5 h-5" />
                                    New Evaluation
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by employee name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="DRAFT">Drafts</option>
                                <option value="MANAGER_SUBMITTED">Submitted</option>
                                <option value="HR_PUBLISHED">Published</option>
                            </select>
                        </div>
                    </div>

                    {/* Table / List */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-20">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredRecords.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="px-6 py-5 text-sm font-semibold text-slate-400">Employee</th>
                                            <th className="px-6 py-5 text-sm font-semibold text-slate-400">Appraisal Cycle</th>
                                            <th className="px-6 py-5 text-sm font-semibold text-slate-400">Rating</th>
                                            <th className="px-6 py-5 text-sm font-semibold text-slate-400">Status</th>
                                            <th className="px-6 py-5 text-sm font-semibold text-slate-400">Last Updated</th>
                                            <th className="px-6 py-5 text-sm font-semibold text-slate-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredRecords.map((record) => (
                                            <tr key={record._id} className="hover:bg-white/5 transition-all group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                                {record.employeeProfileId.fullName || `${record.employeeProfileId.firstName} ${record.employeeProfileId.lastName}`}
                                                            </div>
                                                            <div className="text-xs text-slate-500">{record.employeeProfileId.position?.title}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-slate-500" />
                                                        {record.cycleId.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {record.totalScore !== undefined ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white">{record.totalScore}%</span>
                                                            <span className="text-[10px] text-slate-500 uppercase">{record.overallRatingLabel}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(record.status)}`}>
                                                        {record.status === "DRAFT" && <Clock className="w-3 h-3 mr-1.5" />}
                                                        {record.status === "MANAGER_SUBMITTED" && <Clock className="w-3 h-3 mr-1.5" />}
                                                        {record.status === "HR_PUBLISHED" && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                                        {record.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-slate-500 text-sm">
                                                    {new Date(record.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Link href={`/performance/evaluate/${(record.assignmentId as any)?._id || record.assignmentId}?edit=true`}>
                                                        <button
                                                            className={`p-2.5 rounded-xl transition-all ${record.status === 'HR_PUBLISHED'
                                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                                                                }`}
                                                            disabled={record.status === 'HR_PUBLISHED'}
                                                            title={record.status === 'HR_PUBLISHED' ? "Published records cannot be edited" : "Edit Evaluation"}
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 text-center">
                                <FileText className="w-16 h-16 text-slate-700 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No evaluations found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    You haven't completed any evaluations yet or none match your search criteria.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
