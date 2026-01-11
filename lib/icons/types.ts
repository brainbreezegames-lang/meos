// MeOS Icon System - Type Definitions

export type IconContext =
  | 'desktop'    // 64×64 display, 512 master
  | 'dock'       // 48×48 display, 256 master
  | 'window'     // 16×16 display, 128 master
  | 'mobile'     // iOS style, 1024 master
  | 'favicon'    // Browser, 512 master
  | 'logo';      // Menu bar, SVG preferred

export type IconFormat = 'png' | 'svg' | 'webp';

export interface IconSizeConfig {
  master: number;
  display: number;
  generated: number[];
  maxFileSize: number; // bytes
}

export const ICON_SIZES: Record<IconContext, IconSizeConfig> = {
  desktop: {
    master: 512,
    display: 64,
    generated: [64, 128, 192, 256, 512],
    maxFileSize: 200 * 1024,
  },
  dock: {
    master: 256,
    display: 48,
    generated: [48, 96, 144, 192],
    maxFileSize: 100 * 1024,
  },
  window: {
    master: 128,
    display: 16,
    generated: [16, 32, 48, 64],
    maxFileSize: 50 * 1024,
  },
  mobile: {
    master: 1024,
    display: 60,
    generated: [60, 120, 180, 512, 1024],
    maxFileSize: 500 * 1024,
  },
  favicon: {
    master: 512,
    display: 32,
    generated: [16, 32, 48, 180, 192, 512],
    maxFileSize: 100 * 1024,
  },
  logo: {
    master: 256,
    display: 24,
    generated: [24, 48, 96],
    maxFileSize: 100 * 1024,
  },
};

export interface IconRecord {
  id: string;
  ownerId: string;
  ownerType: 'system' | 'user';
  context: IconContext;
  referenceType: 'landing-item' | 'desktop-item' | 'desktop' | 'user';
  referenceId: string;
  originalUrl: string;
  originalFormat: IconFormat;
  originalSize: number;
  originalDimensions: { width: number; height: number };
  variants: IconVariant[];
  createdAt: Date;
  updatedAt: Date;
  processingStatus: 'pending' | 'processing' | 'complete' | 'failed';
}

export interface IconVariant {
  size: number;
  pngUrl: string;
  webpUrl: string;
  fileSize: number;
}

export interface IconValidation {
  valid: boolean;
  error?: string;
}

// Landing page icon identifiers
export type LandingIconId =
  | 'welcome'
  | 'features'
  | 'examples'
  | 'pricing'
  | 'faq'
  | 'reviews'
  | 'how-it-works'
  | 'mobile'
  | 'finder'
  | 'safari'
  | 'mail'
  | 'photos'
  | 'messages'
  | 'notes'
  | 'calendar'
  | 'settings';
