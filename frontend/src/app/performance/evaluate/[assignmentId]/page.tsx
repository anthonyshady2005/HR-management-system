"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, AlertCircle, Info, User, Calendar, CheckCircle, Star } from "lucide-react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

interface RatingScale {
    type: string;
    min: number;
    max: number;
    labels?: string[];
}

interface Criterion {
    key: string;
    title: string;
    details?: string;
    weight?: number;
    required: boolean;
}

interface Template {
    _id: string;
    name: string;
    ratingScale: RatingScale;
    criteria: Criterion[];
    instructions?: string;
}

interface Assignment {
    _id: string;
    employeeProfileId: string;
    cycleId: string;
    templateId: string;
    managerProfileId: string;
    status: string;
    cycleName?: string; // Manually populated
    employeeName?: string; // Manually populated
    employeePosition?: string; // Manually populated
}

interface AttendanceSummary {
    daysPresent: number;
    lateArrivals: number;
    missedPunches: number;
    totalWorkMinutes: number;
}

export default function EvaluateAssignmentPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const assignmentId = params.assignmentId as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [template, setTemplate] = useState<Template | null>(null);
    const [recordId, setRecordId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedStatus, setSubmittedStatus] = useState<"DRAFT" | "SUBMITTED" | null>(null);

    // Form State
    const [ratings, setRatings] = useState<Record<string, { value: number; comment: string }>>({});
    const [managerSummary, setManagerSummary] = useState("");
    const [strengths, setStrengths] = useState("");
    const [improvementAreas, setImprovementAreas] = useState("");
    const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!assignmentId || !user) return;
            try {
                setIsLoading(true);
                // 1. Fetch Assignment
                const assignRes = await api.get(`/performance/assignments/${assignmentId}`);
                const assignData = assignRes.data;

                // 2. Fetch Template
                const templRes = await api.get(`/performance/templates/${assignData.templateId}`);
                const templData = templRes.data;

                setTemplate(templData);

                // 3. Fetch Context (Employee & Cycle) - Parallel for speed
                let empName = "Unknown Employee";
                let empPos = "Unknown Position";
                let cycName = "Unknown Cycle";

                try {
                    const [empRes, cycRes] = await Promise.all([
                        // Try standard profile fetch - assuming /employee-profile/:id
                        api.get(`/employee-profile/${assignData.employeeProfileId}`).catch(() => ({ data: null })),
                        api.get(`/performance/cycles`).then(res => ({ data: res.data.find((c: any) => c._id === assignData.cycleId) }))
                    ]);

                    if (empRes.data) {
                        empName = empRes.data.fullName || empRes.data.personalInfo?.firstName + " " + empRes.data.personalInfo?.lastName || empName;
                        empPos = empRes.data.position?.title || empPos; // Assuming populated or structured
                    }
                    if (cycRes.data) cycName = cycRes.data.name || cycName;

                } catch (innerErr) {
                    console.warn("Details fetch partial failure", innerErr);
                }

                setAssignment({
                    ...assignData,
                    employeeName: empName,
                    employeePosition: empPos,
                    cycleName: cycName
                });

                // 4. Try to fetch existing record
                try {
                    const recordRes = await api.get(`/performance/assignments/${assignmentId}/record`);
                    if (recordRes.data) {
                        const rec = recordRes.data;
                        setRecordId(rec._id);
                        setManagerSummary(rec.managerSummary || "");
                        setStrengths(rec.strengths || "");
                        setImprovementAreas(rec.improvementAreas || "");

                        if (rec.ratings && rec.ratings.length > 0) {
                            const existingRatings: Record<string, any> = {};
                            rec.ratings.forEach((r: any) => {
                                existingRatings[r.key] = { value: r.ratingValue, comment: r.comments || "" };
                            });
                            setRatings(existingRatings);
                        } else {
                            // Default init if ratings array is empty but record exists
                            const initialRatings: Record<string, any> = {};
                            templData.criteria.forEach((c: Criterion) => {
                                initialRatings[c.key] = { value: 0, comment: "" };
                            });
                            setRatings(initialRatings);
                        }
                    } else {
                        // No record exists yet, standard init
                        const initialRatings: Record<string, any> = {};
                        templData.criteria.forEach((c: Criterion) => {
                            initialRatings[c.key] = { value: 0, comment: "" };
                        });
                        setRatings(initialRatings);
                    }
                } catch (recErr) {
                    console.warn("No existing record found or error fetching it", recErr);
                    // Standard init fallback
                    const initialRatings: Record<string, any> = {};
                    templData.criteria.forEach((c: Criterion) => {
                        initialRatings[c.key] = { value: 0, comment: "" };
                    });
                    setRatings(initialRatings);
                }

                // 5. Fetch Attendance Summary
                try {
                    const attRes = await api.get(`/performance/assignments/${assignmentId}/attendance`);
                    setAttendance(attRes.data);
                } catch (attErr) {
                    console.warn("Failed to fetch attendance data", attErr);
                }

            } catch (err: any) {
                console.error("Failed to load evaluation data", err);
                setError(err.response?.data?.message || "Failed to load assignment details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [assignmentId, user]);

    const handleRatingChange = (key: string, value: number) => {
        setRatings(prev => ({
            ...prev,
            [key]: { ...prev[key], value }
        }));
    };

    const handleCommentChange = (key: string, comment: string) => {
        setRatings(prev => ({
            ...prev,
            [key]: { ...prev[key], comment }
        }));
    };

    const calculateProgress = () => {
        if (!template) return 0;
        const total = template.criteria.length;
        const filled = template.criteria.filter(c => ratings[c.key]?.value > 0).length;
        // Also check if summary is filled? Optional for progress bar
        return Math.round((filled / total) * 100);
    };

    const handleSubmit = async (isDraft: boolean = false) => {
        if (!assignment || !template || !user) return;

        // Validation for final submission
        if (!isDraft) {
            const missing = template.criteria.filter(c => c.required && ratings[c.key]?.value === 0);
            if (missing.length > 0) {
                alert(`Please provide ratings for: ${missing.map(c => c.title).join(", ")}`);
                return;
            }
            if (!managerSummary.trim()) {
                alert("Please provide a Manager Summary.");
                return;
            }
        }

        setIsSubmitting(true);

        const payload = {
            assignmentId: assignment._id,
            cycleId: assignment.cycleId,
            templateId: template._id,
            employeeProfileId: assignment.employeeProfileId,
            managerProfileId: user.id || assignment.managerProfileId, // Fallback
            ratings: Object.entries(ratings).map(([key, val]) => ({
                key,
                title: template.criteria.find(c => c.key === key)?.title || key,
                ratingValue: val.value,
                comments: val.comment
            })),
            managerSummary,
            strengths,
            improvementAreas,
            status: isDraft ? "DRAFT" : "MANAGER_SUBMITTED",
            managerSubmittedAt: isDraft ? undefined : new Date(),
        };

        try {
            if (recordId) {
                await api.put(`/performance/record/${recordId}`, payload);
            } else {
                await api.post("/performance/record", payload);
            }
            setSubmittedStatus(isDraft ? "DRAFT" : "SUBMITTED");
            setIsSuccess(true);
        } catch (err: any) {
            console.error("Submission failed", err);
            alert("Failed to submit appraisal. " + (err.response?.data?.message || ""));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !assignment || !template) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-xl font-bold mb-2">Error Loading Evaluation</h1>
                <p className="text-slate-400 mb-6">{error || "Assignment not found."}</p>
                <Link href="/performance/manager/assignments">
                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        Back to Assignments
                    </button>
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <ProtectedRoute allowedRoles={["Department Head", "department head"]}>
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative flex items-center justify-center overflow-hidden">
                    {/* Background Orbs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="relative z-10 max-w-lg w-full px-6 text-center animate-in fade-in zoom-in duration-500">
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">
                                {submittedStatus === "DRAFT" ? "Draft Saved!" : "Submission Successful!"}
                            </h1>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                {submittedStatus === "DRAFT"
                                    ? `Your progress for ${assignment?.employeeName} has been saved as a draft.`
                                    : `The performance evaluation for ${assignment?.employeeName} has been successfully recorded.`
                                }
                            </p>
                            <div className="flex flex-col gap-3">
                                <Link href="/performance/manager/assignments">
                                    <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all font-medium shadow-lg flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-5 h-5" />
                                        Back to My Assignments
                                    </button>
                                </Link>
                                <Link href="/performance/manager/evaluations">
                                    <button className="w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium flex items-center justify-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        View All My Evaluations
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={["Department Head", "department head"]}>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative">
                {/* Header Bar */}
                <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/performance/manager/assignments">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Evaluate: {assignment.employeeName}</h1>
                            <p className="text-xs text-slate-400">{assignment.employeePosition} • {assignment.cycleName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block mr-4 text-right">
                            <p className="text-xs text-slate-400 mb-1">Progress</p>
                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${calculateProgress()}%` }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Save Draft</span>
                        </button>
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 text-sm"
                        >
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                            {recordId ? "Update Appraisal" : "Submit Appraisal"}
                        </button>
                    </div>
                </div>

                <main className="max-w-4xl mx-auto px-6 py-8 pb-24 space-y-8">

                    {/* Instructions */}
                    {template.instructions && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 flex gap-4">
                            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-300 mb-1">Instructions</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">{template.instructions}</p>
                            </div>
                        </div>
                    )}

                    {/* Attendance Summary */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            Attendance & Punctuality Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="text-2xl font-bold text-green-400 mb-1">{attendance?.daysPresent ?? "--"}</div>
                                <div className="text-sm text-slate-400">Days Present</div>
                            </div>
                            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400 mb-1">
                                    {attendance ? Math.round(attendance.totalWorkMinutes / 60) : "--"}
                                </div>
                                <div className="text-sm text-slate-400">Total Hours</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-400 mb-1">{attendance?.lateArrivals ?? "--"}</div>
                                <div className="text-sm text-slate-400">Late Arrivals</div>
                            </div>
                            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="text-2xl font-bold text-red-400 mb-1">{attendance?.missedPunches ?? "--"}</div>
                                <div className="text-sm text-slate-400">Missed Punches</div>
                            </div>
                        </div>
                        {attendance && (
                            <div className="mt-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                <p className="text-xs text-slate-400 text-center">
                                    <Info className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
                                    This data is automatically synchronized from the Time Management module for the current appraisal cycle.
                                </p>
                            </div>
                        )}
                        {!attendance && !isLoading && (
                            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                                <p className="text-sm text-slate-400 text-center">
                                    <AlertCircle className="w-4 h-4 inline mr-1 text-yellow-500" />
                                    No attendance data found for this period.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Evaluation Criteria */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400" />
                            Performance Criteria
                        </h2>

                        {template.criteria.map((criterion, index) => (
                            <div key={criterion.key} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-white">
                                                {index + 1}. {criterion.title}
                                                {criterion.required && <span className="text-red-400 ml-1">*</span>}
                                            </h3>
                                            {criterion.weight && <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400">Weight: {criterion.weight}%</span>}
                                        </div>
                                        <p className="text-sm text-slate-400 mb-4">{criterion.details}</p>

                                        {/* Comment Input */}
                                        <textarea
                                            value={ratings[criterion.key]?.comment || ""}
                                            onChange={(e) => handleCommentChange(criterion.key, e.target.value)}
                                            placeholder="Add example or comment..."
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors h-24 resize-none"
                                        />
                                    </div>

                                    {/* Rating Input */}
                                    <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rating (1-{template.ratingScale.max})</label>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from({ length: template.ratingScale.max }, (_, i) => i + 1).map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => handleRatingChange(criterion.key, val)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-all flex items-center justify-center ${ratings[criterion.key]?.value === val
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-xs text-center text-slate-500 mt-1">
                                            {ratings[criterion.key]?.value ? 'Selected' : 'Select a rating'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Overall Summary */}
                    <div className="space-y-6 pt-6 border-t border-white/10">
                        <h2 className="text-xl font-bold text-white">Overall Assessment</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Manager Summary <span className="text-red-400">*</span></label>
                                <textarea
                                    value={managerSummary}
                                    onChange={(e) => setManagerSummary(e.target.value)}
                                    placeholder="Overall summary of performance..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors h-32"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Strengths</label>
                                <textarea
                                    value={strengths}
                                    onChange={(e) => setStrengths(e.target.value)}
                                    placeholder="Key strengths demonstrated..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors h-32"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-300">Areas for Improvement</label>
                                <textarea
                                    value={improvementAreas}
                                    onChange={(e) => setImprovementAreas(e.target.value)}
                                    placeholder="Areas to focus on for development..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors h-32"
                                />
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </ProtectedRoute>
    );
}
