"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import {
  canAccessOrganizationStructurePage,
  canViewOrgChart,
  canViewChangeRequestsTab,
  canViewAllDepartments,
  canApproveChangeRequests,
  isSystemAdmin,
} from "@/lib/organization-role-utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Network, FileText, CheckCircle2, XCircle, Clock, Users, History } from "lucide-react";
import { Departments } from "@/components/organization-structure/Departments";
import { ChangeRequests } from "@/components/organization-structure/ChangeRequests";
import { Approvals } from "@/components/organization-structure/Approvals";
import { OrgChart } from "@/components/organization-structure/OrgChart";
import { PositionsManagement } from "@/components/organization-structure/PositionsManagement";
import { ChangeLog } from "@/components/organization-structure/ChangeLog";

export default function OrganizationStructurePage() {
  const { currentRole, status } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("chart");

  // Calculate which tabs are visible
  const visibleTabs = useMemo(() => {
    const tabs = [];
    if (canViewOrgChart(currentRole)) tabs.push("chart");
    if (canViewAllDepartments(currentRole)) tabs.push("departments");
    if (canViewChangeRequestsTab(currentRole)) tabs.push("requests");
    if (canApproveChangeRequests(currentRole)) tabs.push("approvals");
    if (isSystemAdmin(currentRole)) tabs.push("positions");
    if (isSystemAdmin(currentRole)) tabs.push("change-log");
    return tabs;
  }, [currentRole]);

  // Calculate grid columns based on number of visible tabs
  const getGridCols = () => {
    const count = visibleTabs.length;
    if (count <= 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-4';
    if (count === 5) return 'grid-cols-5';
    return 'grid-cols-6';
  };

  // Ensure active tab is valid
  useEffect(() => {
    if (status === "authenticated" && !canAccessOrganizationStructurePage(currentRole)) {
      router.push("/");
      return;
    }

    // If current tab is not visible, switch to first available tab
    if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [currentRole, status, router, activeTab, visibleTabs]);

  // Don't render if user doesn't have access
  if (status !== "authenticated" || !canAccessOrganizationStructurePage(currentRole)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Organization Structure</h1>
          <p className="text-slate-400">
            Manage departments, positions, and organizational hierarchy
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList 
            className={`grid w-full bg-white/5 border border-white/10 ${getGridCols()}`}
          >
            {canViewOrgChart(currentRole) && (
              <TabsTrigger 
                value="chart" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
              >
                <Network className="w-4 h-4 mr-2" />
                Org Chart
              </TabsTrigger>
            )}
            {canViewAllDepartments(currentRole) && (
              <TabsTrigger 
                value="departments" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Departments
              </TabsTrigger>
            )}
            {canViewChangeRequestsTab(currentRole) && (
              <TabsTrigger 
                value="requests" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
              >
                <FileText className="w-4 h-4 mr-2" />
                Change Requests
              </TabsTrigger>
            )}
            {canApproveChangeRequests(currentRole) && (
              <TabsTrigger 
                value="approvals" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approvals
              </TabsTrigger>
            )}
            {isSystemAdmin(currentRole) && (
              <TabsTrigger 
                value="positions" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
              >
                <Users className="w-4 h-4 mr-2" />
                Positions
              </TabsTrigger>
            )}
            {isSystemAdmin(currentRole) && (
              <TabsTrigger 
                value="change-log" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
              >
                <History className="w-4 h-4 mr-2" />
                Change Log
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="chart" className="mt-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <OrgChart />
            </div>
          </TabsContent>

          <TabsContent value="departments" className="mt-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <Departments />
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <ChangeRequests />
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="mt-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <Approvals />
            </div>
          </TabsContent>

          {isSystemAdmin(currentRole) && (
            <TabsContent value="positions" className="mt-6">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
                <PositionsManagement />
              </div>
            </TabsContent>
          )}

          {isSystemAdmin(currentRole) && (
            <TabsContent value="change-log" className="mt-6">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
                <ChangeLog />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
