"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Search, CheckCircle, Clock, AlertCircle, Loader2,
  Bus, ChevronDown, ChevronUp, Save, IndianRupee, Users,
  BookOpen, Wrench, GraduationCap,
} from "lucide-react";

const getToken = () => {
  if (typeof window === "undefined") return null;
  const m = document.cookie.match(/(^| )token=([^;]+)/);
  return m ? m[2] : null;
};
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const apiFetch = (path, opts = {}) =>
   fetch(`${API_BASE}/api${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(opts.body && !(opts.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...opts,
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-500","bg-violet-500","bg-rose-500","bg-amber-500",
  "bg-emerald-500","bg-cyan-500","bg-pink-500","bg-indigo-500",
];
function getInitials(name = "") {
  const p = name.trim().split(" ").filter(Boolean);
  if (!p.length) return "?";
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length-1][0]).toUpperCase();
}
function avatarColor(name = "") {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

const STATUS_MAP = {
  Paid:    { bg:"bg-emerald-50", text:"text-emerald-700", ring:"ring-emerald-200", dot:"bg-emerald-500", icon: CheckCircle },
  Pending: { bg:"bg-amber-50",   text:"text-amber-700",   ring:"ring-amber-200",   dot:"bg-amber-500",   icon: Clock       },
  Partial: { bg:"bg-blue-50",    text:"text-blue-700",    ring:"ring-blue-200",    dot:"bg-blue-500",    icon: Clock       },
  Overdue: { bg:"bg-red-50",     text:"text-red-700",     ring:"ring-red-200",     dot:"bg-red-500",     icon: AlertCircle },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || "Pending"}
    </span>
  );
}

function Toast({ msg, type, onDismiss }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [msg, onDismiss]);
  if (!msg) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium flex items-center gap-2 ${
      type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
    }`}>
      {type === "error" ? "❌" : "✅"} {msg}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── Class Fee Form ───────────────────────────────────────────────────────────
