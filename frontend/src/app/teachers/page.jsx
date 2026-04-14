"use client";

import { useState, useMemo } from "react";
import {
  Users, UserCheck, UserMinus, BookOpen, ClipboardList,
  Search, Download, Plus, X, Bell, ChevronDown,
} from "lucide-react";

import Sidebar            from "@/components/Sidebar";
import { TEACHERS }       from "./data";
import TeacherSummaryCard from "@/components/TeacherSummaryCard";
import TeacherFilterBar   from "@/components/TeacherFilterBar";
import TeacherTable       from "@/components/TeacherTable";
import TeacherCard        from "@/components/TeacherCard";

function expMatch(exp, range) {
  if (range === "Any Experience") return true;
  if (range === "0–3 yrs")  return exp <= 3;
  if (range === "4–7 yrs")  return exp >= 4 && exp <= 7;
  if (range === "8–12 yrs") return exp >= 8 && exp <= 12;
  if (range === "12+ yrs")  return exp > 12;
  return true;
}

const INIT_FILTERS = {
  department: "All Departments",
  subject:    "All Subjects",
  status:     "All Status",
  experience: "Any Experience",
};

export default function TeachersPage() {
  const [search,   setSearch]   = useState("");
  const [filters,  setFilters]  = useState(INIT_FILTERS);
  const [selected, setSelected] = useState([]);

  const total   = TEACHERS.length;
  const active  = TEACHERS.filter((t) => t.status === "Active").length;
  const onLeave = TEACHERS.filter((t) => t.status === "On Leave").length;
  const avgCls  = Math.round(TEACHERS.reduce((s, t) => s + t.classes.length, 0) / total);
  const pending = TEACHERS.reduce((s, t) => s + t.pendingTasks, 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TEACHERS.filter((t) => {
      const matchQ    = !q || t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      const matchDept = filters.department === "All Departments" || t.department === filters.department;
      const matchSubj = filters.subject    === "All Subjects"    || t.subject    === filters.subject;
      const matchStat = filters.status     === "All Status"      || t.status     === filters.status;
      const matchExp  = expMatch(t.experience, filters.experience);
      return matchQ && matchDept && matchSubj && matchStat && matchExp;
    });
  }, [search, filters]);

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = (ids) =>
    setSelected((prev) => (prev.length === ids.length ? [] : ids));

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">

        {/* Top bar — same as dashboard */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search teachers, subjects…"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
                              flex items-center justify-center text-white text-xs font-bold">
                AP
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page body */}
        <div className="flex-1 p-6 lg:p-8 space-y-5">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Teachers</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage all teacher records</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, subject, ID…"
                  className="h-10 w-full sm:w-56 pl-9 pr-8 rounded-xl border border-gray-200 bg-white
                             text-sm text-gray-700 placeholder:text-gray-400 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>
              <button className="h-10 px-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
                <Download size={14} /> Export
              </button>
              <button className="h-10 px-4 flex items-center gap-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all">
                <Plus size={15} /> Add Teacher
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <TeacherSummaryCard icon={Users}         value={total}              label="Total Teachers"  iconBg="bg-blue-50"    iconColor="text-blue-600"    trend={{ positive: true,  text: "vs last term" }} />
            <TeacherSummaryCard icon={UserCheck}     value={active}             label="Active Teachers" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <TeacherSummaryCard icon={UserMinus}     value={onLeave}            label="On Leave"        iconBg="bg-amber-50"   iconColor="text-amber-600"   />
            <TeacherSummaryCard icon={BookOpen}      value={`${avgCls} / tchr`} label="Avg Classes"     iconBg="bg-violet-50"  iconColor="text-violet-600"  />
            <TeacherSummaryCard icon={ClipboardList} value={pending}            label="Pending Tasks"   iconBg="bg-rose-50"    iconColor="text-rose-600"    trend={{ positive: false, text: "Need attention" }} />
          </div>

          {/* Filters */}
          <TeacherFilterBar filters={filters} onChange={setFilters} total={filtered.length} />

          {/* Bulk bar */}
          {selected.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-600 rounded-xl text-white text-sm shadow-lg shadow-blue-900/20">
              <span className="font-semibold">{selected.length} selected</span>
              <span className="text-blue-300">·</span>
              <button className="underline underline-offset-2 hover:text-blue-200 transition-colors">Delete</button>
              <button className="underline underline-offset-2 hover:text-blue-200 transition-colors">Export</button>
              <button onClick={() => setSelected([])} className="ml-auto text-blue-300 hover:text-white transition-colors">
                <X size={15} />
              </button>
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden md:block">
            <TeacherTable teachers={filtered} selected={selected} onSelect={toggleSelect} onSelectAll={toggleAll} />
          </div>

          {/* Mobile cards */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-gray-400">
                <p className="text-base font-medium">No teachers found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search</p>
              </div>
            ) : (
              filtered.map((t) => (
                <TeacherCard key={t.id} teacher={t} selected={selected.includes(t.id)} onSelect={toggleSelect} />
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-400 pb-2">
            <p>
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{total}</span> teachers
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-500 transition-colors">←</button>
              <button className="w-8 h-8 rounded-lg bg-blue-600 text-white font-semibold text-xs">1</button>
              <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-500 transition-colors">→</button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}