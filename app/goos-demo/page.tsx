'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    Folder,
    Terminal,
    HardDrive,
    MessageCircle,
    Mail,
    StickyNote as StickyNoteIcon,
    Battery,
    Wifi,
    Camera,
    Gamepad2,
    FileText,
    Heart,
    X,
    Minus,
    Square,
    Music,
    Image as ImageIcon,
    Settings,
    Check,
    Sparkles,
    User,
    Briefcase,
    BookOpen,
    Award,
    Phone,
    Code,
    Palette,
    ExternalLink,
} from 'lucide-react';
import { EditProvider, useEditContextSafe } from '@/contexts/EditContext';
import { WindowProvider, useWindowContext } from '@/contexts/WindowContext';
import { WindowManager } from '@/components/desktop/MultiWindow';
import { EditableDesktopItem } from '@/components/desktop/EditableDesktopItem';
import { SaveIndicator, Toast } from '@/components/editing/SaveIndicator';
import type { DesktopItem, Desktop } from '@/types';

// ============================================
// ANIMATION CONSTANTS
// ============================================
const springSnappy = { type: "spring", damping: 20, stiffness: 400 };
const springGentle = { type: "spring", damping: 25, stiffness: 200 };
const easeOutQuart = [0.25, 1, 0.5, 1];

