import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const unlockSchema = z.object({
  fileId: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
});

// POST /api/goos/unlock - Unlock content with email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = unlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid input' } },
        { status: 400 }
      );
    }

    const { fileId, email, username } = parsed.data;

    // Find the user who owns the file
    const user = await prisma.user.findUnique({
      where: { username },
      include: { desktop: true },
    });

    if (!user || !user.desktop) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Verify the file exists and is locked
    const file = await prisma.desktopItem.findFirst({
      where: {
        id: fileId,
        desktopId: user.desktop.id,
        itemVariant: 'goos-file',
        accessLevel: 'locked',
      },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'File not found or not locked' } },
        { status: 404 }
      );
    }

    // Store the email capture (create or update)
    await prisma.emailCapture.upsert({
      where: {
        email_desktopId: {
          email,
          desktopId: user.desktop.id,
        },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        email,
        desktopId: user.desktop.id,
        sourceFileId: fileId,
      },
    });

    // Return the file content for the visitor
    return NextResponse.json({
      success: true,
      data: {
        id: file.id,
        content: file.goosContent || '',
      },
    });
  } catch (error) {
    console.error('Email unlock error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// GET /api/goos/unlock - Check if user has already unlocked
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const fileId = searchParams.get('fileId');
    const username = searchParams.get('username');

    if (!email || !fileId || !username) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Missing parameters' } },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { username },
      include: { desktop: true },
    });

    if (!user || !user.desktop) {
      return NextResponse.json({ success: true, data: { unlocked: false } });
    }

    // Check if email has unlocked this desktop
    const capture = await prisma.emailCapture.findUnique({
      where: {
        email_desktopId: {
          email,
          desktopId: user.desktop.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { unlocked: !!capture },
    });
  } catch (error) {
    console.error('Check unlock error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
