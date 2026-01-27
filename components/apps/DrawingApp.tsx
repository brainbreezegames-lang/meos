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

interface Shape {
  type: 'rectangle' | 'ellipse' | 'line' | 'arrow';
  start: Point;
  end: Point;
  color: string;
  width: number;
}

type Tool = 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'ellipse' | 'line' | 'arrow';

const COLORS = [
  '#1a1a1a', '#ff3b30', '#ff9500', '#ffcc00', '#34c759',
  '#00c7be', '#007aff', '#5856d6', '#af52de', '#ff2d55',
  '#8e8e93', '#ffffff',
];

const STROKE_WIDTHS = [2, 4, 8, 12, 20];

// Lazy mouse smoothing factor (0-1, higher = more smoothing/lag)
const SMOOTHING = 0.3;

export function DrawingApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1a1a1a');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [undoStack, setUndoStack] = useState<{ strokes: Stroke[]; shapes: Shape[] }[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDark, setIsDark] = useState(false);

  // Lazy mouse position for smooth drawing
  const lazyPoint = useRef<Point>({ x: 0, y: 0 });
  const targetPoint = useRef<Point>({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);

  // Detect dark mode
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

  // Resize canvas
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height - 48),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getCanvasBg = useCallback(() => isDark ? '#1e1e1c' : '#ffffff', [isDark]);

  // Draw a shape on canvas
  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const { start, end, type } = shape;

    if (type === 'rectangle') {
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (type === 'ellipse') {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    } else if (type === 'line') {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    } else if (type === 'arrow') {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      // Arrow head
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = 15;
      ctx.lineTo(
        end.x - headLen * Math.cos(angle - Math.PI / 6),
        end.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLen * Math.cos(angle + Math.PI / 6),
        end.y - headLen * Math.sin(angle + Math.PI / 6)
      );
    }
    ctx.stroke();
  }, []);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = getCanvasBg();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw strokes with smooth curves
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
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      // Catmull-Rom spline for extra smoothness
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const p0 = stroke.points[Math.max(0, i - 1)];
        const p1 = stroke.points[i];
        const p2 = stroke.points[Math.min(stroke.points.length - 1, i + 1)];
        const p3 = stroke.points[Math.min(stroke.points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';

    // Draw shapes
    [...shapes, currentShape].filter(Boolean).forEach((shape) => {
      if (shape) drawShape(ctx, shape);
    });
  }, [strokes, currentStroke, shapes, currentShape, canvasSize, getCanvasBg, isDark, drawShape]);

  const getPointerPosition = useCallback((e: React.PointerEvent | PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // Lazy mouse animation loop
  const updateLazyMouse = useCallback(() => {
    if (!isDrawing || !currentStroke) return;

    const dx = targetPoint.current.x - lazyPoint.current.x;
    const dy = targetPoint.current.y - lazyPoint.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only add point if moved enough (reduces jitter)
    if (dist > 2) {
      lazyPoint.current.x += dx * (1 - SMOOTHING);
      lazyPoint.current.y += dy * (1 - SMOOTHING);

      setCurrentStroke((prev) => {
        if (!prev) return null;
        return { ...prev, points: [...prev.points, { ...lazyPoint.current }] };
      });
    }

    animationFrame.current = requestAnimationFrame(updateLazyMouse);
  }, [isDrawing, currentStroke]);

  const isShapeTool = (t: Tool) => ['rectangle', 'ellipse', 'line', 'arrow'].includes(t);

  const startDrawing = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const point = getPointerPosition(e);

    if (isShapeTool(tool)) {
      setIsDrawing(true);
      setCurrentShape({
        type: tool as Shape['type'],
        start: point,
        end: point,
        color,
        width: strokeWidth,
      });
    } else {
      lazyPoint.current = point;
      targetPoint.current = point;
      setIsDrawing(true);
      setCurrentStroke({
        points: [point],
        color: tool === 'eraser' ? '#ffffff' : color,
        width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
        tool: tool as Stroke['tool'],
      });
      animationFrame.current = requestAnimationFrame(updateLazyMouse);
    }
  }, [tool, color, strokeWidth, getPointerPosition, updateLazyMouse]);

  const draw = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isDrawing) return;

    const point = getPointerPosition(e);

    if (isShapeTool(tool) && currentShape) {
      setCurrentShape({ ...currentShape, end: point });
    } else {
      targetPoint.current = point;
    }
  }, [isDrawing, tool, currentShape, getPointerPosition]);

  const stopDrawing = useCallback((e?: React.PointerEvent) => {
    e?.stopPropagation();
    if (!isDrawing) return;

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    setIsDrawing(false);

    if (isShapeTool(tool) && currentShape) {
      setUndoStack((prev) => [...prev, { strokes, shapes }]);
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
    } else if (currentStroke && currentStroke.points.length > 1) {
      setUndoStack((prev) => [...prev, { strokes, shapes }]);
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke(null);
    } else {
      setCurrentStroke(null);
    }
  }, [isDrawing, tool, currentShape, currentStroke, strokes, shapes]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setStrokes(prev.strokes);
    setShapes(prev.shapes);
  }, [undoStack]);

  const clearCanvas = useCallback(() => {
    if (strokes.length === 0 && shapes.length === 0) return;
    setUndoStack((prev) => [...prev, { strokes, shapes }]);
    setStrokes([]);
    setShapes([]);
  }, [strokes, shapes]);

  const exportCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const ToolBtn = ({ t, icon, label }: { t: Tool; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setTool(t)}
      title={label}
      style={{
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, border: 'none',
        background: tool === t ? 'var(--color-accent-primary)' : 'transparent',
        color: tool === t ? '#fff' : 'var(--text-secondary)',
        cursor: 'pointer', transition: '0.15s ease',
      }}
    >{icon}</button>
  );

  const ActionBtn = ({ onClick, disabled, icon, label }: { onClick: () => void; disabled: boolean; icon: React.ReactNode; label: string }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, border: 'none', background: 'transparent',
        color: 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: '0.15s ease',
      }}
    >{icon}</button>
  );

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-base)', overflow: 'hidden' }}>
      {/* Compact toolbar */}
      <div style={{
        height: 48, padding: '0 12px',
        display: 'flex', alignItems: 'center', gap: 6,
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-base)',
      }}>
        {/* Drawing tools */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg-subtle)', borderRadius: 8, padding: 4 }}>
          <ToolBtn t="pen" label="Pen" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>} />
          <ToolBtn t="highlighter" label="Highlighter" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l-6 6v3h9l3-3"/><path d="M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>} />
          <ToolBtn t="eraser" label="Eraser" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 21h10"/><path d="M5.5 13.5L17 2l5 5-11.5 11.5a2.121 2.121 0 0 1-3 0l-2-2a2.121 2.121 0 0 1 0-3z"/></svg>} />
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--color-border-subtle)' }} />

        {/* Shape tools */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg-subtle)', borderRadius: 8, padding: 4 }}>
          <ToolBtn t="line" label="Line" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5"/></svg>} />
          <ToolBtn t="arrow" label="Arrow" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/></svg>} />
          <ToolBtn t="rectangle" label="Rectangle" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>} />
          <ToolBtn t="ellipse" label="Ellipse" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="10" ry="7"/></svg>} />
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--color-border-subtle)' }} />

        {/* Color */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowStrokePicker(false); }}
            style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'var(--color-bg-subtle)', cursor: 'pointer', padding: 6 }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: 4, background: color, border: '1px solid var(--color-border-default)' }} />
          </button>
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, padding: 8, background: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-lg)', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, zIndex: 100 }}
              >
                {COLORS.map((c) => (
                  <button key={c} onClick={() => { setColor(c); setShowColorPicker(false); }}
                    style={{ width: 24, height: 24, borderRadius: 4, background: c, border: color === c ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)', cursor: 'pointer' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stroke width */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowStrokePicker(!showStrokePicker); setShowColorPicker(false); }}
            style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'var(--color-bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ width: Math.min(strokeWidth * 1.5, 16), height: Math.min(strokeWidth * 1.5, 16), borderRadius: '50%', background: 'var(--text-primary)' }} />
          </button>
          <AnimatePresence>
            {showStrokePicker && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, padding: 6, background: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 2, zIndex: 100 }}
              >
                {STROKE_WIDTHS.map((w) => (
                  <button key={w} onClick={() => { setStrokeWidth(w); setShowStrokePicker(false); }}
                    style={{ width: 60, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: strokeWidth === w ? 'var(--color-accent-primary-subtle)' : 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <div style={{ width: 32, height: w, borderRadius: w / 2, background: 'var(--text-primary)' }} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--color-border-subtle)' }} />

        {/* Actions */}
        <ActionBtn onClick={undo} disabled={undoStack.length === 0} label="Undo"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>}
        />
        <ActionBtn onClick={clearCanvas} disabled={strokes.length === 0 && shapes.length === 0} label="Clear"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>}
        />

        <div style={{ flex: 1 }} />

        {/* Export */}
        <button onClick={exportCanvas} style={{
          height: 28, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5,
          borderRadius: 6, border: 'none',
          background: 'var(--color-accent-primary)', color: '#fff',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>

      {/* Canvas area - only this blocks pointer events for window drag */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        onPointerDownCapture={(e) => {
          // Only stop propagation if clicking on canvas (not dropdowns)
          if ((e.target as HTMLElement).tagName === 'CANVAS') {
            e.stopPropagation();
          }
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          style={{
            cursor: isShapeTool(tool) ? 'crosshair' :
                   tool === 'eraser' ? 'cell' : 'crosshair',
            touchAction: 'none',
          }}
        />

        {strokes.length === 0 && shapes.length === 0 && !isDrawing && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0.4 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/>
            </svg>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-tertiary)' }}>Draw something</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrawingApp;
