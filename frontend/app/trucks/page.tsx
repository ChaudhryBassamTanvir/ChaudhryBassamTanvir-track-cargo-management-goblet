'use client';
import { useState, useEffect } from 'react';
import { api, Truck } from '../lib/api';
import TruckTable from '../components/TruckTable';
import Modal from '../components/Modal';
import TruckForm from '../components/TruckForm';

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [modal, setModal] = useState(false);

  const load = () => api.getTrucks().then(setTrucks);
  useEffect(() => { load(); }, []);

  const statusCounts = {
    idle: trucks.filter(t => t.status === 'idle').length,
    'in-transit': trucks.filter(t => t.status === 'in-transit').length,
    maintenance: trucks.filter(t => t.status === 'maintenance').length,
  };

  return (
    <div style={{ padding: '40px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.5 }}>Fleet</h1>
          <p style={{ color: '#9CA3AF', margin: 0, fontSize: 13 }}>{trucks.length} trucks registered</p>
        </div>
        <button onClick={() => setModal(true)} style={{
          padding: '9px 18px', background: '#0F0F0F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer'
        }}>+ Register Truck</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {Object.entries(statusCounts).map(([s, c]) => (
          <div key={s} style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 8, padding: '12px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{c}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, textTransform: 'capitalize' }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
        <TruckTable trucks={trucks} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Register Truck">
        <TruckForm onSave={() => { setModal(false); load(); }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}