'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type NoteType = 'general' | 'feedback' | 'opportunity';
type AuthorType = 'anonymous' | 'named' | 'social';

interface GuestbookEntry {
  id: string;
  message: string;
  type: NoteType;
  relatedProject?: string;
  authorType: AuthorType;
  authorName?: string;
  authorSocialProvider?: 'twitter' | 'linkedin';
  authorSocialHandle?: string;
  createdAt: Date;
  isPublic: boolean;
  ownerMarkedHelpful?: boolean;
}

interface GuestbookProps {
  entries: GuestbookEntry[];
  projects?: { id: string; name: string }[];
  onSubmit?: (entry: Omit<GuestbookEntry, 'id' | 'createdAt' | 'isPublic' | 'ownerMarkedHelpful'>) => void;
  isOwnerView?: boolean;
  onMarkHelpful?: (id: string) => void;
  onTogglePublic?: (id: string) => void;
}

const NOTE_TYPES: { type: NoteType; icon: string; label: string; desc: string }[] = [
  { type: 'general', icon: '💬', label: 'General', desc: 'Say hi or leave appreciation' },
  { type: 'feedback', icon: '🎨', label: 'Feedback', desc: 'Constructive feedback on work' },
  { type: 'opportunity', icon: '💼', label: 'Opportunity', desc: 'Job or collaboration interest' },
];

export function Guestbook({
  entries,
  projects = [],
  onSubmit,
  isOwnerView = false,
  onMarkHelpful,
  onTogglePublic,
}: GuestbookProps) {
  const [message, setMessage] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('general');
  const [authorType, setAuthorType] = useState<AuthorType>('anonymous');
  const [authorName, setAuthorName] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [filter, setFilter] = useState<NoteType | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);

    const entry: Omit<GuestbookEntry, 'id' | 'createdAt' | 'isPublic' | 'ownerMarkedHelpful'> = {
      message: message.trim(),
      type: noteType,
      authorType,
      ...(authorType === 'named' && authorName && { authorName }),
      ...(noteType === 'feedback' && selectedProject && { relatedProject: selectedProject }),
    };

    await onSubmit?.(entry);

    setMessage('');
    setNoteType('general');
    setAuthorType('anonymous');
    setAuthorName('');
    setSelectedProject('');
    setIsSubmitting(false);
  }, [message, noteType, authorType, authorName, selectedProject, onSubmit]);

  const filteredEntries = entries.filter(e =>
    (filter === 'all' || e.type === filter) && (isOwnerView || e.isPublic)
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <p
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Leave a note, feedback, or just say hi.
          <br />
          Be kind — this is someone&apos;s space.
        </p>
      </div>

      {/* Form */}
      <div className="px-5 py-4 border-b border-white/10 space-y-4">
        {/* Message input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 500))}
          placeholder="Write something..."
          className="w-full h-24 px-3 py-2 rounded-lg resize-none outline-none transition-all"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
            fontSize: '14px',
          }}
          maxLength={500}
        />

        {/* Author type */}
        <div className="space-y-2">
          <label className="text-xs text-white/50">Sign as:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setAuthorType('anonymous')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              style={{
                background: authorType === 'anonymous' ? 'var(--bg-button-hover)' : 'var(--bg-button)',
                color: authorType === 'anonymous' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              Anonymous
            </button>
            <button
              onClick={() => setAuthorType('named')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              style={{
                background: authorType === 'named' ? 'var(--bg-button-hover)' : 'var(--bg-button)',
                color: authorType === 'named' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              With Name
            </button>
          </div>

          {authorType === 'named' && (
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value.slice(0, 50))}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg outline-none mt-2"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
          )}
        </div>

        {/* Note type */}
        <div className="space-y-2">
          <label className="text-xs text-white/50">What kind of note is this?</label>
          <div className="flex gap-2 flex-wrap">
            {NOTE_TYPES.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setNoteType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5`}
                style={{
                  background: noteType === type ? 'var(--bg-button-hover)' : 'var(--bg-button)',
                  color: noteType === type ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Project selector for feedback */}
        {noteType === 'feedback' && projects.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-white/50">What&apos;s this about?</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg outline-none"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            >
              <option value="">General / Overall portfolio</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isSubmitting}
          className="w-full py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent-primary)',
            color: 'var(--text-on-accent)',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Leave Note'}
        </button>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto">
        {/* Filter */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-white/10">
          <span className="text-sm font-medium text-white/80">
            {isOwnerView ? 'All Notes' : 'Recent Notes'}
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as NoteType | 'all')}
            className="px-2 py-1 rounded text-xs"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)',
            }}
          >
            <option value="all">All</option>
            <option value="general">💬 General</option>
            <option value="feedback">🎨 Feedback</option>
            <option value="opportunity">💼 Opportunity</option>
          </select>
        </div>

        {/* Entries */}
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredEntries.length === 0 ? (
              <p className="text-center text-white/40 text-sm py-8">
                No messages yet. Leave the first one!
              </p>
            ) : (
              filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
                    &ldquo;{entry.message}&rdquo;
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <span>
                        {entry.authorType === 'anonymous'
                          ? '— Anonymous'
                          : `— ${entry.authorName || 'Someone'}`}
                      </span>
                      <span>·</span>
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>

                    <span className="text-sm">
                      {NOTE_TYPES.find(t => t.type === entry.type)?.icon}
                    </span>
                  </div>

                  {/* Owner controls */}
                  {isOwnerView && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                      <button
                        onClick={() => onMarkHelpful?.(entry.id)}
                        className={`px-2 py-1 rounded text-xs transition-all ${entry.ownerMarkedHelpful
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                          }`}
                      >
                        {entry.ownerMarkedHelpful ? '✓ Helpful' : 'Mark Helpful 👍'}
                      </button>
                      <button
                        onClick={() => onTogglePublic?.(entry.id)}
                        className={`px-2 py-1 rounded text-xs transition-all ${entry.isPublic
                            ? 'bg-white/5 text-white/50 hover:bg-white/10'
                            : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                      >
                        {entry.isPublic ? 'Hide' : 'Make Public'}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export type { GuestbookEntry, NoteType, AuthorType };
