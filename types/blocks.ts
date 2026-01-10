// Block System Type Definitions

// Base block structure
export interface BaseBlock {
  id: string;
  type: string;
  order: number;
}

// ============================================
// TEXT & BASIC BLOCKS
// ============================================

export interface TextBlock extends BaseBlock {
  type: 'text';
  data: {
    content: string; // Markdown or plain text
  };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  data: {
    text: string;
    level: 1 | 2 | 3;
  };
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  data: {
    style?: 'line' | 'dots' | 'space';
  };
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  data: {
    text: string;
    attribution?: string;
    source?: string;
    style: 'simple' | 'large' | 'testimonial';
  };
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  data: {
    icon?: string;
    text: string;
    style?: 'info' | 'warning' | 'success' | 'note';
  };
}

// ============================================
// DATA & STATS BLOCKS
// ============================================

export interface DetailsBlock extends BaseBlock {
  type: 'details';
  data: {
    items: Array<{
      label: string;
      value: string;
      color?: string;
    }>;
  };
}

export interface StatsBlock extends BaseBlock {
  type: 'stats';
  data: {
    items: Array<{
      value: string;
      label: string;
      prefix?: string;
      suffix?: string;
    }>;
  };
}

export interface TimelineBlock extends BaseBlock {
  type: 'timeline';
  data: {
    items: Array<{
      date: string;
      title: string;
      subtitle?: string;
      description?: string;
    }>;
  };
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  data: {
    style: 'bullet' | 'numbered' | 'check';
    items: string[];
  };
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  data: {
    headers: string[];
    rows: string[][];
  };
}

// ============================================
// MEDIA BLOCKS
// ============================================

export interface ImageBlock extends BaseBlock {
  type: 'image';
  data: {
    url: string;
    caption?: string;
    alt?: string;
    aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  };
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  data: {
    columns: 2 | 3 | 4;
    images: Array<{
      url: string;
      caption?: string;
      alt?: string;
    }>;
    expandable: boolean;
  };
}

export interface CarouselBlock extends BaseBlock {
  type: 'carousel';
  data: {
    images: Array<{
      url: string;
      caption?: string;
    }>;
  };
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  data: {
    url: string;
    embedType?: 'youtube' | 'vimeo' | 'direct';
    aspectRatio?: '16:9' | '4:3' | '1:1';
  };
}

export interface AudioBlock extends BaseBlock {
  type: 'audio';
  data: {
    url: string;
    embedType?: 'spotify' | 'soundcloud' | 'direct';
    title?: string;
  };
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  data: {
    embedType: 'figma' | 'youtube' | 'vimeo' | 'spotify' | 'soundcloud' | 'codepen' | 'twitter' | 'instagram' | 'custom';
    url: string;
    aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
    height?: number;
  };
}

// ============================================
// LINKS & ACTIONS BLOCKS
// ============================================

export interface ButtonsBlock extends BaseBlock {
  type: 'buttons';
  data: {
    buttons: Array<{
      label: string;
      url: string;
      style: 'primary' | 'secondary' | 'ghost';
      icon?: string;
      newTab?: boolean;
    }>;
  };
}

export interface LinksBlock extends BaseBlock {
  type: 'links';
  data: {
    links: Array<{
      title: string;
      url: string;
      description?: string;
    }>;
  };
}

export interface DownloadBlock extends BaseBlock {
  type: 'download';
  data: {
    url: string;
    fileName: string;
    fileSize?: string;
    fileType?: string;
  };
}

export interface SocialBlock extends BaseBlock {
  type: 'social';
  data: {
    profiles: Array<{
      platform: 'twitter' | 'linkedin' | 'github' | 'instagram' | 'dribbble' | 'behance' | 'youtube' | 'tiktok' | 'facebook' | 'email' | 'website';
      url: string;
    }>;
  };
}

// ============================================
// SPECIALIZED BLOCKS
// ============================================

