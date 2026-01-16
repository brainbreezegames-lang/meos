'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Folder,
    Terminal,
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
    Settings,
    User,
    Briefcase,
    Image as ImageIcon,
    MessageSquare,
    Phone,
    Code,
    Palette,
    Star,
} from 'lucide-react';
import { EditProvider, useEditContextSafe } from '@/contexts/EditContext';
import { WindowProvider, useWindowContext } from '@/contexts/WindowContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WindowManager } from '@/components/desktop/MultiWindow';
import { SaveIndicator, Toast } from '@/components/editing/SaveIndicator';
import type { DesktopItem, Desktop } from '@/types';

// ============================================
// GOOS DESIGN TOKENS
// ============================================
const goOS = {
    colors: {
        paper: '#FAF8F0',
        cream: '#FFFDF5',
        headerBg: '#F0EDE0',
        windowBg: '#F5F3E8',
        border: '#2a2a2a',
        text: {
            primary: '#1a1a1a',
            secondary: '#3a3a3a',
            muted: '#666666',
        },
        accent: {
            orange: '#E85D04',
            orangeDark: '#D64C00',
            orangeLight: '#FFB347',
            orangePale: '#FFE4C4',
        },
        sticky: {
            yellow: '#fef08a',
            blue: '#bae6fd',
            pink: '#fbcfe8',
            green: '#bbf7d0',
            orange: '#fed7aa',
            purple: '#e9d5ff',
        }
    },
    shadows: {
        solid: '6px 6px 0 rgba(0,0,0,0.1)',
        hover: '8px 8px 0 rgba(0,0,0,0.12)',
        sm: '3px 3px 0 rgba(0,0,0,0.08)',
        button: '4px 4px 0 rgba(0,0,0,0.1)',
    },
    springs: {
        snappy: { type: "spring" as const, damping: 20, stiffness: 400 },
        gentle: { type: "spring" as const, damping: 25, stiffness: 200 },
        bouncy: { type: "spring" as const, damping: 15, stiffness: 300 },
    }
};

// ============================================
// PORTFOLIO ITEMS WITH ICONS
// ============================================
const PORTFOLIO_ICON_MAP: Record<string, React.ReactNode> = {
    'About Me': <User size={28} stroke={goOS.colors.border} strokeWidth={1.5} />,
    'Projects': <Briefcase size={28} stroke={goOS.colors.border} strokeWidth={1.5} />,
    'Photography': <Camera size={28} stroke={goOS.colors.border} strokeWidth={1.5} />,
    'Testimonials': <MessageSquare size={28} stroke={goOS.colors.border} strokeWidth={1.5} />,
    'Contact': <Phone size={28} stroke={goOS.colors.border} strokeWidth={1.5} />,
    'Skills': <Code size={28} stroke={goOS.colors.border} strokeWidth={1.5} />,
    'Portfolio': <Palette size={28} stroke={goOS.colors.border} strokeWidth={1.5} />,
    'Resume': <FileText size={28} stroke={goOS.colors.border} strokeWidth={1.5} />,
};

