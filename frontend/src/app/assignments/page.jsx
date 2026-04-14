"use client";

import { useState, useMemo, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Search, Download, Plus, Clock, CheckCircle2, AlertCircle, FileText,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Pencil, Trash2, X, Paperclip, Upload, CalendarDays,
  BookOpen, Users, Filter, ClipboardList,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const ASSIGNMENTS_DATA = [
  {
    id: 1, title: "Quadratic Equations", description: "Solve the given set of quadratic equations using factorisation and formula methods. Show all working steps clearly.",
    subject: "Mathematics", class: "10", section: "A", assignedDate: "2025-04-01", dueDate: "2025-04-10",
    submitted: 24, total: 30, status: "Submitted", attachments: ["worksheet.pdf"],
    students: [
      { name: "Aarav Sharma",  status: "Submitted", file: "aarav_math.pdf",  marks: 18 },
      { name: "Priya Mehta",   status: "Submitted", file: "priya_math.pdf",  marks: 16 },
      { name: "Rohan Verma",   status: "Pending",   file: null,              marks: null },
      { name: "Sneha Gupta",   status: "Submitted", file: "sneha_math.pdf",  marks: 20 },
      { name: "Karan Patel",   status: "Pending",   file: null,              marks: null },
    ],
  },
  {
    id: 2, title: "Photosynthesis Lab Report", description: "Write a detailed lab report on the experiment conducted to study the rate of photosynthesis under different light intensities.",
    subject: "Biology", class: "11", section: "B", assignedDate: "2025-04-03", dueDate: "2025-04-08",
    submitted: 10, total: 28, status: "Overdue", attachments: ["lab_template.docx", "rubric.pdf"],
    students: [
      { name: "Meera Joshi",   status: "Submitted", file: "meera_bio.pdf",   marks: 22 },
      { name: "Amit Tiwari",   status: "Overdue",   file: null,              marks: null },
      { name: "Pooja Sharma",  status: "Submitted", file: "pooja_bio.pdf",   marks: 19 },
      { name: "Dev Kapoor",    status: "Overdue",   file: null,              marks: null },
    ],
  },
  {
    id: 3, title: "Essay: Importance of Democracy", description: "Write a 500-word essay on the importance of democracy in modern society, citing historical examples.",
    subject: "English", class: "9", section: "A", assignedDate: "2025-04-05", dueDate: "2025-04-15",
    submitted: 18, total: 32, status: "Pending", attachments: [],
    students: [
      { name: "Ritu Nair",     status: "Submitted", file: "ritu_eng.pdf",    marks: 17 },
      { name: "Vikram Rao",    status: "Pending",   file: null,              marks: null },
      { name: "Anjali Singh",  status: "Submitted", file: "anjali_eng.pdf",  marks: 15 },
    ],
  },
  {
    id: 4, title: "Newton's Laws Problems", description: "Solve 20 numericals based on Newton's three laws of motion. Show diagrams where applicable.",
    subject: "Physics", class: "12", section: "C", assignedDate: "2025-04-02", dueDate: "2025-04-09",
    submitted: 30, total: 30, status: "Submitted", attachments: ["problems.pdf"],
    students: [
      { name: "Aarav Sharma",  status: "Submitted", file: "aarav_phy.pdf",   marks: 20 },
      { name: "Priya Mehta",   status: "Submitted", file: "priya_phy.pdf",   marks: 18 },
    ],
  },
  {
    id: 5, title: "Map Activity: Rivers of India", description: "Mark all major rivers of India on the outline map provided. Label their origin and mouth.",
    subject: "Geography", class: "8", section: "B", assignedDate: "2025-03-28", dueDate: "2025-04-04",
    submitted: 8, total: 25, status: "Overdue", attachments: ["outline_map.pdf"],
    students: [
      { name: "Dev Kapoor",    status: "Overdue",   file: null,              marks: null },
      { name: "Meera Joshi",   status: "Submitted", file: "meera_geo.pdf",   marks: 12 },
    ],
  },
  {
    id: 6, title: "Python: Loops & Functions", description: "Complete 10 coding exercises on loops and function definitions using Python 3. Upload .py files.",
    subject: "Computer Sci.", class: "11", section: "A", assignedDate: "2025-04-06", dueDate: "2025-04-18",
    submitted: 5, total: 27, status: "Pending", attachments: ["exercises.pdf"],
    students: [
      { name: "Pooja Sharma",  status: "Submitted", file: "pooja_py.zip",    marks: 25 },
      { name: "Vikram Rao",    status: "Pending",   file: null,              marks: null },
    ],
  },
  {
    id: 7, title: "Mughal Empire Timeline", description: "Create a detailed illustrated timeline of the Mughal Empire from Babur to Aurangzeb.",
    subject: "History", class: "9", section: "B", assignedDate: "2025-04-04", dueDate: "2025-04-14",
    submitted: 20, total: 30, status: "Pending", attachments: [],
    students: [
      { name: "Sneha Gupta",   status: "Submitted", file: "sneha_hist.pdf",  marks: 18 },
      { name: "Karan Patel",   status: "Pending",   file: null,              marks: null },
    ],
  },
  {
    id: 8, title: "Organic Chemistry: Reactions", description: "Write balanced equations for 15 organic reactions including substitution and addition reactions.",
    subject: "Chemistry", class: "12", section: "C", assignedDate: "2025-04-07", dueDate: "2025-04-16",
    submitted: 0, total: 29, status: "Pending", attachments: ["reference.pdf"],
    students: [
      { name: "Ritu Nair",     status: "Pending",   file: null,              marks: null },
      { name: "Anjali Singh",  status: "Pending",   file: null,              marks: null },
    ],
  },
];

const SUBJECTS  = ["Mathematics","Biology","English","Physics","Geography","Computer Sci.","History","Chemistry"];
const CLASSES   = ["8","9","10","11","12"];
const SECTIONS  = ["A","B","C"];
const STATUSES  = ["Pending","Submitted","Overdue"];

const PIE_DATA = [
  { name: "Submitted", value: 115, color: "#22c55e" },
  { name: "Pending",   value: 68,  color: "#f59e0b" },
  { name: "Overdue",   value: 20,  color: "#ef4444" },
];
const BAR_DATA = [
  { subject: "Maths",    onTime: 22, late: 2  },
  { subject: "Biology",  onTime: 9,  late: 5  },
  { subject: "English",  onTime: 16, late: 4  },
  { subject: "Physics",  onTime: 28, late: 2  },
  { subject: "Computer", onTime: 4,  late: 1  },
];

const AVATAR_COLORS = ["bg-blue-500","bg-purple-500","bg-green-500","bg-yellow-500","bg-pink-500","bg-indigo-500","bg-teal-500","bg-red-500"];
function avatarColor(i) { return AVATAR_COLORS[i % AVATAR_COLORS.length]; }

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Submitted: { icon: CheckCircle2, bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pending:   { icon: Clock,        bg: "bg-yellow-100",  text: "text-yellow-700",  dot: "bg-yellow-500"  },
  Overdue:   { icon: AlertCircle,  bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.Pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, title, value, sub, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ a, onClose }) {
  if (!a) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{a.title}</h2>
            <p className="text-xs text-gray-500 mt-1">{a.subject} · Class {a.class}-{a.section}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors ml-4 flex-shrink-0">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{a.description}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Assigned", value: a.assignedDate },
              { label: "Due Date", value: a.dueDate },
              { label: "Submissions", value: `${a.submitted}/${a.total}` },
              { label: "Status", value: a.status },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-semibold text-gray-800 mt-0.5 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Attachments */}
          {a.attachments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {a.attachments.map(f => (
                  <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                    <Paperclip size={11} /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Students */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
              <Users size={13} /> Student Submissions
            </p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Student</th>
                    <th className="px-4 py-2.5 text-left">Status</th>
                    <th className="px-4 py-2.5 text-left">File</th>
                    <th className="px-4 py-2.5 text-right">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {a.students.map((s, i) => (
                    <tr key={s.name} className="hover:bg-gray-50/60">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor(i)}`}>
                            {s.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                          </div>
                          <span className="font-medium text-gray-700">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-2.5 text-xs text-blue-600">
                        {s.file ? <span className="flex items-center gap-1"><Paperclip size={10}/>{s.file}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                        {s.marks !== null ? s.marks : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({ onClose }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", subject: "", class: "", section: "",
    assignedDate: "", dueDate: "",
  });

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }
  function handleFile(e) { setFiles(prev => [...prev, ...Array.from(e.target.files)]); }
  function removeFile(i) { setFiles(prev => prev.filter((_, idx) => idx !== i)); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Create Assignment</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Assignment Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="e.g. Quadratic Equations Worksheet"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              rows={3} placeholder="Describe the assignment in detail…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </div>

          {/* Row: Subject + Class + Section */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Subject *", key: "subject", opts: ["", ...SUBJECTS] },
              { label: "Class *",   key: "class",   opts: ["", ...CLASSES]  },
              { label: "Section",   key: "section", opts: ["", ...SECTIONS] },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                <select value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  {opts.map(o => <option key={o} value={o}>{o || "Select"}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Assigned Date *", key: "assignedDate" },
              { label: "Due Date *",      key: "dueDate"      },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                <input type="date" value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            ))}
          </div>

          {/* File Upload */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Attachments</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"}`}
            >
              <Upload size={20} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Drag & drop files here, or <span className="text-blue-600 font-medium">browse</span></p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, ZIP up to 20MB</p>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFile} />
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-100">
                    <Paperclip size={10} /> {f.name}
                    <button onClick={() => removeFile(i)} className="ml-1 hover:text-red-500"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
              Create Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssignmentsPage() {
  const [search, setSearch]         = useState("");
  const [classFilter, setClass]     = useState("All");
  const [sectionFilter, setSection] = useState("All");
  const [subjectFilter, setSubject] = useState("All");
  const [statusFilter, setStatus]   = useState("All");
  const [sortKey, setSortKey]       = useState("dueDate");
  const [sortDir, setSortDir]       = useState("asc");
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState([]);
  const [viewModal, setViewModal]   = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const PER_PAGE = 6;

  const filtered = useMemo(() => {
    return ASSIGNMENTS_DATA
      .filter(a => {
        const q = search.toLowerCase();
        return (
          (!q || a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q) || a.class.includes(q)) &&
          (classFilter   === "All" || a.class   === classFilter)   &&
          (sectionFilter === "All" || a.section === sectionFilter) &&
          (subjectFilter === "All" || a.subject === subjectFilter) &&
          (statusFilter  === "All" || a.status  === statusFilter)
        );
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "submissions") return dir * ((a.submitted / a.total) - (b.submitted / b.total));
        return dir * String(a[sortKey]).localeCompare(String(b[sortKey]));
      });
  }, [search, classFilter, sectionFilter, subjectFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:     ASSIGNMENTS_DATA.length,
    pending:   ASSIGNMENTS_DATA.filter(a => a.status === "Pending").length,
    submitted: ASSIGNMENTS_DATA.filter(a => a.status === "Submitted").length,
    overdue:   ASSIGNMENTS_DATA.filter(a => a.status === "Overdue").length,
  };

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }
  function SortIcon({ k }) {
    if (sortKey !== k) return <ChevronUp size={11} className="text-gray-300" />;
    return sortDir === "asc" ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />;
  }
  function toggleSelect(id) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleAll() { setSelected(s => s.length === paginated.length ? [] : paginated.map(a => a.id)); }

  const classes  = ["All", ...new Set(ASSIGNMENTS_DATA.map(a => a.class))];
  const sections = ["All", ...SECTIONS];
  const subjects = ["All", ...new Set(ASSIGNMENTS_DATA.map(a => a.subject))];
  const statuses = ["All", ...STATUSES];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and track student assignments</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search title, subject, class…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download size={14} /> Export
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
              >
                <Plus size={14} /> Create Assignment
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={ClipboardList} title="Total Assignments"    value={stats.total}     sub="All classes"        iconBg="bg-blue-50"    iconColor="text-blue-600"    />
            <StatCard icon={Clock}         title="Pending Submissions"  value={stats.pending}   sub="Awaiting response"  iconBg="bg-yellow-50"  iconColor="text-yellow-600"  />
            <StatCard icon={CheckCircle2}  title="Submitted"            value={stats.submitted} sub="Fully collected"    iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard icon={AlertCircle}   title="Overdue"              value={stats.overdue}   sub="Past due date"      iconBg="bg-red-50"     iconColor="text-red-500"     />
          </div>

          {/* ── Filters ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Class",   value: classFilter,   setter: setClass,   opts: classes  },
                { label: "Section", value: sectionFilter, setter: setSection, opts: sections },
                { label: "Subject", value: subjectFilter, setter: setSubject, opts: subjects },
                { label: "Status",  value: statusFilter,  setter: setStatus,  opts: statuses },
              ].map(({ label, value, setter, opts }) => (
                <div key={label}>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                  <select
                    value={value}
                    onChange={e => { setter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-500" />
                Assignments
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
                      <input type="checkbox"
                        checked={selected.length === paginated.length && paginated.length > 0}
                        onChange={toggleAll} className="rounded border-gray-300" />
                    </th>
                    {[
                      { label: "Assignment",   key: "title"       },
                      { label: "Subject",      key: "subject"     },
                      { label: "Class",        key: "class"       },
                      { label: "Assigned",     key: "assignedDate"},
                      { label: "Due Date",     key: "dueDate"     },
                      { label: "Submissions",  key: "submissions" },
                      { label: "Status",       key: null          },
                      { label: "Files",        key: null          },
                      { label: "Actions",      key: null          },
                    ].map(({ label, key }) => (
                      <th key={label}
                        onClick={() => key && toggleSort(key)}
                        className={`px-4 py-3 text-left whitespace-nowrap ${key ? "cursor-pointer hover:text-gray-600 select-none" : ""}`}
                      >
                        <span className="flex items-center gap-1">{label}{key && <SortIcon k={key} />}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-16 text-gray-400">
                      <ClipboardList size={32} className="mx-auto mb-2 text-gray-200" />
                      No assignments found.
                    </td></tr>
                  )}
                  {paginated.map((a, i) => {
                    const pct = Math.round((a.submitted / a.total) * 100);
                    return (
                      <tr key={a.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="pl-5 py-3">
                          <input type="checkbox" checked={selected.includes(a.id)}
                            onChange={() => toggleSelect(a.id)} className="rounded border-gray-300" />
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3 min-w-[200px]">
                          <p className="font-medium text-gray-800 leading-tight">{a.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[180px]">{a.description}</p>
                        </td>

                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.subject}</td>
                        <td className="px-4 py-3 text-gray-600">{a.class}-{a.section}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          <span className="flex items-center gap-1"><CalendarDays size={12} className="text-gray-300"/>{a.assignedDate}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`flex items-center gap-1 font-medium ${a.status === "Overdue" ? "text-red-600" : "text-gray-700"}`}>
                            <CalendarDays size={12} className={a.status === "Overdue" ? "text-red-400" : "text-gray-300"}/>{a.dueDate}
                          </span>
                        </td>

                        {/* Submissions */}
                        <td className="px-4 py-3 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct === 100 ? "bg-emerald-400" : pct >= 60 ? "bg-blue-400" : "bg-yellow-400"}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-600 whitespace-nowrap">{a.submitted}/{a.total}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>

                        {/* Files */}
                        <td className="px-4 py-3">
                          {a.attachments.length > 0 ? (
                            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                              <Paperclip size={11} />{a.attachments.length}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewModal(a)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500 transition-colors" title="View">
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
                    );
                  })}
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
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Analytics ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-0.5">Submission Rate</h3>
              <p className="text-xs text-gray-400 mb-2">Overall assignment status breakdown</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                      paddingAngle={3} dataKey="value">
                      {PIE_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5 flex-1">
                  {PIE_DATA.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-gray-600">{d.name}</span>
                      </span>
                      <span className="font-semibold text-gray-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-0.5">On-time vs Late Submissions</h3>
              <p className="text-xs text-gray-400 mb-4">Per subject breakdown</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={BAR_DATA} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="onTime" name="On Time" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late"   name="Late"    fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {viewModal  && <ViewModal   a={viewModal} onClose={() => setViewModal(null)} />}
      {createOpen && <CreateModal              onClose={() => setCreateOpen(false)} />}
    </div>
  );
}