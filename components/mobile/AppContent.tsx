'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DesktopItem, BlockData } from '@/types';

interface AppContentProps {
  item: DesktopItem;
  renderBlock?: (block: BlockData) => React.ReactNode;
}

export function AppContent({ item, renderBlock }: AppContentProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Determine which blocks to show
  const blocksToRender = item.useTabs && item.tabs && item.tabs.length > 0
    ? item.tabs[activeTab]?.blocks || []
    : item.blocks || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* iOS Segmented Tabs */}
      {item.useTabs && item.tabs && item.tabs.length > 0 && (
        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <div
            className="flex p-1 rounded-xl relative"
            style={{
              background: 'rgba(118, 118, 128, 0.24)',
            }}
          >
            {/* Animated selection indicator */}
            <motion.div
              className="absolute rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                top: 4,
                bottom: 4,
                width: `calc(${100 / item.tabs.length}% - 4px)`,
              }}
              initial={false}
              animate={{
                x: `calc(${activeTab * 100}% + ${activeTab * 4}px)`,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />

            {item.tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className="flex-1 relative z-10 py-2 text-center transition-colors duration-200"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: activeTab === index ? 'white' : 'rgba(255, 255, 255, 0.6)',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
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
            className="px-4 py-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Description */}
            {item.windowDescription && (
              <motion.p
                className="mb-5"
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {item.windowDescription}
              </motion.p>
            )}

            {/* Blocks */}
            <div className="space-y-4">
              {blocksToRender.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {item.windowGallery.map((media, i) => (
                  <motion.div
                    key={i}
                    className="aspect-square rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover" playsInline />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Legacy details */}
            {item.windowDetails && item.windowDetails.length > 0 && (
              <motion.div
                className="mt-4 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {item.windowDetails.map((detail, i) => (
                  <div
                    key={i}
                    className="flex justify-between px-4 py-3"
                    style={{
                      borderBottom: i < item.windowDetails!.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {detail.label}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        color: 'white',
                        fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {detail.value}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Legacy links */}
            {item.windowLinks && item.windowLinks.length > 0 && (
              <div className="space-y-2 mt-4">
                {item.windowLinks.map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    whileTap={{ scale: 0.98, background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        color: '#0A84FF',
                        fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {link.label}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </motion.a>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

// Premium iOS block renderer
function BlockRenderer({ block }: { block: BlockData }) {
  const data = block.data as Record<string, unknown>;

  switch (block.type) {
    case 'text':
      return (
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.85)',
            fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
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
            color: 'white',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            letterSpacing: '-0.3px',
          }}
        >
          {String(data.content || data.text || '')}
        </h3>
      );

    case 'image':
      return (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <img
            src={String(data.url || data.src || '')}
            alt={String(data.alt || '')}
            className="w-full"
            loading="lazy"
          />
          {data.caption ? (
            <p
              className="px-4 py-3"
              style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              {String(data.caption)}
            </p>
          ) : null}
        </div>
      );

    case 'gallery':
      const images = Array.isArray(data.images) ? data.images : [];
      return (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img: { url?: string; src?: string }, i: number) => (
            <motion.div
              key={i}
              className="aspect-square rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={String(img.url || img.src || '')}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      );

    case 'video':
      return (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <video
            src={String(data.url || data.src || '')}
            controls
            playsInline
            className="w-full"
            poster={String(data.thumbnail || data.poster || '')}
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
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{
                background: btn.style === 'primary' ? '#0A84FF' : 'rgba(255, 255, 255, 0.08)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: btn.style === 'primary' ? 'white' : '#0A84FF',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {btn.icon ? <span className="mr-2">{String(btn.icon)}</span> : null}
                {String(btn.label || btn.text || 'Link')}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={btn.style === 'primary' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          {details.map((item: { label?: string; value?: string }, i: number) => (
            <div
              key={i}
              className="flex justify-between px-4 py-3"
              style={{
                borderBottom: i < details.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {String(item.label || '')}
              </span>
              <span
                style={{
                  fontSize: 15,
                  color: 'white',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {String(item.value || '')}
              </span>
            </div>
          ))}
        </div>
      );

    case 'timeline':
      const timelineItems = Array.isArray(data.items) ? data.items : [];
      return (
        <div className="space-y-4 pl-4 border-l-2 border-white/20">
          {timelineItems.map((item: { date?: string; title?: string; subtitle?: string; description?: string }, i: number) => (
            <motion.div
              key={i}
              className="relative pl-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="absolute -left-[21px] w-3 h-3 rounded-full"
                style={{ background: i === 0 ? '#0A84FF' : 'rgba(255,255,255,0.3)' }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {String(item.date || '')}
              </span>
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'white',
                  marginTop: 2,
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {String(item.title || '')}
              </h4>
              {item.subtitle && (
                <p
                  style={{
                    fontSize: 14,
                    color: '#0A84FF',
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {String(item.subtitle)}
                </p>
              )}
              {item.description && (
                <p
                  style={{
                    fontSize: 14,
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginTop: 4,
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {String(item.description)}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      );

    case 'social':
      const profiles = Array.isArray(data.profiles) ? data.profiles : [];
      const socialIcons: Record<string, string> = {
        twitter: '𝕏',
        linkedin: 'in',
        github: '⌘',
        dribbble: '◉',
        instagram: '◎',
        youtube: '▶',
        facebook: 'f',
        tiktok: '♪',
      };
      return (
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile: { platform?: string; url?: string }, i: number) => (
            <motion.a
              key={i}
              href={String(profile.url || '#')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 48,
                height: 48,
                background: 'rgba(255, 255, 255, 0.08)',
                fontSize: 18,
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
              whileTap={{ scale: 0.92 }}
            >
              {socialIcons[String(profile.platform || '').toLowerCase()] || '🔗'}
            </motion.a>
          ))}
        </div>
      );

    case 'list':
      const listItems = Array.isArray(data.items) ? data.items : [];
      const listStyle = data.style || 'bullet';
      return (
        <div className="space-y-2">
          {listItems.map((item: string | { text?: string }, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <span
                style={{
                  color: listStyle === 'check' ? '#30D158' : 'rgba(255,255,255,0.4)',
                  fontSize: 14,
                  marginTop: 2,
                }}
              >
                {listStyle === 'check' ? '✓' : listStyle === 'number' ? `${i + 1}.` : '•'}
              </span>
              <span
                style={{
                  fontSize: 15,
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {typeof item === 'string' ? item : String(item.text || '')}
              </span>
            </div>
          ))}
        </div>
      );

    case 'quote':
      return (
        <div
          className="pl-4 py-2"
          style={{
            borderLeft: '3px solid #0A84FF',
          }}
        >
          <p
            style={{
              fontSize: 16,
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            }}
          >
            {String(data.content || data.text || '')}
          </p>
          {data.author ? (
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: 8,
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              — {String(data.author)}
            </p>
          ) : null}
        </div>
      );

    case 'divider':
      return (
        <div
          className="my-4"
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.15) 80%, transparent 100%)',
          }}
        />
      );

    case 'spacer':
      return <div style={{ height: Number(data.height) || 24 }} />;

    default:
      // For any unrecognized block types, show nothing
      return null;
  }
}
