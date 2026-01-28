/**
 * AI Onboarding Types
 * Types for the AI-powered onboarding system
 */

export type WidgetType = 'status' | 'clock' | 'contact' | 'book' | 'tipjar' | 'links' | 'feedback';

export type FileType = 'note' | 'case-study' | 'folder' | 'image' | 'link' | 'embed' | 'download' | 'cv';

export type UserTone = 'professional' | 'casual' | 'creative' | 'minimal' | 'playful';

export type BaseTemplate = 'portfolio' | 'business' | 'writing' | 'creative' | 'personal' | 'developer' | 'agency';

export interface ParsedIntent {
  userType: string;
  baseTemplate: BaseTemplate;
  // Analysis of what the AI understood
  understanding: string;
  // Widgets with explanations
  widgets: Array<{
    type: WidgetType;
    reason: string;
  }>;
  // Folders with explanations
  folders: Array<{
    name: string;
    reason: string;
  }>;
  // Notes with explanations
  notes: Array<{
    title: string;
    type: FileType;
    reason: string;
  }>;
  statusText: string;
  tone: UserTone;
  summary: string;
}

export interface GeneratedContent {
  [noteTitle: string]: string;
}

export interface OnboardingConfig {
  intent: ParsedIntent;
  content: GeneratedContent;
}

// Build animation item - represents an item to be created with animation
export interface BuildItem {
  id: string;
  type: 'widget' | 'file';
  fileType?: FileType;
  widgetType?: WidgetType;
  title: string;
  reason?: string; // AI's explanation for why this item is being created
  content?: string;
  position: { x: number; y: number };
  parentId?: string | null;
  config?: Record<string, unknown>;
  delay: number; // Animation delay in ms
}

// Build sequence - the full sequence of items to animate
export interface BuildSequence {
  items: BuildItem[];
  totalDuration: number;
}
