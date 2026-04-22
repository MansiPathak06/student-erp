"use client";

import { useState, useEffect, useCallback } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import StudentFeeCard from "@/components/StudentFeeCard";
import StudentHomeworkList from "@/components/StudentHomeworkList";
import { apiFetch } from "@/lib/api";
import {
  GraduationCap, BookOpen, Users, CalendarDays,
  User, Phone, Mail, MapPin, Calendar,
  Bell, Pin, AlertCircle,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon size={15} className="text-violet-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <span className="text-sm text-gray-700 font-medium sm:text-right truncate">{value || "—"}</span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <svg className="animate-spin w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
      {message}
      {onRetry && (
        <button onClick={onRetry} className="text-red-700 font-semibold hover:underline text-xs ml-4">
          Retry
        </button>
      )}
    </div>
  );
}

// ─── NoticesSection ───────────────────────────────────────────────────────────
const CATEGORY_STYLE = {
  General:  { bg: "bg-gray-100",   text: "text-gray-600"    },
  Academic: { bg: "bg-blue-50",    text: "text-blue-700"    },
  Exam:     { bg: "bg-violet-50",  text: "text-violet-700"  },
  Holiday:  { bg: "bg-emerald-50", text: "text-emerald-700" },
  Event:    { bg: "bg-amber-50",   text: "text-amber-700"   },
  Urgent:   { bg: "bg-red-50",     text: "text-red-700"     },
};

