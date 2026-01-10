import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateSettingsSchema = z.object({
  theme: z.enum(['monterey', 'dark', 'bluren', 'refined']).optional(),
  backgroundUrl: z.string().url().optional().nullable(),
  backgroundPosition: z.enum(['cover', 'contain', 'center']).optional(),
  backgroundOverlay: z.string().optional().nullable(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    const desktop = await prisma.desktop.update({
      where: { userId: session.user.id },
      data,
      select: {
        id: true,
        theme: true,
        backgroundUrl: true,
        backgroundPosition: true,
        backgroundOverlay: true,
      },
    });

    return NextResponse.json({ success: true, data: desktop });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
