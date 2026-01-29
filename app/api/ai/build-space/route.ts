import { NextRequest } from 'next/server';

/**
 * Streaming endpoint for intelligent space building
 * Uses Server-Sent Events to stream AI reasoning and progress in real-time
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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

If the user asks for something that can't be built with available components (custom calculator, store, interactive tool):
- Create a note as a thoughtful placeholder that acknowledges the need
- Describe what the tool would do and suggest a workaround
- Never promise features that don't exist — be honest and helpful

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
        "type": "note|case-study|folder|embed|board|sheet|link|widget",
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

// Primary: Gemini API (more reliable)
async function callGemini(prompt: string, maxTokens = 2000): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini error:', response.status, error);
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

// Fallback: OpenRouter API
async function callOpenRouter(prompt: string, maxTokens = 2000): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');

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
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter error:', response.status, error);
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Try Gemini first, then OpenRouter, with retries
async function callAI(prompt: string, retries = 1, maxTokens = 2000): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    // Try Gemini first
    if (GEMINI_API_KEY) {
      try {
        return await callGemini(prompt, maxTokens);
      } catch (err) {
        console.error(`Gemini attempt ${attempt} failed:`, err);
      }
    }

    // Try OpenRouter as fallback
    if (OPENROUTER_API_KEY) {
      try {
        return await callOpenRouter(prompt, maxTokens);
      } catch (err) {
        console.error(`OpenRouter attempt ${attempt} failed:`, err);
      }
    }

    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }

  throw new Error('All AI providers failed');
}

// Curated Unsplash wallpapers mapped to keywords — no API key needed
const WALLPAPER_CATALOG: Array<{ keywords: string[]; url: string }> = [
  // Design / Creative
  { keywords: ['design', 'creative', 'ui', 'ux', 'graphic', 'minimal', 'workspace', 'studio'],
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=2560&h=1440&fit=crop&q=85' },
  // Technology / Code / Developer
  { keywords: ['code', 'developer', 'engineer', 'programming', 'tech', 'software', 'data', 'cyber', 'hacker'],
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=2560&h=1440&fit=crop&q=85' },
  // Food / Bakery / Chef / Restaurant
  { keywords: ['food', 'bakery', 'baker', 'chef', 'restaurant', 'cook', 'culinary', 'kitchen', 'cafe', 'coffee'],
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=2560&h=1440&fit=crop&q=85' },
  // Photography / Camera
  { keywords: ['photo', 'camera', 'film', 'cinema', 'video', 'visual', 'shoot'],
    url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=2560&h=1440&fit=crop&q=85' },
  // Music / Audio
  { keywords: ['music', 'audio', 'sound', 'band', 'dj', 'producer', 'singer', 'instrument', 'piano', 'guitar'],
    url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=2560&h=1440&fit=crop&q=85' },
  // Books / Writing / Literature
  { keywords: ['book', 'write', 'writer', 'author', 'blog', 'journal', 'read', 'library', 'literature', 'poet', 'story'],
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=2560&h=1440&fit=crop&q=85' },
  // Travel / Adventure
  { keywords: ['travel', 'adventure', 'explore', 'wander', 'backpack', 'tourist', 'nomad', 'trip', 'journey'],
    url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=2560&h=1440&fit=crop&q=85' },
  // Architecture / Buildings
  { keywords: ['architect', 'building', 'interior', 'house', 'real estate', 'construction', 'urban', 'city'],
    url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=2560&h=1440&fit=crop&q=85' },
  // Art / Gallery / Painting
  { keywords: ['art', 'gallery', 'paint', 'illustrat', 'draw', 'sculpt', 'canvas', 'museum', 'craft'],
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=2560&h=1440&fit=crop&q=85' },
  // Fitness / Sports / Health
  { keywords: ['fitness', 'gym', 'sport', 'health', 'yoga', 'workout', 'training', 'wellness', 'coach'],
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=2560&h=1440&fit=crop&q=85' },
  // Fashion / Style
  { keywords: ['fashion', 'style', 'clothing', 'model', 'brand', 'apparel', 'textile', 'boutique'],
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=2560&h=1440&fit=crop&q=85' },
  // Education / Student / Learning
  { keywords: ['student', 'education', 'learn', 'teach', 'school', 'university', 'study', 'academic', 'tutor'],
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=2560&h=1440&fit=crop&q=85' },
  // Business / Finance / Consulting
  { keywords: ['business', 'finance', 'consulting', 'startup', 'entrepreneur', 'corporate', 'marketing', 'agency'],
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=2560&h=1440&fit=crop&q=85' },
  // Nature / Garden / Botanical
  { keywords: ['nature', 'garden', 'plant', 'botanical', 'flower', 'outdoor', 'landscape', 'forest', 'green'],
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2560&h=1440&fit=crop&q=85' },
  // Ocean / Marine / Surf
  { keywords: ['ocean', 'sea', 'marine', 'surf', 'beach', 'coast', 'water', 'dive', 'sail'],
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=2560&h=1440&fit=crop&q=85' },
  // Space / Astronomy / Science
  { keywords: ['space', 'star', 'astro', 'science', 'cosmos', 'galaxy', 'night sky', 'research'],
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2560&h=1440&fit=crop&q=85' },
  // Gaming / Esports
  { keywords: ['game', 'gaming', 'esport', 'streamer', 'twitch', 'neon', 'rgb'],
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=2560&h=1440&fit=crop&q=85' },
  // Pet / Animal / Vet
  { keywords: ['pet', 'animal', 'dog', 'cat', 'vet', 'veterinar'],
    url: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=2560&h=1440&fit=crop&q=85' },
];

// Generic fallbacks — beautiful wallpapers for anything not matched
const FALLBACK_WALLPAPERS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2560&h=1440&fit=crop&q=85', // Alpine peaks
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=2560&h=1440&fit=crop&q=85', // Sand dunes
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2560&h=1440&fit=crop&q=85', // Abstract blue
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=2560&h=1440&fit=crop&q=85', // Gradient mesh
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2560&h=1440&fit=crop&q=85', // Starry peaks
];

function findWallpaperForKeyword(keyword: string): string {
  const lower = keyword.toLowerCase();
  for (const entry of WALLPAPER_CATALOG) {
    if (entry.keywords.some(kw => lower.includes(kw) || kw.includes(lower))) {
      return entry.url;
    }
  }
  // Return a random fallback
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
          const understandingRaw = await callAI(understandingPrompt);
          understanding = extractJSON(understandingRaw) as Record<string, unknown>;

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
        send('wallpaper', { url: findWallpaperForKeyword(wallpaperKeyword) });

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
        const planningRaw = await callAI(planningPrompt);

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
          } else {
            // HTML content for notes, case-studies, embeds
            try {
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
            } catch (contentError) {
              console.error(`Content generation failed for ${item.name}:`, contentError);
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
