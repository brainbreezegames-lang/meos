'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface MusicStatus {
  provider: 'spotify' | 'apple_music';
  track: string;
  artist: string;
  album: string;
  albumArt: string;
  progress: number;
  duration: number;
  isPlaying: boolean;
}

interface StatusUpdate {
  emoji: string;
  text: string;
  updatedAt: Date;
  clearAfter?: Date;
}

interface LocationInfo {
  city: string;
  country: string;
  timezone: string;
}

type Availability = 'available' | 'busy' | 'away' | 'dnd';

interface LiveStatusData {
  music?: MusicStatus;
  status?: StatusUpdate;
  location?: LocationInfo;
  availability: Availability;
}

interface LiveStatusProps {
  data: LiveStatusData;
  isExpanded?: boolean;
  onToggle?: () => void;
}

// Collapsed menu bar item
export function LiveStatusMenuBarItem({
  data,
  onClick,
}: {
  data: LiveStatusData;
  onClick: () => void;
}) {
  // Show music if playing, otherwise show status
  const displayContent = () => {
    if (data.music?.isPlaying) {
      return (
        <>
          <span className="mr-1">🎵</span>
          <span className="truncate max-w-[120px]">
            {data.music.artist} — {data.music.track}
          </span>
        </>
      );
    }

    if (data.status) {
      return (
        <>
          <span className="mr-1">{data.status.emoji}</span>
          <span className="truncate max-w-[120px]">{data.status.text}</span>
        </>
      );
    }

    if (data.location) {
      return (
        <>
          <span className="mr-1">📍</span>
          <span className="truncate max-w-[100px]">{data.location.city}</span>
        </>
      );
    }

    return null;
  };

  const content = displayContent();
  if (!content) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center text-xs transition-all hover:bg-black/5 dark:hover:bg-white/10 px-2 py-0.5 rounded"
      style={{
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {content}
    </button>
  );
}

// Expanded dropdown
export function LiveStatusDropdown({ data, isOpen, onClose }: LiveStatusProps & { isOpen: boolean; onClose: () => void }) {
  const getLocalTime = (timezone: string) => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return null;
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[140]" onClick={onClose} />

          {/* Dropdown */}
          <motion.div
            className="fixed z-[141] w-[280px] rounded-xl overflow-hidden"
            style={{
              top: '32px',
              right: '200px',
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'blur(40px)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-xl)',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Music Section */}
            {data.music && (
              <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Now Playing
                </div>
                <div className="flex gap-3">
                  {/* Album Art */}
                  <div
                    className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    {data.music.albumArt && (
                      <img
                        src={data.music.albumArt}
                        alt={data.music.album}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {data.music.artist}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{data.music.album}</div>
                    <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{data.music.track}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(data.music.progress / data.music.duration) * 100}%`,
                        background: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDuration(data.music.progress)}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDuration(data.music.duration)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Section */}
            {data.status && (
              <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  Status
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{data.status.emoji}</span>
                  <div>
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{data.status.text}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      Updated {getTimeAgo(data.status.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location Section */}
            {data.location && (
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {data.location.city}, {data.location.country}
                    </div>
                    {data.location.timezone && (
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        🌙 {getLocalTime(data.location.timezone)} local
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!data.music && !data.status && !data.location && (
              <div className="p-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No status available
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Combined component
export function LiveStatus({ data }: { data: LiveStatusData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <LiveStatusMenuBarItem data={data} onClick={() => setIsExpanded(!isExpanded)} />
      <LiveStatusDropdown
        data={data}
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
      />
    </>
  );
}

// Settings panel for owner
interface LiveStatusSettingsProps {
  data: LiveStatusData;
  onUpdate: (data: Partial<LiveStatusData>) => void;
  spotifyConnected?: boolean;
  onConnectSpotify?: () => void;
  onDisconnectSpotify?: () => void;
}

export function LiveStatusSettings({
  data,
  onUpdate,
  spotifyConnected = false,
  onConnectSpotify,
  onDisconnectSpotify,
}: LiveStatusSettingsProps) {
  const [statusEmoji, setStatusEmoji] = useState(data.status?.emoji || '💻');
  const [statusText, setStatusText] = useState(data.status?.text || '');
  const [location, setLocation] = useState(data.location?.city || '');

  const commonEmojis = ['💻', '🎨', '✈️', '🏠', '📚', '🎮', '☕', '🏃', '😴', '🎉'];

  const handleStatusUpdate = () => {
    onUpdate({
      status: statusText
        ? { emoji: statusEmoji, text: statusText, updatedAt: new Date() }
        : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Music Integration */}
      <div className="space-y-3">
        <label
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Music
        </label>
        {spotifyConnected ? (
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: 'var(--border-light)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🎵</span>
              <div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>Spotify Connected</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Shows what you&apos;re playing</div>
              </div>
            </div>
            <button
              onClick={onDisconnectSpotify}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              style={{
                background: 'var(--border-medium)',
                color: 'var(--text-secondary)',
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnectSpotify}
            className="w-full p-3 rounded-lg flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
            style={{
              background: 'rgba(29, 185, 84, 0.15)',
              color: '#1DB954',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Connect Spotify
          </button>
        )}
      </div>

      {/* Status */}
      <div className="space-y-3">
        <label
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Status
        </label>
        <div className="space-y-2">
          {/* Emoji picker */}
          <div className="flex gap-1 flex-wrap">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setStatusEmoji(emoji)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                style={{
                  background: statusEmoji === emoji ? 'var(--border-medium)' : 'var(--border-light)',
                  boxShadow: statusEmoji === emoji ? '0 0 0 2px var(--accent-primary)' : 'none',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Status text */}
          <input
            type="text"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value.slice(0, 50))}
            placeholder="What are you up to?"
            className="w-full px-3 py-2 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
            maxLength={50}
          />

          <button
            onClick={handleStatusUpdate}
            className="w-full py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--bg-elevated)',
            }}
          >
            Update Status
          </button>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
          className="w-full px-3 py-2 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        />
        <label
          className="flex items-center gap-2 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          <input
            type="checkbox"
            className="w-4 h-4 rounded"
            style={{ accentColor: 'var(--accent-primary)' }}
            defaultChecked
          />
          Show local time to visitors
        </label>
      </div>
    </div>
  );
}

export type { LiveStatusData, MusicStatus, StatusUpdate, LocationInfo, Availability };
