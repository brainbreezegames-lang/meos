import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createEntrySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  context: z.string().max(5000).optional().nullable(),
  isArchived: z.boolean().optional(),
});

// GET - List all workbench entries for current user's desktop
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
        workbenchEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: desktop.workbenchEntries });
  } catch (error) {
    console.error('Get workbench entries error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// POST - Create new workbench entry
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
    const data = createEntrySchema.parse(body);

    const desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    // Get max order for new entry
    const maxOrder = await prisma.workbenchEntry.aggregate({
      where: { desktopId: desktop.id },
      _max: { order: true },
    });

    const entry = await prisma.workbenchEntry.create({
      data: {
        desktopId: desktop.id,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        context: data.context,
        isArchived: data.isArchived || false,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Create workbench entry error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
