'use client';

interface Props { alerts: string[]; }

export default function AlertBanner({ alerts }: Props) {
  if (!alerts.length) return null;
  return (
    <div style={{
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderRadius: 8,
      padding: '10px 16px',
      marginBottom: 20
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E', marginBottom: 6 }}>
        ⚡ Live Events
      </div>
      {alerts.map((a, i) => (
        <div key={i} style={{ fontSize: 13, color: '#78350F', lineHeight: 1.8 }}>
          {a}
        </div>
      ))}
    </div>
  );
}