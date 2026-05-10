// app/tracking/page.tsx

'use client';

import { useState, useEffect } from 'react';

import {
  FiMapPin,
  FiTruck,
  FiNavigation,
  FiActivity,
  FiUsers,
} from 'react-icons/fi';

import { api, Truck } from '../lib/api';

import { useSocket } from '../lib/useSocket';

import StatusBadge from '../components/StatusBadge';

/* -------------------------------------------------------------------------- */
/*                                   MAP UI                                   */
/* -------------------------------------------------------------------------- */

function PakistanMap({ trucks }: { trucks: Truck[] }) {
  const toSVG = (lat: number, lng: number) => ({
    x: ((lng - 60.5) / (77.5 - 60.5)) * 560 + 20,
    y: ((37.5 - lat) / (37.5 - 23.5)) * 380 + 20,
  });

  const cities = [
    { name: 'Karachi', lat: 24.86, lng: 67.01 },
    { name: 'Lahore', lat: 31.52, lng: 74.36 },
    { name: 'Islamabad', lat: 33.72, lng: 73.06 },
    { name: 'Peshawar', lat: 34.01, lng: 71.57 },
    { name: 'Quetta', lat: 30.18, lng: 67.0 },
    { name: 'Multan', lat: 30.19, lng: 71.47 },
    { name: 'Faisalabad', lat: 31.41, lng: 73.07 },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm overflow-hidden">
      
      <div className="flex items-center justify-between mb-5">
        
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Live Fleet Map
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Real-time truck positions across Pakistan
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-xl">
          <FiNavigation />
        </div>
      </div>

      <svg
        width="100%"
        viewBox="0 0 600 420"
        className="bg-gradient-to-br from-slate-50 to-sky-50 rounded-3xl"
      >
        
        {/* GRID */}
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1={20 + i * 70}
            y1="20"
            x2={20 + i * 70}
            y2="400"
            stroke="#CBD5E1"
            strokeWidth="0.5"
          />
        ))}

        {[...Array(7)].map((_, i) => (
          <line
            key={i}
            x1="20"
            y1={20 + i * 60}
            x2="580"
            y2={20 + i * 60}
            stroke="#CBD5E1"
            strokeWidth="0.5"
          />
        ))}

        {/* CITIES */}
        {cities.map((c) => {
          const { x, y } = toSVG(c.lat, c.lng);

          return (
            <g key={c.name}>
              
              <circle
                cx={x}
                cy={y}
                r={5}
                fill="#2563EB"
              />

              <circle
                cx={x}
                cy={y}
                r={10}
                fill="#2563EB"
                opacity={0.15}
              />

              <text
                x={x + 8}
                y={y + 4}
                fontSize="11"
                fill="#475569"
                fontWeight="600"
              >
                {c.name}
              </text>
            </g>
          );
        })}

        {/* TRUCKS */}
        {trucks.map((t) => {
          const { x, y } = toSVG(
            t.location?.lat ?? 30,
            t.location?.lng ?? 70
          );

          const color =
            t.status === 'in-transit'
              ? '#8B5CF6'
              : t.status === 'maintenance'
              ? '#F97316'
              : '#10B981';

          return (
            <g key={t._id}>
              
              <circle
                cx={x}
                cy={y}
                r={16}
                fill={color}
                opacity={0.12}
              />

              <circle
                cx={x}
                cy={y}
                r={9}
                fill={color}
              />

              <circle
                cx={x}
                cy={y}
                r={4}
                fill="#fff"
              />

              <text
                x={x + 12}
                y={y - 10}
                fontSize="10"
                fill="#0F172A"
                fontWeight="700"
              >
                {t.plateNumber}
              </text>
            </g>
          );
        })}

        <text
          x="20"
          y="415"
          fontSize="10"
          fill="#94A3B8"
        >
          Goblet Logistics · Pakistan Live Fleet Network
        </text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                TRACKING PAGE                               */
/* -------------------------------------------------------------------------- */

export default function TrackingPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);

  const [selected, setSelected] =
    useState<Truck | null>(null);

  useEffect(() => {
    api.getTrucks().then(setTrucks);
  }, []);

  useSocket('db:change', () => {
    api.getTrucks().then(setTrucks);
  });

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-6 lg:p-10">
      
      {/* HEADER */}
      <div className="mb-10">
        
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-slate-400">
          Fleet Monitoring
        </p>

        <h1 className="text-4xl font-bold text-slate-900 mt-3">
          Live Tracking
        </h1>

        <p className="text-slate-500 mt-3 max-w-2xl">
          Monitor your active trucks, routes and delivery
          operations in real-time using live WebSocket updates.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Total Fleet
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mt-3">
                {trucks.length}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-700">
              <FiTruck />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Active Trucks
              </p>

              <h2 className="text-4xl font-bold text-emerald-500 mt-3">
                {
                  trucks.filter(
                    (t) => t.status === 'in-transit'
                  ).length
                }
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
              <p className="text-sm text-slate-500">
                Drivers Active
              </p>

              <h2 className="text-4xl font-bold text-violet-500 mt-3">
                {
                  trucks.filter((t) => t.driverName)
                    .length
                }
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl text-violet-600">
              <FiUsers />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        
        {/* MAP */}
        <PakistanMap trucks={trucks} />

        {/* SIDEBAR */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm h-fit">
          
          <div className="flex items-center justify-between mb-6">
            
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Fleet
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {trucks.length} trucks available
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-lg">
              <FiTruck />
            </div>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
            
            {trucks.map((t) => (
              <div
                key={t._id}
                onClick={() =>
                  setSelected(
                    t._id === selected?._id ? null : t
                  )
                }
                className={`rounded-3xl border p-5 cursor-pointer transition-all duration-300 ${
                  selected?._id === t._id
                    ? 'border-violet-300 bg-violet-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                
                <div className="flex items-start justify-between">
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {t.plateNumber}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {t.driverName || 'No Driver'}
                    </p>
                  </div>

                  <StatusBadge status={t.status} />
                </div>

                {/* EXPANDED */}
                {selected?._id === t._id && (
                  <div className="mt-5 pt-5 border-t border-slate-200 space-y-4 animate-in fade-in duration-300">
                    
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <FiMapPin />
                      </div>

                      <span>
                        {t.location?.lat?.toFixed(4)},
                        {' '}
                        {t.location?.lng?.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <FiTruck />
                      </div>

                      <span>
                        Capacity:{' '}
                        {t.capacity.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {trucks.length === 0 && (
              <div className="text-center py-16">
                
                <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-3xl text-slate-500 mb-5">
                  <FiTruck />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  No Trucks Found
                </h3>

                <p className="text-slate-500 mt-2">
                  No fleet vehicles are currently available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}