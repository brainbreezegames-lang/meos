import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const replySchema = z.object({
  reply: z.string().min(1).max(2000),
});

// POST - Owner reply to comment
export async function POST(
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
    const { reply } = replySchema.parse(body);

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
      data: {
        ownerReply: reply,
        ownerRepliedAt: new Date(),
      },
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

    console.error('Reply to comment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
