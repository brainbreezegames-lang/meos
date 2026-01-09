import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const reorderSchema = z.array(z.object({
  id: z.string(),
  order: z.number(),
}));

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const items = reorderSchema.parse(body);

    // Update all dock items in a transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.dockItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    const updatedItems = await prisma.dockItem.findMany({
      where: { desktopId: desktop.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: updatedItems });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Reorder dock items error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
