'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { GoOSFile, GoOSFileType, PublishStatus } from '@/lib/validations/goos';
import { getDefaultCVContent } from '@/lib/validations/goos';

// Types
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type GoOSViewMode = 'owner' | 'visitor';

export type AccessLevel = 'free' | 'paid' | 'email';

export interface GoOSFileData {
  id: string;
  type: GoOSFileType;
  title: string;
  content: string;
  status: PublishStatus;
  accessLevel: AccessLevel;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  position: { x: number; y: number };
  childCount?: number;
  // Header image for notes/case studies (hero image)
  headerImage?: string | null;
  // Pricing for paid access
  priceAmount?: number | null;
  priceCurrency?: string | null;
  // Image file fields
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCaption?: string | null;
  // Link file fields
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  linkFavicon?: string | null;
  // Embed file fields
  embedUrl?: string | null;
  embedType?: string | null;
  // Download file fields
  downloadUrl?: string | null;
  downloadName?: string | null;
  downloadSize?: number | null;
  downloadType?: string | null;
}

interface GoOSContextType {
  // State
  files: GoOSFileData[];
  isLoading: boolean;
  error: string | null;
  saveStatus: Record<string, SaveStatus>;
  viewMode: GoOSViewMode;

  // File operations
  createFile: (type: GoOSFileType, parentId?: string | null, position?: { x: number; y: number }) => Promise<GoOSFileData | null>;
  updateFile: (id: string, updates: Partial<GoOSFileData>) => Promise<void>;
  deleteFile: (id: string) => Promise<boolean>;
  duplicateFile: (id: string) => Promise<GoOSFileData | null>;
  moveFile: (id: string, newParentId: string | null) => Promise<void>;

  // New file type creators
  createImageFile: (url: string, options?: { caption?: string; alt?: string; parentId?: string | null; position?: { x: number; y: number } }) => Promise<GoOSFileData | null>;
  createLinkFile: (url: string, options?: { title?: string; description?: string; parentId?: string | null; position?: { x: number; y: number } }) => Promise<GoOSFileData | null>;
  createEmbedFile: (url: string, embedType: string, options?: { parentId?: string | null; position?: { x: number; y: number } }) => Promise<GoOSFileData | null>;
  createDownloadFile: (url: string, fileName: string, options?: { fileSize?: number; fileType?: string; parentId?: string | null; position?: { x: number; y: number } }) => Promise<GoOSFileData | null>;

  // Auto-save
  autoSave: (id: string, content: string, title?: string) => void;

  // Publish operations
  publishFile: (id: string) => Promise<void>;
  unpublishFile: (id: string) => Promise<void>;

  // Access control
  setAccessLevel: (id: string, level: AccessLevel, price?: number) => Promise<void>;
  lockFile: (id: string) => Promise<void>;
  unlockFile: (id: string) => Promise<void>;

  // Fetch operations
  refreshFiles: (parentId?: string | null) => Promise<void>;

