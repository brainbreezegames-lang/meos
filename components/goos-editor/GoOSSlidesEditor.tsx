'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { motion, useDragControls, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Play,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Palette,
  Layout,
  Type,
  Image,
  Quote,
  List,
  BarChart3,
  Presentation,
  X,
  Maximize2,
  GripVertical,
} from 'lucide-react';
import { SPRING, contextMenu as contextMenuVariants } from '@/lib/animations';
import { GoOSAutoSaveIndicator, SaveStatus } from './GoOSAutoSaveIndicator';
import { GoOSPublishToggle, GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../desktop/windowStyles';
import { SlideRenderer } from '../presentation/SlideTemplates';
import { PresentationView } from '../presentation/PresentationView';
import { themes, themeIds, getTheme, type ThemeId } from '@/lib/presentation/themes';
import { AccessLevel } from '@/contexts/GoOSContext';
import { playSound } from '@/lib/sounds';
import type {
  SlidesContent,
  Slide,
  SlideTemplate,
  SlideContentData,
} from '@/lib/validations/goos';
import { getDefaultSlidesContent } from '@/lib/validations/goos';

export interface GoOSFile {
  id: string;
  type: 'slides';
  title: string;
  content: string;
  status: PublishStatus;
  accessLevel?: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  parentFolderId?: string;
  position: { x: number; y: number };
}

interface GoOSSlidesEditorProps {
  file: GoOSFile;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onUpdate: (file: Partial<GoOSFile>) => void;
  isActive?: boolean;
  zIndex?: number;
  isMaximized?: boolean;
}

// Template options for the "Add Slide" menu
const SLIDE_TEMPLATES: { template: SlideTemplate; icon: React.ReactNode; label: string; description: string }[] = [
  { template: 'title', icon: <Type size={16} />, label: 'Title', description: 'Big headline with subtitle' },
  { template: 'section', icon: <Layout size={16} />, label: 'Section', description: 'Section divider' },
  { template: 'content', icon: <Type size={16} />, label: 'Content', description: 'Heading with body text' },
  { template: 'image', icon: <Image size={16} />, label: 'Image', description: 'Full-bleed image' },
  { template: 'image-text', icon: <Layout size={16} />, label: 'Image + Text', description: 'Split layout' },
  { template: 'quote', icon: <Quote size={16} />, label: 'Quote', description: 'Blockquote with attribution' },
  { template: 'list', icon: <List size={16} />, label: 'List', description: 'Bullet point list' },
  { template: 'stat', icon: <BarChart3 size={16} />, label: 'Stat', description: 'Big number with label' },
];

// Create default content for a template
function createSlideContent(template: SlideTemplate): SlideContentData {
  switch (template) {
    case 'title':
      return { heading: 'Slide Title', subheading: 'Subtitle here' };
    case 'section':
      return { heading: 'Section Title' };
    case 'content':
      return { heading: 'Heading', body: 'Your content goes here. Make it compelling and concise.' };
    case 'image':
      return { image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&h=1080&fit=crop', caption: 'Image caption' };
    case 'image-text':
      return { heading: 'Image Title', body: 'Description text here.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop' };
    case 'quote':
      return { quote: 'A compelling quote that inspires or provokes thought.', attribution: 'Author Name' };
    case 'list':
      return { heading: 'Key Points', items: ['First point', 'Second point', 'Third point'] };
    case 'stat':
      return { stat_value: '100%', stat_label: 'Success rate' };
    case 'end':
      return { url: 'yourname.goos.io' };
    default:
      return { heading: 'New Slide' };
  }
}

// ─── Slide Thumbnail ───────────────────────────────────────────
function SlideThumbnail({
  slide,
  index,
  isSelected,
  theme,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp,
  canMoveDown,
}: {
  slide: Slide;
  index: number;
  isSelected: boolean;
  theme: ReturnType<typeof getTheme>;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 0',
      }}
    >
      {/* Slide number */}
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-muted)',
        width: 20,
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {index + 1}
      </span>

      {/* Thumbnail */}
      <div
        onClick={onSelect}
        style={{
          flex: 1,
          aspectRatio: '16 / 9',
          borderRadius: 6,
          overflow: 'hidden',
          cursor: 'pointer',
          border: isSelected
            ? '2px solid var(--color-accent-primary)'
            : '2px solid var(--color-border-default)',
          boxShadow: isSelected
            ? '0 0 0 2px rgba(255, 119, 34, 0.2)'
            : 'none',
          transition: 'border 0.15s ease, box-shadow 0.15s ease',
          position: 'relative',
        }}
      >
        <SlideRenderer slide={slide} theme={theme} size="thumbnail" />

        {/* Actions overlay */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                disabled={!canMoveUp}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  background: canMoveUp ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none', cursor: canMoveUp ? 'pointer' : 'default',
                  color: canMoveUp ? '#fff' : 'rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                disabled={!canMoveDown}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  background: canMoveDown ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none', cursor: canMoveDown ? 'pointer' : 'default',
                  color: canMoveDown ? '#fff' : 'rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none', cursor: 'pointer', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Copy size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  background: 'rgba(239, 68, 68, 0.8)',
                  border: 'none', cursor: 'pointer', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Trash2 size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Slide Editor Panel ────────────────────────────────────────
function SlideEditorPanel({
  slide,
  onUpdate,
}: {
  slide: Slide;
  onUpdate: (updates: Partial<Slide>) => void;
}) {
  const updateContent = (key: keyof SlideContentData, value: string | string[]) => {
    onUpdate({
      content: { ...slide.content, [key]: value },
    });
  };

  const renderFields = () => {
    switch (slide.template) {
      case 'title':
        return (
          <>
            <Field label="Title" value={slide.content.heading || ''} onChange={(v) => updateContent('heading', v)} large />
            <Field label="Subtitle" value={slide.content.subheading || ''} onChange={(v) => updateContent('subheading', v)} />
            <Field label="Author" value={slide.content.author || ''} onChange={(v) => updateContent('author', v)} />
            <Field label="Image URL (optional)" value={slide.content.image || ''} onChange={(v) => updateContent('image', v)} />
          </>
        );
      case 'section':
        return (
          <Field label="Section Title" value={slide.content.heading || ''} onChange={(v) => updateContent('heading', v)} large />
        );
      case 'content':
        return (
          <>
            <Field label="Heading" value={slide.content.heading || ''} onChange={(v) => updateContent('heading', v)} />
            <Field label="Body" value={slide.content.body || ''} onChange={(v) => updateContent('body', v)} multiline />
          </>
        );
      case 'image':
        return (
          <>
            <Field label="Image URL" value={slide.content.image || ''} onChange={(v) => updateContent('image', v)} />
            <Field label="Caption" value={slide.content.caption || ''} onChange={(v) => updateContent('caption', v)} />
          </>
        );
      case 'image-text':
        return (
          <>
            <Field label="Heading" value={slide.content.heading || ''} onChange={(v) => updateContent('heading', v)} />
            <Field label="Body" value={slide.content.body || ''} onChange={(v) => updateContent('body', v)} multiline />
            <Field label="Image URL" value={slide.content.image || ''} onChange={(v) => updateContent('image', v)} />
          </>
        );
      case 'quote':
        return (
          <>
            <Field label="Quote" value={slide.content.quote || ''} onChange={(v) => updateContent('quote', v)} multiline />
            <Field label="Attribution" value={slide.content.attribution || ''} onChange={(v) => updateContent('attribution', v)} />
          </>
        );
      case 'list':
        return (
          <>
            <Field label="Heading" value={slide.content.heading || ''} onChange={(v) => updateContent('heading', v)} />
            <ListField
              items={slide.content.items || []}
              onChange={(items) => updateContent('items', items)}
            />
          </>
        );
      case 'stat':
        return (
          <>
            <Field label="Value" value={slide.content.stat_value || ''} onChange={(v) => updateContent('stat_value', v)} large />
            <Field label="Label" value={slide.content.stat_label || ''} onChange={(v) => updateContent('stat_label', v)} />
          </>
        );
      case 'end':
        return (
          <Field label="URL" value={slide.content.url || ''} onChange={(v) => updateContent('url', v)} />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 4,
      }}>
        {slide.template} slide
      </div>
      {renderFields()}

      {/* Speaker Notes */}
      <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
        <label style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          marginBottom: 6,
        }}>
          Speaker Notes
        </label>
        <textarea
          value={slide.speakerNotes || ''}
          onChange={(e) => onUpdate({ speakerNotes: e.target.value || undefined })}
          placeholder="Notes for yourself (not shown in presentation)"
          rows={3}
          style={{
            width: '100%',
            padding: 10,
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 6,
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  );
}

// Field components
function Field({
  label,
  value,
  onChange,
  large,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
  multiline?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    padding: large ? '12px 14px' : '10px 12px',
    fontSize: large ? 16 : 13,
    fontWeight: large ? 600 : 400,
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 8,
    outline: 'none',
    lineHeight: 1.4,
  };

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
        marginBottom: 6,
      }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          style={{ ...baseStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={baseStyle}
        />
      )}
    </div>
  );
}

