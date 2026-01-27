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

// Braun-inspired theme
const THEMES = {
  light: {
    toolbarBg: 'linear-gradient(180deg, #ffffff 0%, #f8f8f6 100%)',
    toolbarShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.04)',
    toolbarBorder: 'rgba(0,0,0,0.06)',
    canvasBg: '#ffffff',
    buttonBg: 'linear-gradient(180deg, #ffffff 0%, #f5f5f3 100%)',
    buttonActiveBg: 'linear-gradient(180deg, #f0f0ee 0%, #e8e8e6 100%)',
    buttonShadow: '0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
    buttonActiveShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
    divider: 'rgba(0,0,0,0.08)',
    accent: '#ff6b00',
  },
  dark: {
    toolbarBg: 'linear-gradient(180deg, #2a2a28 0%, #1e1e1c 100%)',
    toolbarShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.04)',
    toolbarBorder: 'rgba(255,255,255,0.06)',
    canvasBg: '#1a1a18',
    buttonBg: 'linear-gradient(180deg, #3a3a38 0%, #2e2e2c 100%)',
    buttonActiveBg: 'linear-gradient(180deg, #4a4a48 0%, #3e3e3c 100%)',
    buttonShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
    buttonActiveShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
    textPrimary: '#f0f0ec',
    textSecondary: '#a0a09c',
    textMuted: '#707068',
    divider: 'rgba(255,255,255,0.08)',
    accent: '#ff7722',
  },
};

interface DrawingAppProps {
  isDark?: boolean;
}

export function DrawingApp({ isDark = false }: DrawingAppProps) {
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

  const theme = isDark ? THEMES.dark : THEMES.light;

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

  // Redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = theme.canvasBg;
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
  }, [strokes, currentStroke, canvasSize, theme.canvasBg]);

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

  const stopDrawing = useCallback(() => {
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
    isColorButton = false,
  }: {
    toolName?: Tool;
    icon: React.ReactNode;
    label: string;
    isColorButton?: boolean;
  }) => {
    const isActive = toolName ? tool === toolName : false;

    return (
      <button
        onClick={() => toolName && setTool(toolName)}
        title={label}
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          border: 'none',
          background: isActive ? theme.buttonActiveBg : theme.buttonBg,
          boxShadow: isActive ? theme.buttonActiveShadow : theme.buttonShadow,
          cursor: 'pointer',
          color: isActive ? theme.accent : theme.textSecondary,
          transition: 'all 0.15s ease',
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
        background: theme.canvasBg,
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          height: 56,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: theme.toolbarBg,
          borderBottom: `1px solid ${theme.toolbarBorder}`,
          boxShadow: theme.toolbarShadow,
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
        <div style={{ width: 1, height: 24, background: theme.divider }} />

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
              borderRadius: 8,
              border: 'none',
              background: theme.buttonBg,
              boxShadow: theme.buttonShadow,
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
                border: `2px solid ${theme.divider}`,
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
                  padding: 8,
                  background: theme.toolbarBg,
                  borderRadius: 12,
                  border: `1px solid ${theme.toolbarBorder}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 4,
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
                      borderRadius: 6,
                      background: c,
                      border: color === c ? `2px solid ${theme.accent}` : `1px solid ${theme.divider}`,
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
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
              borderRadius: 8,
              border: 'none',
              background: theme.buttonBg,
              boxShadow: theme.buttonShadow,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: Math.min(strokeWidth * 2, 20),
                height: Math.min(strokeWidth * 2, 20),
                borderRadius: '50%',
                background: theme.textPrimary,
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
                  padding: 8,
                  background: theme.toolbarBg,
                  borderRadius: 12,
                  border: `1px solid ${theme.toolbarBorder}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
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
                      borderRadius: 6,
                      background: strokeWidth === w ? theme.buttonActiveBg : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: w,
                        borderRadius: w / 2,
                        background: theme.textPrimary,
                      }}
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: theme.divider }} />

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
            borderRadius: 8,
            border: 'none',
            background: theme.buttonBg,
            boxShadow: theme.buttonShadow,
            cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
            opacity: undoStack.length === 0 ? 0.4 : 1,
            color: theme.textSecondary,
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
            borderRadius: 8,
            border: 'none',
            background: theme.buttonBg,
            boxShadow: theme.buttonShadow,
            cursor: strokes.length === 0 ? 'not-allowed' : 'pointer',
            opacity: strokes.length === 0 ? 0.4 : 1,
            color: theme.textSecondary,
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
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 8,
            border: 'none',
            background: `linear-gradient(145deg, ${theme.accent}, ${isDark ? '#e5691e' : '#e55500'})`,
            boxShadow: `0 2px 8px ${theme.accent}40`,
            cursor: 'pointer',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 600,
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

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="2"/>
            </svg>
            <p style={{ marginTop: 12, fontSize: 13, color: theme.textMuted }}>
              Click and drag to start drawing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrawingApp;
