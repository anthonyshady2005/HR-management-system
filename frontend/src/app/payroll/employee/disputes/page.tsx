'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

type Payslip = {
  _id: string;
  createdAt?: string | number | Date;
  payrollRunId?: { payrollPeriod?: string; createdAt?: string | number | Date } | string;
};

type Dispute = {
  _id: string;
  disputeId?: string;
  createdAt: string | number | Date;
  status?: string;
  resolutionComment?: string;
  rejectionReason?: string;
  description?: string;
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

// Map enum status values to user-friendly labels for display
// Backend enum values are human-readable strings (see DisputeStatus)
const statusLabelMap: Record<string, string> = {
  'under review': 'In Review',
  'pending payroll Manager approval': 'Pending Payroll Manager Approval',
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

const getEmployeeName = (dispute: Dispute) => {
  if (typeof dispute.employeeId === 'object' && dispute.employeeId) {
    return `${dispute.employeeId.firstName || ''} ${dispute.employeeId.lastName || ''}`.trim() || 'Unknown';
  }
  return typeof dispute.employeeId === 'string' ? dispute.employeeId : 'Unknown';
};

export default function EmployeeDisputesPage() {
  const { status, roles, currentRole } = useAuth();

  const [loadingMe, setLoadingMe] = useState(false);
  const [errorMe, setErrorMe] = useState<string | null>(null);
  const [myDisputes, setMyDisputes] = useState<Dispute[]>([]);

  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState<string | null>(null);
  const [allDisputes, setAllDisputes] = useState<Dispute[]>([]);

  const [loadingApproved, setLoadingApproved] = useState(false);
  const [errorApproved, setErrorApproved] = useState<string | null>(null);
  const [approvedDisputes, setApprovedDisputes] = useState<Dispute[]>([]);

  const [loadingPendingMgr, setLoadingPendingMgr] = useState(false);
  const [errorPendingMgr, setErrorPendingMgr] = useState<string | null>(null);
  const [pendingMgrDisputes, setPendingMgrDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchMy = async () => {
      setLoadingMe(true);
      setErrorMe(null);
      try {
        const res = await api.get('/payroll-tracking/disputes/me');
        setMyDisputes(res.data || []);
      } catch (e: any) {
        setErrorMe(e?.response?.data?.message || 'Failed to load your disputes');
      } finally {
        setLoadingMe(false);
      }
    };

    const fetchMyPayslips = async () => {
      setLoadingPayslips(true);
      setErrorPayslips(null);
      try {
        const res = await api.get('/payroll-tracking/payslips/me');
        setMyPayslips(res.data || []);
      } catch (e: any) {
        setErrorPayslips(e?.response?.data?.message || 'Failed to load your payslips');
      } finally {
        setLoadingPayslips(false);
      }
    };

    // Role-based fetches
    const isPayrollSpecialist = currentRole === 'Payroll Specialist';
    const isFinanceStaff = currentRole === 'Finance Staff';
    const isPayrollManager = currentRole === 'Payroll Manager';

    const fetchAll = async () => {
      setLoadingAll(true);
      setErrorAll(null);
      try {
        const res = await api.get('/payroll-tracking/disputes');
        setAllDisputes(res.data || []);
      } catch (e: any) {
        setErrorAll(e?.response?.data?.message || 'Failed to load all disputes');
      } finally {
        setLoadingAll(false);
      }
    };

    const fetchApproved = async () => {
      setLoadingApproved(true);
      setErrorApproved(null);
      try {
        const res = await api.get('/payroll-tracking/disputes/approved');
        setApprovedDisputes(res.data || []);
      } catch (e: any) {
        setErrorApproved(e?.response?.data?.message || 'Failed to load approved disputes');
      } finally {
        setLoadingApproved(false);
      }
    };

    const fetchPendingMgr = async () => {
      setLoadingPendingMgr(true);
      setErrorPendingMgr(null);
      try {
        const res = await api.get('/payroll-tracking/disputes/pending-approval');
        setPendingMgrDisputes(res.data || []);
      } catch (e: any) {
        setErrorPendingMgr(
          e?.response?.data?.message || 'Failed to load pending manager approval disputes'
        );
      } finally {
        setLoadingPendingMgr(false);
      }
    };

    // Always fetch my disputes
    void fetchMy();
    void fetchMyPayslips();
    if (isPayrollSpecialist) void fetchAll();
    if (isFinanceStaff) void fetchApproved();
    if (isPayrollManager) void fetchPendingMgr();
  }, [status, currentRole]);

  const sortDesc = (list: Dispute[]) => {
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

  const meSorted = useMemo(() => sortDesc(myDisputes), [myDisputes]);
  const allSorted = useMemo(() => sortDesc(allDisputes), [allDisputes]);
  const approvedSorted = useMemo(() => sortDesc(approvedDisputes), [approvedDisputes]);
  const pendingMgrSorted = useMemo(() => sortDesc(pendingMgrDisputes), [pendingMgrDisputes]);

  // Create Dispute modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [payslipIdInput, setPayslipIdInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  // Payslips for dropdown
  const [myPayslips, setMyPayslips] = useState<Payslip[]>([]);
  const [loadingPayslips, setLoadingPayslips] = useState(false);
  const [errorPayslips, setErrorPayslips] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const resetCreate = () => {
    setPayslipIdInput('');
    setDescriptionInput('');
    setCreateError(null);
  };

  const submitCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await api.post('/payroll-tracking/disputes', {
        payslipId: payslipIdInput.trim(),
        description: descriptionInput.trim(),
      });
      setCreateOpen(false);
      resetCreate();
      // refresh my disputes list after create
      try {
        const res = await api.get('/payroll-tracking/disputes/me');
        setMyDisputes(res.data || []);
      } catch { }
    } catch (e: any) {
      setCreateError(e?.response?.data?.message || 'Failed to create dispute');
    } finally {
      setCreating(false);
    }
  };

  // Dispute Details modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Dispute | null>(null);
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
  // Use backend enum values for submission
  const statusOptions = [
    { value: 'under review', label: 'In Review' },
    { value: 'pending payroll Manager approval', label: 'Pending Payroll Manager Approval' },
    { value: 'rejected', label: 'Rejected' },
  ] as const;
  const openStatusModal = (d: Dispute) => {
    setSelected(d);
    setStatusSelection(d.status || '');
    setStatusRejectionReason('');
    setStatusResolutionComment('');
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
      await api.patch(`/payroll-tracking/disputes/${selected._id}/status`, {
        status: statusSelection,
        rejectionReason: statusRejectionReason || undefined,
        resolutionComment: statusResolutionComment || undefined,
      });
      // refresh All Disputes after update
      const res = await api.get('/payroll-tracking/disputes');
      setAllDisputes(res.data || []);
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
  const openManagerModal = (d: Dispute) => {
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
      await api.patch(`/payroll-tracking/disputes/${selected._id}/confirm`, {
        approved: managerApproved,
        comment: managerComment || undefined,
      });
      // refresh pending manager approvals after decision
      const res = await api.get('/payroll-tracking/disputes/pending-approval');
      setPendingMgrDisputes(res.data || []);
      closeManagerModal();
    } catch (e: any) {
      setManagerError(e?.response?.data?.message || 'Failed to submit decision');
    } finally {
      setManagerActionUpdating(false);
    }
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
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl text-white">Disputes</h2>
              <p className="text-slate-400 text-sm">Review disputes relevant to your role</p>
            </div>
            <div className="ml-auto">
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 transition-all flex items-center gap-2"
                onClick={() => {
                  resetCreate();
                  setCreateOpen(true);
                }}
              >
                Create New Dispute
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
          {/* Create Dispute CTA moved to header */}
          {/* MODAL (portal) */}
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
                    <h3 className="text-lg">Create Dispute</h3>
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
                      <label className="block text-slate-300 text-sm mb-1">Select Payslip</label>
                      {loadingPayslips ? (
                        <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300">
                          Loading payslips…
                        </div>
                      ) : errorPayslips ? (
                        <div className="px-4 py-2 rounded-xl border border-red-500/30 bg-white/5 text-red-300">
                          {errorPayslips}
                        </div>
                      ) : (
                        <Select
                          value={payslipIdInput}
                          onValueChange={setPayslipIdInput}
                        >
                          <SelectTrigger className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-slate-500/50">
                            <SelectValue placeholder="Choose a payslip…" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border border-slate-700 text-white">
                            {myPayslips.length === 0 && (
                              <SelectItem
                                value="__none"
                                disabled
                              >
                                No payslips found
                              </SelectItem>
                            )}
                            {myPayslips.map((p) => {
                              return (
                                <SelectItem
                                  key={p._id}
                                  value={p._id}
                                >
                                  {`Payslip ${p._id.slice(-6)}`}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Description</label>
                      <textarea
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        placeholder="Describe the issue"
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
                      disabled={creating || !payslipIdInput.trim() || !descriptionInput.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 transition-all disabled:opacity-50"
                      onClick={submitCreate}
                    >
                      {creating ? 'Submitting…' : 'Submit Dispute'}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          {/* My disputes */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl text-white">My Disputes</h3>
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
                No disputes found.
              </div>
            )}
            {!loadingMe && !errorMe && meSorted.length > 0 && (
              <div className="flex flex-col gap-6">
                {meSorted.map((d) => (
                  <div
                    key={d._id}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => {
                      setSelected(d);
                      setDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white">{formatDate(d.createdAt)}</div>
                          <div className="text-xs text-slate-400">{d.disputeId ?? d._id}</div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${getStatusChipClasses(
                          d.status
                        )}`}
                      >
                        {getStatusLabel(d.status)}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      {d.description ||
                        d.resolutionComment ||
                        d.rejectionReason ||
                        'No details provided.'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* All disputes - Payroll Specialist */}
          {currentRole === 'Payroll Specialist' && (
            <section>
              <div className="mb-6">
                <h3 className="text-2xl text-white">All Disputes</h3>
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
                  No disputes found.
                </div>
              )}
              {!loadingAll && !errorAll && allSorted.length > 0 && (
                <div className="flex flex-col gap-6">
                  {allSorted.map((d) => (
                    <div
                      key={d._id}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                      onClick={() => {
                        setSelected(d);
                        setDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-white">{formatDate(d.createdAt)}</div>
                          <div className="text-xs text-slate-400">{d.disputeId ?? d._id}</div>
                          {d.employeeId && (
                            <div className="text-xs text-slate-400">Employee: {getEmployeeName(d)}</div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${getStatusChipClasses(
                            d.status
                          )}`}
                        >
                          {getStatusLabel(d.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-all text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openStatusModal(d);
                          }}
                        >
                          Change Status
                        </button>
                      </div>
                      <div className="text-slate-300">
                        {d.description || 'No details provided.'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Approved disputes - Finance Staff */}
          {currentRole === 'Finance Staff' && (
            <section>
              <div className="mb-6">
                <h3 className="text-2xl text-white">Approved Disputes</h3>
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
                  No disputes found.
                </div>
              )}
              {!loadingApproved && !errorApproved && approvedSorted.length > 0 && (
                <div className="flex flex-col gap-6">
                  {approvedSorted.map((d) => (
                    <div
                      key={d._id}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                      onClick={() => {
                        setSelected(d);
                        setDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-white">{formatDate(d.createdAt)}</div>
                          <div className="text-xs text-slate-400">{d.disputeId ?? d._id}</div>
                          {d.employeeId && (
                            <div className="text-xs text-slate-400">Employee: {getEmployeeName(d)}</div>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs border bg-green-500/20 text-green-300 border-green-500/30">
                          Approved
                        </span>
                      </div>
                      <div className="text-slate-300">
                        {d.resolutionComment || 'No details provided.'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Pending manager approval disputes - Payroll Manager */}
          {currentRole === 'Payroll Manager' && (
            <section>
              <div className="mb-6">
                <h3 className="text-2xl text-white">Pending Manager Approval</h3>
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
                  No disputes found.
                </div>
              )}
              {!loadingPendingMgr && !errorPendingMgr && pendingMgrSorted.length > 0 && (
                <div className="flex flex-col gap-6">
                  {pendingMgrSorted.map((d) => (
                    <div
                      key={d._id}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                      onClick={() => {
                        setSelected(d);
                        setDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-white">{formatDate(d.createdAt)}</div>
                          <div className="text-xs text-slate-400">{d.disputeId ?? d._id}</div>
                          {d.employeeId && (
                            <div className="text-xs text-slate-400">Employee: {getEmployeeName(d)}</div>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs border bg-amber-500/20 text-amber-300 border-amber-500/30">
                          Pending Manager Approval
                        </span>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-all text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openManagerModal(d);
                          }}
                        >
                          Confirm / Reject
                        </button>
                      </div>
                      <div className="text-slate-300">
                        {d.description || 'No details provided.'}
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
                  <h3 className="text-lg">Dispute Details</h3>
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
                      <div className="text-slate-400 text-xs mb-1">Dispute ID</div>
                      <div className="text-white">{selected.disputeId ?? selected._id}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Status</div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${getStatusChipClasses(
                          selected.status
                        )}`}
                      >
                        {getStatusLabel(selected.status)}
                      </span>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Created At</div>
                      <div className="text-white">{formatDate(selected.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Payslip ID</div>
                      <div className="text-white">{(selected as any).payslipId ?? '—'}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-slate-200 mb-2">Description</h4>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
                      {selected.description || '—'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Payroll Specialist</div>
                      <div className="text-white">
                        {(selected as any).payrollSpecialistId ?? '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Payroll Manager</div>
                      <div className="text-white">{(selected as any).payrollManagerId ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Finance Staff</div>
                      <div className="text-white">{(selected as any).financeStaffId ?? '—'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Resolution Comment</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
                        {(selected as any).resolutionComment ?? '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Rejection Reason</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
                        {(selected as any).rejectionReason ?? '—'}
                      </div>
                    </div>
                  </div>
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
                  <h3 className="text-lg">Update Dispute Status</h3>
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
                    <label className="block text-slate-300 text-sm mb-1">Status</label>
                    <Select
                      value={statusSelection}
                      onValueChange={setStatusSelection}
                    >
                      <SelectTrigger className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:border-slate-500/50">
                        <SelectValue placeholder="Choose a status…" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-white">
                        {statusOptions.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Rejection Reason</label>
                    <textarea
                      value={statusRejectionReason}
                      onChange={(e) => setStatusRejectionReason(e.target.value)}
                      placeholder="Reason for rejection (if applicable)"
                      rows={3}
                      className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Resolution Comment</label>
                    <textarea
                      value={statusResolutionComment}
                      onChange={(e) => setStatusResolutionComment(e.target.value)}
                      placeholder="Comment for resolution (if applicable)"
                      rows={3}
                      className="w-full px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
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

        {/* Manager Confirm/Reject Modal (Payroll Manager) */}
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
                  <h3 className="text-lg">Manager Decision</h3>
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
                  <div className="flex gap-3">
                    <button
                      className={`px-4 py-2 rounded-xl border ${managerApproved === true
                        ? 'bg-green-600/30 border-green-500/50'
                        : 'bg-white/5 border-white/10'
                        } hover:bg-white/10 transition-all`}
                      onClick={() => setManagerApproved(true)}
                    >
                      Approve
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl border ${managerApproved === false
                        ? 'bg-red-600/30 border-red-500/50'
                        : 'bg-white/5 border-white/10'
                        } hover:bg-white/10 transition-all`}
                      onClick={() => setManagerApproved(false)}
                    >
                      Reject
                    </button>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Comment</label>
                    <textarea
                      value={managerComment}
                      onChange={(e) => setManagerComment(e.target.value)}
                      placeholder="Optional comment"
                      rows={3}
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

// Render modal at root level
// Note: Keep component scoped; Next.js app router supports client-side portal
/* Modal Component injected above in JSX when createOpen is true */
