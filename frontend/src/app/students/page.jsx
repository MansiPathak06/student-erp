"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";

// ─── Dummy Data ──────────────────────────────────────────────────────────────
const DUMMY_STUDENTS = [
  { id: 1,  name: "Aarav Sharma",    roll: "1001", class: "10", section: "A", gender: "Male",   attendance: 92, fee: "Paid",    dob: "2008-03-12", address: "14, MG Road, Delhi", parentName: "Rajesh Sharma",    parentContact: "9876543210", email: "aarav@school.edu",   avatar: "AS", avatarBg: "bg-blue-500",    recentActivity: ["Submitted Math assignment", "Attendance marked", "Fee paid"] },
  { id: 2,  name: "Priya Mehta",     roll: "1002", class: "10", section: "A", gender: "Female", attendance: 68, fee: "Pending", dob: "2008-07-22", address: "7, Nehru Nagar, Mumbai", parentName: "Suresh Mehta",     parentContact: "9123456789", email: "priya@school.edu",   avatar: "PM", avatarBg: "bg-rose-500",    recentActivity: ["Fee payment due", "Attendance below threshold", "Parent meeting scheduled"] },
  { id: 3,  name: "Rohan Verma",     roll: "1003", class: "10", section: "B", gender: "Male",   attendance: 85, fee: "Paid",    dob: "2008-01-05", address: "22, Sector 5, Noida", parentName: "Anil Verma",       parentContact: "9988776655", email: "rohan@school.edu",   avatar: "RV", avatarBg: "bg-emerald-500", recentActivity: ["Scored 95 in Science test", "Library book returned", "Sports day registered"] },
  { id: 4,  name: "Sneha Gupta",     roll: "1004", class: "9",  section: "A", gender: "Female", attendance: 71, fee: "Pending", dob: "2009-11-18", address: "3, Park Street, Kolkata", parentName: "Vinod Gupta",      parentContact: "9001122334", email: "sneha@school.edu",   avatar: "SG", avatarBg: "bg-amber-500",   recentActivity: ["Attendance warning issued", "Homework incomplete", "Counselor meeting"] },
  { id: 5,  name: "Kiran Patel",     roll: "1005", class: "9",  section: "B", gender: "Male",   attendance: 96, fee: "Paid",    dob: "2009-06-30", address: "9, Ashram Road, Ahmedabad", parentName: "Bharat Patel",     parentContact: "9876001122", email: "kiran@school.edu",   avatar: "KP", avatarBg: "bg-violet-500",  recentActivity: ["Best student award", "Science project submitted", "Fee paid on time"] },
  { id: 6,  name: "Ananya Singh",    roll: "1006", class: "11", section: "A", gender: "Female", attendance: 88, fee: "Paid",    dob: "2007-04-14", address: "18, Civil Lines, Lucknow", parentName: "Ramesh Singh",     parentContact: "9765432100", email: "ananya@school.edu",  avatar: "AS", avatarBg: "bg-pink-500",    recentActivity: ["Topper in English", "Drama club joined", "Attendance excellent"] },
  { id: 7,  name: "Dev Kapoor",      roll: "1007", class: "11", section: "B", gender: "Male",   attendance: 60, fee: "Pending", dob: "2007-09-08", address: "5, Rajpur Road, Dehradun", parentName: "Mohit Kapoor",     parentContact: "9812345678", email: "dev@school.edu",     avatar: "DK", avatarBg: "bg-orange-500",  recentActivity: ["Attendance critical", "3 assignments missed", "Parent notified"] },
  { id: 8,  name: "Ishaan Roy",      roll: "1008", class: "8",  section: "A", gender: "Male",   attendance: 79, fee: "Paid",    dob: "2010-12-25", address: "11, Ballygunge, Kolkata", parentName: "Sudipta Roy",      parentContact: "9333221100", email: "ishaan@school.edu",  avatar: "IR", avatarBg: "bg-cyan-500",    recentActivity: ["Math olympiad selected", "Attendance regular", "Term fees cleared"] },
  { id: 9,  name: "Meera Nair",      roll: "1009", class: "8",  section: "B", gender: "Female", attendance: 93, fee: "Paid",    dob: "2010-02-17", address: "6, Marine Drive, Kochi", parentName: "Prakash Nair",     parentContact: "9400123456", email: "meera@school.edu",   avatar: "MN", avatarBg: "bg-teal-500",    recentActivity: ["Dance competition winner", "Science fair 2nd place", "Full attendance week"] },
  { id: 10, name: "Arjun Yadav",     roll: "1010", class: "12", section: "A", gender: "Male",   attendance: 82, fee: "Paid",    dob: "2006-08-03", address: "30, Hazratganj, Lucknow", parentName: "Ramakant Yadav",   parentContact: "9555667788", email: "arjun@school.edu",   avatar: "AY", avatarBg: "bg-indigo-500",  recentActivity: ["Board prep mock test", "Career counseling session", "Fee paid"] },
  { id: 11, name: "Riya Joshi",      roll: "1011", class: "12", section: "B", gender: "Female", attendance: 74, fee: "Pending", dob: "2006-05-21", address: "2, Banjara Hills, Hyderabad", parentName: "Nilesh Joshi",     parentContact: "9700009999", email: "riya@school.edu",    avatar: "RJ", avatarBg: "bg-fuchsia-500", recentActivity: ["Pending fee for Q3", "Attendance below threshold", "Tutor assigned"] },
  { id: 12, name: "Samar Khan",      roll: "1012", class: "7",  section: "A", gender: "Male",   attendance: 91, fee: "Paid",    dob: "2011-10-09", address: "8, Model Town, Lahore Gate, Delhi", parentName: "Irfan Khan",       parentContact: "9811223344", email: "samar@school.edu",   avatar: "SK", avatarBg: "bg-lime-600",    recentActivity: ["Quiz champion", "Good conduct certificate", "Library member of month"] },
  { id: 13, name: "Divya Reddy",     roll: "1013", class: "7",  section: "B", gender: "Female", attendance: 55, fee: "Pending", dob: "2011-03-27", address: "15, Jubilee Hills, Hyderabad", parentName: "Venkat Reddy",     parentContact: "9966778800", email: "divya@school.edu",   avatar: "DR", avatarBg: "bg-red-500",     recentActivity: ["Critical attendance", "Health issue reported", "Online class access given"] },
  { id: 14, name: "Nikhil Mishra",   roll: "1014", class: "6",  section: "A", gender: "Male",   attendance: 87, fee: "Paid",    dob: "2012-07-14", address: "21, Shastri Nagar, Jaipur", parentName: "Rajeev Mishra",    parentContact: "9100234567", email: "nikhil@school.edu",  avatar: "NM", avatarBg: "bg-blue-600",    recentActivity: ["Art competition entry", "Attendance good", "Fees up to date"] },
  { id: 15, name: "Tanya Choudhary", roll: "1015", class: "6",  section: "B", gender: "Female", attendance: 98, fee: "Paid",    dob: "2012-01-11", address: "4, Gandhi Road, Bhopal", parentName: "Deepak Choudhary", parentContact: "9422111000", email: "tanya@school.edu",   avatar: "TC", avatarBg: "bg-green-500",   recentActivity: ["Perfect attendance this month", "School topper", "Scholarship awarded"] },
];

