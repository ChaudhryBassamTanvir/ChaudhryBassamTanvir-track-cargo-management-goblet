'use client';
import { useState } from 'react';
import { api } from '../lib/api';
import Input from './Input';

interface Props {
  onSave: () => void;
  onCancel: () => void;
}

export default function TruckForm({ onSave, onCancel }: Props) {
  const [form, setForm] = useState({ plateNumber: '', driverName: '', capacity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.plateNumber || !form.driverName || !form.capacity) {
      setError('All fields are required.'); return;
    }
    setLoading(true); setError('');
    try {
      await api.createTruck({ ...form, capacity: +form.capacity });
      onSave();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Plate Number" value={form.plateNumber} onChange={set('plateNumber')} placeholder="ABC-123" />
        <Input label="Driver Name"  value={form.driverName}  onChange={set('driverName')}  placeholder="Ali Hassan" />
        <Input label="Capacity (kg)" value={form.capacity}   onChange={set('capacity')}    type="number" placeholder="5000" />
      </div>

      {error && <div style={{ fontSize: 13, color: '#EF4444' }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={submit} disabled={loading}
          style={{ padding: '8px 20px', background: '#0F0F0F', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14 }}
        >
          {loading ? 'Saving...' : 'Save Truck'}
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