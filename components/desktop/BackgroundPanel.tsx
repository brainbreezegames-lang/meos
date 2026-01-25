'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Curated wallpapers - nature, abstract, minimal
const PRESET_WALLPAPERS = [
  {
    id: 'alpine',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2560&h=1440&fit=crop&q=90',
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop&q=80',
    name: 'Alpine',
  },
  {
    id: 'forest',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2560&h=1440&fit=crop&q=90',
    thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=120&fit=crop&q=80',
    name: 'Foggy Forest',
  },
  {
    id: 'woodland',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2560&h=1440&fit=crop&q=90',
    thumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=120&fit=crop&q=80',
    name: 'Woodland',
  },
  {
    id: 'dunes',
    url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=2560&h=1440&fit=crop&q=90',
    thumb: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=200&h=120&fit=crop&q=80',
    name: 'Sand Dunes',
  },
  {
    id: 'peaks',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2560&h=1440&fit=crop&q=90',
    thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=120&fit=crop&q=80',
    name: 'Starry Peaks',
  },
  {
    id: 'abstract-blue',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2560&h=1440&fit=crop&q=90',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=120&fit=crop&q=80',
    name: 'Abstract Blue',
  },
  {
    id: 'gradient-mesh',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=2560&h=1440&fit=crop&q=90',
    thumb: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=120&fit=crop&q=80',
    name: 'Gradient Mesh',
  },
  {
    id: 'ocean',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=2560&h=1440&fit=crop&q=90',
    thumb: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&h=120&fit=crop&q=80',
    name: 'Ocean Blue',
  },
  {
    id: 'bg30',
    url: '/bg30.png',
    thumb: '/bg30.png',
    name: 'Gradient 30',
  },
  {
    id: 'bg31',
    url: '/bg31.png',
    thumb: '/bg31.png',
    name: 'Gradient 31',
  },
  {
    id: 'bg32',
    url: '/bg32.png',
    thumb: '/bg32.png',
    name: 'Gradient 32',
  },
  {
    id: 'bg33',
    url: '/bg33.png',
    thumb: '/bg33.png',
    name: 'Gradient 33',
  },
  {
    id: 'bg34',
    url: '/bg34.png',
    thumb: '/bg34.png',
    name: 'Gradient 34',
  },
  {
    id: 'bg35',
    url: '/bg35.png',
    thumb: '/bg35.png',
    name: 'Gradient 35',
  },
];

interface BackgroundPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string | null;
  onBackgroundChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
}

export function BackgroundPanel({
  isOpen,
  onClose,
  currentBackground,
  onBackgroundChange,
  onUpload,
}: BackgroundPanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine which is selected
  useEffect(() => {
    if (!currentBackground) {
      setSelectedId('dynamic');
      return;
    }
    const preset = PRESET_WALLPAPERS.find(w => currentBackground.includes(w.id) || w.url === currentBackground);
    if (preset) {
      setSelectedId(preset.id);
    } else {
      setSelectedId('custom');
      setCustomImage(currentBackground);
    }
  }, [currentBackground]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB limit

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 150);

    try {
      if (onUpload) {
        const url = await onUpload(file);
        setCustomImage(url);
        onBackgroundChange(url);
        setSelectedId('custom');
      } else {
        // For demo: create object URL
        const url = URL.createObjectURL(file);
        setCustomImage(url);
        onBackgroundChange(url);
        setSelectedId('custom');
      }
      setUploadProgress(100);
    } catch {
      // Handle error silently
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }, [onUpload, onBackgroundChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const selectPreset = (wallpaper: typeof PRESET_WALLPAPERS[0]) => {
    setSelectedId(wallpaper.id);
    onBackgroundChange(wallpaper.url);
  };

  const selectDynamic = () => {
    setSelectedId('dynamic');
    onBackgroundChange(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[400]"
            style={{
              background: 'var(--bg-overlay)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed z-[401] top-1/2 left-1/2 w-[560px] max-h-[85vh] overflow-hidden"
            style={{
              borderRadius: '16px',
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'blur(60px) saturate(200%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              border: '1px solid var(--border-glass-outer)',
              boxShadow: 'var(--shadow-window)',
            }}
            initial={{ opacity: 0, scale: 0.92, x: '-50%', y: '-45%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-48%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '0.5px solid var(--border-light)' }}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div>
                  <h2
                    className="text-[15px] font-semibold tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Desktop Background
                  </h2>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    Choose a wallpaper or upload your own
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--border-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              {/* Upload area */}
              <div
                className={`relative rounded-2xl p-8 mb-6 transition-all cursor-pointer ${
                  dragOver ? 'scale-[1.02]' : ''
                }`}
                style={{
                  background: dragOver
                    ? 'rgba(102, 126, 234, 0.1)'
                    : 'var(--bg-elevated)',
                  border: `2px dashed ${dragOver ? '#667eea' : 'var(--border-medium)'}`,
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="var(--border-medium)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="#667eea"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={175.93}
                          strokeDashoffset={175.93 * (1 - uploadProgress / 100)}
                          style={{ transition: 'stroke-dashoffset 0.15s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                      Uploading...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#667eea"
                        strokeWidth="1.5"
                      >
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" strokeLinecap="round" />
                        <path d="M12 4v12" strokeLinecap="round" />
                        <path d="M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        Drop an image here, or click to browse
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        JPG, PNG, WebP up to 10MB
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom image preview */}
                {customImage && !isUploading && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <Image
                      src={customImage}
                      alt="Custom background"
                      fill
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                    >
                      <span className="text-[13px] font-medium text-white">Change image</span>
                    </div>
                    {selectedId === 'custom' && (
                      <div className="absolute top-3 right-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: '#667eea' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
                            <path d="M3 7l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic wallpapers option */}
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Dynamic
                </h3>
                <button
                  onClick={selectDynamic}
                  className="w-full flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-black/5"
                  style={{
                    background: selectedId === 'dynamic' ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    border: selectedId === 'dynamic' ? '2px solid #667eea' : '2px solid transparent',
                  }}
                >
                  {/* Animated preview */}
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2, #6B8DD6)',
                        backgroundSize: '200% 200%',
                        animation: 'gradientShift 4s ease infinite',
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      Auto-rotating Wallpapers
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      Changes every 8 seconds
                    </p>
                  </div>
                  {selectedId === 'dynamic' && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: '#667eea' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
                        <path d="M3 7l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              {/* Preset wallpapers */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Wallpapers
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_WALLPAPERS.map((wallpaper) => (
                    <button
                      key={wallpaper.id}
                      onClick={() => selectPreset(wallpaper)}
                      className="group relative aspect-[5/3] rounded-xl overflow-hidden transition-transform hover:scale-105"
                      style={{
                        boxShadow: selectedId === wallpaper.id
                          ? '0 0 0 3px #667eea, 0 8px 24px rgba(0, 0, 0, 0.25)'
                          : '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <Image
                        src={wallpaper.thumb}
                        alt={wallpaper.name}
                        fill
                        className="object-cover"
                      />
                      {/* Name overlay on hover */}
                      <div
                        className="absolute inset-x-0 bottom-0 py-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                        }}
                      >
                        <p className="text-[10px] font-medium text-white text-center truncate">
                          {wallpaper.name}
                        </p>
                      </div>
                      {/* Selected indicator */}
                      {selectedId === wallpaper.id && (
                        <div className="absolute top-2 right-2">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: '#667eea' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
                              <path d="M3 7l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
