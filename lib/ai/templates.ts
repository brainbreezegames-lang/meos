/**
 * Fallback Templates
 * Used when AI is unavailable or as base configurations
 */

import type { ParsedIntent, GeneratedContent, BaseTemplate, WidgetType, FileType } from './types';

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

// Default configurations per template with explanations
interface TemplateConfig {
  baseTemplate: BaseTemplate;
  understanding: string;
  widgets: Array<{ type: WidgetType; reason: string }>;
  folders: Array<{ name: string; reason: string }>;
  notes: Array<{ title: string; type: FileType; reason: string }>;
  statusText: string;
  tone: 'professional' | 'casual' | 'creative' | 'minimal' | 'playful';
}

const TEMPLATE_CONFIGS: Record<BaseTemplate, TemplateConfig> = {
  portfolio: {
    baseTemplate: 'portfolio',
    understanding: 'I see you\'re a creative professional looking to showcase your work. You\'ll need a space to display projects, share your story, and make it easy for potential clients to reach you.',
    widgets: [
      { type: 'status', reason: 'Let visitors know if you\'re available for new projects' },
      { type: 'contact', reason: 'Make it easy for potential clients to reach out' },
    ],
    folders: [
      { name: 'Projects', reason: 'A place to organize your portfolio pieces by project' },
    ],
    notes: [
      { title: 'About Me', type: 'note', reason: 'Tell your story and what makes your work unique' },
      { title: 'Featured Work', type: 'case-study', reason: 'Showcase your best project with context and results' },
    ],
    statusText: 'Available for projects',
    tone: 'creative',
  },
  business: {
    baseTemplate: 'business',
    understanding: 'You\'re running a service-based business and need a professional space to present your offerings, build trust, and convert visitors into clients.',
    widgets: [
      { type: 'status', reason: 'Show your current availability for new clients' },
      { type: 'contact', reason: 'Capture leads and make booking easy' },
    ],
    folders: [
      { name: 'Client Work', reason: 'Showcase successful projects and testimonials' },
    ],
    notes: [
      { title: 'About', type: 'note', reason: 'Build trust by sharing your background and approach' },
      { title: 'Services', type: 'note', reason: 'Clearly outline what you offer and how you help' },
    ],
    statusText: 'Open for new clients',
    tone: 'professional',
  },
  writing: {
    baseTemplate: 'writing',
    understanding: 'You\'re a writer looking to share your work, build an audience, and connect with readers. Your space should feel personal and make your writing the focus.',
    widgets: [
      { type: 'status', reason: 'Share what you\'re currently working on' },
      { type: 'links', reason: 'Connect readers to your newsletter, social, or publications' },
    ],
    folders: [
      { name: 'Essays', reason: 'Organize your published pieces by topic or date' },
    ],
    notes: [
      { title: 'About Me', type: 'note', reason: 'Let readers know who you are and what you write about' },
      { title: 'Latest Post', type: 'note', reason: 'Feature your most recent or best piece' },
    ],
    statusText: 'Writing new things',
    tone: 'casual',
  },
  creative: {
    baseTemplate: 'creative',
    understanding: 'You\'re a multi-disciplinary creative who doesn\'t fit into one box. Your space should be flexible enough to hold different types of work and experiments.',
    widgets: [
      { type: 'status', reason: 'Share what you\'re currently making' },
      { type: 'contact', reason: 'Open doors for collaborations and commissions' },
    ],
    folders: [
      { name: 'Work', reason: 'A flexible space for all your different projects' },
    ],
    notes: [
      { title: 'Hello', type: 'note', reason: 'Introduce yourself and what you\'re about' },
      { title: 'Current Project', type: 'case-study', reason: 'Show what you\'re working on now' },
    ],
    statusText: 'Making things',
    tone: 'playful',
  },
  personal: {
    baseTemplate: 'personal',
    understanding: 'You want a simple personal space - a home base on the internet to share who you are and link to your other profiles and projects.',
    widgets: [
      { type: 'status', reason: 'A quick update on what you\'re up to' },
      { type: 'links', reason: 'Connect all your profiles in one place' },
    ],
    folders: [],
    notes: [
      { title: 'Hey there', type: 'note', reason: 'A simple introduction to who you are' },
      { title: 'Now', type: 'note', reason: 'Share what you\'re focused on right now' },
    ],
    statusText: 'Doing my thing',
    tone: 'casual',
  },
  developer: {
    baseTemplate: 'developer',
    understanding: 'You\'re a developer looking to showcase your technical skills, projects, and maybe attract job opportunities or collaborators.',
    widgets: [
      { type: 'status', reason: 'Show if you\'re open to work or collaborations' },
      { type: 'links', reason: 'Link to GitHub, LinkedIn, and other dev profiles' },
    ],
    folders: [
      { name: 'Projects', reason: 'Showcase your code work and side projects' },
    ],
    notes: [
      { title: 'About', type: 'note', reason: 'Share your background and what you build' },
      { title: 'Featured Project', type: 'case-study', reason: 'Deep dive into your best technical work' },
    ],
    statusText: 'Building cool stuff',
    tone: 'minimal',
  },
  agency: {
    baseTemplate: 'agency',
    understanding: 'You\'re representing a team or agency. Your space needs to showcase collective work, introduce the team, and feel trustworthy to potential clients.',
    widgets: [
      { type: 'status', reason: 'Show your team\'s current capacity' },
      { type: 'contact', reason: 'Make it easy for clients to start a conversation' },
    ],
    folders: [
      { name: 'Case Studies', reason: 'Detailed breakdowns of your best client work' },
    ],
    notes: [
      { title: 'Who We Are', type: 'note', reason: 'Tell your agency\'s story and values' },
      { title: 'Services', type: 'note', reason: 'Clearly outline how you help clients' },
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
<p>When I'm not pushing pixels, you'll find me exploring new places or getting lost in a good book.</p>
<p><strong>Let's make something together.</strong></p>`,
    'Featured Work': `<h1>Project Name</h1>
<h2>Overview</h2>
<p>A brief description of what this project is and why it matters. What problem did you solve?</p>
<h2>The Challenge</h2>
<p>Describe the constraints, goals, and context that shaped your approach.</p>
<h2>Results</h2>
<p>Share the impact—metrics, feedback, or outcomes that demonstrate success.</p>`,
  },
  business: {
    'About': `<h1>Hello, I'm [Your Name]</h1>
<p>I help businesses achieve their goals through strategic thinking and hands-on execution. With years of experience in my field, I've worked with companies of all sizes to deliver results that matter.</p>
<p>My approach combines deep understanding of your needs with practical solutions that work.</p>`,
    'Services': `<h2>How I Can Help</h2>
<ul>
<li><strong>Strategy</strong> — Clear direction and actionable plans</li>
<li><strong>Execution</strong> — Hands-on implementation that delivers</li>
<li><strong>Growth</strong> — Sustainable results that last</li>
</ul>
<p>Every engagement starts with understanding your goals. Let's talk.</p>`,
  },
  writing: {
    'About Me': `<h1>Hi, I'm [Your Name]</h1>
<p>I write about the things that fascinate me—ideas worth exploring and stories worth telling.</p>
<p>My goal is simple: write things that make people think, feel, or see the world a little differently.</p>
<p>Subscribe to get new essays in your inbox.</p>`,
    'Latest Post': `<h1>The Title Goes Here</h1>
<p>Your opening hook goes here. Make it count—this is what pulls readers in.</p>
<p>Develop your argument or story here. Use examples, anecdotes, and evidence to support your point.</p>
<p><em>Thanks for reading. Hit reply if this resonated.</em></p>`,
  },
  creative: {
    'Hello': `<h1>Hey</h1>
<p>I'm [Your Name]. I make things.</p>
<p>Sometimes they're digital. Other times they're physical. Mostly I'm just following my curiosity and seeing where it leads.</p>
<p>This space is where I share what I'm working on and thinking about.</p>`,
    'Current Project': `<h1>What I'm Making Now</h1>
<p>Right now I'm exploring something new.</p>
<h2>The spark</h2>
<p>What got me started on this and what question I'm trying to answer.</p>
<h2>The process</h2>
<p>How I'm approaching it and what I'm learning along the way.</p>`,
  },
  personal: {
    'Hey there': `<h1>Hi, I'm [Your Name]</h1>
<p>Welcome to my corner of the internet.</p>
<p>I'm passionate about the things I love and always up for interesting conversations.</p>
<p>Feel free to reach out.</p>`,
    'Now': `<h1>Now</h1>
<h2>Working on</h2>
<p>Current projects and focus areas.</p>
<h2>Excited about</h2>
<p>Things I'm looking forward to.</p>`,
  },
  developer: {
    'About': `<h1>Hey, I'm [Your Name]</h1>
<p>I'm a developer who loves building things that matter. Currently focused on creating great user experiences and solving interesting problems.</p>
<p>Check out my work on GitHub or reach out to chat.</p>`,
    'Featured Project': `<h1>Project Name</h1>
<h2>What it does</h2>
<p>Brief explanation of the project and its purpose.</p>
<h2>How it works</h2>
<p>Technical overview of the architecture and key decisions.</p>
<h2>Lessons learned</h2>
<p>What I discovered building this.</p>`,
  },
  agency: {
    'Who We Are': `<h1>We're [Agency Name]</h1>
<p>A studio helping ambitious brands achieve their goals.</p>
<p>Our team brings together expertise across disciplines to deliver results that matter.</p>`,
    'Services': `<h2>What We Do</h2>
<ul>
<li><strong>Strategy</strong> — Clear direction and planning</li>
<li><strong>Design</strong> — Beautiful, functional solutions</li>
<li><strong>Development</strong> — Built to last</li>
</ul>
<p>Let's find the right fit for your project.</p>`,
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
  const patterns = [
    /i(?:'m| am) (?:a |an )?([a-z\s-]+?)(?:\.|,|who|based|and|working|specializ)/i,
    /([a-z\s-]+?) (?:looking|wanting|need)/i,
    /^([a-z\s-]+?) here/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return input.split(/[.,!?]/).join('').split(' ').slice(0, 4).join(' ');
}

/**
 * Extract specific niche/specialty from input
 */
function extractNiche(input: string): string | null {
  const patterns = [
    /specializ(?:e|ing) in ([a-z\s,]+?)(?:\.|,|and|who)/i,
    /focus(?:ed|ing)? on ([a-z\s,]+?)(?:\.|,|and)/i,
    /(?:do|create|make|build) ([a-z\s,]+?)(?:\.|,|for|that)/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Extract location from input
 */
function extractLocation(input: string): string | null {
  const match = input.match(/(?:based in|from|in) ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
  return match ? match[1] : null;
}

/**
 * Create personalized folder names based on user input
 */
function createPersonalizedFolders(input: string, template: BaseTemplate): Array<{ name: string; reason: string }> {
  const lowercaseInput = input.toLowerCase();

  // Check for specific mentions to create personalized folders
  const folderSuggestions: Array<{ keywords: string[]; folder: { name: string; reason: string } }> = [
    { keywords: ['wedding', 'weddings'], folder: { name: 'Weddings', reason: 'Showcase your wedding photography work' } },
    { keywords: ['portrait', 'portraits'], folder: { name: 'Portraits', reason: 'Display your portrait sessions' } },
    { keywords: ['engagement', 'couples'], folder: { name: 'Engagement Sessions', reason: 'Feature your engagement photo shoots' } },
    { keywords: ['startup', 'startups'], folder: { name: 'Startup Projects', reason: 'Showcase your work with startups' } },
    { keywords: ['app', 'apps', 'mobile'], folder: { name: 'App Designs', reason: 'Display your app design work' } },
    { keywords: ['brand', 'branding'], folder: { name: 'Brand Work', reason: 'Showcase your branding projects' } },
    { keywords: ['web', 'website'], folder: { name: 'Web Projects', reason: 'Feature your web design work' } },
    { keywords: ['product'], folder: { name: 'Product Design', reason: 'Showcase your product design work' } },
    { keywords: ['newsletter', 'essays'], folder: { name: 'Writing', reason: 'Organize your published writing' } },
    { keywords: ['open source', 'github'], folder: { name: 'Open Source', reason: 'Highlight your open source contributions' } },
    { keywords: ['client', 'clients'], folder: { name: 'Client Work', reason: 'Organize your client projects' } },
  ];

  const folders: Array<{ name: string; reason: string }> = [];

  for (const { keywords, folder } of folderSuggestions) {
    if (keywords.some(k => lowercaseInput.includes(k))) {
      folders.push(folder);
      if (folders.length >= 2) break;
    }
  }

  // If no specific folders found, use template defaults
  if (folders.length === 0) {
    return TEMPLATE_CONFIGS[template].folders;
  }

  return folders;
}

/**
 * Create personalized notes based on user input
 */
function createPersonalizedNotes(input: string, userType: string, template: BaseTemplate): Array<{ title: string; type: FileType; reason: string }> {
  const niche = extractNiche(input);
  const notes: Array<{ title: string; type: FileType; reason: string }> = [];

  // Always add an About note with personalized title
  if (userType.length > 3) {
    notes.push({
      title: `About Me`,
      type: 'note',
      reason: `Tell visitors about your work as a ${userType}`,
    });
  } else {
    notes.push({
      title: 'About Me',
      type: 'note',
      reason: 'Introduce yourself and your work',
    });
  }

  // Add a featured work note based on what they do
  if (niche) {
    notes.push({
      title: `${niche.charAt(0).toUpperCase() + niche.slice(1)} Showcase`,
      type: 'case-study',
      reason: `Highlight your best ${niche} work`,
    });
  } else {
    // Fallback to template notes
    const templateNotes = TEMPLATE_CONFIGS[template].notes.filter(n => n.type === 'case-study');
    if (templateNotes.length > 0) {
      notes.push(templateNotes[0]);
    } else {
      notes.push({
        title: 'Featured Work',
        type: 'case-study',
        reason: 'Showcase your best project',
      });
    }
  }

  return notes;
}

/**
 * Generate fallback intent (when AI is unavailable)
 */
export function generateFallbackIntent(input: string): ParsedIntent {
  const template = detectTemplate(input);
  const config = TEMPLATE_CONFIGS[template];
  const userType = extractUserType(input);
  const niche = extractNiche(input);
  const location = extractLocation(input);

  // Create personalized folders and notes based on input
  const folders = createPersonalizedFolders(input, template);
  const notes = createPersonalizedNotes(input, userType, template);

  // Create personalized understanding
  let understanding = `I see you're a ${userType}`;
  if (niche) {
    understanding += ` specializing in ${niche}`;
  }
  if (location) {
    understanding += ` based in ${location}`;
  }
  understanding += `. I'll set up a space to showcase your work and help visitors connect with you.`;

  // Create personalized status
  let statusText = config.statusText;
  if (niche) {
    statusText = `Taking on ${niche} projects`;
  }

  return {
    userType,
    baseTemplate: config.baseTemplate,
    understanding,
    widgets: config.widgets,
    folders,
    notes,
    statusText,
    tone: config.tone,
    summary: `Creating a ${template} space for ${userType}`,
  };
}

/**
 * Generate fallback content (when AI is unavailable)
 */
export function generateFallbackContent(intent: ParsedIntent): GeneratedContent {
  const templateContent = CONTENT_TEMPLATES[intent.baseTemplate] || CONTENT_TEMPLATES.portfolio;
  const content: GeneratedContent = {};

  for (const note of intent.notes) {
    // Check if we have a matching template
    if (templateContent[note.title]) {
      content[note.title] = templateContent[note.title];
    } else if (note.title === 'About Me' || note.title.startsWith('About')) {
      // Personalized About content
      content[note.title] = `<h1>Hey, I'm [Your Name]</h1>
<p>I'm a ${intent.userType} passionate about creating work that makes a difference.</p>
<p>My approach combines creativity with purpose—every project is an opportunity to solve problems and create something meaningful.</p>
<p><strong>Let's work together.</strong></p>`;
    } else if (note.type === 'case-study') {
      // Personalized case study content
      content[note.title] = `<h1>${note.title}</h1>
<h2>The Challenge</h2>
<p>Describe the problem you solved and why it mattered.</p>
<h2>The Approach</h2>
<p>Explain your process and the key decisions you made.</p>
<h2>The Results</h2>
<p>Share the impact and outcomes of your work.</p>`;
    } else {
      // Generic but helpful placeholder
      content[note.title] = `<h1>${note.title}</h1>
<p>Share your story here. What makes your work unique? What drives you?</p>
<p>This is your space—make it yours.</p>`;
    }
  }

  return content;
}
