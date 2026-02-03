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
  'invoice',     // Invoice document
  'slides',      // Presentation slides
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

// === Invoice Schemas ===
export const invoiceLineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
});
export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;

export const invoiceCompanyInfoSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
});
export type InvoiceCompanyInfo = z.infer<typeof invoiceCompanyInfoSchema>;

export const invoiceClientInfoSchema = z.object({
  name: z.string(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  email: z.string().optional(),
});
export type InvoiceClientInfo = z.infer<typeof invoiceClientInfoSchema>;

export const invoiceContentSchema = z.object({
  invoiceNumber: z.string(),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string().default('USD'),
  from: invoiceCompanyInfoSchema,
  to: invoiceClientInfoSchema,
  lineItems: z.array(invoiceLineItemSchema),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});
export type InvoiceContent = z.infer<typeof invoiceContentSchema>;

export function getDefaultInvoiceContent(): InvoiceContent {
  const now = new Date();
  const due = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    invoiceNumber: 'INV-001',
    issueDate: now.toISOString().split('T')[0],
    dueDate: due.toISOString().split('T')[0],
    currency: 'USD',
    from: {
      name: 'Your Company',
      address: '123 Business Street',
      city: 'City, State 12345',
      country: 'Country',
      email: 'hello@yourcompany.com',
    },
    to: {
      name: 'Client Name',
      company: 'Client Company',
      address: '456 Client Avenue',
      city: 'City, State 67890',
      email: 'client@company.com',
    },
    lineItems: [
      { id: 'li-1', description: 'Web Design — Landing Page', quantity: 1, unitPrice: 2500 },
      { id: 'li-2', description: 'Brand Identity Package', quantity: 1, unitPrice: 1500 },
      { id: 'li-3', description: 'Revision Rounds', quantity: 3, unitPrice: 200 },
    ],
    taxRate: 0,
    notes: 'Thank you for your business! Payment is due within 30 days.',
    paymentTerms: 'Net 30',
  };
}

// === Slides (Presentation) Schemas ===

export const slideTemplateSchema = z.enum([
  'title',
  'section',
  'content',
  'image',
  'image-text',
  'quote',
  'list',
  'stat',
  'end',
]);
export type SlideTemplate = z.infer<typeof slideTemplateSchema>;

export const slideContentSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  image: z.string().optional(),
  caption: z.string().optional(),
  quote: z.string().optional(),
  attribution: z.string().optional(),
  items: z.array(z.string()).optional(),
  stat_value: z.string().optional(),
  stat_label: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
});
export type SlideContentData = z.infer<typeof slideContentSchema>;

export const slideSchema = z.object({
  id: z.string(),
  template: slideTemplateSchema,
  content: slideContentSchema,
  speakerNotes: z.string().optional(),
});
export type Slide = z.infer<typeof slideSchema>;

export const slidesContentSchema = z.object({
  slides: z.array(slideSchema),
  themeId: z.string().default('paper'),
  author: z.string().optional(),
  aspectRatio: z.enum(['16:9', '4:3']).default('16:9'),
});
export type SlidesContent = z.infer<typeof slidesContentSchema>;

