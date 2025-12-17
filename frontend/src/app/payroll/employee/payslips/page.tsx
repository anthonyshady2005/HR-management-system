'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { FileDown, FileText, DollarSign, X } from 'lucide-react';

type Payslip = {
  _id: string;
  createdAt: string;
  paymentStatus: string;
  totalGrossSalary: number;
  netPay: number;
  totaDeductions?: number;
  earningsDetails?: {
    baseSalary?: number;
    allowances?: Array<{ name?: string; amount?: number; value?: number }>;
  };
  deductionsDetails?: {
    taxes?: Array<{ name?: string; amount?: number; value?: number }>;
    insurances?: Array<{ name?: string; amount?: number; value?: number }>;
    penalties?:
      | { total?: number; items?: Array<{ reason?: string; amount?: number }> }
      | { penalties?: Array<{ reason?: string; amount?: number }> };
  };
  payrollRunId?: {
    createdAt?: string;
    payrollPeriod?: string;
    runId?: string;
  };
};

export default function EmployeePayslipsPage() {
  const { status } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  // Modal/detail state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/payroll-tracking/payslips/me');
        setPayslips(res.data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load payslips');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [status]);

  // ESC to close modal
  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailOpen]);

  const formatNumber = (n: number | undefined) =>
    typeof n === 'number' ? n.toLocaleString() : '—';

  const sumAllowances = (p: Payslip) => {
    const items = p.earningsDetails?.allowances || [];
    return items.reduce((acc, a) => acc + (a.amount ?? a.value ?? 0), 0);
  };

  const sumDeductions = (p: Payslip) => {
    if (typeof p.totaDeductions === 'number') return p.totaDeductions;
    const taxes = (p.deductionsDetails?.taxes || []).reduce(
      (acc, t) => acc + (t.amount ?? t.value ?? 0),
      0
    );
    const ins = (p.deductionsDetails?.insurances || []).reduce(
      (acc, i) => acc + (i.amount ?? i.value ?? 0),
      0
    );
    let pen = 0;
    const penaltiesAny: any = p.deductionsDetails?.penalties;
    if (penaltiesAny) {
      if (Array.isArray(penaltiesAny.items)) {
        pen = penaltiesAny.items.reduce((acc: number, it: any) => acc + (it.amount ?? 0), 0);
      } else if (Array.isArray(penaltiesAny.penalties)) {
        pen = penaltiesAny.penalties.reduce((acc: number, it: any) => acc + (it.amount ?? 0), 0);
      } else if (typeof penaltiesAny.total === 'number') {
        pen = penaltiesAny.total;
      }
    }
    return taxes + ins + pen;
  };

  const handleDownloadPayslip = async (id: string) => {
    try {
      const res = await api.get(`/payroll-tracking/payslips/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Silently fail; could surface toast
    }
  };

  const handleDownloadTaxDoc = async (id: string) => {
    try {
      const res = await api.get(`/payroll-tracking/tax-documents/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-document-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Silently fail; could surface toast
    }
  };

  const openDetails = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    try {
      const res = await api.get(`/payroll-tracking/payslips/${id}`);
      setDetail(res.data);
    } catch (e: any) {
      setDetailError(e?.response?.data?.message || 'Failed to load payslip details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setDetail(null);
    setDetailError(null);
  };

  // Simple Portal component to render modal at document.body
  const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);
    if (!mounted) return null;
    return createPortal(children, document.body);
  };

  // Sort by createdAt descending; backend already sorts, but ensure on client.
  const sortedPayslips = [...payslips].sort((a, b) => {
    const toMillis = (v: unknown): number => {
      if (!v) return NaN;
      if (v instanceof Date) return v.getTime();
      if (typeof v === 'number') return v;

      if (typeof v === 'string') {
        const d = new Date(v);
        return d.getTime();
      }

      if (typeof v === 'object' && (v as any).$date) {
        const d = new Date((v as any).$date);
        return d.getTime();
      }

      return NaN;
    };
    const aDate = toMillis(
      (a as any).payrollRunId?.createdAt ?? a.createdAt ?? (a as any).payrollRunId?.payrollPeriod
    );
    const bDate = toMillis(
      (b as any).payrollRunId?.createdAt ?? b.createdAt ?? (b as any).payrollRunId?.payrollPeriod
    );
    return bDate - aDate;
  });

  // Aggregate totals for summary cards
  const totals = sortedPayslips.reduce(
    (acc, p) => {
      acc.gross += typeof p.totalGrossSalary === 'number' ? p.totalGrossSalary : 0;
      acc.deductions += typeof sumDeductions(p) === 'number' ? sumDeductions(p) : 0;
      acc.net += typeof p.netPay === 'number' ? p.netPay : 0;
      return acc;
    },
    { gross: 0, deductions: 0, net: 0 }
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl text-white">Payslips</h2>
          <p className="text-slate-400 text-sm">Your finalized salary statements</p>
        </div>
      </div>

      {loading && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
          Loading payslips...
        </div>
      )}

      {error && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-red-300 border-red-500/30">
          {error}
        </div>
      )}

      {!loading && !error && payslips.length === 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
          No payslips found.
        </div>
      )}

      {!loading && !error && sortedPayslips.length > 0 && (
        <div className="flex flex-col gap-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-slate-400 text-xs mb-1">Total Gross</div>
              <div className="text-white">{formatNumber(totals.gross)}</div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-slate-400 text-xs mb-1">Total Deductions</div>
              <div className="text-red-300">{formatNumber(totals.deductions)}</div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-slate-400 text-xs mb-1">Total Net</div>
              <div className="text-green-300">{formatNumber(totals.net)}</div>
            </div>
          </div>
          {sortedPayslips.map((p) => {
            const parseDisplay = (v: unknown): Date | null => {
              if (!v) return null;
              if (v instanceof Date) return v;
              if (typeof v === 'number') return new Date(v);
              if (typeof v === 'string') {
                const d = new Date(v);
                return isNaN(d.getTime()) ? null : d;
              }
              if (typeof v === 'object' && (v as any).$date) {
                const d = new Date((v as any).$date);
                return isNaN(d.getTime()) ? null : d;
              }
              return null;
            };
            const date = parseDisplay((p as any).payrollRunId?.createdAt ?? p.createdAt);
            const periodLabel = (() => {
              const v = (p as any).payrollRunId?.payrollPeriod as unknown;
              if (!v) return null;
              let d: Date | null = null;
              if (v instanceof Date) d = v;
              else if (typeof v === 'number') d = new Date(v);
              else if (typeof v === 'object' && (v as any).$date) d = new Date((v as any).$date);
              else if (typeof v === 'string') {
                const d1 = new Date(v);
                if (!isNaN(d1.getTime())) d = d1;
                else {
                  const normalized = v.replace(/([+-]\\d{2}):(\\d{2})$/, '$1$2');
                  const d2 = new Date(normalized);
                  d = isNaN(d2.getTime()) ? null : d2;
                }
              }
              return d
                ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
                : null;
            })();
            const paymentBadge =
              p.paymentStatus === 'paid'
                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                : p.paymentStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-gray-500/20 text-gray-300 border-gray-500/30';
            return (
              <div
                key={p._id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => openDetails(p._id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white">
                        {date ? date.toLocaleDateString() : periodLabel ?? '—'}
                      </div>
                      <div className="text-xs text-slate-400">ID: {p._id}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs border ${paymentBadge}`}>
                    {p.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-slate-300">
                  <div>
                    <div className="text-slate-400 text-xs">Base Salary</div>
                    <div className="text-white">{formatNumber(p.earningsDetails?.baseSalary)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Allowances</div>
                    <div className="text-white">{formatNumber(sumAllowances(p))}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Deductions</div>
                    <div className="text-white">{formatNumber(sumDeductions(p))}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Gross</div>
                    <div className="text-white">{formatNumber(p.totalGrossSalary)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Net Pay</div>
                    <div className="text-white">{formatNumber(p.netPay)}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPayslip(p._id);
                    }}
                  >
                    <FileDown className="w-4 h-4" />
                    Payslip PDF
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadTaxDoc(p._id);
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Tax Doc
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeDetails}
            />
            <div className="relative w-full max-w-3xl mx-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl text-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold">Payslip Details</h3>
                <button
                  aria-label="Close"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={closeDetails}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {detailLoading && <div className="text-slate-300">Loading details…</div>}
                {detailError && <div className="text-red-300">{detailError}</div>}
                {!detailLoading && !detailError && detail && (
                  <div className="space-y-6">
                    {/* Header meta */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <div className="text-slate-400 text-xs">Run</div>
                        <div className="text-white">{detail?.payrollRunId?.runId ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Period</div>
                        <div className="text-white">
                          {/* try payrollPeriod else createdAt */}
                          {(() => {
                            const v = detail?.payrollRunId?.payrollPeriod ?? detail?.createdAt;
                            const d = v ? new Date(v) : null;
                            return d && !isNaN(d.getTime())
                              ? d.toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: '2-digit',
                                })
                              : '—';
                          })()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Status</div>
                        <div className="text-white">{detail?.paymentStatus ?? '—'}</div>
                      </div>
                      <div className="ml-auto grid grid-cols-3 gap-6 text-right">
                        <div>
                          <div className="text-slate-400 text-xs">Gross</div>
                          <div className="text-white">{formatNumber(detail?.totalGrossSalary)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs">Deductions</div>
                          <div className="text-white">{formatNumber(detail?.totaDeductions)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs">Net Pay</div>
                          <div className="text-white">{formatNumber(detail?.netPay)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Earnings */}
                    <div>
                      <h4 className="text-slate-200 font-medium mb-2">Earnings</h4>
                      <div className="rounded-xl border border-white/10 bg-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                          <div className="p-4 border-b md:border-b-0 md:border-r border-white/10">
                            <div className="text-slate-400 text-xs mb-1">Base Salary</div>
                            <div className="text-white">
                              {formatNumber(detail?.earningsDetails?.baseSalary)}
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="text-slate-400 text-xs mb-2">Allowances</div>
                            {detail?.earningsDetails?.allowances?.length ? (
                              <ul className="space-y-1 text-slate-200">
                                {detail.earningsDetails.allowances.map((a: any, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex justify-between"
                                  >
                                    <span className="text-slate-300">{a?.name ?? 'Allowance'}</span>
                                    <span className="text-white">
                                      {formatNumber(a?.amount ?? a?.value)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-slate-400">—</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <h4 className="text-slate-200 font-medium mb-2">Deductions</h4>
                      <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/10">
                        <div className="p-4">
                          <div className="text-slate-400 text-xs mb-2">Taxes</div>
                          {detail?.deductionsDetails?.taxes?.length ? (
                            <ul className="space-y-1">
                              {detail.deductionsDetails.taxes.map((t: any, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex justify-between"
                                >
                                  <span className="text-slate-300">{t?.name ?? 'Tax'}</span>
                                  <span className="text-white">
                                    {formatNumber(t?.amount ?? t?.value)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-slate-400">—</div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="text-slate-400 text-xs mb-2">Insurances</div>
                          {detail?.deductionsDetails?.insurances?.length ? (
                            <ul className="space-y-1">
                              {detail.deductionsDetails.insurances.map((i: any, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex justify-between"
                                >
                                  <span className="text-slate-300">{i?.name ?? 'Insurance'}</span>
                                  <span className="text-white">
                                    {formatNumber(i?.amount ?? i?.value)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-slate-400">—</div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="text-slate-400 text-xs mb-2">Penalties</div>
                          {(() => {
                            const pen: any = detail?.deductionsDetails?.penalties;
                            if (!pen) return <div className="text-slate-400">—</div>;
                            if (Array.isArray(pen?.items)) {
                              return (
                                <ul className="space-y-1">
                                  {pen.items.map((it: any, idx: number) => (
                                    <li
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span className="text-slate-300">
                                        {it?.reason ?? 'Penalty'}
                                      </span>
                                      <span className="text-white">{formatNumber(it?.amount)}</span>
                                    </li>
                                  ))}
                                </ul>
                              );
                            }
                            if (Array.isArray(pen?.penalties)) {
                              return (
                                <ul className="space-y-1">
                                  {pen.penalties.map((it: any, idx: number) => (
                                    <li
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span className="text-slate-300">
                                        {it?.reason ?? 'Penalty'}
                                      </span>
                                      <span className="text-white">{formatNumber(it?.amount)}</span>
                                    </li>
                                  ))}
                                </ul>
                              );
                            }
                            if (typeof pen?.total === 'number') {
                              return (
                                <div className="flex justify-between">
                                  <span className="text-slate-300">Total Penalties</span>
                                  <span className="text-white">{formatNumber(pen.total)}</span>
                                </div>
                              );
                            }
                            return <div className="text-slate-400">—</div>;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                      {detail?._id && (
                        <>
                          <button
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 transition-all flex items-center gap-2"
                            onClick={() => handleDownloadPayslip(detail._id)}
                          >
                            <FileDown className="w-4 h-4" />
                            Payslip PDF
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                            onClick={() => handleDownloadTaxDoc(detail._id)}
                          >
                            <FileText className="w-4 h-4" />
                            Tax Doc
                          </button>
                        </>
                      )}
                      <button
                        className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        onClick={closeDetails}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
