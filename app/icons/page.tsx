'use client';

import { useState, useRef } from 'react';
import { Upload, Check, X, Image as ImageIcon } from 'lucide-react';
import {
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  MessagesIcon,
  NotesIcon,
} from '@/lib/icons';

type IconSlot = {
  id: string;
  name: string;
  description: string;
  category: 'dock' | 'desktop';
  DefaultIcon?: React.ComponentType<{ size: number }>;
  currentUrl: string | null;
};

const ICON_SLOTS: IconSlot[] = [
  // Dock icons
  { id: 'finder', name: 'Finder', description: 'Opens Welcome window', category: 'dock', DefaultIcon: FinderIcon, currentUrl: null },
  { id: 'safari', name: 'Safari', description: 'Opens Features window', category: 'dock', DefaultIcon: SafariIcon, currentUrl: null },
  { id: 'photos', name: 'Photos', description: 'Opens Showcase window', category: 'dock', DefaultIcon: PhotosIcon, currentUrl: null },
  { id: 'notes', name: 'Notes', description: 'Opens Pricing window', category: 'dock', DefaultIcon: NotesIcon, currentUrl: null },
  { id: 'mail', name: 'Mail', description: 'Decorative only', category: 'dock', DefaultIcon: MailIcon, currentUrl: null },
  { id: 'messages', name: 'Messages', description: 'Decorative only', category: 'dock', DefaultIcon: MessagesIcon, currentUrl: null },
  // Desktop icons
  { id: 'start-here', name: 'Start Here', description: 'Welcome icon on desktop', category: 'desktop', currentUrl: null },
  { id: 'features', name: 'Features', description: 'Features icon on desktop', category: 'desktop', currentUrl: null },
  { id: 'showcase', name: 'Showcase', description: 'Portfolio icon on desktop', category: 'desktop', currentUrl: null },
  { id: 'pricing', name: 'Pricing', description: 'Pricing icon on desktop', category: 'desktop', currentUrl: null },
];

export default function IconManagerPage() {
  const [icons, setIcons] = useState<Record<string, string | null>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const handleUploadClick = (slotId: string) => {
    setActiveSlot(slotId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlot) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, SVG, JPG)');
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      alert('File too large. Maximum size is 500KB.');
      return;
    }

    setUploading(activeSlot);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setIcons(prev => ({ ...prev, [activeSlot]: previewUrl }));

    // Simulate upload delay (in production, upload to Supabase here)
    await new Promise(resolve => setTimeout(resolve, 500));

    setUploading(null);
    setActiveSlot(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveIcon = (slotId: string) => {
    setIcons(prev => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  };

  const handleSaveAll = async () => {
    setSaved(true);
    // In production: save to database/storage here
    setTimeout(() => setSaved(false), 2000);
  };

  const dockIcons = ICON_SLOTS.filter(s => s.category === 'dock');
  const desktopIcons = ICON_SLOTS.filter(s => s.category === 'desktop');

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 overflow-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-3">Icon Manager</h1>
          <p className="text-lg text-stone-500">
            Click any icon to upload a replacement. Changes are saved automatically.
          </p>
        </div>

        {/* Dock Icons Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30" />
            <h2 className="text-2xl font-semibold text-stone-800">Dock Icons</h2>
            <span className="text-sm text-stone-400 ml-2">Bottom navigation bar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dockIcons.map((slot) => (
              <IconCard
                key={slot.id}
                slot={slot}
                customUrl={icons[slot.id]}
                isUploading={uploading === slot.id}
                onUpload={() => handleUploadClick(slot.id)}
                onRemove={() => handleRemoveIcon(slot.id)}
              />
            ))}
          </div>
        </section>

        {/* Desktop Icons Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30" />
            <h2 className="text-2xl font-semibold text-stone-800">Desktop Icons</h2>
            <span className="text-sm text-stone-400 ml-2">Top-left icon grid</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {desktopIcons.map((slot) => (
              <IconCard
                key={slot.id}
                slot={slot}
                customUrl={icons[slot.id]}
                isUploading={uploading === slot.id}
                onUpload={() => handleUploadClick(slot.id)}
                onRemove={() => handleRemoveIcon(slot.id)}
              />
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleSaveAll}
            disabled={Object.keys(icons).length === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-xl transition-all
              ${Object.keys(icons).length > 0
                ? 'bg-stone-900 text-white hover:bg-stone-800 hover:scale-105'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }
              ${saved ? 'bg-green-600 hover:bg-green-600' : ''}
            `}
          >
            {saved ? (
              <>
                <Check size={18} />
                Saved!
              </>
            ) : (
              <>
                <Upload size={18} />
                Save Changes ({Object.keys(icons).length})
              </>
            )}
          </button>
        </div>

        {/* Info Section */}
        <section className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-8 mt-8">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Icon Guidelines</h3>
          <div className="grid sm:grid-cols-3 gap-6 text-sm text-stone-600">
            <div>
              <div className="font-medium text-stone-800 mb-1">Format</div>
              <p>PNG or SVG recommended. JPG works but may have artifacts.</p>
            </div>
            <div>
              <div className="font-medium text-stone-800 mb-1">Size</div>
              <p>512x512 pixels ideal. Will be resized automatically.</p>
            </div>
            <div>
              <div className="font-medium text-stone-800 mb-1">Style</div>
              <p>macOS-style icons with rounded corners work best.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function IconCard({
  slot,
  customUrl,
  isUploading,
  onUpload,
  onRemove,
}: {
  slot: IconSlot;
  customUrl: string | null;
  isUploading: boolean;
  onUpload: () => void;
  onRemove: () => void;
}) {
  const hasCustomIcon = !!customUrl;

  return (
    <div className="group relative">
      <button
        onClick={onUpload}
        disabled={isUploading}
        className={`
          w-full aspect-square rounded-2xl border-2 border-dashed transition-all duration-200
          flex flex-col items-center justify-center gap-2 p-4
          ${hasCustomIcon
            ? 'border-transparent bg-white shadow-lg'
            : 'border-stone-300 bg-white/50 hover:border-stone-400 hover:bg-white'
          }
          ${isUploading ? 'opacity-50' : ''}
        `}
      >
        {/* Icon Display */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center">
          {isUploading ? (
            <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          ) : customUrl ? (
            <img src={customUrl} alt={slot.name} className="w-full h-full object-cover" />
          ) : slot.DefaultIcon ? (
            <slot.DefaultIcon size={64} />
          ) : (
            <div className="w-full h-full bg-stone-200 rounded-xl flex items-center justify-center">
              <ImageIcon size={24} className="text-stone-400" />
            </div>
          )}
        </div>

        {/* Label */}
        <div className="text-center">
          <div className="font-medium text-stone-800 text-sm">{slot.name}</div>
          <div className="text-xs text-stone-400">{slot.description}</div>
        </div>

        {/* Upload hint on hover */}
        {!hasCustomIcon && !isUploading && (
          <div className="absolute inset-0 rounded-2xl bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 shadow-sm">
              Click to upload
            </div>
          </div>
        )}
      </button>

      {/* Remove button */}
      {hasCustomIcon && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
