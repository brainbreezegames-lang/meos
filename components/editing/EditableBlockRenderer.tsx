'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockData } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { EditableText } from './Editable';
import { BlockHoverToolbar, InlineDeleteButton } from './BlockHoverToolbar';

interface EditableBlockRendererProps {
  block: BlockData;
  itemId: string;
  onUpdate: (blockId: string, data: Record<string, unknown>) => void;
  onDelete: (blockId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  showToolbar?: boolean;
}

export function EditableBlockRenderer({
  block,
  itemId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  showToolbar = false,
}: EditableBlockRendererProps) {
  const context = useEditContextSafe();
  const [isHovered, setIsHovered] = useState(false);

  if (!context?.isOwner) {
    return <BlockRenderer block={block} />;
  }

  // Handle inline text editing for text blocks
  if (block.type === 'text') {
    const content = (block.data.content as string) || '';
    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Delete button */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              className="absolute -right-2 -top-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.id);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.9)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l6 6M8 2l-6 6" strokeLinecap="round" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <EditableText
          id={`${itemId}-${block.id}-content`}
          value={content}
          onChange={(newValue) => onUpdate(block.id, { content: newValue })}
          multiline
          placeholder="Type something..."
        >
          <div className="px-6 py-3">
            <p
              className="text-[14px] leading-[1.65] whitespace-pre-wrap"
              style={{ color: 'var(--text-primary)' }}
            >
              {content || <span className="opacity-40">Click to add text...</span>}
            </p>
          </div>
        </EditableText>
      </div>
    );
  }

  // Handle heading blocks
  if (block.type === 'heading') {
    const text = (block.data.text as string) || '';
    const level = (block.data.level as number) || 2;

    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.button
              className="absolute -right-2 -top-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.id);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.9)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l6 6M8 2l-6 6" strokeLinecap="round" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <EditableText
          id={`${itemId}-${block.id}-text`}
          value={text}
          onChange={(newValue) => onUpdate(block.id, { text: newValue, level })}
          placeholder="Heading..."
        >
          <div className="px-6 py-3">
            {level === 1 && (
              <h1 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {text || <span className="opacity-40">Heading...</span>}
              </h1>
            )}
            {level === 2 && (
              <h2 className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {text || <span className="opacity-40">Heading...</span>}
              </h2>
            )}
            {level === 3 && (
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {text || <span className="opacity-40">Heading...</span>}
              </h3>
            )}
          </div>
        </EditableText>
      </div>
    );
  }

  // Handle quote blocks
  if (block.type === 'quote') {
    const text = (block.data.text as string) || '';
    const attribution = (block.data.attribution as string) || '';

    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.button
              className="absolute -right-2 -top-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.id);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.9)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l6 6M8 2l-6 6" strokeLinecap="round" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="px-6 py-3">
          <div className="border-l-2 pl-4" style={{ borderColor: 'var(--accent-primary)' }}>
            <EditableText
              id={`${itemId}-${block.id}-quote-text`}
              value={text}
              onChange={(newValue) => onUpdate(block.id, { ...block.data, text: newValue })}
              multiline
              placeholder="Quote text..."
            >
              <p className="text-[15px] italic" style={{ color: 'var(--text-primary)' }}>
                &ldquo;{text || <span className="opacity-40">Quote text...</span>}&rdquo;
              </p>
            </EditableText>
            <EditableText
              id={`${itemId}-${block.id}-quote-attribution`}
              value={attribution}
              onChange={(newValue) => onUpdate(block.id, { ...block.data, attribution: newValue })}
              placeholder="Attribution..."
            >
              <p className="text-[12px] mt-2" style={{ color: 'var(--text-secondary)' }}>
                — {attribution || <span className="opacity-40">Attribution...</span>}
              </p>
            </EditableText>
          </div>
        </div>
      </div>
    );
  }

  // For all other block types, wrap with hover effects and toolbar
  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover toolbar (shown when showToolbar is true) */}
      {showToolbar && (
        <BlockHoverToolbar
          block={block}
          isVisible={isHovered}
          position="left"
          onDelete={() => onDelete(block.id)}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDuplicate={onDuplicate}
        />
      )}

      {/* Simple delete button (fallback when toolbar is disabled) */}
      {!showToolbar && (
        <InlineDeleteButton
          isVisible={isHovered}
          onClick={() => onDelete(block.id)}
        />
      )}

      {/* Hover highlight */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(0, 122, 255, 0.04)',
              boxShadow: 'inset 0 0 0 1px rgba(0, 122, 255, 0.15)',
            }}
          />
        )}
      </AnimatePresence>

      <BlockRenderer block={block} />
    </div>
  );
}
