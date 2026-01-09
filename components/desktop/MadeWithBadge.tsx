'use client';

import { motion } from 'framer-motion';

export function MadeWithBadge() {
  return (
    <motion.a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[50] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium tracking-wide transition-opacity hover:opacity-100"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        color: 'var(--text-tertiary)',
        opacity: 0.7,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>Made with</span>
      <span className="font-semibold" style={{ color: 'var(--text-on-dark)' }}>
        MeOS
      </span>
    </motion.a>
  );
}
