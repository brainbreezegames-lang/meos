'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Home, User, FileText, Briefcase, Sun, Moon, ChevronDown, ArrowLeft } from 'lucide-react';
import type { GoOSFileData } from '@/contexts/GoOSContext';

type PageSection = 'home' | 'about' | 'posts' | 'work';

interface WebsiteViewProps {
  files: GoOSFileData[];
  onClose?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE CONTENT - Following paulstamatiou.com structure
// ═══════════════════════════════════════════════════════════════════════════

const AUTHOR = {
  name: 'Paul Stamatiou',
  handle: 'Stammy',
  title: 'a designer who codes',
  tagline: 'Welcome to my corner of the web where I write about design, code, startups and just about anything that interests me. I\'ve designed, built and written for this site for over 20 years.',
  role: 'I\'m the Head of Design at',
  company: 'Sesame',
  roleDescription: ', where I focus on making AI voice companions useful for everyday life.',
  funFacts: [
    'Initially majored in Computer Engineering (EE)',
    'Longtime tinkerer, etching PCBs and soldering at 7',
    'Had my own Nike commercial for Nike+iPod',
    'Dual citizen of the US and Greece',
  ],
  bio: [
    'I\'m a designer who loves to code. I\'m a huge advocate for having a <strong>high product quality bar</strong> and know that having an intimate understanding of technical constraints is a core part of elevating quality.',
    'While I obsess over the details in visual design, interaction design and code, I\'ve done this long enough to know that successful designs encompass much more than that. They\'re collaborative endeavors spanning research, engineering, product, design and more. But most importantly, I know there\'s always compromise in the design process, and embracing pragmatism.',
  ],
  experience: [
    { company: 'Sesame', role: 'Head of Design', years: '2025–', highlight: true },
    { company: 'Limitless (Acquired by Meta)', role: 'Co-Founder, Head of Design', years: '2022–2025' },
    { company: 'Kraken', role: 'Principal Product Designer', years: '2021–2022' },
    { company: 'Twitter', role: 'Sr Staff Product Designer', years: '2013–2021' },
    { company: 'Picplum (YC S11)', role: 'Co-Founder', years: '2011–2013' },
    { company: 'Notifo (YC W10)', role: 'Co-Founder', years: '2010–2011' },
    { company: 'Skribit', role: 'Co-Founder', years: '2007–2010' },
    { company: 'Georgia Tech', role: 'Web Developer', years: '2007' },
    { company: 'Yahoo!', role: 'Web Developer Intern', years: '2006' },
  ],
  yearsActive: '20.41',
};

const SAMPLE_POSTS = [
  { id: 'post-1', title: '2025', subtitle: 'Year in review: Limitless, Sesame, Claude Code, and more', date: '', featured: true },
  { id: 'post-2', title: 'Browse No More', subtitle: 'The magic we once had with browsing the web is dwindling.', date: 'March 13, 2025', featured: true },
  { id: 'post-3', title: 'The Startup Designer', subtitle: 'Navigating the chaos, crafting the future', date: '' },
  { id: 'post-4', title: 'Stocketa', subtitle: 'A dive into the app I designed, built and never launched.', date: '' },
  { id: 'post-5', title: 'Digital clutter', subtitle: 'Learning to let go and stop hoarding terabytes', date: '' },
];

interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  tags: string[];
  heroImage?: string;
  overview: {
    role: string;
    timeline: string;
    team: string;
    tools: string;
  };
  sections: Array<{
    type: 'text' | 'image' | 'quote' | 'stats';
    title?: string;
    content?: string;
    image?: string;
    caption?: string;
    quote?: string;
    attribution?: string;
    stats?: Array<{ value: string; label: string }>;
  }>;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'sesame',
    title: 'Sesame Voice AI',
    subtitle: 'Designing AI companions that feel genuinely human',
    year: '2025',
    tags: ['Product Design', 'AI', 'Voice UI'],
    overview: {
      role: 'Head of Design',
      timeline: 'Ongoing (2025–)',
      team: 'Design, Engineering, Research',
      tools: 'Figma, Protopie, Swift',
    },
    sections: [
      {
        type: 'text',
        title: 'The Challenge',
        content: 'Voice AI has a uncanny valley problem. Most voice assistants feel robotic, transactional, and forgettable. Sesame set out to create something different—an AI companion that feels like talking to a thoughtful friend, not a command-line interface with a voice.',
      },
      {
        type: 'quote',
        quote: 'The best interface is no interface at all. Voice should feel like a conversation, not a series of commands.',
        attribution: 'Design principle we established early on',
      },
      {
        type: 'text',
        title: 'Design Philosophy',
        content: 'We approached voice interaction design by studying how humans actually converse. Real conversations have rhythm, interruptions, thinking pauses, and emotional undertones. We designed for all of these edge cases, creating a system that could handle the messiness of natural speech.',
      },
      {
        type: 'stats',
        stats: [
          { value: '94%', label: 'User satisfaction score' },
          { value: '3.2x', label: 'Longer conversations vs competitors' },
          { value: '< 200ms', label: 'Response latency' },
        ],
      },
      {
        type: 'text',
        title: 'Key Design Decisions',
        content: 'The visual interface is intentionally minimal. When the AI is listening, a subtle waveform indicates attention. When speaking, the waveform shifts to show vocal patterns. There are no buttons to press, no menus to navigate. The entire experience is voice-first, with visual feedback serving only to build trust and understanding.',
      },
      {
        type: 'text',
        title: 'Learnings',
        content: 'Designing for voice taught me that silence is a design element. The pauses between words, the moments of processing, the breathing room in conversation—all of these needed to be designed as carefully as the words themselves.',
      },
    ],
  },
  {
    id: 'limitless',
    title: 'Limitless Pendant',
    subtitle: 'Wearable AI for perfect memory',
    year: '2024',
    tags: ['Hardware', 'AI', 'Wearables'],
    overview: {
      role: 'Co-Founder, Head of Design',
      timeline: '2022–2025',
      team: 'Design, Hardware, ML',
      tools: 'Figma, Blender, Solidworks',
    },
    sections: [
      {
        type: 'text',
        title: 'The Problem',
        content: 'We forget 70% of what we hear within 24 hours. In a world of back-to-back meetings, important details slip through the cracks. Limitless was born from a simple question: what if you never had to take notes again?',
      },
      {
        type: 'text',
        title: 'Hardware Constraints',
        content: 'Designing a wearable that people would actually wear meant making hard tradeoffs. Battery life vs size. Microphone quality vs aesthetics. Privacy indicators vs subtlety. Every millimeter mattered.',
      },
      {
        type: 'quote',
        quote: 'The best wearable is the one you forget you\'re wearing.',
        attribution: 'Our north star for industrial design',
      },
      {
        type: 'stats',
        stats: [
          { value: '8hr', label: 'Battery life' },
          { value: '12g', label: 'Total weight' },
          { value: '98%', label: 'Transcription accuracy' },
        ],
      },
      {
        type: 'text',
        title: 'The Interface',
        content: 'The companion app needed to surface insights without creating more work. We designed an AI-powered summary system that distills hours of conversation into actionable takeaways. No manual tagging, no organization required.',
      },
      {
        type: 'text',
        title: 'Outcome',
        content: 'Limitless was acquired by Meta in 2025. The technology we built is now being integrated into the next generation of AI wearables. Seeing our vision for ambient computing realized at scale has been incredibly rewarding.',
      },
    ],
  },
  {
    id: 'twitter-media',
    title: 'Twitter Media Studio',
    subtitle: 'Professional tools for creators at scale',
    year: '2020',
    tags: ['Product Design', 'Creator Tools'],
    overview: {
      role: 'Sr Staff Product Designer',
      timeline: '2019–2020',
      team: 'Design, Engineering, Creator Partnerships',
      tools: 'Figma, Framer, React',
    },
    sections: [
      {
        type: 'text',
        title: 'Background',
        content: 'Twitter\'s creator tools were scattered across multiple surfaces with inconsistent experiences. Media Studio aimed to unify everything—scheduling, analytics, monetization, and rights management—into a single professional-grade dashboard.',
      },
      {
        type: 'text',
        title: 'Research',
        content: 'We spent weeks shadowing creators—from individual podcasters to major media companies. The range of workflows was staggering, but patterns emerged: everyone needed better scheduling, everyone wanted deeper analytics, and everyone was frustrated by the complexity of managing media rights.',
      },
      {
        type: 'stats',
        stats: [
          { value: '10M+', label: 'Videos managed monthly' },
          { value: '40%', label: 'Reduction in support tickets' },
          { value: '2.5x', label: 'Increase in scheduled posts' },
        ],
      },
      {
        type: 'text',
        title: 'Design System',
        content: 'We created a component library specifically for pro tools—denser information display, keyboard shortcuts for power users, and dark mode as the default. The visual language had to feel serious and capable while remaining approachable.',
      },
      {
        type: 'text',
        title: 'Impact',
        content: 'Media Studio became the go-to tool for professional Twitter creators. The unified dashboard reduced time spent on administrative tasks by an average of 3 hours per week for power users.',
      },
    ],
  },
  {
    id: 'twitter-composer',
    title: 'Twitter Composer',
    subtitle: 'Reimagining how we write tweets',
    year: '2019',
    tags: ['Product Design', 'Core Product'],
    overview: {
      role: 'Sr Staff Product Designer',
      timeline: '2018–2019',
      team: 'Design, Engineering, Research',
      tools: 'Figma, Principle, Swift',
    },
    sections: [
      {
        type: 'text',
        title: 'The Brief',
        content: 'The tweet composer hadn\'t fundamentally changed since 2006. As Twitter evolved—threads, polls, media attachments—the composer became a cramped afterthought. We needed to reimagine it for the modern Twitter experience.',
      },
      {
        type: 'text',
        title: 'Constraints',
        content: 'Composing a tweet should feel effortless. Any friction we added would directly impact engagement. We had to enhance capability while maintaining the simplicity that made Twitter sticky in the first place.',
      },
      {
        type: 'quote',
        quote: 'The compose button is the most important button on Twitter. Everything flows from that moment of expression.',
        attribution: 'From our design principles document',
      },
      {
        type: 'text',
        title: 'The Solution',
        content: 'We introduced a modular attachment system—media, polls, location, and scheduling all became first-class citizens without cluttering the default experience. The character count evolved into a contextual progress ring. Thread composition became seamless.',
      },
      {
        type: 'stats',
        stats: [
          { value: '23%', label: 'Increase in tweets with media' },
          { value: '15%', label: 'More threads created' },
          { value: '4.7★', label: 'App Store rating maintained' },
        ],
      },
      {
        type: 'text',
        title: 'Reflection',
        content: 'This project taught me that redesigning something people use daily is a different beast than building something new. Every change, no matter how small, affects millions of workflows. We shipped incrementally, measured obsessively, and rolled back twice before landing on the final design.',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function WebsiteView({ files, onClose }: WebsiteViewProps) {
  const [activeSection, setActiveSection] = useState<PageSection>('home');
  const [isDark, setIsDark] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Filter published posts from files
  const posts = useMemo(() => {
    const publishedNotes = files.filter(f =>
      (f.type === 'note' || f.type === 'case-study') && f.status === 'published'
    );
    if (publishedNotes.length > 0) {
      return publishedNotes.map(p => ({
        id: p.id,
        title: p.title,
        subtitle: '',
        date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
      }));
    }
    return SAMPLE_POSTS;
  }, [files]);

  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'about' as const, icon: User, label: 'About' },
    { id: 'posts' as const, icon: FileText, label: 'Posts' },
    { id: 'work' as const, icon: Briefcase, label: 'Work' },
  ];

  // Color palette
  const colors = {
    bg: isDark ? '#141312' : '#f5f5f3',
    bgAlt: isDark ? '#1a1918' : '#edecea',
    text: isDark ? '#e8e6e3' : '#1a1918',
    textSecondary: isDark ? '#9a9590' : '#6b6560',
    textMuted: isDark ? '#6b6560' : '#9a9590',
    accent: isDark ? '#ff8844' : '#ff7722',
    border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(23,20,18,0.06)',
    navBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(23,20,18,0.03)',
    navActive: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.06)',
  };

  const handleSelectWork = (study: CaseStudy) => {
    setSelectedCaseStudy(study);
  };

  const handleBackToWork = () => {
    setSelectedCaseStudy(null);
  };

  return (
    <div
      className="font-sans"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: colors.bg,
        fontFamily: 'var(--font-body)',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* LEFT SIDEBAR NAVIGATION */}
      <motion.nav
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 32,
          paddingBottom: 32,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item, index) => (
            <NavButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeSection === item.id && !selectedCaseStudy}
              onClick={() => {
                setActiveSection(item.id);
                setSelectedCaseStudy(null);
              }}
              colors={colors}
              delay={index * 0.05}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <NavButton
            icon={isDark ? Sun : Moon}
            label={isDark ? 'Light mode' : 'Dark mode'}
            isActive={false}
            onClick={() => setIsDark(!isDark)}
            colors={colors}
            delay={0.2}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </motion.nav>

      {/* MAIN CONTENT AREA */}
      <main
        style={{
          marginLeft: 72,
          minHeight: '100vh',
          paddingTop: 'clamp(80px, 12vh, 140px)',
          paddingBottom: 'clamp(80px, 15vh, 160px)',
        }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px)' }}>
          <AnimatePresence mode="wait">
            {selectedCaseStudy ? (
              <SectionWrapper key={`case-${selectedCaseStudy.id}`} prefersReducedMotion={prefersReducedMotion}>
                <CaseStudyDetail
                  study={selectedCaseStudy}
                  colors={colors}
                  onBack={handleBackToWork}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </SectionWrapper>
            ) : (
              <>
                {activeSection === 'home' && (
                  <SectionWrapper key="home" prefersReducedMotion={prefersReducedMotion}>
                    <HomeSection
                      colors={colors}
                      onNavigate={setActiveSection}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  </SectionWrapper>
                )}
                {activeSection === 'about' && (
                  <SectionWrapper key="about" prefersReducedMotion={prefersReducedMotion}>
                    <AboutSection colors={colors} />
                  </SectionWrapper>
                )}
                {activeSection === 'posts' && (
                  <SectionWrapper key="posts" prefersReducedMotion={prefersReducedMotion}>
                    <PostsSection posts={posts} colors={colors} />
                  </SectionWrapper>
                )}
                {activeSection === 'work' && (
                  <SectionWrapper key="work" prefersReducedMotion={prefersReducedMotion}>
                    <WorkSection
                      colors={colors}
                      onSelectWork={handleSelectWork}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  </SectionWrapper>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER */}
      {!selectedCaseStudy && (
        <footer
          style={{
            marginLeft: 72,
            padding: '24px 0 40px',
            textAlign: 'center',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            marginBottom: 16,
          }}>
            {['Home', 'About', 'Work'].map((link) => (
              <button
                key={link}
                onClick={() => setActiveSection(link.toLowerCase() as PageSection)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: colors.textSecondary,
                  padding: 0,
                }}
              >
                {link}
              </button>
            ))}
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: colors.textMuted,
          }}>
            Handcrafted by <span style={{ color: colors.textSecondary }}>{AUTHOR.handle}</span> for {AUTHOR.yearsActive} years
          </p>
        </footer>
      )}

      {/* CLOSE BUTTON */}
      {onClose && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            background: colors.bgAlt,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textMuted,
            fontSize: 14,
            zIndex: 100,
            fontFamily: 'var(--font-body)',
          }}
        >
          ✕
        </motion.button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NAV BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  colors: Record<string, string>;
  delay?: number;
  prefersReducedMotion: boolean | null;
}

