"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  FileText,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  User,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function OfferSignPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const offerId = resolvedParams.id;
  const token = searchParams.get("token") || "";
  const signerType = searchParams.get("signerType") || "candidate";

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [signing, setSigning] = useState(false);
  const [offer, setOffer] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    if (offerId && token) {
      validateToken();
    } else {
      setError("Missing offer ID or token");
      setLoading(false);
    }
  }, [offerId, token]);

  const validateToken = async () => {
    try {
      setValidating(true);
      const response = await api.get(
        `/recruitment/offers/${offerId}/validate-token`,
        {
          params: { token, signerType },
        }
      );
      setOffer(response.data.offer);
      setCandidate(response.data.candidate);
      setError("");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired signing link. Please contact HR."
      );
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  const handleSign = async () => {
    if (!typedName.trim()) {
      setError("Please enter your full name to sign");
      return;
    }

    try {
      setSigning(true);
      setError("");
      await api.post(`/recruitment/offers/${offerId}/sign-public`, {
        token,
        signerType,
        typedName: typedName.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to sign offer. Please try again or contact HR."
      );
    } finally {
      setSigning(false);
    }
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-lg shadow-black/20">
          <Loader className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-slate-300">Validating signing link...</p>
        </div>
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl font-bold text-white">Invalid Link</h1>
          </div>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-lg shadow-black/20">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Offer Signed Successfully!
          </h1>
          <p className="text-slate-300 mb-6">
            Your signature has been recorded. You will receive a confirmation
            email shortly.
          </p>
          <p className="text-sm text-slate-400">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden p-4 py-12">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Job Offer Letter</h1>
          </div>

          {candidate && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-slate-400" />
                <p className="text-slate-300">
                  <span className="text-slate-400">Candidate:</span>{" "}
                  {candidate.fullName}
                </p>
              </div>
              {candidate.personalEmail && (
                <p className="text-sm text-slate-400 ml-7">
                  {candidate.personalEmail}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Position</p>
                <p className="text-white font-semibold">{offer?.role || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Gross Salary</p>
                <p className="text-white font-semibold">
                  ${offer?.grossSalary?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>

            {offer?.signingBonus && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Signing Bonus</p>
                  <p className="text-white font-semibold">
                    ${offer.signingBonus.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {offer?.deadline && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Response Deadline</p>
                  <p className="text-white font-semibold">
                    {new Date(offer.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {offer?.benefits && offer.benefits.length > 0 && (
              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">Benefits</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {offer.benefits.map((benefit: string, idx: number) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {offer?.content && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">Offer Details</p>
                <p className="text-slate-300 whitespace-pre-wrap">
                  {offer.content}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-lg shadow-black/20">
          <h2 className="text-xl font-bold text-white mb-4">Sign Offer</h2>
          <p className="text-slate-300 mb-6">
            By signing below, you acknowledge that you have read and agree to
            the terms of this offer letter.
          </p>

          <div className="mb-6">
            <label className="block text-slate-300 mb-2">
              Enter your full name to sign:
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={signing}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={signing || !typedName.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20"
          >
            {signing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                I Agree and Sign
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 mt-4 text-center">
            By clicking "I Agree and Sign", you are electronically signing this
            offer letter.
          </p>
        </div>
      </div>
    </div>
  );
}

