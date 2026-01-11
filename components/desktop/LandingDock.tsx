import React from 'react';
import { Home, Settings2, Grid, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface DockProps {
  onOpenWindow: (id: string) => void;
}

export default function Dock({ onOpenWindow }: DockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="dock-glass px-4 py-3 rounded-2xl flex items-center gap-4 transition-all duration-300">

        {/* Dock Item: Welcome */}
        <button onClick={() => onOpenWindow('welcome')} className="group relative flex flex-col items-center">
          <motion.div
            whileHover={{ y: -8 }}
            className="w-12 h-12 rounded-xl bg-stone-800 flex items-center justify-center text-white shadow-lg shadow-stone-900/10 transition-transform duration-200"
          >
            <Home size={22} />
          </motion.div>
          <div className="absolute -bottom-2 w-1 h-1 bg-stone-400 rounded-full"></div>
        </button>

        {/* Separator */}
        <div className="w-px h-8 bg-stone-300/50 mx-1"></div>

        {/* Dock Item: Features */}
        <button onClick={() => onOpenWindow('features')} className="group relative flex flex-col items-center">
          <motion.div
            whileHover={{ y: -8 }}
            className="w-12 h-12 rounded-xl bg-white border border-stone-200/50 flex items-center justify-center text-stone-600 shadow-sm transition-transform duration-200"
          >
            <Settings2 size={22} />
          </motion.div>
        </button>

        {/* Dock Item: Examples */}
        <button onClick={() => onOpenWindow('examples')} className="group relative flex flex-col items-center">
          <motion.div
            whileHover={{ y: -8 }}
            className="w-12 h-12 rounded-xl bg-white border border-stone-200/50 flex items-center justify-center text-stone-600 shadow-sm transition-transform duration-200"
          >
            <Grid size={22} />
          </motion.div>
        </button>

        {/* Dock Item: Pricing */}
        <button onClick={() => onOpenWindow('pricing')} className="group relative flex flex-col items-center">
          <motion.div
            whileHover={{ y: -8 }}
            className="w-12 h-12 rounded-xl bg-white border border-stone-200/50 flex items-center justify-center text-stone-600 shadow-sm transition-transform duration-200"
          >
            <CreditCard size={22} />
          </motion.div>
        </button>

        {/* Separator */}
        <div className="w-px h-8 bg-stone-300/50 mx-1"></div>

        {/* CTA */}
        <button className="bg-orange-600/90 hover:bg-orange-600 text-white px-5 h-12 rounded-xl text-sm font-medium transition-all hover:-translate-y-1 shadow-lg shadow-orange-500/20 flex items-center gap-2">
          <span>Sign Up</span>
        </button>

      </div>
    </div>
  );
}
