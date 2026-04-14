"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Search, Download, Plus, TrendingUp, Award, AlertTriangle,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Pencil, Trash2,
  X, BookOpen, BarChart2, FileText,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const RESULTS_DATA = [
  { id: 1,  name: "Aarav Sharma",  email: "aarav@school.in",  avatar: "AS", rollNo: "1001", class: "10", section: "A", subject: "Mathematics",  examType: "Midterm",   obtained: 88, total: 100, remarks: "Excellent performance" },
  { id: 2,  name: "Priya Mehta",   email: "priya@school.in",  avatar: "PM", rollNo: "1002", class: "8",  section: "B", subject: "Science",       examType: "Final",     obtained: 61, total: 100, remarks: "Needs improvement in lab work" },
  { id: 3,  name: "Rohan Verma",   email: "rohan@school.in",  avatar: "RV", rollNo: "1003", class: "12", section: "C", subject: "English",       examType: "Unit Test", obtained: 74, total: 100, remarks: "Good writing skills" },
  { id: 4,  name: "Sneha Gupta",   email: "sneha@school.in",  avatar: "SG", rollNo: "1004", class: "9",  section: "A", subject: "History",       examType: "Midterm",   obtained: 92, total: 100, remarks: "Outstanding" },
  { id: 5,  name: "Karan Patel",   email: "karan@school.in",  avatar: "KP", rollNo: "1005", class: "11", section: "B", subject: "Physics",       examType: "Final",     obtained: 38, total: 100, remarks: "Failed – extra coaching recommended" },
  { id: 6,  name: "Anjali Singh",  email: "anjali@school.in", avatar: "AS", rollNo: "1006", class: "10", section: "A", subject: "Chemistry",     examType: "Final",     obtained: 79, total: 100, remarks: "Consistent student" },
  { id: 7,  name: "Vikram Rao",    email: "vikram@school.in", avatar: "VR", rollNo: "1007", class: "12", section: "C", subject: "Mathematics",   examType: "Midterm",   obtained: 95, total: 100, remarks: "Top of class" },
  { id: 8,  name: "Meera Joshi",   email: "meera@school.in",  avatar: "MJ", rollNo: "1008", class: "8",  section: "B", subject: "Geography",     examType: "Unit Test", obtained: 55, total: 100, remarks: "Average" },
  { id: 9,  name: "Amit Tiwari",   email: "amit@school.in",   avatar: "AT", rollNo: "1009", class: "9",  section: "A", subject: "Biology",       examType: "Final",     obtained: 41, total: 100, remarks: "Needs serious attention" },
  { id: 10, name: "Pooja Sharma",  email: "pooja@school.in",  avatar: "PS", rollNo: "1010", class: "11", section: "B", subject: "Computer Sci.", examType: "Midterm",   obtained: 87, total: 100, remarks: "Great coding aptitude" },
  { id: 11, name: "Dev Kapoor",    email: "dev@school.in",    avatar: "DK", rollNo: "1011", class: "10", section: "A", subject: "English",       examType: "Final",     obtained: 68, total: 100, remarks: "Average" },
  { id: 12, name: "Ritu Nair",     email: "ritu@school.in",   avatar: "RN", rollNo: "1012", class: "12", section: "C", subject: "Physics",       examType: "Unit Test", obtained: 91, total: 100, remarks: "Exceptional grasp" },
];

const SUBJECT_CHART = [
  { subject: "Maths",    avg: 78 },
  { subject: "Science",  avg: 65 },
  { subject: "English",  avg: 71 },
  { subject: "History",  avg: 82 },
  { subject: "Physics",  avg: 58 },
  { subject: "Computer", avg: 88 },
];

const PROGRESS_CHART = [
  { exam: "Unit Test", score: 62 },
  { exam: "Midterm",   score: 71 },
  { exam: "Final",     score: 78 },
];

const AVATAR_COLORS = [
  "bg-blue-500","bg-purple-500","bg-green-500","bg-yellow-500",
  "bg-pink-500","bg-indigo-500","bg-red-500","bg-teal-500",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGrade(pct) {
  if (pct >= 90) return { label: "A+", color: "text-emerald-600 bg-emerald-50" };
  if (pct >= 75) return { label: "A",  color: "text-blue-600   bg-blue-50"    };
  if (pct >= 60) return { label: "B",  color: "text-indigo-600 bg-indigo-50"  };
  if (pct >= 45) return { label: "C",  color: "text-yellow-600 bg-yellow-50"  };
  return               { label: "F",  color: "text-red-600    bg-red-50"     };
}
function getStatus(pct) {
  return pct >= 40
    ? { label: "Pass", color: "text-emerald-700 bg-emerald-100" }
    : { label: "Fail", color: "text-red-700 bg-red-100" };
}
function avatarColor(i) { return AVATAR_COLORS[i % AVATAR_COLORS.length]; }

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, title, value, delta, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {delta && <p className="text-xs text-emerald-600 font-medium mt-0.5">{delta}</p>}
      </div>
    </div>
  );
}

