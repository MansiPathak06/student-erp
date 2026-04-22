"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Trash2, ChevronDown, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────────
const getToken = () => {
  if (typeof window === "undefined") return null;
  const m = document.cookie.match(/(^| )token=([^;]+)/);
  return m ? m[2] : null;
};

const apiFetch = (path, opts = {}) =>
  fetch(`/api${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });

function Skeleton({ h = "h-16" }) {
  return <div className={`${h} bg-gray-100 rounded-2xl animate-pulse`} />;
}

const STATUS_STYLE = {
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",   label: "Pending"   },
  submitted: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Submitted" },
  late:      { bg: "bg-red-50",     text: "text-red-700",     label: "Late"      },
  graded:    { bg: "bg-blue-50",    text: "text-blue-700",    label: "Graded"    },
};

// ── TeacherHomeworkForm ────────────────────────────────────────────────────────
export default function TeacherHomeworkForm() {
  // Form state
  const [form, setForm]       = useState({
    title: "", description: "", subject: "", class_id: "", section: "", due_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg,    setFormMsg]    = useState(null); // { type: "success"|"error", text }

  // Classes list (fetched from teacher's assigned classes)
  const [classes,  setClasses]  = useState([]);
  const [sections, setSections] = useState([]);

  // Homework list
  const [homeworkList, setHomeworkList] = useState([]);
  const [listLoading,  setListLoading]  = useState(true);
  const [listError,    setListError]    = useState("");

  // ── fetch teacher's classes ──
  useEffect(() => {
    apiFetch("/teacher/classes")
      .then((data) => setClasses(data || []))
      .catch(() => {});
  }, []);

  // ── derive sections when class changes ──
  useEffect(() => {
    if (!form.class_id) { setSections([]); return; }
    const cls = classes.find((c) => String(c.id) === String(form.class_id));
    // If your API returns sections as array on each class object use cls.sections,
    // otherwise derive from the classes list (multiple entries per grade).
    const secs = cls?.sections
      ? cls.sections
      : classes
          .filter((c) => String(c.grade) === String(cls?.grade))
          .map((c) => c.section)
          .filter(Boolean);
    setSections([...new Set(secs)]);
    setForm((f) => ({ ...f, section: "" }));
  }, [form.class_id, classes]);

  // ── fetch existing homework ──
  const loadHomework = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await apiFetch("/homework/teacher");
      setHomeworkList(data || []);
    } catch {
      setListError("Failed to load homework list.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadHomework(); }, [loadHomework]);

  // ── submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg(null);
    if (!form.title || !form.subject || !form.class_id || !form.section || !form.due_date) {
      setFormMsg({ type: "error", text: "Please fill all required fields." });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/homework", {
        method: "POST",
        body: JSON.stringify({ ...form, class_id: Number(form.class_id) }),
      });
      setFormMsg({ type: "success", text: "Homework assigned successfully!" });
      setForm({ title: "", description: "", subject: "", class_id: "", section: "", due_date: "" });
      loadHomework();
    } catch {
      setFormMsg({ type: "error", text: "Failed to assign homework. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete ──
  const handleDelete = async (id) => {
    if (!confirm("Delete this homework?")) return;
    try {
      await apiFetch(`/homework/${id}`, { method: "DELETE" });
      setHomeworkList((prev) => prev.filter((h) => h.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">

      {/* ── Assign Homework Form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Plus size={15} className="text-emerald-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-sm">Assign Homework</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 5 — Questions 1–10"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition placeholder-gray-300"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mathematics"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition placeholder-gray-300"
            />
          </div>

          {/* Class + Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Class <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.class_id}
                  onChange={(e) => setForm((f) => ({ ...f, class_id: e.target.value }))}
                  className="w-full appearance-none px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition bg-white pr-8"
                >
                  <option value="">Select class</option>
                  {/* Deduplicate by grade */}
                  {[...new Map(classes.map((c) => [c.grade, c])).values()].map((c) => (
                    <option key={c.id} value={c.id}>Class {c.grade}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Section <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.section}
                  onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                  disabled={!form.class_id}
                  className="w-full appearance-none px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition bg-white pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select section</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={today}
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Additional instructions or details…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition placeholder-gray-300 resize-none"
            />
          </div>

          {/* Feedback */}
          {formMsg && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border
              ${formMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
              }`}>
              {formMsg.type === "success"
                ? <CheckCircle size={15} className="flex-shrink-0" />
                : <AlertCircle size={15} className="flex-shrink-0" />
              }
              {formMsg.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Assigning…
              </>
            ) : (
              <><Plus size={15} /> Assign Homework</>
            )}
          </button>
        </form>
      </div>

      {/* ── My Assigned Homework List ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <BookOpen size={15} className="text-blue-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-sm">Assigned Homework</h2>
          {homeworkList.length > 0 && (
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
              {homeworkList.length}
            </span>
          )}
        </div>

        <div className="p-4">
          {listLoading ? (
            <div className="space-y-2"><Skeleton /><Skeleton /><Skeleton /></div>
          ) : listError ? (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              {listError}
              <button onClick={loadHomework} className="text-red-700 font-semibold hover:underline text-xs ml-4">Retry</button>
            </div>
          ) : homeworkList.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No homework assigned yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {homeworkList.map((hw) => {
                const isOverdue = new Date(hw.due_date) < new Date() && hw.due_date;
                return (
                  <div key={hw.id} className="rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-200 overflow-hidden">
                    <div className="px-4 py-3.5 flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                        ${isOverdue ? "bg-red-100" : "bg-emerald-100"}`}>
                        <BookOpen size={14} className={isOverdue ? "text-red-600" : "text-emerald-600"} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {hw.subject}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Class {hw.class_name || hw.class_id}-{hw.section}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{hw.title}</p>
                        {hw.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{hw.description}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-400">
                            Due: {new Date(hw.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(hw.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors"
                        title="Delete homework"
                      >
                        <Trash2 size={13} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}