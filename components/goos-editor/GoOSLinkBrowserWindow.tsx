'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ExternalLink, RefreshCw, ArrowLeft, ArrowRight, Globe, Lock, Shield, Copy, Check } from 'lucide-react';
import { SPRING, REDUCED_MOTION, windowOpen } from '@/lib/animations';
import { TRAFFIC } from '@/components/desktop/windowStyles';
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
    // Show clean domain without www
    const domain = urlObj.hostname.replace(/^www\./, '');
    const path = urlObj.pathname === '/' ? '' : urlObj.pathname;
    return domain + path;
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

// Styles object using CSS custom properties
const styles = {
  // Window container
  window: {
    background: 'var(--color-bg-glass-heavy)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-window)',
  },
  windowActive: {
    boxShadow: 'var(--shadow-window), 0 0 0 1px var(--color-border-default)',
  },
  windowMaximized: {
    borderRadius: 0,
  },

  // Title bar
  titleBar: {
    background: 'var(--color-bg-glass)',
    borderBottom: '1px solid var(--color-border-subtle)',
  },

  // Traffic lights
  trafficLight: {
    width: TRAFFIC.size,
    height: TRAFFIC.size,
    borderRadius: '50%',
    border: '0.5px solid rgba(0, 0, 0, 0.12)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25)',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, filter 0.1s ease',
  },
  trafficClose: {
    background: `linear-gradient(180deg, ${TRAFFIC.close} 0%, color-mix(in srgb, ${TRAFFIC.close} 85%, black) 100%)`,
  },
  trafficMinimize: {
    background: `linear-gradient(180deg, ${TRAFFIC.minimize} 0%, color-mix(in srgb, ${TRAFFIC.minimize} 85%, black) 100%)`,
  },
  trafficMaximize: {
    background: `linear-gradient(180deg, ${TRAFFIC.maximize} 0%, color-mix(in srgb, ${TRAFFIC.maximize} 85%, black) 100%)`,
  },

  // Navigation buttons
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-muted)',
    transition: 'background 0.15s ease, color 0.15s ease',
  },
  navButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },

  // URL bar
  urlBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  urlBarFocused: {
    borderColor: 'var(--color-accent-primary)',
    boxShadow: '0 0 0 3px var(--color-accent-primary-subtle)',
  },

  // Security badge
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 6px',
    borderRadius: 'var(--radius-xs)',
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  securitySecure: {
    background: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
    color: 'var(--color-success)',
  },
  securityInsecure: {
    background: 'var(--color-bg-subtle)',
    color: 'var(--color-text-muted)',
  },

  // Open external button
  openExternalButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-accent-primary)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-on-accent)',
    transition: 'background 0.15s ease, transform 0.1s ease',
  },

  // Content area
  content: {
    flex: 1,
    position: 'relative' as const,
    background: 'var(--color-bg-base)',
    overflow: 'hidden',
  },

  // Loading state
  loadingContainer: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    background: 'var(--color-bg-base)',
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '3px solid var(--color-border-default)',
    borderTopColor: 'var(--color-accent-primary)',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-secondary)',
  },

  // Error state
  errorContainer: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 40,
    background: 'var(--color-bg-base)',
    textAlign: 'center' as const,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-bg-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-body)',
  },
  errorDescription: {
    margin: '8px 0 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-body)',
    lineHeight: 1.5,
    maxWidth: 320,
  },
  errorButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    background: 'var(--color-accent-primary)',
    color: 'var(--color-text-on-accent)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'background 0.15s ease, transform 0.1s ease',
  },
} as const;

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
  const [urlCopied, setUrlCopied] = useState(false);
  const [isUrlFocused, setIsUrlFocused] = useState(false);
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
    playSound('click');
  }, [url]);

  // Open in new tab
  const handleOpenExternal = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
    playSound('pop');
  }, [url]);

  // Copy URL to clipboard
  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setUrlCopied(true);
      playSound('click');
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }, [url]);

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
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
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex,
        padding: isMaximized ? 0 : 'var(--spacing-window-padding)',
        paddingTop: isMaximized ? 0 : 60,
      }}
    >
      <motion.div
        ref={windowRef}
        variants={windowOpen}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.smooth}
        onClick={handleWindowClick}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          transform: isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`,
          width: isMaximized ? '100%' : 'min(880px, calc(100vw - 80px))',
          height: isMaximized ? '100%' : 'min(640px, calc(100vh - 140px))',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          ...styles.window,
          ...(isActive ? styles.windowActive : {}),
          ...(isMaximized ? styles.windowMaximized : {}),
          cursor: isDragging ? 'grabbing' : 'auto',
        }}
      >
        {/* Title Bar */}
        <div
          data-drag-handle
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            ...styles.titleBar,
            cursor: isMaximized ? 'default' : 'grab',
            userSelect: 'none',
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: 'flex', gap: TRAFFIC.gap, flexShrink: 0 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                playSound('click');
              }}
              aria-label="Close"
              style={{ ...styles.trafficLight, ...styles.trafficClose }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize?.();
                playSound('click');
              }}
              aria-label="Minimize"
              style={{ ...styles.trafficLight, ...styles.trafficMinimize }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMaximize?.();
                playSound('click');
              }}
              aria-label="Maximize"
              style={{ ...styles.trafficLight, ...styles.trafficMaximize }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            />
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <button
              aria-label="Back"
              disabled
              style={{ ...styles.navButton, ...styles.navButtonDisabled }}
            >
              <ArrowLeft size={15} strokeWidth={2} />
            </button>
            <button
              aria-label="Forward"
              disabled
              style={{ ...styles.navButton, ...styles.navButtonDisabled }}
            >
              <ArrowRight size={15} strokeWidth={2} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              aria-label="Refresh"
              style={styles.navButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-subtle)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              <RefreshCw
                size={14}
                strokeWidth={2}
                style={{
                  animation: isLoading ? 'spin 0.8s linear infinite' : 'none',
                }}
              />
            </button>
          </div>

          {/* URL Bar */}
          <div
            style={{
              ...styles.urlBar,
              ...(isUrlFocused ? styles.urlBarFocused : {}),
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={() => setIsUrlFocused(true)}
            onBlur={() => setIsUrlFocused(false)}
            tabIndex={0}
          >
            {/* Security indicator */}
            <div
              style={{
                ...styles.securityBadge,
                ...(secure ? styles.securitySecure : styles.securityInsecure),
              }}
            >
              {secure ? (
                <>
                  <Lock size={10} strokeWidth={2.5} />
                  <span>Secure</span>
                </>
              ) : (
                <>
                  <Shield size={10} strokeWidth={2.5} />
                  <span>HTTP</span>
                </>
              )}
            </div>

            {/* Favicon */}
            {faviconUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={faviconUrl}
                alt=""
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 'var(--radius-xs)',
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
                color: 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayUrl}
            </span>

            {/* Copy URL button */}
            <button
              onClick={handleCopyUrl}
              aria-label="Copy URL"
              style={{
                ...styles.navButton,
                width: 24,
                height: 24,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-subtle)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              <AnimatePresence mode="wait">
                {urlCopied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check size={12} strokeWidth={2.5} style={{ color: 'var(--color-success)' }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Copy size={12} strokeWidth={2} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Open External Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenExternal();
            }}
            aria-label="Open in new tab"
            title="Open in new tab"
            style={styles.openExternalButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'color-mix(in srgb, var(--color-accent-primary) 85%, black)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-accent-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ExternalLink size={13} strokeWidth={2} />
            <span>Open</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={styles.content}>
          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && !iframeError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={styles.loadingContainer}
              >
                <div style={styles.loadingSpinner} />
                <span style={styles.loadingText}>
                  Loading {title}...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {iframeError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={styles.errorContainer}
              >
                <div style={styles.errorIcon}>
                  <Globe size={32} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <h3 style={styles.errorTitle}>
                    This page can&apos;t be displayed here
                  </h3>
                  <p style={styles.errorDescription}>
                    This website doesn&apos;t allow embedding in other sites.
                    Click below to view it in a new browser tab.
                  </p>
                </div>
                <button
                  onClick={handleOpenExternal}
                  style={styles.errorButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'color-mix(in srgb, var(--color-accent-primary) 85%, black)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-accent-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <ExternalLink size={14} strokeWidth={2} />
                  Open in New Tab
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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
              background: '#fff',
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default GoOSLinkBrowserWindow;
