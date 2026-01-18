'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GoOSProvider, useGoOS, type GoOSFileData } from '@/contexts/GoOSContext';
import {
  GoOSFileIcon,
  GoOSDesktopContextMenu,
  GoOSFileContextMenu,
  GoOSFolderWindow,
} from '@/components/goos-editor';
import type { GoOSViewMode } from '@/lib/goos/viewContext';

// Lazy load editor
const GoOSEditorWindow = dynamic(
  () => import('@/components/goos-editor/GoOSEditorWindow').then(mod => ({ default: mod.GoOSEditorWindow })),
  {
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
        <div className="bg-[#FAF8F0] p-6 rounded-lg border-2 border-[#2a2a2a] shadow-[6px_6px_0_rgba(0,0,0,0.1)]">
          <div className="animate-pulse text-sm font-medium text-[#1a1a1a]">Loading editor...</div>
        </div>
      </div>
    ),
    ssr: false
  }
);

// Lazy load read-only viewer
const GoOSReadOnlyViewer = dynamic(
  () => import('@/components/goos-editor/GoOSReadOnlyViewer'),
  { ssr: false }
);

interface DesktopData {
  username: string;
  name: string | null;
  theme: string;
  backgroundUrl: string | null;
  isPublic: boolean;
}

interface GoOSPublicDesktopProps {
  desktop: DesktopData;
  files: GoOSFileData[];
  viewMode: GoOSViewMode;
  isOwner: boolean;
}

// Design tokens
const goOS = {
  colors: {
    paper: '#FAF8F0',
    cream: '#FFFDF5',
    headerBg: '#F0EDE0',
    border: '#2a2a2a',
    text: {
      primary: '#1a1a1a',
      secondary: '#3a3a3a',
      muted: '#666666',
    },
    accent: {
      orange: '#E85D04',
    },
  },
};

