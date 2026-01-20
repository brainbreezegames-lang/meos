import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export const RESERVED_USERNAMES = [
  'edit',
  'settings',
  'api',
  'login',
  'signup',
  'admin',
  'dashboard',
  'help',
  'support',
  'about',
  'privacy',
  'terms',
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' };
  }
  if (!/^[a-z][a-z0-9-]*$/.test(username)) {
    return { valid: false, error: 'Username must start with a letter and contain only lowercase letters, numbers, and hyphens' };
  }
  if (/--/.test(username)) {
    return { valid: false, error: 'Username cannot contain consecutive hyphens' };
  }
  if (username.endsWith('-')) {
    return { valid: false, error: 'Username cannot end with a hyphen' };
  }
  if (RESERVED_USERNAMES.includes(username)) {
    return { valid: false, error: 'This username is reserved' };
  }
  return { valid: true };
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate URL-friendly slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
    .slice(0, 60);                 // Limit length
}

// Parse TipTap HTML content into slides for presentation
export function parseContentToSlides(htmlContent: string): {
  type: 'title' | 'content' | 'image';
  heading?: string;
  content?: string;
  imageUrl?: string;
  imageAlt?: string;
}[] {
  if (!htmlContent) return [];

  const slides: {
    type: 'title' | 'content' | 'image';
    heading?: string;
    content?: string;
    imageUrl?: string;
    imageAlt?: string;
  }[] = [];

  // Split by manual slide breaks (---)
  const sections = htmlContent.split(/<hr\s*\/?>/i);

  for (const section of sections) {
    if (!section.trim()) continue;

    // Check for H1/H2 headings as slide separators
    const headingMatch = section.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);

    // Check for images
    const imageMatches = section.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*?)["'])?[^>]*\/?>/gi);
    const images = [...imageMatches];

    // Each image gets its own slide
    for (const img of images) {
      slides.push({
        type: 'image',
        imageUrl: img[1],
        imageAlt: img[2] || '',
      });
    }

    // Strip images from section for text processing
    const textSection = section.replace(/<img[^>]*\/?>/gi, '');

    if (headingMatch || textSection.trim()) {
      // Split by H1/H2 for multiple content slides
      const headingParts = textSection.split(/<h[12][^>]*>/i);

      for (let i = 0; i < headingParts.length; i++) {
        const part = headingParts[i];
        if (!part.trim()) continue;

        // Extract heading if this part starts with closing heading tag
        const closeMatch = part.match(/^(.*?)<\/h[12]>([\s\S]*)/i);

        if (closeMatch) {
          const heading = closeMatch[1].replace(/<[^>]*>/g, '').trim();
          const body = closeMatch[2].replace(/<[^>]*>/g, '').trim();

          if (heading || body) {
            slides.push({
              type: heading ? 'title' : 'content',
              heading: heading || undefined,
              content: body || undefined,
            });
          }
        } else {
          // Just content, no heading
          const content = part.replace(/<[^>]*>/g, '').trim();
          if (content) {
            slides.push({
              type: 'content',
              content,
            });
          }
        }
      }
    }
  }

  // If no slides were created, create one from all content
  if (slides.length === 0 && htmlContent.trim()) {
    const text = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (text) {
      slides.push({
        type: 'content',
        content: text.slice(0, 500),
      });
    }
  }

  return slides;
}
