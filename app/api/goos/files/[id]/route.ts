import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateGoOSFileSchema } from '@/lib/validations/goos';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single goOS file
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const item = await prisma.desktopItem.findFirst({
      where: {
        id,
        desktopId: desktop.id,
        itemVariant: 'goos-file',
      },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'File not found' } },
        { status: 404 }
      );
    }

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
    console.error('Get goOS file error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// PUT - Update goOS file
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const validatedData = updateGoOSFileSchema.parse(body);

    // If moving to a new parent, verify it's a valid folder
    if (validatedData.parentId !== undefined && validatedData.parentId !== null) {
      // Prevent moving into self
      if (validatedData.parentId === id) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PARENT', message: 'Cannot move item into itself' } },
          { status: 400 }
        );
      }

      const parentFolder = await prisma.desktopItem.findFirst({
        where: {
          id: validatedData.parentId,
          desktopId: desktop.id,
          itemVariant: 'goos-file',
          goosFileType: 'folder',
        },
      });

      if (!parentFolder) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PARENT', message: 'Parent folder not found' } },
          { status: 400 }
        );
      }

      // Prevent circular references (moving a folder into its own descendant)
      if (existingItem.goosFileType === 'folder') {
        const isDescendant = await checkIsDescendant(id, validatedData.parentId);
        if (isDescendant) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_PARENT', message: 'Cannot move folder into its own subfolder' } },
            { status: 400 }
          );
        }
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validatedData.title !== undefined) {
      updateData.label = validatedData.title;
      updateData.windowTitle = validatedData.title;
    }

    if (validatedData.content !== undefined) {
      updateData.goosContent = validatedData.content;
    }

    if (validatedData.position !== undefined) {
      updateData.positionX = validatedData.position.x;
      updateData.positionY = validatedData.position.y;
    }

    if (validatedData.parentId !== undefined) {
      updateData.parentItemId = validatedData.parentId;
    }

    const item = await prisma.desktopItem.update({
      where: { id },
      data: updateData,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update goOS file error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// DELETE - Delete goOS file
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
    const item = await prisma.desktopItem.findFirst({
      where: {
        id,
        desktopId: desktop.id,
        itemVariant: 'goos-file',
      },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'File not found' } },
        { status: 404 }
      );
    }

    // If it's a folder with children, prevent deletion
    if (item.goosFileType === 'folder' && item._count.children > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'FOLDER_NOT_EMPTY', message: 'Cannot delete folder with contents. Empty the folder first.' } },
        { status: 400 }
      );
    }

    await prisma.desktopItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Delete goOS file error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// Helper: Check if targetId is a descendant of sourceId
async function checkIsDescendant(sourceId: string, targetId: string): Promise<boolean> {
  let currentId: string | null = targetId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) break; // Prevent infinite loop
    visited.add(currentId);

    if (currentId === sourceId) return true;

    const parentResult: { parentItemId: string | null } | null = await prisma.desktopItem.findUnique({
      where: { id: currentId },
      select: { parentItemId: true },
    });

    currentId = parentResult?.parentItemId ?? null;
  }

  return false;
}