export interface CaseStudyBlock extends BaseBlock {
  type: 'case-study';
  data: {
    sections: {
      challenge?: string;
      approach?: string;
      solution?: string;
      result?: string;
      metrics?: Array<{ label: string; value: string }>;
    };
  };
}

export interface BeforeAfterBlock extends BaseBlock {
  type: 'before-after';
  data: {
    before: {
      image: string;
      label?: string;
    };
    after: {
      image: string;
      label?: string;
    };
    style: 'slider' | 'side-by-side' | 'stacked';
  };
}

export interface LogosBlock extends BaseBlock {
  type: 'logos';
  data: {
    title?: string;
    logos: Array<{
      image: string;
      name: string;
      url?: string;
    }>;
    style: 'grid' | 'row';
    grayscale?: boolean;
  };
}

export interface TestimonialBlock extends BaseBlock {
  type: 'testimonial';
  data: {
    testimonials: Array<{
      quote: string;
      name: string;
      title?: string;
      image?: string;
      company?: string;
      companyLogo?: string;
    }>;
    style: 'cards' | 'simple' | 'carousel';
  };
}

export interface ProductBlock extends BaseBlock {
  type: 'product';
  data: {
    products: Array<{
      image: string;
      name: string;
      description: string;
      url: string;
      status?: 'active' | 'acquired' | 'shutdown';
      metrics?: string;
    }>;
  };
}

export interface BookBlock extends BaseBlock {
  type: 'book';
  data: {
    books: Array<{
      cover: string;
      title: string;
      subtitle?: string;
      description?: string;
      buyUrl?: string;
      amazonUrl?: string;
      year?: string;
    }>;
  };
}

export interface AwardBlock extends BaseBlock {
  type: 'award';
  data: {
    awards: Array<{
      badge?: string;
      name: string;
      issuer?: string;
      year?: string;
      description?: string;
    }>;
  };
}

export interface PressBlock extends BaseBlock {
  type: 'press';
  data: {
    mentions: Array<{
      publication: string;
      logo?: string;
      headline: string;
      url: string;
      date?: string;
    }>;
  };
}

// ============================================
// UNION TYPE FOR ALL BLOCKS
// ============================================

export type ContentBlock =
  | TextBlock
  | HeadingBlock
  | DividerBlock
  | QuoteBlock
  | CalloutBlock
  | DetailsBlock
  | StatsBlock
  | TimelineBlock
  | ListBlock
  | TableBlock
  | ImageBlock
  | GalleryBlock
  | CarouselBlock
  | VideoBlock
  | AudioBlock
  | EmbedBlock
  | ButtonsBlock
  | LinksBlock
  | DownloadBlock
  | SocialBlock
  | CaseStudyBlock
  | BeforeAfterBlock
  | LogosBlock
  | TestimonialBlock
  | ProductBlock
  | BookBlock
  | AwardBlock
  | PressBlock;

export type BlockType = ContentBlock['type'];

// ============================================
// TAB STRUCTURE
// ============================================

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  order: number;
  blocks: ContentBlock[];
}

