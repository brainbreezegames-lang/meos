import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createGoOSFileSchema } from '@/lib/validations/goos';

// Helper to get or create primary space for user
async function getOrCreatePrimarySpace(userId: string) {
  let space = await prisma.space.findFirst({
    where: { userId, isPrimary: true },
  });

  if (!space) {
    // Check if user has any spaces
    space = await prisma.space.findFirst({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    if (!space) {
      // Create default space
      space = await prisma.space.create({
        data: {
          userId,
          name: 'My Space',
          icon: '🏠',
          isPrimary: true,
          isPublic: true,
          order: 0,
        },
      });
    }
  }

  return space;
}

// GET - List goOS files for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');
    const parentIdParam = searchParams.get('parentId');
    const parentId = parentIdParam === 'null' ? null : parentIdParam;

    // Get space - either specified or primary
    let space;
    if (spaceId) {
      space = await prisma.space.findFirst({
        where: { id: spaceId, userId: session.user.id },
      });
      if (!space) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Space not found' } },
          { status: 404 }
        );
      }
    } else {
      space = await getOrCreatePrimarySpace(session.user.id);
    }

    // Build filter
    const whereClause: Record<string, unknown> = {
      spaceId: space.id,
      itemVariant: 'goos-file',
    };

    // Filter by parent (null = root level)
    if (parentId !== undefined) {
      whereClause.parentItemId = parentId;
    }

    const items = await prisma.desktopItem.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    // Transform to GoOSFile format
    const files = items.map((item) => ({
      id: item.id,
      type: item.goosFileType as 'note' | 'case-study' | 'folder' | 'cv',
      title: item.label,
      content: item.goosContent || '',
      status: item.publishStatus as 'draft' | 'published',
      accessLevel: item.accessLevel as 'public' | 'locked',
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      parentId: item.parentItemId,
      position: { x: item.positionX, y: item.positionY },
      childCount: item._count.children,
      // Image fields
      imageUrl: item.goosImageUrl,
      imageAlt: item.goosImageAlt,
      imageCaption: item.goosImageCaption,
      // Link fields
      linkUrl: item.goosLinkUrl,
      linkTitle: item.goosLinkTitle,
      linkDescription: item.goosLinkDescription,
      // Embed fields
      embedUrl: item.goosEmbedUrl,
      embedType: item.goosEmbedType,
    }));

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error('Get goOS files error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// POST - Create new goOS file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { spaceId: requestSpaceId, ...fileData } = body;

    // Get space - either specified or primary
    let space;
    if (requestSpaceId) {
      space = await prisma.space.findFirst({
        where: { id: requestSpaceId, userId: session.user.id },
        include: {
          items: {
            where: { itemVariant: 'goos-file' },
          },
        },
      });
      if (!space) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Space not found' } },
          { status: 404 }
        );
      }
    } else {
      const primarySpace = await getOrCreatePrimarySpace(session.user.id);
      space = await prisma.space.findUnique({
        where: { id: primarySpace.id },
        include: {
          items: {
            where: { itemVariant: 'goos-file' },
          },
        },
      });
    }

    if (!space) {
      return NextResponse.json(
        { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get space' } },
        { status: 500 }
      );
    }

    // Check file limit (100 per space)
    if (space.items.length >= 100) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_REACHED', message: 'Maximum 100 goOS files allowed per space' } },
        { status: 400 }
      );
    }

    const validatedData = createGoOSFileSchema.parse(fileData);

    // If parentId is provided, verify it exists and is a folder in this space
    if (validatedData.parentId) {
      const parentFolder = await prisma.desktopItem.findFirst({
        where: {
          id: validatedData.parentId,
          spaceId: space.id,
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
    }

    // Create the file
    const item = await prisma.desktopItem.create({
      data: {
        spaceId: space.id,
        itemVariant: 'goos-file',
        goosFileType: validatedData.type,
        goosContent: validatedData.content || '',
        label: validatedData.title,
        windowTitle: validatedData.title, // Required field
        windowDescription: '', // Required field
        thumbnailUrl: '', // Required field, not used for goOS
        positionX: validatedData.position.x,
        positionY: validatedData.position.y,
        parentItemId: validatedData.parentId || null,
        publishStatus: 'draft',
        // Link fields
        goosLinkUrl: validatedData.linkUrl || null,
        goosLinkTitle: validatedData.linkTitle || null,
        goosLinkDescription: validatedData.linkDescription || null,
        // Image fields
        goosImageUrl: validatedData.imageUrl || null,
        goosImageAlt: validatedData.imageAlt || null,
        goosImageCaption: validatedData.imageCaption || null,
      },
    });

    const file = {
      id: item.id,
      type: item.goosFileType as 'note' | 'case-study' | 'folder' | 'cv',
      title: item.label,
      content: item.goosContent || '',
      status: item.publishStatus as 'draft' | 'published',
      accessLevel: item.accessLevel as 'public' | 'locked',
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      parentId: item.parentItemId,
      position: { x: item.positionX, y: item.positionY },
      childCount: 0,
      // Link fields
      linkUrl: item.goosLinkUrl,
      linkTitle: item.goosLinkTitle,
      linkDescription: item.goosLinkDescription,
      // Image fields
      imageUrl: item.goosImageUrl,
      imageAlt: item.goosImageAlt,
      imageCaption: item.goosImageCaption,
    };

    return NextResponse.json({ success: true, data: file });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Create goOS file error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