function NavButton({ icon: Icon, label, isActive, onClick, colors, delay = 0, prefersReducedMotion }: NavButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={prefersReducedMotion ? {} : { y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isActive ? colors.navActive : 'transparent',
        color: isActive ? colors.text : colors.textMuted,
        transition: 'background 0.2s ease, color 0.2s ease',
      }}
    >
      <motion.div
        animate={{
          scale: isHovered && !isActive ? 1.1 : 1,
          y: isHovered && !isActive ? -2 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Icon size={20} strokeWidth={1.5} />
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: '100%',
              marginLeft: 12,
              padding: '6px 10px',
              borderRadius: 8,
              background: colors.text,
              color: colors.bg,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          style={{
            position: 'absolute',
            left: 0,
            width: 3,
            height: 20,
            borderRadius: 4,
            background: colors.accent,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

function SectionWrapper({ children, prefersReducedMotion }: { children: React.ReactNode; prefersReducedMotion: boolean | null }) {
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME SECTION
// ═══════════════════════════════════════════════════════════════════════════

function HomeSection({
  colors,
  onNavigate,
  prefersReducedMotion,
}: {
  colors: Record<string, string>;
  onNavigate: (section: PageSection) => void;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 34px)',
          fontWeight: 400,
          lineHeight: 1.35,
          marginBottom: 32,
          color: colors.text,
          letterSpacing: '-0.01em',
        }}
      >
        {AUTHOR.name} is {AUTHOR.title}
      </h1>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'clamp(17px, 2vw, 19px)',
        lineHeight: 1.75,
        color: colors.textSecondary,
        marginBottom: 24,
      }}>
        {AUTHOR.tagline}
      </p>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'clamp(17px, 2vw, 19px)',
        lineHeight: 1.75,
        color: colors.textSecondary,
        marginBottom: 48,
      }}>
        {AUTHOR.role} <a
          href="#"
          style={{
            color: colors.text,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            textDecorationThickness: 1,
          }}
        >{AUTHOR.company}</a>{AUTHOR.roleDescription}{' '}
        <button
          onClick={() => onNavigate('about')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            color: colors.textMuted,
            textDecoration: 'none',
          }}
        >
          Read more »
        </button>
      </p>

      {/* Fun Facts */}
      <div style={{ marginBottom: 40 }}>
        {AUTHOR.funFacts.map((fact, i) => (
          <motion.p
            key={i}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              lineHeight: 1.9,
              color: colors.textMuted,
              marginBottom: 2,
            }}
          >
            {fact}
          </motion.p>
        ))}
      </div>

      {/* Keep Going Button */}
      <motion.button
        onClick={() => onNavigate('about')}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '11px 18px',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'var(--font-body)',
          color: colors.textSecondary,
          background: 'transparent',
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          cursor: 'pointer',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        Keep Going <ChevronDown size={14} />
      </motion.button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT SECTION
