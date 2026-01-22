import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createWidgetSchema = z.object({
  type: z.enum(['clock', 'book', 'tipjar', 'contact', 'links', 'feedback']),
  position: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }).optional(),
  title: z.string().max(100).optional(),
  config: z.record(z.unknown()).optional(),
  spaceId: z.string().optional(),
});

// Helper to get or create primary space for user
async function getOrCreatePrimarySpace(userId: string) {
  let space = await prisma.space.findFirst({
    where: { userId, isPrimary: true },
  });

  if (!space) {
    space = await prisma.space.findFirst({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    if (!space) {
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

// GET - Fetch all widgets for a space
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

    // Get space - either specified or primary
    let space;
    if (spaceId) {
      space = await prisma.space.findFirst({
        where: { id: spaceId, userId: session.user.id },
        include: { widgets: { orderBy: { order: 'asc' } } },
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
        include: { widgets: { orderBy: { order: 'asc' } } },
      });
    }

    if (!space) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Space not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: space.widgets });
  } catch (error) {
    console.error('Get widgets error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// POST - Create a new widget
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
    const data = createWidgetSchema.parse(body);

    // Get space - either specified or primary
    let space;
    if (data.spaceId) {
      space = await prisma.space.findFirst({
        where: { id: data.spaceId, userId: session.user.id },
        include: { widgets: true },
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
        include: { widgets: true },
      });
    }

    if (!space) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Space not found' } },
        { status: 404 }
      );
    }

    // Check if widget of this type already exists (some types might be unique)
    const existingWidget = space.widgets.find(w => w.widgetType === data.type);
    if (existingWidget && ['clock'].includes(data.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE', message: `Only one ${data.type} widget allowed` } },
        { status: 400 }
      );
    }

    // Default positions by widget type
    const defaultPositions: Record<string, { x: number; y: number }> = {
      clock: { x: 85, y: 10 },
      book: { x: 85, y: 20 },
      tipjar: { x: 85, y: 30 },
      contact: { x: 85, y: 40 },
      links: { x: 85, y: 50 },
      feedback: { x: 85, y: 60 },
    };

    const position = data.position || defaultPositions[data.type] || { x: 80, y: 50 };

    const widget = await prisma.widget.create({
      data: {
        spaceId: space.id,
        widgetType: data.type,
        positionX: position.x,
        positionY: position.y,
        title: data.title || null,
        config: data.config || {},
        order: space.widgets.length,
      },
    });

    return NextResponse.json({ success: true, data: widget }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Create widget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
