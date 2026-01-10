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

const createItemSchema = z.object({
  positionX: z.number().min(0).max(100),
  positionY: z.number().min(0).max(100),
  thumbnailUrl: z.string().url(),
  label: z.string().min(1).max(30),
  windowTitle: z.string().min(1),
  windowSubtitle: z.string().optional().nullable(),
  windowHeaderImage: z.string().url().optional().nullable(),
  windowDescription: z.string().max(5000).optional().default(''),
  windowWidth: z.number().optional().nullable(),
  useTabs: z.boolean().optional().default(false),
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
  blocks: z.array(blockSchema).optional().default([]),
  tabs: z.array(tabSchema).optional().default([]),
});

export async function GET() {
  try {
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

    const items = await prisma.desktopItem.findMany({
      where: { desktopId: desktop.id },
      orderBy: { order: 'asc' },
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

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    // Check item limit (20 for free tier)
    if (desktop.items.length >= 20) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_REACHED', message: 'Maximum 20 items allowed' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createItemSchema.parse(body);

    const maxOrder = desktop.items.length > 0
      ? Math.max(...desktop.items.map(i => i.order))
      : -1;

    // Create item with blocks and tabs
    const item = await prisma.desktopItem.create({
      data: {
        positionX: validatedData.positionX,
        positionY: validatedData.positionY,
        thumbnailUrl: validatedData.thumbnailUrl,
        label: validatedData.label,
        windowTitle: validatedData.windowTitle,
        windowSubtitle: validatedData.windowSubtitle,
        windowHeaderImage: validatedData.windowHeaderImage,
        windowDescription: validatedData.windowDescription,
        windowWidth: validatedData.windowWidth,
        useTabs: validatedData.useTabs,
        windowDetails: validatedData.windowDetails || undefined,
        windowGallery: validatedData.windowGallery || undefined,
        windowLinks: validatedData.windowLinks || undefined,
        desktopId: desktop.id,
        order: maxOrder + 1,
        // Create blocks
        blocks: {
          create: validatedData.blocks.map(block => ({
            type: block.type,
            data: block.data as Prisma.InputJsonValue,
            order: block.order,
          })),
        },
        // Create tabs with their blocks
        tabs: {
          create: validatedData.tabs.map(tab => ({
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
          })),
        },
      },
      include: {
        blocks: true,
        tabs: {
          include: {
            blocks: true,
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

    console.error('Create item error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
