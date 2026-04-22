"use client";

import { useState, useEffect, useCallback } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import { apiFetch } from "@/lib/api";
import { CreditCard, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";

const STATUS_STYLE = {
  Paid:     { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle,   iconColor: "text-emerald-600" },
  Partial:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,         iconColor: "text-amber-600"   },
  Pending:  { bg: "bg-gray-50",    text: "text-gray-600",    border: "border-gray-200",    icon: Clock,         iconColor: "text-gray-400"    },
  Overdue:  { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: AlertCircle,   iconColor: "text-red-600"     },
};

function FeeRow({ label, amount }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">₹{Number(amount || 0).toLocaleString("en-IN")}</span>
    </div>
  );
}

export default function StudentFeesPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiFetch("/fees/student/fees");
      setData(res.data || res);
    } catch {
      setError("Failed to load fee details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const status  = data?.status || "Pending";
  const style   = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;
  const Icon    = style.icon;
  const pending = Number(data?.total_fees || 0) - Number(data?.paid_amount || 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 shadow-sm">
          <div className="pl-10 lg:pl-0 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Fees</h1>
              <p className="text-sm text-gray-400 mt-0.5">Academic Year {data?.academic_year || "2024-25"}</p>
            </div>
            <button onClick={load}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-2xl">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              {error}
              <button onClick={load} className="text-red-700 font-semibold hover:underline text-xs ml-4">Retry</button>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          )}

          {!loading && data && (
            <>
              {/* Status Banner */}
              <div className={`rounded-2xl border p-5 flex items-center gap-4 ${style.bg} ${style.border}`}>
                <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
                  <Icon size={24} className={style.iconColor} />
                </div>
                <div className="flex-1">
                  <p className={`text-lg font-bold ${style.text}`}>{status}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {data.due_date
                      ? `Due: ${new Date(data.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
                      : "No due date set"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{Number(data.total_fees || 0).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-400">Total Fees</p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">₹{Number(data.paid_amount || 0).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-400 mt-1">Amount Paid</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className={`text-2xl font-bold ${pending > 0 ? "text-red-500" : "text-emerald-500"}`}>
                    ₹{pending.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Remaining</p>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900 text-sm">Fee Breakdown</h2>
                </div>
                <div className="px-5 py-2">
                  <FeeRow label="Tuition Fee"   amount={data.tuition_fee}   />
                  <FeeRow label="Library Fee"   amount={data.library_fee}   />
                  <FeeRow label="Transport Fee" amount={data.transport_fee} />
                  <FeeRow label="Other Fee"     amount={data.other_fee}     />
                  <div className="flex items-center justify-between py-3 mt-1 border-t-2 border-gray-200">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-violet-700">₹{Number(data.total_fees || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {data.payments?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-50">
                    <h2 className="font-bold text-gray-900 text-sm">Payment History</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.payments.map((p, i) => (
                      <div key={i} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            ₹{Number(p.amount).toLocaleString("en-IN")}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(p.paid_on).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            {p.recorded_by_name ? ` · ${p.recorded_by_name}` : ""}
                          </p>
                        </div>
                        {p.note && <p className="text-xs text-gray-400 italic max-w-[150px] text-right">{p.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              {data.note && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                  <p className="text-xs font-bold text-amber-700 mb-1">Note from Admin</p>
                  <p className="text-sm text-amber-800">{data.note}</p>
                </div>
              )}
            </>
          )}

          {!loading && !data && !error && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
              <CreditCard size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-base font-semibold text-gray-500">No fee record found</p>
              <p className="text-sm text-gray-400 mt-1">Contact admin for details</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}