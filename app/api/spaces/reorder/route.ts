import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

// PUT /api/spaces/reorder - Reorder spaces
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'orderedIds must be an array' } },
        { status: 400 }
      );
    }

    // Verify all IDs belong to this user
    const userSpaces = await prisma.space.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const userSpaceIds = new Set(userSpaces.map((s) => s.id));
    const allValid = orderedIds.every((id) => userSpaceIds.has(id));

    if (!allValid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid space IDs' } },
        { status: 400 }
      );
    }

    // Update order for each space
    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.space.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    console.error('Failed to reorder spaces:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reorder spaces' } },
      { status: 500 }
    );
  }
}