// ============================================
// DEMO ITEMS (From demo page, adapted for goOS)
// ============================================
const DEMO_ITEMS: DesktopItem[] = [
  {
    id: 'item-1',
    desktopId: 'goos-demo',
    label: 'About Me',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    positionX: 8,
    positionY: 12,
    windowTitle: 'Alex Chen',
    windowSubtitle: 'Product Designer & Developer',
    windowHeaderImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    windowDescription: '',
    windowWidth: 480,
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
          { id: 'b1', type: 'text', order: 0, data: { content: "Hey there! I'm a creative developer passionate about building beautiful digital experiences that feel alive.\n\nI design and build products that people love to use. Currently at Figma, previously Stripe & Airbnb. I believe great design is invisible — it just works." } },
          {
            id: 'b2', type: 'details', order: 1, data: {
              items: [
                { label: 'Location', value: 'San Francisco, CA' },
                { label: 'Experience', value: '8 years' },
                { label: 'Focus', value: 'Product Design' },
                { label: 'Status', value: 'Available for freelance' },
              ]
            }
          },
          {
            id: 'b3', type: 'social', order: 2, data: {
              profiles: [
                { platform: 'twitter', url: 'https://twitter.com' },
                { platform: 'linkedin', url: 'https://linkedin.com' },
                { platform: 'github', url: 'https://github.com' },
                { platform: 'dribbble', url: 'https://dribbble.com' },
              ]
            }
          },
        ],
      },
      {
        id: 'tab-experience',
        label: 'Experience',
        order: 1,
        blocks: [
          {
            id: 'b5', type: 'timeline', order: 0, data: {
              items: [
                { date: '2022 - Present', title: 'Senior Product Designer', subtitle: 'Figma', description: 'Leading design system initiatives' },
                { date: '2020 - 2022', title: 'Product Designer', subtitle: 'Stripe', description: 'Designed checkout flows' },
                { date: '2018 - 2020', title: 'UI Designer', subtitle: 'Airbnb', description: 'Host experience team' },
              ]
            }
          },
        ],
      },
    ],
    blocks: [],
    zIndex: 0,
    commentsEnabled: true,
    order: 0,
  },
  {
    id: 'item-3',
    desktopId: 'goos-demo',
    label: 'Projects',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
    positionX: 42,
    positionY: 15,
    windowTitle: 'My Projects',
    windowSubtitle: "Things I've Built",
    windowHeaderImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
    windowDescription: '',
    windowType: 'browser',
    windowWidth: 540,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      {
        id: 'pr1', type: 'stats', order: 0, data: {
          items: [
            { value: '4', label: 'Active' },
            { value: '27', label: 'Shipped' },
            { value: '12', label: 'Open Source' },
          ]
        }
      },
      {
        id: 'pr2', type: 'product', order: 1, data: {
          products: [
            { image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop', name: 'DevTools Pro', description: 'Developer productivity tools', url: 'https://github.com', status: 'active', metrics: '10k users' },
            { image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&h=200&fit=crop', name: 'DesignKit', description: 'Open source design system', url: 'https://github.com', status: 'active', metrics: '5k stars' },
          ]
        }
      },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 2,
  },
  {
    id: 'item-4',
    desktopId: 'goos-demo',
    label: 'Photography',
    thumbnailUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop',
    positionX: 72,
    positionY: 10,
    windowTitle: 'Photography',
    windowSubtitle: 'Moments Captured',
    windowHeaderImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop',
    windowDescription: '',
    windowType: 'photos',
    windowWidth: 700,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'ph1', type: 'text', order: 0, data: { content: "Photography is how I see the world when I'm not behind a screen." } },
      {
        id: 'ph2', type: 'gallery', order: 1, data: {
          columns: 3, expandable: true, images: [
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', caption: 'Mountain sunrise', alt: 'Mountain at sunrise' },
            { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop', caption: 'Forest path', alt: 'Path through forest' },
            { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', caption: 'Beach at dusk', alt: 'Beach sunset' },
            { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop', caption: 'Misty mountains', alt: 'Foggy mountain range' },
          ]
        }
      },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 3,
  },
  {
    id: 'item-6',
    desktopId: 'goos-demo',
    label: 'Testimonials',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
    positionX: 8,
    positionY: 45,
    windowTitle: 'What People Say',
    windowSubtitle: 'Client Testimonials',
    windowHeaderImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop',
    windowDescription: '',
    windowWidth: 500,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      {
        id: 't1', type: 'testimonial', order: 0, data: {
          style: 'cards', testimonials: [
            { quote: 'Working with Alex transformed our entire product.', name: 'Sarah Chen', title: 'CEO', company: 'TechStart', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
            { quote: 'Exceptional attention to detail and deep UX understanding.', name: 'Marcus Johnson', title: 'Product Lead', company: 'DesignCo', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
          ]
        }
      },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 5,
  },
  {
    id: 'item-7',
    desktopId: 'goos-demo',
    label: 'Contact',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=200&h=200&fit=crop',
    positionX: 82,
    positionY: 48,
    windowTitle: 'Get in Touch',
    windowSubtitle: "Let's Connect",
    windowHeaderImage: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=400&fit=crop',
    windowDescription: '',
    windowType: 'mail',
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'c1', type: 'text', order: 0, data: { content: "I'm always open to discussing new projects, creative ideas, or opportunities to collaborate." } },
      { id: 'c2', type: 'callout', order: 1, data: { text: 'Currently accepting new clients for Q1 2025', style: 'success', icon: '✓' } },
      {
        id: 'c3', type: 'social', order: 2, data: {
          profiles: [
            { platform: 'twitter', url: 'https://twitter.com' },
            { platform: 'linkedin', url: 'https://linkedin.com' },
            { platform: 'email', url: 'mailto:hello@alexchen.design' },
          ]
        }
      },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 6,
  },
];

// Create demo desktop
const DEMO_DESKTOP: Desktop = {
  id: 'goos-demo',
  userId: 'goos-demo-user',
  backgroundUrl: null,
  backgroundPosition: 'cover',
  backgroundOverlay: null,
  theme: 'light',
  title: 'goOS Demo',
  description: 'goOS themed portfolio demo',
  ogImageUrl: null,
  isPublic: true,
  items: DEMO_ITEMS,
  dockItems: [
    { id: 'dock-1', desktopId: 'goos-demo', icon: '🏠', label: 'Home', actionType: 'url', actionValue: '/', order: 0 },
    { id: 'dock-2', desktopId: 'goos-demo', icon: '📁', label: 'Nest', actionType: 'app', actionValue: 'nest', order: 1 },
    { id: 'dock-3', desktopId: 'goos-demo', icon: '📝', label: 'Notes', actionType: 'app', actionValue: 'notes', order: 2 },
    { id: 'dock-4', desktopId: 'goos-demo', icon: '💬', label: 'Chat', actionType: 'app', actionValue: 'chat', order: 3 },
    { id: 'dock-5', desktopId: 'goos-demo', icon: '⚙️', label: 'Settings', actionType: 'app', actionValue: 'settings', order: 4 },
  ],
  statusWidget: null,
  workbenchEntries: [],
};

// ============================================
// MEMOIZED SUB-COMPONENTS WITH DELIGHT
// ============================================

const MemoizedDesktopIcon = React.memo(({ label, icon, onClick, badge, isActive }: {
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    badge?: number,
    isActive?: boolean
}) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.08, rotate: [-1, 1, 0] }}
        whileTap={{ scale: 0.92 }}
        transition={springSnappy}
        className={`
            flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer
            transition-colors duration-200 w-16 group
            ${isActive ? 'bg-orange-100/50 shadow-inner' : 'hover:bg-black/5'}
        `}
    >
        <motion.div
            className="relative w-10 h-10 flex items-center justify-center"
            animate={isActive ? { y: [0, -2, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
            {icon}
            <AnimatePresence>
                {badge !== undefined && badge > 0 && (
                    <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={springSnappy}
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1 z-10"
                        style={{ background: '#E85D04', border: '1.5px solid #2a2a2a' }}
                    >
                        {badge > 99 ? '99+' : badge}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
        <span
            className="text-xs text-[#2a2a2a] text-center leading-tight select-none"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
        >
            {label}
        </span>
    </motion.button>
));

MemoizedDesktopIcon.displayName = 'DesktopIcon';

// Dock icon with satisfying lift
const MemoizedDockIcon = React.memo(({ icon, onClick, isActive, badge, label, isSpecial }: {
    icon: React.ReactNode,
    onClick: () => void,
    isActive?: boolean,
    badge?: number,
    label?: string,
    isSpecial?: boolean
}) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <motion.button
            onClick={onClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            whileHover={{ y: -8, rotate: isSpecial ? [0, -5, 5, 0] : 0 }}
            whileTap={{ y: -4, scale: 0.95 }}
            transition={springGentle}
            className="relative group flex flex-col items-center focus:outline-none"
            title={label}
            aria-label={badge ? `${label}, ${badge} notifications` : label}
        >
            <motion.div
                animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
                transition={springSnappy}
                className={`
                    w-10 h-10 flex items-center justify-center rounded-lg
                    transition-colors duration-200
                    ${isActive ? 'bg-orange-100 shadow-sm' : 'group-hover:bg-black/5'}
                `}
                style={{ border: isActive ? '1.5px solid #2a2a2a' : 'none' }}
            >
                <div className="w-7 h-7 flex items-center justify-center">
                    {icon}
                </div>
            </motion.div>

            <AnimatePresence>
                {badge !== undefined && badge > 0 && (
                    <motion.span
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0 }}
                        transition={springSnappy}
                        className="absolute -top-1 -right-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-0.5 z-10 shadow-sm"
                        style={{ background: '#E85D04' }}
                    >
                        {badge}
                    </motion.span>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={springSnappy}
                        className="w-1.5 h-1.5 rounded-full bg-[#2a2a2a] mt-1"
                    />
                )}
            </AnimatePresence>
        </motion.button>
    );
});

MemoizedDockIcon.displayName = 'DockIcon';

// Tactile Sticky Note
const springNote = { type: "spring", stiffness: 300, damping: 15 };

type StickyNoteColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple';

const stickyNoteColors: Record<StickyNoteColor, string> = {
    yellow: '#fef08a',
    blue: '#bae6fd',
    pink: '#fbcfe8',
    green: '#bbf7d0',
    orange: '#fed7aa',
    purple: '#e9d5ff'
};

const MemoizedStickyNote = React.memo(({
    children,
    color = 'yellow',
    rotation = 0,
    defaultPosition = { x: 0, y: 0 }
}: {
    children: React.ReactNode;
    color?: StickyNoteColor;
    rotation?: number;
    defaultPosition?: { x: number; y: number };
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            drag
            dragMomentum={true}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{
                rotate: rotation,
                scale: 0.8,
                opacity: 0,
                x: defaultPosition.x,
                y: defaultPosition.y
            }}
            animate={{
                rotate: isHovered ? 0 : rotation,
                scale: isDragging ? 1.05 : isHovered ? 1.05 : 1,
                opacity: 1,
                boxShadow: isDragging
                    ? '12px 12px 20px rgba(0,0,0,0.25)'
                    : isHovered
                        ? '8px 8px 12px rgba(0,0,0,0.15)'
                        : '4px 4px 8px rgba(0,0,0,0.1)'
            }}
            whileTap={{ scale: 1.02 }}
            transition={springNote}
            className="sticky-note relative cursor-grab active:cursor-grabbing select-none"
            style={{
                backgroundColor: stickyNoteColors[color],
                minWidth: '110px',
                padding: '14px 12px 18px 12px',
                zIndex: isDragging ? 100 : isHovered ? 50 : 1
            }}
        >
            <div className="relative z-10" style={{ fontFamily: 'var(--font-handwritten)' }}>
                {children}
            </div>
            <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3"
                animate={{
                    opacity: isDragging ? 0.9 : isHovered ? 0.8 : 0.6,
                    scaleX: isDragging ? 1.1 : 1
                }}
                transition={springNote}
                style={{
                    background: 'linear-gradient(135deg, rgba(240,240,230,0.95) 0%, rgba(210,210,200,0.85) 100%)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '1px',
                    transform: 'rotate(1deg)'
                }}
            />
            <div
                className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%)'
                }}
            />
        </motion.div>
    );
});