// ═══════════════════════════════════════════════════════════════════════════

function AboutSection({ colors }: { colors: Record<string, string> }) {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 34px)',
          fontWeight: 400,
          marginBottom: 8,
          color: colors.text,
        }}
      >
        Hello
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 18,
        color: colors.textMuted,
        marginBottom: 40,
      }}>
        I'm Paul, but I go by {AUTHOR.handle}
      </p>

      {/* Photo placeholder */}
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background: `linear-gradient(135deg, ${colors.accent}22 0%, ${colors.bgAlt} 100%)`,
          borderRadius: 6,
          marginBottom: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          fontSize: 14,
          fontFamily: 'var(--font-body)',
        }}
      >
        <span style={{ opacity: 0.6 }}>Photo</span>
      </div>

      {/* Bio */}
      {AUTHOR.bio.map((paragraph, i) => (
        <p
          key={i}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 17,
            lineHeight: 1.8,
            color: colors.textSecondary,
            marginBottom: 24,
          }}
          dangerouslySetInnerHTML={{ __html: paragraph.replace(/<strong>/g, `<strong style="color: ${colors.text}; font-weight: 500;">`) }}
        />
      ))}

      {/* Work History */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 400,
          marginTop: 72,
          marginBottom: 24,
          color: colors.text,
        }}
      >
        Work
      </h2>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 17,
        lineHeight: 1.8,
        color: colors.textSecondary,
        marginBottom: 40,
      }}>
        My career has been a mix of startups and large companies, design and engineering.
      </p>

      <div style={{ marginBottom: 48 }}>
        {AUTHOR.experience.map((job, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 16,
              alignItems: 'baseline',
              padding: '14px 0',
              borderBottom: i < AUTHOR.experience.length - 1 ? `1px solid ${colors.border}` : 'none',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'baseline' }}>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                color: job.highlight ? colors.accent : colors.text,
                fontSize: 15,
              }}>
                {job.company}
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                color: colors.textMuted,
                fontSize: 14,
              }}>
                {job.role}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              color: colors.textMuted,
              fontSize: 13,
              letterSpacing: '-0.02em',
            }}>
              {job.years}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// POSTS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function PostsSection({ posts, colors }: { posts: Array<{ id: string; title: string; subtitle: string; date: string; featured?: boolean }>; colors: Record<string, string> }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 32,
      }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 400,
            color: colors.textMuted,
          }}
        >
          Posts
        </h1>
        <span style={{
          color: colors.textMuted,
          fontSize: 13,
          fontFamily: 'var(--font-body)',
        }}>
          {posts.length} posts
        </span>
      </div>

      <div>
        {posts.map((post) => (
          <PostItem key={post.id} post={post} colors={colors} />
        ))}
      </div>

      {/* Subscribe */}
      <div style={{ marginTop: 72, textAlign: 'center' }}>
        <input
          type="email"
          placeholder="Subscribe via email"
          style={{
            width: '100%',
            maxWidth: 380,
            padding: '14px 18px',
            fontSize: 15,
            fontFamily: 'var(--font-body)',
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            background: 'transparent',
            color: colors.text,
            outline: 'none',
          }}
        />
        <p style={{
          marginTop: 14,
          fontSize: 14,
          fontFamily: 'var(--font-body)',
          color: colors.textMuted,
        }}>
          Get notified of new posts. There's also{' '}
          <a href="#" style={{ color: colors.textSecondary, textDecoration: 'underline' }}>RSS</a>
        </p>
      </div>
    </div>
  );
}

