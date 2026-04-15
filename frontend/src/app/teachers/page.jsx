"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Users, UserCheck, UserMinus, BookOpen, ClipboardList,
  Search, Download, Plus, X, Bell, ChevronDown, Loader2,
  SlidersHorizontal, Eye, Pencil, ChevronsUpDown,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES         = ["All Status", "Active", "On Leave", "Inactive"];
const EXPERIENCE_RANGES = ["Any Experience", "0–3 yrs", "4–7 yrs", "8–12 yrs", "12+ yrs"];
const INIT_FILTERS     = {
  department: "All Departments",
  subject:    "All Subjects",
  status:     "All Status",
  experience: "Any Experience",
};

// ── Auth helper ───────────────────────────────────────────────────────────────
const getToken = () => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};

function expMatch(exp, range) {
  if (range === "Any Experience") return true;
  if (range === "0–3 yrs")  return exp <= 3;
  if (range === "4–7 yrs")  return exp >= 4 && exp <= 7;
  if (range === "8–12 yrs") return exp >= 8 && exp <= 12;
  if (range === "12+ yrs")  return exp > 12;
  return true;
}


// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active:     { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
    "On Leave": { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500"   },
    Inactive:   { bg: "bg-gray-100",   text: "text-gray-500",    ring: "ring-gray-200",    dot: "bg-gray-400"    },
  };
  const s = map[status] ?? map.Inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}


// ─────────────────────────────────────────────
// ATTENDANCE BAR
// ─────────────────────────────────────────────
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


