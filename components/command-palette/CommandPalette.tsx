'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING, DURATION } from '@/lib/animations';
import { playSound } from '@/lib/sounds';
import {
  fuzzyMatch,
  highlightMatches,
  searchItems,
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

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: CommandFile[];
  folders?: CommandFile[];
  selectedFileId?: string | null;
  onOpenFile: (id: string) => void;
  onCreateNote?: (title?: string) => void;
  onCreateFolder?: () => void;
  onCreateCaseStudy?: () => void;
  onToggleDarkMode?: () => void;
  onOpenSettings?: () => void;
  onRenameFile?: (id: string) => void;
  onDeleteFile?: (id: string) => void;
  onDuplicateFile?: (id: string) => void;
  onMoveFile?: (fileId: string, folderId: string | null) => void;
  onChangeWallpaper?: () => void;
  onChangeTheme?: (theme: string) => void;
  onSwitchSpace?: (spaceId: string) => void;
  isDarkMode?: boolean;
  currentTheme?: string;
  spaces?: Array<{ id: string; name: string; icon: string }>;
  themes?: Array<{ id: string; name: string }>;
}

interface CommandResultItem {
  id: string;
  name: string;
  type: 'file' | 'action' | 'submenu';
  icon: string;
  shortcut?: string;
  category?: string;
  hint?: string;
  matches: number[];
  hasSubmenu?: boolean;
  submenuItems?: CommandResultItem[];
  onExecute: () => void;
}

type SubmenuType = 'move-to' | 'change-theme' | 'go-to-space' | null;

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
// STORAGE KEYS
// ============================================================================

const RECENT_FILES_KEY = 'goos-recent-files';
const FILE_FREQUENCY_KEY = 'goos-file-frequency';
const MAX_RECENT = 20;

// ============================================================================
// RECENT FILES WITH TIMESTAMPS
// ============================================================================

interface RecentFile {
  id: string;
  timestamp: number;
}

function getRecentFilesWithTimestamps(): RecentFile[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_FILES_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    // Handle old format (array of strings)
    if (Array.isArray(data) && typeof data[0] === 'string') {
      return data.map((id: string) => ({ id, timestamp: Date.now() }));
    }
    return data;
  } catch {
    return [];
  }
}

function getRecentFileIds(): string[] {
  return getRecentFilesWithTimestamps().map(f => f.id);
}

function addRecentFile(fileId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentFilesWithTimestamps().filter(f => f.id !== fileId);
    recent.unshift({ id: fileId, timestamp: Date.now() });
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // Ignore storage errors
  }
}

function getFileTimestamp(fileId: string): number | undefined {
  const recent = getRecentFilesWithTimestamps();
  return recent.find(f => f.id === fileId)?.timestamp;
}

// ============================================================================
// FILE FREQUENCY TRACKING
// ============================================================================

function getFileFrequency(): Map<string, number> {
  if (typeof window === 'undefined') return new Map();
  try {
    const stored = localStorage.getItem(FILE_FREQUENCY_KEY);
    if (!stored) return new Map();
    return new Map(Object.entries(JSON.parse(stored)));
  } catch {
    return new Map();
  }
}

