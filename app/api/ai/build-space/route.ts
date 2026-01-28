import { NextRequest } from 'next/server';

/**
 * Streaming endpoint for intelligent space building
 * Uses Server-Sent Events to stream AI reasoning and progress in real-time
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Phase 1: Deep Understanding Prompt
const UNDERSTANDING_PROMPT = `You are analyzing a user's request to build their personal workspace. Extract DEEP understanding, not surface-level parsing.

Analyze and extract:
1. WHO they are (profession, niche, experience level, personality hints)
2. Their PRIMARY GOAL (what does success look like for them?)
3. Their WORKFLOW (how do they work, who do they serve, what's their process?)
4. EXPLICIT NEEDS (what they directly asked for)
5. IMPLICIT NEEDS (what they didn't ask for but clearly need based on their situation)
6. TONE/STYLE that fits them (professional, playful, minimal, bold, warm, technical)
7. Any CUSTOM TOOLS or unique features they mentioned

Think step by step. Be thorough. Don't just categorize — UNDERSTAND.

User prompt: "{input}"

Return JSON:
{
  "identity": {
    "profession": "specific job title",
    "niche": "their specialization",
    "experienceHint": "junior/mid/senior/expert vibe",
    "personality": "warm/technical/creative/corporate/etc"
  },
  "goals": {
    "primary": "main thing they want to achieve",
    "secondary": ["other goals inferred"],
    "successLooksLike": "what would make this workspace successful for them"
  },
  "workflow": {
    "serves": "who are their clients/audience",
    "process": "how they work",
    "tools": ["tools/platforms they likely use"]
  },
  "needs": {
    "explicit": ["things they asked for"],
    "implicit": ["things they need but didn't ask for"]
  },
  "tone": "one word describing ideal tone",
  "customRequests": ["any unique tools or features they mentioned"],
  "understanding": "2-3 sentence summary of who this person is and what they need, written like you're explaining to a colleague"
}`;

// Phase 2: Architecture Planning Prompt
const PLANNING_PROMPT = `Based on this deep understanding of the user:
{context}

Design their workspace. For EACH component, explain WHY it exists for THIS specific person.

Available components:
- note: Rich text document (About, Services, Blog posts, etc.)
- case-study: Portfolio piece with sections (Challenge, Approach, Results)
- folder: Container to organize files
- Widgets: status (availability), contact (inquiry form), book (scheduling), links (social profiles)

Rules:
- Create 2-4 items maximum. Quality over quantity.
- Every item must have a CLEAR PURPOSE for THIS user
- Content descriptions should be specific to their situation
- Folder names should match their work (not generic "Projects")

Return JSON:
{
  "plan": {
    "summary": "One sentence describing what you're building and why",
    "items": [
      {
        "type": "note|case-study|folder|widget",
        "widgetType": "status|contact|book|links (only if type is widget)",
        "name": "Specific name for this user",
        "purpose": "Why THIS user needs this (1-2 sentences)",
        "contentBrief": "What should be inside, specific to their situation",
        "priority": 1-4 (order to create)
      }
    ]
  },
  "statusMessage": "What their status widget should say",
  "reasoning": "Brief explanation of your overall design decisions"
}`;

// Phase 3: Content Generation Prompt
const CONTENT_PROMPT = `Generate the actual content for this workspace component.

User context:
{context}

Component to create:
- Name: {name}
- Type: {type}
- Purpose: {purpose}
- Brief: {brief}

Write the content AS IF YOU ARE THIS PERSON.
- Use first person
- Match their tone ({tone})
- Reference their specific niche and situation
- Make it sound authentic, not templated
- Use [Your Name] only for their actual name
- Keep it concise but compelling (150-250 words for notes)

For notes, use HTML: <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>
For case-studies, include sections: Overview, Challenge, Approach, Results

Return just the HTML content, nothing else.`;

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini error:', error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function extractJSON(text: string): unknown {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim());
  }

  // Try to find raw JSON object
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return JSON.parse(objectMatch[0]);
  }

  throw new Error('No valid JSON found in response');
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const { prompt } = await request.json();

        if (!prompt || prompt.length < 10) {
          send('error', { message: 'Prompt too short' });
          controller.close();
          return;
        }

        // ========== PHASE 1: UNDERSTANDING ==========
        send('phase', { phase: 'understanding', message: 'Understanding your needs...' });

        const understandingPrompt = UNDERSTANDING_PROMPT.replace('{input}', prompt);
        const understandingRaw = await callGemini(understandingPrompt);

        let understanding: Record<string, unknown>;
        try {
          understanding = extractJSON(understandingRaw) as Record<string, unknown>;
        } catch {
          send('error', { message: 'Failed to understand request' });
          controller.close();
          return;
        }

        send('understanding', {
          summary: understanding.understanding,
          identity: understanding.identity,
          tone: understanding.tone,
        });

        // ========== PHASE 2: PLANNING ==========
        send('phase', { phase: 'planning', message: 'Designing your space...' });

        const planningPrompt = PLANNING_PROMPT.replace('{context}', JSON.stringify(understanding, null, 2));
        const planningRaw = await callGemini(planningPrompt);

        let plan: Record<string, unknown>;
        try {
          plan = extractJSON(planningRaw) as Record<string, unknown>;
        } catch {
          send('error', { message: 'Failed to plan workspace' });
          controller.close();
          return;
        }

        const planData = plan.plan as { summary: string; items: Array<Record<string, unknown>> };

        send('plan', {
          summary: planData.summary,
          reasoning: plan.reasoning,
          itemCount: planData.items.length,
          statusMessage: plan.statusMessage,
        });

        // ========== PHASE 3: BUILDING ==========
        send('phase', { phase: 'building', message: 'Creating your components...' });

        const items = planData.items.sort((a, b) =>
          (a.priority as number) - (b.priority as number)
        );

        const builtItems: Array<Record<string, unknown>> = [];

        for (const item of items) {
          send('building', {
            name: item.name,
            type: item.type,
            purpose: item.purpose,
          });

          // Generate content for non-widget items
          let content = '';
          if (item.type !== 'widget' && item.type !== 'folder') {
            const contentPrompt = CONTENT_PROMPT
              .replace('{context}', JSON.stringify(understanding, null, 2))
              .replace('{name}', item.name as string)
              .replace('{type}', item.type as string)
              .replace('{purpose}', item.purpose as string)
              .replace('{brief}', item.contentBrief as string)
              .replace('{tone}', understanding.tone as string);

            content = await callGemini(contentPrompt);

            // Clean up any markdown code blocks from content
            content = content.replace(/```html?\s*/g, '').replace(/```\s*/g, '').trim();
          }

          const builtItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: item.type === 'widget' ? 'widget' : 'file',
            fileType: item.type !== 'widget' ? item.type : undefined,
            widgetType: item.type === 'widget' ? item.widgetType : undefined,
            title: item.name,
            content,
            purpose: item.purpose,
            config: item.type === 'widget' && item.widgetType === 'status'
              ? { text: plan.statusMessage }
              : {},
          };

          builtItems.push(builtItem);

          send('created', {
            item: builtItem,
            remaining: items.length - builtItems.length,
          });

          // Small delay for visual effect
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // ========== COMPLETE ==========
        send('complete', {
          items: builtItems,
          summary: planData.summary,
          understanding: understanding.understanding,
        });

        controller.close();
      } catch (error) {
        console.error('Build space error:', error);
        send('error', {
          message: error instanceof Error ? error.message : 'Something went wrong'
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
