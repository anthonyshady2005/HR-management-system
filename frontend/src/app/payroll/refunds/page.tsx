"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
    RefreshCw,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Dispute {
    _id: string;
    disputeId: string;
    description: string;
    amount?: number;
    employeeId: {
        firstName: string;
        lastName: string;
        employeeNumber: string;
    };
    status: string;
    createdAt: string;
}

interface Claim {
    _id: string;
    claimId: string;
    description: string;
    amount: number;
    approvedAmount?: number;
    claimType: string;
    employeeId: {
        firstName: string;
        lastName: string;
        employeeNumber: string;
    };
    status: string;
    createdAt: string;
}

export default function RefundsPage() {
    const { currentRole } = useAuth();

    // State
    const [refundsTab, setRefundsTab] = useState("disputes");
    const [loadingRefunds, setLoadingRefunds] = useState(false);

    // Refund Data
    const [approvedDisputes, setApprovedDisputes] = useState<Dispute[]>([]);
    const [approvedClaims, setApprovedClaims] = useState<Claim[]>([]);

    // Track refund status from database (claimId/disputeId -> refund status)
    const [claimRefundStatus, setClaimRefundStatus] = useState<Map<string, string>>(new Map());
    const [disputeRefundStatus, setDisputeRefundStatus] = useState<Map<string, string>>(new Map());

    // Dialog State
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundDescription, setRefundDescription] = useState("");
    const [generatingRefund, setGeneratingRefund] = useState(false);

    // Fetch approved disputes/claims and existing refunds on mount
    useEffect(() => {
        if (currentRole !== "Finance Staff") return;

        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoadingRefunds(true);
                const [disputesRes, claimsRes, refundsRes] = await Promise.all([
                    api.get("/payroll-tracking/disputes/approved"),
                    api.get("/payroll-tracking/claims/approved"),
                    api.get("/payroll-tracking/refunds")
                ]);

                if (isMounted) {
                    setApprovedDisputes(disputesRes.data);
                    setApprovedClaims(claimsRes.data);

                    // Build maps for refund status
                    const claimStatusMap = new Map<string, string>();
                    const disputeStatusMap = new Map<string, string>();

                    for (const refund of refundsRes.data) {
                        if (refund.claimId?._id) {
                            claimStatusMap.set(refund.claimId._id, refund.status);
                        }
                        if (refund.disputeId?._id) {
                            disputeStatusMap.set(refund.disputeId._id, refund.status);
                        }
                    }

                    setClaimRefundStatus(claimStatusMap);
                    setDisputeRefundStatus(disputeStatusMap);
                }
            } catch (error) {
                console.error("Failed to fetch refund items:", error);
                if (isMounted) toast.error("Failed to load approved disputes/claims");
            } finally {
                if (isMounted) setLoadingRefunds(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [currentRole]);


    // Refund Handlers
    const handleGenerateDisputeRefund = async () => {
        if (!selectedDispute || !refundAmount || !refundDescription) return;

        try {
            setGeneratingRefund(true);
            await api.post(`/payroll-tracking/refunds/dispute/${selectedDispute._id}`, {
                amount: parseFloat(refundAmount),
                description: refundDescription
            });

            toast.success(`Refund generated for dispute ${selectedDispute.disputeId} - pending execution in next payroll cycle`);

            // Mark the dispute as processed with pending status
            setDisputeRefundStatus(prev => new Map(prev).set(selectedDispute._id, 'pending'));

            setRefundDialogOpen(false);
            setSelectedDispute(null);
            setRefundAmount("");
            setRefundDescription("");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err?.response?.data?.message || "";
            if (message.includes("already been generated")) {
                toast.warning("Refund was already generated for this dispute");
                setDisputeRefundStatus(prev => new Map(prev).set(selectedDispute._id, 'pending'));
                setRefundDialogOpen(false);
                setSelectedDispute(null);
                setRefundAmount("");
                setRefundDescription("");
            } else {
                console.error("Failed to generate refund:", error);
                toast.error("Failed to generate refund");
            }
        } finally {
            setGeneratingRefund(false);
        }
    };

    const handleGenerateClaimRefund = async (claim: Claim) => {
        try {
            setGeneratingRefund(true);
            await api.post(`/payroll-tracking/refunds/claim/${claim._id}`);
            toast.success(`Refund generated for claim ${claim.claimId} - pending execution in next payroll cycle`);

            // Mark the claim as processed with pending status
            setClaimRefundStatus(prev => new Map(prev).set(claim._id, 'pending'));
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err?.response?.data?.message || "";
            if (message.includes("already been generated")) {
                toast.warning("Refund was already generated for this claim");
                setClaimRefundStatus(prev => new Map(prev).set(claim._id, 'pending'));
            } else {
                console.error("Failed to generate refund:", error);
                toast.error("Failed to generate refund");
            }
        } finally {
            setGeneratingRefund(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(amount || 0);

    // Authorization: Only Finance Staff can access
    if (currentRole !== "Finance Staff") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <h1 className="text-3xl font-bold text-slate-200 mb-4">Unauthorized</h1>
                <p className="text-slate-400 max-w-md">
                    You do not have permission to access this resource. Required role: Finance Staff.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-200 tracking-tight">Refunds Management</h1>
                <p className="text-slate-400">
                    Generate refunds for approved disputes and expense claims.
                </p>
            </div>

            {/* Refunds Content */}
            <Card className="bg-slate-900 border-slate-800 text-slate-200">
                <CardHeader>
                    <CardTitle className="text-emerald-400 flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Process Refunds
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Select approved disputes or claims to generate refunds. Refunds will be processed in the next payroll cycle.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={refundsTab} onValueChange={setRefundsTab} className="w-full">
                        <TabsList className="bg-slate-800 border border-slate-700 w-full justify-start">
                            <TabsTrigger value="disputes" className="text-white data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400">
                                Approved Disputes ({approvedDisputes.length})
                            </TabsTrigger>
                            <TabsTrigger value="claims" className="text-white data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400">
                                Approved Claims ({approvedClaims.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            {loadingRefunds ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="disputes">
                                        {approvedDisputes.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">No approved disputes pending refund.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {approvedDisputes.map(dispute => (
                                                    <div key={dispute._id} className="p-4 rounded-lg bg-slate-800 border border-slate-700 flex justify-between items-center">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-emerald-400">{dispute.disputeId}</span>
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800">
                                                                    {dispute.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-300 mt-1">{dispute.description}</p>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Employee: {dispute.employeeId?.firstName} {dispute.employeeId?.lastName} ({dispute.employeeId?.employeeNumber})
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                Approved: {format(new Date(dispute.createdAt), "MMM d, yyyy")}
                                                            </p>
                                                        </div>
                                                        {disputeRefundStatus.has(dispute._id) ? (
                                                            <span className={`px-4 py-2 rounded-md font-medium ${disputeRefundStatus.get(dispute._id) === 'paid'
                                                                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                                                                : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                                                                }`}>
                                                                {disputeRefundStatus.get(dispute._id) === 'paid' ? 'Paid' : 'Pending'}
                                                            </span>
                                                        ) : (
                                                            <Button
                                                                onClick={() => {
                                                                    setSelectedDispute(dispute);
                                                                    setRefundDialogOpen(true);
                                                                }}
                                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                            >
                                                                Process Refund
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="claims">
                                        {approvedClaims.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">No approved claims pending refund.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {approvedClaims.map(claim => (
                                                    <div key={claim._id} className="p-4 rounded-lg bg-slate-800 border border-slate-700 flex justify-between items-center">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-emerald-400">{claim.claimId}</span>
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800">
                                                                    {claim.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-300 mt-1">{claim.description}</p>
                                                            <div className="flex gap-4 mt-1 text-sm">
                                                                <span className="text-slate-400">Type: {claim.claimType}</span>
                                                                <span className="text-emerald-400 font-medium">Amount: {formatCurrency(claim.approvedAmount || claim.amount)}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Employee: {claim.employeeId?.firstName} {claim.employeeId?.lastName} ({claim.employeeId?.employeeNumber})
                                                            </p>
                                                        </div>
                                                        {claimRefundStatus.has(claim._id) ? (
                                                            <span className={`px-4 py-2 rounded-md font-medium ${claimRefundStatus.get(claim._id) === 'paid'
                                                                    ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                                                                    : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                                                                }`}>
                                                                {claimRefundStatus.get(claim._id) === 'paid' ? 'Paid' : 'Pending'}
                                                            </span>
                                                        ) : (
                                                            <Button
                                                                onClick={() => handleGenerateClaimRefund(claim)}
                                                                disabled={generatingRefund}
                                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                            >
                                                                {generatingRefund ? "Processing..." : "Process Refund"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </>
                            )}
                        </div>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Refund Dialog */}
            <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Process Dispute Refund</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Create a refund record for Dispute {selectedDispute?.disputeId}. This will be processed in the next payroll run.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Refund Amount (EGP)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Refund reason..."
                                value={refundDescription}
                                onChange={(e) => setRefundDescription(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRefundDialogOpen(false)} className="text-slate-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGenerateDisputeRefund}
                            disabled={!refundAmount || !refundDescription || generatingRefund}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {generatingRefund ? "Processing..." : "Confirm Refund"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