// ─────────────────────────────────────────────
// TEACHER SUMMARY CARD
// ─────────────────────────────────────────────
function TeacherSummaryCard({ icon: Icon, value, label, iconBg, iconColor, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {trend && (
          <p className={`text-xs font-semibold mt-1 ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
            {trend.positive ? "↑" : "↓"} {trend.text}
          </p>
        )}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// TEACHER FILTER BAR
// ─────────────────────────────────────────────
function TeacherFilterBar({ filters, onChange, total, departments, subjects, statuses, experienceRanges }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const isFiltered =
    filters.department !== "All Departments" ||
    filters.subject    !== "All Subjects"    ||
    filters.status     !== "All Status"      ||
    filters.experience !== "Any Experience";

  const selectClass =
    "h-9 pl-3 pr-8 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 " +
    "shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 " +
    "focus:ring-blue-400/30 focus:border-blue-400 transition-all";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-gray-400 mr-1">
        <SlidersHorizontal size={14} />
        <span className="text-xs font-semibold uppercase tracking-widest">Filters</span>
      </div>

      {[
        { key: "department", options: departments },
        { key: "subject",    options: subjects    },
        { key: "status",     options: statuses    },
        { key: "experience", options: experienceRanges },
      ].map(({ key, options }) => (
        <div key={key} className="relative">
          <select
            value={filters[key]}
            onChange={e => set(key, e.target.value)}
            className={selectClass}
          >
            {(options || []).map(o => <option key={o}>{o}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
        </div>
      ))}

      {isFiltered && (
        <button
          onClick={() => onChange(INIT_FILTERS)}
          className="h-9 px-3 text-xs font-medium rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
        >
          Clear filters
        </button>
      )}

      <span className="ml-auto text-sm text-gray-400 whitespace-nowrap">
        {total} teacher{total !== 1 ? "s" : ""} found
      </span>
    </div>
  );
}


// ─────────────────────────────────────────────
// TEACHER CARD  (mobile)
// ─────────────────────────────────────────────
function TeacherCard({ teacher: t, selected, onSelect }) {
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
          onClick={e => e.stopPropagation()}
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
            {t.classes.slice(0, 2).map(c => (
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

      <div className="mt-4 flex gap-2" onClick={e => e.stopPropagation()}>
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


// ─────────────────────────────────────────────
// TEACHER TABLE  (desktop)
// ─────────────────────────────────────────────
const TABLE_COLS = ["Teacher", "ID", "Subject", "Classes", "Exp.", "Attendance", "Status", "Actions"];

function TeacherTable({ teachers, selected, onSelect, onSelectAll }) {
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
                  onChange={() => onSelectAll(teachers.map(t => t.id))}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
              </th>
              {TABLE_COLS.map(col => (
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
              teachers.map(t => {
                const isSel = selected.includes(t.id);
                return (
                  <tr
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className={`group transition-colors duration-150 cursor-pointer ${
                      isSel ? "bg-blue-50/60" : "hover:bg-gray-50/80"
                    }`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
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
                        {t.classes.slice(0, 2).map(c => (
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
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
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


// ─────────────────────────────────────────────
// TEACHERS PAGE  (main export)
// ─────────────────────────────────────────────
export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [meta,     setMeta]     = useState({ departments: [], subjects: [] });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [filters,  setFilters]  = useState(INIT_FILTERS);
  const [selected, setSelected] = useState([]);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token   = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/admin/teachers",      { headers }).then(r => r.json()),
      fetch("/api/admin/teachers/meta", { headers }).then(r => r.json()),
    ])
      .then(([teacherData, metaData]) => {
        if (Array.isArray(teacherData)) {
          setTeachers(teacherData);
        } else {
          setError(teacherData.message || "Failed to load teachers");
        }
        if (metaData.departments) setMeta(metaData);
      })
      .catch(() => setError("Network error — could not reach server"))
      .finally(() => setLoading(false));
  }, []);

  // ── Summary stats ────────────────────────────────────────────────────────
  const total   = teachers.length;
  const active  = teachers.filter(t => t.status === "Active").length;
  const onLeave = teachers.filter(t => t.status === "On Leave").length;
  const avgCls  = total
    ? Math.round(teachers.reduce((s, t) => s + (t.classes?.length ?? 0), 0) / total)
    : 0;
  const pending = teachers.reduce((s, t) => s + (t.pendingTasks ?? 0), 0);

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return teachers.filter(t => {
      const matchQ    = !q ||
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      const matchDept = filters.department === "All Departments" || t.department === filters.department;
      const matchSubj = filters.subject    === "All Subjects"    || t.subject    === filters.subject;
      const matchStat = filters.status     === "All Status"      || t.status     === filters.status;
      const matchExp  = expMatch(t.experience, filters.experience);
      return matchQ && matchDept && matchSubj && matchStat && matchExp;
    });
  }, [teachers, search, filters]);

  // ── Selection helpers ────────────────────────────────────────────────────
  const toggleSelect = id  => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll    = ids => setSelected(p => p.length === ids.length ? [] : ids);

  // ── Filter options ───────────────────────────────────────────────────────
  const departments = ["All Departments", ...meta.departments];
  const subjects    = ["All Subjects",    ...meta.subjects];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* 
        NOTE: <Sidebar /> component import karo apne project se.
        Example: import Sidebar from "@/components/Sidebar";
        Aur yahan use karo: <Sidebar />
      */}

      <main className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search teachers, subjects…"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
                              flex items-center justify-center text-white text-xs font-bold">AP</div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page body */}
        <div className="flex-1 p-6 lg:p-8 space-y-5">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Teachers</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage all teacher records</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, subject, ID…"
                  className="h-10 w-full sm:w-56 pl-9 pr-8 rounded-xl border border-gray-200 bg-white
                             text-sm text-gray-700 placeholder:text-gray-400 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>
              <button className="h-10 px-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white
                                 text-gray-600 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
                <Download size={14} /> Export
              </button>
              <button className="h-10 px-4 flex items-center gap-2 rounded-xl bg-blue-600 text-white
                                 text-sm font-semibold shadow-sm shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all">
                <Plus size={15} /> Add Teacher
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <TeacherSummaryCard icon={Users}         value={loading ? "—" : total}               label="Total Teachers"  iconBg="bg-blue-50"    iconColor="text-blue-600"    trend={{ positive: true,  text: "vs last term" }} />
            <TeacherSummaryCard icon={UserCheck}     value={loading ? "—" : active}              label="Active Teachers" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <TeacherSummaryCard icon={UserMinus}     value={loading ? "—" : onLeave}             label="On Leave"        iconBg="bg-amber-50"   iconColor="text-amber-600"   />
            <TeacherSummaryCard icon={BookOpen}      value={loading ? "—" : `${avgCls} / tchr`}  label="Avg Classes"     iconBg="bg-violet-50"  iconColor="text-violet-600"  />
            <TeacherSummaryCard icon={ClipboardList} value={loading ? "—" : pending}             label="Pending Tasks"   iconBg="bg-rose-50"    iconColor="text-rose-600"    trend={{ positive: false, text: "Need attention" }} />
          </div>

          {/* Filters */}
          <TeacherFilterBar
            filters={filters}
            onChange={setFilters}
            total={filtered.length}
            departments={departments}
            subjects={subjects}
            statuses={STATUSES}
            experienceRanges={EXPERIENCE_RANGES}
          />

          {/* Bulk action bar */}
          {selected.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-600 rounded-xl text-white text-sm shadow-lg shadow-blue-900/20">
              <span className="font-semibold">{selected.length} selected</span>
              <span className="text-blue-300">·</span>
              <button className="underline underline-offset-2 hover:text-blue-200 transition-colors">Delete</button>
              <button className="underline underline-offset-2 hover:text-blue-200 transition-colors">Export</button>
              <button onClick={() => setSelected([])} className="ml-auto text-blue-300 hover:text-white transition-colors">
                <X size={15} />
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" />
              <span className="text-sm">Loading teachers…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-12 text-center text-red-500">
              <p className="font-medium">{error}</p>
              <p className="text-sm text-gray-400 mt-1">Check your network or login session</p>
            </div>
          )}

          {/* Desktop table */}
          {!loading && !error && (
            <div className="hidden md:block">
              <TeacherTable
                teachers={filtered}
                selected={selected}
                onSelect={toggleSelect}
                onSelectAll={toggleAll}
              />
            </div>
          )}

          {/* Mobile cards */}
          {!loading && !error && (
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.length === 0 ? (
                <div className="col-span-2 py-16 text-center text-gray-400">
                  <p className="text-base font-medium">No teachers found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or search</p>
                </div>
              ) : (
                filtered.map(t => (
                  <TeacherCard key={t.id} teacher={t} selected={selected.includes(t.id)} onSelect={toggleSelect} />
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && (
            <div className="flex items-center justify-between text-sm text-gray-400 pb-2">
              <p>
                Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
                <span className="font-semibold text-gray-700">{total}</span> teachers
              </p>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-500 transition-colors">←</button>
                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white font-semibold text-xs">1</button>
                <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-500 transition-colors">→</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}