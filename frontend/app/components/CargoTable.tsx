'use client';
import { FiTrash2 } from 'react-icons/fi';
import { Cargo } from '../lib/api';
import StatusBadge from './StatusBadge';

interface Props {
  cargo: Cargo[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const NEXT: Record<string, string[]> = {
  pending: ['loaded', 'failed'],
  loaded: ['in-transit', 'failed'],
  'in-transit': ['delivered', 'failed'],
  delivered: [],
  failed: ['pending'],
};

export default function CargoTable({ cargo, onStatusChange, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
            {['Tracking ID', 'Route', 'Weight', 'Truck', 'Status', 'Actions'].map(h => (
              <th key={h} className="text-left px-6 py-4 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cargo.map(c => (
            <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.trackingId}</td>
              <td className="px-6 py-4">
                <span className="text-slate-800">{c.origin}</span>
                <span className="text-slate-300 mx-2">→</span>
                <span className="text-slate-800">{c.destination}</span>
              </td>
              <td className="px-6 py-4 text-slate-500">{c.weight} kg</td>
              <td className="px-6 py-4">
                {c.truck ? (
                  <div>
                    <p className="font-semibold text-slate-800">{c.truck.plateNumber}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.truck.driverName}</p>
                  </div>
                ) : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {(NEXT[c.status] ?? []).map(s => (
                    <button key={s} onClick={() => onStatusChange(c._id, s)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all font-medium text-slate-600">
                      {s}
                    </button>
                  ))}
                  <button onClick={() => onDelete(c._id)}
                    className="p-1.5 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 transition-all">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {cargo.length === 0 && (
            <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-300 text-sm">No cargo entries yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}