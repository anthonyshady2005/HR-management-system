"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Clock,
  Eye,
} from "lucide-react";


import {
  holidayService,
  Holiday,
  HolidayType,
  CreateHolidayInput,
  UpdateHolidayInput,
} from "../services/holiday.service";
import { useAuth } from "@/providers/auth-provider";
import { useRequireRole } from "@/hooks/use-require-role";
const ALLOWED_ROLES = ["HR Admin", "System Admin"];

export default function HolidayManagementPage() {
  const { status } = useAuth();
  useRequireRole(ALLOWED_ROLES, "/");
  /* ===================== STATE ===================== */
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    type: "",
    year: new Date().getFullYear().toString(),
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  const [formData, setFormData] = useState<CreateHolidayInput>({
    type: HolidayType.NATIONAL,
    startDate: "",
    endDate: "",
    name: "",
  });

  /* ===================== US16 - SYNC STATE ===================== */
  const [syncing, setSyncing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [syncPreview, setSyncPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  /* ===================== LOAD DATA ===================== */
  const loadHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await holidayService.getAllHolidays({
        type: filters.type || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
      });
      setHolidays(data);
    } catch (err: any) {
      console.error("Failed to load holidays:", err);
      setError(err?.response?.data?.message || "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingHolidays = async () => {
    try {
      const data = await holidayService.getUpcomingHolidays(30);
      setUpcomingHolidays(data);
    } catch (err) {
      console.error("Failed to load upcoming holidays:", err);
    }
  };

  useEffect(() => {
    loadHolidays();
    loadUpcomingHolidays();
  }, [filters]);

  /* ===================== HANDLERS ===================== */
  const handleCreateHoliday = async () => {
    if (!formData.startDate || !formData.name) {
      alert("Please fill in all required fields (Name and Start Date)");
      return;
    }

    try {
      await holidayService.createHoliday(formData);
      setSuccessMessage("Holiday created successfully!");
      setIsCreateOpen(false);
      resetForm();
      await loadHolidays();
      await loadUpcomingHolidays();
    } catch (err: any) {
      console.error("Failed to create holiday:", err);
      alert(err?.response?.data?.message || "Failed to create holiday");
    }
  };

  const handleUpdateHoliday = async () => {
    if (!selectedHoliday) return;

    if (!formData.startDate || !formData.name) {
      alert("Please fill in all required fields (Name and Start Date)");
      return;
    }

    try {
      const updateData: UpdateHolidayInput = {
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        name: formData.name,
      };

      await holidayService.updateHoliday(selectedHoliday._id, updateData);
      setSuccessMessage("Holiday updated successfully!");
      setIsEditOpen(false);
      setSelectedHoliday(null);
      resetForm();
      await loadHolidays();
      await loadUpcomingHolidays();
    } catch (err: any) {
      console.error("Failed to update holiday:", err);
      alert(err?.response?.data?.message || "Failed to update holiday");
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) {
      return;
    }

    try {
      await holidayService.deleteHoliday(holidayId);
      setSuccessMessage("Holiday deleted successfully!");
      await loadHolidays();
      await loadUpcomingHolidays();
    } catch (err: any) {
      console.error("Failed to delete holiday:", err);
      alert(err?.response?.data?.message || "Failed to delete holiday");
    }
  };

  /* ===================== US16 - SYNC HANDLERS ===================== */
  const handlePreviewSync = async () => {
    const year = parseInt(filters.year) || new Date().getFullYear();
    
    setLoadingPreview(true);
    try {
      const preview = await holidayService.previewHolidaySync(year);
      setSyncPreview(preview);
      setIsPreviewOpen(true);
    } catch (err: any) {
      console.error("Failed to preview sync:", err);
      alert(err?.response?.data?.message || "Failed to preview holiday sync");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSyncWithLeaves = async () => {
    const year = parseInt(filters.year) || new Date().getFullYear();
    
    if (!confirm(
      `This will sync holidays from the Leaves calendar for ${year} and create attendance records for affected employees.\n\n` +
      `Continue?`
    )) {
      return;
    }

    setSyncing(true);
    try {
      const result = await holidayService.syncHolidaysFromLeaves(year);
      setSuccessMessage(
        `${result.message}\n` +
        `${result.totalRecordsCreated} attendance records created for ${result.affectedEmployeesCount} employees across ${result.totalHolidayDates} holiday dates.`
      );
      await loadHolidays();
      await loadUpcomingHolidays();
    } catch (err: any) {
      console.error("Failed to sync holidays:", err);
      alert(err?.response?.data?.message || "Failed to sync holidays from Leaves module");
    } finally {
      setSyncing(false);
    }
  };

  const openEditModal = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setFormData({
      type: holiday.type,
      startDate: holiday.startDate.split("T")[0],
      endDate: holiday.endDate ? holiday.endDate.split("T")[0] : "",
      name: holiday.name || "",
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: HolidayType.NATIONAL,
      startDate: "",
      endDate: "",
      name: "",
    });
  };

  const closeModals = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsPreviewOpen(false);
    setSelectedHoliday(null);
    setSyncPreview(null);
    resetForm();
  };

  /* ===================== UI ===================== */
  if (status === "loading") {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Holiday Management
            </h1>
            <p className="text-slate-400">
              Configure national holidays, organizational holidays, and weekly
              rest days
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviewSync}
              disabled={loadingPreview}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm disabled:opacity-50"
            >
              <Eye size={16} className={loadingPreview ? "animate-spin" : ""} />
              {loadingPreview ? "Loading..." : "Preview Sync"}
            </button>

            <button
              onClick={handleSyncWithLeaves}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-50"
            >
              <RefreshCw  size={16} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync from Leaves"}
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Plus size={16} />
              Add Holiday
            </button>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/40 rounded-lg p-3 text-sm text-green-300 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="whitespace-pre-line flex-1">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-400 hover:text-green-300 flex-shrink-0"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* UPCOMING HOLIDAYS CARDS */}
        {upcomingHolidays.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingHolidays.slice(0, 3).map((holiday) => {
              const badge = holidayService.getHolidayTypeBadge(holiday.type);
              const duration = holidayService.calculateDuration(
                holiday.startDate,
                holiday.endDate
              );
              return (
                <div
                  key={holiday._id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs mb-1">Upcoming</p>
                      <p className="text-lg font-bold text-white">
                        {holiday.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {duration} {duration === 1 ? "day" : "days"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FILTERS */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-slate-400 mb-1">Year</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
                className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                placeholder="2024"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-400 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="">All Types</option>
                <option value={HolidayType.NATIONAL}>National</option>
                <option value={HolidayType.ORGANIZATIONAL}>
                  Organizational
                </option>
                <option value={HolidayType.WEEKLY_REST}>Weekly Rest</option>
              </select>
            </div>

            <button
              onClick={loadHolidays}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>

            <button
              onClick={() => {
                setFilters({ type: "", year: new Date().getFullYear().toString() });
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* HOLIDAYS TABLE */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Configured Holidays
            </h2>
            <button
              onClick={loadHolidays}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-sm disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center text-slate-400 py-12">
              Loading holidays…
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No holidays found</p>
              <p className="text-xs mt-2">
                Try adjusting your filters or create a new holiday
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 px-4 text-left">Holiday Name</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Start Date</th>
                    <th className="py-3 px-4 text-left">End Date</th>
                    <th className="py-3 px-4 text-left">Duration</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((holiday) => {
                    const badge = holidayService.getHolidayTypeBadge(
                      holiday.type
                    );
                    const duration = holidayService.calculateDuration(
                      holiday.startDate,
                      holiday.endDate
                    );
                    const isActive = holidayService.isHolidayActive(
                      holiday.startDate,
                      holiday.endDate
                    );

                    return (
                      <tr
                        key={holiday._id}
                        className="border-b border-slate-700 hover:bg-slate-700/50"
                      >
                        <td className="py-3 px-4 text-white font-medium">
                          {holiday.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {holidayService.formatDate(holiday.startDate)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {holiday.endDate
                            ? holidayService.formatDate(holiday.endDate)
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {duration} {duration === 1 ? "day" : "days"}
                        </td>
                        <td className="py-3 px-4">
                          {isActive ? (
                            <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs bg-slate-500/20 text-slate-400">
                              Past
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(holiday)}
                              className="px-3 py-1 text-xs rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center gap-1"
                            >
                              <Edit3 size={12} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteHoliday(holiday._id)}
                              className="px-3 py-1 text-xs rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SYNC PREVIEW MODAL */}
      {isPreviewOpen && syncPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl text-white font-semibold">
                  Holiday Sync Preview
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Preview which employees will be affected by the sync
                </p>
              </div>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* SUMMARY */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Year</p>
                <p className="text-2xl font-bold text-white">{syncPreview.year}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Holiday Dates</p>
                <p className="text-2xl font-bold text-white">{syncPreview.totalHolidayDates}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Affected Employees</p>
                <p className="text-2xl font-bold text-white">{syncPreview.totalAffectedEmployees}</p>
              </div>
            </div>

            {/* PREVIEW DATA */}
            <div className="space-y-4">
              {syncPreview.preview.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No employees will be affected by this sync</p>
                </div>
              ) : (
                syncPreview.preview.map((day: any, idx: number) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{day.date}</h4>
                      <span className="text-xs text-slate-400">
                        {day.affectedEmployees.length} employee(s)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {day.affectedEmployees.map((emp: any, empIdx: number) => (
                        <div
                          key={empIdx}
                          className="flex items-center justify-between text-xs bg-slate-900 rounded px-3 py-2"
                        >
                          <div>
                            <p className="text-white">{emp.employeeName}</p>
                            <p className="text-slate-400">{emp.employeeEmail}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300">{emp.shiftName}</p>
                            <p className="text-slate-400">{emp.shiftTime}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  closeModals();
                  handleSyncWithLeaves();
                }}
                className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw  size={16} />
                Proceed with Sync
              </button>
              <button
                onClick={closeModals}
                className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-white font-semibold">
                Create Holiday
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="e.g., New Year's Day"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as HolidayType,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value={HolidayType.NATIONAL}>National</option>
                  <option value={HolidayType.ORGANIZATIONAL}>
                    Organizational
                  </option>
                  <option value={HolidayType.WEEKLY_REST}>Weekly Rest</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty for single-day holidays
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateHoliday}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Create Holiday
              </button>
              <button
                onClick={closeModals}
                className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-white font-semibold">
                Edit Holiday
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="e.g., New Year's Day"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as HolidayType,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value={HolidayType.NATIONAL}>National</option>
                  <option value={HolidayType.ORGANIZATIONAL}>
                    Organizational
                  </option>
                  <option value={HolidayType.WEEKLY_REST}>Weekly Rest</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty for single-day holidays
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateHoliday}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Update Holiday
              </button>
              <button
                onClick={closeModals}
                className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
}