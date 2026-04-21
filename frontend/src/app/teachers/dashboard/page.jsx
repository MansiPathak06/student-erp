"use client";

import { useState, useEffect, useCallback } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import {
  BookOpen, Users, CalendarDays, GraduationCap,
  User, Phone, Mail, Clock,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
const getToken = () => {
  if (typeof window === "undefined") return null;
  const m = document.cookie.match(/(^| )token=([^;]+)/);
  return m ? m[2] : null;
};

const apiFetch = (path) =>
  fetch(`/api/teacher${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });

function getInitials(name = "") {
  const p = name.trim().split(" ").filter(Boolean);
  if (!p.length) return "?";
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ── sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function Skeleton({ h = "h-20" }) {
  return <div className={`${h} bg-gray-100 rounded-2xl animate-pulse`} />;
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function TeacherDashboardPage() {
  const [profile,   setProfile]   = useState(null);
  const [classes,   setClasses]   = useState([]);
  const [students,  setStudents]  = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, cl, st, tt] = await Promise.allSettled([
        apiFetch("/profile"),
        apiFetch("/classes"),
        apiFetch("/students"),
        apiFetch("/timetable"),
      ]);
      if (p.status  === "fulfilled") setProfile(p.value);
      if (cl.status === "fulfilled") setClasses(cl.value  || []);
      if (st.status === "fulfilled") setStudents(st.value || []);
      if (tt.status === "fulfilled") setTimetable(tt.value || []);
    } catch {
      setError("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today    = new Date();
  const dayName  = DAYS[today.getDay()];
  const dateStr  = today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const todayLectures = timetable
    .filter(t => t.day?.toLowerCase() === dayName.toLowerCase())
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  // first class the teacher is class-teacher of
  const primaryClass = classes[0];
  const classStudents = students
    .filter(s => primaryClass
      ? (s.class_id === primaryClass.id || (s.class === primaryClass.grade && s.section === primaryClass.section))
      : false
    )
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 shadow-sm">
          <div className="pl-10 lg:pl-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! 👋
              </h1>
              <p className="text-sm text-gray-400">{dateStr}</p>
            </div>
            {profile && (
              <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-100">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitials(profile.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800 leading-tight">{profile.name}</p>
                  <p className="text-xs text-emerald-500">
                    {profile.teacher_type || "Teacher"}
                    {primaryClass ? ` · Class ${primaryClass.grade}-${primaryClass.section}` : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              {error}
              <button onClick={load} className="text-red-700 font-semibold hover:underline text-xs ml-4">Retry</button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={BookOpen}     label="Today's Lectures" value={loading ? "…" : todayLectures.length}   color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard icon={Users}        label="My Students"       value={loading ? "…" : students.length}         color="text-blue-600"    bg="bg-blue-50"    />
            <StatCard icon={GraduationCap}label="My Classes"        value={loading ? "…" : classes.length}          color="text-violet-600"  bg="bg-violet-50"  />
            <StatCard icon={CalendarDays} label="Day"               value={loading ? "…" : dayName.slice(0,3)}      color="text-amber-600"   bg="bg-amber-50"   />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Profile snippet */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  {profile?.profile_picture ? (
                    <img src={profile.profile_picture} alt={profile.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {getInitials(profile?.name || "")}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{profile?.name || "—"}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{profile?.teacher_type || "Teacher"}</p>
                    {primaryClass && (
                      <p className="text-xs text-gray-400 mt-0.5">Class {primaryClass.grade}-{primaryClass.section}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { icon: Mail,  val: profile?.email },
                    { icon: Phone, val: profile?.phone },
                  ].map(({ icon: I, val }, idx) => val ? (
                    <div key={idx} className="flex items-center gap-2.5">
                      <I size={14} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 truncate">{val}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            </div>

            {/* Right: today's lectures + class */}
            <div className="lg:col-span-2 space-y-5">
              {/* Today's lectures */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-sm">Today's Lectures</h2>
                  <span className="text-xs text-gray-400">{dayName}</span>
                </div>
                {loading ? (
                  <div className="p-4 space-y-2"><Skeleton /><Skeleton /></div>
                ) : todayLectures.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {todayLectures.map((lec, i) => (
                      <div key={i} className="px-5 py-3 flex items-center gap-4">
                        <div className="w-16 text-center flex-shrink-0">
                          <p className="text-xs font-bold text-emerald-600">{lec.start_time || "—"}</p>
                          {lec.end_time && <p className="text-[10px] text-gray-400">– {lec.end_time}</p>}
                        </div>
                        <div className="w-0.5 h-8 bg-emerald-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{lec.subject || "—"}</p>
                          <p className="text-xs text-gray-400">
                            Class {lec.class_name || lec.className || "—"} {lec.section ? `· Sec ${lec.section}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {lec.period && <span className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">P{lec.period}</span>}
                          {lec.room   && <span className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">Rm {lec.room}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-sm font-medium text-gray-500">No lectures today</p>
                    <p className="text-xs text-gray-400 mt-1">Enjoy your free day!</p>
                  </div>
                )}
              </div>

              {/* Class students preview */}
              {primaryClass && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 text-sm">
                      Class {primaryClass.grade}-{primaryClass.section} Students
                    </h2>
                    <span className="text-xs text-gray-400">{classStudents.length} students</span>
                  </div>
                  {loading ? (
                    <div className="p-4 space-y-2"><Skeleton /><Skeleton /><Skeleton /></div>
                  ) : classStudents.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {classStudents.slice(0, 5).map((s, i) => (
                        <div key={s.id || i} className="px-5 py-3 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                            {getInitials(s.name || "")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                            <p className="text-xs text-gray-400">Roll {s.roll_number}</p>
                          </div>
                        </div>
                      ))}
                      {classStudents.length > 5 && (
                        <div className="px-5 py-3 text-center text-xs text-emerald-600 font-semibold">
                          +{classStudents.length - 5} more students · <a href="/teacher/class" className="underline">View all</a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="text-3xl mb-2">👥</div>
                      <p className="text-sm font-medium text-gray-500">No students found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}