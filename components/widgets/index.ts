export { WidgetWrapper } from './WidgetWrapper';
export { ClockWidget, CLOCK_WIDGET_DEFAULT_CONFIG } from './ClockWidget';
export { BookWidget, BOOK_WIDGET_DEFAULT_CONFIG } from './BookWidget';
export { TipJarWidget, TIPJAR_WIDGET_DEFAULT_CONFIG } from './TipJarWidget';
export { ContactWidget, CONTACT_WIDGET_DEFAULT_CONFIG } from './ContactWidget';
export { LinksWidget, LINKS_WIDGET_DEFAULT_CONFIG } from './LinksWidget';
export { FeedbackWidget, FEEDBACK_WIDGET_DEFAULT_CONFIG } from './FeedbackWidget';
export { StatusWidget, STATUS_WIDGET_DEFAULT_CONFIG } from './StatusWidget';
export { StickyNoteWidget } from './StickyNoteWidget';
export { WidgetRenderer } from './WidgetRenderer';
export { WidgetContextMenu } from './WidgetContextMenu';

// Widget type to component mapping
import type { WidgetType, Widget } from '@/types';
import { ClockWidget } from './ClockWidget';
import { BookWidget } from './BookWidget';
import { TipJarWidget } from './TipJarWidget';
import { ContactWidget } from './ContactWidget';
import { LinksWidget } from './LinksWidget';
import { FeedbackWidget } from './FeedbackWidget';
import { StatusWidget } from './StatusWidget';
import { StickyNoteWidget } from './StickyNoteWidget';

export const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType<{
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onPositionChange?: (x: number, y: number) => void;
}>> = {
  clock: ClockWidget,
  book: BookWidget,
  tipjar: TipJarWidget,
  contact: ContactWidget,
  links: LinksWidget,
  feedback: FeedbackWidget,
  status: StatusWidget,
  'sticky-note': StickyNoteWidget,
};

// Widget metadata for UI
export const WIDGET_METADATA: Record<WidgetType, {
  label: string;
  icon: string;
  description: string;
}> = {
  clock: {
    label: 'Clock',
    icon: '🕐',
    description: 'Show your local time and timezone',
  },
  book: {
    label: 'Book a Call',
    icon: '📅',
    description: 'Link to your scheduling tool',
  },
  tipjar: {
    label: 'Tip Jar',
    icon: '☕',
    description: 'Accept support and donations',
  },
  contact: {
    label: 'Contact',
    icon: '✉️',
    description: 'Simple contact form',
  },
  links: {
    label: 'Links',
    icon: '🔗',
    description: 'Social and external links',
  },
  feedback: {
    label: 'Feedback',
    icon: '💬',
    description: 'Collect anonymous feedback',
  },
  status: {
    label: 'Availability',
    icon: '✦',
    description: 'Show your availability status',
  },
  'sticky-note': {
    label: 'Sticky Note',
    icon: '📝',
    description: 'Handwritten notes with cozy typography',
  },
};
