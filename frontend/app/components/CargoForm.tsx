'use client';
import { useState } from 'react';
import { FiPackage, FiMapPin, FiTruck, FiHash } from 'react-icons/fi';
import { api, Truck } from '../lib/api';
import Input from './Input';

interface Props { trucks: Truck[]; onSave: () => void; onCancel: () => void; }

export default function CargoForm({ trucks, onSave, onCancel }: Props) {
  const [form, setForm] = useState({ trackingId: '', origin: '', destination: '', weight: '', truckId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.trackingId || !form.origin || !form.destination || !form.weight) {
      setError('All fields except truck are required.'); return;
    }
    setLoading(true); setError('');
    try {
      await api.createCargo({ trackingId: form.trackingId, origin: form.origin, destination: form.destination, weight: +form.weight, ...(form.truckId ? { truck: form.truckId as any } : {}) });
      onSave();
    } catch (e: any) { setError(e.message ?? 'Failed to save.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Tracking ID"   value={form.trackingId}  onChange={set('trackingId')}  placeholder="TRK-001"  icon={<FiHash />} />
      <Input label="Origin"        value={form.origin}      onChange={set('origin')}      placeholder="Karachi"  icon={<FiMapPin />} />
      <Input label="Destination"   value={form.destination} onChange={set('destination')} placeholder="Lahore"   icon={<FiMapPin />} />
      <Input label="Weight (kg)"   value={form.weight}      onChange={set('weight')}      placeholder="500"      type="number" icon={<FiPackage />} />

      <div className="md:col-span-2 flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assign Truck</label>
        <div className="flex items-center gap-3 border border-slate-200 rounded-2xl bg-slate-50 h-12 px-4 focus-within:border-slate-900 transition-all">
          <FiTruck className="text-slate-400" />
          <select value={form.truckId} onChange={e => set('truckId')(e.target.value)} className="bg-transparent outline-none w-full text-sm">
            <option value="">No truck assigned</option>
            {trucks.map(t => <option key={t._id} value={t._id}>{t.plateNumber} — {t.driverName}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}

      <div className="md:col-span-2 flex items-center gap-4 pt-2">
        <button onClick={submit} disabled={loading} className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all">
          {loading ? 'Saving...' : 'Save Cargo'}
        </button>
        <button onClick={onCancel} className="h-12 px-6 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}