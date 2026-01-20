'use client';

import React, { useMemo } from 'react';
import type { DesktopItem, GoOSFileType } from '@/types';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '@/lib/goos/fileTypeMapping';

// goOS Design Tokens - Mediterranean Blue
const goOS = {
  colors: {
    paper: '#FFFFFF',
    border: '#2B4AE2',
    background: '#F8F9FE',
    text: {
      primary: '#2B4AE2',
      secondary: '#6B7FE8',
      muted: '#9BA5E8',
    },
    warning: '#F59E0B',
  },
  shadows: {
    solid: '4px 4px 0 #2B4AE2',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

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
      style={{
        minHeight: '100vh',
        background: goOS.colors.background,
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* Page header */}
        <div
          style={{
            marginBottom: '48px',
            paddingBottom: '24px',
            borderBottom: `2px solid ${goOS.colors.border}`,
          }}
        >
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: goOS.colors.text.primary,
              fontFamily: goOS.fonts.heading,
              marginBottom: '8px',
            }}
          >
            All Content
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: goOS.colors.text.secondary,
              fontFamily: goOS.fonts.body,
            }}
          >
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

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
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              background: goOS.colors.paper,
              border: `2px solid ${goOS.colors.border}`,
              borderRadius: '8px',
              boxShadow: goOS.shadows.solid,
            }}
          >
            <span
              style={{
                fontSize: '48px',
                display: 'block',
                marginBottom: '16px',
              }}
            >
              📭
            </span>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: goOS.colors.text.primary,
                fontFamily: goOS.fonts.heading,
                marginBottom: '8px',
              }}
            >
              No content yet
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: goOS.colors.text.secondary,
                fontFamily: goOS.fonts.body,
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
    <article
      onClick={onClick}
      style={{
        position: 'relative',
        marginTop: isFirst ? 0 : gap,
        marginBottom: isLast ? 0 : gap,
        opacity: isDraft && isOwner ? 0.7 : 1,
        cursor: 'pointer',
      }}
    >
      {/* Draft indicator */}
      {isDraft && isOwner && (
        <div
          style={{
            position: 'absolute',
            left: '-12px',
            top: '16px',
            padding: '4px 8px',
            borderRadius: '4px',
            background: goOS.colors.warning,
            color: goOS.colors.paper,
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: goOS.fonts.heading,
            transform: 'rotate(-3deg)',
          }}
        >
          Draft
        </div>
      )}

      <div
        style={{
          background: goOS.colors.paper,
          border: `2px solid ${goOS.colors.border}`,
          borderRadius: '8px',
          boxShadow: goOS.shadows.solid,
          overflow: 'hidden',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-2px, -2px)';
          e.currentTarget.style.boxShadow = '6px 6px 0 #2B4AE2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)';
          e.currentTarget.style.boxShadow = goOS.shadows.solid;
        }}
      >
        {/* Image header */}
        {imageUrl && fileType !== 'folder' && (
          <div
            style={{
              aspectRatio: '16/9',
              background: `url(${imageUrl}) center/cover no-repeat`,
              borderBottom: `2px solid ${goOS.colors.border}`,
            }}
          />
        )}

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Type badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '16px' }}>
              {FILE_TYPE_ICONS[fileType] || '📄'}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: goOS.colors.text.secondary,
                fontFamily: goOS.fonts.heading,
              }}
            >
              {FILE_TYPE_LABELS[fileType] || 'File'}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: goOS.colors.text.primary,
              fontFamily: goOS.fonts.heading,
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
                color: goOS.colors.text.secondary,
                fontFamily: goOS.fonts.body,
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
                color: goOS.colors.text.secondary,
                fontFamily: goOS.fonts.body,
                lineHeight: 1.6,
              }}
            >
              {contentPreview}
            </p>
          )}

          {/* Folder children count */}
          {fileType === 'folder' && item.children && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px',
                color: goOS.colors.text.muted,
                fontSize: '13px',
                fontFamily: goOS.fonts.body,
              }}
            >
              <span>📁</span>
              <span>{item.children.length} items</span>
            </div>
          )}

          {/* Access indicator */}
          {item.accessLevel && item.accessLevel !== 'free' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: `2px solid ${goOS.colors.border}`,
              }}
            >
              <span style={{ fontSize: '14px' }}>
                {item.accessLevel === 'paid' ? '💰' : '✉️'}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: goOS.colors.text.primary,
                  fontFamily: goOS.fonts.heading,
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
    </article>
  );
}
