import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, SpaceSummary, Space } from '@/types';

// GET /api/spaces - List all spaces for the authenticated user
export async function GET(): Promise<NextResponse<ApiResponse<SpaceSummary[]>>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const spaces = await prisma.space.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    const spaceSummaries: SpaceSummary[] = spaces.map((space) => ({
      id: space.id,
      name: space.name,
      icon: space.icon,
      slug: space.slug,
      isPrimary: space.isPrimary,
      isPublic: space.isPublic,
      order: space.order,
      fileCount: space._count.items,
    }));

    return NextResponse.json({ success: true, data: spaceSummaries });
  } catch (error) {
    console.error('Failed to fetch spaces:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch spaces' } },
      { status: 500 }
    );
  }
}

// POST /api/spaces - Create a new space
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Space>>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, icon, isPublic, slug, copyFromSpaceId } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Name is required' } },
        { status: 400 }
      );
    }

    // Get current space count to set order
    const spaceCount = await prisma.space.count({
      where: { userId: session.user.id },
    });

    // Check if slug is already taken by this user
    if (slug) {
      const existingSlug = await prisma.space.findFirst({
        where: {
          userId: session.user.id,
          slug: slug,
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: { code: 'SLUG_TAKEN', message: 'This URL is already in use' } },
          { status: 400 }
        );
      }
    }

    // Create the new space
    const newSpace = await prisma.space.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        icon: icon || '🏠',
        isPublic: isPublic ?? true,
        slug: isPublic && slug ? slug : null,
        isPrimary: spaceCount === 0, // First space is primary
        order: spaceCount,
      },
    });

    // If copying from another space, duplicate its items
    if (copyFromSpaceId) {
      const sourceSpace = await prisma.space.findFirst({
        where: {
          id: copyFromSpaceId,
          userId: session.user.id,
        },
        include: {
          items: true,
          dockItems: true,
          widgets: true,
        },
      });

      if (sourceSpace) {
        // Copy items (without comments and relations)
        if (sourceSpace.items.length > 0) {
          await prisma.desktopItem.createMany({
            data: sourceSpace.items.map((item) => ({
              spaceId: newSpace.id,
              positionX: item.positionX,
              positionY: item.positionY,
              thumbnailUrl: item.thumbnailUrl,
              label: item.label,
              windowTitle: item.windowTitle,
              windowSubtitle: item.windowSubtitle,
              windowHeaderImage: item.windowHeaderImage,
              windowDescription: item.windowDescription,
              windowType: item.windowType,
              itemVariant: item.itemVariant,
              goosFileType: item.goosFileType,
              goosContent: item.goosContent,
              publishStatus: 'draft', // Start as draft
              accessLevel: item.accessLevel,
              goosImageUrl: item.goosImageUrl,
              goosImageAlt: item.goosImageAlt,
              goosImageCaption: item.goosImageCaption,
              goosLinkUrl: item.goosLinkUrl,
              goosLinkTitle: item.goosLinkTitle,
              goosLinkDescription: item.goosLinkDescription,
              goosEmbedUrl: item.goosEmbedUrl,
              goosEmbedType: item.goosEmbedType,
              goosDownloadUrl: item.goosDownloadUrl,
              goosDownloadName: item.goosDownloadName,
              goosDownloadSize: item.goosDownloadSize,
              goosDownloadType: item.goosDownloadType,
              zIndex: item.zIndex,
              order: item.order,
            })),
          });
        }

        // Copy dock items
        if (sourceSpace.dockItems.length > 0) {
          await prisma.dockItem.createMany({
            data: sourceSpace.dockItems.map((item) => ({
              spaceId: newSpace.id,
              icon: item.icon,
              label: item.label,
              actionType: item.actionType,
              actionValue: item.actionValue,
              order: item.order,
            })),
          });
        }

        // Copy widgets
        if (sourceSpace.widgets.length > 0) {
          await prisma.widget.createMany({
            data: sourceSpace.widgets.map((widget) => ({
              spaceId: newSpace.id,
              widgetType: widget.widgetType,
              positionX: widget.positionX,
              positionY: widget.positionY,
              title: widget.title,
              isVisible: widget.isVisible,
              config: widget.config,
              order: widget.order,
            })),
          });
        }
      }
    }

    // Fetch complete space data
    const completeSpace = await prisma.space.findUnique({
      where: { id: newSpace.id },
      include: {
        items: true,
        dockItems: true,
        statusWidget: true,
        widgets: true,
        view: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: completeSpace as unknown as Space,
    });
  } catch (error) {
    console.error('Failed to create space:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create space' } },
      { status: 500 }
    );
  }
}
