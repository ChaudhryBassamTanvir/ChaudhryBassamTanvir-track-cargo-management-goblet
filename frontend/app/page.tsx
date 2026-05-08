// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiBox,
  FiActivity,
  FiMapPin,
  FiBell,
} from 'react-icons/fi';

import { api, Summary, TimelinePoint } from './lib/api';
import { useSocket } from './lib/useSocket';

export default function DashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('goblet_token');

    if (!token) {
      router.push('/login');
      return;
    }

    api.getSummary().then(setSummary);
    api.getTimeline().then(setTimeline);
  }, []);

  useSocket('cargo:update', (d) => {
    setAlerts((prev) => [`${d.cargoId} → ${d.status}`, ...prev].slice(0, 5));
  });

  const get = (arr: { _id: string; count: number }[], key: string) =>
    arr.find((x) => x._id === key)?.count ?? 0;

  const maxCount = Math.max(...timeline.map((t) => t.count), 1);

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-6 lg:p-10">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
        <div>
          <p className="text-sm font-semibold tracking-widest uppercase text-slate-400">
            Dashboard
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-2">
            Welcome back 👋
          </h1>

          <p className="text-slate-500 mt-3">
            Monitor trucks, cargo, deliveries and live transport activity.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FiBell className="text-slate-700 text-lg" />
            </div>

            <div>
              <p className="text-sm text-slate-400">Live Alerts</p>
              <h3 className="font-bold text-slate-900">
                {alerts.length} Updates
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        <DashboardCard
          title="Total Cargo"
          value={summary?.totalCargo ?? '—'}
          icon={<FiBox />}
        />

        <DashboardCard
          title="In Transit"
          value={get(summary?.cargoByStatus ?? [], 'in-transit')}
          icon={<FiTruck />}
        />

        <DashboardCard
          title="Delivered"
          value={get(summary?.cargoByStatus ?? [], 'delivered')}
          icon={<FiCheckCircle />}
        />

        <DashboardCard
          title="Failed Deliveries"
          value={get(summary?.cargoByStatus ?? [], 'failed')}
          icon={<FiAlertCircle />}
        />

        <DashboardCard
          title="Total Trucks"
          value={summary?.totalTrucks ?? '—'}
          icon={<FiActivity />}
        />

        <DashboardCard
          title="Drivers"
          value={summary?.totalDrivers ?? '—'}
          icon={<FiUsers />}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-6">
        
        {/* ACTIVITY CHART */}
        <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Cargo Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Last 30 days overview
              </p>
            </div>

            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Delivered
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                Other
              </div>
            </div>
          </div>

          <div className="h-[260px] flex items-end gap-3">
            {timeline.slice(-20).map((t, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
              >
                <div
                  className="w-full bg-emerald-500 rounded-t-xl transition-all"
                  style={{
                    height: `${(t.delivered / maxCount) * 100}%`,
                  }}
                />

                <div
                  className="w-full bg-slate-200 rounded-b-xl transition-all"
                  style={{
                    height: `${((t.count - t.delivered) / maxCount) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          
          {/* LIVE ALERTS */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <FiBell className="text-amber-600 text-lg" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Live Events
                  </h3>

                  <p className="text-sm text-slate-500">
                    Recent cargo updates
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-700"
                  >
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT CARGO */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Recent Cargo
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Latest shipment activities
              </p>
            </div>

            <div className="space-y-4">
              {summary?.recentCargo.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {c.trackingId}
                    </h4>

                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <FiMapPin />

                      <span>
                        {c.origin} → {c.destination}
                      </span>
                    </div>
                  </div>

                  <CargoStatus status={c.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h3 className="text-3xl font-bold text-slate-900 mt-3">
            {value}
          </h3>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function CargoStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered:
      'bg-emerald-100 text-emerald-700',
    failed:
      'bg-red-100 text-red-600',
    'in-transit':
      'bg-blue-100 text-blue-700',
  };

  return (
    <div
      className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize ${
        styles[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </div>
  );
}