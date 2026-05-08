'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.login(form.email, form.password);
      localStorage.setItem('goblet_token', res.token);
      localStorage.setItem('goblet_user', JSON.stringify(res.user));
      router.push('/');
    } catch { setError('Invalid email or password.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F0F' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 40, width: 380, boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>🚛 Goblet</div>
          <div style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Sign in to your account</div>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>EMAIL</label>
            <input type="email" value={form.email} onChange={set('email')} required
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>PASSWORD</label>
            <input type="password" value={form.password} onChange={set('password')} required
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            padding: '11px', background: '#0F0F0F', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', marginTop: 4
          }}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}