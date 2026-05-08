'use client';
import { useState, useEffect, useRef } from 'react';
import { api, Truck } from '../lib/api';
import { useSocket } from '../lib/useSocket';
import StatusBadge from '../components/StatusBadge';

// Simple SVG-based map (no external map lib needed)
function PakistanMap({ trucks }: { trucks: Truck[] }) {
  // Major city coordinates mapped to SVG space (Pakistan bounding box)
  const toSVG = (lat: number, lng: number) => ({
    x: ((lng - 60.5) / (77.5 - 60.5)) * 560 + 20,
    y: ((37.5 - lat) / (37.5 - 23.5)) * 380 + 20
  });

  const cities = [
    { name: 'Karachi', lat: 24.86, lng: 67.01 },
    { name: 'Lahore', lat: 31.52, lng: 74.36 },
    { name: 'Islamabad', lat: 33.72, lng: 73.06 },
    { name: 'Peshawar', lat: 34.01, lng: 71.57 },
    { name: 'Quetta', lat: 30.18, lng: 67.0 },
    { name: 'Multan', lat: 30.19, lng: 71.47 },
    { name: 'Faisalabad', lat: 31.41, lng: 73.07 },
  ];

  return (
    <svg width="100%" viewBox="0 0 600 420" style={{ background: '#F0F9FF', borderRadius: 10 }}>
      {/* Grid lines */}
      {[...Array(8)].map((_, i) => (
        <line key={i} x1={20 + i * 70} y1="20" x2={20 + i * 70} y2="400" stroke="#DBEAFE" strokeWidth="0.5" />
      ))}
      {[...Array(7)].map((_, i) => (
        <line key={i} x1="20" y1={20 + i * 60} x2="580" y2={20 + i * 60} stroke="#DBEAFE" strokeWidth="0.5" />
      ))}

      {/* Cities */}
      {cities.map(c => {
        const { x, y } = toSVG(c.lat, c.lng);
        return (
          <g key={c.name}>
            <circle cx={x} cy={y} r={4} fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
            <text x={x + 7} y={y + 4} fontSize="10" fill="#6B7280">{c.name}</text>
          </g>
        );
      })}

      {/* Trucks */}
      {trucks.map(t => {
        const { x, y } = toSVG(t.location?.lat ?? 30, t.location?.lng ?? 70);
        const color = t.status === 'in-transit' ? '#8B5CF6' : t.status === 'maintenance' ? '#F97316' : '#10B981';
        return (
          <g key={t._id}>
            <circle cx={x} cy={y} r={8} fill={color} opacity={0.2} />
            <circle cx={x} cy={y} r={5} fill={color} />
            <text x={x + 10} y={y - 6} fontSize="10" fill="#374151" fontWeight="600">{t.plateNumber}</text>
          </g>
        );
      })}

      <text x="20" y="415" fontSize="10" fill="#9CA3AF">Pakistan · Major Routes</text>
    </svg>
  );
}

export default function TrackingPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selected, setSelected] = useState<Truck | null>(null);

  useEffect(() => { api.getTrucks().then(setTrucks); }, []);

  useSocket('db:change', () => { api.getTrucks().then(setTrucks); });

  return (
    <div style={{ padding: '40px 36px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', letterSpacing: -0.5 }}>Live Tracking</h1>
      <p style={{ color: '#9CA3AF', margin: '0 0 24px', fontSize: 13 }}>Real-time fleet positions · updates via WebSocket</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <PakistanMap trucks={trucks} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Fleet ({trucks.length})</div>
          {trucks.map(t => (
            <div key={t._id} onClick={() => setSelected(t === selected ? null : t)}
              style={{
                background: selected?._id === t._id ? '#F5F3FF' : '#fff',
                border: `1px solid ${selected?._id === t._id ? '#8B5CF6' : '#F3F4F6'}`,
                borderRadius: 9, padding: '12px 14px', cursor: 'pointer'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{t.plateNumber}</span>
                <StatusBadge status={t.status} />
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{t.driverName}</div>
              {selected?._id === t._id && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#6B7280', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div>📍 {t.location?.lat?.toFixed(4)}, {t.location?.lng?.toFixed(4)}</div>
                  <div>⚖️ Capacity: {t.capacity.toLocaleString()} kg</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}