function ListField({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const addItem = () => onChange([...items, '']);
  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
        marginBottom: 6,
      }}>
        List Items
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              style={{
                flex: 1,
                padding: '8px 10px',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 6,
                outline: 'none',
              }}
            />
            <button
              onClick={() => removeItem(index)}
              style={{
                width: 32, height: 32,
                background: 'transparent',
                border: '1px solid var(--color-border-default)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          style={{
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            background: 'transparent',
            border: '1px dashed var(--color-border-default)',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>
    </div>
  );
}

// ─── Add Slide Menu ────────────────────────────────────────────
// Menu dimensions for positioning calculations
const ADD_SLIDE_MENU_WIDTH = 200;
const ADD_SLIDE_MENU_HEIGHT = 296; // 8 items × 32px + padding
const VIEWPORT_PADDING = 12;

// Compact, design-system-aligned menu
function AddSlideMenu({
  onAdd,
  onClose,
  anchorRef,
}: {
  onAdd: (template: SlideTemplate) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    playSound('expand');
  }, []);

  // Viewport-aware positioning
  useEffect(() => {
    if (!anchorRef.current || !mounted) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Position above the button, aligned to left edge
    let x = rect.left;
    let y = rect.top - ADD_SLIDE_MENU_HEIGHT - 8;

    // If menu would go off the top, position below
    if (y < VIEWPORT_PADDING) {
      y = rect.bottom + 8;
    }

    // Horizontal bounds
    if (x + ADD_SLIDE_MENU_WIDTH + VIEWPORT_PADDING > viewportWidth) {
      x = viewportWidth - ADD_SLIDE_MENU_WIDTH - VIEWPORT_PADDING;
    }
    x = Math.max(VIEWPORT_PADDING, x);

    // Vertical bounds
    if (y + ADD_SLIDE_MENU_HEIGHT + VIEWPORT_PADDING > viewportHeight) {
      y = Math.max(VIEWPORT_PADDING, viewportHeight - ADD_SLIDE_MENU_HEIGHT - VIEWPORT_PADDING);
    }

    setAdjustedPosition({ x, y });
  }, [anchorRef, mounted]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, SLIDE_TEMPLATES.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          playSound('pop');
          onAdd(SLIDE_TEMPLATES[focusedIndex].template);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, onAdd, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <motion.div
      ref={menuRef}
      initial={contextMenuVariants.initial}
      animate={contextMenuVariants.animate}
      exit={contextMenuVariants.exit}
      transition={prefersReducedMotion ? { duration: 0.1 } : SPRING.snappy}
      style={{
        position: 'fixed',
        top: adjustedPosition.y,
        left: adjustedPosition.x,
        width: ADD_SLIDE_MENU_WIDTH,
        background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95))',
        backdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
        WebkitBackdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
        borderRadius: 'var(--radius-md, 14px)',
        border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
        boxShadow: 'var(--shadow-lg, 0 20px 40px rgba(0, 0, 0, 0.15))',
        zIndex: 9999,
        padding: 4,
        transformOrigin: 'bottom left',
      }}
    >
      {SLIDE_TEMPLATES.map(({ template, icon, label }, index) => {
        const isHovered = hoveredIndex === index;
        const isFocused = focusedIndex === index;
        const isActive = isHovered || isFocused;

        return (
          <motion.button
            key={template}
            onClick={() => {
              playSound('pop');
              onAdd(template);
            }}
            onMouseEnter={() => {
              setHoveredIndex(index);
              setFocusedIndex(index);
            }}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setFocusedIndex(index)}
            initial={false}
            animate={{
              backgroundColor: isActive ? 'var(--color-accent-primary, #ff7722)' : 'transparent',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.08 }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm, 8px)',
              cursor: 'pointer',
              textAlign: 'left',
              outline: 'none',
              color: isActive ? '#fff' : 'var(--color-text-secondary, #555)',
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              flexShrink: 0,
              opacity: isActive ? 1 : 0.7,
            }}>
              {React.cloneElement(icon as React.ReactElement, { size: 14, strokeWidth: 1.5 })}
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              flex: 1,
            }}>
              {label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>,
    document.body
  );
}

