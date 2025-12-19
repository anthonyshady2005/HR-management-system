"use client";

export default function TimeManagementDepartmentHeadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ===================== HEADER ===================== */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Team Time Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              This is your line manager / department head workspace. You&apos;ll
              see and manage your team&apos;s attendance here later.
            </p>
          </div>
        </header>

        {/* ===================== CONTENT PLACEHOLDER ===================== */}
        <main>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 text-slate-300">
            <p className="text-sm">
              Department head dashboard placeholder. You can add manager tools here later, like:
            </p>
            <ul className="mt-3 list-disc list-inside text-sm text-slate-400 space-y-1">
              <li>Overview of team attendance and absences</li>
              <li>Pending attendance exceptions for approval</li>
              <li>Team lateness and overtime summaries</li>
              <li>Quick links to approve / reject requests</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
