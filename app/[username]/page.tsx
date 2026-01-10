import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PublicDesktop } from '@/components/desktop/PublicDesktop';
import type { ThemeId } from '@/contexts/ThemeContext';
import type { DesktopItem, DockItem, Tab, Block } from '@prisma/client';

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getDesktop(username: string) {
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
            include: {
              tabs: {
                orderBy: { order: 'asc' },
                include: {
                  blocks: {
                    orderBy: { order: 'asc' },
                  },
                },
              },
              blocks: {
                orderBy: { order: 'asc' },
              },
            },
          },
          dockItems: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  return user;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getDesktop(username);

  if (!user || !user.desktop) {
    return {
      title: 'Not Found - MeOS',
    };
  }

  const desktop = user.desktop;
  const title = desktop.title || `${user.name || user.username}'s Desktop`;
  const description = desktop.description || `Check out ${user.name || user.username}'s personal desktop on MeOS`;

  return {
    title: `${title} - MeOS`,
    description,
    openGraph: {
      title,
      description,
      images: desktop.ogImageUrl ? [desktop.ogImageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: desktop.ogImageUrl ? [desktop.ogImageUrl] : [],
    },
  };
}

export default async function UserDesktopPage({ params }: PageProps) {
  const { username } = await params;
  const user = await getDesktop(username);

  if (!user || !user.desktop) {
    notFound();
  }

  if (!user.desktop.isPublic) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)' }}
      >
        <div
          className="text-center p-8 rounded-2xl max-w-md mx-4"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(40px)',
            boxShadow: 'var(--shadow-window)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--bg-solid)' }}
          >
            <svg className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            This desktop is private
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            @{username} has made their desktop private.
          </p>
        </div>
      </div>
    );
  }

  const desktop = {
    ...user.desktop,
    items: user.desktop.items.map((item: DesktopItem & { tabs: (Tab & { blocks: Block[] })[]; blocks: Block[] }) => ({
      ...item,
      windowDetails: item.windowDetails as { label: string; value: string }[] | null,
      windowGallery: item.windowGallery as { type: 'image' | 'video'; url: string }[] | null,
      windowLinks: item.windowLinks as { label: string; url: string }[] | null,
      tabs: item.tabs.map((tab) => ({
        ...tab,
        blocks: tab.blocks.map((block) => ({
          id: block.id,
          type: block.type,
          data: block.data as Record<string, unknown>,
          order: block.order,
        })),
      })),
      blocks: item.blocks.map((block) => ({
        id: block.id,
        type: block.type,
        data: block.data as Record<string, unknown>,
        order: block.order,
      })),
    })),
    dockItems: user.desktop.dockItems.map((item: DockItem) => ({
      ...item,
      actionType: item.actionType as 'url' | 'email' | 'download',
    })),
  };

  // Validate theme value from database
  const validThemes: ThemeId[] = ['monterey', 'dark', 'bluren', 'refined'];
  const theme = validThemes.includes(user.desktop.theme as ThemeId)
    ? (user.desktop.theme as ThemeId)
    : 'monterey';

  return (
    <PublicDesktop
      desktop={desktop}
      title={desktop.title || user.name || user.username}
      theme={theme}
    />
  );
}
