'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BlockData, TabData } from '@/types';

// Template block type without id
interface TemplateBlock {
  type: string;
  data: Record<string, unknown>;
  order: number;
}

// Template tab type without id
interface TemplateTab {
  label: string;
  icon?: string;
  order: number;
  blocks: TemplateBlock[];
}

// Template definitions
export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'portfolio' | 'personal' | 'business' | 'creative';
  preview?: string;
  windowTitle: string;
  windowSubtitle?: string;
  useTabs?: boolean;
  tabs?: TemplateTab[];
  blocks?: TemplateBlock[];
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
  // Portfolio templates
  {
    id: 'about-me',
    name: 'About Me',
    description: 'Personal intro with timeline',
    icon: '👋',
    category: 'portfolio',
    windowTitle: 'About Me',
    windowSubtitle: 'A little about myself',
    blocks: [
      { type: 'text', data: { content: 'Hello! I\'m a creative professional passionate about design and technology.' }, order: 0 },
      { type: 'divider', data: { style: 'line' }, order: 1 },
      { type: 'timeline', data: { items: [
        { date: '2024', title: 'Current Role', subtitle: 'Company Name' },
        { date: '2022', title: 'Previous Role', subtitle: 'Company Name' },
      ]}, order: 2 },
      { type: 'social', data: { profiles: [
        { platform: 'twitter', url: '' },
        { platform: 'linkedin', url: '' },
        { platform: 'github', url: '' },
      ]}, order: 3 },
    ],
  },
  {
    id: 'project-showcase',
    name: 'Project',
    description: 'Showcase with details',
    icon: '🚀',
    category: 'portfolio',
    windowTitle: 'Project Name',
    windowSubtitle: 'Project tagline',
    blocks: [
      { type: 'image', data: { url: '', caption: 'Project screenshot', aspectRatio: '16:9' }, order: 0 },
      { type: 'text', data: { content: 'A brief description of what this project is.' }, order: 1 },
      { type: 'details', data: { items: [
        { label: 'Role', value: 'Lead Designer' },
        { label: 'Timeline', value: '3 months' },
      ]}, order: 2 },
      { type: 'buttons', data: { buttons: [
        { label: 'View Live', url: '#', style: 'primary', newTab: true },
      ]}, order: 3 },
    ],
  },
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Deep dive with tabs',
    icon: '📋',
    category: 'portfolio',
    windowTitle: 'Case Study',
    windowSubtitle: 'Project deep dive',
    useTabs: true,
    tabs: [
      {
        label: 'Overview',
        icon: '📋',
        order: 0,
        blocks: [
          { type: 'text', data: { content: 'A comprehensive look at the project.' }, order: 0 },
          { type: 'stats', data: { items: [
            { value: '50', suffix: '%', label: 'Improvement' },
            { value: '10', suffix: 'k', label: 'Users' },
          ]}, order: 1 },
        ],
      },
      {
        label: 'Process',
        icon: '⚙️',
        order: 1,
        blocks: [
          { type: 'case-study', data: { sections: {
            challenge: 'Describe the challenge.',
            solution: 'The solution implemented.',
          }}, order: 0 },
        ],
      },
    ],
  },
  // Personal
  {
    id: 'photo-album',
    name: 'Photos',
    description: 'Gallery with captions',
    icon: '📷',
    category: 'personal',
    windowTitle: 'Photos',
    windowSubtitle: 'My favorite shots',
    blocks: [
      { type: 'gallery', data: { columns: 3, images: [], expandable: true }, order: 0 },
      { type: 'text', data: { content: 'A collection of my favorite photographs.' }, order: 1 },
    ],
  },
  {
    id: 'reading-list',
    name: 'Reading',
    description: 'Books you recommend',
    icon: '📚',
    category: 'personal',
    windowTitle: 'Reading List',
    windowSubtitle: 'Books I love',
    blocks: [
      { type: 'text', data: { content: 'Books that shaped my thinking.' }, order: 0 },
      { type: 'book', data: { books: [
        { cover: '', title: 'Book Title', subtitle: 'Author Name' },
      ]}, order: 1 },
    ],
  },
  {
    id: 'now-page',
    name: 'Now',
    description: 'What you\'re up to',
    icon: '📍',
    category: 'personal',
    windowTitle: 'Now',
    windowSubtitle: 'What I\'m up to',
    blocks: [
      { type: 'text', data: { content: 'This is what I\'m focused on right now.' }, order: 0 },
      { type: 'list', data: { style: 'check', items: ['Working on...', 'Learning...'] }, order: 1 },
    ],
  },
  // Business
  {
    id: 'services',
    name: 'Services',
    description: 'What you offer',
    icon: '💼',
    category: 'business',
    windowTitle: 'Services',
    windowSubtitle: 'How I can help',
    blocks: [
      { type: 'text', data: { content: 'I offer a range of services.' }, order: 0 },
      { type: 'stats', data: { items: [
        { value: '50', suffix: '+', label: 'Projects' },
        { value: '5', label: 'Years Exp.' },
      ]}, order: 1 },
    ],
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Client quotes',
    icon: '💬',
    category: 'business',
    windowTitle: 'Testimonials',
    windowSubtitle: 'What people say',
    blocks: [
      { type: 'testimonial', data: { testimonials: [
        { quote: 'Working with them was a pleasure!', name: 'Client Name', title: 'CEO' },
      ], style: 'cards' }, order: 0 },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    description: 'How to reach you',
    icon: '✉️',
    category: 'business',
    windowTitle: 'Contact',
    windowSubtitle: 'Let\'s connect',
    blocks: [
      { type: 'text', data: { content: 'I\'d love to hear from you!' }, order: 0 },
      { type: 'details', data: { items: [
        { label: 'Email', value: 'your@email.com' },
        { label: 'Location', value: 'City, Country' },
      ]}, order: 1 },
    ],
  },
  // Creative
  {
    id: 'music',
    name: 'Music',
    description: 'Share playlists',
    icon: '🎵',
    category: 'creative',
    windowTitle: 'Music',
    windowSubtitle: 'What I\'m listening to',
    blocks: [
      { type: 'embed', data: { embedType: 'spotify', url: '', height: 380 }, order: 0 },
    ],
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Showcase content',
    icon: '🎬',
    category: 'creative',
    windowTitle: 'Video',
    windowSubtitle: 'Watch this',
    blocks: [
      { type: 'video', data: { url: '', embedType: 'youtube', aspectRatio: '16:9' }, order: 0 },
    ],
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch',
    icon: '✨',
    category: 'creative',
    windowTitle: 'New Item',
    blocks: [],
  },
];

