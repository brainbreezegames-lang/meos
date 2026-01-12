'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { DesktopItem, BlockData, Desktop, StatusWidget, WorkbenchEntry } from '@/types';

// Types for undo/redo
interface HistoryEntry {
  type: 'item' | 'block' | 'desktop' | 'position';
  itemId?: string;
  blockId?: string;
  before: unknown;
  after: unknown;
  timestamp: number;
}

// Save status
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Edit context interface
interface EditContextType {
  // Ownership
  isOwner: boolean;
  setIsOwner: (isOwner: boolean) => void;

  // Currently editing element
  activeEditId: string | null;
  setActiveEditId: (id: string | null) => void;

  // Desktop data
  desktop: Desktop | null;
  setDesktop: (desktop: Desktop | null) => void;

  // Item operations
  updateItem: (itemId: string, updates: Partial<DesktopItem>) => void;
  updateItemPosition: (itemId: string, x: number, y: number) => void;
  deleteItem: (itemId: string) => void;
  duplicateItem: (itemId: string) => void;
  addItem: (item: Omit<DesktopItem, 'id' | 'desktopId' | 'zIndex' | 'order'>) => void;

  // Block operations
  updateBlock: (itemId: string, blockId: string, updates: Partial<BlockData>) => void;
  deleteBlock: (itemId: string, blockId: string) => void;
  addBlock: (itemId: string, block: Omit<BlockData, 'id'>, afterBlockId?: string) => void;
  reorderBlocks: (itemId: string, blockIds: string[]) => void;

  // Status Widget operations
  updateStatusWidget: (updates: Partial<StatusWidget>) => void;

