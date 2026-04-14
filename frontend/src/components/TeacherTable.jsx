"use client";

import { Eye, Pencil, BookOpen, ChevronsUpDown } from "lucide-react";

function StatusBadge({ status }) {
  const map = {
    Active:      { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
    "On Leave":  { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500"   },
    Inactive:    { bg: "bg-gray-100",   text: "text-gray-500",    ring: "ring-gray-200",    dot: "bg-gray-400"    },
  };
  const s = map[status] ?? map.Inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function AttendanceBar({ value }) {
  const barColor =
    value >= 90 ? "bg-emerald-500" :
    value >= 75 ? "bg-blue-500"    :
    value >= 60 ? "bg-amber-400"   : "bg-red-500";
  const textColor =
    value >= 90 ? "text-emerald-700" :
    value >= 75 ? "text-blue-700"    :
    value >= 60 ? "text-amber-700"   : "text-red-600";
  return (
    <div className="min-w-[110px]">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${value}%` }} />
        </div>
        <span className={`text-xs font-bold tabular-nums ${textColor}`}>{value}%</span>
      </div>
      {value < 75 && (
        <span className="block text-[10px] text-amber-600 font-semibold mt-0.5">Below threshold</span>
      )}
    </div>
  );
}

const COLS = ["Teacher", "ID", "Subject", "Classes", "Exp.", "Attendance", "Status", "Actions"];

export default function TeacherTable({ teachers, selected, onSelect, onSelectAll }) {
  const allSelected = teachers.length > 0 && selected.length === teachers.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onSelectAll(teachers.map((t) => t.id))}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
              </th>
              {COLS.map((col) => (
                <th key={col} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    {col}
                    {!["Actions", "Classes", "Status"].includes(col) && (
                      <ChevronsUpDown size={11} className="text-gray-300" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-gray-400">
                  <p className="text-base font-medium">No teachers found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search</p>
                </td>
              </tr>
            ) : (
              teachers.map((t) => {
                const isSel = selected.includes(t.id);
                return (
                  <tr
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className={`group transition-colors duration-150 cursor-pointer ${
                      isSel ? "bg-blue-50/60" : "hover:bg-gray-50/80"
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSel} onChange={() => onSelect(t.id)} className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${t.avatarColor}`}>
                          {t.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 whitespace-nowrap">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-gray-500">{t.id}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${t.subjectBg} ${t.subjectText}`}>{t.subject}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.classes.slice(0, 2).map((c) => (
                          <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-medium">{c}</span>
                        ))}
                        {t.classes.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[11px]">+{t.classes.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-medium text-gray-700">{t.experience} yrs</span></td>
                    <td className="px-4 py-3"><AttendanceBar value={t.attendance} /></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="View"><Eye size={15} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={15} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors" title="Assign"><BookOpen size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}