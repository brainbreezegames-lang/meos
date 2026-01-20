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
});

// GET - Fetch all widgets for current user's desktop
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
      include: { widgets: { orderBy: { order: 'asc' } } },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: desktop.widgets });
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

    // Get user's desktop
    const desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
      include: { widgets: true },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    // Check if widget of this type already exists (some types might be unique)
    const existingWidget = desktop.widgets.find(w => w.widgetType === data.type);
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
        desktopId: desktop.id,
        widgetType: data.type,
        positionX: position.x,
        positionY: position.y,
        title: data.title || null,
        config: data.config || {},
        order: desktop.widgets.length,
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
