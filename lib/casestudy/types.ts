/**
 * Case Study Page View Types
 *
 * Structures for parsing Note/Case Study content into a
 * Belle Duffner-style reading experience.
 */

// Table of contents entry extracted from H2 headings
export interface TableOfContentsEntry {
  id: string;        // Generated slug for anchor link
  title: string;     // H2 text content
}

// Content block types for the case study layout
export type ContentBlockType =
  | 'section-label'  // H4 → uppercase muted label
  | 'heading-1'      // H1 main heading
  | 'heading-2'      // H2 section heading
  | 'heading-3'      // H3 sub-heading
  | 'paragraph'      // Body text
  | 'image'          // Single image
  | 'image-grid'     // Multiple consecutive images
  | 'quote'          // Blockquote
  | 'list'           // UL/OL
  | 'code'           // Code block
  | 'divider';       // HR

// Image data with layout hint
export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  layout: 'full-width' | 'content-width';
}

// A single content block in the parsed case study
export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string | ImageData | ImageData[];
  isLead?: boolean;        // First paragraph after title (larger text)
  sectionId?: string;      // ID for scroll anchoring (H2 blocks)
  level?: 1 | 2 | 3;       // Heading level
  listType?: 'ul' | 'ol';  // For list blocks
}

// Fully parsed case study ready for rendering
export interface ParsedCaseStudy {
  heroImage: string | null;
  tableOfContents: TableOfContentsEntry[];
  contentBlocks: ContentBlock[];
}

// Props for the main CaseStudyPageView component
export interface CaseStudyPageViewProps {
  note: {
    id: string;
    title: string;
    subtitle: string | null;
    content: string;           // HTML from TipTap
    headerImage: string | null;
    publishedAt: Date | null;
    fileType: 'note' | 'case-study';
  };
  author: {
    username: string;
    name: string;
    image: string | null;
  };
  relatedStudies?: RelatedStudy[];
  onClose: () => void;
}

// Related case study for the "More Case Studies" section
export interface RelatedStudy {
  id: string;
  title: string;
  subtitle: string | null;
  headerImage: string | null;
  fileType: 'note' | 'case-study';
}

// Design tokens for the case study theme (Belle Duffner-inspired)
export const caseStudyTokens = {
  colors: {
    background: '#ffffff',     // Pure white
    surface: '#ffffff',        // Pure white for cards
    text: '#1a1a1a',           // Near black
    textMuted: 'rgba(0, 0, 0, 0.4)',   // 40% opacity black
    textLight: 'rgba(0, 0, 0, 0.5)',   // 50% opacity
    accent: '#000000',         // Black for links/emphasis
    border: 'rgba(0, 0, 0, 0.1)',      // 10% border
    borderLight: 'rgba(0, 0, 0, 0.05)', // 5% border
    hero: '#1a1410',           // Dark overlay for hero
    heroText: '#ffffff',       // White text on hero
  },
  fonts: {
    // Editorial serif for display/headings (like Freight Display)
    display: '"Newsreader", "Freight Display Pro", Georgia, serif',
    // Sans-serif for body text (clean, readable)
    body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    // UI elements
    ui: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  spacing: {
    sectionGap: 60,
    paragraphGap: 24,
    contentMaxWidth: 680,
    sidebarWidth: 200,
    sidebarLeft: 48,
    contentPadding: 24,
  },
  typography: {
    // Hero title (on image, centered, italic)
    heroTitle: { size: 80, weight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, fontStyle: 'italic' },
    // Main heading (serif, normal weight for elegance)
    title: { size: 48, weight: 400, letterSpacing: '-0.01em', lineHeight: 1.15 },
    // Section heading
    h1: { size: 36, weight: 400, letterSpacing: '-0.01em', lineHeight: 1.2 },
    h2: { size: 32, weight: 400, letterSpacing: '-0.01em', lineHeight: 1.25 },
    h3: { size: 24, weight: 500, letterSpacing: '0', lineHeight: 1.35 },
    // Section label (uppercase, wide letter-spacing)
    sectionLabel: { size: 12, weight: 500, letterSpacing: '0.15em', lineHeight: 1.5 },
    // Body text
    lead: { size: 20, weight: 400, letterSpacing: '0', lineHeight: 1.7 },
    body: { size: 18, weight: 400, letterSpacing: '0', lineHeight: 1.7 },
    // Meta info
    metaName: { size: 16, weight: 600, letterSpacing: '0', lineHeight: 1.4 },
    metaTags: { size: 14, weight: 400, letterSpacing: '0', lineHeight: 1.4 },
    // Sidebar
    sidebar: { size: 14, weight: 400, letterSpacing: '0', lineHeight: 1.5 },
    sidebarActive: { size: 14, weight: 500, letterSpacing: '0', lineHeight: 1.5 },
    // Cards
    cardTitle: { size: 20, weight: 600, letterSpacing: '0', lineHeight: 1.3 },
    cardSubtitle: { size: 15, weight: 400, letterSpacing: '0', lineHeight: 1.4 },
  },
} as const;
