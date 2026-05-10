'use client';
import { FiZap } from 'react-icons/fi';

export default function AlertBanner({ alerts }: { alerts: string[] }) {
  if (!alerts.length) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6">
      <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-3">
        <FiZap /> Live Events
      </div>
      {alerts.map((a, i) => (
        <p key={i} className="text-sm text-amber-800 leading-7">{a}</p>
      ))}
    </div>
  );
}