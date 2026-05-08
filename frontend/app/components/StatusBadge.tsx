const COLORS: Record<string, string> = {
  pending:      '#F59E0B',
  loaded:       '#3B82F6',
  'in-transit': '#8B5CF6',
  delivered:    '#10B981',
  failed:       '#EF4444',
  idle:         '#6B7280',
  maintenance:  '#F97316',
  available:    '#10B981',
  'on-trip':    '#8B5CF6',
  'off-duty':   '#9CA3AF',
};

export default function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] ?? '#6B7280';
  return (
    <span style={{
      background: color + '18',
      color,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
}