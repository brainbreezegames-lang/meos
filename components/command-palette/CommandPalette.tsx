'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING, DURATION, fade } from '@/lib/animations';
import { playSound } from '@/lib/sounds';
import {
  fuzzyMatch,
  highlightMatches,
  searchItems,
  type SearchableItem,
  type HighlightSegment,
} from '@/lib/fuzzySearch';

// ============================================================================
// TYPES
// ============================================================================

export type FileType = 'note' | 'folder' | 'case-study' | 'image' | 'link' | 'embed' | 'download' | 'cv';

export interface CommandFile {
  id: string;
  title: string;
  type: FileType;
  parentFolderId?: string;
}

export interface CommandAction {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  keywords?: string[];
  onExecute: () => void;
  category: 'file' | 'action' | 'navigation' | 'settings';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: CommandFile[];
  selectedFileId?: string | null;
  onOpenFile: (id: string) => void;
  onCreateNote?: () => void;
  onCreateFolder?: () => void;
  onCreateCaseStudy?: () => void;
  onToggleDarkMode?: () => void;
  onOpenSettings?: () => void;
  onRenameFile?: (id: string) => void;
  onDeleteFile?: (id: string) => void;
  onDuplicateFile?: (id: string) => void;
  isDarkMode?: boolean;
}

interface CommandResultItem {
  id: string;
  name: string;
  type: 'file' | 'action';
  icon: string;
  shortcut?: string;
  category?: string;
  matches: number[];
  onExecute: () => void;
}

// ============================================================================
// FILE TYPE ICONS
// ============================================================================

const FILE_ICONS: Record<FileType, string> = {
  note: '\ud83d\udcc4',
  folder: '\ud83d\udcc1',
  'case-study': '\ud83c\udfa8',
  image: '\ud83d\uddbc\ufe0f',
  link: '\ud83d\udd17',
  embed: '\ud83d\udcf9',
  download: '\ud83d\udce5',
  cv: '\ud83d\udccb',
};

// ============================================================================
// RECENT FILES STORAGE
// ============================================================================

const RECENT_FILES_KEY = 'goos-recent-files';
const MAX_RECENT = 20;

