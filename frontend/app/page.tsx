'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Summary, TimelinePoint } from '@/lib/api';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { useSocket } from '@/lib/useSocket';

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('goblet_token');
    if (!token) { router.push('/login'); return; }
    api.getSummary().then(setSummary);
    api.getTimeline().then(setTimeline);
  }, []);

  useSocket('cargo:update', (d) => {
    setAlerts(p => [`${d.cargoId} → ${d.status}`, ...p].slice(0, 5));
  });

  const get = (arr: { _id: string; count: number }[], key: string) =>
    arr.find(x => x._id === key)?.count ?? 0;

  const maxCount = Math.max(...timeline.map(t => t.count), 1);

  return (
    <div style={{ padding: '40px 36px', maxWidth: 1100 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', letterSpacing: -0.5 }}>Dashboard</h1>
      <p style={{ color: '#9CA3AF', margin: '0 0 28px', fontSize: 13 }}>Welcome back. Here's what's happening.</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Total Cargo" value={summary?.totalCargo ?? '—'} />
        <StatCard label="In Transit" value={get(summary?.cargoByStatus ?? [], 'in-transit')} color="#8B5CF6" />
        <StatCard label="Delivered" value={get(summary?.cargoByStatus ?? [], 'delivered')} color="#10B981" />
        <StatCard label="Failed" value={get(summary?.cargoByStatus ?? [], 'failed')} color="#EF4444" />
        <StatCard label="Total Trucks" value={summary?.totalTrucks ?? '—'} color="#3B82F6" />
        <StatCard label="Total Drivers" value={summary?.totalDrivers ?? '—'} color="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Timeline chart */}
        <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 12, padding: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Cargo Activity (last 30 days)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
            {timeline.slice(-20).map((t, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: '100%', background: '#10B981', borderRadius: 3, height: `${(t.delivered / maxCount) * 100}px`, minHeight: t.delivered ? 2 : 0 }} />
                <div style={{ width: '100%', background: '#E5E7EB', borderRadius: 3, height: `${((t.count - t.delivered) / maxCount) * 100}px`, minHeight: t.count ? 2 : 0 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#6B7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: '#10B981', borderRadius: 2, display: 'inline-block' }} />Delivered</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: '#E5E7EB', borderRadius: 2, display: 'inline-block' }} />Other</span>
          </div>
        </div>

        {/* Recent cargo + live alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {alerts.length > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E', marginBottom: 8 }}>⚡ Live Events</div>
              {alerts.map((a, i) => <div key={i} style={{ fontSize: 12, color: '#78350F', lineHeight: 1.8 }}>{a}</div>)}
            </div>
          )}
          <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 12, padding: 20, flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Recent Cargo</div>
            {summary?.recentCargo.map(c => (
              <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.trackingId}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.origin} → {c.destination}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}