"use client";

import { SlidersHorizontal } from "lucide-react";
import { DEPARTMENTS, SUBJECTS, STATUSES, EXPERIENCE_RANGES } from "../app/teachers/data";

export default function TeacherFilterBar({ filters, onChange, total }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const isFiltered =
    filters.department !== "All Departments" ||
    filters.subject !== "All Subjects" ||
    filters.status !== "All Status" ||
    filters.experience !== "Any Experience";

  const selectClass =
    "h-9 pl-3 pr-8 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 " +
    "shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 " +
    "focus:ring-blue-400/30 focus:border-blue-400 transition-all";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
      {/* Label */}
      <div className="flex items-center gap-2 text-gray-400 mr-1">
        <SlidersHorizontal size={14} />
        <span className="text-xs font-semibold uppercase tracking-widest">Filters</span>
      </div>

      {/* Department */}
      <div className="relative">
        <select value={filters.department} onChange={(e) => set("department", e.target.value)} className={selectClass}>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
      </div>

      {/* Subject */}
      <div className="relative">
        <select value={filters.subject} onChange={(e) => set("subject", e.target.value)} className={selectClass}>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
      </div>

      {/* Status */}
      <div className="relative">
        <select value={filters.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
      </div>

      {/* Experience */}
      <div className="relative">
        <select value={filters.experience} onChange={(e) => set("experience", e.target.value)} className={selectClass}>
          {EXPERIENCE_RANGES.map((e) => <option key={e}>{e}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
      </div>

      {/* Clear */}
      {isFiltered && (
        <button
          onClick={() =>
            onChange({
              department: "All Departments",
              subject: "All Subjects",
              status: "All Status",
              experience: "Any Experience",
            })
          }
          className="h-9 px-3 text-xs font-medium rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
        >
          Clear filters
        </button>
      )}

      {/* Count */}
      <span className="ml-auto text-sm text-gray-400 whitespace-nowrap">{total} teacher{total !== 1 ? "s" : ""} found</span>
    </div>
  );
}