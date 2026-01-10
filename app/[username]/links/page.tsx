'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Link types
interface LinkItem {
  id: string;
  label: string;
  icon: string;
  type: 'internal' | 'download' | 'external' | 'email';
  url?: string;
  windowId?: string;
}

interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'github' | 'dribbble';
  url: string;
}

interface LinkInBioData {
  name: string;
  title: string;
  location?: string;
  avatarUrl: string;
  status?: {
    emoji: string;
    text: string;
  };
  links: LinkItem[];
  socials: SocialLink[];
  theme: 'light' | 'dark';
}

// Social icons
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  dribbble: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm7.753 5.655a10.2 10.2 0 012.004 5.963c-2.193-.467-4.386-.7-6.58-.7-.52 0-1.04.02-1.56.06a36.76 36.76 0 00-.974-2.072c2.596-1.08 5.044-2.352 7.11-3.251zM12 1.756a10.2 10.2 0 017.008 2.813c-1.913.843-4.193 2.003-6.66 3.03a48.938 48.938 0 00-4.028-6.038A10.19 10.19 0 0112 1.756zm-3.96.636a47.23 47.23 0 014.026 5.962 44.27 44.27 0 01-8.156 1.133A10.218 10.218 0 018.04 2.392zM1.756 12c0-.084.003-.168.005-.251a46.04 46.04 0 009.395-1.276c.287.556.562 1.118.822 1.687-3.048.951-5.82 2.613-7.916 4.91A10.186 10.186 0 011.756 12zm3.36 6.907c1.963-2.163 4.586-3.726 7.472-4.58a41.34 41.34 0 011.962 7.014A10.207 10.207 0 015.117 18.907zM12 22.244a10.16 10.16 0 01-2.757-.384 43.1 43.1 0 00-1.895-6.76 31.24 31.24 0 016.232-.254 10.188 10.188 0 01-1.58 7.398zm3.483-1.056a10.204 10.204 0 003.168-5.186 30.67 30.67 0 015.106.527 10.206 10.206 0 01-8.274 4.659z"/>
    </svg>
  ),
};

// Demo data
const DEMO_DATA: LinkInBioData = {
  name: 'Alex Chen',
  title: 'Product Designer & Developer',
  location: 'San Francisco',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  status: {
    emoji: '🟢',
    text: 'Open to work',
  },
  links: [
    { id: '1', label: 'Portfolio', icon: '💼', type: 'internal', windowId: 'projects' },
    { id: '2', label: 'Resume', icon: '📄', type: 'download', url: '/resume.pdf' },
    { id: '3', label: 'Contact', icon: '📧', type: 'email', url: 'mailto:alex@example.com' },
    { id: '4', label: 'Book a Call', icon: '📅', type: 'external', url: 'https://calendly.com' },
  ],
  socials: [
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
  ],
  theme: 'dark',
};

export default function LinkInBioPage({ params }: { params: { username: string } }) {
  const data = DEMO_DATA; // In production, fetch based on username
  const isDark = data.theme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
      }}
    >
      <motion.div
        className="w-full max-w-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          {/* Avatar */}
          <div
            className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden"
            style={{
              boxShadow: isDark
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Image
              src={data.avatarUrl}
              alt={data.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name */}
          <h1
            className="text-xl font-semibold"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }}
          >
            {data.name}
          </h1>

          {/* Title */}
          <p
            className="text-sm mt-1"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#666' }}
          >
            {data.title}
          </p>

          {/* Location */}
          {data.location && (
            <p
              className="text-xs mt-1"
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#999' }}
            >
              📍 {data.location}
            </p>
          )}

          {/* Status */}
          {data.status && (
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#333',
              }}
            >
              <span>{data.status.emoji}</span>
              <span>{data.status.text}</span>
            </div>
          )}
        </motion.div>

        {/* Links */}
        <div className="space-y-3 mb-8">
          {data.links.map((link) => (
            <motion.a
              key={link.id}
              href={link.url || '#'}
              variants={itemVariants}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl font-medium text-sm transition-all"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'white',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#1a1a1a',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isDark
                  ? '0 4px 12px rgba(0, 0, 0, 0.2)'
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              whileHover={{
                scale: 1.02,
                background: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.02)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="h-px w-full mb-6"
          style={{ background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
        />

        {/* Social Links */}
        <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-8">
          {data.socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full transition-all hover:scale-110"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#666',
              }}
            >
              {SOCIAL_ICONS[social.platform]}
            </a>
          ))}
        </motion.div>

        {/* View Full Desktop Link */}
        <motion.div variants={itemVariants}>
          <Link
            href={`/${params.username}`}
            className="block text-center py-2 text-sm transition-colors"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#999' }}
          >
            View Full Desktop →
          </Link>
        </motion.div>

        {/* Branding */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p
            className="text-xs"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.3)' : '#bbb' }}
          >
            Made with{' '}
            <a href="/" className="underline hover:no-underline">
              MeOS
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
