'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

type Claim = {
  _id: string;
  claimId?: string;
  createdAt: string | number | Date;
  status?: string;
  resolutionComment?: string;
  rejectionReason?: string;
  description?: string;
  claimType?: string;
  amount?: number;
  approvedAmount?: number;
  employeeId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    employeeId?: string;
  } | string;
};

const formatDate = (v: unknown) => {
  const d = v ? new Date(v as any) : null;
  return d && !isNaN(d.getTime())
    ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
    : '—';
};

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(amount || 0);

const statusLabelMap: Record<string, string> = {
  'under review': 'Under Review',
  'pending payroll Manager approval': 'Pending Manager Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};
const getStatusLabel = (status?: string) => (status ? statusLabelMap[status] ?? status : '—');
const getStatusChipClasses = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return 'bg-green-500/20 text-green-300 border-green-500/30';
  if (s === 'rejected') return 'bg-red-500/20 text-red-300 border-red-500/30';
  if (s === 'pending payroll manager approval' || s.includes('pending'))
    return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
};

const claimTypes = ['medical', 'travel', 'equipment', 'training', 'other'];

export default function EmployeeClaimsPage() {
  const { status, currentRole } = useAuth();

  // My Claims state
  const [loadingMe, setLoadingMe] = useState(false);
  const [errorMe, setErrorMe] = useState<string | null>(null);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);

  // All Claims state (Payroll Specialist)
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState<string | null>(null);
  const [allClaims, setAllClaims] = useState<Claim[]>([]);

  // Approved Claims state (Finance Staff)
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [errorApproved, setErrorApproved] = useState<string | null>(null);
  const [approvedClaims, setApprovedClaims] = useState<Claim[]>([]);

  // Pending Manager Approval state (Payroll Manager)
  const [loadingPendingMgr, setLoadingPendingMgr] = useState(false);
  const [errorPendingMgr, setErrorPendingMgr] = useState<string | null>(null);
  const [pendingMgrClaims, setPendingMgrClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchMy = async () => {
      setLoadingMe(true);
      setErrorMe(null);
      try {
        const res = await api.get('/payroll-tracking/claims/me');
        setMyClaims(res.data || []);
      } catch (e: any) {
        setErrorMe(e?.response?.data?.message || 'Failed to load your claims');
      } finally {
        setLoadingMe(false);
      }
    };

    const isPayrollSpecialist = currentRole === 'Payroll Specialist';
    const isFinanceStaff = currentRole === 'Finance Staff';
    const isPayrollManager = currentRole === 'Payroll Manager';

    const fetchAll = async () => {
      setLoadingAll(true);
      setErrorAll(null);
      try {
        const res = await api.get('/payroll-tracking/claims');
        setAllClaims(res.data || []);
      } catch (e: any) {
        setErrorAll(e?.response?.data?.message || 'Failed to load all claims');
      } finally {
        setLoadingAll(false);
      }
    };

    const fetchApproved = async () => {
      setLoadingApproved(true);
      setErrorApproved(null);
      try {
        const res = await api.get('/payroll-tracking/claims/approved');
        setApprovedClaims(res.data || []);
      } catch (e: any) {
        setErrorApproved(e?.response?.data?.message || 'Failed to load approved claims');
      } finally {
        setLoadingApproved(false);
      }
    };

    const fetchPendingMgr = async () => {
      setLoadingPendingMgr(true);
      setErrorPendingMgr(null);
      try {
        const res = await api.get('/payroll-tracking/claims/pending-approval');
        setPendingMgrClaims(res.data || []);
      } catch (e: any) {
        setErrorPendingMgr(
          e?.response?.data?.message || 'Failed to load pending manager approval claims'
        );
      } finally {
        setLoadingPendingMgr(false);
      }
    };

    // Always fetch my claims
    void fetchMy();
    if (isPayrollSpecialist) void fetchAll();
    if (isFinanceStaff) void fetchApproved();
    if (isPayrollManager) void fetchPendingMgr();
  }, [status, currentRole]);

  const sortDesc = (list: Claim[]) => {
    const toMillis = (v: unknown): number => {
      if (!v) return NaN;
      if (v instanceof Date) return v.getTime();
      if (typeof v === 'number') return v;
      if (typeof v === 'string') return new Date(v).getTime();
      if (typeof v === 'object' && (v as any).$date) return new Date((v as any).$date).getTime();
      return NaN;
    };
    return [...list].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
  };

  const meSorted = useMemo(() => sortDesc(myClaims), [myClaims]);
  const allSorted = useMemo(() => sortDesc(allClaims), [allClaims]);
  const approvedSorted = useMemo(() => sortDesc(approvedClaims), [approvedClaims]);
  const pendingMgrSorted = useMemo(() => sortDesc(pendingMgrClaims), [pendingMgrClaims]);

  // Create Claim modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [claimTypeInput, setClaimTypeInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const resetCreate = () => {
    setClaimTypeInput('');
    setAmountInput('');
    setDescriptionInput('');
    setCreateError(null);
  };

  const submitCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await api.post('/payroll-tracking/claims', {
        claimType: claimTypeInput.trim(),
        amount: parseFloat(amountInput),
        description: descriptionInput.trim(),
      });
      setCreateOpen(false);
      resetCreate();
      // refresh my claims list after create
      try {
        const res = await api.get('/payroll-tracking/claims/me');
        setMyClaims(res.data || []);
      } catch { }
    } catch (e: any) {
      setCreateError(e?.response?.data?.message || 'Failed to create claim');
    } finally {
      setCreating(false);
    }
  };

  // Claim Details modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Claim | null>(null);
  const closeDetail = () => {
    setDetailOpen(false);
    setSelected(null);
  };

  // Change Status modal (Payroll Specialist)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSelection, setStatusSelection] = useState('');
  const [statusRejectionReason, setStatusRejectionReason] = useState('');
  const [statusResolutionComment, setStatusResolutionComment] = useState('');
  const [statusApprovedAmount, setStatusApprovedAmount] = useState('');

  const statusOptions = [
    { value: 'under review', label: 'Under Review' },
    { value: 'pending payroll Manager approval', label: 'Pending Manager Approval' },
    { value: 'rejected', label: 'Rejected' },
  ] as const;

  const openStatusModal = (d: Claim) => {
    setSelected(d);
    setStatusSelection(d.status || '');
    setStatusRejectionReason('');
    setStatusResolutionComment('');
    setStatusApprovedAmount(d.amount?.toString() || '');
    setStatusError(null);
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setStatusUpdating(false);
    setStatusError(null);
  };

  const submitStatusUpdate = async () => {
    if (!selected?._id || !statusSelection) return;
    setStatusUpdating(true);
    setStatusError(null);
    try {
      await api.patch(`/payroll-tracking/claims/${selected._id}/status`, {
        status: statusSelection,
        rejectionReason: statusRejectionReason || undefined,
        resolutionComment: statusResolutionComment || undefined,
        approvedAmount: statusApprovedAmount ? parseFloat(statusApprovedAmount) : undefined,
      });
      // refresh All Claims after update
      const res = await api.get('/payroll-tracking/claims');
      setAllClaims(res.data || []);
      closeStatusModal();
    } catch (e: any) {
      setStatusError(e?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Manager Confirm/Reject modal (Payroll Manager)
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [managerActionUpdating, setManagerActionUpdating] = useState(false);
  const [managerError, setManagerError] = useState<string | null>(null);
  const [managerApproved, setManagerApproved] = useState<boolean | null>(null);
  const [managerComment, setManagerComment] = useState('');

  const openManagerModal = (d: Claim) => {
    setSelected(d);
    setManagerApproved(null);
    setManagerComment('');
    setManagerError(null);
    setManagerModalOpen(true);
  };

  const closeManagerModal = () => {
    setManagerModalOpen(false);
    setManagerActionUpdating(false);
    setManagerError(null);
  };

  const submitManagerDecision = async () => {
    if (!selected?._id || managerApproved === null) return;
    setManagerActionUpdating(true);
    setManagerError(null);
    try {
      await api.patch(`/payroll-tracking/claims/${selected._id}/confirm`, {
        approved: managerApproved,
        comment: managerComment || undefined,
      });
      // refresh pending manager approvals after decision
      const res = await api.get('/payroll-tracking/claims/pending-approval');
      setPendingMgrClaims(res.data || []);
      closeManagerModal();
    } catch (e: any) {
      setManagerError(e?.response?.data?.message || 'Failed to submit decision');
    } finally {
      setManagerActionUpdating(false);
    }
  };

  const getEmployeeName = (claim: Claim) => {
    if (typeof claim.employeeId === 'object' && claim.employeeId) {
      return `${claim.employeeId.firstName || ''} ${claim.employeeId.lastName || ''}`.trim() || 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl text-white">Claims</h2>
              <p className="text-slate-400 text-sm">Submit and manage expense claims</p>
            </div>
            <div className="ml-auto">
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 transition-all flex items-center gap-2"
                onClick={() => {
                  resetCreate();
                  setCreateOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Create New Claim
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
          {/* Create Claim Modal */}
          {isMounted &&
            createOpen &&
            createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setCreateOpen(false)}
                />
                <div className="relative w-full max-w-xl mx-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl text-white">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h3 className="text-lg">Create Claim</h3>
                    <button
                      className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      onClick={() => setCreateOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    {createError && (
                      <div className="backdrop-blur-xl bg-white/5 border border-red-500/30 text-red-300 rounded-xl px-4 py-2">
                        {createError}
                      </div>
                    )}
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Claim Type</label>
                      <Select value={claimTypeInput} onValueChange={setClaimTypeInput}>
                        <SelectTrigger className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-slate-500/50">
                          <SelectValue placeholder="Select claim type…" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border border-slate-700 text-white">
                          {claimTypes.map((type) => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Amount (EGP)</label>
                      <input
                        type="number"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Description</label>
                      <textarea
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        placeholder="Describe the expense"
                        rows={4}
                        className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                      />
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                    <button
                      className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      onClick={() => setCreateOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={creating || !claimTypeInput.trim() || !amountInput || !descriptionInput.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 transition-all disabled:opacity-50"
                      onClick={submitCreate}
                    >
                      {creating ? 'Submitting…' : 'Submit Claim'}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* My Claims Section */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl text-white">My Claims</h3>
              </div>
            </div>
            {loadingMe && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
                Loading…
              </div>
            )}
            {errorMe && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-red-300 border-red-500/30">
                {errorMe}
              </div>
            )}
            {!loadingMe && !errorMe && meSorted.length === 0 && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
                No claims found. Click "Create New Claim" to submit an expense claim.
              </div>
            )}
            {!loadingMe && !errorMe && meSorted.length > 0 && (
              <div className="flex flex-col gap-6">
                {meSorted.map((c) => (
                  <div
                    key={c._id}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => {
                      setSelected(c);
                      setDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white">{c.claimId ?? c._id}</div>
                          <div className="text-xs text-slate-400 capitalize">{c.claimType} • {formatCurrency(c.amount)}</div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${getStatusChipClasses(c.status)}`}
                      >
                        {getStatusLabel(c.status)}
                      </span>
                    </div>
                    <div className="text-slate-300 text-sm">
                      {c.description || 'No details provided.'}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{formatDate(c.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* All Claims - Payroll Specialist */}
          {currentRole === 'Payroll Specialist' && (
            <section>
              <div className="mb-6">
                <h3 className="text-2xl text-white">All Claims</h3>
                <p className="text-slate-400 text-sm">Review and update claim statuses</p>
              </div>
              {loadingAll && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
                  Loading…
                </div>
              )}
              {errorAll && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-red-300 border-red-500/30">
                  {errorAll}
                </div>
              )}
              {!loadingAll && !errorAll && allSorted.length === 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
                  No claims found.
                </div>
              )}
              {!loadingAll && !errorAll && allSorted.length > 0 && (
                <div className="flex flex-col gap-6">
                  {allSorted.map((c) => (
                    <div
                      key={c._id}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-white">{c.claimId ?? c._id}</div>
                          <div className="text-xs text-slate-400 capitalize">{c.claimType} • {formatCurrency(c.amount)}</div>
                          <div className="text-xs text-slate-400">Employee: {getEmployeeName(c)}</div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${getStatusChipClasses(c.status)}`}
                        >
                          {getStatusLabel(c.status)}
                        </span>
                      </div>
                      <div className="text-slate-300 text-sm">{c.description || 'No details provided.'}</div>
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-slate-500">{formatDate(c.createdAt)}</div>
                        <button
                          className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-all text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openStatusModal(c);
                          }}
                        >
                          Change Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Approved Claims - Finance Staff */}
          {currentRole === 'Finance Staff' && (
            <section>
              <div className="mb-6">
                <h3 className="text-2xl text-white">Approved Claims</h3>
                <p className="text-slate-400 text-sm">Claims approved for refund processing</p>
              </div>
              {loadingApproved && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
                  Loading…
                </div>
              )}
              {errorApproved && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-red-300 border-red-500/30">
                  {errorApproved}
                </div>
              )}
              {!loadingApproved && !errorApproved && approvedSorted.length === 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
                  No approved claims found.
                </div>
              )}
              {!loadingApproved && !errorApproved && approvedSorted.length > 0 && (
                <div className="flex flex-col gap-6">
                  {approvedSorted.map((c) => (
                    <div
                      key={c._id}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => {
                        setSelected(c);
                        setDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-white">{c.claimId ?? c._id}</div>
                          <div className="text-xs text-slate-400 capitalize">{c.claimType} • {formatCurrency(c.approvedAmount || c.amount)}</div>
                          <div className="text-xs text-slate-400">Employee: {getEmployeeName(c)}</div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs border bg-green-500/20 text-green-300 border-green-500/30">
                          Approved
                        </span>
                      </div>
                      <div className="text-slate-300 text-sm">{c.resolutionComment || c.description || 'No details provided.'}</div>
                      <div className="text-xs text-slate-500 mt-2">{formatDate(c.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Pending Manager Approval - Payroll Manager */}
          {currentRole === 'Payroll Manager' && (
            <section>
              <div className="mb-6">
                <h3 className="text-2xl text-white">Pending Manager Approval</h3>
                <p className="text-slate-400 text-sm">Claims awaiting your confirmation</p>
              </div>
              {loadingPendingMgr && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
                  Loading…
                </div>
              )}
              {errorPendingMgr && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-red-300 border-red-500/30">
                  {errorPendingMgr}
                </div>
              )}
              {!loadingPendingMgr && !errorPendingMgr && pendingMgrSorted.length === 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
                  No claims pending your approval.
                </div>
              )}
              {!loadingPendingMgr && !errorPendingMgr && pendingMgrSorted.length > 0 && (
                <div className="flex flex-col gap-6">
                  {pendingMgrSorted.map((c) => (
                    <div
                      key={c._id}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-white">{c.claimId ?? c._id}</div>
                          <div className="text-xs text-slate-400 capitalize">{c.claimType} • {formatCurrency(c.amount)}</div>
                          <div className="text-xs text-slate-400">Employee: {getEmployeeName(c)}</div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs border bg-amber-500/20 text-amber-300 border-amber-500/30">
                          Pending Manager Approval
                        </span>
                      </div>
                      <div className="text-slate-300 text-sm">{c.description || 'No details provided.'}</div>
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-slate-500">{formatDate(c.createdAt)}</div>
                        <button
                          className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-all text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openManagerModal(c);
                          }}
                        >
                          Confirm / Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        {/* Details Modal */}
        {isMounted &&
          detailOpen &&
          selected &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeDetail}
              />
              <div className="relative w-full max-w-2xl mx-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl text-white">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h3 className="text-lg">Claim Details</h3>
                  <button
                    className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    onClick={closeDetail}
                  >
                    Close
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Claim ID</div>
                      <div className="text-white">{selected.claimId ?? selected._id}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Status</div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${getStatusChipClasses(selected.status)}`}
                      >
                        {getStatusLabel(selected.status)}
                      </span>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Type</div>
                      <div className="text-white capitalize">{selected.claimType || '—'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Amount</div>
                      <div className="text-white">{formatCurrency(selected.amount)}</div>
                    </div>
                    {selected.approvedAmount && selected.approvedAmount !== selected.amount && (
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Approved Amount</div>
                        <div className="text-emerald-400">{formatCurrency(selected.approvedAmount)}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Created At</div>
                      <div className="text-white">{formatDate(selected.createdAt)}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-slate-200 mb-2">Description</h4>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
                      {selected.description || '—'}
                    </div>
                  </div>

                  {(selected.resolutionComment || selected.rejectionReason) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selected.resolutionComment && (
                        <div>
                          <div className="text-slate-400 text-xs mb-1">Resolution Comment</div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
                            {selected.resolutionComment}
                          </div>
                        </div>
                      )}
                      {selected.rejectionReason && (
                        <div>
                          <div className="text-slate-400 text-xs mb-1">Rejection Reason</div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
                            {selected.rejectionReason}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Change Status Modal (Payroll Specialist) */}
        {isMounted &&
          statusModalOpen &&
          selected &&
          currentRole === 'Payroll Specialist' &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeStatusModal}
              />
              <div className="relative w-full max-w-xl mx-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl text-white">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h3 className="text-lg">Change Claim Status</h3>
                  <button
                    className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    onClick={closeStatusModal}
                  >
                    Close
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {statusError && (
                    <div className="backdrop-blur-xl bg-white/5 border border-red-500/30 text-red-300 rounded-xl px-4 py-2">
                      {statusError}
                    </div>
                  )}
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">New Status</label>
                    <Select value={statusSelection} onValueChange={setStatusSelection}>
                      <SelectTrigger className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white">
                        <SelectValue placeholder="Select status…" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-white">
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Approved Amount (optional)</label>
                    <input
                      type="number"
                      value={statusApprovedAmount}
                      onChange={(e) => setStatusApprovedAmount(e.target.value)}
                      placeholder="Enter approved amount"
                      className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Resolution Comment (optional)</label>
                    <textarea
                      value={statusResolutionComment}
                      onChange={(e) => setStatusResolutionComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
                  {statusSelection === 'rejected' && (
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Rejection Reason</label>
                      <textarea
                        value={statusRejectionReason}
                        onChange={(e) => setStatusRejectionReason(e.target.value)}
                        placeholder="Explain why the claim is rejected..."
                        rows={2}
                        className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                      />
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    onClick={closeStatusModal}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={statusUpdating || !statusSelection}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 transition-all disabled:opacity-50"
                    onClick={submitStatusUpdate}
                  >
                    {statusUpdating ? 'Updating…' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Manager Confirm/Reject Modal */}
        {isMounted &&
          managerModalOpen &&
          selected &&
          currentRole === 'Payroll Manager' &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeManagerModal}
              />
              <div className="relative w-full max-w-xl mx-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl text-white">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h3 className="text-lg">Confirm or Reject Claim</h3>
                  <button
                    className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    onClick={closeManagerModal}
                  >
                    Close
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {managerError && (
                    <div className="backdrop-blur-xl bg-white/5 border border-red-500/30 text-red-300 rounded-xl px-4 py-2">
                      {managerError}
                    </div>
                  )}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-white font-medium">{selected.claimId ?? selected._id}</div>
                    <div className="text-slate-400 text-sm capitalize">{selected.claimType} • {formatCurrency(selected.amount)}</div>
                    <div className="text-slate-300 text-sm mt-2">{selected.description}</div>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Your Decision</label>
                    <div className="flex gap-3">
                      <button
                        className={`flex-1 px-4 py-3 rounded-xl border transition-all ${managerApproved === true
                            ? 'bg-green-500/20 border-green-500/50 text-green-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        onClick={() => setManagerApproved(true)}
                      >
                        ✓ Confirm
                      </button>
                      <button
                        className={`flex-1 px-4 py-3 rounded-xl border transition-all ${managerApproved === false
                            ? 'bg-red-500/20 border-red-500/50 text-red-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        onClick={() => setManagerApproved(false)}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Comment (optional)</label>
                    <textarea
                      value={managerComment}
                      onChange={(e) => setManagerComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    onClick={closeManagerModal}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={managerActionUpdating || managerApproved === null}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 transition-all disabled:opacity-50"
                    onClick={submitManagerDecision}
                  >
                    {managerActionUpdating ? 'Submitting…' : 'Submit Decision'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
