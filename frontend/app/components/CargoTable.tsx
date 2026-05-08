'use client';
import { Cargo } from '../lib/api';
import StatusBadge from './StatusBadge';

interface Props {
  cargo: Cargo[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const NEXT: Record<string, string[]> = {
  pending:      ['loaded', 'failed'],
  loaded:       ['in-transit', 'failed'],
  'in-transit': ['delivered', 'failed'],
  delivered:    [],
  failed:       ['pending'],
};

export default function CargoTable({ cargo, onStatusChange, onDelete }: Props) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #F3F4F6', color: '#9CA3AF', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {['Tracking ID', 'Route', 'Weight', 'Truck', 'Status', 'Actions'].map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cargo.map(c => (
          <tr key={c._id} style={{ borderBottom: '1px solid #F9FAFB' }}>
            <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>
              {c.trackingId}
            </td>
            <td style={{ padding: '13px 14px' }}>
              <span style={{ fontSize: 13 }}>{c.origin}</span>
              <span style={{ color: '#D1D5DB', margin: '0 6px' }}>→</span>
              <span style={{ fontSize: 13 }}>{c.destination}</span>
            </td>
            <td style={{ padding: '13px 14px', color: '#6B7280' }}>{c.weight} kg</td>
            <td style={{ padding: '13px 14px', fontSize: 12, color: '#6B7280' }}>
              {c.truck
                ? <><strong>{c.truck.plateNumber}</strong><br />{c.truck.driverName}</>
                : '—'}
            </td>
            <td style={{ padding: '13px 14px' }}>
              <StatusBadge status={c.status} />
            </td>
            <td style={{ padding: '13px 14px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(NEXT[c.status] ?? []).map(s => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(c._id, s)}
                    style={{
                      padding: '4px 10px', fontSize: 11, borderRadius: 5,
                      border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer'
                    }}
                  >{s}</button>
                ))}
                <button
                  onClick={() => onDelete(c._id)}
                  style={{
                    padding: '4px 8px', fontSize: 11, borderRadius: 5,
                    border: '1px solid #FEE2E2', background: '#FEF2F2',
                    color: '#EF4444', cursor: 'pointer'
                  }}
                >delete</button>
              </div>
            </td>
          </tr>
        ))}
        {cargo.length === 0 && (
          <tr>
            <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#D1D5DB', fontSize: 14 }}>
              No cargo entries yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}