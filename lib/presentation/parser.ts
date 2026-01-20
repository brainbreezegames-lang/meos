/**
 * goOS Presentation Parser
 *
 * Transforms Note content into slides using fixed templates.
 * No AI. No customization. Just beautiful, consistent output.
 */

// Slide template types
export type SlideTemplate =
  | 'title'
  | 'section'
  | 'content'
  | 'image'
  | 'image-text'
  | 'quote'
  | 'list'
  | 'stat'
  | 'end';

// Slide content structure
export interface SlideContent {
  heading?: string;
  subheading?: string;
  body?: string;
  image?: string;
  caption?: string;
  quote?: string;
  attribution?: string;
  items?: string[];
  stat_value?: string;
  stat_label?: string;
  author?: string;
  date?: string;
  url?: string;
}

// Slide object
export interface Slide {
  id: string;
  template: SlideTemplate;
  content: SlideContent;
  speakerNotes?: string;
}

// Note input
export interface NoteInput {
  id: string;
  title: string;
  subtitle?: string;
  content: string; // HTML content from TipTap
  author: string;
  username: string;
  date?: Date;
  headerImage?: string;
}

// Block types from parsing
interface ParsedBlock {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'image' | 'blockquote' | 'list' | 'stat' | 'hr';
  text?: string;
  html?: string;
  items?: string[];
  imageUrl?: string;
  imageAlt?: string;
  statValue?: string;
  statLabel?: string;
  attribution?: string;
  speakerNotes?: string;
}

/**
 * Parse HTML content into blocks
 */
function parseHtmlToBlocks(html: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];

  // Create a temporary container to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;

  if (!container) return blocks;

  const children = Array.from(container.children);

  for (const child of children) {
    const tagName = child.tagName.toLowerCase();
    const text = child.textContent?.trim() || '';

    // Extract speaker notes [note: text]
    const noteMatch = text.match(/\[note:\s*(.+?)\]/);
    const speakerNotes = noteMatch ? noteMatch[1] : undefined;
    const cleanText = text.replace(/\[note:\s*.+?\]/g, '').trim();

    // Check for stat syntax [stat: VALUE: LABEL]
    const statMatch = cleanText.match(/\[stat:\s*(.+?):\s*(.+?)\]/);
    if (statMatch) {
      blocks.push({
        type: 'stat',
        statValue: statMatch[1].trim(),
        statLabel: statMatch[2].trim(),
        speakerNotes,
      });
      continue;
    }

    switch (tagName) {
      case 'h1':
        blocks.push({ type: 'h1', text: cleanText, speakerNotes });
        break;

      case 'h2':
        blocks.push({ type: 'h2', text: cleanText, speakerNotes });
        break;

      case 'h3':
        blocks.push({ type: 'h3', text: cleanText, speakerNotes });
        break;

      case 'p':
        // Check if paragraph contains only an image
        const img = child.querySelector('img');
        if (img && cleanText === '') {
          blocks.push({
            type: 'image',
            imageUrl: img.getAttribute('src') || '',
            imageAlt: img.getAttribute('alt') || '',
            speakerNotes,
          });
        } else if (cleanText) {
          blocks.push({ type: 'paragraph', text: cleanText, html: child.innerHTML, speakerNotes });
        }
        break;

      case 'img':
        blocks.push({
          type: 'image',
          imageUrl: (child as HTMLImageElement).src || child.getAttribute('src') || '',
          imageAlt: (child as HTMLImageElement).alt || child.getAttribute('alt') || '',
          speakerNotes,
        });
        break;

      case 'blockquote':
        // Check for attribution (line starting with — or -)
        const lines = cleanText.split('\n');
        let quoteText = cleanText;
        let attribution: string | undefined;

        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.startsWith('—') || line.startsWith('-')) {
            attribution = line.replace(/^[—-]\s*/, '').trim();
            quoteText = lines.slice(0, i).join('\n').trim();
            break;
          }
        }

        blocks.push({ type: 'blockquote', text: quoteText, attribution, speakerNotes });
        break;

      case 'ul':
      case 'ol':
        const listItems = Array.from(child.querySelectorAll('li'))
          .map(li => li.textContent?.trim() || '')
          .filter(Boolean);
        blocks.push({ type: 'list', items: listItems, speakerNotes });
        break;

      case 'hr':
        blocks.push({ type: 'hr', speakerNotes });
        break;

      case 'figure':
        const figImg = child.querySelector('img');
        const figCaption = child.querySelector('figcaption');
        if (figImg) {
          blocks.push({
            type: 'image',
            imageUrl: figImg.getAttribute('src') || '',
            imageAlt: figCaption?.textContent?.trim() || figImg.getAttribute('alt') || '',
            speakerNotes,
          });
        }
        break;
    }
  }

  return blocks;
}

