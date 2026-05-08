'use client';
import { useState, useEffect } from 'react';
import { api, Summary, TimelinePoint } from '../lib/api';
import StatusBadge from '../components/StatusBadge';

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);

  useEffect(() => {
    api.getSummary().then(setSummary);
    api.getTimeline().then(setTimeline);
  }, []);

  const maxCount = Math.max(...timeline.map(t => t.count), 1);
  const deliveryRate = summary
    ? Math.round((summary.cargoByStatus.find(x => x._id === 'delivered')?.count ?? 0) / Math.max(summary.totalCargo, 1) * 100)
    : 0;

  return (
    <div style={{ padding: '40px 36px', maxWidth: 1000 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', letterSpacing: -0.5 }}>Reports</h1>
      <p style={{ color: '#9CA3AF', margin: '0 0 28px', fontSize: 13 }}>Analytics and performance overview</p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#10B981' }}>{deliveryRate}%</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Delivery success rate</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{summary?.totalCargo ?? '—'}</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Total shipments</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#3B82F6' }}>{summary?.totalTrucks ?? '—'}</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Active fleet size</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Cargo by status */}
        <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Cargo by Status</div>
          {(summary?.cargoByStatus ?? []).map(s => (
            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <StatusBadge status={s._id} />
              <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 4, height: 6 }}>
                <div style={{
                  width: `${(s.count / Math.max(summary?.totalCargo ?? 1, 1)) * 100}%`,
                  background: '#6366F1', height: 6, borderRadius: 4
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 24 }}>{s.count}</span>
            </div>
          ))}
        </div>

        {/* Truck fleet status */}
        <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Fleet Status</div>
          {(summary?.truckByStatus ?? []).map(s => (
            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <StatusBadge status={s._id} />
              <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 4, height: 6 }}>
                <div style={{
                  width: `${(s.count / Math.max(summary?.totalTrucks ?? 1, 1)) * 100}%`,
                  background: '#3B82F6', height: 6, borderRadius: 4
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 24 }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline chart */}
      <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 14 }}>30-Day Shipment Trend</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 140 }}>
          {timeline.map((t, i) => (
            <div key={i} title={`${t._id}: ${t.count} total, ${t.delivered} delivered`}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'default' }}>
              <div style={{ width: '100%', background: '#10B981', borderRadius: '3px 3px 0 0', height: `${(t.delivered / maxCount) * 120}px`, minHeight: t.delivered ? 2 : 0 }} />
              <div style={{ width: '100%', background: '#E0E7FF', borderRadius: t.delivered ? 0 : '3px 3px 0 0', height: `${((t.count - t.delivered) / maxCount) * 120}px`, minHeight: (t.count - t.delivered) > 0 ? 2 : 0 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: '#6B7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: '#10B981', borderRadius: 2, display: 'inline-block' }} />Delivered</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: '#E0E7FF', borderRadius: 2, display: 'inline-block' }} />Other</span>
        </div>
      </div>
    </div>
  );
}