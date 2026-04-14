"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Search,
  Download,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  CreditCard,
  Smartphone,
  Banknote,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Bus,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const STUDENTS_DATA = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav.sharma@school.in",
    avatar: "AS",
    rollNo: "10A-01",
    class: "10",
    section: "A",
    totalFees: 45000,
    paidAmount: 45000,
    dueDate: "2025-03-31",
    status: "Paid",
    method: "Online",
    history: [
      { date: "2025-01-10", amount: 22500, method: "Online" },
      { date: "2025-02-15", amount: 22500, method: "Online" },
    ],
    breakdown: { tuition: 30000, transport: 8000, library: 2000, other: 5000 },
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya.verma@school.in",
    avatar: "PV",
    rollNo: "10A-02",
    class: "10",
    section: "A",
    totalFees: 45000,
    paidAmount: 22500,
    dueDate: "2025-04-15",
    status: "Pending",
    method: "Cash",
    history: [{ date: "2025-01-12", amount: 22500, method: "Cash" }],
    breakdown: { tuition: 30000, transport: 8000, library: 2000, other: 5000 },
  },
  {
    id: 3,
    name: "Rohit Gupta",
    email: "rohit.gupta@school.in",
    avatar: "RG",
    rollNo: "9B-05",
    class: "9",
    section: "B",
    totalFees: 42000,
    paidAmount: 0,
    dueDate: "2025-02-28",
    status: "Overdue",
    method: "—",
    history: [],
    breakdown: { tuition: 28000, transport: 8000, library: 2000, other: 4000 },
  },
  {
    id: 4,
    name: "Sneha Patel",
    email: "sneha.patel@school.in",
    avatar: "SP",
    rollNo: "8C-11",
    class: "8",
    section: "C",
    totalFees: 38000,
    paidAmount: 38000,
    dueDate: "2025-03-31",
    status: "Paid",
    method: "UPI",
    history: [
      { date: "2025-01-05", amount: 19000, method: "UPI" },
      { date: "2025-02-05", amount: 19000, method: "UPI" },
    ],
    breakdown: { tuition: 25000, transport: 8000, library: 2000, other: 3000 },
  },
  {
    id: 5,
    name: "Arjun Mehta",
    email: "arjun.mehta@school.in",
    avatar: "AM",
    rollNo: "7A-03",
    class: "7",
    section: "A",
    totalFees: 35000,
    paidAmount: 10000,
    dueDate: "2025-03-10",
    status: "Overdue",
    method: "Cash",
    history: [{ date: "2025-01-20", amount: 10000, method: "Cash" }],
    breakdown: { tuition: 23000, transport: 7000, library: 2000, other: 3000 },
  },
  {
    id: 6,
    name: "Kavya Nair",
    email: "kavya.nair@school.in",
    avatar: "KN",
    rollNo: "11B-07",
    class: "11",
    section: "B",
    totalFees: 50000,
    paidAmount: 50000,
    dueDate: "2025-03-31",
    status: "Paid",
    method: "Online",
    history: [
      { date: "2025-01-08", amount: 25000, method: "Online" },
      { date: "2025-02-08", amount: 25000, method: "Online" },
    ],
    breakdown: { tuition: 33000, transport: 9000, library: 3000, other: 5000 },
  },
  {
    id: 7,
    name: "Vikram Singh",
    email: "vikram.singh@school.in",
    avatar: "VS",
    rollNo: "12A-02",
    class: "12",
    section: "A",
    totalFees: 55000,
    paidAmount: 27500,
    dueDate: "2025-04-20",
    status: "Pending",
    method: "UPI",
    history: [{ date: "2025-02-01", amount: 27500, method: "UPI" }],
    breakdown: { tuition: 36000, transport: 10000, library: 3000, other: 6000 },
  },
  {
    id: 8,
    name: "Meera Joshi",
    email: "meera.joshi@school.in",
    avatar: "MJ",
    rollNo: "6C-14",
    class: "6",
    section: "C",
    totalFees: 32000,
    paidAmount: 32000,
    dueDate: "2025-03-31",
    status: "Paid",
    method: "Cash",
    history: [
      { date: "2025-01-15", amount: 16000, method: "Cash" },
      { date: "2025-02-20", amount: 16000, method: "Cash" },
    ],
    breakdown: { tuition: 21000, transport: 7000, library: 1500, other: 2500 },
  },
];