// ─── Theme Picker ──────────────────────────────────────────────
function ThemePicker({
  currentThemeId,
  onSelect,
  onClose,
}: {
  currentThemeId: string;
  onSelect: (themeId: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 8,
        background: 'var(--color-bg-elevated, #fff)',
        borderRadius: 12,
        border: '1px solid var(--color-border-default)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        padding: 12,
        zIndex: 100,
        width: 280,
      }}
    >
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 8,
      }}>
        Theme
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {themeIds.map((themeId) => {
          const theme = themes[themeId];
          const isSelected = themeId === currentThemeId;
          return (
            <button
              key={themeId}
              onClick={(e) => { e.stopPropagation(); onSelect(themeId); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: isSelected ? 'var(--color-bg-subtle)' : 'transparent',
                border: isSelected ? '1px solid var(--color-accent-primary)' : '1px solid transparent',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {/* Color preview */}
              <div style={{
                width: 40, height: 24, borderRadius: 4,
                background: theme.colors.background,
                border: '1px solid var(--color-border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: theme.colors.accent,
                }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}>
                  {theme.name}
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                  {theme.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Main Slides Editor ────────────────────────────────────────
export function GoOSSlidesEditor({
  file,
  onClose,
  onMinimize,
  onMaximize,
  onUpdate,
  isActive = true,
  zIndex = 100,
  isMaximized = false,
}: GoOSSlidesEditorProps) {
  const parsedContent = useMemo(() => {
    try {
      if (file.content) return JSON.parse(file.content) as SlidesContent;
    } catch { /* use default */ }
    return getDefaultSlidesContent();
  }, [file.content]);

  const [title, setTitle] = useState(file.title);
  const [slidesContent, setSlidesContent] = useState<SlidesContent>(parsedContent);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(file.updatedAt);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const addSlideButtonRef = useRef<HTMLButtonElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  const theme = getTheme(slidesContent.themeId);
  const selectedSlide = slidesContent.slides[selectedSlideIndex];

  useEffect(() => { playSound('whoosh'); }, []);

  // Auto-save
  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({ title, content: JSON.stringify(slidesContent), updatedAt: new Date() });
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  }, [title, slidesContent, onUpdate]);

  useEffect(() => {
    const currentContent = JSON.stringify(slidesContent);
    if (currentContent !== file.content || title !== file.title) triggerSave();
  }, [slidesContent, title, file.content, file.title, triggerSave]);

  const handlePublishChange = (status: PublishStatus) => onUpdate({ status });

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const startDrag = (event: React.PointerEvent) => {
    if (!isMaximized) dragControls.start(event);
  };

  // ─── Slide Operations ──────────────────────────────────
  const addSlide = (template: SlideTemplate, afterIndex?: number) => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      template,
      content: createSlideContent(template),
    };
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : slidesContent.slides.length;
    const newSlides = [...slidesContent.slides];
    newSlides.splice(insertIndex, 0, newSlide);
    setSlidesContent((prev) => ({ ...prev, slides: newSlides }));
    setSelectedSlideIndex(insertIndex);
    setShowAddMenu(false);
  };

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    setSlidesContent((prev) => ({
      ...prev,
      slides: prev.slides.map((s, i) => i === index ? { ...s, ...updates } : s),
    }));
  };

  const deleteSlide = (index: number) => {
    if (slidesContent.slides.length <= 1) return;
    setSlidesContent((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
    setSelectedSlideIndex(Math.max(0, index - 1));
  };

  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slidesContent.slides.length) return;
    const newSlides = [...slidesContent.slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);
    setSlidesContent((prev) => ({ ...prev, slides: newSlides }));
    setSelectedSlideIndex(toIndex);
  };

  const duplicateSlide = (index: number) => {
    const slide = slidesContent.slides[index];
    const newSlide: Slide = {
      ...slide,
      id: crypto.randomUUID(),
    };
    const newSlides = [...slidesContent.slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlidesContent((prev) => ({ ...prev, slides: newSlides }));
    setSelectedSlideIndex(index + 1);
  };

  const setTheme = (themeId: string) => {
    setSlidesContent((prev) => ({ ...prev, themeId }));
    setShowThemePicker(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresenting) return;
      if (e.key === 'ArrowUp' && selectedSlideIndex > 0) {
        setSelectedSlideIndex(selectedSlideIndex - 1);
      } else if (e.key === 'ArrowDown' && selectedSlideIndex < slidesContent.slides.length - 1) {
        setSelectedSlideIndex(selectedSlideIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSlideIndex, slidesContent.slides.length, isPresenting]);

  if (isPresenting) {
    return (
      <PresentationView
        note={{
          id: file.id,
          title: title,
          content: slidesContent.slides.map((s) => {
            // Convert slide to HTML for parser
            if (s.template === 'title') {
              return `<h1>${s.content.heading || ''}</h1><p>${s.content.subheading || ''}</p>`;
            }
            if (s.template === 'section') {
              return `<h1>${s.content.heading || ''}</h1>`;
            }
            if (s.template === 'content') {
              return `<h2>${s.content.heading || ''}</h2><p>${s.content.body || ''}</p>`;
            }
            if (s.template === 'quote') {
              return `<blockquote>${s.content.quote || ''}\n— ${s.content.attribution || ''}</blockquote>`;
            }
            if (s.template === 'list') {
              return `<h2>${s.content.heading || ''}</h2><ul>${(s.content.items || []).map((i) => `<li>${i}</li>`).join('')}</ul>`;
            }
            if (s.template === 'stat') {
              return `<p>[stat: ${s.content.stat_value || '0'}: ${s.content.stat_label || ''}]</p>`;
            }
            if (s.template === 'image') {
              return `<img src="${s.content.image || ''}" alt="${s.content.caption || ''}" />`;
            }
            if (s.template === 'image-text') {
              return `<h2>${s.content.heading || ''}</h2><p>${s.content.body || ''}</p><img src="${s.content.image || ''}" />`;
            }
            return '';
          }).join('<hr>'),
        }}
        author={{ username: 'user', name: slidesContent.author || 'Presenter' }}
        themeId={slidesContent.themeId as ThemeId}
        onClose={() => setIsPresenting(false)}
      />
    );
  }

  return (
    <motion.div
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={false}
      dragElastic={0}
      dragMomentum={false}
      initial={prefersReducedMotion ? ANIMATION.reducedInitial : ANIMATION.initial}
      animate={prefersReducedMotion ? ANIMATION.reducedAnimate : ANIMATION.animate}
      exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
      transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
      style={{
        position: 'fixed',
        top: isMaximized ? 'var(--menubar-height, 40px)' : '5%',
        left: isMaximized ? 0 : '50%',
        x: isMaximized ? 0 : '-50%',
        width: isMaximized ? '100%' : 'min(1400px, 95vw)',
        height: isMaximized
          ? 'calc(100vh - var(--menubar-height, 40px) - var(--zen-dock-offset, 80px))'
          : 'min(85vh, 900px)',
        minWidth: 800,
        background: WINDOW.background,
        border: isMaximized ? WINDOW.borderMaximized : WINDOW.border,
        borderRadius: isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius,
        boxShadow: isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,
      }}
    >
      {/* Title Bar */}
      <div
        onPointerDown={startDrag}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${TITLE_BAR.paddingX}px`,
          height: TITLE_BAR.height,
          background: TITLE_BAR.background,
          borderBottom: TITLE_BAR.borderBottom,
          gap: 12,
          cursor: isMaximized ? 'default' : 'grab',
          flexShrink: 0,
          touchAction: 'none',
        }}
      >
        <TrafficLights onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} isMaximized={isMaximized} variant="macos" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 16 }}>📽️</span>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingTitle(false); }}
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: 'var(--font-size-md, 14px)',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-base)',
                border: '1.5px solid var(--color-accent-primary)',
                borderRadius: 6,
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              style={{
                fontSize: TITLE_BAR.titleFontSize,
                fontWeight: TITLE_BAR.titleFontWeight,
                fontFamily: 'var(--font-body)',
                color: TITLE_BAR.titleColor,
                opacity: TITLE_BAR.titleOpacityActive,
                cursor: 'text',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title="Click to edit title"
            >
              {title || 'Untitled Presentation'}
            </span>
          )}
          <GoOSPublishBadge status={file.status} />
        </div>

        {/* Theme button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            <Palette size={14} />
            {theme.name}
          </button>
          <AnimatePresence>
            {showThemePicker && (
              <ThemePicker
                currentThemeId={slidesContent.themeId}
                onSelect={setTheme}
                onClose={() => setShowThemePicker(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Present button */}
        <button
          onClick={() => setIsPresenting(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            color: '#fff',
            background: 'var(--color-accent-primary)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          <Play size={14} />
          Present
        </button>

        <GoOSAutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
        <GoOSPublishToggle status={file.status} onChange={handlePublishChange} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Slides Sidebar */}
        <div style={{
          width: 200,
          background: 'var(--color-bg-subtle)',
          borderRight: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 12,
          }}>
            {slidesContent.slides.map((slide, index) => (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                index={index}
                isSelected={index === selectedSlideIndex}
                theme={theme}
                onSelect={() => setSelectedSlideIndex(index)}
                onMoveUp={() => moveSlide(index, index - 1)}
                onMoveDown={() => moveSlide(index, index + 1)}
                onDuplicate={() => duplicateSlide(index)}
                onDelete={() => deleteSlide(index)}
                canMoveUp={index > 0}
                canMoveDown={index < slidesContent.slides.length - 1}
              />
            ))}
          </div>

          {/* Add Slide Button */}
          <div style={{ padding: 12, borderTop: '1px solid var(--color-border-subtle)' }}>
            <motion.button
              ref={addSlideButtonRef}
              onClick={() => {
                playSound('click');
                setShowAddMenu(!showAddMenu);
              }}
              whileHover={{ scale: 1.02, borderColor: 'var(--color-accent-primary)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: showAddMenu
                  ? 'var(--color-accent-primary)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,250,0.9) 100%)',
                border: showAddMenu
                  ? '1px solid var(--color-accent-primary)'
                  : '1px dashed var(--color-border-default)',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: showAddMenu ? '#fff' : 'var(--color-text-secondary)',
                transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                boxShadow: showAddMenu
                  ? '0 4px 12px rgba(255, 119, 34, 0.3)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <motion.div
                animate={{ rotate: showAddMenu ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus size={16} strokeWidth={2.5} />
              </motion.div>
              Add Slide
            </motion.button>
          </div>
        </div>

        {/* Add Slide Menu Portal */}
        <AnimatePresence>
          {showAddMenu && (
            <AddSlideMenu
              onAdd={(template) => addSlide(template, selectedSlideIndex)}
              onClose={() => setShowAddMenu(false)}
              anchorRef={addSlideButtonRef}
            />
          )}
        </AnimatePresence>

        {/* Slide Preview */}
        <div style={{
          flex: 1,
          background: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          overflow: 'hidden',
        }}>
          <div style={{
            width: '100%',
            maxWidth: 960,
            aspectRatio: '16 / 9',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}>
            {selectedSlide && (
              <SlideRenderer slide={selectedSlide} theme={theme} size="full" />
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div style={{
          width: 320,
          background: 'var(--color-bg-base)',
          borderLeft: '1px solid var(--color-border-subtle)',
          overflow: 'auto',
        }}>
          {selectedSlide && (
            <SlideEditorPanel
              slide={selectedSlide}
              onUpdate={(updates) => updateSlide(selectedSlideIndex, updates)}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        borderTop: '1px solid rgba(23, 20, 18, 0.06)',
        background: 'rgba(23, 20, 18, 0.02)',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-muted)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <span>{slidesContent.slides.length} slides</span>
          <span>Theme: {theme.name}</span>
        </div>
        <span style={{ fontSize: 11, opacity: 0.6 }}>goOS Slides</span>
      </div>
    </motion.div>
  );
}

export default GoOSSlidesEditor;
