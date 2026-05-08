interface Props {
  label: string;
  value: number | string;
  color?: string;
}

export default function StatCard({ label, value, color = '#1a1a1a' }: Props) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #F3F4F6',
      borderRadius: 10,
      padding: '20px 24px',
      flex: 1,
      minWidth: 140
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>{label}</div>
    </div>
  );
}