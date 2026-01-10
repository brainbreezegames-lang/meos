'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { EditProvider, useEditContextSafe } from '@/contexts/EditContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { EditableInfoWindow } from '@/components/desktop/EditableInfoWindow';
import { EditableDesktopItem } from '@/components/desktop/EditableDesktopItem';
import { BackgroundPanel } from '@/components/desktop/BackgroundPanel';
import { SaveIndicator, Toast } from '@/components/editing/SaveIndicator';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import type { DesktopItem, Desktop } from '@/types';

// Background context for demo
interface BackgroundContextType {
  customBackground: string | null;
  setCustomBackground: (url: string | null) => void;
  showBackgroundPanel: boolean;
  setShowBackgroundPanel: (show: boolean) => void;
}
const BackgroundContext = createContext<BackgroundContextType | null>(null);
function useBackgroundContext() {
  const ctx = useContext(BackgroundContext);
  if (!ctx) throw new Error('useBackgroundContext must be used within provider');
  return ctx;
}

// Background images that rotate
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2560&h=1440&fit=crop&q=90',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2560&h=1440&fit=crop&q=90',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2560&h=1440&fit=crop&q=90',
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=2560&h=1440&fit=crop&q=90',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2560&h=1440&fit=crop&q=90',
];

// Desktop items with new block system
const DEMO_ITEMS: DesktopItem[] = [
  {
    id: 'item-1',
    desktopId: 'demo',
    label: 'About Me',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    positionX: 12,
    positionY: 18,
    windowTitle: 'About Me',
    windowSubtitle: 'Designer & Developer',
    windowHeaderImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    windowDescription: '',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: true,
    tabs: [
      {
        id: 'tab-about',
        label: 'About',
        order: 0,
        blocks: [
          { id: 'b1', type: 'text', order: 0, data: { content: "Hey there! I'm a creative developer passionate about building beautiful digital experiences that feel alive.\n\nThis is MeOS — my personal web desktop where I showcase my work, thoughts, and connect with others." } },
          { id: 'b2', type: 'details', order: 1, data: { items: [
            { label: 'Location', value: 'San Francisco, CA' },
            { label: 'Experience', value: '5+ years' },
            { label: 'Focus', value: 'Product Design' },
          ] } },
          { id: 'b3', type: 'social', order: 2, data: { profiles: [
            { platform: 'twitter', url: 'https://twitter.com' },
            { platform: 'linkedin', url: 'https://linkedin.com' },
            { platform: 'github', url: 'https://github.com' },
          ] } },
        ],
      },
      {
        id: 'tab-cv',
        label: 'CV',
        order: 1,
        blocks: [
          { id: 'b4', type: 'timeline', order: 0, data: { items: [
            { date: '2024', title: 'Senior Designer', subtitle: 'Anthropic' },
            { date: '2021-2024', title: 'Product Designer', subtitle: 'Figma' },
            { date: '2019-2021', title: 'UI Designer', subtitle: 'Startup Co' },
          ] } },
        ],
      },
    ],
    blocks: [],
    zIndex: 0,
    order: 0,
  },
  {
    id: 'item-2',
    desktopId: 'demo',
    label: 'Projects',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
    positionX: 28,
    positionY: 14,
    windowTitle: 'My Projects',
    windowSubtitle: 'Selected Work',
    windowHeaderImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
    windowDescription: '',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'p1', type: 'stats', order: 0, data: { items: [
        { value: '4', label: 'Active' },
        { value: '27', label: 'Completed' },
        { value: '12', label: 'Open Source' },
      ] } },
      { id: 'p2', type: 'product', order: 1, data: { products: [
        { image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop', name: 'DevTools Pro', description: 'A suite of developer productivity tools', url: 'https://github.com', status: 'active', metrics: '10k users' },
        { image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&h=200&fit=crop', name: 'DesignKit', description: 'Open source design system for React', url: 'https://github.com', status: 'active', metrics: '5k stars' },
      ] } },
      { id: 'p3', type: 'buttons', order: 2, data: { buttons: [
        { label: 'View All on GitHub', url: 'https://github.com', style: 'primary', newTab: true },
      ] } },
    ],
    zIndex: 0,
    order: 1,
  },
  {
    id: 'item-3',
    desktopId: 'demo',
    label: 'Photography',
    thumbnailUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop',
    positionX: 68,
    positionY: 22,
    windowTitle: 'Photography',
    windowSubtitle: 'Moments Captured',
    windowHeaderImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop',
    windowDescription: '',
    windowWidth: 520,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'ph1', type: 'text', order: 0, data: { content: "Photography is how I see the world when I'm not behind a screen. I'm drawn to street photography, architecture, and those fleeting golden hour moments." } },
      { id: 'ph2', type: 'gallery', order: 1, data: { columns: 2, expandable: true, images: [
        { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', caption: 'Mountain sunrise' },
        { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop', caption: 'Forest path' },
        { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', caption: 'Beach at dusk' },
        { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop', caption: 'Misty mountains' },
      ] } },
      { id: 'ph3', type: 'details', order: 2, data: { items: [
        { label: 'Camera', value: 'Fujifilm X-T4' },
        { label: 'Favorite Lens', value: '35mm f/1.4' },
      ] } },
    ],
    zIndex: 0,
    order: 2,
  },
  {
    id: 'item-4',
    desktopId: 'demo',
    label: 'Contact',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=200&h=200&fit=crop',
    positionX: 52,
    positionY: 55,
    windowTitle: 'Get in Touch',
    windowSubtitle: "Let's Connect",
    windowHeaderImage: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=400&fit=crop',
    windowDescription: '',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'c1', type: 'text', order: 0, data: { content: "I'm always open to discussing new projects, creative ideas, or opportunities to collaborate.\n\nWhether you have a question, want to work together, or just want to say hi — my inbox is open." } },
      { id: 'c2', type: 'callout', order: 1, data: { text: 'Currently accepting new clients for Q2 2024', style: 'success', icon: '✓' } },
      { id: 'c3', type: 'buttons', order: 2, data: { buttons: [
        { label: 'Email Me', url: 'mailto:hello@example.com', style: 'primary', newTab: false },
        { label: 'Twitter / X', url: 'https://twitter.com', style: 'secondary', newTab: true },
        { label: 'Schedule a Call', url: 'https://cal.com', style: 'ghost', newTab: true },
      ] } },
    ],
    zIndex: 0,
    order: 3,
  },
  {
    id: 'item-5',
    desktopId: 'demo',
    label: 'Writing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=200&fit=crop',
    positionX: 78,
    positionY: 48,
    windowTitle: 'Writing',
    windowSubtitle: 'Thoughts & Essays',
    windowHeaderImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop',
    windowDescription: '',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'w1', type: 'text', order: 0, data: { content: "I write about design, technology, and the creative process. Recent topics include the future of design tools, why constraints breed creativity, and lessons from building products used by millions." } },
      { id: 'w2', type: 'stats', order: 1, data: { items: [
        { value: '34', label: 'Posts' },
        { value: '2.4k', label: 'Subscribers' },
        { value: '98', suffix: '%', label: 'Open Rate' },
      ] } },
      { id: 'w3', type: 'quote', order: 2, data: { text: 'Design is not just what it looks like and feels like. Design is how it works.', attribution: 'Steve Jobs', style: 'large' } },
    ],
    zIndex: 0,
    order: 4,
  },
  {
    id: 'item-6',
    desktopId: 'demo',
    label: 'Reading',
    thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop',
    positionX: 24,
    positionY: 42,
    windowTitle: 'Bookshelf',
    windowSubtitle: 'Currently Reading',
    windowHeaderImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    windowDescription: '',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'bk1', type: 'book', order: 0, data: { books: [
        { title: 'The Design of Everyday Things', author: 'Don Norman', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop', status: 'reading', rating: 5, url: 'https://amazon.com' },
        { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop', status: 'completed', rating: 5 },
      ] } },
      { id: 'bk2', type: 'links', order: 1, data: { links: [
        { label: 'View full reading list on Goodreads', url: 'https://goodreads.com', description: '47 books read this year' },
      ] } },
    ],
    zIndex: 0,
    order: 5,
  },
  {
    id: 'item-7',
    desktopId: 'demo',
    label: 'Experiments',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    positionX: 88,
    positionY: 75,
    windowTitle: 'Experiments',
    windowSubtitle: 'Creative Playground',
    windowHeaderImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    windowDescription: '',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'e1', type: 'callout', order: 0, data: { text: 'This section features my creative experiments and side projects.', style: 'info', icon: '🧪' } },
      { id: 'e2', type: 'image', order: 1, data: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop', alt: 'Generative art experiment', caption: 'Generative art created with p5.js', expandable: true } },
    ],
    zIndex: 0,
    order: 6,
  },
  {
    id: 'item-8',
    desktopId: 'demo',
    label: 'Portfolio',
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop',
    positionX: 42,
    positionY: 75,
    windowTitle: 'Featured Work',
    windowSubtitle: 'Selected Projects',
    windowHeaderImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
    windowDescription: '',
    windowWidth: 520,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'pf1', type: 'carousel', order: 0, data: {
        items: [
          { image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', title: 'E-commerce Redesign', description: 'Complete checkout flow overhaul', url: 'https://dribbble.com' },
          { image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', title: 'Analytics Dashboard', description: 'Real-time data visualization', url: 'https://dribbble.com' },
          { image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop', title: 'Developer Tools', description: 'Code editor extension', url: 'https://dribbble.com' },
        ],
        autoplay: true,
        interval: 4000,
      } },
      { id: 'pf2', type: 'stats', order: 1, data: { items: [
        { value: '50+', label: 'Projects' },
        { value: '4.9', label: 'Rating', suffix: '★' },
        { value: '100%', label: 'On Time' },
      ] } },
    ],
    zIndex: 0,
    order: 7,
  },
  {
    id: 'item-9',
    desktopId: 'demo',
    label: 'Testimonials',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
    positionX: 8,
    positionY: 52,
    windowTitle: 'What People Say',
    windowSubtitle: 'Client Testimonials',
    windowHeaderImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop',
    windowDescription: '',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 't1', type: 'testimonial', order: 0, data: { style: 'cards', testimonials: [
        { quote: 'Working with them was an absolute pleasure. They delivered beyond our expectations.', name: 'Sarah Chen', title: 'CEO', company: 'TechStart', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
        { quote: 'Exceptional attention to detail and a deep understanding of user experience.', name: 'Marcus Johnson', title: 'Product Lead', company: 'DesignCo', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
      ] } },
    ],
    zIndex: 0,
    order: 8,
  },
  {
    id: 'item-10',
    desktopId: 'demo',
    label: 'Skills',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop',
    positionX: 8,
    positionY: 78,
    windowTitle: 'Technical Skills',
    windowSubtitle: 'Proficiency Overview',
    windowHeaderImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
    windowDescription: '',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'sk1', type: 'table', order: 0, data: {
        headers: ['Skill', 'Level', 'Years'],
        rows: [
          ['React / Next.js', 'Expert', '5+'],
          ['TypeScript', 'Expert', '4+'],
          ['Node.js', 'Advanced', '4+'],
          ['Python', 'Intermediate', '3+'],
        ],
        striped: true,
      } },
      { id: 'sk2', type: 'list', order: 1, data: { style: 'check', items: [
        { text: 'System Design & Architecture', checked: true },
        { text: 'CI/CD & DevOps', checked: true },
        { text: 'Machine Learning (learning)', checked: false },
      ] } },
    ],
    zIndex: 0,
    order: 9,
  },
];

