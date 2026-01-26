'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ASCIIFilterProps {
  imageUrl: string;
  columns?: number;
  rows?: number;
  colorMode?: 'mono' | 'grey' | 'color';
  charset?: string;
  fontSize?: number;
  fontFamily?: string;
  backgroundColor?: string;
  monoColor?: string;
  className?: string;
}

// Character sets ordered by visual density (dark to light)
const CHARSETS = {
  standard: '@%#*+=-:. ',
  detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  blocks: '█▓▒░ ',
  minimal: '@#=-. ',
};

export function ASCIIFilter({
  imageUrl,
  columns = 120,
  rows = 60,
  colorMode = 'mono',
  charset = CHARSETS.standard,
  fontSize = 10,
  fontFamily = 'monospace',
  backgroundColor = '#171412',
  monoColor = '#e8e4dc',
  className = '',
}: ASCIIFilterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ascii, setAscii] = useState<{ char: string; color: string }[][]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Convert image to ASCII
  const convertToASCII = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size to match grid
    canvas.width = columns;
    canvas.height = rows;

    // Draw image scaled to canvas
    ctx.drawImage(img, 0, 0, columns, rows);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, columns, rows);
    const pixels = imageData.data;

    // Convert each pixel to ASCII character
    const result: { char: string; color: string }[][] = [];

    for (let y = 0; y < rows; y++) {
      const row: { char: string; color: string }[] = [];
      for (let x = 0; x < columns; x++) {
        const idx = (y * columns + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        // Calculate brightness (0-255)
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

        // Map brightness to character
        const charIndex = Math.floor((brightness / 255) * (charset.length - 1));
        const char = charset[charIndex] || ' ';

        // Determine color based on mode
        let color: string;
        if (colorMode === 'mono') {
          color = monoColor;
        } else if (colorMode === 'grey') {
          // 4-level greyscale
          const greyLevel = Math.floor(brightness / 64) * 64 + 32;
          color = `rgb(${greyLevel}, ${greyLevel}, ${greyLevel})`;
        } else {
          // Full color
          color = `rgb(${r}, ${g}, ${b})`;
        }

        row.push({ char, color });
      }
      result.push(row);
    }

    setAscii(result);
  }, [columns, rows, charset, colorMode, monoColor]);

  // Load and process image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => convertToASCII(img);
    img.src = imageUrl;
  }, [imageUrl, convertToASCII]);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Calculate font size to fit container
  const calculatedFontSize = dimensions.width > 0
    ? Math.min(
        fontSize,
        dimensions.width / columns * 1.8,
        dimensions.height / rows * 1.2
      )
    : fontSize;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ASCII output */}
      <pre
        style={{
          margin: 0,
          padding: 0,
          fontFamily,
          fontSize: calculatedFontSize,
          lineHeight: 1,
          letterSpacing: '0.05em',
          whiteSpace: 'pre',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {ascii.map((row, y) => (
          <div key={y} style={{ display: 'flex', justifyContent: 'center' }}>
            {row.map((cell, x) => (
              <span
                key={x}
                style={{
                  color: cell.color,
                  display: 'inline-block',
                  width: `${calculatedFontSize * 0.6}px`,
                  textAlign: 'center',
                }}
              >
                {cell.char}
              </span>
            ))}
          </div>
        ))}
      </pre>
    </div>
  );
}

export default ASCIIFilter;
