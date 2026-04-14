"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Search, Download, CalendarCheck, Users, ChevronDown,
  Bell, CheckCircle, XCircle, Clock, AlertCircle,
  TrendingUp, TrendingDown, Save, ChevronLeft, ChevronRight, Pencil, X,
} from "lucide-react";


// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const INITIAL_STUDENTS = [
  { id: "STU-001", name: "Aarav Sharma",   avatar: "AS", color: "blue",    class: "10-A", subject: "Physics"     },
  { id: "STU-002", name: "Priya Mehta",    avatar: "PM", color: "violet",  class: "10-B", subject: "Mathematics" },
  { id: "STU-003", name: "Rohan Verma",    avatar: "RV", color: "emerald", class: "11-A", subject: "Chemistry"   },
  { id: "STU-004", name: "Sneha Gupta",    avatar: "SG", color: "amber",   class: "11-B", subject: "Biology"     },
  { id: "STU-005", name: "Kiran Patel",    avatar: "KP", color: "rose",    class: "12-A", subject: "English"     },
  { id: "STU-006", name: "Arjun Singh",    avatar: "AJ", color: "slate",   class: "12-B", subject: "History"     },
  { id: "STU-007", name: "Divya Nair",     avatar: "DN", color: "teal",    class: "10-A", subject: "Physics"     },
  { id: "STU-008", name: "Rahul Das",      avatar: "RD", color: "orange",  class: "10-B", subject: "Mathematics" },
  { id: "STU-009", name: "Meera Joshi",    avatar: "MJ", color: "blue",    class: "11-A", subject: "Chemistry"   },
  { id: "STU-010", name: "Vikram Rao",     avatar: "VR", color: "violet",  class: "11-B", subject: "Biology"     },
  { id: "STU-011", name: "Ananya Singh",   avatar: "AN", color: "emerald", class: "12-A", subject: "English"     },
  { id: "STU-012", name: "Dev Patel",      avatar: "DP", color: "amber",   class: "12-B", subject: "History"     },
];

const today = new Date().toISOString().split("T")[0];

const INITIAL_RECORDS = [
  { id: "ATT-001", studentId: "STU-001", date: today, status: "Present", checkIn: "8:02 AM" },
  { id: "ATT-002", studentId: "STU-002", date: today, status: "Absent",  checkIn: "—"       },
  { id: "ATT-003", studentId: "STU-003", date: today, status: "Present", checkIn: "7:58 AM" },
  { id: "ATT-004", studentId: "STU-004", date: today, status: "Late",    checkIn: "9:15 AM" },
  { id: "ATT-005", studentId: "STU-005", date: today, status: "Present", checkIn: "8:00 AM" },
  { id: "ATT-006", studentId: "STU-006", date: today, status: "Absent",  checkIn: "—"       },
  { id: "ATT-007", studentId: "STU-007", date: today, status: "Present", checkIn: "8:05 AM" },
  { id: "ATT-008", studentId: "STU-008", date: today, status: "Late",    checkIn: "8:45 AM" },
];

const CLASS_FILTERS  = ["All Classes", "10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];
const STATUS_FILTERS = ["All Status", "Present", "Absent", "Late"];
const ROWS_PER_PAGE  = 8;

const AVATAR_COLORS = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700"    },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700"  },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700"   },
  rose:    { bg: "bg-rose-100",    text: "text-rose-700"    },
  slate:   { bg: "bg-slate-100",   text: "text-slate-600"   },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700"    },
  orange:  { bg: "bg-orange-100",  text: "text-orange-700"  },
};


