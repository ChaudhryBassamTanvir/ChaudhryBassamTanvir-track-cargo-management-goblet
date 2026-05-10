'use client';
import { useState } from 'react';
import { FiHash, FiUser, FiTruck } from 'react-icons/fi';
import { api } from '../lib/api';
import Input from './Input';

interface Props { onSave: () => void; onCancel: () => void; }

export default function TruckForm({ onSave, onCancel }: Props) {
  const [form, setForm] = useState({ plateNumber: '', driverName: '', capacity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.plateNumber || !form.driverName || !form.capacity) { setError('All fields required.'); return; }
    setLoading(true); setError('');
    try { await api.createTruck({ ...form, capacity: +form.capacity }); onSave(); }
    catch (e: any) { setError(e.message ?? 'Failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Plate Number"   value={form.plateNumber} onChange={set('plateNumber')} placeholder="ABC-123"  icon={<FiHash />} />
      <Input label="Driver Name"    value={form.driverName}  onChange={set('driverName')}  placeholder="Ali Hassan" icon={<FiUser />} />
      <Input label="Capacity (kg)"  value={form.capacity}    onChange={set('capacity')}    placeholder="5000" type="number" icon={<FiTruck />} />
      {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}
      <div className="md:col-span-2 flex items-center gap-4 pt-2">
        <button onClick={submit} disabled={loading} className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all">
          {loading ? 'Saving...' : 'Save Truck'}
        </button>
        <button onClick={onCancel} className="h-12 px-6 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}