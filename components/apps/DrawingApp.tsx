'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser' | 'highlighter';
}

type Tool = 'select' | 'pan' | 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'text';

const COLORS = [
  '#1a1a1a', '#ff3b30', '#ff9500', '#ffcc00', '#34c759',
  '#00c7be', '#007aff', '#5856d6', '#af52de', '#ff2d55',
  '#8e8e93', '#ffffff',
];

const STROKE_WIDTHS = [2, 4, 8, 12, 20];

export function DrawingApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1a1a1a');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode from document.documentElement
  useEffect(() => {
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Resize canvas to fit container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height - 56), // Subtract toolbar height
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Get canvas background color from CSS variable
  const getCanvasBg = useCallback(() => {
    return isDark ? '#1e1e1c' : '#ffffff';
  }, [isDark]);

  // Redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with theme-appropriate background
    ctx.fillStyle = getCanvasBg();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    [...strokes, currentStroke].filter(Boolean).forEach((stroke) => {
      if (!stroke || stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = stroke.color + '80';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }

      ctx.lineWidth = stroke.width;

      // Smooth curve through points
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }

      // Last point
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [strokes, currentStroke, canvasSize, getCanvasBg, isDark]);

  const getPointerPosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (tool === 'select' || tool === 'pan' || tool === 'text') return;

    const point = getPointerPosition(e);
    setIsDrawing(true);
    setCurrentStroke({
      points: [point],
      color: tool === 'eraser' ? '#ffffff' : color,
      width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
      tool: tool === 'highlighter' ? 'highlighter' : tool === 'eraser' ? 'eraser' : 'pen',
    });
  }, [tool, color, strokeWidth, getPointerPosition]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isDrawing || !currentStroke) return;

    const point = getPointerPosition(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  }, [isDrawing, currentStroke, getPointerPosition]);

  const stopDrawing = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    if (currentStroke.points.length > 1) {
      setUndoStack((prev) => [...prev, strokes]);
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  }, [isDrawing, currentStroke, strokes]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousStrokes = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setStrokes(previousStrokes);
  }, [undoStack]);

  const clearCanvas = useCallback(() => {
    setUndoStack((prev) => [...prev, strokes]);
    setStrokes([]);
  }, [strokes]);

  const exportCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const ToolButton = ({
    toolName,
    icon,
    label,
  }: {
    toolName?: Tool;
    icon: React.ReactNode;
    label: string;
  }) => {
    const isActive = toolName ? tool === toolName : false;

    return (
      <button
        onClick={() => toolName && setTool(toolName)}
        title={label}
        className="drawing-tool-button"
        data-active={isActive}
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: isActive ? 'var(--dock-icon-pressed-bg)' : 'var(--dock-icon-bg)',
          boxShadow: isActive ? 'var(--dock-icon-pressed-shadow)' : 'var(--dock-icon-shadow)',
          cursor: 'pointer',
          color: isActive ? 'var(--color-accent-primary)' : 'var(--text-secondary)',
          transition: 'var(--transition-fast)',
        }}
      >
        {icon}
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar - Braun-inspired physical styling */}
      <div
        style={{
          height: 56,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--dock-physical-bg)',
          borderBottom: 'var(--dock-physical-border)',
          boxShadow: 'var(--dock-physical-shadow)',
        }}
      >
        {/* Drawing Tools */}
        <div style={{ display: 'flex', gap: 4 }}>
          <ToolButton
            toolName="pen"
            label="Pen (P)"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
            }
          />
          <ToolButton
            toolName="highlighter"
            label="Highlighter (H)"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l-6 6v3h9l3-3"/>
                <path d="M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
              </svg>
            }
          />
          <ToolButton
            toolName="eraser"
            label="Eraser (E)"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 21h10"/>
                <path d="M5.5 13.5L17 2l5 5-11.5 11.5a2.121 2.121 0 0 1-3 0l-2-2a2.121 2.121 0 0 1 0-3z"/>
              </svg>
            }
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--color-border-default)' }} />

        {/* Color Picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--dock-icon-bg)',
              boxShadow: 'var(--dock-icon-shadow)',
              cursor: 'pointer',
              padding: 6,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 4,
                background: color,
                border: '2px solid var(--color-border-default)',
              }}
            />
          </button>
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 8,
                  padding: 10,
                  background: 'var(--dock-physical-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 6,
                  zIndex: 100,
                }}
              >
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-sm)',
                      background: c,
                      border: color === c ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stroke Width */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowStrokePicker(!showStrokePicker)}
            title="Stroke Width"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--dock-icon-bg)',
              boxShadow: 'var(--dock-icon-shadow)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: Math.min(strokeWidth * 2, 20),
                height: Math.min(strokeWidth * 2, 20),
                borderRadius: '50%',
                background: 'var(--text-primary)',
              }}
            />
          </button>
          <AnimatePresence>
            {showStrokePicker && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 8,
                  padding: 10,
                  background: 'var(--dock-physical-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  zIndex: 100,
                }}
              >
                {STROKE_WIDTHS.map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setStrokeWidth(w);
                      setShowStrokePicker(false);
                    }}
                    style={{
                      width: 80,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)',
                      background: strokeWidth === w ? 'var(--dock-icon-pressed-bg)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: w,
                        borderRadius: w / 2,
                        background: 'var(--text-primary)',
                      }}
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--color-border-default)' }} />

        {/* Actions */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo (Cmd+Z)"
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--dock-icon-bg)',
            boxShadow: 'var(--dock-icon-shadow)',
            cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
            opacity: undoStack.length === 0 ? 0.4 : 1,
            color: 'var(--text-secondary)',
            transition: 'var(--transition-fast)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6"/>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
          </svg>
        </button>

        <button
          onClick={clearCanvas}
          disabled={strokes.length === 0}
          title="Clear Canvas"
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--dock-icon-bg)',
            boxShadow: 'var(--dock-icon-shadow)',
            cursor: strokes.length === 0 ? 'not-allowed' : 'pointer',
            opacity: strokes.length === 0 ? 0.4 : 1,
            color: 'var(--text-secondary)',
            transition: 'var(--transition-fast)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Export */}
        <button
          onClick={exportCanvas}
          title="Export as PNG"
          style={{
            height: 32,
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'linear-gradient(145deg, var(--color-accent-primary), var(--accent-dark))',
            boxShadow: '0 2px 8px rgba(255, 119, 34, 0.35)',
            cursor: 'pointer',
            color: 'var(--text-inverse)',
            fontSize: 12,
            fontWeight: 600,
            transition: 'var(--transition-fast)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>

      {/* Canvas - stopPropagation on pointer events to prevent window drag */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onPointerDown={(e) => {
            e.stopPropagation();
            startDrawing(e as unknown as React.MouseEvent);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            draw(e as unknown as React.MouseEvent);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            stopDrawing(e as unknown as React.MouseEvent);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            stopDrawing(e as unknown as React.MouseEvent);
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            cursor: tool === 'pen' || tool === 'highlighter' ? 'crosshair' :
                   tool === 'eraser' ? 'cell' : 'default',
            touchAction: 'none',
          }}
        />

        {/* Empty state hint */}
        {strokes.length === 0 && !isDrawing && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              opacity: 0.4,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="2"/>
            </svg>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-tertiary)' }}>
              Click and drag to start drawing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrawingApp;
