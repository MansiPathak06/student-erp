"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Search, Download, Plus, Users, BookOpen, UserCog,
  Clock, ChevronDown, Eye, Pencil, Trash2,
  MoreHorizontal, GraduationCap, TrendingUp,
  Bell,
} from "lucide-react";


// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const CLASSES_DATA = [
  {
    id: "CLS-001", name: "10-A", grade: "Grade 10",
    classTeacher: "Dr. Priya Sharma", subject: "Physics",
    students: 42, capacity: 45, schedule: "Mon–Fri, 8:00 AM",
    room: "Room 201", attendance: 94, status: "Active", color: "blue",
  },
  {
    id: "CLS-002", name: "10-B", grade: "Grade 10",
    classTeacher: "Mr. Arjun Mehta", subject: "Mathematics",
    students: 38, capacity: 45, schedule: "Mon–Fri, 9:00 AM",
    room: "Room 202", attendance: 89, status: "Active", color: "violet",
  },
  {
    id: "CLS-003", name: "11-A", grade: "Grade 11",
    classTeacher: "Ms. Kavya Nair", subject: "Chemistry",
    students: 40, capacity: 40, schedule: "Mon–Fri, 10:00 AM",
    room: "Room 301", attendance: 97, status: "Full", color: "emerald",
  },
  {
    id: "CLS-004", name: "11-B", grade: "Grade 11",
    classTeacher: "Mr. Rohan Das", subject: "Biology",
    students: 35, capacity: 45, schedule: "Mon–Fri, 11:00 AM",
    room: "Room 302", attendance: 91, status: "Active", color: "amber",
  },
  {
    id: "CLS-005", name: "12-A", grade: "Grade 12",
    classTeacher: "Dr. Sunita Rao", subject: "English",
    students: 30, capacity: 40, schedule: "Mon–Fri, 8:00 AM",
    room: "Room 401", attendance: 86, status: "Active", color: "rose",
  },
  {
    id: "CLS-006", name: "12-B", grade: "Grade 12",
    classTeacher: "Mr. Vikram Singh", subject: "History",
    students: 28, capacity: 40, schedule: "Mon–Fri, 2:00 PM",
    room: "Room 402", attendance: 78, status: "Inactive", color: "slate",
  },
];

const GRADE_FILTERS  = ["All Grades",  "Grade 10", "Grade 11", "Grade 12"];
const STATUS_FILTERS = ["All Status",  "Active",   "Full",     "Inactive"];

const AVATAR_COLORS = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700"    },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700"  },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700"   },
  rose:    { bg: "bg-rose-100",    text: "text-rose-700"    },
  slate:   { bg: "bg-slate-100",   text: "text-slate-600"   },
};


