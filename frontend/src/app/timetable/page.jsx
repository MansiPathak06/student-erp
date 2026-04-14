"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bell, ChevronDown, Search, Download, Plus, X, Save,
  Clock, BookOpen, UserCog, Trash2, Pencil, CalendarDays,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle,
} from "lucide-react";


// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const DAYS    = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"];
const CLASSES = ["10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];

const TEACHERS = [
  { id: "TCH-001", name: "Dr. Priya Sharma",  subject: "Physics"     },
  { id: "TCH-002", name: "Mr. Arjun Mehta",   subject: "Mathematics" },
  { id: "TCH-003", name: "Ms. Kavya Nair",    subject: "Chemistry"   },
  { id: "TCH-004", name: "Mr. Rohan Das",     subject: "Biology"     },
  { id: "TCH-005", name: "Dr. Sunita Rao",    subject: "English"     },
  { id: "TCH-006", name: "Mr. Vikram Singh",  subject: "History"     },
  { id: "TCH-007", name: "Ms. Anjali Verma",  subject: "Mathematics" },
  { id: "TCH-008", name: "Mr. Dev Kumar",     subject: "Computer Sc" },
];

const SUBJECTS = ["Physics", "Mathematics", "Chemistry", "Biology", "English", "History", "Computer Sc", "Physical Ed", "Hindi", "Geography"];

const SUBJECT_COLORS = {
  "Physics":     { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500"    },
  "Mathematics": { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-500"  },
  "Chemistry":   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "Biology":     { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   dot: "bg-green-500"   },
  "English":     { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500"    },
  "History":     { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  "Computer Sc": { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    dot: "bg-cyan-500"    },
  "Physical Ed": { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-500"  },
  "Hindi":       { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    dot: "bg-pink-500"    },
  "Geography":   { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-500"    },
};
const DEFAULT_COLOR = { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" };

// Initial timetable: array of period entries
let _id = 1;
const mk = (cls, day, period, subject, teacherId) => ({
  id: `PER-${String(_id++).padStart(3, "0")}`, class: cls, day, period, subject, teacherId,
});

const INITIAL_TIMETABLE = [
  // 10-A
  mk("10-A","Monday","8:00 AM","Physics","TCH-001"),
  mk("10-A","Monday","9:00 AM","Mathematics","TCH-002"),
  mk("10-A","Monday","10:00 AM","English","TCH-005"),
  mk("10-A","Monday","11:00 AM","Chemistry","TCH-003"),
  mk("10-A","Monday","2:00 PM","History","TCH-006"),
  mk("10-A","Tuesday","8:00 AM","Mathematics","TCH-002"),
  mk("10-A","Tuesday","9:00 AM","Physics","TCH-001"),
  mk("10-A","Tuesday","10:00 AM","Biology","TCH-004"),
  mk("10-A","Tuesday","11:00 AM","Hindi","TCH-005"),
  mk("10-A","Wednesday","8:00 AM","Chemistry","TCH-003"),
  mk("10-A","Wednesday","9:00 AM","English","TCH-005"),
  mk("10-A","Wednesday","10:00 AM","Mathematics","TCH-002"),
  mk("10-A","Wednesday","2:00 PM","Physical Ed","TCH-004"),
  mk("10-A","Thursday","8:00 AM","Physics","TCH-001"),
  mk("10-A","Thursday","9:00 AM","History","TCH-006"),
  mk("10-A","Thursday","10:00 AM","Computer Sc","TCH-008"),
  mk("10-A","Thursday","11:00 AM","Biology","TCH-004"),
  mk("10-A","Friday","8:00 AM","English","TCH-005"),
  mk("10-A","Friday","9:00 AM","Chemistry","TCH-003"),
  mk("10-A","Friday","10:00 AM","Physics","TCH-001"),
  mk("10-A","Friday","11:00 AM","Mathematics","TCH-002"),
  mk("10-A","Saturday","8:00 AM","Computer Sc","TCH-008"),
  mk("10-A","Saturday","9:00 AM","Physical Ed","TCH-004"),
  // 10-B
  mk("10-B","Monday","8:00 AM","Mathematics","TCH-007"),
  mk("10-B","Monday","9:00 AM","Physics","TCH-001"),
  mk("10-B","Monday","10:00 AM","Biology","TCH-004"),
  mk("10-B","Tuesday","8:00 AM","Chemistry","TCH-003"),
  mk("10-B","Tuesday","9:00 AM","English","TCH-005"),
  mk("10-B","Wednesday","8:00 AM","Physics","TCH-001"),
  mk("10-B","Wednesday","9:00 AM","Mathematics","TCH-007"),
  mk("10-B","Thursday","8:00 AM","History","TCH-006"),
  mk("10-B","Friday","8:00 AM","Computer Sc","TCH-008"),
  mk("10-B","Friday","9:00 AM","Chemistry","TCH-003"),
  // 11-A
  mk("11-A","Monday","8:00 AM","Chemistry","TCH-003"),
  mk("11-A","Monday","9:00 AM","Biology","TCH-004"),
  mk("11-A","Monday","10:00 AM","Physics","TCH-001"),
  mk("11-A","Tuesday","8:00 AM","English","TCH-005"),
  mk("11-A","Tuesday","9:00 AM","Chemistry","TCH-003"),
  mk("11-A","Wednesday","8:00 AM","Mathematics","TCH-002"),
  mk("11-A","Wednesday","9:00 AM","History","TCH-006"),
  mk("11-A","Thursday","8:00 AM","Physics","TCH-001"),
  mk("11-A","Friday","8:00 AM","Biology","TCH-004"),
  mk("11-A","Friday","9:00 AM","Mathematics","TCH-002"),
];


// ─────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  const styles = { success: "bg-green-600", error: "bg-red-600", info: "bg-blue-600" };
  const Icon   = type === "success" ? CheckCircle : type === "error" ? AlertCircle : AlertCircle;
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl ${styles[type]}`}>
      <Icon size={16} />{message}
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, accent, bg, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}><Icon size={16} className={accent} /></div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

// Period cell in the grid
function PeriodCell({ entry, onEdit, onDelete }) {
  if (!entry) return <div className="h-full min-h-[72px] rounded-xl border-2 border-dashed border-gray-100 hover:border-blue-200 transition-colors" />;
  const col     = SUBJECT_COLORS[entry.subject] ?? DEFAULT_COLOR;
  const teacher = TEACHERS.find(t => t.id === entry.teacherId);
  return (
    <div className={`group relative h-full min-h-[72px] rounded-xl border ${col.border} ${col.bg} p-2.5 flex flex-col gap-1 cursor-pointer hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
          <span className={`text-xs font-bold leading-tight ${col.text}`}>{entry.subject}</span>
        </div>
        {/* action buttons — show on hover */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit(entry); }}
            className="p-1 rounded-md hover:bg-white/70 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={11} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
            className="p-1 rounded-md hover:bg-white/70 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={11} /></button>
        </div>
      </div>
      {teacher && <p className={`text-[10px] leading-tight ${col.text} opacity-70 truncate`}>{teacher.name.split(" ").slice(-1)[0]}</p>}
      <p className={`text-[10px] leading-tight ${col.text} opacity-50`}>{entry.period}</p>
    </div>
  );
}


// ─────────────────────────────────────────────
// ADD / EDIT PERIOD MODAL
// ─────────────────────────────────────────────

const EMPTY_FORM = { class: "10-A", day: "Monday", period: "8:00 AM", subject: "Physics", teacherId: "TCH-001" };

function PeriodModal({ initial, onClose, onSave, existingEntries }) {
  const isEdit = !!initial?.id;
  const [form, setForm]     = useState(initial ? { ...initial } : { ...EMPTY_FORM });
  const [error, setError]   = useState("");

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })); setError(""); }

  function handleSave() {
    // Conflict check (same class + day + period, different id)
    const conflict = existingEntries.find(e =>
      e.class === form.class && e.day === form.day && e.period === form.period &&
      e.id !== (initial?.id ?? "")
    );
    if (conflict) { setError(`${form.class} already has a period at ${form.period} on ${form.day}.`); return; }
    // Teacher double-booking check
    const teacherConflict = existingEntries.find(e =>
      e.teacherId === form.teacherId && e.day === form.day && e.period === form.period &&
      e.id !== (initial?.id ?? "")
    );
    if (teacherConflict) { setError(`This teacher already has a class (${teacherConflict.class}) at this time.`); return; }
    onSave({ ...form, id: initial?.id ?? `PER-${String(Date.now()).slice(-4)}` });
  }

  const selClass = "w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Period" : "Add Period"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? "Update the period details" : "Schedule a new class period"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Row 1: Class + Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Class</label>
              <div className="relative">
                <select value={form.class} onChange={e => set("class", e.target.value)} className={selClass}>
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Day</label>
              <div className="relative">
                <select value={form.day} onChange={e => set("day", e.target.value)} className={selClass}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Period time */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Period Time</label>
            <div className="relative">
              <select value={form.period} onChange={e => set("period", e.target.value)} className={selClass}>
                {PERIODS.map(p => <option key={p}>{p}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Subject</label>
            <div className="relative">
              <select value={form.subject} onChange={e => set("subject", e.target.value)} className={selClass}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Teacher */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Teacher</label>
            <div className="relative">
              <select value={form.teacherId} onChange={e => set("teacherId", e.target.value)} className={selClass}>
                {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all hover:scale-[1.02]">
            <Save size={14} />{isEdit ? "Update Period" : "Add Period"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// TIMETABLE PAGE
// ─────────────────────────────────────────────

export default function TimetablePage() {
  const [timetable,  setTimetable]  = useState(INITIAL_TIMETABLE);
  const [activeClass,setActiveClass]= useState("10-A");
  const [viewMode,   setViewMode]   = useState("grid");   // "grid" | "list"
  const [modal,      setModal]      = useState(null);     // null | { mode:"add"|"edit", entry? }
  const [toast,      setToast]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [deleteConf, setDeleteConf] = useState(null);    // id to delete

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Entries for the current class
  const classEntries = useMemo(() =>
    timetable.filter(e => e.class === activeClass), [timetable, activeClass]);

  // List view — filtered by search
  const listEntries = useMemo(() => {
    const q = search.toLowerCase();
    return classEntries.filter(e =>
      e.subject.toLowerCase().includes(q) ||
      e.day.toLowerCase().includes(q) ||
      (TEACHERS.find(t => t.id === e.teacherId)?.name.toLowerCase().includes(q) ?? false)
    ).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period));
  }, [classEntries, search]);

  // Grid lookup: day → period → entry
  const grid = useMemo(() => {
    const map = {};
    classEntries.forEach(e => {
      if (!map[e.day]) map[e.day] = {};
      map[e.day][e.period] = e;
    });
    return map;
  }, [classEntries]);

  // Stats
  const totalPeriods  = classEntries.length;
  const uniqueSubjects= [...new Set(classEntries.map(e => e.subject))].length;
  const uniqueTeachers= [...new Set(classEntries.map(e => e.teacherId))].length;
  const freePeriods   = DAYS.length * PERIODS.length - totalPeriods;

  function handleSave(entry) {
    setTimetable(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx > -1) { const u = [...prev]; u[idx] = entry; return u; }
      return [...prev, entry];
    });
    setModal(null);
    showToast(entry.id.startsWith("PER-0") ? "Period added successfully" : "Period updated", "success");
  }

  function handleDelete(id) {
    setTimetable(prev => prev.filter(e => e.id !== id));
    setDeleteConf(null);
    showToast("Period deleted", "info");
  }

  function handleExport() {
    const rows = [
      ["Class", "Day", "Period", "Subject", "Teacher"],
      ...classEntries
        .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period))
        .map(e => [e.class, e.day, e.period, e.subject, TEACHERS.find(t => t.id === e.teacherId)?.name ?? ""]),
    ];
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = `timetable-${activeClass}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast("Timetable exported as CSV", "info");
  }

  const todayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search subject, teacher…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">AP</div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Page heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Timetable</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage weekly class schedules and periods</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white
                           text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <Download size={15} /> Export
              </button>
              <button onClick={() => setModal({ mode: "add" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700
                           text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.99]">
                <Plus size={15} /> Add Period
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Periods"   value={totalPeriods}   icon={CalendarDays} accent="text-blue-600"   bg="bg-blue-50"   sub={`${activeClass} this week`}    />
            <SummaryCard label="Subjects"        value={uniqueSubjects} icon={BookOpen}     accent="text-violet-600" bg="bg-violet-50" sub="Unique subjects scheduled"      />
            <SummaryCard label="Teachers"        value={uniqueTeachers} icon={UserCog}      accent="text-emerald-600"bg="bg-emerald-50"sub="Assigned this week"              />
            <SummaryCard label="Free Slots"      value={freePeriods}    icon={Clock}        accent="text-amber-600"  bg="bg-amber-50"  sub="Available for scheduling"       />
          </div>

          {/* Controls: class tabs + view toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Class tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {CLASSES.map(cls => (
                <button key={cls} onClick={() => setActiveClass(cls)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeClass === cls
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {cls}
                </button>
              ))}
            </div>

            {/* View toggle + today highlight badge */}
            <div className="flex items-center gap-3">
              {DAYS.includes(todayName) && (
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
                  Today: {todayName}
                </span>
              )}
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                {[["grid","Grid"],["list","List"]].map(([mode, label]) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`px-3.5 py-2 text-xs font-semibold transition-all ${viewMode === mode ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── GRID VIEW ── */}
          {viewMode === "grid" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 w-28">Time</th>
                      {DAYS.map(day => (
                        <th key={day} className={`px-3 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider w-36 ${
                          day === todayName ? "text-blue-600 bg-blue-50/50" : "text-gray-400"
                        }`}>
                          {day === todayName ? `★ ${day}` : day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {PERIODS.map(period => (
                      <tr key={period} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-3 border-r border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">{period}</span>
                          </div>
                        </td>
                        {DAYS.map(day => (
                          <td key={day} className={`px-2 py-2 ${day === todayName ? "bg-blue-50/20" : ""}`}>
                            <div
                              onClick={() => {
                                const entry = grid[day]?.[period];
                                if (!entry) setModal({ mode: "add", entry: { ...EMPTY_FORM, class: activeClass, day, period } });
                              }}
                              className="cursor-pointer"
                            >
                              <PeriodCell
                                entry={grid[day]?.[period] ?? null}
                                onEdit={entry => setModal({ mode: "edit", entry })}
                                onDelete={id => setDeleteConf(id)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                <p className="text-xs text-gray-400">Click an empty cell to add a period · Hover a period to edit or delete</p>
                <div className="flex gap-3 ml-auto flex-wrap">
                  {Object.entries(SUBJECT_COLORS).slice(0, 5).map(([subj, col]) => (
                    <div key={subj} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <span className="text-xs text-gray-500">{subj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {viewMode === "list" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      {["Day", "Period", "Subject", "Teacher", "Actions"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {listEntries.map(entry => {
                      const col     = SUBJECT_COLORS[entry.subject] ?? DEFAULT_COLOR;
                      const teacher = TEACHERS.find(t => t.id === entry.teacherId);
                      const isToday = entry.day === todayName;
                      return (
                        <tr key={entry.id} className={`hover:bg-blue-50/30 transition-colors group ${isToday ? "bg-blue-50/20" : ""}`}>
                          <td className="px-5 py-3.5">
                            <span className={`text-sm font-semibold ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                              {isToday ? `★ ${entry.day}` : entry.day}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock size={12} className="text-gray-400" />{entry.period}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${col.bg} ${col.text} ${col.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />{entry.subject}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <UserCog size={11} className="text-blue-600" />
                              </div>
                              <span className="text-sm text-gray-700">{teacher?.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setModal({ mode: "edit", entry })}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button>
                              <button onClick={() => setDeleteConf(entry.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {listEntries.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <CalendarDays size={32} className="mb-3 opacity-40" />
                    <p className="text-sm font-medium">No periods scheduled for {activeClass}</p>
                    <button onClick={() => setModal({ mode: "add" })}
                      className="mt-3 text-xs text-blue-600 font-semibold hover:underline">+ Add first period</button>
                  </div>
                )}
              </div>
              {listEntries.length > 0 && (
                <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-600">{listEntries.length}</span> periods scheduled for {activeClass}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <PeriodModal
          initial={modal.entry ?? (modal.mode === "add" ? { ...EMPTY_FORM, class: activeClass } : undefined)}
          onClose={() => setModal(null)}
          onSave={handleSave}
          existingEntries={timetable}
        />
      )}

      {/* ── Delete Confirmation ── */}
      {deleteConf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Delete Period?</h3>
              <p className="text-sm text-gray-500 mt-1">This will remove the period from the timetable. This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConf(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConf)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-200 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}