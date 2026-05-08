'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/', label: 'Dashboard', icon: '▦' },
  { href: '/cargo', label: 'Cargo', icon: '📦' },
  { href: '/trucks', label: 'Trucks', icon: '🚛' },
  { href: '/drivers', label: 'Drivers', icon: '👤' },
  { href: '/tracking', label: 'Live Tracking', icon: '📍' },
  { href: '/reports', label: 'Reports', icon: '📊' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('goblet_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const isAuth = pathname === '/login';

  const logout = () => {
    localStorage.removeItem('goblet_token');
    localStorage.removeItem('goblet_user');
    router.push('/login');
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Georgia', serif", background: '#F9FAFB' }}>
        {isAuth ? children : (
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
              width: 220, background: '#0F0F0F', color: '#fff',
              display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
              position: 'sticky', top: 0, height: '100vh'
            }}>
              <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #222' }}>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>🚛 Goblet</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>Cargo Management</div>
              </div>
              <nav style={{ padding: '16px 10px', flex: 1 }}>
                {NAV.map(n => (
                  <a key={n.href} href={n.href} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 7, marginBottom: 2,
                    background: pathname === n.href ? '#1a1a1a' : 'transparent',
                    color: pathname === n.href ? '#fff' : '#888',
                    textDecoration: 'none', fontSize: 14, transition: 'all 0.15s'
                  }}>
                    <span>{n.icon}</span>{n.label}
                  </a>
                ))}
              </nav>
              <div style={{ padding: '16px 20px', borderTop: '1px solid #222' }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{user?.name ?? 'User'}</div>
                <button onClick={logout} style={{
                  width: '100%', padding: '7px', background: '#1a1a1a',
                  color: '#888', border: '1px solid #222', borderRadius: 6,
                  cursor: 'pointer', fontSize: 12
                }}>Sign out</button>
              </div>
            </aside>
            {/* Main */}
            <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}