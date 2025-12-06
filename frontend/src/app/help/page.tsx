import { HelpCircle } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-slate-400" />
            <h2 className="text-3xl text-white">Help Center</h2>
          </div>
          <div className="space-y-6 text-slate-300">
            <div>
              <h3 className="text-xl text-white mb-3">Getting Started</h3>
              <p className="mb-2">Welcome to the HR Management System. Here's how to get started:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Navigate to the desired module (Recruitment, Onboarding, or Offboarding)</li>
                <li>Use the dashboard to view and manage your tasks</li>
                <li>Click on individual items to view details and take actions</li>
              </ol>
            </div>
            <div>
              <h3 className="text-xl text-white mb-3">Need More Help?</h3>
              <p>Contact our support team at support@hrms.com or call 1-800-HR-SUPPORT</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
