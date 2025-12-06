"use client";

import { ArrowLeft, Briefcase, Users, Calendar, FileText, TrendingUp, Search, Plus, Filter, MoreVertical } from 'lucide-react';

interface RecruitmentDashboardProps {
  onBack?: () => void;
}

export default function RecruitmentDashboard({ onBack }: RecruitmentDashboardProps = {}) {
  const jobPostings = [
    { id: 1, title: 'Senior Frontend Developer', department: 'Engineering', location: 'Remote', candidates: 24, status: 'Active', stage: 'Interview' },
    { id: 2, title: 'Product Manager', department: 'Product', location: 'New York', candidates: 18, status: 'Active', stage: 'Screening' },
    { id: 3, title: 'UX Designer', department: 'Design', location: 'San Francisco', candidates: 32, status: 'Active', stage: 'Shortlist' },
    { id: 4, title: 'Data Analyst', department: 'Analytics', location: 'Remote', candidates: 15, status: 'Active', stage: 'Offer' },
    { id: 5, title: 'DevOps Engineer', department: 'Engineering', location: 'Austin', candidates: 9, status: 'Draft', stage: 'Screening' },
  ];

  const stages = [
    { name: 'Screening', count: 45, color: 'blue' },
    { name: 'Shortlist', count: 28, color: 'cyan' },
    { name: 'Interview', count: 16, color: 'indigo' },
    { name: 'Offer', count: 8, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Recruitment Dashboard</h1>
                    <p className="text-xs text-slate-400">Manage hiring pipeline</p>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>New Job Posting</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Active Jobs', value: '12', icon: Briefcase, trend: '+2 this week' },
              { label: 'Total Candidates', value: '97', icon: Users, trend: '+15 this week' },
              { label: 'Interviews Scheduled', value: '24', icon: Calendar, trend: '8 this week' },
              { label: 'Avg. Time to Hire', value: '18d', icon: TrendingUp, trend: '-2 days' },
            ].map((stat, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-slate-400" />
                  <span className="text-xs text-green-400">{stat.trend}</span>
                </div>
                <p className="text-3xl text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Pipeline Stages */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-xl text-white mb-6">Hiring Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stages.map((stage) => (
                <div key={stage.name} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className={`w-3 h-3 rounded-full bg-${stage.color}-500 mb-3`}></div>
                  <p className="text-2xl text-white mb-1">{stage.count}</p>
                  <p className="text-sm text-slate-400">{stage.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search job postings..."
                className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
              />
            </div>
            <button className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Job Postings Table */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm text-slate-400">Job Title</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">Department</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">Location</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">Candidates</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">Current Stage</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobPostings.map((job) => (
                    <tr key={job.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white">{job.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{job.department}</td>
                      <td className="px-6 py-4 text-slate-300">{job.location}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full backdrop-blur-xl bg-slate-500/20 text-slate-300 text-sm border border-slate-500/30">
                          {job.candidates}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{job.stage}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          job.status === 'Active'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="w-8 h-8 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
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
