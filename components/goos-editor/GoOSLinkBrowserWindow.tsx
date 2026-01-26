'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, RefreshCw, ArrowLeft, ArrowRight, X, Globe, Lock } from 'lucide-react';
import { SPRING, REDUCED_MOTION } from '@/lib/animations';
import { playSound } from '@/lib/sounds';

interface GoOSLinkBrowserWindowProps {
  id: string;
  url: string;
  title: string;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  zIndex?: number;
  isActive?: boolean;
  isMaximized?: boolean;
  onFocus?: () => void;
}

// Get favicon URL from a URL
function getFaviconUrl(url: string) {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return null;
  }
}

// Get display domain from URL
function getDisplayUrl(url: string) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname;
  } catch {
    return url;
  }
}

// Check if URL is HTTPS
function isSecure(url: string) {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function GoOSLinkBrowserWindow({
  id,
  url,
  title,
  onClose,
  onMinimize,
  onMaximize,
  zIndex = 100,
  isActive = true,
  isMaximized = false,
  onFocus,
}: GoOSLinkBrowserWindowProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);

  const faviconUrl = getFaviconUrl(url);
  const displayUrl = getDisplayUrl(url);
  const secure = isSecure(url);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose]);

  // Handle iframe load events
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setIframeError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setIframeError(true);
  }, []);

  // Refresh the iframe
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIframeError(false);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  }, [url]);

  // Open in new tab
  const handleOpenExternal = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
    playSound('pop');
  }, [url]);

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    // Only start drag from title bar area
    if (!(e.target as HTMLElement).closest('[data-drag-handle]')) return;

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    playSound('drag');
  }, [isMaximized, position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      playSound('drop');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleWindowClick = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center"
      style={{
        zIndex,
        padding: isMaximized ? 0 : 40,
        paddingTop: isMaximized ? 0 : 60,
      }}
    >
      <motion.div
        ref={windowRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.smooth}
        onClick={handleWindowClick}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          transform: isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`,
          width: isMaximized ? '100%' : 800,
          maxWidth: isMaximized ? '100%' : 'calc(100vw - 80px)',
          height: isMaximized ? '100%' : 600,
          maxHeight: isMaximized ? '100%' : 'calc(100vh - 140px)',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.98))',
          backdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
          WebkitBackdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
          border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
          borderRadius: isMaximized ? 0 : 'var(--radius-lg, 18px)',
          boxShadow: isActive
            ? 'var(--shadow-xl), 0 0 0 1px rgba(23, 20, 18, 0.04)'
            : 'var(--shadow-md)',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'auto',
        }}
      >
        {/* Title Bar / Tab Bar */}
        <div
          data-drag-handle
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            background: 'var(--color-bg-elevated, rgba(255, 255, 255, 0.6))',
            borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
            cursor: isMaximized ? 'default' : 'grab',
            userSelect: 'none',
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: 'flex', gap: 6, marginRight: 4 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                playSound('click');
              }}
              aria-label="Close"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #ff6058 0%, #e0443e 100%)',
                border: '0.5px solid rgba(0, 0, 0, 0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={8} strokeWidth={2.5} style={{ opacity: 0 }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize?.();
                playSound('click');
              }}
              aria-label="Minimize"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #ffbd2e 0%, #e5a420 100%)',
                border: '0.5px solid rgba(0, 0, 0, 0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMaximize?.();
                playSound('click');
              }}
              aria-label="Maximize"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #28c840 0%, #20a835 100%)',
                border: '0.5px solid rgba(0, 0, 0, 0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              aria-label="Back"
              disabled
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted, #8e827c)',
                opacity: 0.5,
              }}
            >
              <ArrowLeft size={14} strokeWidth={2} />
            </button>
            <button
              aria-label="Forward"
              disabled
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted, #8e827c)',
                opacity: 0.5,
              }}
            >
              <ArrowRight size={14} strokeWidth={2} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
                playSound('click');
              }}
              aria-label="Refresh"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary, #4a4744)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-subtle, rgba(23, 20, 18, 0.04))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <RefreshCw size={14} strokeWidth={2} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {/* URL Bar */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm, 10px)',
              background: 'var(--color-bg-primary, #fbf9ef)',
              border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
            }}
          >
            {/* Security icon */}
            {secure ? (
              <Lock size={12} strokeWidth={2} style={{ color: 'var(--color-semantic-success, #22c55e)', flexShrink: 0 }} />
            ) : (
              <Globe size={12} strokeWidth={2} style={{ color: 'var(--color-text-muted, #8e827c)', flexShrink: 0 }} />
            )}

            {/* Favicon */}
            {faviconUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={faviconUrl}
                alt=""
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

            {/* URL text */}
            <span
              style={{
                flex: 1,
                fontSize: 12,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-secondary, #4a4744)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayUrl}
            </span>
          </div>

          {/* Open in new tab button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenExternal();
            }}
            aria-label="Open in new tab"
            title="Open in new tab"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--color-accent-primary, #ff7722)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              transition: 'background 0.15s ease, transform 0.1s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-accent-primary-hover, #e56a1a)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-accent-primary, #ff7722)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ExternalLink size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Loading overlay */}
          {isLoading && !iframeError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: 'var(--color-bg-primary, #fbf9ef)',
                zIndex: 10,
              }}
            >
              <RefreshCw
                size={24}
                style={{
                  color: 'var(--color-accent-primary, #ff7722)',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-secondary, #4a4744)',
                }}
              >
                Loading {title}...
              </span>
            </div>
          )}

          {/* Error state */}
          {iframeError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 40,
                background: 'var(--color-bg-primary, #fbf9ef)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'var(--color-bg-subtle, #f2f0e7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Globe size={28} style={{ color: 'var(--color-text-muted, #8e827c)' }} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--color-text-primary, #171412)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Can&apos;t display this page here
                </h3>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 13,
                    color: 'var(--color-text-secondary, #4a4744)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  This website doesn&apos;t allow embedding. Click the button below to open it in a new tab.
                </p>
              </div>
              <button
                onClick={handleOpenExternal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  background: 'var(--color-accent-primary, #ff7722)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm, 10px)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent-primary-hover, #e56a1a)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent-primary, #ff7722)';
                }}
              >
                <ExternalLink size={14} strokeWidth={2} />
                Open in New Tab
              </button>
            </div>
          )}

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            src={url}
            title={title}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: iframeError ? 'none' : 'block',
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default GoOSLinkBrowserWindow;
