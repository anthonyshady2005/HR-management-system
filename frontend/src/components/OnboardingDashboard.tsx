"use client";

import { ArrowLeft, UserPlus, CheckCircle, Clock, AlertCircle, FileText, Laptop, Key, CreditCard, Search, Filter, MoreVertical } from 'lucide-react';

interface OnboardingDashboardProps {
  onBack?: () => void;
}

export default function OnboardingDashboard({ onBack }: OnboardingDashboardProps = {}) {
  const newHires = [
    { id: 1, name: 'Sarah Johnson', role: 'Senior Frontend Developer', department: 'Engineering', startDate: 'Nov 20, 2025', progress: 75, status: 'In Progress' },
    { id: 2, name: 'Michael Chen', role: 'Product Manager', department: 'Product', startDate: 'Nov 22, 2025', progress: 45, status: 'In Progress' },
    { id: 3, name: 'Emma Wilson', role: 'UX Designer', department: 'Design', startDate: 'Nov 25, 2025', progress: 20, status: 'Pending' },
    { id: 4, name: 'James Brown', role: 'Data Analyst', department: 'Analytics', startDate: 'Nov 18, 2025', progress: 100, status: 'Complete' },
    { id: 5, name: 'Lisa Anderson', role: 'DevOps Engineer', department: 'Engineering', startDate: 'Dec 1, 2025', progress: 10, status: 'Pending' },
  ];

  const checklistItems = [
    { category: 'Documentation', icon: FileText, pending: 12, completed: 28 },
    { category: 'IT Setup', icon: Laptop, pending: 5, completed: 15 },
    { category: 'Access Provisioning', icon: Key, pending: 8, completed: 22 },
    { category: 'Payroll & Benefits', icon: CreditCard, pending: 3, completed: 17 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Onboarding Dashboard</h1>
                    <p className="text-xs text-green-300">Welcome new team members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'New Hires This Month', value: '8', icon: UserPlus, color: 'from-green-500 to-emerald-500' },
              { label: 'In Progress', value: '5', icon: Clock, color: 'from-blue-500 to-cyan-500' },
              { label: 'Completed', value: '3', icon: CheckCircle, color: 'from-purple-500 to-pink-500' },
              { label: 'Pending Items', value: '28', icon: AlertCircle, color: 'from-orange-500 to-red-500' },
            ].map((stat, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl text-white mb-1">{stat.value}</p>
                <p className="text-sm text-green-300">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Checklist Categories */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {checklistItems.map((item) => (
              <div key={item.category} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <item.icon className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-white mb-3">{item.category}</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl text-white">{item.completed}</p>
                    <p className="text-xs text-green-300">Completed</p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <p className="text-2xl text-orange-400">{item.pending}</p>
                    <p className="text-xs text-green-300">Pending</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              <input
                type="text"
                placeholder="Search new hires..."
                className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-green-400 focus:outline-none focus:border-green-500/50"
              />
            </div>
            <button className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* New Hires Table */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm text-green-300">Name</th>
                    <th className="text-left px-6 py-4 text-sm text-green-300">Role</th>
                    <th className="text-left px-6 py-4 text-sm text-green-300">Department</th>
                    <th className="text-left px-6 py-4 text-sm text-green-300">Start Date</th>
                    <th className="text-left px-6 py-4 text-sm text-green-300">Progress</th>
                    <th className="text-left px-6 py-4 text-sm text-green-300">Status</th>
                    <th className="text-left px-6 py-4 text-sm text-green-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {newHires.map((hire) => (
                    <tr key={hire.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <span className="text-white text-sm">{hire.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <span className="text-white">{hire.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-green-200">{hire.role}</td>
                      <td className="px-6 py-4 text-green-200">{hire.department}</td>
                      <td className="px-6 py-4 text-green-200">{hire.startDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                              style={{ width: `${hire.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-white w-12">{hire.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          hire.status === 'Complete'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : hire.status === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        }`}>
                          {hire.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="w-8 h-8 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                          <MoreVertical className="w-4 h-4 text-green-300" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
