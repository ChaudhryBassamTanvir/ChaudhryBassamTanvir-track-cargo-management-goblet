'use client';
import { Truck } from '../lib/api';
import StatusBadge from './StatusBadge';

interface Props { trucks: Truck[]; }

export default function TruckTable({ trucks }: Props) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #F3F4F6', color: '#9CA3AF', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {['Plate', 'Driver', 'Capacity', 'Status'].map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {trucks.map(t => (
          <tr key={t._id} style={{ borderBottom: '1px solid #F9FAFB' }}>
            <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontWeight: 600 }}>{t.plateNumber}</td>
            <td style={{ padding: '13px 14px' }}>{t.driverName}</td>
            <td style={{ padding: '13px 14px', color: '#6B7280' }}>{t.capacity.toLocaleString()} kg</td>
            <td style={{ padding: '13px 14px' }}><StatusBadge status={t.status} /></td>
          </tr>
        ))}
        {trucks.length === 0 && (
          <tr>
            <td colSpan={4} style={{ padding: 48, textAlign: 'center', color: '#D1D5DB' }}>
              No trucks registered.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}