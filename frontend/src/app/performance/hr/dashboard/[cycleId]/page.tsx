"use client";

import HrAppraisalDashboard from "../../../../../components/performance/HrAppraisalDashboard";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams(); // Get dynamic params from URL
  const { cycleId } = params as { cycleId: string }; // Typecast

  return <HrAppraisalDashboard cycleId={cycleId} />;
}
