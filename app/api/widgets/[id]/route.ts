import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateWidgetSchema = z.object({
  position: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }).optional(),
  title: z.string().max(100).optional().nullable(),
  isVisible: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
});

// GET - Fetch a specific widget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const widget = await prisma.widget.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!widget) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Widget not found' } },
        { status: 404 }
      );
    }

    // Verify ownership
    if (widget.space.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not your widget' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: widget });
  } catch (error) {
    console.error('Get widget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// PUT - Update a widget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateWidgetSchema.parse(body);

    // Get widget and verify ownership
    const widget = await prisma.widget.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!widget) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Widget not found' } },
        { status: 404 }
      );
    }

    if (widget.space.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not your widget' } },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (data.position) {
      updateData.positionX = data.position.x;
      updateData.positionY = data.position.y;
    }
    if (data.title !== undefined) updateData.title = data.title;
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
    if (data.config !== undefined) updateData.config = data.config;

    const updatedWidget = await prisma.widget.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedWidget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update widget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// DELETE - Delete a widget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Get widget and verify ownership
    const widget = await prisma.widget.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!widget) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Widget not found' } },
        { status: 404 }
      );
    }

    if (widget.space.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not your widget' } },
        { status: 403 }
      );
    }

    await prisma.widget.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete widget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
