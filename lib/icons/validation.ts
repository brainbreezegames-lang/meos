// MeOS Icon System - Validation Utilities
// Client-side validation before upload

import { IconContext, ICON_SIZES, IconValidation } from './types';

interface FileValidationOptions {
  context: IconContext;
  file: File;
}

interface DimensionValidationResult {
  valid: boolean;
  width: number;
  height: number;
  error?: string;
}

/**
 * Allowed MIME types for icon uploads
 */
const ALLOWED_FORMATS = ['image/png', 'image/svg+xml'];

/**
 * Validate file format
 */
export function validateFormat(file: File): IconValidation {
  if (!ALLOWED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid format. Must be PNG or SVG. Got: ${file.type || 'unknown'}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, context: IconContext): IconValidation {
  const config = ICON_SIZES[context];
  if (file.size > config.maxFileSize) {
    const maxKB = Math.round(config.maxFileSize / 1024);
    const actualKB = Math.round(file.size / 1024);
    return {
      valid: false,
      error: `File too large. Max ${maxKB}KB, got ${actualKB}KB.`,
    };
  }
  return { valid: true };
}

/**
 * Load image and get dimensions
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validate image dimensions
 */
export async function validateDimensions(
  file: File,
  context: IconContext
): Promise<DimensionValidationResult> {
  // Skip dimension check for SVG
  if (file.type === 'image/svg+xml') {
    return { valid: true, width: 0, height: 0 };
  }

  try {
    const img = await loadImage(file);
    const config = ICON_SIZES[context];

    // Check minimum size
    if (img.width < config.master || img.height < config.master) {
      return {
        valid: false,
        width: img.width,
        height: img.height,
        error: `Image too small. Minimum ${config.master}×${config.master}px, got ${img.width}×${img.height}px.`,
      };
    }

    // Check aspect ratio (must be square within 1% tolerance)
    const aspectRatio = img.width / img.height;
    if (Math.abs(aspectRatio - 1) > 0.01) {
      return {
        valid: false,
        width: img.width,
        height: img.height,
        error: `Image must be square. Got ${img.width}×${img.height}px (${aspectRatio.toFixed(2)}:1).`,
      };
    }

    return { valid: true, width: img.width, height: img.height };
  } catch {
    return {
      valid: false,
      width: 0,
      height: 0,
      error: 'Failed to load image for validation',
    };
  }
}

/**
 * Full validation for icon upload
 */
export async function validateIcon(
  options: FileValidationOptions
): Promise<IconValidation & { dimensions?: { width: number; height: number } }> {
  const { file, context } = options;

  // 1. Format validation
  const formatResult = validateFormat(file);
  if (!formatResult.valid) {
    return formatResult;
  }

  // 2. File size validation
  const sizeResult = validateFileSize(file, context);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  // 3. Dimension validation (PNG only)
  const dimensionResult = await validateDimensions(file, context);
  if (!dimensionResult.valid) {
    return { valid: false, error: dimensionResult.error };
  }

  return {
    valid: true,
    dimensions:
      dimensionResult.width > 0
        ? { width: dimensionResult.width, height: dimensionResult.height }
        : undefined,
  };
}

/**
 * Get human-readable requirements for a context
 */
export function getRequirements(context: IconContext): string[] {
  const config = ICON_SIZES[context];
  const maxKB = Math.round(config.maxFileSize / 1024);

  return [
    `${config.master}×${config.master} pixels minimum`,
    'PNG with transparency or SVG',
    `Under ${maxKB}KB`,
    'Square aspect ratio (1:1)',
  ];
}

/**
 * Get the display text for an icon context
 */
export function getContextLabel(context: IconContext): string {
  const labels: Record<IconContext, string> = {
    desktop: 'Desktop Icon',
    dock: 'Dock Icon',
    window: 'Window Icon',
    mobile: 'Mobile App Icon',
    favicon: 'Favicon',
    logo: 'Logo',
  };
  return labels[context];
}
