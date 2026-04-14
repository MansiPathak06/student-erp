"use client";

export default function TeacherSummaryCard({ icon: Icon, value, label, iconBg, iconColor, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {trend && (
          <p className={`text-xs font-semibold mt-1 ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
            {trend.positive ? "↑" : "↓"} {trend.text}
          </p>
        )}
      </div>
    </div>
  );
}