const CLASSES   = ["All", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS  = ["All", "A", "B", "C"];
const GENDERS   = ["All", "Male", "Female"];
const PER_PAGE  = 10;

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ student, size = "md" }) {
  const sz = size === "lg" ? "w-16 h-16 text-xl" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${student.avatarBg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {student.avatar}
    </div>
  );
}

// ─── Fee Badge ────────────────────────────────────────────────────────────────
function FeeBadge({ status }) {
  return status === "Paid" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      Pending
    </span>
  );
}

// ─── Attendance Bar ───────────────────────────────────────────────────────────
function AttendanceBar({ pct }) {
  const low = pct < 75;
  const color = pct >= 85 ? "bg-green-500" : pct >= 75 ? "bg-blue-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${low ? "text-amber-600" : "text-gray-700"}`}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Student Row (table) ──────────────────────────────────────────────────────
function StudentRow({ student, selected, onSelect, onView, onEdit, onDelete }) {
  const low = student.attendance < 75;
  return (
    <tr className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors group ${low ? "bg-amber-50/30" : ""}`}>
      <td className="px-4 py-3">
        <input type="checkbox" checked={selected} onChange={() => onSelect(student.id)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar student={student} />
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{student.name}</p>
            <p className="text-xs text-gray-400">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{student.roll}</td>
      <td className="px-4 py-3 text-sm text-gray-700">
        <span className="font-medium">Class {student.class}</span>
        <span className="text-gray-400"> – {student.section}</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{student.gender}</td>
      <td className="px-4 py-3">
        <AttendanceBar pct={student.attendance} />
        {low && <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Below threshold</p>}
      </td>
      <td className="px-4 py-3"><FeeBadge status={student.fee} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(student)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors" title="View">
            <EyeIcon />
          </button>
          <button onClick={() => onEdit(student)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Edit">
            <EditIcon />
          </button>
          <button onClick={() => onDelete(student.id)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar student={student} />
          <div>
            <p className="font-semibold text-gray-900">{student.name}</p>
            <p className="text-xs text-gray-400">Roll #{student.roll}</p>
          </div>
        </div>
        <FeeBadge status={student.fee} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
        <span>Class {student.class} – {student.section}</span>
        <span>{student.gender}</span>
      </div>
      <AttendanceBar pct={student.attendance} />
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
        <button onClick={() => onView(student)} className="flex-1 text-xs py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">View</button>
        <button onClick={() => onEdit(student)} className="flex-1 text-xs py-1.5 rounded-lg bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 transition-colors">Edit</button>
        <button onClick={() => onDelete(student.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 text-red-500 font-medium hover:bg-red-100 transition-colors">Delete</button>
      </div>
    </div>
  );
}

// ─── View Profile Modal ───────────────────────────────────────────────────────
function ViewModal({ student, onClose }) {
  if (!student) return null;
  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Student Profile</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><CloseIcon /></button>
      </div>

      {/* Profile header */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl mb-5">
        <Avatar student={student} size="lg" />
        <div className="text-white">
          <p className="text-xl font-bold">{student.name}</p>
          <p className="text-blue-100 text-sm">Class {student.class} – Section {student.section}</p>
          <p className="text-blue-200 text-xs mt-1">Roll No: {student.roll}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Details */}
        <InfoBlock title="Personal Details">
          <InfoRow label="Date of Birth" value={student.dob} />
          <InfoRow label="Gender" value={student.gender} />
          <InfoRow label="Email" value={student.email} />
          <InfoRow label="Address" value={student.address} />
        </InfoBlock>
        <InfoBlock title="Parent Details">
          <InfoRow label="Parent Name" value={student.parentName} />
          <InfoRow label="Contact" value={student.parentContact} />
        </InfoBlock>
        <InfoBlock title="Academic Summary">
          <div className="mt-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Attendance</span>
              <span className={student.attendance < 75 ? "text-amber-600 font-semibold" : "text-gray-700"}>{student.attendance}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${student.attendance >= 85 ? "bg-green-500" : student.attendance >= 75 ? "bg-blue-500" : "bg-amber-400"}`} style={{ width: `${student.attendance}%` }} />
            </div>
            {student.attendance < 75 && <p className="text-xs text-amber-600 mt-1 font-medium">⚠ Attendance below 75%</p>}
          </div>
        </InfoBlock>
        <InfoBlock title="Fee Status">
          <div className="flex items-center gap-2 mt-1">
            <FeeBadge status={student.fee} />
            {student.fee === "Pending" && <span className="text-xs text-red-500">Action required</span>}
          </div>
        </InfoBlock>
      </div>

      {/* Recent activity */}
      <InfoBlock title="Recent Activity">
        <ul className="space-y-2 mt-1">
          {student.recentActivity.map((a, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      </InfoBlock>
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
      <span className="text-gray-700 font-medium text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", roll: "", class: "", section: "", dob: "", gender: "", address: "", parentName: "", parentContact: "", email: "" };

function AddEditModal({ student, onClose, onSave }) {
  const [form, setForm] = useState(student ? { ...student } : { ...EMPTY_FORM });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.roll || !form.class) return alert("Name, Roll, and Class are required.");
    onSave(form);
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose} wide>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">{student ? "Edit Student" : "Add New Student"}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><CloseIcon /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *" value={form.name} onChange={v => set("name", v)} placeholder="e.g. Aarav Sharma" />
        <Field label="Roll Number *" value={form.roll} onChange={v => set("roll", v)} placeholder="e.g. 1001" />
        <div>
          <label className="field-label">Class *</label>
          <select value={form.class} onChange={e => set("class", e.target.value)} className="field-input">
            <option value="">Select class</option>
            {["6","7","8","9","10","11","12"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Section</label>
          <select value={form.section} onChange={e => set("section", e.target.value)} className="field-input">
            <option value="">Select section</option>
            {["A","B","C"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Field label="Date of Birth" type="date" value={form.dob} onChange={v => set("dob", v)} />
        <div>
          <label className="field-label">Gender</label>
          <select value={form.gender} onChange={e => set("gender", e.target.value)} className="field-input">
            <option value="">Select gender</option>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Field label="Address" value={form.address} onChange={v => set("address", v)} placeholder="Full address" />
        </div>
        <Field label="Parent Name" value={form.parentName} onChange={v => set("parentName", v)} placeholder="e.g. Rajesh Sharma" />
        <Field label="Parent Contact" value={form.parentContact} onChange={v => set("parentContact", v)} placeholder="10-digit number" />
        <div className="sm:col-span-2">
          <Field label="Email" type="email" value={form.email} onChange={v => set("email", v)} placeholder="student@school.edu" />
        </div>
        {/* Profile image upload (UI only) */}
        <div className="sm:col-span-2">
          <label className="field-label">Profile Image</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors cursor-pointer">
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-300 mt-0.5">PNG, JPG up to 2MB</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-200">
          {student ? "Save Changes" : "Add Student"}
        </button>
      </div>
    </ModalWrapper>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="field-input" />
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
function DeleteModal({ onClose, onConfirm }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="text-center py-2">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrashIcon className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Delete Student?</h2>
        <p className="text-sm text-gray-500 mb-6">This action cannot be undone. All student data will be permanently removed.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(students) {
  const headers = ["Name", "Roll", "Class", "Section", "Gender", "Attendance", "Fee"];
  const rows = students.map(s => [s.name, s.roll, s.class, s.section, s.gender, s.attendance + "%", s.fee]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "students.csv";
  a.click();
}

// ─── Icon Components ──────────────────────────────────────────────────────────
const EyeIcon   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const CloseIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [students, setStudents]       = useState(DUMMY_STUDENTS);
  const [search, setSearch]           = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [filterGender, setFilterGender]   = useState("All");
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState([]);
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);  // null = closed, {} = new, {...} = edit
  const [deleteId, setDeleteId]       = useState(null);
  const [showAddEdit, setShowAddEdit] = useState(false);

  // Filtered + searched
  const filtered = useMemo(() => {
    return students.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.roll.includes(q) || `class ${s.class}`.includes(q);
      const matchClass   = filterClass   === "All" || s.class   === filterClass;
      const matchSection = filterSection === "All" || s.section === filterSection;
      const matchGender  = filterGender  === "All" || s.gender  === filterGender;
      return matchSearch && matchClass && matchSection && matchGender;
    });
  }, [students, search, filterClass, filterSection, filterGender]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(s => s.id));

  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => {
    setStudents(s => s.filter(x => x.id !== deleteId));
    setSelected(s => s.filter(x => x !== deleteId));
    setDeleteId(null);
  };
  const bulkDelete = () => {
    setStudents(s => s.filter(x => !selected.includes(x.id)));
    setSelected([]);
  };
  const handleSave = (form) => {
    if (form.id) {
      setStudents(s => s.map(x => x.id === form.id ? { ...x, ...form } : x));
    } else {
      const newS = { ...form, id: Date.now(), attendance: 100, fee: "Paid", avatar: (form.name.split(" ").map(w => w[0]).join("").slice(0,2)).toUpperCase(), avatarBg: "bg-blue-500", recentActivity: ["Just enrolled"] };
      setStudents(s => [...s, newS]);
    }
  };

  const resetFilters = () => { setFilterClass("All"); setFilterSection("All"); setFilterGender("All"); setSearch(""); setPage(1); };

  // Stats
  const totalStudents  = students.length;
  const lowAttendance  = students.filter(s => s.attendance < 75).length;
  const feePending     = students.filter(s => s.fee === "Pending").length;
  const avgAttendance  = Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length);

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
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-56">
              <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, roll, class…"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full" />
            </div>
            {/* Export CSV */}
            <button onClick={() => exportCSV(filtered)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
            {/* Add Student */}
            <button onClick={() => { setEditStudent(null); setShowAddEdit(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Student
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Students", value: totalStudents, color: "text-blue-600",  bg: "bg-blue-50",   icon: "👥" },
              { label: "Avg Attendance", value: avgAttendance + "%", color: "text-green-600", bg: "bg-green-50",  icon: "📊" },
              { label: "Low Attendance", value: lowAttendance, color: "text-amber-600", bg: "bg-amber-50",  icon: "⚠️" },
              { label: "Fee Pending",    value: feePending,    color: "text-red-600",   bg: "bg-red-50",    icon: "💳" },
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
            <Select value={filterClass} onChange={v => { setFilterClass(v); setPage(1); }} options={CLASSES} label="Class" />
            <Select value={filterSection} onChange={v => { setFilterSection(v); setPage(1); }} options={SECTIONS} label="Section" />
            <Select value={filterGender} onChange={v => { setFilterGender(v); setPage(1); }} options={GENDERS} label="Gender" />
            {(filterClass !== "All" || filterSection !== "All" || filterGender !== "All" || search) && (
              <button onClick={resetFilters} className="text-xs text-red-500 font-semibold hover:text-red-600 underline underline-offset-2">Reset</button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-400">{filtered.length} students found</span>
              {selected.length > 0 && (
                <button onClick={bulkDelete} className="text-xs text-red-500 font-semibold px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                  Delete {selected.length} selected
                </button>
              )}
            </div>
          </div>

          {/* ── Table (desktop/tablet) ── */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </th>
                  {["Profile", "Roll No.", "Class", "Gender", "Attendance", "Fee Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? paginated.map(s => (
                  <StudentRow key={s.id} student={s} selected={selected.includes(s.id)}
                    onSelect={toggleSelect} onView={setViewStudent}
                    onEdit={s => { setEditStudent(s); setShowAddEdit(true); }}
                    onDelete={handleDelete} />
                )) : (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="font-medium">No students found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Cards (mobile) ── */}
          <div className="sm:hidden grid grid-cols-1 gap-3">
            {paginated.length > 0 ? paginated.map(s => (
              <StudentCard key={s.id} student={s} onView={setViewStudent}
                onEdit={s => { setEditStudent(s); setShowAddEdit(true); }}
                onDelete={handleDelete} />
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
        </div>
      </main>

      {/* ── Modals ── */}
      {viewStudent && <ViewModal student={viewStudent} onClose={() => setViewStudent(null)} />}
      {showAddEdit && (
        <AddEditModal
          student={editStudent}
          onClose={() => { setShowAddEdit(false); setEditStudent(null); }}
          onSave={handleSave}
        />
      )}
      {deleteId && <DeleteModal onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />}
    </div>
  );
}

function Select({ value, onChange, options, label }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all cursor-pointer">
      {options.map(o => <option key={o} value={o}>{o === "All" ? `All ${label}es` : `${label} ${o}`}</option>)}
    </select>
  );
}

function PaginationBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
      {children}
    </button>
  );
}