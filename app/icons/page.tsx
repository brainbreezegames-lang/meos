'use client';

// Icon Manager v3 - Upload icons that persist to Supabase
import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Check, X, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';
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
};

// All customizable icons in the landing page
const ICON_SLOTS: IconSlot[] = [
  // Dock icons (bottom bar)
  { id: 'dock-finder', name: 'Finder', description: 'Opens Welcome window', category: 'dock', DefaultIcon: FinderIcon },
  { id: 'dock-safari', name: 'Safari', description: 'Opens Features window', category: 'dock', DefaultIcon: SafariIcon },
  { id: 'dock-photos', name: 'Photos', description: 'Opens Showcase window', category: 'dock', DefaultIcon: PhotosIcon },
  { id: 'dock-notes', name: 'Notes', description: 'Opens Pricing window', category: 'dock', DefaultIcon: NotesIcon },
  { id: 'dock-mail', name: 'Mail', description: 'Opens Reviews window', category: 'dock', DefaultIcon: MailIcon },
  { id: 'dock-messages', name: 'Messages', description: 'Opens Help window', category: 'dock', DefaultIcon: MessagesIcon },
  // Desktop icons (top-left grid)
  { id: 'desktop-welcome', name: 'Start Here', description: 'Welcome icon', category: 'desktop' },
  { id: 'desktop-features', name: 'Features', description: 'Features icon', category: 'desktop' },
  { id: 'desktop-showcase', name: 'Showcase', description: 'Portfolio icon', category: 'desktop' },
  { id: 'desktop-pricing', name: 'Pricing', description: 'Pricing icon', category: 'desktop' },
  { id: 'desktop-reviews', name: 'Reviews', description: 'Reviews icon', category: 'desktop' },
  { id: 'desktop-help', name: 'Help', description: 'Help/FAQ icon', category: 'desktop' },
];

type MessageType = { type: 'success' | 'error' | 'info'; text: string } | null;

