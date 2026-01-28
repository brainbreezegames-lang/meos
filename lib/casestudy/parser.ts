/**
 * Case Study Content Parser
 *
 * Parses TipTap HTML content into structured blocks for the
 * Belle Duffner-style case study layout.
 */

import type {
  ParsedCaseStudy,
  ContentBlock,
  ContentBlockType,
  ImageData,
  InfoGridItem,
  CardGridItem,
  ProcessStepperItem,
  ComparisonData,
  TableOfContentsEntry,
} from './types';

// Generate URL-safe slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Generate unique ID, handling duplicates
function generateId(text: string, existingIds: Set<string>): string {
  let slug = slugify(text);
  if (!slug) slug = 'section';

  let id = slug;
  let counter = 1;
  while (existingIds.has(id)) {
    id = `${slug}-${counter}`;
    counter++;
  }
  existingIds.add(id);
  return id;
}

// Extract src from img element
function extractImageSrc(imgEl: Element): string | null {
  return imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || null;
}

// Extract alt from img element
function extractImageAlt(imgEl: Element): string {
  return imgEl.getAttribute('alt') || '';
}

// Check if image is wide (aspect ratio > 16:9)
// For now, we'll default to full-width for all images
// In production, this could load the image and calculate
function determineImageLayout(src: string): 'full-width' | 'content-width' {
  // Heuristic: if image URL contains certain patterns, assume wide
  // Otherwise default to full-width for case studies (common pattern)
  const narrowPatterns = ['icon', 'logo', 'avatar', 'profile', 'thumb'];
  const srcLower = src.toLowerCase();

  for (const pattern of narrowPatterns) {
    if (srcLower.includes(pattern)) {
      return 'content-width';
    }
  }

  return 'full-width';
}

