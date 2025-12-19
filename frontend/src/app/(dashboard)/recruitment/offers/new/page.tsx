"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Save,
  Loader,
  Plus,
  X,
} from "lucide-react";
import { recruitmentApi } from "@/lib/recruitment-api";
import { api } from "@/lib/api";

function NewOfferPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") || "";

  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [hrManagers, setHrManagers] = useState<Array<{
    _id: string;
    fullName: string;
    workEmail?: string;
  }>>([]);
  const [positions, setPositions] = useState<Array<{
    _id: string;
    title: string;
    code: string;
    departmentId?: string;
    departmentName?: string;
  }>>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    applicationId: applicationId,
    candidateId: "",
    hrEmployeeId: "",
    grossSalary: "",
    signingBonus: "",
    benefits: [] as string[],
    insurances: "",
    conditions: "",
    content: "",
    role: "",
    deadline: "",
    approvers: [] as Array<{
      employeeId: string;
      role: string;
      status: string;
    }>,
  });
  const [newBenefit, setNewBenefit] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // When applicationId changes, update candidateId
    if (formData.applicationId) {
      const application = applications.find(
        (app) =>
          (typeof app._id === 'string' ? app._id : app._id?.toString()) === formData.applicationId
      );
      if (application) {
        const candidateId = typeof application.candidateId === 'object' && application.candidateId?._id
          ? application.candidateId._id.toString()
          : application.candidateId?.toString() || "";
        setFormData((prev) => ({ ...prev, candidateId }));
      }
    }
  }, [formData.applicationId, applications]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [appsData, hrData, positionsData] = await Promise.all([
        recruitmentApi.getApplications({}),
        recruitmentApi.getHrManagers(),
        api.get("/organization-structure/positions/list").then(res => res.data || []).catch(() => []),
      ]);
      setApplications(appsData || []);
      setHrManagers(hrData || []);
      setPositions(positionsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicationId) {
      newErrors.applicationId = "Application is required";
    }
    if (!formData.candidateId) {
      newErrors.candidateId = "Candidate is required";
    }
    if (!formData.grossSalary || parseFloat(formData.grossSalary) <= 0) {
      newErrors.grossSalary = "Valid gross salary is required";
    }
    if (!formData.role) {
      newErrors.role = "Role is required";
    }
    if (!formData.content) {
      newErrors.content = "Offer content is required";
    }
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const offerData = {
        applicationId: formData.applicationId,
        candidateId: formData.candidateId,
        hrEmployeeId: formData.hrEmployeeId || undefined,
        grossSalary: parseFloat(formData.grossSalary),
        signingBonus: formData.signingBonus ? parseFloat(formData.signingBonus) : undefined,
        benefits: formData.benefits.length > 0 ? formData.benefits : undefined,
        insurances: formData.insurances || undefined,
        conditions: formData.conditions || undefined,
        content: formData.content,
        role: formData.role,
        deadline: new Date(formData.deadline).toISOString(),
        approvers: formData.approvers.length > 0 ? formData.approvers : undefined,
      };

      const result = await recruitmentApi.createOffer(offerData);
      router.push(`/recruitment/offers/${result._id}`);
    } catch (error: any) {
      console.error("Error creating offer:", error);
      alert(error?.response?.data?.message || "Failed to create offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };


  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/recruitment/offers"
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Create Offer</h1>
                    <p className="text-xs text-slate-400">Create a new job offer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Application & Candidate */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Application & Candidate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Application *
                  </label>
                  <select
                    value={formData.applicationId}
                    onChange={(e) =>
                      setFormData({ ...formData, applicationId: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border ${
                      errors.applicationId ? "border-red-500/50" : "border-white/10"
                    } text-white focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white`}
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", color: "white" }}
                  >
                    <option value="">Select Application</option>
                    {applications.map((app) => {
                      const appId = typeof app._id === 'string' ? app._id : app._id?.toString();
                      const candidateName = typeof app.candidateId === 'object' && app.candidateId
                        ? (app.candidateId.fullName || `${app.candidateId.firstName} ${app.candidateId.lastName}`)
                        : appId;
                      return (
                        <option key={appId} value={appId}>
                          {candidateName} - {appId?.slice(-8)}
                        </option>
                      );
                    })}
                  </select>
                  {errors.applicationId && (
                    <p className="text-red-400 text-xs mt-1">{errors.applicationId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Candidate ID *
                  </label>
                  <input
                    type="text"
                    value={formData.candidateId}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Offer Details */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Offer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Position *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border ${
                      errors.role ? "border-red-500/50" : "border-white/10"
                    } text-white focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white`}
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", color: "white" }}
                  >
                    <option value="">Select Position</option>
                    {positions.map((position) => (
                      <option key={position._id} value={position.title}>
                        {position.title} {position.departmentName ? `(${position.departmentName})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-red-400 text-xs mt-1">{errors.role}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    HR Employee
                  </label>
                  <select
                    value={formData.hrEmployeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, hrEmployeeId: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", color: "white" }}
                  >
                    <option value="">Select HR Employee</option>
                    {hrManagers.map((hr) => (
                      <option key={hr._id} value={hr._id}>
                        {hr.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Gross Salary *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.grossSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, grossSalary: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border ${
                      errors.grossSalary ? "border-red-500/50" : "border-white/10"
                    } text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50`}
                    placeholder="0.00"
                  />
                  {errors.grossSalary && (
                    <p className="text-red-400 text-xs mt-1">{errors.grossSalary}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Signing Bonus
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.signingBonus}
                    onChange={(e) =>
                      setFormData({ ...formData, signingBonus: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border ${
                      errors.deadline ? "border-red-500/50" : "border-white/10"
                    } text-white focus:outline-none focus:border-slate-500/50`}
                  />
                  {errors.deadline && (
                    <p className="text-red-400 text-xs mt-1">{errors.deadline}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Benefits</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBenefit();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                  placeholder="Add benefit"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-white text-sm flex items-center gap-2"
                  >
                    {benefit}
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Insurances */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Insurances</h2>
              <textarea
                value={formData.insurances}
                onChange={(e) =>
                  setFormData({ ...formData, insurances: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50 resize-none"
                placeholder="Enter insurance details (e.g., Health, Dental, Vision)"
              />
            </div>

            {/* Content & Conditions */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Offer Content</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={6}
                    className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border ${
                      errors.content ? "border-red-500/50" : "border-white/10"
                    } text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50 resize-none`}
                    placeholder="Enter offer letter content..."
                  />
                  {errors.content && (
                    <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Conditions
                  </label>
                  <textarea
                    value={formData.conditions}
                    onChange={(e) =>
                      setFormData({ ...formData, conditions: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50 resize-none"
                    placeholder="Enter any conditions or terms..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href="/recruitment/offers"
                className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Offer
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default function NewOfferPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <NewOfferPageContent />
    </Suspense>
  );
}

