"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  XCircle,
  Briefcase,
  MapPin,
  Calendar,
} from "lucide-react";
import { recruitmentApi, type JobRequisition } from "@/lib/recruitment-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const requisitionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<JobRequisition | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    nationalId: "",
    mobilePhone: "",
    resume: null as File | null,
  });

  useEffect(() => {
    if (requisitionId) {
      loadJob();
    }
  }, [requisitionId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getJobRequisitionById(requisitionId);
      setJob(data);

      // Check if job is published
      if (data.publishStatus !== "published") {
        setError("This job posting is not currently accepting applications.");
      }

      // Check if expired
      if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
        setError("This job posting has expired and is no longer accepting applications.");
      }
    } catch (error: any) {
      console.error("Error loading job:", error);
      setError(error.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let candidateResponse: any = null;

    try {
      // Step 1: Create or find candidate profile
      candidateResponse = await api.post("/recruitment/candidates", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        personalEmail: formData.personalEmail,
        nationalId: formData.nationalId,
        mobilePhone: formData.mobilePhone,
      });
      // Ensure candidateId is a string
      const candidateId = typeof candidateResponse.data._id === 'string' 
        ? candidateResponse.data._id 
        : candidateResponse.data._id?.toString() || String(candidateResponse.data._id);

      // Ensure requisitionId is a string
      const requisitionIdStr = String(requisitionId);

      // Step 2: Create application first (we need the application ID for document linking)
      const applicationResponse = await recruitmentApi.createApplication({
        candidateId,
        requisitionId: requisitionIdStr,
      });
      const applicationId = typeof applicationResponse._id === 'string'
        ? applicationResponse._id
        : applicationResponse._id?.toString() || String(applicationResponse._id);

      // Step 3: Upload resume if provided (now we can link it to the application)
      if (formData.resume) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.resume);
        formDataUpload.append("type", "cv");
        formDataUpload.append("entityType", "application");
        formDataUpload.append("entityId", applicationId);

        try {
          await api.post(
            "/recruitment/documents",
            formDataUpload,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          // Resume uploaded successfully and linked to application
        } catch (uploadError) {
          console.error("Resume upload error:", uploadError);
          // Continue without resume - not critical
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/careers");
      }, 3000);
    } catch (err: any) {
      console.error("Application submission error:", err);
      console.error("Error details:", {
        message: err.response?.data?.message,
        status: err.response?.status,
        data: err.response?.data,
        candidateId: candidateResponse?.data?._id,
        requisitionId: requisitionId,
      });
      const errorMessage = err.response?.data?.message || 
        err.response?.data?.error ||
        (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : null) ||
        "Failed to submit application. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-slate-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-3xl font-bold mb-4">Unable to Load Job</h1>
            <p className="text-slate-400 mb-6">{error || "Job not found"}</p>
            <Link href="/careers">
              <Button variant="outline" className="bg-white/5 border-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Careers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const template = job.templateId as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/careers">
            <Button
              variant="ghost"
              className="mb-6 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Careers
            </Button>
          </Link>

          {success ? (
            <div className="text-center py-20">
              <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
              <h1 className="text-4xl font-bold mb-4">Application Submitted!</h1>
              <p className="text-xl text-slate-400 mb-8">
                Thank you for your interest. We've received your application and
                will review it shortly.
              </p>
              <p className="text-slate-500">
                Redirecting to careers page...
              </p>
            </div>
          ) : (
            <>
              {/* Job Summary */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  {job.title || template?.title || "Job Title"}
                </h1>
                <div className="flex flex-wrap gap-4 text-slate-400 mb-4">
                  {(() => {
                    const department = typeof job.departmentId === 'object' && job.departmentId !== null
                      ? (job.departmentId as { name?: string; code?: string }).name
                      : null;
                    return department ? (
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        {department}
                      </span>
                    ) : template?.department ? (
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        {template.department}
                      </span>
                    ) : null;
                  })()}
                  {job.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {job.location}
                    </span>
                  )}
                  {job.postingDate && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Posted {new Date(job.postingDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {template?.description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                    <p className="text-slate-300 whitespace-pre-line">
                      {template.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Application Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold mb-6">
                    Application Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-slate-300">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-2 bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-slate-300">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-2 bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="personalEmail" className="text-slate-300">
                        Email *
                      </Label>
                      <Input
                        id="personalEmail"
                        name="personalEmail"
                        type="email"
                        required
                        value={formData.personalEmail}
                        onChange={handleInputChange}
                        className="mt-2 bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nationalId" className="text-slate-300">
                        National ID *
                      </Label>
                      <Input
                        id="nationalId"
                        name="nationalId"
                        required
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        className="mt-2 bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mobilePhone" className="text-slate-300">
                        Phone Number
                      </Label>
                      <Input
                        id="mobilePhone"
                        name="mobilePhone"
                        type="tel"
                        value={formData.mobilePhone}
                        onChange={handleInputChange}
                        className="mt-2 bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="resume" className="text-slate-300">
                        Resume/CV (PDF, DOC, DOCX)
                      </Label>
                      <div className="mt-2">
                        <Input
                          id="resume"
                          name="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="bg-white/5 border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                        />
                        {formData.resume && (
                          <p className="mt-2 text-sm text-slate-400">
                            Selected: {formData.resume.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-white text-slate-950 hover:bg-slate-200"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Link href="/careers">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

