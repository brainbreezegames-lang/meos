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
 * Simplified for reliability - processes content sequentially
 */
export function parseNoteToSlidesSimple(note: NoteInput): Slide[] {
  const slides: Slide[] = [];
  const content = note.content;

  // 1. Title Slide (always first)
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

  // Parse HTML content into ordered blocks using DOMParser for proper div handling
  const blocks: { type: string; content: string; items?: string[]; src?: string; alt?: string }[] = [];

  if (typeof DOMParser !== 'undefined') {
    // Use DOMParser for reliable parsing of nested elements
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(`<div>${content}</div>`, 'text/html');
    const container = doc.body.firstChild as HTMLElement;

    if (container) {
      for (const child of Array.from(container.children)) {
        const tagName = child.tagName.toLowerCase();
        const text = child.textContent?.trim() || '';

        switch (tagName) {
          case 'h1':
            if (text) blocks.push({ type: 'h1', content: text });
            break;
          case 'h2':
            if (text) blocks.push({ type: 'h2', content: text });
            break;
          case 'h3':
            if (text) blocks.push({ type: 'h3', content: text });
            break;
          case 'h4':
            // Section labels become subheadings
            if (text) blocks.push({ type: 'h3', content: text });
            break;
          case 'p': {
            const img = child.querySelector('img');
            if (img && !text.replace(img.textContent || '', '').trim()) {
              blocks.push({
                type: 'image',
                content: '',
                src: img.getAttribute('src') || '',
                alt: img.getAttribute('alt') || '',
              });
            } else if (text) {
              blocks.push({ type: 'p', content: text });
            }
            break;
          }
          case 'img':
            blocks.push({
              type: 'image',
              content: '',
              src: child.getAttribute('src') || '',
              alt: child.getAttribute('alt') || '',
            });
            break;
          case 'blockquote':
            if (text) blocks.push({ type: 'quote', content: text });
            break;
          case 'ul':
          case 'ol': {
            const items = Array.from(child.querySelectorAll('li'))
              .map(li => li.textContent?.trim() || '')
              .filter(Boolean);
            if (items.length > 0) blocks.push({ type: 'list', content: '', items });
            break;
          }
          case 'hr':
            blocks.push({ type: 'hr', content: '' });
            break;
          case 'figure': {
            const figImg = child.querySelector('img');
            if (figImg) {
              blocks.push({
                type: 'image',
                content: '',
                src: figImg.getAttribute('src') || '',
                alt: child.querySelector('figcaption')?.textContent?.trim() || figImg.getAttribute('alt') || '',
              });
            }
            break;
          }
          case 'div': {
            const blockType = child.getAttribute('data-block-type');
            if (blockType === 'info-grid') {
              // Convert info-grid to a list of "Label: Value" items
              const dts = child.querySelectorAll('dt');
              const dds = child.querySelectorAll('dd');
              const items: string[] = [];
              for (let j = 0; j < dts.length; j++) {
                const label = dts[j].textContent?.trim() || '';
                const value = dds[j]?.textContent?.trim() || '';
                if (label && value) items.push(`${label}: ${value}`);
              }
              if (items.length > 0) blocks.push({ type: 'list', content: '', items });
            } else if (blockType === 'callout') {
              // Callout becomes a quote slide
              if (text) blocks.push({ type: 'quote', content: text });
            } else if (blockType === 'card-grid') {
              // Card grid becomes a list of card titles + descriptions
              const cards = child.querySelectorAll('[data-card]');
              const items: string[] = [];
              for (let j = 0; j < cards.length; j++) {
                const title = cards[j].querySelector('[data-card-title]')?.textContent?.trim() || '';
                const desc = cards[j].querySelector('[data-card-desc]')?.textContent?.trim() || '';
                if (title) items.push(desc ? `${title} — ${desc}` : title);
              }
              if (items.length > 0) blocks.push({ type: 'list', content: '', items });
            } else if (blockType === 'process-stepper') {
              // Process stepper becomes a numbered list
              const steps = child.querySelectorAll('[data-step]');
              const items: string[] = [];
              for (let j = 0; j < steps.length; j++) {
                const label = steps[j].getAttribute('data-label') ||
                  steps[j].querySelector('[data-step-label]')?.textContent?.trim() || `Step ${j + 1}`;
                const desc = steps[j].querySelector('[data-step-desc]')?.textContent?.trim() || '';
                items.push(desc ? `${label} — ${desc}` : label);
              }
              if (items.length > 0) blocks.push({ type: 'list', content: '', items });
            } else if (blockType === 'key-takeaway') {
              // Key takeaway becomes a quote slide
              if (text) blocks.push({ type: 'quote', content: text });
            } else if (blockType === 'tool-badges') {
              // Tool badges become a paragraph listing tools
              const toolEls = child.querySelectorAll('[data-tool]');
              const tools: string[] = [];
              if (toolEls.length > 0) {
                for (let j = 0; j < toolEls.length; j++) {
                  const t = toolEls[j].textContent?.trim();
                  if (t) tools.push(t);
                }
              }
              if (tools.length > 0) {
                blocks.push({ type: 'p', content: `Tools: ${tools.join(', ')}` });
              }
            } else if (blockType === 'comparison') {
              // Comparison becomes two paragraphs
              const beforeEl = child.querySelector('[data-before]');
              const afterEl = child.querySelector('[data-after]');
              if (beforeEl) {
                const label = beforeEl.getAttribute('data-label') || 'Before';
                blocks.push({ type: 'p', content: `${label}: ${beforeEl.textContent?.trim() || ''}` });
              }
              if (afterEl) {
                const label = afterEl.getAttribute('data-label') || 'After';
                blocks.push({ type: 'p', content: `${label}: ${afterEl.textContent?.trim() || ''}` });
              }
            } else {
              // Generic div - treat as paragraph if has text
              if (text) blocks.push({ type: 'p', content: text });
            }
            break;
          }
        }
      }
    }
  } else {
    // Fallback: regex-based tokenization for SSR
    const tokenRegex = /<(h1|h2|h3|p|img|blockquote|ul|ol|hr)[^>]*>[\s\S]*?<\/\1>|<(img|hr)[^>]*\/?>/gi;
    const tokens = content.match(tokenRegex) || [];

    for (const token of tokens) {
      if (token.match(/^<h1/i)) {
        const text = stripHtml(token);
        if (text) blocks.push({ type: 'h1', content: text });
      } else if (token.match(/^<h2/i)) {
        const text = stripHtml(token);
        if (text) blocks.push({ type: 'h2', content: text });
      } else if (token.match(/^<h3/i)) {
        const text = stripHtml(token);
        if (text) blocks.push({ type: 'h3', content: text });
      } else if (token.match(/^<p/i)) {
        const imgMatch = token.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        const altMatch = token.match(/alt=["']([^"']*)["']/i);
        if (imgMatch) {
          const textOnly = stripHtml(token.replace(/<img[^>]*>/gi, ''));
          if (!textOnly.trim()) {
            blocks.push({ type: 'image', content: '', src: imgMatch[1], alt: altMatch?.[1] || '' });
          } else {
            blocks.push({ type: 'image', content: textOnly, src: imgMatch[1], alt: altMatch?.[1] || '' });
          }
        } else {
          const text = stripHtml(token);
          if (text) blocks.push({ type: 'p', content: text });
        }
      } else if (token.match(/^<img/i)) {
        const srcMatch = token.match(/src=["']([^"']+)["']/i);
        const altMatch = token.match(/alt=["']([^"']*)["']/i);
        if (srcMatch) {
          blocks.push({ type: 'image', content: '', src: srcMatch[1], alt: altMatch?.[1] || '' });
        }
      } else if (token.match(/^<blockquote/i)) {
        const text = stripHtml(token);
        if (text) blocks.push({ type: 'quote', content: text });
      } else if (token.match(/^<(ul|ol)/i)) {
        const items = [...token.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
          .map(m => stripHtml(m[1]))
          .filter(Boolean);
        if (items.length > 0) blocks.push({ type: 'list', content: '', items });
      } else if (token.match(/^<hr/i)) {
        blocks.push({ type: 'hr', content: '' });
      }
    }
  }

  // Convert blocks to slides
  let currentHeading = '';
  let pendingContent: string[] = [];
  let pendingItems: string[] = [];

  const flushContent = () => {
    if (pendingContent.length > 0) {
      const body = pendingContent.join('\n\n');
      const chunks = splitText(body);
      chunks.forEach((chunk, idx) => {
        slides.push({
          id: generateId(),
          template: 'content',
          content: {
            heading: currentHeading && idx === 0 ? currentHeading : undefined,
            body: chunk,
          },
        });
      });
      pendingContent = [];
    }
    if (pendingItems.length > 0) {
      const chunks = splitList(pendingItems);
      chunks.forEach((items, idx) => {
        slides.push({
          id: generateId(),
          template: 'list',
          content: {
            heading: currentHeading && idx === 0 ? currentHeading : undefined,
            items,
          },
        });
      });
      pendingItems = [];
    }
  };

  for (const block of blocks) {
    switch (block.type) {
      case 'h1':
        flushContent();
        currentHeading = '';
        slides.push({
          id: generateId(),
          template: 'section',
          content: { heading: block.content },
        });
        break;

      case 'h2':
        flushContent();
        currentHeading = block.content;
        break;

      case 'h3':
        // Treat H3 as a smaller heading - add to pending content
        if (block.content) {
          pendingContent.push(`**${block.content}**`);
        }
        break;

      case 'p':
        pendingContent.push(block.content);
        break;

      case 'image':
        flushContent();
        if (block.src) {
          slides.push({
            id: generateId(),
            template: 'image',
            content: {
              heading: currentHeading || undefined,
              image: block.src,
              caption: block.alt || block.content || undefined,
            },
          });
          currentHeading = ''; // Clear heading after image
        }
        break;

      case 'quote':
        flushContent();
        // Check for attribution (— or -)
        const lines = block.content.split('\n');
        let quote = block.content;
        let attribution: string | undefined;

        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.startsWith('—') || (line.startsWith('-') && !line.startsWith('--'))) {
            attribution = line.replace(/^[—-]\s*/, '').trim();
            quote = lines.slice(0, i).join('\n').trim();
            break;
          }
        }

        slides.push({
          id: generateId(),
          template: 'quote',
          content: { quote, attribution },
        });
        break;

      case 'list':
        if (block.items) {
          pendingItems.push(...block.items);
        }
        break;

      case 'hr':
        flushContent();
        currentHeading = '';
        break;
    }
  }

  // Flush any remaining content
  flushContent();

  // If we only have title slide (no content), add the note content as a simple slide
  if (slides.length === 1 && content.trim()) {
    const plainText = stripHtml(content);
    if (plainText.trim()) {
      const chunks = splitText(plainText);
      chunks.forEach((body) => {
        slides.push({
          id: generateId(),
          template: 'content',
          content: { body },
        });
      });
    }
  }

  // End Slide (always last)
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
