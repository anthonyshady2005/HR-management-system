"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Clock,
} from "lucide-react";
import { recruitmentApi, type JobRequisition } from "@/lib/recruitment-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";

export default function CareersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobRequisition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, locationFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getPublicJobRequisitions();
      setJobs(data || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((job) => {
        const department = typeof job.departmentId === 'object' && job.departmentId !== null
          ? (job.departmentId as { name?: string; code?: string }).name?.toLowerCase() || ''
          : '';
        const template = job.templateId as any;
        return (
          job.title?.toLowerCase().includes(query) ||
          template?.title?.toLowerCase().includes(query) ||
          department.includes(query) ||
          template?.department?.toLowerCase().includes(query) ||
          job.requisitionId?.toLowerCase().includes(query) ||
          template?.description?.toLowerCase().includes(query)
        );
      });
    }

    if (locationFilter) {
      filtered = filtered.filter(
        (job) =>
          job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const locations = Array.from(
    new Set(
      jobs
        .map((job) => job.location)
        .filter((location): location is string => Boolean(location))
    )
  ).sort();

  const getDaysSincePosted = (date?: string) => {
    if (!date) return null;
    const posted = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Careers at Our Company
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join our team and help us build the future. Explore open positions
            and find your next opportunity.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by job title, department, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={locationFilter || "all"} onValueChange={(value) => setLocationFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all" className="text-white">
                  All Locations
                </SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location} className="text-white">
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="mt-4 text-slate-400">Loading job openings...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-2xl font-semibold mb-2">No Open Positions</h3>
            <p className="text-slate-400">
              {searchQuery || locationFilter
                ? "No jobs match your search criteria. Try adjusting your filters."
                : "We don't have any open positions at the moment. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => {
              const template = job.templateId as any;
              const department = typeof job.departmentId === 'object' && job.departmentId !== null
                ? (job.departmentId as { name?: string; code?: string }).name
                : null;
              const daysSincePosted = getDaysSincePosted(job.postingDate);
              const isExpired =
                job.expiryDate && new Date(job.expiryDate) < new Date();

              return (
                <Link
                  key={job._id}
                  href={`/careers/apply/${job._id}`}
                  className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">
                        {job.title || template?.title || "Job Title"}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                        {department && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {department}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {template?.description && (
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      {job.openings && (
                        <span>{job.openings} opening{job.openings > 1 ? "s" : ""}</span>
                      )}
                      {daysSincePosted !== null && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {daysSincePosted === 0
                            ? "Posted today"
                            : `${daysSincePosted} day${daysSincePosted > 1 ? "s" : ""} ago`}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>

                  {isExpired && (
                    <div className="mt-3 px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full inline-block">
                      Expired
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        {!loading && filteredJobs.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">
              Don't see a position that matches your skills?
            </p>
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Join Our Talent Pool
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

