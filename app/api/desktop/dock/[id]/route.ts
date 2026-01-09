import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateDockItemSchema = z.object({
  icon: z.string().min(1).optional(),
  label: z.string().min(1).max(30).optional(),
  actionType: z.enum(['url', 'email', 'download']).optional(),
  actionValue: z.string().min(1).optional(),
  order: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const dockItem = await prisma.dockItem.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!dockItem || dockItem.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Dock item not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dockItem });
  } catch (error) {
    console.error('Get dock item error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const existingItem = await prisma.dockItem.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!existingItem || existingItem.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Dock item not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateDockItemSchema.parse(body);

    const dockItem = await prisma.dockItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: dockItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update dock item error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const existingItem = await prisma.dockItem.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!existingItem || existingItem.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Dock item not found' } },
        { status: 404 }
      );
    }

    await prisma.dockItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error('Delete dock item error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
