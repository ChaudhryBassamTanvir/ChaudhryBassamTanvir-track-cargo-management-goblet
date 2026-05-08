'use client';
import { useState } from 'react';
import { api, Truck } from '../lib/api';
import Input from './Input';

interface Props {
  trucks: Truck[];
  onSave: () => void;
  onCancel: () => void;
}

export default function CargoForm({ trucks, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    trackingId: '', origin: '', destination: '', weight: '', truckId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.trackingId || !form.origin || !form.destination || !form.weight) {
      setError('All fields except truck are required.'); return;
    }
    setLoading(true); setError('');
    try {
      await api.createCargo({
        trackingId: form.trackingId,
        origin: form.origin,
        destination: form.destination,
        weight: +form.weight,
        ...(form.truckId ? { truck: form.truckId as any } : {})
      });
      onSave();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Tracking ID"  value={form.trackingId}   onChange={set('trackingId')}   placeholder="TRK-001" />
        <Input label="Origin"       value={form.origin}       onChange={set('origin')}       placeholder="Karachi" />
        <Input label="Destination"  value={form.destination}  onChange={set('destination')}  placeholder="Lahore" />
        <Input label="Weight (kg)"  value={form.weight}       onChange={set('weight')}       type="number" placeholder="500" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Assign Truck
        </label>
        <select
          value={form.truckId}
          onChange={e => set('truckId')(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 14, background: '#FAFAFA' }}
        >
          <option value="">No truck assigned</option>
          {trucks.map(t => (
            <option key={t._id} value={t._id}>{t.plateNumber} — {t.driverName}</option>
          ))}
        </select>
      </div>

      {error && <div style={{ fontSize: 13, color: '#EF4444' }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={submit} disabled={loading}
          style={{ padding: '8px 20px', background: '#0F0F0F', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14 }}
        >
          {loading ? 'Saving...' : 'Save Cargo'}
        </button>
        <button
          onClick={onCancel}
          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 7, cursor: 'pointer', fontSize: 14 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}