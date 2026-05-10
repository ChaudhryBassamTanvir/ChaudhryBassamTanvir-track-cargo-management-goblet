'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import {
  FiPackage,
  FiTruck,
  FiUsers,
  FiTrendingUp,
  FiActivity,
  FiAlertCircle,
  FiZap,
  FiClock,
} from 'react-icons/fi';

import { api, Summary, TimelinePoint } from './lib/api';
import StatusBadge from './components/StatusBadge';
import { useSocket } from './lib/useSocket';

/* -------------------------------------------------------------------------- */
/*                               STAT CARD                                    */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
  delay = 0,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <h2 className={`text-4xl font-bold mt-3 ${color}`}>{value}</h2>
        </div>
        <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DASHBOARD PAGE                                */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('goblet_token')) {
      router.push('/login');
      return;
    }
    api.getSummary().then(setSummary);
    api.getTimeline().then(setTimeline);
  }, []);

  useSocket('cargo:update', (d: any) =>
    setAlerts((p) => [`${d.cargoId} → ${d.status}`, ...p].slice(0, 5))
  );

  useSocket('db:change', () => api.getSummary().then(setSummary));

  const get = (key: string) =>
    summary?.cargoByStatus.find((x) => x._id === key)?.count ?? 0;

  const maxCount = Math.max(...timeline.map((t) => t.count), 1);

  const STATS = [
    {
      label: 'Total Cargo',
      value: summary?.totalCargo ?? '—',
      icon: <FiPackage className="text-slate-700" />,
      color: 'text-slate-900',
      bg: 'bg-slate-100',
    },
    {
      label: 'In Transit',
      value: get('in-transit'),
      icon: <FiActivity className="text-violet-600" />,
      color: 'text-violet-600',
      bg: 'bg-violet-100',
    },
    {
      label: 'Delivered',
      value: get('delivered'),
      icon: <FiTrendingUp className="text-emerald-600" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      label: 'Failed',
      value: get('failed'),
      icon: <FiAlertCircle className="text-red-500" />,
      color: 'text-red-500',
      bg: 'bg-red-100',
    },
    {
      label: 'Total Trucks',
      value: summary?.totalTrucks ?? '—',
      icon: <FiTruck className="text-blue-600" />,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Total Drivers',
      value: summary?.totalDrivers ?? '—',
      icon: <FiUsers className="text-amber-600" />,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-6 lg:p-10">

      {/* HEADER */}
      <div className="mb-10">
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-slate-400">
          Overview
        </p>

        <h1 className="text-4xl font-bold text-slate-900 mt-3">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome back. Here's what's happening at Goblet.
        </p>
      </div>

      {/* LIVE ALERTS */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-8"
        >
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-3">
            <FiZap /> Live Events
          </div>

          {alerts.map((a, i) => (
            <p key={i} className="text-sm text-amber-800 leading-7">
              {a}
            </p>
          ))}
        </motion.div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {STATS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.07} />
        ))}
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

        {/* TIMELINE CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm"
        >
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Cargo Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Last 30 days shipment trend
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-xl">
              <FiActivity />
            </div>
          </div>

          {/* BARS */}
          <div className="h-[200px] flex items-end gap-1.5">
            {timeline.slice(-25).map((t, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end gap-0.5 h-full group cursor-default"
                title={`${t._id}: ${t.count} total`}
              >
                <div
                  className="bg-emerald-500 rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                  style={{
                    height: `${(t.delivered / maxCount) * 100}%`,
                    minHeight: t.delivered ? 3 : 0,
                  }}
                />
                <div
                  className="bg-slate-200 group-hover:bg-slate-300 rounded-b-lg transition-all duration-300"
                  style={{
                    height: `${((t.count - t.delivered) / maxCount) * 100}%`,
                    minHeight: t.count - t.delivered > 0 ? 3 : 0,
                  }}
                />
              </div>
            ))}

            {timeline.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-slate-300 text-sm">
                No data yet
              </div>
            )}
          </div>

          {/* LEGEND */}
          <div className="flex items-center gap-6 mt-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Delivered
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
              Other
            </span>
          </div>
        </motion.div>

        {/* RECENT CARGO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Cargo
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Latest shipment activity
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-xl">
              <FiClock />
            </div>
          </div>

          <div className="space-y-2">
            {(summary?.recentCargo ?? []).map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200"
              >
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {c.trackingId}
                  </p>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.origin} → {c.destination}
                  </p>
                </div>

                <StatusBadge status={c.status} />
              </div>
            ))}

            {!summary?.recentCargo?.length && (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400 mb-4">
                  <FiPackage />
                </div>

                <p className="text-slate-400 text-sm">
                  No cargo yet
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}