import { z } from 'zod';

// File types - goOS primitives
export const goosFileTypeSchema = z.enum([
  'note',        // Rich text content (TipTap)
  'case-study',  // Structured document
  'folder',      // Container for files
  'image',       // Single image with lightbox
  'link',        // External URL with favicon
  'embed',       // YouTube, Vimeo, Spotify, Figma, etc.
  'download',    // Downloadable file
]);
export type GoOSFileType = z.infer<typeof goosFileTypeSchema>;

// Publish status
export const publishStatusSchema = z.enum(['draft', 'published']);
export type PublishStatus = z.infer<typeof publishStatusSchema>;

// Access level - goOS primitives
export const accessLevelSchema = z.enum(['free', 'paid', 'email']);
export type AccessLevel = z.infer<typeof accessLevelSchema>;

// Embed types supported
export const embedTypeSchema = z.enum([
  'youtube',
  'vimeo',
  'spotify',
  'figma',
  'loom',
  'codepen',
  'other',
]);
export type EmbedType = z.infer<typeof embedTypeSchema>;

// Widget types
export const widgetTypeSchema = z.enum([
  'clock',
  'book',
  'tipjar',
  'contact',
  'links',
  'feedback',
]);
export type WidgetType = z.infer<typeof widgetTypeSchema>;

// View modes
export const viewModeSchema = z.enum(['desktop', 'page', 'present']);
export type ViewMode = z.infer<typeof viewModeSchema>;

// Position schema
export const positionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

// Create file schema - supports all goOS file types
export const createGoOSFileSchema = z.object({
  type: goosFileTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  parentId: z.string().nullable().optional(),
  position: positionSchema,
  // For note/case-study
  content: z.string().max(500000, 'Content too large').optional().default(''),
  // For image
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().max(500).optional(),
  imageCaption: z.string().max(1000).optional(),
  // For link
  linkUrl: z.string().url().optional(),
  linkTitle: z.string().max(200).optional(),
  linkDescription: z.string().max(500).optional(),
  // For embed
  embedUrl: z.string().url().optional(),
  embedType: embedTypeSchema.optional(),
  // For download
  downloadUrl: z.string().url().optional(),
  downloadName: z.string().max(255).optional(),
  downloadSize: z.number().int().positive().optional(),
  downloadType: z.string().max(50).optional(),
  // Access control
  accessLevel: accessLevelSchema.optional().default('free'),
  priceAmount: z.number().positive().optional(),
  priceCurrency: z.string().length(3).optional().default('USD'),
});

export type CreateGoOSFileInput = z.infer<typeof createGoOSFileSchema>;

// Update file schema - supports all goOS file types
export const updateGoOSFileSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(500000).optional(),
  position: positionSchema.optional(),
  parentId: z.string().nullable().optional(),
  // Image fields
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().max(500).optional(),
  imageCaption: z.string().max(1000).optional(),
  // Link fields
  linkUrl: z.string().url().optional(),
  linkTitle: z.string().max(200).optional(),
  linkDescription: z.string().max(500).optional(),
  // Embed fields
  embedUrl: z.string().url().optional(),
  embedType: embedTypeSchema.optional(),
  // Download fields
  downloadUrl: z.string().url().optional(),
  downloadName: z.string().max(255).optional(),
  downloadSize: z.number().int().positive().optional(),
  downloadType: z.string().max(50).optional(),
  // Access control
  accessLevel: accessLevelSchema.optional(),
  priceAmount: z.number().positive().nullable().optional(),
  priceCurrency: z.string().length(3).optional(),
});

export type UpdateGoOSFileInput = z.infer<typeof updateGoOSFileSchema>;

// Auto-save schema (optimized for frequent updates)
export const autoSaveSchema = z.object({
  id: z.string().min(1, 'File ID is required'),
  content: z.string().max(500000, 'Content too large'),
  title: z.string().min(1).max(200).optional(),
});

export type AutoSaveInput = z.infer<typeof autoSaveSchema>;

// Batch operations schema
export const batchOperationSchema = z.object({
  operation: z.enum(['move', 'delete', 'publish', 'unpublish']),
  ids: z.array(z.string()).min(1, 'At least one ID required').max(50, 'Too many items'),
  targetParentId: z.string().nullable().optional(), // For move operation
});

export type BatchOperationInput = z.infer<typeof batchOperationSchema>;

// Query params for listing files
export const listFilesQuerySchema = z.object({
  parentId: z.string().nullable().optional(), // null = root, undefined = all, string = specific folder
  includeChildren: z.coerce.boolean().optional().default(false),
});

export type ListFilesQuery = z.infer<typeof listFilesQuerySchema>;

// Response schemas (for type safety in API responses)
export const goosFileSchema = z.object({
  id: z.string(),
  type: goosFileTypeSchema,
  title: z.string(),
  content: z.string(),
  status: publishStatusSchema,
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  parentId: z.string().nullable(),
  position: positionSchema,
  childCount: z.number().optional(), // For folders
});

export type GoOSFile = z.infer<typeof goosFileSchema>;

// API response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  });

// === Widget Schemas ===

// Widget config schemas by type
export const clockWidgetConfigSchema = z.object({
  timezone: z.string().default('America/New_York'),
  showTimezoneName: z.boolean().default(true),
  format: z.enum(['12h', '24h']).default('12h'),
});

export const bookWidgetConfigSchema = z.object({
  url: z.string().url(),
  buttonText: z.string().max(50).default('Book a Call'),
});

export const tipjarWidgetConfigSchema = z.object({
  amounts: z.array(z.number().positive()).default([5, 10, 25]),
  customAmount: z.boolean().default(true),
  message: z.string().max(200).default('Buy me a coffee'),
});

export const contactWidgetConfigSchema = z.object({
  fields: z.array(z.enum(['name', 'email', 'message'])).default(['name', 'email', 'message']),
  emailTo: z.string().email(),
  successMessage: z.string().max(200).default('Thanks for reaching out!'),
});

export const linksWidgetConfigSchema = z.object({
  links: z.array(z.object({
    name: z.string().max(50),
    url: z.string().url(),
    icon: z.string().optional(),
  })).default([]),
});

export const feedbackWidgetConfigSchema = z.object({
  prompt: z.string().max(200).default('How can I improve?'),
  anonymous: z.boolean().default(true),
});

// Create widget schema
export const createWidgetSchema = z.object({
  type: widgetTypeSchema,
  position: positionSchema,
  title: z.string().max(100).optional(),
  config: z.record(z.unknown()).default({}),
});

export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;

// Update widget schema
export const updateWidgetSchema = z.object({
  position: positionSchema.optional(),
  title: z.string().max(100).optional(),
  isVisible: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
});

export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;

// === View Schemas ===

// Update view settings schema
export const updateViewSchema = z.object({
  activeMode: viewModeSchema.optional(),
  pageOrder: z.array(z.string()).optional(),
  presentOrder: z.array(z.string()).optional(),
  presentAuto: z.boolean().optional(),
  presentDelay: z.number().int().min(1000).max(30000).optional(),
});

export type UpdateViewInput = z.infer<typeof updateViewSchema>;