function ClassFeeForm({ cls, onSaved }) {
  const [form, setForm] = useState({
    tuition_fee: "",
    library_fee: "",
    other_fee: "",
    due_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  const handleSave = async () => {
    if (!form.tuition_fee) return setMsg("Tuition fee required.");
    setSaving(true); setMsg("");
    try {
      await apiFetch("/fees/structures", {
        method: "POST",
        body: JSON.stringify({
          class: cls.class || cls.grade || cls.class_name,
          section: cls.section || undefined,
          academic_year: "2024-25",
          tuition_fee:  Number(form.tuition_fee  || 0),
          library_fee:  Number(form.library_fee  || 0),
          other_fee:    Number(form.other_fee    || 0),
          due_date:     form.due_date || undefined,
        }),
      });
      setMsg("✅ Class fees saved & applied to all students.");
      onSaved?.();
    } catch {
      setMsg("❌ Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const total = Number(form.tuition_fee||0) + Number(form.library_fee||0) + Number(form.other_fee||0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap size={16} className="text-emerald-600" />
        <h3 className="font-bold text-gray-900 text-sm">
          Set Base Fees — Class {cls.grade || cls.class_name}{cls.section ? `-${cls.section}` : ""}
        </h3>
      </div>
      <p className="text-xs text-gray-400">
        Ye fees sabhi students par apply hongi. Transport fee alag se har student ke liye set hogi.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { key:"tuition_fee",  label:"Tuition Fee",  icon: GraduationCap, required: true  },
          { key:"library_fee",  label:"Library Fee",  icon: BookOpen,      required: false },
          { key:"other_fee",    label:"Other Fee",    icon: Wrench,        required: false },
        ].map(({ key, label, icon: Icon, required }) => (
          <div key={key}>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
              <Icon size={11} /> {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number" min="0"
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Due Date
          </label>
          <input
            type="date"
            value={form.due_date}
            onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Base Total</p>
          <div className="flex items-center gap-1 text-lg font-bold text-emerald-600">
            <IndianRupee size={14} />
            {total.toLocaleString("en-IN")}
            <span className="text-xs text-gray-400 font-normal ml-1">/ student</span>
          </div>
        </div>
      </div>

      {msg && (
        <p className={`text-xs font-medium ${msg.startsWith("✅") ? "text-emerald-600" : "text-red-500"}`}>
          {msg}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? "Saving…" : "Save & Apply to All Students"}
      </button>
    </div>
  );
}

// ─── Per-Student Transport Row ────────────────────────────────────────────────
function StudentTransportRow({ student, onUpdate }) {
  const [transport, setTransport] = useState(String(student.transport_fee || ""));
  const [saving, setSaving]       = useState(false);
  const dirty = String(student.transport_fee || 0) !== transport;

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(student.id, Number(transport));
    setSaving(false);
  };

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${avatarColor(student.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {getInitials(student.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
            <p className="text-xs text-gray-400">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-500">{student.roll_no || student.roll_number || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <IndianRupee size={12} className="text-gray-400" />
          {Number(student.tuition_fee || 0).toLocaleString("en-IN")}
        </div>
      </td>
      <td className="px-4 py-3">
        {/* Editable transport fee */}
        <div className="flex items-center gap-2">
          <div className="relative w-28">
            <IndianRupee size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number" min="0"
              value={transport}
              onChange={e => setTransport(e.target.value)}
              placeholder="0"
              className={`w-full pl-6 pr-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${
                dirty ? "border-blue-300 bg-blue-50" : "border-gray-200"
              }`}
            />
          </div>
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
              Save
            </button>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
          <IndianRupee size={12} className="text-gray-500" />
          {(
            Number(student.tuition_fee || 0) +
            Number(student.library_fee  || 0) +
            Number(student.other_fee    || 0) +
            Number(transport || 0)
          ).toLocaleString("en-IN")}
        </div>
      </td>
      <td className="px-4 py-3"><StatusBadge status={student.status} /></td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminFeesPage() {
  const [classes,        setClasses]        = useState([]);
  const [activeClassIdx, setActiveClassIdx] = useState(0);
  const [students,       setStudents]       = useState([]); // student_fees rows for active class
  const [loading,        setLoading]        = useState(true);
  const [studentsLoading,setStudentsLoading]= useState(false);
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState("All");
  const [showFeeForm,    setShowFeeForm]     = useState(false);
  const [toast,          setToast]          = useState({ msg: "", type: "success" });

  // Load classes
  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/classes"); // or your admin classes endpoint
      setClasses(data || []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  // Load students' fee records when class changes
  const activeClass = classes[activeClassIdx] || null;

  const loadStudents = useCallback(async () => {
    if (!activeClass) return;
    setStudentsLoading(true);
    try {
      const cls = activeClass.class || activeClass.grade || activeClass.class_name;
      const section = activeClass.section || "";
      const params  = new URLSearchParams({ class: cls, academic_year: "2024-25" });
      if (section) params.append("section", section);
      params.append("limit", "200");
      const data = await apiFetch(`/fees/students?${params}`);
      setStudents(data.data || []);
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, [activeClass]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Per-student transport fee update
  const handleTransportUpdate = async (studentFeeId, transportFee) => {
    try {
      await apiFetch(`/fees/students/${studentFeeId}`, {
        method: "PATCH",
        body: JSON.stringify({ transport_fee: transportFee }),
      });
      setStudents(prev =>
        prev.map(s =>
          s.id === studentFeeId
            ? {
                ...s,
                transport_fee: transportFee,
                total_fees: Number(s.tuition_fee||0) + Number(s.library_fee||0) + Number(s.other_fee||0) + transportFee,
              }
            : s
        )
      );
      setToast({ msg: "Transport fee updated!", type: "success" });
    } catch {
      setToast({ msg: "Failed to update transport fee.", type: "error" });
    }
  };

  // Stats
  const stats = useMemo(() => {
    const paid    = students.filter(s => s.status === "Paid").length;
    const pending = students.filter(s => s.status === "Pending" || !s.status).length;
    const overdue = students.filter(s => s.status === "Overdue").length;
    const partial = students.filter(s => s.status === "Partial").length;
    const totalCollected = students.reduce((a, s) => a + Number(s.paid_amount || 0), 0);
    const totalDue       = students.reduce((a, s) => a + Number(s.total_fees  || 0), 0);
    return { paid, pending, overdue, partial, totalCollected, totalDue };
  }, [students]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = students;
    if (filterStatus !== "All") list = list.filter(s => (s.status || "Pending") === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) || s.roll_no?.toString().includes(q)
      );
    }
    return list;
  }, [students, filterStatus, search]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 shadow-sm">
          <div className="pl-10 lg:pl-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fees Management</h1>
              {/* <p className="text-sm text-gray-400">
                Class-wise fees set karein · Individual transport fee assign karein
              </p> */}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-60">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students…"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* Class Switcher */}
          {loading ? (
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse w-64" />
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {classes.map((cls, i) => (
                <button
                  key={cls.id || i}
                  onClick={() => {
                    setActiveClassIdx(i);
                    setSearch("");
                    setFilterStatus("All");
                    setShowFeeForm(false);
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    i === activeClassIdx
                      ? "bg-emerald-500 text-white border-transparent shadow-md"
                      : "bg-white text-gray-500 border-gray-100 hover:border-emerald-200"
                  }`}
                >
                  Class {cls.grade || cls.class_name}{cls.section ? `-${cls.section}` : ""}
                </button>
              ))}
            </div>
          )}

          {activeClass && (
            <>
              {/* Set Base Fees Button */}
              <div>
                <button
                  onClick={() => setShowFeeForm(v => !v)}
                  className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl transition-all"
                >
                  <IndianRupee size={14} />
                  {showFeeForm ? "Hide" : "Set / Update"} Base Fees for this Class
                  {showFeeForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showFeeForm && (
                  <div className="mt-3">
                    <ClassFeeForm
                      cls={activeClass}
                      onSaved={() => { setShowFeeForm(false); loadStudents(); }}
                    />
                  </div>
                )}
              </div>

              {/* Stats */}
              {!studentsLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Paid",    count: stats.paid,    color:"text-emerald-600", bg:"bg-emerald-50", icon: CheckCircle },
                    { label:"Partial", count: stats.partial, color:"text-blue-600",    bg:"bg-blue-50",    icon: Clock       },
                    { label:"Pending", count: stats.pending, color:"text-amber-600",   bg:"bg-amber-50",   icon: Clock       },
                    { label:"Overdue", count: stats.overdue, color:"text-red-600",     bg:"bg-red-50",     icon: AlertCircle },
                  ].map(({ label, count, color, bg, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => setFilterStatus(filterStatus === label ? "All" : label)}
                      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 transition-all text-left ${
                        filterStatus === label ? "ring-2 ring-emerald-300" : "hover:shadow-md"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className={color} />
                      </div>
                      <div>
                        <p className={`text-xl font-bold ${color} leading-tight`}>{count}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Collection summary bar */}
              {!studentsLoading && stats.totalDue > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4 items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Total Collected</p>
                    <p className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                      <IndianRupee size={14} />
                      {stats.totalCollected.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Total Due</p>
                    <p className="text-lg font-bold text-gray-800 flex items-center gap-1">
                      <IndianRupee size={14} />
                      {stats.totalDue.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex-1 min-w-32">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (stats.totalCollected / stats.totalDue) * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {((stats.totalCollected / stats.totalDue) * 100).toFixed(1)}% collected
                    </p>
                  </div>
                </div>
              )}

              {/* Students Table */}
              {studentsLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-sm font-semibold text-gray-500">
                    Pehle is class ke liye base fees set karein
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    "Set Base Fees" button click karein upar
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                      <Bus size={14} className="text-blue-500" />
                      <span className="text-xs font-semibold text-gray-500">
Set transport fees separately for each student
                      </span>
                    </div>
                    <table className="w-full text-sm min-w-[700px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {["Student", "Roll No.", "Tuition", "Transport Fee (Per Student)", "Total", "Status"].map(h => (
                            <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.length > 0 ? filtered.map(s => (
                          <StudentTransportRow
                            key={s.id}
                            student={s}
                            onUpdate={handleTransportUpdate}
                          />
                        )) : (
                          <tr>
                            <td colSpan={6} className="py-14 text-center">
                              <p className="text-3xl mb-2">🔍</p>
                              <p className="text-sm text-gray-500">No students found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-3">
                    {filtered.map(s => (
                      <MobileStudentCard
                        key={s.id}
                        student={s}
                        onUpdate={handleTransportUpdate}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast({ msg:"", type:"success" })} />
    </div>
  );
}

// Mobile card for student
function MobileStudentCard({ student, onUpdate }) {
  const [transport, setTransport] = useState(String(student.transport_fee || ""));
  const [saving, setSaving]       = useState(false);
  const dirty = String(student.transport_fee || 0) !== transport;

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(student.id, Number(transport));
    setSaving(false);
  };

  const total = Number(student.tuition_fee||0) + Number(student.library_fee||0) +
                Number(student.other_fee||0)   + Number(transport || 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${avatarColor(student.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {getInitials(student.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{student.name}</p>
          <p className="text-xs text-gray-400">Roll {student.roll_no || "—"}</p>
        </div>
        <StatusBadge status={student.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-gray-400 mb-0.5">Tuition</p>
          <p className="font-semibold text-gray-800 flex items-center gap-0.5">
            <IndianRupee size={11} />{Number(student.tuition_fee||0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl px-3 py-2">
          <p className="text-blue-400 mb-0.5 flex items-center gap-1"><Bus size={10}/> Transport</p>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <IndianRupee size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number" min="0"
                value={transport}
                onChange={e => setTransport(e.target.value)}
                placeholder="0"
                className={`w-full pl-5 pr-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 ${
                  dirty ? "border-blue-300 bg-white" : "border-blue-100 bg-transparent"
                }`}
              />
            </div>
            {dirty && (
              <button
                onClick={handleSave} disabled={saving}
                className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-semibold"
              >
                {saving ? "…" : "✓"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-50 pt-2">
        <p className="text-xs text-gray-400">Total</p>
        <p className="font-bold text-gray-900 flex items-center gap-0.5">
          <IndianRupee size={12} />{total.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}