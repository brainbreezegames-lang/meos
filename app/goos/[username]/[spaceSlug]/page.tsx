import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGoOSViewContext } from '@/lib/goos/viewContext';
import { GoOSPublicDesktop } from '../GoOSPublicDesktop';

interface PageProps {
  params: Promise<{ username: string; spaceSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { username, spaceSlug } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true, image: true },
  });

  if (!user) {
    return { title: 'Not Found' };
  }

  const space = await prisma.space.findFirst({
    where: { userId: user.id, slug: spaceSlug },
    select: { name: true, title: true, description: true, ogImageUrl: true },
  });

  if (!space) {
    return { title: 'Not Found' };
  }

  const displayName = user.name || user.username;
  const spaceName = space.name;
  const title = space.title || `${spaceName} - ${displayName}'s goOS`;
  const description = space.description || `Explore ${displayName}'s ${spaceName} on goOS`;
  const url = `https://goos.io/${username}/${spaceSlug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'goOS',
      type: 'website',
      images: space.ogImageUrl ? [
        {
          url: space.ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName}'s ${spaceName}`,
        },
      ] : [
        {
          url: `/api/og/${username}/${spaceSlug}`,
          width: 1200,
          height: 630,
          alt: `${displayName}'s ${spaceName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [space.ogImageUrl || `/api/og/${username}/${spaceSlug}`],
    },
  };
}

export default async function PublicSpacePage({ params }: PageProps) {
  const { username, spaceSlug } = await params;
  const session = await getServerSession(authOptions);
  const viewContext = getGoOSViewContext(username, session);

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    notFound();
  }

  // Fetch the specific space by slug
  const space = await prisma.space.findFirst({
    where: {
      userId: user.id,
      slug: spaceSlug,
    },
  });

  if (!space) {
    notFound();
  }

  // Check if space is public (visitors only)
  if (!viewContext.canViewDrafts && !space.isPublic) {
    notFound();
  }

  // Fetch goOS files for this space
  const whereClause: Record<string, unknown> = {
    spaceId: space.id,
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
    theme: space.theme,
    backgroundUrl: space.backgroundUrl,
    isPublic: space.isPublic,
    spaceName: space.name,
    spaceIcon: space.icon,
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
