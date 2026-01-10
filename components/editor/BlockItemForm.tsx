'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button, Input, ImageUpload } from '@/components/ui';
import type { DesktopItem, BlockData, TabData } from '@/types';
import { BLOCK_DEFINITIONS } from '@/types/blocks';
import BlockPicker from '@/components/blocks/BlockPicker';
import BlockEditor from '@/components/blocks/editors/BlockEditor';

interface BlockItemFormProps {
  item?: DesktopItem | null;
  onSave: (data: Partial<DesktopItem>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
  onUpload: (file: File) => Promise<string>;
}

export function BlockItemForm({ item, onSave, onDelete, onClose, onUpload }: BlockItemFormProps) {
  const [formData, setFormData] = useState({
    thumbnailUrl: '',
    label: '',
    windowTitle: '',
    windowSubtitle: '',
    windowWidth: 440,
    useTabs: false,
    blocks: [] as BlockData[],
    tabs: [] as TabData[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        thumbnailUrl: item.thumbnailUrl,
        label: item.label,
        windowTitle: item.windowTitle,
        windowSubtitle: item.windowSubtitle || '',
        windowWidth: item.windowWidth || 440,
        useTabs: item.useTabs || false,
        blocks: item.blocks || [],
        tabs: item.tabs || [],
      });
      if (item.useTabs && item.tabs?.length > 0) {
        setActiveTabId(item.tabs[0].id);
      }
    }
  }, [item]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const getCurrentBlocks = (): BlockData[] => {
    if (formData.useTabs && activeTabId) {
      const tab = formData.tabs.find(t => t.id === activeTabId);
      return tab?.blocks || [];
    }
    return formData.blocks;
  };

  const setCurrentBlocks = (blocks: BlockData[]) => {
    if (formData.useTabs && activeTabId) {
      setFormData(prev => ({
        ...prev,
        tabs: prev.tabs.map(t =>
          t.id === activeTabId ? { ...t, blocks } : t
        ),
      }));
    } else {
      setFormData(prev => ({ ...prev, blocks }));
    }
  };

