"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Search, Download, Plus, Eye, Trash2, X,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  IndianRupee, CheckCircle2, Clock, XCircle, Filter,
  CreditCard, Smartphone, Banknote, Wifi, Receipt,
  TrendingUp, TrendingDown, Hash, CalendarDays, FileText,
  Copy, Printer,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const PAYMENTS = [
  { id: "TXN-2025-0001", student: "Aarav Sharma",  email: "aarav.sharma@school.in",  avatar: "AS", rollNo: "10A-01", class: "10", section: "A", amount: 22500, method: "Online", date: "2025-04-10", time: "09:32 AM", status: "Success", refId: "PAY-GW-88421", notes: "First installment Q2" },
  { id: "TXN-2025-0002", student: "Priya Verma",   email: "priya.verma@school.in",   avatar: "PV", rollNo: "10A-02", class: "10", section: "A", amount: 22500, method: "Cash",   date: "2025-04-09", time: "11:15 AM", status: "Success", refId: "—",           notes: "" },
  { id: "TXN-2025-0003", student: "Rohit Gupta",   email: "rohit.gupta@school.in",   avatar: "RG", rollNo: "9B-05",  class: "9",  section: "B", amount: 42000, method: "UPI",    date: "2025-04-08", time: "03:45 PM", status: "Pending", refId: "UPI-994312",   notes: "Awaiting bank confirmation" },
  { id: "TXN-2025-0004", student: "Sneha Patel",   email: "sneha.patel@school.in",   avatar: "SP", rollNo: "8C-11",  class: "8",  section: "C", amount: 19000, method: "UPI",    date: "2025-04-07", time: "10:00 AM", status: "Success", refId: "UPI-774201",   notes: "" },
  { id: "TXN-2025-0005", student: "Arjun Mehta",   email: "arjun.mehta@school.in",   avatar: "AM", rollNo: "7A-03",  class: "7",  section: "A", amount: 10000, method: "Cash",   date: "2025-04-06", time: "02:20 PM", status: "Success", refId: "—",           notes: "Partial payment" },
  { id: "TXN-2025-0006", student: "Kavya Nair",    email: "kavya.nair@school.in",    avatar: "KN", rollNo: "11B-07", class: "11", section: "B", amount: 25000, method: "Card",   date: "2025-04-05", time: "12:10 PM", status: "Failed",  refId: "CARD-ERR-091", notes: "Card declined – retry" },
  { id: "TXN-2025-0007", student: "Vikram Singh",  email: "vikram.singh@school.in",  avatar: "VS", rollNo: "12A-02", class: "12", section: "A", amount: 27500, method: "Online", date: "2025-04-04", time: "04:55 PM", status: "Success", refId: "PAY-GW-55310", notes: "" },
  { id: "TXN-2025-0008", student: "Meera Joshi",   email: "meera.joshi@school.in",   avatar: "MJ", rollNo: "6C-14",  class: "6",  section: "C", amount: 16000, method: "Cash",   date: "2025-04-03", time: "09:00 AM", status: "Success", refId: "—",           notes: "" },
  { id: "TXN-2025-0009", student: "Aarav Sharma",  email: "aarav.sharma@school.in",  avatar: "AS", rollNo: "10A-01", class: "10", section: "A", amount: 22500, method: "Online", date: "2025-03-15", time: "08:45 AM", status: "Success", refId: "PAY-GW-44102", notes: "Second installment Q1" },
  { id: "TXN-2025-0010", student: "Rohit Gupta",   email: "rohit.gupta@school.in",   avatar: "RG", rollNo: "9B-05",  class: "9",  section: "B", amount: 5000,  method: "UPI",    date: "2025-03-12", time: "06:30 PM", status: "Failed",  refId: "UPI-FAIL-003", notes: "UPI timeout" },
  { id: "TXN-2025-0011", student: "Sneha Patel",   email: "sneha.patel@school.in",   avatar: "SP", rollNo: "8C-11",  class: "8",  section: "C", amount: 19000, method: "Card",   date: "2025-03-10", time: "11:30 AM", status: "Success", refId: "CARD-221190",  notes: "" },
  { id: "TXN-2025-0012", student: "Kavya Nair",    email: "kavya.nair@school.in",    avatar: "KN", rollNo: "11B-07", class: "11", section: "B", amount: 25000, method: "Online", date: "2025-02-28", time: "01:00 PM", status: "Success", refId: "PAY-GW-11239", notes: "" },
];

