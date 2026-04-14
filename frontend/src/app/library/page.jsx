"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bell, ChevronDown, Search, Download, Plus, X, Save,
  BookOpen, Users, Clock, AlertCircle, CheckCircle,
  Trash2, Pencil, RotateCcw, BookMarked, Library,
  ChevronLeft, ChevronRight, Calendar, Tag,
} from "lucide-react";


// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const CATEGORIES = ["All Categories", "Science", "Mathematics", "Literature", "History", "Computer Science", "Geography", "Arts", "Reference"];
const STATUS_FILTERS = ["All Status", "Available", "Issued", "Overdue", "Reserved"];

const INITIAL_BOOKS = [
  { id: "BK-001", title: "Concepts of Physics",       author: "H.C. Verma",         category: "Science",          copies: 5, available: 2, isbn: "978-81-7709-187-6", rack: "A-12", year: 2020 },
  { id: "BK-002", title: "Higher Mathematics",         author: "R.D. Sharma",        category: "Mathematics",      copies: 4, available: 4, isbn: "978-81-219-0886-4", rack: "B-03", year: 2021 },
  { id: "BK-003", title: "Wings of Fire",              author: "A.P.J. Abdul Kalam", category: "Literature",       copies: 6, available: 3, isbn: "978-81-7371-146-6", rack: "C-07", year: 1999 },
  { id: "BK-004", title: "India After Gandhi",         author: "Ramachandra Guha",   category: "History",          copies: 3, available: 0, isbn: "978-0-330-39640-9", rack: "D-15", year: 2007 },
  { id: "BK-005", title: "Let Us C",                   author: "Yashavant Kanetkar", category: "Computer Science", copies: 7, available: 5, isbn: "978-81-8404-826-5", rack: "E-02", year: 2019 },
  { id: "BK-006", title: "Oxford Atlas",               author: "Oxford Press",       category: "Geography",        copies: 2, available: 1, isbn: "978-0-19-564472-0", rack: "F-08", year: 2022 },
  { id: "BK-007", title: "Organic Chemistry",          author: "O.P. Tandon",        category: "Science",          copies: 4, available: 2, isbn: "978-81-8283-388-2", rack: "A-05", year: 2018 },
  { id: "BK-008", title: "The Discovery of India",     author: "Jawaharlal Nehru",   category: "History",          copies: 3, available: 3, isbn: "978-0-14-013102-2", rack: "D-01", year: 2004 },
  { id: "BK-009", title: "Python Programming",         author: "Mark Lutz",          category: "Computer Science", copies: 5, available: 3, isbn: "978-1-491-94600-3", rack: "E-06", year: 2021 },
  { id: "BK-010", title: "A Brief History of Time",    author: "Stephen Hawking",    category: "Science",          copies: 4, available: 4, isbn: "978-0-553-17521-4", rack: "A-19", year: 1988 },
  { id: "BK-011", title: "NCERT Biology Class 12",     author: "NCERT",              category: "Science",          copies: 8, available: 6, isbn: "978-81-7450-634-9", rack: "A-22", year: 2023 },
  { id: "BK-012", title: "Indian Art & Culture",       author: "Nitin Singhania",    category: "Arts",             copies: 3, available: 1, isbn: "978-93-5187-687-6", rack: "G-04", year: 2022 },
];

const ISSUED_RECORDS_INIT = [
  { id: "ISS-001", bookId: "BK-001", studentName: "Aarav Sharma",  studentId: "STU-001", issueDate: "2025-01-06", dueDate: "2025-01-20", returnDate: null, status: "Issued"  },
  { id: "ISS-002", bookId: "BK-003", studentName: "Priya Mehta",   studentId: "STU-002", issueDate: "2025-01-03", dueDate: "2025-01-17", returnDate: null, status: "Overdue" },
  { id: "ISS-003", bookId: "BK-001", studentName: "Rohan Verma",   studentId: "STU-003", issueDate: "2025-01-08", dueDate: "2025-01-22", returnDate: null, status: "Issued"  },
  { id: "ISS-004", bookId: "BK-004", studentName: "Sneha Gupta",   studentId: "STU-004", issueDate: "2025-01-02", dueDate: "2025-01-16", returnDate: null, status: "Overdue" },
  { id: "ISS-005", bookId: "BK-004", studentName: "Kiran Patel",   studentId: "STU-005", issueDate: "2025-01-05", dueDate: "2025-01-19", returnDate: null, status: "Overdue" },
  { id: "ISS-006", bookId: "BK-006", studentName: "Arjun Singh",   studentId: "STU-006", issueDate: "2025-01-09", dueDate: "2025-01-23", returnDate: null, status: "Issued"  },
  { id: "ISS-007", bookId: "BK-007", studentName: "Divya Nair",    studentId: "STU-007", issueDate: "2025-01-07", dueDate: "2025-01-21", returnDate: null, status: "Issued"  },
  { id: "ISS-008", bookId: "BK-012", studentName: "Rahul Das",     studentId: "STU-008", issueDate: "2025-01-04", dueDate: "2025-01-18", returnDate: null, status: "Overdue" },
];

