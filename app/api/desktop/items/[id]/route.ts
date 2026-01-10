import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const blockSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
  order: z.number(),
});

const tabSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional().nullable(),
  order: z.number(),
  blocks: z.array(blockSchema),
});

const updateItemSchema = z.object({
  positionX: z.number().min(0).max(100).optional(),
  positionY: z.number().min(0).max(100).optional(),
  thumbnailUrl: z.string().url().optional(),
  label: z.string().min(1).max(30).optional(),
  windowTitle: z.string().min(1).optional(),
  windowSubtitle: z.string().optional().nullable(),
  windowHeaderImage: z.string().url().optional().nullable(),
  windowDescription: z.string().max(5000).optional(),
  windowWidth: z.number().optional().nullable(),
  useTabs: z.boolean().optional(),
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
  blocks: z.array(blockSchema).optional(),
  tabs: z.array(tabSchema).optional(),
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
      include: {
        desktop: true,
        blocks: { orderBy: { order: 'asc' } },
        tabs: {
          orderBy: { order: 'asc' },
          include: {
            blocks: { orderBy: { order: 'asc' } },
          },
        },
      },
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

    // If blocks or tabs are being updated, handle them separately
    const { blocks, tabs, ...itemData } = validatedData;

    // Update the item
    await prisma.desktopItem.update({
      where: { id },
      data: {
        ...itemData,
        windowDetails: itemData.windowDetails === null ? undefined : itemData.windowDetails,
        windowGallery: itemData.windowGallery === null ? undefined : itemData.windowGallery,
        windowLinks: itemData.windowLinks === null ? undefined : itemData.windowLinks,
      },
    });

    // Handle blocks update
    if (blocks !== undefined) {
      // Delete existing blocks for this item
      await prisma.block.deleteMany({
        where: { itemId: id },
      });
      // Create new blocks
      if (blocks.length > 0) {
        await prisma.block.createMany({
          data: blocks.map(block => ({
            itemId: id,
            type: block.type,
            data: block.data as Prisma.InputJsonValue,
            order: block.order,
          })),
        });
      }
    }

    // Handle tabs update
    if (tabs !== undefined) {
      // Delete existing tabs (cascade will delete their blocks)
      await prisma.tab.deleteMany({
        where: { itemId: id },
      });
      // Create new tabs with their blocks
      for (const tab of tabs) {
        await prisma.tab.create({
          data: {
            itemId: id,
            label: tab.label,
            icon: tab.icon,
            order: tab.order,
            blocks: {
              create: tab.blocks.map(block => ({
                type: block.type,
                data: block.data as Prisma.InputJsonValue,
                order: block.order,
              })),
            },
          },
        });
      }
    }

    // Fetch the updated item with all relations
    const item = await prisma.desktopItem.findUnique({
      where: { id },
      include: {
        blocks: { orderBy: { order: 'asc' } },
        tabs: {
          orderBy: { order: 'asc' },
          include: {
            blocks: { orderBy: { order: 'asc' } },
          },
        },
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
