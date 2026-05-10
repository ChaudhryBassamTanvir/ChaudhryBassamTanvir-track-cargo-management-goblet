import { ReactNode } from 'react';

interface Props {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
}

export default function Input({ label, value, onChange, placeholder, type = 'text', icon }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3 border border-slate-200 rounded-2xl bg-slate-50 h-12 px-4 focus-within:border-slate-900 transition-all">
        {icon && <span className="text-slate-400">{icon}</span>}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>
    </div>
  );
}