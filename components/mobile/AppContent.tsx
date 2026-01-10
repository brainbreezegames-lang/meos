'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      {/* Header image */}
      {item.windowHeaderImage && (
        <div className="flex-shrink-0 w-full h-48 overflow-hidden">
          <img
            src={item.windowHeaderImage}
            alt={item.windowTitle || ''}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Tabs */}
      {item.useTabs && item.tabs && item.tabs.length > 0 && (
        <div
          className="flex-shrink-0 flex gap-2 px-4 py-3 overflow-x-auto border-b border-white/10"
          style={{ background: 'rgba(0, 0, 0, 0.2)' }}
        >
          {item.tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm"
              style={{
                background: activeTab === index ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === index ? 'white' : 'rgba(255, 255, 255, 0.6)',
              }}
            >
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-xl font-semibold text-white">
              {item.windowTitle || item.label}
            </h2>
            {item.windowSubtitle && (
              <p className="text-sm text-white/60 mt-1">{item.windowSubtitle}</p>
            )}
          </div>

          {/* Description */}
          {item.windowDescription && (
            <p className="text-white/80 text-[15px] leading-relaxed">
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
              {renderBlock ? renderBlock(block) : <BlockFallback block={block} />}
            </motion.div>
          ))}

          {/* Legacy gallery */}
          {item.windowGallery && item.windowGallery.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {item.windowGallery.map((media, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5">
                  {media.type === 'image' ? (
                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video src={media.url} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Legacy details */}
          {item.windowDetails && item.windowDetails.length > 0 && (
            <div className="space-y-2">
              {item.windowDetails.map((detail, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50 text-sm">{detail.label}</span>
                  <span className="text-white text-sm">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Legacy links */}
          {item.windowLinks && item.windowLinks.length > 0 && (
            <div className="space-y-2">
              {item.windowLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 text-white text-sm"
                >
                  {link.label}
                  <span className="text-white/40">→</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bottom padding */}
        <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
      </div>
    </div>
  );
}

// Simple fallback block renderer
function BlockFallback({ block }: { block: BlockData }) {
  const data = block.data as Record<string, unknown>;

  switch (block.type) {
    case 'text':
      return <p className="text-white/80 text-[15px] leading-relaxed">{String(data.content || data.text || '')}</p>;

    case 'heading':
      return <h3 className="text-lg font-semibold text-white">{String(data.content || data.text || '')}</h3>;

    case 'image':
      return (
        <div className="rounded-xl overflow-hidden bg-white/5">
          <img src={String(data.url || data.src || '')} alt={String(data.alt || '')} className="w-full" />
          {data.caption ? <p className="text-xs text-white/50 p-3">{String(data.caption)}</p> : null}
        </div>
      );

    case 'video':
      return (
        <div className="rounded-xl overflow-hidden bg-white/5">
          <video src={String(data.url || data.src || '')} controls className="w-full" playsInline />
        </div>
      );

    case 'link':
    case 'button':
      return (
        <a
          href={String(data.url || data.href || '#')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 rounded-xl bg-white/5 text-white text-sm"
        >
          {String(data.label || data.text || 'Link')}
          <span className="text-white/40">→</span>
        </a>
      );

    case 'divider':
      return <hr className="border-white/10" />;

    case 'quote':
      return (
        <blockquote className="border-l-2 border-white/30 pl-4 italic text-white/70 text-[15px]">
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
