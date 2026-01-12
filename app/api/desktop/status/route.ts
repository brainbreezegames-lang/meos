import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusWidgetSchema = z.object({
  statusType: z.enum(['available', 'looking', 'taking', 'open', 'consulting']).optional(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  ctaUrl: z.string().url().optional().nullable(),
  ctaLabel: z.string().max(50).optional().nullable(),
  isVisible: z.boolean().optional(),
});

// GET - Fetch status widget for current user's desktop
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
      include: { statusWidget: true },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: desktop.statusWidget });
  } catch (error) {
    console.error('Get status widget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// PUT - Update or create status widget
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
    const data = statusWidgetSchema.parse(body);

    // Get user's desktop
    const desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
      include: { statusWidget: true },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    let statusWidget;

    if (desktop.statusWidget) {
      // Update existing
      statusWidget = await prisma.statusWidget.update({
        where: { id: desktop.statusWidget.id },
        data,
      });
    } else {
      // Create new
      statusWidget = await prisma.statusWidget.create({
        data: {
          desktopId: desktop.id,
          statusType: data.statusType || 'available',
          title: data.title || 'Available for work',
          description: data.description,
          ctaUrl: data.ctaUrl,
          ctaLabel: data.ctaLabel,
          isVisible: data.isVisible ?? true,
        },
      });
    }

    return NextResponse.json({ success: true, data: statusWidget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update status widget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// DELETE - Remove status widget
export async function DELETE() {
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
      include: { statusWidget: true },
    });

    if (!desktop?.statusWidget) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Status widget not found' } },
        { status: 404 }
      );
    }

    await prisma.statusWidget.delete({
      where: { id: desktop.statusWidget.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete status widget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
