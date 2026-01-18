import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ username: string }>;
}

// GET - Get public goOS files for a user (visitor view)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        desktop: true,
      },
    });

    if (!user || !user.desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Check if desktop is public
    if (!user.desktop.isPublic) {
      return NextResponse.json(
        { success: false, error: { code: 'PRIVATE', message: 'This desktop is private' } },
        { status: 403 }
      );
    }

    // Parse query params for folder filtering
    const { searchParams } = new URL(request.url);
    const parentIdParam = searchParams.get('parentId');
    const parentId = parentIdParam === 'null' ? null : parentIdParam;

    // Build filter - only published files
    const whereClause: Record<string, unknown> = {
      desktopId: user.desktop.id,
      itemVariant: 'goos-file',
      publishStatus: 'published', // Only published files for visitors
    };

    // Filter by parent
    if (parentId !== undefined) {
      whereClause.parentItemId = parentId;
    }

    const items = await prisma.desktopItem.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            children: {
              where: { publishStatus: 'published' }, // Only count published children
            },
          },
        },
      },
    });

    // Transform to GoOSFile format (exclude sensitive data)
    const files = items.map((item) => ({
      id: item.id,
      type: item.goosFileType as 'note' | 'case-study' | 'folder',
      title: item.label,
      content: item.goosContent || '',
      status: 'published' as const, // Always published in public view
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      parentId: item.parentItemId,
      position: { x: item.positionX, y: item.positionY },
      childCount: item._count.children,
    }));

    // Also return desktop metadata
    const desktop = {
      username: user.username,
      name: user.name,
      theme: user.desktop.theme,
      backgroundUrl: user.desktop.backgroundUrl,
    };

    return NextResponse.json({
      success: true,
      data: {
        desktop,
        files,
      },
    });
  } catch (error) {
    console.error('Get public goOS files error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