// Parse HTML content into case study structure
export function parseCaseStudyContent(
  html: string,
  headerImage?: string | null
): ParsedCaseStudy {
  // Handle empty content
  if (!html || !html.trim()) {
    return {
      heroImage: headerImage || null,
      tableOfContents: [],
      contentBlocks: [],
    };
  }

  // Parse HTML using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const contentBlocks: ContentBlock[] = [];
  const tableOfContents: TableOfContentsEntry[] = [];
  const usedIds = new Set<string>();

  let heroImage: string | null = headerImage || null;
  let blockIndex = 0;
  let foundFirstParagraph = false;
  let pendingImages: ImageData[] = [];

  // Flush any pending images as a grid or single
  const flushImages = () => {
    if (pendingImages.length === 0) return;

    if (pendingImages.length === 1) {
      contentBlocks.push({
        id: `block-${blockIndex++}`,
        type: 'image',
        content: pendingImages[0],
      });
    } else {
      contentBlocks.push({
        id: `block-${blockIndex++}`,
        type: 'image-grid',
        content: [...pendingImages],
      });
    }
    pendingImages = [];
  };

  // Process each child node
  const children = Array.from(body.children);

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    const tagName = node.tagName.toLowerCase();

    // Handle images - check for img tag or figure/picture
    if (tagName === 'img') {
      const src = extractImageSrc(node);
      if (src) {
        // First image becomes hero if no header image
        if (!heroImage) {
          heroImage = src;
          continue;
        }

        pendingImages.push({
          src,
          alt: extractImageAlt(node),
          layout: determineImageLayout(src),
        });
      }
      continue;
    }

    // Handle figure (wraps img)
    if (tagName === 'figure') {
      const img = node.querySelector('img');
      const figcaption = node.querySelector('figcaption');
      if (img) {
        const src = extractImageSrc(img);
        if (src) {
          if (!heroImage) {
            heroImage = src;
            continue;
          }

          pendingImages.push({
            src,
            alt: extractImageAlt(img),
            caption: figcaption?.textContent?.trim() || undefined,
            layout: determineImageLayout(src),
          });
        }
      }
      continue;
    }

    // Handle picture element
    if (tagName === 'picture') {
      const img = node.querySelector('img');
      if (img) {
        const src = extractImageSrc(img);
        if (src) {
          if (!heroImage) {
            heroImage = src;
            continue;
          }

          pendingImages.push({
            src,
            alt: extractImageAlt(img),
            layout: determineImageLayout(src),
          });
        }
      }
      continue;
    }

    // Non-image element - flush pending images first
    flushImages();

    // Check for inline image in paragraph
    if (tagName === 'p') {
      const inlineImg = node.querySelector('img');
      if (inlineImg && node.textContent?.trim() === '') {
        const src = extractImageSrc(inlineImg);
        if (src) {
          if (!heroImage) {
            heroImage = src;
            continue;
          }

          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'image',
            content: {
              src,
              alt: extractImageAlt(inlineImg),
              layout: determineImageLayout(src),
            },
          });
        }
        continue;
      }
    }

    // H4 - Section label (uppercase muted)
    if (tagName === 'h4') {
      const text = node.textContent?.trim() || '';
      if (text) {
        contentBlocks.push({
          id: `block-${blockIndex++}`,
          type: 'section-label',
          content: text,
        });
      }
      continue;
    }

    // H2 - Main section heading (goes in TOC)
    if (tagName === 'h2') {
      const text = node.textContent?.trim() || '';
      if (text) {
        const sectionId = generateId(text, usedIds);
        tableOfContents.push({ id: sectionId, title: text });

        contentBlocks.push({
          id: `block-${blockIndex++}`,
          type: 'heading-2',
          content: text,
          sectionId,
          level: 2,
        });
      }
      continue;
    }

    // H1 - Main heading
    if (tagName === 'h1') {
      const text = node.textContent?.trim() || '';
      if (text) {
        contentBlocks.push({
          id: `block-${blockIndex++}`,
          type: 'heading-1',
          content: text,
          level: 1,
        });
      }
      continue;
    }

    // H3 - Sub-heading
    if (tagName === 'h3') {
      const text = node.textContent?.trim() || '';
      if (text) {
        contentBlocks.push({
          id: `block-${blockIndex++}`,
          type: 'heading-3',
          content: text,
          level: 3,
        });
      }
      continue;
    }

    // Paragraph
    if (tagName === 'p') {
      const text = node.innerHTML?.trim() || '';
      if (text) {
        const isLead = !foundFirstParagraph;
        foundFirstParagraph = true;

        contentBlocks.push({
          id: `block-${blockIndex++}`,
          type: 'paragraph',
          content: text,
          isLead,
        });
      }
      continue;
    }

    // Blockquote
    if (tagName === 'blockquote') {
      const text = node.innerHTML?.trim() || '';
      if (text) {
        contentBlocks.push({
          id: `block-${blockIndex++}`,
          type: 'quote',
          content: text,
        });
      }
      continue;
    }

    // Unordered list
    if (tagName === 'ul') {
      contentBlocks.push({
        id: `block-${blockIndex++}`,
        type: 'list',
        content: node.innerHTML,
        listType: 'ul',
      });
      continue;
    }

    // Ordered list
    if (tagName === 'ol') {
      contentBlocks.push({
        id: `block-${blockIndex++}`,
        type: 'list',
        content: node.innerHTML,
        listType: 'ol',
      });
      continue;
    }

    // Code block
    if (tagName === 'pre') {
      const code = node.querySelector('code');
      const text = code?.textContent || node.textContent || '';
      if (text.trim()) {
        contentBlocks.push({
          id: `block-${blockIndex++}`,
          type: 'code',
          content: text,
        });
      }
      continue;
    }

    // Horizontal rule
    if (tagName === 'hr') {
      contentBlocks.push({
        id: `block-${blockIndex++}`,
        type: 'divider',
        content: '',
      });
      continue;
    }

    // Div - check for custom block types and nested content
    if (tagName === 'div') {
      const blockType = node.getAttribute('data-block-type');

      // Info grid block (project metadata)
      if (blockType === 'info-grid') {
        const items: InfoGridItem[] = [];
        const dtElements = node.querySelectorAll('dt');
        const ddElements = node.querySelectorAll('dd');
        for (let j = 0; j < dtElements.length; j++) {
          items.push({
            label: dtElements[j].textContent?.trim() || '',
            value: ddElements[j]?.textContent?.trim() || '',
          });
        }
        if (items.length > 0) {
          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'info-grid',
            content: items,
          });
        }
        continue;
      }

      // Callout block (highlighted insight)
      if (blockType === 'callout') {
        const variant = (node.getAttribute('data-variant') || 'insight') as 'insight' | 'warning' | 'success';
        const text = node.innerHTML?.trim() || '';
        if (text) {
          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'callout',
            content: text,
            variant,
          });
        }
        continue;
      }

      // Card grid block (stakeholder cards, feature cards)
      if (blockType === 'card-grid') {
        const cards: CardGridItem[] = [];
        const cardElements = node.querySelectorAll('[data-card]');
        for (let j = 0; j < cardElements.length; j++) {
          const card = cardElements[j];
          cards.push({
            icon: card.getAttribute('data-icon') || undefined,
            title: card.querySelector('[data-card-title]')?.textContent?.trim() || '',
            description: card.querySelector('[data-card-desc]')?.textContent?.trim() || '',
          });
        }
        if (cards.length > 0) {
          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'card-grid',
            content: cards,
          });
        }
        continue;
      }

      // Process stepper block (numbered design phases)
      if (blockType === 'process-stepper') {
        const steps: ProcessStepperItem[] = [];
        const stepElements = node.querySelectorAll('[data-step]');
        for (let j = 0; j < stepElements.length; j++) {
          const step = stepElements[j];
          steps.push({
            number: j + 1,
            label: step.getAttribute('data-label') || step.querySelector('[data-step-label]')?.textContent?.trim() || `Step ${j + 1}`,
            description: step.querySelector('[data-step-desc]')?.textContent?.trim() || step.textContent?.trim() || '',
          });
        }
        if (steps.length > 0) {
          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'process-stepper',
            content: steps,
          });
        }
        continue;
      }

      // Key takeaway block
      if (blockType === 'key-takeaway') {
        const text = node.innerHTML?.trim() || '';
        if (text) {
          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'key-takeaway',
            content: text,
          });
        }
        continue;
      }

      // Tool badges block
      if (blockType === 'tool-badges') {
        const tools: string[] = [];
        const toolElements = node.querySelectorAll('[data-tool]');
        if (toolElements.length > 0) {
          for (let j = 0; j < toolElements.length; j++) {
            const toolName = toolElements[j].textContent?.trim() || '';
            if (toolName) tools.push(toolName);
          }
        } else {
          // Fallback: split comma-separated text or data-tools attribute
          const toolsAttr = node.getAttribute('data-tools');
          if (toolsAttr) {
            tools.push(...toolsAttr.split(',').map(t => t.trim()).filter(Boolean));
          } else {
            const text = node.textContent?.trim() || '';
            if (text) tools.push(...text.split(',').map(t => t.trim()).filter(Boolean));
          }
        }
        if (tools.length > 0) {
          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'tool-badges',
            content: tools,
          });
        }
        continue;
      }

      // Comparison block (before/after)
      if (blockType === 'comparison') {
        const beforeEl = node.querySelector('[data-before]');
        const afterEl = node.querySelector('[data-after]');
        if (beforeEl && afterEl) {
          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'comparison',
            content: {
              beforeLabel: beforeEl.getAttribute('data-label') || 'Before',
              beforeContent: beforeEl.innerHTML?.trim() || beforeEl.textContent?.trim() || '',
              afterLabel: afterEl.getAttribute('data-label') || 'After',
              afterContent: afterEl.innerHTML?.trim() || afterEl.textContent?.trim() || '',
            } as ComparisonData,
          });
        }
        continue;
      }

      // Check for image inside div
      const img = node.querySelector('img');
      if (img) {
        const src = extractImageSrc(img);
        if (src) {
          if (!heroImage) {
            heroImage = src;
            continue;
          }

          contentBlocks.push({
            id: `block-${blockIndex++}`,
            type: 'image',
            content: {
              src,
              alt: extractImageAlt(img),
              layout: determineImageLayout(src),
            },
          });
        }
        continue;
      }

      // Otherwise treat div content as paragraph if it has text
      const text = node.innerHTML?.trim() || '';
      if (text && node.textContent?.trim()) {
        contentBlocks.push({
          id: `block-${blockIndex++}`,
          type: 'paragraph',
          content: text,
        });
      }
    }
  }

  // Flush any remaining images
  flushImages();

  return {
    heroImage,
    tableOfContents,
    contentBlocks,
  };
}

// Simple fallback parser for SSR (no DOMParser)
export function parseCaseStudyContentSimple(
  html: string,
  headerImage?: string | null
): ParsedCaseStudy {
  // Extract first image for hero using regex
  let heroImage = headerImage || null;
  if (!heroImage) {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      heroImage = imgMatch[1];
    }
  }

  // Extract H2s for TOC
  const tableOfContents: TableOfContentsEntry[] = [];
  const usedIds = new Set<string>();
  const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
  let match;

  while ((match = h2Regex.exec(html)) !== null) {
    const text = match[1].trim();
    if (text) {
      const id = generateId(text, usedIds);
      tableOfContents.push({ id, title: text });
    }
  }

  // Return minimal structure - full parsing happens client-side
  return {
    heroImage,
    tableOfContents,
    contentBlocks: [],
  };
}
