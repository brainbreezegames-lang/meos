// MeOS Icon System - Server-side Image Processing
// Uses Sharp for high-quality image resizing and format conversion

import sharp from 'sharp';
import { IconContext, ICON_SIZES, IconVariant } from './types';

interface ProcessedIcon {
  size: number;
  png: Buffer;
  webp: Buffer;
  pngSize: number;
  webpSize: number;
}

interface IconProcessingResult {
  variants: ProcessedIcon[];
  metadata: {
    originalWidth: number;
    originalHeight: number;
    originalFormat: string;
    processedAt: Date;
  };
}

/**
 * Process an uploaded icon and generate all size variants
 */
export async function processIcon(
  buffer: Buffer,
  context: IconContext
): Promise<IconProcessingResult> {
  const config = ICON_SIZES[context];
  const sizes = config.generated;

  // Get original image metadata
  const metadata = await sharp(buffer).metadata();

  // Process all sizes in parallel
  const variants = await Promise.all(
    sizes.map(async (size) => {
      // Resize with high-quality settings
      const resized = sharp(buffer).resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3,
      });

      // Generate PNG variant
      const png = await resized
        .clone()
        .png({
          quality: 90,
          compressionLevel: 9,
          palette: false,
        })
        .toBuffer();

      // Generate WebP variant (better compression)
      const webp = await resized
        .clone()
        .webp({
          quality: 85,
          effort: 6,
          lossless: false,
        })
        .toBuffer();

      return {
        size,
        png,
        webp,
        pngSize: png.length,
        webpSize: webp.length,
      };
    })
  );

  return {
    variants,
    metadata: {
      originalWidth: metadata.width ?? 0,
      originalHeight: metadata.height ?? 0,
      originalFormat: metadata.format ?? 'unknown',
      processedAt: new Date(),
    },
  };
}

/**
 * Generate favicon variants including ICO format
 */
export async function processFavicon(buffer: Buffer): Promise<{
  ico: Buffer;
  variants: ProcessedIcon[];
}> {
  const sizes = ICON_SIZES.favicon.generated;

  // Process all PNG/WebP variants
  const variants = await Promise.all(
    sizes.map(async (size) => {
      const resized = sharp(buffer).resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3,
      });

      const png = await resized
        .clone()
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer();

      const webp = await resized
        .clone()
        .webp({ quality: 85 })
        .toBuffer();

      return {
        size,
        png,
        webp,
        pngSize: png.length,
        webpSize: webp.length,
      };
    })
  );

  // Generate ICO file (16, 32, 48 combined)
  // Note: This creates a simple ICO by concatenating PNG images
  // For production, consider using a dedicated ICO library
  const icoSizes = [16, 32, 48];
  const icoPngs = await Promise.all(
    icoSizes.map((size) =>
      sharp(buffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
    )
  );

  // Simple ICO generation (PNG-in-ICO format, widely supported)
  const ico = createSimpleIco(icoPngs, icoSizes);

  return { ico, variants };
}

/**
 * Create a simple ICO file from PNG buffers
 * Uses PNG-in-ICO format which is supported by modern browsers
 */
function createSimpleIco(pngBuffers: Buffer[], sizes: number[]): Buffer {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;

  // Calculate total size and image offsets
  let totalSize = headerSize + dirSize;
  const offsets: number[] = [];

  for (const png of pngBuffers) {
    offsets.push(totalSize);
    totalSize += png.length;
  }

  // Create ICO buffer
  const ico = Buffer.alloc(totalSize);

  // ICO Header
  ico.writeUInt16LE(0, 0); // Reserved (must be 0)
  ico.writeUInt16LE(1, 2); // Type (1 = ICO)
  ico.writeUInt16LE(numImages, 4); // Number of images

  // Directory entries
  for (let i = 0; i < numImages; i++) {
    const offset = headerSize + i * dirEntrySize;
    const size = sizes[i];
    const png = pngBuffers[i];

    ico.writeUInt8(size === 256 ? 0 : size, offset); // Width (0 = 256)
    ico.writeUInt8(size === 256 ? 0 : size, offset + 1); // Height
    ico.writeUInt8(0, offset + 2); // Color palette
    ico.writeUInt8(0, offset + 3); // Reserved
    ico.writeUInt16LE(1, offset + 4); // Color planes
    ico.writeUInt16LE(32, offset + 6); // Bits per pixel
    ico.writeUInt32LE(png.length, offset + 8); // Image size
    ico.writeUInt32LE(offsets[i], offset + 12); // Image offset
  }

  // Copy image data
  for (let i = 0; i < numImages; i++) {
    pngBuffers[i].copy(ico, offsets[i]);
  }

  return ico;
}

/**
 * Process mobile app icon (no transparency, solid background)
 */
export async function processMobileIcon(
  buffer: Buffer,
  backgroundColor: string = '#FFFFFF'
): Promise<ProcessedIcon[]> {
  const sizes = ICON_SIZES.mobile.generated;

  // Parse background color
  const bg = parseColor(backgroundColor);

  return Promise.all(
    sizes.map(async (size) => {
      // Create background layer
      const background = sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: bg.r, g: bg.g, b: bg.b, alpha: 1 },
        },
      });

      // Resize icon to fit within safe zone (80% of canvas)
      const iconSize = Math.round(size * 0.8);
      const iconBuffer = await sharp(buffer)
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      // Composite icon on background
      const padding = Math.round((size - iconSize) / 2);
      const composite = await background
        .composite([
          {
            input: iconBuffer,
            top: padding,
            left: padding,
          },
        ])
        .png()
        .toBuffer();

      const webp = await sharp(composite).webp({ quality: 85 }).toBuffer();

      return {
        size,
        png: composite,
        webp,
        pngSize: composite.length,
        webpSize: webp.length,
      };
    })
  );
}

/**
 * Parse hex color to RGB
 */
function parseColor(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  return { r: 255, g: 255, b: 255 };
}

/**
 * Convert icon variants to URL map for database storage
 */
export function variantsToUrls(
  variants: ProcessedIcon[],
  basePath: string
): IconVariant[] {
  return variants.map((v) => ({
    size: v.size,
    pngUrl: `${basePath}-${v.size}.png`,
    webpUrl: `${basePath}-${v.size}.webp`,
    fileSize: v.webpSize, // Use WebP size as the primary
  }));
}
