"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, Download, Plus, Users, BookOpen, UserCog,
  Clock, ChevronDown, Eye, Pencil, Trash2,
  MoreHorizontal, GraduationCap, TrendingUp,
  Bell, X, Loader2, AlertCircle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// ── Auth ──────────────────────────────────────────────────────────────────────
const getToken = () => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Colour helpers ────────────────────────────────────────────────────────────
const PALETTE = ["blue","violet","emerald","amber","rose","slate","sky","pink"];
const AVATAR_COLORS = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700"    },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700"  },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700"   },
  rose:    { bg: "bg-rose-100",    text: "text-rose-700"    },
  slate:   { bg: "bg-slate-100",   text: "text-slate-600"   },
  sky:     { bg: "bg-sky-100",     text: "text-sky-700"     },
  pink:    { bg: "bg-pink-100",    text: "text-pink-700"    },
};
const colorForId = id => PALETTE[id % PALETTE.length];

// ── Small UI pieces ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active:   "bg-green-50 text-green-700 ring-green-200",
    Full:     "bg-blue-50 text-blue-700 ring-blue-200",
    Inactive: "bg-gray-100 text-gray-500 ring-gray-200",
  };
  const dot = { Active:"bg-green-500", Full:"bg-blue-500", Inactive:"bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${map[status] || map.Inactive}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || dot.Inactive}`} />
      {status}
    </span>
  );
}

function AttendanceBar({ value }) {
  const color = value >= 90 ? "bg-green-500" : value >= 80 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8">{value}%</span>
    </div>
  );
}

