import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Use existing 'icons' bucket with 'landing' subfolder
const BUCKET = 'icons';
const FOLDER = 'landing';

// GET - Fetch all landing page icon URLs
export async function GET() {
  try {
    const supabase = getSupabase();

    // List all files in the landing folder
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list(FOLDER, { limit: 100 });

    if (error) {
      console.error('Error listing icons:', error);
      // Return empty icons, don't error out
      return NextResponse.json({ icons: {} });
    }

    // Build icon URL map
    const icons: Record<string, string> = {};
    for (const file of files || []) {
      if (file.name === '.emptyFolderPlaceholder') continue;
      const filePath = `${FOLDER}/${file.name}`;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      // Extract icon ID from filename (e.g., "dock-finder.png" -> "dock-finder")
      const iconId = file.name.replace(/\.[^.]+$/, '');
      icons[iconId] = data.publicUrl;
    }

    return NextResponse.json({ icons });
  } catch (error) {
    console.error('Error fetching icons:', error);
    return NextResponse.json({ icons: {} });
  }
}

// POST - Upload a new icon
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const iconId = formData.get('iconId') as string | null;

    if (!file || !iconId) {
      return NextResponse.json(
        { error: 'File and iconId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500KB.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Get file extension
    const ext = file.name.split('.').pop() || 'png';
    const filePath = `${FOLDER}/${iconId}.${ext}`;

    // Delete existing files with this iconId (any extension)
    const { data: existingFiles } = await supabase.storage.from(BUCKET).list(FOLDER);
    const toDelete = existingFiles?.filter(f => f.name.startsWith(iconId + '.')) || [];
    if (toDelete.length > 0) {
      await supabase.storage.from(BUCKET).remove(toDelete.map(f => `${FOLDER}/${f.name}`));
    }

    // Upload new file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload icon: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      iconId,
    });
  } catch (error) {
    console.error('Icon upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload icon' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an icon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iconId = searchParams.get('iconId');

    if (!iconId) {
      return NextResponse.json(
        { error: 'iconId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // List files to find the one with this iconId
    const { data: files } = await supabase.storage.from(BUCKET).list(FOLDER);
    const fileToDelete = files?.find(f => f.name.startsWith(iconId + '.'));

    if (fileToDelete) {
      await supabase.storage.from(BUCKET).remove([`${FOLDER}/${fileToDelete.name}`]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Icon delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete icon' },
      { status: 500 }
    );
  }
}
