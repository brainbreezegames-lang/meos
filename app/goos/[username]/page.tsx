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
    select: { name: true, username: true },
  });

  if (!user) {
    return { title: 'Not Found' };
  }

  return {
    title: `${user.name || user.username}'s goOS`,
    description: `Explore ${user.name || user.username}'s digital workspace`,
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
    content: item.goosContent || '',
    status: item.publishStatus as 'draft' | 'published',
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
