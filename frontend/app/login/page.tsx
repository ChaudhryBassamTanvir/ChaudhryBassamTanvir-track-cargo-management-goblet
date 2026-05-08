// app/login/page.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiTruck,
} from 'react-icons/fi';

import { api } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const res = await api.login(form.email, form.password);

      localStorage.setItem('goblet_token', res.token);
      localStorage.setItem('goblet_user', JSON.stringify(res.user));

      router.push('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-6 py-10 overflow-hidden relative">
      
      {/* BACKGROUND BLOBS */}
      <div className="absolute top-[-120px] left-[-100px] w-[300px] h-[300px] bg-slate-200 rounded-full blur-3xl opacity-40" />

      <div className="absolute bottom-[-120px] right-[-100px] w-[320px] h-[320px] bg-slate-300 rounded-full blur-3xl opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl bg-white rounded-[34px] shadow-[0_20px_80px_rgba(15,23,42,0.08)] overflow-hidden grid lg:grid-cols-2 relative z-10"
      >
        
        {/* LEFT */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 lg:p-14 flex flex-col justify-between">
          
          <div>
            
            {/* LOGO */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center p-3 shadow-xl">
                <Image
                  src="/logo.png"
                  alt="Goblet"
                  width={200}
                  height={200}
                  className="object-contain w-full h-full"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Goblet
                </h1>

                <p className="text-slate-300 text-sm">
                  Truck Cargo Management
                </p>
              </div>
            </div>

            <h2 className="text-5xl font-bold leading-tight max-w-md">
              Smart logistics for modern transport companies.
            </h2>

            <p className="text-slate-300 mt-6 max-w-md leading-7">
              Manage cargo, trucks, drivers and shipments with a modern and powerful dashboard.
            </p>

            <div className="mt-12 space-y-5">
              <Feature text="Real-time cargo tracking" />
              <Feature text="Advanced analytics dashboard" />
              <Feature text="Live delivery monitoring" />
            </div>
          </div>

          <div className="text-sm text-slate-400">
            © 2026 Goblet Logistics
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 sm:p-12 lg:p-16 flex items-center">
          <div className="w-full max-w-md mx-auto">
            
            <div className="mb-10">
              <p className="uppercase tracking-[0.3em] text-xs font-semibold text-slate-400">
                Welcome Back
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mt-3">
                Sign In
              </h2>

              <p className="text-slate-500 mt-3">
                Access your Goblet dashboard.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              
              {/* EMAIL */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Email
                </label>

                <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-2xl bg-slate-50 h-14 px-4 focus-within:border-slate-900 transition-all">
                  <FiMail className="text-slate-400" />

                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set('email')}
                    placeholder="Enter your email"
                    className="bg-transparent outline-none w-full text-sm"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-2xl bg-slate-50 h-14 px-4 focus-within:border-slate-900 transition-all">
                  <FiLock className="text-slate-400" />

                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Enter your password"
                    className="bg-transparent outline-none w-full text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                {loading ? 'Signing in...' : 'Sign In'}

                {!loading && <FiArrowRight />}
              </button>
            </form>

            <p className="text-sm text-slate-500 mt-8 text-center">
              Don’t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-slate-900 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        <FiTruck />
      </div>

      <p className="text-slate-200">
        {text}
      </p>
    </div>
  );
}