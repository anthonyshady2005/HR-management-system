"use client";

import { useState, useEffect } from "react";
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

export default function ContractSignPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = params.id;
  const token = searchParams.get("token") || "";
  const signerType = searchParams.get("signerType") || "employee";

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [signing, setSigning] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    if (contractId && token) {
      validateToken();
    } else {
      setError("Missing contract ID or token");
      setLoading(false);
    }
  }, [contractId, token]);

  const validateToken = async () => {
    try {
      setValidating(true);
      const response = await api.get(
        `/recruitment/contracts/${contractId}/validate-token`,
        {
          params: { token, signerType },
        }
      );
      setContract(response.data.contract);
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
      await api.post(`/recruitment/contracts/${contractId}/sign-public`, {
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
          "Failed to sign contract. Please try again or contact HR."
      );
    } finally {
      setSigning(false);
    }
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <Loader className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-slate-300">Validating signing link...</p>
        </div>
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl font-bold text-white">Invalid Link</h1>
          </div>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Contract Signed Successfully!
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">
              Employment Contract
            </h1>
          </div>

          {candidate && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-slate-400" />
                <p className="text-slate-300">
                  <span className="text-slate-400">Employee:</span>{" "}
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
                <p className="text-white font-semibold">
                  {contract?.role || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Gross Salary</p>
                <p className="text-white font-semibold">
                  ${contract?.grossSalary?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>

            {contract?.signingBonus && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Signing Bonus</p>
                  <p className="text-white font-semibold">
                    ${contract.signingBonus.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {contract?.acceptanceDate && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Acceptance Date</p>
                  <p className="text-white font-semibold">
                    {new Date(contract.acceptanceDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {contract?.benefits && contract.benefits.length > 0 && (
              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">Benefits</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {contract.benefits.map((benefit: string, idx: number) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Sign Contract</h2>
          <p className="text-slate-300 mb-6">
            By signing below, you acknowledge that you have read and agree to
            the terms of this employment contract.
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
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
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
            employment contract.
          </p>
        </div>
      </div>
    </div>
  );
}

