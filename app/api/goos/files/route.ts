import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createGoOSFileSchema, listFilesQuerySchema } from '@/lib/validations/goos';

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

    let desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
    });

    // Create desktop if doesn't exist
    if (!desktop) {
      desktop = await prisma.desktop.create({
        data: { userId: session.user.id },
      });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const parentIdParam = searchParams.get('parentId');
    const parentId = parentIdParam === 'null' ? null : parentIdParam;

    // Build filter
    const whereClause: Record<string, unknown> = {
      desktopId: desktop.id,
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
      type: item.goosFileType as 'note' | 'case-study' | 'folder',
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

    let desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          where: { itemVariant: 'goos-file' },
        },
      },
    });

    // Create desktop if doesn't exist
    if (!desktop) {
      desktop = await prisma.desktop.create({
        data: { userId: session.user.id },
        include: {
          items: {
            where: { itemVariant: 'goos-file' },
          },
        },
      });
    }

    // Check file limit (100 for now)
    if (desktop.items.length >= 100) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_REACHED', message: 'Maximum 100 goOS files allowed' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createGoOSFileSchema.parse(body);

    // If parentId is provided, verify it exists and is a folder
    if (validatedData.parentId) {
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
    }

    // Create the file
    const item = await prisma.desktopItem.create({
      data: {
        desktopId: desktop.id,
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
      },
    });

    const file = {
      id: item.id,
      type: item.goosFileType as 'note' | 'case-study' | 'folder',
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
