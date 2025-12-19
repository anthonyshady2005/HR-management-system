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
  Loader,
  Copy,
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { recruitmentApi, type Offer } from "@/lib/recruitment-api";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OfferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, roles, currentRole } = useAuth();
  const rawId = params.id;
  // Ensure id is always a string
  const id = typeof rawId === 'string' ? rawId : (rawId as any)?._id?.toString() || String(rawId);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "approval" | "signing">("overview");
  const [candidateSigningLink, setCandidateSigningLink] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [signingType, setSigningType] = useState<'hr' | 'manager' | null>(null);
  const [typedName, setTypedName] = useState("");
  const [signing, setSigning] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    // If the ID is "new", redirect to the new offer page
    if (id === 'new') {
      router.push('/recruitment/offers/new');
      return;
    }
    if (id && id !== '[object Object]' && id.length > 0) {
      loadOffer();
    } else {
      console.error("Invalid offer ID:", id);
      setLoading(false);
    }
  }, [id, router]);

  // Auto-refresh offer status every 5 seconds if candidate hasn't signed yet
  useEffect(() => {
    if (!offer || offer.candidateSignedAt) {
      return; // Don't poll if already signed
    }

    const interval = setInterval(() => {
      loadOffer();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [offer?.candidateSignedAt, id]);

  // Load current user profile
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await api.get('/employee-profile/me');
        setCurrentUserProfile(response.data);
      } catch (error) {
        console.error('Failed to load current user profile:', error);
      }
    };
    if (user) {
      loadCurrentUser();
    }
  }, [user]);

  const loadOffer = async () => {
    // Double-check the ID is valid
    if (!id || id === '[object Object]' || id.length === 0) {
      console.error("Invalid offer ID:", id);
      setLoading(false);
      return;
    }
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

  const handleGenerateSigningLink = async () => {
    try {
      setGeneratingLink(true);
      // Try the direct endpoint first
      try {
        const result = await recruitmentApi.generateOfferSigningLink(id, 'candidate', 7);
        setCandidateSigningLink(result.signingUrl);
        alert("Signing link generated successfully!");
      } catch (directError: any) {
        // Fallback: Use sendOfferToCandidate which already generates the signing link
        // This works even if the new endpoint isn't registered yet
        console.warn("Direct endpoint failed, using sendOfferToCandidate as fallback:", directError);
        const result = await recruitmentApi.sendOfferToCandidate(id);
        if (result.signingUrl) {
          setCandidateSigningLink(result.signingUrl);
          alert("Signing link generated! (Note: Email was also sent to candidate. To avoid sending email, please restart your backend server to register the new endpoint.)");
        } else {
          throw new Error("No signing URL returned");
        }
      }
    } catch (error: any) {
      console.error("Error generating link:", error);
      alert(`Failed to generate link: ${error.response?.data?.message || error.message || "Please restart the backend server."}`);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    if (candidateSigningLink) {
      try {
        await navigator.clipboard.writeText(candidateSigningLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = candidateSigningLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    }
  };


  // Determine if current user can sign and what type
  const getSigningEligibility = () => {
    if (!currentUserProfile || !roles || roles.length === 0) {
      return { canSign: false, signerType: null, role: null, fullName: null };
    }

    const userFullName = currentUserProfile.fullName || `${currentUserProfile.firstName || ''} ${currentUserProfile.lastName || ''}`.trim();
    
    // Use currentRole if available, otherwise check all roles
    const activeRole = currentRole || roles[0];
    
    // Check if current role is an HR role (using actual backend enum values)
    const hasHrRole = activeRole === 'HR Manager' || 
      activeRole === 'HR Admin' || 
      activeRole === 'HR Employee' ||
      activeRole === 'System Admin';

    // Manager signature can only be signed by HR Manager (not department head)
    const hasManagerRole = activeRole === 'HR Manager' ||
      activeRole === 'System Admin';

    // Determine which signature they can provide
    if (hasHrRole && !offer?.hrSignedAt) {
      return { 
        canSign: true, 
        signerType: 'hr' as const, 
        role: 'HR',
        fullName: userFullName
      };
    }
    
    if (hasManagerRole && !offer?.managerSignedAt) {
      return { 
        canSign: true, 
        signerType: 'manager' as const, 
        role: 'Manager',
        fullName: userFullName
      };
    }

    return { canSign: false, signerType: null, role: null, fullName: userFullName };
  };

  const handleOpenSigningModal = (type: 'hr' | 'manager') => {
    setSigningType(type);
    setTypedName("");
    setNameError("");
    setSigningModalOpen(true);
  };

  const handleSignOffer = async () => {
    if (!signingType || !typedName.trim()) {
      setNameError("Please enter your full name");
      return;
    }

    const eligibility = getSigningEligibility();
    if (!eligibility.fullName) {
      setNameError("Unable to verify your identity. Please refresh the page.");
      return;
    }

    // Case-sensitive name verification
    if (typedName.trim() !== eligibility.fullName) {
      setNameError(`Name must match exactly: "${eligibility.fullName}" (case-sensitive)`);
      return;
    }

    try {
      setSigning(true);
      setNameError("");
      await api.post(`/recruitment/offers/${id}/sign`, {
        signerType: signingType,
        typedName: typedName.trim(),
      });
      setSigningModalOpen(false);
      setTypedName("");
      alert('Offer signed successfully!');
      loadOffer();
    } catch (error: any) {
      setNameError(error.response?.data?.message || "Failed to sign offer. Please try again.");
    } finally {
      setSigning(false);
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
              <div className="flex items-center gap-3">
                <button
                  onClick={loadOffer}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                  title="Refresh offer status"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
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
                  <p className="text-white">
                    {typeof offer.candidateId === 'object' && offer.candidateId?._id
                      ? offer.candidateId._id.toString()
                      : offer.candidateId?.toString() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Application ID</p>
                  <Link
                    href={`/recruitment/applications/${
                      typeof offer.applicationId === 'object' && offer.applicationId?._id
                        ? offer.applicationId._id
                        : offer.applicationId
                    }`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {typeof offer.applicationId === 'object' && offer.applicationId?._id
                      ? offer.applicationId._id.toString()
                      : offer.applicationId?.toString() || "N/A"}
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

              {/* Candidate Signing Link Section */}
              <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                    <p className="text-blue-400 font-semibold">Candidate Signing Link</p>
                  </div>
                  {!candidateSigningLink && (
                    <button
                      onClick={handleGenerateSigningLink}
                      disabled={generatingLink}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                    >
                      {generatingLink ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          Generate Link
                        </>
                      )}
                    </button>
                  )}
                </div>
                {candidateSigningLink ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                      <input
                        type="text"
                        value={candidateSigningLink}
                        readOnly
                        className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-2"
                        title="Copy link"
                      >
                        {linkCopied ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={candidateSigningLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Open in new tab
                      </a>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-slate-400 text-xs">Link expires in 7 days</span>
                    </div>
                    {!offer.candidateSignedAt && (
                      <p className="text-yellow-400 text-xs mt-2">
                        ⚠️ Share this link with the candidate to sign the offer
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">
                    Generate a signing link to share with the candidate
                  </p>
                )}
              </div>
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
              
              <div className="space-y-6">
                {/* Candidate Signature */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Candidate Signature</h3>
                    {offer.candidateSignedAt ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Signed
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                        Pending
                      </span>
                    )}
                  </div>
                  {offer.candidateSignedAt && (
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-400">
                        Signed: {new Date(offer.candidateSignedAt).toLocaleString()}
                      </p>
                      {offer.candidateTypedName && (
                        <p className="text-slate-300">
                          Name: {offer.candidateTypedName}
                        </p>
                      )}
                      {offer.candidateSigningIp && (
                        <p className="text-slate-400 text-xs">
                          IP: {offer.candidateSigningIp}
                        </p>
                      )}
                    </div>
                  )}
                  {!offer.candidateSignedAt && !candidateSigningLink && (
                    <button
                      onClick={handleGenerateSigningLink}
                      disabled={generatingLink}
                      className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      {generatingLink ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          Generate Signing Link
                        </>
                      )}
                    </button>
                  )}
                  {candidateSigningLink && !offer.candidateSignedAt && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                        <input
                          type="text"
                          value={candidateSigningLink}
                          readOnly
                          className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-2"
                          title="Copy link"
                        >
                          {linkCopied ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <a
                        href={candidateSigningLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Open in new tab
                      </a>
                    </div>
                  )}
                </div>

                {/* HR Signature */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">HR Signature</h3>
                    {offer.hrSignedAt ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Signed
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                        Pending
                      </span>
                    )}
                  </div>
                  {offer.hrSignedAt && (
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-400">
                        Signed: {new Date(offer.hrSignedAt).toLocaleString()}
                      </p>
                      {offer.hrTypedName && (
                        <p className="text-slate-300">
                          Name: {offer.hrTypedName}
                        </p>
                      )}
                      {offer.hrSigningIp && (
                        <p className="text-slate-400 text-xs">
                          IP: {offer.hrSigningIp}
                        </p>
                      )}
                    </div>
                  )}
                  {!offer.hrSignedAt && (() => {
                    const eligibility = getSigningEligibility();
                    const canSignAsHr = eligibility.canSign && eligibility.signerType === 'hr';
                    return canSignAsHr ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-sm text-slate-400 mb-1">Current User</p>
                          <p className="text-white font-semibold">{eligibility.fullName}</p>
                          <p className="text-xs text-slate-400 mt-1">Role: {eligibility.role}</p>
                        </div>
                        <button
                          onClick={() => handleOpenSigningModal('hr')}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Sign as HR
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        {!currentUserProfile ? "Loading user information..." : "You are not eligible to sign as HR"}
                      </p>
                    );
                  })()}
                </div>

                {/* Manager Signature */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Manager Signature</h3>
                    {offer.managerSignedAt ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Signed
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                        Pending
                      </span>
                    )}
                  </div>
                  {offer.managerSignedAt && (
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-400">
                        Signed: {new Date(offer.managerSignedAt).toLocaleString()}
                      </p>
                      {offer.managerTypedName && (
                        <p className="text-slate-300">
                          Name: {offer.managerTypedName}
                        </p>
                      )}
                      {offer.managerSigningIp && (
                        <p className="text-slate-400 text-xs">
                          IP: {offer.managerSigningIp}
                        </p>
                      )}
                    </div>
                  )}
                  {!offer.managerSignedAt && (() => {
                    const eligibility = getSigningEligibility();
                    const canSignAsManager = eligibility.canSign && eligibility.signerType === 'manager';
                    return canSignAsManager ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-sm text-slate-400 mb-1">Current User</p>
                          <p className="text-white font-semibold">{eligibility.fullName}</p>
                          <p className="text-xs text-slate-400 mt-1">Role: {eligibility.role}</p>
                        </div>
                        <button
                          onClick={() => handleOpenSigningModal('manager')}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Sign as Manager
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        {!currentUserProfile ? "Loading user information..." : "You are not eligible to sign as Manager"}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Signing Modal */}
      <Dialog open={signingModalOpen} onOpenChange={setSigningModalOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Sign Offer as {signingType === 'hr' ? 'HR' : 'Manager'}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Please verify your identity by typing your full name exactly as it appears in your profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Your Profile Name</p>
              <p className="text-white font-semibold">
                {getSigningEligibility().fullName || "Loading..."}
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Type your full name (case-sensitive):
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => {
                  setTypedName(e.target.value);
                  setNameError("");
                }}
                placeholder="Enter your full name exactly as shown above"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={signing}
                autoFocus
              />
              {nameError && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {nameError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setSigningModalOpen(false);
                setTypedName("");
                setNameError("");
              }}
              disabled={signing}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOffer}
              disabled={signing || !typedName.trim()}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Sign
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

