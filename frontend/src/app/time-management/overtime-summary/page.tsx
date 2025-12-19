"use client";

import React, { useEffect, useState } from "react";
import { overtimeService } from "../services/overtime.service";
import { latenessService } from "../services/lateness.service";
import { OvertimeRule } from "../models";
import { LatenessRule } from "../models/lateness-rule";

export default function RulesSummaryPage() {
  /* ===================== OVERTIME STATE ===================== */
  const [overtimeRules, setOvertimeRules] = useState<OvertimeRule[]>([]);
  const [overtimeLoading, setOvertimeLoading] = useState(true);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [editingOvertimeRule, setEditingOvertimeRule] = useState<OvertimeRule | null>(null);
  const [overtimeForm, setOvertimeForm] = useState({ name: "", description: "" });

  /* ===================== LATENESS STATE ===================== */
  const [latenessRules, setLatenessRules] = useState<LatenessRule[]>([]);
  const [latenessLoading, setLatenessLoading] = useState(true);
  const [showLatenessModal, setShowLatenessModal] = useState(false);
  const [editingLatenessRule, setEditingLatenessRule] = useState<LatenessRule | null>(null);
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
      setOvertimeForm({ name: rule.name, description: rule.description || "" });
    } else {
      setEditingOvertimeRule(null);
      setOvertimeForm({ name: "", description: "" });
    }
    setShowOvertimeModal(true);
  };

  const submitOvertime = async () => {
    try {
      if (editingOvertimeRule) {
        await overtimeService.updateOvertimeRule(editingOvertimeRule._id, overtimeForm);
      } else {
        await overtimeService.createOvertimeRule(overtimeForm);
      }
      setShowOvertimeModal(false);
      fetchOvertimeRules();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error saving overtime rule");
    }
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
    try {
      if (editingLatenessRule) {
        await latenessService.updateLatenessRule(editingLatenessRule._id, latenessForm);
      } else {
        await latenessService.createLatenessRule(latenessForm);
      }
      setShowLatenessModal(false);
      fetchLatenessRules();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error saving lateness rule");
    }
  };

  const toggleLateness = async (id: string, active: boolean) => {
    await latenessService.toggleLatenessRule(id, active);
    fetchLatenessRules();
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="p-6 space-y-12">
      {/* OVERTIME SECTION */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Overtime & Short Time Rules</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => openOvertimeModal()}
        >
          Create Overtime Rule
        </button>
        {overtimeLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2">Name</th>
                <th className="border px-2">Description</th>
                <th className="border px-2">Approved</th>
                <th className="border px-2">Active</th>
                <th className="border px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overtimeRules.map((rule) => (
                <tr key={rule._id}>
                  <td className="border px-2">{rule.name}</td>
                  <td className="border px-2">{rule.description}</td>
                  <td className="border px-2">{rule.approved ? "Yes" : "No"}</td>
                  <td className="border px-2">{rule.active ? "Yes" : "No"}</td>
                  <td className="border px-2 space-x-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() => openOvertimeModal(rule)}
                    >
                      Edit
                    </button>
                    {!rule.approved && (
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                        onClick={() => approveOvertime(rule._id)}
                      >
                        Approve
                      </button>
                    )}
                    <button
                      className="bg-gray-600 text-white px-2 py-1 rounded"
                      onClick={() => toggleOvertime(rule._id, !rule.active)}
                    >
                      {rule.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* LATENESS SECTION */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Lateness & Penalty Rules</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => openLatenessModal()}
        >
          Create Lateness Rule
        </button>
        {latenessLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2">Name</th>
                <th className="border px-2">Description</th>
                <th className="border px-2">Grace (min)</th>
                <th className="border px-2">Deduction / min</th>
                <th className="border px-2">Active</th>
                <th className="border px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {latenessRules.map((rule) => (
                <tr key={rule._id}>
                  <td className="border px-2">{rule.name}</td>
                  <td className="border px-2">{rule.description}</td>
                  <td className="border px-2">{rule.gracePeriodMinutes}</td>
                  <td className="border px-2">{rule.deductionForEachMinute}</td>
                  <td className="border px-2">{rule.active ? "Yes" : "No"}</td>
                  <td className="border px-2 space-x-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() => openLatenessModal(rule)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-gray-600 text-white px-2 py-1 rounded"
                      onClick={() => toggleLateness(rule._id, !rule.active)}
                    >
                      {rule.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* OVERTIME MODAL */}
      {showOvertimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingOvertimeRule ? "Edit Rule" : "Create Rule"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              className="border w-full mb-2 p-1"
              value={overtimeForm.name}
              onChange={(e) => setOvertimeForm({ ...overtimeForm, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="border w-full mb-4 p-1"
              value={overtimeForm.description}
              onChange={(e) => setOvertimeForm({ ...overtimeForm, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowOvertimeModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">
                Cancel
              </button>
              <button onClick={submitOvertime} className="px-4 py-2 bg-blue-600 text-white rounded">
                {editingOvertimeRule ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LATENESS MODAL */}
      {showLatenessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-bold mb-3">
              {editingLatenessRule ? "Edit Rule" : "Create Rule"}
            </h2>
            <input
              placeholder="Name"
              className="border w-full mb-2 p-1"
              value={latenessForm.name}
              onChange={(e) => setLatenessForm({ ...latenessForm, name: e.target.value })}
            />
            <input
              placeholder="Description"
              className="border w-full mb-2 p-1"
              value={latenessForm.description}
              onChange={(e) => setLatenessForm({ ...latenessForm, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Grace Period (minutes)"
              className="border w-full mb-2 p-1"
              value={latenessForm.gracePeriodMinutes}
              onChange={(e) => setLatenessForm({ ...latenessForm, gracePeriodMinutes: Number(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Deduction per minute"
              className="border w-full mb-4 p-1"
              value={latenessForm.deductionForEachMinute}
              onChange={(e) => setLatenessForm({ ...latenessForm, deductionForEachMinute: Number(e.target.value) })}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLatenessModal(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={submitLateness}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
