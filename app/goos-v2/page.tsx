'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
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
    BarChart3,
    BookOpen,
    PenLine,
    Presentation,
} from 'lucide-react';
import { EditProvider, useEditContextSafe } from '@/contexts/EditContext';
import { WindowProvider, useWindowContext } from '@/contexts/WindowContext';
// ThemeProvider removed - using only Appart theme via data-theme attribute
import { WindowManager } from '@/components/desktop/MultiWindow';
import { SaveIndicator, Toast } from '@/components/editing/SaveIndicator';
import { type GuestbookEntry } from '@/components/desktop/Guestbook';
import type { DesktopItem, Desktop } from '@/types';
import {
    GoOSFileIcon,
    GoOSDesktopContextMenu,
    GoOSFileContextMenu,
    GoOSFolderWindow,
    GoOSCreateFileDialog,
    GoOSLinkBrowserWindow,
    GoOSSnakeGame,
    type GoOSFile,
    type FileType,
} from '@/components/goos-editor';
import { GoOSProvider, useGoOS, type GoOSFileData } from '@/contexts/GoOSContext';
import { WidgetProvider, useWidgets } from '@/contexts/WidgetContext';
import { WidgetRenderer, WIDGET_METADATA, WidgetContextMenu } from '@/components/widgets';
import { ClockWidgetEditor } from '@/components/widgets/ClockWidgetEditor';
import type { Widget } from '@/types';
import { PresentView } from '@/components/views';
import { DrawingApp } from '@/components/apps/DrawingApp';
import { PresentationView } from '@/components/presentation';
import { CaseStudyPageView } from '@/components/casestudy';
import type { ViewMode, WidgetType, SpaceSummary } from '@/types';
import { SpaceSwitcher, CreateSpaceModal, ManageSpacesDialog } from '@/components/spaces';
import {
    SPRING,
    DURATION,
    EASE,
    fadeInUp,
    fadeInScale,
    TRANSITION,
    WILL_CHANGE,
    getStaggerDelayCapped,
    windowOpen,
    menuBarEntrance,
    dockEntrance,
    contextMenu,
    buttonPress,
} from '@/lib/animations';
import { playSound } from '@/lib/sounds';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { DesktopReveal } from '@/components/desktop-reveal/DesktopReveal';
import { WALLPAPERS } from '@/lib/wallpapers';
import { FallingLetters } from '@/components/desktop/FallingLetters';
// import { LiquidBackground } from '@/components/desktop/LiquidBackground'; // Disabled for performance

// ============================================
// DEMO SPACES (for SpaceSwitcher demo)
// ============================================
const DEMO_SPACES: SpaceSummary[] = [
    { id: 'space-1', name: 'Portfolio', icon: '🎨', slug: null, isPrimary: true, isPublic: true, order: 0, fileCount: 12 },
    { id: 'space-2', name: 'Writing', icon: '✍️', slug: 'writing', isPrimary: false, isPublic: true, order: 1, fileCount: 8 },
    { id: 'space-3', name: 'Photography', icon: '📸', slug: 'photos', isPrimary: false, isPublic: true, order: 2, fileCount: 24 },
    { id: 'space-4', name: 'Personal', icon: '🔐', slug: null, isPrimary: false, isPublic: false, order: 3, fileCount: 5 },
];

// ============================================
// SPACE-SPECIFIC FILE PREFIXES - Files are filtered by space
// Files with IDs starting with these prefixes belong to that space
// ============================================
const SPACE_FILE_PREFIXES: Record<string, string[]> = {
    'space-1': ['file-1', 'file-2', 'file-3', 'file-4', 'file-5', 'file-6', 'file-prompts', 'game-snake'], // Portfolio - existing demo files
    'space-2': ['writing-'], // Writing space
    'space-3': ['photo-'], // Photography space
    'space-4': ['personal-'], // Personal space
};

// Demo files for Writing space (space-2) - A writer's workspace
const WRITING_SPACE_FILES: GoOSFileData[] = [
    {
        id: 'writing-1',
        type: 'note',
        title: 'Newsletter #47: On Simplicity',
        content: '<h1>Newsletter #47: On Simplicity</h1><p>This week I\'ve been thinking about what we leave out. The art of omission...</p><p>Every great piece of writing is defined as much by what it excludes as what it includes.</p>',
        status: 'published',
        accessLevel: 'free',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 5, y: 25 },
    },
    {
        id: 'writing-2',
        type: 'folder',
        title: 'Essays',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 22, y: 25 },
    },
    {
        id: 'writing-3',
        type: 'note',
        title: 'Draft: Why I Write',
        content: '<h1>Why I Write</h1><p>I write to think. The act of putting words on paper forces clarity...</p><p>There\'s something about the blank page that demands honesty.</p>',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 39, y: 25 },
    },
    {
        id: 'writing-4',
        type: 'link',
        title: 'Substack',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 56, y: 25 },
        linkUrl: 'https://substack.com',
        linkTitle: 'My Newsletter',
    },
    {
        id: 'writing-5',
        type: 'folder',
        title: 'Book Notes',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 5, y: 50 },
    },
    {
        id: 'writing-6',
        type: 'note',
        title: 'Interview Questions',
        content: '<h1>Interview Prep</h1><ul><li>What inspired your latest piece?</li><li>Your writing process?</li><li>Advice for aspiring writers?</li></ul>',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now()),
        parentId: null,
        position: { x: 22, y: 50 },
    },
    {
        id: 'writing-7',
        type: 'note',
        title: 'Reading List 2024',
        content: '<h1>Reading List</h1><ul><li>✓ Bird by Bird - Anne Lamott</li><li>✓ On Writing - Stephen King</li><li>○ The War of Art</li><li>○ Zen in the Art of Writing</li></ul>',
        status: 'published',
        accessLevel: 'free',
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 39, y: 50 },
    },
    {
        id: 'writing-8',
        type: 'folder',
        title: 'Archive',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 56, y: 50 },
    },
];

// Demo files for Photography space (space-3) - A photographer's gallery
const PHOTOGRAPHY_SPACE_FILES: GoOSFileData[] = [
    {
        id: 'photo-1',
        type: 'image',
        title: 'Tokyo Nights',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 5, y: 25 },
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop',
        imageCaption: 'Shibuya crossing at midnight',
        imageAlt: 'Tokyo cityscape at night with neon lights',
    },
    {
        id: 'photo-2',
        type: 'folder',
        title: 'Japan 2024',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 22, y: 25 },
    },
    {
        id: 'photo-3',
        type: 'image',
        title: 'Morning Fog',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 39, y: 25 },
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        imageCaption: 'Dolomites at dawn',
        imageAlt: 'Mountain peaks emerging from fog',
    },
    {
        id: 'photo-4',
        type: 'image',
        title: 'Street Portrait #12',
        content: '',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now()),
        parentId: null,
        position: { x: 56, y: 25 },
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop',
        imageCaption: 'Work in progress',
        imageAlt: 'Portrait study',
    },
    {
        id: 'photo-5',
        type: 'folder',
        title: 'Landscapes',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 5, y: 50 },
    },
    {
        id: 'photo-6',
        type: 'link',
        title: 'Instagram',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 22, y: 50 },
        linkUrl: 'https://instagram.com',
        linkTitle: '@photographer',
    },
    {
        id: 'photo-7',
        type: 'image',
        title: 'Abstract #7',
        content: '',
        status: 'published',
        accessLevel: 'premium',
        publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 39, y: 50 },
        imageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=1200&h=800&fit=crop',
        imageCaption: 'Light and shadow study',
        imageAlt: 'Abstract architectural photograph',
    },
    {
        id: 'photo-8',
        type: 'folder',
        title: 'Client Work',
        content: '',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 56, y: 50 },
    },
    {
        id: 'photo-9',
        type: 'note',
        title: 'Gear List',
        content: '<h1>Current Kit</h1><ul><li>Sony A7IV</li><li>24-70mm f/2.8 GM</li><li>85mm f/1.4 GM</li><li>Peak Design bag</li></ul>',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 73, y: 25 },
    },
    {
        id: 'photo-10',
        type: 'folder',
        title: 'Portraits',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 73, y: 50 },
    },
];

// Demo files for Personal space (space-4) - Private notes and ideas
const PERSONAL_SPACE_FILES: GoOSFileData[] = [
    {
        id: 'personal-1',
        type: 'note',
        title: 'Goals 2024',
        content: '<h1>2024 Goals</h1><ul><li>☑ Launch portfolio site</li><li>☐ Write 12 newsletters</li><li>☐ Learn Blender</li><li>☐ Take a proper vacation</li></ul>',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 5, y: 25 },
    },
    {
        id: 'personal-2',
        type: 'folder',
        title: 'Finances',
        content: '',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 22, y: 25 },
    },
    {
        id: 'personal-3',
        type: 'note',
        title: 'App Ideas',
        content: '<h1>Ideas to explore</h1><ul><li>Habit tracker with streaks</li><li>Recipe organizer</li><li>Mood journal</li></ul><p>Maybe start with the habit tracker?</p>',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 39, y: 25 },
    },
    {
        id: 'personal-4',
        type: 'link',
        title: 'Bank',
        content: '',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 56, y: 25 },
        linkUrl: 'https://example-bank.com',
        linkTitle: 'Online Banking',
    },
    {
        id: 'personal-5',
        type: 'folder',
        title: 'Receipts',
        content: '',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 5, y: 50 },
    },
    {
        id: 'personal-6',
        type: 'note',
        title: 'Passwords (encrypted)',
        content: '<h1>Important Accounts</h1><p>This is a placeholder - use a real password manager!</p>',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 22, y: 50 },
    },
    {
        id: 'personal-7',
        type: 'note',
        title: 'Journal - Dec 15',
        content: '<p>Good day today. Finally finished that project I\'d been putting off. Sometimes you just need to start.</p>',
        status: 'draft',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now()),
        parentId: null,
        position: { x: 39, y: 50 },
    },
];

// Get files for a specific space
function getSpaceFiles(spaceId: string, allFiles: GoOSFileData[]): GoOSFileData[] {
    const prefixes = SPACE_FILE_PREFIXES[spaceId];
    if (!prefixes) return [];

    // Get dynamically created files (local- or temp- prefix) from allFiles
    const dynamicFiles = allFiles.filter(f => f.id.startsWith('local-') || f.id.startsWith('temp-'));

    // For space-1 (Portfolio), use the main demo files + dynamic files
    if (spaceId === 'space-1') {
        const demoFiles = allFiles.filter(f => prefixes.some(prefix => f.id.startsWith(prefix)));
        return [...demoFiles, ...dynamicFiles];
    }

    // For other spaces, return their specific demo files + dynamic files
    if (spaceId === 'space-2') return [...WRITING_SPACE_FILES, ...dynamicFiles];
    if (spaceId === 'space-3') return [...PHOTOGRAPHY_SPACE_FILES, ...dynamicFiles];
    if (spaceId === 'space-4') return [...PERSONAL_SPACE_FILES, ...dynamicFiles];

    return dynamicFiles;
}

// ============================================
// PLAYFUL LOADING MESSAGES
// ============================================
const LOADING_MESSAGES = [
    { text: "Warming up the pixels...", emoji: "✨" },
    { text: "Feeding the code hamsters...", emoji: "🐹" },
    { text: "Convincing electrons to cooperate...", emoji: "⚡" },
    { text: "Polishing the interface...", emoji: "💅" },
    { text: "Brewing some fresh code...", emoji: "☕" },
    { text: "Teaching bits to dance...", emoji: "💃" },
    { text: "Waking up the servers...", emoji: "😴" },
    { text: "Untangling the spaghetti code...", emoji: "🍝" },
    { text: "Asking AI for directions...", emoji: "🤖" },
    { text: "Summoning the editor spirits...", emoji: "👻" },
    { text: "Almost there, pinky promise...", emoji: "🤙" },
    { text: "Loading awesomeness...", emoji: "🚀" },
];

function PlayfulLoader() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Rotate messages every 2 seconds
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);

        // Animate dots every 400ms
        const dotInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 400);

        return () => {
            clearInterval(messageInterval);
            clearInterval(dotInterval);
        };
    }, []);

    const message = LOADING_MESSAGES[messageIndex];

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 rounded-xl border-2"
                style={{
                    background: 'var(--color-bg-base)',
                    borderColor: 'var(--color-text-primary)',
                    boxShadow: 'var(--shadow-md)',
                }}
            >
                <div className="flex items-center gap-3">
                    <motion.span
                        key={messageIndex}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-2xl"
                    >
                        {message.emoji}
                    </motion.span>
                    <div>
                        <motion.div
                            key={message.text}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {message.text}
                        </motion.div>
                        <div
                            className="text-xs mt-1 font-mono w-8"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {dots || '\u00A0'}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Lazy load heavy editor component (includes TipTap + all extensions)
const GoOSEditorWindow = dynamic(
    () => import('@/components/goos-editor/GoOSEditorWindow').then(mod => ({ default: mod.GoOSEditorWindow })),
    {
        loading: () => <PlayfulLoader />,
        ssr: false
    }
);

// Lazy load CV window component
const GoOSCVWindow = dynamic(
    () => import('@/components/goos-editor/cv/GoOSCVWindow').then(mod => ({ default: mod.GoOSCVWindow })),
    {
        loading: () => <PlayfulLoader />,
        ssr: false
    }
);

// ============================================
// GOOS DESIGN TOKENS - Calm-Tech 2025 Design System
// Note: icon.* values are hex for SVG attributes, colors.* are CSS vars for styles
// ============================================
// ============================================
// ICON COLORS - Returns hex values based on theme mode
// CSS Variables for theme-aware colors (no isDark needed - CSS handles it)
// ============================================
const getIconColors = () => ({
    stroke: 'var(--icon-stroke)',
    fill: 'var(--icon-fill)',
    accent: 'var(--icon-accent)',
    muted: 'var(--icon-muted)',
});

// ============================================
// STICKY NOTE COLORS - CSS Variables (theme-aware via CSS)
// ============================================
const getStickyColors = () => ({
    yellow: 'var(--sticky-yellow)',
    blue: 'var(--sticky-blue)',
    pink: 'var(--sticky-pink)',
    green: 'var(--sticky-green)',
    orange: 'var(--sticky-orange)',
    purple: 'var(--sticky-purple)',
});

const goOS = {
    // CSS Variables for style props (backgrounds, text, borders)
    colors: {
        paper: 'var(--color-bg-base)',
        cream: 'var(--color-bg-base)',
        headerBg: 'var(--color-bg-glass, rgba(251, 249, 239, 0.92))',
        windowBg: 'var(--color-bg-base)',
        white: 'var(--color-bg-white)',
        border: 'var(--color-border-default)',
        borderSubtle: 'var(--color-border-subtle)',
        text: {
            primary: 'var(--color-text-primary)',
            secondary: 'var(--color-text-secondary)',
            muted: 'var(--color-text-muted)',
            inverse: 'var(--color-text-inverse)',
        },
        accent: {
            primary: 'var(--color-accent-primary)',
            dark: 'var(--color-accent-primary-hover)',
            light: 'var(--color-accent-primary-subtle)',
            pale: 'var(--color-accent-primary-subtle)',
            glow: 'var(--color-accent-primary-glow)',
        },
        traffic: {
            close: 'var(--color-traffic-close)',
            minimize: 'var(--color-traffic-minimize)',
            maximize: 'var(--color-traffic-maximize)',
            border: 'var(--color-text-primary)',
        },
        sticky: {
            yellow: 'var(--sticky-yellow)',
            blue: 'var(--sticky-blue)',
            pink: 'var(--sticky-pink)',
            green: 'var(--sticky-green)',
            orange: 'var(--sticky-orange)',
            purple: 'var(--sticky-purple)',
        }
    },
    // CSS variables for icons - theme-aware
    icon: {
        stroke: 'var(--icon-stroke)',
        fill: 'var(--icon-fill)',
        accent: 'var(--icon-accent)',
        muted: 'var(--icon-muted)',
    },
    shadows: {
        solid: 'var(--shadow-md)',
        hover: 'var(--shadow-lg)',
        sm: 'var(--shadow-sm)',
        button: 'var(--shadow-sm)',
        window: 'var(--shadow-window)',
        dock: 'var(--shadow-dock)',
    },
    radii: {
        card: 'var(--radius-lg)',
        button: 'var(--radius-md)',
        window: 'var(--window-radius)',
    },
    springs: {
        snappy: SPRING.snappy,
        gentle: SPRING.gentle,
        bouncy: SPRING.bouncy,
        smooth: SPRING.smooth,
        dock: SPRING.dock,
        goose: SPRING.goose,
        playful: SPRING.playful,
        wobbly: SPRING.wobbly,
    }
};

// ============================================
// PORTFOLIO ITEMS WITH ICONS
// ============================================
const PORTFOLIO_ICON_MAP: Record<string, React.ReactNode> = {
    'About Me': <User size={28} stroke={goOS.icon.stroke} strokeWidth={1.5} />,
    'Projects': <Briefcase size={28} stroke={goOS.icon.stroke} strokeWidth={1.5} />,
    'Photography': <Camera size={28} stroke={goOS.icon.stroke} strokeWidth={1.5} />,
    'Testimonials': <MessageSquare size={28} stroke={goOS.icon.stroke} strokeWidth={1.5} />,
    'Contact': <Phone size={28} stroke={goOS.icon.stroke} strokeWidth={1.5} />,
    'Skills': <Code size={28} stroke={goOS.icon.stroke} strokeWidth={1.5} />,
    'Portfolio': <Palette size={28} stroke={goOS.icon.stroke} strokeWidth={1.5} />,
    'Resume': <FileText size={28} stroke={goOS.icon.stroke} strokeWidth={1.5} />,
};

// ============================================
// DEMO GUESTBOOK ENTRIES
// ============================================
const DEMO_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
    {
        id: 'gb-1',
        message: 'Love the playful design! The sticky notes are such a nice touch 🦆',
        type: 'general',
        authorType: 'named',
        authorName: 'Sarah',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isPublic: true,
    },
    {
        id: 'gb-2',
        message: 'Would love to collaborate on a project! Your work is inspiring.',
        type: 'opportunity',
        authorType: 'named',
        authorName: 'Mike T.',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        isPublic: true,
        ownerMarkedHelpful: true,
    },
    {
        id: 'gb-3',
        message: 'This is the most creative portfolio I\'ve seen. Bookmarked!',
        type: 'feedback',
        authorType: 'anonymous',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        isPublic: true,
    },
];

// ============================================
// DEMO ANALYTICS DATA
// ============================================
const DEMO_ANALYTICS_DATA = {
    overview: {
        visitors: 847,
        visitorsChange: 18,
        pageViews: 2341,
        pageViewsChange: 12,
        avgTime: '3m 12s',
        avgTimeChange: 5,
    },
    sources: [
        { name: 'Direct', count: 312, percentage: 37 },
        { name: 'Twitter', count: 245, percentage: 29 },
        { name: 'LinkedIn', count: 156, percentage: 18 },
        { name: 'Dribbble', count: 89, percentage: 11 },
        { name: 'Other', count: 45, percentage: 5 },
    ],
    visitorTypes: {
        recruiters: { count: 67, percentage: 8 },
        visitors: { count: 712, percentage: 84 },
        skipped: { count: 68, percentage: 8 },
    },
    topContent: [
        { name: 'About Me', opens: 623, change: 8 },
        { name: 'Projects', opens: 489, change: 15 },
        { name: 'Photography', opens: 234, change: -3 },
        { name: 'Contact', opens: 156, change: 22 },
        { name: 'Skills', opens: 98, change: 5 },
    ],
    recruiterFunnel: {
        visited: 67,
        viewedWork: 52,
        downloadedCV: 28,
        contacted: 9,
    },
    liveVisitors: [
        { location: 'San Francisco, US', viewing: 'Projects', duration: '2m 45s' },
        { location: 'Berlin, DE', viewing: 'About Me', duration: '1m 12s' },
    ],
};

