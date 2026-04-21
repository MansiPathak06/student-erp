"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import { Search, CreditCard, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

const getToken = () => {
  if (typeof window === "undefined") return null;
  const m = document.cookie.match(/(^| )token=([^;]+)/);
  return m ? m[2] : null;
};

const apiFetch = (path, opts = {}) =>
  fetch(`/api/teacher${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(opts.body && !(opts.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
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
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function avatarColor(name = "") {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

const FEE_STATUS_MAP = {
  Paid:    { label: "Paid",    bg: "bg-emerald-50",  text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500", icon: CheckCircle },
  Pending: { label: "Pending", bg: "bg-amber-50",    text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500",   icon: Clock       },
  Overdue: { label: "Overdue", bg: "bg-red-50",      text: "text-red-700",     ring: "ring-red-200",     dot: "bg-red-500",     icon: AlertCircle },
};

function FeeBadge({ status }) {
  const s = FEE_STATUS_MAP[status] || FEE_STATUS_MAP.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
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

function FeeUpdateDropdown({ studentId, current, onUpdate, updating }) {
  return (
    <select
      value={current}
      disabled={updating}
      onChange={e => onUpdate(studentId, e.target.value)}
      className={`text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer transition-all ${
        current === "Paid"    ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
        current === "Overdue" ? "bg-red-50 border-red-200 text-red-700"            :
                                "bg-amber-50 border-amber-200 text-amber-700"
      }`}
    >
      <option value="Paid">Paid</option>
      <option value="Pending">Pending</option>
      <option value="Overdue">Overdue</option>
    </select>
  );
}

export default function TeacherFeesPage() {
  const [students,  setStudents]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [updating,  setUpdating]  = useState(null); // studentId being updated
  const [error,     setError]     = useState("");
  const [toast,     setToast]     = useState({ msg: "", type: "success" });
  const [search,    setSearch]    = useState("");
  const [filterFee, setFilterFee] = useState("All");
  const [activeClassIdx, setActiveClassIdx] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cl, st] = await Promise.allSettled([
        apiFetch("/classes"),
        apiFetch("/students"),
      ]);
      if (cl.status === "fulfilled") setClasses(cl.value || []);
      if (st.status === "fulfilled") setStudents(st.value || []);
    } catch {
      setError("Could not load fee data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeClass = classes[activeClassIdx] || null;

  const classStudents = useMemo(() => {
    if (!activeClass) return [];
    return students
      .filter(s =>
        s.class_id === activeClass.id ||
        (s.class === (activeClass.grade || activeClass.class_name) && s.section === activeClass.section)
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [students, activeClass]);

  const filtered = useMemo(() => {
    let list = classStudents;
    if (filterFee !== "All") list = list.filter(s => (s.fee_status || "Pending") === filterFee);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) || s.roll_number?.toString().includes(q)
      );
    }
    return list;
  }, [classStudents, filterFee, search]);

  const handleFeeUpdate = async (studentId, newStatus) => {
    setUpdating(studentId);
    try {
      await apiFetch(`/fees/${studentId}`, {
        method: "PUT",
        body: JSON.stringify({ fee_status: newStatus }),
      });
      setStudents(prev =>
        prev.map(s => s.id === studentId ? { ...s, fee_status: newStatus } : s)
      );
      setToast({ msg: "Fee status updated successfully.", type: "success" });
    } catch {
      setToast({ msg: "Failed to update fee status. Please try again.", type: "error" });
    } finally {
      setUpdating(null);
    }
  };

  // Summary stats
  const paid    = classStudents.filter(s => s.fee_status === "Paid").length;
  const pending = classStudents.filter(s => !s.fee_status || s.fee_status === "Pending").length;
  const overdue = classStudents.filter(s => s.fee_status === "Overdue").length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 shadow-sm">
          <div className="pl-10 lg:pl-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fees Management</h1>
              <p className="text-sm text-gray-400">View and update fee status for your class students</p>
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
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              {error}
              <button onClick={load} className="text-red-700 font-semibold hover:underline text-xs ml-4">Retry</button>
            </div>
          )}

          {/* Class switcher */}
          {classes.length > 1 && (
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
                  Class {cls.grade || cls.class_name}-{cls.section}
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && activeClass && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Paid",    count: paid,    color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
                { label: "Pending", count: pending, color: "text-amber-600",   bg: "bg-amber-50",   icon: Clock       },
                { label: "Overdue", count: overdue, color: "text-red-600",     bg: "bg-red-50",     icon: AlertCircle },
              ].map(({ label, count, color, bg, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setFilterFee(filterFee === label ? "All" : label)}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 transition-all ${
                    filterFee === label ? "ring-2 ring-emerald-300" : "hover:shadow-md"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="text-left">
                    <p className={`text-xl font-bold ${color} leading-tight`}>{count}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Filter pill */}
          {filterFee !== "All" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Showing:</span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-semibold">
                {filterFee}
                <button onClick={() => setFilterFee("All")} className="ml-1 hover:text-emerald-900">✕</button>
              </span>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : !activeClass ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
              <div className="text-5xl mb-3">🏫</div>
              <p className="text-sm font-semibold text-gray-500">No class assigned to you yet</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Student", "Roll No.", "Guardian", "Fee Status", "Update Status"].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length > 0 ? filtered.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl ${avatarColor(s.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {getInitials(s.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{s.name}</p>
                              <p className="text-xs text-gray-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.roll_number || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.guardian_name || "—"}</td>
                        <td className="px-4 py-3"><FeeBadge status={s.fee_status || "Pending"} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FeeUpdateDropdown
                              studentId={s.id}
                              current={s.fee_status || "Pending"}
                              onUpdate={handleFeeUpdate}
                              updating={updating === s.id}
                            />
                            {updating === s.id && <Loader2 size={14} className="animate-spin text-gray-400" />}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="text-3xl mb-2">🔍</div>
                          <p className="text-sm font-medium text-gray-500">No students found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {filtered.length > 0 ? filtered.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${avatarColor(s.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {getInitials(s.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                        <p className="text-xs text-gray-400">Roll {s.roll_number || "—"}</p>
                      </div>
                      <FeeBadge status={s.fee_status || "Pending"} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Update status:</span>
                      <div className="flex items-center gap-2">
                        <FeeUpdateDropdown
                          studentId={s.id}
                          current={s.fee_status || "Pending"}
                          onUpdate={handleFeeUpdate}
                          updating={updating === s.id}
                        />
                        {updating === s.id && <Loader2 size={14} className="animate-spin text-gray-400" />}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-sm font-medium text-gray-500">No students found</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast({ msg: "", type: "success" })} />
    </div>
  );
}