'use client';

import React, { memo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, LayoutGrid, List, FileText, Image, Link2, Code2, Download, Gamepad2, Kanban, Table2, FileType2 } from 'lucide-react';
import { WindowShell } from '../desktop/WindowShell';
import type { GoOSFile } from './GoOSEditorWindow';
import { playSound } from '@/lib/sounds';
import { SPRING } from '@/lib/animations';

type ViewMode = 'icons' | 'list';

interface GoOSFolderWindowProps {
  folder: GoOSFile;
  files: GoOSFile[];
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFileDoubleClick: (fileId: string) => void;
  onFileClick: (e: React.MouseEvent, fileId: string) => void;
  selectedFileId: string | null;
  zIndex?: number;
  isActive?: boolean;
  isMaximized?: boolean;
  onFocus?: () => void;
}

// File type icon
function getFileTypeIcon(type: string, size: number = 16) {
  const props = { size, strokeWidth: 1.5 };
  switch (type) {
    case 'folder': return <Folder {...props} />;
    case 'note': return <FileText {...props} />;
    case 'case-study': return <FileType2 {...props} />;
    case 'image': return <Image {...props} />;
    case 'link': return <Link2 {...props} />;
    case 'embed': return <Code2 {...props} />;
    case 'download': return <Download {...props} />;
    case 'game': return <Gamepad2 {...props} />;
    case 'board': return <Kanban {...props} />;
    case 'sheet': return <Table2 {...props} />;
    default: return <FileText {...props} />;
  }
}

// File type color
function getFileTypeColor(type: string): string {
  switch (type) {
    case 'folder': return '#5BA4E5';
    case 'note': return '#E8913A';
    case 'case-study': return '#9B7BDB';
    case 'image': return '#4CAF50';
    case 'link': return '#5C6BC0';
    case 'embed': return '#00ACC1';
    case 'download': return '#78909C';
    case 'game': return '#E91E63';
    case 'board': return '#FF7043';
    case 'sheet': return '#26A69A';
    default: return '#90A4AE';
  }
}

// Favicon for link files
function getFaviconUrl(linkUrl?: string): string | null {
  if (!linkUrl) return null;
  try {
    const urlObj = new URL(linkUrl);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return null;
  }
}

