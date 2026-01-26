'use client';

import React, { useCallback, useMemo } from 'react';
import type { Widget } from '@/types';
import { ClockWidget } from './ClockWidget';
import { BookWidget } from './BookWidget';
import { TipJarWidget } from './TipJarWidget';
import { ContactWidget } from './ContactWidget';
import { LinksWidget } from './LinksWidget';
import { FeedbackWidget } from './FeedbackWidget';
import { StatusWidget } from './StatusWidget';
import { StickyNoteWidget } from './StickyNoteWidget';

interface WidgetRendererProps {
  widgets: Widget[];
  isOwner?: boolean;
  onWidgetEdit?: (widget: Widget) => void;
  onWidgetDelete?: (id: string) => void;
  onWidgetPositionChange?: (id: string, x: number, y: number) => void;
  onWidgetContextMenu?: (e: React.MouseEvent, widget: Widget) => void;
  highlightedWidgetId?: string | null;
  onTip?: (amount: number) => Promise<void>;
  onContact?: (data: { name?: string; email: string; message: string }) => Promise<void>;
  onFeedback?: (feedback: string) => Promise<void>;
  onStickyNoteChange?: (widgetId: string, content: string) => void;
}

export function WidgetRenderer({
  widgets,
  isOwner = false,
  onWidgetEdit,
  onWidgetDelete,
  onWidgetPositionChange,
  onWidgetContextMenu,
  highlightedWidgetId,
  onTip,
  onContact,
  onFeedback,
  onStickyNoteChange,
}: WidgetRendererProps) {
  // Filter visible widgets (or show all if owner)
  const visibleWidgets = useMemo(() =>
    isOwner ? widgets : widgets.filter(w => w.isVisible),
    [widgets, isOwner]
  );

  // Memoize callback creators to avoid new function refs
  const getEditHandler = useCallback((widget: Widget) => () => onWidgetEdit?.(widget), [onWidgetEdit]);
  const getDeleteHandler = useCallback((id: string) => () => onWidgetDelete?.(id), [onWidgetDelete]);
  const getPositionHandler = useCallback((id: string) => (x: number, y: number) => onWidgetPositionChange?.(id, x, y), [onWidgetPositionChange]);
  const getContextMenuHandler = useCallback((widget: Widget) => (e: React.MouseEvent) => onWidgetContextMenu?.(e, widget), [onWidgetContextMenu]);
  const getStickyNoteHandler = useCallback((widgetId: string) => (content: string) => onStickyNoteChange?.(widgetId, content), [onStickyNoteChange]);

  return (
    <>
      {visibleWidgets.map((widget) => {
        const commonProps = {
          widget,
          isOwner,
          onEdit: getEditHandler(widget),
          onDelete: getDeleteHandler(widget.id),
          onPositionChange: getPositionHandler(widget.id),
          onContextMenu: getContextMenuHandler(widget),
          isHighlighted: highlightedWidgetId === widget.id,
        };

        switch (widget.widgetType) {
          case 'clock':
            return <ClockWidget key={widget.id} {...commonProps} />;
          case 'book':
            return <BookWidget key={widget.id} {...commonProps} />;
          case 'tipjar':
            return <TipJarWidget key={widget.id} {...commonProps} onTip={onTip} />;
          case 'contact':
            return <ContactWidget key={widget.id} {...commonProps} onSubmit={onContact} />;
          case 'links':
            return <LinksWidget key={widget.id} {...commonProps} />;
          case 'feedback':
            return <FeedbackWidget key={widget.id} {...commonProps} onSubmit={onFeedback} />;
          case 'status':
            return <StatusWidget key={widget.id} {...commonProps} />;
          case 'sticky-note':
            return (
              <StickyNoteWidget
                key={widget.id}
                {...commonProps}
                onContentChange={getStickyNoteHandler(widget.id)}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
