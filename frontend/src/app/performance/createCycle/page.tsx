"use client";

import React, { useState } from "react";
import { Calendar, Check, ClipboardList, Clock } from "lucide-react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
// Importing enums from backend as per existing pattern
import { AppraisalTemplateType } from "@/lib/performance-utils";

const CYCLE_TYPES = Object.values(AppraisalTemplateType) as AppraisalTemplateType[];

export default function CreateAppraisalCyclePage() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        cycleType: CYCLE_TYPES[0],
        startDate: "",
        endDate: "",
        managerDueDate: "",
        employeeAcknowledgementDueDate: "",
    });

    const [successMessage, setSuccessMessage] = useState("");

    const submit = async () => {
        try {
            const payload = {
                ...form,
                startDate: new Date(new Date(form.startDate).setHours(0, 0, 0, 0)), // start of day
                endDate: new Date(new Date(form.endDate).setHours(23, 59, 59, 999)), // end of day
                managerDueDate: form.managerDueDate ? new Date(form.managerDueDate) : undefined,
                employeeAcknowledgementDueDate: form.employeeAcknowledgementDueDate ? new Date(form.employeeAcknowledgementDueDate) : undefined,
            };



            await api.post("/performance/cycle", payload);
            setSuccessMessage("Appraisal cycle scheduled successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Error creating appraisal cycle");
        }
    };

    return (
        <ProtectedRoute allowedRoles={["HR Manager", "System Admin", "HR Employee"]}>
            <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -right-32 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <ClipboardList className="w-8 h-8 text-emerald-500" />
                        <span className="text-white text-3xl">Schedule Appraisal Cycle</span>
                    </div>

                    {successMessage && (
                        <div className="mb-8 bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <Check className="w-5 h-5" />
                            {successMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                        {/* Basic Details */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h2 className="text-xl text-slate-300 mb-4">Cycle Details</h2>

                            <div className="space-y-1">
                                <label className="text-sm text-slate-400">Cycle Name</label>
                                <input
                                    placeholder="e.g. Annual Review 2025"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm text-slate-400">Description</label>
                                <textarea
                                    placeholder="Goals and objectives for this cycle..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all min-h-[100px]"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm text-slate-400">Cycle Type</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                    value={form.cycleType}
                                    onChange={(e) => setForm({ ...form, cycleType: e.target.value as AppraisalTemplateType })}
                                >
                                    {CYCLE_TYPES.map((t) => (
                                        <option key={t} value={t} className="bg-slate-900 text-slate-200">
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h2 className="text-xl text-slate-300 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-400" /> Timeline
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Start Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all [color-scheme:dark]"
                                            value={form.startDate}
                                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">End Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all [color-scheme:dark]"
                                            value={form.endDate}
                                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 my-4 pt-4 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Manager Review Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all [color-scheme:dark]"
                                        value={form.managerDueDate}
                                        onChange={(e) => setForm({ ...form, managerDueDate: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-500">Deadline for managers to complete evaluations</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400">Employee Acknowledgement Due</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all [color-scheme:dark]"
                                        value={form.employeeAcknowledgementDueDate}
                                        onChange={(e) => setForm({ ...form, employeeAcknowledgementDueDate: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-500">Deadline for employees to sign off</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={submit}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-black/20"
                        >
                            <Calendar className="w-5 h-5" />
                            Schedule Cycle
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