/**
 * Get the first paragraph if it's short (for subtitle)
 */
function getFirstParagraphIfShort(blocks: ParsedBlock[], maxWords = 30): string | undefined {
  const firstParagraph = blocks.find(b => b.type === 'paragraph');
  if (!firstParagraph?.text) return undefined;

  const wordCount = firstParagraph.text.split(/\s+/).length;
  if (wordCount <= maxWords) {
    return firstParagraph.text;
  }
  return undefined;
}

/**
 * Split long text into chunks
 */
function splitText(text: string, maxWords = 150): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }

  return chunks;
}

/**
 * Split list into chunks
 */
function splitList(items: string[], maxItems = 6): string[][] {
  const chunks: string[][] = [];

  for (let i = 0; i < items.length; i += maxItems) {
    chunks.push(items.slice(i, i + maxItems));
  }

  return chunks;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Main parser: Convert Note to Slides
 */
export function parseNoteToSlides(note: NoteInput): Slide[] {
  const slides: Slide[] = [];
  const blocks = parseHtmlToBlocks(note.content);

  // Track used first paragraph
  const subtitleText = getFirstParagraphIfShort(blocks);
  let usedFirstParagraph = false;

  // 1. Title Slide (always first)
  slides.push({
    id: generateId(),
    template: 'title',
    content: {
      heading: note.title,
      subheading: note.subtitle || subtitleText,
      author: note.author,
      date: note.date?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      image: note.headerImage,
    },
  });

  if (subtitleText) usedFirstParagraph = true;

  // 2. Parse blocks
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];

    // Skip first paragraph if used as subtitle
    if (usedFirstParagraph && i === 0 && block.type === 'paragraph') {
      i++;
      continue;
    }

    switch (block.type) {
      case 'h1':
        // Section Header slide
        slides.push({
          id: generateId(),
          template: 'section',
          content: { heading: block.text },
          speakerNotes: block.speakerNotes,
        });
        i++;
        break;

      case 'h2':
        // Look ahead to see what follows
        const followingBlocks: ParsedBlock[] = [];
        let j = i + 1;

        while (j < blocks.length && !['h1', 'h2', 'hr'].includes(blocks[j].type)) {
          followingBlocks.push(blocks[j]);
          j++;
        }

        const hasList = followingBlocks.some(b => b.type === 'list');
        const hasImage = followingBlocks.some(b => b.type === 'image');
        const paragraphs = followingBlocks.filter(b => b.type === 'paragraph');
        const totalText = paragraphs.map(p => p.text || '').join(' ');
        const totalWordCount = totalText.split(/\s+/).filter(Boolean).length;

        if (hasList) {
          // List Slide(s)
          const listBlock = followingBlocks.find(b => b.type === 'list');
          const listItems = listBlock?.items || [];
          const chunks = splitList(listItems);

          chunks.forEach((items, idx) => {
            slides.push({
              id: generateId(),
              template: 'list',
              content: {
                heading: idx === 0 ? block.text : `${block.text} (continued)`,
                items,
              },
              speakerNotes: idx === 0 ? block.speakerNotes : undefined,
            });
          });
        } else if (hasImage && totalWordCount < 50) {
          // Image + Text Slide
          const imageBlock = followingBlocks.find(b => b.type === 'image');
          slides.push({
            id: generateId(),
            template: 'image-text',
            content: {
              heading: block.text,
              image: imageBlock?.imageUrl,
              caption: imageBlock?.imageAlt,
              body: totalText,
            },
            speakerNotes: block.speakerNotes,
          });
        } else if (totalText) {
          // Content Slide(s) - auto-split if too long
          const chunks = splitText(totalText);

          chunks.forEach((body, idx) => {
            slides.push({
              id: generateId(),
              template: 'content',
              content: {
                heading: idx === 0 ? block.text : `${block.text} (continued)`,
                body,
              },
              speakerNotes: idx === 0 ? block.speakerNotes : undefined,
            });
          });
        } else {
          // H2 with no content - treat as section
          slides.push({
            id: generateId(),
            template: 'section',
            content: { heading: block.text },
            speakerNotes: block.speakerNotes,
          });
        }

        i = j;
        break;

      case 'image':
        // Full-bleed Image Slide
        slides.push({
          id: generateId(),
          template: 'image',
          content: {
            image: block.imageUrl,
            caption: block.imageAlt,
          },
          speakerNotes: block.speakerNotes,
        });
        i++;
        break;

      case 'blockquote':
        // Quote Slide
        slides.push({
          id: generateId(),
          template: 'quote',
          content: {
            quote: block.text,
            attribution: block.attribution,
          },
          speakerNotes: block.speakerNotes,
        });
        i++;
        break;

      case 'stat':
        // Stats Slide
        slides.push({
          id: generateId(),
          template: 'stat',
          content: {
            stat_value: block.statValue,
            stat_label: block.statLabel,
          },
          speakerNotes: block.speakerNotes,
        });
        i++;
        break;

      case 'list':
        // Standalone list (no heading)
        const chunks = splitList(block.items || []);

        chunks.forEach((items) => {
          slides.push({
            id: generateId(),
            template: 'list',
            content: { items },
            speakerNotes: block.speakerNotes,
          });
        });
        i++;
        break;

      case 'paragraph':
        // Standalone paragraph - Content Slide with no heading
        if (block.text) {
          const textChunks = splitText(block.text);
          textChunks.forEach((body) => {
            slides.push({
              id: generateId(),
              template: 'content',
              content: { body },
              speakerNotes: block.speakerNotes,
            });
          });
        }
        i++;
        break;

      case 'hr':
        // Horizontal rule - just a break marker, skip
        i++;
        break;

      default:
        i++;
    }
  }

  // 3. End Slide (always last)
  slides.push({
    id: generateId(),
    template: 'end',
    content: {
      url: `${note.username}.goos.io`,
      author: note.author,
    },
  });

  return slides;
}

