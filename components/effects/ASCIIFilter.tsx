'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ASCIIFilterProps {
  imageUrl: string;
  columns?: number;
  colorMode?: 'mono' | 'grey' | 'color';
  charset?: string;
  fontSize?: number;
  fontFamily?: string;
  monoColor?: string;
  className?: string;
  contrast?: number;
  brightness?: number;
}

// Character sets ordered by visual density (light to dark)
// This order is important - spaces are brightest, @ is darkest
const CHARSETS = {
  standard: ' .:-=+*#%@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  minimal: ' .-+*#@',
  dots: ' ·•●',
};

export function ASCIIFilter({
  imageUrl,
  columns = 100,
  colorMode = 'mono',
  charset = CHARSETS.standard,
  fontSize = 10,
  fontFamily = '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
  monoColor = 'rgba(255, 255, 255, 0.85)',
  className = '',
  contrast = 1.2,
  brightness = 1.0,
}: ASCIIFilterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [asciiOutput, setAsciiOutput] = useState<string>('');
  const [colorData, setColorData] = useState<string[][]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [calculatedRows, setCalculatedRows] = useState(0);

  // Calculate rows based on aspect ratio and font metrics
  // Monospace chars are typically ~0.5 width/height ratio
  const fontAspectRatio = 0.55;

  // Convert image to ASCII
  const convertToASCII = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Calculate rows to maintain image aspect ratio
    const imgAspect = img.width / img.height;
    const rows = Math.round(columns / imgAspect / fontAspectRatio);
    setCalculatedRows(rows);

    // Set canvas size to match grid
    canvas.width = columns;
    canvas.height = rows;

    // Draw image scaled to canvas
    ctx.drawImage(img, 0, 0, columns, rows);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, columns, rows);
    const pixels = imageData.data;

    // Build ASCII output
    let ascii = '';
    const colors: string[][] = [];

    for (let y = 0; y < rows; y++) {
      let row = '';
      const rowColors: string[] = [];

      for (let x = 0; x < columns; x++) {
        const idx = (y * columns + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];

        // Skip fully transparent pixels
        if (a < 10) {
          row += ' ';
          rowColors.push('transparent');
          continue;
        }

        // Calculate perceived brightness using luminance formula
        // Human eyes are most sensitive to green, then red, then blue
        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Apply brightness and contrast adjustments
        luminance = ((luminance - 0.5) * contrast + 0.5) * brightness;
        luminance = Math.max(0, Math.min(1, luminance));

        // Map brightness to character - invert so bright areas get light chars (spaces)
        // and dark areas get dense chars (@, #, etc)
        const charIndex = Math.floor((1 - luminance) * (charset.length - 1));
        const char = charset[charIndex] || ' ';

        row += char;

        // Store color for colored mode
        if (colorMode === 'color') {
          rowColors.push(`rgb(${r}, ${g}, ${b})`);
        } else if (colorMode === 'grey') {
          // 8-level greyscale
          const greyLevel = Math.round(luminance * 7) * 32 + 31;
          rowColors.push(`rgb(${greyLevel}, ${greyLevel}, ${greyLevel})`);
        } else {
          rowColors.push(monoColor);
        }
      }

      ascii += row + '\n';
      colors.push(rowColors);
    }

    setAsciiOutput(ascii);
    setColorData(colors);
  }, [columns, charset, colorMode, monoColor, contrast, brightness, fontAspectRatio]);

  // Load and process image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    // Only use crossOrigin for external URLs
    if (imageUrl.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => convertToASCII(img);
    img.onerror = () => {
      console.error('ASCIIFilter: Failed to load image', imageUrl);
    };
    img.src = imageUrl;
  }, [imageUrl, convertToASCII]);

  // Handle container resize
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

  // Calculate font size to fit container while maintaining aspect
  const calculatedFontSize = dimensions.width > 0 && columns > 0
    ? Math.min(
        fontSize * 2,
        (dimensions.width / columns) / fontAspectRatio * 0.95
      )
    : fontSize;

  const lineHeight = 1.0;
  const letterSpacing = 0;

  // For mono/grey mode, render as single pre element (much faster)
  if (colorMode === 'mono' || colorMode === 'grey') {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          zIndex: 2,
        }}
      >
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* ASCII output - monochrome */}
        <pre
          style={{
            margin: 0,
            padding: 0,
            fontFamily,
            fontSize: calculatedFontSize,
            lineHeight,
            letterSpacing,
            whiteSpace: 'pre',
            color: colorMode === 'grey' ? 'rgba(180, 180, 180, 0.9)' : monoColor,
            textAlign: 'center',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {asciiOutput}
        </pre>
      </div>
    );
  }

  // For color mode, render each character with its color
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        zIndex: 2,
      }}
    >
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ASCII output - colored */}
      <div
        style={{
          fontFamily,
          fontSize: calculatedFontSize,
          lineHeight,
          letterSpacing,
          whiteSpace: 'pre',
          textAlign: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {colorData.map((row, y) => (
          <div key={y} style={{ display: 'flex', justifyContent: 'center' }}>
            {row.map((color, x) => {
              const char = asciiOutput.split('\n')[y]?.[x] || ' ';
              return (
                <span
                  key={x}
                  style={{
                    color,
                    width: `${calculatedFontSize * fontAspectRatio}px`,
                    display: 'inline-block',
                    textAlign: 'center',
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ASCIIFilter;