// ─────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    Active:   "bg-green-50  text-green-700  ring-green-200",
    Full:     "bg-blue-50   text-blue-700   ring-blue-200",
    Inactive: "bg-gray-100  text-gray-500   ring-gray-200",
  };
  const dots = {
    Active: "bg-green-500",
    Full:   "bg-blue-500",
    Inactive: "bg-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

function AttendanceBar({ value }) {
  const color =
    value >= 90 ? "bg-green-500" :
    value >= 80 ? "bg-amber-400" : "bg-red-400";
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
  const pct = Math.round((students / capacity) * 100);
  const color =
    pct >= 100 ? "bg-red-400" :
    pct >= 85  ? "bg-amber-400" : "bg-blue-400";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-gray-800">
        {students}
        <span className="text-gray-400 font-normal">/{capacity}</span>
      </span>
      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// CLASS SUMMARY CARD  (mirrors TeacherSummaryCard)
// ─────────────────────────────────────────────

function ClassSummaryCard({ label, value, icon: Icon, accent, bg, trend }) {
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


// ─────────────────────────────────────────────
// CLASS FILTER BAR  (mirrors TeacherFilterBar)
// ─────────────────────────────────────────────

function ClassFilterBar({ search, onSearch, grade, onGrade, status, onStatus, count }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6
                    flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

      {/* Search input */}
      <div className="relative flex-1 min-w-0">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search name, teacher, ID..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                     text-sm text-gray-800 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        {/* Grade dropdown */}
        <div className="relative">
          <select
            value={grade}
            onChange={e => onGrade(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white
                       text-sm text-gray-700 font-medium cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all"
          >
            {GRADE_FILTERS.map(g => <option key={g}>{g}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <select
            value={status}
            onChange={e => onStatus(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white
                       text-sm text-gray-700 font-medium cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all"
          >
            {STATUS_FILTERS.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <p className="text-sm text-gray-400 self-center whitespace-nowrap">{count} classes found</p>
    </div>
  );
}


// ─────────────────────────────────────────────
// CLASS CARD  (single table row — mirrors TeacherCard)
// ─────────────────────────────────────────────

function ClassCard({ cls, openMenu, onToggleMenu }) {
  const av = AVATAR_COLORS[cls.color];
  return (
    <tr className="hover:bg-blue-50/30 transition-colors group">

      {/* Class avatar + name */}
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

      {/* ID */}
      <td className="px-5 py-4">
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{cls.id}</span>
      </td>

      {/* Class Teacher */}
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

      {/* Students / capacity */}
      <td className="px-5 py-4">
        <CapacityBar students={cls.students} capacity={cls.capacity} />
      </td>

      {/* Room */}
      <td className="px-5 py-4">
        <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">{cls.room}</span>
      </td>

      {/* Schedule */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock size={12} className="text-gray-400 flex-shrink-0" />
          {cls.schedule}
        </div>
      </td>

      {/* Attendance */}
      <td className="px-5 py-4 w-36">
        <AttendanceBar value={cls.attendance} />
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={cls.status} />
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View">
            <Eye size={14} />
          </button>
          <button className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
            <Pencil size={14} />
          </button>
          <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => onToggleMenu(cls.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="More"
          >
            <MoreHorizontal size={14} />
          </button>

          {/* Dropdown */}
          {openMenu === cls.id && (
            <div className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-gray-200 shadow-xl py-1.5 min-w-[150px]">
              {["Assign Students", "View Timetable", "Export Report"].map(action => (
                <button
                  key={action}
                  onClick={() => onToggleMenu(null)}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}


// ─────────────────────────────────────────────
// CLASS TABLE  (mirrors TeacherTable)
// ─────────────────────────────────────────────

function ClassTable({ classes, openMenu, onToggleMenu }) {
  const HEADERS = ["Class", "ID", "Class Teacher", "Students", "Room", "Schedule", "Attendance", "Status", "Actions"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              {HEADERS.map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {classes.map(cls => (
              <ClassCard
                key={cls.id}
                cls={cls}
                openMenu={openMenu}
                onToggleMenu={onToggleMenu}
              />
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {classes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BookOpen size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No classes found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {classes.length > 0 && (
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-600">{classes.length}</span>{" "}
            of <span className="font-semibold text-gray-600">{CLASSES_DATA.length}</span> classes
          </p>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  p === 1
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
// CLASS UI — PAGE ENTRY POINT  (mirrors TeacherUI)
// ─────────────────────────────────────────────

export default function ClassUI() {
  const [search,   setSearch]   = useState("");
  const [grade,    setGrade]    = useState("All Grades");
  const [status,   setStatus]   = useState("All Status");
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = CLASSES_DATA.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) ||
      c.classTeacher.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    const matchGrade  = grade  === "All Grades"  || c.grade  === grade;
    const matchStatus = status === "All Status"  || c.status === status;
    return matchSearch && matchGrade && matchStatus;
  });

  const totalStudents = CLASSES_DATA.reduce((s, c) => s + c.students, 0);
  const activeClasses = CLASSES_DATA.filter(c => c.status === "Active").length;
  const fullClasses   = CLASSES_DATA.filter(c => c.status === "Full").length;
  const avgAttendance = Math.round(
    CLASSES_DATA.reduce((s, c) => s + c.attendance, 0) / CLASSES_DATA.length
  );

  const SUMMARY_CARDS = [
    { label: "Total Classes",  value: CLASSES_DATA.length, icon: BookOpen,      accent: "text-blue-600",    bg: "bg-blue-50",    trend: "↑ 2 new this term"          },
    { label: "Active Classes", value: activeClasses,        icon: GraduationCap, accent: "text-emerald-600", bg: "bg-emerald-50", trend: `${fullClasses} at capacity` },
    { label: "Total Students", value: totalStudents,        icon: Users,         accent: "text-violet-600",  bg: "bg-violet-50",  trend: "Across all classes"          },
    { label: "Avg Attendance", value: `${avgAttendance}%`,  icon: TrendingUp,    accent: "text-amber-600",   bg: "bg-amber-50",   trend: "This semester"               },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">

        {/* ── Top bar (matches dashboard) ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search classes, teachers…"
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

        {/* ── Page body ── */}
        <div className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Page heading + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Classes</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage all class records and assignments</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white
                                 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300
                                 transition-all shadow-sm">
                <Download size={15} />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700
                                 text-white text-sm font-semibold shadow-md shadow-blue-200
                                 transition-all hover:scale-[1.02] active:scale-[0.99]">
                <Plus size={15} />
                Add Class
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SUMMARY_CARDS.map(card => (
              <ClassSummaryCard key={card.label} {...card} />
            ))}
          </div>

          {/* Filter bar */}
          <ClassFilterBar
            search={search}   onSearch={setSearch}
            grade={grade}     onGrade={setGrade}
            status={status}   onStatus={setStatus}
            count={filtered.length}
          />

          {/* Table */}
          <ClassTable
            classes={filtered}
            openMenu={openMenu}
            onToggleMenu={id => setOpenMenu(prev => prev === id ? null : id)}
          />

        </div>
      </main>
    </div>
  );
}