  const handleAddBlock = (type: string) => {
    const definition = BLOCK_DEFINITIONS.find(d => d.type === type);
    const currentBlocks = getCurrentBlocks();
    const newBlock: BlockData = {
      id: generateId(),
      type,
      data: definition?.defaultData || {},
      order: currentBlocks.length,
    };
    setCurrentBlocks([...currentBlocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlock = (blockId: string, data: Record<string, unknown>) => {
    const currentBlocks = getCurrentBlocks();
    setCurrentBlocks(
      currentBlocks.map(b => b.id === blockId ? { ...b, data } : b)
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    const currentBlocks = getCurrentBlocks();
    setCurrentBlocks(currentBlocks.filter(b => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleReorderBlocks = (reorderedBlocks: BlockData[]) => {
    setCurrentBlocks(reorderedBlocks.map((b, i) => ({ ...b, order: i })));
  };

  const handleAddTab = () => {
    const newTab: TabData = {
      id: generateId(),
      label: `Tab ${formData.tabs.length + 1}`,
      order: formData.tabs.length,
      blocks: [],
    };
    setFormData(prev => ({
      ...prev,
      useTabs: true,
      tabs: [...prev.tabs, newTab],
    }));
    setActiveTabId(newTab.id);
  };

  const handleUpdateTab = (tabId: string, field: keyof TabData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      tabs: prev.tabs.map(t =>
        t.id === tabId ? { ...t, [field]: value } : t
      ),
    }));
  };

  const handleDeleteTab = (tabId: string) => {
    setFormData(prev => {
      const newTabs = prev.tabs.filter(t => t.id !== tabId);
      return {
        ...prev,
        tabs: newTabs,
        useTabs: newTabs.length > 0,
      };
    });
    if (activeTabId === tabId) {
      setActiveTabId(formData.tabs[0]?.id || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        thumbnailUrl: formData.thumbnailUrl,
        label: formData.label,
        windowTitle: formData.windowTitle,
        windowSubtitle: formData.windowSubtitle || null,
        windowWidth: formData.windowWidth,
        useTabs: formData.useTabs,
        blocks: formData.useTabs ? [] : formData.blocks,
        tabs: formData.useTabs ? formData.tabs : [],
        // Clear legacy fields
        windowDescription: '',
        windowDetails: null,
        windowLinks: null,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const currentBlocks = getCurrentBlocks();
  const selectedBlock = currentBlocks.find(b => b.id === selectedBlockId);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <ImageUpload
          label="Thumbnail"
          value={formData.thumbnailUrl}
          onChange={(url) => handleChange('thumbnailUrl', url)}
          onUpload={onUpload}
          aspectRatio="square"
          className="w-24"
        />

        <Input
          id="label"
          label="Label"
          value={formData.label}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Project name"
          maxLength={30}
          required
        />

        <div className="h-px" style={{ background: 'var(--border-light)' }} />

        <Input
          id="windowTitle"
          label="Window Title"
          value={formData.windowTitle}
          onChange={(e) => handleChange('windowTitle', e.target.value)}
          placeholder="Window title"
          required
        />

        <Input
          id="windowSubtitle"
          label="Subtitle (optional)"
          value={formData.windowSubtitle}
          onChange={(e) => handleChange('windowSubtitle', e.target.value)}
          placeholder="Brief subtitle"
        />

        <div className="h-px" style={{ background: 'var(--border-light)' }} />

        {/* Tabs Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Tabs
            </label>
            <button
              type="button"
              onClick={handleAddTab}
              className="text-[12px] font-medium"
              style={{ color: 'var(--accent-primary)' }}
            >
              + Add tab
            </button>
          </div>

          {formData.tabs.length > 0 && (
            <div className="flex gap-1 mb-3 flex-wrap">
              {formData.tabs.map((tab) => (
                <div
                  key={tab.id}
                  className="flex items-center gap-1 group"
                >
                  <button
                    type="button"
                    onClick={() => setActiveTabId(tab.id)}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                    style={{
                      background: activeTabId === tab.id ? 'var(--accent-primary)' : 'var(--bg-glass)',
                      color: activeTabId === tab.id ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {tab.label}
                  </button>
                  {activeTabId === tab.id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTab(tab.id)}
                      className="w-5 h-5 flex items-center justify-center rounded text-[10px] opacity-0 group-hover:opacity-100"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTabId && (
            <Input
              id="tabLabel"
              label="Tab Label"
              value={formData.tabs.find(t => t.id === activeTabId)?.label || ''}
              onChange={(e) => handleUpdateTab(activeTabId, 'label', e.target.value)}
              placeholder="Tab name"
            />
          )}
        </div>

        <div className="h-px" style={{ background: 'var(--border-light)' }} />

        {/* Blocks Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Content Blocks
            </label>
            <button
              type="button"
              onClick={() => setShowBlockPicker(true)}
              className="text-[12px] font-medium"
              style={{ color: 'var(--accent-primary)' }}
            >
              + Add block
            </button>
          </div>

          {currentBlocks.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={currentBlocks}
              onReorder={handleReorderBlocks}
              className="space-y-2"
            >
              {currentBlocks.map((block) => {
                const def = BLOCK_DEFINITIONS.find(d => d.type === block.type);
                return (
                  <Reorder.Item
                    key={block.id}
                    value={block}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing"
                    style={{
                      background: selectedBlockId === block.id ? 'rgba(0, 122, 255, 0.08)' : 'var(--bg-glass)',
                      border: selectedBlockId === block.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-light)',
                    }}
                  >
                    <span className="text-[12px] opacity-50">⋮⋮</span>
                    <span className="w-6 h-6 flex items-center justify-center rounded text-[11px]"
                      style={{ background: 'var(--bg-elevated)' }}>
                      {def?.icon || '?'}
                    </span>
                    <span
                      className="flex-1 text-[13px] font-medium cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      {def?.label || block.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      ×
                    </button>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          ) : (
            <div
              className="p-6 rounded-lg text-center"
              style={{ border: '2px dashed var(--border-medium)' }}
            >
              <p className="text-[13px] mb-2" style={{ color: 'var(--text-tertiary)' }}>
                No blocks yet
              </p>
              <button
                type="button"
                onClick={() => setShowBlockPicker(true)}
                className="text-[12px] font-medium"
                style={{ color: 'var(--accent-primary)' }}
              >
                Add your first block
              </button>
            </div>
          )}
        </div>

        {/* Block Editor */}
        <AnimatePresence>
          {selectedBlock && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-light)' }}>
                <BlockEditor
                  block={selectedBlock}
                  onChange={(data) => handleUpdateBlock(selectedBlock.id, data)}
                  onUpload={onUpload}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
          {item && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={isSaving || isDeleting}
            >
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving || isDeleting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={isSaving || isDeleting}>
            {item ? 'Save changes' : 'Add item'}
          </Button>
        </div>
      </form>

      <BlockPicker
        isOpen={showBlockPicker}
        onClose={() => setShowBlockPicker(false)}
        onSelect={handleAddBlock}
      />
    </>
  );
}
