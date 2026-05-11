'use client';

import { useState, useEffect } from 'react';
import {
  FiMapPin, FiTruck, FiNavigation,
  FiActivity, FiUsers,
} from 'react-icons/fi';
import { api, Truck } from '../lib/api';
import { useSocket } from '../lib/useSocket';
import StatusBadge from '../components/StatusBadge';

const CITIES = [
  { name: 'Karachi',    lat: 24.86, lng: 67.01 },
  { name: 'Lahore',     lat: 31.52, lng: 74.36 },
  { name: 'Islamabad',  lat: 33.72, lng: 73.06 },
  { name: 'Peshawar',   lat: 34.01, lng: 71.57 },
  { name: 'Quetta',     lat: 30.18, lng: 67.00 },
  { name: 'Multan',     lat: 30.19, lng: 71.47 },
  { name: 'Faisalabad', lat: 31.41, lng: 73.07 },
  { name: 'Rawalpindi', lat: 33.60, lng: 73.04 },
  { name: 'Hyderabad',  lat: 25.39, lng: 68.37 },
  { name: 'Sialkot',    lat: 32.49, lng: 74.53 },
];

// Convert lat/lng to SVG x/y
const toSVG = (lat: number, lng: number) => ({
  x: ((lng - 60.5) / (77.5 - 60.5)) * 540 + 30,
  y: ((37.5 - lat) / (37.5 - 23.5)) * 360 + 30,
});

const TRUCK_COLORS: Record<string, string> = {
  'in-transit': '#8B5CF6',
  maintenance:  '#F97316',
  idle:         '#10B981',
};

function PakistanMap({ trucks, selected, onSelect }: {
  trucks: Truck[];
  selected: Truck | null;
  onSelect: (t: Truck) => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live Fleet Map</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time truck positions across Pakistan
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
          <FiNavigation />
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl"
           style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #fefce8 100%)', minHeight: 420 }}>
        <svg
          width="100%"
          viewBox="0 0 600 420"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid */}
          {[...Array(10)].map((_, i) => (
            <line key={`v${i}`} x1={30 + i * 58} y1="20" x2={30 + i * 58} y2="400"
              stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}
          {[...Array(8)].map((_, i) => (
            <line key={`h${i}`} x1="20" y1={30 + i * 50} x2="580" y2={30 + i * 50}
              stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}

          {/* Route lines between cities */}
          {[
            [CITIES[0], CITIES[5]], // Karachi - Multan
            [CITIES[5], CITIES[1]], // Multan - Lahore
            [CITIES[1], CITIES[6]], // Lahore - Faisalabad
            [CITIES[1], CITIES[2]], // Lahore - Islamabad
            [CITIES[2], CITIES[3]], // Islamabad - Peshawar
            [CITIES[2], CITIES[7]], // Islamabad - Rawalpindi
            [CITIES[4], CITIES[5]], // Quetta - Multan
            [CITIES[0], CITIES[8]], // Karachi - Hyderabad
            [CITIES[1], CITIES[9]], // Lahore - Sialkot
          ].map(([a, b], i) => {
            const p1 = toSVG(a.lat, a.lng);
            const p2 = toSVG(b.lat, b.lng);
            return (
              <line key={i}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5" />
            );
          })}

          {/* Cities */}
          {CITIES.map((c) => {
            const { x, y } = toSVG(c.lat, c.lng);
            return (
              <g key={c.name}>
                <circle cx={x} cy={y} r={12} fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
                <circle cx={x} cy={y} r={5}  fill="#3B82F6" />
                <text x={x} y={y + 22} fontSize="10" fill="#475569"
                  fontWeight="600" textAnchor="middle">
                  {c.name}
                </text>
              </g>
            );
          })}

          {/* Trucks */}
          {trucks.map((t) => {
            const lat = t.location?.lat ?? 31.52;
            const lng = t.location?.lng ?? 74.36;
            const { x, y } = toSVG(lat, lng);
            const color = TRUCK_COLORS[t.status] ?? '#10B981';
            const isSelected = selected?._id === t._id;

            return (
              <g key={t._id} onClick={() => onSelect(t)}
                style={{ cursor: 'pointer' }}>
                {/* Pulse ring */}
                <circle cx={x} cy={y} r={isSelected ? 22 : 16}
                  fill={color} opacity="0.15" />
                <circle cx={x} cy={y} r={isSelected ? 14 : 10}
                  fill={color} opacity="0.25" />
                {/* Truck dot */}
                <circle cx={x} cy={y} r={8} fill={color} stroke="#fff" strokeWidth="2" />
                {/* Truck icon dot */}
                <circle cx={x} cy={y} r={3} fill="#fff" />
                {/* Label */}
                <rect x={x - 24} y={y - 28} width={48} height={16}
                  rx={4} fill={color} opacity="0.9" />
                <text x={x} y={y - 17} fontSize="9" fill="#fff"
                  fontWeight="700" textAnchor="middle">
                  {t.plateNumber}
                </text>
              </g>
            );
          })}

          <text x="20" y="415" fontSize="9" fill="#94A3B8">
            Goblet Logistics · Pakistan Live Fleet Network
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Idle
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />In Transit
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />Maintenance
        </span>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const [trucks, setTrucks]   = useState<Truck[]>([]);
  const [selected, setSelected] = useState<Truck | null>(null);

  const load = () => api.getTrucks().then(setTrucks);

  useEffect(() => { load(); }, []);

  // Live updates
  useSocket('db:change', () => load());
  useSocket('truck:update', () => load());

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-6 lg:p-10">

      {/* HEADER */}
      <div className="mb-8">
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-slate-400">
          Fleet Monitoring
        </p>
        <h1 className="text-4xl font-bold text-slate-900 mt-3">Live Tracking</h1>
        <p className="text-slate-500 mt-2">
          Real-time truck positions · updates via WebSocket
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Fleet</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-3">{trucks.length}</h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-700">
              <FiTruck />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Trucks</p>
              <h2 className="text-4xl font-bold text-emerald-500 mt-3">
                {trucks.filter(t => t.status === 'in-transit').length}
              </h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl text-emerald-600">
              <FiActivity />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Drivers Active</p>
              <h2 className="text-4xl font-bold text-violet-500 mt-3">
                {trucks.filter(t => t.driverName).length}
              </h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl text-violet-600">
              <FiUsers />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

        <PakistanMap trucks={trucks} selected={selected} onSelect={setSelected} />

        {/* FLEET SIDEBAR */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Fleet</h2>
              <p className="text-sm text-slate-500 mt-1">{trucks.length} trucks</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <FiTruck />
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {trucks.map((t) => (
              <div key={t._id}
                onClick={() => setSelected(t._id === selected?._id ? null : t)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                  selected?._id === t._id
                    ? 'border-violet-300 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{t.plateNumber}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{t.driverName || 'No Driver'}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                {selected?._id === t._id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                        <FiMapPin className="text-xs" />
                      </div>
                      <span>
                        {t.location?.lat?.toFixed(4)}, {t.location?.lng?.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                        <FiTruck className="text-xs" />
                      </div>
                      <span>Capacity: {t.capacity.toLocaleString()} kg</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {trucks.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-2xl text-slate-400 mb-4">
                  <FiTruck />
                </div>
                <p className="text-slate-400 text-sm">No trucks registered</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}