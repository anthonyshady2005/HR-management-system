"use client";

import { ArrowLeft, UserMinus, CheckCircle, Clock, XCircle, FileText, Shield, Laptop, DollarSign, Search, Filter, MoreVertical } from 'lucide-react';

interface OffboardingDashboardProps {
  onBack?: () => void;
}

export default function OffboardingDashboard({ onBack }: OffboardingDashboardProps = {}) {
  const offboardingCases = [
    { id: 1, name: 'Robert Martinez', role: 'Backend Developer', department: 'Engineering', lastDay: 'Nov 30, 2025', type: 'Resignation', progress: 60, status: 'In Progress' },
    { id: 2, name: 'Jennifer Lee', role: 'Marketing Manager', department: 'Marketing', lastDay: 'Nov 28, 2025', type: 'Resignation', progress: 90, status: 'In Progress' },
    { id: 3, name: 'David Kim', role: 'Sales Representative', department: 'Sales', lastDay: 'Nov 25, 2025', type: 'Termination', progress: 100, status: 'Complete' },
    { id: 4, name: 'Amanda White', role: 'HR Coordinator', department: 'HR', lastDay: 'Dec 5, 2025', type: 'Resignation', progress: 30, status: 'Pending' },
    { id: 5, name: 'Thomas Garcia', role: 'QA Engineer', department: 'Engineering', lastDay: 'Nov 24, 2025', type: 'Resignation', progress: 100, status: 'Complete' },
  ];

  const clearanceCategories = [
    { category: 'IT Assets', icon: Laptop, pending: 4, completed: 12 },
    { category: 'Access Revocation', icon: Shield, pending: 6, completed: 18 },
    { category: 'Documentation', icon: FileText, pending: 3, completed: 15 },
    { category: 'Final Settlement', icon: DollarSign, pending: 2, completed: 10 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <UserMinus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Offboarding Dashboard</h1>
                    <p className="text-xs text-orange-300">Manage employee exits</p>
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
              { label: 'Active Cases', value: '5', icon: UserMinus, color: 'from-orange-500 to-red-500' },
              { label: 'In Progress', value: '3', icon: Clock, color: 'from-blue-500 to-cyan-500' },
              { label: 'Completed', value: '2', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
              { label: 'Pending Items', value: '15', icon: XCircle, color: 'from-purple-500 to-pink-500' },
            ].map((stat, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl text-white mb-1">{stat.value}</p>
                <p className="text-sm text-orange-300">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Clearance Categories */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {clearanceCategories.map((item) => (
              <div key={item.category} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <item.icon className="w-8 h-8 text-orange-400 mb-4" />
                <h3 className="text-white mb-3">{item.category}</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl text-white">{item.completed}</p>
                    <p className="text-xs text-orange-300">Completed</p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <p className="text-2xl text-red-400">{item.pending}</p>
                    <p className="text-xs text-orange-300">Pending</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="text"
                placeholder="Search offboarding cases..."
                className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-orange-400 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <button className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Offboarding Cases Table */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm text-orange-300">Name</th>
                    <th className="text-left px-6 py-4 text-sm text-orange-300">Role</th>
                    <th className="text-left px-6 py-4 text-sm text-orange-300">Department</th>
                    <th className="text-left px-6 py-4 text-sm text-orange-300">Last Day</th>
                    <th className="text-left px-6 py-4 text-sm text-orange-300">Type</th>
                    <th className="text-left px-6 py-4 text-sm text-orange-300">Progress</th>
                    <th className="text-left px-6 py-4 text-sm text-orange-300">Status</th>
                    <th className="text-left px-6 py-4 text-sm text-orange-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {offboardingCases.map((case_) => (
                    <tr key={case_.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <span className="text-white text-sm">{case_.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <span className="text-white">{case_.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-orange-200">{case_.role}</td>
                      <td className="px-6 py-4 text-orange-200">{case_.department}</td>
                      <td className="px-6 py-4 text-orange-200">{case_.lastDay}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          case_.type === 'Resignation'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {case_.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                              style={{ width: `${case_.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-white w-12">{case_.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          case_.status === 'Complete'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : case_.status === 'In Progress'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {case_.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="w-8 h-8 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                          <MoreVertical className="w-4 h-4 text-orange-300" />
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
