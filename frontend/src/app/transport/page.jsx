"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bell, ChevronDown, Search, Download, Plus, X, Save,
  Bus, Users, MapPin, Phone, CheckCircle, AlertCircle,
  Trash2, Pencil, ChevronLeft, ChevronRight,
  Navigation, UserPlus, Clock, Shield,
} from "lucide-react";


// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const ROUTE_STATUS  = ["All Status", "Active", "Inactive", "Under Maintenance"];
const AREA_FILTERS  = ["All Areas", "North Zone", "South Zone", "East Zone", "West Zone", "Central"];
const ROWS_PER_PAGE = 8;

const INITIAL_ROUTES = [
  { id: "RT-001", name: "Route 1 – North Campus",  area: "North Zone",  stops: ["Rajpur Chowk","Civil Lines","Model Town","School Gate"],        vehicle: "VH-001", driver: "Ramesh Kumar",  driverPhone: "9876543210", capacity: 40, enrolled: 35, departureTime: "7:15 AM", returnTime: "2:30 PM", status: "Active",               distance: "12 km" },
  { id: "RT-002", name: "Route 2 – South Avenue",  area: "South Zone",  stops: ["Saket Nagar","Nehru Colony","Gandhi Road","School Gate"],         vehicle: "VH-002", driver: "Suresh Singh",  driverPhone: "9812345678", capacity: 45, enrolled: 42, departureTime: "7:00 AM", returnTime: "2:15 PM", status: "Active",               distance: "15 km" },
  { id: "RT-003", name: "Route 3 – East Valley",   area: "East Zone",   stops: ["Shastri Nagar","Ram Nagar","Station Road","School Gate"],         vehicle: "VH-003", driver: "Dinesh Yadav",  driverPhone: "9867894321", capacity: 38, enrolled: 20, departureTime: "7:30 AM", returnTime: "2:45 PM", status: "Active",               distance: "10 km" },
  { id: "RT-004", name: "Route 4 – West Heights",  area: "West Zone",   stops: ["Vikas Nagar","Indira Colony","MG Road","School Gate"],            vehicle: "VH-004", driver: "Pawan Sharma",  driverPhone: "9823456789", capacity: 42, enrolled: 38, departureTime: "7:10 AM", returnTime: "2:25 PM", status: "Active",               distance: "14 km" },
  { id: "RT-005", name: "Route 5 – Central Park",  area: "Central",     stops: ["City Center","Clock Tower","Main Bazaar","School Gate"],          vehicle: "VH-005", driver: "Mohan Gupta",   driverPhone: "9834567890", capacity: 50, enrolled: 15, departureTime: "7:20 AM", returnTime: "2:35 PM", status: "Inactive",            distance: "8 km"  },
  { id: "RT-006", name: "Route 6 – South Hills",   area: "South Zone",  stops: ["Lakshmi Nagar","Tilak Nagar","Ashok Vihar","School Gate"],        vehicle: "VH-006", driver: "Vijay Tiwari",  driverPhone: "9845678901", capacity: 40, enrolled: 39, departureTime: "7:05 AM", returnTime: "2:20 PM", status: "Active",               distance: "18 km" },
  { id: "RT-007", name: "Route 7 – North Hills",   area: "North Zone",  stops: ["Anand Nagar","Sunder Nagar","Green Park","School Gate"],          vehicle: "VH-007", driver: "Anil Verma",    driverPhone: "9856789012", capacity: 35, enrolled: 0,  departureTime: "7:25 AM", returnTime: "2:40 PM", status: "Under Maintenance",   distance: "11 km" },
];

const INITIAL_VEHICLES = [
  { id: "VH-001", number: "UP-32-AB-1234", type: "Bus",     capacity: 40, model: "Tata Starbus",   year: 2020, status: "Active",             lastService: "2025-01-05" },
  { id: "VH-002", number: "UP-32-CD-5678", type: "Bus",     capacity: 45, model: "Ashok Leyland",  year: 2019, status: "Active",             lastService: "2025-01-03" },
  { id: "VH-003", number: "UP-32-EF-9012", type: "Mini Bus",capacity: 38, model: "Tata Winger",    year: 2021, status: "Active",             lastService: "2024-12-28" },
  { id: "VH-004", number: "UP-32-GH-3456", type: "Bus",     capacity: 42, model: "Force Traveller", year: 2022, status: "Active",            lastService: "2025-01-08" },
  { id: "VH-005", number: "UP-32-IJ-7890", type: "Bus",     capacity: 50, model: "Volvo 9400",     year: 2018, status: "Inactive",           lastService: "2024-11-20" },
  { id: "VH-006", number: "UP-32-KL-2345", type: "Mini Bus",capacity: 40, model: "Tata Winger",    year: 2023, status: "Active",             lastService: "2025-01-10" },
  { id: "VH-007", number: "UP-32-MN-6789", type: "Bus",     capacity: 35, model: "Ashok Leyland",  year: 2017, status: "Under Maintenance",  lastService: "2024-10-15" },
];

