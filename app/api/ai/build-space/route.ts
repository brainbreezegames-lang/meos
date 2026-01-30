import { NextRequest } from 'next/server';

// Allow up to 5 minutes for custom-app generation (multiple AI calls per build)
export const maxDuration = 300;

/**
 * Streaming endpoint for intelligent space building
 * Uses Server-Sent Events to stream AI reasoning and progress in real-time
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'moonshotai/kimi-k2.5';
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
  "understanding": "2-3 sentence summary of who this person is and what they need, written like you're explaining to a colleague",
  "wallpaperKeyword": "A 1-3 word search term for finding a beautiful, atmospheric background photo that matches this person's vibe/field. Think abstract/mood rather than literal. Examples: 'minimal workspace', 'warm bakery', 'ocean aerial', 'dark code', 'botanical garden', 'architectural detail'. Pick something that would look stunning as a desktop wallpaper."
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
- board: Kanban board with columns and cards — use for plans, workflows, task tracking, learning paths, project pipelines. Pre-fill with REAL useful cards.
- sheet: Spreadsheet with rows and columns — use for data tables, word lists, price lists, schedules, trackers. Pre-fill with REAL data (at least 10-20 rows).
- link: URL shortcut on the desktop — use for useful external resources, tools, references. You MUST provide a real valid linkUrl for each link item.
- custom-app: Self-contained interactive HTML app (inline CSS + JS). Use for tools, utilities, mini-apps that need genuine interactivity: Pomodoro timer, habit tracker, invoice calculator, CRM dashboard, unit converter, color picker, mood journal, workout logger, recipe scaler, budget planner, etc. ONLY use custom-app when the user needs real interactivity (buttons, inputs, state changes, timers). For static content, use note or case-study instead.

WIDGETS (interactive elements — use when the user needs functional tools, not just content):
- widget: Interactive widget. You MUST set "widgetType" to one of:
  - "status" — Availability status badge (e.g., "Available for projects", "Booked through Q2")
  - "contact" — Contact form for visitor inquiries
  - "book" — Booking widget for scheduling calls or meetings
  - "links" — Collection of social media and external links
  - "tipjar" — Support/tip jar for fans and followers
  - "feedback" — Collect visitor feedback and testimonials

IMPORTANT: Create 6-12 items that are SPECIFIC to this user. Mix files AND widgets based on their needs:
- An About/Introduction that reflects their personality and niche
- Portfolio content matching their SPECIFIC work (e.g., "Wedding Shoots" not "Projects")
- Case studies for their type of work
- Widgets for functional needs: booking calls → book widget, show availability → status widget, share links → links widget
- Service descriptions if relevant
- Blog/writing if they mentioned content creation
- Board items for planning, tracking, or structured workflows
- Sheet items for data-heavy content (vocabulary, pricing, schedules, etc.)
- Link items for useful external resources (tools, references, communities, etc.)
- Use folders to group related items (e.g., "Resources" folder with links inside, or "Portfolio" folder with case studies)

If the user asks for interactive tools or mini-apps (calculator, timer, tracker, CRM, planner, etc.), use the "custom-app" type. These generate fully functional self-contained HTML/CSS/JS applications that run inside the desktop.

SPATIAL LAYOUT: Items will be placed on a 4x4 desktop grid (16 positions). Consider visual grouping:
- Place introductory items (About, Bio) in the top-left area (priority 1-2)
- Place portfolio/work items in the middle rows (priority 3-6)
- Place utilities, boards, and sheets in the lower rows (priority 7-9)
- Place contact/social widgets last (priority 10-12)
- Use folders to group 3+ related items and keep the desktop uncluttered

Rules:
- Create 6-12 items. Be thorough, not lazy.
- Use SHORT, DISTINCTIVE file names (2-4 words max) that feel PERSONAL. Bad: "Projects". Good: "Client Work", "Design Lab", "Recipe Book"
- Name files using the user's actual domain language (e.g., "Shot List" for photographer, "Pattern Library" for designer)
- Include at least 1 widget if the user has any functional needs (booking, contact, availability, links)
- Include at least 1 board OR sheet if the user's needs involve structured data, planning, or tracking
- Include 2-3 link items for relevant external resources (real URLs to actual tools/sites they'd use)
- Every item must have a CLEAR PURPOSE for THIS specific user
- Content briefs should reference their actual situation with SPECIFIC details
- Order items logically (introduction first, then portfolio, then widgets/contact last)
- For items that belong inside a folder, set parentFolder to the exact folder name
- For link items, set linkUrl to a real, valid URL

Return JSON:
{
  "plan": {
    "summary": "One sentence describing what you're building and why",
    "items": [
      {
        "type": "note|case-study|folder|embed|board|sheet|link|custom-app|widget",
        "widgetType": "status|contact|book|links|tipjar|feedback (ONLY when type is widget, omit otherwise)",
        "name": "Short descriptive name (2-4 words)",
        "purpose": "Why THIS user needs this (1 sentence)",
        "contentBrief": "What should be inside, specific to their situation",
        "priority": 1-12,
        "linkUrl": "https://... (ONLY for type=link, omit otherwise)",
        "parentFolder": "Exact folder name if this item belongs in a folder, omit otherwise"
      }
    ]
  },
  "reasoning": "Brief explanation of your overall design decisions"
}`;

// Phase 3: Content Generation Prompt (HTML for notes/case-studies)
const CONTENT_PROMPT = `Generate the actual content for this workspace component.

User context:
{context}

Component to create:
- Name: {name}
- Type: {type}
- Purpose: {purpose}
- Brief: {brief}

Write the content AS IF YOU ARE THIS PERSON.
- Use first person ("I", "my", "we")
- Match their tone ({tone}) — adapt vocabulary, sentence length, and formality
- Reference their SPECIFIC niche, tools, clients, and situation — no generic phrases
- Make it sound authentic and confident, never templated or AI-generated
- Use [Your Name] only as a placeholder for their actual name
- Be SPECIFIC: mention actual technologies, industries, techniques, or methodologies they'd use
- Include concrete details: numbers, timeframes, specific outcomes where believable
- Write 200-350 words for notes, 300-500 words for case-studies
- Each section should have genuine substance — not filler

For notes, use HTML: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>
For case-studies, include sections: Overview, The Challenge, My Approach, Key Results — each with REAL detail

Return just the HTML content, nothing else.`;

// Phase 3b: Structured content for boards
const BOARD_CONTENT_PROMPT = `Generate a detailed kanban board for this workspace component.

User context:
{context}

Board to create:
- Name: {name}
- Purpose: {purpose}
- Brief: {brief}

Create a board that is GENUINELY USEFUL. Pre-fill with REAL content, not placeholders.
Each column should have 3-6 cards with meaningful titles and descriptions.
Use checklist items where appropriate for actionable tasks.
Use card colors to categorize (red, orange, yellow, green, blue, purple, pink, gray).

Return ONLY valid JSON in this exact format:
{
  "columns": [
    {
      "id": "col-1",
      "title": "Column Name",
      "cards": [
        {
          "id": "card-1",
          "title": "Card Title",
          "description": "Helpful description",
          "color": "blue",
          "order": 0,
          "checklist": [
            { "id": "cl-1", "text": "Action item", "checked": false }
          ]
        }
      ],
      "order": 0
    }
  ]
}`;

// Phase 3c: Structured content for sheets
const SHEET_CONTENT_PROMPT = `Generate spreadsheet data for this workspace component.

User context:
{context}

Sheet to create:
- Name: {name}
- Purpose: {purpose}
- Brief: {brief}

Create a sheet with REAL, useful data. Include at least 15-25 rows of actual content.
The first row should be headers.
Use appropriate cell types (text, number, currency, date, checkbox).

Return ONLY valid JSON in this exact format:
{
  "data": [
    [
      { "value": "Header 1", "type": "text" },
      { "value": "Header 2", "type": "text" },
      { "value": "Header 3", "type": "text" }
    ],
    [
      { "value": "Cell data", "type": "text" },
      { "value": 42, "type": "number" },
      { "value": true, "type": "checkbox" }
    ]
  ],
  "frozenRows": 1
}`;

// Phase 3d: Content for custom apps (self-contained HTML/CSS/JS)
const CUSTOM_APP_CONTENT_PROMPT = `Generate a complete, self-contained interactive HTML application.

User context:
{context}

App to create:
- Name: {name}
- Purpose: {purpose}
- Brief: {brief}

Requirements:
1. Return ONLY the HTML content that goes inside <body> — no <html>, <head>, or <body> tags
2. Include ALL CSS in a single <style> tag at the very top
3. Include ALL JavaScript in a single <script> tag at the very bottom
4. The app must be FULLY FUNCTIONAL — no placeholders, no "coming soon", no TODO comments
5. Use vanilla JavaScript only — no frameworks, no imports, no CDN links
6. CRITICAL: Do NOT define a :root CSS block. The CSS variables are pre-injected by the host. Just USE them directly:
   - var(--color-bg-base) — main background
   - var(--color-bg-elevated) — cards/panels
   - var(--color-bg-subtle) — secondary backgrounds
   - var(--color-text-primary) — main text
   - var(--color-text-secondary) — secondary text
   - var(--color-text-muted) — muted text
   - var(--color-accent-primary) — buttons, active states (orange)
   - var(--color-border-default) — borders
   - var(--color-border-subtle) — subtle borders
   - var(--radius-sm) / var(--radius-md) / var(--radius-lg) — border radius (6px/10px/12px)
   - var(--color-success) — success, var(--color-error) — error
7. Keep CSS COMPACT — use shorthand properties, avoid redundant rules. Target under 80 CSS rules total.
8. Design for ~600x450px, responsive with flexbox/grid
9. Include meaningful defaults (pre-filled data, realistic state)
10. PRIORITY: The JavaScript MUST be complete. Never leave a function body unfinished. Keep logic clean and concise.
11. Total code must fit within 3000 lines. Be concise.

IMPORTANT: Return ONLY raw HTML (style tag + markup + script tag). No markdown fences, no explanation.`;

// OpenRouter API (Kimi K2.5 with reasoning)
async function callOpenRouter(prompt: string, maxTokens = 4000): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');

  const startTime = Date.now();
  console.log(`[AI] Calling Kimi K2.5 (max_tokens=${maxTokens}, reasoning=high)...`);

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
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens,
      reasoning: { effort: 'high' },
    }),
  });

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    console.error(`[AI] OpenRouter error (${elapsed}ms):`, response.status, error);
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  console.log(`[AI] Kimi response (${elapsed}ms, ${content.length} chars, finish=${data.choices?.[0]?.finish_reason})`);

  if (!content || content.trim().length === 0) {
    console.error('[AI] Empty response from Kimi K2.5');
    throw new Error('Empty response from Kimi K2.5');
  }

  return content;
}

// Gemini API fallback
async function callGemini(prompt: string, maxTokens = 4000): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const startTime = Date.now();
  console.log(`[AI] Calling Gemini ${GEMINI_MODEL} fallback (max_tokens=${maxTokens})...`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    }
  );

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    console.error(`[AI] Gemini error (${elapsed}ms):`, response.status, error);
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  console.log(`[AI] Gemini response (${elapsed}ms, ${content.length} chars)`);

  if (!content || content.trim().length === 0) {
    throw new Error('Empty response from Gemini');
  }

  return content;
}

// Call AI with Kimi K2.5 primary → Gemini fallback
async function callAI(prompt: string, retries = 1, maxTokens = 4000): Promise<string> {
  // Try Kimi K2.5 first
  if (OPENROUTER_API_KEY) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await callOpenRouter(prompt, maxTokens);
      } catch (err) {
        console.error(`[AI] Kimi attempt ${attempt} failed:`, err);
      }
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    console.warn('[AI] Kimi K2.5 failed, falling back to Gemini...');
  }

  // Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      return await callGemini(prompt, maxTokens);
    } catch (err) {
      console.error('[AI] Gemini fallback failed:', err);
    }
  }

  throw new Error('All AI providers failed');
}

// Curated Unsplash wallpapers — multiple options per category to prevent repetition
// URL format: photo ID + w=2560&h=1440&fit=crop&q=90&auto=format for high-quality desktop wallpapers
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=2560&h=1440&fit=crop&q=90&auto=format`;

const WALLPAPER_CATALOG: Array<{ keywords: string[]; urls: string[] }> = [
  // Design / Creative / UI / UX
  { keywords: ['design', 'creative', 'ui', 'ux', 'graphic', 'minimal', 'workspace', 'studio', 'brand', 'logo'],
    urls: [
      U('1497366216548-37526070297c'), // modern open office
      U('1558618666-fcd25c85f82e'), // gradient abstract setup
      U('1558591710-4b4a1ae0f04d'), // colorful paint swirl
      U('1550859492-d5da9d8e45f3'), // abstract gradients
    ] },
  // Technology / Code / Developer
  { keywords: ['code', 'developer', 'engineer', 'programming', 'tech', 'software', 'data', 'cyber', 'hacker', 'web', 'app', 'frontend', 'backend', 'fullstack', 'devops', 'api'],
    urls: [
      U('1518770660439-4636190af475'), // circuit board macro
      U('1555949963-ff9fe0c870eb'), // code on dark screen
      U('1526374965328-7f61d4dc18c5'), // matrix green code
      U('1550751827-4bd374c3f58b'), // dark code editor
    ] },
  // Food / Bakery / Chef / Restaurant
  { keywords: ['food', 'bakery', 'baker', 'chef', 'restaurant', 'cook', 'culinary', 'kitchen', 'recipe', 'meal'],
    urls: [
      U('1509440159596-0249088772ff'), // artisan bread
      U('1504754524776-8f4f37790ca0'), // food spread overhead
      U('1466637574441-749b8f19452f'), // cooking in kitchen
      U('1414235077428-338989a2e8c0'), // restaurant interior warm
    ] },
  // Coffee / Cafe / Barista
  { keywords: ['coffee', 'cafe', 'barista', 'espresso', 'latte', 'tea', 'brew'],
    urls: [
      U('1495474472287-4d71bcdd2085'), // latte art
      U('1501339847302-ac426a4a7cbb'), // coffee beans
      U('1442512595331-e89e73853f31'), // cozy coffee shop
      U('1559496417-e7f25cb247f3'), // espresso pour
    ] },
  // Photography / Camera
  { keywords: ['photo', 'camera', 'lens', 'portrait', 'shoot', 'lightroom', 'capture'],
    urls: [
      U('1452587925148-ce544e77e70d'), // photographer at dusk
      U('1516035069371-29a1b244cc32'), // photographer in landscape
      U('1554048612-b6a482bc67e5'), // camera gear flat lay
      U('1502982720700-bfff97f2ecac'), // film reels vintage
    ] },
  // Film / Video / Cinema
  { keywords: ['film', 'cinema', 'video', 'movie', 'director', 'cinemat', 'editing', 'production', 'youtube', 'content creator'],
    urls: [
      U('1485846234645-a62644f84728'), // film strip macro
      U('1478720568477-152d9b164e26'), // cinema seats red
      U('1536440136628-849c177e76a1'), // dark theater
      U('1440404653325-ab127d49abc1'), // vintage projector
    ] },
  // Music / Audio
  { keywords: ['music', 'audio', 'sound', 'band', 'dj', 'producer', 'singer', 'instrument', 'piano', 'guitar', 'concert', 'vinyl', 'record', 'beat', 'song'],
    urls: [
      U('1511379938547-c1f69419868d'), // piano keys warm light
      U('1507838153414-b4b713384a76'), // concert stage lights
      U('1514320291840-2e0a9bf2a9ae'), // vinyl records
      U('1510915361894-db8b60106cb1'), // recording studio
    ] },
  // Books / Writing / Literature
  { keywords: ['book', 'write', 'writer', 'author', 'blog', 'journal', 'read', 'library', 'literature', 'poet', 'story', 'novel', 'copywrite', 'content', 'editorial'],
    urls: [
      U('1507842217343-583bb7270b66'), // grand library interior
      U('1524995997946-a1c2e315a42f'), // open book with coffee
      U('1506880018603-83d5b814b5a6'), // reading on beach
      U('1457369804613-52c61a468e7d'), // vintage typewriter
    ] },
  // Travel / Adventure
  { keywords: ['travel', 'adventure', 'explore', 'wander', 'backpack', 'tourist', 'nomad', 'trip', 'journey', 'passport', 'flight'],
    urls: [
      U('1488085061387-422e29b40080'), // tropical beach aerial
      U('1469854523086-cc02fe5d8800'), // mountain road sunset
      U('1476514525535-07fb3b4ae5f1'), // majestic waterfall
      U('1530789253388-582c481c54b0'), // hot air balloons
    ] },
  // Architecture / Buildings / Interior Design
  { keywords: ['architect', 'building', 'interior', 'house', 'construction', 'urban', 'structural', 'blueprint'],
    urls: [
      U('1487958449943-2429e8be8625'), // modern architecture lines
      U('1431576901776-e539bd916ba2'), // interior design light
      U('1600585154340-be6161a56a0c'), // modern living room
      U('1600607687939-ce8a6c25118c'), // luxury bathroom marble
    ] },
  // Real Estate / Property
  { keywords: ['real estate', 'property', 'realtor', 'home', 'apartment', 'condo', 'housing', 'mortgage'],
    urls: [
      U('1600596542815-ffad4c1539a9'), // modern house exterior
      U('1600585154340-be6161a56a0c'), // modern living room
      U('1560448204-e02f11c3d0e2'), // luxury home exterior
      U('1512917774080-9991f1c4c750'), // suburban house
    ] },
  // Art / Gallery / Painting / Illustration
  { keywords: ['art', 'gallery', 'paint', 'illustrat', 'draw', 'sculpt', 'canvas', 'museum', 'craft', 'abstract', 'mural', 'sketch'],
    urls: [
      U('1513364776144-60967b0f800f'), // paint brushes color
      U('1547891654-e66ed7ebb968'), // art gallery white
      U('1460661419201-fd4cecdf8a8b'), // abstract watercolor
      U('1541961017774-22349e4a1262'), // art supplies studio
    ] },
  // Fitness / Sports / Health
  { keywords: ['fitness', 'gym', 'sport', 'health', 'workout', 'training', 'athlete', 'crossfit', 'personal trainer'],
    urls: [
      U('1534438327276-14e5300c3a48'), // modern gym equipment
      U('1517836357463-d25dfeac3438'), // weight lifting
      U('1571019613454-1cb2f99b2d8b'), // runner in city
      U('1552674605-db6ffd4facb5'), // gym interior dark
    ] },
  // Yoga / Wellness / Meditation
  { keywords: ['yoga', 'wellness', 'meditation', 'mindful', 'holistic', 'spa', 'zen', 'calm', 'healing', 'therapist', 'mental health'],
    urls: [
      U('1506126613408-eca07ce68773'), // meditation on beach
      U('1545205597-3d9d02c29597'), // yoga pose sunset
      U('1540555700478-4be289fbec6f'), // spa stones
      U('1544367567-0f2fcb009e0b'), // yoga serene
    ] },
  // Fashion / Style
  { keywords: ['fashion', 'style', 'clothing', 'model', 'apparel', 'textile', 'boutique', 'couture', 'runway', 'wardrobe', 'outfit'],
    urls: [
      U('1445205170230-053b83016050'), // fashion runway
      U('1490481651871-ab68de25d43d'), // fabric rolls colorful
      U('1441984904996-e0b6ba687e04'), // clothing rack curated
      U('1469334031218-e382a71b716b'), // fashion portrait editorial
    ] },
  // Beauty / Skincare / Makeup
  { keywords: ['beauty', 'skincare', 'makeup', 'cosmetic', 'salon', 'hair', 'nail', 'esthetician', 'glow'],
    urls: [
      U('1522335789203-aabd1fc54bc9'), // beauty products flat lay
      U('1596462502278-27bfdc403348'), // skincare routine
      U('1487412720507-e7ab37603c6f'), // spa setting serene
      U('1512496015851-a90fb38ba796'), // makeup palette
    ] },
  // Education / Student / Learning
  { keywords: ['student', 'education', 'learn', 'teach', 'school', 'university', 'study', 'academic', 'tutor', 'professor', 'lecture', 'course'],
    urls: [
      U('1481627834876-b7833e8f5570'), // library stacks
      U('1503676260728-1c00da094a0b'), // university campus
      U('1523050854058-8df90110c8f1'), // graduation day
      U('1427504494785-3a9ca7044f45'), // classroom
    ] },
  // Business / Finance / Consulting / Marketing
  { keywords: ['business', 'finance', 'consulting', 'startup', 'entrepreneur', 'corporate', 'marketing', 'agency', 'strategy', 'manager', 'ceo', 'founder', 'saas'],
    urls: [
      U('1454165804606-c3d57bc86b40'), // business desk setup
      U('1486406146926-c627a92ad1ab'), // city skyline golden
      U('1444653614773-995cb1ef9efa'), // conference room glass
      U('1497366754035-f200968a6e72'), // modern office space
    ] },
  // Nature / Garden / Botanical
  { keywords: ['nature', 'garden', 'plant', 'botanical', 'flower', 'outdoor', 'forest', 'green', 'eco', 'organic', 'floral', 'landscape'],
    urls: [
      U('1470071459604-3b5ec3a7fe05'), // foggy forest morning
      U('1441974231531-c6227db76b6e'), // forest path dappled
      U('1518173946687-a46569ce7367'), // flower garden vibrant
      U('1465146344425-f00d5f5c8f07'), // wildflower meadow
    ] },
  // Ocean / Marine / Surf / Beach
  { keywords: ['ocean', 'sea', 'marine', 'surf', 'beach', 'coast', 'water', 'dive', 'sail', 'tropical', 'island', 'wave'],
    urls: [
      U('1505118380757-91f5f5632de0'), // deep blue underwater
      U('1507525428034-b723cf961d3e'), // tropical beach palm
      U('1439405326854-014607f694d7'), // ocean aerial turquoise
      U('1518837695005-2083093ee35b'), // wave barrel surfing
    ] },
  // Mountain / Alpine / Hiking
  { keywords: ['mountain', 'alpine', 'hiking', 'climb', 'summit', 'trail', 'trekking', 'peak', 'outdoor adventure'],
    urls: [
      U('1506905925346-21bda4d32df4'), // alpine peaks snow
      U('1464822759023-fed622ff2c3b'), // mountain panorama
      U('1454496522488-7a8e488e8606'), // mountain mist valley
      U('1483728642387-6c3bdd6c93e5'), // alpine lake reflection
    ] },
  // Space / Astronomy / Science
  { keywords: ['space', 'star', 'astro', 'science', 'cosmos', 'galaxy', 'night sky', 'research', 'lab', 'physics', 'chemistry'],
    urls: [
      U('1519681393784-d120267933ba'), // starry mountain silhouette
      U('1462331940025-496dfbfc7564'), // nebula deep space
      U('1451187580459-43490279c0fa'), // earth from space
      U('1444703686981-a3abbc4d4fe3'), // milky way night
    ] },
  // Gaming / Esports
  { keywords: ['game', 'gaming', 'esport', 'streamer', 'twitch', 'neon', 'rgb', 'console', 'gamer', 'play'],
    urls: [
      U('1538481199705-c710c4e965fc'), // gaming setup neon
      U('1542751371-adc38448a05e'), // neon lights pink
      U('1511512578047-dfb367046420'), // game controller
      U('1550745165-9bc0b252726f'), // gaming purple ambient
    ] },
  // Pet / Animal / Vet
  { keywords: ['pet', 'animal', 'dog', 'cat', 'vet', 'veterinar', 'puppy', 'kitten', 'rescue'],
    urls: [
      U('1444212477490-ca407925329e'), // dogs in golden field
      U('1415369629372-26f2fe60c467'), // cat portrait elegant
      U('1548199973-03cce0bbc87b'), // dogs running joyful
      U('1425082661705-1834bfd09dca'), // sleeping cat peaceful
    ] },
  // Automotive / Cars / Motor
  { keywords: ['car', 'auto', 'motor', 'vehicle', 'drive', 'racing', 'mechanic', 'garage', 'electric vehicle'],
    urls: [
      U('1492144534655-ae79c964c9d7'), // sports car sleek
      U('1503376780353-7e6692767b70'), // racing action
      U('1449130320187-0a18a1b4c5f0'), // car dashboard
      U('1544636331-e26879cd4d9b'), // car on highway scenic
    ] },
  // Medical / Healthcare / Nursing
  { keywords: ['medical', 'doctor', 'nurse', 'healthcare', 'hospital', 'clinic', 'dental', 'pharmacy', 'patient'],
    urls: [
      U('1538108149393-fbbd81895907'), // stethoscope
      U('1579684385127-1ef15d508118'), // lab equipment
      U('1559757175-0eb30cd8c063'), // medical technology
      U('1576091160550-2173dba999ef'), // clean medical space
    ] },
  // Legal / Law / Consulting
  { keywords: ['legal', 'law', 'lawyer', 'attorney', 'justice', 'court', 'paralegal', 'contract'],
    urls: [
      U('1589829545856-d10d557cf95f'), // scales of justice
      U('1507003211169-0a1dd7228f2d'), // professional portrait
      U('1450101499163-c8848e968ad7'), // library classical
      U('1497366811353-6870744d04b2'), // serious workspace
    ] },
  // Craft / Handmade / Maker
  { keywords: ['craft', 'handmade', 'maker', 'artisan', 'pottery', 'woodwork', 'diy', 'leather', 'jewelry', 'sewing', 'knit', 'crochet', 'embroid'],
    urls: [
      U('1452860606245-08c1cc2b07e0'), // pottery wheel
      U('1416339306562-f3d12fefd36f'), // woodworking
      U('1473186578172-c141e6798cf4'), // sewing machine
      U('1460661419201-fd4cecdf8a8b'), // abstract crafts
    ] },
];

// Beautiful generic fallback wallpapers — for prompts that don't match any category
const FALLBACK_WALLPAPERS = [
  U('1506905925346-21bda4d32df4'), // Alpine peaks panorama
  U('1507400492013-162706c8c05e'), // Sand dunes golden hour
  U('1618005182384-a83a8bd57fbe'), // Abstract blue gradients
  U('1557682250-33bd709cbe85'), // Gradient mesh purple
  U('1519681393784-d120267933ba'), // Starry mountain night
  U('1477346611705-65d1883cee1e'), // Lake reflection golden
  U('1500534314209-a25ddb2bd429'), // Lavender field sunset
  U('1505144808419-1957a94ca61e'), // Aerial coastline
  U('1509023464722-18d996393ca8'), // Aurora borealis
  U('1470071459604-3b5ec3a7fe05'), // Foggy forest morning
  U('1470115636492-6d2b56f9b754'), // Desert canyon warm
  U('1433086966358-54859d0ed716'), // Mediterranean coast
  U('1504198453319-5ce911bafcde'), // Sunset clouds vivid
  U('1531366936337-7c912a4589a7'), // Teal ocean calm
  U('1494500764479-0c8f2919a3d8'), // Forest path magical
];

function findWallpaperForKeyword(keyword: string): string {
  const lower = keyword.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 2);

  // Score each category by number of keyword matches
  let bestScore = 0;
  let bestUrls: string[] = [];

  for (const entry of WALLPAPER_CATALOG) {
    let score = 0;
    for (const kw of entry.keywords) {
      // Full phrase contains keyword
      if (lower.includes(kw)) {
        score += 2;
      }
      // Individual word matches
      for (const word of words) {
        if (kw.includes(word) || word.includes(kw)) {
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestUrls = [...entry.urls];
    } else if (score === bestScore && score > 0) {
      // Combine equally scored categories for more variety
      bestUrls.push(...entry.urls);
    }
  }

  if (bestUrls.length > 0) {
    return bestUrls[Math.floor(Math.random() * bestUrls.length)];
  }

  return FALLBACK_WALLPAPERS[Math.floor(Math.random() * FALLBACK_WALLPAPERS.length)];
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
  } else if (lowerPrompt.includes('learn')) {
    profession = 'learner';
    niche = 'learning';
    folderName = 'Resources';
    serviceName = 'Study Notes';
  }

  // Detect functional needs from prompt
  const wantsBooking = lowerPrompt.includes('book') || lowerPrompt.includes('call') || lowerPrompt.includes('meeting') || lowerPrompt.includes('schedule');
  const wantsContact = lowerPrompt.includes('contact') || lowerPrompt.includes('reach') || lowerPrompt.includes('hire') || lowerPrompt.includes('inquir');
  const wantsLinks = lowerPrompt.includes('link') || lowerPrompt.includes('social') || lowerPrompt.includes('twitter') || lowerPrompt.includes('instagram');
  const wantsStatus = lowerPrompt.includes('available') || lowerPrompt.includes('status') || lowerPrompt.includes('freelance') || lowerPrompt.includes('open for');

  const timestamp = Date.now();

  const items: Array<{
    id: string;
    type: 'file' | 'widget';
    fileType?: string;
    widgetType?: string;
    title: string;
    content: string;
    purpose: string;
    linkUrl?: string;
    parentFolder?: string;
  }> = [
    {
      id: `item-${timestamp}-about`,
      type: 'file',
      fileType: 'note',
      title: 'About Me',
      content: `<h1>Hey, I'm [Your Name]</h1>
<p>I'm a ${profession} passionate about creating meaningful work in ${niche}.</p>
<p>My approach combines creativity with purpose\u2014every project is an opportunity to solve problems and create something valuable.</p>
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
      id: `item-${timestamp}-board`,
      type: 'file',
      fileType: 'board',
      title: 'Project Board',
      content: JSON.stringify({
        columns: [
          { id: 'col-todo', title: 'To Do', cards: [
            { id: 'c1', title: 'Update portfolio pieces', description: 'Add your latest work', order: 0, color: 'blue' },
            { id: 'c2', title: 'Write case studies', description: 'Document your process', order: 1, color: 'orange' },
          ], order: 0 },
          { id: 'col-progress', title: 'In Progress', cards: [
            { id: 'c3', title: 'Set up workspace', description: 'Customize your space', order: 0, color: 'green' },
          ], order: 1 },
          { id: 'col-done', title: 'Done', cards: [], order: 2 },
        ],
      }),
      purpose: 'Track your workspace setup tasks',
    },
  ];

  // Add widgets based on detected needs
  if (wantsStatus) {
    items.push({
      id: `item-${timestamp}-status`,
      type: 'widget',
      widgetType: 'status',
      title: 'Availability Status',
      content: '',
      purpose: 'Show visitors you\'re available for work',
    });
  }

  if (wantsBooking) {
    items.push({
      id: `item-${timestamp}-book`,
      type: 'widget',
      widgetType: 'book',
      title: 'Book a Call',
      content: '',
      purpose: 'Let visitors schedule meetings with you',
    });
  }

  if (wantsContact || !wantsBooking) {
    items.push({
      id: `item-${timestamp}-contact`,
      type: 'widget',
      widgetType: 'contact',
      title: 'Get in Touch',
      content: '',
      purpose: 'Make it easy for visitors to contact you',
    });
  }

  if (wantsLinks) {
    items.push({
      id: `item-${timestamp}-links`,
      type: 'widget',
      widgetType: 'links',
      title: 'My Links',
      content: '',
      purpose: 'Share your social media and external profiles',
    });
  }

  return {
    understanding: `I understand you're a ${profession}. Let me set up a comprehensive workspace to showcase ${niche} and help visitors connect with you.`,
    identity: { profession, niche, personality: 'professional', experienceHint: 'mid' },
    goals: { primary: `Showcase ${niche} and connect with visitors`, successLooksLike: 'A professional workspace that represents your work' },
    items,
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
        send('thinking', { text: 'Reading your description carefully...', phase: 'understanding' });

        try {
          const understandingPrompt = UNDERSTANDING_PROMPT.replace('{input}', prompt);
          console.log('[AI] Phase 1: Understanding...');
          const understandingRaw = await callAI(understandingPrompt);
          console.log(`[AI] Understanding raw: ${understandingRaw.length} chars`);
          understanding = extractJSON(understandingRaw) as Record<string, unknown>;
          console.log('[AI] Understanding parsed OK:', Object.keys(understanding).join(', '));

          // Extract insights to share
          const identity = understanding.identity as Record<string, string>;
          const needs = understanding.needs as Record<string, string[]>;
          if (identity?.profession) {
            send('thinking', { text: `I see — you're a ${identity.profession} focused on ${identity.niche || 'your craft'}.`, phase: 'understanding' });
            await new Promise(resolve => setTimeout(resolve, 600));
          }
          if (needs?.implicit?.length) {
            send('thinking', { text: `You'll also need ${needs.implicit[0].toLowerCase()}...`, phase: 'understanding' });
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        } catch (aiError) {
          console.error('AI understanding failed, using fallback:', aiError);
          useFallback = true;
        }

        if (useFallback) {
          // Use fallback when AI fails
          const fallback = createFallbackResponse(prompt);

          send('understanding', {
            summary: fallback.understanding,
            identity: fallback.identity,
            goals: fallback.goals,
            tone: 'professional',
          });

          send('thinking', { text: 'Setting up a great starting point for you...', phase: 'understanding' });

          // Send wallpaper immediately so it loads while building
          send('wallpaper', { url: findWallpaperForKeyword(fallback.identity.niche) });

          send('prompt_keywords', {
            keywords: [
              fallback.identity.profession,
              fallback.identity.niche,
            ].filter(Boolean),
            interpretation: fallback.understanding,
          });

          send('phase', { phase: 'planning', message: 'Designing your space...' });
          send('plan', {
            summary: fallback.summary,
            reasoning: 'Using quick setup mode',
            itemCount: fallback.items.length,
            items: fallback.items.map(item => ({
              name: item.title,
              type: item.type === 'widget' ? 'widget' : (item.fileType || 'note'),
              purpose: item.purpose,
            })),
          });

          send('phase', { phase: 'building', message: 'Creating your components...' });

          for (let i = 0; i < fallback.items.length; i++) {
            const item = fallback.items[i];
            const itemType = item.type === 'widget' ? 'widget' : (item.fileType || 'note');
            send('building', { name: item.title, type: itemType, purpose: item.purpose });
            await new Promise(resolve => setTimeout(resolve, 400));
            send('created', { item, remaining: fallback.items.length - i - 1 });
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

        // Send wallpaper immediately so it loads while building
        const wallpaperKeyword = (understanding.wallpaperKeyword as string) || (understanding.identity as Record<string, string>)?.niche || 'creative';
        const wallpaperUrl = findWallpaperForKeyword(wallpaperKeyword);
        console.log(`[AI] Wallpaper keyword="${wallpaperKeyword}" → url="${wallpaperUrl.substring(0, 80)}..."`);
        send('wallpaper', { url: wallpaperUrl });

        send('prompt_keywords', {
          keywords: [
            ...((understanding.needs as Record<string, string[]>)?.explicit?.slice(0, 4) || []),
            (understanding.identity as Record<string, string>)?.profession,
            (understanding.identity as Record<string, string>)?.niche,
          ].filter(Boolean),
          interpretation: understanding.understanding,
        });

        // ========== PHASE 2: PLANNING ==========
        send('phase', { phase: 'planning', message: 'Designing your space...' });
        send('thinking', { text: 'Designing something tailored for you...', phase: 'planning' });

        const planningPrompt = PLANNING_PROMPT.replace('{context}', JSON.stringify(understanding, null, 2));
        console.log('[AI] Phase 2: Planning...');
        const planningRaw = await callAI(planningPrompt, 1, 6000);
        console.log(`[AI] Planning raw: ${planningRaw.length} chars`);

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

        const planItems = planData?.items;
        if (planItems?.length) {
          send('thinking', { text: `Planning ${planItems.length} components — mixing content, tools, and resources.`, phase: 'planning' });
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (plan.reasoning) {
          send('thinking', { text: String(plan.reasoning), phase: 'planning' });
          await new Promise(resolve => setTimeout(resolve, 400));
        }

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
          send('thinking', { text: `${item.purpose as string}`, phase: 'building' });
          await new Promise(resolve => setTimeout(resolve, 300));

          send('building', {
            name: item.name,
            type: item.type,
            purpose: item.purpose,
          });

          // Generate content based on type
          let content = '';
          const itemType = item.type as string;

          if (itemType === 'widget' || itemType === 'folder' || itemType === 'link') {
            // No content generation needed for these types
            content = '';
          } else if (itemType === 'board') {
            // Generate structured board content
            try {
              const boardPrompt = BOARD_CONTENT_PROMPT
                .replace('{context}', JSON.stringify(understanding, null, 2))
                .replace('{name}', item.name as string)
                .replace('{purpose}', item.purpose as string)
                .replace('{brief}', item.contentBrief as string);

              const boardRaw = await callAI(boardPrompt, 1, 4000);
              const boardData = extractJSON(boardRaw);
              content = JSON.stringify(boardData);
            } catch (contentError) {
              console.error(`Board content generation failed for ${item.name}:`, contentError);
              // Fallback board
              content = JSON.stringify({
                columns: [
                  { id: 'col-1', title: 'To Do', cards: [
                    { id: 'c1', title: 'Get started', description: 'Add your first items here', order: 0, color: 'blue' },
                  ], order: 0 },
                  { id: 'col-2', title: 'In Progress', cards: [], order: 1 },
                  { id: 'col-3', title: 'Done', cards: [], order: 2 },
                ],
              });
            }
          } else if (itemType === 'sheet') {
            // Generate structured sheet content
            try {
              const sheetPrompt = SHEET_CONTENT_PROMPT
                .replace('{context}', JSON.stringify(understanding, null, 2))
                .replace('{name}', item.name as string)
                .replace('{purpose}', item.purpose as string)
                .replace('{brief}', item.contentBrief as string);

              const sheetRaw = await callAI(sheetPrompt, 1, 6000);
              const sheetData = extractJSON(sheetRaw);
              content = JSON.stringify(sheetData);
            } catch (contentError) {
              console.error(`Sheet content generation failed for ${item.name}:`, contentError);
              // Fallback empty sheet
              content = JSON.stringify({
                data: [
                  [{ value: 'Item', type: 'text' }, { value: 'Description', type: 'text' }, { value: 'Status', type: 'text' }],
                  [{ value: 'Example', type: 'text' }, { value: 'Add your data here', type: 'text' }, { value: 'Pending', type: 'text' }],
                ],
                frozenRows: 1,
              });
            }
          } else if (itemType === 'custom-app') {
            // Generate self-contained HTML/CSS/JS app
            try {
              console.log(`[AI] Generating custom app for "${item.name}"...`);
              const appPrompt = CUSTOM_APP_CONTENT_PROMPT
                .replace('{context}', JSON.stringify(understanding, null, 2))
                .replace('{name}', item.name as string)
                .replace('{purpose}', item.purpose as string)
                .replace('{brief}', item.contentBrief as string);

              content = await callAI(appPrompt, 1, 12000);

              // Clean up markdown fences and :root blocks (host injects CSS vars)
              content = content.replace(/```html?\s*/g, '').replace(/```\s*/g, '').trim();
              content = content.replace(/:root\s*\{[^}]*\}/g, '');

              // If the script tag was truncated, close it so the page doesn't break
              if (content.includes('<script') && !content.includes('</script>')) {
                content += '\n})();\n</script>';
              }

              console.log(`[AI] Custom app for "${item.name}": ${content.length} chars`);
            } catch (contentError) {
              console.error(`[AI] Custom app generation failed for ${item.name}:`, contentError);
              content = `<style>
  .fallback { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; gap: 12px; padding: 32px; }
  .fallback h2 { color: var(--color-text-primary, #171412); font-size: 20px; font-weight: 600; margin: 0; }
  .fallback p { color: var(--color-text-muted, #8a8680); margin: 0; max-width: 280px; line-height: 1.5; }
</style>
<div class="fallback">
  <h2>${item.name}</h2>
  <p>This app is being set up. Edit the content to add your custom HTML, CSS, and JavaScript.</p>
</div>`;
            }
          } else {
            // HTML content for notes, case-studies, embeds
            try {
              console.log(`[AI] Generating content for "${item.name}" (type=${item.type})...`);
              const contentPrompt = CONTENT_PROMPT
                .replace('{context}', JSON.stringify(understanding, null, 2))
                .replace('{name}', item.name as string)
                .replace('{type}', item.type as string)
                .replace('{purpose}', item.purpose as string)
                .replace('{brief}', item.contentBrief as string)
                .replace('{tone}', understanding.tone as string);

              content = await callAI(contentPrompt);

              // Clean up any markdown code blocks from content
              content = content.replace(/```html?\s*/g, '').replace(/```\s*/g, '').trim();
              console.log(`[AI] Content for "${item.name}": ${content.length} chars`);
            } catch (contentError) {
              console.error(`[AI] Content generation failed for ${item.name}:`, contentError);
              content = `<h1>${item.name}</h1><p>Add your content here to personalize this section.</p>`;
            }
          }

          const isWidget = itemType === 'widget';
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
                ...(item.linkUrl ? { linkUrl: item.linkUrl as string } : {}),
                ...(item.parentFolder ? { parentFolder: item.parentFolder as string } : {}),
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
