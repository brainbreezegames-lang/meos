import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { DesktopPageView } from '@/components/views/DesktopPageView';
import type { ThemeId } from '@/contexts/ThemeContext';

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getDesktop(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      desktop: {
        include: {
          items: {
            where: {
              itemVariant: 'goos-file',
              publishStatus: 'published',
              goosFileType: {
                in: ['note', 'case-study'],
              },
            },
            orderBy: { publishedAt: 'desc' },
          },
          view: true,
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
  const title = desktop.title || `${user.name || user.username}'s Portfolio`;
  const description = desktop.description || `All content from ${user.name || user.username}`;

  return {
    title: `${title} - Page View`,
    description,
    openGraph: {
      title: `${title} - Page View`,
      description,
      images: desktop.ogImageUrl ? [desktop.ogImageUrl] : [],
    },
  };
}

export default async function DesktopPageViewPage({ params }: PageProps) {
  const { username } = await params;
  const user = await getDesktop(username);

  if (!user || !user.desktop) {
    notFound();
  }

  if (!user.desktop.isPublic) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F9FE',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '48px',
            background: '#FFFFFF',
            border: '2px solid #2B4AE2',
            borderRadius: '8px',
            boxShadow: '4px 4px 0 #2B4AE2',
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔒</span>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#2B4AE2', marginBottom: '8px' }}>
            This desktop is private
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7FE8' }}>
            @{username} has made their desktop private.
          </p>
        </div>
      </div>
    );
  }

  // Validate theme
  const validThemes: ThemeId[] = ['monterey', 'dark', 'bluren', 'refined', 'warm', 'sketch'];
  const theme = validThemes.includes(user.desktop.theme as ThemeId)
    ? (user.desktop.theme as ThemeId)
    : 'sketch';

  // Transform items
  const items = user.desktop.items.map((item) => ({
    id: item.id,
    title: item.windowTitle || item.label,
    subtitle: item.windowSubtitle || null,
    content: item.goosContent || '',
    headerImage: item.windowHeaderImage || null,
    publishedAt: item.publishedAt,
    fileType: (item.goosFileType || 'note') as 'note' | 'case-study',
    accessLevel: (item.accessLevel || 'free') as 'free' | 'paid' | 'email',
    priceAmount: item.goosPriceAmount ? Number(item.goosPriceAmount) : null,
  }));

  const pageOrder = user.desktop.view?.pageOrder as string[] || [];

  const authorData = {
    username: user.username,
    name: user.name || user.username,
    image: user.image || null,
    title: user.desktop.title || null,
    description: user.desktop.description || null,
  };

  return (
    <DesktopPageView
      items={items}
      pageOrder={pageOrder}
      author={authorData}
      theme={theme}
    />
  );
}