const STUDENTS_ON_BUS = [
  { id: "STU-001", name: "Aarav Sharma",  class: "10-A", routeId: "RT-001", stop: "Civil Lines"     },
  { id: "STU-002", name: "Priya Mehta",   class: "10-B", routeId: "RT-002", stop: "Nehru Colony"    },
  { id: "STU-003", name: "Rohan Verma",   class: "11-A", routeId: "RT-001", stop: "Rajpur Chowk"    },
  { id: "STU-004", name: "Sneha Gupta",   class: "11-B", routeId: "RT-003", stop: "Ram Nagar"       },
  { id: "STU-005", name: "Kiran Patel",   class: "12-A", routeId: "RT-002", stop: "Gandhi Road"     },
  { id: "STU-006", name: "Arjun Singh",   class: "12-B", routeId: "RT-004", stop: "Vikas Nagar"     },
  { id: "STU-007", name: "Divya Nair",    class: "10-A", routeId: "RT-001", stop: "Model Town"      },
  { id: "STU-008", name: "Rahul Das",     class: "10-B", routeId: "RT-006", stop: "Lakshmi Nagar"   },
];

const STATUS_COLOR = {
  "Active":             { badge: "bg-green-50 text-green-700 ring-green-200", dot: "bg-green-500"  },
  "Inactive":           { badge: "bg-gray-100 text-gray-500 ring-gray-200",   dot: "bg-gray-400"   },
  "Under Maintenance":  { badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500"  },
};

const AREA_COLOR = {
  "North Zone": { bg: "bg-blue-50",   text: "text-blue-700"   },
  "South Zone": { bg: "bg-rose-50",   text: "text-rose-700"   },
  "East Zone":  { bg: "bg-violet-50", text: "text-violet-700" },
  "West Zone":  { bg: "bg-amber-50",  text: "text-amber-700"  },
  "Central":    { bg: "bg-teal-50",   text: "text-teal-700"   },
};

const EMPTY_ROUTE = { name: "", area: "North Zone", stops: ["", "School Gate"], vehicle: "VH-001", driver: "", driverPhone: "", capacity: 40, departureTime: "7:15 AM", returnTime: "2:30 PM", status: "Active", distance: "" };


// ─────────────────────────────────────────────
// SMALL UI
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

function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] ?? STATUS_COLOR["Inactive"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${c.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{status}
    </span>
  );
}

