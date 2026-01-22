'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { SpaceSummary, Space } from '@/types';

// ============================================
// TYPES
// ============================================

export interface CreateSpaceInput {
  name: string;
  icon: string;
  isPublic: boolean;
  slug?: string | null;
  copyFromSpaceId?: string | null;
}

export interface UpdateSpaceInput {
  name?: string;
  icon?: string;
  isPublic?: boolean;
  slug?: string | null;
}

interface SpaceContextType {
  // State
  spaces: SpaceSummary[];
  activeSpace: SpaceSummary | null;
  activeSpaceId: string | null;
  isLoading: boolean;
  error: string | null;

  // Space operations
  switchSpace: (spaceId: string) => void;
  createSpace: (input: CreateSpaceInput) => Promise<SpaceSummary | null>;
  updateSpace: (id: string, updates: UpdateSpaceInput) => Promise<void>;
  deleteSpace: (id: string) => Promise<boolean>;
  setAsPrimary: (id: string) => Promise<void>;
  reorderSpaces: (orderedIds: string[]) => Promise<void>;
  refreshSpaces: () => Promise<void>;

  // Toast
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

// ============================================
// DEFAULT SPACES (for demo/unauthenticated)
// ============================================

const DEFAULT_SPACES: SpaceSummary[] = [
  { id: 'space-1', name: 'Portfolio', icon: '🎨', slug: null, isPrimary: true, isPublic: true, order: 0, fileCount: 12 },
  { id: 'space-2', name: 'Writing', icon: '✍️', slug: 'writing', isPrimary: false, isPublic: true, order: 1, fileCount: 8 },
  { id: 'space-3', name: 'Photography', icon: '📸', slug: 'photos', isPrimary: false, isPublic: true, order: 2, fileCount: 24 },
  { id: 'space-4', name: 'Personal', icon: '🔐', slug: null, isPrimary: false, isPublic: false, order: 3, fileCount: 5 },
];

const STORAGE_KEY = 'goos-spaces';
const ACTIVE_SPACE_KEY = 'goos-active-space';

// ============================================
// CONTEXT
// ============================================

const SpaceContext = createContext<SpaceContextType | null>(null);

export function useSpaces() {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('useSpaces must be used within SpaceProvider');
  }
  return context;
}

// Safe version that returns null if not in provider
export function useSpacesSafe() {
  return useContext(SpaceContext);
}

// ============================================
// PROVIDER
// ============================================

interface SpaceProviderProps {
  children: React.ReactNode;
  initialSpaces?: SpaceSummary[];
  localOnly?: boolean; // Skip API calls, use localStorage only (for demo/unauthenticated)
}

