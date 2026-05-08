'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Cargo, Truck } from '../lib/api';
import CargoTable from '../components/CargoTable';
import Modal from '../components/Modal';
import CargoForm from '../components/CargoForm';
import { useSocket } from '../lib/useSocket';

export default function CargoPage() {
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status) params.status = status;
    const [c, t] = await Promise.all([api.getCargo(params), api.getTrucks()]);
    setCargo(c.data); setTotal(c.total); setTrucks(t);
  }, [search, status]);

  useEffect(() => { load(); }, [load]);
  useSocket('cargo:update', () => load());

  return (
    <div style={{ padding: '40px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.5 }}>Cargo</h1>
          <p style={{ color: '#9CA3AF', margin: 0, fontSize: 13 }}>{total} total entries</p>
        </div>
        <button onClick={() => setModal(true)} style={{
          padding: '9px 18px', background: '#0F0F0F', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer'
        }}>+ New Cargo</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input placeholder="Search tracking ID, origin, destination..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 14px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 13 }} />
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 13 }}>
          <option value="">All statuses</option>
          {['pending','loaded','in-transit','delivered','failed'].map(s =>
            <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
        <CargoTable cargo={cargo}
          onStatusChange={async (id, s) => { await api.updateStatus(id, s); load(); }}
          onDelete={async (id) => { await api.deleteCargo(id); load(); }} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Cargo">
        <CargoForm trucks={trucks} onSave={() => { setModal(false); load(); }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}