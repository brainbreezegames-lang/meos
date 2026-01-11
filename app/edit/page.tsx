'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { EditableDesktopCanvas } from '@/components/editor/EditableDesktopCanvas';
import { DesktopCanvas, MenuBar, Dock, MadeWithBadge } from '@/components/desktop';
import { SettingsWindow } from '@/components/desktop/SettingsWindow';
import { ThemeProvider, type ThemeId } from '@/contexts/ThemeContext';
import type { Desktop, DesktopItem, DockItem } from '@/types';

export default function EditPage() {
  const { data: session, status } = useSession();
  const [desktop, setDesktop] = useState<Desktop | null>(null);
  const [selectedItem, setSelectedItem] = useState<DesktopItem | null>(null);
  const [selectedDockItem, setSelectedDockItem] = useState<DockItem | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  // Fetch desktop data
  useEffect(() => {
    if (session?.user?.id) {
      fetchDesktop();
    }
  }, [session?.user?.id]);

  const fetchDesktop = async () => {
    try {
      const res = await fetch('/api/desktop');
      const data = await res.json();
      if (data.success) {
        setDesktop(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch desktop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDesktop = useCallback(async (updates: Partial<Desktop>) => {
    if (!desktop) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/desktop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setDesktop(data.data);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to update desktop:', error);
    } finally {
      setIsSaving(false);
    }
  }, [desktop]);

  const handleCreateItem = useCallback(async (itemData: Partial<DesktopItem>) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/desktop/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      const data = await res.json();
      if (data.success && desktop) {
        setDesktop({
          ...desktop,
          items: [...desktop.items, data.data],
        });
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setIsSaving(false);
    }
  }, [desktop]);

  const handleUpdateItem = useCallback(async (id: string, updates: Partial<DesktopItem>) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/desktop/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && desktop) {
        setDesktop({
          ...desktop,
          items: desktop.items.map((item) =>
            item.id === id ? { ...item, ...data.data } : item
          ),
        });
        setSelectedItem(null);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setIsSaving(false);
    }
  }, [desktop]);

  const handleDeleteItem = useCallback(async (id: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/desktop/items/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && desktop) {
        setDesktop({
          ...desktop,
          items: desktop.items.filter((item) => item.id !== id),
        });
        setSelectedItem(null);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsSaving(false);
    }
  }, [desktop]);

  const handleMoveItem = useCallback(async (id: string, x: number, y: number) => {
    if (!desktop) return;

    // Optimistic update
    setDesktop({
      ...desktop,
      items: desktop.items.map((item) =>
        item.id === id ? { ...item, positionX: x, positionY: y } : item
      ),
    });

    // Persist to server
    try {
      await fetch(`/api/desktop/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionX: x, positionY: y }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to move item:', error);
      fetchDesktop(); // Revert on error
    }
  }, [desktop]);

  const handleCreateDockItem = useCallback(async (itemData: Partial<DockItem>) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/desktop/dock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      const data = await res.json();
      if (data.success && desktop) {
        setDesktop({
          ...desktop,
          dockItems: [...desktop.dockItems, data.data],
        });
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to create dock item:', error);
    } finally {
      setIsSaving(false);
    }
  }, [desktop]);

  const handleUpdateDockItem = useCallback(async (id: string, updates: Partial<DockItem>) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/desktop/dock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && desktop) {
        setDesktop({
          ...desktop,
          dockItems: desktop.dockItems.map((item) =>
            item.id === id ? { ...item, ...data.data } : item
          ),
        });
        setSelectedDockItem(null);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to update dock item:', error);
    } finally {
      setIsSaving(false);
    }
  }, [desktop]);

  const handleDeleteDockItem = useCallback(async (id: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/desktop/dock/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && desktop) {
        setDesktop({
          ...desktop,
          dockItems: desktop.dockItems.filter((item) => item.id !== id),
        });
        setSelectedDockItem(null);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to delete dock item:', error);
    } finally {
      setIsSaving(false);
    }
  }, [desktop]);

  const handleMoveDockItem = useCallback(async (id: string, direction: 'up' | 'down') => {
    if (!desktop) return;

    const items = [...desktop.dockItems];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap items
    [items[index], items[newIndex]] = [items[newIndex], items[index]];

    // Update order values
    const reorderedItems = items.map((item, i) => ({ ...item, order: i }));

    // Optimistic update
    setDesktop({
      ...desktop,
      dockItems: reorderedItems,
    });

    // Persist to server
    try {
      await fetch('/api/desktop/dock/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderedItems.map((item) => ({ id: item.id, order: item.order }))),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to reorder dock items:', error);
      fetchDesktop();
    }
  }, [desktop]);

  const handleUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'thumbnails');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.data.url;
  }, []);

  if (status === 'loading' || isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-solid)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: 'var(--border-medium)',
              borderTopColor: 'var(--accent-primary)',
            }}
          />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Loading your desktop
          </span>
        </div>
      </div>
    );
  }

  if (!session?.user || !desktop) {
    return null;
  }

  // Get initial theme from desktop
  const validThemes: ThemeId[] = ['monterey', 'dark', 'bluren', 'refined'];
  const initialTheme = validThemes.includes(desktop.theme as ThemeId)
    ? (desktop.theme as ThemeId)
    : 'monterey';

  return (
    <ThemeProvider initialTheme={initialTheme} desktopId={desktop.id} isOwner={true}>
      <div className="min-h-screen" style={{ background: 'var(--bg-solid)' }}>
        <EditorToolbar
          username={session.user.username}
          isSaving={isSaving}
          lastSaved={lastSaved}
          isPreview={isPreview}
          onTogglePreview={() => setIsPreview(!isPreview)}
          onSettingsClick={() => setShowSettings(true)}
        />

        {isPreview ? (
          <>
            <MenuBar
              title={desktop.title || session.user.name || session.user.username}
              onSettingsClick={() => setShowSettings(true)}
            />
            <DesktopCanvas desktop={desktop} />
            <Dock items={desktop.dockItems} />
            <MadeWithBadge />
          </>
        ) : (
          <>
            <EditableDesktopCanvas
              desktop={desktop}
              selectedItemId={selectedItem?.id || null}
              onSelectItem={setSelectedItem}
              onMoveItem={handleMoveItem}
            />
            <EditorSidebar
              desktop={desktop}
              selectedItem={selectedItem}
              selectedDockItem={selectedDockItem}
              onDeselectItem={() => setSelectedItem(null)}
              onDeselectDockItem={() => setSelectedDockItem(null)}
              onUpdateDesktop={handleUpdateDesktop}
              onCreateItem={handleCreateItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onCreateDockItem={handleCreateDockItem}
              onUpdateDockItem={handleUpdateDockItem}
              onDeleteDockItem={handleDeleteDockItem}
              onMoveDockItem={handleMoveDockItem}
              onUpload={handleUpload}
            />
            <Dock items={desktop.dockItems} />
          </>
        )}

        {/* Settings Window */}
        <SettingsWindow
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </ThemeProvider>
  );
}