export default function IconManagerPage() {
  const [savedIcons, setSavedIcons] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<MessageType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  // Fetch existing icons on load
  const fetchIcons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/landing-icons');
      if (!res.ok) throw new Error('Failed to fetch icons');
      const data = await res.json();
      setSavedIcons(data.icons || {});
    } catch (error) {
      console.error('Failed to fetch icons:', error);
      setMessage({ type: 'error', text: 'Failed to load saved icons. Make sure Supabase is configured.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIcons();
  }, [fetchIcons]);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleUploadClick = (slotId: string) => {
    setActiveSlot(slotId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlot) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, SVG, or WebP)' });
      resetFileInput();
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum size is 500KB.' });
      resetFileInput();
      return;
    }

    setUploading(activeSlot);
    setMessage({ type: 'info', text: `Uploading ${file.name}...` });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('iconId', activeSlot);

      const res = await fetch('/api/landing-icons', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.success && data.url) {
        // Add cache-busting query param to force refresh
        const urlWithCacheBust = `${data.url}?t=${Date.now()}`;
        setSavedIcons(prev => ({ ...prev, [activeSlot]: urlWithCacheBust }));
        setMessage({ type: 'success', text: `Icon saved! It will appear on the landing page within a minute.` });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload icon' });
    } finally {
      setUploading(null);
      setActiveSlot(null);
      resetFileInput();
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveIcon = async (slotId: string) => {
    const confirmed = window.confirm(`Remove the ${slotId.replace('dock-', '').replace('desktop-', '')} icon?`);
    if (!confirmed) return;

    setMessage({ type: 'info', text: 'Removing icon...' });

    try {
      const res = await fetch(`/api/landing-icons?iconId=${encodeURIComponent(slotId)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete icon');
      }

      setSavedIcons(prev => {
        const updated = { ...prev };
        delete updated[slotId];
        return updated;
      });
      setMessage({ type: 'success', text: 'Icon removed. Default icon will be used.' });
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Failed to remove icon' });
    }
  };

  const dockIcons = ICON_SLOTS.filter(s => s.category === 'dock');
  const desktopIcons = ICON_SLOTS.filter(s => s.category === 'desktop');
  const savedCount = Object.keys(savedIcons).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 text-stone-400 animate-spin" />
        <p className="text-stone-500">Loading icons...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 overflow-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-3">Icon Manager</h1>
          <p className="text-lg text-stone-500">
            Click any icon to upload a replacement. Icons save automatically to the cloud.
          </p>
          {savedCount > 0 && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
              <Check size={14} />
              {savedCount} custom icon{savedCount > 1 ? 's' : ''} saved
            </p>
          )}
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : message.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {message.type === 'success' ? <Check size={18} /> :
             message.type === 'error' ? <AlertCircle size={18} /> :
             <RefreshCw size={18} className="animate-spin" />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        )}

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
                savedUrl={savedIcons[slot.id]}
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
            <span className="text-sm text-stone-400 ml-2">Top-left icon grid on desktop</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {desktopIcons.map((slot) => (
              <IconCard
                key={slot.id}
                slot={slot}
                savedUrl={savedIcons[slot.id]}
                isUploading={uploading === slot.id}
                onUpload={() => handleUploadClick(slot.id)}
                onRemove={() => handleRemoveIcon(slot.id)}
              />
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Icon Guidelines</h3>
          <div className="grid sm:grid-cols-4 gap-6 text-sm text-stone-600">
            <div>
              <div className="font-medium text-stone-800 mb-1">Format</div>
              <p>PNG, SVG, or WebP recommended for best quality.</p>
            </div>
            <div>
              <div className="font-medium text-stone-800 mb-1">Size</div>
              <p>512x512 pixels ideal. Displayed at various sizes.</p>
            </div>
            <div>
              <div className="font-medium text-stone-800 mb-1">File Size</div>
              <p>Maximum 500KB per icon.</p>
            </div>
            <div>
              <div className="font-medium text-stone-800 mb-1">Style</div>
              <p>macOS-style icons with rounded corners work best.</p>
            </div>
          </div>
        </section>

        {/* Refresh button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchIcons}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh icons
          </button>
        </div>
      </div>
    </div>
  );
}

function IconCard({
  slot,
  savedUrl,
  isUploading,
  onUpload,
  onRemove,
}: {
  slot: IconSlot;
  savedUrl?: string;
  isUploading: boolean;
  onUpload: () => void;
  onRemove: () => void;
}) {
  const hasCustomIcon = !!savedUrl;
  const [imgError, setImgError] = useState(false);

  // Reset error state when URL changes
  useEffect(() => {
    setImgError(false);
  }, [savedUrl]);

  return (
    <div className="group relative">
      <button
        onClick={onUpload}
        disabled={isUploading}
        className={`
          w-full aspect-square rounded-2xl border-2 border-dashed transition-all duration-200
          flex flex-col items-center justify-center gap-2 p-3
          ${hasCustomIcon && !imgError
            ? 'border-transparent bg-white shadow-lg'
            : 'border-stone-300 bg-white/50 hover:border-stone-400 hover:bg-white'
          }
          ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
      >
        {/* Icon Display */}
        <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
          {isUploading ? (
            <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          ) : savedUrl && !imgError ? (
            <img
              src={savedUrl}
              alt={slot.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : slot.DefaultIcon ? (
            <slot.DefaultIcon size={56} />
          ) : (
            <div className="w-full h-full bg-stone-200 rounded-xl flex items-center justify-center">
              <ImageIcon size={20} className="text-stone-400" />
            </div>
          )}
        </div>

        {/* Label */}
        <div className="text-center min-w-0 w-full">
          <div className="font-medium text-stone-800 text-xs truncate">{slot.name}</div>
          <div className="text-[10px] text-stone-400 truncate">{slot.description}</div>
        </div>

        {/* Upload hint on hover */}
        {!isUploading && (
          <div className="absolute inset-0 rounded-2xl bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 shadow-sm">
              {hasCustomIcon ? 'Replace' : 'Upload'}
            </div>
          </div>
        )}

        {/* Saved indicator */}
        {hasCustomIcon && !imgError && (
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-green-500 shadow-sm" title="Saved to cloud" />
        )}
      </button>

      {/* Remove button */}
      {hasCustomIcon && !imgError && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
          title="Remove custom icon"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
