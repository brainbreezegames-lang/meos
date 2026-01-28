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
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

export function DrawingApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing state
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1a1a1a');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [undoStack, setUndoStack] = useState<{ strokes: Stroke[]; shapes: Shape[] }[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDark, setIsDark] = useState(false);

  // Infinite canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Drawing refs (avoid stale closure issues)
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const currentShapeRef = useRef<Shape | null>(null);
  const lastPointRef = useRef<Point>({ x: 0, y: 0 });

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
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
        setCanvasSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  }, [zoom, pan]);

  // Draw everything
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with background
    ctx.fillStyle = isDark ? '#1e1e1c' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid for infinite canvas feel
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Grid
    const gridSize = 50;
    const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize - gridSize;
    const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize - gridSize;
    const endX = startX + (canvas.width / zoom) + gridSize * 2;
    const endY = startY + (canvas.height / zoom) + gridSize * 2;

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (let x = startX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Draw strokes - filter out any invalid entries
    const validStrokes = strokes.filter((s): s is Stroke =>
      s != null && typeof s === 'object' && Array.isArray(s.points)
    );

    const currentStroke = currentStrokeRef.current;
    const allStrokes = (currentStroke && Array.isArray(currentStroke.points))
      ? [...validStrokes, currentStroke]
      : validStrokes;

    for (let i = 0; i < allStrokes.length; i++) {
      const stroke = allStrokes[i];
      if (!stroke || !stroke.points || stroke.points.length < 2) continue;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.width;

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color + '60';
        ctx.lineWidth = stroke.width * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      // Smooth curve with quadratic bezier
      for (let j = 1; j < stroke.points.length - 1; j++) {
        const xc = (stroke.points[j].x + stroke.points[j + 1].x) / 2;
        const yc = (stroke.points[j].y + stroke.points[j + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[j].x, stroke.points[j].y, xc, yc);
      }

      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';

    // Draw shapes - filter out any invalid entries
    const validShapes = shapes.filter((s): s is Shape => s != null && typeof s === 'object');

    const currentShape = currentShapeRef.current;
    const allShapes = currentShape
      ? [...validShapes, currentShape]
      : validShapes;

    for (let i = 0; i < allShapes.length; i++) {
      const shape = allShapes[i];
      if (!shape || !shape.start || !shape.end) continue;

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
        if (rx > 0 && ry > 0) ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      } else if (type === 'line') {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
      } else if (type === 'arrow') {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLen = 15;
        ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [strokes, shapes, zoom, pan, isDark]);

  // Redraw on state change
  useEffect(() => {
    redraw();
  }, [redraw, canvasSize]);

  const isShapeTool = (t: Tool) => ['rectangle', 'ellipse', 'line', 'arrow'].includes(t);

  const getPointerPos = useCallback((e: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    return screenToWorld(screenX, screenY);
  }, [screenToWorld]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Middle mouse or space+click for panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      canvas.style.cursor = 'grabbing';
      return;
    }

    const point = getPointerPos(e);
    isDrawingRef.current = true;
    lastPointRef.current = point;

    if (isShapeTool(tool)) {
      currentShapeRef.current = {
        type: tool as Shape['type'],
        start: point,
        end: point,
        color,
        width: strokeWidth,
      };
    } else {
      currentStrokeRef.current = {
        points: [point],
        color: tool === 'eraser' ? '#ffffff' : color,
        width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
        tool: tool as Stroke['tool'],
      };
    }
    redraw();
  }, [tool, color, strokeWidth, getPointerPos, pan, redraw]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();

    if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
      return;
    }

    if (!isDrawingRef.current) return;

    const point = getPointerPos(e);

    if (isShapeTool(tool) && currentShapeRef.current) {
      currentShapeRef.current = { ...currentShapeRef.current, end: point };
    } else if (currentStrokeRef.current && currentStrokeRef.current.points) {
      // Simple distance check to avoid too many points
      const last = lastPointRef.current;
      const dist = Math.sqrt((point.x - last.x) ** 2 + (point.y - last.y) ** 2);
      if (dist > 2 / zoom) {
        currentStrokeRef.current.points.push(point);
        lastPointRef.current = point;
      }
    }
    redraw();
  }, [isPanning, tool, getPointerPos, zoom, redraw]);

  const handlePointerUp = useCallback((e?: React.PointerEvent) => {
    e?.stopPropagation();
    const canvas = canvasRef.current;

    if (isPanning) {
      setIsPanning(false);
      if (canvas) canvas.style.cursor = 'crosshair';
      return;
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (isShapeTool(tool) && currentShapeRef.current) {
      const shapeToAdd = { ...currentShapeRef.current };
      setUndoStack((prev) => [...prev, { strokes, shapes }]);
      setShapes((prev) => [...prev, shapeToAdd]);
    } else if (currentStrokeRef.current && currentStrokeRef.current.points && currentStrokeRef.current.points.length > 1) {
      const strokeToAdd = {
        ...currentStrokeRef.current,
        points: [...currentStrokeRef.current.points]
      };
      setUndoStack((prev) => [...prev, { strokes, shapes }]);
      setStrokes((prev) => [...prev, strokeToAdd]);
    }
    // Clear refs after state updates are queued
    currentStrokeRef.current = null;
    currentShapeRef.current = null;
    // Don't call redraw() manually - let useEffect handle it
  }, [isPanning, tool, strokes, shapes]);

  // Zoom with wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * zoomFactor));

    // Zoom toward mouse position
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan]);

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

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

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
        cursor: 'pointer',
      }}
    >{icon}</button>
  );

  const ActionBtn = ({ onClick, disabled, icon, label }: { onClick: () => void; disabled?: boolean; icon: React.ReactNode; label: string }) => (
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
        opacity: disabled ? 0.4 : 1,
      }}
    >{icon}</button>
  );

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-base)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ height: 44, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-base)', flexShrink: 0 }}>
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
          <button onClick={() => { setShowColorPicker(!showColorPicker); setShowStrokePicker(false); }}
            style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'var(--color-bg-subtle)', cursor: 'pointer', padding: 6 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 4, background: color, border: '1px solid var(--color-border-default)' }} />
          </button>
          <AnimatePresence>
            {showColorPicker && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, padding: 8, background: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-lg)', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, zIndex: 100 }}>
                {COLORS.map((c) => (
                  <button key={c} onClick={() => { setColor(c); setShowColorPicker(false); }}
                    style={{ width: 24, height: 24, borderRadius: 4, background: c, border: color === c ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)', cursor: 'pointer' }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stroke width */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowStrokePicker(!showStrokePicker); setShowColorPicker(false); }}
            style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'var(--color-bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: Math.min(strokeWidth * 1.5, 16), height: Math.min(strokeWidth * 1.5, 16), borderRadius: '50%', background: 'var(--text-primary)' }} />
          </button>
          <AnimatePresence>
            {showStrokePicker && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, padding: 6, background: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 2, zIndex: 100 }}>
                {STROKE_WIDTHS.map((w) => (
                  <button key={w} onClick={() => { setStrokeWidth(w); setShowStrokePicker(false); }}
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
        <ActionBtn onClick={undo} disabled={undoStack.length === 0} label="Undo" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>} />
        <ActionBtn onClick={clearCanvas} disabled={strokes.length === 0 && shapes.length === 0} label="Clear" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>} />
        <ActionBtn onClick={resetView} label="Reset View" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>} />

        <div style={{ flex: 1 }} />

        {/* Zoom indicator */}
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginRight: 8 }}>{Math.round(zoom * 100)}% v2</span>

        {/* Export */}
        <button onClick={exportCanvas} style={{ height: 28, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, borderRadius: 6, border: 'none', background: 'var(--color-accent-primary)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>

      {/* Infinite Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          style={{ cursor: isPanning ? 'grabbing' : 'crosshair', touchAction: 'none' }}
        />

        {strokes.length === 0 && shapes.length === 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0.4 }}>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Scroll to zoom, Alt+drag to pan</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrawingApp;