  // Toast
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const GoOSContext = createContext<GoOSContextType | null>(null);

export function useGoOS() {
  const context = useContext(GoOSContext);
  if (!context) {
    throw new Error('useGoOS must be used within GoOSProvider');
  }
  return context;
}

// Safe version that returns null if not in provider
export function useGoOSSafe() {
  return useContext(GoOSContext);
}

interface GoOSProviderProps {
  children: React.ReactNode;
  initialFiles?: GoOSFileData[];
  viewMode?: GoOSViewMode;
  username?: string; // For visitor view
  localOnly?: boolean; // Skip API calls, use local state only (for demo/unauthenticated)
  spaceId?: string | null; // Which space to load files from
}

export function GoOSProvider({
  children,
  initialFiles = [],
  viewMode = 'owner',
  username,
  localOnly = false,
  spaceId,
}: GoOSProviderProps) {
  const [files, setFiles] = useState<GoOSFileData[]>(initialFiles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-save timer refs
  const saveTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Track pending create operations to prevent race conditions with refreshFiles
  const pendingCreatesRef = useRef<Set<string>>(new Set());

  // Show toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Set save status for a file
  const setFileSaveStatus = useCallback((id: string, status: SaveStatus) => {
    setSaveStatus(prev => ({ ...prev, [id]: status }));
  }, []);

  // Fetch files from API
  const refreshFiles = useCallback(async (parentId?: string | null) => {
    // Skip API calls in local-only mode
    if (localOnly) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (parentId !== undefined) params.set('parentId', parentId ?? 'null');
      if (spaceId) params.set('spaceId', spaceId);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const endpoint = viewMode === 'visitor' && username
        ? `/api/goos/public/${username}${queryString}`
        : `/api/goos/files${queryString}`;

      const response = await fetch(endpoint);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch files');
      }

      // Handle visitor response (has desktop and files)
      const filesData = viewMode === 'visitor' ? result.data?.files : result.data;

      // Preserve temp files that are pending creation to prevent race conditions
      setFiles(prev => {
        const tempFiles = prev.filter(f => f.id.startsWith('temp-') && pendingCreatesRef.current.has(f.id));
        return [...(filesData || []), ...tempFiles];
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch files';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [localOnly, viewMode, username, spaceId, showToast]);

  // Find non-overlapping position for a new file
  const findNonOverlappingPosition = useCallback((basePos: { x: number; y: number }, parentId?: string | null): { x: number; y: number } => {
    const siblingFiles = files.filter(f => f.parentId === (parentId || null));
    const threshold = 6; // Minimum distance between file icons (percentage)
    const offsetStep = 5; // How much to offset when overlapping
    const maxAttempts = 20; // Prevent infinite loop

    let pos = { ...basePos };
    let attempt = 0;

    while (attempt < maxAttempts) {
      // Check if this position overlaps with any existing file
      const isOverlapping = siblingFiles.some(f => {
        const dx = Math.abs(f.position.x - pos.x);
        const dy = Math.abs(f.position.y - pos.y);
        return dx < threshold && dy < threshold;
      });

      if (!isOverlapping) {
        break;
      }

      // Offset the position diagonally to find a free spot
      attempt++;
      pos = {
        x: Math.min(90, basePos.x + (attempt * offsetStep)),
        y: Math.min(85, basePos.y + (attempt * offsetStep)),
      };
    }

    return pos;
  }, [files]);

  // Calculate next position for new file
  const getNextPosition = useCallback(() => {
    const baseX = 10;
    const baseY = 10;
    const step = 8;
    const maxItems = 10;

    const rootFiles = files.filter(f => !f.parentId);
    const offset = rootFiles.length % maxItems;

    const basePos = {
      x: Math.min(baseX + (offset * step), 80),
      y: Math.min(baseY + (offset * step), 80),
    };

    return findNonOverlappingPosition(basePos, null);
  }, [files, findNonOverlappingPosition]);

  // Create new file
  const createFile = useCallback(async (
    type: GoOSFileType,
    parentId?: string | null,
    customPosition?: { x: number; y: number }
  ): Promise<GoOSFileData | null> => {
    if (viewMode === 'visitor') return null;

    // Use custom position if provided, otherwise calculate next available position
    // Always ensure the position doesn't overlap with existing files
    const basePosition = customPosition || getNextPosition();
    const position = customPosition
      ? findNonOverlappingPosition(basePosition, parentId)
      : basePosition; // getNextPosition already calls findNonOverlappingPosition
    const title = type === 'folder' ? 'New Folder' : type === 'cv' ? 'My CV' : `Untitled ${type}`;

    // Set default content for CV files
    const content = type === 'cv' ? JSON.stringify(getDefaultCVContent()) : '';

    // Create file object
    const newId = localOnly ? `local-${Date.now()}` : `temp-${Date.now()}`;
    const newFile: GoOSFileData = {
      id: newId,
      type,
      title,
      content,
      status: 'draft',
      accessLevel: 'public',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: parentId || null,
      position,
      childCount: 0,
    };

    // In local-only mode, just add to state and return
    if (localOnly) {
      setFiles(prev => [...prev, newFile]);
      showToast(`${type === 'folder' ? 'Folder' : 'File'} created`, 'success');
      return newFile;
    }

    // Track this temp file to prevent race conditions with refreshFiles
    pendingCreatesRef.current.add(newId);
    setFiles(prev => [...prev, newFile]);

    try {
      const response = await fetch('/api/goos/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          parentId: parentId || null,
          position,
          spaceId: spaceId || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create file');
      }

      // Replace temp file with real one and clear pending flag
      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.map(f => f.id === newId ? result.data : f));
      showToast(`${type === 'folder' ? 'Folder' : 'File'} created`, 'success');
      return result.data;
    } catch (err) {
      // Rollback and clear pending flag
      console.error('[goOS] Create file error:', err);
      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.filter(f => f.id !== newId));
      const message = err instanceof Error ? err.message : 'Failed to create file';
      showToast(message, 'error');
      return null;
    }
  }, [localOnly, viewMode, spaceId, getNextPosition, findNonOverlappingPosition, showToast]);

  // Update file
  // Use functional updates to always get current state (avoids stale closure for newly created files)
  const updateFile = useCallback(async (id: string, updates: Partial<GoOSFileData>) => {
    if (viewMode === 'visitor') return;

    // Store previous file for potential rollback (captured via functional update)
    let previousFile: GoOSFileData | undefined;

    // Optimistic update using functional pattern to get current state
    setFiles(prev => {
      previousFile = prev.find(f => f.id === id);
      if (!previousFile) {
        return prev; // No change
      }
      return prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date() } : f);
    });

    // In local-only mode, just update state
    if (localOnly) {
      return;
    }

    // Wait for next tick to ensure previousFile is captured
    if (!previousFile) return;

    try {
      const apiUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.content !== undefined) apiUpdates.content = updates.content;
      if (updates.position !== undefined) apiUpdates.position = updates.position;
      if (updates.parentId !== undefined) apiUpdates.parentId = updates.parentId;

      const response = await fetch(`/api/goos/files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiUpdates),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update file');
      }

      // Update with server response
      setFiles(prev => prev.map(f => f.id === id ? result.data : f));
    } catch (err) {
      // Rollback using the captured previousFile
      if (previousFile) {
        setFiles(prev => prev.map(f => f.id === id ? previousFile! : f));
      }
      const message = err instanceof Error ? err.message : 'Failed to update file';
      showToast(message, 'error');
    }
  }, [localOnly, viewMode, showToast]);

  // Auto-save with debounce
  const autoSave = useCallback((id: string, content: string, title?: string) => {
    if (viewMode === 'visitor') return;

    // Clear existing timeout
    if (saveTimeoutsRef.current[id]) {
      clearTimeout(saveTimeoutsRef.current[id]);
    }

    setFileSaveStatus(id, 'saving');

    // Optimistic local update
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          content,
          ...(title !== undefined ? { title } : {}),
          updatedAt: new Date(),
        };
      }
      return f;
    }));

    // In local-only mode, just mark as saved
    if (localOnly) {
      setFileSaveStatus(id, 'saved');
      setTimeout(() => setFileSaveStatus(id, 'idle'), 3000);
      return;
    }

    // Debounced API call
    saveTimeoutsRef.current[id] = setTimeout(async () => {
      try {
        const updates: Record<string, unknown> = { content };
        if (title !== undefined) updates.title = title;

        const response = await fetch(`/api/goos/files/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to save');
        }

        setFileSaveStatus(id, 'saved');

        // Reset to idle after 3 seconds
        setTimeout(() => setFileSaveStatus(id, 'idle'), 3000);
      } catch (err) {
        setFileSaveStatus(id, 'error');
        const message = err instanceof Error ? err.message : 'Failed to save';
        showToast(message, 'error');
      }
    }, 800);
  }, [localOnly, viewMode, setFileSaveStatus, showToast]);

  // Delete file
  const deleteFile = useCallback(async (id: string): Promise<boolean> => {
    if (viewMode === 'visitor') return false;

    const fileToDelete = files.find(f => f.id === id);
    if (!fileToDelete) return false;

    // Check if folder has children
    if (fileToDelete.type === 'folder' && (fileToDelete.childCount || 0) > 0) {
      showToast('Cannot delete folder with contents. Empty the folder first.', 'error');
      return false;
    }

    // Optimistic update
    setFiles(prev => prev.filter(f => f.id !== id));

    // In local-only mode, just delete from state
    if (localOnly) {
      showToast('Deleted', 'success');
      return true;
    }

    try {
      const response = await fetch(`/api/goos/files/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete file');
      }

      showToast('Deleted', 'success');
      return true;
    } catch (err) {
      // Rollback
      setFiles(prev => [...prev, fileToDelete]);
      const message = err instanceof Error ? err.message : 'Failed to delete file';
      showToast(message, 'error');
      return false;
    }
  }, [localOnly, viewMode, files, showToast]);

  // Duplicate file
  const duplicateFile = useCallback(async (id: string): Promise<GoOSFileData | null> => {
    if (viewMode === 'visitor') return null;

    const fileToDuplicate = files.find(f => f.id === id);
    if (!fileToDuplicate) return null;

    // Create with same content but new position
    const position = {
      x: Math.min(fileToDuplicate.position.x + 5, 90),
      y: Math.min(fileToDuplicate.position.y + 5, 90),
    };

    // In local-only mode, duplicate locally
    if (localOnly) {
      const duplicatedFile: GoOSFileData = {
        ...fileToDuplicate,
        id: `local-${Date.now()}`,
        title: `${fileToDuplicate.title} copy`,
        position,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFiles(prev => [...prev, duplicatedFile]);
      showToast('Duplicated', 'success');
      return duplicatedFile;
    }

    try {
      const response = await fetch('/api/goos/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: fileToDuplicate.type,
          title: `${fileToDuplicate.title} copy`,
          parentId: fileToDuplicate.parentId,
          position,
          content: fileToDuplicate.content,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to duplicate file');
      }

      setFiles(prev => [...prev, result.data]);
      showToast('Duplicated', 'success');
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate file';
      showToast(message, 'error');
      return null;
    }
  }, [localOnly, viewMode, files, showToast]);

  // Move file to folder
  const moveFile = useCallback(async (id: string, newParentId: string | null) => {
    if (viewMode === 'visitor') return;

    const fileToMove = files.find(f => f.id === id);
    if (!fileToMove) return;

    // Prevent moving into self
    if (id === newParentId) {
      showToast('Cannot move item into itself', 'error');
      return;
    }

    // Optimistic update
    const previousParentId = fileToMove.parentId;
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, parentId: newParentId };
      }
      // Update child counts
      if (f.id === previousParentId && f.childCount) {
        return { ...f, childCount: f.childCount - 1 };
      }
      if (f.id === newParentId && f.childCount !== undefined) {
        return { ...f, childCount: f.childCount + 1 };
      }
      return f;
    }));

    // In local-only mode, just update state
    if (localOnly) return;

    try {
      const response = await fetch(`/api/goos/files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: newParentId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to move file');
      }
    } catch (err) {
      // Rollback
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          return { ...f, parentId: previousParentId };
        }
        if (f.id === previousParentId && f.childCount !== undefined) {
          return { ...f, childCount: f.childCount + 1 };
        }
        if (f.id === newParentId && f.childCount) {
          return { ...f, childCount: f.childCount - 1 };
        }
        return f;
      }));
      const message = err instanceof Error ? err.message : 'Failed to move file';
      showToast(message, 'error');
    }
  }, [localOnly, viewMode, files, showToast]);

  // Publish file
  const publishFile = useCallback(async (id: string) => {
    if (viewMode === 'visitor') return;

    const fileToPublish = files.find(f => f.id === id);
    if (!fileToPublish) return;

    // Optimistic update
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'published' as const, publishedAt: new Date() } : f
    ));

    // In local-only mode, just update state
    if (localOnly) {
      showToast('Published', 'success');
      return;
    }

    try {
      const response = await fetch(`/api/goos/files/${id}/publish`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to publish');
      }

      setFiles(prev => prev.map(f => f.id === id ? result.data : f));
      showToast('Published', 'success');
    } catch (err) {
      // Rollback
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, status: 'draft' as const, publishedAt: fileToPublish.publishedAt } : f
      ));
      const message = err instanceof Error ? err.message : 'Failed to publish';
      showToast(message, 'error');
    }
  }, [localOnly, viewMode, files, showToast]);

  // Unpublish file
  const unpublishFile = useCallback(async (id: string) => {
    if (viewMode === 'visitor') return;

    const fileToUnpublish = files.find(f => f.id === id);
    if (!fileToUnpublish) return;

    // Optimistic update
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'draft' as const } : f
    ));

    // In local-only mode, just update state
    if (localOnly) {
      showToast('Unpublished', 'success');
      return;
    }

    try {
      const response = await fetch(`/api/goos/files/${id}/publish`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to unpublish');
      }

      setFiles(prev => prev.map(f => f.id === id ? result.data : f));
      showToast('Unpublished', 'success');
    } catch (err) {
      // Rollback
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, status: fileToUnpublish.status } : f
      ));
      const message = err instanceof Error ? err.message : 'Failed to unpublish';
      showToast(message, 'error');
    }
  }, [localOnly, viewMode, files, showToast]);

  // Lock file
  const lockFile = useCallback(async (id: string) => {
    if (viewMode === 'visitor') return;

    const fileToLock = files.find(f => f.id === id);
    if (!fileToLock) return;

    // Optimistic update
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, accessLevel: 'locked' as const } : f
    ));

    // In local-only mode, just update state
    if (localOnly) {
      showToast('Locked', 'success');
      return;
    }

    try {
      const response = await fetch(`/api/goos/files/${id}/access`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to lock file');
      }

      showToast('Locked', 'success');
    } catch (err) {
      // Rollback
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, accessLevel: fileToLock.accessLevel } : f
      ));
      const message = err instanceof Error ? err.message : 'Failed to lock file';
      showToast(message, 'error');
    }
  }, [localOnly, viewMode, files, showToast]);

  // Unlock file
  const unlockFile = useCallback(async (id: string) => {
    if (viewMode === 'visitor') return;

    const fileToUnlock = files.find(f => f.id === id);
    if (!fileToUnlock) return;

    // Optimistic update
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, accessLevel: 'public' as const } : f
    ));

    // In local-only mode, just update state
    if (localOnly) {
      showToast('Unlocked', 'success');
      return;
    }

    try {
      const response = await fetch(`/api/goos/files/${id}/access`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to unlock file');
      }

      showToast('Unlocked', 'success');
    } catch (err) {
      // Rollback
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, accessLevel: fileToUnlock.accessLevel } : f
      ));
      const message = err instanceof Error ? err.message : 'Failed to unlock file';
      showToast(message, 'error');
    }
  }, [localOnly, viewMode, files, showToast]);

  // Create image file
  const createImageFile = useCallback(async (
    url: string,
    options?: { caption?: string; alt?: string; parentId?: string | null; position?: { x: number; y: number } }
  ): Promise<GoOSFileData | null> => {
    if (viewMode === 'visitor') return null;

    const position = options?.position || getNextPosition();
    const title = options?.caption || 'New Image';

    const newId = localOnly ? `local-${Date.now()}` : `temp-${Date.now()}`;
    const newFile: GoOSFileData = {
      id: newId,
      type: 'image',
      title,
      content: '',
      status: 'draft',
      accessLevel: 'free',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: options?.parentId || null,
      position,
      imageUrl: url,
      imageAlt: options?.alt || '',
      imageCaption: options?.caption || '',
    };

    if (localOnly) {
      setFiles(prev => [...prev, newFile]);
      showToast('Image added', 'success');
      return newFile;
    }

    pendingCreatesRef.current.add(newId);
    setFiles(prev => [...prev, newFile]);

    try {
      const response = await fetch('/api/goos/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          title,
          parentId: options?.parentId || null,
          position,
          imageUrl: url,
          imageAlt: options?.alt || '',
          imageCaption: options?.caption || '',
          spaceId: spaceId || undefined,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to create image');

      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.map(f => f.id === newId ? result.data : f));
      showToast('Image added', 'success');
      return result.data;
    } catch (err) {
      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.filter(f => f.id !== newId));
      showToast(err instanceof Error ? err.message : 'Failed to create image', 'error');
      return null;
    }
  }, [localOnly, viewMode, spaceId, getNextPosition, showToast]);

  // Create link file
  const createLinkFile = useCallback(async (
    url: string,
    options?: { title?: string; description?: string; parentId?: string | null; position?: { x: number; y: number } }
  ): Promise<GoOSFileData | null> => {
    if (viewMode === 'visitor') return null;

    const position = options?.position || getNextPosition();
    const title = options?.title || new URL(url).hostname;

    const newId = localOnly ? `local-${Date.now()}` : `temp-${Date.now()}`;
    const newFile: GoOSFileData = {
      id: newId,
      type: 'link',
      title,
      content: '',
      status: 'draft',
      accessLevel: 'free',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: options?.parentId || null,
      position,
      linkUrl: url,
      linkTitle: options?.title || '',
      linkDescription: options?.description || '',
    };

    if (localOnly) {
      setFiles(prev => [...prev, newFile]);
      showToast('Link added', 'success');
      return newFile;
    }

    pendingCreatesRef.current.add(newId);
    setFiles(prev => [...prev, newFile]);

    try {
      const response = await fetch('/api/goos/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'link',
          title,
          parentId: options?.parentId || null,
          position,
          linkUrl: url,
          linkTitle: options?.title || '',
          linkDescription: options?.description || '',
          spaceId: spaceId || undefined,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to create link');

      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.map(f => f.id === newId ? result.data : f));
      showToast('Link added', 'success');
      return result.data;
    } catch (err) {
      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.filter(f => f.id !== newId));
      showToast(err instanceof Error ? err.message : 'Failed to create link', 'error');
      return null;
    }
  }, [localOnly, viewMode, spaceId, getNextPosition, showToast]);

  // Create embed file
  const createEmbedFile = useCallback(async (
    url: string,
    embedType: string,
    options?: { parentId?: string | null; position?: { x: number; y: number } }
  ): Promise<GoOSFileData | null> => {
    if (viewMode === 'visitor') return null;

    const position = options?.position || getNextPosition();
    const title = `${embedType.charAt(0).toUpperCase() + embedType.slice(1)} Embed`;

    const newId = localOnly ? `local-${Date.now()}` : `temp-${Date.now()}`;
    const newFile: GoOSFileData = {
      id: newId,
      type: 'embed',
      title,
      content: '',
      status: 'draft',
      accessLevel: 'free',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: options?.parentId || null,
      position,
      embedUrl: url,
      embedType,
    };

    if (localOnly) {
      setFiles(prev => [...prev, newFile]);
      showToast('Embed added', 'success');
      return newFile;
    }

    pendingCreatesRef.current.add(newId);
    setFiles(prev => [...prev, newFile]);

    try {
      const response = await fetch('/api/goos/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'embed',
          title,
          parentId: options?.parentId || null,
          position,
          embedUrl: url,
          embedType,
          spaceId: spaceId || undefined,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to create embed');

      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.map(f => f.id === newId ? result.data : f));
      showToast('Embed added', 'success');
      return result.data;
    } catch (err) {
      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.filter(f => f.id !== newId));
      showToast(err instanceof Error ? err.message : 'Failed to create embed', 'error');
      return null;
    }
  }, [localOnly, viewMode, spaceId, getNextPosition, showToast]);

  // Create download file
  const createDownloadFile = useCallback(async (
    url: string,
    fileName: string,
    options?: { fileSize?: number; fileType?: string; parentId?: string | null; position?: { x: number; y: number } }
  ): Promise<GoOSFileData | null> => {
    if (viewMode === 'visitor') return null;

    const position = options?.position || getNextPosition();
    const title = fileName;

    const newId = localOnly ? `local-${Date.now()}` : `temp-${Date.now()}`;
    const newFile: GoOSFileData = {
      id: newId,
      type: 'download',
      title,
      content: '',
      status: 'draft',
      accessLevel: 'free',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: options?.parentId || null,
      position,
      downloadUrl: url,
      downloadName: fileName,
      downloadSize: options?.fileSize || null,
      downloadType: options?.fileType || null,
    };

    if (localOnly) {
      setFiles(prev => [...prev, newFile]);
      showToast('Download added', 'success');
      return newFile;
    }

    pendingCreatesRef.current.add(newId);
    setFiles(prev => [...prev, newFile]);

    try {
      const response = await fetch('/api/goos/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'download',
          title,
          parentId: options?.parentId || null,
          position,
          downloadUrl: url,
          downloadName: fileName,
          downloadSize: options?.fileSize,
          downloadType: options?.fileType,
          spaceId: spaceId || undefined,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to create download');

      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.map(f => f.id === newId ? result.data : f));
      showToast('Download added', 'success');
      return result.data;
    } catch (err) {
      pendingCreatesRef.current.delete(newId);
      setFiles(prev => prev.filter(f => f.id !== newId));
      showToast(err instanceof Error ? err.message : 'Failed to create download', 'error');
      return null;
    }
  }, [localOnly, viewMode, spaceId, getNextPosition, showToast]);

  // Set access level
  const setAccessLevel = useCallback(async (id: string, level: AccessLevel, price?: number) => {
    if (viewMode === 'visitor') return;

    const fileToUpdate = files.find(f => f.id === id);
    if (!fileToUpdate) return;

    // Optimistic update
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, accessLevel: level, priceAmount: price || null } : f
    ));

    if (localOnly) {
      showToast(`Access set to ${level}`, 'success');
      return;
    }

    try {
      const response = await fetch(`/api/goos/files/${id}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessLevel: level, priceAmount: price }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to set access level');

      showToast(`Access set to ${level}`, 'success');
    } catch (err) {
      // Rollback
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, accessLevel: fileToUpdate.accessLevel, priceAmount: fileToUpdate.priceAmount } : f
      ));
      showToast(err instanceof Error ? err.message : 'Failed to set access level', 'error');
    }
  }, [localOnly, viewMode, files, showToast]);

  // Refetch files when spaceId changes
  useEffect(() => {
    if (!localOnly && spaceId) {
      refreshFiles();
    }
  }, [spaceId, localOnly, refreshFiles]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const value: GoOSContextType = {
    files,
    isLoading,
    error,
    saveStatus,
    viewMode,
    createFile,
    updateFile,
    deleteFile,
    duplicateFile,
    moveFile,
    createImageFile,
    createLinkFile,
    createEmbedFile,
    createDownloadFile,
    autoSave,
    publishFile,
    unpublishFile,
    setAccessLevel,
    lockFile,
    unlockFile,
    refreshFiles,
    showToast,
    toast,
  };

  return (
    <GoOSContext.Provider value={value}>
      {children}
    </GoOSContext.Provider>
  );
}
