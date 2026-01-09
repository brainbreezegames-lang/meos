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
}

export interface DesktopItem {
  id: string;
  desktopId: string;
  positionX: number;
  positionY: number;
  thumbnailUrl: string;
  label: string;
  windowTitle: string;
  windowSubtitle: string | null;
  windowHeaderImage: string | null;
  windowDescription: string;
  windowDetails: DetailItem[] | null;
  windowGallery: GalleryItem[] | null;
  windowLinks: LinkItem[] | null;
  zIndex: number;
  order: number;
}

export interface DockItem {
  id: string;
  desktopId: string;
  icon: string;
  label: string;
  actionType: 'url' | 'email' | 'download';
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
