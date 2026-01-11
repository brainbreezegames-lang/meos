import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { IconContext, ICON_SIZES } from '@/lib/icons/types';
import { processIcon, processFavicon, processMobileIcon } from '@/lib/icons/processing';

const ALLOWED_TYPES = ['image/png', 'image/svg+xml'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const contextParam = formData.get('context') as IconContext | null;
    const referenceId = formData.get('referenceId') as string | null;

    // Validation
    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No file provided' } },
        { status: 400 }
      );
    }

    if (!contextParam || !ICON_SIZES[contextParam]) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid icon context' } },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid file type. Must be PNG or SVG.' } },
        { status: 400 }
      );
    }

    const config = ICON_SIZES[contextParam];
    if (file.size > config.maxFileSize) {
      const maxKB = Math.round(config.maxFileSize / 1024);
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `File too large. Max ${maxKB}KB.` } },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the icon based on context
    let processedVariants;
    let faviconIco: Buffer | null = null;

    if (contextParam === 'favicon') {
      const result = await processFavicon(buffer);
      processedVariants = result.variants;
      faviconIco = result.ico;
    } else if (contextParam === 'mobile') {
      // Get background color from form data if provided
      const bgColor = formData.get('backgroundColor') as string | undefined;
      processedVariants = await processMobileIcon(buffer, bgColor ?? '#FFFFFF');
    } else {
      const result = await processIcon(buffer, contextParam);
      processedVariants = result.variants;
    }

    // Upload to Supabase storage
    const supabase = getSupabase();
    const basePath = `icons/${session.user.id}/${referenceId ?? 'default'}/${contextParam}`;
    const uploadedUrls: { size: number; pngUrl: string; webpUrl: string }[] = [];

    for (const variant of processedVariants) {
      // Upload PNG variant
      const pngPath = `${basePath}-${variant.size}.png`;
      const { error: pngError } = await supabase.storage
        .from('icons')
        .upload(pngPath, variant.png, {
          contentType: 'image/png',
          cacheControl: '31536000', // 1 year cache
          upsert: true,
        });

      if (pngError) {
        console.error('PNG upload error:', pngError);
        continue;
      }

      // Upload WebP variant
      const webpPath = `${basePath}-${variant.size}.webp`;
      const { error: webpError } = await supabase.storage
        .from('icons')
        .upload(webpPath, variant.webp, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });

      if (webpError) {
        console.error('WebP upload error:', webpError);
        continue;
      }

      // Get public URLs
      const { data: pngUrl } = supabase.storage.from('icons').getPublicUrl(pngPath);
      const { data: webpUrl } = supabase.storage.from('icons').getPublicUrl(webpPath);

      uploadedUrls.push({
        size: variant.size,
        pngUrl: pngUrl.publicUrl,
        webpUrl: webpUrl.publicUrl,
      });
    }

    // Upload ICO file for favicon context
    let icoUrl: string | null = null;
    if (faviconIco) {
      const icoPath = `${basePath}/favicon.ico`;
      const { error: icoError } = await supabase.storage
        .from('icons')
        .upload(icoPath, faviconIco, {
          contentType: 'image/x-icon',
          cacheControl: '31536000',
          upsert: true,
        });

      if (!icoError) {
        const { data: icoData } = supabase.storage.from('icons').getPublicUrl(icoPath);
        icoUrl = icoData.publicUrl;
      }
    }

    // Upload original file
    const originalExt = file.type === 'image/svg+xml' ? 'svg' : 'png';
    const originalPath = `${basePath}/original.${originalExt}`;
    await supabase.storage.from('icons').upload(originalPath, buffer, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: true,
    });
    const { data: originalUrl } = supabase.storage.from('icons').getPublicUrl(originalPath);

    return NextResponse.json({
      success: true,
      data: {
        originalUrl: originalUrl.publicUrl,
        variants: uploadedUrls,
        icoUrl,
        context: contextParam,
        referenceId,
      },
    });
  } catch (error) {
    console.error('Icon upload error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to process icon' } },
      { status: 500 }
    );
  }
}
