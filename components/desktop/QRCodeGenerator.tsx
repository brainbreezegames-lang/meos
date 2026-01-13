'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// QR Code generation using canvas
// Simple QR code generator without external dependencies
interface QRCodeGeneratorProps {
  baseUrl: string;
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

type LinkTarget = 'desktop' | 'links' | 'recruiter';
type QRStyle = 'standard' | 'rounded' | 'dots';
type QRColor = 'black' | 'theme' | 'custom';

const LINK_TARGETS: { value: LinkTarget; label: string; suffix: string }[] = [
  { value: 'desktop', label: 'Full desktop', suffix: '' },
  { value: 'links', label: 'Link-in-Bio', suffix: '/links' },
  { value: 'recruiter', label: 'Recruiter view', suffix: '?mode=recruiter' },
];

// Simple QR code matrix generator (using basic encoding)
function generateQRMatrix(text: string, size: number = 21): boolean[][] {
  // This is a simplified QR-like pattern generator for demo purposes
  // In production, use a proper QR library
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Add finder patterns (corners)
  const addFinderPattern = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isOuter = y === 0 || y === 6 || x === 0 || x === 6;
        const isInner = y >= 2 && y <= 4 && x >= 2 && x <= 4;
        matrix[startY + y][startX + x] = isOuter || isInner;
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(size - 7, 0);
  addFinderPattern(0, size - 7);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Add data based on text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Fill data area with pseudo-random pattern based on text
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Skip finder patterns
      if ((x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)) continue;
      // Skip timing patterns
      if (x === 6 || y === 6) continue;

      // Generate pattern based on position and hash
      const seed = (x * 31 + y * 17 + hash) % 100;
      matrix[y][x] = seed > 55;
    }
  }

  return matrix;
}

export function QRCodeGenerator({ baseUrl, username, isOpen, onClose }: QRCodeGeneratorProps) {
  const [linkTarget, setLinkTarget] = useState<LinkTarget>('links');
  const [qrStyle, setQRStyle] = useState<QRStyle>('standard');
  const [qrColor, setQRColor] = useState<QRColor>('black');
  const [customColor, setCustomColor] = useState('#000000');
  const [includeLogo, setIncludeLogo] = useState<'none' | 'profile' | 'custom'>('none');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getFullUrl = () => {
    const target = LINK_TARGETS.find(t => t.value === linkTarget);
    return `${baseUrl}/${username}${target?.suffix || ''}`;
  };

  const getColor = () => {
    if (qrColor === 'black') return '#000000';
    if (qrColor === 'theme') return '#3B82F6';
    return customColor;
  };

  // Draw QR code on canvas
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    const moduleCount = 21;
    const moduleSize = size / moduleCount;
    const color = getColor();

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Generate QR matrix
    const matrix = generateQRMatrix(getFullUrl(), moduleCount);

    // Draw modules
    ctx.fillStyle = color;
    const radius = qrStyle === 'rounded' ? moduleSize * 0.3 : qrStyle === 'dots' ? moduleSize * 0.4 : 0;

    for (let y = 0; y < moduleCount; y++) {
      for (let x = 0; x < moduleCount; x++) {
        if (matrix[y][x]) {
          const px = x * moduleSize;
          const py = y * moduleSize;

          if (qrStyle === 'dots') {
            ctx.beginPath();
            ctx.arc(px + moduleSize / 2, py + moduleSize / 2, moduleSize * 0.35, 0, Math.PI * 2);
            ctx.fill();
          } else if (qrStyle === 'rounded') {
            ctx.beginPath();
            ctx.roundRect(px + 0.5, py + 0.5, moduleSize - 1, moduleSize - 1, radius);
            ctx.fill();
          } else {
            ctx.fillRect(px, py, moduleSize, moduleSize);
          }
        }
      }
    }

    // Add URL text below
    ctx.fillStyle = '#666666';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    // URL text is handled separately in the UI
  }, [isOpen, linkTarget, qrStyle, qrColor, customColor, username, baseUrl]);

  const downloadQR = (format: 'png' | 'svg') => {
    if (!canvasRef.current) return;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `${username}-qr.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } else {
      // For SVG, create a simple SVG representation
      const matrix = generateQRMatrix(getFullUrl(), 21);
      const color = getColor();
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" width="300" height="300">`;
      svg += `<rect width="21" height="21" fill="white"/>`;

      for (let y = 0; y < 21; y++) {
        for (let x = 0; x < 21; x++) {
          if (matrix[y][x]) {
            svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
          }
        }
      }
      svg += `</svg>`;

      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `${username}-qr.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
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
            className="fixed top-1/2 left-1/2 z-[201] w-[400px] max-h-[90vh] overflow-y-auto"
            style={{
              borderRadius: '16px',
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'blur(60px) saturate(200%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              border: '1px solid var(--border-glass-outer)',
              boxShadow: 'var(--shadow-window)',
            }}
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-light)' }}
            >
              <h2
                className="text-[15px] font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                QR Code
              </h2>
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
            <div className="p-5 space-y-6">
              {/* QR Preview */}
              <div className="flex flex-col items-center">
                <div
                  className="p-4 rounded-xl"
                  style={{ background: '#fafafa' }}
                >
                  <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
                </div>
                <p
                  className="mt-3 text-xs text-center"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {getFullUrl()}
                </p>
              </div>

              {/* Link Target */}
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Link to:
                </label>
                <div className="space-y-1">
                  {LINK_TARGETS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setLinkTarget(value)}
                      className="w-full px-3 py-2 rounded-lg text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                      style={{
                        background: linkTarget === value ? 'var(--accent-primary)' : 'transparent',
                        color: linkTarget === value ? 'var(--bg-elevated)' : 'var(--text-secondary)',
                      }}
                    >
                      <span style={{ opacity: linkTarget === value ? 1 : 0 }}>● </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Style:
                </label>
                <div className="flex gap-2">
                  {(['standard', 'rounded', 'dots'] as QRStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setQRStyle(style)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                      style={{
                        background: qrStyle === style ? 'var(--border-medium)' : 'var(--border-light)',
                        color: qrStyle === style ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Color:
                </label>
                <div className="flex gap-2">
                  {(['black', 'theme', 'custom'] as QRColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => setQRColor(color)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                      style={{
                        background: qrColor === color ? 'var(--border-medium)' : 'var(--border-light)',
                        color: qrColor === color ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {color === 'theme' ? 'Theme' : color}
                    </button>
                  ))}
                </div>
                {qrColor === 'custom' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Use Cases */}
              <div
                className="p-3 rounded-lg text-xs space-y-1"
                style={{
                  background: 'var(--border-light)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Perfect for:</p>
                <p>• Business cards • Conference badges</p>
                <p>• Email signatures • Resume footers</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => downloadQR('png')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                  style={{
                    background: 'var(--border-light)',
                    color: 'var(--text-primary)',
                  }}
                >
                  PNG
                </button>
                <button
                  onClick={() => downloadQR('svg')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                  style={{
                    background: 'var(--border-light)',
                    color: 'var(--text-primary)',
                  }}
                >
                  SVG
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'var(--bg-elevated)',
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