/**
 * Browser-safe parser using regex (for client-side without DOMParser)
 */
export function parseNoteToSlidesSimple(note: NoteInput): Slide[] {
  const slides: Slide[] = [];
  const content = note.content;

  // 1. Title Slide
  slides.push({
    id: generateId(),
    template: 'title',
    content: {
      heading: note.title,
      subheading: note.subtitle,
      author: note.author,
      date: note.date?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      image: note.headerImage,
    },
  });

  // Parse content using regex
  // H1 headers
  const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gi;
  // H2 headers
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  // H3 headers
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;
  // Paragraphs
  const pRegex = /<p[^>]*>(.*?)<\/p>/gi;
  // Images
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  // Blockquotes
  const blockquoteRegex = /<blockquote[^>]*>(.*?)<\/blockquote>/gis;
  // Lists
  const ulRegex = /<ul[^>]*>(.*?)<\/ul>/gis;
  const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
  // Stats
  const statRegex = /\[stat:\s*(.+?):\s*(.+?)\]/g;
  // HR
  const hrRegex = /<hr\s*\/?>/gi;

  // Split by major elements
  const elements: { type: string; content: string; match?: RegExpMatchArray }[] = [];

  let workingContent = content;

  // Extract H1s
  let match;
  while ((match = h1Regex.exec(content)) !== null) {
    elements.push({ type: 'h1', content: stripHtml(match[1]) });
  }

  // Extract H2s with following content
  const h2Matches = [...content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  for (const h2Match of h2Matches) {
    const h2Text = stripHtml(h2Match[1]);
    const h2Index = h2Match.index!;

    // Find content until next H1, H2, or HR
    const nextHeadingMatch = content.slice(h2Index + h2Match[0].length).match(/<(h1|h2|hr)[^>]*>/i);
    const endIndex = nextHeadingMatch
      ? h2Index + h2Match[0].length + nextHeadingMatch.index!
      : content.length;

    const sectionContent = content.slice(h2Index + h2Match[0].length, endIndex);

    // Check for list
    const listMatch = sectionContent.match(/<ul[^>]*>(.*?)<\/ul>/is);
    if (listMatch) {
      const items = [...listMatch[1].matchAll(/<li[^>]*>(.*?)<\/li>/gi)]
        .map(m => stripHtml(m[1]))
        .filter(Boolean);

      if (items.length > 0) {
        const chunks = splitList(items);
        chunks.forEach((chunkItems, idx) => {
          slides.push({
            id: generateId(),
            template: 'list',
            content: {
              heading: idx === 0 ? h2Text : `${h2Text} (continued)`,
              items: chunkItems,
            },
          });
        });
        continue;
      }
    }

    // Check for blockquote
    const quoteMatch = sectionContent.match(/<blockquote[^>]*>(.*?)<\/blockquote>/is);
    if (quoteMatch) {
      const quoteText = stripHtml(quoteMatch[1]);
      // Check for attribution
      const lines = quoteText.split('\n');
      let quote = quoteText;
      let attribution: string | undefined;

      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim().startsWith('—') || lines[i].trim().startsWith('-')) {
          attribution = lines[i].trim().replace(/^[—-]\s*/, '');
          quote = lines.slice(0, i).join('\n').trim();
          break;
        }
      }

      slides.push({
        id: generateId(),
        template: 'quote',
        content: { quote, attribution },
      });
      continue;
    }

    // Check for image
    const imgMatch = sectionContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/i);
    const paragraphText = stripHtml(sectionContent.replace(/<img[^>]*>/gi, ''));
    const wordCount = paragraphText.split(/\s+/).filter(Boolean).length;

    if (imgMatch && wordCount < 50) {
      // Image + Text slide
      slides.push({
        id: generateId(),
        template: 'image-text',
        content: {
          heading: h2Text,
          image: imgMatch[1],
          caption: imgMatch[2],
          body: paragraphText,
        },
      });
    } else if (paragraphText) {
      // Content slide(s)
      const chunks = splitText(paragraphText);
      chunks.forEach((body, idx) => {
        slides.push({
          id: generateId(),
          template: 'content',
          content: {
            heading: idx === 0 ? h2Text : `${h2Text} (continued)`,
            body,
          },
        });
      });
    } else {
      // Section slide
      slides.push({
        id: generateId(),
        template: 'section',
        content: { heading: h2Text },
      });
    }
  }

  // Extract standalone blockquotes
  const blockquoteMatches = [...content.matchAll(/<blockquote[^>]*>(.*?)<\/blockquote>/gis)];
  for (const bqMatch of blockquoteMatches) {
    // Check if already processed (under an H2)
    const bqIndex = bqMatch.index!;
    const precedingH2 = content.slice(0, bqIndex).match(/<h2[^>]*>/gi);
    if (!precedingH2 || precedingH2.length === 0) {
      const quoteText = stripHtml(bqMatch[1]);
      slides.push({
        id: generateId(),
        template: 'quote',
        content: { quote: quoteText },
      });
    }
  }

  // Extract stats
  const statMatches = [...content.matchAll(statRegex)];
  for (const statMatch of statMatches) {
    slides.push({
      id: generateId(),
      template: 'stat',
      content: {
        stat_value: statMatch[1].trim(),
        stat_label: statMatch[2].trim(),
      },
    });
  }

  // Extract standalone images
  const imgMatches = [...content.matchAll(imgRegex)];
  for (const imgMatch of imgMatches) {
    // Check if inside a paragraph with text or under H2
    const imgIndex = imgMatch.index!;
    const surroundingText = content.slice(Math.max(0, imgIndex - 100), Math.min(content.length, imgIndex + 100));
    const isStandalone = !surroundingText.match(/<p[^>]*>[^<]*<img/i);

    if (isStandalone) {
      slides.push({
        id: generateId(),
        template: 'image',
        content: {
          image: imgMatch[1],
          caption: imgMatch[2],
        },
      });
    }
  }

  // 3. End Slide
  slides.push({
    id: generateId(),
    template: 'end',
    content: {
      url: `${note.username}.goos.io`,
      author: note.author,
    },
  });

  return slides;
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
