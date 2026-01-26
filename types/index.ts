export * from './blocks';

// === Space Types (Multi-desktop support) ===
export interface Space {
  id: string;
  userId: string;
  name: string;
  icon: string;
  slug: string | null;
  isPrimary: boolean;
  order: number;
  backgroundUrl: string | null;
  backgroundPosition: string;
  backgroundOverlay: string | null;
  theme: string;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Populated relations
  items?: DesktopItem[];
  dockItems?: DockItem[];
  statusWidget?: StatusWidget | null;
  widgets?: Widget[];
  view?: DesktopView | null;
  workbenchEntries?: WorkbenchEntry[];
}

export interface SpaceSummary {
  id: string;
  name: string;
  icon: string;
  slug: string | null;
  isPrimary: boolean;
  isPublic: boolean;
  order: number;
  fileCount?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  image: string | null;
}

export interface Desktop {
  id: string;
  userId: string;
  backgroundUrl: string | null;
  backgroundPosition: string;
  backgroundOverlay: string | null;
  theme: string;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
  isPublic: boolean;
  items: DesktopItem[];
  dockItems: DockItem[];
  statusWidget: StatusWidget | null;
  workbenchEntries: WorkbenchEntry[];
  // goOS additions
  widgets?: Widget[];
  view?: DesktopView | null;
}

export type WindowType = 'default' | 'browser' | 'mail' | 'gallery' | 'document' | 'pages' | 'notes' | 'photos' | 'finder' | 'preview' | 'workbench';

// === goOS Primitive Types ===
export type GoOSFileType = 'note' | 'case-study' | 'folder' | 'image' | 'link' | 'embed' | 'download';
export type PublishStatus = 'draft' | 'published';
export type AccessLevel = 'free' | 'paid' | 'email';
export type EmbedType = 'youtube' | 'vimeo' | 'spotify' | 'figma' | 'loom' | 'codepen' | 'other';
export type WidgetType = 'clock' | 'book' | 'tipjar' | 'contact' | 'links' | 'feedback' | 'status' | 'sticky-note';
export type ViewMode = 'desktop' | 'page' | 'present';

// goOS Widget
export interface Widget {
  id: string;
  spaceId: string;
  widgetType: WidgetType;
  positionX: number;
  positionY: number;
  title: string | null;
  isVisible: boolean;
  config: Record<string, unknown>;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// goOS Desktop View settings
export interface DesktopView {
  id: string;
  spaceId: string;
  activeMode: ViewMode;
  pageOrder: string[];
  presentOrder: string[];
  presentAuto: boolean;
  presentDelay: number;
  createdAt: Date;
  updatedAt: Date;
}

// Status Widget types
export type StatusType = 'available' | 'looking' | 'taking' | 'open' | 'consulting';

export interface StatusWidget {
  id: string;
  spaceId: string;
  statusType: StatusType;
  title: string;
  description: string | null;
  ctaUrl: string | null;
  ctaLabel: string | null;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Workbench types
export interface WorkbenchEntry {
  id: string;
  spaceId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  context: string | null;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  order: number;
}

// Comment types
export type CommentCategory = 'general' | 'feedback' | 'question' | 'appreciation';

export interface Commenter {
  id: string;
  email: string;
  displayName: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
}

export interface Comment {
  id: string;
  itemId: string;
  commenterId: string;
  commenter: Commenter;
  content: string;
  category: CommentCategory;
  parentId: string | null;
  replies: Comment[];
  ownerReply: string | null;
  ownerRepliedAt: Date | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesktopItem {
  id: string;
  spaceId: string;
  positionX: number;
  positionY: number;
  thumbnailUrl: string;
  label: string;
  windowTitle: string;
  windowSubtitle: string | null;
  windowHeaderImage: string | null;
  windowDescription: string;
  // Window type for specialized window styles
  windowType?: WindowType;
  // Legacy fields (for backwards compatibility)
  windowDetails: DetailItem[] | null;
  windowGallery: GalleryItem[] | null;
  windowLinks: LinkItem[] | null;
  // New block system
  useTabs: boolean;
  windowWidth?: number | null;
  tabs: TabData[];
  blocks: BlockData[];
  zIndex: number;
  order: number;
  // Comments
  comments?: Comment[];
  commentsEnabled: boolean;

  // === goOS-specific fields ===
  itemVariant?: 'window' | 'goos-file';
  goosFileType?: GoOSFileType;
  goosContent?: string | null;
  publishStatus?: PublishStatus;
  publishedAt?: Date | null;
  parentItemId?: string | null;
  children?: DesktopItem[];

  // Access control
  accessLevel?: AccessLevel;
  goosPriceAmount?: number | null;
  goosPriceCurrency?: string | null;

  // Image file fields
  goosImageUrl?: string | null;
  goosImageAlt?: string | null;
  goosImageCaption?: string | null;

  // Link file fields
  goosLinkUrl?: string | null;
  goosLinkTitle?: string | null;
  goosLinkDescription?: string | null;
  goosLinkFavicon?: string | null;

  // Embed file fields
  goosEmbedUrl?: string | null;
  goosEmbedType?: EmbedType | null;

  // Download file fields
  goosDownloadUrl?: string | null;
  goosDownloadName?: string | null;
  goosDownloadSize?: number | null;
  goosDownloadType?: string | null;
}

export interface TabData {
  id: string;
  label: string;
  icon?: string | null;
  order: number;
  blocks: BlockData[];
}

export interface BlockData {
  id: string;
  type: string;
  data: Record<string, unknown>;
  order: number;
}

export interface DockItem {
  id: string;
  spaceId: string;
  icon: string;
  label: string;
  actionType: 'url' | 'email' | 'download' | 'app';
  actionValue: string;
  order: number;
}

export interface DetailItem {
  label: string;
  value: string;
}

export interface GalleryItem {
  type: 'image' | 'video';
  url: string;
}

export interface LinkItem {
  label: string;
  url: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
