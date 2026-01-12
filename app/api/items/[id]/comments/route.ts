import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  category: z.enum(['general', 'feedback', 'question', 'appreciation']).optional(),
  commenterId: z.string().min(1),
  parentId: z.string().optional(),
});

// GET - List comments for an item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const session = await getServerSession(authOptions);

    // Check if item exists
    const item = await prisma.desktopItem.findUnique({
      where: { id: itemId },
      include: { desktop: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    const isOwner = session?.user?.id === item.desktop.userId;

    // Get comments
    const comments = await prisma.comment.findMany({
      where: {
        itemId,
        // Only show public comments to non-owners
        ...(isOwner ? {} : { isPublic: true }),
        // Top-level comments only (no nested replies for simplicity)
        parentId: null,
      },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// POST - Create a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const body = await request.json();
    const data = createCommentSchema.parse(body);

    // Check if item exists and has comments enabled
    const item = await prisma.desktopItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    if (!item.commentsEnabled) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Comments are disabled for this item' } },
        { status: 403 }
      );
    }

    // Verify commenter exists and is verified
    const commenter = await prisma.commenter.findUnique({
      where: { id: data.commenterId },
    });

    if (!commenter || !commenter.verifiedAt) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Please verify your email first' } },
        { status: 401 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        itemId,
        commenterId: data.commenterId,
        content: data.content,
        category: data.category || 'general',
        parentId: data.parentId,
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

    return NextResponse.json({ success: true, data: comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Create comment error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
