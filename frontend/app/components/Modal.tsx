'use client';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all">
                <FiX />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}