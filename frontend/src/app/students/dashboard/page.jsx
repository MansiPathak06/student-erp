"use client";

import { useState, useEffect, useCallback } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import StudentFeeCard from "@/components/StudentFeeCard";
import { apiFetch } from "@/lib/api";
import {
  GraduationCap, BookOpen, Users, CalendarDays,
  User, Phone, Mail, MapPin, Calendar,
} from "lucide-react";

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

export default function StudentDashboardPage() {
  const [student, setStudent]     = useState(null);
  const [teachers, setTeachers]   = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, teachersRes, timetableRes] = await Promise.allSettled([
        apiFetch("/student/profile"),
        apiFetch("/student/teachers"),
        apiFetch("/student/timetable"),
      ]);

      if (profileRes.status === "fulfilled")   setStudent(profileRes.value);
      if (teachersRes.status === "fulfilled")  setTeachers(teachersRes.value || []);
      if (timetableRes.status === "fulfilled") setTimetable(timetableRes.value || []);
    } catch (err) {
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dayName = new Date().toLocaleDateString("en-IN", { weekday: "long" });

  const todayClasses = timetable.filter(
    (t) => t.day_of_week?.toLowerCase() === dayName.toLowerCase()
  );

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
                <div className="text-left">
                  <p className="text-sm font-semibold text-violet-800 leading-tight">{student.name}</p>
                  <p className="text-xs text-violet-500"> {student.class} – {student.section} · Roll {student.roll_number}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              {error}
              <button onClick={fetchData} className="text-red-700 font-semibold hover:underline text-xs ml-4">Retry</button>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={GraduationCap} label="My Class"       value={student ? `${student.class}${student.section}` : "—"} color="bg-violet-500" />
            <StatCard icon={BookOpen}      label="Today's Classes" value={todayClasses.length}                                  color="bg-blue-500" />
            <StatCard icon={Users}         label="My Teachers"     value={teachers.length}                                      color="bg-emerald-500" />
            <StatCard icon={CalendarDays}  label="Roll Number"     value={student?.roll_number || "—"}                          color="bg-amber-500" />
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
                    <p className="text-xs text-violet-600 font-medium mt-0.5">
                      {student?.class} – Section {student?.section}
                    </p>
                    {student?.student_id && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{student.student_id}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-0">
                  <InfoRow icon={Mail}     label="Email"       value={student?.email} />
                  <InfoRow icon={Phone}    label="Phone"       value={student?.phone} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString("en-IN") : null} />
                  <InfoRow icon={User}     label="Gender"      value={student?.gender} />
                  <InfoRow icon={MapPin}   label="Address"     value={student?.address} />
                  <InfoRow icon={User}     label="Guardian"    value={student?.guardian_name} />
                  <InfoRow icon={Phone}    label="Guardian Ph" value={student?.guardian_phone} />
                </div>
              </div>
            </div>

            {/* Right column: today's schedule + teachers */}
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
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                            Room {cls.room}
                          </span>
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
                    <p className="text-xs text-gray-400 mt-1">Your class teacher will be assigned soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <StudentFeeCard studentId={user.student_id} academicYear="2024-25" />
      </main>
    </div>
  );
}