function getRecentFiles(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_FILES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentFile(fileId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentFiles().filter(id => id !== fileId);
    recent.unshift(fileId);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// RELATIVE TIME FORMATTER
// ============================================================================

function getRelativeTime(timestamp?: number): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return '';
}

// ============================================================================
// HIGHLIGHTED TEXT COMPONENT
// ============================================================================

function HighlightedText({ segments }: { segments: HighlightSegment[] }) {
  return (
    <>
      {segments.map((segment, i) =>
        segment.highlighted ? (
          <mark
            key={i}
            style={{
              background: 'var(--color-accent-primary-glow)',
              color: 'inherit',
              borderRadius: 2,
              padding: '0 1px',
            }}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CommandPalette({
  isOpen,
  onClose,
  files,
  selectedFileId,
  onOpenFile,
  onCreateNote,
  onCreateFolder,
  onCreateCaseStudy,
  onToggleDarkMode,
  onOpenSettings,
  onRenameFile,
  onDeleteFile,
  onDuplicateFile,
  isDarkMode,
}: CommandPaletteProps) {
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Get prefix mode from query
  const prefixMode = useMemo(() => {
    if (query.startsWith('>')) return 'actions';
    if (query.startsWith('/')) return 'create';
    if (query.startsWith('@')) return 'spaces';
    if (query.startsWith('#')) return 'settings';
    return null;
  }, [query]);

  const searchQuery = prefixMode ? query.slice(1) : query;

  // Build actions list
  const actions = useMemo<CommandAction[]>(() => {
    const baseActions: CommandAction[] = [];

    // Create actions
    if (onCreateNote) {
      baseActions.push({
        id: 'new-note',
        name: 'New Note',
        icon: '\u2795',
        shortcut: '\u2318N',
        keywords: ['create', 'add'],
        category: 'action',
        onExecute: onCreateNote,
      });
    }
    if (onCreateCaseStudy) {
      baseActions.push({
        id: 'new-case-study',
        name: 'New Case Study',
        icon: '\u2795',
        shortcut: '\u2318\u21e7N',
        keywords: ['create', 'add', 'project'],
        category: 'action',
        onExecute: onCreateCaseStudy,
      });
    }
    if (onCreateFolder) {
      baseActions.push({
        id: 'new-folder',
        name: 'New Folder',
        icon: '\ud83d\udcc1',
        keywords: ['create', 'add', 'directory'],
        category: 'action',
        onExecute: onCreateFolder,
      });
    }

    // Settings actions
    if (onToggleDarkMode) {
      baseActions.push({
        id: 'toggle-dark-mode',
        name: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon: isDarkMode ? '\u2600\ufe0f' : '\ud83c\udf19',
        keywords: ['theme', 'appearance', 'dark', 'light'],
        category: 'settings',
        onExecute: onToggleDarkMode,
      });
    }
    if (onOpenSettings) {
      baseActions.push({
        id: 'settings',
        name: 'Settings',
        icon: '\u2699\ufe0f',
        shortcut: '\u2318,',
        keywords: ['preferences', 'options', 'config'],
        category: 'settings',
        onExecute: onOpenSettings,
      });
    }

    // Context actions for selected file
    if (selectedFileId) {
      const selectedFile = files.find(f => f.id === selectedFileId);
      if (selectedFile) {
        baseActions.push({
          id: 'open-selected',
          name: `Open ${selectedFile.title}`,
          icon: '\ud83d\udcc2',
          keywords: ['open'],
          category: 'file',
          onExecute: () => onOpenFile(selectedFileId),
        });
        if (onRenameFile) {
          baseActions.push({
            id: 'rename-selected',
            name: `Rename ${selectedFile.title}`,
            icon: '\u270f\ufe0f',
            shortcut: '\u2318R',
            category: 'file',
            onExecute: () => onRenameFile(selectedFileId),
          });
        }
        if (onDuplicateFile) {
          baseActions.push({
            id: 'duplicate-selected',
            name: `Duplicate ${selectedFile.title}`,
            icon: '\ud83d\udccb',
            shortcut: '\u2318D',
            category: 'file',
            onExecute: () => onDuplicateFile(selectedFileId),
          });
        }
        if (onDeleteFile) {
          baseActions.push({
            id: 'delete-selected',
            name: `Delete ${selectedFile.title}`,
            icon: '\ud83d\uddd1\ufe0f',
            shortcut: '\u232b',
            category: 'file',
            onExecute: () => onDeleteFile(selectedFileId),
          });
        }
      }
    }

    return baseActions;
  }, [
    onCreateNote,
    onCreateCaseStudy,
    onCreateFolder,
    onToggleDarkMode,
    onOpenSettings,
    onRenameFile,
    onDeleteFile,
    onDuplicateFile,
    selectedFileId,
    files,
    isDarkMode,
    onOpenFile,
  ]);

  // Build results based on query and mode
  const results = useMemo<CommandResultItem[]>(() => {
    const recentIds = getRecentFiles();
    const items: CommandResultItem[] = [];

    // Empty state: show recent files + quick actions
    if (!query.trim()) {
      // Recent files
      const recentFiles = files
        .filter(f => recentIds.includes(f.id))
        .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
        .slice(0, 5);

      for (const file of recentFiles) {
        items.push({
          id: file.id,
          name: file.title,
          type: 'file',
          icon: FILE_ICONS[file.type] || '\ud83d\udcc4',
          category: 'Recent',
          matches: [],
          onExecute: () => {
            addRecentFile(file.id);
            onOpenFile(file.id);
          },
        });
      }

      // Quick actions
      const quickActions = actions.filter(a =>
        ['new-note', 'settings', 'toggle-dark-mode'].includes(a.id)
      );
      for (const action of quickActions) {
        items.push({
          id: action.id,
          name: action.name,
          type: 'action',
          icon: action.icon,
          shortcut: action.shortcut,
          category: items.length === recentFiles.length ? 'Quick Actions' : undefined,
          matches: [],
          onExecute: action.onExecute,
        });
      }

      return items;
    }

    // Filter by prefix mode
    if (prefixMode === 'actions' || prefixMode === 'create') {
      const filtered = prefixMode === 'create'
        ? actions.filter(a => a.id.startsWith('new-'))
        : actions;

      for (const action of filtered) {
        const match = fuzzyMatch(searchQuery, action.name);
        if (match || !searchQuery) {
          items.push({
            id: action.id,
            name: action.name,
            type: 'action',
            icon: action.icon,
            shortcut: action.shortcut,
            matches: match?.matches || [],
            onExecute: action.onExecute,
          });
        }
      }
      items.sort((a, b) => {
        const matchA = fuzzyMatch(searchQuery, a.name);
        const matchB = fuzzyMatch(searchQuery, b.name);
        return (matchB?.score || 0) - (matchA?.score || 0);
      });
      return items;
    }

    if (prefixMode === 'settings') {
      const settingsActions = actions.filter(a => a.category === 'settings');
      for (const action of settingsActions) {
        const match = fuzzyMatch(searchQuery, action.name);
        if (match || !searchQuery) {
          items.push({
            id: action.id,
            name: action.name,
            type: 'action',
            icon: action.icon,
            shortcut: action.shortcut,
            matches: match?.matches || [],
            onExecute: action.onExecute,
          });
        }
      }
      return items;
    }

    // Regular search: files + actions
    // Search files
    const fileResults = searchItems(
      searchQuery,
      files.map(f => ({ id: f.id, name: f.title, type: f.type })),
      { recentIds, maxResults: 8 }
    );

    for (const result of fileResults) {
      const file = files.find(f => f.id === result.item.id)!;
      items.push({
        id: file.id,
        name: file.title,
        type: 'file',
        icon: FILE_ICONS[file.type] || '\ud83d\udcc4',
        matches: result.matches,
        onExecute: () => {
          addRecentFile(file.id);
          onOpenFile(file.id);
        },
      });
    }

    // Search actions
    for (const action of actions) {
      const match = fuzzyMatch(searchQuery, action.name);
      if (match && match.score > 20) {
        items.push({
          id: action.id,
          name: action.name,
          type: 'action',
          icon: action.icon,
          shortcut: action.shortcut,
          matches: match.matches,
          onExecute: action.onExecute,
        });
      }
    }

    // Sort by match quality
    items.sort((a, b) => {
      const matchA = fuzzyMatch(searchQuery, a.name);
      const matchB = fuzzyMatch(searchQuery, b.name);
      return (matchB?.score || 0) - (matchA?.score || 0);
    });

    // No results: offer to create a note
    if (items.length === 0 && searchQuery && onCreateNote) {
      items.push({
        id: 'create-from-search',
        name: `Create note "${searchQuery}"`,
        type: 'action',
        icon: '\u2795',
        matches: [],
        onExecute: () => {
          onCreateNote();
          // TODO: Pass the query as the note title
        },
      });
    }

    return items.slice(0, 10);
  }, [query, searchQuery, prefixMode, files, actions, onOpenFile, onCreateNote]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setHasInteracted(false);
      setTimeout(() => inputRef.current?.focus(), 50);
      playSound('expand');
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && hasInteracted) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      selectedEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, hasInteracted]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHasInteracted(true);
          setSelectedIndex(i => (i + 1) % results.length);
          playSound('clickSoft');
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHasInteracted(true);
          setSelectedIndex(i => (i - 1 + results.length) % results.length);
          playSound('clickSoft');
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            playSound('pop');
            results[selectedIndex].onExecute();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          playSound('collapse');
          onClose();
          break;
        default:
          // Quick select with Cmd+1-9
          if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const index = parseInt(e.key) - 1;
            if (results[index]) {
              playSound('pop');
              results[index].onExecute();
              onClose();
            }
          }
      }
    },
    [results, selectedIndex, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    playSound('collapse');
    onClose();
  }, [onClose]);

  // Execute item
  const handleItemClick = useCallback(
    (item: CommandResultItem) => {
      playSound('pop');
      item.onExecute();
      onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="command-palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? DURATION.instant : DURATION.fast }}
            onClick={handleBackdropClick}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              background: 'rgba(23, 20, 18, 0.15)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Palette */}
          <motion.div
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -5 }}
            transition={prefersReducedMotion ? { duration: DURATION.instant } : SPRING.smooth}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              width: '100%',
              maxWidth: 560,
              background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95))',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: 16,
              border: '1px solid var(--color-border-glass-outer, rgba(255, 255, 255, 0.5))',
              boxShadow: `
                0 0 0 1px rgba(23, 20, 18, 0.05),
                0 4px 16px rgba(23, 20, 18, 0.08),
                0 12px 32px rgba(23, 20, 18, 0.12),
                0 24px 60px rgba(23, 20, 18, 0.16)
              `,
              overflow: 'hidden',
            }}
          >
            {/* Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.08))',
              }}
            >
              <span style={{ fontSize: 18, opacity: 0.5 }}>\ud83d\udd0d</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search files and actions..."
                role="combobox"
                aria-expanded={true}
                aria-controls="command-results"
                aria-activedescendant={results[selectedIndex]?.id}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={{
                  flex: 1,
                  height: 32,
                  fontSize: 15,
                  fontWeight: 450,
                  color: 'var(--color-text-primary)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                }}
              />
              {!query && (
                <kbd
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-bg-subtle, rgba(23, 20, 18, 0.04))',
                    borderRadius: 6,
                    border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.08))',
                  }}
                >
                  \u2318K
                </kbd>
              )}
            </div>

            {/* Prefix hint */}
            {prefixMode && (
              <div
                style={{
                  padding: '8px 20px',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-accent-primary)',
                  background: 'var(--color-accent-primary-glow, rgba(255, 119, 34, 0.08))',
                  borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.08))',
                }}
              >
                {prefixMode === 'actions' && '\u26a1 Actions'}
                {prefixMode === 'create' && '\u2795 Create new...'}
                {prefixMode === 'spaces' && '\ud83c\udfe0 Spaces'}
                {prefixMode === 'settings' && '\u2699\ufe0f Settings'}
              </div>
            )}

            {/* Results */}
            <div
              ref={listRef}
              id="command-results"
              role="listbox"
              style={{
                maxHeight: 352,
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {results.length === 0 && query && (
                <div
                  style={{
                    padding: '32px 20px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <p style={{ marginBottom: 12 }}>No results for &quot;{searchQuery}&quot;</p>
                </div>
              )}

              {results.map((item, index) => {
                const isSelected = index === selectedIndex;
                const segments = highlightMatches(item.name, item.matches);
                const showCategory = item.category && (index === 0 || results[index - 1]?.category !== item.category);

                return (
                  <React.Fragment key={item.id}>
                    {showCategory && (
                      <div
                        style={{
                          padding: '12px 20px 6px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {item.category}
                      </div>
                    )}
                    <div
                      role="option"
                      id={item.id}
                      aria-selected={isSelected}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 20px',
                        cursor: 'pointer',
                        background: isSelected
                          ? 'var(--color-accent-primary-glow, rgba(255, 119, 34, 0.08))'
                          : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--color-accent-primary)' : '3px solid transparent',
                        transition: 'background 0.1s, border-color 0.1s',
                      }}
                    >
                      <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: 450,
                          color: 'var(--color-text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <HighlightedText segments={segments} />
                      </span>
                      {item.shortcut && (
                        <kbd
                          style={{
                            padding: '2px 6px',
                            fontSize: 11,
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--color-text-muted)',
                            background: 'var(--color-bg-subtle, rgba(23, 20, 18, 0.04))',
                            borderRadius: 4,
                          }}
                        >
                          {item.shortcut}
                        </kbd>
                      )}
                      {index < 9 && (
                        <kbd
                          style={{
                            padding: '2px 6px',
                            fontSize: 10,
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--color-text-muted)',
                            opacity: 0.6,
                          }}
                        >
                          \u2318{index + 1}
                        </kbd>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Footer hint */}
            {results.length > 0 && (
              <div
                style={{
                  padding: '10px 20px',
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  borderTop: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.08))',
                  display: 'flex',
                  gap: 16,
                }}
              >
                <span><kbd style={{ opacity: 0.7 }}>\u2191\u2193</kbd> navigate</span>
                <span><kbd style={{ opacity: 0.7 }}>\u21b5</kbd> select</span>
                <span><kbd style={{ opacity: 0.7 }}>esc</kbd> close</span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
