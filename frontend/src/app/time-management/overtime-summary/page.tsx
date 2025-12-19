"use client";

import React, { useEffect, useState } from "react";
import { overtimeService } from "../services/overtime.service";
import { latenessService } from "../services/lateness.service";
import { OvertimeRule } from "../models";
import { LatenessRule } from "../models/lateness-rule";

/* ======================================================
   PAGE
====================================================== */

export default function RulesSummaryPage() {
  /* ===================== OVERTIME STATE ===================== */
  const [overtimeRules, setOvertimeRules] = useState<OvertimeRule[]>([]);
  const [overtimeLoading, setOvertimeLoading] = useState(true);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [editingOvertimeRule, setEditingOvertimeRule] =
    useState<OvertimeRule | null>(null);
  const [overtimeForm, setOvertimeForm] = useState({
    name: "",
    description: "",
  });

  /* ===================== LATENESS STATE ===================== */
  const [latenessRules, setLatenessRules] = useState<LatenessRule[]>([]);
  const [latenessLoading, setLatenessLoading] = useState(true);
  const [showLatenessModal, setShowLatenessModal] = useState(false);
  const [editingLatenessRule, setEditingLatenessRule] =
    useState<LatenessRule | null>(null);
  const [latenessForm, setLatenessForm] = useState({
    name: "",
    description: "",
    gracePeriodMinutes: 0,
    deductionForEachMinute: 0,
  });

  /* ===================== FETCH DATA ===================== */
  const fetchOvertimeRules = async () => {
    setOvertimeLoading(true);
    const data = await overtimeService.getOvertimeRules();
    setOvertimeRules(data);
    setOvertimeLoading(false);
  };

  const fetchLatenessRules = async () => {
    setLatenessLoading(true);
    const data = await latenessService.getLatenessRules();
    setLatenessRules(data);
    setLatenessLoading(false);
  };

  useEffect(() => {
    fetchOvertimeRules();
    fetchLatenessRules();
  }, []);

  /* ===================== OVERTIME HANDLERS ===================== */
  const openOvertimeModal = (rule?: OvertimeRule) => {
    if (rule) {
      setEditingOvertimeRule(rule);
      setOvertimeForm({
        name: rule.name,
        description: rule.description || "",
      });
    } else {
      setEditingOvertimeRule(null);
      setOvertimeForm({ name: "", description: "" });
    }
    setShowOvertimeModal(true);
  };

  const submitOvertime = async () => {
    if (editingOvertimeRule) {
      await overtimeService.updateOvertimeRule(
        editingOvertimeRule._id,
        overtimeForm
      );
    } else {
      await overtimeService.createOvertimeRule(overtimeForm);
    }
    setShowOvertimeModal(false);
    fetchOvertimeRules();
  };

  const approveOvertime = async (id: string) => {
    await overtimeService.approveOvertimeRule(id);
    fetchOvertimeRules();
  };

  const toggleOvertime = async (id: string, active: boolean) => {
    await overtimeService.toggleOvertimeRule(id, active);
    fetchOvertimeRules();
  };

  /* ===================== LATENESS HANDLERS ===================== */
  const openLatenessModal = (rule?: LatenessRule) => {
    if (rule) {
      setEditingLatenessRule(rule);
      setLatenessForm({
        name: rule.name,
        description: rule.description || "",
        gracePeriodMinutes: rule.gracePeriodMinutes,
        deductionForEachMinute: rule.deductionForEachMinute,
      });
    } else {
      setEditingLatenessRule(null);
      setLatenessForm({
        name: "",
        description: "",
        gracePeriodMinutes: 0,
        deductionForEachMinute: 0,
      });
    }
    setShowLatenessModal(true);
  };

  const submitLateness = async () => {
    if (editingLatenessRule) {
      await latenessService.updateLatenessRule(
        editingLatenessRule._id,
        latenessForm
      );
    } else {
      await latenessService.createLatenessRule(latenessForm);
    }
    setShowLatenessModal(false);
    fetchLatenessRules();
  };

  const toggleLateness = async (id: string, active: boolean) => {
    await latenessService.toggleLatenessRule(id, active);
    fetchLatenessRules();
  };

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-14">

        {/* ===================== OVERTIME ===================== */}
        <section className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-white">
              Overtime & Short Time Rules
            </h1>
            <button
              onClick={() => openOvertimeModal()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Rule
            </button>
          </div>

          {overtimeLoading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-center">Approved</th>
                    <th className="p-3 text-center">Active</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overtimeRules.map((rule) => (
                    <tr
                      key={rule._id}
                      className="border-t border-slate-700 hover:bg-slate-800/60"
                    >
                      <td className="p-3">{rule.name}</td>
                      <td className="p-3 text-slate-400">
                        {rule.description || "-"}
                      </td>
                      <td className="p-3 text-center">
                        {rule.approved ? "Yes" : "No"}
                      </td>
                      <td className="p-3 text-center">
                        {rule.active ? "Yes" : "No"}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openOvertimeModal(rule)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
                        >
                          Edit
                        </button>
                        {!rule.approved && (
                          <button
                            onClick={() => approveOvertime(rule._id)}
                            className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() =>
                            toggleOvertime(rule._id, !rule.active)
                          }
                          className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-500"
                        >
                          {rule.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===================== LATENESS ===================== */}
        <section className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-white">
              Lateness & Penalty Rules
            </h1>
            <button
              onClick={() => openLatenessModal()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Rule
            </button>
          </div>

          {latenessLoading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-center">Grace (min)</th>
                    <th className="p-3 text-center">Deduction / min</th>
                    <th className="p-3 text-center">Active</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {latenessRules.map((rule) => (
                    <tr
                      key={rule._id}
                      className="border-t border-slate-700 hover:bg-slate-800/60"
                    >
                      <td className="p-3">{rule.name}</td>
                      <td className="p-3 text-slate-400">
                        {rule.description || "-"}
                      </td>
                      <td className="p-3 text-center">
                        {rule.gracePeriodMinutes}
                      </td>
                      <td className="p-3 text-center">
                        {rule.deductionForEachMinute}
                      </td>
                      <td className="p-3 text-center">
                        {rule.active ? "Yes" : "No"}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openLatenessModal(rule)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            toggleLateness(rule._id, !rule.active)
                          }
                          className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-500"
                        >
                          {rule.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ===================== MODALS ===================== */}
      {(showOvertimeModal || showLatenessModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96 text-slate-200">
            {showOvertimeModal ? (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  {editingOvertimeRule ? "Edit Overtime Rule" : "Create Overtime Rule"}
                </h2>

                <input
                  className="w-full mb-2 p-2 rounded bg-slate-800 border border-slate-700"
                  placeholder="Name"
                  value={overtimeForm.name}
                  onChange={(e) =>
                    setOvertimeForm({ ...overtimeForm, name: e.target.value })
                  }
                />
                <textarea
                  className="w-full mb-4 p-2 rounded bg-slate-800 border border-slate-700"
                  placeholder="Description"
                  value={overtimeForm.description}
                  onChange={(e) =>
                    setOvertimeForm({
                      ...overtimeForm,
                      description: e.target.value,
                    })
                  }
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowOvertimeModal(false)}
                    className="px-4 py-2 bg-slate-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitOvertime}
                    className="px-4 py-2 bg-blue-600 rounded text-white"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  {editingLatenessRule ? "Edit Lateness Rule" : "Create Lateness Rule"}
                </h2>

                <input
                  className="w-full mb-2 p-2 rounded bg-slate-800 border border-slate-700"
                  placeholder="Name"
                  value={latenessForm.name}
                  onChange={(e) =>
                    setLatenessForm({ ...latenessForm, name: e.target.value })
                  }
                />
                <input
                  className="w-full mb-2 p-2 rounded bg-slate-800 border border-slate-700"
                  placeholder="Description"
                  value={latenessForm.description}
                  onChange={(e) =>
                    setLatenessForm({
                      ...latenessForm,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  className="w-full mb-2 p-2 rounded bg-slate-800 border border-slate-700"
                  placeholder="Grace Period (minutes)"
                  value={latenessForm.gracePeriodMinutes}
                  onChange={(e) =>
                    setLatenessForm({
                      ...latenessForm,
                      gracePeriodMinutes: Number(e.target.value),
                    })
                  }
                />
                <input
                  type="number"
                  className="w-full mb-4 p-2 rounded bg-slate-800 border border-slate-700"
                  placeholder="Deduction per minute"
                  value={latenessForm.deductionForEachMinute}
                  onChange={(e) =>
                    setLatenessForm({
                      ...latenessForm,
                      deductionForEachMinute: Number(e.target.value),
                    })
                  }
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowLatenessModal(false)}
                    className="px-4 py-2 bg-slate-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitLateness}
                    className="px-4 py-2 bg-blue-600 rounded text-white"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
