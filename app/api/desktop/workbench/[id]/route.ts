import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateEntrySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  context: z.string().max(5000).optional().nullable(),
  isArchived: z.boolean().optional(),
  order: z.number().int().optional(),
});

// GET - Get single workbench entry
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

    const entry = await prisma.workbenchEntry.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Entry not found' } },
        { status: 404 }
      );
    }

    // Check ownership
    if (entry.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Get workbench entry error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// PUT - Update workbench entry
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

    const body = await request.json();
    const data = updateEntrySchema.parse(body);

    // Verify ownership
    const existingEntry = await prisma.workbenchEntry.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Entry not found' } },
        { status: 404 }
      );
    }

    if (existingEntry.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        { status: 403 }
      );
    }

    const entry = await prisma.workbenchEntry.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update workbench entry error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// DELETE - Delete workbench entry
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

    // Verify ownership
    const existingEntry = await prisma.workbenchEntry.findUnique({
      where: { id },
      include: { desktop: true },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Entry not found' } },
        { status: 404 }
      );
    }

    if (existingEntry.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        { status: 403 }
      );
    }

    await prisma.workbenchEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete workbench entry error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
