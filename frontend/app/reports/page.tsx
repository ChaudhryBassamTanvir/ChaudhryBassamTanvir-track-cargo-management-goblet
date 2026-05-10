// app/reports/page.tsx

'use client';

import { useState, useEffect } from 'react';

import {
  FiTrendingUp,
  FiTruck,
  FiPackage,
  FiActivity,
  FiBarChart2,
} from 'react-icons/fi';

import { api, Summary, TimelinePoint } from '../lib/api';

import StatusBadge from '../components/StatusBadge';

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);

  useEffect(() => {
    api.getSummary().then(setSummary);

    api.getTimeline().then(setTimeline);
  }, []);

  const maxCount = Math.max(
    ...timeline.map((t) => t.count),
    1
  );

  const deliveryRate = summary
    ? Math.round(
        ((summary.cargoByStatus.find(
          (x) => x._id === 'delivered'
        )?.count ?? 0) /
          Math.max(summary.totalCargo, 1)) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-6 lg:p-10">
      
      {/* HEADER */}
      <div className="mb-10">
        
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-slate-400">
          Analytics & Insights
        </p>

        <h1 className="text-4xl font-bold text-slate-900 mt-3">
          Reports Dashboard
        </h1>

        <p className="text-slate-500 mt-3 max-w-2xl">
          Analyze shipment performance, delivery rates,
          cargo activity and fleet efficiency.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* DELIVERY RATE */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Delivery Rate
              </p>

              <h2 className="text-4xl font-bold text-emerald-500 mt-3">
                {deliveryRate}%
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
              <FiTrendingUp />
            </div>
          </div>
        </div>

        {/* TOTAL SHIPMENTS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Total Shipments
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mt-3">
                {summary?.totalCargo ?? '—'}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-2xl">
              <FiPackage />
            </div>
          </div>
        </div>

        {/* FLEET */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Fleet Size
              </p>

              <h2 className="text-4xl font-bold text-blue-500 mt-3">
                {summary?.totalTrucks ?? '—'}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
              <FiTruck />
            </div>
          </div>
        </div>

        {/* DRIVERS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Active Drivers
              </p>

              <h2 className="text-4xl font-bold text-violet-500 mt-3">
                {summary?.totalDrivers ?? '—'}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center text-2xl">
              <FiActivity />
            </div>
          </div>
        </div>
      </div>

      {/* STATUS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        
        {/* CARGO STATUS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm">
          
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-xl">
              <FiPackage />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Cargo Status
              </h2>

              <p className="text-sm text-slate-500">
                Shipment distribution overview
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {(summary?.cargoByStatus ?? []).map((s) => (
              <div key={s._id}>
                
                <div className="flex items-center justify-between mb-2">
                  
                  <div className="flex items-center gap-3">
                    <StatusBadge status={s._id} />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {s.count}
                  </span>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (s.count /
                          Math.max(
                            summary?.totalCargo ?? 1,
                            1
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FLEET STATUS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm">
          
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
              <FiTruck />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Fleet Status
              </h2>

              <p className="text-sm text-slate-500">
                Truck operational status
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {(summary?.truckByStatus ?? []).map((s) => (
              <div key={s._id}>
                
                <div className="flex items-center justify-between mb-2">
                  
                  <div className="flex items-center gap-3">
                    <StatusBadge status={s._id} />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {s.count}
                  </span>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (s.count /
                          Math.max(
                            summary?.totalTrucks ?? 1,
                            1
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm">
        
        <div className="flex items-center justify-between mb-8">
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Shipment Trend
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Last 30 days shipment activity
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl text-slate-700">
            <FiBarChart2 />
          </div>
        </div>

        {/* CHART */}
        <div className="h-[300px] flex items-end gap-3">
          
          {timeline.map((t, i) => (
            <div
              key={i}
              className="flex-1 h-full flex flex-col justify-end gap-1 group cursor-pointer"
              title={`${t._id}: ${t.count} total shipments`}
            >
              
              <div
                className="bg-emerald-500 rounded-t-xl transition-all duration-300 group-hover:opacity-90"
                style={{
                  height: `${
                    (t.delivered / maxCount) * 100
                  }%`,
                }}
              />

              <div
                className="bg-slate-200 rounded-b-xl transition-all duration-300 group-hover:bg-slate-300"
                style={{
                  height: `${
                    ((t.count - t.delivered) /
                      maxCount) *
                    100
                  }%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* LEGEND */}
        <div className="flex items-center gap-8 mt-8 text-sm">
          
          <div className="flex items-center gap-3 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />

            Delivered
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-slate-300" />

            Other Statuses
          </div>
        </div>
      </div>
    </div>
  );
}