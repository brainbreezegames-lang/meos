'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioBlockData {
  url: string;
  title?: string;
  artist?: string;
  cover?: string;
  duration?: string;
}

interface AudioBlockRendererProps {
  data: Record<string, unknown>;
}

export default function AudioBlockRenderer({ data }: AudioBlockRendererProps) {
  const { url, title, artist, cover, duration } = data as unknown as AudioBlockData;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audioDuration;
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration ? (currentTime / audioDuration) * 100 : 0;

  if (!url) return null;

  return (
    <div className="px-5 py-3">
      <audio ref={audioRef} src={url} preload="metadata" />

      <div
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
          border: '1px solid var(--border-light)',
        }}
      >
        {/* Album art or placeholder */}
        <div
          className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{
            background: cover
              ? `url(${cover}) center/cover`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {!cover && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity={0.8}>
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>

        {/* Info and controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              {title && (
                <div
                  className="text-[13px] font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </div>
              )}
              {artist && (
                <div
                  className="text-[11px] truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {artist}
                </div>
              )}
            </div>

            {/* Play button */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #0055D4 100%)',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.35)',
              }}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                  <rect x="3" y="2" width="3" height="10" rx="1" />
                  <rect x="8" y="2" width="3" height="10" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                  <path d="M4 2.5v9l7-4.5-7-4.5z" />
                </svg>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[10px] font-medium tabular-nums"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1 rounded-full cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.1)' }}
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--accent-primary) 0%, #0055D4 100%)',
                }}
              />
            </div>
            <span
              className="text-[10px] font-medium tabular-nums"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {duration || formatTime(audioDuration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