function NoticesSection() {
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/student/notices");
      setData(res || []);
    } catch {
      setError("Failed to load notices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Bell size={15} className="text-amber-600" />
        </div>
        <h2 className="font-bold text-gray-900 text-sm">Notices</h2>
        {data && data.length > 0 && (
          <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            {data.length}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorCard message={error} onRetry={load} />
        ) : !data || data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notices for you right now</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map(n => {
              const cat    = CATEGORY_STYLE[n.category] ?? CATEGORY_STYLE.General;
              const isOpen = expanded === n.id;
              const isUrgent = n.priority === "Urgent";

              return (
                <div
                  key={n.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden
                    ${isUrgent
                      ? "border-red-200 bg-red-50/30"
                      : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/20"
                    }`}
                >
                  {/* Row button */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : n.id)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                  >
                    {/* Left icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                      ${isUrgent ? "bg-red-100" : n.is_pinned ? "bg-blue-100" : "bg-gray-100"}`}>
                      {isUrgent
                        ? <AlertCircle size={15} className="text-red-600" />
                        : n.is_pinned
                        ? <Pin size={15} className="text-blue-600" />
                        : <Bell size={15} className="text-gray-500" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {n.is_pinned && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                            📌 Pinned
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                          {n.category}
                        </span>
                        {n.priority && n.priority !== "Normal" && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                            ${isUrgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            {n.priority}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-gray-900 leading-tight">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {n.author ?? "Admin"} ·{" "}
                        {new Date(n.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Chevron */}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      className={`flex-shrink-0 mt-1 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                      <div className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-3 border border-gray-100">
                        {n.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentDashboardPage() {
  const [student,   setStudent]   = useState(null);
  const [teachers,  setTeachers]  = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, teachersRes, timetableRes] = await Promise.allSettled([
        apiFetch("/student/profile"),
        apiFetch("/student/teachers"),
        apiFetch("/student/timetable"),
      ]);
      if (profileRes.status   === "fulfilled") setStudent(profileRes.value);
      if (teachersRes.status  === "fulfilled") setTeachers(teachersRes.value  || []);
      if (timetableRes.status === "fulfilled") setTimetable(timetableRes.value || []);
    } catch {
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const today    = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dayName  = new Date().toLocaleDateString("en-IN", { weekday: "long" });
  const todayClasses = timetable.filter(t => t.day_of_week?.toLowerCase() === dayName.toLowerCase());

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <StudentSidebar />
        <main className="flex-1 p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 shadow-sm">
          <div className="pl-10 lg:pl-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Welcome back{student?.name ? `, ${student.name.split(" ")[0]}` : ""}! 👋
              </h1>
              <p className="text-sm text-gray-400">{today}</p>
            </div>
            {student && (
              <div className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-2.5 border border-violet-100">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitials(student.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-violet-800 leading-tight">{student.name}</p>
                  <p className="text-xs text-violet-500">{student.class} – {student.section} · Roll {student.roll_number}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && <ErrorCard message={error} onRetry={fetchData} />}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={GraduationCap} label="My Class"        value={student ? `${student.class}${student.section}` : "—"} color="bg-violet-500" />
            <StatCard icon={BookOpen}      label="Today's Classes" value={todayClasses.length}                                   color="bg-blue-500"   />
            <StatCard icon={Users}         label="My Teachers"     value={teachers.length}                                       color="bg-emerald-500"/>
            <StatCard icon={CalendarDays}  label="Roll Number"     value={student?.roll_number || "—"}                           color="bg-amber-500"  />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Profile card */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600" />
              <div className="p-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {getInitials(student?.name || "")}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{student?.name || "—"}</p>
                    <p className="text-xs text-violet-600 font-medium mt-0.5">{student?.class} – Section {student?.section}</p>
                    {student?.student_id && <p className="text-xs text-gray-400 font-mono mt-0.5">{student.student_id}</p>}
                  </div>
                </div>
                <div>
                  <InfoRow icon={Mail}     label="Email"         value={student?.email} />
                  <InfoRow icon={Phone}    label="Phone"         value={student?.phone} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString("en-IN") : null} />
                  <InfoRow icon={User}     label="Gender"        value={student?.gender} />
                  <InfoRow icon={MapPin}   label="Address"       value={student?.address} />
                  <InfoRow icon={User}     label="Guardian"      value={student?.guardian_name} />
                  <InfoRow icon={Phone}    label="Guardian Ph"   value={student?.guardian_phone} />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Today's Schedule */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-sm">Today's Schedule</h2>
                  <span className="text-xs text-gray-400">{dayName}</span>
                </div>
                {todayClasses.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {todayClasses.slice(0, 5).map((cls, i) => (
                      <div key={i} className="px-5 py-3 flex items-center gap-4">
                        <div className="w-14 text-center flex-shrink-0">
                          <p className="text-xs font-bold text-violet-600">{cls.start_time || "—"}</p>
                          <p className="text-[10px] text-gray-400">{cls.end_time || ""}</p>
                        </div>
                        <div className="w-0.5 h-8 bg-violet-100 rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{cls.subject || cls.subject_name || "—"}</p>
                          <p className="text-xs text-gray-400 truncate">{cls.teacher_name || ""}</p>
                        </div>
                        {cls.room && (
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg flex-shrink-0">Room {cls.room}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-sm font-medium text-gray-500">No classes today</p>
                    <p className="text-xs text-gray-400 mt-1">Enjoy your free day!</p>
                  </div>
                )}
              </div>

              {/* My Teachers */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900 text-sm">My Teachers</h2>
                </div>
                {teachers.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {teachers.slice(0, 4).map((t, i) => (
                      <div key={i} className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
                          {getInitials(t.name || t.teacher_name || "")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{t.name || t.teacher_name || "—"}</p>
                          <p className="text-xs text-gray-400 truncate">{t.subject || t.subject_name || "Class Teacher"}</p>
                        </div>
                        {t.email && (
                          <a href={`mailto:${t.email}`} className="text-xs text-violet-500 hover:underline hidden sm:block flex-shrink-0">
                            {t.email}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center">
                    <div className="text-3xl mb-2">👨‍🏫</div>
                    <p className="text-sm font-medium text-gray-500">No teachers assigned yet</p>
                  </div>
                )}
              </div>

              {/* ✅ NOTICES — renders here below teachers */}
              <NoticesSection />
              <StudentHomeworkList/>
              <StudentFeeCard studentId={student?.student_id} academicYear="2024-25" />
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}