import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateCommentSchema = z.object({
  isPublic: z.boolean().optional(),
  isOwnerFavorite: z.boolean().optional(),
});

// GET - Get single comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        commenter: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        replies: {
          include: {
            commenter: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Comment not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: comment });
  } catch (error) {
    console.error('Get comment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// PUT - Update comment (owner moderation)
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
    const data = updateCommentSchema.parse(body);

    // Get comment with item to verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            desktop: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Comment not found' } },
        { status: 404 }
      );
    }

    // Verify ownership
    if (comment.item.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        { status: 403 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data,
      include: {
        commenter: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedComment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update comment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment (owner only)
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

    // Get comment with item to verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            desktop: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Comment not found' } },
        { status: 404 }
      );
    }

    // Verify ownership
    if (comment.item.desktop.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        { status: 403 }
      );
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
