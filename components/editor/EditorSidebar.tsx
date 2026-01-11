'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { ItemForm } from './ItemForm';
import { DockItemForm } from './DockItemForm';
import { BackgroundSettings } from './BackgroundSettings';
import type { Desktop, DesktopItem, DockItem } from '@/types';

type Tab = 'items' | 'dock' | 'background';

interface EditorSidebarProps {
  desktop: Desktop;
  selectedItem: DesktopItem | null;
  selectedDockItem: DockItem | null;
  onDeselectItem: () => void;
  onDeselectDockItem: () => void;
  onUpdateDesktop: (data: Partial<Desktop>) => Promise<void>;
  onCreateItem: (data: Partial<DesktopItem>) => Promise<void>;
  onUpdateItem: (id: string, data: Partial<DesktopItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onCreateDockItem: (data: Partial<DockItem>) => Promise<void>;
  onUpdateDockItem: (id: string, data: Partial<DockItem>) => Promise<void>;
  onDeleteDockItem: (id: string) => Promise<void>;
  onMoveDockItem: (id: string, direction: 'up' | 'down') => Promise<void>;
  onUpload: (file: File) => Promise<string>;
}

export function EditorSidebar({
  desktop,
  selectedItem,
  selectedDockItem,
  onDeselectItem,
  onDeselectDockItem,
  onUpdateDesktop,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onCreateDockItem,
  onUpdateDockItem,
  onDeleteDockItem,
  onMoveDockItem,
  onUpload,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('items');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddDockItem, setShowAddDockItem] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'items', label: 'Items' },
    { id: 'dock', label: 'Dock' },
    { id: 'background', label: 'Background' },
  ];

  return (
    <div
      className="fixed right-0 top-14 bottom-0 w-80 z-[100] flex flex-col"
      style={{
        background: 'var(--bg-glass-elevated)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        borderLeft: '1px solid var(--border-light)',
      }}
    >
      {/* Tabs */}
      <div className="flex p-2 gap-1 shrink-0" style={{ borderBottom: '1px solid var(--border-light)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 px-3 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'items' && (
            <motion.div
              key="items"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {selectedItem ? (
                <ItemForm
                  item={selectedItem}
                  onSave={(data) => onUpdateItem(selectedItem.id, data)}
                  onDelete={() => onDeleteItem(selectedItem.id)}
                  onClose={onDeselectItem}
                  onUpload={onUpload}
                />
              ) : showAddItem ? (
                <ItemForm
                  onSave={async (data) => {
                    await onCreateItem({
                      ...data,
                      positionX: 20 + Math.random() * 60,
                      positionY: 20 + Math.random() * 60,
                    });
                    setShowAddItem(false);
                  }}
                  onClose={() => setShowAddItem(false)}
                  onUpload={onUpload}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      Desktop Items ({desktop.items.length}/20)
                    </span>
                    <Button size="sm" onClick={() => setShowAddItem(true)}>
                      + Add
                    </Button>
                  </div>

                  {desktop.items.length === 0 ? (
                    <div
                      className="text-center py-8 text-[13px]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Your desktop is empty. Tap + Add to create your first item.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {desktop.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {/* Will be handled by canvas click */}}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors text-left"
                        >
                          <div
                            className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url(${item.thumbnailUrl})` }}
                          />
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {item.label}
                            </div>
                            <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                              {item.windowTitle}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'dock' && (
            <motion.div
              key="dock"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {selectedDockItem ? (
                <DockItemForm
                  item={selectedDockItem}
                  onSave={(data) => onUpdateDockItem(selectedDockItem.id, data)}
                  onDelete={() => onDeleteDockItem(selectedDockItem.id)}
                  onClose={onDeselectDockItem}
                />
              ) : showAddDockItem ? (
                <DockItemForm
                  onSave={async (data) => {
                    await onCreateDockItem(data);
                    setShowAddDockItem(false);
                  }}
                  onClose={() => setShowAddDockItem(false)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      Dock Items ({desktop.dockItems.length}/8)
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setShowAddDockItem(true)}
                      disabled={desktop.dockItems.length >= 8}
                    >
                      + Add
                    </Button>
                  </div>

                  {desktop.dockItems.length === 0 ? (
                    <div
                      className="text-center py-8 text-[13px]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Add links to your dock
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {desktop.dockItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 transition-colors"
                        >
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => onMoveDockItem(item.id, 'up')}
                              disabled={index === 0}
                              className="p-0.5 rounded hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onMoveDockItem(item.id, 'down')}
                              disabled={index === desktop.dockItems.length - 1}
                              className="p-0.5 rounded hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => {/* Handle dock item selection */}}
                            className="flex-1 flex items-center gap-3 text-left"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                              style={{
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 247, 0.9) 100%)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                              }}
                            >
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {item.label}
                              </div>
                              <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                                {item.actionValue}
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'background' && (
            <motion.div
              key="background"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <BackgroundSettings
                desktop={desktop}
                onUpdate={onUpdateDesktop}
                onUpload={onUpload}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
