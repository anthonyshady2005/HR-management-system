import Link from "next/link";
import {
  Briefcase,
  UserPlus,
  UserMinus,
  ChevronRight,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
  Timer,
} from "lucide-react";

const stats = [
  { label: "Active Jobs", value: "12", icon: Briefcase, color: "from-blue-500 to-cyan-500" },
  { label: "New Hires", value: "8", icon: UserPlus, color: "from-green-500 to-emerald-500" },
  { label: "In Progress", value: "24", icon: Clock, color: "from-slate-500 to-slate-700" },
  { label: "Completed", value: "156", icon: CheckCircle, color: "from-orange-500 to-red-500" },
];

const timeline = [
  {
    milestone: "Milestone 1",
    deadline: "Nov 17, 2025",
    tasks: ["Project structure setup", "Database schema design", "Integration foundation"],
    status: "In Progress",
    badgeClass: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  },
  {
    milestone: "Milestone 2",
    deadline: "Dec 1, 2025",
    tasks: ["Backend development", "API endpoints", "Business logic"],
    status: "Upcoming",
    badgeClass: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  },
  {
    milestone: "Milestone 3",
    deadline: "Dec 15, 2025",
    tasks: ["Frontend development", "UI/UX implementation", "Deployment"],
    status: "Upcoming",
    badgeClass: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white">HR Management System</h1>
                <p className="text-xs text-slate-400">Streamline your workforce operations</p>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/help", label: "Help" },
                { href: "/faq", label: "FAQ" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg backdrop-blur-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm text-slate-300 flex items-center gap-2"
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12 text-center">
            <h2 className="text-5xl text-white mb-4 bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">
              Welcome to HR Hub
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Manage recruitment, onboarding, and offboarding processes seamlessly with our integrated platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/recruitment"
              className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:border-slate-500/50 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-white mb-3">Recruitment</h3>
              <p className="text-slate-400 mb-6">
                Manage job postings, track candidates, schedule interviews, and streamline your hiring process
              </p>
              <div className="space-y-2 mb-6">
                {[
                  "Job Requisitions & Templates",
                  "Candidate Pipeline Management",
                  "Interview Scheduling & Feedback",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 group-hover:gap-3 transition-all">
                <span>Open Dashboard</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>

            <Link
              href="/onboarding"
              className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:border-green-500/50 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-white mb-3">Onboarding</h3>
              <p className="text-slate-400 mb-6">
                Welcome new hires with structured checklists, document collection, and resource provisioning
              </p>
              <div className="space-y-2 mb-6">
                {["Onboarding Checklists", "Document Verification", "Resource Provisioning"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-green-400 group-hover:text-green-300 group-hover:gap-3 transition-all">
                <span>Open Dashboard</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>

            <Link
              href="/offboarding"
              className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:border-orange-500/50 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserMinus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-white mb-3">Offboarding</h3>
              <p className="text-slate-400 mb-6">
                Handle resignations and terminations with clearance checklists and final settlements
              </p>
              <div className="space-y-2 mb-6">
                {[
                  "Clearance Checklists",
                  "Multi-Department Sign-offs",
                  "Access Revocation",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-orange-400 group-hover:text-orange-300 group-hover:gap-3 transition-all">
                <span>Open Dashboard</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-slate-400" />
              <h3 className="text-2xl text-white">Project Timeline</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {timeline.map((milestone) => (
                <div
                  key={milestone.milestone}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${milestone.badgeClass}`}>
                      {milestone.status}
                    </span>
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <h4 className="text-xl text-white mb-2">{milestone.milestone}</h4>
                  <p className="text-sm text-slate-400 mb-4">Deadline: {milestone.deadline}</p>
                  <ul className="space-y-2">
                    {milestone.tasks.map((task) => (
                      <li key={task} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl text-white">Additional Modules</h3>
              <p className="text-sm text-slate-400 ml-auto">Coming Soon</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Link
                href="/employee"
                className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/50 text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl text-white">Employee Management</h4>
                      <p className="text-sm text-slate-400">Workforce oversight & analytics</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-2xl text-white mb-1">248</p>
                    <p className="text-xs text-slate-400">Total Employees</p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-2xl text-white mb-1">12</p>
                    <p className="text-xs text-slate-400">Departments</p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-2xl text-white mb-1">95%</p>
                    <p className="text-xs text-slate-400">Retention Rate</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Engineering</span>
                    <span className="text-white">85 employees</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: "70%" }} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Sales & Marketing</span>
                    <span className="text-white">62 employees</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: "50%" }} />
                  </div>
                </div>
              </Link>

              <Link
                href="/payroll"
                className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400/50 text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl text-white">Payroll Management</h4>
                      <p className="text-sm text-slate-400">Compensation & benefits tracking</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-2xl text-white mb-1">$2.4M</p>
                    <p className="text-xs text-slate-400">Monthly Payroll</p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-2xl text-white mb-1">5</p>
                    <p className="text-xs text-slate-400">Days Until Payroll</p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-2xl text-white mb-1">248</p>
                    <p className="text-xs text-slate-400">Processed</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm text-slate-300">Regular Salaries</span>
                    </div>
                    <span className="text-sm text-white">$1.8M</span>
                  </div>
                  <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-sm text-slate-300">Bonuses & Incentives</span>
                    </div>
                    <span className="text-sm text-white">$420K</span>
                  </div>
                  <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-sm text-slate-300">Benefits & Deductions</span>
                    </div>
                    <span className="text-sm text-white">$180K</span>
                  </div>
                </div>
              </Link>
              <div className="lg:col-span-2">
                <Link
                  href="/time-management"
                  className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.01] hover:border-amber-400/50 text-left block"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Timer className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl text-white">Time Management</h4>
                        <p className="text-sm text-slate-400">Attendance, shifts & leave management</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-xs text-slate-400">Present Today</p>
                      </div>
                      <p className="text-2xl text-white">234</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <p className="text-xs text-slate-400">On Leave</p>
                      </div>
                      <p className="text-2xl text-white">8</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <p className="text-xs text-slate-400">Leave Requests</p>
                      </div>
                      <p className="text-2xl text-white">14</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <p className="text-xs text-slate-400">Avg. Hours/Week</p>
                      </div>
                      <p className="text-2xl text-white">42.5</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <p className="text-xs text-slate-400">Overtime Hours</p>
                      </div>
                      <p className="text-2xl text-white">124</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="backdrop-blur-xl bg-white/5 border-t border-white/10 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <p className="text-sm text-slate-400">© 2025 HR Management System. Built with Next.js & NestJS</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400">Tech Stack:</span>
              <div className="flex gap-2">
                {["Next.js", "NestJS", "MongoDB", "JWT"].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 text-xs text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