// Default slides content for new files - AceleraPontos Case Study
export function getDefaultSlidesContent(): SlidesContent {
  return {
    slides: [
      // 1. Hero
      {
        id: crypto.randomUUID(),
        template: 'title',
        content: {
          heading: 'Helping Brazilians Stop Losing Money on Points',
          subheading: 'AceleraPontos — A loyalty points optimization app for Brazil\'s complex rewards ecosystem',
          author: 'Product Designer',
          date: 'September 2025',
        },
        speakerNotes: 'Brazil has one of the most complex loyalty points ecosystems in the world. This project aimed to simplify it.',
      },
      // 2. Project Overview
      {
        id: crypto.randomUUID(),
        template: 'section',
        content: {
          heading: 'Project Overview',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'list',
        content: {
          heading: 'The Details',
          items: [
            'Role: Product Designer (end-to-end)',
            'Timeline: 1 month sprint',
            'Type: Loyalty Points Optimization App',
            'Tools: Figma, Whimsical',
          ],
        },
        speakerNotes: 'Tight timeline meant rapid decision-making and ruthless prioritization.',
      },
      {
        id: crypto.randomUUID(),
        template: 'content',
        content: {
          heading: 'The Context',
          body: 'Brazil has multiple credit card reward programs (Livelo, Esfera), dozens of retail shopping portals, and frequent transfer bonuses to airlines like LATAM and GOL. Maximizing the value of your points requires constant vigilance and spreadsheet-level tracking.',
        },
        speakerNotes: 'Understanding the Brazilian points ecosystem was crucial to designing an effective solution.',
      },
      // 3. Problem
      {
        id: crypto.randomUUID(),
        template: 'section',
        content: {
          heading: 'The Problem',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'stat',
        content: {
          stat_value: 'R$2,400+',
          stat_label: 'Average value lost per year by Brazilian consumers on unused or poorly-optimized points',
        },
        speakerNotes: 'This stat came from analyzing typical point accumulation rates vs. redemption patterns.',
      },
      {
        id: crypto.randomUUID(),
        template: 'content',
        content: {
          heading: 'Why Points Go to Waste',
          body: 'The system is too fragmented to navigate efficiently. Users miss time-sensitive promotions, struggle to compare rates across portals, and don\'t know when to transfer points for maximum bonus value. Current solutions—manually checking websites, calendar reminders, Telegram groups—are inefficient and error-prone.',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'quote',
        content: {
          quote: 'I know I\'m leaving money on the table, but keeping track of all these promotions feels like a part-time job.',
          attribution: 'User Research Participant, São Paulo',
        },
        speakerNotes: 'This quote perfectly captured the frustration that became our design north star.',
      },
      // 4. Goals
      {
        id: crypto.randomUUID(),
        template: 'section',
        content: {
          heading: 'Goals',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'list',
        content: {
          heading: 'User Goals',
          items: [
            'Compare earning rates across portals before purchasing',
            'Never miss high-value promotions or transfer bonuses',
            'Track wishlist items with promotion alerts',
            'Reduce research time from hours to seconds',
          ],
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'list',
        content: {
          heading: 'Business Goals',
          items: [
            'Freemium model with premium tier conversion',
            'Affiliate revenue through portal redirects',
            '3+ weekly active sessions per user',
            'Build promotion pattern dataset for predictions',
          ],
        },
      },
      // 5. Research
      {
        id: crypto.randomUUID(),
        template: 'section',
        content: {
          heading: 'Discovery & Research',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'content',
        content: {
          heading: 'Competitive Analysis',
          body: 'I analyzed existing tools in the Brazilian market: Telegram groups, spreadsheet templates, and basic aggregator sites. The gap was clear—nothing provided real-time comparison with personalized alerts. Most tools were passive; users still had to do the mental math.',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'content',
        content: {
          heading: 'User Interviews',
          body: 'Conducted 8 interviews with active points collectors. Key insight: users were more frustrated by missing promotions than by the comparison complexity itself. The anxiety of "what am I missing right now?" drove behavior more than optimization perfectionism.',
        },
      },
      // 6. Design Process
      {
        id: crypto.randomUUID(),
        template: 'section',
        content: {
          heading: 'Design Process',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'content',
        content: {
          heading: 'Information Architecture',
          body: 'Structured the app around three core jobs: Compare (before purchase), Alert (time-sensitive opportunities), and Track (wishlist + portfolio). Each maps to a primary navigation destination, minimizing cognitive load.',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'image-text',
        content: {
          heading: 'Key Design Decision',
          body: 'The "Compare" feature surfaces the best earning rate immediately, with a single tap to redirect. We removed all friction between decision and action—users shouldn\'t have to think about which portal to open.',
          image: '',
        },
        speakerNotes: 'Add screenshot of the comparison interface here.',
      },
      {
        id: crypto.randomUUID(),
        template: 'content',
        content: {
          heading: 'Notification Strategy',
          body: 'Alerts are the core value proposition. We designed a smart notification system that learns user preferences and only surfaces high-value opportunities. Default: notify on 50%+ bonus transfers and promotions matching wishlist items.',
        },
      },
      // 7. Final Design
      {
        id: crypto.randomUUID(),
        template: 'section',
        content: {
          heading: 'Final Design',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'image',
        content: {
          image: '',
          caption: 'Home dashboard showing active promotions and personalized recommendations',
        },
        speakerNotes: 'Add final UI mockup here.',
      },
      {
        id: crypto.randomUUID(),
        template: 'list',
        content: {
          heading: 'Core Features',
          items: [
            'Real-time portal rate comparison',
            'Smart promotion alerts with personalization',
            'Wishlist tracking with price-drop notifications',
            'Transfer bonus calendar with countdown timers',
          ],
        },
      },
      // 8. Impact
      {
        id: crypto.randomUUID(),
        template: 'section',
        content: {
          heading: 'Impact & Results',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'stat',
        content: {
          stat_value: '4.2s',
          stat_label: 'Average time to find best earning rate (down from 15+ minutes of manual research)',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'content',
        content: {
          heading: 'Usability Testing Results',
          body: 'Task completion rate of 94% for "find the best portal for this purchase." Users particularly praised the notification preview system—being able to see exactly what alerts they\'d receive before enabling them reduced notification fatigue anxiety.',
        },
      },
      // 9. Learnings
      {
        id: crypto.randomUUID(),
        template: 'section',
        content: {
          heading: 'Learnings',
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'list',
        content: {
          heading: 'Key Takeaways',
          items: [
            'Tight timelines force prioritization—cut features that don\'t serve the core job',
            'Anxiety ("what am I missing?") is a stronger motivator than optimization',
            'Notification design is UX design—poorly timed alerts destroy trust',
            'Domain expertise matters—spent first week just learning the points ecosystem',
          ],
        },
      },
      {
        id: crypto.randomUUID(),
        template: 'content',
        content: {
          heading: 'What I\'d Do Differently',
          body: 'With more time, I would have conducted a diary study to understand real purchasing patterns over weeks, not just recalled behavior. The promotion calendar feature was designed on assumptions that could have been validated with longitudinal data.',
        },
      },
      // End
      {
        id: crypto.randomUUID(),
        template: 'end',
        content: {
          url: 'acelerapontos.com.br',
        },
      },
    ],
    themeId: 'paper',
    aspectRatio: '16:9',
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
  'status',
  'sticky-note',
  'pomodoro',
  'habits',
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
