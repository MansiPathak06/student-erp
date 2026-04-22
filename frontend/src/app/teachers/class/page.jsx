"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import { Search, Users, Phone, Mail, Hash } from "lucide-react";
import TeacherHomeworkForm from "@/components/TeacherHomeworkForm";

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

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-6" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-gray-100 rounded animate-pulse w-32" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
          </div>
        </div>
      </td>
      {[...Array(4)].map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-3.5 bg-gray-100 rounded animate-pulse w-20" /></td>
      ))}
    </tr>
  );
}

function StudentRow({ student, index }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors">
      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{index + 1}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${avatarColor(student.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {getInitials(student.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
            <p className="text-xs text-gray-400">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-gray-500">{student.roll_number || "—"}</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{student.gender || "—"}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{student.phone || "—"}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{student.guardian_name || "—"}</td>
    </tr>
  );
}

function StudentCard({ student, index }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${avatarColor(student.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {getInitials(student.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate">{student.name}</p>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono flex-shrink-0">#{index + 1}</span>
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{student.email}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-gray-500">
        <span>Roll: <span className="font-semibold text-gray-700">{student.roll_number || "—"}</span></span>
        <span>Gender: <span className="font-semibold text-gray-700">{student.gender || "—"}</span></span>
        {student.phone && (
          <span className="col-span-2">Ph: <span className="font-semibold text-gray-700">{student.phone}</span></span>
        )}
        {student.guardian_name && (
          <span className="col-span-2">Guardian: <span className="font-semibold text-gray-700">{student.guardian_name}</span></span>
        )}
      </div>
    </div>
  );
}

export default function TeacherClassPage() {
  const [classes,  setClasses]  = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  // If teacher has multiple classes, allow switching
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
      setError("Could not load class data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeClass = classes[activeClassIdx] || null;

  // Filter students for active class, sort alphabetically
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
    const q = search.toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.roll_number?.toString().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  }, [classStudents, search]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 shadow-sm">
          <div className="pl-10 lg:pl-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Class</h1>
              <p className="text-sm text-gray-400">Students in your class — alphabetical order</p>
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

          {/* Class selector (if multiple) */}
          {classes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {classes.map((cls, i) => (
                <button
                  key={cls.id || i}
                  onClick={() => { setActiveClassIdx(i); setSearch(""); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    i === activeClassIdx
                      ? "bg-emerald-500 text-white border-transparent shadow-md"
                      : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  Class {cls.grade || cls.class_name}-{cls.section}
                </button>
              ))}
            </div>
          )}

          {/* Class info banner */}
          {activeClass && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Users size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900">
                  Class {activeClass.grade || activeClass.class_name} – Section {activeClass.section}
                </h2>
                {activeClass.room_no && (
                  <p className="text-xs text-gray-400 mt-0.5">Room: {activeClass.room_no}</p>
                )}
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2 border border-emerald-100">
                <Users size={16} />
                <span className="text-sm font-bold">{classStudents.length}</span>
                <span className="text-xs">students</span>
              </div>
            </div>
          )}

          {/* Desktop table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <tbody>{[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}</tbody>
              </table>
            </div>
          ) : !activeClass ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
              <div className="text-5xl mb-3">🏫</div>
              <p className="text-sm font-semibold text-gray-500">No class assigned to you yet</p>
              <p className="text-xs text-gray-400 mt-1">Contact admin to get assigned to a class</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["#", "Student", "Roll No.", "Gender", "Phone", "Guardian"].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((s, i) => <StudentRow key={s.id || i} student={s} index={i} />)
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <div className="text-3xl mb-2">🔍</div>
                          <p className="text-sm font-medium text-gray-500">
                            {search ? "No students match your search" : "No students in this class yet"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden">
                {filtered.length > 0 ? (
                  <div className="space-y-3">
                    {filtered.map((s, i) => <StudentCard key={s.id || i} student={s} index={i} />)}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-sm font-medium text-gray-500">
                      {search ? "No students match your search" : "No students in this class yet"}
                    </p>
                  </div>
                )}
              </div>

              {!search && (
                <p className="text-xs text-gray-400 text-center">
                  Showing {filtered.length} student{filtered.length !== 1 ? "s" : ""} in alphabetical order
                </p>
              )}
            </>
          )}
        </div>
        <TeacherHomeworkForm />
      </main>
    </div>
  );
}