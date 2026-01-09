'use client';

import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-[26px] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: checked ? 'var(--accent-success)' : 'var(--text-tertiary)',
        }}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-[22px] h-[22px] rounded-full bg-white"
          style={{
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
          animate={{
            x: checked ? 18 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
      {label && (
        <span
          className="text-[13px]"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </span>
      )}
    </label>
  );
}
