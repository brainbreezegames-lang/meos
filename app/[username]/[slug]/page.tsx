import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { NotePageView } from '@/components/views/NotePageView';
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
  const description = note.goosContent
    ? note.goosContent.replace(/<[^>]*>/g, '').slice(0, 160)
    : note.windowDescription?.slice(0, 160) || '';

  return {
    title: `${title} - ${user.name || user.username}`,
    description,
    openGraph: {
      title,
      description,
      images: note.windowHeaderImage ? [note.windowHeaderImage] : [],
      type: 'article',
      authors: [user.name || user.username],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: note.windowHeaderImage ? [note.windowHeaderImage] : [],
    },
  };
}

export default async function NoteArticlePage({ params }: PageProps) {
  const { username, slug } = await params;
  const result = await getNote(username, slug);

  if (!result) {
    notFound();
  }

  const { user, desktop, note } = result;

  // Validate theme
  const validThemes: ThemeId[] = ['monterey', 'dark', 'bluren', 'refined', 'warm', 'sketch'];
  const theme = validThemes.includes(desktop.theme as ThemeId)
    ? (desktop.theme as ThemeId)
    : 'sketch';

  const noteData = {
    id: note.id,
    title: note.windowTitle || note.label,
    subtitle: note.windowSubtitle || null,
    content: note.goosContent || '',
    headerImage: note.windowHeaderImage || null,
    publishedAt: note.publishedAt,
    fileType: (note.goosFileType || 'note') as 'note' | 'case-study',
    accessLevel: (note.accessLevel || 'free') as 'free' | 'paid' | 'email',
    priceAmount: note.goosPriceAmount ? Number(note.goosPriceAmount) : null,
    icon: note.windowIcon || null,
  };

  const authorData = {
    username: user.username,
    name: user.name || user.username,
    image: user.image || null,
  };

  // Get other published notes for "More Case Studies" section
  const otherNotes = desktop.items
    .filter((item) => item.id !== note.id)
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.windowTitle || item.label,
      subtitle: item.windowSubtitle || null,
      headerImage: item.windowHeaderImage || null,
    }));

  return (
    <NotePageView
      note={noteData}
      author={authorData}
      theme={theme}
      otherNotes={otherNotes}
    />
  );
}
