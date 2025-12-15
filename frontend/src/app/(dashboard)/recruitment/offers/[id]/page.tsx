"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import { recruitmentApi, type Offer } from "@/lib/recruitment-api";

export default function OfferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "approval" | "signing">("overview");

  useEffect(() => {
    if (id) {
      loadOffer();
    }
  }, [id]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getOfferById(id);
      setOffer(data);
    } catch (error) {
      console.error("Error loading offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResponseColor = (response: string) => {
    switch (response?.toLowerCase()) {
      case "accepted":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading offer...</div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Offer not found</div>
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
                    <h1 className="text-white">Offer #{id.slice(-8)}</h1>
                    <p className="text-xs text-slate-400">View offer details</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">Candidate Response</p>
                <span
                  className={`px-4 py-2 rounded-lg text-sm border inline-block ${getResponseColor(
                    offer.applicantResponse
                  )}`}
                >
                  {offer.applicantResponse || "N/A"}
                </span>
              </div>
              {offer.deadline && (
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-2">Deadline</p>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4" />
                    {new Date(offer.deadline).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {(["overview", "approval", "signing"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl transition-all capitalize ${
                  activeTab === tab
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Offer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Candidate ID</p>
                  <p className="text-white">{offer.candidateId?.toString() || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Application ID</p>
                  <Link
                    href={`/recruitment/applications/${offer.applicationId}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {offer.applicationId?.toString() || "N/A"}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Gross Salary
                  </p>
                  <p className="text-white">
                    ${offer.grossSalary?.toLocaleString() || "N/A"}
                  </p>
                </div>
                {offer.signingBonus && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Signing Bonus</p>
                    <p className="text-white">
                      ${offer.signingBonus.toLocaleString()}
                    </p>
                  </div>
                )}
                {offer.role && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Role</p>
                    <p className="text-white">{offer.role}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-400 mb-1">Created At</p>
                  <p className="text-white">
                    {offer.createdAt
                      ? new Date(offer.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              {offer.benefits && offer.benefits.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-slate-400 mb-2">Benefits</p>
                  <div className="flex flex-wrap gap-2">
                    {offer.benefits.map((benefit: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "approval" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Approval Workflow</h2>
              <p className="text-slate-400">
                Approval workflow details coming soon
              </p>
            </div>
          )}

          {activeTab === "signing" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Signing Status</h2>
              <p className="text-slate-400">
                Signature management coming soon
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