// ============================================
// BLOCK CATEGORY DEFINITIONS (for editor UI)
// ============================================

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  category: 'text' | 'data' | 'media' | 'links' | 'specialized';
  defaultData: Record<string, unknown>;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  // Text & Basic
  { type: 'text', label: 'Text', description: 'Rich text paragraph', icon: 'T', category: 'text', defaultData: { content: '' } },
  { type: 'heading', label: 'Heading', description: 'Section header', icon: 'H', category: 'text', defaultData: { text: '', level: 2 } },
  { type: 'divider', label: 'Divider', description: 'Visual separator', icon: '—', category: 'text', defaultData: { style: 'line' } },
  { type: 'quote', label: 'Quote', description: 'Styled quote', icon: '"', category: 'text', defaultData: { text: '', style: 'simple' } },
  { type: 'callout', label: 'Callout', description: 'Highlighted box', icon: '!', category: 'text', defaultData: { text: '', style: 'info' } },

  // Data & Stats
  { type: 'details', label: 'Details', description: 'Key-value pairs', icon: '•', category: 'data', defaultData: { items: [] } },
  { type: 'stats', label: 'Stats', description: 'Big numbers with labels', icon: '#', category: 'data', defaultData: { items: [] } },
  { type: 'timeline', label: 'Timeline', description: 'Vertical timeline', icon: '|', category: 'data', defaultData: { items: [] } },
  { type: 'list', label: 'List', description: 'Bullet or numbered list', icon: '≡', category: 'data', defaultData: { style: 'bullet', items: [] } },
  { type: 'table', label: 'Table', description: 'Data table', icon: '⊞', category: 'data', defaultData: { headers: [], rows: [] } },

  // Media
  { type: 'image', label: 'Image', description: 'Single image', icon: '🖼', category: 'media', defaultData: { url: '' } },
  { type: 'gallery', label: 'Gallery', description: 'Image grid', icon: '⊞', category: 'media', defaultData: { columns: 2, images: [], expandable: true } },
  { type: 'carousel', label: 'Carousel', description: 'Swipeable images', icon: '↔', category: 'media', defaultData: { images: [] } },
  { type: 'video', label: 'Video', description: 'Embedded video', icon: '▶', category: 'media', defaultData: { url: '' } },
  { type: 'audio', label: 'Audio', description: 'Audio player', icon: '♪', category: 'media', defaultData: { url: '' } },
  { type: 'embed', label: 'Embed', description: 'iFrame embed', icon: '</>', category: 'media', defaultData: { embedType: 'custom', url: '' } },

  // Links & Actions
  { type: 'buttons', label: 'Buttons', description: 'Action buttons', icon: '▢', category: 'links', defaultData: { buttons: [] } },
  { type: 'links', label: 'Links', description: 'Link list', icon: '🔗', category: 'links', defaultData: { links: [] } },
  { type: 'download', label: 'Download', description: 'File download', icon: '↓', category: 'links', defaultData: { url: '', fileName: '' } },
  { type: 'social', label: 'Social', description: 'Social icons', icon: '@', category: 'links', defaultData: { profiles: [] } },

  // Specialized
  { type: 'case-study', label: 'Case Study', description: 'Challenge → Approach → Result', icon: '📋', category: 'specialized', defaultData: { sections: {} } },
  { type: 'before-after', label: 'Before/After', description: 'Comparison view', icon: '↔', category: 'specialized', defaultData: { before: { image: '' }, after: { image: '' }, style: 'side-by-side' } },
  { type: 'logos', label: 'Logos', description: 'Logo grid', icon: '◇', category: 'specialized', defaultData: { logos: [], style: 'grid' } },
  { type: 'testimonial', label: 'Testimonial', description: 'Quote with attribution', icon: '💬', category: 'specialized', defaultData: { testimonials: [], style: 'simple' } },
  { type: 'product', label: 'Product', description: 'Product card', icon: '📦', category: 'specialized', defaultData: { products: [] } },
  { type: 'book', label: 'Book', description: 'Book display', icon: '📚', category: 'specialized', defaultData: { books: [] } },
  { type: 'award', label: 'Award', description: 'Achievement display', icon: '🏆', category: 'specialized', defaultData: { awards: [] } },
  { type: 'press', label: 'Press', description: 'Press mentions', icon: '📰', category: 'specialized', defaultData: { mentions: [] } },
];

export const BLOCK_CATEGORIES = [
  { id: 'text', label: 'Text & Basic', icon: '📝' },
  { id: 'data', label: 'Data & Stats', icon: '📊' },
  { id: 'media', label: 'Media', icon: '🖼' },
  { id: 'links', label: 'Links & Actions', icon: '🔗' },
  { id: 'specialized', label: 'Specialized', icon: '⭐' },
] as const;