export function SpaceProvider({
  children,
  initialSpaces,
  localOnly = false,
}: SpaceProviderProps) {
  const [spaces, setSpaces] = useState<SpaceSummary[]>(() => {
    // Try to load from localStorage first (client-side only)
    if (typeof window !== 'undefined' && localOnly) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Invalid JSON, use defaults
        }
      }
    }
    return initialSpaces || DEFAULT_SPACES;
  });

  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(() => {
    // Try to load from localStorage first (client-side only)
    if (typeof window !== 'undefined' && localOnly) {
      const stored = localStorage.getItem(ACTIVE_SPACE_KEY);
      if (stored) {
        return stored;
      }
    }
    // Default to primary space
    const primary = (initialSpaces || DEFAULT_SPACES).find(s => s.isPrimary);
    return primary?.id || (initialSpaces || DEFAULT_SPACES)[0]?.id || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Get active space object
  const activeSpace = spaces.find(s => s.id === activeSpaceId) || null;

  // Persist to localStorage when spaces change (local mode only)
  useEffect(() => {
    if (localOnly && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
    }
  }, [spaces, localOnly]);

  // Persist active space to localStorage (local mode only)
  useEffect(() => {
    if (localOnly && typeof window !== 'undefined' && activeSpaceId) {
      localStorage.setItem(ACTIVE_SPACE_KEY, activeSpaceId);
    }
  }, [activeSpaceId, localOnly]);

  // Show toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Generate slug from name
  const generateSlug = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
  }, []);

  // Check if slug is available
  const isSlugAvailable = useCallback((slug: string, excludeId?: string): boolean => {
    return !spaces.some(s => s.slug === slug && s.id !== excludeId);
  }, [spaces]);

  // Switch to a different space
  const switchSpace = useCallback((spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    if (space) {
      setActiveSpaceId(spaceId);
      showToast(`Switched to ${space.name}`, 'success');
    }
  }, [spaces, showToast]);

  // Create new space
  const createSpace = useCallback(async (input: CreateSpaceInput): Promise<SpaceSummary | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate unique ID
      const newId = `space-${Date.now()}`;

      // Determine slug
      let slug: string | null = null;
      if (input.isPublic) {
        slug = input.slug || generateSlug(input.name);
        // Ensure slug is unique
        let slugBase = slug;
        let counter = 1;
        while (!isSlugAvailable(slug)) {
          slug = `${slugBase}-${counter}`;
          counter++;
        }
      }

      // Create new space
      const newSpace: SpaceSummary = {
        id: newId,
        name: input.name,
        icon: input.icon,
        slug,
        isPrimary: spaces.length === 0, // First space is primary
        isPublic: input.isPublic,
        order: spaces.length,
        fileCount: 0,
      };

      // In local mode, just update state
      if (localOnly) {
        setSpaces(prev => [...prev, newSpace]);
        showToast(`Created ${newSpace.name}`, 'success');
        setIsLoading(false);
        return newSpace;
      }

      // API call for authenticated mode
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          icon: input.icon,
          isPublic: input.isPublic,
          slug,
          copyFromSpaceId: input.copyFromSpaceId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create space');
      }

      setSpaces(prev => [...prev, result.data]);
      showToast(`Created ${result.data.name}`, 'success');
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create space';
      setError(message);
      showToast(message, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [localOnly, spaces.length, generateSlug, isSlugAvailable, showToast]);

  // Update space
  const updateSpace = useCallback(async (id: string, updates: UpdateSpaceInput): Promise<void> => {
    const spaceToUpdate = spaces.find(s => s.id === id);
    if (!spaceToUpdate) return;

    // Handle slug changes for public/private toggle
    let slug = updates.slug;
    if (updates.isPublic !== undefined) {
      if (updates.isPublic && !spaceToUpdate.slug && !slug) {
        // Becoming public, generate slug
        slug = generateSlug(updates.name || spaceToUpdate.name);
        let slugBase = slug;
        let counter = 1;
        while (!isSlugAvailable(slug, id)) {
          slug = `${slugBase}-${counter}`;
          counter++;
        }
      } else if (!updates.isPublic) {
        // Becoming private, remove slug
        slug = null;
      }
    }

    // Optimistic update
    setSpaces(prev => prev.map(s =>
      s.id === id
        ? {
            ...s,
            ...updates,
            slug: slug !== undefined ? slug : s.slug,
          }
        : s
    ));

    // In local mode, we're done
    if (localOnly) {
      showToast('Space updated', 'success');
      return;
    }

    // API call for authenticated mode
    try {
      const response = await fetch(`/api/spaces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          slug: slug !== undefined ? slug : undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update space');
      }

      // Update with server response
      setSpaces(prev => prev.map(s => s.id === id ? result.data : s));
    } catch (err) {
      // Rollback
      setSpaces(prev => prev.map(s => s.id === id ? spaceToUpdate : s));
      const message = err instanceof Error ? err.message : 'Failed to update space';
      showToast(message, 'error');
    }
  }, [localOnly, spaces, generateSlug, isSlugAvailable, showToast]);

  // Delete space
  const deleteSpace = useCallback(async (id: string): Promise<boolean> => {
    const spaceToDelete = spaces.find(s => s.id === id);
    if (!spaceToDelete) return false;

    // Cannot delete primary space
    if (spaceToDelete.isPrimary) {
      showToast('Cannot delete primary space', 'error');
      return false;
    }

    // Cannot delete if it's the only space
    if (spaces.length === 1) {
      showToast('Cannot delete the only space', 'error');
      return false;
    }

    // Optimistic delete
    setSpaces(prev => prev.filter(s => s.id !== id));

    // If deleting active space, switch to primary
    if (activeSpaceId === id) {
      const primary = spaces.find(s => s.isPrimary && s.id !== id);
      const fallback = spaces.find(s => s.id !== id);
      setActiveSpaceId(primary?.id || fallback?.id || null);
    }

    // In local mode, we're done
    if (localOnly) {
      showToast('Space deleted', 'success');
      return true;
    }

    // API call for authenticated mode
    try {
      const response = await fetch(`/api/spaces/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete space');
      }

      showToast('Space deleted', 'success');
      return true;
    } catch (err) {
      // Rollback
      setSpaces(prev => [...prev, spaceToDelete].sort((a, b) => a.order - b.order));
      const message = err instanceof Error ? err.message : 'Failed to delete space';
      showToast(message, 'error');
      return false;
    }
  }, [localOnly, spaces, activeSpaceId, showToast]);

  // Set as primary
  const setAsPrimary = useCallback(async (id: string): Promise<void> => {
    const spaceToSetPrimary = spaces.find(s => s.id === id);
    if (!spaceToSetPrimary || spaceToSetPrimary.isPrimary) return;

    // Optimistic update
    setSpaces(prev => prev.map(s => ({
      ...s,
      isPrimary: s.id === id,
    })));

    // In local mode, we're done
    if (localOnly) {
      showToast(`${spaceToSetPrimary.name} is now your primary space`, 'success');
      return;
    }

    // API call for authenticated mode
    try {
      const response = await fetch(`/api/spaces/${id}/set-primary`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to set primary space');
      }

      showToast(`${spaceToSetPrimary.name} is now your primary space`, 'success');
    } catch (err) {
      // Rollback
      setSpaces(prev => prev.map(s => ({
        ...s,
        isPrimary: s.id === id ? false : s.isPrimary,
      })));
      const message = err instanceof Error ? err.message : 'Failed to set primary space';
      showToast(message, 'error');
    }
  }, [localOnly, spaces, showToast]);

  // Reorder spaces
  const reorderSpaces = useCallback(async (orderedIds: string[]): Promise<void> => {
    // Create reordered list
    const reordered = orderedIds
      .map((id, index) => {
        const space = spaces.find(s => s.id === id);
        return space ? { ...space, order: index } : null;
      })
      .filter((s): s is SpaceSummary => s !== null);

    // Optimistic update
    setSpaces(reordered);

    // In local mode, we're done
    if (localOnly) {
      return;
    }

    // API call for authenticated mode
    try {
      const response = await fetch('/api/spaces/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to reorder spaces');
      }
    } catch (err) {
      // Rollback (re-sort by original order)
      setSpaces(prev => [...prev].sort((a, b) => a.order - b.order));
      const message = err instanceof Error ? err.message : 'Failed to reorder spaces';
      showToast(message, 'error');
    }
  }, [localOnly, spaces, showToast]);

  // Refresh spaces from API
  const refreshSpaces = useCallback(async (): Promise<void> => {
    // Skip in local mode
    if (localOnly) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/spaces');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch spaces');
      }

      setSpaces(result.data);

      // Update active space if current one no longer exists
      if (activeSpaceId && !result.data.find((s: SpaceSummary) => s.id === activeSpaceId)) {
        const primary = result.data.find((s: SpaceSummary) => s.isPrimary);
        setActiveSpaceId(primary?.id || result.data[0]?.id || null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch spaces';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [localOnly, activeSpaceId, showToast]);

  const value: SpaceContextType = {
    spaces,
    activeSpace,
    activeSpaceId,
    isLoading,
    error,
    switchSpace,
    createSpace,
    updateSpace,
    deleteSpace,
    setAsPrimary,
    reorderSpaces,
    refreshSpaces,
    showToast,
    toast,
  };

  return (
    <SpaceContext.Provider value={value}>
      {children}
    </SpaceContext.Provider>
  );
}
