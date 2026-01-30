import { NextRequest } from 'next/server';

export const maxDuration = 120;

/**
 * Lightweight AI endpoint for the desktop chat assistant.
 * Takes a user message, determines what to create, generates content, and streams it back.
 * Creates ONE item per request (file or widget).
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-pro-preview';

// Prompt to understand what the user wants to create
const INTENT_PROMPT = `You are a helpful assistant inside a personal workspace app called MeOS (a macOS-style web desktop).
The user is asking you to create something for their desktop workspace.

Available FILE types you can create:
- note: Rich text note (HTML content)
- case-study: Detailed case study document (HTML content)
- board: Kanban board with columns and cards (JSON)
- sheet: Spreadsheet with rows and columns (JSON)
- cv: Professional resume/CV (JSON — use getDefaultCVContent structure)
- invoice: Professional invoice (JSON — use getDefaultInvoiceContent structure)
- link: URL shortcut (needs linkUrl)
- folder: Empty folder to organize files

Available WIDGET types you can create:
- clock: Timezone clock
- pomodoro: Focus timer (Pomodoro technique)
- habits: Daily habit tracker
- contact: Contact form
- links: Social links collection
- status: Availability status
- sticky-note: Handwritten note
- tipjar: Accept tips/donations
- feedback: Collect anonymous feedback
- book: Schedule/booking link

User request: "{message}"

Determine what SINGLE item to create. Return JSON only:
{
  "type": "file" | "widget",
  "fileType": "note|case-study|board|sheet|cv|invoice|link|folder",
  "widgetType": "clock|pomodoro|habits|contact|links|status|sticky-note|tipjar|feedback|book",
  "title": "Short descriptive name",
  "purpose": "Why this item is useful",
  "contentBrief": "What the content should include",
  "linkUrl": "URL if type is link"
}

Only include fileType OR widgetType (based on type). Be smart about what the user needs.`;

// Content generation for notes and case studies
const CONTENT_PROMPT = `Generate professional HTML content for a workspace document.

Context: {purpose}
Title: {title}
Type: {fileType}
Brief: {brief}

Generate rich, useful, ready-to-use content. Use proper HTML tags (h1, h2, p, ul, li, strong, em).
Make it feel 99% done — the user should only need minor edits.
Do NOT wrap in markdown code blocks. Return raw HTML only.`;

// Board content generation
const BOARD_PROMPT = `Generate a kanban board structure as JSON.

Purpose: {purpose}
Title: {title}
Brief: {brief}

Return JSON:
{
  "columns": [
    {
      "id": "col-1",
      "title": "Column Name",
      "cards": [
        { "id": "c1", "title": "Card title", "description": "Details", "order": 0, "color": "blue|green|yellow|red|purple" }
      ],
      "order": 0
    }
  ]
}

Create 3-4 columns with 2-4 realistic, useful cards each. Make it immediately usable.`;

// Sheet content generation
const SHEET_PROMPT = `Generate spreadsheet data as JSON.

Purpose: {purpose}
Title: {title}
Brief: {brief}

Return JSON:
{
  "data": [
    [{ "value": "Header 1", "type": "text" }, { "value": "Header 2", "type": "text" }],
    [{ "value": "Data", "type": "text" }, { "value": "100", "type": "number" }]
  ],
  "frozenRows": 1
}

Create a header row + 5-8 data rows with realistic, useful content.`;

async function callGemini(prompt: string, maxTokens = 4000): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[chat-create] Gemini error:', response.status, error);
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!content.trim()) throw new Error('Empty Gemini response');
  return content;
}

function extractJSON(text: string): unknown {
  // Try direct parse
  try { return JSON.parse(text); } catch { /* continue */ }
  // Try extracting from markdown code blocks
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try { return JSON.parse(match[1].trim()); } catch { /* continue */ }
  }
  // Try finding JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch { /* continue */ }
  }
  throw new Error('Failed to extract JSON from AI response');
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return new Response(JSON.stringify({ error: 'Message too short' }), { status: 400 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Phase 1: Understand intent
          send('thinking', { text: 'Understanding your request...' });

          const intentPrompt = INTENT_PROMPT.replace('{message}', message);
          const intentRaw = await callGemini(intentPrompt, 2000);
          const intent = extractJSON(intentRaw) as Record<string, string>;

          const itemType = intent.type; // 'file' or 'widget'
          const fileType = intent.fileType;
          const widgetType = intent.widgetType;
          const title = intent.title || 'New Item';
          const purpose = intent.purpose || '';
          const contentBrief = intent.contentBrief || '';
          const linkUrl = intent.linkUrl || '';

          send('thinking', { text: `Creating ${title}...` });

          // Phase 2: Generate content (if needed)
          let content = '';

          if (itemType === 'widget' || fileType === 'folder' || fileType === 'link') {
            // No content needed
            content = '';
          } else if (fileType === 'cv') {
            // Use default CV content
            const { getDefaultCVContent } = await import('@/lib/validations/goos');
            content = JSON.stringify(getDefaultCVContent());
          } else if (fileType === 'invoice') {
            // Use default invoice content
            const { getDefaultInvoiceContent } = await import('@/lib/validations/goos');
            content = JSON.stringify(getDefaultInvoiceContent());
          } else if (fileType === 'board') {
            const boardPrompt = BOARD_PROMPT
              .replace('{purpose}', purpose)
              .replace('{title}', title)
              .replace('{brief}', contentBrief);
            const boardRaw = await callGemini(boardPrompt, 4000);
            content = JSON.stringify(extractJSON(boardRaw));
          } else if (fileType === 'sheet') {
            const sheetPrompt = SHEET_PROMPT
              .replace('{purpose}', purpose)
              .replace('{title}', title)
              .replace('{brief}', contentBrief);
            const sheetRaw = await callGemini(sheetPrompt, 6000);
            content = JSON.stringify(extractJSON(sheetRaw));
          } else {
            // HTML content for notes and case studies
            const contentPrompt = CONTENT_PROMPT
              .replace('{purpose}', purpose)
              .replace('{title}', title)
              .replace('{fileType}', fileType || 'note')
              .replace('{brief}', contentBrief);
            content = await callGemini(contentPrompt, 4000);
            content = content.replace(/```html?\s*/g, '').replace(/```\s*/g, '').trim();
          }

          // Build the created item
          const item = itemType === 'widget'
            ? {
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'widget' as const,
                widgetType: widgetType || 'sticky-note',
                title,
                content: '',
                purpose,
              }
            : {
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'file' as const,
                fileType: fileType || 'note',
                title,
                content,
                purpose,
                ...(linkUrl ? { linkUrl } : {}),
              };

          send('created', { item, remaining: 0 });
          send('complete', { item, summary: purpose });

          controller.close();
        } catch (error) {
          console.error('[chat-create] Error:', error);
          send('error', { message: error instanceof Error ? error.message : 'Something went wrong' });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[chat-create] Request error:', error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}
