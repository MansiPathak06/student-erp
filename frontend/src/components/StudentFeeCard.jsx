"use client";

/**
 * StudentFeeCard.jsx
 *
 * Student dashboard pe apni fees ka breakdown dikhata hai.
 * Transport fee alag row mein dikh'ta hai agar assigned hai.
 *
 * Usage:
 *   <StudentFeeCard studentId={user.student_id} academicYear="2024-25" />
 */

import { useState, useEffect } from "react";
import {
  IndianRupee, CheckCircle, Clock, AlertCircle,
  Bus, BookOpen, GraduationCap, Wrench, Loader2,
} from "lucide-react";

const getToken = () => {
  if (typeof window === "undefined") return null;
  const m = document.cookie.match(/(^| )token=([^;]+)/);
  return m ? m[2] : null;
};

const apiFetch = (path) =>
  fetch(`/api${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });

const STATUS_CONFIG = {
  Paid:    { label:"Paid",    bg:"bg-emerald-50", text:"text-emerald-700", ring:"ring-emerald-200", dot:"bg-emerald-500", icon: CheckCircle, bar:"bg-emerald-400" },
  Partial: { label:"Partial", bg:"bg-blue-50",    text:"text-blue-700",   ring:"ring-blue-200",   dot:"bg-blue-500",   icon: Clock,        bar:"bg-blue-400"   },
  Pending: { label:"Pending", bg:"bg-amber-50",   text:"text-amber-700",  ring:"ring-amber-200",  dot:"bg-amber-500",  icon: Clock,        bar:"bg-amber-400"  },
  Overdue: { label:"Overdue", bg:"bg-red-50",     text:"text-red-700",    ring:"ring-red-200",    dot:"bg-red-500",    icon: AlertCircle,  bar:"bg-red-400"    },
};

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <Icon size={12} />
      {s.label}
    </span>
  );
}

export default function StudentFeeCard({ studentId, academicYear = "2024-25" }) {
  const [fee,     setFee]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    // Fetch from student-facing fees endpoint
    apiFetch(`/student/fees?academic_year=${academicYear}`)
      .then(data => {
        setFee(data.data || data);
        setLoading(false);
      })
      .catch(() => {
        setError("Fee details load nahi ho payi.");
        setLoading(false);
      });
  }, [studentId, academicYear]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading fee details…
      </div>
    );
  }

  if (error || !fee) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
        {error || "Koi fee record nahi mila."}
      </div>
    );
  }

  const status  = fee.status || "Pending";
  const cfg     = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const percent = fee.total_fees > 0
    ? Math.min(100, (Number(fee.paid_amount) / Number(fee.total_fees)) * 100)
    : 0;
  const balance = Number(fee.total_fees) - Number(fee.paid_amount);

  // Fee breakdown rows — only show if > 0
  const breakdown = [
    { label: "Tuition Fee",   value: fee.tuition_fee,   icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Library Fee",   value: fee.library_fee,   icon: BookOpen,      color: "text-amber-500",  bg: "bg-amber-50"  },
    { label: "Other Fee",     value: fee.other_fee,     icon: Wrench,        color: "text-gray-500",   bg: "bg-gray-50"   },
    { label: "Transport Fee", value: fee.transport_fee, icon: Bus,           color: "text-blue-500",   bg: "bg-blue-50",  highlight: true },
  ].filter(r => Number(r.value) > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Top banner */}
      <div className={`${cfg.bg} px-5 py-4 border-b ${cfg.ring.replace("ring-","border-")}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Fee Status · {academicYear}</p>
            <StatusBadge status={status} />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Total Fees</p>
            <p className={`text-2xl font-bold ${cfg.text} flex items-center gap-1`}>
              <IndianRupee size={16} />
              {Number(fee.total_fees).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Paid: ₹{Number(fee.paid_amount).toLocaleString("en-IN")}</span>
            <span>{percent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
              style={{ width: `${percent}%` }}
            />
          </div>
          {balance > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Balance due: <span className="font-semibold text-gray-700">₹{balance.toLocaleString("en-IN")}</span>
              {fee.due_date && (
                <> · Due: <span className="font-semibold">{new Date(fee.due_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span></>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Fee Breakdown */}
      {breakdown.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Fee Breakdown</p>
          <div className="space-y-2">
            {breakdown.map(({ label, value, icon: Icon, color, bg, highlight }) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${highlight ? "border border-blue-100 bg-blue-50/50" : "bg-gray-50"}`}
              >
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={13} className={color} />
                </div>
                <span className={`text-sm flex-1 ${highlight ? "font-semibold text-blue-700" : "text-gray-700"}`}>
                  {label}
                  {highlight && (
                    <span className="ml-1.5 text-[10px] font-semibold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                      Assigned
                    </span>
                  )}
                </span>
                <span className={`text-sm font-bold ${highlight ? "text-blue-700" : "text-gray-900"} flex items-center gap-0.5`}>
                  <IndianRupee size={11} />
                  {Number(value).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment history (if any) */}
      {fee.payments?.length > 0 && (
        <div className="px-5 pb-4 border-t border-gray-50 pt-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Recent Payments</p>
          <div className="space-y-2">
            {fee.payments.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-800">₹{Number(p.amount).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(p.paid_on).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                    {p.recorded_by_name && ` · ${p.recorded_by_name}`}
                  </p>
                </div>
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      {fee.note && (
        <div className="px-5 pb-4">
          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5 italic">
            📝 {fee.note}
          </p>
        </div>
      )}
    </div>
  );
}