'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Point { x: number; y: number; }

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

const COLORS = ['#1a1a1a', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#007aff', '#5856d6', '#af52de', '#ff2d55', '#8e8e93', '#ffffff'];
const STROKE_WIDTHS = [2, 4, 8, 12, 20];

export function DrawingApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1a1a1a');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<{ strokes: Stroke[]; shapes: Shape[] }[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const shapeStartRef = useRef<Point | null>(null);
  const shapeEndRef = useRef<Point | null>(null);

  const isShapeTool = (t: Tool) => t === 'rectangle' || t === 'ellipse' || t === 'line' || t === 'arrow';

  // Dark mode detection
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redraw();
    };

    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Redraw whenever state changes
  useEffect(() => {
    redraw();
  }, [strokes, shapes, isDark]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = isDark ? '#1e1e1c' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw saved strokes
    strokes.forEach(s => {
      if (!s || !s.points || s.points.length < 1) return;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (s.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = s.width;
      } else if (s.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = s.color + '60';
        ctx.lineWidth = s.width * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
      }

      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    });

    // Draw current stroke in progress
    if (currentStrokeRef.current.length > 0 && !isShapeTool(tool)) {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = strokeWidth * 3;
      } else if (tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color + '60';
        ctx.lineWidth = strokeWidth * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
      }

      const pts = currentStrokeRef.current;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }

    // Draw saved shapes
    shapes.forEach(sh => drawShapeOnCanvas(ctx, sh));

    // Draw current shape in progress
    if (shapeStartRef.current && shapeEndRef.current && isShapeTool(tool)) {
      drawShapeOnCanvas(ctx, {
        type: tool as Shape['type'],
        start: shapeStartRef.current,
        end: shapeEndRef.current,
        color,
        width: strokeWidth,
      });
    }
  }, [strokes, shapes, isDark, tool, color, strokeWidth]);

  const drawShapeOnCanvas = (ctx: CanvasRenderingContext2D, sh: Shape) => {
    if (!sh || !sh.start || !sh.end) return;
    ctx.beginPath();
    ctx.strokeStyle = sh.color;
    ctx.lineWidth = sh.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const { start, end, type } = sh;

    if (type === 'rectangle') {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (type === 'ellipse') {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      if (rx > 0 && ry > 0) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (type === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (type === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      // Arrow head
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = 15;
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
  };

  const getPos = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);

    if (isShapeTool(tool)) {
      shapeStartRef.current = pos;
      shapeEndRef.current = pos;
    } else {
      currentStrokeRef.current = [pos];
    }
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    const pos = getPos(e);

    if (isShapeTool(tool)) {
      shapeEndRef.current = pos;
    } else {
      currentStrokeRef.current.push(pos);
    }
    redraw();
  };

  const onPointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (isShapeTool(tool) && shapeStartRef.current && shapeEndRef.current) {
      const newShape: Shape = {
        type: tool as Shape['type'],
        start: { ...shapeStartRef.current },
        end: { ...shapeEndRef.current },
        color,
        width: strokeWidth,
      };
      setHistory(h => [...h, { strokes, shapes }]);
      setShapes(s => [...s, newShape]);
      shapeStartRef.current = null;
      shapeEndRef.current = null;
    } else if (currentStrokeRef.current.length > 0) {
      const newStroke: Stroke = {
        points: [...currentStrokeRef.current],
        color: tool === 'eraser' ? '#000000' : color,
        width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
        tool: tool as Stroke['tool'],
      };
      setHistory(h => [...h, { strokes, shapes }]);
      setStrokes(s => [...s, newStroke]);
      currentStrokeRef.current = [];
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setStrokes(prev.strokes);
    setShapes(prev.shapes);
  };

  const clear = () => {
    if (strokes.length === 0 && shapes.length === 0) return;
    setHistory(h => [...h, { strokes, shapes }]);
    setStrokes([]);
    setShapes([]);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const ToolBtn = ({ t, label, children }: { t: Tool; label: string; children: React.ReactNode }) => (
    <button
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTool(t); setShowColorPicker(false); setShowStrokePicker(false); }}
      onPointerDown={(e) => e.stopPropagation()}
      title={label}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, border: 'none',
        background: tool === t ? 'var(--color-accent-primary)' : 'transparent',
        color: tool === t ? '#fff' : 'var(--text-secondary)',
        cursor: 'pointer',
      }}
    >{children}</button>
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-base)' }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
        {/* Drawing tools */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg-subtle)', borderRadius: 8, padding: 4 }}>
          <ToolBtn t="pen" label="Pen"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg></ToolBtn>
          <ToolBtn t="highlighter" label="Highlighter"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l-6 6v3h9l3-3"/><path d="M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg></ToolBtn>
          <ToolBtn t="eraser" label="Eraser"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 21h10"/><path d="M5.5 13.5L17 2l5 5-11.5 11.5a2.121 2.121 0 0 1-3 0l-2-2a2.121 2.121 0 0 1 0-3z"/></svg></ToolBtn>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--color-border-subtle)' }} />

        {/* Shape tools */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg-subtle)', borderRadius: 8, padding: 4 }}>
          <ToolBtn t="line" label="Line"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5"/></svg></ToolBtn>
          <ToolBtn t="arrow" label="Arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/></svg></ToolBtn>
          <ToolBtn t="rectangle" label="Rectangle"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></ToolBtn>
          <ToolBtn t="ellipse" label="Ellipse"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="10" ry="7"/></svg></ToolBtn>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--color-border-subtle)' }} />

        {/* Color */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); setShowStrokePicker(false); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'var(--color-bg-subtle)', cursor: 'pointer', padding: 6 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 4, background: color, border: '1px solid var(--color-border-default)' }} />
          </button>
          <AnimatePresence>
            {showColorPicker && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, padding: 8, background: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-lg)', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, zIndex: 100 }}>
                {COLORS.map((c) => (
                  <button key={c} onClick={(e) => { e.stopPropagation(); setColor(c); setShowColorPicker(false); }}
                    style={{ width: 24, height: 24, borderRadius: 4, background: c, border: color === c ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)', cursor: 'pointer' }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stroke width */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowStrokePicker(!showStrokePicker); setShowColorPicker(false); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'var(--color-bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: Math.min(strokeWidth * 1.5, 16), height: Math.min(strokeWidth * 1.5, 16), borderRadius: '50%', background: 'var(--text-primary)' }} />
          </button>
          <AnimatePresence>
            {showStrokePicker && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, padding: 6, background: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 2, zIndex: 100 }}>
                {STROKE_WIDTHS.map((w) => (
                  <button key={w} onClick={(e) => { e.stopPropagation(); setStrokeWidth(w); setShowStrokePicker(false); }}
                    style={{ width: 60, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: strokeWidth === w ? 'var(--color-accent-primary-subtle)' : 'transparent', border: 'none', cursor: 'pointer' }}>
                    <div style={{ width: 32, height: w, borderRadius: w / 2, background: 'var(--text-primary)' }} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--color-border-subtle)' }} />

        {/* Actions */}
        <button onClick={(e) => { e.stopPropagation(); undo(); }} disabled={history.length === 0} title="Undo"
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: history.length === 0 ? 'not-allowed' : 'pointer', opacity: history.length === 0 ? 0.4 : 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); clear(); }} disabled={strokes.length === 0 && shapes.length === 0} title="Clear"
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: (strokes.length === 0 && shapes.length === 0) ? 'not-allowed' : 'pointer', opacity: (strokes.length === 0 && shapes.length === 0) ? 0.4 : 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={(e) => { e.stopPropagation(); exportPng(); }} style={{ height: 28, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6, border: 'none', background: 'var(--color-accent-primary)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{ display: 'block', cursor: 'crosshair', touchAction: 'none' }}
        />
      </div>
    </div>
  );
}

export default DrawingApp;