const BAR_DATA = [
  { month: "Oct", collected: 280000, pending: 120000 },
  { month: "Nov", collected: 320000, pending: 95000 },
  { month: "Dec", collected: 190000, pending: 145000 },
  { month: "Jan", collected: 410000, pending: 80000 },
  { month: "Feb", collected: 375000, pending: 100000 },
  { month: "Mar", collected: 290000, pending: 130000 },
];

const PIE_DATA = [
  { name: "Paid", value: 165000, color: "#22c55e" },
  { name: "Pending", value: 55000, color: "#eab308" },
  { name: "Overdue", value: 42000, color: "#ef4444" },
];

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-rose-500",
  "bg-orange-500", "bg-teal-500", "bg-indigo-500", "bg-pink-500",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const StatusBadge = ({ status }) => {
  const cfg = {
    Paid: { cls: "bg-green-100 text-green-700 border border-green-200", icon: <CheckCircle2 size={12} /> },
    Pending: { cls: "bg-yellow-100 text-yellow-700 border border-yellow-200", icon: <Clock size={12} /> },
    Overdue: { cls: "bg-red-100 text-red-700 border border-red-200", icon: <AlertTriangle size={12} /> },
  }[status] || {};
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  );
};

const MethodIcon = ({ method }) => {
  if (method === "Cash") return <span className="inline-flex items-center gap-1 text-xs text-slate-600"><Banknote size={13} /> Cash</span>;
  if (method === "UPI") return <span className="inline-flex items-center gap-1 text-xs text-slate-600"><Smartphone size={13} /> UPI</span>;
  if (method === "Online") return <span className="inline-flex items-center gap-1 text-xs text-slate-600"><CreditCard size={13} /> Online</span>;
  return <span className="text-xs text-slate-400">—</span>;
};

// ─── Modals ───────────────────────────────────────────────────────────────────

