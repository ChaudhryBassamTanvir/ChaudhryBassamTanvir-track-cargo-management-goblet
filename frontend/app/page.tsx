'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Cargo, Truck } from './lib/api';
import { useSocket } from './lib/useSocket';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B', loaded: '#3B82F6', 'in-transit': '#8B5CF6',
  delivered: '#10B981', failed: '#EF4444'
};

export default function HomePage() {
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [filter, setFilter] = useState('');
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ trackingId: '', origin: '', destination: '', weight: '', truckId: '' });

  const load = useCallback(async () => {
    const [c, t] = await Promise.all([api.getCargo(filter), api.getTrucks()]);
    setCargo(c.data); setTrucks(t);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // Live updates via socket
  useSocket('cargo:update', (data) => {
    setCargo(prev => prev.map(c => c._id === data.cargoId ? { ...c, status: data.status } : c));
    setAlerts(prev => [`${data.cargoId} → ${data.status}`, ...prev].slice(0, 5));
  });

  useSocket('db:change', (data) => {
    if (data.op === 'insert' || data.op === 'update') load();
  });

  const submit = async () => {
    await api.createCargo({ ...form, weight: +form.weight, truck: form.truckId } as any);
    setShowForm(false); setForm({ trackingId: '', origin: '', destination: '', weight: '', truckId: '' });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.updateStatus(id, status);
    load();
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 960, margin: '0 auto', padding: '40px 24px', color: '#1a1a1a' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: -1 }}>🚛 Cargo Board</h1>
        <p style={{ color: '#888', marginTop: 6, fontSize: 14 }}>Real-time truck cargo management</p>
      </div>

      {/* Live alerts */}
      {alerts.length > 0 && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 16px', marginBottom: 24 }}>
          {alerts.map((a, i) => <div key={i} style={{ fontSize: 13, color: '#92400E' }}>⚡ {a}</div>)}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 13, background: '#fff' }}>
          <option value="">All statuses</option>
          {['pending','loaded','in-transit','delivered','failed'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        <button onClick={() => setShowForm(v => !v)}
          style={{ marginLeft: 'auto', padding: '7px 16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
          + New Cargo
        </button>
      </div>

      {/* New Cargo form */}
      {showForm && (
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['trackingId','origin','destination','weight'] as const).map(k => (
              <input key={k} placeholder={k} value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 13 }} />
            ))}
            <select value={form.truckId} onChange={e => setForm(f => ({ ...f, truckId: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 13 }}>
              <option value="">Assign truck</option>
              {trucks.map(t => <option key={t._id} value={t._id}>{t.plateNumber} — {t.driverName}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={submit}
              style={{ padding: '7px 18px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
              Save
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #D1D5DB', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cargo Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #F3F4F6', color: '#6B7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {['Tracking ID','Origin','Destination','Weight','Truck','Status','Actions'].map(h =>
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500 }}>{h}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {cargo.map(c => (
            <tr key={c._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
              <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: 12 }}>{c.trackingId}</td>
              <td style={{ padding: '12px' }}>{c.origin}</td>
              <td style={{ padding: '12px' }}>{c.destination}</td>
              <td style={{ padding: '12px' }}>{c.weight} kg</td>
              <td style={{ padding: '12px', fontSize: 12 }}>{c.truck?.plateNumber || '—'}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ background: STATUS_COLORS[c.status] + '22', color: STATUS_COLORS[c.status],
                  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                  {c.status}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <select onChange={e => updateStatus(c._id, e.target.value)} defaultValue=""
                  style={{ fontSize: 12, padding: '4px 8px', borderRadius: 5, border: '1px solid #E5E7EB' }}>
                  <option value="" disabled>Update</option>
                  {['loaded','in-transit','delivered','failed'].map(s =>
                    <option key={s} value={s}>{s}</option>
                  )}
                </select>
              </td>
            </tr>
          ))}
          {cargo.length === 0 && (
            <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>No cargo yet. Add some above.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}