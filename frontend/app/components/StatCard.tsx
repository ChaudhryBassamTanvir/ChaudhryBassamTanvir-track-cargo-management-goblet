import { ReactNode } from 'react';

interface Props {
  label: string;
  value: number | string;
  color?: string;
  bgColor?: string;
  icon?: ReactNode;
}

export default function StatCard({ label, value, color = 'text-slate-900', bgColor = 'bg-slate-100', icon }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <h2 className={`text-4xl font-bold mt-3 ${color}`}>{value}</h2>
        </div>
        {icon && (
          <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center text-2xl`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}