'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
} from 'react-icons/fi';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-6 py-10 overflow-hidden relative">
      
      <div className="absolute top-[-120px] left-[-100px] w-[300px] h-[300px] bg-slate-200 rounded-full blur-3xl opacity-40" />

      <div className="absolute bottom-[-120px] right-[-100px] w-[320px] h-[320px] bg-slate-300 rounded-full blur-3xl opacity-40" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-[34px] overflow-hidden shadow-[0_20px_80px_rgba(15,23,42,0.08)] grid lg:grid-cols-2 relative z-10"
      >
        
        {/* LEFT */}
        <div className="hidden lg:flex bg-slate-900 text-white p-14 flex-col justify-between">
          
          <div>
            <div className="w-20 h-20 rounded-full bg-white p-3 flex items-center justify-center mb-8">
              <Image
                src="/logo.png"
                alt="Goblet"
                width={400}
                height={400}
                className="object-contain w-full h-full"
              />
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Create your logistics workspace.
            </h1>

            <p className="text-slate-300 mt-6 leading-7">
              Join Goblet and manage your transport operations with modern tools.
            </p>
          </div>

          <div className="text-sm text-slate-400">
            © 2026 Goblet Logistics
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 sm:p-12 lg:p-16 flex items-center">
          <div className="w-full">
            
            <h2 className="text-4xl font-bold text-slate-900">
              Create Account
            </h2>

            <p className="text-slate-500 mt-3">
              Start managing your cargo professionally.
            </p>

            <div className="space-y-5 mt-10">
              
              <Input
                icon={<FiUser />}
                placeholder="Full Name"
              />

              <Input
                icon={<FiMail />}
                placeholder="Email Address"
              />

              <Input
                icon={<FiLock />}
                placeholder="Password"
                type="password"
              />

              <button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
                Create Account

                <FiArrowRight />
              </button>
            </div>

            <p className="text-sm text-slate-500 mt-8 text-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Input({
  icon,
  placeholder,
  type = 'text',
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-3 border border-slate-200 rounded-2xl bg-slate-50 h-14 px-4 focus-within:border-slate-900 transition-all">
      <div className="text-slate-400">
        {icon}
      </div>

      <input
        type={type}
        placeholder={placeholder}
        className="bg-transparent outline-none w-full text-sm"
      />
    </div>
  );
}