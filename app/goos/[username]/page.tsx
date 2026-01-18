import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGoOSViewContext } from '@/lib/goos/viewContext';
import { GoOSPublicDesktop } from './GoOSPublicDesktop';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true, image: true },
  });

  if (!user) {
    return { title: 'Not Found' };
  }

  const displayName = user.name || user.username;
  const title = `${displayName}'s goOS`;
  const description = `Explore ${displayName}'s digital workspace on goOS`;
  const url = `https://goos.io/${username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'goOS',
      type: 'website',
      images: [
        {
          url: `/api/og/${username}`,
          width: 1200,
          height: 630,
          alt: `${displayName}'s goOS desktop`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og/${username}`],
    },
  };
}

export default async function PublicGoOSPage({ params }: PageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  const viewContext = getGoOSViewContext(username, session);

  // Fetch user and desktop
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      desktop: true,
    },
  });

  if (!user || !user.desktop) {
    notFound();
  }

  // Check if desktop is public (visitors only)
  if (!viewContext.canViewDrafts && !user.desktop.isPublic) {
    notFound();
  }

  // Fetch goOS files
  const whereClause: Record<string, unknown> = {
    desktopId: user.desktop.id,
    itemVariant: 'goos-file',
  };

  // Visitors only see published files
  if (!viewContext.canViewDrafts) {
    whereClause.publishStatus = 'published';
  }

  const items = await prisma.desktopItem.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { children: true },
      },
    },
  });

  // Transform to GoOSFile format
  const files = items.map((item) => ({
    id: item.id,
    type: item.goosFileType as 'note' | 'case-study' | 'folder',
    title: item.label,
    // For locked files, don't send content to visitors (they need to unlock)
    content: (item.accessLevel === 'locked' && !viewContext.canViewDrafts) ? '' : (item.goosContent || ''),
    status: item.publishStatus as 'draft' | 'published',
    accessLevel: item.accessLevel as 'public' | 'locked',
    publishedAt: item.publishedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    parentId: item.parentItemId,
    position: { x: item.positionX, y: item.positionY },
    childCount: item._count.children,
  }));

  const desktopData = {
    username: user.username,
    name: user.name,
    theme: user.desktop.theme,
    backgroundUrl: user.desktop.backgroundUrl,
    isPublic: user.desktop.isPublic,
  };

  return (
    <GoOSPublicDesktop
      desktop={desktopData}
      files={files}
      viewMode={viewContext.mode}
      isOwner={viewContext.canEdit}
    />
  );
}
