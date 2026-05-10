'use client';
import { Truck } from '../lib/api';
import StatusBadge from './StatusBadge';

export default function TruckTable({ trucks }: { trucks: Truck[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
            {['Plate Number', 'Driver', 'Capacity', 'Status'].map(h => (
              <th key={h} className="text-left px-6 py-4 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trucks.map(t => (
            <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-mono font-bold text-slate-800">{t.plateNumber}</td>
              <td className="px-6 py-4 text-slate-600">{t.driverName}</td>
              <td className="px-6 py-4 text-slate-500">{t.capacity.toLocaleString()} kg</td>
              <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
            </tr>
          ))}
          {trucks.length === 0 && (
            <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-300 text-sm">No trucks registered.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}