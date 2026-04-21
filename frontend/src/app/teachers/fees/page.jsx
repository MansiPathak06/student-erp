"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import {
  Search, CheckCircle, Clock, AlertCircle, Loader2,
  Bus, IndianRupee, Save,
} from "lucide-react";

const getToken = () => {
  if (typeof window === "undefined") return null;
  const m = document.cookie.match(/(^| )token=([^;]+)/);
  return m ? m[2] : null;
};

const apiFetch = (path, opts = {}) =>
  fetch(`/api${path}`, {
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

function FeeBadge({ status }) {
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
    const t = setTimeout(onDismiss, 3000);
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

// ─── Student Row ──────────────────────────────────────────────────────────────
function StudentFeeRow({ student, onUpdate }) {
  const [status,    setStatus]    = useState(student.status || "Pending");
  const [transport, setTransport] = useState(String(student.transport_fee || "0"));
  const [saving,    setSaving]    = useState(false);

  const statusDirty    = status    !== (student.status || "Pending");
  const transportDirty = transport !== String(student.transport_fee || "0");
  const isDirty = statusDirty || transportDirty;

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(student.id, {
      status:        statusDirty    ? status            : undefined,
      transport_fee: transportDirty ? Number(transport) : undefined,
    });
    setSaving(false);
  };

  const total = Number(student.tuition_fee || 0) +
                Number(student.library_fee  || 0) +
                Number(student.other_fee    || 0) +
                Number(transport || 0);

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      {/* Student */}
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

      {/* Roll */}
      <td className="px-4 py-3 font-mono text-xs text-gray-500">
        {student.roll_number || "—"}
      </td>

      {/* Transport Fee — editable */}
      <td className="px-4 py-3">
        <div className="relative w-28">
          <IndianRupee size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number" min="0"
            value={transport}
            onChange={e => setTransport(e.target.value)}
            className={`w-full pl-6 pr-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${
              transportDirty ? "border-blue-300 bg-blue-50" : "border-gray-200"
            }`}
          />
        </div>
      </td>

      {/* Total */}
      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
        <span className="flex items-center gap-0.5">
          <IndianRupee size={11} className="text-gray-500" />
          {total.toLocaleString("en-IN")}
        </span>
      </td>

      {/* Current badge */}
      <td className="px-4 py-3">
        <FeeBadge status={student.status} />
      </td>

      {/* Status dropdown */}
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className={`text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer transition-all ${
            status === "Paid"    ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
            status === "Overdue" ? "bg-red-50 border-red-200 text-red-700"             :
            status === "Partial" ? "bg-blue-50 border-blue-200 text-blue-700"          :
                                   "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
          <option value="Overdue">Overdue</option>
        </select>
      </td>

      {/* Save button */}
      <td className="px-4 py-3">
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
            Save
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────
function StudentFeeCard({ student, onUpdate }) {
  const [status,    setStatus]    = useState(student.status || "Pending");
  const [transport, setTransport] = useState(String(student.transport_fee || "0"));
  const [saving,    setSaving]    = useState(false);

  const isDirty = status !== (student.status || "Pending") ||
                  transport !== String(student.transport_fee || "0");

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(student.id, {
      status:        status    !== (student.status || "Pending") ? status            : undefined,
      transport_fee: transport !== String(student.transport_fee || "0") ? Number(transport) : undefined,
    });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${avatarColor(student.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {getInitials(student.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{student.name}</p>
          <p className="text-xs text-gray-400">Roll {student.roll_number || "—"}</p>
        </div>
        <FeeBadge status={student.status} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Transport */}
        <div className="bg-blue-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-blue-400 mb-1 flex items-center gap-1"><Bus size={10}/> Transport</p>
          <div className="relative">
            <IndianRupee size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number" min="0"
              value={transport}
              onChange={e => setTransport(e.target.value)}
              className="w-full pl-5 pr-2 py-1 text-xs border border-blue-100 rounded-lg focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-gray-400 mb-1">Update Status</p>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none bg-white"
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {isDirty && (
        <button
          onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save Changes
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeacherFeesPage() {
  const [students,       setStudents]       = useState([]);
  const [classes,        setClasses]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [studentsLoading,setStudentsLoading]= useState(false);
  const [error,          setError]          = useState("");
  const [toast,          setToast]          = useState({ msg: "", type: "success" });
  const [search,         setSearch]         = useState("");
  const [filterFee,      setFilterFee]      = useState("All");
  const [activeClassIdx, setActiveClassIdx] = useState(0);

  // Load classes
  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/teacher/classes");
      setClasses(data || []);
    } catch {
      setError("Classes load nahi ho payi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  const activeClass = classes[activeClassIdx] || null;

  // Load students
  const loadStudents = useCallback(async () => {
    if (!activeClass) return;
    setStudentsLoading(true);
    try {
      const cls     = activeClass.class || activeClass.grade || activeClass.class_name;
      const section = activeClass.section || "";
      const params  = new URLSearchParams({ class: cls, academic_year: "2024-25", limit: "200" });
      if (section) params.append("section", section);
      const data = await apiFetch(`/fees/students?${params}`);
      setStudents(data.data || []);
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, [activeClass]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Update handler
  const handleUpdate = async (studentFeeId, changes) => {
    try {
      await apiFetch(`/fees/students/${studentFeeId}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      setStudents(prev =>
        prev.map(s => s.id === studentFeeId ? { ...s, ...changes } : s)
      );
      setToast({ msg: "Updated successfully!", type: "success" });
    } catch {
      setToast({ msg: "Update failed. Try again.", type: "error" });
    }
  };

  // Stats
  const paid    = students.filter(s => s.status === "Paid").length;
  const pending = students.filter(s => !s.status || s.status === "Pending").length;
  const overdue = students.filter(s => s.status === "Overdue").length;

  // Filtered
  const filtered = useMemo(() => {
    let list = students;
    if (filterFee !== "All") list = list.filter(s => (s.status || "Pending") === filterFee);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) || s.roll_number?.toString().includes(q)
      );
    }
    return list;
  }, [students, filterFee, search]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 shadow-sm">
          <div className="pl-10 lg:pl-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fees Management</h1>
              <p className="text-sm text-gray-400">Status update karein · Transport fee assign karein</p>
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Class Switcher */}
          {!loading && classes.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {classes.map((cls, i) => (
                <button
                  key={cls.id || i}
                  onClick={() => { setActiveClassIdx(i); setSearch(""); setFilterFee("All"); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    i === activeClassIdx
                      ? "bg-emerald-500 text-white border-transparent shadow-md"
                      : "bg-white text-gray-500 border-gray-100"
                  }`}
                >
                  Class {cls.grade || cls.class_name}{cls.section ? `-${cls.section}` : ""}
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          {!studentsLoading && activeClass && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Paid",    count: paid,    color:"text-emerald-600", bg:"bg-emerald-50", icon: CheckCircle },
                { label:"Pending", count: pending, color:"text-amber-600",   bg:"bg-amber-50",   icon: Clock       },
                { label:"Overdue", count: overdue, color:"text-red-600",     bg:"bg-red-50",     icon: AlertCircle },
              ].map(({ label, count, color, bg, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setFilterFee(filterFee === label ? "All" : label)}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 transition-all ${
                    filterFee === label ? "ring-2 ring-emerald-300" : "hover:shadow-md"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="text-left">
                    <p className={`text-xl font-bold ${color} leading-tight`}>{count}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {studentsLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !activeClass ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
              <p className="text-5xl mb-3">🏫</p>
              <p className="text-sm font-semibold text-gray-500">No class assigned</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[750px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Student", "Roll No.", "Transport Fee 🚌", "Total", "Current Status", "Update Status", ""].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length > 0 ? filtered.map(s => (
                      <StudentFeeRow key={s.id} student={s} onUpdate={handleUpdate} />
                    )) : (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <p className="text-3xl mb-2">🔍</p>
                          <p className="text-sm text-gray-500">No students found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {filtered.length > 0 ? filtered.map(s => (
                  <StudentFeeCard key={s.id} student={s} onUpdate={handleUpdate} />
                )) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-sm text-gray-500">No students found</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast({ msg:"", type:"success" })} />
    </div>
  );
}