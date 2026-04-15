"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { apiFetch, getUser, logout } from "@/lib/api";
import {
  Users, TrendingUp, BookOpen, CalendarCheck,
  ArrowUpRight, Bell, Search, ChevronDown,
} from "lucide-react";

const AVATAR_COLORS = ["bg-blue-500","bg-violet-500","bg-rose-500","bg-amber-500","bg-emerald-500"];
const FEE_COLOR = {
  Paid:    "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [stats, setStats]         = useState(null);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const user = getUser();

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashData, studentsData] = await Promise.all([
          apiFetch("/admin/dashboard"),
          apiFetch("/admin/students"),
        ]);
        setStats(dashData);
        // Show 5 most recent
        setStudents((studentsData || []).slice(0, 5));
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const STATS_CONFIG = stats ? [
    { label: "Total Students",  value: stats.totalStudents?.toLocaleString(), change: "Live",  icon: Users,        color: "bg-blue-50 text-blue-600" },
    { label: "Attendance Rate", value: `${stats.attendanceRate}%`,            change: "30d",   icon: CalendarCheck, color: "bg-green-50 text-green-600" },
    { label: "Active Courses",  value: stats.totalClasses,                    change: "Live",  icon: BookOpen,     color: "bg-violet-50 text-violet-600" },
    { label: "Revenue (Month)", value: `₹${(stats.monthlyRevenue/100000).toFixed(1)}L`, change: "This month", icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search students, classes…"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full" />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>

            <button onClick={logout} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user?.name || "Admin")}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name || "Admin"}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 space-y-8">

          {/* Greeting */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user?.name?.split(" ")[0] || "Admin"} 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Here's what's happening at your school today.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {/* Stats grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {STATS_CONFIG.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                      <s.icon size={18} />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <ArrowUpRight size={12} /> {s.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recent students */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Students</h2>
              <a href="/students" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</a>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-1">No students yet</p>
                <p className="text-sm">Add students from the Students page</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Student", "Class", "Fee Status", "Action"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.map((s, i) => (
                      <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold`}>
                              {getInitials(s.name)}
                            </div>
                            <span className="font-medium text-gray-900">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {s.class}{s.section ? `-${s.section}` : ""}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${FEE_COLOR[s.fee_status] || FEE_COLOR.Pending}`}>
                            {s.fee_status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a href="/students" className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline">
                            View profile
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}