function CapacityBar({ enrolled, capacity }) {
  const pct = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
  const color = pct >= 95 ? "bg-red-400" : pct >= 80 ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">{enrolled}<span className="text-gray-400 font-normal">/{capacity}</span></span>
        <span className="text-[10px] text-gray-400">{pct}%</span>
      </div>
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// ADD / EDIT ROUTE MODAL
// ─────────────────────────────────────────────

function RouteModal({ initial, vehicles, onClose, onSave }) {
  const isEdit = !!initial?.id;
  const [form, setForm]   = useState(initial ? { ...initial, stops: [...initial.stops] } : { ...EMPTY_ROUTE, stops: ["", "School Gate"] });
  const [errors, setErrors] = useState({});

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: "" })); }
  function setStop(i, val) { setForm(p => { const s = [...p.stops]; s[i] = val; return { ...p, stops: s }; }); }
  function addStop()       { setForm(p => { const s = [...p.stops]; s.splice(s.length - 1, 0, ""); return { ...p, stops: s }; }); }
  function removeStop(i)   { setForm(p => { const s = p.stops.filter((_, j) => j !== i); return { ...p, stops: s }; }); }

  function validate() {
    const e = {};
    if (!form.name.trim())   e.name   = "Route name is required";
    if (!form.driver.trim()) e.driver = "Driver name is required";
    if (!form.distance.trim()) e.distance = "Distance is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const stops = form.stops.filter(s => s.trim());
    onSave({ ...form, stops, id: initial?.id ?? `RT-${String(Date.now()).slice(-3)}`, enrolled: initial?.enrolled ?? 0 });
  }

  const inp = (key) => `w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${errors[key] ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`;
  const sel = "w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Route" : "Add New Route"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? "Update route details" : "Create a new transport route"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Route name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Route Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Route 1 – North Campus" className={inp("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Area + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Area</label>
              <div className="relative">
                <select value={form.area} onChange={e => set("area", e.target.value)} className={sel}>
                  {["North Zone","South Zone","East Zone","West Zone","Central"].map(a => <option key={a}>{a}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => set("status", e.target.value)} className={sel}>
                  {["Active","Inactive","Under Maintenance"].map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Vehicle + Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Vehicle</label>
              <div className="relative">
                <select value={form.vehicle} onChange={e => set("vehicle", e.target.value)} className={sel}>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.number} ({v.type})</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Capacity</label>
              <input type="number" min="1" value={form.capacity} onChange={e => set("capacity", parseInt(e.target.value) || 1)} className={inp("capacity")} />
            </div>
          </div>

          {/* Driver + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Driver Name *</label>
              <input value={form.driver} onChange={e => set("driver", e.target.value)} placeholder="e.g. Ramesh Kumar" className={inp("driver")} />
              {errors.driver && <p className="text-xs text-red-500 mt-1">{errors.driver}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Driver Phone</label>
              <input value={form.driverPhone} onChange={e => set("driverPhone", e.target.value)} placeholder="e.g. 9876543210" className={inp("driverPhone")} />
            </div>
          </div>

          {/* Departure + Return time + Distance */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Departure</label>
              <input value={form.departureTime} onChange={e => set("departureTime", e.target.value)} placeholder="7:15 AM" className={inp("departureTime")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Return</label>
              <input value={form.returnTime} onChange={e => set("returnTime", e.target.value)} placeholder="2:30 PM" className={inp("returnTime")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Distance *</label>
              <input value={form.distance} onChange={e => set("distance", e.target.value)} placeholder="12 km" className={inp("distance")} />
              {errors.distance && <p className="text-xs text-red-500 mt-1">{errors.distance}</p>}
            </div>
          </div>

          {/* Stops */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Bus Stops</label>
            <div className="space-y-2">
              {form.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex-shrink-0">{i + 1}</div>
                  <input value={stop} onChange={e => setStop(i, e.target.value)}
                    placeholder={i === form.stops.length - 1 ? "School Gate" : `Stop ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" />
                  {form.stops.length > 2 && i !== form.stops.length - 1 && (
                    <button onClick={() => removeStop(i)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><X size={13} /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addStop}
              className="mt-2 text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              <Plus size={12} /> Add Stop
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all hover:scale-[1.02]">
            <Save size={14} />{isEdit ? "Update Route" : "Add Route"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// ROUTE DETAIL MODAL (stops + assigned students)
// ─────────────────────────────────────────────

function RouteDetailModal({ route, students, vehicles, onClose }) {
  const vehicle  = vehicles.find(v => v.id === route.vehicle);
  const assigned = students.filter(s => s.routeId === route.id);
  const area     = AREA_COLOR[route.area] ?? { bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Bus size={18} className="text-blue-600" /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{route.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${area.bg} ${area.text}`}>{route.area}</span>
                <StatusBadge status={route.status} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Vehicle",    value: vehicle?.number ?? route.vehicle, icon: Bus },
              { label: "Driver",     value: route.driver,                     icon: Shield },
              { label: "Departure",  value: route.departureTime,              icon: Clock },
              { label: "Return",     value: route.returnTime,                 icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={11} className="text-gray-400" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Phone + distance */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} className="text-gray-400" />
              <span className="font-medium">{route.driverPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Navigation size={14} className="text-gray-400" />
              <span className="font-medium">{route.distance}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={14} className="text-gray-400" />
              <span className="font-medium">{route.enrolled}/{route.capacity} seats filled</span>
            </div>
          </div>

          {/* Stops */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Bus Stops ({route.stops.length})</p>
            <div className="flex flex-col gap-0">
              {route.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                      ${i === 0 ? "bg-green-100 text-green-700" : i === route.stops.length - 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                      {i + 1}
                    </div>
                    {i < route.stops.length - 1 && <div className="w-0.5 h-5 bg-gray-200 my-0.5" />}
                  </div>
                  <p className={`text-sm py-1 ${i === route.stops.length - 1 ? "font-bold text-blue-600" : "text-gray-700"}`}>{stop}</p>
                  {i === 0 && <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">Start</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Assigned students */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Assigned Students ({assigned.length})</p>
            {assigned.length === 0
              ? <p className="text-sm text-gray-400 italic">No students assigned to this route</p>
              : (
                <div className="space-y-2">
                  {assigned.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.id} · Class {s.class}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={11} className="text-gray-400" />{s.stop}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// VEHICLES MODAL
// ─────────────────────────────────────────────

function VehiclesModal({ vehicles, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Fleet Management</h2>
            <p className="text-xs text-gray-400 mt-0.5">All registered vehicles</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {vehicles.map(v => (
            <div key={v.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Bus size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{v.number}</p>
                <p className="text-xs text-gray-400">{v.type} · {v.model} · {v.year}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <StatusBadge status={v.status} />
                <p className="text-[10px] text-gray-400">Last service: {v.lastService}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-800">{v.capacity}</p>
                <p className="text-[10px] text-gray-400">seats</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-400"><span className="font-semibold text-gray-600">{vehicles.length}</span> vehicles registered</p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// TRANSPORT PAGE
// ─────────────────────────────────────────────

export default function TransportPage() {
  const [routes,       setRoutes]      = useState(INITIAL_ROUTES);
  const [students,     setStudents]    = useState(STUDENTS_ON_BUS);
  const [search,       setSearch]      = useState("");
  const [filterArea,   setFilterArea]  = useState("All Areas");
  const [filterStatus, setFilterStatus]= useState("All Status");
  const [page,         setPage]        = useState(1);
  const [routeModal,   setRouteModal]  = useState(null);   // null | { mode, route? }
  const [detailRoute,  setDetailRoute] = useState(null);   // route object
  const [showVehicles, setShowVehicles]= useState(false);
  const [deleteConf,   setDeleteConf]  = useState(null);   // routeId
  const [toast,        setToast]       = useState(null);

  function showToast(msg, type = "success") {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Filter
  const filtered = useMemo(() => routes.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.driver.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const matchArea   = filterArea   === "All Areas"   || r.area   === filterArea;
    const matchStatus = filterStatus === "All Status"  || r.status === filterStatus;
    return matchSearch && matchArea && matchStatus;
  }), [routes, search, filterArea, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  function goPage(p) { setPage(Math.min(Math.max(1, p), totalPages)); }

  // Stats
  const totalStudents  = routes.reduce((s, r) => s + r.enrolled, 0);
  const activeRoutes   = routes.filter(r => r.status === "Active").length;
  const totalCapacity  = routes.reduce((s, r) => s + r.capacity, 0);
  const maintenance    = routes.filter(r => r.status === "Under Maintenance").length;

  // Save route
  function handleSaveRoute(route) {
    setRoutes(prev => {
      const idx = prev.findIndex(r => r.id === route.id);
      if (idx > -1) { const u = [...prev]; u[idx] = route; return u; }
      return [...prev, route];
    });
    setRouteModal(null);
    showToast(route.id.length > 6 ? "Route added" : "Route updated", "success");
  }

  // Delete route
  function handleDeleteRoute(id) {
    setRoutes(prev => prev.filter(r => r.id !== id));
    setStudents(prev => prev.filter(s => s.routeId !== id));
    setDeleteConf(null);
    showToast("Route removed", "info");
  }

  // Export CSV
  function handleExport() {
    const rows = [
      ["Route ID", "Name", "Area", "Driver", "Phone", "Vehicle", "Capacity", "Enrolled", "Departure", "Return", "Distance", "Status"],
      ...filtered.map(r => [r.id, r.name, r.area, r.driver, r.driverPhone, r.vehicle, r.capacity, r.enrolled, r.departureTime, r.returnTime, r.distance, r.status]),
    ];
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "transport-routes.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as CSV", "info");
  }

  const HEADERS = ["Route", "Route ID", "Area", "Driver", "Timing", "Occupancy", "Status", "Actions"];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100
                           flex items-center justify-between gap-4 px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64 max-w-full ml-10 lg:ml-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search routes, drivers…" value={search}
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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transport</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage routes, vehicles, and student transport</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white
                           text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <Download size={15} /> Export
              </button>
              <button onClick={() => setShowVehicles(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50
                           text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all shadow-sm">
                <Bus size={15} /> Fleet ({INITIAL_VEHICLES.length})
              </button>
              <button onClick={() => setRouteModal({ mode: "add" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700
                           text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.99]">
                <Plus size={15} /> Add Route
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Routes"     value={routes.length}  icon={Navigation} accent="text-blue-600"   bg="bg-blue-50"   sub={`${activeRoutes} active routes`}         />
            <SummaryCard label="Students Enrolled" value={totalStudents}  icon={Users}      accent="text-violet-600" bg="bg-violet-50" sub="Using school transport"                   />
            <SummaryCard label="Total Capacity"   value={totalCapacity}  icon={Bus}        accent="text-emerald-600"bg="bg-emerald-50"sub="Seats across all routes"                  />
            <SummaryCard label="Under Maintenance" value={maintenance}    icon={AlertCircle}accent="text-amber-600"  bg="bg-amber-50"  sub={maintenance > 0 ? "Needs attention" : "All vehicles operational"} />
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                          flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" value={search} placeholder="Search route name, driver..."
                onChange={e => { setSearch(e.target.value); goPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                           text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all" />
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <div className="relative">
                <select value={filterArea} onChange={e => { setFilterArea(e.target.value); goPage(1); }}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white
                             text-sm text-gray-700 font-medium cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all">
                  {AREA_FILTERS.map(a => <option key={a}>{a}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); goPage(1); }}
                  className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white
                             text-sm text-gray-700 font-medium cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-300 transition-all">
                  {ROUTE_STATUS.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <p className="text-sm text-gray-400 self-center whitespace-nowrap">{filtered.length} routes</p>
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
                  {paginated.map(route => {
                    const area = AREA_COLOR[route.area] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                    const vehicle = INITIAL_VEHICLES.find(v => v.id === route.vehicle);
                    return (
                      <tr key={route.id} className="hover:bg-blue-50/30 transition-colors group">

                        {/* Route name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Bus size={16} className="text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{route.name}</p>
                              <p className="text-xs text-gray-400">{vehicle?.number ?? route.vehicle} · {route.distance}</p>
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{route.id}</span>
                        </td>

                        {/* Area */}
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${area.bg} ${area.text}`}>{route.area}</span>
                        </td>

                        {/* Driver */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Shield size={12} className="text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{route.driver}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Phone size={10} />{route.driverPhone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Timing */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock size={11} className="text-green-500" />
                              <span>Dep: {route.departureTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock size={11} className="text-blue-500" />
                              <span>Ret: {route.returnTime}</span>
                            </div>
                          </div>
                        </td>

                        {/* Occupancy */}
                        <td className="px-5 py-4">
                          <CapacityBar enrolled={route.enrolled} capacity={route.capacity} />
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4"><StatusBadge status={route.status} /></td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setDetailRoute(route)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View details">
                              <MapPin size={14} />
                            </button>
                            <button onClick={() => setRouteModal({ mode: "edit", route })}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteConf(route.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {paginated.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Bus size={32} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">No routes found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or add a new route</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span>{" "}
                  of <span className="font-semibold text-gray-600">{filtered.length}</span> routes
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
      {routeModal && (
        <RouteModal
          initial={routeModal.route}
          vehicles={INITIAL_VEHICLES}
          onClose={() => setRouteModal(null)}
          onSave={handleSaveRoute}
        />
      )}
      {detailRoute && (
        <RouteDetailModal
          route={detailRoute}
          students={students}
          vehicles={INITIAL_VEHICLES}
          onClose={() => setDetailRoute(null)}
        />
      )}
      {showVehicles && (
        <VehiclesModal
          vehicles={INITIAL_VEHICLES}
          onClose={() => setShowVehicles(false)}
        />
      )}
      {deleteConf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Delete Route?</h3>
              <p className="text-sm text-gray-500 mt-1">This will remove the route and unassign all students from it.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConf(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={() => handleDeleteRoute(deleteConf)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-200 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}