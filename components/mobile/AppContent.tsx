'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DesktopItem, BlockData, TabData } from '@/types';

interface AppContentProps {
  item: DesktopItem;
  renderBlock?: (block: BlockData) => React.ReactNode;
}

export function AppContent({ item, renderBlock }: AppContentProps) {
  const [activeTab, setActiveTab] = React.useState(0);

  // Determine which blocks to show
  const blocksToRender = item.useTabs && item.tabs.length > 0
    ? item.tabs[activeTab]?.blocks || []
    : item.blocks;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header image */}
      {item.windowHeaderImage && (
        <motion.div
          className="flex-shrink-0 w-full h-48 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <img
            src={item.windowHeaderImage}
            alt={item.windowTitle}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Tabs (if using tabs) */}
      {item.useTabs && item.tabs.length > 0 && (
        <div
          className="flex-shrink-0 flex gap-2 px-4 py-3 overflow-x-auto"
          style={{
            background: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {item.tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className="flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2"
              style={{
                background: activeTab === index ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: activeTab === index ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
              }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span
                className={`text-sm ${activeTab === index ? 'text-white' : 'text-white/60'}`}
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
              >
                {tab.label}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4 space-y-4">
          {/* Title section */}
          <div className="space-y-1">
            <h2
              className="text-xl font-semibold text-white"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
            >
              {item.windowTitle}
            </h2>
            {item.windowSubtitle && (
              <p
                className="text-sm text-white/60"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
              >
                {item.windowSubtitle}
              </p>
            )}
          </div>

          {/* Description */}
          {item.windowDescription && (
            <p
              className="text-white/80 leading-relaxed"
              style={{
                fontSize: 15,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}
            >
              {item.windowDescription}
            </p>
          )}

          {/* Blocks */}
          {blocksToRender.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {renderBlock ? (
                renderBlock(block)
              ) : (
                <MobileBlockFallback block={block} />
              )}
            </motion.div>
          ))}

          {/* Legacy: Gallery items */}
          {item.windowGallery && item.windowGallery.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Gallery</h3>
              <div className="grid grid-cols-2 gap-2">
                {item.windowGallery.map((media, index) => (
                  <motion.div
                    key={index}
                    className="aspect-square rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy: Details */}
          {item.windowDetails && item.windowDetails.length > 0 && (
            <div className="space-y-2">
              {item.windowDetails.map((detail, index) => (
                <div
                  key={index}
                  className="flex justify-between py-3 border-b border-white/10 last:border-0"
                >
                  <span className="text-white/50 text-sm">{detail.label}</span>
                  <span className="text-white text-sm">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Legacy: Links */}
          {item.windowLinks && item.windowLinks.length > 0 && (
            <div className="space-y-2">
              {item.windowLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-white text-sm">{link.label}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/40"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </motion.a>
              ))}
            </div>
          )}
        </div>

        {/* Bottom safe area */}
        <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
      </div>
    </div>
  );
}

// Fallback block renderer for mobile
function MobileBlockFallback({ block }: { block: BlockData }) {
  const data = block.data as Record<string, unknown>;

  switch (block.type) {
    case 'text':
      return (
        <p
          className="text-white/80 leading-relaxed"
          style={{ fontSize: 15, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
        >
          {String(data.content || data.text || '')}
        </p>
      );

    case 'heading':
      return (
        <h3
          className="text-lg font-semibold text-white"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
        >
          {String(data.content || data.text || '')}
        </h3>
      );

    case 'image':
      const caption = data.caption ? String(data.caption) : null;
      return (
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <img
            src={String(data.url || data.src || '')}
            alt={String(data.alt || '')}
            className="w-full h-auto"
          />
          {caption && (
            <p className="text-xs text-white/50 p-3">{caption}</p>
          )}
        </div>
      );

    case 'video':
      return (
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <video
            src={String(data.url || data.src || '')}
            controls
            className="w-full"
            playsInline
          />
        </div>
      );

    case 'link':
    case 'button':
      return (
        <motion.a
          href={String(data.url || data.href || '#')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-white text-sm">{String(data.label || data.text || 'Link')}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </motion.a>
      );

    case 'divider':
      return <hr className="border-white/10" />;

    case 'quote':
      return (
        <blockquote
          className="border-l-2 border-white/30 pl-4 italic text-white/70"
          style={{ fontSize: 15, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
        >
          {String(data.content || data.text || '')}
        </blockquote>
      );

    case 'list':
      const items = Array.isArray(data.items) ? data.items : [];
      return (
        <ul className="space-y-2 pl-4">
          {items.map((item, i) => (
            <li key={i} className="text-white/80 text-sm list-disc">{String(item)}</li>
          ))}
        </ul>
      );

    default:
      return null;
  }
}
