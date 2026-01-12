'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Archive, ArchiveRestore, Trash2, X, Sparkles } from 'lucide-react';
import type { DesktopItem } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';

interface WorkbenchWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

export function WorkbenchWindow({ window: windowInstance, item }: WorkbenchWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', description: '', imageUrl: '', context: '' });

  const isOwner = context?.isOwner ?? false;
  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';

  // Get workbench entries from desktop context
  const allEntries = context?.desktop?.workbenchEntries || [];
  const entries = showArchived
    ? allEntries.filter(e => e.isArchived)
    : allEntries.filter(e => !e.isArchived);

  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const handleAddEntry = () => {
    if (!context || !newEntry.title.trim()) return;

    context.addWorkbenchEntry({
      title: newEntry.title,
      description: newEntry.description || null,
      imageUrl: newEntry.imageUrl || null,
      context: newEntry.context || null,
      isArchived: false,
    });

    setNewEntry({ title: '', description: '', imageUrl: '', context: '' });
    setIsAddingEntry(false);
  };

  const handleArchiveEntry = (entryId: string) => {
    if (!context) return;
    const entry = allEntries.find(e => e.id === entryId);
    if (entry) {
      context.updateWorkbenchEntry(entryId, { isArchived: !entry.isArchived });
      if (selectedEntryId === entryId) setSelectedEntryId(null);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!context) return;
    context.deleteWorkbenchEntry(entryId);
    if (selectedEntryId === entryId) setSelectedEntryId(null);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const windowWidth = Math.max(item.windowWidth || 560, 480);

  return (
    <>
      <div
        ref={constraintsRef}
        className="fixed inset-0 z-[199] pointer-events-none"
        style={{ padding: isMaximized ? '28px 0 0 0' : '40px' }}
      />

      <div
        className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        style={{ padding: isMaximized ? '28px 0 0 0' : '40px' }}
      >
        <motion.div
          ref={windowRef}
          className="overflow-hidden flex flex-col pointer-events-auto"
          onClick={handleWindowClick}
          drag={!isMaximized}
          dragConstraints={constraintsRef}
          dragElastic={0.05}
          dragMomentum={false}
          style={{
            zIndex: windowInstance.zIndex + 200,
            width: isMaximized ? '100%' : windowWidth,
            maxWidth: isMaximized ? '100%' : '95vw',
            height: isMaximized ? '100%' : 'auto',
            maxHeight: isMaximized ? '100%' : 'calc(100vh - 120px)',
            minHeight: 400,
            borderRadius: isMaximized ? '0' : 'var(--radius-window, 12px)',
            background: 'var(--bg-glass-elevated, rgba(255,255,255,0.95))',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: isActive
              ? 'var(--shadow-window, 0 24px 80px -12px rgba(0,0,0,0.25))'
              : 'var(--shadow-window-inactive, 0 12px 40px -8px rgba(0,0,0,0.15))',
            border: '1px solid var(--border-glass-outer, rgba(255,255,255,0.2))',
            opacity: isActive ? 1 : 0.96,
          }}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : {
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        >
          {/* Title Bar */}
          <div
            className="flex items-center h-[52px] px-4 shrink-0 relative select-none"
            style={{
              background: 'var(--bg-titlebar, linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,252,0.85) 100%))',
              borderBottom: '1px solid var(--border-light, rgba(0,0,0,0.06))',
              cursor: isMaximized ? 'default' : 'grab',
            }}
          >
            {/* Traffic Lights */}
            <div
              className="flex items-center gap-2 group/traffic"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => windowContext.closeWindow(windowInstance.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:scale-90"
                style={{
                  background: 'linear-gradient(180deg, #FF5F57 0%, #E0443E 100%)',
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                }}
              >
                <X className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" strokeWidth={2.5} style={{ color: 'rgba(77,0,0,0.7)' }} />
              </button>
              <button
                onClick={() => windowContext.minimizeWindow(windowInstance.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:scale-90"
                style={{
                  background: 'linear-gradient(180deg, #FFBD2E 0%, #DFA023 100%)',
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                }}
              >
                <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 2" fill="none">
                  <path d="M1 1H7" stroke="rgba(100,65,0,0.7)" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => windowContext.maximizeWindow(windowInstance.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:scale-90"
                style={{
                  background: 'linear-gradient(180deg, #28CA41 0%, #1AAD2E 100%)',
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                }}
              >
                <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                  <path d="M1 3L4 6L7 3" stroke="rgba(0,70,0,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <Sparkles size={14} style={{ color: 'var(--accent-primary, #8b5cf6)' }} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary, #1a1a1a)',
                  fontFamily: 'var(--font-body, system-ui)',
                }}
              >
                {item.windowTitle || 'Now Working On'}
              </span>
            </div>

            {/* Toolbar */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="p-1.5 rounded-md transition-all duration-150"
                style={{
                  color: showArchived ? 'var(--accent-primary, #8b5cf6)' : 'var(--text-tertiary, #888)',
                  background: showArchived ? 'var(--accent-light, rgba(139,92,246,0.1))' : 'transparent',
                }}
              >
                <Archive size={15} />
              </button>
              {isOwner && (
                <button
                  onClick={() => setIsAddingEntry(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: 'var(--accent-primary, #8b5cf6)',
                    color: 'white',
                  }}
                >
                  <Plus size={13} />
                  New
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ background: 'var(--bg-secondary, #fafafa)' }}
          >
            {/* Add Entry Form */}
            <AnimatePresence>
              {isAddingEntry && (
                <motion.div
                  className="p-4"
                  style={{ borderBottom: '1px solid var(--border-light, rgba(0,0,0,0.06))' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: 'var(--bg-elevated, white)',
                      border: '1px solid var(--border-light, rgba(0,0,0,0.06))',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-primary, #1a1a1a)',
                          fontFamily: 'var(--font-body, system-ui)',
                        }}
                      >
                        What are you working on?
                      </span>
                      <button
                        onClick={() => setIsAddingEntry(false)}
                        style={{ color: 'var(--text-tertiary, #888)' }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                        autoFocus
                        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all"
                        style={{
                          background: 'var(--bg-secondary, #fafafa)',
                          border: '1px solid var(--border-medium, rgba(0,0,0,0.1))',
                          color: 'var(--text-primary, #1a1a1a)',
                          fontFamily: 'var(--font-body, system-ui)',
                        }}
                      />
                      <textarea
                        placeholder="Brief description (optional)"
                        value={newEntry.description}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all resize-none"
                        style={{
                          background: 'var(--bg-secondary, #fafafa)',
                          border: '1px solid var(--border-medium, rgba(0,0,0,0.1))',
                          color: 'var(--text-primary, #1a1a1a)',
                          fontFamily: 'var(--font-body, system-ui)',
                        }}
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setIsAddingEntry(false)}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
                          style={{ color: 'var(--text-secondary, #666)' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddEntry}
                          disabled={!newEntry.title.trim()}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all disabled:opacity-40"
                          style={{
                            background: 'var(--accent-primary, #8b5cf6)',
                            color: 'white',
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeline */}
            {sortedEntries.length > 0 ? (
              <div className="p-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div
                    className="absolute left-[11px] top-6 bottom-6 w-[2px]"
                    style={{ background: 'var(--border-light, rgba(0,0,0,0.08))' }}
                  />

                  {/* Entries */}
                  <div className="space-y-4">
                    {sortedEntries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        className="relative pl-8"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Timeline dot */}
                        <div
                          className="absolute left-0 top-3 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            background: selectedEntryId === entry.id
                              ? 'var(--accent-primary, #8b5cf6)'
                              : 'var(--bg-elevated, white)',
                            border: selectedEntryId === entry.id
                              ? 'none'
                              : '2px solid var(--border-medium, rgba(0,0,0,0.1))',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          }}
                        >
                          {selectedEntryId === entry.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>

                        {/* Entry card */}
                        <div
                          className="rounded-xl cursor-pointer transition-all duration-200"
                          style={{
                            background: 'var(--bg-elevated, white)',
                            border: `1px solid ${selectedEntryId === entry.id ? 'var(--accent-primary, #8b5cf6)' : 'var(--border-light, rgba(0,0,0,0.06))'}`,
                            boxShadow: selectedEntryId === entry.id
                              ? '0 4px 12px rgba(139,92,246,0.15)'
                              : '0 1px 3px rgba(0,0,0,0.04)',
                          }}
                          onClick={() => setSelectedEntryId(selectedEntryId === entry.id ? null : entry.id)}
                        >
                          {/* Entry header */}
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Image thumbnail */}
                              {entry.imageUrl && (
                                <div
                                  className="w-16 h-16 rounded-lg shrink-0 overflow-hidden"
                                  style={{ background: 'var(--bg-secondary, #fafafa)' }}
                                >
                                  <img
                                    src={entry.imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h3
                                    style={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: 'var(--text-primary, #1a1a1a)',
                                      fontFamily: 'var(--font-body, system-ui)',
                                    }}
                                  >
                                    {entry.title}
                                  </h3>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      color: 'var(--text-tertiary, #888)',
                                      fontFamily: 'var(--font-body, system-ui)',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {formatDate(entry.createdAt)}
                                  </span>
                                </div>

                                {entry.description && (
                                  <p
                                    style={{
                                      fontSize: '13px',
                                      color: 'var(--text-secondary, #666)',
                                      fontFamily: 'var(--font-body, system-ui)',
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {entry.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded context */}
                          <AnimatePresence>
                            {selectedEntryId === entry.id && entry.context && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="px-4 pb-4"
                              >
                                <div
                                  className="p-3 rounded-lg"
                                  style={{
                                    background: 'var(--bg-secondary, #fafafa)',
                                    borderLeft: '3px solid var(--accent-primary, #8b5cf6)',
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: '12px',
                                      color: 'var(--text-secondary, #666)',
                                      fontFamily: 'var(--font-body, system-ui)',
                                      lineHeight: 1.6,
                                      fontStyle: 'italic',
                                    }}
                                  >
                                    {entry.context}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Owner actions */}
                          {isOwner && selectedEntryId === entry.id && (
                            <motion.div
                              className="px-4 pb-3 flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); handleArchiveEntry(entry.id); }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all"
                                style={{
                                  background: 'var(--bg-secondary, #fafafa)',
                                  color: 'var(--text-secondary, #666)',
                                }}
                              >
                                {entry.isArchived ? <ArchiveRestore size={12} /> : <Archive size={12} />}
                                {entry.isArchived ? 'Restore' : 'Archive'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all"
                                style={{
                                  background: 'rgba(239,68,68,0.08)',
                                  color: '#dc2626',
                                }}
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <motion.div
                className="flex flex-col items-center justify-center py-16 px-8"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-light, rgba(139,92,246,0.1)) 0%, var(--accent-light, rgba(139,92,246,0.05)) 100%)',
                  }}
                >
                  <Sparkles size={24} style={{ color: 'var(--accent-primary, #8b5cf6)' }} />
                </div>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-primary, #1a1a1a)',
                    fontFamily: 'var(--font-body, system-ui)',
                    marginBottom: '6px',
                  }}
                >
                  {showArchived ? 'No archived items' : 'Nothing here yet'}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-tertiary, #888)',
                    fontFamily: 'var(--font-body, system-ui)',
                    textAlign: 'center',
                    maxWidth: '220px',
                    lineHeight: 1.5,
                  }}
                >
                  {showArchived
                    ? 'Archived items will appear here'
                    : 'Share what you\'re exploring, building, or thinking about'}
                </p>
                {isOwner && !showArchived && (
                  <button
                    onClick={() => setIsAddingEntry(true)}
                    className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium"
                    style={{
                      background: 'var(--accent-primary, #8b5cf6)',
                      color: 'white',
                    }}
                  >
                    <Plus size={15} />
                    Add first entry
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2.5 flex items-center justify-between shrink-0"
            style={{
              borderTop: '1px solid var(--border-light, rgba(0,0,0,0.06))',
              background: 'var(--bg-elevated, white)',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-tertiary, #888)',
                fontFamily: 'var(--font-body, system-ui)',
              }}
            >
              {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'}
              {showArchived ? ' archived' : ''}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-tertiary, #888)',
                fontFamily: 'var(--font-body, system-ui)',
              }}
            >
              {item.windowSubtitle || 'Work in progress'}
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
