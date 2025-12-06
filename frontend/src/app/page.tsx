import Link from "next/link";
import { ArrowRight, CheckCircle, Shield, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-slate-700 selection:text-white overflow-hidden relative">
      {/* Background Gradients & Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-slate-700/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-slate-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-slate-950/50 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-black/20 border border-white/10">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                HR Hub
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-sm text-slate-400 hover:text-white transition-colors">
                About
              </Link>
              <div className="flex items-center gap-4 ml-4">
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="group relative px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                >
                  Sign up
                  <ArrowRight className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-8 backdrop-blur-xl">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  v2.0 is now live
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
                  <span className="block text-slate-400 text-3xl lg:text-4xl mb-2 font-medium">Welcome to</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400">
                    HR Management System
                  </span>
                </h1>
                <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  A comprehensive platform designed to streamline your workforce operations.
                  From recruitment to offboarding, we provide the tools you need to build
                  and manage exact high-performance teams.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/auth/signup"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all backdrop-blur-xl flex items-center justify-center"
                  >
                    View Demo
                  </Link>
                </div>
              </div>

              {/* Visual Element / Grid */}
              <div className="flex-1 w-full max-w-lg lg:max-w-none">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl blur opacity-30" />
                  <div className="relative grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/50 backdrop-blur-xl border border-white/10">
                    <div className="col-span-2 p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Employee Analytics</h3>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-3/4 animate-pulse" />
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Fast Actions</h3>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Secure Data</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features / About Section */}
            <div id="about" className="mt-32">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
                  Why choose HR Hub?
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Experience a modern approach to human resource management with our cutting-edge features.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Modern Interface",
                    description: "Clean, dark-themed glassmorphic design that reduces eye strain and looks professional.",
                    icon: Zap,
                    color: "from-amber-500 to-orange-500",
                  },
                  {
                    title: "Secure & Reliable",
                    description: "Built with industry-standard security protocols to keep your employee data safe.",
                    icon: Shield,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    title: "Complete Suite",
                    description: "Everything from detailed analytics to simple leave management in one place.",
                    icon: CheckCircle,
                    color: "from-emerald-500 to-green-500",
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 text-sm">
              © 2025 HR Hub System. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