// Create demo desktop
const DEMO_DESKTOP: Desktop = {
  id: 'demo',
  userId: 'demo-user',
  backgroundUrl: null,
  backgroundPosition: 'cover',
  backgroundOverlay: null,
  theme: 'light',
  title: 'Demo Desktop',
  description: 'Experience MeOS with seamless editing',
  ogImageUrl: null,
  isPublic: true,
  items: DEMO_ITEMS,
  dockItems: [
    { id: 'dock-1', desktopId: 'demo', icon: '🏠', label: 'Home', actionType: 'url', actionValue: '/', order: 0 },
    { id: 'dock-2', desktopId: 'demo', icon: '📧', label: 'Email', actionType: 'email', actionValue: 'hello@example.com', order: 1 },
    { id: 'dock-3', desktopId: 'demo', icon: '💼', label: 'LinkedIn', actionType: 'url', actionValue: 'https://linkedin.com', order: 2 },
    { id: 'dock-4', desktopId: 'demo', icon: '🐙', label: 'GitHub', actionType: 'url', actionValue: 'https://github.com', order: 3 },
    { id: 'dock-5', desktopId: 'demo', icon: '🐦', label: 'Twitter', actionType: 'url', actionValue: 'https://twitter.com', order: 4 },
  ],
};

// Theme-aware Dock Icon Component
interface DockIconProps {
  item: typeof DEMO_DESKTOP.dockItems[0];
  mouseX: ReturnType<typeof useMotionValue<number>>;
}

