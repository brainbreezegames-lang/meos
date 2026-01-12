'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { EditProvider, useEditContextSafe } from '@/contexts/EditContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { WindowProvider, useWindowContext } from '@/contexts/WindowContext';
import { WindowManager } from '@/components/desktop/MultiWindow';
import { EditableDesktopItem } from '@/components/desktop/EditableDesktopItem';
import { BackgroundPanel } from '@/components/desktop/BackgroundPanel';
import { WelcomeNotification } from '@/components/desktop/WelcomeNotification';
import { PersonaLoginScreen, useVisitorPersona, PersonaModeToggle, type VisitorPersona } from '@/components/desktop/PersonaLoginScreen';
import { SaveIndicator, Toast } from '@/components/editing/SaveIndicator';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { ParticleBackground, ParticleSettingsPanel, type ParticleSettings } from '@/components/desktop/ParticleBackground';
import { LiveStatus, LiveStatusDropdown, type LiveStatusData } from '@/components/desktop/LiveStatus';
import { QRCodeGenerator } from '@/components/desktop/QRCodeGenerator';
import { Guestbook, type GuestbookEntry } from '@/components/desktop/Guestbook';
import { AnalyticsDashboard } from '@/components/desktop/AnalyticsDashboard';
import { CursorProvider, CursorSettingsPanel, type CursorSettings } from '@/components/desktop/CustomCursor';
import type { DesktopItem, Desktop } from '@/types';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { MobileContainer } from '@/components/mobile';
import { ConfettiBurst, useKonamiCode } from '@/components/ui/Delight';
import Wallpaper from '@/components/desktop/Wallpaper';

// Persona visibility configuration for demo items
// 'recruiter' = optimized for hiring decisions (resume, experience, skills, projects, testimonials, contact)
// 'visitor' = full creative experience (everything)
// 'guest' = same as visitor
type PersonaVisibility = {
  recruiter: string[];
  visitor: string[];
  guest: string[];
};

const PERSONA_VISIBLE_ITEMS: PersonaVisibility = {
  // Recruiter sees: About Me, Resume, Skills, Projects, Testimonials, Recognition, Contact
  recruiter: ['item-1', 'item-13', 'item-10', 'item-3', 'item-6', 'item-8', 'item-7'],
  // Visitor sees everything
  visitor: ['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8', 'item-9', 'item-10', 'item-11', 'item-12', 'item-13'],
  // Guest sees everything too
  guest: ['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8', 'item-9', 'item-10', 'item-11', 'item-12', 'item-13'],
};

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

// Persona context for demo
interface PersonaContextType {
  persona: VisitorPersona | null;
  setPersona: (p: VisitorPersona) => void;
}
const PersonaContext = createContext<PersonaContextType | null>(null);
function usePersonaContext() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersonaContext must be used within provider');
  return ctx;
}


// Demo particle settings
const DEMO_PARTICLE_SETTINGS: ParticleSettings = {
  type: 'stars',
  density: 30,
  speed: 30,
  respondToMouse: true,
};

// Demo live status
const DEMO_LIVE_STATUS: LiveStatusData = {
  music: {
    provider: 'spotify',
    track: 'Awake',
    artist: 'Tycho',
    album: 'A Walk',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273886a4879d79d5bde7c708693',
    progress: 154000,
    duration: 252000,
    isPlaying: true,
  },
  status: {
    emoji: '💻',
    text: 'Working on MeOS',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  location: {
    city: 'San Francisco',
    country: 'USA',
    timezone: 'America/Los_Angeles',
  },
  availability: 'available',
};

// Demo guestbook entries
const DEMO_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  {
    id: 'gb-1',
    message: 'Love the design! This is exactly what I was looking for.',
    type: 'general',
    authorType: 'anonymous',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isPublic: true,
  },
  {
    id: 'gb-2',
    message: 'Would love to chat about a potential collaboration!',
    type: 'opportunity',
    authorType: 'named',
    authorName: 'Sarah K.',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    isPublic: true,
    ownerMarkedHelpful: true,
  },
  {
    id: 'gb-3',
    message: 'The particle effects are amazing. How did you build this?',
    type: 'feedback',
    authorType: 'named',
    authorName: 'Dev_Mike',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    isPublic: true,
  },
];

// Demo cursor settings
const DEMO_CURSOR_SETTINGS: CursorSettings = {
  style: 'default',
  color: 'default',
  clickRipple: false,
  hoverGlow: false,
  trail: false,
  intensity: 50,
};

// Demo analytics data
const DEMO_ANALYTICS_DATA = {
  overview: {
    visitors: 1247,
    visitorsChange: 12,
    pageViews: 4829,
    pageViewsChange: 8,
    avgTime: '2m 34s',
    avgTimeChange: -3,
  },
  sources: [
    { name: 'Direct', count: 523, percentage: 42 },
    { name: 'LinkedIn', count: 312, percentage: 25 },
    { name: 'Twitter', count: 187, percentage: 15 },
    { name: 'Google', count: 148, percentage: 12 },
    { name: 'Other', count: 77, percentage: 6 },
  ],
  visitorTypes: {
    recruiters: { count: 89, percentage: 7 },
    visitors: { count: 1023, percentage: 82 },
    skipped: { count: 135, percentage: 11 },
  },
  topContent: [
    { name: 'About Me', opens: 892, change: 5 },
    { name: 'Projects', opens: 654, change: 12 },
    { name: 'Resume', opens: 432, change: 23 },
    { name: 'Photography', opens: 298, change: -2 },
    { name: 'Contact', opens: 187, change: 8 },
  ],
  recruiterFunnel: {
    visited: 89,
    viewedWork: 67,
    downloadedCV: 34,
    contacted: 12,
  },
  liveVisitors: [
    { location: 'San Francisco, US', viewing: 'Projects', duration: '3m 12s' },
    { location: 'London, UK', viewing: 'About Me', duration: '1m 45s' },
    { location: 'Tokyo, JP', viewing: 'Resume', duration: '0m 32s' },
  ],
};

