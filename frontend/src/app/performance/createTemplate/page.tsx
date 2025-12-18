"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, ClipboardList, ChevronDown, Check } from "lucide-react";
import { api } from "@/lib/api";
import { AppraisalTemplateType, AppraisalRatingScaleType } from "@/lib/performance-utils";
import ProtectedRoute from "@/components/protected-route";
import { AxiosError } from "axios";

const TEMPLATE_TYPES = Object.values(AppraisalTemplateType) as AppraisalTemplateType[];
const RATING_SCALES = Object.values(AppraisalRatingScaleType) as AppraisalRatingScaleType[];

type Criterion = { key: string; title: string; weight: number };

const MultiSelect = ({
  options,
  selectedIds,
  onChange,
  placeholder = "Select options"
}: {
  options: { _id: string; name: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedNames = options
    .filter((opt) => selectedIds.includes(opt._id))
    .map((opt) => opt.name)
    .join(", ");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
      >
        <span className="truncate block text-left">
          {selectedNames || <span className="text-slate-500">{placeholder}</span>}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
            {options.length > 0 ? (
              options.map((opt) => (
                <div
                  key={opt._id}
                  onClick={() => toggleSelection(opt._id)}
                  className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${selectedIds.includes(opt._id) ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-white/5 text-slate-300"
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${selectedIds.includes(opt._id) ? "bg-emerald-500 border-emerald-500" : "border-slate-500"
                      }`}
                  >
                    {selectedIds.includes(opt._id) && <Check className="w-3 h-3 text-slate-900" />}
                  </div>
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="p-2 text-slate-500 text-center text-sm">No options available</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default function CreateAppraisalTemplatePage() {
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [positions, setPositions] = useState<{ _id: string; name: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    templateType: TEMPLATE_TYPES[0],
    ratingScale: { type: RATING_SCALES[0], min: 1, max: 5 },
    criteria: [] as Criterion[],
    applicableDepartmentIds: [] as string[],
    applicablePositionIds: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [depRes, posRes] = await Promise.all([
          api.get("/organization-structure/departments"),
          api.get("/organization-structure/positions/list"),
        ]);

        setDepartments(depRes.data);
        // Map positions to have a 'name' field from 'title'
        setPositions(posRes.data.map((p: any) => ({ ...p, name: p.title || p.name })));
      } catch (error) {
        console.error("Error fetching departments or positions:", error);
      }
    };
    loadData();
  }, []);

  const addCriterion = () => {
    setForm({
      ...form,
      criteria: [...form.criteria, { key: `cri-${Date.now()}`, title: "", weight: 1 }],
    });
  };

  const submit = async () => {
    try {
      // Ensure criteria keys are set
      const criteriaWithKeys = form.criteria.map((c, index) => ({
        ...c,
        key: c.key || `cri-${Date.now()}-${index}`,
      }));

      // Construct payload exactly matching backend DTO
      const payload = {
        name: form.name,
        description: form.description,
        templateType: form.templateType,
        ratingScale: {
          type: form.ratingScale.type,
          min: form.ratingScale.min,
          max: form.ratingScale.max,
        },
        criteria: criteriaWithKeys,
        applicableDepartmentIds: form.applicableDepartmentIds,
        applicablePositionIds: form.applicablePositionIds,
        isActive: form.isActive,
      };

      console.log("Submitting payload:", payload);

      await api.post("/performance/template", payload);
      setSuccessMessage("Template created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error("Axios error response:", err.response?.data);
        alert(`Error: ${err.response?.data?.message || "Invalid data"}`);
      } else {
        console.error(err);
        alert("Unexpected error occurred");
      }
    }
  };

  return (
    <ProtectedRoute allowedRoles={["HR Manager", "System Admin"]}>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-8">
            <ClipboardList className="w-8 h-8 text-emerald-500" />
            <span className="text-white text-3xl">Create Appraisal Template</span>
          </div>

          {successMessage && (
            <div className="mb-8 bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Check className="w-5 h-5" />
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
            {/* Basic Info */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <input
                placeholder="Template Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                value={form.templateType}
                onChange={(e) =>
                  setForm({ ...form, templateType: e.target.value as AppraisalTemplateType })
                }
              >
                {TEMPLATE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-slate-200">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Scale */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                value={form.ratingScale.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ratingScale: { ...form.ratingScale, type: e.target.value as AppraisalRatingScaleType },
                  })
                }
              >
                {RATING_SCALES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-slate-200">
                    {s}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  value={form.ratingScale.min}
                  onChange={(e) =>
                    setForm({ ...form, ratingScale: { ...form.ratingScale, min: +e.target.value } })
                  }
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  value={form.ratingScale.max}
                  onChange={(e) =>
                    setForm({ ...form, ratingScale: { ...form.ratingScale, max: +e.target.value } })
                  }
                />
              </div>
            </div>

            {/* Departments */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <span className="text-slate-300">Applicable Departments</span>
              <MultiSelect
                options={departments}
                selectedIds={form.applicableDepartmentIds}
                onChange={(ids) => setForm({ ...form, applicableDepartmentIds: ids })}
                placeholder="Select Departments..."
              />
            </div>

            {/* Positions */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <span className="text-slate-300">Applicable Positions</span>
              <MultiSelect
                options={positions}
                selectedIds={form.applicablePositionIds}
                onChange={(ids) => setForm({ ...form, applicablePositionIds: ids })}
                placeholder="Select Positions..."
              />
            </div>
          </div>

          {/* Criteria */}
          <div className="mt-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300">Evaluation Criteria</span>
              <button
                onClick={addCriterion}
                className="flex items-center gap-2 hover:bg-white/10 rounded-xl px-3 py-2 transition-all"
              >
                <Plus className="w-6 h-6 text-slate-200" /> <span className="text-slate-200">Add</span>
              </button>
            </div>

            <div className="space-y-3">
              {form.criteria.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    placeholder="Title"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                    value={c.title}
                    onChange={(e) => {
                      const updated = [...form.criteria];
                      updated[i].title = e.target.value;
                      setForm({ ...form, criteria: updated });
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Weight"
                    className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                    value={c.weight}
                    onChange={(e) => {
                      const updated = [...form.criteria];
                      updated[i].weight = +e.target.value;
                      setForm({ ...form, criteria: updated });
                    }}
                  />
                  <button
                    onClick={() => setForm({ ...form, criteria: form.criteria.filter((_, idx) => idx !== i) })}
                    className="hover:bg-white/10 rounded-xl px-3"
                  >
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={submit}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Create Template
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
