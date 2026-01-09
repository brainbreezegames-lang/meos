import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        desktop: {
          include: {
            items: {
              orderBy: { order: 'asc' },
            },
            dockItems: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!user || !user.desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    if (!user.desktop.isPublic) {
      return NextResponse.json(
        { success: false, error: { code: 'PRIVATE', message: 'This desktop is private' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        username: user.username,
        name: user.name,
        desktop: user.desktop,
      },
    });
  } catch (error) {
    console.error('Get user desktop error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
