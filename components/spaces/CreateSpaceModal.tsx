'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Lock, ChevronDown, Sparkles, Copy } from 'lucide-react';
import type { SpaceSummary } from '@/types';

// ============================================
// TYPES
// ============================================

export interface CreateSpaceData {
  name: string;
  icon: string;
  slug: string | null;
  copyFromSpaceId?: string;
}

export interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateSpaceData) => void;
  existingSpaces: SpaceSummary[];
  existingSlugs: string[];
}

// ============================================
// CONSTANTS
// ============================================

const EMOJI_CATEGORIES = [
  {
    name: 'Suggested',
    emojis: ['🎨', '✍️', '📸', '🎬', '💼', '🎵', '📚', '🔬', '🌱', '🏠', '💡', '🚀'],
  },
  {
    name: 'Activities',
    emojis: ['🎯', '🎪', '🎭', '🎮', '🎲', '🧩', '🎤', '🎧', '🎹', '🎻', '🏆', '⚽'],
  },
  {
    name: 'Objects',
    emojis: ['💻', '📱', '📷', '🎥', '🖥️', '⌨️', '🖌️', '✏️', '📝', '📎', '🔧', '🔑'],
  },
  {
    name: 'Nature',
    emojis: ['🌸', '🌺', '🌻', '🌿', '🍀', '🌲', '🌊', '⭐', '🌙', '☀️', '🌈', '🔥'],
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '💜', '💙', '💚', '🧡', '💛', '🖤', '🤍', '💫', '✨', '⚡', '💎'],
  },
];

const MAX_NAME_LENGTH = 30;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

// ============================================
// HELPERS
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
}

function getRandomEmoji(): string {
  const all = EMOJI_CATEGORIES.flatMap(c => c.emojis);
  return all[Math.floor(Math.random() * all.length)];
}

// ============================================
// COMPONENT
// ============================================

