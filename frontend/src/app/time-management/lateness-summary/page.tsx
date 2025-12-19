"use client";

import { useEffect, useState } from "react";
import { latenessService } from "../services/lateness.service";
import { LatenessRule } from "../models/lateness-rule";

export default function LatenessSummaryPage() {
  const [rules, setRules] = useState<LatenessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<LatenessRule | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    gracePeriodMinutes: 0,
    deductionForEachMinute: 0,
  });

  const fetchRules = async () => {
    setLoading(true);
    const data = await latenessService.getLatenessRules();
    setRules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openModal = (rule?: LatenessRule) => {
    if (rule) {
      setEditingRule(rule);
      setForm({
        name: rule.name,
        description: rule.description || "",
        gracePeriodMinutes: rule.gracePeriodMinutes,
        deductionForEachMinute: rule.deductionForEachMinute,
      });
    } else {
      setEditingRule(null);
      setForm({
        name: "",
        description: "",
        gracePeriodMinutes: 0,
        deductionForEachMinute: 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (editingRule) {
      await latenessService.updateLatenessRule(editingRule._id, form);
    } else {
      await latenessService.createLatenessRule(form);
    }
    setShowModal(false);
    fetchRules();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await latenessService.toggleLatenessRule(id, active);
    fetchRules();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lateness & Penalty Rules</h1>

      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => openModal()}
      >
        Create New Rule
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2">Name</th>
              <th className="border px-2">Grace (min)</th>
              <th className="border px-2">Deduction / min</th>
              <th className="border px-2">Active</th>
              <th className="border px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule._id}>
                <td className="border px-2">{rule.name}</td>
                <td className="border px-2">{rule.gracePeriodMinutes}</td>
                <td className="border px-2">{rule.deductionForEachMinute}</td>
                <td className="border px-2">{rule.active ? "Yes" : "No"}</td>
                <td className="border px-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-green-600 text-white rounded"
                    onClick={() => openModal(rule)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-600 text-white rounded"
                    onClick={() => toggleActive(rule._id, !rule.active)}
                  >
                    {rule.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-bold mb-3">
              {editingRule ? "Edit Rule" : "Create Rule"}
            </h2>

            <input
              placeholder="Name"
              className="border w-full mb-2 p-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Description"
              className="border w-full mb-2 p-1"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Grace Period (minutes)"
              className="border w-full mb-2 p-1"
              value={form.gracePeriodMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  gracePeriodMinutes: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="Deduction per minute"
              className="border w-full mb-4 p-1"
              value={form.deductionForEachMinute}
              onChange={(e) =>
                setForm({
                  ...form,
                  deductionForEachMinute: Number(e.target.value),
                })
              }
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