// Format date
function formatDate(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Type labels
function getTypeLabel(type: string): string {
  switch (type) {
    case 'note': return 'Note';
    case 'case-study': return 'Case Study';
    case 'folder': return 'Folder';
    case 'image': return 'Image';
    case 'link': return 'Link';
    case 'embed': return 'Embed';
    case 'download': return 'Download';
    case 'game': return 'Game';
    case 'board': return 'Board';
    case 'sheet': return 'Sheet';
    case 'cv': return 'CV';
    default: return 'File';
  }
}

export const GoOSFolderWindow = memo(function GoOSFolderWindow({
  folder,
  files,
  onClose,
  onMinimize,
  onMaximize,
  onFileDoubleClick,
  onFileClick,
  selectedFileId,
  zIndex = 100,
  isActive = true,
  isMaximized = false,
  onFocus,
}: GoOSFolderWindowProps) {
  const filesInFolder = files.filter(f => f.parentFolderId === folder.id);
  const [viewMode, setViewMode] = useState<ViewMode>('icons');

  useEffect(() => {
    playSound('pop');
  }, []);

  const handleFileAction = useCallback((fileId: string) => {
    playSound('pop');
    onFileDoubleClick(fileId);
  }, [onFileDoubleClick]);

  return (
    <WindowShell
      id={folder.id}
      title={folder.title}
      icon={<FolderOpen size={18} color="var(--color-text-secondary)" strokeWidth={1.5} />}
      variant="light"
      isActive={isActive}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      onFocus={onFocus}
      width="min(680px, 90vw)"
      height="min(520px, 70vh)"
      minWidth={360}
      minHeight={300}
      titleBarContent={
        <span style={{ fontSize: 'var(--font-size-xs, 10px)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
          {filesInFolder.length} {filesInFolder.length === 1 ? 'item' : 'items'}
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 16px',
            borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))',
            background: 'var(--color-bg-subtle, #fafafa)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            {filesInFolder.length} {filesInFolder.length === 1 ? 'item' : 'items'}
          </span>
          <div style={{ display: 'flex', gap: 1, background: 'var(--color-bg-base, #f0f0f0)', borderRadius: 6, padding: 2 }}>
            <button
              onClick={() => { setViewMode('icons'); playSound('click'); }}
              aria-label="Icon view"
              style={{
                width: 26, height: 22, borderRadius: 4, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: viewMode === 'icons' ? 'var(--color-bg-white, #fff)' : 'transparent',
                color: viewMode === 'icons' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                boxShadow: viewMode === 'icons' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              <LayoutGrid size={12} strokeWidth={2} />
            </button>
            <button
              onClick={() => { setViewMode('list'); playSound('click'); }}
              aria-label="List view"
              style={{
                width: 26, height: 22, borderRadius: 4, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: viewMode === 'list' ? 'var(--color-bg-white, #fff)' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              <List size={12} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-white, #fff)' }}>
          {filesInFolder.length === 0 ? (
            <div
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', padding: 40,
                color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)',
                textAlign: 'center', gap: 12,
              }}
            >
              <Folder size={48} strokeWidth={1} color="var(--color-border-default)" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>This folder is empty</p>
                <p style={{ fontSize: 12 }}>Drag files here to add them</p>
              </div>
            </div>
          ) : viewMode === 'icons' ? (
            /* === Icon Grid View === */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${isMaximized ? '110px' : '96px'}, 1fr))`,
                gap: isMaximized ? 4 : 2,
                padding: isMaximized ? 20 : 16,
                alignContent: 'flex-start',
              }}
            >
              <AnimatePresence>
                {filesInFolder.map((file, idx) => {
                  const isSelected = selectedFileId === file.id;
                  const color = getFileTypeColor(file.type);
                  const faviconUrl = file.type === 'link' ? getFaviconUrl(file.linkUrl) : null;

                  return (
                    <motion.button
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.025, ...SPRING.snappy }}
                      onClick={(e) => { e.stopPropagation(); playSound('click'); onFileClick(e, file.id); }}
                      onDoubleClick={() => handleFileAction(file.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 6, padding: '12px 8px 10px', borderRadius: 8,
                        border: 'none', cursor: 'default',
                        background: isSelected ? 'var(--color-accent-primary-subtle, rgba(0,122,255,0.1))' : 'transparent',
                        transition: 'background 0.1s', outline: 'none', width: '100%',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-subtle, rgba(0,0,0,0.03))'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div
                        style={{
                          width: 48, height: 48, borderRadius: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, position: 'relative',
                          ...(file.type === 'image' && file.imageUrl
                            ? { overflow: 'hidden', background: '#f0f0f0' }
                            : { background: `${color}14` }),
                        }}
                      >
                        {file.type === 'image' && file.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={file.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                        ) : file.type === 'link' && faviconUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={faviconUrl} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} draggable={false} />
                        ) : (
                          <div style={{ color }}>{getFileTypeIcon(file.type, 24)}</div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 500,
                          color: isSelected ? 'var(--color-accent-primary, #007AFF)' : 'var(--color-text-primary)',
                          textAlign: 'center', maxWidth: '100%', overflow: 'hidden',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                          wordBreak: 'break-word' as const, lineHeight: '1.3',
                        }}
                        title={file.title}
                      >
                        {file.title}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            /* === List View === */
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 90px',
                  gap: 8, padding: '6px 16px',
                  borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))',
                  background: 'var(--color-bg-subtle, #fafafa)',
                  position: 'sticky', top: 0, zIndex: 1,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modified</span>
              </div>

              <AnimatePresence>
                {filesInFolder.map((file, idx) => {
                  const isSelected = selectedFileId === file.id;
                  const color = getFileTypeColor(file.type);
                  const faviconUrl = file.type === 'link' ? getFaviconUrl(file.linkUrl) : null;

                  return (
                    <motion.button
                      key={file.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={(e) => { e.stopPropagation(); playSound('click'); onFileClick(e, file.id); }}
                      onDoubleClick={() => handleFileAction(file.id)}
                      style={{
                        display: 'grid', gridTemplateColumns: '1fr 80px 90px',
                        gap: 8, padding: '7px 16px', border: 'none', cursor: 'default',
                        background: isSelected ? 'var(--color-accent-primary-subtle, rgba(0,122,255,0.1))' : 'transparent',
                        borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.03))',
                        transition: 'background 0.1s', outline: 'none', width: '100%', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-subtle, rgba(0,0,0,0.02))'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 26, height: 26, borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            ...(file.type === 'image' && file.imageUrl
                              ? { overflow: 'hidden', background: '#f0f0f0' }
                              : { background: `${color}14` }),
                          }}
                        >
                          {file.type === 'image' && file.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={file.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                          ) : file.type === 'link' && faviconUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={faviconUrl} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} draggable={false} />
                          ) : (
                            <div style={{ color }}>{getFileTypeIcon(file.type, 14)}</div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500,
                            color: isSelected ? 'var(--color-accent-primary, #007AFF)' : 'var(--color-text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                          title={file.title}
                        >
                          {file.title}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                        {getTypeLabel(file.type)}
                      </span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                        {formatDate(file.updatedAt)}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </WindowShell>
  );
});

export default GoOSFolderWindow;
