import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const BUCKET = 'landing-icons';

// GET - Fetch all landing page icon URLs
export async function GET() {
  try {
    const supabase = getSupabase();

    // List all files in the landing-icons bucket
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit: 100 });

    if (error) {
      console.error('Error listing icons:', error);
      return NextResponse.json({ icons: {} });
    }

    // Build icon URL map
    const icons: Record<string, string> = {};
    for (const file of files || []) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(file.name);
      // Extract icon ID from filename (e.g., "finder.png" -> "finder")
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
    const fileName = `${iconId}.${ext}`;

    // Delete existing file if it exists
    await supabase.storage.from(BUCKET).remove([fileName]);

    // Upload new file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload icon' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      iconId,
    });
  } catch (error) {
    console.error('Icon upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload icon' },
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
    const { data: files } = await supabase.storage.from(BUCKET).list('');
    const fileToDelete = files?.find(f => f.name.startsWith(iconId + '.'));

    if (fileToDelete) {
      await supabase.storage.from(BUCKET).remove([fileToDelete.name]);
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
