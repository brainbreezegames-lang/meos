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

Design a COMPREHENSIVE workspace tailored specifically for them. Think about what they actually need to succeed.

Available component types:

FILES (rich content):
- note: Rich text document (About Me, Services, Blog posts, Process, Pricing, etc.)
- case-study: Portfolio piece with structured sections (Challenge, Approach, Results)
- folder: Container to organize related files together
- embed: Embedded external content (portfolio site, YouTube showreel, Figma prototype, etc.)

WIDGETS (interactive elements — use when the user needs functional tools, not just content):
- widget: Interactive widget. You MUST set "widgetType" to one of:
  - "status" — Availability status badge (e.g., "Available for projects", "Booked through Q2")
  - "contact" — Contact form for visitor inquiries
  - "book" — Booking widget for scheduling calls or meetings
  - "links" — Collection of social media and external links
  - "tipjar" — Support/tip jar for fans and followers
  - "feedback" — Collect visitor feedback and testimonials

IMPORTANT: Create 4-8 items that are SPECIFIC to this user. Mix files AND widgets based on their needs:
- An About/Introduction that reflects their personality and niche
- Portfolio content matching their SPECIFIC work (e.g., "Wedding Shoots" not "Projects")
- Case studies for their type of work
- Widgets for functional needs: booking calls → book widget, show availability → status widget, share links → links widget
- Service descriptions if relevant
- Blog/writing if they mentioned content creation

If the user asks for something that can't be built with available components (custom calculator, store, interactive tool):
- Create a note as a thoughtful placeholder that acknowledges the need
- Describe what the tool would do and suggest a workaround
- Never promise features that don't exist — be honest and helpful

Rules:
- Create 4-8 items. Be thorough, not lazy.
- Include at least 1 widget if the user has any functional needs (booking, contact, availability, links)
- Every item must have a CLEAR PURPOSE for THIS specific user
- Names should be SPECIFIC (not generic like "Projects" or "Work")
- Content descriptions should reference their actual situation
- Order items logically (introduction first, then portfolio, then widgets/contact last)