// ============================================
// ============================================
// DEMO FILES (goOS Editor)
// ============================================
// Initial files for GoOSProvider (GoOSFileData format)
const INITIAL_GOOS_FILES: GoOSFileData[] = [
    {
        id: 'file-1',
        type: 'note',
        title: 'Welcome to goOS',
        content: '<h1>Welcome to goOS!</h1><p>This is your digital creative space. Use the editor to write notes, case studies, and more.</p><p>Try the formatting toolbar above to style your text.</p>',
        status: 'published',
        accessLevel: 'free',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 5, y: 35 },
        headerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&h=1080&fit=crop',
    },
    {
        id: 'file-2',
        type: 'case-study',
        title: 'Reforge Robotics',
        headerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&h=1080&fit=crop',
        content: `<img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&h=1080&fit=crop" alt="Robotics hero" />

<h2>Overview</h2>

<p>In my recent side time, I built a brand design studio, called "BOWEN," with only me and my partner. Reforge Robotics is one of the first clients we worked with to build their brand from 0 to 1 development and deployment. The result of this collaboration is a fully-fleshed out brand guidelines, a website, and ongoing marketing collateral. This project is still ongoing as of now.</p>

<h4>Deliverables</h4>

<p>Website ↗</p>

<img src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1920&h=1080&fit=crop" alt="Robot arm in factory" />

<h2>The Logo</h2>

<h4>The Challenge</h4>

<p>Building a bold look for an even bolder company. Reforge Robotics needed a visual identity that communicated innovation, precision, and forward-thinking technology while remaining approachable and memorable.</p>

<p>We explored dozens of concepts, from abstract geometric forms to more literal robotic interpretations. The final direction emerged from the intersection of industrial strength and elegant simplicity.</p>

<img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop" alt="Logo concept R" />
<img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop" alt="Technology abstract" />

<p>The mark represents the fusion of human ingenuity and machine precision. The angular forms suggest forward momentum while maintaining a sense of stability and trust.</p>

<img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=1080&fit=crop" alt="Robotics lab" />

<h2>The Brand</h2>

<h4>Visual System</h4>

<p>The brand system extends beyond the logo to create a cohesive visual language. We developed a comprehensive color palette rooted in industrial blues and metallic accents, balanced with warm neutrals for approachability.</p>

<img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&h=1080&fit=crop" alt="Tech brand colors" />

<p>Typography plays a crucial role in establishing the brand's voice. We paired a geometric sans-serif for headlines with a highly legible body font, creating a balance between innovation and clarity.</p>

<img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&h=1080&fit=crop" alt="Robot detail" />
<img src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1920&h=1080&fit=crop" alt="Industrial robotics" />

<h2>UI & Visual</h2>

<h4>Digital Experience</h4>

<p>The website serves as the primary touchpoint for potential clients and partners. We designed an experience that showcases Reforge's capabilities while maintaining the sophisticated, professional tone established in the brand guidelines.</p>

<img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop" alt="Website mockup" />

<p>Interactive elements and subtle animations bring the brand to life on screen, creating moments of delight without compromising usability or performance.</p>

<img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920&h=1080&fit=crop" alt="UI components" />

<h2>Final Delivery</h2>

<h4>Brand Guidelines</h4>

<p>The complete brand package includes comprehensive guidelines covering logo usage, color specifications, typography hierarchies, photography direction, and voice & tone principles.</p>

<img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop" alt="Brand book" />

<p>This living document ensures consistency across all touchpoints as Reforge continues to grow and evolve. The system is designed to be both rigorous and flexible, providing clear guardrails while allowing room for creative expression.</p>

<img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=1080&fit=crop" alt="Final presentation" />`,
        status: 'published',
        accessLevel: 'free',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        parentId: null,
        position: { x: 13, y: 35 },
    },
    {
        id: 'file-prompts',
        type: 'note',
        title: 'AI Image Prompts',
        content: `<h1>goOS — AI Image Generation Prompts</h1><p>Copy and paste each prompt directly into Midjourney, DALL-E, or your preferred AI image tool.</p><hr><h2>HERO ILLUSTRATIONS</h2><h3>Prompt 1: Goose at the Desk (Main Hero)</h3><p>Line illustration of a goose sitting at a desk working on a laptop, surrounded by floating papers, folders, and sticky notes in organized chaos. Other human coworkers in the background look impressed and confused. Mediterranean blue line art on cream white background. Hand-drawn imperfect lines, minimal halftone dot patterns for shading. Whimsical, absurd, professional yet funny. Style of editorial illustration, simple and clean.</p><h3>Prompt 2: Goose Running a Business</h3><p>Line illustration of a confident goose in a cozy home office, multiple browser windows floating around, coffee mug, plants, files neatly scattered on desk. The goose looks pleased with itself. Mediterranean blue monochrome line art on warm cream background. Hand-drawn editorial illustration style with subtle halftone textures. Charming, slightly absurd, warm and inviting.</p><h3>Prompt 3: Goose Welcoming Visitors</h3><p>Line illustration of a friendly goose standing at the entrance of a cozy digital workspace, gesturing welcomingly with one wing. Floating icons and windows in the background suggesting a desktop environment. Mediterranean blue line drawing on off-white cream background. Simple, warm, hand-drawn feel with minimal halftone shading. Inviting and slightly humorous.</p><hr><h2>FEATURE ILLUSTRATIONS</h2><h3>Prompt 4: Goose Selling Digital Products</h3><p>Line illustration of a goose handing a glowing file folder through a window to a happy customer. Coins and sparkles floating between them. Simple transaction moment. Mediterranean blue line art on cream background. Hand-drawn editorial style, imperfect charming lines, subtle halftone dots. Whimsical and friendly, like a neighborhood shop.</p><h3>Prompt 5: Goose Teaching a Course</h3><p>Line illustration of a goose standing at a small chalkboard or whiteboard, pointing at diagrams, with attentive students (mix of humans and other birds) sitting with laptops. Floating video icons and folder icons around. Mediterranean blue monochrome line drawing on warm cream background. Hand-drawn style with halftone textures. Educational but absurd and charming.</p><h3>Prompt 6: Goose Organizing Files</h3><p>Line illustration of a goose surrounded by a tornado of papers, folders, images, and documents, but the goose looks calm and in control, casually sorting them with its wings. Organized chaos energy. Mediterranean blue line art on cream white background. Editorial illustration style, hand-drawn imperfect lines, minimal halftone shading. Funny and relatable.</p><h3>Prompt 7: Goose Sharing Work</h3><p>Line illustration of a goose proudly showing off a framed piece of work to a small audience of impressed viewers. Social media hearts and share icons floating above. Mediterranean blue line drawing on off-white background. Simple hand-drawn editorial style with subtle halftone patterns. Warm, celebratory, slightly absurd.</p><hr><h2>EMPTY STATE ILLUSTRATIONS</h2><h3>Prompt 8: Goose on Empty Desktop</h3><p>Line illustration of a single goose sitting in the middle of an empty minimalist desktop space, looking at the viewer expectantly, head slightly tilted. One small file icon next to it. Lots of white space. Mediterranean blue line art on cream background. Simple, minimal, hand-drawn style. Cute, patient, slightly lonely but hopeful.</p><h3>Prompt 9: Goose Waiting to Start</h3><p>Line illustration of a goose sitting on an empty desk, wings folded, looking up with anticipation. A single cursor arrow hovering nearby. Very minimal composition with lots of breathing room. Mediterranean blue line drawing on warm cream background. Hand-drawn editorial style, charming and inviting. Caption energy: "Let's make something."</p><h3>Prompt 10: Goose with Empty Folder</h3><p>Line illustration of a goose holding an open empty folder, peering inside it curiously, then looking at the viewer with a shrug. Minimal background. Mediterranean blue monochrome line art on off-white background. Hand-drawn imperfect lines, simple and charming. Funny empty state energy.</p><hr><h2>ERROR STATE ILLUSTRATIONS</h2><h3>Prompt 11: Goose Looking Guilty</h3><p>Line illustration of a goose looking guilty and sheepish, standing next to a knocked-over stack of papers and a spilled coffee mug. Oops energy. Mediterranean blue line art on cream background. Hand-drawn editorial illustration style with subtle halftone shading. Sympathetic and funny, not frustrating.</p><h3>Prompt 12: Goose Lost</h3><p>Line illustration of a confused goose holding a map upside down, surrounded by floating question marks and tangled paths. Lost but not panicked. Mediterranean blue line drawing on warm cream background. Simple hand-drawn style, imperfect charming lines. Humorous 404 error energy.</p><h3>Prompt 13: Goose Fixing Things</h3><p>Line illustration of a determined goose wearing tiny safety goggles, holding a wrench, working on fixing a floating broken window icon. Sparks and tools scattered around. Mediterranean blue line art on off-white background. Hand-drawn editorial style with halftone textures. Reassuring and funny, "we're on it" energy.</p><hr><h2>SUCCESS / CELEBRATION ILLUSTRATIONS</h2><h3>Prompt 14: Goose Celebrating</h3><p>Line illustration of an excited goose throwing confetti, wings spread wide in celebration. Floating checkmarks, stars, and sparkles around. Joyful energy. Mediterranean blue line art on cream background. Hand-drawn editorial illustration style, imperfect expressive lines. Pure happiness and accomplishment.</p><h3>Prompt 15: Goose High-Five</h3><p>Line illustration of a goose giving a wing high-five to a human hand reaching into frame. Sparkle effect at the point of contact. Celebratory moment. Mediterranean blue line drawing on warm cream background. Simple hand-drawn style with minimal halftone shading. Friendly, triumphant, team energy.</p><hr><h2>ICON PACK PROMPTS</h2><h3>Prompt 16: Desktop Icon Set - Line Style</h3><p>Icon set of 12 minimal desktop icons: folder, file, image, video, note, settings gear, mail envelope, calendar, camera, music note, download arrow, and lock. Mediterranean blue line art on transparent or cream background. Consistent 2px stroke weight, rounded corners, simple geometric shapes. Clean, modern, hand-drawn feel but precise. Cohesive icon family.</p><h3>Prompt 17: Goose Emoji Set</h3><p>Set of 9 goose face expressions as simple icons: happy, thinking, surprised, winking, sleeping, confused, excited, focused, and mischievous. Mediterranean blue line art, minimal strokes, consistent style. Simple circular or square frames. Cute and expressive, emoji energy. Clean lines on cream or transparent background.</p><h3>Prompt 18: File Type Icons with Goose</h3><p>Icon set of 6 file type icons with tiny goose incorporated: PDF with goose reading, ZIP with goose packing, image file with goose posing, video with goose directing, audio with goose singing, code file with goose typing. Mediterranean blue line art, consistent style, minimal and charming. Small icons, clean strokes.</p><h3>Prompt 19: Action Icons - Rounded Style</h3><p>Set of 16 UI action icons: plus, minus, close X, checkmark, arrow up, arrow down, arrow left, arrow right, refresh, search magnifier, edit pencil, trash bin, share, link chain, eye view, and heart. Mediterranean blue, 2px rounded stroke, soft corners, consistent 24px grid. Modern, friendly, cohesive set on transparent background.</p><h3>Prompt 20: Navigation Icons</h3><p>Icon set of 8 navigation icons for dock: home house, folder, mail, chat bubble, camera, calendar, settings cog, and analytics chart. Mediterranean blue line art, filled style with rounded corners, consistent weight and padding. Friendly and modern, suitable for bottom dock navigation bar. Clean on light background.</p><hr><h2>BACKGROUND PROMPTS</h2><h3>Prompt 21: Minimal Gradient Desktop Background</h3><p>Minimal desktop wallpaper with soft gradient from warm cream white at top to very pale Mediterranean blue at bottom. Subtle grain texture overlay. No objects, no patterns, just calm color transition. 16:9 aspect ratio, high resolution. Clean, serene, perfect for desktop with icons on top.</p><h3>Prompt 22: Abstract Geometric Background</h3><p>Abstract desktop wallpaper with scattered soft geometric shapes - circles, rounded rectangles, organic blobs - in very pale Mediterranean blue and cream tones. Subtle, minimal, barely there pattern. Soft shadows. Modern and calm. 16:9 aspect ratio. Background that doesn't compete with desktop icons.</p><h3>Prompt 23: Mediterranean Inspired Pattern Background</h3><p>Subtle desktop wallpaper inspired by Mediterranean tile patterns, very faded and minimal, in pale blue and cream white. Geometric repeating pattern at low opacity. Elegant and warm. 16:9 aspect ratio, high resolution. Sophisticated but not busy, perfect as desktop background.</p><h3>Prompt 24: Soft Clouds Background</h3><p>Desktop wallpaper of soft abstract cloud shapes in pale Mediterranean blue on warm cream background. Dreamy, minimal, organic shapes. Very subtle and calming. No sharp edges, everything soft and blurred. 16:9 aspect ratio. Peaceful desktop background that lets icons stand out.</p><h3>Prompt 25: Grain Texture Solid Background</h3><p>Solid desktop wallpaper in warm cream off-white color with subtle film grain texture overlay. Minimal, clean, tactile feel. No patterns, no gradients, just warm neutral with gentle noise. 16:9 aspect ratio, high resolution. Timeless and sophisticated desktop background.</p><h3>Prompt 26: Goose Silhouette Background</h3><p>Minimal desktop wallpaper with a single very subtle goose silhouette in the bottom right corner, barely visible in slightly darker cream tone. Rest of background is warm cream white with soft grain texture. Understated brand presence. 16:9 aspect ratio. Elegant and playful.</p><hr><h2>LANDING PAGE ILLUSTRATIONS</h2><h3>Prompt 27: "Your Space" Hero Scene</h3><p>Wide editorial illustration showing a cozy digital workspace from above - desk with laptop, floating windows, scattered files, plants, coffee - with a goose comfortably working in the center. Warm and inviting atmosphere. Mediterranean blue line art on cream background. Hand-drawn style with halftone textures. Panoramic composition, 16:9 aspect ratio. Feels like home.</p><h3>Prompt 28: Features Overview Scene</h3><p>Line illustration showing multiple small vignettes in one image: goose writing at desk, goose selling to customer, goose organizing folders, goose celebrating. Connected by flowing lines. Mediterranean blue on cream background. Editorial hand-drawn style. Shows variety of use cases in one charming scene.</p><h3>Prompt 29: Community of Creators</h3><p>Line illustration of multiple different geese (and maybe other birds) each with their own small desk/workspace, all connected by dotted lines suggesting a network. Each workspace is slightly different showing personality. Mediterranean blue line art on cream background. Hand-drawn editorial style. Community and connection energy.</p><hr><h2>TIPS FOR BEST RESULTS</h2><ol><li><strong>For Midjourney:</strong> Add <code>--ar 16:9</code> for backgrounds, <code>--ar 1:1</code> for icons</li><li><strong>For consistency:</strong> Save your best result and use it as a style reference for future prompts</li><li><strong>Color accuracy:</strong> If the blue isn't right, add "color hex #2B4AE2" or "Santorini blue" or "Greek blue"</li><li><strong>For line art:</strong> Add "no fill, outline only" if you're getting filled shapes</li><li><strong>For icons:</strong> Add "flat design, no shadows, no gradients" for cleaner results</li></ol>`,
        status: 'published',
        accessLevel: 'free',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now()),
        parentId: null,
        position: { x: 21, y: 35 },
        headerImage: 'https://images.unsplash.com/photo-1675271591211-930246f80c5d?w=1920&h=1080&fit=crop',
    },
    {
        id: 'game-snake',
        type: 'game',
        title: 'Snake',
        content: '',
        status: 'published',
        accessLevel: 'free',
        publishedAt: null,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now()),
        parentId: null,
        position: { x: 29, y: 35 },
    },
];

// Legacy format for compatibility with existing code that uses GoOSFile
const DEMO_FILES: GoOSFile[] = INITIAL_GOOS_FILES.map(f => ({
    id: f.id,
    type: f.type,
    title: f.title,
    content: f.content,
    status: f.status,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
    position: f.position,
}));