function CapacityBar({ students, capacity }) {
  const pct = capacity ? Math.round((students / capacity) * 100) : 0;
  const color = pct >= 100 ? "bg-red-400" : pct >= 85 ? "bg-amber-400" : "bg-blue-400";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-gray-800">
        {students}<span className="text-gray-400 font-normal">/{capacity}</span>
      </span>
      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct,100)}%` }} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, accent, bg, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={16} className={accent} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{trend}</p>
    </div>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  class_name:"", section:"", grade:"", subject:"",
  teacher_id:"", room:"", schedule:"", capacity:"40", status:"Active",
};

function ClassModal({ open, onClose, onSaved, editData, teachers }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        class_name: editData.rawClassName  || "",
        section:    editData.rawSection    || "",
        grade:      editData.grade         || "",
        subject:    editData.subject       || "",
        teacher_id: editData.teacherId     || "",
        room:       editData.room          || "",
        schedule:   editData.schedule      || "",
        capacity:   String(editData.capacity || 40),
        status:     editData.status        || "Active",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErr("");
  }, [editData, open]);

  if (!open) return null;

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.class_name || !form.section) return setErr("Class name and section are required.");
    setSaving(true); setErr("");
    try {
      const url    = editData ? `/api/admin/classes/${editData.dbId}` : "/api/admin/classes";
      const method = editData ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ ...form, capacity: parseInt(form.capacity) || 40 }),
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.message || "Failed to save.");
      onSaved();
      onClose();
    } catch {
      setErr("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{editData ? "Edit Class" : "Add New Class"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {/* Class Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Class Name *</label>
            <input name="class_name" value={form.class_name} onChange={change} placeholder="e.g. 10"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
          </div>
          {/* Section */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Section *</label>
            <input name="section" value={form.section} onChange={change} placeholder="e.g. A"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
          </div>
          {/* Grade */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Grade</label>
            <input name="grade" value={form.grade} onChange={change} placeholder="e.g. Grade 10"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
          </div>
          {/* Subject */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Subject</label>
            <input name="subject" value={form.subject} onChange={change} placeholder="e.g. Physics"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
          </div>
          {/* Teacher */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs font-semibold text-gray-500">Class Teacher</label>
            <select name="teacher_id" value={form.teacher_id} onChange={change}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 bg-white">
              <option value="">— Unassigned —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          {/* Room */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Room</label>
            <input name="room" value={form.room} onChange={change} placeholder="e.g. Room 201"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
          </div>
          {/* Capacity */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">Capacity</label>
            <input name="capacity" type="number" value={form.capacity} onChange={change} min={1}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
          </div>
          {/* Schedule */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs font-semibold text-gray-500">Schedule</label>
            <input name="schedule" value={form.schedule} onChange={change} placeholder="e.g. Mon–Fri, 8:00 AM"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
          </div>
          {/* Status */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs font-semibold text-gray-500">Status</label>
            <select name="status" value={form.status} onChange={change}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 bg-white">
              <option>Active</option>
              <option>Full</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {err && (
          <div className="mx-6 mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm">
            <AlertCircle size={15} /> {err}
          </div>
        )}

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editData ? "Save Changes" : "Add Class"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, className, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Class</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-800">{className}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClassUI() {
  const [classes,    setClasses]    = useState([]);
  const [meta,       setMeta]       = useState({ teachers: [], grades: [] });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [grade,      setGrade]      = useState("All Grades");
  const [status,     setStatus]     = useState("All Status");
  const [openMenu,   setOpenMenu]   = useState(null);
  const [modal,      setModal]      = useState(false);
  const [editData,   setEditData]   = useState(null);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [clsRes, metaRes] = await Promise.all([
        fetch("/api/admin/classes",      { headers: authHeaders() }),
        fetch("/api/admin/classes/meta", { headers: authHeaders() }),
      ]);
      const [clsData, metaData] = await Promise.all([clsRes.json(), metaRes.json()]);

      if (!clsRes.ok)  throw new Error(clsData.message  || "Failed to load classes");
      if (!metaRes.ok) throw new Error(metaData.message || "Failed to load meta");

      setClasses(clsData);
      setMeta(metaData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteInfo) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/classes/${deleteInfo.dbId}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteInfo(null);
      fetchAll();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalStudents = classes.reduce((s, c) => s + c.students, 0);
  const activeCount   = classes.filter(c => c.status === "Active").length;
  const fullCount     = classes.filter(c => c.status === "Full").length;
  const avgAttendance = classes.length
    ? Math.round(classes.reduce((s, c) => s + c.attendance, 0) / classes.length)
    : 0;

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return classes.filter(c => {
      const matchQ  = !q || c.name.toLowerCase().includes(q) ||
        c.classTeacher.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      const matchG  = grade  === "All Grades"  || c.grade  === grade;
      const matchS  = status === "All Status"  || c.status === status;
      return matchQ && matchG && matchS;
    });
  }, [classes, search, grade, status]);

  const gradeOptions  = ["All Grades",  ...meta.grades];
  const statusOptions = ["All Status", "Active", "Full", "Inactive"];

  const SUMMARY = [
    { label:"Total Classes",  value: loading?"—":classes.length, icon:BookOpen,      accent:"text-blue-600",    bg:"bg-blue-50",    trend:"Live from database"       },
    { label:"Active Classes", value: loading?"—":activeCount,    icon:GraduationCap, accent:"text-emerald-600", bg:"bg-emerald-50", trend:`${fullCount} at capacity` },
    { label:"Total Students", value: loading?"—":totalStudents,  icon:Users,         accent:"text-violet-600",  bg:"bg-violet-50",  trend:"Across all classes"       },
    { label:"Avg Attendance", value: loading?"—":`${avgAttendance}%`, icon:TrendingUp, accent:"text-amber-600", bg:"bg-amber-50",   trend:"This semester"            },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search classes, teachers…"
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

        <div className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Classes</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage all class records and assignments</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                <Download size={15} /> Export
              </button>
              <button onClick={() => { setEditData(null); setModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all">
                <Plus size={15} /> Add Class
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SUMMARY.map(s => <SummaryCard key={s.label} {...s} />)}
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Search name, teacher, ID..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <select value={grade} onChange={e => setGrade(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all">
                  {gradeOptions.map(g => <option key={g}>{g}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all">
                  {statusOptions.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <p className="text-sm text-gray-400 self-center whitespace-nowrap">{filtered.length} classes found</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" />
              <span className="text-sm">Loading classes…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-12 text-center">
              <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
              <p className="font-medium text-red-500">{error}</p>
              <button onClick={fetchAll} className="mt-3 text-sm text-blue-600 hover:underline">Retry</button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      {["Class","ID","Class Teacher","Students","Room","Schedule","Attendance","Status","Actions"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={9} className="py-16 text-center text-gray-400 text-sm">No classes found</td></tr>
                    ) : filtered.map(cls => {
                      const av = AVATAR_COLORS[colorForId(cls.dbId)];
                      return (
                        <tr key={cls.dbId} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${av.bg} ${av.text}`}>
                                {cls.name}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{cls.name}</p>
                                <p className="text-xs text-gray-400">{cls.grade}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{cls.id}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <UserCog size={13} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{cls.classTeacher}</p>
                                <p className="text-xs text-gray-400">{cls.subject}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4"><CapacityBar students={cls.students} capacity={cls.capacity} /></td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">{cls.room}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock size={12} className="text-gray-400 flex-shrink-0" />{cls.schedule}
                            </div>
                          </td>
                          <td className="px-5 py-4 w-36"><AttendanceBar value={cls.attendance} /></td>
                          <td className="px-5 py-4"><StatusBadge status={cls.status} /></td>
                          <td className="px-5 py-4">
                            <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View"><Eye size={14} /></button>
                              <button onClick={() => { setEditData(cls); setModal(true); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit"><Pencil size={14} /></button>
                              <button onClick={() => setDeleteInfo(cls)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={14} /></button>
                              <button onClick={() => setOpenMenu(p => p === cls.dbId ? null : cls.dbId)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><MoreHorizontal size={14} /></button>
                              {openMenu === cls.dbId && (
                                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-gray-200 shadow-xl py-1.5 min-w-[150px]">
                                  {["Assign Students","View Timetable","Export Report"].map(a => (
                                    <button key={a} onClick={() => setOpenMenu(null)}
                                      className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">{a}</button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filtered.length > 0 && (
                <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
                    <span className="font-semibold text-gray-600">{classes.length}</span> classes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ClassModal
        open={modal}
        onClose={() => { setModal(false); setEditData(null); }}
        onSaved={fetchAll}
        editData={editData}
        teachers={meta.teachers}
      />
      <DeleteModal
        open={!!deleteInfo}
        onClose={() => setDeleteInfo(null)}
        onConfirm={handleDelete}
        className={deleteInfo?.name}
        deleting={deleting}
      />
    </div>
  );
}