import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { NotePresentView } from '@/components/views/NotePresentView';
import { generateSlug } from '@/lib/utils';
import type { ThemeId } from '@/contexts/ThemeContext';

interface PageProps {
  params: Promise<{ username: string; slug: string }>;
}

async function getNote(username: string, slug: string) {
  // Find user by username
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
          },
        },
      },
    },
  });

  if (!user || !user.desktop) return null;

  // Find the note by matching slug
  const note = user.desktop.items.find((item) => {
    const itemSlug = generateSlug(item.label);
    return itemSlug === slug || item.id === slug; // Match by slug or ID
  });

  if (!note) return null;

  return { user, desktop: user.desktop, note };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const result = await getNote(username, slug);

  if (!result) {
    return {
      title: 'Not Found - MeOS',
    };
  }

  const { user, note } = result;
  const title = note.windowTitle || note.label;

  return {
    title: `${title} - Presentation`,
    description: `Presentation view of ${title} by ${user.name || user.username}`,
    openGraph: {
      title: `${title} - Presentation`,
      images: note.windowHeaderImage ? [note.windowHeaderImage] : [],
    },
  };
}

export default async function NotePresentPage({ params }: PageProps) {
  const { username, slug } = await params;
  const result = await getNote(username, slug);

  if (!result) {
    notFound();
  }

  const { user, note } = result;

  const noteData = {
    id: note.id,
    title: note.windowTitle || note.label,
    subtitle: note.windowSubtitle || null,
    content: note.goosContent || '',
    headerImage: note.windowHeaderImage || null,
    fileType: (note.goosFileType || 'note') as 'note' | 'case-study',
  };

  const authorData = {
    username: user.username,
    name: user.name || user.username,
  };

  return (
    <NotePresentView
      note={noteData}
      author={authorData}
    />
  );
}
