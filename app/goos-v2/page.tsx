'use client';

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
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
import { StatusWidget } from '@/components/desktop';
import { SaveIndicator, Toast } from '@/components/editing/SaveIndicator';
import { type GuestbookEntry } from '@/components/desktop/Guestbook';
import type { DesktopItem, Desktop, StatusWidget as StatusWidgetType } from '@/types';
import {
    GoOSFileIcon,
    GoOSDesktopContextMenu,
    GoOSFileContextMenu,
    GoOSFolderWindow,
    GoOSCreateFileDialog,
    type GoOSFile,
    type FileType,
} from '@/components/goos-editor';
import { GoOSProvider, useGoOS, type GoOSFileData } from '@/contexts/GoOSContext';
import { WidgetProvider, useWidgets } from '@/contexts/WidgetContext';
import { WidgetRenderer, WIDGET_METADATA } from '@/components/widgets';
import { ViewSwitcher, PageView, PresentView } from '@/components/views';
import { PresentationView } from '@/components/presentation';
import { CaseStudyPageView } from '@/components/casestudy';
import type { ViewMode, WidgetType } from '@/types';

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
// GOOS DESIGN TOKENS - Using CSS Variables from design-system.css
// Note: icon.* values are hex for SVG attributes, colors.* are CSS vars for styles
// ============================================
const goOS = {
    // CSS Variables for style props (backgrounds, text, borders)
    colors: {
        paper: 'var(--color-bg-base)',
        cream: 'var(--color-bg-base)',
        headerBg: 'var(--color-bg-base)',
        windowBg: 'var(--color-bg-base)',
        white: 'var(--color-bg-white)',
        border: 'var(--color-text-primary)',
        borderSubtle: 'var(--color-border-default)',
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
            yellow: '#fff9db',
            blue: '#e8f4fd',
            pink: '#fde8f0',
            green: '#e8fde8',
            orange: '#fff0e6',
            purple: '#f0e8fd',
        }
    },
    // Hex values for SVG stroke/fill (CSS vars don't work in SVG attributes)
    icon: {
        stroke: '#171412',
        fill: 'rgba(255, 119, 34, 0.1)',
        accent: '#ff7722',
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
        snappy: { type: "spring" as const, damping: 20, stiffness: 400 },
        gentle: { type: "spring" as const, damping: 25, stiffness: 200 },
        bouncy: { type: "spring" as const, damping: 15, stiffness: 300 },
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
// DEMO STATUS WIDGET
// ============================================
const DEMO_STATUS_WIDGET: StatusWidgetType = {
    id: 'status-demo',
    desktopId: 'goos-demo',
    statusType: 'available',
    title: 'Open for work',
    description: 'Looking for exciting projects',
    ctaUrl: '#contact',
    ctaLabel: 'Get in touch',
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

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
// DEMO WIDGETS - Initial widgets for the demo
// ============================================
const INITIAL_DEMO_WIDGETS = [
    {
        id: 'demo-widget-clock',
        desktopId: 'goos-demo',
        widgetType: 'clock' as const,
        positionX: 85,
        positionY: 15,
        title: null,
        isVisible: true,
        config: { timezone: 'America/New_York', format: '12h', showTimezoneName: true },
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'demo-widget-links',
        desktopId: 'goos-demo',
        widgetType: 'links' as const,
        positionX: 85,
        positionY: 35,
        title: null,
        isVisible: true,
        config: {
            links: [
                { id: '1', label: 'Portfolio', url: 'https://example.com', icon: 'globe' },
                { id: '2', label: 'GitHub', url: 'https://github.com', icon: 'github' },
                { id: '3', label: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
            ]
        },
        order: 1,
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
    const displayIcon = icon || PORTFOLIO_ICON_MAP[label] || <Folder size={28} fill={goOS.icon.fill} stroke={goOS.icon.stroke} strokeWidth={1.5} />;

    return (
        <motion.button
            onDoubleClick={onClick}
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
                    color: goOS.colors.text.primary,
                    background: 'rgba(255,255,255,0.95)',
                    border: `1px solid ${goOS.colors.border}`,
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
                backgroundColor: goOS.colors.sticky[color] || goOS.colors.sticky.yellow,
                border: `1.5px solid rgba(0,0,0,0.1)`,
                color: goOS.colors.text.primary,
                minWidth: '100px',
                padding: '14px 12px 18px 12px',
                borderRadius: '2px',
                zIndex: isDragging ? 100 : isHovered ? 50 : 1,
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
        <motion.button
            onClick={handleClick}
            className="relative flex items-center justify-center focus:outline-none w-10 h-10"
            whileHover={{ y: -8, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={goOS.springs.bouncy}
            title={`Click me! (${quackCount} quacks)`}
        >
            <motion.span
                className="text-2xl select-none"
                animate={isQuacking ? {
                    rotate: [0, -20, 20, -15, 15, -10, 10, 0],
                    y: [0, -8, 0, -4, 0],
                    scale: [1, 1.2, 1, 1.1, 1],
                } : {
                    rotate: [0, 3, 0, -3, 0],
                    y: [0, -2, 0],
                }}
                transition={isQuacking ? { duration: 0.8 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
                🦆
            </motion.span>
            <AnimatePresence>
                {isQuacking && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: -40 }}
                        exit={{ scale: 0.8, opacity: 0, y: -50 }}
                        transition={goOS.springs.snappy}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white rounded-lg px-3 py-1.5 text-xs whitespace-nowrap z-50 font-medium"
                        style={{
                            borderColor: goOS.colors.border,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            color: goOS.colors.text.primary,
                            maxWidth: 180,
                        }}
                    >
                        {saying}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
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
// DOCK ICON - Enhanced with bounce, wobble and tooltip
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
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [justClicked, setJustClicked] = useState(false);

    const handleClick = () => {
        setJustClicked(true);
        onClick();
        setTimeout(() => setJustClicked(false), 500);
    };

    return (
        <motion.button
            onClick={handleClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            animate={{
                y: isHovered ? -14 : 0,
                scale: justClicked ? [1, 0.85, 1.15, 0.95, 1] : 1,
                rotate: justClicked ? [0, -8, 8, -4, 0] : 0,
            }}
            transition={goOS.springs.bouncy}
            className="relative flex flex-col items-center focus:outline-none"
        >
            {/* Tooltip label */}
            <AnimatePresence>
                {isHovered && label && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.85 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                        className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap z-50"
                        style={{
                            background: goOS.colors.text.primary,
                            color: goOS.colors.paper,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            border: `1px solid rgba(255,255,255,0.1)`,
                        }}
                    >
                        {label}
                        {/* Tooltip arrow */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45"
                            style={{ background: goOS.colors.text.primary }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className={`w-11 h-11 flex items-center justify-center rounded-xl ${isActive ? '' : ''}`}
                style={{
                    background: isActive ? goOS.colors.white : isHovered ? 'rgba(0,0,0,0.04)' : 'transparent',
                    border: isActive ? `2px solid ${goOS.colors.border}` : '2px solid transparent',
                    boxShadow: isActive ? goOS.shadows.sm : 'none',
                }}
                animate={{
                    scale: isHovered && !justClicked ? 1.12 : 1,
                    rotate: isHovered && !justClicked ? [0, -2, 2, 0] : 0,
                }}
                transition={{
                    scale: goOS.springs.gentle,
                    rotate: { duration: 0.4, ease: 'easeInOut' }
                }}
            >
                {icon}
            </motion.div>

            {/* Badge with bounce animation */}
            {badge !== undefined && badge > 0 && (
                <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={goOS.springs.bouncy}
                    className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1 z-10"
                    style={{
                        background: goOS.colors.accent.primary,
                        boxShadow: '0 2px 6px rgba(255, 119, 34, 0.4)',
                    }}
                >
                    {badge}
                </motion.span>
            )}

            {/* Active indicator dot */}
            {isActive && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={goOS.springs.gentle}
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ background: goOS.colors.accent.primary }}
                />
            )}
        </motion.button>
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
        // Wait for animation to complete before actually closing
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    if (!isOpen) return null;

    // Unified window styles - 12px radius, 2px solid border, 52px title bar
    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={isClosing
                ? { opacity: 0, scale: 0.8, y: -10, rotate: -2 }
                : { opacity: 1, scale: 1, y: 0, rotate: 0 }
            }
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={isClosing
                ? { duration: 0.2, ease: [0.4, 0, 1, 1] }
                : { type: 'spring', stiffness: 350, damping: 25, mass: 0.8 }
            }
            onMouseDown={onFocus}
            className="fixed flex flex-col overflow-hidden"
            style={{
                left: defaultX,
                top: defaultY,
                width,
                height,
                zIndex,
                background: 'var(--color-bg-base, #fbf9ef)',
                border: '2px solid var(--color-text-primary, #171412)',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12), 0 24px 60px rgba(23, 20, 18, 0.08)'
            }}
        >
            {/* Unified Title Bar - 52px height, 2px bottom border */}
            <div
                className="flex items-center justify-between px-4 select-none cursor-move flex-shrink-0"
                style={{
                    height: 52,
                    background: 'var(--color-bg-base, #fbf9ef)',
                    borderBottom: '2px solid var(--color-text-primary, #171412)'
                }}
                onMouseEnter={() => setIsHoveredTraffic(true)}
                onMouseLeave={() => setIsHoveredTraffic(false)}
            >
                {/* Unified Traffic Lights - 12px size, 8px gap */}
                <div className="flex items-center" style={{ gap: 8 }}>
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
                            background: 'var(--color-traffic-close, #ff5f57)',
                            boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {isHoveredTraffic && (
                            <span style={{ fontSize: 9, lineHeight: 1, color: 'rgba(77, 0, 0, 0.7)' }}>×</span>
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
                            background: 'var(--color-traffic-minimize, #ffbd2e)',
                            boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {isHoveredTraffic && (
                            <span style={{ fontSize: 9, lineHeight: 1, color: 'rgba(100, 65, 0, 0.7)' }}>−</span>
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
                            background: 'var(--color-traffic-maximize, #28c840)',
                            boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {isHoveredTraffic && (
                            <span style={{ fontSize: 9, lineHeight: 1, color: 'rgba(0, 70, 0, 0.7)' }}>+</span>
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
                        opacity: 0.85
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
                    style={{ accentColor: goOS.colors.accent.primary }}
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
            <span className={`text-sm ${checked ? 'line-through opacity-50' : isHot ? 'font-semibold' : ''}`} style={{ color: isHot ? goOS.colors.accent.dark : undefined }}>
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

    const noteColors = [goOS.colors.white];

    return (
        <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-body)' }}>
            {/* Header */}
            <div
                className="px-5 py-4"
                style={{
                    background: goOS.colors.windowBg,
                    borderBottom: `2px solid ${goOS.colors.border}`,
                }}
            >
                <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: goOS.colors.text.primary, fontFamily: 'var(--font-display)' }}
                >
                    📝 Leave a Note
                </h3>
                <p className="text-xs" style={{ color: goOS.colors.text.muted }}>
                    Say hi, share feedback, or just leave your mark!
                </p>
            </div>

            {/* Form */}
            <div className="px-5 py-4 space-y-3" style={{ borderBottom: `2px solid ${goOS.colors.border}` }}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                    placeholder="Write something nice..."
                    className="w-full h-20 px-3 py-2.5 resize-none focus:outline-none"
                    style={{
                        background: goOS.colors.white,
                        border: `2px solid ${goOS.colors.border}`,
                        borderRadius: '4px',
                        color: goOS.colors.text.primary,
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
                            style={{ accentColor: goOS.colors.accent.primary }}
                        />
                        <span className="text-sm" style={{ color: goOS.colors.text.secondary }}>Sign my name</span>
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
                            background: goOS.colors.cream,
                            border: `2px solid ${goOS.colors.border}`,
                            borderRadius: '4px',
                            color: goOS.colors.text.primary,
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
                        background: goOS.colors.accent.primary,
                        color: 'white',
                        border: `2px solid ${goOS.colors.border}`,
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
                                <p className="text-sm mt-2" style={{ color: goOS.colors.text.muted }}>
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
                                            background: goOS.colors.white,
                                            border: `1px dashed ${goOS.colors.border}`,
                                            borderRadius: '2px',
                                        }}
                                    />

                                    <p
                                        className="text-sm leading-relaxed mb-2"
                                        style={{
                                            color: goOS.colors.text.primary,
                                            fontFamily: 'var(--font-display)',
                                        }}
                                    >
                                        &ldquo;{entry.message}&rdquo;
                                    </p>

                                    <div className="flex items-center justify-between text-[10px]" style={{ color: goOS.colors.text.muted }}>
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
            style={{ background: `${goOS.colors.border}20`, border: `1px solid ${goOS.colors.border}40` }}
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
                background: goOS.colors.cream,
                border: `2px solid ${goOS.colors.border}`,
                borderRadius: '4px',
                boxShadow: goOS.shadows.sm,
            }}
        >
            <span className="text-lg block mb-1">{icon}</span>
            <div
                className="text-2xl font-bold"
                style={{ color: goOS.colors.text.primary, fontFamily: 'var(--font-display)' }}
            >
                {value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: goOS.colors.text.muted }}>{label}</div>
            {change !== undefined && (
                <div
                    className="text-xs mt-1 font-medium"
                    style={{ color: goOS.colors.text.primary }}
                >
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-body)' }}>
            {/* Header */}
            <div
                className="px-5 py-3 flex items-center justify-between"
                style={{
                    background: goOS.colors.windowBg,
                    borderBottom: `2px solid ${goOS.colors.border}`,
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <h3 className="font-bold" style={{ color: goOS.colors.text.primary, fontFamily: 'var(--font-display)' }}>
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
                                background: timeRange === range ? goOS.colors.accent.pale : 'transparent',
                                border: `1.5px solid ${timeRange === range ? goOS.colors.border : 'transparent'}`,
                                borderRadius: '4px',
                                color: timeRange === range ? goOS.colors.text.primary : goOS.colors.text.muted,
                            }}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ background: goOS.colors.paper }}>
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
                        background: goOS.colors.white,
                        border: `2px solid ${goOS.colors.border}`,
                        borderRadius: '4px',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <motion.span
                            className="w-2 h-2 rounded-full"
                            style={{ background: goOS.colors.accent.primary }}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-sm font-medium" style={{ color: goOS.colors.text.primary }}>
                            {data.liveVisitors.length} live visitor{data.liveVisitors.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <span className="text-xs" style={{ color: goOS.colors.text.muted }}>
                        {data.liveVisitors[0]?.viewing && `Viewing: ${data.liveVisitors[0].viewing}`}
                    </span>
                </div>

                {/* Traffic Sources */}
                <div
                    className="p-4"
                    style={{
                        background: goOS.colors.cream,
                        border: `2px solid ${goOS.colors.border}`,
                        borderRadius: '4px',
                        boxShadow: goOS.shadows.sm,
                    }}
                >
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: goOS.colors.text.primary }}>
                        <span>🌐</span> Where visitors come from
                    </h4>
                    <div className="space-y-2.5">
                        {data.sources.map((source, i) => {
                            const colors = ['#ff7722', '#3d2fa9', '#1a1a1a', '#e56a1f', '#6b6b6b'];
                            return (
                                <div key={source.name}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span style={{ color: goOS.colors.text.primary }}>{source.name}</span>
                                        <span className="font-medium" style={{ color: goOS.colors.text.secondary }}>
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
                        background: goOS.colors.cream,
                        border: `2px solid ${goOS.colors.border}`,
                        borderRadius: '4px',
                        boxShadow: goOS.shadows.sm,
                    }}
                >
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: goOS.colors.text.primary }}>
                        <span>🔥</span> Most viewed
                    </h4>
                    <div className="space-y-2">
                        {data.topContent.slice(0, 4).map((item, i) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-3 p-2"
                                style={{
                                    background: i === 0 ? goOS.colors.accent.pale : 'transparent',
                                    borderRadius: '4px',
                                }}
                            >
                                <span
                                    className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded"
                                    style={{
                                        background: goOS.colors.border,
                                        color: 'white',
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-sm" style={{ color: goOS.colors.text.primary }}>{item.name}</span>
                                <span className="text-xs" style={{ color: goOS.colors.text.muted }}>{item.opens} opens</span>
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: goOS.colors.text.primary }}
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
                        background: goOS.colors.white,
                        border: `2px solid ${goOS.colors.border}`,
                        borderRadius: '4px',
                        boxShadow: goOS.shadows.sm,
                    }}
                >
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: goOS.colors.text.primary }}>
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
                                            background: goOS.colors.accent.primary,
                                            border: `2px solid ${goOS.colors.border}`,
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}px` }}
                                        transition={{ delay: i * 0.1 }}
                                    />
                                    <div className="text-lg font-bold" style={{ color: goOS.colors.text.primary }}>{step.value}</div>
                                    <div className="text-[10px]" style={{ color: goOS.colors.text.muted }}>{step.label}</div>
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
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: goOS.colors.accent.light, border: `2px solid ${goOS.colors.border}` }}>🦆</div>
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
// GOOS STATUS WIDGET (Sketch style)
// ============================================
const GoOSStatusWidget = React.memo(({ statusWidget }: { statusWidget: StatusWidgetType | null }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!statusWidget || !statusWidget.isVisible) return null;

    const statusColors: Record<string, { bg: string; dot: string; text: string }> = {
        available: { bg: goOS.colors.white, dot: 'var(--color-success)', text: goOS.colors.text.primary },
        looking: { bg: goOS.colors.white, dot: goOS.colors.accent.primary, text: goOS.colors.text.primary },
        taking: { bg: goOS.colors.white, dot: goOS.colors.text.muted, text: goOS.colors.text.primary },
        open: { bg: goOS.colors.white, dot: 'var(--color-accent-secondary)', text: goOS.colors.text.primary },
        consulting: { bg: goOS.colors.white, dot: goOS.colors.accent.primary, text: goOS.colors.text.primary },
    };

    const colors = statusColors[statusWidget.statusType] || statusColors.available;

    return (
        <motion.div
            className="fixed z-[2500] cursor-pointer"
            style={{ bottom: '80px', right: '20px' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <motion.div
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{
                    background: goOS.colors.cream,
                    border: `2px solid ${goOS.colors.border}`,
                    boxShadow: isHovered ? goOS.shadows.hover : goOS.shadows.solid,
                }}
                animate={{ y: isHovered ? -2 : 0 }}
                transition={goOS.springs.gentle}
            >
                {/* Status dot */}
                <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ background: colors.dot }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Content */}
                <div className="flex flex-col">
                    <span
                        className="text-sm font-bold"
                        style={{ color: goOS.colors.text.primary }}
                    >
                        {statusWidget.title}
                    </span>
                    {statusWidget.description && (
                        <span
                            className="text-xs"
                            style={{ color: goOS.colors.text.muted }}
                        >
                            {statusWidget.description}
                        </span>
                    )}
                </div>

                {/* CTA Arrow */}
                {statusWidget.ctaUrl && (
                    <motion.a
                        href={statusWidget.ctaUrl}
                        className="ml-2 w-6 h-6 flex items-center justify-center rounded-full"
                        style={{
                            background: goOS.colors.accent.primary,
                            color: 'white',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M3.5 3a.5.5 0 0 0 0 1h3.793L3.146 8.146a.5.5 0 1 0 .708.708L8 4.707V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5Z" />
                        </svg>
                    </motion.a>
                )}
            </motion.div>
        </motion.div>
    );
});

GoOSStatusWidget.displayName = 'GoOSStatusWidget';

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
    const [showConfetti, setShowConfetti] = useState(false);
    const [showWidgetsMenu, setShowWidgetsMenu] = useState(false);

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
    });

    const [windowZ, setWindowZ] = useState<Record<string, number>>({
        quackmail: 50,
        notes: 51,
        chat: 52,
        settings: 53,
        nest: 54,
        shell: 55,
        guestbook: 56,
        analytics: 57,
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

    // Transform context files to component format
    const goosFiles: GoOSFile[] = useMemo(() => goosFilesRaw.map(f => ({
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
    })), [goosFilesRaw]);

    // Convert goosFiles to DesktopItem format for PageView/PresentView
    const goosFilesAsDesktopItems: DesktopItem[] = useMemo(() => goosFilesRaw.map((f, index) => ({
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
    })), [goosFilesRaw]);

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
    const [openFolders, setOpenFolders] = useState<string[]>([]); // Folder windows
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

    // New file type creation dialog state
    const [createFileDialog, setCreateFileDialog] = useState<{ isOpen: boolean; fileType: 'image' | 'link' | 'embed' | 'download' | null }>({ isOpen: false, fileType: null });
    const [createFilePosition, setCreateFilePosition] = useState<{ x: number; y: number } | null>(null);

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');
    const [presentingFileId, setPresentingFileId] = useState<string | null>(null);
    const [caseStudyFileId, setCaseStudyFileId] = useState<string | null>(null);

    // Widget context
    const widgetContext = useWidgets();
    const { widgets, createWidget, updateWidget, deleteWidget } = widgetContext;
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
    const createFile = useCallback(async (type: FileType, pixelPosition?: { x: number; y: number }) => {
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
            if (type !== 'folder') {
                setOpenEditors(prev => [...prev, newFile.id]);
                setActiveEditorId(newFile.id);
            }
            setRenamingFileId(newFile.id);
        }
    }, [createGoOSFile]);

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

        // It's a file, open the editor
        if (!openEditors.includes(fileId)) {
            setOpenEditors(prev => [...prev, fileId]);
        }
        setActiveEditorId(fileId);
        setWindowZ(prev => ({ ...prev, [`editor-${fileId}`]: topZIndex + 1 }));
        setTopZIndex(prev => prev + 1);
    }, [goosFiles, openEditors, openFolders, topZIndex]);

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
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [createFile, selectedFileId, duplicateFile, copyFile, cutFile, clipboard, pasteFile, deleteFile, openFile, goosFiles, renamingFileId]);

    // Desktop right-click handler
    const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
        // Only show if clicked on the desktop background
        const target = e.target as HTMLElement;
        if (target.closest('[data-file-id]') || target.closest('[data-window]')) {
            return;
        }
        e.preventDefault();
        setDesktopContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
        setSelectedFileId(null);
    }, []);

    // File right-click handler
    const handleFileContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setFileContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, fileId });
        setSelectedFileId(fileId);
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
            className="min-h-screen w-full relative overflow-hidden theme-sketch"
            style={{
                backgroundColor: goOS.colors.paper,
                backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }}
            onContextMenu={handleDesktopContextMenu}
            onClick={(e) => {
                // Close context menus
                setDesktopContextMenu(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
                setFileContextMenu(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
                // Deselect files when clicking on desktop background (not on files or windows)
                const target = e.target as HTMLElement;
                if (!target.closest('[data-file-id]') && !target.closest('[data-window]')) {
                    setSelectedFileId(null);
                }
            }}
        >
            {/* CONFETTI CELEBRATION */}
            <ConfettiBurst isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

            {/* MENU BAR - Clean, minimal design with centered toggle */}
            <header
                className="h-11 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-[2000] select-none"
                style={{
                    background: goOS.colors.headerBg,
                    borderBottom: `2px solid ${goOS.colors.border}`,
                }}
            >
                {/* Left: Logo + Widgets Menu */}
                <div className="flex items-center gap-3 min-w-[180px]">
                    <motion.button
                        onClick={handleLogoClick}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="text-lg font-bold relative tracking-tight"
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
                                        style={{ background: goOS.colors.accent.primary }}
                                    >
                                        You found the duck! 🦆
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Widgets Dropdown Menu */}
                    <div className="relative">
                        <motion.button
                            onClick={() => setShowWidgetsMenu(!showWidgetsMenu)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-xs font-medium px-2 py-1 rounded"
                            style={{
                                color: showWidgetsMenu ? goOS.colors.accent.primary : goOS.colors.text.secondary,
                                background: showWidgetsMenu ? goOS.colors.accent.light : 'transparent',
                            }}
                        >
                            Widgets
                        </motion.button>
                        <AnimatePresence>
                            {showWidgetsMenu && (
                                <>
                                    {/* Backdrop to close menu */}
                                    <div
                                        className="fixed inset-0 z-[2000]"
                                        onClick={() => setShowWidgetsMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-0 mt-1 z-[2001] py-1"
                                        style={{
                                            background: goOS.colors.paper,
                                            border: `2px solid ${goOS.colors.border}`,
                                            borderRadius: '10px',
                                            boxShadow: 'var(--shadow-lg)',
                                            minWidth: '160px',
                                        }}
                                    >
                                        {Object.entries(WIDGET_METADATA).map(([type, meta]) => (
                                            <motion.button
                                                key={type}
                                                onClick={() => {
                                                    handleAddWidget(type, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
                                                    setShowWidgetsMenu(false);
                                                }}
                                                whileHover={{ backgroundColor: 'var(--color-bg-subtle)' }}
                                                className="w-full px-3 py-2 flex items-center gap-2 text-left"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    color: goOS.colors.text.primary,
                                                }}
                                            >
                                                <span className="text-base">{meta.icon}</span>
                                                <span>{meta.label}</span>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Center: View Switcher - The main action */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <ViewSwitcher
                        currentView={viewMode}
                        onViewChange={setViewMode}
                    />
                </div>

                {/* Right: Minimal system info */}
                <div className="flex items-center gap-3 text-sm min-w-[100px] justify-end" style={{ color: goOS.colors.text.secondary }}>
                    <span className="font-medium text-xs" style={{ color: goOS.colors.text.primary }}>{time}</span>
                </div>
            </header>

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
                            style={{ background: goOS.colors.cream }}
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
                                <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No published content yet</p>
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Switch to Desktop to create and publish your first piece</p>
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
                                    background: goOS.colors.border,
                                    color: goOS.colors.text.inverse,
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
                        {/* Sticky Notes (Left side) */}
                        <div className="fixed top-16 left-4 z-[30] flex flex-col gap-3">
                            <StickyNote color="blue" rotation={-3}>
                                <span className="text-lg" style={{ color: goOS.colors.text.primary }}>goOS Demo</span>
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

                        {/* goOS File Icons (desktop - root level only) */}
                        <AnimatePresence mode="sync" initial={false}>
                            {filesOnDesktop.map((file) => {
                                // Ensure file has a valid position
                                const filePosition = file.position || { x: 40, y: 320 };
                                return (
                                    <GoOSFileIcon
                                        key={file.id}
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
                                    />
                                );
                            })}
                        </AnimatePresence>

                        {/* goOS Widgets - fully functional */}
                        <WidgetRenderer
                            widgets={widgets}
                            isOwner={true}
                            onWidgetEdit={(widget) => {
                                console.log('Edit widget:', widget);
                            }}
                            onWidgetPositionChange={(id, x, y) => {
                                updateWidget(id, { positionX: x, positionY: y });
                            }}
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
                                        onClose={() => closeFolder(folder.id)}
                                        onFileDoubleClick={openFile}
                                        onFileClick={handleFileClick}
                                        selectedFileId={selectedFileId}
                                        isActive={activeFolderId === folder.id}
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
                                        <Heart size={18} style={{ color: goOS.colors.accent.primary }} fill={goOS.colors.accent.primary} />
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
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: goOS.colors.accent.light, border: `2px solid ${goOS.colors.border}` }}>🦆</div>
                                            <div className="bg-white border-2 rounded-xl rounded-tl-none px-4 py-2.5" style={{ borderColor: goOS.colors.border, boxShadow: goOS.shadows.sm }}>
                                                <span className="text-sm" style={{ color: goOS.colors.text.secondary }}>Welcome to goOS Demo! 🦆</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <div className="border-2 rounded-xl rounded-tr-none px-4 py-2.5" style={{ background: goOS.colors.accent.pale, borderColor: goOS.colors.border, boxShadow: goOS.shadows.sm }}>
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
                                    <div className="pl-4 mt-1" style={{ color: goOS.colors.accent.primary }}>READY... [████████████] 100%</div>
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
                                                <Folder size={36} fill={goOS.icon.fill} stroke={goOS.icon.stroke} strokeWidth={1.5} />
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
                        </AnimatePresence>
                    </>
                )}
            </main>

            {/* DOCK */}
            <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[3000]">
                <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                    style={{
                        background: goOS.colors.cream,
                        border: `2px solid ${goOS.colors.border}`,
                        boxShadow: goOS.shadows.solid
                    }}
                >
                    <RubberDuck />
                    <DockIcon
                        icon={<Folder size={24} fill={goOS.icon.fill} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
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
                        icon={<Mail size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
                        onClick={() => toggleApp('quackmail')}
                        isActive={appWindows.quackmail}
                        badge={3}
                        label="Mail"
                    />
                    <DockIcon
                        icon={<Camera size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
                        onClick={() => {
                            const photoItem = items.find(i => i.label === 'Photography');
                            if (photoItem) windowContext.openWindow(photoItem.id);
                        }}
                        label="Photos"
                    />
                    <DockIcon
                        icon={<FileText size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
                        onClick={() => toggleApp('notes')}
                        isActive={appWindows.notes}
                        label="Notes"
                    />
                    <div className="w-px h-8 bg-black/10 mx-1" />
                    <DockIcon
                        icon={<MessageCircle size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
                        onClick={() => toggleApp('chat')}
                        isActive={appWindows.chat}
                        label="Chat"
                    />
                    <DockIcon
                        icon={<Terminal size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
                        onClick={() => toggleApp('shell')}
                        isActive={appWindows.shell}
                        label="Shell"
                    />
                    <DockIcon
                        icon={<Settings size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
                        onClick={() => toggleApp('settings')}
                        isActive={appWindows.settings}
                        label="Settings"
                    />
                    <div className="w-px h-8 bg-black/10 mx-1" />
                    <DockIcon
                        icon={<BookOpen size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
                        onClick={() => toggleApp('guestbook')}
                        isActive={appWindows.guestbook}
                        badge={guestbookEntries.length}
                        label="Guestbook"
                    />
                    <DockIcon
                        icon={<BarChart3 size={24} stroke={goOS.icon.stroke} strokeWidth={1.5} />}
                        onClick={() => toggleApp('analytics')}
                        isActive={appWindows.analytics}
                        label="Analytics"
                    />
                    <div className="w-px h-8 bg-black/10 mx-1" />
                    <DockIcon
                        icon={<PenLine size={24} stroke={goOS.icon.accent} strokeWidth={1.5} />}
                        onClick={() => createFile('note')}
                        label="New Note"
                    />
                    {/* Minimized Editors */}
                    {minimizedEditors.size > 0 && (
                        <>
                            <div className="w-px h-8 bg-black/10 mx-1" />
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
                                    />
                                );
                            })}
                        </>
                    )}
                </div>
            </footer>

            {/* Status Widget */}
            <StatusWidget statusWidget={DEMO_STATUS_WIDGET} />

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

            {/* Desktop Context Menu */}
            <GoOSDesktopContextMenu
                isOpen={desktopContextMenu.isOpen}
                position={{ x: desktopContextMenu.x, y: desktopContextMenu.y }}
                onClose={() => setDesktopContextMenu(prev => ({ ...prev, isOpen: false }))}
                onNewNote={() => {
                    // Convert pixel coordinates to percentages
                    const x = (desktopContextMenu.x / window.innerWidth) * 100;
                    const y = (desktopContextMenu.y / window.innerHeight) * 100;
                    createFile('note', null, { x, y });
                }}
                onNewCaseStudy={() => {
                    const x = (desktopContextMenu.x / window.innerWidth) * 100;
                    const y = (desktopContextMenu.y / window.innerHeight) * 100;
                    createFile('case-study', null, { x, y });
                }}
                onNewFolder={() => {
                    const x = (desktopContextMenu.x / window.innerWidth) * 100;
                    const y = (desktopContextMenu.y / window.innerHeight) * 100;
                    createFile('folder', null, { x, y });
                }}
                onNewCV={() => {
                    const x = (desktopContextMenu.x / window.innerWidth) * 100;
                    const y = (desktopContextMenu.y / window.innerHeight) * 100;
                    createFile('cv', null, { x, y });
                }}
                onNewImage={() => handleOpenCreateFileDialog('image', { x: desktopContextMenu.x, y: desktopContextMenu.y })}
                onNewLink={() => handleOpenCreateFileDialog('link', { x: desktopContextMenu.x, y: desktopContextMenu.y })}
                onNewEmbed={() => handleOpenCreateFileDialog('embed', { x: desktopContextMenu.x, y: desktopContextMenu.y })}
                onNewDownload={() => handleOpenCreateFileDialog('download', { x: desktopContextMenu.x, y: desktopContextMenu.y })}
                onPaste={pasteFile}
                canPaste={!!clipboard}
            />

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
                            // In demo, just open in editor - in production this navigates to /{username}/{id}
                            openFile(fileContextMenu.fileId!);
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

            {/* Single Note Presentation Overlay */}
            {presentingFileId && (() => {
                const file = goosFiles.find(f => f.id === presentingFileId);
                if (!file) return null;
                return (
                    <PresentationView
                        note={{
                            id: file.id,
                            title: file.title,
                            subtitle: undefined,
                            content: file.content,
                            headerImage: undefined,
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
                            background: goOS.colors.white,
                            border: `2px solid ${goOS.colors.border}`,
                            color: goOS.colors.text.primary,
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
