import { FileQuestion } from "lucide-react";

const faqs = [
  {
    q: "How do I create a new job posting?",
    a: 'Navigate to the Recruitment module and click on "Create New Job" button. Fill in the required details and publish.',
  },
  {
    q: "Can I customize onboarding checklists?",
    a: "Yes, onboarding checklists are fully customizable. You can add, remove, or modify tasks based on your organization's needs.",
  },
  {
    q: "How long does the offboarding process take?",
    a: "The typical offboarding process takes 1-2 weeks depending on department clearances and documentation requirements.",
  },
  {
    q: "Is the system mobile-friendly?",
    a: "Yes, the HR Management System is fully responsive and works seamlessly on mobile devices, tablets, and desktops.",
  },
];

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
            <FileQuestion className="w-8 h-8 text-slate-400" />
            <h2 className="text-3xl text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
