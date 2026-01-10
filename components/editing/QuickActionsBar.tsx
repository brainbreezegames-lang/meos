'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { InlineBlockPicker } from './InlineBlockPicker';
import { BlockType } from '@/types/blocks';

interface QuickActionsBarProps {
  onAddBlock: (type: BlockType) => void;
  onAddTab?: () => void;
  onToggleSettings?: () => void;
}

export function QuickActionsBar({
  onAddBlock,
  onAddTab,
  onToggleSettings,
}: QuickActionsBarProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const handleAddClick = () => {
    if (addButtonRef.current) {
      const rect = addButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        x: rect.left,
        y: rect.top - 360,
      });
      setShowBlockPicker(true);
    }
  };

  const handleBlockSelect = (type: BlockType) => {
    onAddBlock(type);
    setShowBlockPicker(false);
  };

  return (
    <>
      <motion.div
        className="flex items-center justify-between"
        style={{
          padding: '8px 12px',
          borderTop: '0.5px solid var(--border-light)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.015) 100%)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
      >
        {/* Left actions */}
        <div className="flex items-center gap-2">
          {/* Add block button */}
          <ActionButton
            ref={addButtonRef}
            onClick={handleAddClick}
            icon={<PlusIcon />}
            label="Add block"
            shortcut="/"
            primary
          />

          {/* Add tab button */}
          {onAddTab && (
            <ActionButton
              onClick={onAddTab}
              icon={<TabIcon />}
              label="Add tab"
            />
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Keyboard hint */}
          <span
            className="flex items-center gap-1.5"
            style={{ color: 'var(--text-tertiary)', fontSize: 11 }}
          >
            Type
            <kbd
              className="px-1.5 py-0.5 rounded"
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                background: 'var(--bg-elevated)',
                boxShadow: '0 0.5px 1px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
              }}
            >
              /
            </kbd>
            to add blocks
          </span>

          {/* Settings button */}
          {onToggleSettings && (
            <button
              onClick={onToggleSettings}
              className="flex items-center justify-center rounded-md transition-all"
              style={{
                width: 28,
                height: 28,
                background: 'transparent',
                color: 'var(--text-tertiary)',
              }}
              title="Settings"
            >
              <SettingsIcon />
            </button>
          )}
        </div>
      </motion.div>

      {/* Inline block picker */}
      <InlineBlockPicker
        isOpen={showBlockPicker}
        position={pickerPosition}
        onSelect={handleBlockSelect}
        onClose={() => setShowBlockPicker(false)}
      />
    </>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  primary?: boolean;
}

import { forwardRef } from 'react';

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ onClick, icon, label, shortcut, primary }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-1.5 rounded-md transition-all"
        style={{
          padding: '5px 10px',
          fontSize: 12,
          fontWeight: 500,
          background: primary
            ? isHovered
              ? 'linear-gradient(180deg, rgba(0,122,255,0.12) 0%, rgba(0,122,255,0.08) 100%)'
              : 'var(--bg-elevated)'
            : isHovered
              ? 'var(--border-light)'
              : 'transparent',
          color: primary
            ? isHovered
              ? '#007AFF'
              : 'var(--text-secondary)'
            : 'var(--text-tertiary)',
          boxShadow: primary
            ? isHovered
              ? '0 0 0 1px rgba(0,122,255,0.2)'
              : '0 0.5px 1px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)'
            : 'none',
        }}
      >
        <span style={{ opacity: 0.7 }}>{icon}</span>
        <span>{label}</span>
        {shortcut && (
          <span
            className="px-1 py-0.5 rounded"
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              background: isHovered && primary
                ? 'rgba(0,122,255,0.15)'
                : 'var(--border-light)',
              color: isHovered && primary
                ? '#007AFF'
                : 'var(--text-tertiary)',
              marginLeft: 2,
            }}
          >
            {shortcut}
          </span>
        )}
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

// Icon components
function PlusIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2v8M2 6h8" strokeLinecap="round" />
    </svg>
  );
}

function TabIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="1" y="3" width="10" height="7" rx="1" />
      <path d="M1 4.5h4v-1.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="7" cy="7" r="2" />
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4M11.2 2.8l-1.4 1.4M4.2 9.8l-1.4 1.4" strokeLinecap="round" />
    </svg>
  );
}

// Compact version for smaller windows
export function CompactQuickActions({
  onAddBlock,
}: {
  onAddBlock: (type: BlockType) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left,
        y: rect.bottom + 8,
      });
      setShowPicker(true);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full flex items-center justify-center gap-2 transition-all"
        style={{
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 500,
          borderRadius: 8,
          border: '1px dashed',
          borderColor: isHovered ? 'rgba(0,122,255,0.4)' : 'var(--border-medium)',
          color: isHovered ? '#007AFF' : 'var(--text-tertiary)',
          background: isHovered
            ? 'linear-gradient(180deg, rgba(0,122,255,0.06) 0%, rgba(0,122,255,0.02) 100%)'
            : 'transparent',
        }}
      >
        <PlusIcon />
        <span>Add block</span>
        <span
          className="px-1.5 py-0.5 rounded"
          style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            background: isHovered ? 'rgba(0,122,255,0.12)' : 'var(--border-light)',
            color: isHovered ? '#007AFF' : 'var(--text-tertiary)',
          }}
        >
          /
        </span>
      </button>

      <InlineBlockPicker
        isOpen={showPicker}
        position={position}
        onSelect={(type) => {
          onAddBlock(type);
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}
