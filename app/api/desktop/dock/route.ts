import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createDockItemSchema = z.object({
  icon: z.string().min(1),
  label: z.string().min(1).max(30),
  actionType: z.enum(['url', 'email', 'download']),
  actionValue: z.string().min(1),
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

    const dockItems = await prisma.dockItem.findMany({
      where: { desktopId: desktop.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: dockItems });
  } catch (error) {
    console.error('Get dock items error:', error);
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
      include: { dockItems: true },
    });

    if (!desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Desktop not found' } },
        { status: 404 }
      );
    }

    // Check dock item limit (8 max)
    if (desktop.dockItems.length >= 8) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_REACHED', message: 'Maximum 8 dock items allowed' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = createDockItemSchema.parse(body);

    const maxOrder = desktop.dockItems.length > 0
      ? Math.max(...desktop.dockItems.map(i => i.order))
      : -1;

    const dockItem = await prisma.dockItem.create({
      data: {
        ...data,
        desktopId: desktop.id,
        order: maxOrder + 1,
      },
    });

    return NextResponse.json({ success: true, data: dockItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Create dock item error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