Return JSON:
{
  "plan": {
    "summary": "One sentence describing what you're building and why",
    "items": [
      {
        "type": "note|case-study|folder|embed|widget",
        "widgetType": "status|contact|book|links|tipjar|feedback (ONLY when type is widget, omit otherwise)",
        "name": "Specific name for this user",
        "purpose": "Why THIS user needs this (1-2 sentences)",
        "contentBrief": "What should be inside, specific to their situation",
        "priority": 1-8 (order to create)
      }
    ]
  },
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

// Fallback when AI is unavailable - create comprehensive workspace
function createFallbackResponse(prompt: string) {
  // Extract basic info from prompt
  const lowerPrompt = prompt.toLowerCase();
  let profession = 'creative professional';
  let niche = 'your work';
  let folderName = 'Portfolio';
  let serviceName = 'Services';

  if (lowerPrompt.includes('photographer')) {
    profession = 'photographer';
    niche = 'photography';
    folderName = lowerPrompt.includes('wedding') ? 'Wedding Gallery' : 'Photo Gallery';
    serviceName = 'Photography Services';
  } else if (lowerPrompt.includes('designer')) {
    profession = 'designer';
    niche = 'design';
    folderName = lowerPrompt.includes('ui') || lowerPrompt.includes('product') ? 'Product Work' : 'Design Projects';
    serviceName = 'Design Services';
  } else if (lowerPrompt.includes('developer') || lowerPrompt.includes('engineer')) {
    profession = 'developer';
    niche = 'development';
    folderName = 'Code Projects';
    serviceName = 'Development Services';
  } else if (lowerPrompt.includes('writer') || lowerPrompt.includes('author')) {
    profession = 'writer';
    niche = 'writing';
    folderName = 'Published Work';
    serviceName = 'Writing Services';
  }

  const timestamp = Date.now();

  return {
    understanding: `I understand you're a ${profession}. Let me set up a comprehensive workspace to showcase ${niche} and help visitors connect with you.`,
    items: [
      {
        id: `item-${timestamp}-about`,
        type: 'file',
        fileType: 'note',
        title: 'About Me',
        content: `<h1>Hey, I'm [Your Name]</h1>
<p>I'm a ${profession} passionate about creating meaningful work in ${niche}.</p>
<p>My approach combines creativity with purpose—every project is an opportunity to solve problems and create something valuable.</p>
<h2>What I Do</h2>
<p>I help clients achieve their goals through thoughtful, intentional ${niche}. Whether you need a complete solution or guidance on your next project, I'm here to help.</p>
<p><strong>Let's work together.</strong></p>`,
        purpose: 'Introduce yourself to visitors',
      },
      {
        id: `item-${timestamp}-folder`,
        type: 'file',
        fileType: 'folder',
        title: folderName,
        content: '',
        purpose: `Organize your ${niche} work`,
      },
      {
        id: `item-${timestamp}-case`,
        type: 'file',
        fileType: 'case-study',
        title: 'Featured Project',
        content: `<h1>Featured Project</h1>
<h2>Overview</h2>
<p>A brief description of what this project was about and why it mattered.</p>
<h2>The Challenge</h2>
<p>What problem were you solving? What were the constraints?</p>
<h2>The Approach</h2>
<p>How did you tackle this challenge? What made your approach unique?</p>
<h2>Results</h2>
<p>What was the impact? Include metrics if possible.</p>`,
        purpose: 'Showcase your best work with context',
      },
      {
        id: `item-${timestamp}-services`,
        type: 'file',
        fileType: 'note',
        title: serviceName,
        content: `<h1>${serviceName}</h1>
<p>Here's how I can help you:</p>
<h2>What I Offer</h2>
<ul>
<li><strong>Consultation</strong> - Let's discuss your project and goals</li>
<li><strong>Full Projects</strong> - End-to-end ${niche} solutions</li>
<li><strong>Collaboration</strong> - Working alongside your team</li>
</ul>
<h2>Process</h2>
<p>Every project starts with understanding your needs. From there, we'll work together to create something you'll love.</p>
<p><strong>Ready to start? Get in touch.</strong></p>`,
        purpose: 'Explain what you offer',
      },
      {
        id: `item-${timestamp}-contact`,
        type: 'file',
        fileType: 'note',
        title: 'Get in Touch',
        content: `<h1>Let's Connect</h1>
<p>I'm always excited to hear about new projects and opportunities.</p>
<h2>How to Reach Me</h2>
<ul>
<li><strong>Email:</strong> hello@example.com</li>
<li><strong>Twitter:</strong> @yourhandle</li>
<li><strong>LinkedIn:</strong> /in/yourprofile</li>
</ul>
<p>Whether you have a project in mind or just want to say hi, I'd love to hear from you.</p>`,
        purpose: 'Make it easy for visitors to contact you',
      },
    ],
    summary: `Setting up a comprehensive workspace for a ${profession}`,
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
            items: fallback.items.map(item => ({
              name: item.title,
              type: item.fileType,
              purpose: item.purpose,
            })),
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
          goals: understanding.goals,
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
          // Fall back to default plan instead of erroring
          const fb = createFallbackResponse(prompt);
          plan = {
            plan: {
              summary: fb.summary,
              items: fb.items.map((item, i) => ({
                type: item.fileType,
                name: item.title,
                purpose: item.purpose,
                contentBrief: item.purpose,
                priority: i + 1,
              })),
            },
            reasoning: 'Using a recommended workspace layout',
          };
        }

        const planData = plan.plan as { summary: string; items: Array<Record<string, unknown>> };

        send('plan', {
          summary: planData.summary,
          reasoning: plan.reasoning,
          itemCount: planData.items.length,
          items: planData.items.map(item => ({
            name: item.name,
            type: item.type,
            purpose: item.purpose,
          })),
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
            try {
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
            } catch (contentError) {
              console.error(`Content generation failed for ${item.name}:`, contentError);
              // Graceful fallback — create with placeholder content
              content = `<h1>${item.name}</h1><p>Add your content here to personalize this section.</p>`;
            }
          }

          const isWidget = item.type === 'widget';
          const builtItem = isWidget
            ? {
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'widget' as const,
                widgetType: item.widgetType as string,
                title: item.name,
                content: '',
                purpose: item.purpose,
              }
            : {
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'file' as const,
                fileType: item.type,
                title: item.name,
                content,
                purpose: item.purpose,
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