function DockIcon({ item, mouseX }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { themeInfo } = useTheme();
  const isDark = themeInfo.isDark;

  const baseSize = 48;
  const maxSize = 72;
  const distance = 140;

  const springConfig = { mass: 0.1, stiffness: 150, damping: 12 };

  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceFromMouse,
    [-distance, 0, distance],
    [baseSize, maxSize, baseSize]
  );
  const width = useSpring(widthSync, springConfig);

  const iconSizeSync = useTransform(
    distanceFromMouse,
    [-distance, 0, distance],
    [24, 36, 24]
  );
  const iconSize = useSpring(iconSizeSync, springConfig);

  const handleClick = () => {
    if (item.actionType === 'url') {
      if (item.actionValue === '/') {
        window.location.href = item.actionValue;
      } else {
        window.open(item.actionValue, '_blank');
      }
    } else if (item.actionType === 'email') {
      window.location.href = `mailto:${item.actionValue}`;
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center cursor-pointer"
    >
      {/* Tooltip - Theme aware */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-1/2 pointer-events-none z-10"
            style={{ bottom: 'calc(100% + 6px)' }}
            initial={{ opacity: 0, y: 8, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 4, x: '-50%' }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="px-2.5 py-1 rounded-md whitespace-nowrap"
              style={{
                background: 'var(--bg-tooltip)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span
                className="text-[11px] font-medium"
                style={{ color: 'var(--text-on-dark)' }}
              >
                {item.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon button - Theme aware */}
      <motion.button
        onClick={handleClick}
        className="w-full h-full rounded-xl flex items-center justify-center"
        style={{
          background: isDark
            ? 'linear-gradient(145deg, rgba(60, 60, 70, 0.9) 0%, rgba(40, 40, 50, 0.85) 100%)'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 245, 0.88) 100%)',
          boxShadow: isDark
            ? `0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : `0 1px 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.07), 0 4px 8px rgba(0, 0, 0, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <motion.span
          className="select-none"
          style={{ fontSize: iconSize }}
        >
          {item.icon}
        </motion.span>
      </motion.button>
    </motion.div>
  );
}

// Theme-aware Dock Component
function Dock({ items }: { items: typeof DEMO_DESKTOP.dockItems }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      className="fixed bottom-3 left-1/2 z-[100]"
      style={{ x: '-50%' }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
    >
      <motion.div
        className="flex items-end gap-1 px-2 pb-2 pt-2"
        style={{
          borderRadius: '18px',
          background: 'var(--bg-dock)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          boxShadow: 'var(--shadow-dock)',
          border: '1px solid var(--border-glass-outer)',
        }}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {items.map((item) => (
          <DockIcon key={item.id} item={item} mouseX={mouseX} />
        ))}
      </motion.div>
    </motion.div>
  );
}

// Theme-aware Menu Bar Component
function MenuBar() {
  const context = useEditContextSafe();
  const bgContext = useBackgroundContext();
  const { themeInfo } = useTheme();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleEditMode = () => {
    if (context) {
      context.setIsOwner(!context.isOwner);
    }
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[150] h-[28px] flex items-center justify-between px-4"
      style={{
        background: 'var(--bg-menubar)',
        backdropFilter: 'blur(50px) saturate(180%)',
        WebkitBackdropFilter: 'blur(50px) saturate(180%)',
        boxShadow: '0 0.5px 0 var(--border-light), inset 0 -0.5px 0 var(--border-glass-inner)',
      }}
      initial={{ y: -28 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-4">
        <span
          className="text-[13px] font-semibold"
          style={{
            color: 'var(--text-primary)',
            fontFamily: themeInfo.id === 'refined' ? 'var(--font-display)' : undefined,
          }}
        >
          MeOS
        </span>
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Demo Desktop</span>
      </div>
      <div className="flex items-center gap-3">
        {/* Background settings button */}
        <button
          onClick={() => bgContext.setShowBackgroundPanel(true)}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all"
          style={{
            color: 'var(--text-secondary)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Change Background"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>Background</span>
        </button>

        {/* Edit mode toggle */}
        <button
          onClick={toggleEditMode}
          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all"
          style={{
            background: context?.isOwner
              ? 'color-mix(in srgb, var(--accent-primary) 15%, transparent)'
              : 'var(--border-light)',
            color: context?.isOwner
              ? 'var(--accent-primary)'
              : 'var(--text-secondary)',
          }}
        >
          {context?.isOwner ? '✏️ Editing' : 'Try Editing'}
        </button>

        {/* Theme switcher */}
        <ThemeSwitcher />

        <div className="flex items-center gap-3">
          <svg className="w-[16px] h-[16px]" style={{ color: 'var(--text-primary)' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.8 18.3 10.9 18 12 18s2.2.3 3.5 1.1l1.4-1.4C15.3 16.6 13.7 16 12 16s-3.3.6-4.9 1.7zm-2.8-2.8l1.4 1.4C7.3 13.2 9.6 12 12 12s4.7 1.2 6.3 2.3l1.4-1.4C17.5 11.2 14.9 10 12 10s-5.5 1.2-7.7 2.9zM2 10.3l1.4 1.4C5.8 9.8 8.8 9 12 9s6.2.8 8.6 2.7l1.4-1.4C19.1 8 15.7 7 12 7s-7.1 1-10 3.3z"/>
          </svg>
          <svg className="w-[22px] h-[12px]" style={{ color: 'var(--text-primary)' }} viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" strokeWidth="1"/>
            <rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor"/>
            <path d="M23 4v4a2 2 0 001-1.73v-.54A2 2 0 0023 4z" fill="currentColor"/>
          </svg>
          <span className="text-[13px] font-medium tabular-nums ml-1" style={{ color: 'var(--text-primary)' }}>{time}</span>
        </div>
      </div>
    </motion.header>
  );
}

// Theme-aware Rotating Background
function RotatingBackground() {
  const { customBackground } = useBackgroundContext();
  const { themeInfo } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (customBackground) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setNextIndex((currentIndex + 1) % BACKGROUND_IMAGES.length);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
        setIsTransitioning(false);
      }, 1500);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentIndex, customBackground]);

  // Theme-aware overlay gradient
  const overlayGradient = themeInfo.isDark
    ? 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.45) 100%)'
    : 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.25) 100%)';

  if (customBackground) {
    return (
      <>
        <motion.div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${customBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{ background: overlayGradient }}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGES[currentIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGES[nextIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        animate={{ opacity: isTransitioning ? 1 : 0 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ background: overlayGradient }}
      />
    </>
  );
}

// Theme-aware Desktop Content
function DesktopContent() {
  const context = useEditContextSafe();
  const { themeInfo } = useTheme();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemOrder, setItemOrder] = useState<string[]>(() =>
    context?.desktop?.items.map(i => i.id) || []
  );
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemPosition, setNewItemPosition] = useState({ x: 50, y: 50 });

  const selectedItem = selectedItemId
    ? context?.desktop?.items.find(i => i.id === selectedItemId) || null
    : null;

  useEffect(() => {
    if (context?.desktop?.items) {
      setItemOrder(context.desktop.items.map(i => i.id));
    }
  }, [context?.desktop?.items]);

  const bringToFront = (id: string) => {
    setItemOrder(prev => [...prev.filter(i => i !== id), id]);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!context?.isOwner) return;

    const target = e.target as HTMLElement;
    if (!target.classList.contains('desktop-canvas')) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewItemPosition({ x, y });
    setShowNewItemModal(true);
  };

  const handleCreateItem = () => {
    if (!context?.desktop) return;

    const newItem: DesktopItem = {
      id: `item-${Date.now()}`,
      desktopId: 'demo',
      positionX: newItemPosition.x,
      positionY: newItemPosition.y,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
      label: 'New Item',
      windowTitle: 'New Item',
      windowSubtitle: '',
      windowHeaderImage: null,
      windowDescription: '',
      windowDetails: null,
      windowGallery: null,
      windowLinks: null,
      useTabs: false,
      tabs: [],
      blocks: [
        { id: `block-${Date.now()}`, type: 'text', data: { content: 'Click to edit this text...' }, order: 0 }
      ],
      zIndex: 0,
      order: context.desktop.items.length,
    };

    context.setDesktop({
      ...context.desktop,
      items: [...context.desktop.items, newItem],
    });

    setShowNewItemModal(false);
    setSelectedItemId(newItem.id);
    context.showToast('Item created', 'success');
  };

  const items = context?.desktop?.items || [];

  return (
    <>
      {/* Desktop Canvas */}
      <div
        className="desktop-canvas relative w-full h-full pt-[28px] pb-[80px] z-[10]"
        onDoubleClick={handleDoubleClick}
      >
        {items.map((item) => (
          <EditableDesktopItem
            key={item.id}
            item={item}
            onClick={() => setSelectedItemId(item.id)}
            zIndex={itemOrder.indexOf(item.id) + 1}
            onBringToFront={() => bringToFront(item.id)}
          />
        ))}

        {/* Double-click hint for owners - Theme aware */}
        {context?.isOwner && items.length < 3 && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[12px] font-medium pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            style={{
              background: 'var(--bg-tooltip)',
              color: 'var(--text-on-dark)',
            }}
          >
            Double-click anywhere to add an item
          </motion.div>
        )}
      </div>

      {/* Info Window */}
      <EditableInfoWindow
        item={selectedItem}
        onClose={() => setSelectedItemId(null)}
      />

      {/* New Item Modal - Theme aware */}
      <AnimatePresence>
        {showNewItemModal && (
          <>
            <motion.div
              className="fixed inset-0 z-[300]"
              style={{ background: 'var(--bg-overlay)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewItemModal(false)}
            />
            <motion.div
              className="fixed z-[301] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'var(--bg-glass-elevated)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: 'var(--shadow-window)',
                border: '1px solid var(--border-light)',
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: themeInfo.id === 'refined' ? 'var(--font-display)' : undefined,
                }}
              >
                Create New Item
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                A new item will be created at the clicked position.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewItemModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'var(--border-light)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-medium)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--border-light)'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateItem}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: 'var(--accent-primary)',
                    color: themeInfo.id === 'refined' ? '#0d0d0d' : '#fff',
                  }}
                >
                  Create Item
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dock */}
      <Dock items={DEMO_DESKTOP.dockItems} />

      {/* Save Indicator */}
      <SaveIndicator />
      <Toast />

      {/* Made with badge - Theme aware */}
      <motion.a
        href="/"
        className="fixed bottom-3 right-4 z-[50] px-3 py-1.5 rounded-full text-[10px] font-medium"
        style={{
          background: 'var(--bg-dock)',
          backdropFilter: 'blur(20px)',
          color: 'var(--text-on-image)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-glass-outer)',
        }}
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Made with MeOS
      </motion.a>
    </>
  );
}

// Demo Page Inner (needs access to background context)
function DemoPageInner() {
  const bgContext = useBackgroundContext();

  return (
    <main className="min-h-screen h-screen overflow-hidden relative">
      <RotatingBackground />
      <MenuBar />
      <DesktopContent />

      {/* Background Settings Panel */}
      <BackgroundPanel
        isOpen={bgContext.showBackgroundPanel}
        onClose={() => bgContext.setShowBackgroundPanel(false)}
        currentBackground={bgContext.customBackground}
        onBackgroundChange={bgContext.setCustomBackground}
      />
    </main>
  );
}

// Main Demo Page
export default function DemoPage() {
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);

  return (
    <ThemeProvider initialTheme="monterey">
      <BackgroundContext.Provider value={{
        customBackground,
        setCustomBackground,
        showBackgroundPanel,
        setShowBackgroundPanel,
      }}>
        <EditProvider initialDesktop={DEMO_DESKTOP} initialIsOwner={false} demoMode={true}>
          <DemoPageInner />
        </EditProvider>
      </BackgroundContext.Provider>
    </ThemeProvider>
  );
}
