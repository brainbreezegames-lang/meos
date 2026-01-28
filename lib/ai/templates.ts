/**
 * Fallback Templates
 * Used when AI is unavailable or as base configurations
 */

import type { ParsedIntent, GeneratedContent, BaseTemplate } from './types';

// Keywords that map to templates
const TEMPLATE_KEYWORDS: Record<BaseTemplate, string[]> = {
  portfolio: ['design', 'designer', 'artist', 'creative', 'portfolio', 'showcase', 'work', 'projects', 'visual', 'ui', 'ux', 'graphic', 'illustration', 'photography', 'photographer', 'motion', 'animation', '3d', 'art'],
  business: ['freelance', 'consultant', 'business', 'services', 'client', 'booking', 'schedule', 'professional', 'agency', 'studio', 'hire'],
  writing: ['writer', 'writing', 'blog', 'blogger', 'newsletter', 'author', 'content', 'articles', 'journalist', 'copywriter', 'editor'],
  creative: ['multi', 'mixed', 'experimental', 'interdisciplinary', 'maker', 'creator', 'generalist'],
  personal: ['personal', 'bio', 'links', 'social', 'about me', 'profile', 'influencer'],
  developer: ['developer', 'dev', 'engineer', 'programmer', 'coding', 'software', 'tech', 'code', 'github', 'open source', 'frontend', 'backend', 'fullstack'],
  agency: ['agency', 'team', 'company', 'firm', 'collective', 'group'],
};

// Default configurations per template
const TEMPLATE_CONFIGS: Record<BaseTemplate, Omit<ParsedIntent, 'userType' | 'summary'>> = {
  portfolio: {
    baseTemplate: 'portfolio',
    widgets: ['status', 'contact', 'links'],
    folders: ['Projects', 'Archive'],
    notes: [
      { title: 'About Me', type: 'note' },
      { title: 'Featured Project', type: 'case-study' },
      { title: 'Services', type: 'note' },
    ],
    statusText: 'Available for projects',
    tone: 'creative',
  },
  business: {
    baseTemplate: 'business',
    widgets: ['status', 'contact', 'book'],
    folders: ['Client Work'],
    notes: [
      { title: 'About', type: 'note' },
      { title: 'Services', type: 'note' },
      { title: 'Process', type: 'note' },
    ],
    statusText: 'Open for new clients',
    tone: 'professional',
  },
  writing: {
    baseTemplate: 'writing',
    widgets: ['status', 'links', 'feedback'],
    folders: ['Essays', 'Drafts'],
    notes: [
      { title: 'About Me', type: 'note' },
      { title: 'Latest Post', type: 'note' },
      { title: 'Newsletter', type: 'note' },
    ],
    statusText: 'Writing new things',
    tone: 'casual',
  },
  creative: {
    baseTemplate: 'creative',
    widgets: ['status', 'contact', 'tipjar'],
    folders: ['Experiments', 'Collaborations'],
    notes: [
      { title: 'Hello', type: 'note' },
      { title: 'Current Project', type: 'case-study' },
      { title: 'Influences', type: 'note' },
    ],
    statusText: 'Making things',
    tone: 'playful',
  },
  personal: {
    baseTemplate: 'personal',
    widgets: ['status', 'links', 'clock'],
    folders: [],
    notes: [
      { title: 'Hey there', type: 'note' },
      { title: 'What I\'m up to', type: 'note' },
    ],
    statusText: 'Doing my thing',
    tone: 'casual',
  },
  developer: {
    baseTemplate: 'developer',
    widgets: ['status', 'links', 'contact'],
    folders: ['Projects', 'Open Source'],
    notes: [
      { title: 'About', type: 'note' },
      { title: 'Tech Stack', type: 'note' },
      { title: 'Featured Project', type: 'case-study' },
    ],
    statusText: 'Building cool stuff',
    tone: 'minimal',
  },
  agency: {
    baseTemplate: 'agency',
    widgets: ['status', 'contact', 'book'],
    folders: ['Case Studies', 'Team'],
    notes: [
      { title: 'Who We Are', type: 'note' },
      { title: 'Services', type: 'note' },
      { title: 'Our Process', type: 'note' },
      { title: 'Client Work', type: 'case-study' },
    ],
    statusText: 'Taking on new projects',
    tone: 'professional',
  },
};

