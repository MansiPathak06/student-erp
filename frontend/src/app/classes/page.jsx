"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Plus,
  Users,
  BookOpen,
  UserCog,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Bell,
  X,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// ── Auth ──────────────────────────────────────────────────────────────────────
const getToken = () => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Colour helpers ────────────────────────────────────────────────────────────
const PALETTE = [
  "blue",
  "violet",
  "emerald",
  "amber",
  "rose",
  "slate",
  "sky",
  "pink",
];
const AVATAR_COLORS = {
  blue: { bg: "bg-blue-100", text: "text-blue-700" },
  violet: { bg: "bg-violet-100", text: "text-violet-700" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  amber: { bg: "bg-amber-100", text: "text-amber-700" },
  rose: { bg: "bg-rose-100", text: "text-rose-700" },
  slate: { bg: "bg-slate-100", text: "text-slate-600" },
  sky: { bg: "bg-sky-100", text: "text-sky-700" },
  pink: { bg: "bg-pink-100", text: "text-pink-700" },
};
const colorForId = (id) => PALETTE[id % PALETTE.length];

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon: Icon, accent, bg, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <div
          className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}
        >
          <Icon size={16} className={accent} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{trend}</p>
    </div>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const EMPTY_FORM = { grade: "", section: "", teacher_id: "" };