const TEMPLATE_CATEGORIES = [
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
  { id: 'personal', label: 'Personal', icon: '👤' },
  { id: 'business', label: 'Business', icon: '📊' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
] as const;

interface ItemTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: ItemTemplate) => void;
}

export function ItemTemplatesModal({
  isOpen,
  onClose,
  onSelect,
}: ItemTemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('portfolio');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const filteredTemplates = ITEM_TEMPLATES.filter(
    t => t.category === selectedCategory
  );

  const handleSelect = (template: ItemTemplate) => {
    onSelect(template);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[500]"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px) saturate(150%)',
              WebkitBackdropFilter: 'blur(8px) saturate(150%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-[501] flex flex-col"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 520,
              maxHeight: 'calc(100vh - 100px)',
              borderRadius: 14,
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'blur(72px) saturate(200%)',
              WebkitBackdropFilter: 'blur(72px) saturate(200%)',
              boxShadow: `
                0 0 0 0.5px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.12) inset,
                0 40px 100px -20px rgba(0, 0, 0, 0.45),
                0 0 1px rgba(0, 0, 0, 0.3)
              `,
              overflow: 'hidden',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '0.5px solid var(--border-light)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    New Item
                  </h2>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginTop: 2,
                    }}
                  >
                    Choose a template to get started
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full transition-colors"
                  style={{
                    width: 24,
                    height: 24,
                    background: 'var(--border-light)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Category tabs */}
              <div
                className="flex gap-1 mt-4"
                style={{
                  padding: 3,
                  borderRadius: 8,
                  background: 'var(--border-light)',
                }}
              >
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      background: selectedCategory === cat.id
                        ? 'var(--bg-elevated)'
                        : 'transparent',
                      color: selectedCategory === cat.id
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      boxShadow: selectedCategory === cat.id
                        ? '0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)'
                        : 'none',
                    }}
                  >
                    <span style={{ fontSize: 11 }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Templates grid */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: 16 }}
            >
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: 'repeat(3, 1fr)',
                }}
              >
                {filteredTemplates.map((template, index) => (
                  <motion.button
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                    className="flex flex-col items-center text-center transition-all"
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      background: hoveredTemplate === template.id
                        ? 'linear-gradient(180deg, rgba(0,122,255,0.08) 0%, rgba(0,122,255,0.04) 100%)'
                        : 'transparent',
                      border: '0.5px solid',
                      borderColor: hoveredTemplate === template.id
                        ? 'rgba(0,122,255,0.3)'
                        : 'var(--border-light)',
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.03,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div
                      className="flex items-center justify-center rounded-xl mb-3"
                      style={{
                        width: 44,
                        height: 44,
                        fontSize: 22,
                        background: hoveredTemplate === template.id
                          ? 'linear-gradient(180deg, #007AFF 0%, #0066CC 100%)'
                          : 'var(--bg-elevated)',
                        boxShadow: hoveredTemplate === template.id
                          ? '0 4px 12px -2px rgba(0,122,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                          : '0 0.5px 1px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.04)',
                      }}
                      animate={{
                        scale: hoveredTemplate === template.id ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.15 }}
                    >
                      {template.icon}
                    </motion.div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {template.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        marginTop: 2,
                        lineHeight: 1.3,
                      }}
                    >
                      {template.description}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-center"
              style={{
                height: 40,
                borderTop: '0.5px solid var(--border-light)',
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.02) 100%)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                }}
              >
                Templates are starting points — customize everything
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper function to create item data from template
export function createItemFromTemplate(template: ItemTemplate): {
  windowTitle: string;
  windowSubtitle?: string;
  useTabs: boolean;
  tabs: TabData[];
  blocks: BlockData[];
} {
  const generateId = () => Math.random().toString(36).substring(2, 9);

  let tabs: TabData[] = [];
  let blocks: BlockData[] = [];

  if (template.useTabs && template.tabs) {
    tabs = template.tabs.map((tab, index) => ({
      id: generateId(),
      label: tab.label,
      icon: tab.icon,
      order: index,
      blocks: (tab.blocks || []).map((block, blockIndex) => ({
        ...block,
        id: generateId(),
        order: blockIndex,
      })) as BlockData[],
    }));
  } else if (template.blocks) {
    blocks = template.blocks.map((block, index) => ({
      ...block,
      id: generateId(),
      order: index,
    })) as BlockData[];
  }

  return {
    windowTitle: template.windowTitle,
    windowSubtitle: template.windowSubtitle,
    useTabs: template.useTabs || false,
    tabs,
    blocks,
  };
}