MemoizedStickyNote.displayName = 'StickyNote';

// Rubber Duck with wobble animation
const RubberDuck = React.memo(({ onClick }: { onClick: () => void }) => {
    const [isQuacking, setIsQuacking] = useState(false);

    const handleClick = () => {
        setIsQuacking(true);
        onClick();
        setTimeout(() => setIsQuacking(false), 600);
    };

    return (
        <motion.button
            onClick={handleClick}
            className="relative group flex flex-col items-center focus:outline-none"
            title="Quack!"
            whileHover={{ y: -8 }}
            transition={springGentle}
        >
            <motion.div
                animate={isQuacking ? {
                    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                    y: [0, -5, 0, -3, 0]
                } : {
                    rotate: [0, 2, 0, -2, 0],
                    y: [0, -2, 0]
                }}
                transition={isQuacking ? {
                    duration: 0.5,
                    ease: easeOutQuart
                } : {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg group-hover:bg-black/5 transition-colors"
            >
                <span className="text-2xl">🦆</span>
            </motion.div>

            <AnimatePresence>
                {isQuacking && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: -35 }}
                        exit={{ scale: 0, opacity: 0, y: -45 }}
                        transition={springSnappy}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white border-2 border-[#2a2a2a] rounded-full px-3 py-1 text-xs whitespace-nowrap z-50"
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600, boxShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}
                    >
                        <span className="text-[#1a1a1a]">Quack!</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

RubberDuck.displayName = 'RubberDuck';

// Coffee cup with steam animation
const CoffeeCup = React.memo(() => (
    <div className="relative">
        <span className="text-4xl opacity-40 -rotate-12">☕</span>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    className="w-1.5 h-6 bg-gradient-to-t from-transparent to-gray-400/30 rounded-full"
                    animate={{
                        y: [0, -8, 0],
                        opacity: [0.3, 0.6, 0.3],
                        scaleY: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    </div>
));

CoffeeCup.displayName = 'CoffeeCup';

// Plant with gentle sway
const SwayingPlant = React.memo(() => (
    <motion.div
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: 'bottom center' }}
    >
        <span className="text-5xl opacity-60">🪴</span>
    </motion.div>
));

SwayingPlant.displayName = 'SwayingPlant';

// Interactive checkbox with celebration
const CelebratoryCheckbox = React.memo(({ defaultChecked, label, isHot }: {
    defaultChecked: boolean;
    label: string;
    isHot?: boolean;
}) => {
    const [checked, setChecked] = useState(defaultChecked);
    const [justChecked, setJustChecked] = useState(false);

    const handleChange = () => {
        const newValue = !checked;
        setChecked(newValue);
        if (newValue) {
            setJustChecked(true);
            setTimeout(() => setJustChecked(false), 600);
        }
    };

    return (
        <motion.li
            className="flex items-center gap-3 relative"
            whileHover={{ x: 3 }}
            transition={springGentle}
        >
            <motion.div
                className="relative"
                animate={justChecked ? { scale: [1, 1.3, 1] } : {}}
                transition={springSnappy}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#E85D04] cursor-pointer"
                />
                <AnimatePresence>
                    {justChecked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 rounded-full bg-[#E85D04]/30"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.span
                animate={checked ? { opacity: 0.4 } : { opacity: 1 }}
                className={`text-sm text-[#2a2a2a] ${checked ? 'line-through' : isHot ? 'text-[#D64C00]' : ''}`}
                style={{ fontFamily: "var(--font-body)", fontWeight: isHot ? 600 : checked ? 400 : 500 }}
            >
                {label}
            </motion.span>

            <AnimatePresence>
                {justChecked && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <motion.span
                                key={i}
                                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                animate={{
                                    scale: [0, 1],
                                    opacity: [1, 0],
                                    x: (Math.random() - 0.5) * 40,
                                    y: (Math.random() - 0.5) * 40 - 10
                                }}
                                transition={{ duration: 0.5, delay: i * 0.03 }}
                                className="absolute left-4 text-[#E85D04]"
                            >
                                ✓
                            </motion.span>
                        ))}
                    </>
                )}
            </AnimatePresence>
        </motion.li>
    );
});

CelebratoryCheckbox.displayName = 'CelebratoryCheckbox';

// Animated toggle switch
const AnimatedToggle = React.memo(({ defaultOn = false, onChange }: {
    defaultOn?: boolean;
    onChange?: (isOn: boolean) => void;
}) => {
    const [isOn, setIsOn] = useState(defaultOn);
    const [justToggled, setJustToggled] = useState(false);

    const handleToggle = () => {
        const newValue = !isOn;
        setIsOn(newValue);
        setJustToggled(true);
        onChange?.(newValue);
        setTimeout(() => setJustToggled(false), 300);
    };

    return (
        <motion.button
            onClick={handleToggle}
            className="relative w-11 h-6 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFB347] focus:ring-offset-2"
            animate={{
                backgroundColor: isOn ? '#E85D04' : '#2a2a2a'
            }}
            transition={{ duration: 0.2 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={isOn}
            role="switch"
        >
            <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{
                    left: isOn ? 'calc(100% - 20px)' : '4px',
                    scale: justToggled ? [1, 1.2, 1] : 1
                }}
                transition={springSnappy}
            />
            <AnimatePresence>
                {justToggled && isOn && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full bg-[#E85D04]"
                    />
                )}
            </AnimatePresence>
        </motion.button>
    );
});

AnimatedToggle.displayName = 'AnimatedToggle';

// Menu bar item
const MenuBarItem = React.memo(({ label }: { label: string }) => (
    <motion.span
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        transition={springSnappy}
        className="cursor-pointer text-[#3a3a3a] hover:text-orange-600 transition-colors select-none"
        style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
    >
        {label}
    </motion.span>
));

MenuBarItem.displayName = 'MenuBarItem';

// Typing indicator
const TypingIndicator = React.memo(() => (
    <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[#FFB347] border-2 border-[#2a2a2a] flex items-center justify-center text-sm shadow-sm flex-shrink-0">🦆</div>
        <div className="bg-white/80 border-2 border-[#2a2a2a] rounded-xl rounded-tl-none px-4 py-2.5" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.08)' }}>
            <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#666]"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    </div>
));

TypingIndicator.displayName = 'TypingIndicator';

// ============================================
// SKETCH WINDOW COMPONENT
// ============================================
const windowTransition = {
    type: "spring",
    damping: 25,
    stiffness: 300
};

interface SketchWindowState {
    id: string;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    zIndex: number;
    defaultX: number;
    defaultY: number;
    width: number;
    height: number;
    icon?: React.ReactNode;
}

function SketchWindow({
    win,
    onClose,
    onMinimize,
    onFocus,
    children
}: {
    win: SketchWindowState,
    onClose: () => void,
    onMinimize: () => void,
    onFocus: () => void,
    children: React.ReactNode
}) {
    return (
        <motion.div
            drag
            dragMomentum={false}
            dragListener={true}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={windowTransition}
            onMouseDown={onFocus}
            className="absolute flex flex-col bg-[#FFFDF5] rounded-sm overflow-hidden pointer-events-auto"
            style={{
                left: win.defaultX,
                top: win.defaultY,
                width: win.width,
                height: win.height,
                zIndex: win.zIndex,
                border: '2px solid #2a2a2a',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.1)'
            }}
        >
            <div
                className="h-8 flex items-center justify-between px-3 select-none cursor-move flex-shrink-0"
                style={{
                    background: '#F5F3E8',
                    borderBottom: '2px solid #2a2a2a'
                }}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    {win.icon && <span className="opacity-60">{win.icon}</span>}
                    <span
                        className="text-base text-[#1a1a1a]"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                    >
                        {win.title}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 z-10">
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-400 border border-yellow-600 hover:bg-yellow-300 transition-colors"
                        aria-label="Minimize"
                    >
                        <Minus size={10} strokeWidth={3} className="text-yellow-800" />
                    </button>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-green-400 border border-green-600 hover:bg-green-300 transition-colors"
                        aria-label="Maximize"
                    >
                        <Square size={8} strokeWidth={3} className="text-green-800" />
                    </button>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-red-400 border border-red-600 hover:bg-red-300 transition-colors"
                        aria-label="Close"
                    >
                        <X size={10} strokeWidth={3} className="text-red-800" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#FFFDF5]">
                {children}
            </div>
        </motion.div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
const getGreeting = (hour: number): string => {
    if (hour < 5) return "Night owl? 🦉";
    if (hour < 12) return "Good morning! ☀️";
    if (hour < 17) return "Good afternoon! 🌤";
    if (hour < 21) return "Good evening! 🌅";
    return "Night owl? 🦉";
};

function GoOSDemoContent() {
    const context = useEditContextSafe();
    const windowContext = useWindowContext();
    const [time, setTime] = useState('00:00');
    const [greeting, setGreeting] = useState('');
    const [topZIndex, setTopZIndex] = useState(100);
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [itemOrder, setItemOrder] = useState<string[]>(() =>
        context?.desktop?.items.map(i => i.id) || []
    );

    // goOS Windows state
    const [winStates, setWinStates] = useState<Record<string, { isOpen: boolean, isMinimized: boolean, zIndex: number }>>({
        nest: { isOpen: false, isMinimized: false, zIndex: 10 },
        notes: { isOpen: false, isMinimized: false, zIndex: 11 },
        chat: { isOpen: false, isMinimized: false, zIndex: 12 },
        settings: { isOpen: false, isMinimized: false, zIndex: 13 },
        shell: { isOpen: false, isMinimized: false, zIndex: 14 },
        quackmail: { isOpen: true, isMinimized: false, zIndex: 15 },
    });

    const windowConfigs = useMemo(() => ({
        nest: { title: 'Nest', icon: <Folder size={14} />, width: 420, height: 360, x: 120, y: 100 },
        notes: { title: 'Notes', icon: <StickyNoteIcon size={14} />, width: 300, height: 280, x: 150, y: 180 },
        chat: { title: 'Chat', icon: <MessageCircle size={14} />, width: 340, height: 420, x: 650, y: 120 },
        settings: { title: 'Settings', icon: <Settings size={14} />, width: 380, height: 320, x: 380, y: 150 },
        shell: { title: 'Shell', icon: <Terminal size={14} />, width: 480, height: 320, x: 220, y: 120 },
        quackmail: { title: 'Quackmail', icon: <Mail size={14} />, width: 360, height: 240, x: 550, y: 300 },
    }), []);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            setGreeting(getGreeting(now.getHours()));
        };
        updateTime();
        const interval = setInterval(updateTime, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (context?.desktop?.items) {
            setItemOrder(context.desktop.items.map(i => i.id));
        }
    }, [context?.desktop?.items]);

    const handleLogoClick = useCallback(() => {
        const newCount = logoClickCount + 1;
        setLogoClickCount(newCount);
        if (newCount >= 5) {
            setShowEasterEgg(true);
            setLogoClickCount(0);
            setTimeout(() => setShowEasterEgg(false), 3000);
        }
    }, [logoClickCount]);

    const focusWindow = useCallback((id: string) => {
        setWinStates(prev => {
            if (prev[id]?.zIndex === topZIndex) return prev;
            return {
                ...prev,
                [id]: { ...prev[id], zIndex: topZIndex + 1, isMinimized: false }
            };
        });
        setTopZIndex(prev => prev + 1);
    }, [topZIndex]);

    const openWindow = useCallback((id: string) => {
        setWinStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: topZIndex + 1 }
        }));
        setTopZIndex(prev => prev + 1);
    }, [topZIndex]);

    const closeWindow = useCallback((id: string) => {
        setWinStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: false }
        }));
    }, []);

    const minimizeWindow = useCallback((id: string) => {
        setWinStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isMinimized: true }
        }));
    }, []);

    const toggleWindow = useCallback((id: string) => {
        const win = winStates[id];
        if (!win?.isOpen || win.isMinimized) {
            openWindow(id);
        } else {
            minimizeWindow(id);
        }
    }, [winStates, openWindow, minimizeWindow]);

    const bringToFront = (id: string) => {
        setItemOrder(prev => [...prev.filter(i => i !== id), id]);
    };

    const items = context?.desktop?.items || [];

    return (
        <div
            className="min-h-screen w-full relative overflow-hidden cursor-default antialiased theme-sketch"
            style={{
                backgroundColor: '#FAF8F0',
                backgroundImage: 'radial-gradient(#d8d8d8 1px, transparent 1px)',
                backgroundSize: '28px 28px'
            }}
        >
            {/* Menu Bar */}
            <header
                className="h-10 flex items-center justify-between px-5 relative z-[2000] shadow-sm select-none"
                style={{ background: '#F0EDE0', borderBottom: '2px solid #2a2a2a' }}
            >
                <div className="flex items-center gap-8">
                    <motion.button
                        onClick={handleLogoClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95, rotate: [-5, 5, 0] }}
                        transition={springSnappy}
                        className="text-xl tracking-tight text-[#1a1a1a] cursor-pointer focus:outline-none relative"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                    >
                        goOS
                        <AnimatePresence>
                            {showEasterEgg && (
                                <>
                                    {['🦆', '🥚', '✨', '🎉', '🦆', '💫'].map((emoji, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                            animate={{
                                                scale: [0, 1.5, 1],
                                                opacity: [1, 1, 0],
                                                x: (Math.random() - 0.5) * 120,
                                                y: -20 - Math.random() * 60
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8, delay: i * 0.08 }}
                                            className="absolute left-1/2 top-0 text-xl pointer-events-none"
                                        >
                                            {emoji}
                                        </motion.span>
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 20 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute left-1/2 -translate-x-1/2 top-full whitespace-nowrap bg-[#E85D04] text-white px-2 py-1 rounded text-xs"
                                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                                    >
                                        You found the duck! 🦆
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.button>
                    <nav className="flex gap-5 text-sm">
                        {['File', 'Edit', 'View', 'Help'].map(item => (
                            <MenuBarItem key={item} label={item} />
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#3a3a3a]" style={{ fontFamily: "var(--font-body)" }}>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-[#666] hidden sm:block"
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                    >
                        {greeting}
                    </motion.span>
                    <div className="flex items-center gap-1.5">
                        <Battery size={15} strokeWidth={2} />
                        <span className="font-medium">87%</span>
                    </div>
                    <Wifi size={15} strokeWidth={2} />
                    <span className="font-semibold tabular-nums min-w-[44px] text-right text-[#1a1a1a]">{time}</span>
                </div>
            </header>

            {/* Desktop Area */}
            <main className="absolute inset-0 pt-9 pointer-events-none overflow-hidden">
                {/* Left Icons & Sticky Notes */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: easeOutQuart }}
                    className="absolute top-14 left-5 flex flex-col gap-2 pointer-events-auto"
                >
                    <div className="mb-4 flex flex-col gap-3">
                        <MemoizedStickyNote color="orange" rotation={-3}>
                            <span className="text-xl text-[#2a2a2a]">
                                goOS Demo
                            </span>
                        </MemoizedStickyNote>
                        <MemoizedStickyNote color="yellow" rotation={4}>
                            <span className="text-[10px] text-[#666] uppercase tracking-wider block mb-1">
                                welcome
                            </span>
                            <span className="text-lg text-[#c53d00] leading-tight">
                                Click icons!
                            </span>
                        </MemoizedStickyNote>
                    </div>

                    <MemoizedDesktopIcon
                        label="Nest"
                        icon={<Folder size={30} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('nest')}
                        isActive={winStates.nest?.isOpen && !winStates.nest?.isMinimized}
                    />
                    <MemoizedDesktopIcon
                        label="Shell"
                        icon={<Terminal size={30} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('shell')}
                        badge={250}
                        isActive={winStates.shell?.isOpen && !winStates.shell?.isMinimized}
                    />
                </motion.div>

                {/* Right Icons */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: easeOutQuart, delay: 0.1 }}
                    className="absolute top-14 right-5 flex flex-col gap-2 items-end pointer-events-auto"
                >
                    <MemoizedDesktopIcon
                        label="Mail"
                        icon={<Mail size={30} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('quackmail')}
                        badge={3}
                        isActive={winStates.quackmail?.isOpen && !winStates.quackmail?.isMinimized}
                    />
                    <MemoizedDesktopIcon
                        label="Chat"
                        icon={<MessageCircle size={30} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('chat')}
                        isActive={winStates.chat?.isOpen && !winStates.chat?.isMinimized}
                    />
                    <MemoizedDesktopIcon
                        label="Notes"
                        icon={<StickyNoteIcon size={30} fill="#FFF9C4" stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('notes')}
                        isActive={winStates.notes?.isOpen && !winStates.notes?.isMinimized}
                    />
                    <div className="mt-8 select-none">
                        <SwayingPlant />
                    </div>
                </motion.div>

                {/* Desktop Items (Portfolio Items) */}
                <div className="desktop-canvas relative w-full h-full pt-[28px] pb-[80px] z-[10]">
                    {items.map((item) => (
                        <EditableDesktopItem
                            key={item.id}
                            item={item}
                            onClick={() => windowContext.openWindow(item.id)}
                            zIndex={itemOrder.indexOf(item.id) + 1}
                            onBringToFront={() => bringToFront(item.id)}
                        />
                    ))}
                </div>

                {/* Portfolio Windows */}
                <WindowManager items={items} />

                {/* goOS Windows */}
                <div className="relative w-full h-full">
                    <AnimatePresence>
                        {Object.entries(winStates).map(([id, state]) => {
                            if (!state.isOpen || state.isMinimized) return null;
                            const config = windowConfigs[id as keyof typeof windowConfigs];
                            if (!config) return null;

                            return (
                                <SketchWindow
                                    key={id}
                                    win={{
                                        id,
                                        title: config.title,
                                        isOpen: state.isOpen,
                                        isMinimized: state.isMinimized,
                                        zIndex: state.zIndex,
                                        defaultX: config.x,
                                        defaultY: config.y,
                                        width: config.width,
                                        height: config.height,
                                        icon: config.icon,
                                    }}
                                    onClose={() => closeWindow(id)}
                                    onMinimize={() => minimizeWindow(id)}
                                    onFocus={() => focusWindow(id)}
                                >
                                    {id === 'quackmail' && (
                                        <div className="h-full flex flex-col p-4">
                                            <header className="flex items-center justify-between border-b border-[#2a2a2a]/20 pb-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-[#666] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>From</span>
                                                    <span className="text-sm text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>David</span>
                                                    <span className="text-xs text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>12:05 PM</span>
                                                </div>
                                                <button className="flex items-center hover:scale-110 transition-transform" aria-label="Favorite">
                                                    <Heart size={18} className="text-[#E85D04]" fill="#E85D04" />
                                                </button>
                                            </header>
                                            <article className="flex-1">
                                                <p className="text-lg text-[#1a1a1a] mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Hey there! 👋</p>
                                                <p className="text-base text-[#3a3a3a] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>Welcome to goOS Demo! Click around to explore the portfolio items.</p>
                                            </article>
                                        </div>
                                    )}

                                    {id === 'notes' && (
                                        <div className="h-full p-5 bg-[#FFFACD]">
                                            <motion.h3
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-lg text-[#1a1a1a] mb-4 pb-2 border-b border-[#2a2a2a]/20"
                                                style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                                            >
                                                📝 Todo List
                                            </motion.h3>
                                            <ul className="space-y-3">
                                                <CelebratoryCheckbox defaultChecked={false} label="Explore the portfolio" />
                                                <CelebratoryCheckbox defaultChecked={true} label="Check out goOS design" />
                                                <CelebratoryCheckbox defaultChecked={false} label="HONK!!! 🦆" isHot />
                                                <CelebratoryCheckbox defaultChecked={true} label="Have fun!" />
                                            </ul>
                                        </div>
                                    )}

                                    {id === 'shell' && (
                                        <div
                                            className="h-full p-4 bg-[#0d0d0d] whitespace-pre text-sm shadow-inner leading-relaxed"
                                            style={{ fontFamily: "'SF Mono', 'Fira Code', 'Monaco', monospace" }}
                                        >
                                            <div className="text-[#666] text-xs mb-2">goOS Kernel v1.0.4-quack</div>
                                            <div className="text-[#4ade80]">$ duck --status-check</div>
                                            <div className="text-[#a3a3a3] pl-4">[OK] Quack levels nominal</div>
                                            <div className="text-[#a3a3a3] pl-4">[OK] Portfolio loaded</div>
                                            <div className="mt-3 text-[#facc15]">$ portfolio --show</div>
                                            <div className="mt-1 text-[#E85D04] pl-4">READY... [████████████] 100%</div>
                                            <div className="text-[#4ade80] animate-pulse mt-4">$ _</div>
                                        </div>
                                    )}

                                    {id === 'nest' && (
                                        <div className="h-full p-6 overflow-auto">
                                            <div className="grid grid-cols-3 gap-5">
                                                {['Docs', 'Photos', 'Projects', 'Music', 'About', 'Contact'].map(name => (
                                                    <button
                                                        key={name}
                                                        className="flex flex-col items-center gap-2 p-3 group cursor-pointer rounded-lg hover:bg-[#2a2a2a]/5 transition-colors"
                                                    >
                                                        <Folder size={42} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} className="group-hover:scale-105 transition-transform" />
                                                        <span
                                                            className="text-sm text-[#1a1a1a]"
                                                            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                                                        >
                                                            {name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {id === 'chat' && (
                                        <div className="h-full flex flex-col">
                                            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#FFFDF5]">
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#FFB347] border-2 border-[#2a2a2a] flex items-center justify-center text-sm shadow-sm flex-shrink-0">🦆</div>
                                                    <div className="bg-white border-2 border-[#2a2a2a] rounded-xl rounded-tl-none px-4 py-2.5 max-w-[80%]" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.08)' }}>
                                                        <span className="text-sm text-[#3a3a3a]" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>Welcome to goOS Demo! 🦆</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 justify-end">
                                                    <div className="bg-[#FFE4C4] border-2 border-[#2a2a2a] rounded-xl rounded-tr-none px-4 py-2.5 max-w-[80%]" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.08)' }}>
                                                        <span className="text-sm text-[#1a1a1a]" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>This looks amazing!</span>
                                                    </div>
                                                </div>
                                                <TypingIndicator />
                                            </div>
                                            <div className="p-3 bg-[#F5F3E8] border-t-2 border-[#2a2a2a]">
                                                <input
                                                    type="text"
                                                    placeholder="Type a message..."
                                                    className="w-full px-4 py-2.5 bg-white border-2 border-[#2a2a2a] rounded-lg text-sm text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
                                                    style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {id === 'settings' && (
                                        <div className="h-full p-5 space-y-5 overflow-auto">
                                            <section>
                                                <h4
                                                    className="text-base text-[#1a1a1a] mb-3 pb-2 border-b border-[#2a2a2a]/20"
                                                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                                                >
                                                    Appearance
                                                </h4>
                                                <div className="flex items-center justify-between p-4 bg-white border-2 border-[#2a2a2a] rounded-lg" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.08)' }}>
                                                    <span
                                                        className="text-sm text-[#1a1a1a]"
                                                        style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                                                    >
                                                        Dark Mode
                                                    </span>
                                                    <AnimatedToggle defaultOn={false} />
                                                </div>
                                            </section>
                                            <section>
                                                <h4
                                                    className="text-base text-[#1a1a1a] mb-3 pb-2 border-b border-[#2a2a2a]/20"
                                                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                                                >
                                                    About
                                                </h4>
                                                <div className="p-4 bg-white border-2 border-[#2a2a2a] rounded-lg" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.08)' }}>
                                                    <p className="text-sm text-[#3a3a3a]" style={{ fontFamily: 'var(--font-body)' }}>
                                                        goOS Demo - A playful portfolio experience
                                                    </p>
                                                </div>
                                            </section>
                                        </div>
                                    )}
                                </SketchWindow>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Open Nest Button */}
                <div className="absolute bottom-32 left-24 pointer-events-auto">
                    <motion.button
                        onClick={() => openWindow('nest')}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98, y: 2 }}
                        transition={springSnappy}
                        className="px-5 py-3 bg-[#FFFDF5] border-2 border-[#2a2a2a] rounded-lg text-[#1a1a1a]"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', boxShadow: '4px 4px 0 #2a2a2a' }}
                    >
                        🦆 Open Nest
                    </motion.button>
                    <div className="absolute -left-16 -bottom-6 pointer-events-none">
                        <CoffeeCup />
                    </div>
                </div>
            </main>

            {/* Dock */}
            <footer className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[3000]">
                <div
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#F0EDE0]"
                    style={{ border: '2px solid #2a2a2a', boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}
                >
                    <RubberDuck onClick={() => {}} />
                    <MemoizedDockIcon
                        icon={<Folder size={26} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('nest')}
                        isActive={winStates.nest?.isOpen}
                        label="Nest"
                    />
                    <MemoizedDockIcon
                        icon={
                            <div
                                className="w-7 h-7 flex items-center justify-center rounded bg-white border-2 border-[#2a2a2a] text-[#1a1a1a]"
                                style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem' }}
                            >
                                23
                            </div>
                        }
                        onClick={() => { }}
                        label="Calendar"
                    />
                    <MemoizedDockIcon
                        icon={<Mail size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('quackmail')}
                        isActive={winStates.quackmail?.isOpen}
                        badge={3}
                        label="Mail"
                    />
                    <MemoizedDockIcon
                        icon={<Camera size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => {
                            const photoItem = items.find(i => i.label === 'Photography');
                            if (photoItem) windowContext.openWindow(photoItem.id);
                        }}
                        label="Photos"
                    />
                    <MemoizedDockIcon
                        icon={<FileText size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('notes')}
                        isActive={winStates.notes?.isOpen}
                        label="Notes"
                    />

                    <div className="w-[1.5px] h-9 mx-1 bg-black/10 rounded-full" />

                    <MemoizedDockIcon
                        icon={<Gamepad2 size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => { }}
                        label="Games"
                    />
                    <MemoizedDockIcon
                        icon={<Music size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => { }}
                        label="Music"
                    />
                    <MemoizedDockIcon
                        icon={<Settings size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('settings')}
                        isActive={winStates.settings?.isOpen}
                        label="Settings"
                    />

                    {/* Notification Balloon */}
                    <AnimatePresence>
                        <motion.div
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="absolute -right-6 -top-12 bg-[#F0EDE0] border-2 border-[#2a2a2a] px-3 py-1.5 rounded-lg pointer-events-none"
                            style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}
                        >
                            <span
                                className="text-[#D64C00] animate-bounce inline-block text-sm"
                                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}
                            >
                                ⚠ Quack!
                            </span>
                            <div className="absolute -bottom-[7px] right-6 w-3 h-3 bg-[#F0EDE0] border-b-2 border-r-2 border-[#2a2a2a] rotate-45" />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </footer>

            {/* Made with badge */}
            <motion.a
                href="/"
                className="fixed bottom-3 right-4 z-[50] px-3 py-1.5 font-medium"
                style={{
                    fontSize: '10px',
                    borderRadius: '9999px',
                    background: '#F0EDE0',
                    border: '2px solid #2a2a2a',
                    color: '#1a1a1a',
                    boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
                    fontFamily: 'var(--font-body)',
                }}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                Made with goOS
            </motion.a>

            {/* Save Indicator & Toast */}
            <SaveIndicator />
            <Toast />
        </div>
    );
}

// Main Export
export default function GoOSDemoPage() {
    return (
        <EditProvider initialDesktop={DEMO_DESKTOP} initialIsOwner={false} demoMode={true}>
            <WindowProvider>
                <GoOSDemoContent />
            </WindowProvider>
        </EditProvider>
    );
}