// ============================================
// DEMO ITEMS
// ============================================
const DEMO_ITEMS: DesktopItem[] = [
    {
        id: 'item-1',
        desktopId: 'goos-demo',
        label: 'About Me',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        positionX: 15,
        positionY: 22,
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
                    { id: 'b1', type: 'text', order: 0, data: { content: "Hey there! I'm a creative developer passionate about building beautiful digital experiences that feel alive.\n\nI design and build products that people love to use. Currently at Figma, previously Stripe & Airbnb." } },
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
                    {
                        id: 'b4', type: 'buttons', order: 3, data: {
                            buttons: [
                                { label: 'Download CV', url: '/resume.pdf', style: 'primary', icon: '📄', newTab: true },
                                { label: 'Book a Call', url: 'https://cal.com', style: 'secondary', newTab: true },
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
        positionX: 30,
        positionY: 18,
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
                        { image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', name: 'ColorAI', description: 'AI-powered color palette', url: 'https://github.com', status: 'acquired', metrics: 'Acquired' },
                    ]
                }
            },
            { id: 'pr3', type: 'callout', order: 2, data: { text: 'Looking to collaborate? I\'m open to interesting side projects.', style: 'info', icon: '💡' } },
            {
                id: 'pr4', type: 'buttons', order: 3, data: {
                    buttons: [
                        { label: 'View All on GitHub', url: 'https://github.com', style: 'primary', icon: '🐙', newTab: true },
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
        positionX: 45,
        positionY: 22,
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
            { id: 'ph1', type: 'text', order: 0, data: { content: "Photography is how I see the world when I'm not behind a screen. I'm drawn to street photography, architecture, and golden hour moments." } },
            {
                id: 'ph2', type: 'gallery', order: 1, data: {
                    columns: 3, expandable: true, images: [
                        { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', caption: 'Mountain sunrise', alt: 'Mountain at sunrise' },
                        { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop', caption: 'Forest path', alt: 'Path through forest' },
                        { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', caption: 'Beach at dusk', alt: 'Beach sunset' },
                        { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop', caption: 'Misty mountains', alt: 'Foggy mountain range' },
                        { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop', caption: 'Starry night', alt: 'Mountain under stars' },
                        { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop', caption: 'Sunlit forest', alt: 'Sun through trees' },
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
        positionX: 60,
        positionY: 18,
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
                        { quote: 'Working with Alex transformed our entire product. The attention to detail was incredible — every pixel mattered.', name: 'Sarah Chen', title: 'CEO', company: 'TechStart', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
                        { quote: 'Exceptional attention to detail and a deep understanding of user experience. Delivered ahead of schedule.', name: 'Marcus Johnson', title: 'Product Lead', company: 'DesignCo', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
                        { quote: '10/10 would hire again. Brought fresh perspective and solved problems we didn\'t know we had.', name: 'Emily Park', title: 'Founder', company: 'Startup Labs', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
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
        positionX: 15,
        positionY: 52,
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
            { id: 'c1', type: 'text', order: 0, data: { content: "I'm always open to discussing new projects, creative ideas, or opportunities to collaborate.\n\nWhether you have a question, want to work together, or just want to say hi — my inbox is open." } },
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
            {
                id: 'c4', type: 'buttons', order: 3, data: {
                    buttons: [
                        { label: 'Email Me', url: 'mailto:hello@alexchen.design', style: 'primary', newTab: false },
                        { label: 'Schedule a Call', url: 'https://cal.com', style: 'secondary', newTab: true },
                    ]
                }
            },
        ],
        zIndex: 0,
        commentsEnabled: true,
        order: 6,
    },
    {
        id: 'item-10',
        desktopId: 'goos-demo',
        label: 'Skills',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop',
        positionX: 30,
        positionY: 48,
        windowTitle: 'Technical Skills',
        windowSubtitle: 'What I Work With',
        windowHeaderImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
        windowDescription: '',
        windowWidth: 440,
        windowDetails: null,
        windowGallery: null,
        windowLinks: null,
        useTabs: false,
        tabs: [],
        blocks: [
            { id: 'sk1', type: 'heading', order: 0, data: { text: 'Languages & Frameworks', level: 3 } },
            {
                id: 'sk2', type: 'table', order: 1, data: {
                    headers: ['Skill', 'Level', 'Years'],
                    rows: [
                        ['React / Next.js', 'Expert', '5+'],
                        ['TypeScript', 'Expert', '4+'],
                        ['Node.js', 'Advanced', '4+'],
                        ['Python', 'Intermediate', '3+'],
                    ],
                }
            },
            { id: 'sk3', type: 'heading', order: 2, data: { text: 'Design Tools', level: 3 } },
            {
                id: 'sk4', type: 'list', order: 3, data: {
                    style: 'bullet', items: [
                        'Figma (Expert)',
                        'Framer (Advanced)',
                        'After Effects (Intermediate)',
                        'Blender (Learning)',
                    ]
                }
            },
        ],
        zIndex: 0,
        commentsEnabled: true,
        order: 9,
    },
    {
        id: 'item-12',
        desktopId: 'goos-demo',
        label: 'Portfolio',
        thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop',
        positionX: 45,
        positionY: 52,
        windowTitle: 'Featured Work',
        windowSubtitle: 'Selected Projects',
        windowHeaderImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
        windowDescription: '',
        windowWidth: 540,
        windowDetails: null,
        windowGallery: null,
        windowLinks: null,
        useTabs: false,
        tabs: [],
        blocks: [
            {
                id: 'pf1', type: 'carousel', order: 0, data: {
                    images: [
                        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', caption: 'E-commerce Redesign' },
                        { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', caption: 'Analytics Dashboard' },
                        { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop', caption: 'Developer Tools' },
                    ],
                }
            },
            {
                id: 'pf2', type: 'stats', order: 1, data: {
                    items: [
                        { value: '50+', label: 'Projects' },
                        { value: '4.9', label: 'Rating', suffix: '★' },
                        { value: '100%', label: 'On Time' },
                    ]
                }
            },
            {
                id: 'pf3', type: 'buttons', order: 2, data: {
                    buttons: [
                        { label: 'View on Dribbble', url: 'https://dribbble.com', style: 'primary', newTab: true },
                        { label: 'View on Behance', url: 'https://behance.net', style: 'secondary', newTab: true },
                    ]
                }
            },
        ],
        zIndex: 0,
        commentsEnabled: true,
        order: 11,
    },
];

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
    dockItems: [],
    statusWidget: null,
    workbenchEntries: [],
};

// ============================================
// GOOS DESKTOP ICON (Sketch style)
// ============================================
const GoOSDesktopIcon = React.memo(({
    label,
    icon,
    thumbnailUrl,
    onClick,
    isActive,
    badge,
}: {
    label: string;
    icon?: React.ReactNode;
    thumbnailUrl?: string;
    onClick: () => void;
    isActive?: boolean;
    badge?: number;
}) => {
    const displayIcon = icon || PORTFOLIO_ICON_MAP[label] || <Folder size={28} fill={goOS.colors.accent.orangeLight} stroke={goOS.colors.border} strokeWidth={1.5} />;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={goOS.springs.snappy}
            className="flex flex-col items-center gap-2 cursor-pointer group w-20"
        >
            <motion.div
                className="relative w-14 h-14 flex items-center justify-center rounded-lg overflow-hidden"
                style={{
                    background: goOS.colors.cream,
                    border: `2px solid ${goOS.colors.border}`,
                    boxShadow: isActive ? goOS.shadows.hover : goOS.shadows.sm,
                }}
                animate={{
                    y: isActive ? -2 : 0,
                }}
            >
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={label}
                        fill
                        className="object-cover"
                        sizes="56px"
                        draggable={false}
                    />
                ) : (
                    displayIcon
                )}

                {/* Badge */}
                {badge !== undefined && badge > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1"
                        style={{
                            background: goOS.colors.accent.orange,
                            border: `1.5px solid ${goOS.colors.border}`,
                        }}
                    >
                        {badge > 99 ? '99+' : badge}
                    </motion.span>
                )}

                {/* Active indicator */}
                {isActive && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                        style={{ background: goOS.colors.border }}
                    />
                )}
            </motion.div>

            <span
                className="text-xs font-medium text-center leading-tight max-w-[80px] truncate px-1.5 py-0.5 rounded"
                style={{
                    color: goOS.colors.text.primary,
                    background: 'rgba(255,253,245,0.9)',
                    border: `1px solid ${goOS.colors.border}20`,
                }}
            >
                {label}
            </span>
        </motion.button>
    );
});

GoOSDesktopIcon.displayName = 'GoOSDesktopIcon';

// ============================================
// STICKY NOTE
// ============================================
type StickyNoteColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple';

const StickyNote = React.memo(({
    children,
    color = 'yellow',
    rotation = 0,
}: {
    children: React.ReactNode;
    color?: StickyNoteColor;
    rotation?: number;
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
            initial={{ rotate: rotation, scale: 0.8, opacity: 0 }}
            animate={{
                rotate: isHovered ? 0 : rotation,
                scale: isDragging ? 1.05 : isHovered ? 1.02 : 1,
                opacity: 1,
            }}
            transition={goOS.springs.bouncy}
            className="sticky-note relative cursor-grab active:cursor-grabbing select-none"
            style={{
                backgroundColor: goOS.colors.sticky[color],
                minWidth: '100px',
                padding: '12px 10px 16px 10px',
                zIndex: isDragging ? 100 : isHovered ? 50 : 1,
                boxShadow: isDragging
                    ? '8px 8px 16px rgba(0,0,0,0.2)'
                    : isHovered
                        ? '6px 6px 10px rgba(0,0,0,0.12)'
                        : '4px 4px 6px rgba(0,0,0,0.08)',
            }}
        >
            <div className="relative z-10" style={{ fontFamily: 'var(--font-gochi, "Comic Sans MS", cursive)' }}>
                {children}
            </div>
            <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2.5"
                style={{
                    background: 'linear-gradient(135deg, rgba(240,240,230,0.9) 0%, rgba(200,200,190,0.8) 100%)',
                    borderRadius: '1px',
                }}
            />
        </motion.div>
    );
});

StickyNote.displayName = 'StickyNote';

// ============================================
// RUBBER DUCK
// ============================================
const RubberDuck = React.memo(({ onClick }: { onClick?: () => void }) => {
    const [isQuacking, setIsQuacking] = useState(false);

    const handleClick = () => {
        setIsQuacking(true);
        onClick?.();
        setTimeout(() => setIsQuacking(false), 600);
    };

    return (
        <motion.button
            onClick={handleClick}
            className="relative flex items-center justify-center focus:outline-none w-10 h-10"
            whileHover={{ y: -6 }}
            transition={goOS.springs.gentle}
        >
            <motion.span
                className="text-2xl"
                animate={isQuacking ? {
                    rotate: [0, -15, 15, -10, 10, 0],
                    y: [0, -4, 0]
                } : {
                    rotate: [0, 2, 0, -2, 0],
                    y: [0, -1, 0]
                }}
                transition={isQuacking ? { duration: 0.5 } : { duration: 3, repeat: Infinity }}
            >
                🦆
            </motion.span>
            <AnimatePresence>
                {isQuacking && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: -30 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={goOS.springs.snappy}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white border-2 rounded-full px-2 py-0.5 text-xs whitespace-nowrap z-50"
                        style={{ borderColor: goOS.colors.border, boxShadow: goOS.shadows.sm }}
                    >
                        Quack!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

RubberDuck.displayName = 'RubberDuck';

// ============================================
// DOCK ICON
// ============================================
const DockIcon = React.memo(({
    icon,
    onClick,
    isActive,
    badge,
    label
}: {
    icon: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
    badge?: number;
    label?: string;
}) => (
    <motion.button
        onClick={onClick}
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.95 }}
        transition={goOS.springs.gentle}
        className="relative flex flex-col items-center focus:outline-none"
        title={label}
    >
        <div
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-orange-100' : 'hover:bg-black/5'
                }`}
            style={{ border: isActive ? `1.5px solid ${goOS.colors.border}` : 'none' }}
        >
            {icon}
        </div>
        {badge !== undefined && badge > 0 && (
            <span
                className="absolute -top-1 -right-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-0.5 z-10"
                style={{ background: goOS.colors.accent.orange }}
            >
                {badge}
            </span>
        )}
        {isActive && (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-1 h-1 rounded-full mt-1"
                style={{ background: goOS.colors.border }}
            />
        )}
    </motion.button>
));

DockIcon.displayName = 'DockIcon';

// ============================================
// SKETCH WINDOW
// ============================================
interface SketchWindowProps {
    id: string;
    title: string;
    icon?: React.ReactNode;
    isOpen: boolean;
    zIndex: number;
    defaultX: number;
    defaultY: number;
    width: number;
    height: number;
    onClose: () => void;
    onFocus: () => void;
    children: React.ReactNode;
}

function SketchWindow({ title, icon, isOpen, zIndex, defaultX, defaultY, width, height, onClose, onFocus, children }: SketchWindowProps) {
    if (!isOpen) return null;

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={goOS.springs.gentle}
            onMouseDown={onFocus}
            className="fixed flex flex-col rounded-sm overflow-hidden"
            style={{
                left: defaultX,
                top: defaultY,
                width,
                height,
                zIndex,
                background: goOS.colors.cream,
                border: `2px solid ${goOS.colors.border}`,
                boxShadow: goOS.shadows.solid
            }}
        >
            <div
                className="h-8 flex items-center justify-between px-3 select-none cursor-move flex-shrink-0"
                style={{ background: goOS.colors.windowBg, borderBottom: `2px solid ${goOS.colors.border}` }}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    {icon && <span className="opacity-60">{icon}</span>}
                    <span className="text-sm font-bold" style={{ color: goOS.colors.text.primary }}>{title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button className="w-4 h-4 flex items-center justify-center rounded-full bg-yellow-400 border border-yellow-600 hover:bg-yellow-300">
                        <Minus size={8} strokeWidth={3} className="text-yellow-800" />
                    </button>
                    <button className="w-4 h-4 flex items-center justify-center rounded-full bg-green-400 border border-green-600 hover:bg-green-300">
                        <Square size={6} strokeWidth={3} className="text-green-800" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-4 h-4 flex items-center justify-center rounded-full bg-red-400 border border-red-600 hover:bg-red-300"
                    >
                        <X size={8} strokeWidth={3} className="text-red-800" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto">{children}</div>
        </motion.div>
    );
}

// ============================================
// CELEBRATORY CHECKBOX
// ============================================
const CelebratoryCheckbox = ({ defaultChecked, label, isHot }: { defaultChecked: boolean; label: string; isHot?: boolean }) => {
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
        <motion.li className="flex items-center gap-3 relative" whileHover={{ x: 3 }}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: goOS.colors.accent.orange }}
                />
                <AnimatePresence>
                    {justChecked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            className="absolute inset-0 rounded-full"
                            style={{ background: `${goOS.colors.accent.orange}30` }}
                        />
                    )}
                </AnimatePresence>
            </div>
            <span className={`text-sm ${checked ? 'line-through opacity-50' : isHot ? 'font-semibold' : ''}`} style={{ color: isHot ? goOS.colors.accent.orangeDark : undefined }}>
                {label}
            </span>
        </motion.li>
    );
};

// ============================================
// TYPING INDICATOR
// ============================================
const TypingIndicator = () => (
    <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: goOS.colors.accent.orangeLight, border: `2px solid ${goOS.colors.border}` }}>🦆</div>
        <div className="bg-white border-2 rounded-xl rounded-tl-none px-4 py-2.5" style={{ borderColor: goOS.colors.border, boxShadow: goOS.shadows.sm }}>
            <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: goOS.colors.text.muted }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                ))}
            </div>
        </div>
    </div>
);

// ============================================
// MAIN CONTENT
// ============================================
function GoOSDemoContent() {
    const context = useEditContextSafe();
    const windowContext = useWindowContext();
    const [time, setTime] = useState('00:00');
    const [greeting, setGreeting] = useState('');
    const [topZIndex, setTopZIndex] = useState(100);
    const [logoClicks, setLogoClicks] = useState(0);
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    // goOS app windows
    const [appWindows, setAppWindows] = useState<Record<string, boolean>>({
        quackmail: true,
        notes: false,
        chat: false,
        settings: false,
        nest: false,
        shell: false,
    });

    const [windowZ, setWindowZ] = useState<Record<string, number>>({
        quackmail: 50,
        notes: 51,
        chat: 52,
        settings: 53,
        nest: 54,
        shell: 55,
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            const hour = now.getHours();
            if (hour < 5) setGreeting("Night owl? 🦉");
            else if (hour < 12) setGreeting("Good morning! ☀️");
            else if (hour < 17) setGreeting("Good afternoon! 🌤");
            else if (hour < 21) setGreeting("Good evening! 🌅");
            else setGreeting("Night owl? 🦉");
        };
        updateTime();
        const interval = setInterval(updateTime, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogoClick = () => {
        const newCount = logoClicks + 1;
        setLogoClicks(newCount);
        if (newCount >= 5) {
            setShowEasterEgg(true);
            setLogoClicks(0);
            setTimeout(() => setShowEasterEgg(false), 3000);
        }
    };

    const toggleApp = (id: string) => {
        setAppWindows(prev => ({ ...prev, [id]: !prev[id] }));
        if (!appWindows[id]) {
            setWindowZ(prev => ({ ...prev, [id]: topZIndex + 1 }));
            setTopZIndex(prev => prev + 1);
        }
    };

    const focusApp = (id: string) => {
        setWindowZ(prev => ({ ...prev, [id]: topZIndex + 1 }));
        setTopZIndex(prev => prev + 1);
    };

    const closeApp = (id: string) => {
        setAppWindows(prev => ({ ...prev, [id]: false }));
    };

    const items = context?.desktop?.items || [];

    // Get safe window dimensions
    const getWindowX = (base: number) => {
        if (typeof window === 'undefined') return base;
        return Math.min(base, window.innerWidth - 400);
    };

    return (
        <div
            className="min-h-screen w-full relative overflow-hidden theme-sketch"
            style={{
                backgroundColor: goOS.colors.paper,
                backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}
        >
            {/* MENU BAR */}
            <header
                className="h-10 flex items-center justify-between px-5 fixed top-0 left-0 right-0 z-[2000] select-none"
                style={{ background: goOS.colors.headerBg, borderBottom: `2px solid ${goOS.colors.border}` }}
            >
                <div className="flex items-center gap-6">
                    <motion.button
                        onClick={handleLogoClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xl font-bold relative"
                        style={{ color: goOS.colors.text.primary }}
                    >
                        goOS
                        <AnimatePresence>
                            {showEasterEgg && (
                                <>
                                    {['🦆', '🥚', '✨', '🎉', '🦆'].map((emoji, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ scale: 0, opacity: 1 }}
                                            animate={{ scale: [0, 1.5, 1], opacity: [1, 1, 0], x: (Math.random() - 0.5) * 100, y: -20 - Math.random() * 50 }}
                                            className="absolute left-1/2 top-0 text-lg pointer-events-none"
                                            transition={{ duration: 0.8, delay: i * 0.08 }}
                                        >
                                            {emoji}
                                        </motion.span>
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 24 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute left-1/2 -translate-x-1/2 top-full text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                                        style={{ background: goOS.colors.accent.orange }}
                                    >
                                        You found the duck! 🦆
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.button>
                    <nav className="flex gap-4 text-sm" style={{ color: goOS.colors.text.secondary }}>
                        {['File', 'Edit', 'View', 'Help'].map(item => (
                            <motion.span key={item} whileHover={{ scale: 1.05 }} className="cursor-pointer" style={{ ['--hover-color' as string]: goOS.colors.accent.orange }}>
                                {item}
                            </motion.span>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-sm" style={{ color: goOS.colors.text.secondary }}>
                    <span className="text-xs hidden sm:block">{greeting}</span>
                    <div className="flex items-center gap-1.5">
                        <Battery size={14} strokeWidth={2} />
                        <span className="text-xs font-medium">87%</span>
                    </div>
                    <Wifi size={14} strokeWidth={2} />
                    <span className="font-semibold" style={{ color: goOS.colors.text.primary }}>{time}</span>
                </div>
            </header>

            {/* DESKTOP AREA */}
            <main className="pt-10 pb-20 min-h-screen relative">
                {/* Sticky Notes (Left side) */}
                <div className="fixed top-16 left-4 z-[30] flex flex-col gap-3">
                    <StickyNote color="orange" rotation={-3}>
                        <span className="text-lg" style={{ color: goOS.colors.text.primary }}>goOS Demo</span>
                    </StickyNote>
                    <StickyNote color="yellow" rotation={4}>
                        <span className="text-[10px] uppercase tracking-wider block mb-0.5" style={{ color: goOS.colors.text.muted }}>tip</span>
                        <span className="text-base" style={{ color: goOS.colors.accent.orangeDark }}>Click the icons!</span>
                    </StickyNote>
                </div>

                {/* Decorative Plant (Right side) */}
                <motion.div
                    className="fixed top-16 right-6 z-[30] text-4xl select-none"
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: 'bottom center' }}
                >
                    🪴
                </motion.div>

                {/* Portfolio Desktop Icons - goOS style */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 pt-8">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 place-items-center">
                        {items.map((item) => (
                            <GoOSDesktopIcon
                                key={item.id}
                                label={item.label}
                                thumbnailUrl={item.thumbnailUrl}
                                onClick={() => windowContext.openWindow(item.id)}
                                isActive={windowContext.isItemOpen(item.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Portfolio Windows */}
                <WindowManager items={items} />

                {/* goOS App Windows */}
                <AnimatePresence>
                    <SketchWindow
                        id="quackmail"
                        title="Quackmail"
                        icon={<Mail size={14} />}
                        isOpen={appWindows.quackmail}
                        zIndex={windowZ.quackmail}
                        defaultX={getWindowX(500)}
                        defaultY={120}
                        width={360}
                        height={260}
                        onClose={() => closeApp('quackmail')}
                        onFocus={() => focusApp('quackmail')}
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: `1px solid ${goOS.colors.border}20` }}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase" style={{ color: goOS.colors.text.muted }}>From</span>
                                    <span className="text-sm font-bold" style={{ color: goOS.colors.text.primary }}>David</span>
                                    <span className="text-xs" style={{ color: goOS.colors.text.muted }}>12:05 PM</span>
                                </div>
                                <Heart size={18} style={{ color: goOS.colors.accent.orange }} fill={goOS.colors.accent.orange} />
                            </div>
                            <p className="text-lg font-bold mb-2" style={{ color: goOS.colors.text.primary }}>Hey there! 👋</p>
                            <p className="text-sm" style={{ color: goOS.colors.text.secondary }}>Welcome to goOS Demo! Click the portfolio items to explore.</p>
                        </div>
                    </SketchWindow>

                    <SketchWindow
                        id="notes"
                        title="Notes"
                        icon={<StickyNoteIcon size={14} />}
                        isOpen={appWindows.notes}
                        zIndex={windowZ.notes}
                        defaultX={150}
                        defaultY={200}
                        width={280}
                        height={300}
                        onClose={() => closeApp('notes')}
                        onFocus={() => focusApp('notes')}
                    >
                        <div className="p-4 h-full" style={{ background: '#FFFACD' }}>
                            <h3 className="text-base font-bold mb-3 pb-2" style={{ borderBottom: `1px solid ${goOS.colors.border}20` }}>📝 Todo List</h3>
                            <ul className="space-y-2">
                                <CelebratoryCheckbox defaultChecked={false} label="Explore the portfolio" />
                                <CelebratoryCheckbox defaultChecked={true} label="Check out goOS design" />
                                <CelebratoryCheckbox defaultChecked={false} label="HONK!!! 🦆" isHot />
                                <CelebratoryCheckbox defaultChecked={true} label="Have fun!" />
                            </ul>
                        </div>
                    </SketchWindow>

                    <SketchWindow
                        id="chat"
                        title="Chat"
                        icon={<MessageCircle size={14} />}
                        isOpen={appWindows.chat}
                        zIndex={windowZ.chat}
                        defaultX={getWindowX(600)}
                        defaultY={150}
                        width={340}
                        height={400}
                        onClose={() => closeApp('chat')}
                        onFocus={() => focusApp('chat')}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: goOS.colors.accent.orangeLight, border: `2px solid ${goOS.colors.border}` }}>🦆</div>
                                    <div className="bg-white border-2 rounded-xl rounded-tl-none px-4 py-2.5" style={{ borderColor: goOS.colors.border, boxShadow: goOS.shadows.sm }}>
                                        <span className="text-sm" style={{ color: goOS.colors.text.secondary }}>Welcome to goOS Demo! 🦆</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <div className="border-2 rounded-xl rounded-tr-none px-4 py-2.5" style={{ background: goOS.colors.accent.orangePale, borderColor: goOS.colors.border, boxShadow: goOS.shadows.sm }}>
                                        <span className="text-sm" style={{ color: goOS.colors.text.primary }}>This looks amazing!</span>
                                    </div>
                                </div>
                                <TypingIndicator />
                            </div>
                            <div className="p-3" style={{ background: goOS.colors.windowBg, borderTop: `2px solid ${goOS.colors.border}` }}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full px-4 py-2 bg-white border-2 rounded-lg text-sm focus:outline-none"
                                    style={{ borderColor: goOS.colors.border }}
                                />
                            </div>
                        </div>
                    </SketchWindow>

                    <SketchWindow
                        id="shell"
                        title="Shell"
                        icon={<Terminal size={14} />}
                        isOpen={appWindows.shell}
                        zIndex={windowZ.shell}
                        defaultX={200}
                        defaultY={140}
                        width={480}
                        height={300}
                        onClose={() => closeApp('shell')}
                        onFocus={() => focusApp('shell')}
                    >
                        <div className="h-full p-4 bg-[#0d0d0d] text-sm font-mono leading-relaxed">
                            <div className="text-[#666] text-xs mb-2">goOS Kernel v1.0.4-quack</div>
                            <div className="text-[#4ade80]">$ duck --status-check</div>
                            <div className="text-[#a3a3a3] pl-4">[OK] Quack levels nominal</div>
                            <div className="text-[#a3a3a3] pl-4">[OK] Portfolio loaded</div>
                            <div className="mt-3 text-[#facc15]">$ portfolio --show</div>
                            <div className="pl-4 mt-1" style={{ color: goOS.colors.accent.orange }}>READY... [████████████] 100%</div>
                            <div className="text-[#4ade80] animate-pulse mt-4">$ _</div>
                        </div>
                    </SketchWindow>

                    <SketchWindow
                        id="nest"
                        title="Nest"
                        icon={<Folder size={14} />}
                        isOpen={appWindows.nest}
                        zIndex={windowZ.nest}
                        defaultX={100}
                        defaultY={100}
                        width={420}
                        height={340}
                        onClose={() => closeApp('nest')}
                        onFocus={() => focusApp('nest')}
                    >
                        <div className="p-6">
                            <div className="grid grid-cols-3 gap-4">
                                {['Docs', 'Photos', 'Projects', 'Music', 'About', 'Contact'].map(name => (
                                    <button key={name} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-black/5 transition-colors">
                                        <Folder size={36} fill={goOS.colors.accent.orangeLight} stroke={goOS.colors.border} strokeWidth={1.5} />
                                        <span className="text-sm" style={{ color: goOS.colors.text.primary }}>{name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </SketchWindow>

                    <SketchWindow
                        id="settings"
                        title="Settings"
                        icon={<Settings size={14} />}
                        isOpen={appWindows.settings}
                        zIndex={windowZ.settings}
                        defaultX={350}
                        defaultY={180}
                        width={380}
                        height={280}
                        onClose={() => closeApp('settings')}
                        onFocus={() => focusApp('settings')}
                    >
                        <div className="p-5 space-y-4">
                            <div>
                                <h4 className="text-sm font-bold mb-3 pb-2" style={{ borderBottom: `1px solid ${goOS.colors.border}20` }}>Appearance</h4>
                                <div className="flex items-center justify-between p-3 bg-white border-2 rounded-lg" style={{ borderColor: goOS.colors.border }}>
                                    <span className="text-sm">Dark Mode</span>
                                    <div className="w-10 h-5 rounded-full relative cursor-pointer" style={{ background: goOS.colors.border }}>
                                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold mb-3 pb-2" style={{ borderBottom: `1px solid ${goOS.colors.border}20` }}>About</h4>
                                <p className="text-sm" style={{ color: goOS.colors.text.secondary }}>goOS Demo — A playful portfolio experience</p>
                            </div>
                        </div>
                    </SketchWindow>
                </AnimatePresence>
            </main>

            {/* DOCK */}
            <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[3000]">
                <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                    style={{
                        background: goOS.colors.headerBg,
                        border: `2px solid ${goOS.colors.border}`,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }}
                >
                    <RubberDuck />
                    <DockIcon
                        icon={<Folder size={24} fill={goOS.colors.accent.orangeLight} stroke={goOS.colors.border} strokeWidth={1.5} />}
                        onClick={() => toggleApp('nest')}
                        isActive={appWindows.nest}
                        label="Nest"
                    />
                    <DockIcon
                        icon={<div className="w-6 h-6 flex items-center justify-center rounded bg-white text-xs font-bold" style={{ border: `2px solid ${goOS.colors.border}` }}>23</div>}
                        onClick={() => { }}
                        label="Calendar"
                    />
                    <DockIcon
                        icon={<Mail size={24} stroke={goOS.colors.border} strokeWidth={1.5} />}
                        onClick={() => toggleApp('quackmail')}
                        isActive={appWindows.quackmail}
                        badge={3}
                        label="Mail"
                    />
                    <DockIcon
                        icon={<Camera size={24} stroke={goOS.colors.border} strokeWidth={1.5} />}
                        onClick={() => {
                            const photoItem = items.find(i => i.label === 'Photography');
                            if (photoItem) windowContext.openWindow(photoItem.id);
                        }}
                        label="Photos"
                    />
                    <DockIcon
                        icon={<FileText size={24} stroke={goOS.colors.border} strokeWidth={1.5} />}
                        onClick={() => toggleApp('notes')}
                        isActive={appWindows.notes}
                        label="Notes"
                    />
                    <div className="w-px h-8 bg-black/10 mx-1" />
                    <DockIcon
                        icon={<MessageCircle size={24} stroke={goOS.colors.border} strokeWidth={1.5} />}
                        onClick={() => toggleApp('chat')}
                        isActive={appWindows.chat}
                        label="Chat"
                    />
                    <DockIcon
                        icon={<Terminal size={24} stroke={goOS.colors.border} strokeWidth={1.5} />}
                        onClick={() => toggleApp('shell')}
                        isActive={appWindows.shell}
                        label="Shell"
                    />
                    <DockIcon
                        icon={<Settings size={24} stroke={goOS.colors.border} strokeWidth={1.5} />}
                        onClick={() => toggleApp('settings')}
                        isActive={appWindows.settings}
                        label="Settings"
                    />
                </div>
            </footer>

            {/* Made with badge */}
            <motion.a
                href="/"
                className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-full text-[10px] font-medium"
                style={{
                    background: goOS.colors.headerBg,
                    border: `2px solid ${goOS.colors.border}`,
                    color: goOS.colors.text.primary,
                    boxShadow: goOS.shadows.sm,
                }}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Made with goOS
            </motion.a>

            <SaveIndicator />
            <Toast />
        </div>
    );
}

// ============================================
// MAIN EXPORT
// ============================================
export default function GoOSDemoPage() {
    return (
        <ThemeProvider initialTheme="sketch" forceTheme={true}>
            <EditProvider initialDesktop={DEMO_DESKTOP} initialIsOwner={false} demoMode={true}>
                <WindowProvider>
                    <GoOSDemoContent />
                </WindowProvider>
            </EditProvider>
        </ThemeProvider>
    );
}