  // Workbench operations
  addWorkbenchEntry: (entry: Omit<WorkbenchEntry, 'id' | 'desktopId' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateWorkbenchEntry: (entryId: string, updates: Partial<WorkbenchEntry>) => void;
  deleteWorkbenchEntry: (entryId: string) => void;

  // Save status
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  pendingChanges: boolean;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Toast messages
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const EditContext = createContext<EditContextType | null>(null);

export function useEditContext() {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditContext must be used within EditProvider');
  }
  return context;
}

// Safe version that returns null if not in provider (for visitor mode)
export function useEditContextSafe() {
  return useContext(EditContext);
}

interface EditProviderProps {
  children: React.ReactNode;
  initialDesktop?: Desktop | null;
  initialIsOwner?: boolean;
  demoMode?: boolean;
}

export function EditProvider({ children, initialDesktop = null, initialIsOwner = false, demoMode = false }: EditProviderProps) {
  const [isOwner, setIsOwner] = useState(initialIsOwner);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [desktop, setDesktop] = useState<Desktop | null>(initialDesktop);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Debounce timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Push to history
  const pushHistory = useCallback((entry: Omit<HistoryEntry, 'timestamp'>) => {
    setHistory(prev => {
      // Remove any entries after current index (for redo)
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, { ...entry, timestamp: Date.now() }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Debounced save
  const debouncedSave = useCallback(async (itemId: string, data: Partial<DesktopItem>) => {
    // Skip API calls in demo mode - changes only persist locally
    if (demoMode) {
      setPendingChanges(false);
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 1500);
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setPendingChanges(true);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const response = await fetch(`/api/desktop/items/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Save failed');

        setSaveStatus('saved');
        setLastSaved(new Date());
        setPendingChanges(false);

        // Reset to idle after showing saved
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch {
        setSaveStatus('error');
        showToast('Failed to save. Retrying...', 'error');
        // Retry after 2 seconds
        setTimeout(() => debouncedSave(itemId, data), 2000);
      }
    }, 500);
  }, [demoMode]);

  // Update item
  const updateItem = useCallback((itemId: string, updates: Partial<DesktopItem>) => {
    if (!desktop) return;

    const item = desktop.items.find(i => i.id === itemId);
    if (!item) return;

    // Push to history
    pushHistory({
      type: 'item',
      itemId,
      before: { ...item },
      after: { ...item, ...updates },
    });

    // Update local state
    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, ...updates } : i),
      };
    });

    // Save
    debouncedSave(itemId, updates);
  }, [desktop, pushHistory, debouncedSave]);

  // Update item position
  const updateItemPosition = useCallback((itemId: string, x: number, y: number) => {
    if (!desktop) return;

    const item = desktop.items.find(i => i.id === itemId);
    if (!item) return;

    // Push to history
    pushHistory({
      type: 'position',
      itemId,
      before: { positionX: item.positionX, positionY: item.positionY },
      after: { positionX: x, positionY: y },
    });

    // Update local state
    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, positionX: x, positionY: y } : i),
      };
    });

    // Save
    debouncedSave(itemId, { positionX: x, positionY: y });
  }, [desktop, pushHistory, debouncedSave]);

  // Delete item
  const deleteItem = useCallback(async (itemId: string) => {
    if (!desktop) return;

    const item = desktop.items.find(i => i.id === itemId);
    if (!item) return;

    // Push to history
    pushHistory({
      type: 'item',
      itemId,
      before: item,
      after: null,
    });

    // Update local state
    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter(i => i.id !== itemId),
      };
    });

    // Skip API calls in demo mode
    if (demoMode) {
      showToast('Item deleted', 'success');
      return;
    }

    // Delete from server
    try {
      await fetch(`/api/desktop/items/${itemId}`, { method: 'DELETE' });
      showToast('Item deleted', 'success');
    } catch {
      showToast('Failed to delete item', 'error');
    }
  }, [desktop, pushHistory, demoMode]);

  // Duplicate item
  const duplicateItem = useCallback(async (itemId: string) => {
    if (!desktop) return;

    const item = desktop.items.find(i => i.id === itemId);
    if (!item) return;

    // Create duplicate with offset position
    const newItem: DesktopItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      positionX: Math.min(item.positionX + 5, 90),
      positionY: Math.min(item.positionY + 5, 90),
      label: `${item.label} copy`,
    };

    // In demo mode, add locally without API call
    if (demoMode) {
      setDesktop(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [...prev.items, newItem],
        };
      });
      showToast('Item duplicated', 'success');
      return;
    }

    try {
      const response = await fetch('/api/desktop/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error('Failed to duplicate');

      const { data } = await response.json();

      // Add to local state
      setDesktop(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [...prev.items, data],
        };
      });

      showToast('Item duplicated', 'success');
    } catch {
      showToast('Failed to duplicate item', 'error');
    }
  }, [desktop, demoMode]);

  // Add new item
  const addItem = useCallback(async (item: Omit<DesktopItem, 'id' | 'desktopId' | 'zIndex' | 'order'>) => {
    // In demo mode, create locally without API call
    if (demoMode) {
      const newItem: DesktopItem = {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        desktopId: desktop?.id || 'demo',
        zIndex: 0,
        order: desktop?.items.length || 0,
      } as DesktopItem;

      setDesktop(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [...prev.items, newItem],
        };
      });

      showToast('Item created', 'success');
      return newItem;
    }

    try {
      const response = await fetch('/api/desktop/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) throw new Error('Failed to create item');

      const { data } = await response.json();

      // Add to local state
      setDesktop(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [...prev.items, data],
        };
      });

      showToast('Item created', 'success');
      return data;
    } catch {
      showToast('Failed to create item', 'error');
      return null;
    }
  }, [demoMode, desktop]);

  // Update block
  const updateBlock = useCallback((itemId: string, blockId: string, updates: Partial<BlockData>) => {
    if (!desktop) return;

    const item = desktop.items.find(i => i.id === itemId);
    if (!item) return;

    const block = item.blocks?.find(b => b.id === blockId);
    if (!block) return;

    // Push to history
    pushHistory({
      type: 'block',
      itemId,
      blockId,
      before: { ...block },
      after: { ...block, ...updates },
    });

    // Update local state
    const updatedBlocks = item.blocks?.map(b => b.id === blockId ? { ...b, ...updates } : b) || [];

    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, blocks: updatedBlocks } : i),
      };
    });

    // Save
    debouncedSave(itemId, { blocks: updatedBlocks });
  }, [desktop, pushHistory, debouncedSave]);

  // Delete block
  const deleteBlock = useCallback((itemId: string, blockId: string) => {
    if (!desktop) return;

    const item = desktop.items.find(i => i.id === itemId);
    if (!item) return;

    const block = item.blocks?.find(b => b.id === blockId);
    if (!block) return;

    // Push to history
    pushHistory({
      type: 'block',
      itemId,
      blockId,
      before: block,
      after: null,
    });

    // Update local state
    const updatedBlocks = item.blocks?.filter(b => b.id !== blockId) || [];

    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, blocks: updatedBlocks } : i),
      };
    });

    // Save
    debouncedSave(itemId, { blocks: updatedBlocks });
    showToast('Block deleted. Cmd+Z to undo', 'info');
  }, [desktop, pushHistory, debouncedSave]);

  // Add block
  const addBlock = useCallback((itemId: string, block: Omit<BlockData, 'id'>, afterBlockId?: string) => {
    if (!desktop) return;

    const item = desktop.items.find(i => i.id === itemId);
    if (!item) return;

    const newBlock: BlockData = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Calculate order
    let updatedBlocks: BlockData[];
    if (afterBlockId) {
      const afterIndex = item.blocks?.findIndex(b => b.id === afterBlockId) ?? -1;
      const before = item.blocks?.slice(0, afterIndex + 1) || [];
      const after = item.blocks?.slice(afterIndex + 1) || [];
      updatedBlocks = [...before, newBlock, ...after].map((b, i) => ({ ...b, order: i }));
    } else {
      updatedBlocks = [...(item.blocks || []), newBlock].map((b, i) => ({ ...b, order: i }));
    }

    // Push to history
    pushHistory({
      type: 'block',
      itemId,
      blockId: newBlock.id,
      before: null,
      after: newBlock,
    });

    // Update local state
    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, blocks: updatedBlocks } : i),
      };
    });

    // Save
    debouncedSave(itemId, { blocks: updatedBlocks });
  }, [desktop, pushHistory, debouncedSave]);

  // Reorder blocks
  const reorderBlocks = useCallback((itemId: string, blockIds: string[]) => {
    if (!desktop) return;

    const item = desktop.items.find(i => i.id === itemId);
    if (!item) return;

    const blockMap = new Map(item.blocks?.map(b => [b.id, b]) || []);
    const updatedBlocks = blockIds.map((id, index) => {
      const block = blockMap.get(id);
      return block ? { ...block, order: index } : null;
    }).filter(Boolean) as BlockData[];

    // Update local state
    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, blocks: updatedBlocks } : i),
      };
    });

    // Save
    debouncedSave(itemId, { blocks: updatedBlocks });
  }, [desktop, debouncedSave]);

  // Update status widget
  const updateStatusWidget = useCallback(async (updates: Partial<StatusWidget>) => {
    // Update local state first
    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        statusWidget: prev.statusWidget
          ? { ...prev.statusWidget, ...updates }
          : {
              id: `status-${Date.now()}`,
              desktopId: prev.id,
              statusType: 'available',
              title: 'Available for work',
              description: null,
              ctaUrl: null,
              ctaLabel: null,
              isVisible: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              ...updates,
            } as StatusWidget,
      };
    });

    // Skip API calls in demo mode
    if (demoMode) {
      showToast('Status updated', 'success');
      return;
    }

    // Save to server
    try {
      const response = await fetch('/api/desktop/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to save status');

      const { data } = await response.json();

      // Update with server response
      setDesktop(prev => {
        if (!prev) return prev;
        return { ...prev, statusWidget: data };
      });

      showToast('Status updated', 'success');
    } catch {
      showToast('Failed to update status', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  // Add workbench entry
  const addWorkbenchEntry = useCallback(async (entry: Omit<WorkbenchEntry, 'id' | 'desktopId' | 'createdAt' | 'updatedAt' | 'order'>) => {
    const newEntry: WorkbenchEntry = {
      ...entry,
      id: `workbench-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      desktopId: desktop?.id || 'demo',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
    };

    // Update local state - add to beginning
    setDesktop(prev => {
      if (!prev) return prev;
      const updatedEntries = [newEntry, ...(prev.workbenchEntries || [])].map((e, i) => ({ ...e, order: i }));
      return { ...prev, workbenchEntries: updatedEntries };
    });

    // Skip API calls in demo mode
    if (demoMode) {
      showToast('Entry added', 'success');
      return;
    }

    // Save to server
    try {
      const response = await fetch('/api/desktop/workbench', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!response.ok) throw new Error('Failed to add entry');

      const { data } = await response.json();

      // Update with server response
      setDesktop(prev => {
        if (!prev) return prev;
        const updatedEntries = [data, ...(prev.workbenchEntries || []).filter(e => e.id !== newEntry.id)];
        return { ...prev, workbenchEntries: updatedEntries };
      });

      showToast('Entry added', 'success');
    } catch {
      showToast('Failed to add entry', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktop, demoMode]);

  // Update workbench entry
  const updateWorkbenchEntry = useCallback(async (entryId: string, updates: Partial<WorkbenchEntry>) => {
    // Update local state
    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        workbenchEntries: (prev.workbenchEntries || []).map(e =>
          e.id === entryId ? { ...e, ...updates, updatedAt: new Date() } : e
        ),
      };
    });

    // Skip API calls in demo mode
    if (demoMode) {
      showToast('Entry updated', 'success');
      return;
    }

    // Save to server
    try {
      const response = await fetch(`/api/desktop/workbench/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update entry');

      showToast('Entry updated', 'success');
    } catch {
      showToast('Failed to update entry', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  // Delete workbench entry
  const deleteWorkbenchEntry = useCallback(async (entryId: string) => {
    // Update local state
    setDesktop(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        workbenchEntries: (prev.workbenchEntries || []).filter(e => e.id !== entryId),
      };
    });

    // Skip API calls in demo mode
    if (demoMode) {
      showToast('Entry deleted', 'success');
      return;
    }

    // Delete from server
    try {
      const response = await fetch(`/api/desktop/workbench/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      showToast('Entry deleted', 'success');
    } catch {
      showToast('Failed to delete entry', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex < 0) return;

    const entry = history[historyIndex];

    // Restore previous state
    if (entry.type === 'item' || entry.type === 'position') {
      if (entry.before && entry.itemId) {
        setDesktop(prev => {
          if (!prev) return prev;
          if (entry.after === null) {
            // Was deleted, restore it
            return {
              ...prev,
              items: [...prev.items, entry.before as DesktopItem],
            };
          }
          return {
            ...prev,
            items: prev.items.map(i => i.id === entry.itemId ? entry.before as DesktopItem : i),
          };
        });
        debouncedSave(entry.itemId, entry.before as Partial<DesktopItem>);
      }
    }

    setHistoryIndex(prev => prev - 1);
    showToast('Undone', 'info');
  }, [history, historyIndex, debouncedSave]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const entry = history[historyIndex + 1];

    // Apply the change again
    if (entry.type === 'item' || entry.type === 'position') {
      if (entry.after && entry.itemId) {
        setDesktop(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map(i => i.id === entry.itemId ? entry.after as DesktopItem : i),
          };
        });
        debouncedSave(entry.itemId, entry.after as Partial<DesktopItem>);
      } else if (entry.after === null && entry.itemId) {
        // Was a delete, delete again
        setDesktop(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.filter(i => i.id !== entry.itemId),
          };
        });
      }
    }

    setHistoryIndex(prev => prev + 1);
    showToast('Redone', 'info');
  }, [history, historyIndex, debouncedSave]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOwner) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOwner, undo, redo]);

  // Show toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Click outside to deselect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-editable]') && activeEditId) {
        setActiveEditId(null);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [activeEditId]);

  const value: EditContextType = {
    isOwner,
    setIsOwner,
    activeEditId,
    setActiveEditId,
    desktop,
    setDesktop,
    updateItem,
    updateItemPosition,
    deleteItem,
    duplicateItem,
    addItem,
    updateBlock,
    deleteBlock,
    addBlock,
    reorderBlocks,
    updateStatusWidget,
    addWorkbenchEntry,
    updateWorkbenchEntry,
    deleteWorkbenchEntry,
    saveStatus,
    lastSaved,
    pendingChanges,
    undo,
    redo,
    canUndo: historyIndex >= 0,
    canRedo: historyIndex < history.length - 1,
    showToast,
    toast,
  };

  return (
    <EditContext.Provider value={value}>
      {children}
    </EditContext.Provider>
  );
}
