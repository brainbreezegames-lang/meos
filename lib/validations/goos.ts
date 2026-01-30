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
  'cv',          // Resume/CV document
  'game',        // Interactive game (snake, etc.)
  'board',       // Kanban board
  'sheet',       // Spreadsheet
]);
export type GoOSFileType = z.infer<typeof goosFileTypeSchema>;

// === Board (Kanban) Schemas ===

export const boardCardChecklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  checked: z.boolean(),
});
export type BoardCardChecklistItem = z.infer<typeof boardCardChecklistItemSchema>;

export const boardCardColorSchema = z.enum(['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray']);
export type BoardCardColor = z.infer<typeof boardCardColorSchema>;

export const boardCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  checklist: z.array(boardCardChecklistItemSchema).optional(),
  color: boardCardColorSchema.optional(),
  order: z.number(),
});
export type BoardCard = z.infer<typeof boardCardSchema>;

export const boardColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
  cards: z.array(boardCardSchema),
  order: z.number(),
});
export type BoardColumn = z.infer<typeof boardColumnSchema>;

export const boardContentSchema = z.object({
  columns: z.array(boardColumnSchema),
});
export type BoardContent = z.infer<typeof boardContentSchema>;

// Default board content for new files
export function getDefaultBoardContent(): BoardContent {
  return {
    columns: [
      { id: crypto.randomUUID(), title: 'To Do', cards: [], order: 0 },
      { id: crypto.randomUUID(), title: 'In Progress', cards: [], order: 1 },
      { id: crypto.randomUUID(), title: 'Done', cards: [], order: 2 },
    ],
  };
}

// === Sheet (Spreadsheet) Schemas ===

export const sheetCellTypeSchema = z.enum(['text', 'number', 'currency', 'date', 'checkbox', 'formula']);
export type SheetCellType = z.infer<typeof sheetCellTypeSchema>;

export const sheetCellSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  type: sheetCellTypeSchema.optional(),
  format: z.string().optional(), // For custom formatting
  formula: z.string().optional(), // Original formula if type is formula
});
export type SheetCell = z.infer<typeof sheetCellSchema>;

export const sheetRowSchema = z.array(sheetCellSchema.nullable());
export type SheetRow = z.infer<typeof sheetRowSchema>;

export const sheetColumnMetaSchema = z.object({
  width: z.number().optional(),
  hidden: z.boolean().optional(),
});
export type SheetColumnMeta = z.infer<typeof sheetColumnMetaSchema>;

export const sheetRowMetaSchema = z.object({
  height: z.number().optional(),
  hidden: z.boolean().optional(),
});
export type SheetRowMeta = z.infer<typeof sheetRowMetaSchema>;

export const sheetContentSchema = z.object({
  data: z.array(sheetRowSchema), // 2D array of cells
  columnMeta: z.record(z.string(), sheetColumnMetaSchema).optional(), // Column index -> meta
  rowMeta: z.record(z.string(), sheetRowMetaSchema).optional(), // Row index -> meta
  frozenRows: z.number().optional(),
  frozenColumns: z.number().optional(),
});
export type SheetContent = z.infer<typeof sheetContentSchema>;

// Default sheet content for new files
export function getDefaultSheetContent(): SheetContent {
  // Create a 10x10 empty grid
  const data: SheetRow[] = Array(10).fill(null).map(() =>
    Array(10).fill(null)
  );
  return { data };
}

// === CV Schemas ===

// CV Contact Info
export const cvContactSchema = z.object({
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  tagline: z.string().max(200).optional(),
});
export type CVContact = z.infer<typeof cvContactSchema>;

// CV Experience Entry
export const cvExperienceSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().nullable(), // null = "Present"
  description: z.string().optional(), // Italic company description
  responsibilities: z.string().optional(), // Rich text
});
export type CVExperience = z.infer<typeof cvExperienceSchema>;

// CV Skill Category
export const cvSkillCategorySchema = z.object({
  id: z.string(),
  category: z.string(),
  items: z.array(z.string()),
});
export type CVSkillCategory = z.infer<typeof cvSkillCategorySchema>;

// CV Education Entry
export const cvEducationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  dates: z.string(),
});
export type CVEducation = z.infer<typeof cvEducationSchema>;

// Full CV Content Schema
export const cvContentSchema = z.object({
  name: z.string(),
  title: z.string(),
  about: z.string(), // Rich text (HTML)
  contact: cvContactSchema,
  experience: z.array(cvExperienceSchema),
  skills: z.array(cvSkillCategorySchema),
  education: z.array(cvEducationSchema),
});
export type CVContent = z.infer<typeof cvContentSchema>;

// Default CV content for new files
export function getDefaultCVContent(): CVContent {
  return {
    name: 'Your Name',
    title: 'Your Title',
    about: 'Write a brief introduction about yourself, your experience, and what you\'re passionate about.',
    contact: {
      location: 'City, Country',
      email: 'email@example.com',
    },
    experience: [{
      id: crypto.randomUUID(),
      role: 'Role Title',
      company: 'Company Name',
      location: 'Location',
      startDate: 'Month Year',
      endDate: null,
      description: 'Brief company description',
      responsibilities: 'What you did, what you achieved, what skills you used',
    }],
    skills: [{
      id: crypto.randomUUID(),
      category: 'Category',
      items: ['Skill 1', 'Skill 2', 'Skill 3'],
    }],
    education: [{
      id: crypto.randomUUID(),
      degree: 'Degree Name',
      institution: 'Institution Name',
      dates: 'Year — Year',
    }],
  };
}

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
