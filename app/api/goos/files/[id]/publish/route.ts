import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Publish file
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    // Verify file exists and belongs to user
    const existingItem = await prisma.desktopItem.findFirst({
      where: {
        id,
        desktopId: desktop.id,
        itemVariant: 'goos-file',
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'File not found' } },
        { status: 404 }
      );
    }

    // Update to published
    const item = await prisma.desktopItem.update({
      where: { id },
      data: {
        publishStatus: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    const file = {
      id: item.id,
      type: item.goosFileType as 'note' | 'case-study' | 'folder',
      title: item.label,
      content: item.goosContent || '',
      status: item.publishStatus as 'draft' | 'published',
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      parentId: item.parentItemId,
      position: { x: item.positionX, y: item.positionY },
      childCount: item._count.children,
    };

    return NextResponse.json({ success: true, data: file });
  } catch (error) {
    console.error('Publish goOS file error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// DELETE - Unpublish file (revert to draft)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    // Verify file exists and belongs to user
    const existingItem = await prisma.desktopItem.findFirst({
      where: {
        id,
        desktopId: desktop.id,
        itemVariant: 'goos-file',
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'File not found' } },
        { status: 404 }
      );
    }

    // Update to draft
    const item = await prisma.desktopItem.update({
      where: { id },
      data: {
        publishStatus: 'draft',
        updatedAt: new Date(),
        // Keep publishedAt for history
      },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    const file = {
      id: item.id,
      type: item.goosFileType as 'note' | 'case-study' | 'folder',
      title: item.label,
      content: item.goosContent || '',
      status: item.publishStatus as 'draft' | 'published',
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      parentId: item.parentItemId,
      position: { x: item.positionX, y: item.positionY },
      childCount: item._count.children,
    };

    return NextResponse.json({ success: true, data: file });
  } catch (error) {
    console.error('Unpublish goOS file error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