// ============================================
// DEMO WIDGETS - Initial widgets for the demo (only clock by default)
// ============================================
const INITIAL_DEMO_WIDGETS = [
    {
        id: 'demo-widget-clock',
        desktopId: 'goos-demo',
        widgetType: 'clock' as const,
        positionX: 88,
        positionY: 16,
        title: null,
        isVisible: true,
        config: { timezone: 'America/New_York', format: '12h', showTimezoneName: true },
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

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
    theme: 'brand-appart',
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
    id,
    label,
    icon,
    thumbnailUrl,
    onClick,
    isActive,
    badge,
    position,
    onPositionChange,
}: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    thumbnailUrl?: string;
    onClick: () => void;
    isActive?: boolean;
    badge?: number;
    position: { x: number; y: number };
    onPositionChange?: (position: { x: number; y: number }, id: string) => void;
}) => {
    const displayIcon = icon || PORTFOLIO_ICON_MAP[label] || <Folder size={28} fill={goOS.icon.fill} stroke={goOS.icon.stroke} strokeWidth={1.5} />;

    // Drag state
    const [localPosition, setLocalPosition] = useState({ x: position.x, y: position.y });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);
    const hasDragged = useRef(false);
    const currentPositionRef = useRef({ x: position.x, y: position.y });
    const onPositionChangeRef = useRef(onPositionChange);

    // Keep refs updated
    onPositionChangeRef.current = onPositionChange;

    // Sync local position with prop changes (only when NOT dragging)
    useEffect(() => {
        if (!isDragging) {
            setLocalPosition({ x: position.x, y: position.y });
            currentPositionRef.current = { x: position.x, y: position.y };
        }
    }, [position.x, position.y, isDragging]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Only left click
        if (e.button !== 0) return;

        e.preventDefault();

        // Get desktop area for percentage calculations
        const desktop = document.getElementById('goos-desktop-area');
        if (!desktop) return;
        const parentRect = desktop.getBoundingClientRect();

        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            elemX: currentPositionRef.current.x,
            elemY: currentPositionRef.current.y,
        };
        hasDragged.current = false;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!dragStartRef.current) return;

            const deltaX = moveEvent.clientX - dragStartRef.current.mouseX;
            const deltaY = moveEvent.clientY - dragStartRef.current.mouseY;

            // Only commit to drag after moving beyond threshold (5px)
            if (!hasDragged.current && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                hasDragged.current = true;
                setIsDragging(true);
                playSound('drag');
            }

            if (!hasDragged.current) return;

            // Convert pixel delta to percentage
            const deltaXPercent = (deltaX / parentRect.width) * 100;
            const deltaYPercent = (deltaY / parentRect.height) * 100;

            // Calculate new position
            const newX = dragStartRef.current.elemX + deltaXPercent;
            const newY = dragStartRef.current.elemY + deltaYPercent;

            // Free dragging - minimal clamp just to keep partially visible
            const clampedX = Math.max(-5, Math.min(100, newX));
            const clampedY = Math.max(-5, Math.min(100, newY));

            // Update both state and ref
            setLocalPosition({ x: clampedX, y: clampedY });
            currentPositionRef.current = { x: clampedX, y: clampedY };
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);

            const wasActualDrag = hasDragged.current;
            setIsDragging(false);

            // Save the final position if we actually dragged
            if (wasActualDrag && dragStartRef.current) {
                playSound('drop');
                onPositionChangeRef.current?.(currentPositionRef.current, id);
            }

            dragStartRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [id]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        // If we dragged, don't trigger click
        if (hasDragged.current) {
            hasDragged.current = false;
            return;
        }
    }, []);

    const handleDoubleClick = useCallback(() => {
        // If we dragged, don't trigger double click
        if (hasDragged.current) {
            hasDragged.current = false;
            return;
        }
        playSound('pop');
        onClick();
    }, [onClick]);

    return (
        <div
            data-portfolio-icon={id}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            style={{
                position: 'absolute',
                left: `${localPosition.x}%`,
                top: `${localPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: isDragging ? 1000 : 10,
                transition: isDragging ? 'none' : 'transform 0.15s ease',
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
        >
            <motion.div
                whileHover={!isDragging ? { scale: 1.08, y: -2 } : undefined}
                whileTap={!isDragging ? { scale: 0.95 } : undefined}
                animate={{
                    scale: isDragging ? 1.1 : 1,
                    filter: isDragging ? 'drop-shadow(0 8px 16px rgba(23, 20, 18, 0.2))' : 'drop-shadow(0 2px 4px rgba(23, 20, 18, 0.08))',
                }}
                transition={goOS.springs.snappy}
                className="flex flex-col items-center gap-2 w-20"
            >
                <motion.div
                    className="relative w-14 h-14 flex items-center justify-center rounded-lg overflow-hidden"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
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
                                background: goOS.colors.accent.primary,
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
                        color: 'var(--text-primary)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                    }}
                >
                    {label}
                </span>
            </motion.div>
        </div>
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
                backgroundColor: goOS.colors.sticky[color] || goOS.colors.sticky.yellow,
                border: `1.5px solid rgba(0,0,0,0.1)`,
                color: goOS.colors.text.primary,
                minWidth: '100px',
                padding: '14px 12px 18px 12px',
                borderRadius: '2px',
                zIndex: isDragging ? 100 : isHovered ? 50 : 10, // Above falling letters (z:1)
                boxShadow: isDragging
                    ? '8px 8px 16px rgba(0,0,0,0.15)'
                    : isHovered
                        ? '6px 6px 12px rgba(0,0,0,0.1)'
                        : '4px 4px 8px rgba(0,0,0,0.06)',
            }}
        >
            <div className="relative z-10" style={{ fontFamily: 'var(--font-display)' }}>
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
// CONFETTI BURST - for celebrations
// ============================================
const ConfettiBurst = React.memo(({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) => {
    const confettiColors = ['#ff7722', '#3d2fa9', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];
    const particles = useMemo(() =>
        Array.from({ length: 50 }, (_, i) => ({
            id: i,
            color: confettiColors[i % confettiColors.length],
            x: (Math.random() - 0.5) * 400,
            y: -(Math.random() * 300 + 100),
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5,
        })), []);

    useEffect(() => {
        if (isActive && onComplete) {
            const timer = setTimeout(onComplete, 2000);
            return () => clearTimeout(timer);
        }
    }, [isActive, onComplete]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]" style={{ perspective: 1000 }}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: '50vw', y: '50vh', scale: 0, rotate: 0, opacity: 1 }}
                    animate={{
                        x: `calc(50vw + ${p.x}px)`,
                        y: `calc(50vh + ${p.y}px)`,
                        scale: p.scale,
                        rotate: p.rotation,
                        opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 1.5 + Math.random() * 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        background: p.color,
                    }}
                />
            ))}
        </div>
    );
});
ConfettiBurst.displayName = 'ConfettiBurst';

// ============================================
// RUBBER DUCK - Enhanced with more personality
// ============================================
const DUCK_SAYINGS = [
    'Quack!',
    'Have you tried turning it off and on?',
    'Rubber duck debugging! 🐛',
    'You got this! 💪',
    'Ship it! 🚀',
    '*happy duck noises*',
    'Honk? Wait, wrong bird.',
    '10/10 would quack again',
];

const RubberDuck = React.memo(({ onClick }: { onClick?: () => void }) => {
    const [isQuacking, setIsQuacking] = useState(false);
    const [quackCount, setQuackCount] = useState(0);
    const [saying, setSaying] = useState(DUCK_SAYINGS[0]);

    const handleClick = () => {
        setIsQuacking(true);
        setQuackCount(prev => prev + 1);
        // Rotate through sayings, with special ones for milestones
        if (quackCount === 9) {
            setSaying('🎉 10 quacks! You really like me!');
        } else if (quackCount === 49) {
            setSaying('🏆 50 quacks! Duck enthusiast!');
        } else if (quackCount === 99) {
            setSaying('👑 100 quacks! Duck royalty!');
        } else {
            setSaying(DUCK_SAYINGS[Math.floor(Math.random() * DUCK_SAYINGS.length)]);
        }
        onClick?.();
        setTimeout(() => setIsQuacking(false), 1200);
    };

    return (
        // Wrapper with padding to match DockIcon hitbox
        <div style={{ padding: '4px 2px' }}>
            <motion.button
                onClick={handleClick}
                className="relative flex items-center justify-center focus:outline-none"
                style={{ width: 48, height: 48 }}
                whileHover={{ y: -14, scale: 1.18 }}
                whileTap={{ scale: 0.85 }}
                transition={SPRING.goose}
                title={`Click me! (${quackCount} quacks)`}
            >
                <motion.span
                    className="text-2xl select-none"
                    animate={isQuacking ? {
                        // MAXIMUM QUACK - very dramatic!
                        rotate: [0, -30, 30, -25, 25, -15, 15, -5, 0],
                        y: [0, -20, 5, -15, 0, -10, 0],
                        scale: [1, 1.5, 0.8, 1.3, 0.9, 1.1, 1],
                    } : {
                        // Idle wobble
                        rotate: [0, 5, 0, -5, 0],
                        y: [0, -3, 0],
                    }}
                    transition={isQuacking ? { duration: 0.8, ease: 'easeOut' } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    🦆
                </motion.span>
                <AnimatePresence>
                    {isQuacking && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0, y: 20, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, y: -50, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: -70, rotate: 10 }}
                            transition={SPRING.playful}
                            className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap z-50 font-medium"
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                color: 'var(--text-primary)',
                                maxWidth: 180,
                            }}
                        >
                            {saying}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
});

RubberDuck.displayName = 'RubberDuck';

// ============================================
// TYPEWRITER TEXT - Playful text reveal
// ============================================
const TypewriterText = React.memo(({
    text,
    className,
    style,
}: {
    text: string;
    className?: string;
    style?: React.CSSProperties;
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            setIsComplete(true);
            return;
        }

        setDisplayedText('');
        setIsComplete(false);
        let currentIndex = 0;

        // Type each character with natural timing variation
        const typeNextChar = () => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;
                // Vary timing: faster for spaces, slight pause on punctuation
                const char = text[currentIndex - 1];
                let delay = 40 + Math.random() * 20; // Base 40-60ms
                if (char === ' ') delay = 20;
                if ('.!?'.includes(char)) delay = 150;
                if (',;:'.includes(char)) delay = 80;
                setTimeout(typeNextChar, delay);
            } else {
                setIsComplete(true);
            }
        };

        // Small initial delay before starting
        const startTimeout = setTimeout(typeNextChar, 200);
        return () => clearTimeout(startTimeout);
    }, [text]);

    return (
        <span className={className} style={style}>
            {displayedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ marginLeft: 1 }}
                >
                    |
                </motion.span>
            )}
        </span>
    );
});

TypewriterText.displayName = 'TypewriterText';

// ============================================
// DOCK ICON - Premium glass hover with smooth transitions
// ============================================

const DockIcon = React.memo(({
    icon,
    onClick,
    isActive,
    badge,
    label,
}: {
    icon: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
    badge?: number;
    label?: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [justClicked, setJustClicked] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
            setIsPressed(false);
        }, 30);
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const handleClick = () => {
        playSound('bubble');
        setJustClicked(true);
        onClick();
        setTimeout(() => setJustClicked(false), 400);
    };

    return (
        <div
            className="relative"
            style={{ padding: '4px 2px' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                animate={{
                    scale: justClicked ? [1, 0.92, 1.08, 0.98, 1] : isPressed ? 0.95 : isHovered ? 1.06 : 1,
                    y: justClicked ? [0, 2, -12, -6, -4] : isHovered ? -4 : 0,
                }}
                transition={SPRING.dock}
                style={{
                    width: 44,
                    height: 44,
                    position: 'relative',
                    transformOrigin: 'bottom center',
                }}
            >
                <button
                    onClick={handleClick}
                    onMouseDown={() => setIsPressed(true)}
                    onMouseUp={() => setIsPressed(false)}
                    className="w-full h-full focus:outline-none relative"
                >
                    {/* Tooltip */}
                    <AnimatePresence>
                        {isHovered && label && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap z-50 pointer-events-none"
                                style={{
                                    background: '#1a1a1a',
                                    color: '#fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.15)',
                                }}
                            >
                                {label}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Physical button - Braun-inspired raised plastic */}
                    <div
                        className="w-full h-full flex items-center justify-center rounded-[12px] relative overflow-hidden"
                        style={{
                            background: isPressed
                                ? 'var(--dock-icon-pressed-bg)'
                                : 'var(--dock-icon-bg)',
                            boxShadow: isPressed
                                ? 'var(--dock-icon-pressed-shadow)'
                                : 'var(--dock-icon-shadow)',
                            transition: 'all 0.1s ease-out',
                        }}
                    >
                        {/* Icon */}
                        <div
                            className="relative z-10"
                            style={{
                                color: 'var(--dock-icon-color)',
                                transform: isPressed ? 'translateY(1px)' : 'none',
                                transition: 'transform 0.1s ease-out, color 0.3s ease',
                            }}
                        >
                            {icon}
                        </div>

                        {/* Orange indicator dot - Braun signature */}
                        {isActive && (
                            <div
                                className="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full"
                                style={{
                                    background: 'var(--indicator-orange, #ff6b00)',
                                    boxShadow: '0 0 4px var(--indicator-orange-glow, rgba(255, 107, 0, 0.5))',
                                }}
                            />
                        )}
                    </div>

                    {/* Badge */}
                    {badge !== undefined && badge > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={SPRING.bouncy}
                            className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1 z-20"
                            style={{
                                background: 'var(--indicator-orange, #ff6b00)',
                                boxShadow: '0 1px 4px rgba(255, 107, 0, 0.4), 0 0 0 2px var(--bg-dock, #f4f4f2)',
                            }}
                        >
                            {badge}
                        </motion.span>
                    )}
                </button>
            </motion.div>
        </div>
    );
});

DockIcon.displayName = 'DockIcon';

// ============================================
// SKETCH WINDOW WITH MICRO-ANIMATIONS
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

// Traffic light button with hover icon reveal
const TrafficLightButton = ({
    color,
    hoverColor,
    borderColor,
    icon,
    onClick,
    title,
}: {
    color: string;
    hoverColor: string;
    borderColor?: string;
    icon: string;
    onClick?: (e: React.MouseEvent) => void;
    title: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={title}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="w-3 h-3 rounded-full flex items-center justify-center box-border"
            style={{
                background: isHovered ? hoverColor : color,
                transition: 'background 0.15s ease',
                border: `1.5px solid ${borderColor || 'transparent'}`,
            }}
        >
            <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
                style={{
                    fontSize: 8,
                    lineHeight: 1,
                    color: borderColor || 'rgba(0,0,0,0.5)',
                }}
            >
                {icon}
            </motion.span>
        </motion.button>
    );
};

function SketchWindow({ title, icon, isOpen, zIndex, defaultX, defaultY, width, height, onClose, onFocus, children }: SketchWindowProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isHoveredTraffic, setIsHoveredTraffic] = useState(false);

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    if (!isOpen) return null;

    // Using unified windowStyles values - calm-tech 2025
    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={fadeInScale.initial}
            animate={isClosing
                ? { opacity: 0, scale: 0.94, y: -8 }
                : fadeInScale.animate
            }
            exit={fadeInScale.exit}
            transition={isClosing
                ? { duration: DURATION.normal, ease: EASE.out }
                : SPRING.smooth
            }
            onMouseDown={onFocus}
            className="fixed flex flex-col overflow-hidden"
            style={{
                left: defaultX,
                top: defaultY,
                width,
                height,
                zIndex,
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-lg, 20px)',
                boxShadow: 'var(--shadow-window)',
                ...WILL_CHANGE.transformOpacity,
            }}
        >
            {/* Title Bar - unified 48px height, subtle border */}
            <div
                className="flex items-center justify-between px-4 select-none cursor-move flex-shrink-0"
                style={{
                    height: 48,
                    background: 'var(--color-bg-base)',
                    borderBottom: '1px solid var(--color-border-subtle)'
                }}
                onMouseEnter={() => setIsHoveredTraffic(true)}
                onMouseLeave={() => setIsHoveredTraffic(false)}
            >
                {/* Traffic Lights - macOS style 12px circles */}
                <div className="flex items-center group/traffic" style={{ gap: 8 }}>
                    <motion.button
                        onClick={handleClose}
                        title="Close"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center"
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: 'var(--traffic-red, #ff5f57)',
                            boxShadow: 'var(--shadow-xs)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {isHoveredTraffic && (
                            <span style={{ fontSize: 9, lineHeight: 1, color: 'rgba(77, 0, 0, 0.8)' }}>×</span>
                        )}
                    </motion.button>
                    <motion.button
                        title="Minimize"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center"
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: 'var(--traffic-yellow, #ffbd2e)',
                            boxShadow: 'var(--shadow-xs)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {isHoveredTraffic && (
                            <span style={{ fontSize: 9, lineHeight: 1, color: 'rgba(100, 65, 0, 0.8)' }}>−</span>
                        )}
                    </motion.button>
                    <motion.button
                        title="Maximize"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center"
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: 'var(--traffic-green, #28c840)',
                            boxShadow: 'var(--shadow-xs)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {isHoveredTraffic && (
                            <span style={{ fontSize: 9, lineHeight: 1, color: 'rgba(0, 70, 0, 0.8)' }}>+</span>
                        )}
                    </motion.button>
                </div>
                {/* Title */}
                <div className="flex items-center gap-2 pointer-events-none">
                    {icon && <span style={{ opacity: 0.6 }}>{icon}</span>}
                    <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--color-text-primary, #171412)',
                        letterSpacing: '-0.01em',
                        opacity: 0.7
                    }}>{title}</span>
                </div>
            </div>
            <div className="flex-1 overflow-auto">{children}</div>
        </motion.div >
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
                    style={{ accentColor: 'var(--accent-primary)' }}
                />
                <AnimatePresence>
                    {justChecked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            className="absolute inset-0 rounded-full"
                            style={{ background: `${goOS.colors.accent.primary}30` }}
                        />
                    )}
                </AnimatePresence>
            </div>
            <span className={`text-sm ${checked ? 'line-through opacity-50' : isHot ? 'font-semibold' : ''}`} style={{ color: isHot ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                {label}
            </span>
        </motion.li>
    );
};

// ============================================
// GOOS GUESTBOOK (Sketch style)
// ============================================
const GoOSGuestbook = React.memo(({
    entries,
    onSubmit,
}: {
    entries: GuestbookEntry[];
    onSubmit?: (entry: Omit<GuestbookEntry, 'id' | 'createdAt' | 'isPublic' | 'ownerMarkedHelpful'>) => void;
}) => {
    const [message, setMessage] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);

    const handleSubmit = () => {
        if (!message.trim()) return;
        onSubmit?.({
            message: message.trim(),
            type: 'general',
            authorType: isAnonymous ? 'anonymous' : 'named',
            ...((!isAnonymous && authorName) && { authorName }),
        });
        setMessage('');
        setAuthorName('');
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const noteColors = ['var(--bg-elevated)'];

    return (
        <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-body)', background: 'var(--bg-surface)' }}>
            {/* Header */}
            <div
                className="px-5 py-4"
                style={{
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                }}
            >
                <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                    📝 Leave a Note
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Say hi, share feedback, or just leave your mark!
                </p>
            </div>

            {/* Form */}
            <div className="px-5 py-4 space-y-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                    placeholder="Write something nice..."
                    className="w-full h-20 px-3 py-2.5 resize-none focus:outline-none"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        fontFamily: 'var(--font-display)',
                        boxShadow: goOS.shadows.sm,
                    }}
                    maxLength={280}
                />

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!isAnonymous}
                            onChange={(e) => setIsAnonymous(!e.target.checked)}
                            className="w-4 h-4"
                            style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign my name</span>
                    </label>
                </div>

                {!isAnonymous && (
                    <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value.slice(0, 30))}
                        placeholder="Your name"
                        className="w-full px-3 py-2 focus:outline-none"
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                        }}
                    />
                )}

                <motion.button
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        boxShadow: goOS.shadows.button,
                    }}
                >
                    Drop Note 🦆
                </motion.button>
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-wrap gap-3">
                    <AnimatePresence mode="popLayout">
                        {entries.length === 0 ? (
                            <div className="w-full text-center py-8">
                                <span className="text-4xl">🦆</span>
                                <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                                    Be the first to leave a note!
                                </p>
                            </div>
                        ) : (
                            entries.map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                    animate={{ opacity: 1, scale: 1, rotate: (i % 3 - 1) * 3 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative p-3 w-[calc(50%-6px)]"
                                    style={{
                                        background: noteColors[i % noteColors.length],
                                        minHeight: '100px',
                                        boxShadow: '3px 3px 0 rgba(0,0,0,0.08)',
                                    }}
                                >
                                    {/* Tape effect */}
                                    <div
                                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2.5"
                                        style={{
                                            background: 'var(--bg-surface)',
                                            border: '1px dashed var(--border-medium)',
                                            borderRadius: '2px',
                                        }}
                                    />

                                    <p
                                        className="text-sm leading-relaxed mb-2"
                                        style={{
                                            color: 'var(--text-primary)',
                                            fontFamily: 'var(--font-display)',
                                        }}
                                    >
                                        &ldquo;{entry.message}&rdquo;
                                    </p>

                                    <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                        <span>
                                            — {entry.authorType === 'anonymous' ? 'Anonymous' : entry.authorName || 'Friend'}
                                        </span>
                                        <span>{formatDate(entry.createdAt)}</span>
                                    </div>

                                    {entry.ownerMarkedHelpful && (
                                        <span className="absolute -top-1 -right-1 text-sm">⭐</span>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
});

GoOSGuestbook.displayName = 'GoOSGuestbook';

// ============================================
// GOOS ANALYTICS (Sketch style)
// ============================================
const GoOSAnalytics = React.memo(({ data }: { data: typeof DEMO_ANALYTICS_DATA }) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

    const SketchBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
        <div
            className="h-3 rounded-sm overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
            <motion.div
                className="h-full rounded-sm"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />
        </div>
    );

    const StatBox = ({ value, label, change, icon }: { value: string | number; label: string; change?: number; icon: string }) => (
        <div
            className="p-3 text-center"
            style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                boxShadow: goOS.shadows.sm,
            }}
        >
            <span className="text-lg block mb-1">{icon}</span>
            <div
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
                {value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
            {change !== undefined && (
                <div
                    className="text-xs mt-1 font-medium"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-body)', background: 'var(--bg-surface)' }}>
            {/* Header */}
            <div
                className="px-5 py-3 flex items-center justify-between"
                style={{
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        Portfolio Analytics
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    {(['7d', '30d', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className="px-2 py-1 text-xs font-medium"
                            style={{
                                background: timeRange === range ? 'var(--accent-light)' : 'transparent',
                                border: `1.5px solid ${timeRange === range ? 'var(--border-medium)' : 'transparent'}`,
                                borderRadius: '4px',
                                color: timeRange === range ? 'var(--text-primary)' : 'var(--text-tertiary)',
                            }}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ background: 'var(--bg-surface)' }}>
                {/* Overview Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatBox value={data.overview.visitors} label="Visitors" change={data.overview.visitorsChange} icon="👀" />
                    <StatBox value={data.overview.pageViews} label="Page Views" change={data.overview.pageViewsChange} icon="📄" />
                    <StatBox value={data.overview.avgTime} label="Avg. Time" change={data.overview.avgTimeChange} icon="⏱️" />
                </div>

                {/* Live indicator */}
                <div
                    className="flex items-center justify-between px-3 py-2"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <motion.span
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'var(--accent-primary)' }}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {data.liveVisitors.length} live visitor{data.liveVisitors.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {data.liveVisitors[0]?.viewing && `Viewing: ${data.liveVisitors[0].viewing}`}
                    </span>
                </div>

                {/* Traffic Sources */}
                <div
                    className="p-4"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        boxShadow: goOS.shadows.sm,
                    }}
                >
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span>🌐</span> Where visitors come from
                    </h4>
                    <div className="space-y-2.5">
                        {data.sources.map((source, i) => {
                            const colors = ['#ff7722', '#3d2fa9', '#1a1a1a', '#e56a1f', '#6b6b6b'];
                            return (
                                <div key={source.name}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span style={{ color: 'var(--text-primary)' }}>{source.name}</span>
                                        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            {source.count} ({source.percentage}%)
                                        </span>
                                    </div>
                                    <SketchBar value={source.percentage} max={100} color={colors[i % colors.length]} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Content */}
                <div
                    className="p-4"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        boxShadow: goOS.shadows.sm,
                    }}
                >
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span>🔥</span> Most viewed
                    </h4>
                    <div className="space-y-2">
                        {data.topContent.slice(0, 4).map((item, i) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-3 p-2"
                                style={{
                                    background: i === 0 ? 'var(--accent-light)' : 'transparent',
                                    borderRadius: '4px',
                                }}
                            >
                                <span
                                    className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded"
                                    style={{
                                        background: 'var(--border-strong)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.opens} opens</span>
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {item.change >= 0 ? '+' : ''}{item.change}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recruiter Funnel */}
                <div
                    className="p-4"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        boxShadow: goOS.shadows.sm,
                    }}
                >
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span>👔</span> Recruiter journey
                    </h4>
                    <div className="flex items-end justify-between gap-2">
                        {[
                            { label: 'Visited', value: data.recruiterFunnel.visited },
                            { label: 'Viewed', value: data.recruiterFunnel.viewedWork },
                            { label: 'CV', value: data.recruiterFunnel.downloadedCV },
                            { label: 'Contact', value: data.recruiterFunnel.contacted },
                        ].map((step, i) => {
                            const maxVal = data.recruiterFunnel.visited;
                            const height = Math.max(20, (step.value / maxVal) * 80);
                            return (
                                <div key={step.label} className="flex-1 text-center">
                                    <motion.div
                                        className="mx-auto mb-2"
                                        style={{
                                            width: '100%',
                                            height: `${height}px`,
                                            background: 'var(--accent-primary)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}px` }}
                                        transition={{ delay: i * 0.1 }}
                                    />
                                    <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{step.value}</div>
                                    <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{step.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
});

