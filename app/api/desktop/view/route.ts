import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateViewSchema = z.object({
  activeMode: z.enum(['desktop', 'page', 'present']).optional(),
  pageOrder: z.array(z.string()).optional(),
  presentOrder: z.array(z.string()).optional(),
  presentAuto: z.boolean().optional(),
  presentDelay: z.number().int().min(1000).max(30000).optional(),
});

// GET - Fetch view settings for current user's desktop
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
      include: { view: true },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    // Return view or default values
    const view = desktop.view || {
      activeMode: 'desktop',
      pageOrder: [],
      presentOrder: [],
      presentAuto: false,
      presentDelay: 5000,
    };

    return NextResponse.json({ success: true, data: view });
  } catch (error) {
    console.error('Get view settings error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// PUT - Update or create view settings
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
    const data = updateViewSchema.parse(body);

    // Get user's desktop
    const desktop = await prisma.desktop.findUnique({
      where: { userId: session.user.id },
      include: { view: true },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    let view;

    if (desktop.view) {
      // Update existing
      view = await prisma.desktopView.update({
        where: { id: desktop.view.id },
        data: {
          activeMode: data.activeMode,
          pageOrder: data.pageOrder,
          presentOrder: data.presentOrder,
          presentAuto: data.presentAuto,
          presentDelay: data.presentDelay,
        },
      });
    } else {
      // Create new
      view = await prisma.desktopView.create({
        data: {
          desktopId: desktop.id,
          activeMode: data.activeMode || 'desktop',
          pageOrder: data.pageOrder || [],
          presentOrder: data.presentOrder || [],
          presentAuto: data.presentAuto ?? false,
          presentDelay: data.presentDelay ?? 5000,
        },
      });
    }

    return NextResponse.json({ success: true, data: view });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update view settings error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
