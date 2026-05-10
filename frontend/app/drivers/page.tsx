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
  };// app/drivers/page.tsx

'use client';

import { useState, useEffect } from 'react';

import {
  FiPlus,
  FiUser,
  FiPhone,
  FiTruck,
  FiClipboard,
  FiActivity,
} from 'react-icons/fi';

import { api, Driver, Truck } from '../lib/api';

import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Input from '../components/Input';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);

  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    assignedTruck: '',
  });

  const set =
    (k: keyof typeof form) =>
    (v: string) =>
      setForm((f) => ({
        ...f,
        [k]: v,
      }));

  const load = async () => {
    const [d, t] = await Promise.all([
      api.getDrivers(),
      api.getTrucks(),
    ]);

    setDrivers(d);
    setTrucks(t);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await api.createDriver({
      ...form,
    });

    setModal(false);

    load();

    setForm({
      name: '',
      phone: '',
      licenseNumber: '',
      assignedTruck: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] p-6 lg:p-10">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        
        <div>
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-slate-400">
            Driver Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-3">
            Drivers
          </h1>

          <p className="text-slate-500 mt-3">
            Manage drivers, assignments and delivery operations.
          </p>
        </div>

        <button
          onClick={() => setModal(true)}
          className="h-14 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-slate-900/10"
        >
          <FiPlus className="text-lg" />

          Add Driver
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Total Drivers
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mt-3">
                {drivers.length}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-700">
              <FiUser />
            </div>
          </div>
        </div>
      </div>

      {/* DRIVER GRID */}
      {drivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {drivers.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              
              {/* TOP */}
              <div className="flex items-start justify-between mb-6">
                
                <div className="flex items-center gap-4">
                  
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-700">
                    <FiUser />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {d.name}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Driver Profile
                    </p>
                  </div>
                </div>

                <StatusBadge status={d.status} />
              </div>

              {/* INFO */}
              <div className="space-y-4">
                
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <FiPhone />
                  </div>

                  <span>{d.phone}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <FiClipboard />
                  </div>

                  <span>{d.licenseNumber}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <FiTruck />
                  </div>

                  <span>
                    {d.assignedTruck?.plateNumber ??
                      'No Truck Assigned'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <FiActivity />
                  </div>

                  <span>
                    {d.totalTrips} Trips Completed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
          
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-500 mb-6">
            <FiUser />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            No Drivers Yet
          </h2>

          <p className="text-slate-500 mt-3 max-w-md">
            Start by adding your first driver to manage transport operations professionally.
          </p>

          <button
            onClick={() => setModal(true)}
            className="mt-8 h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all"
          >
            Add First Driver
          </button>
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add New Driver"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <Input
            label="Full Name"
            value={form.name}
            onChange={set('name')}
            placeholder="Ali Hassan"
          />

          <Input
            label="Phone Number"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+92 300 0000000"
          />

          <Input
            label="License Number"
            value={form.licenseNumber}
            onChange={set('licenseNumber')}
            placeholder="LHR-12345"
          />

          {/* SELECT */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assign Truck
            </label>

            <select
              value={form.assignedTruck}
              onChange={(e) =>
                set('assignedTruck')(e.target.value)
              }
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-900 transition-all"
            >
              <option value="">
                No Truck
              </option>

              {trucks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.plateNumber}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTONS */}
          <div className="md:col-span-2 flex items-center gap-4 pt-3">
            
            <button
              onClick={submit}
              className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all"
            >
              Save Driver
            </button>

            <button
              onClick={() => setModal(false)}
              className="h-12 px-6 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

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