GoOSAnalytics.displayName = 'GoOSAnalytics';

// ============================================
// TYPING INDICATOR
// ============================================
const TypingIndicator = () => (
    <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--accent-light)', border: '1px solid var(--border-subtle)' }}>🦆</div>
        <div className="rounded-xl rounded-tl-none px-4 py-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: goOS.shadows.sm }}>
            <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--text-tertiary)' }}
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
    const [topZIndex, setTopZIndex] = useState(600); // Start above widgets/dock/menubar
    const [logoClicks, setLogoClicks] = useState(0);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showWidgetsMenu, setShowWidgetsMenu] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    // Boot sequence state: splash -> booting -> revealing -> ready
    const [bootPhase, setBootPhase] = useState<'splash' | 'booting' | 'revealing' | 'ready'>('splash');
    const [bootMessage, setBootMessage] = useState(0);

    // Fun loading messages that rotate
    const bootMessages = useMemo(() => [
        'Waking up the duck...',
        'Fluffing feathers...',
        'Counting breadcrumbs...',
        'Polishing pixels...',
        'Almost ready to quack!',
    ], []);

    // Handle splash click - starts boot with sound
    const handleSplashClick = useCallback(() => {
        setBootPhase('booting');
        // Play startup sound immediately on user interaction (bypasses autoplay block)
        setTimeout(() => playSound('startup'), 100);
    }, []);

    // Boot sequence effect - runs when booting phase starts
    useEffect(() => {
        if (bootPhase !== 'booting') return;

        // Rotate through boot messages
        const messageInterval = setInterval(() => {
            setBootMessage(prev => (prev + 1) % bootMessages.length);
        }, 700);

        // Transition to reveal phase after boot animation
        const bootTimer = setTimeout(() => {
            setBootPhase('revealing');
            // Play a whoosh sound for the reveal
            playSound('expand');
        }, 3500); // 3.5 seconds - longer for personality

        return () => {
            clearTimeout(bootTimer);
            clearInterval(messageInterval);
        };
    }, [bootPhase, bootMessages.length]);

    // Handle reveal complete - final transition to ready
    const handleRevealComplete = useCallback(() => {
        setBootPhase('ready');
    }, []);

    // Spaces state (demo mode - will be replaced by SpaceContext)
    const [activeSpaceId, setActiveSpaceId] = useState('space-1');
    const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
    const [showManageSpacesDialog, setShowManageSpacesDialog] = useState(false);

    // Wallpaper state - persisted to localStorage
    const [wallpaper, setWallpaper] = useState<string | null>(null); // No wallpaper by default
    const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
    const [asciiFilter, setAsciiFilter] = useState(false); // ASCII art filter for wallpapers
    const [asciiColorMode, setAsciiColorMode] = useState<'mono' | 'grey' | 'color'>('mono');

    // Load wallpaper from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('goos-wallpaper');
        if (stored !== null) {
            setWallpaper(stored === 'null' ? null : stored);
        }
        // Load ASCII filter settings
        const storedAscii = localStorage.getItem('goos-ascii-filter');
        if (storedAscii !== null) {
            setAsciiFilter(storedAscii === 'true');
        }
        const storedAsciiColor = localStorage.getItem('goos-ascii-color');
        if (storedAsciiColor) {
            setAsciiColorMode(storedAsciiColor as 'mono' | 'grey' | 'color');
        }
    }, []);

    // Save wallpaper to localStorage when changed
    useEffect(() => {
        localStorage.setItem('goos-wallpaper', wallpaper ?? 'null');
    }, [wallpaper]);

    // Save ASCII filter to localStorage when changed
    useEffect(() => {
        localStorage.setItem('goos-ascii-filter', String(asciiFilter));
        localStorage.setItem('goos-ascii-color', asciiColorMode);
    }, [asciiFilter, asciiColorMode]);

    // Dark mode state
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Initialize dark mode from localStorage and apply theme class
    useEffect(() => {
        const stored = localStorage.getItem('goos-dark-mode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = stored === 'true' || (stored === null && prefersDark);

        setIsDarkMode(shouldBeDark);

        // Apply theme classes to html element (theme-sketch + dark on same element for CSS selector)
        document.documentElement.classList.add('theme-sketch');
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-mode', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-mode', 'light');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newValue = !prev;
            localStorage.setItem('goos-dark-mode', String(newValue));

            // Ensure theme-sketch is always on html for CSS variables
            document.documentElement.classList.add('theme-sketch');
            if (newValue) {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-mode', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-mode', 'light');
            }

            return newValue;
        });
    }, []);

    // Portfolio item positions - persisted to localStorage
    const [portfolioPositions, setPortfolioPositions] = useState<Record<string, { x: number; y: number }>>(() => {
        // Default positions spread across the desktop
        const defaults: Record<string, { x: number; y: number }> = {};
        DEMO_ITEMS.forEach((item, index) => {
            // Arrange in a nice grid pattern starting from top-left
            // 5 columns, with spacing
            const col = index % 5;
            const row = Math.floor(index / 5);
            defaults[item.id] = {
                x: 10 + col * 16, // 10%, 26%, 42%, 58%, 74%
                y: 15 + row * 18, // 15%, 33%, 51%
            };
        });
        return defaults;
    });

    // Load portfolio positions from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('goos-portfolio-positions');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPortfolioPositions(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.warn('Failed to parse portfolio positions:', e);
            }
        }
    }, []);

    // Handle portfolio item position change
    const handlePortfolioPositionChange = useCallback((position: { x: number; y: number }, id: string) => {
        setPortfolioPositions(prev => {
            const newPositions = { ...prev, [id]: position };
            // Save to localStorage
            localStorage.setItem('goos-portfolio-positions', JSON.stringify(newPositions));
            return newPositions;
        });
    }, []);

    // Canvas app icon position - persisted to localStorage
    const [canvasPosition, setCanvasPosition] = useState<{ x: number; y: number }>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('goos-canvas-position');
                if (saved) return JSON.parse(saved);
            } catch (e) {
                console.warn('Failed to parse canvas position:', e);
            }
        }
        return { x: 85, y: 45 }; // Default position
    });

    // Handle canvas icon position change
    const handleCanvasPositionChange = useCallback((position: { x: number; y: number }) => {
        setCanvasPosition(position);
        localStorage.setItem('goos-canvas-position', JSON.stringify(position));
    }, []);

    // Theme-aware colors via CSS variables (no JS dependency on isDarkMode)
    const iconColors = getIconColors();
    const stickyColors = getStickyColors();

    // Celebration helper
    const celebrate = useCallback(() => {
        setShowConfetti(true);
    }, []);

    // goOS app windows
    const [appWindows, setAppWindows] = useState<Record<string, boolean>>({
        quackmail: true,
        notes: false,
        chat: false,
        settings: false,
        nest: false,
        shell: false,
        guestbook: false,
        analytics: false,
        snake: false,
        canvas: false,
    });

    const [windowZ, setWindowZ] = useState<Record<string, number>>({
        quackmail: 600,
        notes: 601,
        chat: 602,
        settings: 603,
        nest: 604,
        shell: 605,
        guestbook: 606,
        analytics: 607,
        snake: 608,
        canvas: 609,
    });

    // Guestbook state
    const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(DEMO_GUESTBOOK_ENTRIES);

    // goOS Context - use API persistence
    const goosContext = useGoOS();
    const {
        files: goosFilesRaw,
        createFile: createGoOSFile,
        updateFile: updateGoOSFile,
        deleteFile: deleteGoOSFile,
        duplicateFile: duplicateGoOSFile,
        moveFile: moveGoOSFile,
        autoSave: goosAutoSave,
        publishFile: publishGoOSFile,
        unpublishFile: unpublishGoOSFile,
        lockFile: lockGoOSFile,
        unlockFile: unlockGoOSFile,
        refreshFiles,
        isLoading: goosLoading,
        toast: goosToast,
        showToast: showGoOSToast,
    } = goosContext;

    // Transform context files to component format - FILTERED BY ACTIVE SPACE
    const spaceFilteredFiles = useMemo(() => {
        return getSpaceFiles(activeSpaceId, goosFilesRaw);
    }, [activeSpaceId, goosFilesRaw]);

    const goosFiles: GoOSFile[] = useMemo(() => spaceFilteredFiles.map(f => ({
        id: f.id,
        type: f.type as FileType,
        title: f.title,
        content: f.content,
        status: f.status,
        accessLevel: f.accessLevel,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
        parentFolderId: f.parentId || undefined,
        position: f.position,
        // Image file fields
        imageUrl: f.imageUrl || undefined,
        imageAlt: f.imageAlt || undefined,
        imageCaption: f.imageCaption || undefined,
        // Link file fields
        linkUrl: f.linkUrl || undefined,
        linkTitle: f.linkTitle || undefined,
        linkDescription: f.linkDescription || undefined,
    })), [spaceFilteredFiles]);

    // Convert goosFiles to DesktopItem format for PageView/PresentView
    const goosFilesAsDesktopItems: DesktopItem[] = useMemo(() => spaceFilteredFiles.map((f, index) => ({
        id: f.id,
        desktopId: '',
        label: f.title,
        windowTitle: f.title,
        windowSubtitle: null,
        windowHeaderImage: null,
        windowDescription: f.content || '',
        windowType: 'default' as const,
        windowDetails: null,
        windowGallery: null,
        windowLinks: null,
        thumbnailUrl: '',
        positionX: f.position?.x ?? 50,
        positionY: f.position?.y ?? 50,
        zIndex: 1,
        order: index,
        useTabs: false,
        tabs: [],
        blocks: [],
        commentsEnabled: false,
        isVisible: true,
        itemVariant: 'goos-file' as const,
        goosFileType: f.type as 'note' | 'case-study' | 'folder' | 'image' | 'link' | 'embed' | 'download',
        goosContent: f.content || '',
        publishStatus: f.status as 'draft' | 'published',
        accessLevel: f.accessLevel as 'free' | 'paid' | 'email',
        parentItemId: f.parentId || null,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
    })), [spaceFilteredFiles]);

    // goOS Editor UI state (local only)
    const [openEditors, setOpenEditors] = useState<string[]>([]);
    const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
    const [minimizedEditors, setMinimizedEditors] = useState<Set<string>>(new Set());
    const [maximizedEditors, setMaximizedEditors] = useState<Set<string>>(new Set());
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
    const [clipboard, setClipboard] = useState<{ files: GoOSFile[]; operation: 'copy' | 'cut' } | null>(null);
    const [desktopContextMenu, setDesktopContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({ isOpen: false, x: 0, y: 0 });
    const [fileContextMenu, setFileContextMenu] = useState<{ isOpen: boolean; x: number; y: number; fileId: string | null }>({ isOpen: false, x: 0, y: 0, fileId: null });
    const [widgetContextMenu, setWidgetContextMenu] = useState<{ isOpen: boolean; x: number; y: number; widget: Widget | null }>({ isOpen: false, x: 0, y: 0, widget: null });
    const [openFolders, setOpenFolders] = useState<string[]>([]); // Folder windows
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [maximizedFolders, setMaximizedFolders] = useState<Set<string>>(new Set()); // Maximized folders
    const [openImageViewers, setOpenImageViewers] = useState<string[]>([]); // Image viewer windows
    const [openLinkBrowsers, setOpenLinkBrowsers] = useState<string[]>([]); // Link browser windows
    const [maximizedLinkBrowsers, setMaximizedLinkBrowsers] = useState<Set<string>>(new Set()); // Maximized link browsers
    const [isDraggingFile, setIsDraggingFile] = useState(false); // For drag-drop visual feedback

    // New file type creation dialog state
    const [createFileDialog, setCreateFileDialog] = useState<{ isOpen: boolean; fileType: 'image' | 'link' | 'embed' | 'download' | null }>({ isOpen: false, fileType: null });
    const [createFilePosition, setCreateFilePosition] = useState<{ x: number; y: number } | null>(null);

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');
    const [presentingFileId, setPresentingFileId] = useState<string | null>(null);
    const [caseStudyFileId, setCaseStudyFileId] = useState<string | null>(null);

    // Command palette state
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    // Zen focus mode - true when any window is maximized OR in page/present view
    const isZenMode = maximizedEditors.size > 0 || viewMode === 'page' || viewMode === 'present';

    // Widget context
    const widgetContext = useWidgets();
    const { widgets, createWidget, updateWidget, deleteWidget } = widgetContext;
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [draggingFileId, setDraggingFileId] = useState<string | null>(null);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

    // Load files from API on mount (only once)
    useEffect(() => {
        refreshFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Desktop always shows root-level files (no parentFolderId)
    const filesOnDesktop = useMemo(() => goosFiles.filter(f => !f.parentFolderId), [goosFiles]);

    // Refs for drag state (avoids re-creating callbacks)
    const filesRef = React.useRef(filesOnDesktop);
    filesRef.current = filesOnDesktop;
    const dragOverRef = React.useRef<string | null>(null);
    const draggingFileRef = React.useRef<string | null>(null);

    // Memoized drag start handler (stable reference)
    const handleDragStart = useCallback((fileId: string) => {
        draggingFileRef.current = fileId;
        setDraggingFileId(fileId);
    }, []);

    // Memoized click handler (stable reference)
    const handleFileClick = useCallback((e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        setSelectedFileId(fileId);
    }, []);

    // Memoized position change handler (stable reference)
    const handlePositionChange = useCallback((pos: { x: number; y: number }, fileId: string) => {
        const currentDraggingId = draggingFileRef.current;
        const currentDragOverId = dragOverRef.current;

        // Check if we're dropping on a folder
        if (currentDraggingId && currentDragOverId && currentDragOverId !== currentDraggingId) {
            // Move to folder via API
            moveGoOSFile(currentDraggingId, currentDragOverId);
        } else {
            // Just update position via API
            updateGoOSFile(fileId, { position: pos });
        }

        // Reset drag state
        draggingFileRef.current = null;
        dragOverRef.current = null;
        setDraggingFileId(null);
        setDragOverFolderId(null);
    }, [moveGoOSFile, updateGoOSFile]);

    // Memoized folder hit-test function (stable reference)
    // dragPos is in percentages (0-100), same as folder positions
    const checkFolderHit = useCallback((dragPos: { x: number; y: number }, excludeFileId: string) => {
        const folders = filesRef.current.filter(f => f.type === 'folder' && f.id !== excludeFileId && f.position);
        let foundFolder: string | null = null;
        // Icon is roughly 80px wide, which is about 5% of a 1600px screen
        const hitBoxSize = 6; // percentage
        for (const folder of folders) {
            const folderX = folder.position.x;
            const folderY = folder.position.y;
            if (dragPos.x >= folderX - 2 && dragPos.x <= folderX + hitBoxSize &&
                dragPos.y >= folderY - 2 && dragPos.y <= folderY + hitBoxSize) {
                foundFolder = folder.id;
                break;
            }
        }
        // Only update state if the value changed
        if (dragOverRef.current !== foundFolder) {
            dragOverRef.current = foundFolder;
            setDragOverFolderId(foundFolder);
        }
    }, []);

    // File management functions - now use API persistence
    const createFile = useCallback(async (type: FileType, titleOrPosition?: string | { x: number; y: number }) => {
        // Support both (type, title) and (type, pixelPosition) signatures
        const title = typeof titleOrPosition === 'string' ? titleOrPosition : undefined;
        const pixelPosition = typeof titleOrPosition === 'object' ? titleOrPosition : undefined;

        // Convert pixel position to percentage if provided
        let position: { x: number; y: number } | undefined;
        if (pixelPosition) {
            // Get desktop area dimensions and position
            const desktopArea = document.getElementById('goos-desktop-area');
            if (desktopArea) {
                const rect = desktopArea.getBoundingClientRect();
                // Convert viewport coordinates to element-relative coordinates, then to percentage
                const relativeX = pixelPosition.x - rect.left;
                const relativeY = pixelPosition.y - rect.top;
                position = {
                    x: Math.max(2, Math.min(90, (relativeX / rect.width) * 100)),
                    y: Math.max(2, Math.min(85, (relativeY / rect.height) * 100)),
                };
            }
        }

        const newFile = await createGoOSFile(type, null, position);
        if (newFile) {
            // Set custom title if provided
            if (title) {
                await updateGoOSFile(newFile.id, { title });
            }
            if (type !== 'folder') {
                setOpenEditors(prev => [...prev, newFile.id]);
                setActiveEditorId(newFile.id);
            }
            // Don't auto-rename - user can right-click > Rename if needed
        }
    }, [createGoOSFile, updateGoOSFile]);

    // Convert pixel to percentage position helper
    const convertToPercentPosition = useCallback((pixelX: number, pixelY: number) => {
        const desktopArea = document.getElementById('goos-desktop-area');
        if (desktopArea) {
            const rect = desktopArea.getBoundingClientRect();
            const relativeX = pixelX - rect.left;
            const relativeY = pixelY - rect.top;
            return {
                x: Math.max(2, Math.min(90, (relativeX / rect.width) * 100)),
                y: Math.max(2, Math.min(85, (relativeY / rect.height) * 100)),
            };
        }
        return { x: 20, y: 20 };
    }, []);

    // Drag-drop handlers for image files
    const handleDesktopDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('Files')) {
            setIsDraggingFile(true);
            e.dataTransfer.dropEffect = 'copy';
        }
    }, []);

    const handleDesktopDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set to false if leaving the desktop area entirely
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            setIsDraggingFile(false);
        }
    }, []);

    const handleDesktopDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) return;

        // Get drop position
        const position = convertToPercentPosition(e.clientX, e.clientY);

        // Process each dropped image
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];

            // Create object URL for local preview (in demo mode)
            const imageUrl = URL.createObjectURL(file);

            // Offset each subsequent image slightly
            const offsetPosition = {
                x: Math.min(90, position.x + (i * 5)),
                y: Math.min(85, position.y + (i * 5)),
            };

            // Create the image file using the context
            const { createImageFile } = goosContext;
            if (createImageFile) {
                await createImageFile(imageUrl, {
                    caption: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
                    alt: file.name,
                    position: offsetPosition,
                });
            }
        }

        showGoOSToast(`Added ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`, 'success');
    }, [convertToPercentPosition, goosContext, showGoOSToast]);

    // New file type creation handlers
    const handleOpenCreateFileDialog = useCallback((fileType: 'image' | 'link' | 'embed' | 'download', position?: { x: number; y: number }) => {
        setCreateFilePosition(position || null);
        setCreateFileDialog({ isOpen: true, fileType });
    }, []);

    const handleCreateImage = useCallback(async (url: string, caption?: string, alt?: string) => {
        const position = createFilePosition ? convertToPercentPosition(createFilePosition.x, createFilePosition.y) : undefined;
        const { createImageFile } = goosContext;
        if (createImageFile) {
            await createImageFile(url, { caption, alt, position });
        }
    }, [createFilePosition, convertToPercentPosition, goosContext]);

    const handleCreateLink = useCallback(async (url: string, title?: string, description?: string) => {
        const position = createFilePosition ? convertToPercentPosition(createFilePosition.x, createFilePosition.y) : undefined;
        const { createLinkFile } = goosContext;
        if (createLinkFile) {
            await createLinkFile(url, { title, description, position });
        }
    }, [createFilePosition, convertToPercentPosition, goosContext]);

    const handleCreateEmbed = useCallback(async (url: string, embedType: string) => {
        const position = createFilePosition ? convertToPercentPosition(createFilePosition.x, createFilePosition.y) : undefined;
        const { createEmbedFile } = goosContext;
        if (createEmbedFile) {
            await createEmbedFile(url, embedType, { position });
        }
    }, [createFilePosition, convertToPercentPosition, goosContext]);

    const handleCreateDownload = useCallback(async (url: string, fileName: string, fileType?: string) => {
        const position = createFilePosition ? convertToPercentPosition(createFilePosition.x, createFilePosition.y) : undefined;
        const { createDownloadFile } = goosContext;
        if (createDownloadFile) {
            await createDownloadFile(url, fileName, { fileType, position });
        }
    }, [createFilePosition, convertToPercentPosition, goosContext]);

    // Widget creation handler - accepts pixel position, converts to percentage
    const handleAddWidget = useCallback(async (widgetType: string, pixelPosition?: { x: number; y: number }) => {
        console.log('[handleAddWidget] Creating widget:', widgetType, 'at pixel:', pixelPosition);

        // Convert pixel position to percentage
        let x = 50; // Default to center
        let y = 30;

        if (pixelPosition) {
            const desktopArea = document.getElementById('goos-desktop-area');
            if (desktopArea) {
                const rect = desktopArea.getBoundingClientRect();
                const relativeX = pixelPosition.x - rect.left;
                const relativeY = pixelPosition.y - rect.top;
                x = Math.max(5, Math.min(95, (relativeX / rect.width) * 100));
                y = Math.max(5, Math.min(90, (relativeY / rect.height) * 100));
            }
        }

        const result = await createWidget(widgetType as WidgetType, { x, y });
        console.log('[handleAddWidget] Result:', result);
    }, [createWidget]);

    const openFile = useCallback((fileId: string) => {
        const file = goosFiles.find(f => f.id === fileId);
        if (!file) return;

        // If it's a folder, open a folder window
        if (file.type === 'folder') {
            if (!openFolders.includes(fileId)) {
                setOpenFolders(prev => [...prev, fileId]);
            }
            setActiveFolderId(fileId);
            setWindowZ(prev => ({ ...prev, [`folder-${fileId}`]: topZIndex + 1 }));
            setTopZIndex(prev => prev + 1);
            return;
        }

        // If it's an image, open in image viewer
        if (file.type === 'image') {
            if (!openImageViewers.includes(fileId)) {
                setOpenImageViewers(prev => [...prev, fileId]);
            }
            setWindowZ(prev => ({ ...prev, [`image-${fileId}`]: topZIndex + 1 }));
            setTopZIndex(prev => prev + 1);
            return;
        }

        // If it's a link, open in browser window
        if (file.type === 'link' && file.linkUrl) {
            if (!openLinkBrowsers.includes(fileId)) {
                setOpenLinkBrowsers(prev => [...prev, fileId]);
            }
            setWindowZ(prev => ({ ...prev, [`link-${fileId}`]: topZIndex + 1 }));
            setTopZIndex(prev => prev + 1);
            return;
        }

        // If it's a game, open the snake game
        if (file.type === 'game') {
            toggleApp('snake');
            return;
        }

        // It's a file, open the editor
        if (!openEditors.includes(fileId)) {
            setOpenEditors(prev => [...prev, fileId]);
        }
        setActiveEditorId(fileId);
        setWindowZ(prev => ({ ...prev, [`editor-${fileId}`]: topZIndex + 1 }));
        setTopZIndex(prev => prev + 1);
    }, [goosFiles, openEditors, openFolders, openImageViewers, openLinkBrowsers, topZIndex]);

    const closeFolder = useCallback((folderId: string) => {
        setOpenFolders(prev => prev.filter(id => id !== folderId));
        if (activeFolderId === folderId) {
            setActiveFolderId(null);
        }
    }, [activeFolderId]);

    const moveFileToFolder = useCallback((fileId: string, targetFolderId: string | null) => {
        // Don't move a folder into itself
        if (fileId === targetFolderId) return;
        // Use API persistence
        moveGoOSFile(fileId, targetFolderId);
    }, [moveGoOSFile]);

    const closeEditor = useCallback((fileId: string) => {
        setOpenEditors(prev => prev.filter(id => id !== fileId));
        setMinimizedEditors(prev => {
            const next = new Set(prev);
            next.delete(fileId);
            return next;
        });
        setMaximizedEditors(prev => {
            const next = new Set(prev);
            next.delete(fileId);
            return next;
        });
        if (activeEditorId === fileId) {
            const remaining = openEditors.filter(id => id !== fileId);
            setActiveEditorId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
        }
    }, [activeEditorId, openEditors]);

    const minimizeEditor = useCallback((fileId: string) => {
        setMinimizedEditors(prev => {
            const next = new Set(prev);
            next.add(fileId);
            return next;
        });
        // When minimizing, switch to next available editor
        if (activeEditorId === fileId) {
            const remaining = openEditors.filter(id => id !== fileId && !minimizedEditors.has(id));
            setActiveEditorId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
        }
    }, [activeEditorId, openEditors, minimizedEditors]);

    const restoreEditor = useCallback((fileId: string) => {
        setMinimizedEditors(prev => {
            const next = new Set(prev);
            next.delete(fileId);
            return next;
        });
        setActiveEditorId(fileId);
        setWindowZ(prev => ({ ...prev, [`editor-${fileId}`]: topZIndex + 1 }));
        setTopZIndex(prev => prev + 1);
    }, [topZIndex]);

    const toggleMaximizeEditor = useCallback((fileId: string) => {
        setMaximizedEditors(prev => {
            const next = new Set(prev);
            if (next.has(fileId)) {
                next.delete(fileId);
            } else {
                next.add(fileId);
            }
            return next;
        });
    }, []);

    const updateFile = useCallback((fileId: string, updates: Partial<GoOSFile>) => {
        // Use API persistence
        updateGoOSFile(fileId, {
            ...updates,
            parentId: updates.parentFolderId,
        } as Partial<GoOSFileData>);
    }, [updateGoOSFile]);

    const deleteFile = useCallback(async (fileId: string) => {
        const success = await deleteGoOSFile(fileId);
        if (success) {
            closeEditor(fileId);
            setSelectedFileId(null);
        }
    }, [deleteGoOSFile, closeEditor]);

    const duplicateFile = useCallback(async (fileId: string) => {
        await duplicateGoOSFile(fileId);
    }, [duplicateGoOSFile]);

    const updateFilePosition = useCallback((fileId: string, position: { x: number; y: number }) => {
        updateGoOSFile(fileId, { position });
    }, [updateGoOSFile]);

    // Arrange all desktop icons in a clean grid
    const arrangeIcons = useCallback(() => {
        const files = filesOnDesktop;
        if (files.length === 0) return;

        // Grid settings (percentages) - icons arranged from top-left
        const startX = 3; // Start 3% from left
        const startY = 5; // Start 5% from top
        const iconWidth = 8; // Each icon takes ~8% width
        const iconHeight = 12; // Each icon takes ~12% height
        const columns = Math.floor((100 - startX * 2) / iconWidth); // Calculate how many columns fit

        files.forEach((file, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = startX + col * iconWidth;
            const y = startY + row * iconHeight;
            updateGoOSFile(file.id, { position: { x, y } });
        });
    }, [filesOnDesktop, updateGoOSFile]);

    const copyFile = useCallback((fileId: string) => {
        const file = goosFiles.find(f => f.id === fileId);
        if (file) setClipboard({ files: [file], operation: 'copy' });
    }, [goosFiles]);

    const cutFile = useCallback((fileId: string) => {
        const file = goosFiles.find(f => f.id === fileId);
        if (file) setClipboard({ files: [file], operation: 'cut' });
    }, [goosFiles]);

    const pasteFile = useCallback(async () => {
        if (!clipboard) return;
        for (const file of clipboard.files) {
            if (clipboard.operation === 'copy') {
                // Duplicate via API
                await duplicateGoOSFile(file.id);
            } else {
                // Cut = move to root (null parent)
                await moveGoOSFile(file.id, null);
            }
        }
        if (clipboard.operation === 'cut') {
            setClipboard(null);
        }
    }, [clipboard, duplicateGoOSFile, moveGoOSFile]);

    const renameFile = useCallback((fileId: string, newTitle: string) => {
        updateGoOSFile(fileId, { title: newTitle });
        setRenamingFileId(null);
    }, [updateGoOSFile]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if focus is in an input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;

            // Cmd+K or Cmd+P: Open command palette
            if (modKey && (e.key === 'k' || e.key === 'p')) {
                e.preventDefault();
                setCommandPaletteOpen(true);
                return;
            }

            // Cmd+N: New Note
            if (modKey && e.key === 'n' && !e.shiftKey) {
                e.preventDefault();
                createFile('note');
            }

            // Cmd+Shift+N: New Case Study
            if (modKey && e.key === 'n' && e.shiftKey) {
                e.preventDefault();
                createFile('case-study');
            }

            // Cmd+D: Duplicate selected file
            if (modKey && e.key === 'd' && selectedFileId) {
                e.preventDefault();
                duplicateFile(selectedFileId);
            }

            // Cmd+C: Copy selected file
            if (modKey && e.key === 'c' && selectedFileId) {
                e.preventDefault();
                copyFile(selectedFileId);
            }

            // Cmd+X: Cut selected file
            if (modKey && e.key === 'x' && selectedFileId) {
                e.preventDefault();
                cutFile(selectedFileId);
            }

            // Cmd+V: Paste
            if (modKey && e.key === 'v' && clipboard) {
                e.preventDefault();
                pasteFile();
            }

            // Delete/Backspace: Delete selected file
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFileId) {
                e.preventDefault();
                if (window.confirm('Are you sure you want to delete this file?')) {
                    deleteFile(selectedFileId);
                }
            }

            // Enter: Rename selected file or open it
            if (e.key === 'Enter' && selectedFileId && !renamingFileId) {
                e.preventDefault();
                const file = goosFiles.find(f => f.id === selectedFileId);
                if (file && file.type !== 'folder') {
                    openFile(selectedFileId);
                } else {
                    setRenamingFileId(selectedFileId);
                }
            }

            // Escape: Deselect
            if (e.key === 'Escape') {
                setSelectedFileId(null);
                setRenamingFileId(null);
                setDesktopContextMenu(prev => ({ ...prev, isOpen: false }));
                setFileContextMenu(prev => ({ ...prev, isOpen: false }));
            }

            // Cmd+1/2/3/4: Switch spaces
            if (modKey && ['1', '2', '3', '4'].includes(e.key)) {
                e.preventDefault();
                const spaceIndex = parseInt(e.key) - 1;
                const space = DEMO_SPACES[spaceIndex];
                if (space) {
                    setActiveSpaceId(space.id);
                    showGoOSToast(`Switched to ${space.name}`, 'success');
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [createFile, selectedFileId, duplicateFile, copyFile, cutFile, clipboard, pasteFile, deleteFile, openFile, goosFiles, renamingFileId, showGoOSToast]);

    // Desktop right-click handler
    const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
        // Only show if clicked on the desktop background
        const target = e.target as HTMLElement;
        if (target.closest('[data-file-id]') || target.closest('[data-window]')) {
            return;
        }
        e.preventDefault();
        // Close other context menus
        setFileContextMenu(prev => ({ ...prev, isOpen: false }));
        setWidgetContextMenu({ isOpen: false, x: 0, y: 0, widget: null });
        setDesktopContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
        setSelectedFileId(null);
    }, []);

    // File right-click handler
    const handleFileContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Close other context menus
        setDesktopContextMenu(prev => ({ ...prev, isOpen: false }));
        setWidgetContextMenu({ isOpen: false, x: 0, y: 0, widget: null });
        setFileContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, fileId });
        setSelectedFileId(fileId);
    }, []);

    // Widget right-click handler
    const handleWidgetContextMenu = useCallback((e: React.MouseEvent, widget: Widget) => {
        e.preventDefault();
        e.stopPropagation();
        // Close other context menus
        setDesktopContextMenu(prev => ({ ...prev, isOpen: false }));
        setFileContextMenu(prev => ({ ...prev, isOpen: false }));
        // Open widget context menu
        setWidgetContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, widget });
    }, []);

    // Close widget context menu
    const closeWidgetContextMenu = useCallback(() => {
        setWidgetContextMenu({ isOpen: false, x: 0, y: 0, widget: null });
    }, []);

    useEffect(() => {
        // Playful greetings that rotate and vary by time
        const morningGreetings = [
            "Rise and shine! ☀️",
            "Ready to create? ✨",
            "Good morning! ☕",
            "Let's make something cool!",
            "Fresh start, fresh ideas 🌱",
        ];
        const afternoonGreetings = [
            "Productivity time! 🚀",
            "Keep crushing it! 💪",
            "Good afternoon! 🌤",
            "Making magic happen ✨",
            "You're doing great!",
        ];
        const eveningGreetings = [
            "Evening vibes 🌅",
            "Winding down? 🌙",
            "Golden hour energy ✨",
            "Almost there! 💫",
            "Cozy coding time 🧸",
        ];
        const nightGreetings = [
            "Night owl mode 🦉",
            "Burning the midnight oil? 🕯️",
            "Late night magic ✨",
            "The city sleeps... you create 🌃",
            "Best ideas come at night 💡",
        ];

        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            const hour = now.getHours();
            let greetings: string[];
            if (hour < 5) greetings = nightGreetings;
            else if (hour < 12) greetings = morningGreetings;
            else if (hour < 17) greetings = afternoonGreetings;
            else if (hour < 21) greetings = eveningGreetings;
            else greetings = nightGreetings;
            setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute for variety
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
            id="goos-desktop-area"
            data-goos-desktop
            data-zen-mode={isZenMode ? 'true' : undefined}
            className={`min-h-screen w-full relative overflow-hidden theme-sketch ${isDarkMode ? 'dark' : ''}`}
            style={{
                backgroundColor: 'var(--bg-canvas)',
                // CSS variable for zen mode - windows use this for full-height
                '--zen-dock-offset': isZenMode ? '0px' : '80px',
            } as React.CSSProperties}
            onContextMenu={handleDesktopContextMenu}
            onDragOver={handleDesktopDragOver}
            onDragLeave={handleDesktopDragLeave}
            onDrop={handleDesktopDrop}
            onClick={(e) => {
                // Close context menus
                setDesktopContextMenu(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
                setFileContextMenu(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
                // Close wallpaper picker only if not clicking on it
                const target = e.target as HTMLElement;
                if (!target.closest('[data-wallpaper-picker]')) {
                    setShowWallpaperPicker(false);
                }
                // Deselect files when clicking on desktop background (not on files or windows)
                if (!target.closest('[data-file-id]') && !target.closest('[data-window]')) {
                    setSelectedFileId(null);
                }
            }}
        >
            {/* SPLASH SCREEN - Click to start (enables sound) */}
            <AnimatePresence>
                {bootPhase === 'splash' && (
                    <motion.div
                        key="splash-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleSplashClick}
                        className="fixed inset-0 z-[10001] flex flex-col items-center justify-center cursor-pointer"
                        style={{
                            background: 'linear-gradient(180deg, #faf8f2 0%, #f5f0e6 100%)',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="flex flex-col items-center gap-6"
                        >
                            {/* Duck with subtle pulse */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-8xl select-none"
                            >
                                🦆
                            </motion.div>

                            <div className="text-center">
                                <h1
                                    className="text-4xl font-bold tracking-tight mb-2"
                                    style={{ color: 'var(--text-primary, #171412)' }}
                                >
                                    goOS
                                </h1>
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--text-muted, #8e827c)' }}
                                >
                                    Your personal web desktop
                                </p>
                            </div>

                            {/* Click to enter button */}
                            <motion.div
                                animate={{ y: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="mt-4 px-6 py-3 rounded-full text-sm font-medium"
                                style={{
                                    background: 'var(--color-accent-primary, #ff7722)',
                                    color: '#fff',
                                    boxShadow: 'var(--shadow-badge, 0 4px 20px rgba(255, 119, 34, 0.3))',
                                }}
                            >
                                Click anywhere to start
                            </motion.div>
                        </motion.div>

                        {/* Sound indicator */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-8 flex items-center gap-2 text-xs"
                            style={{ color: 'var(--text-tertiary, #a09a94)' }}
                        >
                            <span>🔊</span>
                            <span>Sound on for the full experience</span>
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOOT SCREEN - Shows during startup */}
            <AnimatePresence>
                {bootPhase === 'booting' && (
                    <motion.div
                        key="boot-screen"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden"
                        style={{
                            background: 'linear-gradient(180deg, #faf8f2 0%, #f5f0e6 100%)',
                        }}
                    >
                        {/* Subtle floating particles in background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full"
                                    style={{
                                        background: 'var(--color-accent-primary, #ff7722)',
                                        opacity: 0.15,
                                        left: `${15 + i * 15}%`,
                                        top: `${30 + (i % 3) * 20}%`,
                                    }}
                                    animate={{
                                        y: [0, -30, 0],
                                        x: [0, (i % 2 === 0 ? 10 : -10), 0],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: i * 0.3,
                                    }}
                                />
                            ))}
                        </div>

                        {/* goOS Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                            className="flex flex-col items-center gap-5"
                        >
                            {/* Duck with waddle animation */}
                            <motion.div
                                animate={{
                                    y: [0, -15, 0],
                                    rotate: [0, -5, 5, -5, 0],
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="relative"
                            >
                                <span className="text-7xl select-none drop-shadow-lg">🦆</span>
                                {/* Sparkle effect */}
                                <motion.div
                                    className="absolute -top-1 -right-1 text-lg"
                                    animate={{
                                        scale: [0, 1, 0],
                                        rotate: [0, 180],
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: 0.5,
                                    }}
                                >
                                    ✨
                                </motion.div>
                            </motion.div>

                            {/* Logo text with letter animation */}
                            <motion.div className="flex items-baseline gap-0.5">
                                {['g', 'o', 'O', 'S'].map((letter, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                            delay: 0.4 + i * 0.08,
                                        }}
                                        className="text-3xl font-bold tracking-tight"
                                        style={{
                                            color: 'var(--text-primary, #171412)',
                                            textShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                        }}
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </motion.div>

                            {/* Playful loading bar */}
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 140 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                                className="relative h-1.5 rounded-full overflow-hidden"
                                style={{
                                    background: 'rgba(23, 20, 18, 0.08)',
                                }}
                            >
                                <motion.div
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        ease: [0.4, 0, 0.6, 1],
                                    }}
                                    className="absolute inset-y-0 w-1/2 rounded-full"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, var(--color-accent-primary, #ff7722), transparent)',
                                    }}
                                />
                            </motion.div>

                            {/* Fun rotating messages */}
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={bootMessage}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--text-muted, #8e827c)' }}
                                >
                                    {bootMessages[bootMessage]}
                                </motion.p>
                            </AnimatePresence>
                        </motion.div>

                        {/* Footer branding */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="absolute bottom-8 text-[10px] tracking-wider uppercase"
                            style={{ color: 'var(--text-tertiary, #a09a94)' }}
                        >
                            Your personal web desktop
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DESKTOP REVEAL TRANSITION - Dramatic curve animation */}
            <DesktopReveal
                isActive={bootPhase === 'revealing'}
                onComplete={handleRevealComplete}
                variant="curve"
            />

            {/* WALLPAPER BACKGROUND - With Space Theme Support */}
            {wallpaper ? (
                <img
                    src={`/${wallpaper}.png`}
                    alt=""
                    className="absolute inset-0 w-full h-full pointer-events-none select-none"
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        zIndex: 0,
                    }}
                    draggable={false}
                />
            ) : (
                /* Plain background with subtle dots */
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: isDarkMode ? '#171412' : 'var(--color-bg-base, #fbf9ef)',
                        backgroundImage: isDarkMode
                            ? `radial-gradient(circle, rgba(255, 255, 255, 0.06) 1.5px, transparent 1.5px)`
                            : `radial-gradient(circle, rgba(23, 20, 18, 0.08) 1.5px, transparent 1.5px)`,
                        backgroundSize: '28px 28px',
                        zIndex: 0,
                    }}
                />
            )}

            {/* FALLING LETTERS - Physics-based "goOS" letters in background */}
            <FallingLetters isReady={bootPhase === 'ready'} textSize={470} headSize={336} />

            {/* Bottom lava glow - static CSS only, seamless fade */}
            {!wallpaper && (
                <>
                    {/* Main lava layer with soft gradients */}
                    <div
                        className="pointer-events-none"
                        style={{
                            position: 'fixed',
                            zIndex: 4,
                            bottom: '-15vh',
                            left: '-15vw',
                            width: '130vw',
                            height: '55vh',
                            background: `
                                /* Base glow - very soft and wide with smooth multi-stop fade */
                                linear-gradient(to top,
                                    rgba(90, 20, 10, 0.95) 0%,
                                    rgba(130, 35, 20, 0.7) 15%,
                                    rgba(180, 50, 25, 0.4) 30%,
                                    rgba(200, 60, 30, 0.2) 45%,
                                    rgba(220, 80, 40, 0.08) 60%,
                                    rgba(240, 100, 50, 0.02) 75%,
                                    transparent 90%
                                ),
                                /* Deep red underlayer */
                                radial-gradient(ellipse 80% 40% at 50% 100%, rgba(100, 20, 15, 0.8) 0%, rgba(120, 30, 20, 0.4) 40%, transparent 80%),
                                /* Red-orange flame columns - soft multi-stop edges */
                                radial-gradient(ellipse 25% 45% at 0% 100%, rgba(200, 48, 32, 0.6) 0%, rgba(200, 48, 32, 0.3) 40%, rgba(200, 48, 32, 0.1) 70%, transparent 100%),
                                radial-gradient(ellipse 22% 42% at 15% 100%, rgba(216, 72, 24, 0.55) 0%, rgba(216, 72, 24, 0.25) 45%, transparent 100%),
                                radial-gradient(ellipse 28% 48% at 30% 100%, rgba(184, 48, 32, 0.6) 0%, rgba(184, 48, 32, 0.25) 50%, transparent 100%),
                                radial-gradient(ellipse 24% 44% at 45% 100%, rgba(208, 64, 32, 0.55) 0%, rgba(208, 64, 32, 0.2) 55%, transparent 100%),
                                radial-gradient(ellipse 26% 46% at 60% 100%, rgba(200, 56, 24, 0.6) 0%, rgba(200, 56, 24, 0.25) 50%, transparent 100%),
                                radial-gradient(ellipse 23% 43% at 75% 100%, rgba(216, 72, 24, 0.55) 0%, rgba(216, 72, 24, 0.2) 55%, transparent 100%),
                                radial-gradient(ellipse 27% 47% at 90% 100%, rgba(184, 48, 32, 0.6) 0%, rgba(184, 48, 32, 0.25) 50%, transparent 100%),
                                radial-gradient(ellipse 24% 44% at 100% 100%, rgba(192, 64, 32, 0.5) 0%, rgba(192, 64, 32, 0.2) 50%, transparent 100%),
                                /* Orange mid layer */
                                radial-gradient(ellipse 20% 38% at 8% 100%, rgba(232, 90, 0, 0.5) 0%, rgba(232, 90, 0, 0.2) 50%, transparent 100%),
                                radial-gradient(ellipse 24% 42% at 22% 100%, rgba(255, 104, 0, 0.45) 0%, rgba(255, 104, 0, 0.15) 55%, transparent 100%),
                                radial-gradient(ellipse 18% 35% at 38% 100%, rgba(240, 96, 0, 0.5) 0%, rgba(240, 96, 0, 0.18) 50%, transparent 100%),
                                radial-gradient(ellipse 26% 45% at 52% 100%, rgba(255, 85, 0, 0.45) 0%, rgba(255, 85, 0, 0.15) 55%, transparent 100%),
                                radial-gradient(ellipse 21% 40% at 68% 100%, rgba(255, 104, 0, 0.5) 0%, rgba(255, 104, 0, 0.18) 52%, transparent 100%),
                                radial-gradient(ellipse 23% 42% at 82% 100%, rgba(232, 90, 0, 0.45) 0%, rgba(232, 90, 0, 0.15) 55%, transparent 100%),
                                radial-gradient(ellipse 19% 37% at 95% 100%, rgba(255, 85, 0, 0.4) 0%, rgba(255, 85, 0, 0.12) 55%, transparent 100%),
                                /* Bright peaks */
                                radial-gradient(ellipse 16% 32% at 12% 100%, rgba(255, 128, 32, 0.4) 0%, rgba(255, 128, 32, 0.12) 60%, transparent 100%),
                                radial-gradient(ellipse 19% 36% at 28% 100%, rgba(255, 144, 48, 0.35) 0%, rgba(255, 144, 48, 0.1) 60%, transparent 100%),
                                radial-gradient(ellipse 14% 30% at 42% 100%, rgba(255, 128, 32, 0.4) 0%, rgba(255, 128, 32, 0.1) 60%, transparent 100%),
                                radial-gradient(ellipse 20% 38% at 58% 100%, rgba(255, 120, 24, 0.35) 0%, rgba(255, 120, 24, 0.1) 60%, transparent 100%),
                                radial-gradient(ellipse 17% 34% at 72% 100%, rgba(255, 144, 48, 0.4) 0%, rgba(255, 144, 48, 0.1) 60%, transparent 100%),
                                radial-gradient(ellipse 15% 31% at 88% 100%, rgba(255, 128, 32, 0.35) 0%, rgba(255, 128, 32, 0.08) 60%, transparent 100%),
                                /* Yellow-orange hotspots */
                                radial-gradient(ellipse 12% 26% at 18% 100%, rgba(255, 170, 64, 0.35) 0%, rgba(255, 170, 64, 0.08) 65%, transparent 100%),
                                radial-gradient(ellipse 15% 30% at 38% 100%, rgba(255, 184, 80, 0.3) 0%, rgba(255, 184, 80, 0.06) 65%, transparent 100%),
                                radial-gradient(ellipse 13% 28% at 58% 100%, rgba(255, 170, 64, 0.35) 0%, rgba(255, 170, 64, 0.08) 65%, transparent 100%),
                                radial-gradient(ellipse 11% 24% at 78% 100%, rgba(255, 184, 80, 0.3) 0%, rgba(255, 184, 80, 0.06) 65%, transparent 100%),
                                /* Yellow cores - very subtle */
                                radial-gradient(ellipse 8% 20% at 28% 100%, rgba(255, 200, 96, 0.3) 0%, rgba(255, 200, 96, 0.05) 70%, transparent 100%),
                                radial-gradient(ellipse 10% 22% at 50% 100%, rgba(255, 208, 112, 0.25) 0%, rgba(255, 208, 112, 0.04) 70%, transparent 100%),
                                radial-gradient(ellipse 8% 18% at 72% 100%, rgba(255, 200, 96, 0.3) 0%, rgba(255, 200, 96, 0.05) 70%, transparent 100%)
                            `,
                            filter: 'blur(8px)',
                        }}
                    />
                    {/* Soft feather layer for seamless top edge blend */}
                    <div
                        className="pointer-events-none"
                        style={{
                            position: 'fixed',
                            zIndex: 4,
                            bottom: '15vh',
                            left: '-10vw',
                            width: '120vw',
                            height: '25vh',
                            background: 'linear-gradient(to top, rgba(180, 60, 30, 0.15) 0%, rgba(200, 70, 35, 0.06) 30%, rgba(220, 80, 40, 0.02) 60%, transparent 100%)',
                            filter: 'blur(40px)',
                        }}
                    />
                </>
            )}

            {/* DROP ZONE INDICATOR - Shows when dragging files over desktop */}
            {isDraggingFile && (
                <div
                    className="absolute inset-0 pointer-events-none z-[9999]"
                    style={{
                        background: 'rgba(255, 119, 34, 0.05)',
                        border: '3px dashed rgba(255, 119, 34, 0.4)',
                        borderRadius: 12,
                        margin: 8,
                    }}
                >
                    <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                        style={{
                            background: 'var(--bg-elevated)',
                            padding: '16px 24px',
                            borderRadius: 12,
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21,15 16,10 5,21" />
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Drop images here</span>
                    </div>
                </div>
            )}

            {/* CONFETTI CELEBRATION */}
            <ConfettiBurst isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

            {/* MENU BAR - Completely hidden in zen mode for distraction-free focus */}
            <AnimatePresence>
                {!isZenMode && (
                    <motion.header
                        initial={menuBarEntrance.initial}
                        animate={menuBarEntrance.animate}
                        exit={menuBarEntrance.exit}
                        transition={SPRING.smooth}
                        className="flex items-center justify-between fixed top-0 left-0 right-0 select-none"
                        style={{
                            height: 28,
                            padding: '0 12px',
                            background: 'var(--topnav-bg)',
                            backdropFilter: 'var(--topnav-blur)',
                            WebkitBackdropFilter: 'var(--topnav-blur)',
                            borderBottom: 'var(--topnav-border)',
                            boxShadow: 'var(--topnav-shadow)',
                            zIndex: 'var(--z-menubar, 400)',
                            fontFamily: 'var(--font-body)',
                        }}
                    >
                        {/* Left: Logo + Space Switcher */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                onClick={handleLogoClick}
                                whileHover={{ opacity: 0.7 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative"
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    letterSpacing: '-0.01em',
                                }}
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
                                                style={{ background: 'var(--color-accent-primary)' }}
                                            >
                                                You found the duck! 🦆
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Subtle divider */}
                            <div
                                style={{
                                    width: 1,
                                    height: 12,
                                    background: 'var(--color-border-default)',
                                    opacity: 0.5,
                                }}
                            />

                            {/* Space Switcher */}
                            <SpaceSwitcher
                                spaces={DEMO_SPACES}
                                activeSpaceId={activeSpaceId}
                                onSwitchSpace={(spaceId) => {
                                    setActiveSpaceId(spaceId);
                                    const space = DEMO_SPACES.find(s => s.id === spaceId);
                                    if (space) {
                                        showGoOSToast(`Switched to ${space.name}`, 'success');
                                    }
                                }}
                                onCreateSpace={() => setShowCreateSpaceModal(true)}
                                onManageSpaces={() => setShowManageSpacesDialog(true)}
                            />

                            {/* Widgets Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowWidgetsMenu(!showWidgetsMenu)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '2px 6px',
                                        fontSize: '13px',
                                        fontWeight: 400,
                                        color: 'var(--color-text-secondary)',
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius-xs)',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Widgets
                                </button>
                                <AnimatePresence>
                                    {showWidgetsMenu && (
                                        <>
                                            <div className="fixed inset-0 z-[2000]" onClick={() => setShowWidgetsMenu(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                                transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                                                className="absolute top-full left-0 mt-1 z-[2001] py-1"
                                                style={{
                                                    background: 'var(--color-bg-elevated)',
                                                    backdropFilter: 'blur(20px) saturate(180%)',
                                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                                    border: '1px solid var(--color-border-subtle)',
                                                    borderRadius: 'var(--radius-md)',
                                                    boxShadow: 'var(--shadow-dropdown)',
                                                    minWidth: '140px',
                                                }}
                                            >
                                                {Object.entries(WIDGET_METADATA).map(([type, meta]) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            handleAddWidget(type, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
                                                            setShowWidgetsMenu(false);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '6px 12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            fontWeight: 400,
                                                            color: 'var(--color-text-primary)',
                                                            textAlign: 'left',
                                                            transition: 'background 0.1s ease',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                                                        <span>{meta.label}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Settings Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '2px 6px',
                                        fontSize: '13px',
                                        fontWeight: 400,
                                        color: 'var(--color-text-secondary)',
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius-xs)',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Settings
                                </button>
                                <AnimatePresence>
                                    {showSettingsMenu && (
                                        <>
                                            <div className="fixed inset-0 z-[2000]" onClick={() => setShowSettingsMenu(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                                transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                                                className="absolute top-full left-0 mt-1 z-[2001] py-1"
                                                style={{
                                                    background: 'var(--color-bg-elevated)',
                                                    backdropFilter: 'blur(20px) saturate(180%)',
                                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                                    border: '1px solid var(--color-border-subtle)',
                                                    borderRadius: 'var(--radius-md)',
                                                    boxShadow: 'var(--shadow-dropdown)',
                                                    minWidth: '140px',
                                                }}
                                            >
                                                <button
                                                    onClick={() => { toggleApp('analytics'); setShowSettingsMenu(false); }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px 12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: 400,
                                                        color: 'var(--color-text-primary)',
                                                        textAlign: 'left',
                                                        transition: 'background 0.1s ease',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <BarChart3 size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
                                                    <span>Analytics</span>
                                                </button>
                                                <button
                                                    onClick={() => { toggleApp('settings'); setShowSettingsMenu(false); }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px 12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: 400,
                                                        color: 'var(--color-text-primary)',
                                                        textAlign: 'left',
                                                        transition: 'background 0.1s ease',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <Settings size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
                                                    <span>Preferences</span>
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Right: Time only - clean and minimal */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle - Ultra minimal */}
                            <motion.button
                                onClick={toggleDarkMode}
                                whileHover={{ opacity: 0.6 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                                style={{
                                    width: 18,
                                    height: 18,
                                    color: 'var(--color-text-muted)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                            >
                                <AnimatePresence mode="wait">
                                    {isDarkMode ? (
                                        <motion.svg
                                            key="moon"
                                            width="11"
                                            height="11"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            initial={{ opacity: 0, rotate: -30 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: 30 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                        </motion.svg>
                                    ) : (
                                        <motion.svg
                                            key="sun"
                                            width="11"
                                            height="11"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            initial={{ opacity: 0, rotate: 30 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: -30 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                        </motion.svg>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Time - clean typography */}
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    fontVariantNumeric: 'tabular-nums',
                                    color: 'var(--color-text-secondary)',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {time}
                            </span>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* PAGE VIEW MODE - Belle Duffner-style case study view */}
            {viewMode === 'page' && (() => {
                // Get the most recent published case study (or note) to display
                const publishedFiles = goosFiles
                    .filter(f => f.status === 'published')
                    .sort((a, b) => {
                        // Prioritize case studies over notes
                        if (a.type === 'case-study' && b.type !== 'case-study') return -1;
                        if (b.type === 'case-study' && a.type !== 'case-study') return 1;
                        // Then sort by publishedAt (most recent first)
                        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                        return dateB - dateA;
                    });
                const firstFile = publishedFiles[0];

                if (!firstFile) {
                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                            className="fixed inset-0 z-[9000] flex flex-col items-center justify-center gap-6"
                            style={{ background: 'var(--bg-canvas)' }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                className="text-center"
                            >
                                <motion.span
                                    className="text-6xl block mb-4"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    📝
                                </motion.span>
                                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No published content yet</p>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Switch to Desktop to create and publish your first piece</p>
                            </motion.div>
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setViewMode('desktop')}
                                style={{
                                    padding: '12px 24px',
                                    background: 'var(--border-strong)',
                                    color: 'var(--text-inverse)',
                                    border: 'none',
                                    borderRadius: goOS.radii.button,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                ← Back to Desktop
                            </motion.button>
                        </motion.div>
                    );
                }

                // Get related studies (other published files)
                const relatedStudies = publishedFiles
                    .filter(f => f.id !== firstFile.id)
                    .slice(0, 2)
                    .map(f => ({
                        id: f.id,
                        title: f.title,
                        subtitle: null,
                        headerImage: f.headerImage || null,
                        fileType: f.type as 'note' | 'case-study',
                    }));

                return (
                    <CaseStudyPageView
                        note={{
                            id: firstFile.id,
                            title: firstFile.title,
                            subtitle: null,
                            content: firstFile.content,
                            headerImage: firstFile.headerImage || null,
                            publishedAt: firstFile.publishedAt ? new Date(firstFile.publishedAt) : null,
                            fileType: firstFile.type as 'note' | 'case-study',
                        }}
                        author={{
                            username: 'demo',
                            name: 'Demo User',
                            image: null,
                        }}
                        relatedStudies={relatedStudies}
                        onClose={() => setViewMode('desktop')}
                    />
                );
            })()}

            {/* DESKTOP AREA */}
            <main className="pt-10 pb-20 min-h-screen relative">
                {/* Present View Mode */}
                {viewMode === 'present' && (
                    <PresentView
                        items={goosFilesAsDesktopItems}
                        isOwner={true}
                        onClose={() => setViewMode('desktop')}
                    />
                )}

                {/* Desktop View Mode - only show when viewMode is 'desktop' */}
                {viewMode === 'desktop' && (
                    <>
                        {/* Decorative Plant (Right side) */}
                        <motion.div
                            className="fixed top-16 right-6 z-[30] text-4xl select-none"
                            animate={{ rotate: [-2, 2, -2] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformOrigin: 'bottom center' }}
                        >
                            🪴
                        </motion.div>

                        {/* Portfolio Desktop Icons - goOS style (draggable) */}
                        {items.map((item) => (
                            <GoOSDesktopIcon
                                key={item.id}
                                id={item.id}
                                label={item.label}
                                thumbnailUrl={item.thumbnailUrl}
                                onClick={() => windowContext.openWindow(item.id)}
                                isActive={windowContext.isItemOpen(item.id)}
                                position={portfolioPositions[item.id] || { x: 50, y: 50 }}
                                onPositionChange={handlePortfolioPositionChange}
                            />
                        ))}

                        {/* Portfolio Windows */}
                        <WindowManager items={items} />

                        {/* goOS File Icons (desktop - root level only) - with staggered pop-in */}
                        <AnimatePresence mode="sync" initial={false}>
                            {filesOnDesktop.map((file, index) => {
                                // Ensure file has a valid position
                                const filePosition = file.position || { x: 40, y: 320 };
                                return (
                                    <motion.div
                                        key={file.id}
                                        initial={{ opacity: 0, scale: 0.5, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.7, y: 15 }}
                                        transition={{
                                            ...SPRING.bouncy,
                                            delay: getStaggerDelayCapped(index, 0.06, 0.4),
                                        }}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                                    >
                                        <div style={{ pointerEvents: 'auto' }}>
                                            <GoOSFileIcon
                                                id={file.id}
                                                type={file.type}
                                                title={file.title}
                                                status={file.status}
                                                accessLevel={file.accessLevel}
                                                isSelected={selectedFileId === file.id}
                                                isRenaming={renamingFileId === file.id}
                                                position={filePosition}
                                                isDraggedOver={dragOverFolderId === file.id}
                                                onDragStart={handleDragStart}
                                                onDrag={checkFolderHit}
                                                onPositionChange={handlePositionChange}
                                                onClick={handleFileClick}
                                                onDoubleClick={() => openFile(file.id)}
                                                onContextMenu={(e) => handleFileContextMenu(e, file.id)}
                                                onRename={(newTitle) => renameFile(file.id, newTitle)}
                                                imageUrl={file.imageUrl}
                                                linkUrl={file.linkUrl}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Canvas App Desktop Icon - Standalone drawing app */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ ...SPRING.bouncy, delay: 0.3 }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                        >
                            <div style={{ pointerEvents: 'auto' }}>
                                <GoOSDesktopIcon
                                    id="canvas-app"
                                    label="Canvas"
                                    icon={
                                        <div style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 10,
                                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 50%, #ffaa00 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: -1,
                                        }}>
                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                                                <path d="M2 2l7.586 7.586"/>
                                                <circle cx="11" cy="11" r="2"/>
                                            </svg>
                                        </div>
                                    }
                                    onClick={() => toggleApp('canvas')}
                                    isActive={appWindows.canvas}
                                    position={canvasPosition}
                                    onPositionChange={(pos) => handleCanvasPositionChange(pos)}
                                />
                            </div>
                        </motion.div>

                        {/* goOS Widgets - fully functional */}
                        <WidgetRenderer
                            widgets={widgets}
                            isOwner={true}
                            isDark={isDarkMode}
                            onWidgetEdit={(widget) => {
                                setEditingWidget(widget);
                            }}
                            onWidgetDelete={(id) => {
                                deleteWidget(id);
                            }}
                            onWidgetPositionChange={(id, x, y) => {
                                updateWidget(id, { positionX: x, positionY: y });
                            }}
                            onWidgetContextMenu={handleWidgetContextMenu}
                            highlightedWidgetId={widgetContextMenu.isOpen ? widgetContextMenu.widget?.id : null}
                            onContact={async (data) => {
                                // Send contact form via API
                                try {
                                    const response = await fetch('/api/contact', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data),
                                    });
                                    if (!response.ok) throw new Error('Failed to send');
                                    showGoOSToast('Message sent successfully!', 'success');
                                } catch {
                                    // Fallback to mailto
                                    const subject = encodeURIComponent(`Contact from ${data.name || 'Website Visitor'}`);
                                    const body = encodeURIComponent(`${data.message}\n\nFrom: ${data.name || 'Anonymous'}\nEmail: ${data.email}`);
                                    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
                                }
                            }}
                            onTip={async (amount) => {
                                // For now, show appreciation - Stripe integration needed for real payments
                                showGoOSToast(`Thank you for the $${amount} tip! 💙`, 'success');
                                // TODO: Integrate Stripe checkout
                                // window.open(`https://buy.stripe.com/your-link?amount=${amount * 100}`, '_blank');
                            }}
                            onFeedback={async (feedback) => {
                                try {
                                    const response = await fetch('/api/feedback', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ feedback, timestamp: new Date().toISOString() }),
                                    });
                                    if (!response.ok) throw new Error('Failed to send');
                                    showGoOSToast('Feedback received, thank you!', 'success');
                                } catch {
                                    // Store locally as fallback
                                    const feedbacks = JSON.parse(localStorage.getItem('goos-feedback') || '[]');
                                    feedbacks.push({ feedback, timestamp: new Date().toISOString() });
                                    localStorage.setItem('goos-feedback', JSON.stringify(feedbacks));
                                    showGoOSToast('Feedback saved, thank you!', 'success');
                                }
                            }}
                            onStickyNoteChange={(widgetId, content) => {
                                updateWidget(widgetId, { config: { content } });
                            }}
                        />

                        {/* goOS Editor Windows */}
                        <AnimatePresence>
                            {openEditors
                                .filter(fileId => !minimizedEditors.has(fileId))
                                .map((fileId) => {
                                    const file = goosFiles.find(f => f.id === fileId);
                                    if (!file) return null;

                                    // Render CV Window for CV files
                                    if (file.type === 'cv') {
                                        return (
                                            <GoOSCVWindow
                                                key={file.id}
                                                file={file as Parameters<typeof GoOSCVWindow>[0]['file']}
                                                onClose={() => closeEditor(file.id)}
                                                onMinimize={() => minimizeEditor(file.id)}
                                                onMaximize={() => toggleMaximizeEditor(file.id)}
                                                isMaximized={maximizedEditors.has(file.id)}
                                                isZenMode={isZenMode && maximizedEditors.has(file.id)}
                                                onUpdate={(updates) => {
                                                    // Use auto-save for content changes
                                                    if (updates.content !== undefined) {
                                                        goosAutoSave(file.id, updates.content, file.title);
                                                    }
                                                    // Use immediate update for status changes
                                                    if (updates.status !== undefined) {
                                                        if (updates.status === 'published') {
                                                            publishGoOSFile(file.id);
                                                            celebrate();
                                                        } else {
                                                            unpublishGoOSFile(file.id);
                                                        }
                                                    }
                                                }}
                                                isActive={activeEditorId === file.id}
                                                zIndex={windowZ[`editor-${file.id}`] || topZIndex}
                                                isOwner={true}
                                            />
                                        );
                                    }

                                    // Render Editor Window for other file types
                                    return (
                                        <GoOSEditorWindow
                                            key={file.id}
                                            file={file}
                                            onClose={() => closeEditor(file.id)}
                                            onMinimize={() => minimizeEditor(file.id)}
                                            onMaximize={() => toggleMaximizeEditor(file.id)}
                                            isMaximized={maximizedEditors.has(file.id)}
                                            isZenMode={isZenMode && maximizedEditors.has(file.id)}
                                            onUpdate={(updates) => {
                                                // Use auto-save for content/title changes (debounced)
                                                if (updates.content !== undefined || updates.title !== undefined) {
                                                    goosAutoSave(file.id, updates.content ?? file.content, updates.title);
                                                }
                                                // Use immediate update for status changes
                                                if (updates.status !== undefined) {
                                                    if (updates.status === 'published') {
                                                        publishGoOSFile(file.id);
                                                        celebrate(); // 🎉 Celebrate publishing!
                                                    } else {
                                                        unpublishGoOSFile(file.id);
                                                    }
                                                }
                                            }}
                                            isActive={activeEditorId === file.id}
                                            zIndex={windowZ[`editor-${file.id}`] || topZIndex}
                                        />
                                    );
                                })}
                        </AnimatePresence>

                        {/* goOS Folder Windows */}
                        <AnimatePresence>
                            {openFolders.map((folderId) => {
                                const folder = goosFiles.find(f => f.id === folderId);
                                if (!folder || folder.type !== 'folder') return null;
                                return (
                                    <GoOSFolderWindow
                                        key={folder.id}
                                        folder={folder}
                                        files={goosFiles}
                                        onClose={() => {
                                            closeFolder(folder.id);
                                            setMaximizedFolders(prev => {
                                                const next = new Set(prev);
                                                next.delete(folder.id);
                                                return next;
                                            });
                                        }}
                                        onMinimize={() => closeFolder(folder.id)}
                                        onMaximize={() => {
                                            setMaximizedFolders(prev => {
                                                const next = new Set(prev);
                                                if (next.has(folder.id)) {
                                                    next.delete(folder.id);
                                                } else {
                                                    next.add(folder.id);
                                                }
                                                return next;
                                            });
                                        }}
                                        onFileDoubleClick={openFile}
                                        onFileClick={handleFileClick}
                                        selectedFileId={selectedFileId}
                                        isActive={activeFolderId === folder.id}
                                        isMaximized={maximizedFolders.has(folder.id)}
                                        zIndex={windowZ[`folder-${folder.id}`] || topZIndex}
                                        onFocus={() => {
                                            setActiveFolderId(folder.id);
                                            setWindowZ(prev => ({ ...prev, [`folder-${folder.id}`]: topZIndex + 1 }));
                                            setTopZIndex(prev => prev + 1);
                                        }}
                                    />
                                );
                            })}
                        </AnimatePresence>

                        {/* goOS Image Viewer Windows */}
                        <AnimatePresence>
                            {openImageViewers.map((imageId) => {
                                const imageFile = goosFiles.find(f => f.id === imageId);
                                if (!imageFile || imageFile.type !== 'image') return null;
                                const imageUrl = imageFile.imageUrl || '';
                                return (
                                    <motion.div
                                        key={imageFile.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        drag
                                        dragMomentum={false}
                                        data-window
                                        onClick={() => {
                                            setWindowZ(prev => ({ ...prev, [`image-${imageFile.id}`]: topZIndex + 1 }));
                                            setTopZIndex(prev => prev + 1);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            left: `${Math.min(imageFile.position.x + 5, 60)}%`,
                                            top: `${Math.min(imageFile.position.y + 5, 40)}%`,
                                            zIndex: windowZ[`image-${imageFile.id}`] || topZIndex,
                                            background: 'var(--color-bg-base, #faf8f2)',
                                            borderRadius: 12,
                                            boxShadow: '0 8px 32px rgba(23, 20, 18, 0.15), 0 2px 8px rgba(23, 20, 18, 0.08)',
                                            border: '1px solid rgba(23, 20, 18, 0.08)',
                                            overflow: 'hidden',
                                            maxWidth: '80vw',
                                            maxHeight: '80vh',
                                        }}
                                    >
                                        {/* Title bar */}
                                        <div
                                            className="flex items-center justify-between px-4 cursor-move"
                                            style={{
                                                height: 44,
                                                background: 'var(--color-bg-base, #faf8f2)',
                                                borderBottom: '1px solid rgba(23, 20, 18, 0.06)',
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenImageViewers(prev => prev.filter(id => id !== imageFile.id));
                                                    }}
                                                    className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] transition-colors"
                                                    style={{ boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.1)' }}
                                                />
                                            </div>
                                            <span
                                                className="text-xs font-medium truncate max-w-[200px]"
                                                style={{ color: 'var(--color-text-secondary, #6b6560)' }}
                                            >
                                                {imageFile.title}
                                            </span>
                                            <div style={{ width: 12 }} />
                                        </div>
                                        {/* Image content */}
                                        <div
                                            style={{
                                                padding: 8,
                                                background: 'rgba(23, 20, 18, 0.02)',
                                            }}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageUrl}
                                                alt={imageFile.imageAlt || imageFile.title}
                                                style={{
                                                    maxWidth: '70vw',
                                                    maxHeight: '65vh',
                                                    objectFit: 'contain',
                                                    borderRadius: 8,
                                                    display: 'block',
                                                }}
                                                draggable={false}
                                            />
                                        </div>
                                        {/* Caption */}
                                        {imageFile.imageCaption && (
                                            <div
                                                style={{
                                                    padding: '8px 12px 12px',
                                                    fontSize: 12,
                                                    color: 'var(--color-text-secondary, #6b6560)',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {imageFile.imageCaption}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* goOS Link Browser Windows */}
                        <AnimatePresence>
                            {openLinkBrowsers.map((linkId) => {
                                const linkFile = goosFiles.find(f => f.id === linkId);
                                if (!linkFile || linkFile.type !== 'link' || !linkFile.linkUrl) return null;
                                return (
                                    <GoOSLinkBrowserWindow
                                        key={linkFile.id}
                                        id={linkFile.id}
                                        url={linkFile.linkUrl}
                                        title={linkFile.title}
                                        zIndex={windowZ[`link-${linkFile.id}`] || topZIndex}
                                        isActive={windowZ[`link-${linkFile.id}`] === topZIndex}
                                        isMaximized={maximizedLinkBrowsers.has(linkFile.id)}
                                        onClose={() => {
                                            setOpenLinkBrowsers(prev => prev.filter(id => id !== linkFile.id));
                                            setMaximizedLinkBrowsers(prev => {
                                                const next = new Set(prev);
                                                next.delete(linkFile.id);
                                                return next;
                                            });
                                        }}
                                        onMinimize={() => {
                                            setOpenLinkBrowsers(prev => prev.filter(id => id !== linkFile.id));
                                        }}
                                        onMaximize={() => {
                                            setMaximizedLinkBrowsers(prev => {
                                                const next = new Set(prev);
                                                if (next.has(linkFile.id)) {
                                                    next.delete(linkFile.id);
                                                } else {
                                                    next.add(linkFile.id);
                                                }
                                                return next;
                                            });
                                        }}
                                        onFocus={() => {
                                            setWindowZ(prev => ({ ...prev, [`link-${linkFile.id}`]: topZIndex + 1 }));
                                            setTopZIndex(prev => prev + 1);
                                        }}
                                    />
                                );
                            })}
                        </AnimatePresence>

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
                                <div className="p-4" style={{ background: 'var(--bg-surface)' }}>
                                    <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>From</span>
                                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>David</span>
                                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>12:05 PM</span>
                                        </div>
                                        <Heart size={18} style={{ color: 'var(--accent-primary)' }} fill="var(--accent-primary)" />
                                    </div>
                                    <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Hey there! 👋</p>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Welcome to goOS Demo! Click the portfolio items to explore.</p>
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
                                <div className="p-4 h-full" style={{ background: 'var(--bg-surface)' }}>
                                    <h3 className="text-base font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>📝 Todo List</h3>
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
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--accent-light)', border: '1px solid var(--border-subtle)' }}>🦆</div>
                                            <div className="rounded-xl rounded-tl-none px-4 py-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: goOS.shadows.sm }}>
                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Welcome to goOS Demo! 🦆</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <div className="rounded-xl rounded-tr-none px-4 py-2.5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', boxShadow: goOS.shadows.sm }}>
                                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>This looks amazing!</span>
                                            </div>
                                        </div>
                                        <TypingIndicator />
                                    </div>
                                    <div className="p-3" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none"
                                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
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
                                    <div className="pl-4 mt-1" style={{ color: 'var(--accent-primary)' }}>READY... [████████████] 100%</div>
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
                                            <button key={name} className="flex flex-col items-center gap-2 p-3 rounded-lg transition-colors" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                <Folder size={36} fill="var(--icon-fill)" stroke="var(--icon-stroke)" strokeWidth={1.5} />
                                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{name}</span>
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
                                <div className="p-5 space-y-4" style={{ background: 'var(--bg-surface)' }}>
                                    <div>
                                        <h4 className="text-sm font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>Appearance</h4>
                                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Dark Mode</span>
                                            <div className="w-10 h-5 rounded-full relative cursor-pointer" style={{ background: 'var(--border-medium)' }}>
                                                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full" style={{ background: 'var(--text-primary)' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>About</h4>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>goOS Demo — A playful portfolio experience</p>
                                    </div>
                                </div>
                            </SketchWindow>

                            {/* Guestbook Window */}
                            <SketchWindow
                                id="guestbook"
                                title="Guestbook"
                                icon={<BookOpen size={14} />}
                                isOpen={appWindows.guestbook}
                                zIndex={windowZ.guestbook}
                                defaultX={getWindowX(450)}
                                defaultY={100}
                                width={380}
                                height={520}
                                onClose={() => closeApp('guestbook')}
                                onFocus={() => focusApp('guestbook')}
                            >
                                <GoOSGuestbook
                                    entries={guestbookEntries}
                                    onSubmit={(entry) => {
                                        const newEntry: GuestbookEntry = {
                                            ...entry,
                                            id: `gb-${Date.now()}`,
                                            createdAt: new Date(),
                                            isPublic: true,
                                        };
                                        setGuestbookEntries(prev => [newEntry, ...prev]);
                                    }}
                                />
                            </SketchWindow>

                            {/* Analytics Window */}
                            <SketchWindow
                                id="analytics"
                                title="Analytics"
                                icon={<BarChart3 size={14} />}
                                isOpen={appWindows.analytics}
                                zIndex={windowZ.analytics}
                                defaultX={getWindowX(80)}
                                defaultY={60}
                                width={440}
                                height={580}
                                onClose={() => closeApp('analytics')}
                                onFocus={() => focusApp('analytics')}
                            >
                                <GoOSAnalytics data={DEMO_ANALYTICS_DATA} />
                            </SketchWindow>

                            {/* Snake Game */}
                            <GoOSSnakeGame
                                isOpen={appWindows.snake}
                                zIndex={windowZ.snake}
                                isActive={windowZ.snake === topZIndex}
                                onClose={() => closeApp('snake')}
                                onFocus={() => focusApp('snake')}
                            />

                            {/* Canvas - Drawing App */}
                            <SketchWindow
                                id="canvas"
                                title="Canvas"
                                icon={
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                                    </svg>
                                }
                                isOpen={appWindows.canvas}
                                zIndex={windowZ.canvas}
                                defaultX={getWindowX(120)}
                                defaultY={50}
                                width={800}
                                height={600}
                                onClose={() => closeApp('canvas')}
                                onFocus={() => focusApp('canvas')}
                            >
                                <DrawingApp />
                            </SketchWindow>
                        </AnimatePresence>
                    </>
                )}
            </main>

            {/* DOCK - Hides in zen mode for distraction-free experience */}
            <AnimatePresence>
                {!isZenMode && (
                    <motion.footer
                        initial={{ ...dockEntrance.initial, x: '-50%' }}
                        animate={{ ...dockEntrance.animate, x: '-50%' }}
                        exit={{ ...dockEntrance.exit, x: '-50%' }}
                        transition={SPRING.bouncy}
                        className="fixed bottom-4 left-1/2 z-[3000]"
                    >
                        <div
                            className="dock-container flex items-end px-3 py-2.5 rounded-[20px] relative"
                            style={{
                                background: 'var(--dock-physical-bg)',
                                border: 'var(--dock-physical-border)',
                                boxShadow: 'var(--dock-physical-shadow)',
                                transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
                            }}
                        >
                            {/* Left corner detail - physical screw/rivet */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    background: 'var(--dock-corner-bg)',
                                    boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.15)',
                                    transition: 'background 0.3s ease',
                                }}
                            />
                            {/* Right corner detail */}
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    background: 'var(--dock-corner-bg)',
                                    boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.15)',
                                    transition: 'background 0.3s ease',
                                }}
                            />
                            <RubberDuck />
                            <DockIcon
                                icon={<Mail size={22} stroke="var(--icon-stroke)" strokeWidth={1.5} />}
                                onClick={() => toggleApp('quackmail')}
                                isActive={appWindows.quackmail}
                                badge={3}
                                label="Mail"
                            />
                            <DockIcon
                                icon={<FileText size={22} stroke="var(--icon-stroke)" strokeWidth={1.5} />}
                                onClick={() => toggleApp('notes')}
                                isActive={appWindows.notes}
                                label="Notes"
                            />
                            {/* Physical separator - recessed groove */}
                            <div
                                className="dock-separator mx-2"
                                style={{
                                    width: 2,
                                    height: 28,
                                    borderRadius: 1,
                                    background: 'var(--dock-separator-bg)',
                                    boxShadow: 'var(--dock-separator-shadow)',
                                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                                }}
                            />
                            <DockIcon
                                icon={<MessageCircle size={22} stroke="var(--icon-stroke)" strokeWidth={1.5} />}
                                onClick={() => toggleApp('chat')}
                                isActive={appWindows.chat}
                                label="Chat"
                            />
                            <DockIcon
                                icon={<Terminal size={22} stroke="var(--icon-stroke)" strokeWidth={1.5} />}
                                onClick={() => toggleApp('shell')}
                                isActive={appWindows.shell}
                                label="Shell"
                            />
                            {/* Physical separator - recessed groove */}
                            <div
                                className="dock-separator mx-2"
                                style={{
                                    width: 2,
                                    height: 28,
                                    borderRadius: 1,
                                    background: 'var(--dock-separator-bg)',
                                    boxShadow: 'var(--dock-separator-shadow)',
                                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                                }}
                            />
                            <DockIcon
                                icon={<BookOpen size={22} stroke="var(--icon-stroke)" strokeWidth={1.5} />}
                                onClick={() => toggleApp('guestbook')}
                                isActive={appWindows.guestbook}
                                badge={guestbookEntries.length}
                                label="Guestbook"
                            />
                            {/* Minimized Editors */}
                            {minimizedEditors.size > 0 && (
                                <>
                                    {/* Physical separator - recessed groove */}
                            <div
                                className="dock-separator mx-2"
                                style={{
                                    width: 2,
                                    height: 28,
                                    borderRadius: 1,
                                    background: 'var(--dock-separator-bg)',
                                    boxShadow: 'var(--dock-separator-shadow)',
                                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                                }}
                            />
                                    {Array.from(minimizedEditors).map(fileId => {
                                        const file = goosFiles.find(f => f.id === fileId);
                                        if (!file) return null;
                                        return (
                                            <DockIcon
                                                key={`minimized-${fileId}`}
                                                icon={file.type === 'case-study'
                                                    ? <Presentation size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />
                                                    : <FileText size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />
                                                }
                                                onClick={() => restoreEditor(fileId)}
                                                label={file.title || 'Untitled'}
                                                isActive={false}
                                                isDark={isDarkMode}
                                            />
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </motion.footer>
                )}
            </AnimatePresence>

            {/* Made with badge - Hidden in zen mode */}
            <AnimatePresence>
                {!isZenMode && (
                    <motion.a
                        href="/"
                        className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-full text-[10px] font-medium"
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            boxShadow: goOS.shadows.sm,
                        }}
                        whileHover={buttonPress.hover}
                        whileTap={buttonPress.tap}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={SPRING.gentle}
                    >
                        Made with goOS
                    </motion.a>
                )}
            </AnimatePresence>

            {/* Desktop Context Menu */}
            <GoOSDesktopContextMenu
                isOpen={desktopContextMenu.isOpen}
                position={{ x: desktopContextMenu.x, y: desktopContextMenu.y }}
                onClose={() => setDesktopContextMenu(prev => ({ ...prev, isOpen: false }))}
                onNewNote={() => {
                    createFile('note', { x: desktopContextMenu.x, y: desktopContextMenu.y });
                }}
                onNewCaseStudy={() => {
                    createFile('case-study', { x: desktopContextMenu.x, y: desktopContextMenu.y });
                }}
                onNewFolder={() => {
                    createFile('folder', { x: desktopContextMenu.x, y: desktopContextMenu.y });
                }}
                onNewCV={() => {
                    createFile('cv', { x: desktopContextMenu.x, y: desktopContextMenu.y });
                }}
                onNewImage={() => handleOpenCreateFileDialog('image', { x: desktopContextMenu.x, y: desktopContextMenu.y })}
                onNewLink={() => handleOpenCreateFileDialog('link', { x: desktopContextMenu.x, y: desktopContextMenu.y })}
                onNewEmbed={() => handleOpenCreateFileDialog('embed', { x: desktopContextMenu.x, y: desktopContextMenu.y })}
                onNewDownload={() => handleOpenCreateFileDialog('download', { x: desktopContextMenu.x, y: desktopContextMenu.y })}
                onPaste={pasteFile}
                onArrangeIcons={arrangeIcons}
                onChangeWallpaper={() => setShowWallpaperPicker(true)}
                canPaste={!!clipboard}
            />

            {/* Wallpaper Picker Modal */}
            <AnimatePresence>
                {showWallpaperPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[9000] flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.4)' }}
                        onClick={() => setShowWallpaperPicker(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="p-4 rounded-2xl"
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                                boxShadow: 'var(--shadow-lg)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                                Choose Wallpaper
                            </div>
                            <div className="grid grid-cols-4 gap-2" style={{ width: 340, maxHeight: 240, overflowY: 'auto' }}>
                                {WALLPAPERS.map((wp) => (
                                    <button
                                        key={wp.id || 'none'}
                                        onClick={() => {
                                            playSound('click');
                                            setWallpaper(wp.id);
                                        }}
                                        className="relative rounded-lg overflow-hidden transition-all hover:ring-2 hover:ring-offset-1"
                                        style={{
                                            width: 76,
                                            height: 52,
                                            border: wallpaper === wp.id
                                                ? '2px solid var(--accent-primary)'
                                                : '1px solid var(--border-subtle)',
                                            background: wp.preview ? 'transparent' : 'var(--bg-surface)',
                                            ringColor: 'var(--accent-primary)',
                                        }}
                                    >
                                        {wp.preview ? (
                                            <img
                                                src={wp.preview}
                                                alt={wp.label}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-xs"
                                                style={{
                                                    backgroundImage: 'radial-gradient(var(--text-tertiary) 1px, transparent 1px)',
                                                    backgroundSize: '8px 8px',
                                                    color: 'var(--text-tertiary)',
                                                }}
                                            >
                                                None
                                            </div>
                                        )}
                                        {wallpaper === wp.id && (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center"
                                                style={{ background: 'rgba(0,0,0,0.3)' }}
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full flex items-center justify-center"
                                                    style={{ background: 'var(--accent-primary)' }}
                                                >
                                                    <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
                                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File Creation Dialog */}
            <GoOSCreateFileDialog
                isOpen={createFileDialog.isOpen}
                fileType={createFileDialog.fileType}
                onClose={() => setCreateFileDialog({ isOpen: false, fileType: null })}
                onCreateImage={handleCreateImage}
                onCreateLink={handleCreateLink}
                onCreateEmbed={handleCreateEmbed}
                onCreateDownload={handleCreateDownload}
            />

            {/* File Context Menu */}
            {fileContextMenu.fileId && (
                <GoOSFileContextMenu
                    isOpen={fileContextMenu.isOpen}
                    position={{ x: fileContextMenu.x, y: fileContextMenu.y }}
                    onClose={() => setFileContextMenu(prev => ({ ...prev, isOpen: false }))}
                    fileType={goosFiles.find(f => f.id === fileContextMenu.fileId)?.type || 'note'}
                    fileStatus={goosFiles.find(f => f.id === fileContextMenu.fileId)?.status}
                    accessLevel={goosFiles.find(f => f.id === fileContextMenu.fileId)?.accessLevel}
                    onOpen={() => openFile(fileContextMenu.fileId!)}
                    onOpenAsPage={() => {
                        const file = goosFiles.find(f => f.id === fileContextMenu.fileId);
                        if (file && (file.type === 'note' || file.type === 'case-study')) {
                            // Open in full-page view overlay
                            setCaseStudyFileId(fileContextMenu.fileId);
                        }
                    }}
                    onOpenAsPresent={() => {
                        const file = goosFiles.find(f => f.id === fileContextMenu.fileId);
                        if (file && (file.type === 'note' || file.type === 'case-study')) {
                            setPresentingFileId(fileContextMenu.fileId);
                        }
                    }}
                    onRename={() => setRenamingFileId(fileContextMenu.fileId)}
                    onDuplicate={() => duplicateFile(fileContextMenu.fileId!)}
                    onCopy={() => copyFile(fileContextMenu.fileId!)}
                    onCut={() => cutFile(fileContextMenu.fileId!)}
                    onPaste={pasteFile}
                    onDelete={() => {
                        if (window.confirm('Are you sure you want to delete this file?')) {
                            deleteFile(fileContextMenu.fileId!);
                        }
                    }}
                    onTogglePublish={() => {
                        const file = goosFiles.find(f => f.id === fileContextMenu.fileId);
                        if (file) {
                            if (file.status === 'draft') {
                                publishGoOSFile(fileContextMenu.fileId!);
                            } else {
                                unpublishGoOSFile(fileContextMenu.fileId!);
                            }
                        }
                    }}
                    onToggleLock={() => {
                        const file = goosFiles.find(f => f.id === fileContextMenu.fileId);
                        if (file) {
                            if (file.accessLevel === 'email' || file.accessLevel === 'paid') {
                                unlockGoOSFile(fileContextMenu.fileId!);
                            } else {
                                lockGoOSFile(fileContextMenu.fileId!);
                            }
                        }
                    }}
                    onShare={async () => {
                        try {
                            const url = window.location.href;
                            await navigator.clipboard.writeText(url);
                            showGoOSToast('Link copied to clipboard!', 'success');
                        } catch (err) {
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = window.location.href;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-9999px';
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            showGoOSToast('Link copied to clipboard!', 'success');
                        }
                    }}
                    canPaste={!!clipboard}
                />
            )}

            {/* Widget Context Menu */}
            <WidgetContextMenu
                isOpen={widgetContextMenu.isOpen}
                position={{ x: widgetContextMenu.x, y: widgetContextMenu.y }}
                widget={widgetContextMenu.widget}
                onClose={closeWidgetContextMenu}
                onDelete={() => {
                    if (widgetContextMenu.widget) {
                        deleteWidget(widgetContextMenu.widget.id);
                    }
                }}
                onEdit={() => {
                    if (widgetContextMenu.widget) {
                        setEditingWidget(widgetContextMenu.widget);
                        closeWidgetContextMenu();
                    }
                }}
                onToggleVisibility={() => {
                    if (widgetContextMenu.widget) {
                        updateWidget(widgetContextMenu.widget.id, {
                            isVisible: !widgetContextMenu.widget.isVisible
                        });
                    }
                }}
                onBringToFront={() => {
                    // TODO: Implement z-index management for widgets
                    console.log('Bring to front:', widgetContextMenu.widget);
                }}
            />

            {/* Single Note Presentation Overlay */}
            {presentingFileId && (() => {
                const file = goosFiles.find(f => f.id === presentingFileId);
                if (!file) return null;
                return (
                    <PresentationView
                        note={{
                            id: file.id,
                            title: file.title,
                            subtitle: file.type === 'case-study' ? 'Case Study' : undefined,
                            content: file.content,
                            headerImage: file.headerImage,
                        }}
                        author={{
                            username: 'demo',
                            name: 'Demo User',
                        }}
                        themeId="paper"
                        onClose={() => setPresentingFileId(null)}
                    />
                );
            })()}

            {/* Case Study Page View Overlay (Belle Duffner-style) */}
            {caseStudyFileId && (() => {
                const file = goosFiles.find(f => f.id === caseStudyFileId);
                if (!file) return null;

                // Get related studies (other published files)
                const relatedStudies = goosFiles
                    .filter(f => f.id !== caseStudyFileId && f.status === 'published')
                    .slice(0, 2)
                    .map(f => ({
                        id: f.id,
                        title: f.title,
                        subtitle: null,
                        headerImage: f.headerImage || null,
                        fileType: f.type as 'note' | 'case-study',
                    }));

                return (
                    <CaseStudyPageView
                        note={{
                            id: file.id,
                            title: file.title,
                            subtitle: null,
                            content: file.content,
                            headerImage: file.headerImage || null,
                            publishedAt: file.publishedAt ? new Date(file.publishedAt) : null,
                            fileType: file.type as 'note' | 'case-study',
                        }}
                        author={{
                            username: 'demo',
                            name: 'Demo User',
                            image: null,
                        }}
                        relatedStudies={relatedStudies}
                        onClose={() => setCaseStudyFileId(null)}
                    />
                );
            })()}

            <SaveIndicator />
            <Toast />

            {/* goOS Toast */}
            <AnimatePresence>
                {goosToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{
                            position: 'fixed',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                            fontSize: '14px',
                            zIndex: 9999,
                            boxShadow: '4px 4px 0 rgba(0,0,0,0.08)',
                        }}
                    >
                        {goosToast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Command Palette */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                files={goosFiles.map(f => ({
                    id: f.id,
                    title: f.title,
                    type: f.type,
                    parentFolderId: f.parentFolderId,
                }))}
                selectedFileId={selectedFileId}
                onOpenFile={openFile}
                onCreateNote={(title) => createFile('note', title)}
                onCreateFolder={() => createFile('folder')}
                onCreateCaseStudy={() => createFile('case-study')}
                onToggleDarkMode={toggleDarkMode}
                onOpenSettings={() => setAppWindows(prev => ({ ...prev, settings: true }))}
                onRenameFile={(id) => setRenamingFileId(id)}
                onDeleteFile={(id) => {
                    if (window.confirm('Are you sure you want to delete this file?')) {
                        deleteFile(id);
                    }
                }}
                onDuplicateFile={duplicateFile}
                onMoveFile={(fileId, folderId) => moveGoOSFile(fileId, folderId)}
                onChangeWallpaper={() => setShowWallpaperPicker(true)}
                onSwitchSpace={(spaceId) => {
                    setActiveSpaceId(spaceId);
                    const space = DEMO_SPACES.find(s => s.id === spaceId);
                    if (space) showGoOSToast(`Switched to ${space.name}`, 'success');
                }}
                isDarkMode={isDarkMode}
                spaces={DEMO_SPACES.map(s => ({ id: s.id, name: s.name, icon: s.icon }))}
            />

            {/* Create Space Modal */}
            <CreateSpaceModal
                isOpen={showCreateSpaceModal}
                onClose={() => setShowCreateSpaceModal(false)}
                onCreate={(data) => {
                    console.log('Create space:', data);
                    showGoOSToast(`Created space "${data.name}"`, 'success');
                }}
                existingSpaces={DEMO_SPACES}
                existingSlugs={DEMO_SPACES.filter(s => s.slug).map(s => s.slug as string)}
            />

            {/* Manage Spaces Dialog */}
            <ManageSpacesDialog
                isOpen={showManageSpacesDialog}
                onClose={() => setShowManageSpacesDialog(false)}
                spaces={DEMO_SPACES}
                onReorder={(orderedIds) => {
                    console.log('Reorder spaces:', orderedIds);
                    showGoOSToast('Spaces reordered', 'success');
                }}
                onUpdateSpace={(id, updates) => {
                    console.log('Update space:', id, updates);
                    showGoOSToast('Space updated', 'success');
                }}
                onSetPrimary={(id) => {
                    const space = DEMO_SPACES.find(s => s.id === id);
                    console.log('Set primary:', id);
                    showGoOSToast(`${space?.name} is now your main space`, 'success');
                }}
                onDeleteSpace={(id) => {
                    const space = DEMO_SPACES.find(s => s.id === id);
                    console.log('Delete space:', id);
                    showGoOSToast(`Deleted "${space?.name}"`, 'success');
                }}
            />

            {/* Clock Widget Editor */}
            {editingWidget?.widgetType === 'clock' && (
                <ClockWidgetEditor
                    widget={editingWidget}
                    isOpen={true}
                    onClose={() => setEditingWidget(null)}
                    onSave={(config) => {
                        if (editingWidget) {
                            updateWidget(editingWidget.id, { config });
                            showGoOSToast('Clock settings saved', 'success');
                        }
                    }}
                />
            )}
        </div>
    );
}

// ============================================
// MAIN EXPORT - Appart Theme Only
// ============================================
export default function GoOSDemoPage() {
    return (
        <div
            data-theme="appart"
            style={{
                // Override any inherited styles from globals.css
                background: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                minHeight: '100vh',
                position: 'relative',
            }}
        >
            <EditProvider initialDesktop={DEMO_DESKTOP} initialIsOwner={false} demoMode={true}>
                <WindowProvider>
                    <GoOSProvider viewMode="owner" localOnly={true} initialFiles={INITIAL_GOOS_FILES}>
                        <WidgetProvider localOnly={true} isOwner={true} initialWidgets={INITIAL_DEMO_WIDGETS}>
                            <GoOSDemoContent />
                        </WidgetProvider>
                    </GoOSProvider>
                </WindowProvider>
            </EditProvider>
        </div>
    );
}