// ─────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    Present: "bg-green-50 text-green-700 ring-green-200",
    Absent:  "bg-red-50   text-red-700   ring-red-200",
    Late:    "bg-amber-50 text-amber-700 ring-amber-200",
  };
  const Icon      = status === "Present" ? CheckCircle : status === "Absent" ? XCircle : Clock;
  const iconColor = status === "Present" ? "text-green-500" : status === "Absent" ? "text-red-500" : "text-amber-500";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${styles[status]}`}>
      <Icon size={11} className={iconColor} />
      {status}
    </span>
  );
}

function SummaryCard({ label, value, icon: Icon, accent, bg, trend, trendDir }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={16} className={accent} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs flex items-center gap-1 ${trendDir === "down" ? "text-red-500" : trendDir === "up" ? "text-green-600" : "text-gray-400"}`}>
        {trendDir === "up"   && <TrendingUp   size={11} />}
        {trendDir === "down" && <TrendingDown size={11} />}
        {trend}
      </p>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  const styles = { success: "bg-green-600", error: "bg-red-600", info: "bg-blue-600" };
  const Icon   = type === "success" ? CheckCircle : type === "error" ? XCircle : AlertCircle;
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl animate-in slide-in-from-bottom-4 ${styles[type]}`}>
      <Icon size={16} />
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </div>
  );
}


// ─────────────────────────────────────────────
// MARK ATTENDANCE MODAL
// ─────────────────────────────────────────────

function MarkAttendanceModal({ onClose, onSave, existingRecords, selectedDate }) {
  const [modalDate,   setModalDate]   = useState(selectedDate || today);
  const [filterClass, setFilterClass] = useState("All Classes");
  const [saving,      setSaving]      = useState(false);

  const nowTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const [draft, setDraft] = useState(() => {
    const map = {};
    INITIAL_STUDENTS.forEach(s => {
      const existing = existingRecords.find(r => r.studentId === s.id && r.date === (selectedDate || today));
      map[s.id] = existing
        ? { status: existing.status, checkIn: existing.checkIn }
        : { status: "Present", checkIn: nowTime };
    });
    return map;
  });

  const visibleStudents = filterClass === "All Classes"
    ? INITIAL_STUDENTS
    : INITIAL_STUDENTS.filter(s => s.class === filterClass);

  const counts = {
    Present: Object.values(draft).filter(d => d.status === "Present").length,
    Absent:  Object.values(draft).filter(d => d.status === "Absent").length,
    Late:    Object.values(draft).filter(d => d.status === "Late").length,
  };

  function setStatus(studentId, status) {
    setDraft(prev => ({
      ...prev,
      [studentId]: {
        status,
        checkIn: status === "Absent" ? "—" : prev[studentId]?.checkIn || nowTime,
      },
    }));
  }

  function markAll(status) {
    setDraft(prev => {
      const updated = { ...prev };
      visibleStudents.forEach(s => {
        updated[s.id] = { status, checkIn: status === "Absent" ? "—" : nowTime };
      });
      return updated;
    });
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    onSave(draft, modalDate);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-xs text-gray-400 mt-0.5">Set attendance status for each student</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500">Date</label>
            <input
              type="date" value={modalDate} onChange={e => setModalDate(e.target.value)}
              className="pl-3 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            />
          </div>
          <div className="relative">
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-gray-200 bg-white
                         text-sm text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all">
              {CLASS_FILTERS.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => markAll("Present")} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors">✓ All Present</button>
            <button onClick={() => markAll("Absent")}  className="px-3 py-1.5 rounded-lg bg-red-50   text-red-700   text-xs font-semibold hover:bg-red-100   transition-colors">✗ All Absent</button>
            <button onClick={() => markAll("Late")}    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">⏰ All Late</button>
          </div>
        </div>

        {/* Count pills */}
        <div className="px-6 py-2.5 flex gap-3 border-b border-gray-100">
          {[
            { label: "Present", count: counts.Present, color: "bg-green-100 text-green-700" },
            { label: "Absent",  count: counts.Absent,  color: "bg-red-100   text-red-700"   },
            { label: "Late",    count: counts.Late,    color: "bg-amber-100 text-amber-700"  },
          ].map(({ label, count, color }) => (
            <span key={label} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
              {label}: {count}
            </span>
          ))}
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {visibleStudents.map(student => {
            const av = AVATAR_COLORS[student.color] ?? AVATAR_COLORS.slate;
            const d  = draft[student.id] ?? { status: "Present", checkIn: nowTime };
            return (
              <div key={student.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/70 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${av.bg} ${av.text}`}>
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.id} · {student.class} · {student.subject}</p>
                </div>

                {/* Late time input */}
                {d.status === "Late" && (
                  <input
                    type="time"
                    defaultValue="09:00"
                    onChange={e => {
                      const [h, m] = e.target.value.split(":");
                      const hour = parseInt(h);
                      const ampm = hour >= 12 ? "PM" : "AM";
                      const h12  = hour % 12 || 12;
                      setDraft(prev => ({ ...prev, [student.id]: { ...prev[student.id], checkIn: `${h12}:${m} ${ampm}` } }));
                    }}
                    className="text-xs border border-amber-200 bg-amber-50 rounded-lg px-2 py-1.5 text-amber-700
                               focus:outline-none focus:ring-2 focus:ring-amber-300 w-28"
                  />
                )}

                {/* Status buttons */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {[
                    { label: "Present", active: "bg-green-500 text-white shadow-sm", inactive: "bg-green-50 text-green-700" },
                    { label: "Late",    active: "bg-amber-500 text-white shadow-sm", inactive: "bg-amber-50 text-amber-700" },
                    { label: "Absent",  active: "bg-red-500   text-white shadow-sm", inactive: "bg-red-50   text-red-700"   },
                  ].map(({ label, active, inactive }) => (
                    <button
                      key={label}
                      onClick={() => setStatus(student.id, label)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${d.status === label ? active : `${inactive} opacity-50 hover:opacity-80`}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-400">{visibleStudents.length} students · {modalDate}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button
              onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                         shadow-md shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {saving ? "Saving…" : "Save Attendance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// EDIT RECORD MODAL
// ─────────────────────────────────────────────

function EditRecordModal({ record, student, onClose, onUpdate }) {
  const [editStatus,  setEditStatus]  = useState(record.status);
  const [editCheckIn, setEditCheckIn] = useState(record.checkIn);
  const av = AVATAR_COLORS[student?.color] ?? AVATAR_COLORS.slate;

  function handleSave() {
    onUpdate(record.id, editStatus, editStatus === "Absent" ? "—" : editCheckIn);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Record</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Student info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${av.bg} ${av.text}`}>
              {student?.avatar}
            </div>
            <div>
              <p className="font-bold text-gray-900">{student?.name}</p>
              <p className="text-sm text-gray-500">{student?.id} · {student?.class} · {student?.subject}</p>
            </div>
          </div>

          {/* Date (read-only) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Date</label>
            <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-200">{record.date}</p>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Status</label>
            <div className="flex gap-2">
              {[
                { s: "Present", active: "bg-green-500 text-white shadow-sm" },
                { s: "Late",    active: "bg-amber-500 text-white shadow-sm" },
                { s: "Absent",  active: "bg-red-500   text-white shadow-sm" },
              ].map(({ s, active }) => (
                <button key={s} onClick={() => setEditStatus(s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${editStatus === s ? active : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Check-in */}
          {editStatus !== "Absent" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Check-in Time</label>
              <input
                type="text" value={editCheckIn} onChange={e => setEditCheckIn(e.target.value)}
                placeholder="e.g. 8:05 AM"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
                           focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// ATTENDANCE UI — PAGE ENTRY POINT
// ─────────────────────────────────────────────

export default function AttendanceUI() {
  const [records,      setRecords]      = useState(INITIAL_RECORDS);
  const [search,       setSearch]       = useState("");
  const [filterCls,    setFilterCls]    = useState("All Classes");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterDate,   setFilterDate]   = useState(today);
  const [page,         setPage]         = useState(1);
  const [showModal,    setShowModal]    = useState(false);
  const [editRecord,   setEditRecord]   = useState(null);
  const [toast,        setToast]        = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Enrich records with student info
  const enriched = useMemo(() => records.map(r => ({
    ...r, student: INITIAL_STUDENTS.find(s => s.id === r.studentId),
  })), [records]);

  // Filter
  const filtered = useMemo(() => enriched.filter(r => {
    const q = search.toLowerCase();
    const matchSearch  = r.student?.name.toLowerCase().includes(q) ||
      r.studentId.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const matchClass   = filterCls    === "All Classes" || r.student?.class === filterCls;
    const matchStatus  = filterStatus === "All Status"  || r.status === filterStatus;
    const matchDate    = !filterDate  || r.date === filterDate;
    return matchSearch && matchClass && matchStatus && matchDate;
  }), [enriched, search, filterCls, filterStatus, filterDate]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  function goPage(p) { setPage(Math.min(Math.max(1, p), totalPages)); }

  // Stats (always from today's records)
  const todayRecs = records.filter(r => r.date === today);
  const present   = todayRecs.filter(r => r.status === "Present").length;
  const absent    = todayRecs.filter(r => r.status === "Absent").length;
  const late      = todayRecs.filter(r => r.status === "Late").length;
  const rate      = todayRecs.length ? Math.round((present / todayRecs.length) * 100) : 0;

  // Save from Mark Attendance modal
  function handleSaveAttendance(draft, date) {
    setRecords(prev => {
      const updated = [...prev];
      let nextId = updated.length + 1;
      Object.entries(draft).forEach(([studentId, { status, checkIn }]) => {
        const idx = updated.findIndex(r => r.studentId === studentId && r.date === date);
        if (idx > -1) {
          updated[idx] = { ...updated[idx], status, checkIn };
        } else {
          updated.push({ id: `ATT-${String(nextId++).padStart(3, "0")}`, studentId, date, status, checkIn });
        }
      });
      return updated;
    });
    setShowModal(false);
    showToast(`Attendance saved for ${date}`, "success");
  }

  // Update single record
  function handleUpdateRecord(recordId, status, checkIn) {
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status, checkIn } : r));
    showToast("Record updated successfully", "success");
  }

  // Export CSV
  function handleExport() {
    const rows = [
      ["Record ID", "Student ID", "Student Name", "Class", "Subject", "Date", "Status", "Check-in"],
      ...filtered.map(r => [r.id, r.studentId, r.student?.name, r.student?.class, r.student?.subject, r.date, r.status, r.checkIn]),
    ];
    const csv  = rows.map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `attendance-${filterDate || "all"}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as CSV", "info");
  }

  const SUMMARY_CARDS = [
    { label: "Total Students", value: INITIAL_STUDENTS.length, icon: Users,         accent: "text-blue-600",    bg: "bg-blue-50",    trend: "Enrolled students",        trendDir: undefined },
    { label: "Present Today",  value: present,                  icon: CheckCircle,   accent: "text-green-600",   bg: "bg-green-50",   trend: `${rate}% attendance rate`, trendDir: "up"      },
    { label: "Absent Today",   value: absent,                   icon: XCircle,       accent: "text-red-600",     bg: "bg-red-50",     trend: absent > 2 ? "Needs attention" : "Within limit", trendDir: absent > 2 ? "down" : undefined },
    { label: "Late Arrivals",  value: late,                     icon: AlertCircle,   accent: "text-amber-600",   bg: "bg-amber-50",   trend: "Marked late today",        trendDir: undefined },
  ];

  const HEADERS = ["Student", "Record ID", "Class", "Subject", "Date", "Check-in", "Status", "Actions"];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text" value={search} placeholder="Search students, records…"
              onChange={e => { setSearch(e.target.value); goPage(1); }}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
            />
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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance</h1>
              <p className="text-sm text-gray-500 mt-0.5">Track and manage daily student attendance</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white
                           text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <Download size={15} /> Export
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700
                           text-white text-sm font-semibold shadow-md shadow-blue-200
                           transition-all hover:scale-[1.02] active:scale-[0.99]">
                <CalendarCheck size={15} /> Mark Attendance
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SUMMARY_CARDS.map(c => <SummaryCard key={c.label} {...c} />)}
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                          flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" value={search} placeholder="Search student name, ID..."
                onChange={e => { setSearch(e.target.value); goPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                           text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all" />
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); goPage(1); }}
                className="pl-3 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700
                           focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all" />
              <div className="relative">
                <select value={filterCls} onChange={e => { setFilterCls(e.target.value); goPage(1); }}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white
                             text-sm text-gray-700 font-medium cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all">
                  {CLASS_FILTERS.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); goPage(1); }}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white
                             text-sm text-gray-700 font-medium cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all">
                  {STATUS_FILTERS.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <p className="text-sm text-gray-400 self-center whitespace-nowrap">{filtered.length} records</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {HEADERS.map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(r => {
                    const av = AVATAR_COLORS[r.student?.color] ?? AVATAR_COLORS.slate;
                    return (
                      <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${av.bg} ${av.text}`}>
                              {r.student?.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{r.student?.name}</p>
                              <p className="text-xs text-gray-400">{r.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{r.id}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">{r.student?.class}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{r.student?.subject}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{r.date}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock size={12} className="text-gray-400 flex-shrink-0" />
                            {r.checkIn}
                          </div>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setEditRecord({ record: r, student: r.student })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg
                                       text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit record"
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {paginated.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <CalendarCheck size={32} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">No attendance records found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or mark attendance</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span>{" "}
                  of <span className="font-semibold text-gray-600">{filtered.length}</span> records
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => goPage(page - 1)} disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => goPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${p === page ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-gray-500 hover:bg-gray-100"}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => goPage(page + 1)} disabled={page === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <MarkAttendanceModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveAttendance}
          existingRecords={records}
          selectedDate={filterDate}
        />
      )}
      {editRecord && (
        <EditRecordModal
          record={editRecord.record}
          student={editRecord.student}
          onClose={() => setEditRecord(null)}
          onUpdate={handleUpdateRecord}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}