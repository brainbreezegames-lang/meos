"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface Shape {
  type: 'rect' | 'circle';
  // All values as percentages (0-1) of the letter's bounding box
  x: number;
  y: number;
  width?: number;  // for rect
  height?: number; // for rect
  radius?: number; // for circle
}

interface LetterColliders {
  [key: string]: Shape[];
}

const LETTERS = ['H', 'E', 'L', 'O', 'HEAD'];
const LETTER_SIZE = 400; // Editor display size

export function ColliderEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(0);
  const [colliders, setColliders] = useState<LetterColliders>({
    H: [],
    E: [],
    L: [],
    O: [],
    HEAD: [],
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [shapeType, setShapeType] = useState<'rect' | 'circle'>('rect');

  const letter = LETTERS[currentLetter];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Draw the current state
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, LETTER_SIZE, LETTER_SIZE);

    // Draw letter background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, LETTER_SIZE, LETTER_SIZE);

    // Draw the letter or HEAD image
    if (letter === 'HEAD') {
      const img = new Image();
      img.src = '/zinoHead.svg';
      img.onload = () => {
        const padding = LETTER_SIZE * 0.05;
        ctx.drawImage(img, padding, padding, LETTER_SIZE - padding * 2, LETTER_SIZE - padding * 2);
        drawColliders(ctx);
      };
    } else {
      ctx.fillStyle = '#f5f0e6';
      ctx.font = `700 ${LETTER_SIZE * 0.85}px "Averia Serif Libre", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, LETTER_SIZE / 2, LETTER_SIZE / 2);
      drawColliders(ctx);
    }
  }, [letter, colliders, currentShape]);

  const drawColliders = useCallback((ctx: CanvasRenderingContext2D) => {
    // Draw saved colliders
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 2;

    const shapes = colliders[letter] || [];
    shapes.forEach(shape => {
      if (shape.type === 'rect') {
        const x = shape.x * LETTER_SIZE;
        const y = shape.y * LETTER_SIZE;
        const w = (shape.width || 0) * LETTER_SIZE;
        const h = (shape.height || 0) * LETTER_SIZE;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      } else if (shape.type === 'circle') {
        const cx = shape.x * LETTER_SIZE;
        const cy = shape.y * LETTER_SIZE;
        const r = (shape.radius || 0) * LETTER_SIZE;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw current shape being drawn
    if (currentShape) {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.9)';
      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      if (currentShape.type === 'rect') {
        const x = currentShape.x * LETTER_SIZE;
        const y = currentShape.y * LETTER_SIZE;
        const w = (currentShape.width || 0) * LETTER_SIZE;
        const h = (currentShape.height || 0) * LETTER_SIZE;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      } else if (currentShape.type === 'circle') {
        const cx = currentShape.x * LETTER_SIZE;
        const cy = currentShape.y * LETTER_SIZE;
        const r = (currentShape.radius || 0) * LETTER_SIZE;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [colliders, letter, currentShape]);

  useEffect(() => {
    if (mounted) {
      draw();
    }
  }, [draw, mounted]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / LETTER_SIZE,
      y: (e.clientY - rect.top) / LETTER_SIZE,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);

    if (shapeType === 'rect') {
      setCurrentShape({
        type: 'rect',
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
      });
    } else {
      setCurrentShape({
        type: 'circle',
        x: coords.x,
        y: coords.y,
        radius: 0,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;
    const coords = getCanvasCoords(e);

    if (shapeType === 'rect') {
      const x = Math.min(drawStart.x, coords.x);
      const y = Math.min(drawStart.y, coords.y);
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);
      setCurrentShape({
        type: 'rect',
        x,
        y,
        width,
        height,
      });
    } else {
      const dx = coords.x - drawStart.x;
      const dy = coords.y - drawStart.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      setCurrentShape({
        type: 'circle',
        x: drawStart.x,
        y: drawStart.y,
        radius,
      });
    }
  };

  const handleMouseUp = () => {
    if (currentShape && isDrawing) {
      // Only add if shape has some size
      const hasSize = shapeType === 'rect'
        ? (currentShape.width || 0) > 0.01 && (currentShape.height || 0) > 0.01
        : (currentShape.radius || 0) > 0.01;

      if (hasSize) {
        setColliders(prev => ({
          ...prev,
          [letter]: [...(prev[letter] || []), currentShape],
        }));
      }
    }
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentShape(null);
  };

  const clearCurrentLetter = () => {
    setColliders(prev => ({
      ...prev,
      [letter]: [],
    }));
  };

  const undoLast = () => {
    setColliders(prev => ({
      ...prev,
      [letter]: (prev[letter] || []).slice(0, -1),
    }));
  };

  const exportColliders = () => {
    // Convert to format usable by FallingLetters
    const output = Object.entries(colliders).map(([char, shapes]) => {
      return `// ${char}\n${JSON.stringify(shapes, null, 2)}`;
    }).join('\n\n');

    console.log('=== COLLIDER DATA ===');
    console.log(output);
    console.log('=== END ===');

    // Also copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(colliders, null, 2));
    }
    alert('Collider data copied to clipboard and logged to console!');
  };

  if (!mounted) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}>
        Loading editor...
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      fontFamily: 'system-ui, sans-serif',
      color: '#fff',
    }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        {LETTERS.map((l, i) => (
          <button
            key={l}
            onClick={() => setCurrentLetter(i)}
            style={{
              padding: '8px 16px',
              background: i === currentLetter ? '#ff7722' : '#333',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <button
          onClick={() => setShapeType('rect')}
          style={{
            padding: '8px 16px',
            background: shapeType === 'rect' ? '#22cc77' : '#333',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Rectangle
        </button>
        <button
          onClick={() => setShapeType('circle')}
          style={{
            padding: '8px 16px',
            background: shapeType === 'circle' ? '#22cc77' : '#333',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Circle
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={LETTER_SIZE}
        height={LETTER_SIZE}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          border: '2px solid #444',
          cursor: 'crosshair',
        }}
      />

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={undoLast}
          style={{
            padding: '8px 16px',
            background: '#666',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Undo
        </button>
        <button
          onClick={clearCurrentLetter}
          style={{
            padding: '8px 16px',
            background: '#cc3333',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Clear {letter}
        </button>
        <button
          onClick={exportColliders}
          style={{
            padding: '8px 16px',
            background: '#2277ff',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Export All
        </button>
      </div>

      <div style={{ fontSize: 12, color: '#888', maxWidth: 500, textAlign: 'center' }}>
        <p>Draw collision shapes for each letter. Red = saved shapes, Green = current drawing.</p>
        <p>Use rectangles for H, E, L strokes. Use circles for O and HEAD.</p>
        <p>Shapes are saved as percentages (0-1) of the bounding box.</p>
      </div>

      <div style={{ fontSize: 11, color: '#666', marginTop: 10 }}>
        Shapes for {letter}: {(colliders[letter] || []).length}
      </div>
    </div>
  );
}

export default ColliderEditor;
