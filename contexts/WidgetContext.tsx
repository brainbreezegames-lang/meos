'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Widget, WidgetType } from '@/types';

export interface WidgetContextType {
  // State
  widgets: Widget[];
  isLoading: boolean;
  error: string | null;

  // Widget operations
  createWidget: (type: WidgetType, position?: { x: number; y: number }) => Promise<Widget | null>;
  updateWidget: (id: string, updates: Partial<Widget>) => Promise<void>;
  deleteWidget: (id: string) => Promise<boolean>;
  moveWidget: (id: string, x: number, y: number) => Promise<void>;

  // Fetch operations
  refreshWidgets: () => Promise<void>;

  // Toast
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const WidgetContext = createContext<WidgetContextType | null>(null);

export function useWidgets() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within WidgetProvider');
  }
  return context;
}

// Safe version that returns null if not in provider
export function useWidgetsSafe() {
  return useContext(WidgetContext);
}

interface WidgetProviderProps {
  children: React.ReactNode;
  initialWidgets?: Widget[];
  isOwner?: boolean;
  localOnly?: boolean;
}

// Default positions for new widgets
const DEFAULT_WIDGET_POSITIONS: Record<WidgetType, { x: number; y: number }> = {
  clock: { x: 85, y: 10 },
  book: { x: 85, y: 20 },
  tipjar: { x: 85, y: 30 },
  contact: { x: 85, y: 40 },
  links: { x: 85, y: 50 },
  feedback: { x: 85, y: 60 },
};

export function WidgetProvider({
  children,
  initialWidgets = [],
  isOwner = false,
  localOnly = false,
}: WidgetProviderProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Show toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch widgets from API
  const refreshWidgets = useCallback(async () => {
    if (localOnly) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/widgets');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch widgets');
      }

      setWidgets(result.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch widgets';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [localOnly, showToast]);

  // Create new widget
  const createWidget = useCallback(async (
    type: WidgetType,
    customPosition?: { x: number; y: number }
  ): Promise<Widget | null> => {
    if (!isOwner) return null;

    const position = customPosition || DEFAULT_WIDGET_POSITIONS[type] || { x: 80, y: 50 };

    // Create widget object
    const newId = localOnly ? `local-widget-${Date.now()}` : `temp-widget-${Date.now()}`;
    const newWidget: Widget = {
      id: newId,
      desktopId: '',
      widgetType: type,
      positionX: position.x,
      positionY: position.y,
      title: null,
      isVisible: true,
      config: {},
      order: widgets.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In local-only mode, just add to state and return
    if (localOnly) {
      setWidgets(prev => [...prev, newWidget]);
      showToast('Widget added', 'success');
      return newWidget;
    }

    // Optimistic update
    setWidgets(prev => [...prev, newWidget]);

    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          position,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create widget');
      }

      // Replace temp widget with real one
      setWidgets(prev => prev.map(w => w.id === newId ? result.data : w));
      showToast('Widget added', 'success');
      return result.data;
    } catch (err) {
      // Rollback
      setWidgets(prev => prev.filter(w => w.id !== newId));
      const message = err instanceof Error ? err.message : 'Failed to create widget';
      showToast(message, 'error');
      return null;
    }
  }, [isOwner, localOnly, widgets.length, showToast]);

  // Update widget
  const updateWidget = useCallback(async (id: string, updates: Partial<Widget>) => {
    if (!isOwner) return;

    // Store previous widget for potential rollback
    const previousWidget = widgets.find(w => w.id === id);
    if (!previousWidget) return;

    // Optimistic update
    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
    ));

    // In local-only mode, just update state
    if (localOnly) return;

    try {
      const apiUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.isVisible !== undefined) apiUpdates.isVisible = updates.isVisible;
      if (updates.config !== undefined) apiUpdates.config = updates.config;
      if (updates.positionX !== undefined || updates.positionY !== undefined) {
        apiUpdates.position = {
          x: updates.positionX ?? previousWidget.positionX,
          y: updates.positionY ?? previousWidget.positionY,
        };
      }

      const response = await fetch(`/api/widgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiUpdates),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update widget');
      }

      // Update with server response
      setWidgets(prev => prev.map(w => w.id === id ? result.data : w));
    } catch (err) {
      // Rollback
      setWidgets(prev => prev.map(w => w.id === id ? previousWidget : w));
      const message = err instanceof Error ? err.message : 'Failed to update widget';
      showToast(message, 'error');
    }
  }, [isOwner, localOnly, widgets, showToast]);

  // Move widget
  const moveWidget = useCallback(async (id: string, x: number, y: number) => {
    await updateWidget(id, { positionX: x, positionY: y });
  }, [updateWidget]);

  // Delete widget
  const deleteWidget = useCallback(async (id: string): Promise<boolean> => {
    if (!isOwner) return false;

    const widgetToDelete = widgets.find(w => w.id === id);
    if (!widgetToDelete) return false;

    // Optimistic update
    setWidgets(prev => prev.filter(w => w.id !== id));

    // In local-only mode, just delete from state
    if (localOnly) {
      showToast('Widget removed', 'success');
      return true;
    }

    try {
      const response = await fetch(`/api/widgets/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete widget');
      }

      showToast('Widget removed', 'success');
      return true;
    } catch (err) {
      // Rollback
      setWidgets(prev => [...prev, widgetToDelete]);
      const message = err instanceof Error ? err.message : 'Failed to delete widget';
      showToast(message, 'error');
      return false;
    }
  }, [isOwner, localOnly, widgets, showToast]);

  const value: WidgetContextType = {
    widgets,
    isLoading,
    error,
    createWidget,
    updateWidget,
    deleteWidget,
    moveWidget,
    refreshWidgets,
    showToast,
    toast,
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}
