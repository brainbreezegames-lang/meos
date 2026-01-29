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
  | 'section-label'    // H4 → uppercase muted label
  | 'heading-1'        // H1 main heading
  | 'heading-2'        // H2 section heading
  | 'heading-3'        // H3 sub-heading
  | 'paragraph'        // Body text
  | 'image'            // Single image
  | 'image-grid'       // Multiple consecutive images
  | 'quote'            // Blockquote
  | 'list'             // UL/OL
  | 'code'             // Code block
  | 'divider'          // HR
  | 'info-grid'        // Project metadata grid (timeline, tools, role, etc.)
  | 'callout'          // Highlighted insight or key finding
  | 'card-grid'        // Stakeholder/feature cards in a grid
  | 'process-stepper'  // Numbered process steps timeline
  | 'key-takeaway'     // Key learning summary block
  | 'tool-badges'      // Row of tool/technology badges
  | 'comparison';      // Before/after side-by-side comparison

// Image data with layout hint
export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  layout: 'full-width' | 'content-width';
}

// Info grid item (for project metadata)
export interface InfoGridItem {
  label: string;
  value: string;
}

// Card grid item (for stakeholders, features, etc.)
export interface CardGridItem {
  icon?: string;     // Emoji or icon name
  title: string;
  description: string;
}

// Process stepper item (numbered design phases)
export interface ProcessStepperItem {
  number: number;
  label: string;
  description?: string;
}

// Before/after comparison data
export interface ComparisonData {
  beforeLabel: string;
  beforeContent: string;
  afterLabel: string;
  afterContent: string;
}

// A single content block in the parsed case study
export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string | string[] | ImageData | ImageData[] | InfoGridItem[] | CardGridItem[] | ProcessStepperItem[] | ComparisonData;
  isLead?: boolean;        // First paragraph after title (larger text)
  sectionId?: string;      // ID for scroll anchoring (H2 blocks)
  level?: 1 | 2 | 3;       // Heading level
  listType?: 'ul' | 'ol';  // For list blocks
  variant?: 'insight' | 'warning' | 'success'; // For callout styling
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

// Design tokens for the case study theme (Brand Appart-inspired bold style)
// These are light mode defaults - dark mode uses CSS variables
export const caseStudyTokens = {
  colors: {
    // Use CSS variables to support dark mode
    background: 'var(--cs-background, #fcfbf8)',
    surface: 'var(--cs-surface, #ffffff)',
    surfaceAlt: 'var(--cs-surface-alt, #f5f3e8)',
    // Text colors - rich blacks and warm grays
    text: 'var(--cs-text, #1a1a1a)',
    textMuted: 'var(--cs-text-muted, #6b6b6b)',
    textLight: 'var(--cs-text-light, #999999)',
    // Accent colors - bold and vibrant
    accent: 'var(--cs-accent, #1e52f1)',        // Warm orange
    accentAlt: 'var(--cs-accent-alt, #3d2fa9)', // Deep purple
    // Borders
    border: 'var(--cs-border, rgba(0, 0, 0, 0.08))',
    borderLight: 'var(--cs-border-light, rgba(0, 0, 0, 0.04))',
    // Hero
    hero: 'var(--cs-hero, #1a1410)',
    heroText: 'var(--cs-hero-text, #ffffff)',
    // Watermark text (very faded)
    watermark: 'var(--cs-watermark, rgba(0, 0, 0, 0.06))',
  },
  fonts: {
    // Warm serif for headings
    display: 'var(--font-display)',
    // Clean sans-serif for body
    body: 'var(--font-body)',
    ui: 'var(--font-body)',
  },
  spacing: {
    sectionGap: 80,
    paragraphGap: 28,
    contentMaxWidth: 720,
    sidebarWidth: 64,         // Narrower for icon-only
    sidebarLeft: 32,
    contentPadding: 32,
  },
  typography: {
    // Hero title - massive chunky headline
    heroTitle: { size: 96, weight: 700, letterSpacing: '-0.04em', lineHeight: 0.95 },
    // Main heading - bold and tight
    title: { size: 64, weight: 700, letterSpacing: '-0.03em', lineHeight: 1.0 },
    // Section headings - chunky
    h1: { size: 48, weight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 },
    h2: { size: 40, weight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 },
    h3: { size: 28, weight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 },
    // Section label (uppercase, wide letter-spacing)
    sectionLabel: { size: 11, weight: 600, letterSpacing: '0.12em', lineHeight: 1.5 },
    // Body text - comfortable reading
    lead: { size: 22, weight: 400, letterSpacing: '-0.01em', lineHeight: 1.65 },
    body: { size: 18, weight: 400, letterSpacing: '-0.005em', lineHeight: 1.7 },
    // Meta info
    metaName: { size: 16, weight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
    metaTags: { size: 13, weight: 500, letterSpacing: '0.02em', lineHeight: 1.4 },
    // Sidebar
    sidebar: { size: 12, weight: 500, letterSpacing: '0', lineHeight: 1.4 },
    sidebarActive: { size: 12, weight: 600, letterSpacing: '0', lineHeight: 1.4 },
    // Cards
    cardTitle: { size: 24, weight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 },
    cardSubtitle: { size: 15, weight: 400, letterSpacing: '0', lineHeight: 1.5 },
  },
} as const;
