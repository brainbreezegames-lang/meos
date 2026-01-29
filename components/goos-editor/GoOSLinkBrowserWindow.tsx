'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, RefreshCw, ArrowLeft, ArrowRight, Globe, Lock, Shield, Copy, Check } from 'lucide-react';
import { WindowShell } from '../desktop/WindowShell';
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

function getFaviconUrl(url: string) {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return null;
  }
}

function getDisplayUrl(url: string) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const path = urlObj.pathname === '/' ? '' : urlObj.pathname;
    return domain + path;
  } catch {
    return url;
  }
}

function isSecure(url: string) {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function getProxyUrl(url: string): string {
  return `/api/proxy?url=${encodeURIComponent(url)}`;
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
  const [isLoading, setIsLoading] = useState(true);
  const [useProxy, setUseProxy] = useState(false);
  const [proxyFailed, setProxyFailed] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const directLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);

  const faviconUrl = getFaviconUrl(url);
  const displayUrl = getDisplayUrl(url);
  const secure = isSecure(url);

  const iframeSrc = useProxy ? getProxyUrl(url) : url;

  // Try direct iframe first, fall back to proxy after timeout
  useEffect(() => {
    hasLoadedRef.current = false;
    setIsLoading(true);
    setUseProxy(false);
    setProxyFailed(false);

    directLoadTimeoutRef.current = setTimeout(() => {
      if (!hasLoadedRef.current) {
        setUseProxy(true);
        setIsLoading(true);
      }
    }, 3000);

    return () => {
      if (directLoadTimeoutRef.current) clearTimeout(directLoadTimeoutRef.current);
    };
  }, [url]);

  const handleIframeLoad = useCallback(() => {
    hasLoadedRef.current = true;
    if (directLoadTimeoutRef.current) clearTimeout(directLoadTimeoutRef.current);
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    if (directLoadTimeoutRef.current) clearTimeout(directLoadTimeoutRef.current);

    if (!useProxy) {
      setUseProxy(true);
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setProxyFailed(true);
    }
  }, [useProxy]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setProxyFailed(false);
    hasLoadedRef.current = false;
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
    playSound('click');
  }, [iframeSrc]);

  const handleOpenExternal = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
    playSound('pop');
  }, [url]);

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

  const browserNavigation = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button aria-label="Back" disabled style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', opacity: 0.4 }}>
          <ArrowLeft size={15} strokeWidth={2} />
        </button>
        <button aria-label="Forward" disabled style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', opacity: 0.4 }}>
          <ArrowRight size={15} strokeWidth={2} />
        </button>
        <button
          onClick={handleRefresh} aria-label="Refresh"
          style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <RefreshCw size={14} strokeWidth={2} style={{ animation: isLoading ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>
      </div>

      <div
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
          borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-base)',
          border: `1px solid ${isUrlFocused ? 'var(--color-accent-primary)' : 'var(--color-border-default)'}`,
          boxShadow: isUrlFocused ? '0 0 0 3px var(--color-accent-primary-subtle)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onClick={(e) => e.stopPropagation()} onFocus={() => setIsUrlFocused(true)} onBlur={() => setIsUrlFocused(false)} tabIndex={0}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontSize: 10, fontWeight: 500, letterSpacing: '0.02em', background: secure ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'var(--color-bg-subtle)', color: secure ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
          {secure ? (<><Lock size={10} strokeWidth={2.5} /><span>Secure</span></>) : (<><Shield size={10} strokeWidth={2.5} /><span>HTTP</span></>)}
        </div>
        {faviconUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={faviconUrl} alt="" style={{ width: 14, height: 14, borderRadius: 'var(--radius-xs)', flexShrink: 0 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}
        <span style={{ flex: 1, fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayUrl}
        </span>
        <button
          onClick={handleCopyUrl} aria-label="Copy URL"
          style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', flexShrink: 0, transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <AnimatePresence mode="wait">
            {urlCopied ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                <Check size={12} strokeWidth={2.5} style={{ color: 'var(--color-success)' }} />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                <Copy size={12} strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <button
        onClick={handleOpenExternal} aria-label="Open in new tab" title="Open in new tab"
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 'var(--radius-sm)', background: 'var(--color-accent-primary)',
          border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          fontFamily: 'var(--font-body)', color: 'var(--color-text-on-accent)',
          transition: 'background 0.15s, transform 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-accent-primary) 85%, black)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-accent-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <ExternalLink size={13} strokeWidth={2} />
        <span>Open</span>
      </button>
    </div>
  );

  return (
    <WindowShell
      id={id} title={title} variant="light" isActive={isActive}
      isMaximized={isMaximized} zIndex={zIndex}
      onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} onFocus={onFocus}
      width="min(880px, calc(100vw - 80px))" height="min(640px, calc(100vh - 140px))"
      minWidth={400} minHeight={300} titleBarContent={browserNavigation}
    >
      <div style={{ flex: 1, position: 'relative', background: 'var(--color-bg-base)', overflow: 'hidden' }}>
        <AnimatePresence>
          {isLoading && !proxyFailed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--color-bg-base)', zIndex: 2 }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--color-border-default)', borderTopColor: 'var(--color-accent-primary)', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
                Loading {title}...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {proxyFailed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40, background: 'var(--color-bg-base)', textAlign: 'center', zIndex: 2 }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={32} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
                  This page can&apos;t be displayed here
                </h3>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5, maxWidth: 320 }}>
                  This website doesn&apos;t allow embedding. Click below to view it in a new browser tab.
                </p>
              </div>
              <button
                onClick={handleOpenExternal}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', background: 'var(--color-accent-primary)', color: 'var(--color-text-on-accent)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background 0.15s, transform 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-accent-primary) 85%, black)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-accent-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <ExternalLink size={14} strokeWidth={2} />
                Open in New Tab
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title={title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ width: '100%', height: '100%', border: 'none', display: proxyFailed ? 'none' : 'block', background: '#fff' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </WindowShell>
  );
}

export default GoOSLinkBrowserWindow;