// Background images that rotate
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2560&h=1440&fit=crop&q=90',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2560&h=1440&fit=crop&q=90',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2560&h=1440&fit=crop&q=90',
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=2560&h=1440&fit=crop&q=90',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2560&h=1440&fit=crop&q=90',
];

// Desktop items with comprehensive block showcase
const DEMO_ITEMS: DesktopItem[] = [
  // ============================================
  // 1. ABOUT ME - Tabs, Timeline, Social, Details
  // ============================================
  {
    id: 'item-1',
    desktopId: 'demo',
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
                { platform: 'instagram', url: 'https://instagram.com' },
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
                { date: '2022 - Present', title: 'Senior Product Designer', subtitle: 'Figma', description: 'Leading design system initiatives and core product features' },
                { date: '2020 - 2022', title: 'Product Designer', subtitle: 'Stripe', description: 'Designed checkout flows used by millions of businesses' },
                { date: '2018 - 2020', title: 'UI Designer', subtitle: 'Airbnb', description: 'Worked on the host experience team' },
                { date: '2016 - 2018', title: 'Junior Designer', subtitle: 'Startup Inc', description: 'First design role, learned the fundamentals' },
              ]
            }
          },
        ],
      },
      {
        id: 'tab-skills',
        label: 'Skills',
        order: 2,
        blocks: [
          {
            id: 'b6', type: 'list', order: 0, data: {
              style: 'check', items: [
                'UI/UX Design',
                'Design Systems',
                'Prototyping & Animation',
                'User Research',
                'React & TypeScript',
                'Figma & Framer',
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

  // ============================================
  // 2. CASE STUDY - Pages Window (Document Style)
  // ============================================
  {
    id: 'item-2',
    desktopId: 'demo',
    label: 'Case Study',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
    positionX: 24,
    positionY: 8,
    windowTitle: 'Spotify Redesign',
    windowSubtitle: 'Reimagining Music Discovery',
    windowHeaderImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
    windowDescription: '',
    windowType: 'pages',
    windowWidth: 720,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: true,
    tabs: [
      {
        id: 'tab-overview',
        label: 'Overview',
        order: 0,
        blocks: [
          {
            id: 'cs1', type: 'details', order: 0, data: {
              items: [
                { label: 'Client', value: 'Spotify' },
                { label: 'Role', value: 'Lead Designer' },
                { label: 'Year', value: '2024' },
                { label: 'Duration', value: '4 months' },
              ]
            }
          },
          { id: 'cs2', type: 'divider', order: 1, data: { style: 'line' } },
          { id: 'cs3', type: 'text', order: 2, data: { content: 'This case study explores how we reimagined the music discovery experience for Generation Z users, resulting in a 47% increase in time spent in the app and widespread critical acclaim.' } },
          {
            id: 'cs4', type: 'stats', order: 3, data: {
              items: [
                { value: '+47%', label: 'Time in App' },
                { value: '+23%', label: 'Saves per User' },
                { value: '4.8', label: 'App Rating', suffix: '★' },
              ]
            }
          },
        ],
      },
      {
        id: 'tab-challenge',
        label: 'The Challenge',
        order: 1,
        blocks: [
          { id: 'cs5', type: 'heading', order: 0, data: { text: 'Understanding the Problem', level: 2 } },
          { id: 'cs6', type: 'text', order: 1, data: { content: 'Gen Z users were spending 40% less time in the app compared to millennials. Discovery felt stale and algorithmic playlists were not resonating with younger audiences. We needed to fundamentally rethink how users find and connect with music.' } },
          { id: 'cs7', type: 'callout', order: 2, data: { text: 'Key insight: Gen Z users crave authenticity and social connection, not just algorithmic recommendations.', style: 'warning', icon: '💡' } },
        ],
      },
      {
        id: 'tab-solution',
        label: 'Solution',
        order: 2,
        blocks: [
          { id: 'cs8', type: 'heading', order: 0, data: { text: 'Our Approach', level: 2 } },
          { id: 'cs9', type: 'text', order: 1, data: { content: 'We conducted 30 user interviews, created journey maps, and identified 5 key friction points. We prototyped 12 different concepts and tested with 200+ users before landing on our final solution.' } },
          { id: 'cs10', type: 'heading', order: 2, data: { text: 'Key Features', level: 3 } },
          {
            id: 'cs11', type: 'list', order: 3, data: {
              style: 'check', items: [
                'TikTok-style vertical scrolling for music discovery',
                'AI-powered suggestions based on mood and context',
                'Social features like listening parties',
                'Collaborative playlists with friends',
              ]
            }
          },
          {
            id: 'cs12', type: 'before-after', order: 4, data: {
              before: { image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=600&h=400&fit=crop', label: 'Old Design' },
              after: { image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=600&h=400&fit=crop', label: 'New Design' },
              style: 'slider',
            }
          },
        ],
      },
      {
        id: 'tab-results',
        label: 'Results',
        order: 3,
        blocks: [
          { id: 'cs13', type: 'heading', order: 0, data: { text: 'Impact & Recognition', level: 2 } },
          { id: 'cs14', type: 'text', order: 1, data: { content: 'Shipped to 50M users with overwhelmingly positive feedback. Featured in Fast Company and nominated for a Webby Award. The project fundamentally changed how Spotify approaches younger demographics.' } },
          {
            id: 'cs15', type: 'stats', order: 2, data: {
              items: [
                { value: '50M', label: 'Users Reached' },
                { value: '#1', label: 'Product Hunt' },
                { value: '2', label: 'Awards Won' },
              ]
            }
          },
          {
            id: 'cs16', type: 'buttons', order: 3, data: {
              buttons: [
                { label: 'View Live Site', url: 'https://spotify.com', style: 'primary', newTab: true },
              ]
            }
          },
        ],
      },
    ],
    blocks: [],
    zIndex: 0,
    commentsEnabled: true,
    order: 1,
  },

  // ============================================
  // 3. PROJECTS - Browser Window, Product Cards
  // ============================================
  {
    id: 'item-3',
    desktopId: 'demo',
    label: 'Projects',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
    positionX: 42,
    positionY: 15,
    windowTitle: 'My Projects',
    windowSubtitle: 'Things I\'ve Built',
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
            { image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop', name: 'DevTools Pro', description: 'A suite of developer productivity tools', url: 'https://github.com', status: 'active', metrics: '10k users' },
            { image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&h=200&fit=crop', name: 'DesignKit', description: 'Open source design system for React', url: 'https://github.com', status: 'active', metrics: '5k stars' },
            { image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', name: 'ColorAI', description: 'AI-powered color palette generator', url: 'https://github.com', status: 'acquired', metrics: 'Acquired by Adobe' },
          ]
        }
      },
      { id: 'pr3', type: 'divider', order: 2, data: { style: 'space' } },
      { id: 'pr4', type: 'callout', order: 3, data: { text: 'Looking to collaborate? I\'m open to interesting side projects.', style: 'info', icon: '💡' } },
      {
        id: 'pr5', type: 'buttons', order: 4, data: {
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

  // ============================================
  // 4. PHOTOGRAPHY - Photos Window (Apple Photos Style)
  // ============================================
  {
    id: 'item-4',
    desktopId: 'demo',
    label: 'Photography',
    thumbnailUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop',
    positionX: 72,
    positionY: 10,
    windowTitle: 'Photography',
    windowSubtitle: 'Moments Captured',
    windowHeaderImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop',
    windowDescription: '',
    windowType: 'photos',
    windowWidth: 800,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: true,
    tabs: [
      {
        id: 'tab-grid',
        label: 'Gallery',
        order: 0,
        blocks: [
          { id: 'ph1', type: 'text', order: 0, data: { content: "Photography is how I see the world when I'm not behind a screen. I'm drawn to street photography, architecture, and those fleeting golden hour moments." } },
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
      },
      {
        id: 'tab-featured',
        label: 'Featured',
        order: 1,
        blocks: [
          {
            id: 'ph3', type: 'image', order: 0, data: {
              url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
              caption: 'Dawn breaks over the Swiss Alps — my favorite shot from 2024',
              alt: 'Swiss Alps at dawn',
              aspectRatio: '16:9',
            }
          },
          { id: 'ph4', type: 'quote', order: 1, data: { text: 'Photography is the story I fail to put into words.', attribution: 'Destin Sparks', style: 'simple' } },
        ],
      },
      {
        id: 'tab-gear',
        label: 'Gear',
        order: 2,
        blocks: [
          {
            id: 'ph5', type: 'details', order: 0, data: {
              items: [
                { label: 'Camera', value: 'Fujifilm X-T4' },
                { label: 'Favorite Lens', value: '35mm f/1.4' },
                { label: 'Backup', value: 'iPhone 15 Pro' },
                { label: 'Editing', value: 'Lightroom + VSCO' },
              ]
            }
          },
          {
            id: 'ph6', type: 'buttons', order: 1, data: {
              buttons: [
                { label: 'View on Instagram', url: 'https://instagram.com', style: 'primary', newTab: true },
              ]
            }
          },
        ],
      },
    ],
    blocks: [],
    zIndex: 0,
    commentsEnabled: true,
    order: 3,
  },

  // ============================================
  // 5. WRITING - Notes Window (Apple Notes Style)
  // ============================================
  {
    id: 'item-5',
    desktopId: 'demo',
    label: 'Writing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=200&fit=crop',
    positionX: 62,
    positionY: 38,
    windowType: 'notes',
    windowTitle: 'Writing',
    windowSubtitle: 'Thoughts & Essays',
    windowHeaderImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop',
    windowDescription: '',
    windowWidth: 480,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      {
        id: 'w1', type: 'stats', order: 0, data: {
          items: [
            { value: '34', label: 'Posts' },
            { value: '2.4k', label: 'Subscribers' },
            { value: 'Weekly', label: 'Newsletter' },
          ]
        }
      },
      { id: 'w2', type: 'heading', order: 1, data: { text: 'Recent Articles', level: 3 } },
      {
        id: 'w3', type: 'links', order: 2, data: {
          links: [
            { title: 'The Future of Design Tools', url: 'https://medium.com', description: 'Why AI won\'t replace designers — it will make them 10x better' },
            { title: 'Constraints Breed Creativity', url: 'https://medium.com', description: 'How limitations make better work and happier teams' },
            { title: 'Building in Public', url: 'https://medium.com', description: 'Lessons from sharing my failures (and occasional wins)' },
            { title: 'The Case for Boring Design', url: 'https://medium.com', description: 'Why the best interfaces are invisible' },
          ]
        }
      },
      { id: 'w4', type: 'divider', order: 3, data: { style: 'dots' } },
      { id: 'w5', type: 'quote', order: 4, data: { text: 'Design is not just what it looks like and feels like. Design is how it works.', attribution: 'Steve Jobs', style: 'large' } },
      {
        id: 'w6', type: 'buttons', order: 5, data: {
          buttons: [
            { label: 'Subscribe on Substack', url: 'https://substack.com', style: 'primary', newTab: true },
            { label: 'Read All Posts', url: 'https://medium.com', style: 'ghost', newTab: true },
          ]
        }
      },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 4,
  },

  // ============================================
  // 6. TESTIMONIALS - Testimonial Block, Logos
  // ============================================
  {
    id: 'item-6',
    desktopId: 'demo',
    label: 'Testimonials',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
    positionX: 8,
    positionY: 42,
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
      { id: 't2', type: 'divider', order: 1, data: { style: 'line' } },
      { id: 't3', type: 'heading', order: 2, data: { text: 'Trusted By', level: 3 } },
      {
        id: 't4', type: 'logos', order: 3, data: {
          logos: [
            { image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=120&h=60&fit=crop', name: 'Spotify', url: 'https://spotify.com' },
            { image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=120&h=60&fit=crop', name: 'Meta', url: 'https://meta.com' },
            { image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=120&h=60&fit=crop', name: 'Netflix', url: 'https://netflix.com' },
            { image: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=120&h=60&fit=crop', name: 'Airbnb', url: 'https://airbnb.com' },
          ],
          style: 'row',
          grayscale: true,
        }
      },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 5,
  },

  // ============================================
  // 7. CONTACT - Mail Window Style
  // ============================================
  {
    id: 'item-7',
    desktopId: 'demo',
    label: 'Contact',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=200&h=200&fit=crop',
    positionX: 82,
    positionY: 45,
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

  // ============================================
  // 8. AWARDS & PRESS
  // ============================================
  {
    id: 'item-8',
    desktopId: 'demo',
    label: 'Recognition',
    thumbnailUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=200&h=200&fit=crop',
    positionX: 28,
    positionY: 36,
    windowTitle: 'Awards & Press',
    windowSubtitle: 'Recognition',
    windowHeaderImage: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=400&fit=crop',
    windowDescription: '',
    windowWidth: 460,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'aw1', type: 'heading', order: 0, data: { text: 'Awards', level: 3 } },
      {
        id: 'aw2', type: 'award', order: 1, data: {
          awards: [
            { badge: '🏆', name: 'Awwwards Site of the Day', issuer: 'Awwwards', year: '2024' },
            { badge: '🥇', name: 'CSS Design Awards', issuer: 'CSSDA', year: '2024' },
            { badge: '⭐', name: 'Forbes 30 Under 30', issuer: 'Forbes — Design', year: '2023' },
            { badge: '🍎', name: 'Apple Design Award Finalist', issuer: 'Apple', year: '2022' },
          ]
        }
      },
      { id: 'aw3', type: 'divider', order: 2, data: { style: 'line' } },
      { id: 'aw4', type: 'heading', order: 3, data: { text: 'Featured In', level: 3 } },
      {
        id: 'aw5', type: 'press', order: 4, data: {
          mentions: [
            { publication: 'TechCrunch', headline: 'The Designer Redefining Product Thinking', url: 'https://techcrunch.com', date: 'March 2024' },
            { publication: 'Fast Company', headline: 'Most Creative People in Business', url: 'https://fastcompany.com', date: 'January 2024' },
            { publication: 'Wired', headline: 'How AI is Changing Design', url: 'https://wired.com', date: 'December 2023' },
          ]
        }
      },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 7,
  },

  // ============================================
  // 9. READING LIST - Book Block
  // ============================================
  {
    id: 'item-9',
    desktopId: 'demo',
    label: 'Reading',
    thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop',
    positionX: 48,
    positionY: 58,
    windowTitle: 'Bookshelf',
    windowSubtitle: 'Currently Reading',
    windowHeaderImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    windowDescription: '',
    windowWidth: 480,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: false,
    tabs: [],
    blocks: [
      { id: 'bk1', type: 'heading', order: 0, data: { text: 'Currently Reading', level: 3 } },
      {
        id: 'bk2', type: 'book', order: 1, data: {
          books: [
            { title: 'The Creative Act', subtitle: 'A Way of Being', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop', description: 'Rick Rubin\'s guide to creativity from the legendary producer.' },
          ]
        }
      },
      { id: 'bk3', type: 'heading', order: 2, data: { text: 'Favorites', level: 3 } },
      {
        id: 'bk4', type: 'book', order: 3, data: {
          books: [
            { title: 'The Design of Everyday Things', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop' },
            { title: 'Thinking, Fast and Slow', cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=300&fit=crop' },
            { title: 'Zero to One', cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop' },
            { title: 'Creative Confidence', cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=300&fit=crop' },
          ]
        }
      },
      {
        id: 'bk5', type: 'links', order: 4, data: {
          links: [
            { title: 'View full reading list on Goodreads', url: 'https://goodreads.com', description: '47 books read this year' },
          ]
        }
      },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 8,
  },

  // ============================================
  // 10. SKILLS & TOOLS - Table, List
  // ============================================
  {
    id: 'item-10',
    desktopId: 'demo',
    label: 'Skills',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop',
    positionX: 8,
    positionY: 72,
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
            ['Swift', 'Intermediate', '2+'],
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
      { id: 'sk5', type: 'callout', order: 4, data: { text: 'Always learning something new. Currently diving deep into AI/ML.', style: 'note', icon: '📚' } },
    ],
    zIndex: 0,
    commentsEnabled: true,
    order: 9,
  },

  // ============================================
  // 11. EXPERIMENTS - Video, Audio, Embed
  // ============================================
  {
    id: 'item-11',
    desktopId: 'demo',
    label: 'Experiments',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    positionX: 30,
    positionY: 68,
    windowTitle: 'Experiments',
    windowSubtitle: 'Creative Playground',
    windowHeaderImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    windowDescription: '',
    windowWidth: 520,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: true,
    tabs: [
      {
        id: 'tab-videos',
        label: 'Videos',
        order: 0,
        blocks: [
          { id: 'e1', type: 'text', order: 0, data: { content: 'A collection of process videos, talks, and creative experiments.' } },
          {
            id: 'e2', type: 'video', order: 1, data: {
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              embedType: 'youtube',
              aspectRatio: '16:9',
            }
          },
          { id: 'e3', type: 'callout', order: 2, data: { text: 'More videos on my YouTube channel', style: 'info', icon: '▶️' } },
        ],
      },
      {
        id: 'tab-music',
        label: 'Music',
        order: 1,
        blocks: [
          { id: 'e4', type: 'heading', order: 0, data: { text: 'What I\'m Listening To', level: 3 } },
          {
            id: 'e5', type: 'audio', order: 1, data: {
              url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
              embedType: 'spotify',
              title: 'Today\'s Top Hits',
            }
          },
        ],
      },
      {
        id: 'tab-code',
        label: 'Code',
        order: 2,
        blocks: [
          { id: 'e6', type: 'heading', order: 0, data: { text: 'Code Experiments', level: 3 } },
          {
            id: 'e7', type: 'embed', order: 1, data: {
              embedType: 'codepen',
              url: 'https://codepen.io/alexchen/pen/example',
              aspectRatio: '4:3',
            }
          },
        ],
      },
    ],
    blocks: [],
    zIndex: 0,
    commentsEnabled: true,
    order: 10,
  },

  // ============================================
  // 12. PORTFOLIO - Carousel Block
  // ============================================
  {
    id: 'item-12',
    desktopId: 'demo',
    label: 'Portfolio',
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop',
    positionX: 68,
    positionY: 70,
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
            { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', caption: 'E-commerce Redesign — Complete checkout flow overhaul' },
            { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', caption: 'Analytics Dashboard — Real-time data visualization' },
            { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop', caption: 'Developer Tools — VS Code extension' },
            { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop', caption: 'Generative Art — Created with p5.js' },
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

  // ============================================
  // 13. RESUME/CV - Finder Window (File Browser Style)
  // ============================================
  {
    id: 'item-13',
    desktopId: 'demo',
    label: 'Resume',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=200&fit=crop',
    positionX: 88,
    positionY: 18,
    windowTitle: 'Documents',
    windowSubtitle: 'My Files',
    windowHeaderImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop',
    windowDescription: '',
    windowType: 'finder',
    windowWidth: 700,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    useTabs: true,
    tabs: [
      {
        id: 'tab-resume',
        label: 'Resume',
        order: 0,
        blocks: [
          { id: 'r1', type: 'text', order: 0, data: { content: 'Download my resume to learn more about my experience, education, and skills.' } },
          {
            id: 'r2', type: 'download', order: 1, data: {
              url: '/alex-chen-resume.pdf',
              fileName: 'Alex_Chen_Resume_2024.pdf',
              fileSize: '245 KB',
              fileType: 'PDF',
            }
          },
        ],
      },
      {
        id: 'tab-portfolio',
        label: 'Portfolio',
        order: 1,
        blocks: [
          { id: 'r3', type: 'text', order: 0, data: { content: 'Selected case studies and project documentation.' } },
          {
            id: 'r4', type: 'download', order: 1, data: {
              url: '/portfolio.pdf',
              fileName: 'Alex_Chen_Portfolio_2024.pdf',
              fileSize: '12.4 MB',
              fileType: 'PDF',
            }
          },
        ],
      },
      {
        id: 'tab-certificates',
        label: 'Certificates',
        order: 2,
        blocks: [
          {
            id: 'r5', type: 'list', order: 0, data: {
              style: 'check', items: [
                'AWS Solutions Architect',
                'Google UX Design',
                'Meta Frontend Developer',
              ]
            }
          },
        ],
      },
    ],
    blocks: [],
    zIndex: 0,
    commentsEnabled: true,
    order: 12,
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
    { id: 'dock-2', desktopId: 'demo', icon: '📝', label: 'Guestbook', actionType: 'app', actionValue: 'guestbook', order: 1 },
    { id: 'dock-3', desktopId: 'demo', icon: '📊', label: 'Analytics', actionType: 'app', actionValue: 'analytics', order: 2 },
    { id: 'dock-4', desktopId: 'demo', icon: '⚙️', label: 'Settings', actionType: 'app', actionValue: 'settings', order: 3 },
    { id: 'dock-5', desktopId: 'demo', icon: '🐙', label: 'GitHub', actionType: 'url', actionValue: 'https://github.com', order: 4 },
  ],
  statusWidget: null,
  workbenchEntries: [],
};

// Theme-aware Dock Icon Component - Uses CSS variables for theming
interface DockIconProps {
  item: typeof DEMO_DESKTOP.dockItems[0];
  mouseX: ReturnType<typeof useMotionValue<number>>;
  onAppClick?: (appId: string) => void;
}

function DockIcon({ item, mouseX, onAppClick }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [sizes, setSizes] = useState({ base: 48, max: 72 });

  // Read CSS variable sizes on mount and theme change
  useEffect(() => {
    const updateSizes = () => {
      const style = getComputedStyle(document.documentElement);
      const base = parseInt(style.getPropertyValue('--dock-icon-size')) || 48;
      const max = parseInt(style.getPropertyValue('--dock-icon-size-hover')) || 72;
      setSizes({ base, max });
    };
    updateSizes();

    // Watch for theme changes
    const observer = new MutationObserver(updateSizes);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const distance = 140;
  const springConfig = { mass: 0.1, stiffness: 150, damping: 12 };

  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceFromMouse,
    [-distance, 0, distance],
    [sizes.base, sizes.max, sizes.base]
  );
  const width = useSpring(widthSync, springConfig);

  const iconSizeSync = useTransform(
    distanceFromMouse,
    [-distance, 0, distance],
    [sizes.base * 0.5, sizes.max * 0.5, sizes.base * 0.5]
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
    } else if (item.actionType === 'app' && onAppClick) {
      onAppClick(item.actionValue);
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
      {/* Tooltip */}
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
              className="px-2.5 py-1 whitespace-nowrap"
              style={{
                background: 'var(--bg-tooltip)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'var(--shadow-md)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span
                className="font-medium"
                style={{
                  color: 'var(--text-on-dark)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {item.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon button - Uses CSS variable for background and shadow */}
      <motion.button
        onClick={handleClick}
        className="w-full h-full flex items-center justify-center"
        style={{
          borderRadius: 'var(--radius-dock-icon)',
          background: 'var(--bg-dock-icon)',
          boxShadow: 'var(--shadow-dock-icon)',
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

// Theme-aware Dock Component - Uses CSS variables for all styling
function Dock({ items, onAppClick }: { items: typeof DEMO_DESKTOP.dockItems; onAppClick?: (appId: string) => void }) {
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
        className="flex items-end"
        style={{
          gap: 'var(--spacing-dock-gap)',
          padding: 'var(--spacing-dock-padding)',
          borderRadius: 'var(--radius-dock)',
          background: 'var(--bg-dock)',
          backdropFilter: 'var(--blur-dock)',
          WebkitBackdropFilter: 'var(--blur-dock)',
          boxShadow: 'var(--shadow-dock)',
          border: 'var(--border-width) solid var(--border-glass-outer)',
        }}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {items.map((item) => (
          <DockIcon key={item.id} item={item} mouseX={mouseX} onAppClick={onAppClick} />
        ))}
      </motion.div>
    </motion.div>
  );
}

// Refined macOS-style Menu Bar - Clean, minimal, Apple-like
function MenuBar({
  persona,
  onPersonaChange,
  onShowQRCode,
}: {
  persona: VisitorPersona | null;
  onPersonaChange: (p: VisitorPersona) => void;
  onShowQRCode: () => void;
}) {
  const context = useEditContextSafe();
  const bgContext = useBackgroundContext();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
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

  // Get persona label for display
  const getPersonaLabel = () => {
    if (!persona || persona === 'guest') return null;
    return persona === 'recruiter' ? 'Recruiter View' : 'Explorer View';
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[150] flex items-center justify-between"
      style={{
        height: '28px',
        paddingLeft: '12px',
        paddingRight: '8px',
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
      }}
      initial={{ y: -28 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
    >
      {/* Left side - App name and menu items */}
      <div className="flex items-center gap-5">
        {/* Apple-style bold app name */}
        <span
          style={{
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.95)',
            letterSpacing: '-0.01em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          }}
        >
          MeOS
        </span>

        {/* Persona indicator - subtle but informative */}
        {getPersonaLabel() && (
          <button
            onClick={() => onPersonaChange(persona === 'recruiter' ? 'visitor' : 'recruiter')}
            className="flex items-center gap-1.5 transition-all duration-200"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.65)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              background: 'transparent',
              padding: '2px 8px',
              borderRadius: '4px',
              marginLeft: '-4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
            }}
          >
            <span style={{ fontSize: '11px' }}>
              {persona === 'recruiter' ? '👔' : '✨'}
            </span>
            <span>{getPersonaLabel()}</span>
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="currentColor"
              style={{ opacity: 0.6, marginLeft: '2px' }}
            >
              <path d="M1.5 2.5L4 5L6.5 2.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Live Status - shows music/status */}
        <LiveStatus data={DEMO_LIVE_STATUS} />
      </div>

      {/* Right side - System tray style */}
      <div className="flex items-center gap-1">
        {/* QR Code button (owner only) */}
        {context?.isOwner && (
          <button
            onClick={onShowQRCode}
            className="flex items-center justify-center transition-all duration-150"
            style={{
              width: '26px',
              height: '20px',
              borderRadius: '4px',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.75)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            }}
            title="QR Code"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm6 0v4H2V2h4zm2 0a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V2zm6 0v4h-4V2h4zM0 10a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H2a2 2 0 01-2-2v-4zm6 0v4H2v-4h4zm4 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-2 4h2v2h-2v-2zm2 0h2v2h-2v-2z" />
            </svg>
          </button>
        )}
        {/* Edit mode toggle - pill button */}
        <button
          onClick={toggleEditMode}
          className="transition-all duration-200"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            padding: '3px 10px',
            borderRadius: '10px',
            background: context?.isOwner
              ? 'rgba(52, 199, 89, 0.85)'
              : 'rgba(255, 255, 255, 0.12)',
            color: context?.isOwner
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(255, 255, 255, 0.75)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!context?.isOwner) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
            }
          }}
          onMouseLeave={(e) => {
            if (!context?.isOwner) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }
          }}
        >
          {context?.isOwner ? 'Editing' : 'Try Editing'}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '12px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />

        {/* Background button - icon only */}
        <button
          onClick={() => bgContext.setShowBackgroundPanel(true)}
          className="flex items-center justify-center transition-all duration-150"
          style={{
            width: '26px',
            height: '20px',
            borderRadius: '4px',
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.75)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
          }}
          title="Background"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9zm1.5-.5a.5.5 0 00-.5.5v6.293l2.146-2.147a.5.5 0 01.708 0L8 9.793l2.146-2.147a.5.5 0 01.708 0L13 9.793V3.5a.5.5 0 00-.5-.5h-9zM13 11.207l-2.646-2.647a.5.5 0 00-.708 0L7.5 10.707 5.354 8.56a.5.5 0 00-.708 0L3 10.207V12.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-1.293z" />
          </svg>
        </button>

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Divider */}
        <div style={{ width: '1px', height: '12px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />

        {/* System icons - WiFi, Battery, Time */}
        <div className="flex items-center gap-2" style={{ marginLeft: '2px' }}>
          {/* WiFi */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="rgba(255, 255, 255, 0.85)"
          >
            <path d="M8 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm4.596-1.404a.5.5 0 01-.707.707A4.97 4.97 0 008 8a4.97 4.97 0 00-3.889 1.303.5.5 0 11-.707-.707A5.97 5.97 0 018 7a5.97 5.97 0 014.596 1.596zm2.12-2.12a.5.5 0 01-.707.707A8.96 8.96 0 008 5a8.96 8.96 0 00-6.01 2.182.5.5 0 11-.707-.707A9.96 9.96 0 018 4a9.96 9.96 0 016.717 2.475z" />
          </svg>

          {/* Battery */}
          <svg
            width="20"
            height="10"
            viewBox="0 0 20 10"
            fill="none"
            style={{ marginLeft: '-2px' }}
          >
            <rect
              x="0.5"
              y="0.5"
              width="16"
              height="9"
              rx="2"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="1"
            />
            <rect
              x="2"
              y="2"
              width="13"
              height="6"
              rx="1"
              fill="rgba(255, 255, 255, 0.85)"
            />
            <path
              d="M18 3.5v3a1.5 1.5 0 001-1.42v-.16a1.5 1.5 0 00-1-1.42z"
              fill="rgba(255, 255, 255, 0.5)"
            />
          </svg>

          {/* Time */}
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.01em',
              marginLeft: '2px',
            }}
          >
            {time}
          </span>
        </div>
      </div>
    </motion.header>
  );
}

// Theme-aware Rotating Background
function RotatingBackground() {
  const { customBackground } = useBackgroundContext();
  const { themeInfo, theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (customBackground) return;

    // If warm theme (Wallpaper component), don't rotate images
    if (theme === 'warm') return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setNextIndex((currentIndex + 1) % BACKGROUND_IMAGES.length);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
        setIsTransitioning(false);
      }, 1500);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentIndex, customBackground, theme]);

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

  if (theme === 'warm') {
    return <Wallpaper />;
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
function DesktopContent({ onAppClick }: { onAppClick: (appId: string) => void }) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const { persona } = usePersonaContext();
  const [itemOrder, setItemOrder] = useState<string[]>(() =>
    context?.desktop?.items.map(i => i.id) || []
  );
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemPosition, setNewItemPosition] = useState({ x: 50, y: 50 });

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
      commentsEnabled: true,
      order: context.desktop.items.length,
    };

    context.setDesktop({
      ...context.desktop,
      items: [...context.desktop.items, newItem],
    });

    setShowNewItemModal(false);
    windowContext.openWindow(newItem.id);
    context.showToast('Item created', 'success');
  };

  // Get all items and filter based on persona
  const allItems = context?.desktop?.items || [];
  const visibleItemIds = persona ? PERSONA_VISIBLE_ITEMS[persona] : PERSONA_VISIBLE_ITEMS.visitor;
  const items = allItems.filter(item => visibleItemIds.includes(item.id));

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
            onClick={() => windowContext.openWindow(item.id)}
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

      {/* Multi-Window Manager */}
      <WindowManager items={items} />

      {/* New Item Modal - Uses CSS variables for all styling */}
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
              className="fixed z-[301] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                padding: 'var(--spacing-window-padding)',
                borderRadius: 'var(--radius-window)',
                background: 'var(--bg-glass-elevated)',
                backdropFilter: 'var(--blur-glass)',
                WebkitBackdropFilter: 'var(--blur-glass)',
                boxShadow: 'var(--shadow-window)',
                border: 'var(--border-width) solid var(--border-light)',
              }}
            >
              <h3
                className="font-semibold mb-4"
                style={{
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: 'var(--letter-spacing-tight)',
                }}
              >
                Create New Item
              </h3>
              <p
                className="mb-6"
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 'var(--line-height-normal)',
                }}
              >
                A new item will be created at the clicked position.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewItemModal(false)}
                  className="px-4 py-2 font-medium transition-colors"
                  style={{
                    fontSize: '14px',
                    borderRadius: 'var(--radius-button)',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-button)',
                    border: 'var(--border-width) solid var(--border-light)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-button-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-button)'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateItem}
                  className="px-4 py-2 font-medium transition-colors"
                  style={{
                    fontSize: '14px',
                    borderRadius: 'var(--radius-button)',
                    background: 'var(--accent-primary)',
                    color: 'var(--text-on-accent)',
                    boxShadow: 'var(--shadow-button)',
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
      <Dock items={DEMO_DESKTOP.dockItems} onAppClick={onAppClick} />

      {/* Save Indicator */}
      <SaveIndicator />
      <Toast />

      {/* Made with badge - Uses CSS variables */}
      <motion.a
        href="/"
        className="fixed bottom-3 right-4 z-[50] px-3 py-1.5 font-medium"
        style={{
          fontSize: '10px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-dock)',
          backdropFilter: 'var(--blur-dock)',
          WebkitBackdropFilter: 'var(--blur-dock)',
          color: 'var(--text-on-image)',
          boxShadow: 'var(--shadow-sm)',
          border: 'var(--border-width) solid var(--border-glass-outer)',
          fontFamily: 'var(--font-body)',
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

// App Window Component - macOS-style floating window for dock apps
function AppWindow({
  title,
  icon,
  onClose,
  width = 480,
  children,
}: {
  title: string;
  icon: string;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  // Center on mount
  useEffect(() => {
    setPosition({
      x: (window.innerWidth - width) / 2,
      y: Math.max(60, (window.innerHeight - 500) / 2),
    });
  }, [width]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: position.x,
      offsetY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.offsetX + dx,
        y: Math.max(28, dragRef.current.offsetY + dy),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <motion.div
      className="fixed z-[200]"
      style={{
        left: position.x,
        top: position.y,
        width,
      }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Window chrome */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(30, 30, 30, 0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-move select-none"
          onMouseDown={handleMouseDown}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full transition-all group relative"
              style={{ background: '#ff5f57' }}
            >
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] text-black/70 font-bold">✕</span>
            </button>
            <div className="w-3 h-3 rounded-full" style={{ background: '#febd2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 flex-1 justify-center -ml-12">
            <span className="text-lg">{icon}</span>
            <span
              className="text-sm font-medium"
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}
            >
              {title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-5 max-h-[70vh] overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent',
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// Demo Page Inner (needs access to background context)
function DemoPageInner() {
  const bgContext = useBackgroundContext();
  const { persona, hasChecked, selectPersona, needsSelection } = useVisitorPersona();
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showGuestbook, setShowGuestbook] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(DEMO_GUESTBOOK_ENTRIES);
  const [particleSettings, setParticleSettings] = useState<ParticleSettings>(DEMO_PARTICLE_SETTINGS);
  const [cursorSettings, setCursorSettings] = useState<CursorSettings>(DEMO_CURSOR_SETTINGS);

  // Easter egg: Konami code triggers confetti celebration
  const [showConfetti, setShowConfetti] = useState(false);
  useKonamiCode(() => {
    setShowConfetti(true);
    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50, 30, 100]);
    setTimeout(() => setShowConfetti(false), 2000);
  });

  const handleAppClick = (appId: string) => {
    switch (appId) {
      case 'guestbook':
        setShowGuestbook(true);
        break;
      case 'analytics':
        setShowAnalytics(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
    }
  };

  // Check if we need to show login screen
  useEffect(() => {
    if (!hasChecked) return;

    const params = new URLSearchParams(window.location.search);

    // Auto-detect recruiter mode from URL params
    if (params.get('mode') === 'recruiter' || params.get('ref') === 'linkedin') {
      selectPersona('recruiter');
      return;
    }

    // Show login screen if no persona selected
    if (needsSelection) {
      setShowLoginScreen(true);
    }
  }, [hasChecked, needsSelection, selectPersona]);

  const handlePersonaSelect = (selectedPersona: VisitorPersona) => {
    selectPersona(selectedPersona);
    setShowLoginScreen(false);
  };

  // Don't render until we've checked localStorage
  if (!hasChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        }}
      />
    );
  }

  // Show login screen
  if (showLoginScreen) {
    return (
      <PersonaLoginScreen
        profileImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        name="Alex Chen"
        title="Product Designer & Developer"
        onSelect={handlePersonaSelect}
      />
    );
  }

  // Count open windows for particle reduction
  const openWindowCount = [showGuestbook, showAnalytics, showSettings, showQRCode].filter(Boolean).length;

  return (
    <PersonaContext.Provider value={{ persona, setPersona: selectPersona }}>
      <CursorProvider initialSettings={cursorSettings}>
        <main className="min-h-screen h-screen overflow-hidden relative">
          {/* Konami Code Easter Egg Confetti */}
          <ConfettiBurst trigger={showConfetti} count={50} duration={2000} />

          {/* Particle Background */}
          <ParticleBackground
            settings={particleSettings}
            reduceWhenWindowsOpen={true}
            windowsOpen={openWindowCount}
          />

          <RotatingBackground />

          {/* ... rest of the component ... */}
          <MenuBar
            persona={persona}
            onPersonaChange={selectPersona}
            onShowQRCode={() => setShowQRCode(true)}
          />
          <DesktopContent onAppClick={handleAppClick} />

          {/* Background Settings Panel */}
          <BackgroundPanel
            isOpen={bgContext.showBackgroundPanel}
            onClose={() => bgContext.setShowBackgroundPanel(false)}
            currentBackground={bgContext.customBackground}
            onBackgroundChange={bgContext.setCustomBackground}
          />

          {/* QR Code Generator */}
          <QRCodeGenerator
            baseUrl="https://meos-delta.vercel.app"
            username="demo"
            isOpen={showQRCode}
            onClose={() => setShowQRCode(false)}
          />

          {/* Guestbook Window */}
          <AnimatePresence>
            {showGuestbook && (
              <AppWindow
                title="Guestbook"
                icon="📝"
                onClose={() => setShowGuestbook(false)}
              >
                <Guestbook
                  entries={guestbookEntries}
                  onSubmit={(entry) => {
                    const newEntry: GuestbookEntry = {
                      ...entry,
                      id: `gb-${Date.now()}`,
                      createdAt: new Date(),
                      isPublic: true,
                    };
                    setGuestbookEntries([newEntry, ...guestbookEntries]);
                  }}
                  isOwnerView={false}
                />
              </AppWindow>
            )}
          </AnimatePresence>

          {/* Analytics Window */}
          <AnimatePresence>
            {showAnalytics && (
              <AppWindow
                title="Analytics"
                icon="📊"
                onClose={() => setShowAnalytics(false)}
                width={700}
              >
                <AnalyticsDashboard data={DEMO_ANALYTICS_DATA} />
              </AppWindow>
            )}
          </AnimatePresence>

          {/* Settings Window */}
          <AnimatePresence>
            {showSettings && (
              <AppWindow
                title="Settings"
                icon="⚙️"
                onClose={() => setShowSettings(false)}
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-3">Particles</h3>
                    <ParticleSettingsPanel
                      settings={particleSettings}
                      onChange={setParticleSettings}
                    />
                  </div>
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-semibold text-white/80 mb-3">Custom Cursor</h3>
                    <CursorSettingsPanel
                      settings={cursorSettings}
                      onChange={setCursorSettings}
                    />
                  </div>
                </div>
              </AppWindow>
            )}
          </AnimatePresence>

          {/* Welcome Notification */}
          <WelcomeNotification
            title="Welcome to MeOS"
            subtitle="Your personal web desktop"
            body="Click any item to open its window. Try the Guestbook and Analytics in the dock!"
            icon="🖥️"
            delay={1500}
            duration={10000}
          />
        </main>
      </CursorProvider>
    </PersonaContext.Provider>
  );
}

// Mobile Demo Component
function MobileDemoPage() {
  const { theme, setTheme } = useTheme();
  const [showQRCode, setShowQRCode] = useState(false);

  // Convert guestbook entries to mobile format
  const mobileGuestbookEntries = DEMO_GUESTBOOK_ENTRIES.map(entry => ({
    id: entry.id,
    author: entry.authorName || 'Anonymous',
    message: entry.message,
    timestamp: entry.createdAt,
    isOwner: false,
  }));

  return (
    <>
      <MobileContainer
        items={DEMO_ITEMS}
        dockItems={DEMO_DESKTOP.dockItems}
        profileImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        profileName="Alex Chen"
        profileTitle="Product Designer & Developer"
        profileBio="Creative developer passionate about building beautiful digital experiences. Currently at Figma, previously Stripe & Airbnb."
        username="alexchen"
        backgroundUrl={BACKGROUND_IMAGES[0]}
        personas={[
          { id: 'recruiter', name: 'Recruiter', title: 'Looking to hire', color: 'rgba(59, 130, 246, 0.3)' },
          { id: 'visitor', name: 'Visitor', title: 'Just exploring', color: 'rgba(255, 255, 255, 0.15)' },
        ]}
        email="alex@example.com"
        twitter="@alexchen"
        linkedin="https://linkedin.com/in/alexchen"
        github="alexchen"
        website="https://alexchen.dev"
        calendly="https://cal.com/alexchen"
        guestbookEntries={mobileGuestbookEntries}
        theme={theme === 'dark' ? 'dark' : 'dark'}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'monterey' : 'dark')}
        onQRCodeOpen={() => setShowQRCode(true)}
        resumeUrl="/resume.pdf"
        startUnlocked={false}
      />
      <QRCodeGenerator
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
        username="alexchen"
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
      />
    </>
  );
}

// Main Demo Page
export default function DemoPage() {
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const { isMobile, isLoading } = useMobileDetection();

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        }}
      />
    );
  }

  // Mobile version
  if (isMobile) {
    return (
      <ThemeProvider initialTheme="dark">
        <MobileDemoPage />
      </ThemeProvider>
    );
  }

  // Desktop version
  return (
    <ThemeProvider initialTheme="warm">
      <BackgroundContext.Provider value={{
        customBackground,
        setCustomBackground,
        showBackgroundPanel,
        setShowBackgroundPanel,
      }}>
        <EditProvider initialDesktop={DEMO_DESKTOP} initialIsOwner={false} demoMode={true}>
          <WindowProvider>
            <DemoPageInner />
          </WindowProvider>
        </EditProvider>
      </BackgroundContext.Provider>
    </ThemeProvider>
  );
}
