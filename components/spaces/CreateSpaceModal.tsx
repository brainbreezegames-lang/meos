'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Lock, ChevronDown, Sparkles, Copy } from 'lucide-react';
import type { SpaceSummary } from '@/types';
import { goOSTokens } from '@/components/goos-editor/GoOSTipTapEditor';

// ============================================
// TYPES
// ============================================

export interface CreateSpaceData {
  name: string;
  icon: string;
  isPublic: boolean;
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
      isPublic,
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
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 9998,
            }}
          />

          {/* Dialog */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              maxWidth: '90vw',
              background: goOSTokens.colors.paper,
              border: `2px solid ${goOSTokens.colors.border}`,
              borderRadius: 8,
              boxShadow: goOSTokens.shadows.solid,
              zIndex: 9999,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: `1px solid ${goOSTokens.colors.border}30`,
                background: goOSTokens.colors.headerBg,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={16} style={{ color: goOSTokens.colors.text.secondary }} />
                <h2
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: goOSTokens.colors.text.primary,
                    fontFamily: goOSTokens.fonts.heading,
                  }}
                >
                  Create New Space
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  color: goOSTokens.colors.text.muted,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: 16 }}>
              {/* Icon + Name Row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {/* Icon Picker */}
                <div style={{ position: 'relative' }} ref={emojiPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 6,
                      background: goOSTokens.colors.paper,
                      border: `2px solid ${goOSTokens.colors.border}`,
                      cursor: 'pointer',
                      fontSize: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </button>

                  {/* Emoji Picker Dropdown */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                          width: 260,
                          background: goOSTokens.colors.paper,
                          border: `2px solid ${goOSTokens.colors.border}`,
                          borderRadius: 6,
                          boxShadow: goOSTokens.shadows.solid,
                          zIndex: 10,
                          overflow: 'hidden',
                        }}
                      >
                        {/* Custom emoji input */}
                        <div style={{ padding: '10px 10px 8px', borderBottom: `1px solid ${goOSTokens.colors.border}30` }}>
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
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: 13,
                              border: `2px solid ${goOSTokens.colors.border}`,
                              borderRadius: 6,
                              background: goOSTokens.colors.paper,
                              color: goOSTokens.colors.text.primary,
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        {/* Emoji grid */}
                        <div style={{ maxHeight: 200, overflowY: 'auto', padding: 8 }}>
                          {EMOJI_CATEGORIES.map((category) => (
                            <div key={category.name} style={{ marginBottom: 8 }}>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: goOSTokens.colors.text.muted,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  padding: '4px 4px 6px',
                                  fontFamily: goOSTokens.fonts.body,
                                }}
                              >
                                {category.name}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
                                {category.emojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      setIcon(emoji);
                                      setShowEmojiPicker(false);
                                    }}
                                    style={{
                                      width: 34,
                                      height: 34,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 18,
                                      background: icon === emoji ? goOSTokens.colors.headerBg : 'transparent',
                                      border: 'none',
                                      borderRadius: 6,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {emoji}
                                  </button>
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
                      fontSize: 12,
                      fontWeight: 500,
                      color: goOSTokens.colors.text.secondary,
                      marginBottom: 6,
                      fontFamily: goOSTokens.fonts.body,
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
                      padding: '10px 12px',
                      fontSize: 14,
                      fontFamily: goOSTokens.fonts.body,
                      border: `2px solid ${nameError ? goOSTokens.colors.status.error : goOSTokens.colors.border}`,
                      borderRadius: 6,
                      background: goOSTokens.colors.paper,
                      color: goOSTokens.colors.text.primary,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {nameError && (
                    <div style={{ fontSize: 11, color: goOSTokens.colors.status.error, marginTop: 4, fontFamily: goOSTokens.fonts.body }}>
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
                    fontSize: 12,
                    fontWeight: 500,
                    color: goOSTokens.colors.text.secondary,
                    marginBottom: 8,
                    fontFamily: goOSTokens.fonts.body,
                  }}
                >
                  Visibility
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: goOSTokens.fonts.body,
                      border: `2px solid ${goOSTokens.colors.border}`,
                      borderRadius: 6,
                      background: isPublic ? goOSTokens.colors.headerBg : goOSTokens.colors.paper,
                      color: goOSTokens.colors.text.primary,
                      cursor: 'pointer',
                    }}
                  >
                    <Globe size={14} />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: goOSTokens.fonts.body,
                      border: `2px solid ${goOSTokens.colors.border}`,
                      borderRadius: 6,
                      background: !isPublic ? goOSTokens.colors.headerBg : goOSTokens.colors.paper,
                      color: goOSTokens.colors.text.primary,
                      cursor: 'pointer',
                    }}
                  >
                    <Lock size={14} />
                    Private
                  </button>
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
                        fontSize: 12,
                        fontWeight: 500,
                        color: goOSTokens.colors.text.secondary,
                        marginBottom: 6,
                        fontFamily: goOSTokens.fonts.body,
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
                        fontFamily: goOSTokens.fonts.body,
                        border: `2px solid ${slugError ? goOSTokens.colors.status.error : goOSTokens.colors.border}`,
                        borderRadius: 6,
                        background: goOSTokens.colors.paper,
                      }}
                    >
                      <span style={{ color: goOSTokens.colors.text.muted, marginRight: 2 }}>
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
                          color: goOSTokens.colors.text.primary,
                          fontWeight: 500,
                          outline: 'none',
                          fontSize: 13,
                          fontFamily: goOSTokens.fonts.body,
                        }}
                      />
                    </div>
                    {slugError && (
                      <div style={{ fontSize: 11, color: goOSTokens.colors.status.error, marginTop: 4, fontFamily: goOSTokens.fonts.body }}>
                        {slugError}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Copy from Space */}
              {existingSpaces.length > 0 && (
                <div style={{ marginBottom: 16, position: 'relative' }} ref={copyDropdownRef}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: goOSTokens.colors.text.secondary,
                      marginBottom: 6,
                      fontFamily: goOSTokens.fonts.body,
                    }}
                  >
                    Start with
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCopyDropdown(!showCopyDropdown)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: goOSTokens.fonts.body,
                      border: `2px solid ${goOSTokens.colors.border}`,
                      borderRadius: 6,
                      background: goOSTokens.colors.paper,
                      color: copyFromSpace ? goOSTokens.colors.text.primary : goOSTokens.colors.text.muted,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {copyFromSpace ? (
                        <>
                          <Copy size={14} style={{ color: goOSTokens.colors.text.muted }} />
                          <span style={{ fontSize: 16 }}>{copyFromSpace.icon}</span>
                          Copy from {copyFromSpace.name}
                        </>
                      ) : (
                        'Empty space'
                      )}
                    </span>
                    <ChevronDown
                      size={14}
                      style={{
                        color: goOSTokens.colors.text.muted,
                        transform: showCopyDropdown ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>

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
                          background: goOSTokens.colors.paper,
                          border: `2px solid ${goOSTokens.colors.border}`,
                          borderRadius: 6,
                          boxShadow: goOSTokens.shadows.solid,
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
                            fontFamily: goOSTokens.fonts.body,
                            border: 'none',
                            background: !copyFromSpaceId ? goOSTokens.colors.headerBg : 'transparent',
                            color: goOSTokens.colors.text.primary,
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
                              fontFamily: goOSTokens.fonts.body,
                              border: 'none',
                              background: copyFromSpaceId === space.id ? goOSTokens.colors.headerBg : 'transparent',
                              color: goOSTokens.colors.text.primary,
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
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: goOSTokens.fonts.body,
                    border: `2px solid ${goOSTokens.colors.border}`,
                    borderRadius: 6,
                    background: goOSTokens.colors.paper,
                    color: goOSTokens.colors.text.primary,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: goOSTokens.fonts.body,
                    border: `2px solid ${goOSTokens.colors.border}`,
                    borderRadius: 6,
                    background: isValid ? goOSTokens.colors.border : goOSTokens.colors.headerBg,
                    color: isValid ? goOSTokens.colors.paper : goOSTokens.colors.text.muted,
                    cursor: isValid ? 'pointer' : 'not-allowed',
                    opacity: isValid ? 1 : 0.6,
                  }}
                >
                  Create Space
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreateSpaceModal;
