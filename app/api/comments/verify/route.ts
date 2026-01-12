import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const verifySchema = z.object({
  email: z.string().email(),
  itemId: z.string().min(1),
});

// POST - Initiate email verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, itemId } = verifySchema.parse(body);

    // Check if item exists
    const item = await prisma.desktopItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing verifications for this email
    await prisma.commentVerification.deleteMany({
      where: { email },
    });

    // Create verification record
    await prisma.commentVerification.create({
      data: {
        email,
        token,
        itemId,
        expiresAt,
      },
    });

    // In production, you would send an email here with the verification link
    // For now, we'll just log it (or you can integrate with your email service)
    console.log(`Verification link for ${email}: /verify-comment?token=${token}`);

    // For development/demo purposes, we'll auto-verify
    // In production, remove this and actually send the email
    let commenter = await prisma.commenter.findUnique({
      where: { email },
    });

    if (!commenter) {
      commenter = await prisma.commenter.create({
        data: {
          email,
          verifiedAt: new Date(),
        },
      });
    } else if (!commenter.verifiedAt) {
      commenter = await prisma.commenter.update({
        where: { id: commenter.id },
        data: { verifiedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      // For demo purposes, include the verification data
      data: {
        commenterId: commenter.id,
        email: commenter.email,
        displayName: commenter.displayName,
        verifiedAt: commenter.verifiedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
