interface Props {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

export default function Input({ label, value, onChange, placeholder, type = 'text' }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{
        fontSize: 12, fontWeight: 500,
        color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '8px 12px', borderRadius: 7,
          border: '1px solid #E5E7EB', fontSize: 14,
          outline: 'none', background: '#FAFAFA',
          boxSizing: 'border-box', width: '100%'
        }}
      />
    </div>
  );
}