function incrementFileFrequency(fileId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const freq = getFileFrequency();
    freq.set(fileId, (freq.get(fileId) || 0) + 1);
    localStorage.setItem(FILE_FREQUENCY_KEY, JSON.stringify(Object.fromEntries(freq)));
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
  if (days === 1) return 'yesterday';
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
// DEFAULT THEMES
// ============================================================================

const DEFAULT_THEMES = [
  { id: 'monterey', name: 'Monterey' },
  { id: 'dark', name: 'Dark' },
  { id: 'bluren', name: 'Bluren' },
  { id: 'refined', name: 'Refined' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CommandPalette({
  isOpen,
  onClose,
  files,
  folders,
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
  onMoveFile,
  onChangeWallpaper,
  onChangeTheme,
  onSwitchSpace,
  isDarkMode,
  currentTheme,
  spaces = [],
  themes = DEFAULT_THEMES,
}: CommandPaletteProps) {
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuType>(null);
  const [submenuQuery, setSubmenuQuery] = useState('');

  // Get all folders for "Move to" submenu
  const allFolders = useMemo(() => {
    if (folders) return folders;
    return files.filter(f => f.type === 'folder');
  }, [files, folders]);

  // Get prefix mode from query
  const prefixMode = useMemo(() => {
    const q = activeSubmenu ? submenuQuery : query;
    if (q.startsWith('>')) return 'actions';
    if (q.startsWith('/')) return 'create';
    if (q.startsWith('@')) return 'spaces';
    if (q.startsWith('#')) return 'settings';
    return null;
  }, [query, submenuQuery, activeSubmenu]);

  const searchQuery = useMemo(() => {
    const q = activeSubmenu ? submenuQuery : query;
    return prefixMode ? q.slice(1) : q;
  }, [query, submenuQuery, activeSubmenu, prefixMode]);

  // Build submenu items
  const submenuItems = useMemo<CommandResultItem[]>(() => {
    if (!activeSubmenu) return [];

    const items: CommandResultItem[] = [];

    if (activeSubmenu === 'move-to') {
      // Root option
      items.push({
        id: 'move-to-root',
        name: 'Desktop (root)',
        type: 'action',
        icon: '\ud83d\udda5\ufe0f',
        matches: [],
        onExecute: () => {
          if (selectedFileId && onMoveFile) {
            onMoveFile(selectedFileId, null);
          }
        },
      });

      // Folders
      for (const folder of allFolders) {
        if (folder.id === selectedFileId) continue; // Can't move to self
        const match = submenuQuery ? fuzzyMatch(submenuQuery, folder.title) : null;
        if (!submenuQuery || match) {
          items.push({
            id: `move-to-${folder.id}`,
            name: folder.title,
            type: 'action',
            icon: '\ud83d\udcc1',
            matches: match?.matches || [],
            onExecute: () => {
              if (selectedFileId && onMoveFile) {
                onMoveFile(selectedFileId, folder.id);
              }
            },
          });
        }
      }

      // Create new folder option
      if (onCreateFolder) {
        items.push({
          id: 'move-to-new-folder',
          name: 'New Folder...',
          type: 'action',
          icon: '\u2795',
          matches: [],
          onExecute: onCreateFolder,
        });
      }
    }

    if (activeSubmenu === 'change-theme') {
      for (const theme of themes) {
        const match = submenuQuery ? fuzzyMatch(submenuQuery, theme.name) : null;
        if (!submenuQuery || match) {
          const isCurrent = currentTheme === theme.id;
          items.push({
            id: `theme-${theme.id}`,
            name: theme.name,
            type: 'action',
            icon: isCurrent ? '\u25cf' : '\u25cb',
            hint: isCurrent ? 'current' : undefined,
            matches: match?.matches || [],
            onExecute: () => {
              if (onChangeTheme) {
                onChangeTheme(theme.id);
              }
            },
          });
        }
      }
    }

    if (activeSubmenu === 'go-to-space') {
      for (const space of spaces) {
        const match = submenuQuery ? fuzzyMatch(submenuQuery, space.name) : null;
        if (!submenuQuery || match) {
          items.push({
            id: `space-${space.id}`,
            name: space.name,
            type: 'action',
            icon: space.icon || '\ud83c\udfe0',
            matches: match?.matches || [],
            onExecute: () => {
              if (onSwitchSpace) {
                onSwitchSpace(space.id);
              }
            },
          });
        }
      }
    }

    return items;
  }, [activeSubmenu, submenuQuery, allFolders, selectedFileId, onMoveFile, onCreateFolder, themes, currentTheme, onChangeTheme, spaces, onSwitchSpace]);

  // Build main results
  const results = useMemo<CommandResultItem[]>(() => {
    // If submenu is active, show submenu items
    if (activeSubmenu) {
      return submenuItems;
    }

    const recentIds = getRecentFileIds();
    const frequency = getFileFrequency();
    const items: CommandResultItem[] = [];

    // Empty state: show recent files + quick actions
    if (!query.trim()) {
      // Recent files with timestamps
      const recentFiles = files
        .filter(f => recentIds.includes(f.id))
        .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
        .slice(0, 5);

      for (const file of recentFiles) {
        const timestamp = getFileTimestamp(file.id);
        items.push({
          id: file.id,
          name: file.title,
          type: 'file',
          icon: FILE_ICONS[file.type] || '\ud83d\udcc4',
          category: 'Recent',
          hint: getRelativeTime(timestamp),
          matches: [],
          onExecute: () => {
            addRecentFile(file.id);
            incrementFileFrequency(file.id);
            onOpenFile(file.id);
          },
        });
      }

      // Quick actions
      const quickActions: CommandResultItem[] = [];

      if (onCreateNote) {
        quickActions.push({
          id: 'new-note',
          name: 'New Note',
          type: 'action',
          icon: '\u2795',
          shortcut: '\u2318N',
          matches: [],
          onExecute: () => onCreateNote(),
        });
      }
      if (onCreateFolder) {
        quickActions.push({
          id: 'new-folder',
          name: 'New Folder',
          type: 'action',
          icon: '\ud83d\udcc1',
          matches: [],
          onExecute: onCreateFolder,
        });
      }
      if (onOpenSettings) {
        quickActions.push({
          id: 'settings',
          name: 'Settings',
          type: 'action',
          icon: '\u2699\ufe0f',
          shortcut: '\u2318,',
          matches: [],
          onExecute: onOpenSettings,
        });
      }

      for (let i = 0; i < quickActions.length; i++) {
        const action = quickActions[i];
        items.push({
          ...action,
          category: i === 0 ? 'Quick Actions' : undefined,
        });
      }

      return items;
    }

    // Filter by prefix mode
    if (prefixMode === 'actions' || prefixMode === 'create') {
      const actionItems = buildActionItems();
      const filtered = prefixMode === 'create'
        ? actionItems.filter(a => a.id.startsWith('new-'))
        : actionItems;

      for (const action of filtered) {
        const match = fuzzyMatch(searchQuery, action.name);
        if (match || !searchQuery) {
          items.push({
            ...action,
            matches: match?.matches || [],
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
      const settingsItems = buildSettingsItems();
      for (const action of settingsItems) {
        const match = fuzzyMatch(searchQuery, action.name);
        if (match || !searchQuery) {
          items.push({
            ...action,
            matches: match?.matches || [],
          });
        }
      }
      return items;
    }

    if (prefixMode === 'spaces' && spaces.length > 0) {
      for (const space of spaces) {
        const match = fuzzyMatch(searchQuery, space.name);
        if (match || !searchQuery) {
          items.push({
            id: `space-${space.id}`,
            name: space.name,
            type: 'action',
            icon: space.icon || '\ud83c\udfe0',
            matches: match?.matches || [],
            onExecute: () => {
              if (onSwitchSpace) {
                onSwitchSpace(space.id);
              }
            },
          });
        }
      }
      return items;
    }

    // Regular search: files + actions
    const fileResults = searchItems(
      searchQuery,
      files.map(f => ({ id: f.id, name: f.title, type: f.type })),
      { recentIds, frequentIds: frequency, maxResults: 8 }
    );

    for (const result of fileResults) {
      const file = files.find(f => f.id === result.item.id)!;
      const timestamp = getFileTimestamp(file.id);
      const freq = frequency.get(file.id);
      items.push({
        id: file.id,
        name: file.title,
        type: 'file',
        icon: FILE_ICONS[file.type] || '\ud83d\udcc4',
        hint: timestamp ? getRelativeTime(timestamp) : freq && freq > 3 ? 'frequent' : undefined,
        matches: result.matches,
        onExecute: () => {
          addRecentFile(file.id);
          incrementFileFrequency(file.id);
          onOpenFile(file.id);
        },
      });
    }

    // Search actions
    const allActions = [...buildActionItems(), ...buildSettingsItems()];
    for (const action of allActions) {
      const match = fuzzyMatch(searchQuery, action.name);
      if (match && match.score > 20) {
        items.push({
          ...action,
          matches: match.matches,
        });
      }
    }

    // Sort by match quality
    items.sort((a, b) => {
      const matchA = fuzzyMatch(searchQuery, a.name);
      const matchB = fuzzyMatch(searchQuery, b.name);
      return (matchB?.score || 0) - (matchA?.score || 0);
    });

    // No results: offer to create a note with that title
    if (items.length === 0 && searchQuery && onCreateNote) {
      items.push({
        id: 'create-from-search',
        name: `Create note "${searchQuery}"`,
        type: 'action',
        icon: '\u2795',
        matches: [],
        onExecute: () => onCreateNote(searchQuery),
      });
    }

    return items.slice(0, 10);
  }, [query, searchQuery, prefixMode, files, spaces, activeSubmenu, submenuItems, onOpenFile, onCreateNote, onSwitchSpace]);

  // Build action items (memoized builder function)
  function buildActionItems(): CommandResultItem[] {
    const items: CommandResultItem[] = [];

    // Create actions
    if (onCreateNote) {
      items.push({
        id: 'new-note',
        name: 'New Note',
        type: 'action',
        icon: '\u2795',
        shortcut: '\u2318N',
        matches: [],
        onExecute: () => onCreateNote(),
      });
    }
    if (onCreateCaseStudy) {
      items.push({
        id: 'new-case-study',
        name: 'New Case Study',
        type: 'action',
        icon: '\u2795',
        shortcut: '\u2318\u21e7N',
        matches: [],
        onExecute: onCreateCaseStudy,
      });
    }
    if (onCreateFolder) {
      items.push({
        id: 'new-folder',
        name: 'New Folder',
        type: 'action',
        icon: '\ud83d\udcc1',
        matches: [],
        onExecute: onCreateFolder,
      });
    }

    // Context actions for selected file
    if (selectedFileId) {
      const selectedFile = files.find(f => f.id === selectedFileId);
      if (selectedFile) {
        items.push({
          id: 'open-selected',
          name: `Open "${selectedFile.title}"`,
          type: 'action',
          icon: '\ud83d\udcc2',
          matches: [],
          onExecute: () => {
            addRecentFile(selectedFileId);
            incrementFileFrequency(selectedFileId);
            onOpenFile(selectedFileId);
          },
        });
        if (onRenameFile) {
          items.push({
            id: 'rename-selected',
            name: `Rename "${selectedFile.title}"`,
            type: 'action',
            icon: '\u270f\ufe0f',
            shortcut: '\u2318R',
            matches: [],
            onExecute: () => onRenameFile(selectedFileId),
          });
        }
        if (onDuplicateFile) {
          items.push({
            id: 'duplicate-selected',
            name: `Duplicate "${selectedFile.title}"`,
            type: 'action',
            icon: '\ud83d\udccb',
            shortcut: '\u2318D',
            matches: [],
            onExecute: () => onDuplicateFile(selectedFileId),
          });
        }
        if (onMoveFile && allFolders.length > 0) {
          items.push({
            id: 'move-to',
            name: 'Move to...',
            type: 'submenu',
            icon: '\ud83d\udce4',
            hasSubmenu: true,
            matches: [],
            onExecute: () => setActiveSubmenu('move-to'),
          });
        }
        if (onDeleteFile) {
          items.push({
            id: 'delete-selected',
            name: `Delete "${selectedFile.title}"`,
            type: 'action',
            icon: '\ud83d\uddd1\ufe0f',
            shortcut: '\u232b',
            matches: [],
            onExecute: () => onDeleteFile(selectedFileId),
          });
        }
      }
    }

    return items;
  }

  // Build settings items
  function buildSettingsItems(): CommandResultItem[] {
    const items: CommandResultItem[] = [];

    if (onToggleDarkMode) {
      items.push({
        id: 'toggle-dark-mode',
        name: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        type: 'action',
        icon: isDarkMode ? '\u2600\ufe0f' : '\ud83c\udf19',
        matches: [],
        onExecute: onToggleDarkMode,
      });
    }

    if (onChangeTheme && themes.length > 0) {
      items.push({
        id: 'change-theme',
        name: 'Change Theme',
        type: 'submenu',
        icon: '\ud83c\udfa8',
        hasSubmenu: true,
        matches: [],
        onExecute: () => setActiveSubmenu('change-theme'),
      });
    }

    if (onChangeWallpaper) {
      items.push({
        id: 'change-wallpaper',
        name: 'Change Wallpaper',
        type: 'action',
        icon: '\ud83d\uddbc\ufe0f',
        matches: [],
        onExecute: onChangeWallpaper,
      });
    }

    if (onOpenSettings) {
      items.push({
        id: 'settings',
        name: 'Settings',
        type: 'action',
        icon: '\u2699\ufe0f',
        shortcut: '\u2318,',
        matches: [],
        onExecute: onOpenSettings,
      });
    }

    if (spaces.length > 0 && onSwitchSpace) {
      items.push({
        id: 'go-to-space',
        name: 'Go to Space...',
        type: 'submenu',
        icon: '\ud83c\udfe0',
        hasSubmenu: true,
        matches: [],
        onExecute: () => setActiveSubmenu('go-to-space'),
      });
    }

    return items;
  }

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query, submenuQuery, activeSubmenu]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSubmenuQuery('');
      setSelectedIndex(0);
      setHasInteracted(false);
      setActiveSubmenu(null);
      setTimeout(() => inputRef.current?.focus(), 50);
      playSound('expand');
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && hasInteracted) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      const selectedEl = items[selectedIndex] as HTMLElement;
      selectedEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, hasInteracted]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Back out of submenu with Escape or Backspace on empty query
      if (activeSubmenu) {
        if (e.key === 'Escape' || (e.key === 'Backspace' && !submenuQuery)) {
          e.preventDefault();
          setActiveSubmenu(null);
          setSubmenuQuery('');
          playSound('collapse');
          return;
        }
      }

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
        case 'Tab':
          // Tab expands submenu if current item has one
          e.preventDefault();
          const item = results[selectedIndex];
          if (item?.hasSubmenu) {
            playSound('expand');
            item.onExecute();
          }
          break;
        case 'ArrowRight':
          // Right arrow also expands submenu
          const itemRight = results[selectedIndex];
          if (itemRight?.hasSubmenu) {
            e.preventDefault();
            playSound('expand');
            itemRight.onExecute();
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            const selectedItem = results[selectedIndex];
            if (selectedItem.hasSubmenu) {
              playSound('expand');
            } else {
              playSound('pop');
              onClose();
            }
            selectedItem.onExecute();
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
              const selectedItem = results[index];
              if (selectedItem.hasSubmenu) {
                playSound('expand');
                selectedItem.onExecute();
              } else {
                playSound('pop');
                selectedItem.onExecute();
                onClose();
              }
            }
          }
      }
    },
    [results, selectedIndex, onClose, activeSubmenu, submenuQuery]
  );

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeSubmenu) {
      setSubmenuQuery(e.target.value);
    } else {
      setQuery(e.target.value);
    }
  }, [activeSubmenu]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    playSound('collapse');
    onClose();
  }, [onClose]);

  // Execute item
  const handleItemClick = useCallback(
    (item: CommandResultItem) => {
      if (item.hasSubmenu) {
        playSound('expand');
        item.onExecute();
      } else {
        playSound('pop');
        item.onExecute();
        onClose();
      }
    },
    [onClose]
  );

  // Current input value
  const inputValue = activeSubmenu ? submenuQuery : query;
  const placeholder = activeSubmenu
    ? activeSubmenu === 'move-to' ? 'Search folders...'
      : activeSubmenu === 'change-theme' ? 'Search themes...'
      : 'Search spaces...'
    : 'Search files and actions...';

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
            {/* Submenu breadcrumb */}
            {activeSubmenu && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-bg-subtle, rgba(23, 20, 18, 0.02))',
                  borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.08))',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setActiveSubmenu(null);
                  setSubmenuQuery('');
                  playSound('collapse');
                }}
              >
                <span style={{ opacity: 0.5 }}>\u2190</span>
                <span>
                  {activeSubmenu === 'move-to' && 'Move to'}
                  {activeSubmenu === 'change-theme' && 'Change Theme'}
                  {activeSubmenu === 'go-to-space' && 'Go to Space'}
                </span>
                <span style={{ opacity: 0.4, fontSize: 11 }}>esc to go back</span>
              </div>
            )}

            {/* Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.08))',
              }}
            >
              <span style={{ fontSize: 18, opacity: 0.5 }}>\ud83d\udd0d</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
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
                  height: 28,
                  fontSize: 15,
                  fontWeight: 450,
                  color: 'var(--color-text-primary)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                }}
              />
              {!inputValue && !activeSubmenu && (
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
            {prefixMode && !activeSubmenu && (
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
              {results.length === 0 && (inputValue || activeSubmenu) && (
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
                        height: 44,
                        padding: '0 20px',
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
                      {item.hint && (
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--color-text-muted)',
                            opacity: 0.7,
                          }}
                        >
                          {item.hint}
                        </span>
                      )}
                      {item.hasSubmenu && (
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', opacity: 0.6 }}>\u203a</span>
                      )}
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
                      {index < 9 && !item.hasSubmenu && (
                        <kbd
                          style={{
                            padding: '2px 6px',
                            fontSize: 10,
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--color-text-muted)',
                            opacity: 0.5,
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
              {results.some(r => r.hasSubmenu) && (
                <span><kbd style={{ opacity: 0.7 }}>tab</kbd> expand</span>
              )}
              <span><kbd style={{ opacity: 0.7 }}>esc</kbd> {activeSubmenu ? 'back' : 'close'}</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