// Content templates per note type and template
const CONTENT_TEMPLATES: Record<BaseTemplate, Record<string, string>> = {
  portfolio: {
    'About Me': `<h1>Hey, I'm [Your Name]</h1>
<p>I'm a designer who believes great work comes from genuine curiosity and relentless iteration. Currently based in [City], I spend my days crafting digital experiences that feel both intuitive and delightful.</p>
<p>When I'm not pushing pixels, you'll find me [your hobby] or exploring [your interest].</p>
<p><strong>Let's make something together.</strong></p>`,
    'Featured Project': `<h1>[Project Name]</h1>
<h2>Overview</h2>
<p>A brief description of what this project is and why it matters. What problem did you solve?</p>
<h2>The Challenge</h2>
<p>Describe the constraints, goals, and context that shaped your approach.</p>
<h2>The Solution</h2>
<p>Walk through your process and the key decisions you made along the way.</p>
<h2>Results</h2>
<p>Share the impact—metrics, feedback, or outcomes that demonstrate success.</p>`,
    'Services': `<h2>What I Do</h2>
<ul>
<li><strong>Brand Identity</strong> — Logos, visual systems, guidelines</li>
<li><strong>UI/UX Design</strong> — Interfaces that work beautifully</li>
<li><strong>Creative Direction</strong> — Vision and strategy for projects</li>
</ul>
<p>Every project starts with understanding your goals. <strong>Let's talk.</strong></p>`,
  },
  business: {
    'About': `<h1>Hello, I'm [Your Name]</h1>
<p>I help businesses [your value proposition]. With [X] years of experience in [your field], I've worked with companies like [notable clients] to achieve [outcomes].</p>
<p>My approach combines strategic thinking with hands-on execution to deliver results that matter.</p>`,
    'Services': `<h2>How I Can Help</h2>
<ul>
<li><strong>[Service 1]</strong> — Brief description of what this includes</li>
<li><strong>[Service 2]</strong> — Brief description of what this includes</li>
<li><strong>[Service 3]</strong> — Brief description of what this includes</li>
</ul>
<h2>Pricing</h2>
<p>Projects typically start at $[X]. Book a call to discuss your needs.</p>`,
    'Process': `<h2>How We'll Work Together</h2>
<ol>
<li><strong>Discovery</strong> — We start with a conversation to understand your goals</li>
<li><strong>Strategy</strong> — I develop a clear plan tailored to your needs</li>
<li><strong>Execution</strong> — We work together to bring it to life</li>
<li><strong>Refinement</strong> — Iterate based on feedback and results</li>
</ol>`,
  },
  writing: {
    'About Me': `<h1>Hi, I'm [Your Name]</h1>
<p>I write about [your topics]. My work has appeared in [publications] and reached [audience size] readers.</p>
<p>I believe [your writing philosophy]. Every piece I write aims to [your goal].</p>
<p>Subscribe to get new essays in your inbox.</p>`,
    'Latest Post': `<h1>[Post Title]</h1>
<p><em>Published [date]</em></p>
<p>Your opening hook goes here. Make it count—this is what pulls readers in.</p>
<h2>The main idea</h2>
<p>Develop your argument or story here. Use examples, anecdotes, and evidence to support your point.</p>
<h2>What this means</h2>
<p>Connect the dots. Help readers understand why this matters to them.</p>
<p><em>Thanks for reading. Hit reply if this resonated.</em></p>`,
    'Newsletter': `<h1>The [Newsletter Name]</h1>
<p>Every [frequency], I share [what you share].</p>
<p>Join [X] readers who get [benefit] straight to their inbox.</p>
<ul>
<li>No spam, ever</li>
<li>Unsubscribe anytime</li>
<li>Free forever</li>
</ul>`,
  },
  creative: {
    'Hello': `<h1>Hey</h1>
<p>I'm [Your Name]. I make things.</p>
<p>Sometimes they're [type of work]. Other times they're [other type]. Mostly I'm just following my curiosity and seeing where it leads.</p>
<p>This space is where I share what I'm working on, thinking about, and inspired by.</p>
<p>Come say hi: [your email]</p>`,
    'Current Project': `<h1>[Project Name]</h1>
<p>Right now I'm exploring [concept/medium/idea].</p>
<h2>The spark</h2>
<p>What got you started on this? What question are you trying to answer?</p>
<h2>The process</h2>
<p>How are you approaching it? What are you learning?</p>
<h2>What's next</h2>
<p>Where is this going? What comes after?</p>`,
    'Influences': `<h1>Things I Love</h1>
<p>A running list of people, places, and things that shape how I see and make.</p>
<ul>
<li><strong>[Person/Thing]</strong> — Why they inspire you</li>
<li><strong>[Person/Thing]</strong> — Why they inspire you</li>
<li><strong>[Person/Thing]</strong> — Why they inspire you</li>
</ul>
<p><em>Last updated: [date]</em></p>`,
  },
  personal: {
    'Hey there': `<h1>Hi, I'm [Your Name]</h1>
<p>Welcome to my corner of the internet.</p>
<p>I'm a [what you do] based in [location]. I'm passionate about [your interests] and always up for [what you enjoy].</p>
<p>Connect with me on [platform] or drop me a line at [email].</p>`,
    'What I\'m up to': `<h1>Now</h1>
<p><em>Updated [date]</em></p>
<h2>Working on</h2>
<p>[Current projects or focus areas]</p>
<h2>Reading</h2>
<p>[Books, articles, or content you're consuming]</p>
<h2>Excited about</h2>
<p>[Things you're looking forward to]</p>`,
  },
  developer: {
    'About': `<h1>Hey, I'm [Your Name]</h1>
<p>I'm a [role] who loves building [what you build]. Currently [working at / freelancing / building].</p>
<p>I'm passionate about [your technical interests] and believe in [your philosophy on code/building].</p>
<p>Check out my work on <a href="https://github.com/yourusername">GitHub</a> or reach out to chat.</p>`,
    'Tech Stack': `<h2>Tools I Use</h2>
<ul>
<li><strong>Languages</strong> — TypeScript, Python, [others]</li>
<li><strong>Frontend</strong> — React, Next.js, [others]</li>
<li><strong>Backend</strong> — Node.js, [others]</li>
<li><strong>Database</strong> — PostgreSQL, [others]</li>
<li><strong>Infrastructure</strong> — Vercel, AWS, [others]</li>
</ul>
<p>Always learning. Currently exploring [new tech].</p>`,
    'Featured Project': `<h1>[Project Name]</h1>
<p><a href="https://github.com/you/project">GitHub</a> · <a href="https://project.com">Live Demo</a></p>
<h2>What it does</h2>
<p>Brief explanation of the project and its purpose.</p>
<h2>How it works</h2>
<p>Technical overview of the architecture and key decisions.</p>
<h2>Lessons learned</h2>
<p>What you discovered building this.</p>`,
  },
  agency: {
    'Who We Are': `<h1>[Agency Name]</h1>
<p>We're a [type] studio helping [clients] achieve [outcomes].</p>
<p>Founded in [year], we've partnered with brands like [notable clients] to create work that [impact].</p>
<p>Our team brings together expertise in [disciplines] to deliver results that matter.</p>`,
    'Services': `<h2>What We Do</h2>
<ul>
<li><strong>[Service 1]</strong> — Detailed description</li>
<li><strong>[Service 2]</strong> — Detailed description</li>
<li><strong>[Service 3]</strong> — Detailed description</li>
</ul>
<h2>Engagement Models</h2>
<p>We work on projects, retainers, or embedded partnerships. Let's find the right fit.</p>`,
    'Our Process': `<h2>How We Work</h2>
<ol>
<li><strong>Discover</strong> — Deep dive into your business, users, and goals</li>
<li><strong>Define</strong> — Align on strategy, scope, and success metrics</li>
<li><strong>Design</strong> — Create and iterate on solutions</li>
<li><strong>Deliver</strong> — Launch, measure, and optimize</li>
</ol>`,
    'Client Work': `<h1>[Client Name] Case Study</h1>
<h2>The Brief</h2>
<p>What the client needed and why.</p>
<h2>Our Approach</h2>
<p>How we tackled the challenge.</p>
<h2>The Work</h2>
<p>What we delivered and key highlights.</p>
<h2>Results</h2>
<p>Impact and outcomes achieved.</p>`,
  },
};

