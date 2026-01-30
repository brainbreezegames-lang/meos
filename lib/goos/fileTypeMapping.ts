import type { GoOSFileType, WindowType, EmbedType } from '@/types';

/**
 * Maps goOS file types to their corresponding window components.
 * This allows the existing window system to render goOS files appropriately.
 */
export const FILE_TYPE_TO_WINDOW: Record<GoOSFileType, WindowType> = {
  'note': 'notes',        // NotesWindow - TipTap rich text
  'case-study': 'pages',  // PagesWindow - structured document
  'folder': 'finder',     // FinderWindow - file browser
  'image': 'photos',      // PhotosWindow - single image mode
  'link': 'browser',      // BrowserWindow - URL preview
  'embed': 'default',     // MultiWindow - embed block
  'download': 'default',  // MultiWindow - download block
  'cv': 'document',       // CV/Resume document
  'game': 'default',      // Interactive game
  'board': 'board',       // Kanban board
  'sheet': 'sheet',       // Spreadsheet
  'invoice': 'document',  // Invoice document
};

/**
 * Get the appropriate window type for a goOS file type.
 */
export function getWindowTypeForFile(fileType: GoOSFileType): WindowType {
  return FILE_TYPE_TO_WINDOW[fileType] || 'default';
}

/**
 * Icon mappings for each file type (emoji or lucide icon name)
 */
export const FILE_TYPE_ICONS: Record<GoOSFileType, string> = {
  'note': '📝',
  'case-study': '📄',
  'folder': '📁',
  'image': '🖼️',
  'link': '🔗',
  'embed': '▶️',
  'download': '📥',
  'cv': '📋',
  'game': '🎮',
  'board': '📋',
  'sheet': '📊',
  'invoice': '🧾',
};

/**
 * Human-readable labels for file types
 */
export const FILE_TYPE_LABELS: Record<GoOSFileType, string> = {
  'note': 'Note',
  'case-study': 'Case Study',
  'folder': 'Folder',
  'image': 'Image',
  'link': 'Link',
  'embed': 'Embed',
  'download': 'Download',
  'cv': 'CV',
  'game': 'Game',
  'board': 'Board',
  'sheet': 'Sheet',
  'invoice': 'Invoice',
};

/**
 * Embed platform configurations
 */
export const EMBED_PLATFORMS: Record<EmbedType, {
  label: string;
  icon: string;
  urlPatterns: RegExp[];
  getEmbedUrl: (url: string) => string | null;
}> = {
  youtube: {
    label: 'YouTube',
    icon: '▶️',
    urlPatterns: [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    ],
    getEmbedUrl: (url: string) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    },
  },
  vimeo: {
    label: 'Vimeo',
    icon: '🎬',
    urlPatterns: [/vimeo\.com\/(\d+)/],
    getEmbedUrl: (url: string) => {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : null;
    },
  },
  spotify: {
    label: 'Spotify',
    icon: '🎵',
    urlPatterns: [
      /open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/,
    ],
    getEmbedUrl: (url: string) => {
      const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
      return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null;
    },
  },
  figma: {
    label: 'Figma',
    icon: '🎨',
    urlPatterns: [/figma\.com\/(file|proto)\/([a-zA-Z0-9]+)/],
    getEmbedUrl: (url: string) => {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    },
  },
  loom: {
    label: 'Loom',
    icon: '📹',
    urlPatterns: [/loom\.com\/share\/([a-zA-Z0-9]+)/],
    getEmbedUrl: (url: string) => {
      const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
      return match ? `https://www.loom.com/embed/${match[1]}` : null;
    },
  },
  codepen: {
    label: 'CodePen',
    icon: '💻',
    urlPatterns: [/codepen\.io\/([^\/]+)\/pen\/([a-zA-Z0-9]+)/],
    getEmbedUrl: (url: string) => {
      const match = url.match(/codepen\.io\/([^\/]+)\/pen\/([a-zA-Z0-9]+)/);
      return match ? `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result` : null;
    },
  },
  other: {
    label: 'Embed',
    icon: '🔗',
    urlPatterns: [],
    getEmbedUrl: (url: string) => url,
  },
};

/**
 * Detect embed type from URL
 */
export function detectEmbedType(url: string): EmbedType {
  for (const [type, config] of Object.entries(EMBED_PLATFORMS)) {
    if (type === 'other') continue;
    for (const pattern of config.urlPatterns) {
      if (pattern.test(url)) {
        return type as EmbedType;
      }
    }
  }
  return 'other';
}

/**
 * Get embed URL for a given platform URL
 */
export function getEmbedUrl(url: string, type?: EmbedType): string | null {
  const embedType = type || detectEmbedType(url);
  const platform = EMBED_PLATFORMS[embedType];
  return platform.getEmbedUrl(url);
}

/**
 * Download file type mappings
 */
export const DOWNLOAD_FILE_TYPES: Record<string, {
  icon: string;
  label: string;
  color: string;
}> = {
  pdf: { icon: '📕', label: 'PDF', color: '#E53935' },
  zip: { icon: '📦', label: 'ZIP', color: '#FFB300' },
  doc: { icon: '📘', label: 'Word', color: '#2196F3' },
  docx: { icon: '📘', label: 'Word', color: '#2196F3' },
  xls: { icon: '📗', label: 'Excel', color: '#4CAF50' },
  xlsx: { icon: '📗', label: 'Excel', color: '#4CAF50' },
  ppt: { icon: '📙', label: 'PowerPoint', color: '#FF5722' },
  pptx: { icon: '📙', label: 'PowerPoint', color: '#FF5722' },
  psd: { icon: '🎨', label: 'Photoshop', color: '#31A8FF' },
  ai: { icon: '✏️', label: 'Illustrator', color: '#FF9A00' },
  sketch: { icon: '💎', label: 'Sketch', color: '#F7B500' },
  fig: { icon: '🎨', label: 'Figma', color: '#A259FF' },
  mp3: { icon: '🎵', label: 'Audio', color: '#9C27B0' },
  mp4: { icon: '🎬', label: 'Video', color: '#673AB7' },
  mov: { icon: '🎬', label: 'Video', color: '#673AB7' },
  png: { icon: '🖼️', label: 'Image', color: '#00BCD4' },
  jpg: { icon: '🖼️', label: 'Image', color: '#00BCD4' },
  jpeg: { icon: '🖼️', label: 'Image', color: '#00BCD4' },
  gif: { icon: '🖼️', label: 'GIF', color: '#00BCD4' },
  svg: { icon: '🎯', label: 'SVG', color: '#FF5722' },
  default: { icon: '📄', label: 'File', color: '#607D8B' },
};

/**
 * Get download file metadata from extension
 */
export function getDownloadFileInfo(fileName: string): {
  icon: string;
  label: string;
  color: string;
  extension: string;
} {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const info = DOWNLOAD_FILE_TYPES[extension] || DOWNLOAD_FILE_TYPES.default;
  return { ...info, extension };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