function PostItem({ post, colors }: { post: { title: string; subtitle: string; date: string; featured?: boolean }; colors: Record<string, string> }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href="#"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '18px 14px',
        margin: '0 -14px',
        borderRadius: 10,
        textDecoration: 'none',
        background: isHovered ? colors.navBg : 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 400,
          color: colors.text,
          marginBottom: post.subtitle ? 4 : 0,
        }}>
          {post.title}
        </h3>
        {post.subtitle && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            color: colors.textMuted,
          }}>
            {post.subtitle}
          </p>
        )}
      </div>
      {post.date && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: colors.textMuted,
          marginLeft: 20,
          flexShrink: 0,
        }}>
          {post.date}
        </span>
      )}
    </motion.a>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WORK SECTION
// ═══════════════════════════════════════════════════════════════════════════

function WorkSection({
  colors,
  onSelectWork,
  prefersReducedMotion,
}: {
  colors: Record<string, string>;
  onSelectWork: (study: CaseStudy) => void;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 400,
          marginBottom: 8,
          color: colors.textMuted,
        }}
      >
        Work
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 17,
        lineHeight: 1.7,
        color: colors.textMuted,
        marginBottom: 48,
      }}>
        Selected projects and case studies from my career.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {CASE_STUDIES.map((study, i) => (
          <WorkItem
            key={study.id}
            study={study}
            colors={colors}
            onClick={() => onSelectWork(study)}
            delay={i * 0.1}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </div>
  );
}

function WorkItem({
  study,
  colors,
  onClick,
  delay,
  prefersReducedMotion,
}: {
  study: CaseStudy;
  colors: Record<string, string>;
  onClick: () => void;
  delay: number;
  prefersReducedMotion: boolean | null;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Image placeholder */}
      <motion.div
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          background: `linear-gradient(135deg, ${colors.bgAlt} 0%, ${colors.accent}15 100%)`,
          borderRadius: 12,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          fontSize: 14,
          overflow: 'hidden',
          boxShadow: isHovered ? '0 16px 40px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <span style={{ opacity: 0.5 }}>📷 {study.title}</span>
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 400,
            color: colors.text,
            marginBottom: 4,
          }}>
            {study.title}
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: colors.textMuted,
          }}>
            {study.subtitle}
          </p>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 13,
          color: colors.textMuted,
          flexShrink: 0,
        }}>
          {study.year}
        </span>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {study.tags.map((tag, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 500,
              color: colors.textMuted,
              padding: '4px 8px',
              borderRadius: 4,
              background: colors.navBg,
              letterSpacing: '0.02em',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CASE STUDY DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

function CaseStudyDetail({
  study,
  colors,
  onBack,
  prefersReducedMotion,
}: {
  study: CaseStudy;
  colors: Record<string, string>;
  onBack: () => void;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div>
      {/* Back Button */}
      <motion.button
        initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 40,
          padding: '8px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: colors.textMuted,
        }}
      >
        <ArrowLeft size={16} />
        Back to Work
      </motion.button>

      {/* Hero */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 42px)',
            fontWeight: 400,
            lineHeight: 1.2,
            marginBottom: 16,
            color: colors.text,
          }}
        >
          {study.title}
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(18px, 2.5vw, 22px)',
          lineHeight: 1.5,
          color: colors.textSecondary,
          marginBottom: 40,
        }}>
          {study.subtitle}
        </p>
      </motion.div>

      {/* Hero Image */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          background: `linear-gradient(135deg, ${colors.bgAlt} 0%, ${colors.accent}20 100%)`,
          borderRadius: 12,
          marginBottom: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          fontSize: 16,
          fontFamily: 'var(--font-body)',
        }}
      >
        <span style={{ opacity: 0.5 }}>Hero image for {study.title}</span>
      </motion.div>

      {/* Overview */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          marginBottom: 64,
          padding: 24,
          borderRadius: 12,
          background: colors.navBg,
        }}
      >
        {[
          { label: 'Role', value: study.overview.role },
          { label: 'Timeline', value: study.overview.timeline },
          { label: 'Team', value: study.overview.team },
          { label: 'Tools', value: study.overview.tools },
        ].map((item) => (
          <div key={item.label}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 500,
              color: colors.textMuted,
              marginBottom: 4,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {item.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: colors.text,
            }}>
              {item.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Content Sections */}
      {study.sections.map((section, i) => (
        <motion.div
          key={i}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
          style={{ marginBottom: 56 }}
        >
          {section.type === 'text' && (
            <>
              {section.title && (
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 400,
                  color: colors.text,
                  marginBottom: 16,
                }}>
                  {section.title}
                </h2>
              )}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 17,
                lineHeight: 1.8,
                color: colors.textSecondary,
              }}>
                {section.content}
              </p>
            </>
          )}

          {section.type === 'quote' && (
            <blockquote style={{
              margin: '40px 0',
              padding: '24px 32px',
              borderLeft: `3px solid ${colors.accent}`,
              background: colors.navBg,
              borderRadius: '0 12px 12px 0',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontStyle: 'italic',
                lineHeight: 1.6,
                color: colors.text,
                marginBottom: 12,
              }}>
                "{section.quote}"
              </p>
              {section.attribution && (
                <cite style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: colors.textMuted,
                  fontStyle: 'normal',
                }}>
                  — {section.attribution}
                </cite>
              )}
            </blockquote>
          )}

          {section.type === 'stats' && section.stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${section.stats.length}, 1fr)`,
              gap: 24,
              padding: '40px 0',
              borderTop: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
            }}>
              {section.stats.map((stat, j) => (
                <div key={j} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(32px, 5vw, 40px)',
                    fontWeight: 400,
                    color: colors.accent,
                    marginBottom: 8,
                  }}>
                    {stat.value}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    color: colors.textMuted,
                    lineHeight: 1.4,
                  }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {section.type === 'image' && (
            <figure style={{ margin: 0 }}>
              <div style={{
                width: '100%',
                aspectRatio: '16 / 10',
                background: `linear-gradient(135deg, ${colors.bgAlt} 0%, ${colors.accent}10 100%)`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textMuted,
                fontSize: 14,
                fontFamily: 'var(--font-body)',
              }}>
                <span style={{ opacity: 0.5 }}>Image placeholder</span>
              </div>
              {section.caption && (
                <figcaption style={{
                  marginTop: 12,
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: colors.textMuted,
                  textAlign: 'center',
                }}>
                  {section.caption}
                </figcaption>
              )}
            </figure>
          )}
        </motion.div>
      ))}

      {/* Footer Navigation */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{
          marginTop: 80,
          paddingTop: 40,
          borderTop: `1px solid ${colors.border}`,
          textAlign: 'center',
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 24px',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
            color: colors.text,
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          <ArrowLeft size={16} />
          View All Work
        </button>
      </motion.div>
    </div>
  );
}

export default WebsiteView;