/**
 * Detect template from user input using keyword matching
 */
export function detectTemplate(input: string): BaseTemplate {
  const lowercaseInput = input.toLowerCase();

  let bestMatch: BaseTemplate = 'portfolio';
  let bestScore = 0;

  for (const [template, keywords] of Object.entries(TEMPLATE_KEYWORDS)) {
    const score = keywords.filter(keyword => lowercaseInput.includes(keyword)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template as BaseTemplate;
    }
  }

  return bestMatch;
}

/**
 * Extract user type from input (simple extraction)
 */
export function extractUserType(input: string): string {
  // Common patterns to extract profession
  const patterns = [
    /i(?:'m| am) (?:a |an )?([a-z\s]+?)(?:\.|,|who|based|and|working)/i,
    /([a-z\s]+?) (?:looking|wanting|need)/i,
    /^([a-z\s]+?) here/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback: use first few words
  return input.split(/[.,!?]/).join('').split(' ').slice(0, 4).join(' ');
}

/**
 * Generate fallback intent (when AI is unavailable)
 */
export function generateFallbackIntent(input: string): ParsedIntent {
  const template = detectTemplate(input);
  const config = TEMPLATE_CONFIGS[template];
  const userType = extractUserType(input);

  return {
    userType,
    ...config,
    summary: `Setting up a ${template} space for ${userType}`,
  };
}

/**
 * Generate fallback content (when AI is unavailable)
 */
export function generateFallbackContent(intent: ParsedIntent): GeneratedContent {
  const templateContent = CONTENT_TEMPLATES[intent.baseTemplate] || CONTENT_TEMPLATES.portfolio;
  const content: GeneratedContent = {};

  for (const note of intent.notes) {
    if (templateContent[note.title]) {
      content[note.title] = templateContent[note.title];
    } else {
      // Generate generic content for unknown titles
      content[note.title] = `<h1>${note.title}</h1>
<p>Add your content here. This is your space to share your story.</p>`;
    }
  }

  return content;
}
