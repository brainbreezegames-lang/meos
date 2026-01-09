import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateItemSchema = z.object({
  positionX: z.number().min(0).max(100).optional(),
  positionY: z.number().min(0).max(100).optional(),
  thumbnailUrl: z.string().url().optional(),
  label: z.string().min(1).max(30).optional(),
  windowTitle: z.string().min(1).optional(),
  windowSubtitle: z.string().optional().nullable(),
  windowHeaderImage: z.string().url().optional().nullable(),
  windowDescription: z.string().min(1).max(5000).optional(),
  windowDetails: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional().nullable(),
  windowGallery: z.array(z.object({
    type: z.enum(['image', 'video']),
    url: z.string().url(),
  })).optional().nullable(),
  windowLinks: z.array(z.object({
    label: z.string(),
    url: z.string().url(),
  })).optional().nullable(),
  zIndex: z.number().optional(),
  order: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const item = await prisma.desktopItem.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!item || item.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Get item error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const existingItem = await prisma.desktopItem.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!existingItem || existingItem.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateItemSchema.parse(body);

    const item = await prisma.desktopItem.update({
      where: { id },
      data: {
        ...validatedData,
        windowDetails: validatedData.windowDetails === null ? undefined : validatedData.windowDetails,
        windowGallery: validatedData.windowGallery === null ? undefined : validatedData.windowGallery,
        windowLinks: validatedData.windowLinks === null ? undefined : validatedData.windowLinks,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update item error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const existingItem = await prisma.desktopItem.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!existingItem || existingItem.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    await prisma.desktopItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