function GoOSDesktopContent({ desktop, isOwner }: { desktop: DesktopData; isOwner: boolean }) {
  const { files, viewMode, createFile, updateFile, deleteFile, duplicateFile, publishFile, unpublishFile, toast } = useGoOS();

  // UI state
  const [openEditors, setOpenEditors] = useState<string[]>([]);
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{ files: GoOSFileData[]; operation: 'copy' | 'cut' } | null>(null);
  const [topZIndex, setTopZIndex] = useState(100);
  const [windowZ, setWindowZ] = useState<Record<string, number>>({});

  // Context menus
  const [desktopContextMenu, setDesktopContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({ isOpen: false, x: 0, y: 0 });
  const [fileContextMenu, setFileContextMenu] = useState<{ isOpen: boolean; x: number; y: number; fileId: string | null }>({ isOpen: false, x: 0, y: 0, fileId: null });

  // Desktop shows root-level files only
  const filesOnDesktop = useMemo(() => files.filter(f => !f.parentId), [files]);

  const openFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (file.type === 'folder') {
      if (!openFolders.includes(fileId)) {
        setOpenFolders(prev => [...prev, fileId]);
      }
      setActiveFolderId(fileId);
      setWindowZ(prev => ({ ...prev, [`folder-${fileId}`]: topZIndex + 1 }));
      setTopZIndex(prev => prev + 1);
    } else {
      if (!openEditors.includes(fileId)) {
        setOpenEditors(prev => [...prev, fileId]);
      }
      setActiveEditorId(fileId);
      setWindowZ(prev => ({ ...prev, [`editor-${fileId}`]: topZIndex + 1 }));
      setTopZIndex(prev => prev + 1);
    }
  }, [files, openFolders, openEditors, topZIndex]);

  const closeEditor = useCallback((fileId: string) => {
    setOpenEditors(prev => prev.filter(id => id !== fileId));
    if (activeEditorId === fileId) {
      const remaining = openEditors.filter(id => id !== fileId);
      setActiveEditorId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  }, [activeEditorId, openEditors]);

  const closeFolder = useCallback((folderId: string) => {
    setOpenFolders(prev => prev.filter(id => id !== folderId));
    if (activeFolderId === folderId) {
      setActiveFolderId(null);
    }
  }, [activeFolderId]);

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isOwner) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-file-id]') || target.closest('[data-window]')) return;
    e.preventDefault();
    setDesktopContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
    setSelectedFileId(null);
  }, [isOwner]);

  const handleFileContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
    if (!isOwner) return;
    e.preventDefault();
    e.stopPropagation();
    setFileContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, fileId });
    setSelectedFileId(fileId);
  }, [isOwner]);

  const handleCreateFile = useCallback(async (type: 'note' | 'case-study' | 'folder') => {
    const newFile = await createFile(type);
    if (newFile && type !== 'folder') {
      setOpenEditors(prev => [...prev, newFile.id]);
      setActiveEditorId(newFile.id);
      setRenamingFileId(newFile.id);
    }
  }, [createFile]);

  const handleDeleteFile = useCallback(async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const success = await deleteFile(fileId);
      if (success) {
        closeEditor(fileId);
        setSelectedFileId(null);
      }
    }
  }, [deleteFile, closeEditor]);

  const handleRename = useCallback((fileId: string, newTitle: string) => {
    updateFile(fileId, { title: newTitle });
    setRenamingFileId(null);
  }, [updateFile]);

  const handleTogglePublish = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      if (file.status === 'draft') {
        await publishFile(fileId);
      } else {
        await unpublishFile(fileId);
      }
    }
  }, [files, publishFile, unpublishFile]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: desktop.backgroundUrl
          ? `url(${desktop.backgroundUrl}) center/cover`
          : `linear-gradient(135deg, ${goOS.colors.paper} 0%, ${goOS.colors.cream} 100%)`,
      }}
      onContextMenu={handleDesktopContextMenu}
      onClick={() => {
        setSelectedFileId(null);
        setDesktopContextMenu(prev => ({ ...prev, isOpen: false }));
        setFileContextMenu(prev => ({ ...prev, isOpen: false }));
      }}
    >
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 h-7 flex items-center justify-between px-4 z-50"
        style={{
          background: goOS.colors.headerBg,
          borderBottom: `1px solid ${goOS.colors.border}20`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: goOS.colors.text.primary }}>
            {desktop.name || desktop.username}'s goOS
          </span>
        </div>
        {!desktop.isPublic && isOwner && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: goOS.colors.accent.orange + '20', color: goOS.colors.accent.orange }}>
            Private
          </span>
        )}
      </div>

      {/* Desktop Files */}
      <div className="absolute inset-0 pt-7">
        {filesOnDesktop.map(file => (
          <GoOSFileIcon
            key={file.id}
            id={file.id}
            type={file.type}
            title={file.title}
            status={file.status}
            position={file.position}
            isSelected={selectedFileId === file.id}
            isRenaming={renamingFileId === file.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFileId(file.id);
            }}
            onDoubleClick={() => openFile(file.id)}
            onContextMenu={(e) => handleFileContextMenu(e, file.id)}
            onPositionChange={(pos) => updateFile(file.id, { position: pos })}
            onRename={(title) => handleRename(file.id, title)}
            onDragStart={() => {}}
            isDraggedOver={false}
          />
        ))}
      </div>

      {/* Editor Windows */}
      {openEditors.map(fileId => {
        const file = files.find(f => f.id === fileId);
        if (!file) return null;

        if (viewMode === 'visitor') {
          return (
            <GoOSReadOnlyViewer
              key={fileId}
              file={{
                id: file.id,
                type: file.type,
                title: file.title,
                content: file.content,
                status: file.status,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt,
                position: file.position,
              }}
              onClose={() => closeEditor(fileId)}
              isActive={activeEditorId === fileId}
              zIndex={windowZ[`editor-${fileId}`] || 100}
            />
          );
        }

        return (
          <GoOSEditorWindow
            key={fileId}
            file={{
              id: file.id,
              type: file.type,
              title: file.title,
              content: file.content,
              status: file.status,
              createdAt: file.createdAt,
              updatedAt: file.updatedAt,
              position: file.position,
            }}
            onClose={() => closeEditor(fileId)}
            onUpdate={(updates) => updateFile(fileId, updates)}
            isActive={activeEditorId === fileId}
            zIndex={windowZ[`editor-${fileId}`] || 100}
          />
        );
      })}

      {/* Folder Windows */}
      {openFolders.map(folderId => {
        const folder = files.find(f => f.id === folderId);
        if (!folder) return null;

        const folderFiles = files.filter(f => f.parentId === folderId);

        return (
          <GoOSFolderWindow
            key={folderId}
            folder={{
              id: folder.id,
              type: 'folder',
              title: folder.title,
              content: '',
              status: folder.status,
              createdAt: folder.createdAt,
              updatedAt: folder.updatedAt,
              position: folder.position,
            }}
            files={folderFiles.map(f => ({
              id: f.id,
              type: f.type,
              title: f.title,
              content: f.content,
              status: f.status,
              createdAt: f.createdAt,
              updatedAt: f.updatedAt,
              position: f.position,
            }))}
            onClose={() => closeFolder(folderId)}
            onFileDoubleClick={openFile}
            onFileClick={(e, fileId) => {
              e.stopPropagation();
              setSelectedFileId(fileId);
            }}
            selectedFileId={selectedFileId}
            isActive={activeFolderId === folderId}
            zIndex={windowZ[`folder-${folderId}`] || 100}
          />
        );
      })}

      {/* Context Menus (owner only) */}
      {isOwner && (
        <>
          <GoOSDesktopContextMenu
            isOpen={desktopContextMenu.isOpen}
            position={{ x: desktopContextMenu.x, y: desktopContextMenu.y }}
            onClose={() => setDesktopContextMenu(prev => ({ ...prev, isOpen: false }))}
            onNewNote={() => handleCreateFile('note')}
            onNewCaseStudy={() => handleCreateFile('case-study')}
            onNewFolder={() => handleCreateFile('folder')}
            onPaste={clipboard ? () => {} : undefined}
            canPaste={!!clipboard}
          />

          {fileContextMenu.fileId && (
            <GoOSFileContextMenu
              isOpen={fileContextMenu.isOpen}
              position={{ x: fileContextMenu.x, y: fileContextMenu.y }}
              onClose={() => setFileContextMenu(prev => ({ ...prev, isOpen: false }))}
              fileType={files.find(f => f.id === fileContextMenu.fileId)?.type || 'note'}
              fileStatus={files.find(f => f.id === fileContextMenu.fileId)?.status}
              onOpen={() => openFile(fileContextMenu.fileId!)}
              onRename={() => setRenamingFileId(fileContextMenu.fileId)}
              onDuplicate={() => duplicateFile(fileContextMenu.fileId!)}
              onCopy={() => {
                const file = files.find(f => f.id === fileContextMenu.fileId);
                if (file) setClipboard({ files: [file], operation: 'copy' });
              }}
              onCut={() => {
                const file = files.find(f => f.id === fileContextMenu.fileId);
                if (file) setClipboard({ files: [file], operation: 'cut' });
              }}
              onDelete={() => handleDeleteFile(fileContextMenu.fileId!)}
              onTogglePublish={() => handleTogglePublish(fileContextMenu.fileId!)}
            />
          )}
        </>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-[9999]"
          style={{
            background: toast.type === 'error' ? '#fef2f2' : toast.type === 'success' ? '#f0fdf4' : goOS.colors.paper,
            border: `2px solid ${toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#22c55e' : goOS.colors.border}`,
            color: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#22c55e' : goOS.colors.text.primary,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export function GoOSPublicDesktop({ desktop, files, viewMode, isOwner }: GoOSPublicDesktopProps) {
  return (
    <GoOSProvider
      initialFiles={files}
      viewMode={viewMode}
      username={desktop.username}
    >
      <GoOSDesktopContent desktop={desktop} isOwner={isOwner} />
    </GoOSProvider>
  );
}
