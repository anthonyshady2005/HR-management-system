"use client";

import { useParams } from "next/navigation";
import PendingAppraisals from "@/components/performance/pending-appraisal"; // adjust path

export default function PendingAppraisalsPage() {
  const params = useParams();
  const cycleIdParam = params.cycleId;

  // Ensure cycleId is a string
  const cycleId = Array.isArray(cycleIdParam) ? cycleIdParam[0] : cycleIdParam;

  if (!cycleId) return <p>Invalid cycle ID</p>;

  return <PendingAppraisals cycleId={cycleId} />;
}
