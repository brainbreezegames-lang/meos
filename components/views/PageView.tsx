'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { DesktopItem, GoOSFileType } from '@/types';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '@/lib/goos/fileTypeMapping';

interface PageViewProps {
  items: DesktopItem[];
  pageOrder?: string[];
  onItemClick?: (item: DesktopItem) => void;
  isOwner?: boolean;
  spacing?: 'tight' | 'comfortable' | 'spacious';
}

const SPACING_VALUES = {
  tight: '24px',
  comfortable: '48px',
  spacious: '72px',
};

export function PageView({
  items,
  pageOrder,
  onItemClick,
  isOwner = false,
  spacing = 'comfortable',
}: PageViewProps) {
  // Sort items by pageOrder if provided, otherwise by order field
  const sortedItems = useMemo(() => {
    // Filter to only published items for visitors
    const filteredItems = isOwner
      ? items
      : items.filter(item => item.publishStatus === 'published');

    if (pageOrder && pageOrder.length > 0) {
      const orderMap = new Map(pageOrder.map((id, index) => [id, index]));
      return [...filteredItems].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? Infinity;
        const orderB = orderMap.get(b.id) ?? Infinity;
        return orderA - orderB;
      });
    }
    return [...filteredItems].sort((a, b) => a.order - b.order);
  }, [items, pageOrder, isOwner]);

  const gapValue = SPACING_VALUES[spacing];

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--bg-primary, #fafafa)',
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: '800px',
          padding: '0 24px',
        }}
      >
        {sortedItems.map((item, index) => (
          <PageViewItem
            key={item.id}
            item={item}
            onClick={() => onItemClick?.(item)}
            isFirst={index === 0}
            isLast={index === sortedItems.length - 1}
            gap={gapValue}
            isOwner={isOwner}
          />
        ))}

        {sortedItems.length === 0 && (
          <div
            className="flex flex-col items-center justify-center"
            style={{
              padding: '80px 24px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
              📭
            </span>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary, #1a1a1a)',
                fontFamily: 'var(--font-heading, system-ui)',
                marginBottom: '8px',
              }}
            >
              No content yet
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #666)',
                fontFamily: 'var(--font-body, system-ui)',
              }}
            >
              {isOwner
                ? 'Create some files to see them in page view'
                : 'Nothing published yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface PageViewItemProps {
  item: DesktopItem;
  onClick?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  gap: string;
  isOwner?: boolean;
}

function PageViewItem({ item, onClick, isFirst, isLast, gap, isOwner }: PageViewItemProps) {
  const isGoosFile = item.itemVariant === 'goos-file';
  const fileType = (item.goosFileType || 'note') as GoOSFileType;
  const isDraft = item.publishStatus === 'draft';

  // Get content preview
  const contentPreview = useMemo(() => {
    if (isGoosFile && item.goosContent) {
      // Strip HTML and truncate
      const text = item.goosContent.replace(/<[^>]*>/g, '').trim();
      return text.length > 200 ? text.slice(0, 200) + '...' : text;
    }
    return item.windowDescription?.slice(0, 200) || '';
  }, [isGoosFile, item.goosContent, item.windowDescription]);

  // Get image for the item
  const imageUrl = useMemo(() => {
    if (isGoosFile) {
      if (fileType === 'image' && item.goosImageUrl) return item.goosImageUrl;
    }
    return item.windowHeaderImage || item.thumbnailUrl;
  }, [isGoosFile, fileType, item]);

  return (
    <motion.article
      onClick={onClick}
      className="relative cursor-pointer"
      style={{
        marginTop: isFirst ? 0 : gap,
        marginBottom: isLast ? 0 : gap,
        opacity: isDraft && isOwner ? 0.6 : 1,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDraft && isOwner ? 0.6 : 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      {/* Draft indicator */}
      {isDraft && isOwner && (
        <div
          className="absolute -left-4 top-4"
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'var(--bg-warning, rgba(245, 158, 11, 0.1))',
            color: 'var(--text-warning, #d97706)',
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-body, system-ui)',
          }}
        >
          Draft
        </div>
      )}

      <div
        style={{
          background: 'var(--bg-card, white)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid var(--border-light, rgba(0,0,0,0.06))',
        }}
      >
        {/* Image header */}
        {imageUrl && fileType !== 'folder' && (
          <div
            style={{
              aspectRatio: '16/9',
              background: `url(${imageUrl}) center/cover no-repeat`,
              borderBottom: '1px solid var(--border-light, rgba(0,0,0,0.06))',
            }}
          />
        )}

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: '14px' }}>
              {FILE_TYPE_ICONS[fileType] || '📄'}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary, #888)',
                fontFamily: 'var(--font-body, system-ui)',
              }}
            >
              {FILE_TYPE_LABELS[fileType] || 'File'}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary, #1a1a1a)',
              fontFamily: 'var(--font-heading, system-ui)',
              marginBottom: '8px',
              lineHeight: 1.3,
            }}
          >
            {item.windowTitle || item.label}
          </h2>

          {/* Subtitle */}
          {item.windowSubtitle && (
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #666)',
                fontFamily: 'var(--font-body, system-ui)',
                marginBottom: '12px',
              }}
            >
              {item.windowSubtitle}
            </p>
          )}

          {/* Content preview */}
          {contentPreview && (
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #666)',
                fontFamily: 'var(--font-body, system-ui)',
                lineHeight: 1.6,
              }}
            >
              {contentPreview}
            </p>
          )}

          {/* Folder children count */}
          {fileType === 'folder' && item.children && (
            <div
              className="flex items-center gap-2 mt-3"
              style={{
                color: 'var(--text-tertiary, #888)',
                fontSize: '13px',
                fontFamily: 'var(--font-body, system-ui)',
              }}
            >
              <span>📁</span>
              <span>{item.children.length} items</span>
            </div>
          )}

          {/* Access indicator */}
          {item.accessLevel && item.accessLevel !== 'free' && (
            <div
              className="flex items-center gap-2 mt-4 pt-4"
              style={{
                borderTop: '1px solid var(--border-light, rgba(0,0,0,0.06))',
              }}
            >
              <span style={{ fontSize: '12px' }}>
                {item.accessLevel === 'paid' ? '💰' : '✉️'}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary, #666)',
                  fontFamily: 'var(--font-body, system-ui)',
                }}
              >
                {item.accessLevel === 'paid'
                  ? `$${item.goosPriceAmount || '0'}`
                  : 'Email required'}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
