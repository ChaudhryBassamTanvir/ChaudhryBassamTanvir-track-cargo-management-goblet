// app/trucks/page.tsx

'use client';

import { useState, useEffect } from 'react';

import {
  FiPlus,
  FiTruck,
  FiActivity,
  FiTool,
  FiCheckCircle,
} from 'react-icons/fi';
// add this import at top
import { useSocket } from '../lib/useSocket';


import { api, Truck } from '../lib/api';

import TruckTable from '../components/TruckTable';

import Modal from '../components/Modal';
import TruckForm from '../components/TruckForm';

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);

  const [modal, setModal] = useState(false);

  const load = () => api.getTrucks().then(setTrucks);

  useEffect(() => {
    load();
  }, []);

  const statusCounts = {
    idle: trucks.filter((t) => t.status === 'idle')
      .length,

    'in-transit': trucks.filter(
      (t) => t.status === 'in-transit'
    ).length,

    maintenance: trucks.filter(
      (t) => t.status === 'maintenance'
    ).length,
  };
// add inside the component after useEffect
useSocket('truck:update', () => load());
useSocket('db:change',    () => load());
  return (
    <div className="min-h-screen bg-[#F6F8FB] p-6 lg:p-10">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
        
        <div>
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-slate-400">
            Fleet Management
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-3">
            Fleet Overview
          </h1>

          <p className="text-slate-500 mt-3 max-w-2xl">
            Monitor your registered trucks, operational
            status and transportation fleet performance.
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => setModal(true)}
          className="h-14 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-slate-900/10"
        >
          <FiPlus className="text-lg" />

          Register Truck
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* TOTAL */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Total Trucks
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mt-3">
                {trucks.length}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-700">
              <FiTruck />
            </div>
          </div>
        </div>

        {/* IDLE */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Idle
              </p>

              <h2 className="text-4xl font-bold text-emerald-500 mt-3">
                {statusCounts.idle}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl text-emerald-600">
              <FiCheckCircle />
            </div>
          </div>
        </div>

        {/* IN TRANSIT */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                In Transit
              </p>

              <h2 className="text-4xl font-bold text-violet-500 mt-3">
                {statusCounts['in-transit']}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl text-violet-600">
              <FiActivity />
            </div>
          </div>
        </div>

        {/* MAINTENANCE */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm text-slate-500">
                Maintenance
              </p>

              <h2 className="text-4xl font-bold text-orange-500 mt-3">
                {statusCounts.maintenance}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl text-orange-600">
              <FiTool />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* TABLE HEADER */}
        <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between">
          
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Fleet Registry
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Complete list of registered fleet vehicles
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 text-sm text-slate-400">
            
            <div className="w-3 h-3 rounded-full bg-emerald-500" />

            Live Fleet Data
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <TruckTable trucks={trucks} />
        </div>
      </div>

      {/* MODAL */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Register New Truck"
      >
        <TruckForm
          onSave={() => {
            setModal(false);

            load();
          }}
          onCancel={() => setModal(false)}
        />
      </Modal>
    </div>
  );
}