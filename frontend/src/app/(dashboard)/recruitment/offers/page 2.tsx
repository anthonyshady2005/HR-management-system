"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Search,
  Filter,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { recruitmentApi, type Offer } from "@/lib/recruitment-api";

export default function OffersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    candidateId: "",
  });

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchQuery, filters]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getOffers({});
      setOffers(data || []);
    } catch (error) {
      console.error("Error loading offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = [...offers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer._id.toLowerCase().includes(query) ||
          offer.candidateId?.toString().toLowerCase().includes(query)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((offer) => offer.applicantResponse === filters.status);
    }

    setFilteredOffers(filtered);
  };

  const getResponseColor = (response: string) => {
    switch (response?.toLowerCase()) {
      case "accepted":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/recruitment"
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Offers</h1>
                    <p className="text-xs text-slate-400">Manage job offers</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadOffers}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm"
                >
                  Refresh
                </button>
                <Link
                  href="/recruitment/offers/new"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Offer
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
              >
                <option value="">All Responses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => setFilters({ status: "", candidateId: "" })}
                className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Offer ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Candidate
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Application
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Gross Salary
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Deadline
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Response
                    </th>
                    <th className="text-left px-6 py-4 text-sm text-slate-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.length > 0 ? (
                    filteredOffers.map((offer) => (
                      <tr
                        key={offer._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                        onClick={() => router.push(`/recruitment/offers/${offer._id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-white text-sm">
                            #{offer._id.slice(-8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">
                            {offer.candidateId?.toString().slice(-8) || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/recruitment/applications/${offer.applicationId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {offer.applicationId?.toString().slice(-8) || "N/A"}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">
                            ${offer.grossSalary?.toLocaleString() || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 text-sm">
                              {offer.deadline
                                ? new Date(offer.deadline).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs border ${getResponseColor(
                              offer.applicantResponse
                            )}`}
                          >
                            {offer.applicantResponse || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/recruitment/offers/${offer._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all inline-flex"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        No offers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