// ─── Result Modal ─────────────────────────────────────────────────────────────
function ResultModal({ result, onClose }) {
  if (!result) return null;
  const pct    = Math.round((result.obtained / result.total) * 100);
  const grade  = getGrade(pct);
  const status = getStatus(pct);
  const components = [
    { name: "Theory",     obtained: Math.round(result.obtained * 0.6),  total: 60 },
    { name: "Practical",  obtained: Math.round(result.obtained * 0.25), total: 25 },
    { name: "Assignment", obtained: Math.round(result.obtained * 0.15), total: 15 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarColor(result.id)}`}>
              {result.avatar}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{result.name}</h2>
              <p className="text-xs text-gray-500">{result.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Roll No", value: result.rollNo },
              { label: "Class",   value: `${result.class}-${result.section}` },
              { label: "Exam",    value: result.examType },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-semibold text-gray-800 mt-0.5 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Score Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Score</p>
              <p className="text-3xl font-bold text-gray-800">
                {result.obtained}
                <span className="text-lg text-gray-400 font-normal">/{result.total}</span>
              </p>
            </div>
            <div className="text-center">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${grade.color}`}>{grade.label}</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">{pct}%</p>
            </div>
            <div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status.color}`}>{status.label}</span>
            </div>
          </div>

          {/* Component Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-500" /> Component Breakdown
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Component</th>
                  <th className="text-center pb-2 font-medium">Obtained</th>
                  <th className="text-center pb-2 font-medium">Total</th>
                  <th className="text-right pb-2 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {components.map((c) => {
                  const cp = Math.round((c.obtained / c.total) * 100);
                  return (
                    <tr key={c.name} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-700">{c.name}</td>
                      <td className="py-2.5 text-center font-semibold text-gray-800">{c.obtained}</td>
                      <td className="py-2.5 text-center text-gray-400">{c.total}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getGrade(cp).color}`}>{cp}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">Teacher Remarks</p>
            <p className="text-sm text-gray-700">{result.remarks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const [search, setSearch]         = useState("");
  const [classFilter, setClass]     = useState("All");
  const [sectionFilter, setSection] = useState("All");
  const [examFilter, setExam]       = useState("All");
  const [subjectFilter, setSubject] = useState("All");
  const [sortKey, setSortKey]       = useState("obtained");
  const [sortDir, setSortDir]       = useState("desc");
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState([]);
  const [modal, setModal]           = useState(null);
  const PER_PAGE = 8;

  const enriched = useMemo(() =>
    RESULTS_DATA.map((r) => {
      const pct = Math.round((r.obtained / r.total) * 100);
      return { ...r, pct, grade: getGrade(pct), status: getStatus(pct) };
    }),
  []);

  const filtered = useMemo(() => {
    return enriched
      .filter((r) => {
        const q = search.toLowerCase();
        return (
          (!q || r.name.toLowerCase().includes(q) || r.rollNo.includes(q) || r.class.includes(q)) &&
          (classFilter   === "All" || r.class    === classFilter) &&
          (sectionFilter === "All" || r.section  === sectionFilter) &&
          (examFilter    === "All" || r.examType === examFilter) &&
          (subjectFilter === "All" || r.subject  === subjectFilter)
        );
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (typeof a[sortKey] === "number") return dir * (a[sortKey] - b[sortKey]);
        return dir * String(a[sortKey]).localeCompare(String(b[sortKey]));
      });
  }, [search, classFilter, sectionFilter, examFilter, subjectFilter, sortKey, sortDir, enriched]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:  enriched.length,
    avgPct: Math.round(enriched.reduce((s, r) => s + r.pct, 0) / enriched.length),
    top:    enriched.filter((r) => r.pct >= 85).length,
    failed: enriched.filter((r) => r.pct < 40).length,
  };

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ k }) {
    if (sortKey !== k) return <ChevronUp size={11} className="text-gray-300" />;
    return sortDir === "asc"
      ? <ChevronUp size={11} className="text-blue-500" />
      : <ChevronDown size={11} className="text-blue-500" />;
  }

  function toggleSelect(id) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  }
  function toggleAll() {
    setSelected((s) => s.length === paginated.length ? [] : paginated.map((r) => r.id));
  }

  const classes  = ["All", ...new Set(RESULTS_DATA.map((r) => r.class))];
  const sections = ["All", ...new Set(RESULTS_DATA.map((r) => r.section))];
  const exams    = ["All", "Midterm", "Final", "Unit Test"];
  const subjects = ["All", ...new Set(RESULTS_DATA.map((r) => r.subject))];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Your existing Sidebar ── */}
      <Sidebar />

      {/* ── Main content area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Results</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage student academic performance</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search student, roll no, class…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download size={14} /> Export
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                <Plus size={14} /> Add Result
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FileText}      title="Total Results"   value={stats.total}        delta="+12 this month" iconBg="bg-blue-50"    iconColor="text-blue-600"    />
            <StatCard icon={TrendingUp}    title="Average Score"   value={`${stats.avgPct}%`} delta="↑ 3% vs last"   iconBg="bg-indigo-50"  iconColor="text-indigo-600"  />
            <StatCard icon={Award}         title="Top Performers"  value={stats.top}          delta="Score ≥ 85%"    iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard icon={AlertTriangle} title="Failed Students" value={stats.failed}       delta="Score < 40%"    iconBg="bg-red-50"     iconColor="text-red-500"     />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Class",     value: classFilter,   setter: setClass,   opts: classes  },
                { label: "Section",   value: sectionFilter, setter: setSection, opts: sections },
                { label: "Exam Type", value: examFilter,    setter: setExam,    opts: exams    },
                { label: "Subject",   value: subjectFilter, setter: setSubject, opts: subjects },
              ].map(({ label, value, setter, opts }) => (
                <div key={label}>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                  <select
                    value={value}
                    onChange={(e) => { setter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-500" />
                Results Table
                <span className="text-xs font-normal bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{filtered.length}</span>
              </h2>
              {selected.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{selected.length} selected</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <tr>
                    <th className="pl-5 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selected.length === paginated.length && paginated.length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    {[
                      { label: "Student",    key: "name"     },
                      { label: "Roll No",    key: "rollNo"   },
                      { label: "Class",      key: "class"    },
                      { label: "Subject",    key: "subject"  },
                      { label: "Marks",      key: "obtained" },
                      { label: "Percentage", key: "pct"      },
                      { label: "Grade",      key: null       },
                      { label: "Status",     key: null       },
                      { label: "Actions",    key: null       },
                    ].map(({ label, key }) => (
                      <th
                        key={label}
                        onClick={() => key && toggleSort(key)}
                        className={`px-4 py-3 text-left whitespace-nowrap ${key ? "cursor-pointer hover:text-gray-600 select-none" : ""}`}
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          {key && <SortIcon k={key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-16 text-gray-400">
                        <FileText size={32} className="mx-auto mb-2 text-gray-200" />
                        No results found.
                      </td>
                    </tr>
                  )}
                  {paginated.map((r, i) => (
                    <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="pl-5 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="rounded border-gray-300"
                        />
                      </td>

                      {/* Student */}
                      <td className="px-4 py-3 min-w-[180px]">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(i)}`}>
                            {r.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 leading-tight">{r.name}</p>
                            <p className="text-xs text-gray-400">{r.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-600">{r.rollNo}</td>
                      <td className="px-4 py-3 text-gray-600">{r.class}-{r.section}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{r.subject}</td>

                      {/* Marks */}
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {r.obtained}<span className="text-gray-300 font-normal">/{r.total}</span>
                      </td>

                      {/* Progress bar */}
                      <td className="px-4 py-3 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${r.pct >= 75 ? "bg-emerald-400" : r.pct >= 40 ? "bg-blue-400" : "bg-red-400"}`}
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-9 text-right">{r.pct}%</span>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.grade.color}`}>
                          {r.grade.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status.color}`}>
                          {r.status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModal(r)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500 transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-yellow-100 rounded-lg text-yellow-500 transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-red-100 rounded-lg text-red-400 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
                <span>
                  Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-0.5">Subject-wise Performance</h3>
              <p className="text-xs text-gray-400 mb-4">Average score per subject</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={SUBJECT_CHART} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }} cursor={{ fill: "#eff6ff" }} />
                  <Bar dataKey="avg" name="Avg Score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-0.5">Student Progress Over Exams</h3>
              <p className="text-xs text-gray-400 mb-4">Average class score by exam type</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={PROGRESS_CHART}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="exam" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="score" name="Class Average" stroke="#6366f1" strokeWidth={2.5}
                    dot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {modal && <ResultModal result={modal} onClose={() => setModal(null)} />}
    </div>
  );
}