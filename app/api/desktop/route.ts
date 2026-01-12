import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateDesktopSchema = z.object({
  backgroundUrl: z.string().url().optional().nullable(),
  backgroundPosition: z.enum(['cover', 'contain', 'center']).optional(),
  backgroundOverlay: z.string().optional().nullable(),
  theme: z.string().optional(),
  title: z.string().max(60).optional().nullable(),
  description: z.string().max(160).optional().nullable(),
  ogImageUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
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
      include: {
        items: {
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
        },
        dockItems: {
          orderBy: { order: 'asc' },
        },
        statusWidget: true,
        workbenchEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!desktop) {
      // Create desktop if doesn't exist
      const newDesktop = await prisma.desktop.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              blocks: true,
              tabs: { include: { blocks: true } },
            },
          },
          dockItems: true,
          statusWidget: true,
          workbenchEntries: true,
        },
      });
      return NextResponse.json({ success: true, data: newDesktop });
    }

    return NextResponse.json({ success: true, data: desktop });
  } catch (error) {
    console.error('Get desktop error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateDesktopSchema.parse(body);

    const desktop = await prisma.desktop.update({
      where: { userId: session.user.id },
      data,
      include: {
        items: {
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
        },
        dockItems: {
          orderBy: { order: 'asc' },
        },
        statusWidget: true,
        workbenchEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: desktop });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update desktop error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
