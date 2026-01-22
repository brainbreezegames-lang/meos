import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/spaces/[id]/set-primary - Set a space as the primary space
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
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
    const space = await prisma.space.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!space) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Space not found' } },
        { status: 404 }
      );
    }

    // Already primary
    if (space.isPrimary) {
      return NextResponse.json({ success: true, data: { success: true } });
    }

    // Use transaction to update both old and new primary
    await prisma.$transaction([
      // Remove primary from all user's spaces
      prisma.space.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false },
      }),
      // Set this space as primary
      prisma.space.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    console.error('Failed to set primary space:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to set primary space' } },
      { status: 500 }
    );
  }
}
