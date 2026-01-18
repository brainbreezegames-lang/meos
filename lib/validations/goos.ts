import { z } from 'zod';

// File types
export const goosFileTypeSchema = z.enum(['note', 'case-study', 'folder']);
export type GoOSFileType = z.infer<typeof goosFileTypeSchema>;

// Publish status
export const publishStatusSchema = z.enum(['draft', 'published']);
export type PublishStatus = z.infer<typeof publishStatusSchema>;

// Access level (for future Phase 3)
export const accessLevelSchema = z.enum(['public', 'locked']);
export type AccessLevel = z.infer<typeof accessLevelSchema>;

// Position schema
export const positionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

// Create file schema
export const createGoOSFileSchema = z.object({
  type: goosFileTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  parentId: z.string().nullable().optional(),
  position: positionSchema,
  content: z.string().max(500000, 'Content too large').optional().default(''),
});

export type CreateGoOSFileInput = z.infer<typeof createGoOSFileSchema>;

// Update file schema
export const updateGoOSFileSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(500000).optional(),
  position: positionSchema.optional(),
  parentId: z.string().nullable().optional(),
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