const LINE_DATA = [
  { month: "Oct", amount: 280000 },
  { month: "Nov", amount: 340000 },
  { month: "Dec", amount: 195000 },
  { month: "Jan", amount: 415000 },
  { month: "Feb", amount: 380000 },
  { month: "Mar", amount: 310000 },
  { month: "Apr", amount: 197000 },
];

const METHOD_PIE = [
  { name: "Online", value: 97000, color: "#3b82f6" },
  { name: "Cash",   value: 70500, color: "#22c55e" },
  { name: "UPI",    value: 79500, color: "#a855f7" },
  { name: "Card",   value: 44000, color: "#f97316" },
];

const AVATAR_COLORS = [
  "bg-blue-500","bg-purple-500","bg-green-500","bg-rose-500",
  "bg-orange-500","bg-teal-500","bg-indigo-500","bg-pink-500",
];

const avColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// ─── Small reusable pieces ────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = {
    Success: { cls: "bg-green-100 text-green-700 border-green-200",  icon: <CheckCircle2 size={11} /> },
    Pending: { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock size={11} /> },
    Failed:  { cls: "bg-red-100 text-red-700 border-red-200",        icon: <XCircle size={11} /> },
  }[status] || {};
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  );
};

const MethodBadge = ({ method }) => {
  const cfg = {
    Cash:   { cls: "bg-green-50 text-green-700 border-green-100",   icon: <Banknote size={12} /> },
    UPI:    { cls: "bg-purple-50 text-purple-700 border-purple-100", icon: <Smartphone size={12} /> },
    Card:   { cls: "bg-orange-50 text-orange-700 border-orange-100", icon: <CreditCard size={12} /> },
    Online: { cls: "bg-blue-50 text-blue-700 border-blue-100",       icon: <Wifi size={12} /> },
  }[method] || {};
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${cfg.cls}`}>
      {cfg.icon} {method}
    </span>
  );
};

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ tx, onClose }) {
  if (!tx) return null;
  const idx = PAYMENTS.findIndex(p => p.id === tx.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Payment Details</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusBadge status={tx.status} />
            <span className="text-xs text-slate-400">{tx.date} · {tx.time}</span>
          </div>

          {/* Amount */}
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Payment Amount</p>
            <p className="text-3xl font-bold text-blue-700">₹{fmt(tx.amount)}</p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            {[
              { label: "Transaction ID", value: tx.id, mono: true },
              { label: "Reference ID",   value: tx.refId, mono: true },
              { label: "Payment Method", value: <MethodBadge method={tx.method} /> },
              { label: "Payment Date",   value: `${tx.date} at ${tx.time}` },
            ].map(r => (
              <div key={r.label} className="flex items-start justify-between gap-4">
                <span className="text-xs font-semibold text-slate-500 shrink-0 w-32">{r.label}</span>
                {typeof r.value === "string"
                  ? <span className={`text-sm text-slate-800 text-right ${r.mono ? "font-mono" : "font-medium"}`}>{r.value}</span>
                  : r.value}
              </div>
            ))}
          </div>

          {/* Student */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-3">Student</p>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${avColor(idx)}`}>
                {tx.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{tx.student}</p>
                <p className="text-xs text-slate-400">{tx.email} · {tx.rollNo}</p>
              </div>
            </div>
          </div>

          {tx.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-600 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{tx.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
            <button className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 shadow-sm">
              <Printer size={14} /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordModal({ onClose }) {
  const newTxnId = `TXN-2025-${String(PAYMENTS.length + 1).padStart(4, "0")}`;
  const [form, setForm] = useState({
    student: "", amount: "", method: "Cash",
    txnId: newTxnId, refId: "", date: "", notes: "",
  });
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Student */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Student</label>
            <select value={form.student} onChange={set("student")}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Select student</option>
              {[...new Set(PAYMENTS.map(p => p.student))].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input type="number" value={form.amount} onChange={set("amount")} placeholder="e.g. 22500"
                className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {["Cash","UPI","Card","Online"].map(m => (
                <button key={m} type="button" onClick={() => setForm(p => ({ ...p, method: m }))}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${form.method === m ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Transaction ID (Auto-generated)</label>
            <div className="relative">
              <input readOnly value={form.txnId}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 font-mono text-slate-500" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Ref ID */}
          {form.method !== "Cash" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reference ID</label>
              <input value={form.refId} onChange={set("refId")} placeholder="Gateway / UPI ref number"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Date</label>
            <input type="date" value={form.date} onChange={set("date")}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Any additional notes…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">Save Payment</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [search,     setSearch]     = useState("");
  const [classF,     setClassF]     = useState("");
  const [sectionF,   setSectionF]   = useState("");
  const [methodF,    setMethodF]    = useState("");
  const [statusF,    setStatusF]    = useState("");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const [sortField,  setSortField]  = useState("date");
  const [sortDir,    setSortDir]    = useState("desc");
  const [selected,   setSelected]   = useState([]);
  const [page,       setPage]       = useState(1);
  const [viewTx,     setViewTx]     = useState(null);
  const [showRecord, setShowRecord] = useState(false);
  const PER_PAGE = 6;

  // Stats
  const totalTx       = PAYMENTS.length;
  const totalReceived = PAYMENTS.filter(p => p.status === "Success").reduce((a, p) => a + p.amount, 0);
  const successCount  = PAYMENTS.filter(p => p.status === "Success").length;
  const failPend      = PAYMENTS.filter(p => p.status !== "Success").length;

  // Filter + sort
  const filtered = useMemo(() => {
    let data = PAYMENTS.filter(p => {
      const q = search.toLowerCase();
      if (q && !p.student.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q) && !p.method.toLowerCase().includes(q)) return false;
      if (classF   && p.class   !== classF)   return false;
      if (sectionF && p.section !== sectionF) return false;
      if (methodF  && p.method  !== methodF)  return false;
      if (statusF  && p.status  !== statusF)  return false;
      if (dateFrom && p.date < dateFrom)       return false;
      if (dateTo   && p.date > dateTo)         return false;
      return true;
    });
    if (sortField) {
      data = [...data].sort((a, b) => {
        const va = sortField === "amount" ? a.amount : a[sortField];
        const vb = sortField === "amount" ? b.amount : b[sortField];
        return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
    }
    return data;
  }, [search, classF, sectionF, methodF, statusF, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
    setPage(1);
  };
  const toggleSelect  = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll     = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(p => p.id));
  const clearFilters  = () => { setClassF(""); setSectionF(""); setMethodF(""); setStatusF(""); setDateFrom(""); setDateTo(""); setPage(1); };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-flex flex-col leading-none">
      <ChevronUp  size={10} className={sortField === field && sortDir === "asc"  ? "text-blue-600" : "text-slate-300"} />
      <ChevronDown size={10} className={sortField === field && sortDir === "desc" ? "text-blue-600" : "text-slate-300"} />
    </span>
  );

  const hasFilters = classF || sectionF || methodF || statusF || dateFrom || dateTo;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
              <p className="text-sm text-slate-500 mt-0.5">Track and manage all payment transactions</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search student, Txn ID, method…"
                  className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 shadow-sm text-slate-700 transition-colors">
                <Download size={15} /> Export
              </button>
              <button
                onClick={() => setShowRecord(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Plus size={15} /> Record Payment
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Transactions",    value: totalTx,              icon: <Receipt size={20} />,       bg: "bg-blue-50",   iconBg: "bg-blue-100",   iconColor: "text-blue-600",   trend: "+6",   up: true },
              { label: "Amount Received",       value: `₹${fmt(totalReceived)}`, icon: <IndianRupee size={20} />, bg: "bg-green-50",  iconBg: "bg-green-100",  iconColor: "text-green-600",  trend: "+14%", up: true },
              { label: "Successful Payments",   value: successCount,          icon: <CheckCircle2 size={20} />,  bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", trend: "+9%",  up: true },
              { label: "Failed / Pending",      value: failPend,              icon: <XCircle size={20} />,       bg: "bg-red-50",    iconBg: "bg-red-100",    iconColor: "text-red-600",    trend: "-2",   up: false },
            ].map((c) => (
              <div key={c.label} className={`${c.bg} rounded-2xl p-4 border border-white shadow-sm`}>
                <div className="flex items-start justify-between">
                  <div className={`${c.iconBg} ${c.iconColor} w-10 h-10 rounded-xl flex items-center justify-center`}>{c.icon}</div>
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
              <Filter size={15} className="text-slate-400 shrink-0" />
              {[
                { val: classF,   set: v => { setClassF(v);   setPage(1); }, opts: [{ v: "", l: "All Classes"  }, ...["6","7","8","9","10","11","12"].map(c => ({ v: c, l: `Class ${c}` }))] },
                { val: sectionF, set: v => { setSectionF(v); setPage(1); }, opts: [{ v: "", l: "All Sections" }, ...["A","B","C","D"].map(s => ({ v: s, l: `Section ${s}` }))] },
                { val: methodF,  set: v => { setMethodF(v);  setPage(1); }, opts: [{ v: "", l: "All Methods"  }, ...["Cash","UPI","Card","Online"].map(m => ({ v: m, l: m }))] },
                { val: statusF,  set: v => { setStatusF(v);  setPage(1); }, opts: [{ v: "", l: "All Status"   }, ...["Success","Pending","Failed"].map(s => ({ v: s, l: s }))] },
              ].map((f, i) => (
                <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
                  {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
              {/* Date range */}
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-slate-400" />
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600" />
                <span className="text-slate-400 text-xs">to</span>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600" />
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline font-medium">Clear filters</button>
              )}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">
                {filtered.length} Transactions
                {selected.length > 0 && <span className="ml-2 text-blue-600">· {selected.length} selected</span>}
              </p>
              <div className="flex gap-2">
                {[{ label: "Latest First", f: "date" }, { label: "Highest Amount", f: "amount" }].map(({ label, f }) => (
                  <button key={f} onClick={() => toggleSort(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${sortField === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                    {label}
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
                    {[
                      { label: "Txn ID",   field: null },
                      { label: "Student",  field: "student" },
                      { label: "Roll No",  field: null },
                      { label: "Class",    field: null },
                      { label: "Amount",   field: "amount" },
                      { label: "Method",   field: null },
                      { label: "Date",     field: "date" },
                      { label: "Status",   field: null },
                      { label: "Ref ID",   field: null },
                      { label: "Actions",  field: null },
                    ].map(({ label, field }) => (
                      <th key={label}
                        className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${field ? "cursor-pointer select-none" : ""}`}
                        onClick={field ? () => toggleSort(field) : undefined}>
                        {label}{field && <SortIcon field={field} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-12 text-slate-400 text-sm">No transactions found</td></tr>
                  ) : paginated.map((p, i) => (
                    <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${selected.includes(p.id) ? "bg-blue-50/50" : ""}`}>
                      <td className="px-4 py-3.5">
                        <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded accent-blue-600" />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{p.id}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${avColor(i)}`}>
                            {p.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-none whitespace-nowrap">{p.student}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{p.rollNo}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg">{p.class}-{p.section}</span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">₹{fmt(p.amount)}</td>
                      <td className="px-4 py-3.5"><MethodBadge method={p.method} /></td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{p.date}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{p.refId}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewTx(p)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                          <button className="p-1.5 hover:bg-green-100 text-green-600 rounded-lg transition-colors" title="Download Receipt"><Download size={14} /></button>
                          <button className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === pg ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-600"}`}>
                    {pg}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Analytics ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Line Chart */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-800">Payment Trends</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly total received (₹)</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={LINE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    formatter={v => [`₹${fmt(v)}`, "Received"]}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-800">Payment Methods</h3>
                <p className="text-xs text-slate-500 mt-0.5">Distribution by method (₹)</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={METHOD_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {METHOD_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
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
      {viewTx     && <ViewModal   tx={viewTx}  onClose={() => setViewTx(null)} />}
      {showRecord && <RecordModal             onClose={() => setShowRecord(false)} />}
    </div>
  );
}