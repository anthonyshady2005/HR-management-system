"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  MapPin,
  Users,
  Calendar,
  User,
  Save,
  Eye,
  X,
} from "lucide-react";
import { recruitmentApi } from "@/lib/recruitment-api";

interface JobTemplate {
  _id: string;
  title?: string;
  department?: string;
}

interface HrManager {
  _id: string;
  id: string;
  employeeNumber: string;
  name: string;
  firstName: string;
  lastName: string;
  fullName: string;
  workEmail?: string;
}

export default function NewJobPostingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [hrManagers, setHrManagers] = useState<HrManager[]>([]);
  const [loadingHrManagers, setLoadingHrManagers] = useState(true);
  const [formData, setFormData] = useState({
    requisitionId: "",
    templateId: "",
    openings: 1,
    location: "",
    hiringManagerId: "",
    publishStatus: "draft" as "draft" | "published" | "closed",
    postingDate: "",
    expiryDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadHrManagers();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await recruitmentApi.getJobTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadHrManagers = async () => {
    try {
      setLoadingHrManagers(true);
      const data = await recruitmentApi.getHrManagers();
      setHrManagers(data || []);
    } catch (error) {
      console.error("Error loading HR Managers:", error);
    } finally {
      setLoadingHrManagers(false);
    }
  };

  const generateRequisitionId = () => {
    const prefix = "REQ";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setFormData((prev) => ({ ...prev, templateId: "" }));
      return;
    }

    try {
      const template = await recruitmentApi.getJobTemplateById(templateId);
      // Auto-fill some fields from template if available
      setFormData((prev) => ({
        ...prev,
        templateId,
        // You can add more auto-fill logic here based on template structure
      }));
    } catch (error) {
      console.error("Error loading template:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.requisitionId.trim()) {
      newErrors.requisitionId = "Requisition ID is required";
    }

    if (!formData.openings || formData.openings < 1) {
      newErrors.openings = "Number of openings must be at least 1";
    }

    if (!formData.hiringManagerId.trim()) {
      newErrors.hiringManagerId = "Hiring Manager ID is required";
    }

    if (formData.postingDate && formData.expiryDate) {
      const posting = new Date(formData.postingDate);
      const expiry = new Date(formData.expiryDate);
      if (expiry <= posting) {
        newErrors.expiryDate = "Expiry date must be after posting date";
      }
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
      const response = await recruitmentApi.createJobRequisition({
        requisitionId: formData.requisitionId,
        templateId: formData.templateId || undefined,
        openings: formData.openings,
        location: formData.location || undefined,
        hiringManagerId: formData.hiringManagerId,
        publishStatus: formData.publishStatus,
        postingDate: formData.postingDate || undefined,
        expiryDate: formData.expiryDate || undefined,
      });

      // Redirect to the requisition detail page or back to dashboard
      router.push(`/recruitment/job-requisitions/${response._id}`);
    } catch (error: any) {
      console.error("Error creating job requisition:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create job requisition";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/recruitment"
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Create New Job Posting</h1>
                    <p className="text-xs text-slate-400">
                      Add a new job requisition
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </h2>

              <div className="space-y-4">
                {/* Requisition ID */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Requisition ID *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.requisitionId}
                      onChange={(e) =>
                        setFormData({ ...formData, requisitionId: e.target.value })
                      }
                      placeholder="REQ-123456-001"
                      className="flex-1 px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          requisitionId: generateRequisitionId(),
                        })
                      }
                      className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.requisitionId && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.requisitionId}
                    </p>
                  )}
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Job Template (Optional)
                  </label>
                  <select
                    value={formData.templateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                  >
                    <option value="">Select a template (optional)</option>
                    {loadingTemplates ? (
                      <option disabled>Loading templates...</option>
                    ) : (
                      templates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.title || template._id} {template.department ? `- ${template.department}` : ""}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a template to pre-fill job details
                  </p>
                </div>

                {/* Number of Openings */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Number of Openings *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.openings}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        openings: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                    required
                  />
                  {errors.openings && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.openings}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Remote, New York, San Francisco"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Hiring Details */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Hiring Details
              </h2>

              <div className="space-y-4">
                {/* Hiring Manager */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Hiring Manager *
                  </label>
                  <select
                    value={formData.hiringManagerId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hiringManagerId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                    required
                    disabled={loadingHrManagers}
                  >
                    <option value="">
                      {loadingHrManagers
                        ? "Loading HR Managers..."
                        : "Select a hiring manager"}
                    </option>
                    {hrManagers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.fullName} ({manager.employeeNumber})
                        {manager.workEmail ? ` - ${manager.workEmail}` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.hiringManagerId && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.hiringManagerId}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {hrManagers.length === 0 && !loadingHrManagers
                      ? "No HR Managers found. Please ensure the backend endpoint is implemented."
                      : "Select an HR Manager from the list"}
                  </p>
                </div>

                {/* Publish Status */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Publish Status
                  </label>
                  <select
                    value={formData.publishStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publishStatus: e.target.value as
                          | "draft"
                          | "published"
                          | "closed",
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Draft: Not visible to candidates. Published: Visible on
                    careers page. Closed: No longer accepting applications.
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Dates (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Posting Date */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Posting Date
                  </label>
                  <input
                    type="date"
                    value={formData.postingDate}
                    onChange={(e) =>
                      setFormData({ ...formData, postingDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    min={formData.postingDate || undefined}
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                  />
                  {errors.expiryDate && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.expiryDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/recruitment"
                className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Link>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Creating..." : "Create Job Posting"}
                </button>
              </div>
            </div>
          </form>

          {/* Preview Section */}
          {showPreview && (
            <div className="mt-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl text-white mb-4">Preview</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400">Requisition ID:</span>{" "}
                  <span className="text-white">{formData.requisitionId || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400">Openings:</span>{" "}
                  <span className="text-white">{formData.openings}</span>
                </div>
                <div>
                  <span className="text-slate-400">Location:</span>{" "}
                  <span className="text-white">
                    {formData.location || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Hiring Manager:</span>{" "}
                  <span className="text-white">
                    {formData.hiringManagerId
                      ? hrManagers.find((m) => m._id === formData.hiringManagerId)
                          ?.fullName || formData.hiringManagerId
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{" "}
                  <span className="text-white capitalize">
                    {formData.publishStatus}
                  </span>
                </div>
                {formData.postingDate && (
                  <div>
                    <span className="text-slate-400">Posting Date:</span>{" "}
                    <span className="text-white">
                      {new Date(formData.postingDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {formData.expiryDate && (
                  <div>
                    <span className="text-slate-400">Expiry Date:</span>{" "}
                    <span className="text-white">
                      {new Date(formData.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

