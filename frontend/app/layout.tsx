'use client';

import './globals.css';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  FiGrid,
  FiBox,
  FiTruck,
  FiUsers,
  FiMapPin,
  FiBarChart2,
  FiLogOut,
} from 'react-icons/fi';

const NAV = [
  {
    href: '/',
    label: 'Dashboard',
    icon: FiGrid,
  },
  {
    href: '/cargo',
    label: 'Cargo',
    icon: FiBox,
  },
  {
    href: '/trucks',
    label: 'Trucks',
    icon: FiTruck,
  },
  {
    href: '/drivers',
    label: 'Drivers',
    icon: FiUsers,
  },
  {
    href: '/tracking',
    label: 'Live Tracking',
    icon: FiMapPin,
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: FiBarChart2,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<{
    name: string;
  } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('goblet_user');

    if (u) {
      setUser(JSON.parse(u));
    }
  }, []);


  const logout = () => {
    localStorage.removeItem('goblet_token');
    localStorage.removeItem('goblet_user');

    router.push('/login');
  };
const authRoutes = ['/login', '/signup'];
const isAuth = authRoutes.includes(pathname);
  return (
    <html lang="en">
      <body className="bg-[#F6F8FB] text-slate-900 antialiased">
        {isAuth ? (
          children
        ) : (
          <div className="flex min-h-screen">
            
            {/* SIDEBAR */}
            <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col justify-between sticky top-0 h-screen px-6 py-7">
              
              <div>
                
                {/* LOGO */}
                <div className="flex items-center gap-4 pb-8 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="Goblet"
                      width={50}
                      height={50}
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Goblet
                    </h1>

                    <p className="text-sm text-slate-500">
                      Cargo Management
                    </p>
                  </div>
                </div>

                {/* NAVIGATION */}
                <nav className="mt-8 space-y-2">
                  {NAV.map((item) => {
                    const Icon = item.icon;

                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-4 px-4 h-14 rounded-2xl transition-all duration-200 group
                        ${
                          active
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon
                          className={`text-xl ${
                            active
                              ? 'text-white'
                              : 'text-slate-500'
                          }`}
                        />

                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* USER */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
                  
                  <div>
                    <p className="text-xs text-slate-400">
                      Logged in as
                    </p>

                    <h3 className="font-semibold text-slate-800 mt-1">
                      {user?.name || 'User'}
                    </h3>
                  </div>

                  <button
                    onClick={logout}
                    className="w-11 h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                  >
                    <FiLogOut />
                  </button>
                </div>
              </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}