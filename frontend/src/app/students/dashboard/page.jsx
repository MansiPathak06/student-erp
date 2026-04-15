"use client";

import { useState, useEffect, useMemo } from "react";
import {
  GraduationCap, CalendarCheck, CreditCard, BarChart3,
  ClipboardList, Clock, Bell, LogOut, Menu, X,
  CheckCircle, XCircle, AlertCircle, ChevronRight,
  BookOpen, TrendingUp, Award, User, MapPin,
  Phone, Mail, Hash, Loader2, RefreshCw, Eye,
} from "lucide-react";

const API = "http://localhost:5000/api";

function getToken() {
  return document.cookie.split("; ").find(r => r.startsWith("token="))?.split("=")[1] ?? "";
}
function getUser() {
  try {
    const raw = document.cookie.split("; ").find(r => r.startsWith("user="))?.split("=")[1];
    return raw ? JSON.parse(decodeURIComponent(raw)) : null;
  } catch { return null; }
}

async function apiFetch(path) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}


// ─────────────────────────────────────────────
// SMALL UI
// ─────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={28} className="animate-spin text-blue-500" />
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle size={20} className="text-red-500" />
      </div>
      <p className="text-sm font-medium text-gray-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline">
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, bg, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={16} className={accent} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, accent = "text-blue-600", bg = "bg-blue-50" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={15} className={accent} />
        </div>
        <h2 className="font-bold text-gray-900 text-base">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}


// ─────────────────────────────────────────────
// ATTENDANCE SECTION
// ─────────────────────────────────────────────

