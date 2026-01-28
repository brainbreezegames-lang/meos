import { NextRequest } from 'next/server';

/**
 * Streaming endpoint for intelligent space building
 * Uses Server-Sent Events to stream AI reasoning and progress in real-time
 * Powered by OpenRouter (Kimi-k2 model)
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'moonshotai/kimi-k2:free';

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

async function callOpenRouter(prompt: string, retries = 2): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://meos-delta.vercel.app',
          'X-Title': 'MeOS Space Builder',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (response.status === 429) {
        // Rate limited - wait and retry
        if (attempt < retries) {
          console.log(`Rate limited, waiting before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        throw new Error('AI service is busy. Please try again in a moment.');
      }

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter error:', error);
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('AI service unavailable');
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

// Fallback when AI is unavailable
function createFallbackResponse(prompt: string) {
  // Extract basic info from prompt
  const lowerPrompt = prompt.toLowerCase();
  let profession = 'creative professional';
  let niche = 'your work';

  if (lowerPrompt.includes('photographer')) {
    profession = 'photographer';
    niche = 'photography';
  } else if (lowerPrompt.includes('designer')) {
    profession = 'designer';
    niche = 'design';
  } else if (lowerPrompt.includes('developer') || lowerPrompt.includes('engineer')) {
    profession = 'developer';
    niche = 'development';
  } else if (lowerPrompt.includes('writer') || lowerPrompt.includes('author')) {
    profession = 'writer';
    niche = 'writing';
  }

  return {
    understanding: `I understand you're a ${profession}. Let me set up a workspace to showcase ${niche} and help visitors connect with you.`,
    items: [
      {
        id: `item-${Date.now()}-about`,
        type: 'file',
        fileType: 'note',
        title: 'About Me',
        content: `<h1>Hey, I'm [Your Name]</h1>
<p>I'm a ${profession} passionate about creating meaningful work.</p>
<p>My approach combines creativity with purpose—every project is an opportunity to solve problems and create something valuable.</p>
<p><strong>Let's work together.</strong></p>`,
        purpose: 'Introduce yourself to visitors',
      },
      {
        id: `item-${Date.now()}-work`,
        type: 'file',
        fileType: 'case-study',
        title: 'Featured Project',
        content: `<h1>Featured Project</h1>
<h2>Overview</h2>
<p>Describe your project and what made it special.</p>
<h2>The Challenge</h2>
<p>What problem were you solving?</p>
<h2>The Approach</h2>
<p>How did you tackle it?</p>
<h2>Results</h2>
<p>What was the impact?</p>`,
        purpose: 'Showcase your best work',
      },
    ],
    summary: `Setting up a workspace for a ${profession}`,
  };
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

        let useFallback = false;
        let understanding: Record<string, unknown> = {};

        // ========== PHASE 1: UNDERSTANDING ==========
        send('phase', { phase: 'understanding', message: 'Understanding your needs...' });

        try {
          const understandingPrompt = UNDERSTANDING_PROMPT.replace('{input}', prompt);
          const understandingRaw = await callOpenRouter(understandingPrompt);
          understanding = extractJSON(understandingRaw) as Record<string, unknown>;
        } catch (aiError) {
          console.error('AI understanding failed, using fallback:', aiError);
          useFallback = true;
        }

        if (useFallback) {
          // Use fallback when AI fails
          const fallback = createFallbackResponse(prompt);

          send('understanding', {
            summary: fallback.understanding,
            identity: { profession: 'professional' },
            tone: 'professional',
          });

          send('phase', { phase: 'planning', message: 'Designing your space...' });
          send('plan', {
            summary: fallback.summary,
            reasoning: 'Using quick setup mode',
            itemCount: fallback.items.length,
          });

          send('phase', { phase: 'building', message: 'Creating your components...' });

          for (const item of fallback.items) {
            send('building', { name: item.title, type: item.fileType, purpose: item.purpose });
            await new Promise(resolve => setTimeout(resolve, 400));
            send('created', { item, remaining: 0 });
          }

          send('complete', {
            items: fallback.items,
            summary: fallback.summary,
            understanding: fallback.understanding,
          });

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
        const planningRaw = await callOpenRouter(planningPrompt);

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

            content = await callOpenRouter(contentPrompt);

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
