"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Users,
  Video,
  MapPin,
  Clock,
  Save,
  Loader,
} from "lucide-react";
import {
  recruitmentApi,
  employeeApi,
  type EmployeeForDropdown,
} from "@/lib/recruitment-api";


function NewInterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") || "";

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Array<{
    _id: string;
    id: string;
    employeeNumber: string;
    name: string;
    firstName: string;
    lastName: string;
    fullName: string;
    workEmail?: string;
  }>>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [formData, setFormData] = useState({
    applicationId: applicationId,
    stage: "screening",
    scheduledDate: "",
    scheduledTime: "",
    method: "onsite",
    location: "",
    videoLink: "",
    panel: [] as string[],
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      // Using HR managers for now - can be expanded to all employees later
      const data = await recruitmentApi.getHrManagers();
      setEmployees(data || []);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicationId.trim()) {
      newErrors.applicationId = "Application ID is required";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Scheduled date is required";
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = "Scheduled time is required";
    }

    if (!formData.method) {
      newErrors.method = "Interview method is required";
    }

    if (formData.method === "onsite" && !formData.location.trim()) {
      newErrors.location = "Location is required for in-person interviews";
    }

    if (formData.method === "video" && !formData.videoLink.trim()) {
      newErrors.videoLink = "Video link is required for video interviews";
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
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      ).toISOString();

      const interviewData = {
        applicationId: formData.applicationId,
        stage: formData.stage,
        scheduledDate: scheduledDateTime,
        method: formData.method,
        location: formData.method === "onsite" ? formData.location : undefined,
        videoLink: formData.method === "video" ? formData.videoLink : undefined,
        panel: formData.panel,
        notes: formData.notes || undefined,
      };

      const result = await recruitmentApi.createInterview(interviewData);
      
      // Optionally send calendar invite
      try {
        await recruitmentApi.sendCalendarInvite(result._id);
      } catch (error) {
        console.error("Error sending calendar invite:", error);
        // Don't fail the whole operation if calendar invite fails
      }

      router.push(`/recruitment/interviews/${result._id}`);
    } catch (error: any) {
      console.error("Error creating interview:", error);
      alert(error?.response?.data?.message || "Failed to create interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePanelMember = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      panel: prev.panel.includes(employeeId)
        ? prev.panel.filter((id) => id !== employeeId)
        : [...prev.panel, employeeId],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                href={applicationId ? `/recruitment/applications/${applicationId}` : "/recruitment/interviews"}
                className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white">Schedule Interview</h1>
                  <p className="text-xs text-slate-400">
                    Create a new interview for an application
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Interview Details
              </h2>

              <div className="space-y-4">
                {/* Application ID */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Application ID *
                  </label>
                  <input
                    type="text"
                    value={formData.applicationId}
                    readOnly
                    placeholder="Application ID"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-slate-400 placeholder:text-slate-500 cursor-not-allowed opacity-75"
                    required
                  />
                  {errors.applicationId && (
                    <p className="text-red-400 text-xs mt-1">{errors.applicationId}</p>
                  )}
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Interview Stage *
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                    }}
                    required
                  >
                    <option value="screening">Screening</option>
                    <option value="department_interview">Department Interview</option>
                    <option value="hr_interview">HR Interview</option>
                    <option value="offer">Offer Stage</option>
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledDate: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                      required
                    />
                    {errors.scheduledDate && (
                      <p className="text-red-400 text-xs mt-1">{errors.scheduledDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledTime: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                      required
                    />
                    {errors.scheduledTime && (
                      <p className="text-red-400 text-xs mt-1">{errors.scheduledTime}</p>
                    )}
                  </div>
                </div>

                {/* Method */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Interview Method *
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) =>
                      setFormData({ ...formData, method: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                    }}
                    required
                  >
                    <option value="onsite">In Person</option>
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                  </select>
                  {errors.method && (
                    <p className="text-red-400 text-xs mt-1">{errors.method}</p>
                  )}
                </div>

                {/* Location (for in-person) */}
                {formData.method === "onsite" && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Interview location"
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                      required
                    />
                    {errors.location && (
                      <p className="text-red-400 text-xs mt-1">{errors.location}</p>
                    )}
                  </div>
                )}

                {/* Video Link (for video) */}
                {formData.method === "video" && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video Link *
                    </label>
                    <input
                      type="url"
                      value={formData.videoLink}
                      onChange={(e) =>
                        setFormData({ ...formData, videoLink: e.target.value })
                      }
                      placeholder="https://meet.google.com/..."
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                      required
                    />
                    {errors.videoLink && (
                      <p className="text-red-400 text-xs mt-1">{errors.videoLink}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Panel Members */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Panel Members
              </h2>

              {loadingEmployees ? (
                <p className="text-slate-400">Loading employees...</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {employees.map((employee) => (
                    <label
                      key={employee._id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={formData.panel.includes(employee._id)}
                        onChange={() => togglePanelMember(employee._id)}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          {employee.fullName} ({employee.employeeNumber})
                        </p>
                        {employee.workEmail && (
                          <p className="text-slate-400 text-xs">{employee.workEmail}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Additional Notes</h2>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any additional notes or instructions for the interview..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href={applicationId ? `/recruitment/applications/${applicationId}` : "/recruitment/interviews"}
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
                    Schedule Interview
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

export default function NewInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <NewInterviewPageContent />
    </Suspense>
  );
}

