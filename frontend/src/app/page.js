"use client";

import Sidebar from "@/components/Sidebar";
import {
  Users, TrendingUp, BookOpen, CalendarCheck,
  ArrowUpRight, Bell, Search, ChevronDown,
} from "lucide-react";

const STATS = [
  { label: "Total Students", value: "2,847", change: "+4.6%", icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Attendance Rate", value: "94.2%", change: "+1.2%", icon: CalendarCheck, color: "bg-green-50 text-green-600" },
  { label: "Active Courses", value: "138", change: "+8", icon: BookOpen, color: "bg-violet-50 text-violet-600" },
  { label: "Revenue (May)", value: "₹18.4L", change: "+12%", icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
];

const RECENT = [
  { name: "Aarav Sharma",    class: "10-A", fee: "Paid",    avatar: "AS" },
  { name: "Priya Mehta",     class: "8-B",  fee: "Pending", avatar: "PM" },
  { name: "Rohan Verma",     class: "12-C", fee: "Paid",    avatar: "RV" },
  { name: "Sneha Gupta",     class: "9-A",  fee: "Overdue", avatar: "SG" },
  { name: "Kiran Patel",     class: "11-B", fee: "Paid",    avatar: "KP" },
];

const FEE_COLOR = {
  Paid:    "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500",
];

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search students, classes…"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>

            {/* Avatar */}
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
                              flex items-center justify-center text-white text-xs font-bold">
                AP
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page body */}
        <div className="flex-1 p-6 lg:p-8 space-y-8">

          {/* Greeting */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, Admin 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Here's what's happening at your school today.</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                                     hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
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

          {/* Recent students table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Students</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Student", "Class", "Fee Status", "Action"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {RECENT.map((s, i) => (
                    <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]}
                                          flex items-center justify-center text-white text-xs font-bold`}>
                            {s.avatar}
                          </div>
                          <span className="font-medium text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{s.class}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${FEE_COLOR[s.fee]}`}>
                          {s.fee}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline">
                          View profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}