function ViewModal({ student, onClose }) {
  if (!student) return null;
  const due = student.totalFees - student.paidAmount;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Fee Details</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          {/* Student Info */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm ${AVATAR_COLORS[student.id % AVATAR_COLORS.length]}`}>
              {student.avatar}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{student.name}</p>
              <p className="text-xs text-slate-500">{student.email}</p>
              <p className="text-xs text-slate-500">Roll: {student.rollNo} · Class {student.class}-{student.section}</p>
            </div>
            <div className="ml-auto"><StatusBadge status={student.status} /></div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Fee Breakdown</p>
            {[
              { label: "Tuition Fee", icon: <GraduationCap size={14} />, val: student.breakdown.tuition },
              { label: "Transport Fee", icon: <Bus size={14} />, val: student.breakdown.transport },
              { label: "Library Fee", icon: <BookOpen size={14} />, val: student.breakdown.library },
              { label: "Other Charges", icon: <MoreHorizontal size={14} />, val: student.breakdown.other },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">{r.icon}{r.label}</span>
                <span className="font-medium text-slate-800">₹{fmt(r.val)}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Total Fees</span><span className="font-bold text-slate-800">₹{fmt(student.totalFees)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-green-600">Paid Amount</span><span className="font-bold text-green-700">₹{fmt(student.paidAmount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-red-600">Due Amount</span><span className="font-bold text-red-700">₹{fmt(due)}</span></div>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Payment History</p>
            {student.history.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No payments recorded</p>
            ) : (
              <div className="space-y-2">
                {student.history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">₹{fmt(h.amount)}</p>
                      <p className="text-xs text-slate-400">{h.date}</p>
                    </div>
                    <MethodIcon method={h.method} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddFeeModal({ onClose, editStudent }) {
  const [form, setForm] = useState(
    editStudent
      ? { student: editStudent.name, class: editStudent.class, feeType: "Tuition", total: editStudent.totalFees, paid: editStudent.paidAmount, method: editStudent.method, paymentDate: "", dueDate: editStudent.dueDate }
      : { student: "", class: "", feeType: "Tuition", total: "", paid: "", method: "Cash", paymentDate: "", dueDate: "" }
  );
  const due = (parseFloat(form.total) || 0) - (parseFloat(form.paid) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{editStudent ? "Edit Fee Record" : "Add Fee Record"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Student", field: "student", type: "select", options: STUDENTS_DATA.map(s => s.name) },
            { label: "Class", field: "class", type: "select", options: ["6","7","8","9","10","11","12"] },
            { label: "Fee Structure", field: "feeType", type: "select", options: ["Tuition","Transport","Library","Other"] },
          ].map(({ label, field, type, options }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
              <select
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select {label}</option>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {[
            { label: "Total Amount (₹)", field: "total", placeholder: "e.g. 45000" },
            { label: "Paid Amount (₹)", field: "paid", placeholder: "e.g. 22500" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
              <input
                type="number"
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          {/* Auto Due */}
          <div className="bg-slate-50 rounded-lg px-3 py-2.5 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Due Amount (Auto)</span>
            <span className="text-sm font-bold text-red-600">₹{fmt(due < 0 ? 0 : due)}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
            <div className="flex gap-2">
              {["Cash","UPI","Online"].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, method: m }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.method === m ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {[
            { label: "Payment Date", field: "paymentDate" },
            { label: "Due Date", field: "dueDate" },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
              <input
                type="date"
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">Save Record</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FeesPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [viewStudent, setViewStudent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const PER_PAGE = 5;

  // Stats
  const totalCollected = STUDENTS_DATA.reduce((a, s) => a + s.paidAmount, 0);
  const totalPending = STUDENTS_DATA.reduce((a, s) => a + (s.totalFees - s.paidAmount), 0);
  const paidCount = STUDENTS_DATA.filter(s => s.status === "Paid").length;
  const defaulterCount = STUDENTS_DATA.filter(s => s.status === "Overdue").length;

  // Filter + sort
  const filtered = useMemo(() => {
    let data = STUDENTS_DATA.filter(s => {
      const q = search.toLowerCase();
      if (q && !s.name.toLowerCase().includes(q) && !s.rollNo.toLowerCase().includes(q) && !s.class.includes(q)) return false;
      if (classFilter && s.class !== classFilter) return false;
      if (sectionFilter && s.section !== sectionFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      return true;
    });
    if (sortField) {
      data = [...data].sort((a, b) => {
        const va = a[sortField], vb = b[sortField];
        return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
    }
    return data;
  }, [search, classFilter, sectionFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(s => s.id));

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp size={10} className={sortField === field && sortDir === "asc" ? "text-blue-600" : "text-slate-300"} />
      <ChevronDown size={10} className={sortField === field && sortDir === "desc" ? "text-blue-600" : "text-slate-300"} />
    </span>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fees</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage student fees and payments</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search student, roll no, class…"
                  className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 shadow-sm text-slate-700 transition-colors">
                <Download size={15} /> Export
              </button>
              <button
                onClick={() => { setEditStudent(null); setShowAdd(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Plus size={15} /> Add Fee Record
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Collected", value: `₹${fmt(totalCollected)}`, icon: <IndianRupee size={20} />, bg: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-600", trend: "+12%", up: true },
              { label: "Pending Fees", value: `₹${fmt(totalPending)}`, icon: <Clock size={20} />, bg: "bg-yellow-50", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", trend: "-5%", up: false },
              { label: "Paid Students", value: paidCount, icon: <CheckCircle2 size={20} />, bg: "bg-green-50", iconBg: "bg-green-100", iconColor: "text-green-600", trend: "+8%", up: true },
              { label: "Defaulters", value: defaulterCount, icon: <AlertTriangle size={20} />, bg: "bg-red-50", iconBg: "bg-red-100", iconColor: "text-red-600", trend: "-2", up: false },
            ].map((c) => (
              <div key={c.label} className={`${c.bg} rounded-2xl p-4 border border-white shadow-sm`}>
                <div className="flex items-start justify-between">
                  <div className={`${c.iconBg} ${c.iconColor} w-10 h-10 rounded-xl flex items-center justify-center`}>
                    {c.icon}
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${c.up ? "text-green-600" : "text-red-500"}`}>
                    {c.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {c.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-3">{c.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter size={15} className="text-slate-400" />
              {[
                { label: "All Classes", value: classFilter, onChange: v => { setClassFilter(v); setPage(1); }, options: [{ v: "", l: "All Classes" }, ...["6","7","8","9","10","11","12"].map(c => ({ v: c, l: `Class ${c}` }))] },
                { label: "All Sections", value: sectionFilter, onChange: v => { setSectionFilter(v); setPage(1); }, options: [{ v: "", l: "All Sections" }, ...["A","B","C","D"].map(s => ({ v: s, l: `Section ${s}` }))] },
                { label: "All Status", value: statusFilter, onChange: v => { setStatusFilter(v); setPage(1); }, options: [{ v: "", l: "All Status" }, ...["Paid","Pending","Overdue"].map(s => ({ v: s, l: s }))] },
                { label: "All Terms", value: monthFilter, onChange: v => setMonthFilter(v), options: [{ v: "", l: "All Terms" }, ...["Term 1","Term 2","Term 3","Annual"].map(t => ({ v: t, l: t }))] },
              ].map((f) => (
                <select
                  key={f.label}
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                >
                  {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
              {(classFilter || sectionFilter || statusFilter) && (
                <button
                  onClick={() => { setClassFilter(""); setSectionFilter(""); setStatusFilter(""); setPage(1); }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">
                {filtered.length} Records
                {selected.length > 0 && <span className="ml-2 text-blue-600">· {selected.length} selected</span>}
              </p>
              <div className="flex gap-2">
                {["totalFees","paidAmount"].map(f => (
                  <button
                    key={f}
                    onClick={() => toggleSort(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${sortField === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                  >
                    {f === "totalFees" ? "Sort by Total" : "Sort by Paid"}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded accent-blue-600" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Roll No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Class</th>
                    <th className="px-4 py-3 text-left cursor-pointer text-xs font-semibold text-slate-500 uppercase tracking-wide" onClick={() => toggleSort("totalFees")}>
                      Total <SortIcon field="totalFees" />
                    </th>
                    <th className="px-4 py-3 text-left cursor-pointer text-xs font-semibold text-slate-500 uppercase tracking-wide" onClick={() => toggleSort("paidAmount")}>
                      Paid <SortIcon field="paidAmount" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-12 text-slate-400 text-sm">No records found</td></tr>
                  ) : paginated.map((s) => {
                    const due = s.totalFees - s.paidAmount;
                    return (
                      <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(s.id) ? "bg-blue-50/50" : ""}`}>
                        <td className="px-4 py-3.5">
                          <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} className="rounded accent-blue-600" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[s.id % AVATAR_COLORS.length]}`}>
                              {s.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm leading-none">{s.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{s.rollNo}</td>
                        <td className="px-4 py-3.5"><span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg">{s.class}-{s.section}</span></td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">₹{fmt(s.totalFees)}</td>
                        <td className="px-4 py-3.5 font-semibold text-green-700">₹{fmt(s.paidAmount)}</td>
                        <td className="px-4 py-3.5 font-semibold text-red-600">₹{fmt(due)}</td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">{s.dueDate}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                        <td className="px-4 py-3.5"><MethodIcon method={s.method} /></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewStudent(s)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                            <button onClick={() => { setEditStudent(s); setShowAdd(true); }} className="p-1.5 hover:bg-yellow-100 text-yellow-600 rounded-lg transition-colors" title="Edit"><Pencil size={14} /></button>
                            <button className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                  >
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Analytics ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Bar Chart */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-800">Fee Collection Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly collected vs pending (₹)</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={BAR_DATA} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    formatter={v => [`₹${fmt(v)}`, ""]}
                  />
                  <Bar dataKey="collected" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Collected" />
                  <Bar dataKey="pending" fill="#fde68a" radius={[6, 6, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-800">Fee Status Split</h3>
                <p className="text-xs text-slate-500 mt-0.5">Distribution by payment status</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} formatter={v => [`₹${fmt(v)}`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {viewStudent && <ViewModal student={viewStudent} onClose={() => setViewStudent(null)} />}
      {showAdd && <AddFeeModal onClose={() => { setShowAdd(false); setEditStudent(null); }} editStudent={editStudent} />}
    </div>
  );
}