function ClassModal({ open, onClose, onSaved, editData, teachers }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        grade: editData.grade || "",
        section: editData.section || "",
        teacher_id: editData.teacherId || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErr("");
  }, [editData, open]);

  if (!open) return null;

  const change = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.grade || !form.section)
      return setErr("Grade and section are required.");
    setSaving(true);
    setErr("");
    try {
      // class_name is derived from grade for DB compatibility
      const payload = {
        class_name: form.grade,
        section: form.section,
        grade: form.grade,
        teacher_id: form.teacher_id || null,
      };
      const url = editData
        ? `/api/admin/classes/${editData.dbId}`
        : "/api/admin/classes";
      const method = editData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.message || "Failed to save.");
      onSaved();
      onClose();
    } catch {
      setErr("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {editData ? "Edit Class" : "Add New Class"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="p-6 flex flex-col gap-4">
          {/* Grade */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">
              Grade *
            </label>
            <input
              name="grade"
              value={form.grade}
              onChange={change}
              placeholder="e.g. 9th, 10th, 11th"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
            />
          </div>

          {/* Section */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">
              Section *
            </label>
            <input
              name="section"
              value={form.section}
              onChange={change}
              placeholder="e.g. A, B, C"
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
            />
          </div>

          {/* Class Teacher */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">
              Class Teacher
            </label>
            <select
              name="teacher_id"
              value={form.teacher_id}
              onChange={change}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 bg-white"
            >
              <option value="">— Unassigned —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mx-6 mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm">
            <AlertCircle size={15} /> {err}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editData ? "Save Changes" : "Add Class"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, className, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Class</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">{className}</span>? This
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClassUI() {
  const [classes, setClasses] = useState([]);
  const [meta, setMeta] = useState({ teachers: [], grades: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("All Grades");
  const [filterSection, setFilterSection] = useState("All Sections");
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clsRes, metaRes] = await Promise.all([
        fetch("/api/admin/classes", { headers: authHeaders() }),
        fetch("/api/admin/classes/meta", { headers: authHeaders() }),
      ]);
      const [clsData, metaData] = await Promise.all([
        clsRes.json(),
        metaRes.json(),
      ]);
      if (!clsRes.ok)
        throw new Error(clsData.message || "Failed to load classes");
      if (!metaRes.ok)
        throw new Error(metaData.message || "Failed to load meta");
      setClasses(clsData);
      setMeta(metaData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteInfo) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/classes/${deleteInfo.dbId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteInfo(null);
      fetchAll();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived filter options ────────────────────────────────────────────────
  const gradeOptions = ["All Grades", ...meta.grades];
  const sectionOptions = useMemo(() => {
    const sections = [
      ...new Set(classes.map((c) => c.section).filter(Boolean)),
    ].sort();
    return ["All Sections", ...sections];
  }, [classes]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return classes.filter((c) => {
      const matchQ =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.grade.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        c.classTeacher.toLowerCase().includes(q);
      const matchG = filterGrade === "All Grades" || c.grade === filterGrade;
      const matchS =
        filterSection === "All Sections" || c.section === filterSection;
      return matchQ && matchG && matchS;
    });
  }, [classes, search, filterGrade, filterSection]);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const assignedCount = classes.filter(
    (c) => c.classTeacher !== "Unassigned",
  ).length;
  const unassignedCount = classes.length - assignedCount;

  const SUMMARY = [
    {
      label: "Total Classes",
      value: loading ? "—" : classes.length,
      icon: BookOpen,
      accent: "text-blue-600",
      bg: "bg-blue-50",
      trend: "Live from database",
    },
    {
      label: "Total Grades",
      value: loading ? "—" : meta.grades.length,
      icon: GraduationCap,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "Distinct grades",
    },
    {
      label: "Teachers Assigned",
      value: loading ? "—" : assignedCount,
      icon: UserCog,
      accent: "text-violet-600",
      bg: "bg-violet-50",
      trend: `${unassignedCount} unassigned`,
    },
    {
      label: "Total Sections",
      value: loading ? "—" : sectionOptions.length - 1,
      icon: Users,
      accent: "text-amber-600",
      bg: "bg-amber-50",
      trend: "Across all grades",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                AP
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                Admin
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 space-y-6">
          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Classes
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage all class records and teacher assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                <Download size={15} /> Export
              </button>
              <button
                onClick={() => {
                  setEditData(null);
                  setModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all"
              >
                <Plus size={15} /> Add Class
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SUMMARY.map((s) => (
              <SummaryCard key={s.label} {...s} />
            ))}
          </div>

          {/* ── Class List + Filters ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Filter bar — sits above the table, inside the same card */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search by ID, grade, section, teacher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                />
              </div>

              {/* Grade filter */}
              <div className="relative">
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all"
                >
                  {gradeOptions.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Section filter */}
              <div className="relative">
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all"
                >
                  {sectionOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              <p className="text-sm text-gray-400 self-center whitespace-nowrap">
                {filtered.length} found
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 size={24} className="animate-spin mr-2" />
                <span className="text-sm">Loading classes…</span>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="py-12 text-center">
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <p className="font-medium text-red-500">{error}</p>
                <button
                  onClick={fetchAll}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      {[
                        "Class ID",
                        "Grade",
                        "Section",
                        "Class Teacher",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-16 text-center text-gray-400 text-sm"
                        >
                          No classes found
                        </td>
                      </tr>
                    ) : (
                      filtered.map((cls) => {
                        const av = AVATAR_COLORS[colorForId(cls.dbId)];
                        return (
                          <tr
                            key={cls.dbId}
                            className="hover:bg-blue-50/30 transition-colors group"
                          >
                            {/* Class ID */}
                            <td className="px-6 py-4">
                              <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                                {cls.id}
                              </span>
                            </td>

                            {/* Grade */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${av.bg} ${av.text}`}
                                >
                                  {cls.grade?.toString().replace(/\D/g, "") ||
                                    "?"}
                                </div>
                                <span className="text-sm font-semibold text-gray-800">
                                  {cls.grade}
                                </span>
                              </div>
                            </td>

                            {/* Section */}
                            {/* Section */}
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                                {cls.section}
                              </span>
                            </td>

                            {/* Class Teacher */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <UserCog
                                    size={13}
                                    className="text-blue-600"
                                  />
                                </div>
                                <span
                                  className={`text-sm font-medium ${
                                    cls.classTeacher === "Unassigned"
                                      ? "text-gray-400 italic"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {cls.classTeacher}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="View"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditData(cls);
                                    setModal(true);
                                  }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteInfo(cls)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer count */}
            {!loading && !error && filtered.length > 0 && (
              <div className="px-6 py-3.5 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-600">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-600">
                    {classes.length}
                  </span>{" "}
                  classes
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ClassModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditData(null);
        }}
        onSaved={fetchAll}
        editData={editData}
        teachers={meta.teachers}
      />
      <DeleteModal
        open={!!deleteInfo}
        onClose={() => setDeleteInfo(null)}
        onConfirm={handleDelete}
        className={`${deleteInfo?.grade} – ${deleteInfo?.section}`}
        deleting={deleting}
      />
    </div>
  );
}
