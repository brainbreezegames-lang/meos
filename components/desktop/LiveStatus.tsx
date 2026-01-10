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
      className="flex items-center text-xs transition-all hover:bg-white/10 px-2 py-0.5 rounded"
      style={{
        color: 'rgba(255, 255, 255, 0.7)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
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
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Music Section */}
            {data.music && (
              <div className="p-4 border-b border-white/10">
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Now Playing
                </div>
                <div className="flex gap-3">
                  {/* Album Art */}
                  <div
                    className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
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
                    <div className="text-sm font-medium text-white/90 truncate">
                      {data.music.artist}
                    </div>
                    <div className="text-xs text-white/50 truncate">{data.music.album}</div>
                    <div className="text-xs text-white/70 truncate mt-0.5">{data.music.track}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(data.music.progress / data.music.duration) * 100}%`,
                        background: 'rgba(255, 255, 255, 0.6)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/40">
                      {formatDuration(data.music.progress)}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {formatDuration(data.music.duration)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Section */}
            {data.status && (
              <div className="p-4 border-b border-white/10">
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                  Status
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{data.status.emoji}</span>
                  <div>
                    <div className="text-sm text-white/90">{data.status.text}</div>
                    <div className="text-xs text-white/40 mt-0.5">
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
                    <div className="text-sm text-white/90">
                      {data.location.city}, {data.location.country}
                    </div>
                    {data.location.timezone && (
                      <div className="text-xs text-white/40 mt-0.5">
                        🌙 {getLocalTime(data.location.timezone)} local
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!data.music && !data.status && !data.location && (
              <div className="p-6 text-center text-white/40 text-sm">
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
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Music</label>
        {spotifyConnected ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎵</span>
              <div>
                <div className="text-sm text-white/90">Spotify Connected</div>
                <div className="text-xs text-white/50">Shows what you&apos;re playing</div>
              </div>
            </div>
            <button
              onClick={onDisconnectSpotify}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/10 text-white/70 hover:bg-white/15"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnectSpotify}
            className="w-full p-3 rounded-lg bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center gap-2 hover:bg-[#1DB954]/30 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect Spotify
          </button>
        )}
      </div>

      {/* Status */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Status</label>
        <div className="space-y-2">
          {/* Emoji picker */}
          <div className="flex gap-1 flex-wrap">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setStatusEmoji(emoji)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                  statusEmoji === emoji ? 'bg-white/20 ring-2 ring-blue-500' : 'bg-white/5 hover:bg-white/10'
                }`}
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
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 text-sm outline-none"
            maxLength={50}
          />

          <button
            onClick={handleStatusUpdate}
            className="w-full py-2 rounded-lg bg-blue-500/80 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Update Status
          </button>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 text-sm outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-blue-500"
            defaultChecked
          />
          Show local time to visitors
        </label>
      </div>
    </div>
  );
}

export type { LiveStatusData, MusicStatus, StatusUpdate, LocationInfo, Availability };
