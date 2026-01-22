import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Space } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/spaces/[id] - Get a single space with all its data
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Space>>> {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const space = await prisma.space.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            tabs: {
              orderBy: { order: 'asc' },
              include: { blocks: { orderBy: { order: 'asc' } } },
            },
            blocks: { orderBy: { order: 'asc' } },
            children: true,
          },
        },
        dockItems: { orderBy: { order: 'asc' } },
        statusWidget: true,
        widgets: { orderBy: { order: 'asc' } },
        view: true,
        workbenchEntries: { orderBy: { order: 'asc' } },
      },
    });

    if (!space) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Space not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: space as unknown as Space });
  } catch (error) {
    console.error('Failed to fetch space:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch space' } },
      { status: 500 }
    );
  }
}

// PUT /api/spaces/[id] - Update a space
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Space>>> {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingSpace = await prisma.space.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSpace) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Space not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, icon, isPublic, slug, backgroundUrl, backgroundPosition, backgroundOverlay, theme, title, description, ogImageUrl } = body;

    // Check if new slug is already taken by another space
    if (slug && slug !== existingSpace.slug) {
      const slugExists = await prisma.space.findFirst({
        where: {
          userId: session.user.id,
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: { code: 'SLUG_TAKEN', message: 'This URL is already in use' } },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (icon !== undefined) updateData.icon = icon;
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
      // If making private, remove slug
      if (!isPublic) {
        updateData.slug = null;
      }
    }
    if (slug !== undefined) updateData.slug = slug;
    if (backgroundUrl !== undefined) updateData.backgroundUrl = backgroundUrl;
    if (backgroundPosition !== undefined) updateData.backgroundPosition = backgroundPosition;
    if (backgroundOverlay !== undefined) updateData.backgroundOverlay = backgroundOverlay;
    if (theme !== undefined) updateData.theme = theme;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (ogImageUrl !== undefined) updateData.ogImageUrl = ogImageUrl;

    const updatedSpace = await prisma.space.update({
      where: { id },
      data: updateData,
      include: {
        items: { orderBy: { order: 'asc' } },
        dockItems: { orderBy: { order: 'asc' } },
        statusWidget: true,
        widgets: { orderBy: { order: 'asc' } },
        view: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedSpace as unknown as Space });
  } catch (error) {
    console.error('Failed to update space:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update space' } },
      { status: 500 }
    );
  }
}

// DELETE /api/spaces/[id] - Delete a space
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Verify ownership and check if primary
    const space = await prisma.space.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!space) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Space not found' } },
        { status: 404 }
      );
    }

    // Cannot delete primary space
    if (space.isPrimary) {
      return NextResponse.json(
        { success: false, error: { code: 'CANNOT_DELETE_PRIMARY', message: 'Cannot delete primary space' } },
        { status: 400 }
      );
    }

    // Check if this is the only space
    const spaceCount = await prisma.space.count({
      where: { userId: session.user.id },
    });

    if (spaceCount <= 1) {
      return NextResponse.json(
        { success: false, error: { code: 'CANNOT_DELETE_ONLY', message: 'Cannot delete the only space' } },
        { status: 400 }
      );
    }

    // Delete the space (cascade will delete related items)
    await prisma.space.delete({
      where: { id },
    });

    // Reorder remaining spaces
    const remainingSpaces = await prisma.space.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
    });

    await Promise.all(
      remainingSpaces.map((s, index) =>
        prisma.space.update({
          where: { id: s.id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error('Failed to delete space:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete space' } },
      { status: 500 }
    );
  }
}
