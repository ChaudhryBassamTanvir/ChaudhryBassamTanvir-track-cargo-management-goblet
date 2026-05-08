'use client';
import { useState, useEffect } from 'react';
import { api, Driver, Truck } from '../lib/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Input from '../components/Input';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', licenseNumber: '', assignedTruck: '' });
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const load = async () => {
    const [d, t] = await Promise.all([api.getDrivers(), api.getTrucks()]);
    setDrivers(d); setTrucks(t);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    await api.createDriver({ ...form });
    setModal(false); load();
    setForm({ name: '', phone: '', licenseNumber: '', assignedTruck: '' });
  };

  return (
    <div style={{ padding: '40px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.5 }}>Drivers</h1>
          <p style={{ color: '#9CA3AF', margin: 0, fontSize: 13 }}>{drivers.length} registered</p>
        </div>
        <button onClick={() => setModal(true)} style={{
          padding: '9px 18px', background: '#0F0F0F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer'
        }}>+ Add Driver</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {drivers.map(d => (
          <div key={d._id} style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{d.phone}</div>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>🪪 {d.licenseNumber}</span>
              <span>🚛 {d.assignedTruck?.plateNumber ?? 'Not assigned'}</span>
              <span>📦 {d.totalTrips} trips completed</span>
            </div>
          </div>
        ))}
        {drivers.length === 0 && (
          <div style={{ color: '#D1D5DB', padding: 40, fontSize: 14 }}>No drivers yet.</div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Driver">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Ali Hassan" />
          <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+92 300 0000000" />
          <Input label="License Number" value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="LHR-12345" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Assign Truck</label>
            <select value={form.assignedTruck} onChange={e => set('assignedTruck')(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 14, background: '#FAFAFA' }}>
              <option value="">None</option>
              {trucks.map(t => <option key={t._id} value={t._id}>{t.plateNumber}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={submit} style={{ padding: '8px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14 }}>Save Driver</button>
            <button onClick={() => setModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 7, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}