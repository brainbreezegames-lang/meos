import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Verify token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find verification record
    const verification = await prisma.commentVerification.findUnique({
      where: { token },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Invalid verification link' } },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      await prisma.commentVerification.delete({ where: { id: verification.id } });
      return NextResponse.json(
        { success: false, error: { code: 'EXPIRED', message: 'Verification link has expired' } },
        { status: 400 }
      );
    }

    // Find or create commenter
    let commenter = await prisma.commenter.findUnique({
      where: { email: verification.email },
    });

    if (!commenter) {
      commenter = await prisma.commenter.create({
        data: {
          email: verification.email,
          verifiedAt: new Date(),
        },
      });
    } else if (!commenter.verifiedAt) {
      commenter = await prisma.commenter.update({
        where: { id: commenter.id },
        data: { verifiedAt: new Date() },
      });
    }

    // Delete verification record
    await prisma.commentVerification.delete({ where: { id: verification.id } });

    return NextResponse.json({
      success: true,
      data: {
        commenterId: commenter.id,
        email: commenter.email,
        displayName: commenter.displayName,
        verifiedAt: commenter.verifiedAt,
        itemId: verification.itemId,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
