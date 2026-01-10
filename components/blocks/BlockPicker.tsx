'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BLOCK_DEFINITIONS, BLOCK_CATEGORIES, BlockType } from '@/types/blocks';

interface BlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
}

export default function BlockPicker({ isOpen, onClose, onSelect }: BlockPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDefinitions = searchQuery
    ? BLOCK_DEFINITIONS.filter(
        (def) =>
          def.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          def.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : BLOCK_DEFINITIONS;

  const handleSelect = (type: BlockType) => {
    onSelect(type);
    onClose();
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[300]"
            style={{ background: 'rgba(0, 0, 0, 0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[301] w-[360px] max-h-[500px] overflow-hidden flex flex-col"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '12px',
              background: 'var(--bg-elevated)',
              boxShadow: `
                0 24px 48px -12px rgba(0, 0, 0, 0.25),
                0 0 0 1px var(--border-light)
              `,
            }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
              <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Add Block
              </h3>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[var(--border-light)]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blocks..."
                className="w-full px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
              />
            </div>

            {/* Block List */}
            <div className="flex-1 overflow-y-auto p-2">
              {searchQuery ? (
                <div className="space-y-1">
                  {filteredDefinitions.map((def) => (
                    <button
                      key={def.type}
                      onClick={() => handleSelect(def.type)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors text-left"
                    >
                      <span className="w-8 h-8 flex items-center justify-center rounded-md text-[14px]"
                        style={{ background: 'var(--bg-glass)' }}>
                        {def.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                          {def.label}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                          {def.description}
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredDefinitions.length === 0 && (
                    <div className="text-center py-8 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                      No blocks found
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {BLOCK_CATEGORIES.map((category) => {
                    const categoryBlocks = BLOCK_DEFINITIONS.filter(
                      (def) => def.category === category.id
                    );
                    return (
                      <div key={category.id}>
                        <div className="flex items-center gap-2 px-2 mb-2">
                          <span className="text-[12px]">{category.icon}</span>
                          <span className="text-[11px] font-medium uppercase tracking-wide"
                            style={{ color: 'var(--text-tertiary)' }}>
                            {category.label}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {categoryBlocks.map((def) => (
                            <button
                              key={def.type}
                              onClick={() => handleSelect(def.type)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors text-left"
                            >
                              <span className="w-7 h-7 flex items-center justify-center rounded text-[12px]"
                                style={{ background: 'var(--bg-glass)' }}>
                                {def.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {def.label}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
