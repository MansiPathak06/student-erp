"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { apiFetch } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const SECTIONS = ["All", "A", "B", "C"];
const GENDERS  = ["All", "Male", "Female"];
const PER_PAGE = 10;

const AVATAR_COLORS = [
  "bg-blue-500","bg-violet-500","bg-rose-500",
  "bg-amber-500","bg-emerald-500","bg-cyan-500",
  "bg-pink-500","bg-indigo-500","bg-teal-500","bg-orange-500",
];

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function avatarColor(name = "") {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

// ─── Normalize DB row → UI shape ──────────────────────────────────────────────
function normalizeStudent(s) {
  return {
    id:             s.id,
    studentId:      s.student_id    || "",
    userId:         s.user_id,
    name:           s.name          || "",
    email:          s.email         || "",
    roll:           s.roll_number   || "",
    class:          s.class         || "",
    section:        s.section       || "",
    classTeacher:   s.class_teacher || "",
    gender:         s.gender        || "",
    dob:            s.date_of_birth ? s.date_of_birth.slice(0, 10) : "",
    address:        s.address       || "",
    phone:          s.phone         || "",
    parentName:     s.guardian_name  || "",
    parentContact:  s.guardian_phone || "",
    fee:            s.fee_status    || "Pending",
    attendance:     typeof s.attendance_pct !== "undefined"
                      ? Number(s.attendance_pct)
                      : 0,
    isActive:       s.is_active,
    photoUrl: s.photo_url || null, 
  };
}

// ─── API helpers ──────────────────────────────────────────────────────────────
const api = {
  list:   ()       => apiFetch("/admin/students"),
  meta:   ()       => apiFetch("/admin/students/meta"),        // classes + teachers
  create: (body)   => apiFetch("/admin/students", { method: "POST",   body: JSON.stringify(body) }),
  update: (id, b)  => apiFetch(`/admin/students/${id}`, { method: "PUT",    body: JSON.stringify(b) }),
  remove: (id)     => apiFetch(`/admin/students/${id}`, { method: "DELETE" }),
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(students) {
  const headers = ["Student ID","Name","Roll","Class","Section","Class Teacher","Gender","Attendance","Fee","Email","Phone","Parent","Parent Contact"];
  const rows    = students.map(s => [
    s.studentId, s.name, s.roll, s.class, s.section, s.classTeacher, s.gender,
    s.attendance + "%", s.fee, s.email, s.phone, s.parentName, s.parentContact,
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "students.csv";
  a.click();
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ name, size = "md" }) {
  const sz = size === "lg" ? "w-16 h-16 text-xl" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${avatarColor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

function FeeBadge({ status }) {
  return status === "Paid" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      Pending
    </span>
  );
}

function AttendanceBar({ pct }) {
  const color = pct >= 85 ? "bg-green-500" : pct >= 75 ? "bg-blue-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${pct < 75 ? "text-amber-600" : "text-gray-700"}`}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  const color = type === "error"
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-green-50 border-green-200 text-green-700";
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl border shadow-lg text-sm font-medium flex items-center gap-2 ${color}`}>
      {type === "error" ? "❌" : "✅"} {msg}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── Student Row ──────────────────────────────────────────────────────────────
function StudentRow({ student, selected, onSelect, onView, onEdit, onDelete }) {
  return (
    <tr className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors group ${student.attendance < 75 ? "bg-amber-50/30" : ""}`}>
      <td className="px-4 py-3">
        <input type="checkbox" checked={selected} onChange={() => onSelect(student.id)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} />
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{student.name}</p>
            <p className="text-xs text-gray-400">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{student.studentId || "—"}</td>
      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{student.roll}</td>
      <td className="px-4 py-3 text-sm text-gray-700">
        <span className="font-medium">Class {student.class}</span>
        <span className="text-gray-400"> – {student.section}</span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{student.classTeacher || "—"}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{student.gender}</td>
      <td className="px-4 py-3">
        <AttendanceBar pct={student.attendance} />
        {student.attendance < 75 && (
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Below threshold</p>
        )}
      </td>
      <td className="px-4 py-3"><FeeBadge status={student.fee} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(student)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100" title="View">
            <EyeIcon />
          </button>
          <button onClick={() => onEdit(student)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" title="Edit">
            <EditIcon />
          </button>
          <button onClick={() => onDelete(student.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Student Card (mobile) ────────────────────────────────────────────────────
function StudentCard({ student, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} />
          <div>
            <p className="font-semibold text-gray-900">{student.name}</p>
            <p className="text-xs text-gray-400">Roll #{student.roll}</p>
            {student.studentId && <p className="text-xs text-gray-400 font-mono">{student.studentId}</p>}
          </div>
        </div>
        <FeeBadge status={student.fee} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
        <span>Class {student.class} – {student.section}</span>
        <span>{student.gender}</span>
        {student.classTeacher && <span className="col-span-2 text-gray-400">Teacher: {student.classTeacher}</span>}
      </div>
      <AttendanceBar pct={student.attendance} />
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
        <button onClick={() => onView(student)} className="flex-1 text-xs py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100">View</button>
        <button onClick={() => onEdit(student)} className="flex-1 text-xs py-1.5 rounded-lg bg-gray-50 text-gray-600 font-medium hover:bg-gray-100">Edit</button>
        <button onClick={() => onDelete(student.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 text-red-500 font-medium hover:bg-red-100">Delete</button>
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ student, onClose }) {
  if (!student) return null;
  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Student Profile</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><CloseIcon /></button>
      </div>
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl mb-5">
        <Avatar name={student.name} size="lg" />
        <div className="text-white">
          <p className="text-xl font-bold">{student.name}</p>
          <p className="text-blue-100 text-sm">Class {student.class} – Section {student.section}</p>
          <p className="text-blue-200 text-xs mt-0.5">Roll No: {student.roll}</p>
          {student.studentId && <p className="text-blue-200 text-xs">Student ID: {student.studentId}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoBlock title="Personal Details">
          <InfoRow label="Date of Birth"  value={student.dob}     />
          <InfoRow label="Gender"         value={student.gender}  />
          <InfoRow label="Email"          value={student.email}   />
          <InfoRow label="Phone"          value={student.phone}   />
          <InfoRow label="Address"        value={student.address} />
        </InfoBlock>
        <InfoBlock title="Class Info">
          <InfoRow label="Class"         value={student.class}       />
          <InfoRow label="Section"       value={student.section}     />
          <InfoRow label="Class Teacher" value={student.classTeacher}/>
        </InfoBlock>
        <InfoBlock title="Parent / Guardian">
          <InfoRow label="Name"    value={student.parentName}    />
          <InfoRow label="Contact" value={student.parentContact} />
        </InfoBlock>
        <InfoBlock title="Attendance">
          <div className="mt-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Attendance Rate</span>
              <span className={student.attendance < 75 ? "text-amber-600 font-semibold" : "text-gray-700"}>
                {student.attendance}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${student.attendance >= 85 ? "bg-green-500" : student.attendance >= 75 ? "bg-blue-500" : "bg-amber-400"}`}
                style={{ width: `${student.attendance}%` }}
              />
            </div>
            {student.attendance < 75 && <p className="text-xs text-amber-600 mt-1 font-medium">⚠ Below 75% threshold</p>}
          </div>
        </InfoBlock>
        <InfoBlock title="Fee Status">
          <div className="flex items-center gap-2 mt-1">
            <FeeBadge status={student.fee} />
            {student.fee !== "Paid" && <span className="text-xs text-red-500">Action required</span>}
          </div>
        </InfoBlock>
      </div>
    </ModalWrapper>
  );
}

function InfoBlock({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 font-medium text-right max-w-[55%] truncate">{value || "—"}</span>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", email: "", password: "", roll: "", studentId: "",
  classId: "", class: "", section: "", classTeacher: "",
  dob: "", gender: "", address: "", phone: "", parentName: "", parentContact: "",
  fee: "Pending",
};

function AddEditModal({ student, classMeta, onClose, onSave, saving }) {
  const isEdit = !!student;

  const [form, setForm] = useState(() =>
    isEdit ? { ...student, password: "", classId: student.classId || "" }
           : { ...EMPTY_FORM }
  );

  // ── Photo state (lives here, not in page) ──────────────────────────────
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(student?.photo_url || null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2MB."); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  // ───────────────────────────────────────────────────────────────────────

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleClassChange = (classId) => {
    const found = classMeta.find(c => String(c.id) === String(classId));
    if (found) {
      setForm(f => ({
        ...f,
        classId:      String(found.id),
        class:        found.class_name   || found.name || "",
        section:      found.section      || "",
        classTeacher: found.teacher_name || found.class_teacher || "",
      }));
    } else {
      setForm(f => ({ ...f, classId: "", class: "", section: "", classTeacher: "" }));
    }
  };

  const handleSave = () => {
    if (!form.name.trim())                return alert("Student name is required.");
    if (!form.roll.trim())                return alert("Roll number is required.");
    if (!form.classId)                    return alert("Please select a class.");
    if (!isEdit && !form.email.trim())    return alert("Email is required.");
    if (!isEdit && !form.password.trim()) return alert("Password is required.");
    // Pass photoFile up so the parent can upload it after save
    onSave(form, photoFile);
  };

  return (
    <ModalWrapper onClose={onClose} wide>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">
          {isEdit ? "Edit Student" : "Add New Student"}
        </h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <CloseIcon />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── Photo upload — TOP of form ─────────────────────────────── */}
        <div className="sm:col-span-2 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
            {photoPreview
              ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              : <Avatar name={form.name || "?"} size="lg" />
            }
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Photo
              <input type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · Max 2MB</p>
            {photoFile && (
              <p className="text-xs text-green-600 mt-1">✓ {photoFile.name}</p>
            )}
          </div>
        </div>
        {/* ─────────────────────────────────────────────────────────── */}

        <Field label={isEdit ? "Student ID" : "Student ID (leave blank to auto-generate)"}
          value={form.studentId} onChange={v => set("studentId", v)}
          placeholder="e.g. STU-2024-001" disabled={isEdit} />

        <Field label="Full Name *" value={form.name}
          onChange={v => set("name", v)} placeholder="e.g. Aarav Sharma" />

        <Field label="Roll Number *" value={form.roll}
          onChange={v => set("roll", v)} placeholder="e.g. 42" />

        {!isEdit && <>
          <Field label="Email *" value={form.email}
            onChange={v => set("email", v)} placeholder="student@school.edu" type="email" />
          <Field label="Password *" value={form.password}
            onChange={v => set("password", v)} placeholder="Min 6 characters" type="password" />
        </>}

        <div className="sm:col-span-2">
          <label className="field-label">Class *</label>
          {classMeta.length === 0 ? (
            <p className="text-xs text-amber-600 mt-1">⚠ No classes found. Please create classes first.</p>
          ) : (
            <select value={form.classId} onChange={e => handleClassChange(e.target.value)} className="field-input">
              <option value="">— Select a class —</option>
              {classMeta.map(c => (
                <option key={c.id} value={c.id}>
                  Class {c.class_name || c.name} – Section {c.section}
                  {c.teacher_name ? ` (Teacher: ${c.teacher_name})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="field-label">Grade / Class</label>
          <input type="text" value={form.class ? `Class ${form.class}` : ""} readOnly
            placeholder="Auto-filled" className="field-input bg-gray-50 text-gray-500 cursor-not-allowed" />
        </div>
        <div>
          <label className="field-label">Section</label>
          <input type="text" value={form.section} readOnly
            placeholder="Auto-filled" className="field-input bg-gray-50 text-gray-500 cursor-not-allowed" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Class Teacher</label>
          <input type="text" value={form.classTeacher} readOnly
            placeholder="Auto-filled" className="field-input bg-gray-50 text-gray-500 cursor-not-allowed" />
        </div>

        <div>
          <label className="field-label">Gender</label>
          <select value={form.gender} onChange={e => set("gender", e.target.value)} className="field-input">
            <option value="">Select gender</option>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <Field label="Date of Birth" value={form.dob} onChange={v => set("dob", v)} type="date" />
        <Field label="Phone" value={form.phone} onChange={v => set("phone", v)} placeholder="10-digit number" />
        <Field label="Parent Name" value={form.parentName} onChange={v => set("parentName", v)} placeholder="Guardian's full name" />
        <Field label="Parent Contact" value={form.parentContact} onChange={v => set("parentContact", v)} placeholder="10-digit number" />
       
        <div className="sm:col-span-2">
          <Field label="Address" value={form.address} onChange={v => set("address", v)} placeholder="Full address" />
        </div>
      </div>

      <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
        <button onClick={onClose} disabled={saving}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Spinner />}
          {isEdit ? "Save Changes" : "Add Student"}
        </button>
      </div>
    </ModalWrapper>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", disabled = false }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`field-input ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
function ModalWrapper({ children, onClose, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-y-auto max-h-[90vh] ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteModal({ count = 1, onClose, onConfirm, saving }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="text-center py-2">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrashIcon className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Delete {count > 1 ? `${count} Students` : "Student"}?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          This action cannot be undone. All {count > 1 ? "their" : "the"} data will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 flex items-center justify-center gap-2 disabled:opacity-60">
            {saving && <Spinner />}
            Delete
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Small utilities ──────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

function Select({ value, onChange, options, label }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer">
      {options.map(o => (
        <option key={o} value={o}>
          {o === "All" ? `All ${label}s` : label === "Section" ? `Section ${o}` : o}
        </option>
      ))}
    </select>
  );
}

function PaginationBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
      {children}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const CloseIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [students,       setStudents]       = useState([]);
  const [classMeta,      setClassMeta]      = useState([]);   // [{id, class_name, section, teacher_name}]
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState("");
  const [saving,         setSaving]         = useState(false);

  // Filters & pagination
  const [search,         setSearch]         = useState("");
  const [filterClass,    setFilterClass]    = useState("All");
  const [filterSection,  setFilterSection]  = useState("All");
  const [filterGender,   setFilterGender]   = useState("All");
  const [page,           setPage]           = useState(1);

  // Selection
  const [selected,       setSelected]       = useState([]);

  // Modals
  const [viewStudent,    setViewStudent]    = useState(null);
  const [editStudent,    setEditStudent]    = useState(null);
  const [showAddEdit,    setShowAddEdit]    = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState(null);

 

  // Toast
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Derive unique class list for filter dropdown ──
  const classOptions = useMemo(() => {
    const unique = [...new Set(students.map(s => s.class))].filter(Boolean).sort();
    return ["All", ...unique];
  }, [students]);



  // ── Fetch students + class meta together ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [studentsData, metaData] = await Promise.all([
        api.list(),
        api.meta().catch(() => []),   // graceful fallback if endpoint missing
      ]);
      setStudents((studentsData || []).map(normalizeStudent));
      setClassMeta(metaData || []);
    } catch (err) {
      setFetchError("Failed to load students. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filter & paginate ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s => {
      const matchSearch  = !q
        || s.name.toLowerCase().includes(q)
        || s.roll.includes(q)
        || s.studentId.toLowerCase().includes(q)
        || `class ${s.class}`.includes(q)
        || s.email.toLowerCase().includes(q);
      const matchClass   = filterClass   === "All" || s.class   === filterClass;
      const matchSection = filterSection === "All" || s.section === filterSection;
      const matchGender  = filterGender  === "All" || s.gender  === filterGender;
      return matchSearch && matchClass && matchSection && matchGender;
    });
  }, [students, search, filterClass, filterSection, filterGender]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Selection ──
  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = ()  => setSelected(s => s.length === paginated.length ? [] : paginated.map(s => s.id));

  // ── Save (create / update) ──
const handleSave = async (form, photoFile) => {   // ← accept photoFile
  setSaving(true);
  try {
    let savedId = form.id;   // for edit; for create we get it from response

    if (form.id) {
      const body = {
        class_id:       form.classId,
        class:          form.class,
        section:        form.section,
        class_teacher:  form.classTeacher,
        phone:          form.phone,
        address:        form.address,
        fee_status:     form.fee,
        guardian_name:  form.parentName,
        guardian_phone: form.parentContact,
      };
      await api.update(form.id, body);
      showToast("Student updated successfully.");
    } else {
      const body = {
        student_id:     form.studentId || undefined,
        name:           form.name,
        email:          form.email,
        password:       form.password,
        roll_number:    form.roll,
        class_id:       form.classId,
        class:          form.class,
        section:        form.section,
        class_teacher:  form.classTeacher,
        date_of_birth:  form.dob,
        gender:         form.gender,
        address:        form.address,
        phone:          form.phone,
        guardian_name:  form.parentName,
        guardian_phone: form.parentContact,
      };
      const created = await api.create(body);
      savedId = created.id;   // grab new student's id
      showToast("Student added successfully.");
    }

    // ── Upload photo if one was selected ───────────────────────────────
    if (photoFile && savedId) {
      try {
        const formData = new FormData();
        formData.append("photo", photoFile);
        await apiFetch(`/admin/students/${savedId}/photo`, {
          method: "POST",
          body: formData,
          // Don't set Content-Type — browser sets it with boundary automatically
        });
      } catch {
        showToast("Student saved but photo upload failed.", "error");
      }
    }
    // ──────────────────────────────────────────────────────────────────

    setShowAddEdit(false);
    setEditStudent(null);
    await fetchAll();
  } catch (err) {
    showToast(err?.message || "Failed to save student.", "error");
  } finally {
    setSaving(false);
  }
};

  // ── Delete ──
  const handleDeleteRequest      = (id)  => setDeleteTarget({ ids: [id], bulk: false });
  const handleBulkDeleteRequest  = ()    => { if (selected.length) setDeleteTarget({ ids: [...selected], bulk: true }); };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await Promise.all(deleteTarget.ids.map(id => api.remove(id)));
      showToast(`${deleteTarget.ids.length > 1 ? `${deleteTarget.ids.length} students` : "Student"} deleted.`);
      setSelected(s => s.filter(x => !deleteTarget.ids.includes(x)));
      setDeleteTarget(null);
      await fetchAll();
    } catch {
      showToast("Failed to delete. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setFilterClass("All"); setFilterSection("All");
    setFilterGender("All"); setSearch(""); setPage(1);
  };

  // ── Stats ──
  const totalStudents = students.length;
  const lowAttendance = students.filter(s => s.attendance > 0 && s.attendance < 75).length;
  const feePending    = students.filter(s => s.fee !== "Paid").length;
  const avgAttendance = totalStudents
    ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / totalStudents)
    : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="pl-10 lg:pl-0">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Students</h1>
            <p className="text-sm text-gray-400">Manage all student records</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-64">
              <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, ID, roll, class…"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full" />
            </div>

            {/* Refresh */}
            <button onClick={fetchAll} title="Refresh"
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>

            {/* Export CSV */}
            <button onClick={() => exportCSV(filtered)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>

            {/* Add Student */}
            <button onClick={() => { setEditStudent(null); setShowAddEdit(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Student
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* ── Fetch error ── */}
          {fetchError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              {fetchError}
              <button onClick={fetchAll} className="text-red-700 font-semibold hover:underline text-xs ml-4">Retry</button>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Students", value: loading ? "…" : totalStudents, color: "text-blue-600",  bg: "bg-blue-50",  icon: "👥" },
              { label: "Avg Attendance", value: loading ? "…" : avgAttendance + "%", color: "text-green-600", bg: "bg-green-50", icon: "📊" },
              { label: "Low Attendance", value: loading ? "…" : lowAttendance, color: "text-amber-600", bg: "bg-amber-50", icon: "⚠️" },
              { label: "Fee Pending",    value: loading ? "…" : feePending,    color: "text-red-600",   bg: "bg-red-50",   icon: "💳" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-lg`}>{s.icon}</div>
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</span>

            {/* Dynamic class filter from actual student data */}
            <select
              value={filterClass}
              onChange={e => { setFilterClass(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer"
            >
              {classOptions.map(o => (
                <option key={o} value={o}>{o === "All" ? "All Classes" : `Class ${o}`}</option>
              ))}
            </select>

            <Select value={filterSection} onChange={v => { setFilterSection(v); setPage(1); }} options={SECTIONS} label="Section" />
            <Select value={filterGender}  onChange={v => { setFilterGender(v);  setPage(1); }} options={GENDERS}  label="Gender"  />

            {(filterClass !== "All" || filterSection !== "All" || filterGender !== "All" || search) && (
              <button onClick={resetFilters} className="text-xs text-red-500 font-semibold hover:text-red-600 underline underline-offset-2">
                Reset
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? "s" : ""} found</span>
              {selected.length > 0 && (
                <button onClick={handleBulkDeleteRequest}
                  className="text-xs text-red-500 font-semibold px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                  Delete {selected.length} selected
                </button>
              )}
            </div>
          </div>

          {/* ── Loading skeleton ── */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* ── Table (desktop) ── */}
              <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left w-10">
                        <input type="checkbox"
                          checked={selected.length === paginated.length && paginated.length > 0}
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                      </th>
                      {["Profile","Student ID","Roll No.","Class","Class Teacher","Gender","Attendance","Fee Status","Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? paginated.map(s => (
                      <StudentRow key={s.id} student={s} selected={selected.includes(s.id)}
                        onSelect={toggleSelect}
                        onView={setViewStudent}
                        onEdit={st => { setEditStudent(st); setShowAddEdit(true); }}
                        onDelete={handleDeleteRequest} />
                    )) : (
                      <tr>
                        <td colSpan={10} className="text-center py-16 text-gray-400">
                          <div className="text-4xl mb-2">🔍</div>
                          <p className="font-medium">No students found</p>
                          <p className="text-xs mt-1">Try adjusting your filters or add a new student</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Cards (mobile) ── */}
              <div className="sm:hidden grid grid-cols-1 gap-3">
                {paginated.length > 0 ? paginated.map(s => (
                  <StudentCard key={s.id} student={s}
                    onView={setViewStudent}
                    onEdit={st => { setEditStudent(st); setShowAddEdit(true); }}
                    onDelete={handleDeleteRequest} />
                )) : (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="font-medium">No students found</p>
                  </div>
                )}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">
                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <PaginationBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </PaginationBtn>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${n === page ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                        {n}
                      </button>
                    ))}
                    <PaginationBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </PaginationBtn>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      {viewStudent && <ViewModal student={viewStudent} onClose={() => setViewStudent(null)} />}

      {showAddEdit && (
        <AddEditModal
          student={editStudent}
          classMeta={classMeta}
          saving={saving}
          onClose={() => { setShowAddEdit(false); setEditStudent(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          count={deleteTarget.ids.length}
          saving={saving}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast({ msg: "", type: "success" })} />
    </div>
  );
}