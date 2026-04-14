"use client";

import { Eye, Pencil, BookOpen } from "lucide-react";

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

export default function TeacherCard({ teacher: t, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(t.id)}
      className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all duration-200 ${
        selected
          ? "border-blue-400 ring-2 ring-blue-100"
          : "border-gray-100 hover:shadow-md hover:border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(t.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-4 h-4 rounded accent-blue-600 cursor-pointer"
        />
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${t.avatarColor}`}>
          {t.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{t.name}</p>
          <p className="text-xs text-gray-400 truncate">{t.email}</p>
        </div>
        <StatusBadge status={t.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">ID</p>
          <p className="text-xs font-mono text-gray-600">{t.id}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Subject</p>
          <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${t.subjectBg} ${t.subjectText}`}>
            {t.subject}
          </span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Experience</p>
          <p className="text-sm font-semibold text-gray-700">{t.experience} yrs</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Classes</p>
          <div className="flex flex-wrap gap-1">
            {t.classes.slice(0, 2).map((c) => (
              <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{c}</span>
            ))}
            {t.classes.length > 2 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px]">+{t.classes.length - 2}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Attendance</p>
        <AttendanceBar value={t.attendance} />
      </div>

      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium transition-colors">
          <Eye size={13} /> View
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors">
          <Pencil size={13} /> Edit
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-medium transition-colors">
          <BookOpen size={13} /> Assign
        </button>
      </div>
    </div>
  );
}