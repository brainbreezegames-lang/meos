import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/goos/files/[id]/access - Lock file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership
    const file = await prisma.desktopItem.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'File not found' } },
        { status: 404 }
      );
    }

    if (file.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        { status: 403 }
      );
    }

    // Lock the file
    const updated = await prisma.desktopItem.update({
      where: { id },
      data: { accessLevel: 'locked' },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        accessLevel: updated.accessLevel,
      },
    });
  } catch (error) {
    console.error('Lock file error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to lock file' } },
      { status: 500 }
    );
  }
}

// DELETE /api/goos/files/[id]/access - Unlock file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership
    const file = await prisma.desktopItem.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'File not found' } },
        { status: 404 }
      );
    }

    if (file.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        { status: 403 }
      );
    }

    // Unlock the file
    const updated = await prisma.desktopItem.update({
      where: { id },
      data: { accessLevel: 'public' },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        accessLevel: updated.accessLevel,
      },
    });
  } catch (error) {
    console.error('Unlock file error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to unlock file' } },
      { status: 500 }
    );
  }
}
