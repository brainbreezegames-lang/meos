'use client';

import React from 'react';
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
  const visibleWidgets = isOwner
    ? widgets
    : widgets.filter(w => w.isVisible);

  return (
    <>
      {visibleWidgets.map((widget) => {
        const commonProps = {
          widget,
          isOwner,
          onEdit: () => onWidgetEdit?.(widget),
          onDelete: () => onWidgetDelete?.(widget.id),
          onPositionChange: (x: number, y: number) =>
            onWidgetPositionChange?.(widget.id, x, y),
          onContextMenu: (e: React.MouseEvent) => onWidgetContextMenu?.(e, widget),
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
                onContentChange={(content) => onStickyNoteChange?.(widget.id, content)}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