function AttendanceSection() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { setData(await apiFetch("/student/attendance")); }
    catch { setError("Failed to load attendance"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    const present  = data.filter(r => r.status === "Present").length;
    const absent   = data.filter(r => r.status === "Absent").length;
    const late     = data.filter(r => r.status === "Late").length;
    const total    = data.length;
    const rate     = total ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, rate };
  }, [data]);

  const STATUS_ICON = {
    Present: <CheckCircle size={13} className="text-green-500" />,
    Absent:  <XCircle     size={13} className="text-red-500"   />,
    Late:    <Clock       size={13} className="text-amber-500" />,
  };
  const STATUS_BADGE = {
    Present: "bg-green-50 text-green-700 ring-green-200",
    Absent:  "bg-red-50   text-red-700   ring-red-200",
    Late:    "bg-amber-50 text-amber-700 ring-amber-200",
  };

  return (
    <SectionCard title="Attendance" icon={CalendarCheck} accent="text-green-600" bg="bg-green-50">
      {loading ? <Spinner /> : error ? <ErrorCard message={error} onRetry={load} /> : (
        <div className="space-y-5">
          {/* Rate bar */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Overall Attendance</span>
              <span className={`text-lg font-bold ${stats.rate >= 75 ? "text-green-600" : "text-red-600"}`}>{stats.rate}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${stats.rate >= 75 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${stats.rate}%` }} />
            </div>
            <div className="flex gap-4 mt-3">
              {[
                { label: "Present", val: stats.present, color: "text-green-700" },
                { label: "Absent",  val: stats.absent,  color: "text-red-600"   },
                { label: "Late",    val: stats.late,    color: "text-amber-600" },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <p className={`text-base font-bold ${color}`}>{val}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent records */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Recent Records</p>
            <div className="space-y-2">
              {data.slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                  {STATUS_ICON[r.status]}
                  <span className="text-sm text-gray-700 flex-1">{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</span>
                  {r.subject && <span className="text-xs text-gray-400">{r.subject}</span>}
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}


// ─────────────────────────────────────────────
// FEES SECTION
// ─────────────────────────────────────────────

function FeesSection() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  async function load() {
    setLoading(true); setError("");
    try { setData(await apiFetch("/student/fees")); }
    catch { setError("Failed to load fee details"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    const paid    = data.filter(r => r.status === "Paid").reduce((s, r) => s + Number(r.amount), 0);
    const pending = data.filter(r => r.status !== "Paid").reduce((s, r) => s + Number(r.amount), 0);
    const overdue = data.filter(r => r.status === "Overdue").length;
    return { paid, pending, overdue };
  }, [data]);

  const FEE_BADGE = {
    Paid:    "bg-green-50 text-green-700 ring-green-200",
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    Overdue: "bg-red-50   text-red-700   ring-red-200",
  };

  return (
    <SectionCard title="Fee Details" icon={CreditCard} accent="text-violet-600" bg="bg-violet-50">
      {loading ? <Spinner /> : error ? <ErrorCard message={error} onRetry={load} /> : (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1">Paid</p>
              <p className="text-xl font-bold text-green-700">₹{stats.paid.toLocaleString("en-IN")}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Pending</p>
              <p className="text-xl font-bold text-amber-700">₹{stats.pending.toLocaleString("en-IN")}</p>
            </div>
          </div>
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-xs font-semibold text-red-700">{stats.overdue} overdue payment{stats.overdue > 1 ? "s" : ""} — please clear immediately</p>
            </div>
          )}

          {/* Fee records */}
          <div className="space-y-2">
            {data.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.fee_type ?? r.description ?? "Fee"}</p>
                  <p className="text-xs text-gray-400">Due: {new Date(r.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <p className="text-sm font-bold text-gray-800">₹{Number(r.amount).toLocaleString("en-IN")}</p>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${FEE_BADGE[r.status] ?? FEE_BADGE.Pending}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}


// ─────────────────────────────────────────────
// RESULTS SECTION
// ─────────────────────────────────────────────

function ResultsSection() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  async function load() {
    setLoading(true); setError("");
    try { setData(await apiFetch("/student/results")); }
    catch { setError("Failed to load results"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function gradeColor(pct) {
    if (pct >= 90) return { text: "text-emerald-700", bg: "bg-emerald-50", bar: "bg-emerald-500", grade: "A+" };
    if (pct >= 80) return { text: "text-green-700",   bg: "bg-green-50",   bar: "bg-green-500",   grade: "A"  };
    if (pct >= 70) return { text: "text-blue-700",    bg: "bg-blue-50",    bar: "bg-blue-500",    grade: "B"  };
    if (pct >= 60) return { text: "text-amber-700",   bg: "bg-amber-50",   bar: "bg-amber-500",   grade: "C"  };
    return           { text: "text-red-700",           bg: "bg-red-50",     bar: "bg-red-500",     grade: "F"  };
  }

  const avgPct = useMemo(() => {
    if (!data?.length) return 0;
    const vals = data.map(r => r.max_marks ? Math.round((r.marks_obtained / r.max_marks) * 100) : 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [data]);

  return (
    <SectionCard title="Exam Results" icon={BarChart3} accent="text-amber-600" bg="bg-amber-50">
      {loading ? <Spinner /> : error ? <ErrorCard message={error} onRetry={load} /> : (
        <div className="space-y-5">
          {/* Overall */}
          {data.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${gradeColor(avgPct).bg}`}>
                <span className={`text-xl font-bold ${gradeColor(avgPct).text}`}>{gradeColor(avgPct).grade}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgPct}%</p>
                <p className="text-xs text-gray-400">Overall average across {data.length} exams</p>
              </div>
            </div>
          )}

          {/* Subject results */}
          <div className="space-y-3">
            {data.map(r => {
              const pct = r.max_marks ? Math.round((r.marks_obtained / r.max_marks) * 100) : 0;
              const col = gradeColor(pct);
              return (
                <div key={r.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.subject ?? r.exam_name}</p>
                      <p className="text-[10px] text-gray-400">{r.exam_type ?? "Exam"} · {r.exam_date ? new Date(r.exam_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${col.text}`}>{r.marks_obtained}/{r.max_marks}</span>
                      <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${col.bg} ${col.text}`}>{col.grade}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${col.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {data.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No results published yet</p>}
        </div>
      )}
    </SectionCard>
  );
}


// ─────────────────────────────────────────────
// ASSIGNMENTS SECTION
// ─────────────────────────────────────────────

function AssignmentsSection() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  async function load() {
    setLoading(true); setError("");
    try { setData(await apiFetch("/student/assignments")); }
    catch { setError("Failed to load assignments"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function dueLabel(date) {
    const d    = new Date(date);
    const now  = new Date();
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, color: "text-red-600", badge: "bg-red-50 text-red-700 ring-red-200" };
    if (diff === 0) return { label: "Due today",   color: "text-amber-600", badge: "bg-amber-50 text-amber-700 ring-amber-200" };
    if (diff <= 3)  return { label: `Due in ${diff}d`, color: "text-amber-600", badge: "bg-amber-50 text-amber-700 ring-amber-200" };
    return           { label: `Due ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`, color: "text-gray-500", badge: "bg-gray-100 text-gray-500 ring-gray-200" };
  }

  return (
    <SectionCard title="Assignments" icon={ClipboardList} accent="text-rose-600" bg="bg-rose-50">
      {loading ? <Spinner /> : error ? <ErrorCard message={error} onRetry={load} /> : (
        <div className="space-y-3">
          {data.map(a => {
            const due = dueLabel(a.due_date);
            return (
              <div key={a.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ClipboardList size={14} className="text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.subject ?? ""} · {a.teacher_name}</p>
                  {a.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 whitespace-nowrap flex-shrink-0 ${due.badge}`}>{due.label}</span>
              </div>
            );
          })}
          {data.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No assignments posted yet</p>}
        </div>
      )}
    </SectionCard>
  );
}


// ─────────────────────────────────────────────
// TIMETABLE SECTION
// ─────────────────────────────────────────────

const DAYS    = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SUBJECT_DOT = {
  Physics: "bg-blue-500", Mathematics: "bg-violet-500", Chemistry: "bg-emerald-500",
  Biology: "bg-green-500", English: "bg-rose-500", History: "bg-amber-500",
  "Computer Sc": "bg-cyan-500", "Physical Ed": "bg-orange-500", Hindi: "bg-pink-500",
};

function TimetableSection() {
  const [data, setData]     = useState(null);
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return DAYS[d === 0 || d === 7 ? 0 : d - 1] ?? "Monday";
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  async function load() {
    setLoading(true); setError("");
    try { setData(await apiFetch("/student/timetable")); }
    catch { setError("Failed to load timetable"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const dayPeriods = useMemo(() =>
    data?.filter(r => r.day_of_week === activeDay) ?? [], [data, activeDay]);

  return (
    <SectionCard title="My Timetable" icon={Clock} accent="text-cyan-600" bg="bg-cyan-50">
      {loading ? <Spinner /> : error ? <ErrorCard message={error} onRetry={load} /> : (
        <div className="space-y-4">
          {/* Day tabs */}
          <div className="flex gap-1 flex-wrap">
            {DAYS.map(day => {
              const isToday = day === DAYS[new Date().getDay() - 1];
              return (
                <button key={day} onClick={() => setActiveDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeDay === day
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : isToday
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {day.slice(0, 3)}{isToday ? " ★" : ""}
                </button>
              );
            })}
          </div>

          {/* Periods */}
          <div className="space-y-2">
            {dayPeriods.map((p, i) => (
              <div key={p.id ?? i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 text-center w-16">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{p.start_time}</p>
                  <p className="text-[10px] text-gray-300">{p.end_time}</p>
                </div>
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${SUBJECT_DOT[p.subject] ?? "bg-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{p.subject}</p>
                  <p className="text-xs text-gray-400">{p.teacher_name} · {p.room_no ?? "Room TBD"}</p>
                </div>
              </div>
            ))}
            {dayPeriods.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Clock size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No classes on {activeDay}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}


// ─────────────────────────────────────────────
// PROFILE SECTION
// ─────────────────────────────────────────────

function ProfileSection({ user }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  async function load() {
    setLoading(true); setError("");
    try { setData(await apiFetch("/student/profile")); }
    catch { setError("Failed to load profile"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const INFO = data ? [
    { icon: Hash,   label: "Student ID",   val: data.student_id ?? data.id    },
    { icon: User,   label: "Class",        val: `${data.class} - ${data.section}` },
    { icon: Mail,   label: "Email",        val: data.email                    },
    { icon: Phone,  label: "Phone",        val: data.phone ?? "—"             },
    { icon: MapPin, label: "Address",      val: data.address ?? "—"           },
    { icon: GraduationCap, label: "Roll No", val: data.roll_no ?? "—"         },
  ] : [];

  return (
    <SectionCard title="My Profile" icon={User} accent="text-blue-600" bg="bg-blue-50">
      {loading ? <Spinner /> : error ? <ErrorCard message={error} onRetry={load} /> : (
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl border border-blue-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.name ?? data?.name}</p>
              <p className="text-sm text-gray-500">{data?.email ?? user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                <GraduationCap size={10} /> Student
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 gap-2">
            {INFO.map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{val ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}


// ─────────────────────────────────────────────
// STUDENT DASHBOARD — PAGE ENTRY POINT
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "overview",     label: "Overview",    icon: TrendingUp   },
  { key: "attendance",   label: "Attendance",  icon: CalendarCheck},
  { key: "fees",         label: "Fees",        icon: CreditCard   },
  { key: "results",      label: "Results",     icon: BarChart3    },
  { key: "assignments",  label: "Assignments", icon: ClipboardList},
  { key: "timetable",    label: "Timetable",   icon: Clock        },
  { key: "profile",      label: "Profile",     icon: User         },
];

export default function StudentDashboard() {
  const [activeTab,    setActiveTab]    = useState("overview");
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [user]                          = useState(() => getUser());

  // Overview quick stats (fetched once)
  const [overviewData, setOverviewData] = useState({ att: null, fees: null, results: null, assignments: null });

  useEffect(() => {
    async function loadOverview() {
      try {
        const [att, fees, results, assignments] = await Promise.allSettled([
          apiFetch("/student/attendance"),
          apiFetch("/student/fees"),
          apiFetch("/student/results"),
          apiFetch("/student/assignments"),
        ]);
        setOverviewData({
          att:         att.status         === "fulfilled" ? att.value         : [],
          fees:        fees.status        === "fulfilled" ? fees.value        : [],
          results:     results.status     === "fulfilled" ? results.value     : [],
          assignments: assignments.status === "fulfilled" ? assignments.value : [],
        });
      } catch {}
    }
    loadOverview();
  }, []);

  function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    window.location.href = "/login";
  }

  // Overview stats
  const attRate  = overviewData.att?.length
    ? Math.round((overviewData.att.filter(r => r.status === "Present").length / overviewData.att.length) * 100) : 0;
  const feePending = overviewData.fees?.filter(r => r.status !== "Paid").reduce((s, r) => s + Number(r.amount), 0) ?? 0;
  const avgResult  = overviewData.results?.length
    ? Math.round(overviewData.results.map(r => r.max_marks ? (r.marks_obtained / r.max_marks) * 100 : 0).reduce((a, b) => a + b, 0) / overviewData.results.length)
    : 0;
  const pendingAssignments = overviewData.assignments?.filter(a => new Date(a.due_date) >= new Date()).length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">

      {/* ── Sidebar ── */}
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 flex flex-col
        bg-gradient-to-b from-blue-600 to-blue-800
        shadow-2xl shadow-blue-900/40 transition-transform duration-300
        lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center ring-1 ring-white/30">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">EduERP</p>
            <p className="text-blue-200 text-[10px] uppercase tracking-widest">Student Portal</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-blue-200 hover:text-white"><X size={18} /></button>
        </div>

        {/* Student info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 bg-white/10 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "ST"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name ?? "Student"}</p>
              <p className="text-blue-200 text-[10px] truncate">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setActiveTab(key); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                ${activeTab === key
                  ? "bg-white text-blue-700 font-bold shadow-md shadow-blue-900/20"
                  : "text-blue-100 hover:bg-white/15 hover:text-white font-medium"
                }`}>
              <Icon size={17} className={activeTab === key ? "text-blue-600" : "text-blue-200"} />
              {label}
              {key === "assignments" && pendingAssignments > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingAssignments}</span>
              )}
              {key === "fees" && feePending > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">!</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:bg-red-500/25 hover:text-red-200 transition-all text-sm font-medium">
            <LogOut size={17} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 bg-blue-600 text-white rounded-xl">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{NAV_ITEMS.find(n => n.key === activeTab)?.label}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Student Dashboard · EduERP</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "ST"}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8 space-y-6">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Good morning, {user?.name?.split(" ")[0] ?? "Student"} 👋</h2>
                <p className="text-sm text-gray-500 mt-0.5">Here's a quick look at your academic progress</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Attendance"   value={`${attRate}%`}    icon={CalendarCheck} accent="text-green-600"  bg="bg-green-50"  sub="This semester"        />
                <StatCard label="Avg Score"    value={`${avgResult}%`}  icon={Award}         accent="text-amber-600"  bg="bg-amber-50"  sub="Across all exams"     />
                <StatCard label="Fee Pending"  value={`₹${feePending.toLocaleString("en-IN")}`} icon={CreditCard} accent="text-violet-600" bg="bg-violet-50" sub="Due this term" />
                <StatCard label="Assignments"  value={pendingAssignments} icon={ClipboardList} accent="text-rose-600" bg="bg-rose-50"   sub="Upcoming deadlines"   />
              </div>

              {/* Quick access */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {NAV_ITEMS.filter(n => n.key !== "overview").map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group text-left">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors flex-shrink-0">
                      <Icon size={20} className="text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">View details →</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === "attendance"  && <AttendanceSection />}
          {activeTab === "fees"        && <FeesSection />}
          {activeTab === "results"     && <ResultsSection />}
          {activeTab === "assignments" && <AssignmentsSection />}
          {activeTab === "timetable"   && <TimetableSection />}
          {activeTab === "profile"     && <ProfileSection user={user} />}
        </div>
      </main>
    </div>
  );
}