const CATEGORY_COLORS = {
  "Science":          { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500"    },
  "Mathematics":      { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-500"  },
  "Literature":       { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500"    },
  "History":          { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  "Computer Science": { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    dot: "bg-cyan-500"    },
  "Geography":        { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-500"    },
  "Arts":             { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    dot: "bg-pink-500"    },
  "Reference":        { bg: "bg-gray-100",   text: "text-gray-600",    border: "border-gray-200",    dot: "bg-gray-400"    },
};

const ROWS_PER_PAGE = 8;
const today = new Date().toISOString().split("T")[0];


// ─────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  const styles = { success: "bg-green-600", error: "bg-red-600", info: "bg-blue-600" };
  const Icon = type === "success" ? CheckCircle : AlertCircle;
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl ${styles[type]}`}>
      <Icon size={16} />{message}
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, accent, bg, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}><Icon size={16} className={accent} /></div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function AvailabilityBar({ available, total }) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const color = pct === 0 ? "bg-red-400" : pct <= 40 ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700">{available}/{total}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Available: "bg-green-50 text-green-700 ring-green-200",
    Issued:    "bg-blue-50  text-blue-700  ring-blue-200",
    Overdue:   "bg-red-50   text-red-700   ring-red-200",
    Reserved:  "bg-amber-50 text-amber-700 ring-amber-200",
  };
  const icons = {
    Available: <CheckCircle size={11} className="text-green-500" />,
    Issued:    <BookMarked  size={11} className="text-blue-500"  />,
    Overdue:   <AlertCircle size={11} className="text-red-500"   />,
    Reserved:  <Clock       size={11} className="text-amber-500" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${map[status] ?? map.Available}`}>
      {icons[status]}{status}
    </span>
  );
}

function CategoryBadge({ category }) {
  const col = CATEGORY_COLORS[category] ?? { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${col.bg} ${col.text} ${col.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />{category}
    </span>
  );
}


// ─────────────────────────────────────────────
// ADD / EDIT BOOK MODAL
// ─────────────────────────────────────────────

const EMPTY_BOOK = { title: "", author: "", category: "Science", copies: 1, isbn: "", rack: "", year: new Date().getFullYear() };

function BookModal({ initial, onClose, onSave }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_BOOK });
  const [errors, setErrors] = useState({});

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: "" })); }

  function validate() {
    const e = {};
    if (!form.title.trim())  e.title  = "Title is required";
    if (!form.author.trim()) e.author = "Author is required";
    if (!form.rack.trim())   e.rack   = "Rack location is required";
    if (form.copies < 1)     e.copies = "At least 1 copy required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({ ...form, id: initial?.id ?? `BK-${String(Date.now()).slice(-3)}`, available: isEdit ? form.available : form.copies });
  }

  const inputCls = (key) => `w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all
    ${errors[key] ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Book" : "Add New Book"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? "Update book details" : "Add a new book to the library"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Book Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Concepts of Physics" className={inputCls("title")} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Author */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Author *</label>
            <input value={form.author} onChange={e => set("author", e.target.value)} placeholder="e.g. H.C. Verma" className={inputCls("author")} />
            {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
          </div>

          {/* Category + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Category</label>
              <div className="relative">
                <select value={form.category} onChange={e => set("category", e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all">
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Year</label>
              <input type="number" value={form.year} onChange={e => set("year", parseInt(e.target.value))} min="1900" max="2099"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" />
            </div>
          </div>

          {/* Copies + Rack */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Total Copies *</label>
              <input type="number" value={form.copies} min="1" onChange={e => set("copies", parseInt(e.target.value) || 1)} className={inputCls("copies")} />
              {errors.copies && <p className="text-xs text-red-500 mt-1">{errors.copies}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Rack Location *</label>
              <input value={form.rack} onChange={e => set("rack", e.target.value)} placeholder="e.g. A-12" className={inputCls("rack")} />
              {errors.rack && <p className="text-xs text-red-500 mt-1">{errors.rack}</p>}
            </div>
          </div>

          {/* ISBN */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">ISBN</label>
            <input value={form.isbn} onChange={e => set("isbn", e.target.value)} placeholder="e.g. 978-81-7709-187-6" className={inputCls("isbn")} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all hover:scale-[1.02]">
            <Save size={14} />{isEdit ? "Update Book" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// ISSUE BOOK MODAL
// ─────────────────────────────────────────────

const DUE_OPTIONS = [7, 14, 21];

function IssueModal({ book, onClose, onIssue }) {
  const [studentName, setStudentName] = useState("");
  const [studentId,   setStudentId]   = useState("");
  const [dueDays,     setDueDays]     = useState(14);
  const [errors,      setErrors]      = useState({});

  function getDueDate() {
    const d = new Date(); d.setDate(d.getDate() + dueDays);
    return d.toISOString().split("T")[0];
  }

  function handleIssue() {
    const e = {};
    if (!studentName.trim()) e.name = "Student name required";
    if (!studentId.trim())   e.id   = "Student ID required";
    setErrors(e);
    if (Object.keys(e).length) return;
    onIssue({ bookId: book.id, studentName, studentId, issueDate: today, dueDate: getDueDate() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Issue Book</h2>
            <p className="text-xs text-gray-400 mt-0.5">Assign this book to a student</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Book info */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{book.title}</p>
              <p className="text-xs text-gray-500">{book.author} · {book.id}</p>
              <p className="text-xs text-blue-600 font-semibold mt-1">{book.available} cop{book.available === 1 ? "y" : "ies"} available</p>
            </div>
          </div>

          {/* Student name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Student Name *</label>
            <input value={studentName} onChange={e => { setStudentName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
              placeholder="e.g. Aarav Sharma"
              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Student ID */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Student ID *</label>
            <input value={studentId} onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, id: "" })); }}
              placeholder="e.g. STU-001"
              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${errors.id ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
            {errors.id && <p className="text-xs text-red-500 mt-1">{errors.id}</p>}
          </div>

          {/* Due days */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Return Period</label>
            <div className="flex gap-2">
              {DUE_OPTIONS.map(d => (
                <button key={d} onClick={() => setDueDays(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${dueDays === d ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {d} days
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
              <Calendar size={11} />Due date: <span className="font-semibold text-gray-600">{getDueDate()}</span>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleIssue}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all hover:scale-[1.02]">
            <BookMarked size={14} /> Issue Book
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// ISSUED RECORDS MODAL (with return)
// ─────────────────────────────────────────────

function IssuedRecordsModal({ records, books, onClose, onReturn }) {
  const [search, setSearch] = useState("");
  const enriched = records
    .filter(r => !r.returnDate)
    .filter(r => r.studentName.toLowerCase().includes(search.toLowerCase()) ||
                 r.studentId.toLowerCase().includes(search.toLowerCase()) ||
                 r.bookId.toLowerCase().includes(search.toLowerCase()))
    .map(r => ({ ...r, book: books.find(b => b.id === r.bookId) }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Issued Books</h2>
            <p className="text-xs text-gray-400 mt-0.5">Track and return issued books</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search student or book ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {enriched.map(r => {
            const isOverdue = r.status === "Overdue";
            return (
              <div key={r.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors ${isOverdue ? "bg-red-50/30" : ""}`}>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{r.book?.title}</p>
                  <p className="text-xs text-gray-400">{r.studentName} · {r.studentId} · {r.bookId}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">Due: <span className={`font-semibold ${isOverdue ? "text-red-600" : "text-gray-700"}`}>{r.dueDate}</span></p>
                  <StatusBadge status={r.status} />
                </div>
                <button onClick={() => onReturn(r.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors flex-shrink-0">
                  <RotateCcw size={12} /> Return
                </button>
              </div>
            );
          })}
          {enriched.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BookMarked size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No issued records found</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-400"><span className="font-semibold text-gray-600">{enriched.length}</span> active issues</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// LIBRARY PAGE
// ─────────────────────────────────────────────

export default function LibraryPage() {
  const [books,        setBooks]       = useState(INITIAL_BOOKS);
  const [issuedRecs,   setIssuedRecs]  = useState(ISSUED_RECORDS_INIT);
  const [search,       setSearch]      = useState("");
  const [filterCat,    setFilterCat]   = useState("All Categories");
  const [filterStatus, setFilterStatus]= useState("All Status");
  const [page,         setPage]        = useState(1);
  const [bookModal,    setBookModal]   = useState(null);   // null | { mode, book? }
  const [issueModal,   setIssueModal]  = useState(null);   // null | book
  const [showIssued,   setShowIssued]  = useState(false);
  const [deleteConf,   setDeleteConf]  = useState(null);   // bookId
  const [toast,        setToast]       = useState(null);

  function showToast(msg, type = "success") {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Compute book status
  function bookStatus(book) {
    if (book.available === 0) return "Issued";
    if (book.available === book.copies) return "Available";
    return "Available";
  }

  // Enrich books with status
  const enriched = useMemo(() => books.map(b => {
    const activeIssues = issuedRecs.filter(r => r.bookId === b.id && !r.returnDate);
    const hasOverdue   = activeIssues.some(r => r.status === "Overdue");
    const status = hasOverdue ? "Overdue" : b.available === 0 ? "Issued" : "Available";
    return { ...b, status };
  }), [books, issuedRecs]);

  // Filter
  const filtered = useMemo(() => enriched.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.isbn.includes(q);
    const matchCat    = filterCat    === "All Categories" || b.category === filterCat;
    const matchStatus = filterStatus === "All Status"     || b.status   === filterStatus;
    return matchSearch && matchCat && matchStatus;
  }), [enriched, search, filterCat, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  function goPage(p) { setPage(Math.min(Math.max(1, p), totalPages)); }

  // Stats
  const totalBooks   = books.reduce((s, b) => s + b.copies, 0);
  const totalIssued  = issuedRecs.filter(r => !r.returnDate).length;
  const totalOverdue = issuedRecs.filter(r => !r.returnDate && r.status === "Overdue").length;
  const totalTitles  = books.length;

  // Save book
  function handleSaveBook(book) {
    setBooks(prev => {
      const idx = prev.findIndex(b => b.id === book.id);
      if (idx > -1) { const u = [...prev]; u[idx] = book; return u; }
      return [...prev, book];
    });
    setBookModal(null);
    showToast(book.id.includes("BK-0") && book.id.length > 6 ? "Book added successfully" : "Book updated", "success");
  }

  // Delete book
  function handleDeleteBook(id) {
    setBooks(prev => prev.filter(b => b.id !== id));
    setDeleteConf(null);
    showToast("Book removed from library", "info");
  }

  // Issue book
  function handleIssue({ bookId, studentName, studentId, issueDate, dueDate }) {
    const newRec = {
      id: `ISS-${String(issuedRecs.length + 1).padStart(3, "0")}`,
      bookId, studentName, studentId, issueDate, dueDate, returnDate: null, status: "Issued",
    };
    setIssuedRecs(prev => [...prev, newRec]);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, available: b.available - 1 } : b));
    setIssueModal(null);
    showToast(`Book issued to ${studentName}`, "success");
  }

  // Return book
  function handleReturn(recordId) {
    const rec = issuedRecs.find(r => r.id === recordId);
    if (!rec) return;
    setIssuedRecs(prev => prev.map(r => r.id === recordId ? { ...r, returnDate: today, status: "Returned" } : r));
    setBooks(prev => prev.map(b => b.id === rec.bookId ? { ...b, available: b.available + 1 } : b));
    showToast("Book returned successfully", "success");
  }

  // Export CSV
  function handleExport() {
    const rows = [
      ["Book ID", "Title", "Author", "Category", "Total Copies", "Available", "ISBN", "Rack", "Year", "Status"],
      ...filtered.map(b => [b.id, b.title, b.author, b.category, b.copies, b.available, b.isbn, b.rack, b.year, b.status]),
    ];
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "library-catalog.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("Catalog exported as CSV", "info");
  }

  const HEADERS = ["Book", "Book ID", "Category", "Copies", "Rack", "Status", "Actions"];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search books, authors…" value={search}
              onChange={e => { setSearch(e.target.value); goPage(1); }}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">AP</div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Page heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Library</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage books, issues, and returns</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white
                           text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <Download size={15} /> Export
              </button>
              <button onClick={() => setShowIssued(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50
                           text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all shadow-sm">
                <BookMarked size={15} /> Issued Books
                {totalIssued > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalIssued}</span>
                )}
              </button>
              <button onClick={() => setBookModal({ mode: "add" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700
                           text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.99]">
                <Plus size={15} /> Add Book
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Titles"   value={totalTitles}  icon={Library}    accent="text-blue-600"   bg="bg-blue-50"   sub="Books in catalog"        />
            <SummaryCard label="Total Copies"   value={totalBooks}   icon={BookOpen}   accent="text-violet-600" bg="bg-violet-50" sub="Across all titles"        />
            <SummaryCard label="Currently Issued" value={totalIssued}  icon={BookMarked} accent="text-amber-600"  bg="bg-amber-50"  sub="Books with students"     />
            <SummaryCard label="Overdue"        value={totalOverdue} icon={AlertCircle}accent="text-red-600"    bg="bg-red-50"    sub={totalOverdue > 0 ? "Need immediate return" : "All on time"} />
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                          flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" value={search} placeholder="Search title, author, ISBN..."
                onChange={e => { setSearch(e.target.value); goPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                           text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all" />
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <div className="relative">
                <select value={filterCat} onChange={e => { setFilterCat(e.target.value); goPage(1); }}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white
                             text-sm text-gray-700 font-medium cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); goPage(1); }}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white
                             text-sm text-gray-700 font-medium cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all">
                  {STATUS_FILTERS.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <p className="text-sm text-gray-400 self-center whitespace-nowrap">{filtered.length} books</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {HEADERS.map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(book => (
                    <tr key={book.id} className="hover:bg-blue-50/30 transition-colors group">

                      {/* Book title + author */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen size={16} className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">{book.title}</p>
                            <p className="text-xs text-gray-400 truncate">{book.author} · {book.year}</p>
                          </div>
                        </div>
                      </td>

                      {/* ID + ISBN */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{book.id}</span>
                        {book.isbn && <p className="text-[10px] text-gray-400 mt-1">{book.isbn}</p>}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4"><CategoryBadge category={book.category} /></td>

                      {/* Copies bar */}
                      <td className="px-5 py-4"><AvailabilityBar available={book.available} total={book.copies} /></td>

                      {/* Rack */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Tag size={11} className="text-gray-400" />{book.rack}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4"><StatusBadge status={book.status} /></td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {book.available > 0 && (
                            <button onClick={() => setIssueModal(book)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Issue">
                              <BookMarked size={14} />
                            </button>
                          )}
                          <button onClick={() => setBookModal({ mode: "edit", book })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteConf(book.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {paginated.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Library size={32} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">No books found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or add a new book</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span>{" "}
                  of <span className="font-semibold text-gray-600">{filtered.length}</span> books
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => goPage(page - 1)} disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => goPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${p === page ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-gray-500 hover:bg-gray-100"}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => goPage(page + 1)} disabled={page === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {bookModal && (
        <BookModal
          initial={bookModal.book}
          onClose={() => setBookModal(null)}
          onSave={handleSaveBook}
        />
      )}
      {issueModal && (
        <IssueModal
          book={issueModal}
          onClose={() => setIssueModal(null)}
          onIssue={handleIssue}
        />
      )}
      {showIssued && (
        <IssuedRecordsModal
          records={issuedRecs}
          books={books}
          onClose={() => setShowIssued(false)}
          onReturn={id => { handleReturn(id); }}
        />
      )}
      {deleteConf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Remove Book?</h3>
              <p className="text-sm text-gray-500 mt-1">This will permanently remove the book from the library catalog.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConf(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={() => handleDeleteBook(deleteConf)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-200 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}