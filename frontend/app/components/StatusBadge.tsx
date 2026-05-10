const STYLES: Record<string, string> = {
  pending:      'bg-amber-100 text-amber-700',
  loaded:       'bg-blue-100 text-blue-700',
  'in-transit': 'bg-violet-100 text-violet-700',
  delivered:    'bg-emerald-100 text-emerald-700',
  failed:       'bg-red-100 text-red-700',
  idle:         'bg-slate-100 text-slate-600',
  maintenance:  'bg-orange-100 text-orange-700',
  available:    'bg-emerald-100 text-emerald-700',
  'on-trip':    'bg-violet-100 text-violet-700',
  'off-duty':   'bg-slate-100 text-slate-500',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold ${STYLES[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}