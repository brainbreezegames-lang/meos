'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { DesktopItem, BlockData } from '@/types';

interface AppContentProps {
  item: DesktopItem;
  renderBlock?: (block: BlockData) => React.ReactNode;
}

export function AppContent({ item, renderBlock }: AppContentProps) {
  const [activeTab, setActiveTab] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Determine which blocks to show
  const blocksToRender = item.useTabs && item.tabs && item.tabs.length > 0
    ? item.tabs[activeTab]?.blocks || []
    : item.blocks || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" role="main">
      {/* iOS Segmented Tabs */}
      {item.useTabs && item.tabs && item.tabs.length > 0 && (
        <div className="flex-shrink-0 px-4 pt-3 pb-2" role="tablist" aria-label="Content tabs">
          <div
            className="flex p-1 rounded-xl relative"
            style={{ background: 'var(--bg-secondary)' }}
          >
            {/* Animated selection indicator */}
            <motion.div
              className="absolute rounded-lg"
              style={{
                background: 'var(--bg-elevated)',
                boxShadow: 'var(--shadow-sm)',
                top: 4,
                bottom: 4,
                width: `calc(${100 / item.tabs.length}% - 4px)`,
              }}
              initial={false}
              animate={{ x: `calc(${activeTab * 100}% + ${activeTab * 4}px)` }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
              aria-hidden="true"
            />

            {item.tabs.map((tab, index) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === index}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(index)}
                className="flex-1 relative z-10 py-2 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: activeTab === index ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={item.useTabs && item.tabs ? `tabpanel-${item.tabs[activeTab]?.id}` : undefined}
            role={item.useTabs ? 'tabpanel' : undefined}
            className="px-4 py-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {/* Description */}
            {item.windowDescription && (
              <motion.p
                className="mb-5"
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
              >
                {item.windowDescription}
              </motion.p>
            )}

            {/* Blocks */}
            <div className="space-y-4">
              {blocksToRender.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : {
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                >
                  {renderBlock ? renderBlock(block) : <BlockRenderer block={block} />}
                </motion.div>
              ))}
            </div>

            {/* Legacy gallery */}
            {item.windowGallery && item.windowGallery.length > 0 && (
              <motion.div
                className="grid grid-cols-2 gap-2 mt-4"
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
                role="group"
                aria-label="Gallery"
              >
                {item.windowGallery.map((media, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Gallery image ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        playsInline
                        aria-label={`Gallery video ${i + 1}`}
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Legacy details */}
            {item.windowDetails && item.windowDetails.length > 0 && (
              <motion.dl
                className="mt-4 rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-secondary)' }}
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.15 }}
              >
                {item.windowDetails.map((detail, i) => (
                  <div
                    key={i}
                    className="flex justify-between px-4 py-3"
                    style={{
                      borderBottom: i < item.windowDetails!.length - 1 ? '1px solid var(--border-light)' : 'none',
                    }}
                  >
                    <dt
                      style={{
                        fontSize: 15,
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {detail.label}
                    </dt>
                    <dd
                      style={{
                        fontSize: 15,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </motion.dl>
            )}

            {/* Legacy links */}
            {item.windowLinks && item.windowLinks.length > 0 && (
              <nav className="space-y-2 mt-4" aria-label="Related links">
                {item.windowLinks.map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl focus-visible:outline-none focus-visible:ring-2"
                    style={{ background: 'var(--bg-secondary)' }}
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.2 + i * 0.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        color: 'var(--accent-primary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {link.label}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--text-quaternary)' }}
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </motion.a>
                ))}
              </nav>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom safe area */}
        <div className="h-8" aria-hidden="true" />
      </div>
    </div>
  );
}

// Premium iOS block renderer with proper tokens
function BlockRenderer({ block }: { block: BlockData }) {
  const data = block.data as Record<string, unknown>;
  const prefersReducedMotion = useReducedMotion();

  switch (block.type) {
    case 'text':
      return (
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {String(data.content || data.text || '')}
        </p>
      );

    case 'heading':
      return (
        <h3
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.3px',
          }}
        >
          {String(data.content || data.text || '')}
        </h3>
      );

    case 'image':
      return (
        <figure className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
          <img
            src={String(data.url || data.src || '')}
            alt={String(data.alt || 'Image')}
            className="w-full"
            loading="lazy"
          />
          {data.caption ? (
            <figcaption
              className="px-4 py-3"
              style={{
                fontSize: 13,
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {String(data.caption)}
            </figcaption>
          ) : null}
        </figure>
      );

    case 'gallery':
      const images = Array.isArray(data.images) ? data.images : [];
      return (
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Image gallery">
          {images.map((img: { url?: string; src?: string; alt?: string }, i: number) => (
            <div
              key={i}
              className="aspect-square rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <img
                src={String(img.url || img.src || '')}
                alt={String(img.alt || `Gallery image ${i + 1}`)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      );

    case 'video':
      return (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
          <video
            src={String(data.url || data.src || '')}
            controls
            playsInline
            className="w-full"
            poster={String(data.thumbnail || data.poster || '')}
            aria-label={String(data.title || 'Video')}
          />
        </div>
      );

    case 'link':
    case 'button':
    case 'buttons':
      const buttons = Array.isArray(data.buttons) ? data.buttons : [data];
      return (
        <div className="space-y-2">
          {buttons.map((btn: Record<string, unknown>, i: number) => (
            <motion.a
              key={i}
              href={String(btn.url || btn.href || '#')}
              target={btn.newTab ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl focus-visible:outline-none focus-visible:ring-2"
              style={{
                background: btn.style === 'primary' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: btn.style === 'primary' ? 'var(--text-on-accent)' : 'var(--accent-primary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {btn.icon ? <span className="mr-2" aria-hidden="true">{String(btn.icon)}</span> : null}
                {String(btn.label || btn.text || 'Link')}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: btn.style === 'primary' ? 'var(--text-on-accent)' : 'var(--text-quaternary)', opacity: btn.style === 'primary' ? 0.7 : 1 }}
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.a>
          ))}
        </div>
      );

    case 'details':
      const details = Array.isArray(data.items) ? data.items : [];
      return (
        <dl className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
          {details.map((item: { label?: string; value?: string }, i: number) => (
            <div
              key={i}
              className="flex justify-between px-4 py-3"
              style={{
                borderBottom: i < details.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <dt style={{ fontSize: 15, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
                {String(item.label || '')}
              </dt>
              <dd style={{ fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                {String(item.value || '')}
              </dd>
            </div>
          ))}
        </dl>
      );

    case 'timeline':
      const timelineItems = Array.isArray(data.items) ? data.items : [];
      return (
        <ol className="space-y-4 pl-4 border-l-2" style={{ borderColor: 'var(--border-medium)' }} aria-label="Timeline">
          {timelineItems.map((item: { date?: string; title?: string; subtitle?: string; description?: string }, i: number) => (
            <motion.li
              key={i}
              className="relative pl-4"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : i * 0.1 }}
            >
              <div
                className="absolute -left-[21px] w-3 h-3 rounded-full"
                style={{ background: i === 0 ? 'var(--accent-primary)' : 'var(--text-quaternary)' }}
                aria-hidden="true"
              />
              <time
                style={{
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-body)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {String(item.date || '')}
              </time>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-body)' }}>
                {String(item.title || '')}
              </h4>
              {item.subtitle && (
                <p style={{ fontSize: 14, color: 'var(--accent-primary)', fontFamily: 'var(--font-body)' }}>
                  {String(item.subtitle)}
                </p>
              )}
              {item.description && (
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
                  {String(item.description)}
                </p>
              )}
            </motion.li>
          ))}
        </ol>
      );

    case 'social':
      const profiles = Array.isArray(data.profiles) ? data.profiles : [];
      const socialIcons: Record<string, string> = {
        twitter: '𝕏', linkedin: 'in', github: '⌘', dribbble: '◉',
        instagram: '◎', youtube: '▶', facebook: 'f', tiktok: '♪',
      };
      return (
        <nav className="flex flex-wrap gap-2" aria-label="Social links">
          {profiles.map((profile: { platform?: string; url?: string }, i: number) => (
            <motion.a
              key={i}
              href={String(profile.url || '#')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${profile.platform || 'social'} profile`}
              className="flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2"
              style={{
                width: 48,
                height: 48,
                background: 'var(--bg-secondary)',
                fontSize: 18,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
            >
              {socialIcons[String(profile.platform || '').toLowerCase()] || '🔗'}
            </motion.a>
          ))}
        </nav>
      );

    case 'list':
      const listItems = Array.isArray(data.items) ? data.items : [];
      const listStyle = data.style || 'bullet';
      const ListTag = listStyle === 'number' ? 'ol' : 'ul';
      return (
        <ListTag className="space-y-2">
          {listItems.map((item: string | { text?: string }, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span
                style={{
                  color: listStyle === 'check' ? 'var(--accent-success)' : 'var(--text-quaternary)',
                  fontSize: 14,
                  marginTop: 2,
                }}
                aria-hidden="true"
              >
                {listStyle === 'check' ? '✓' : listStyle === 'number' ? `${i + 1}.` : '•'}
              </span>
              <span style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {typeof item === 'string' ? item : String(item.text || '')}
              </span>
            </li>
          ))}
        </ListTag>
      );

    case 'quote':
      return (
        <blockquote className="pl-4 py-2" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
          <p style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            {String(data.content || data.text || '')}
          </p>
          {data.author ? (
            <cite style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8, display: 'block', fontStyle: 'normal', fontFamily: 'var(--font-body)' }}>
              — {String(data.author)}
            </cite>
          ) : null}
        </blockquote>
      );

    case 'divider':
      return (
        <hr
          className="my-4"
          style={{
            height: 1,
            border: 'none',
            background: 'linear-gradient(90deg, transparent 0%, var(--border-light) 20%, var(--border-light) 80%, transparent 100%)',
          }}
        />
      );

    case 'spacer':
      return <div style={{ height: Number(data.height) || 24 }} aria-hidden="true" />;

    default:
      return null;
  }
}