export function CreateSpaceModal({
  isOpen,
  onClose,
  onCreate,
  existingSpaces,
  existingSlugs,
}: CreateSpaceModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(getRandomEmoji);
  const [isPublic, setIsPublic] = useState(true);
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [copyFromSpaceId, setCopyFromSpaceId] = useState<string | null>(null);
  const [showCopyDropdown, setShowCopyDropdown] = useState(false);

  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');

  // Refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const copyDropdownRef = useRef<HTMLDivElement>(null);

  // Validation
  const nameError = name.length > MAX_NAME_LENGTH ? `Max ${MAX_NAME_LENGTH} characters` : null;
  const slugError = isPublic && slug && existingSlugs.includes(slug)
    ? 'This URL is already taken'
    : null;
  const isValid = name.trim().length > 0 && !nameError && !slugError;

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugEdited && name) {
      setSlug(generateSlug(name));
    }
  }, [name, slugEdited]);

  // Focus name input when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setIcon(getRandomEmoji());
      setIsPublic(true);
      setSlug('');
      setSlugEdited(false);
      setCopyFromSpaceId(null);
      setCustomEmoji('');

      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        } else if (showCopyDropdown) {
          setShowCopyDropdown(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, showEmojiPicker, showCopyDropdown]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClick = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    setTimeout(() => document.addEventListener('mousedown', handleClick), 10);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showEmojiPicker]);

  // Close copy dropdown on outside click
  useEffect(() => {
    if (!showCopyDropdown) return;

    const handleClick = (e: MouseEvent) => {
      if (copyDropdownRef.current && !copyDropdownRef.current.contains(e.target as Node)) {
        setShowCopyDropdown(false);
      }
    };

    setTimeout(() => document.addEventListener('mousedown', handleClick), 10);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCopyDropdown]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;

    onCreate({
      name: name.trim(),
      icon,
      slug: isPublic ? slug : null,
      copyFromSpaceId: copyFromSpaceId || undefined,
    });

    onClose();
  }, [isValid, name, icon, isPublic, slug, copyFromSpaceId, onCreate, onClose]);

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(sanitized);
    setSlugEdited(true);
  };

  const handleCustomEmojiSubmit = () => {
    if (customEmoji.trim()) {
      // Try to extract first emoji from input
      const emojiMatch = customEmoji.match(/\p{Emoji}/u);
      if (emojiMatch) {
        setIcon(emojiMatch[0]);
        setShowEmojiPicker(false);
        setCustomEmoji('');
      }
    }
  };

  const copyFromSpace = copyFromSpaceId
    ? existingSpaces.find(s => s.id === copyFromSpaceId)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(23, 20, 18, 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 5 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 400,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: 400,
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '2px solid var(--color-text-primary)',
                borderRadius: 12,
                boxShadow: `
                  0 4px 6px -1px rgba(23, 20, 18, 0.1),
                  0 10px 24px -3px rgba(23, 20, 18, 0.2),
                  0 30px 60px -6px rgba(23, 20, 18, 0.15)
                `,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: '2px solid var(--color-text-primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles
                    size={16}
                    strokeWidth={2}
                    style={{ color: 'var(--color-accent-primary)' }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Create New Space
                  </span>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    padding: 4,
                    borderRadius: 6,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <X size={16} strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                {/* Icon + Name Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  {/* Icon Picker */}
                  <div style={{ position: 'relative' }} ref={emojiPickerRef}>
                    <motion.button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: 'var(--color-bg-subtle)',
                        border: '2px solid var(--color-text-primary)',
                        cursor: 'pointer',
                        fontSize: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {icon}
                    </motion.button>

                    {/* Emoji Picker Dropdown */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            width: 280,
                            background: 'var(--color-bg-base)',
                            border: '2px solid var(--color-text-primary)',
                            borderRadius: 12,
                            boxShadow: `
                              0 4px 12px rgba(23, 20, 18, 0.1),
                              0 16px 32px rgba(23, 20, 18, 0.15)
                            `,
                            zIndex: 10,
                            overflow: 'hidden',
                          }}
                        >
                          {/* Custom emoji input */}
                          <div
                            style={{
                              padding: '12px 12px 8px',
                              borderBottom: '1px solid var(--color-border-default)',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center',
                              }}
                            >
                              <input
                                type="text"
                                value={customEmoji}
                                onChange={(e) => setCustomEmoji(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleCustomEmojiSubmit();
                                  }
                                }}
                                placeholder="Type any emoji..."
                                style={{
                                  flex: 1,
                                  padding: '8px 10px',
                                  fontSize: 13,
                                  border: '1.5px solid var(--color-border-strong)',
                                  borderRadius: 8,
                                  background: 'var(--color-bg-white)',
                                  color: 'var(--color-text-primary)',
                                  outline: 'none',
                                }}
                              />
                            </div>
                          </div>

                          {/* Emoji grid */}
                          <div
                            style={{
                              maxHeight: 240,
                              overflowY: 'auto',
                              padding: 8,
                            }}
                          >
                            {EMOJI_CATEGORIES.map((category) => (
                              <div key={category.name} style={{ marginBottom: 8 }}>
                                <div
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    padding: '4px 4px 6px',
                                  }}
                                >
                                  {category.name}
                                </div>
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(6, 1fr)',
                                    gap: 2,
                                  }}
                                >
                                  {category.emojis.map((emoji) => (
                                    <motion.button
                                      key={emoji}
                                      type="button"
                                      onClick={() => {
                                        setIcon(emoji);
                                        setShowEmojiPicker(false);
                                      }}
                                      whileHover={{ scale: 1.2, backgroundColor: 'var(--color-bg-subtle)' }}
                                      whileTap={{ scale: 0.9 }}
                                      style={{
                                        width: 36,
                                        height: 36,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                        background: icon === emoji ? 'var(--color-accent-primary-subtle)' : 'transparent',
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {emoji}
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Name Input */}
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 6,
                      }}
                    >
                      Name
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && isValid) {
                          handleSubmit();
                        }
                      }}
                      placeholder="My Space"
                      maxLength={MAX_NAME_LENGTH + 5}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: 15,
                        fontWeight: 500,
                        border: `2px solid ${nameError ? 'var(--color-error)' : 'var(--color-text-primary)'}`,
                        borderRadius: 10,
                        background: 'var(--color-bg-white)',
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {nameError && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--color-error)',
                          marginTop: 4,
                        }}
                      >
                        {nameError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 8,
                    }}
                  >
                    Visibility
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '10px 14px',
                        fontSize: 13,
                        fontWeight: 500,
                        border: `2px solid ${isPublic ? 'var(--color-accent-primary)' : 'var(--color-border-strong)'}`,
                        borderRadius: 10,
                        background: isPublic ? 'var(--color-accent-primary-subtle)' : 'var(--color-bg-white)',
                        color: isPublic ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      <Globe size={14} strokeWidth={2.5} />
                      Public
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '10px 14px',
                        fontSize: 13,
                        fontWeight: 500,
                        border: `2px solid ${!isPublic ? 'var(--color-accent-primary)' : 'var(--color-border-strong)'}`,
                        borderRadius: 10,
                        background: !isPublic ? 'var(--color-accent-primary-subtle)' : 'var(--color-bg-white)',
                        color: !isPublic ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      <Lock size={14} strokeWidth={2.5} />
                      Private
                    </motion.button>
                  </div>
                </div>

                {/* Slug Input (only if public) */}
                <AnimatePresence>
                  {isPublic && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ marginBottom: 16, overflow: 'hidden' }}
                    >
                      <label
                        style={{
                          display: 'block',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: 6,
                        }}
                      >
                        URL
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 12px',
                          fontSize: 13,
                          border: `2px solid ${slugError ? 'var(--color-error)' : 'var(--color-text-primary)'}`,
                          borderRadius: 10,
                          background: 'var(--color-bg-white)',
                        }}
                      >
                        <span style={{ color: 'var(--color-text-muted)', marginRight: 2 }}>
                          you.goos.app/
                        </span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          placeholder="my-space"
                          style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-text-primary)',
                            fontWeight: 500,
                            outline: 'none',
                            fontSize: 13,
                          }}
                        />
                      </div>
                      {slugError && (
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--color-error)',
                            marginTop: 4,
                          }}
                        >
                          {slugError}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Copy from Space */}
                {existingSpaces.length > 0 && (
                  <div style={{ marginBottom: 20, position: 'relative' }} ref={copyDropdownRef}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 6,
                      }}
                    >
                      Start with
                    </label>
                    <motion.button
                      type="button"
                      onClick={() => setShowCopyDropdown(!showCopyDropdown)}
                      whileHover={{ scale: 1.01 }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontWeight: 500,
                        border: '2px solid var(--color-border-strong)',
                        borderRadius: 10,
                        background: 'var(--color-bg-white)',
                        color: copyFromSpace ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {copyFromSpace ? (
                          <>
                            <Copy size={14} strokeWidth={2} style={{ color: 'var(--color-text-muted)' }} />
                            <span style={{ fontSize: 16 }}>{copyFromSpace.icon}</span>
                            Copy from {copyFromSpace.name}
                          </>
                        ) : (
                          'Empty space'
                        )}
                      </span>
                      <ChevronDown
                        size={14}
                        strokeWidth={2.5}
                        style={{
                          color: 'var(--color-text-muted)',
                          transform: showCopyDropdown ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {showCopyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            background: 'var(--color-bg-base)',
                            border: '2px solid var(--color-text-primary)',
                            borderRadius: 10,
                            boxShadow: '0 8px 24px rgba(23, 20, 18, 0.15)',
                            zIndex: 10,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setCopyFromSpaceId(null);
                              setShowCopyDropdown(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              fontSize: 13,
                              fontWeight: 500,
                              border: 'none',
                              background: !copyFromSpaceId ? 'var(--color-bg-subtle)' : 'transparent',
                              color: 'var(--color-text-primary)',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            Empty space
                          </button>
                          {existingSpaces.map((space) => (
                            <button
                              key={space.id}
                              type="button"
                              onClick={() => {
                                setCopyFromSpaceId(space.id);
                                setShowCopyDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 12px',
                                fontSize: 13,
                                fontWeight: 500,
                                border: 'none',
                                background: copyFromSpaceId === space.id ? 'var(--color-bg-subtle)' : 'transparent',
                                color: 'var(--color-text-primary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <span style={{ fontSize: 16 }}>{space.icon}</span>
                              Copy from {space.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      border: '2px solid var(--color-border-strong)',
                      borderRadius: 10,
                      background: 'var(--color-bg-white)',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={!isValid}
                    whileHover={isValid ? { scale: 1.02 } : {}}
                    whileTap={isValid ? { scale: 0.98 } : {}}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      border: '2px solid var(--color-text-primary)',
                      borderRadius: 10,
                      background: isValid ? 'var(--color-accent-primary)' : 'var(--color-bg-subtle)',
                      color: isValid ? 'white' : 'var(--color-text-muted)',
                      cursor: isValid ? 'pointer' : 'not-allowed',
                      boxShadow: isValid ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    Create Space
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreateSpaceModal;
