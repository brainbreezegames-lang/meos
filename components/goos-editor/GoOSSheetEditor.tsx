'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useDragControls, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Download,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Paintbrush,
  Type,
  Trash2,
  Copy,
  ClipboardPaste,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { GoOSAutoSaveIndicator, SaveStatus } from './GoOSAutoSaveIndicator';
import { GoOSPublishToggle, GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../desktop/windowStyles';
import { AccessLevel } from '@/contexts/GoOSContext';
import { playSound } from '@/lib/sounds';
import type { SheetContent, SheetCell, SheetRow } from '@/lib/validations/goos';
import { getDefaultSheetContent } from '@/lib/validations/goos';

// ─── Helpers ─────────────────────────────────────────────────

function getColumnLabel(index: number): string {
  let label = '';
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  const colStr = match[1].toUpperCase();
  const row = parseInt(match[2], 10) - 1;
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { col: col - 1, row };
}

function parseRange(range: string): Array<{ col: number; row: number }> {
  const parts = range.split(':');
  if (parts.length !== 2) return [];
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return [];
  const cells: Array<{ col: number; row: number }> = [];
  for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
    for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
      cells.push({ col: c, row: r });
    }
  }
  return cells;
}

function getCellNumericValue(cell: SheetCell | null): number {
  if (!cell || cell.value === null) return 0;
  if (typeof cell.value === 'number') return cell.value;
  if (typeof cell.value === 'string') {
    const cleaned = cell.value.replace(/[$€£,]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function evaluateFormula(formula: string, data: SheetRow[]): string | number | boolean | null {
  const upper = formula.toUpperCase().trim();

  // =TODAY()
  if (upper === '=TODAY()') {
    return new Date().toLocaleDateString();
  }

  // =SUM(range)
  const sumMatch = upper.match(/^=SUM\(([^)]+)\)$/);
  if (sumMatch) {
    const cells = parseRange(sumMatch[1]);
    return cells.reduce((s, { col, row }) => s + getCellNumericValue(data[row]?.[col] ?? null), 0);
  }

  // =AVERAGE(range)
  const avgMatch = upper.match(/^=(?:AVG|AVERAGE)\(([^)]+)\)$/);
  if (avgMatch) {
    const cells = parseRange(avgMatch[1]);
    const sum = cells.reduce((s, { col, row }) => s + getCellNumericValue(data[row]?.[col] ?? null), 0);
    return cells.length > 0 ? sum / cells.length : 0;
  }

  // =COUNT(range)
  const countMatch = upper.match(/^=COUNT\(([^)]+)\)$/);
  if (countMatch) {
    const cells = parseRange(countMatch[1]);
    return cells.filter(({ col, row }) => data[row]?.[col]?.value !== null && data[row]?.[col]?.value !== undefined).length;
  }

  // =MIN(range)
  const minMatch = upper.match(/^=MIN\(([^)]+)\)$/);
  if (minMatch) {
    const cells = parseRange(minMatch[1]);
    const vals = cells.map(({ col, row }) => getCellNumericValue(data[row]?.[col] ?? null));
    return vals.length > 0 ? Math.min(...vals) : 0;
  }

  // =MAX(range)
  const maxMatch = upper.match(/^=MAX\(([^)]+)\)$/);
  if (maxMatch) {
    const cells = parseRange(maxMatch[1]);
    const vals = cells.map(({ col, row }) => getCellNumericValue(data[row]?.[col] ?? null));
    return vals.length > 0 ? Math.max(...vals) : 0;
  }

  // =IF(condition, trueVal, falseVal)
  const ifMatch = upper.match(/^=IF\((.+)\)$/);
  if (ifMatch) {
    // Split by top-level commas only
    const args = splitFormulaArgs(ifMatch[1]);
    if (args.length === 3) {
      const condition = evaluateCondition(args[0].trim(), data);
      const result = condition ? args[1].trim() : args[2].trim();
      // Remove quotes from string results
      if (result.startsWith('"') && result.endsWith('"')) return result.slice(1, -1);
      if (!isNaN(Number(result))) return Number(result);
      // Try evaluating as cell ref
      const ref = parseCellRef(result);
      if (ref && data[ref.row]?.[ref.col]) return data[ref.row][ref.col]!.value;
      return result;
    }
  }

  // =CONCAT(args...)
  const concatMatch = upper.match(/^=CONCAT\((.+)\)$/);
  if (concatMatch) {
    const args = splitFormulaArgs(concatMatch[1]);
    return args.map((arg) => {
      const a = arg.trim();
      if (a.startsWith('"') && a.endsWith('"')) return a.slice(1, -1);
      const ref = parseCellRef(a);
      if (ref && data[ref.row]?.[ref.col]) return String(data[ref.row][ref.col]!.value ?? '');
      return a;
    }).join('');
  }

  // Simple cell reference =A1
  const refMatch = upper.match(/^=([A-Z]+\d+)$/);
  if (refMatch) {
    const ref = parseCellRef(refMatch[1]);
    if (ref && data[ref.row]?.[ref.col]) return data[ref.row][ref.col]!.value;
    return 0;
  }

  // Simple arithmetic
  if (upper.startsWith('=')) {
    try {
      let expr = upper.slice(1);
      expr = expr.replace(/([A-Z]+\d+)/gi, (match) => {
        const ref = parseCellRef(match);
        if (ref && data[ref.row]?.[ref.col]) return String(getCellNumericValue(data[ref.row][ref.col]));
        return '0';
      });
      if (/^[\d\s+\-*/().]+$/.test(expr)) {
        const result = new Function(`return ${expr}`)();
        return typeof result === 'number' && !isNaN(result) ? result : '#ERROR';
      }
    } catch { return '#ERROR'; }
  }
  return '#ERROR';
}

function splitFormulaArgs(str: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = '';
  let inString = false;
  for (const ch of str) {
    if (ch === '"') inString = !inString;
    if (!inString) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        args.push(current);
        current = '';
        continue;
      }
    }
    current += ch;
  }
  if (current) args.push(current);
  return args;
}

function evaluateCondition(condition: string, data: SheetRow[]): boolean {
  const ops = ['>=', '<=', '!=', '<>', '>', '<', '='];
  for (const op of ops) {
    const idx = condition.indexOf(op);
    if (idx > -1) {
      const left = resolveValue(condition.slice(0, idx).trim(), data);
      const right = resolveValue(condition.slice(idx + op.length).trim(), data);
      const l = typeof left === 'number' ? left : parseFloat(String(left));
      const r = typeof right === 'number' ? right : parseFloat(String(right));
      switch (op) {
        case '>': return l > r;
        case '<': return l < r;
        case '>=': return l >= r;
        case '<=': return l <= r;
        case '!=': case '<>': return l !== r;
        case '=': return l === r;
      }
    }
  }
  return false;
}

function resolveValue(val: string, data: SheetRow[]): string | number {
  if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
  if (!isNaN(Number(val))) return Number(val);
  const ref = parseCellRef(val);
  if (ref && data[ref.row]?.[ref.col]) return getCellNumericValue(data[ref.row][ref.col]);
  return 0;
}

// Auto-detect data types
function detectCellType(value: string): { value: SheetCell['value']; type: SheetCell['type'] } {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === null) return { value: null, type: 'text' };

  // Checkbox
  if (trimmed === '[]' || trimmed === '[ ]') return { value: false, type: 'checkbox' };
  if (trimmed === '[x]' || trimmed === '[X]') return { value: true, type: 'checkbox' };

  // Formula
  if (trimmed.startsWith('=')) return { value: trimmed, type: 'formula' };

  // Currency ($100, €50, £30)
  const currencyMatch = trimmed.match(/^[$€£]([\d,]+\.?\d*)$/);
  if (currencyMatch) return { value: parseFloat(currencyMatch[1].replace(/,/g, '')), type: 'currency' };

  // Number
  const numVal = trimmed.replace(/,/g, '');
  if (!isNaN(Number(numVal)) && numVal !== '') return { value: Number(numVal), type: 'number' };

  // Date (simple patterns)
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,         // 2025-01-28
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // 1/28/2025
  ];
  for (const pattern of datePatterns) {
    if (pattern.test(trimmed)) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) return { value: trimmed, type: 'date' };
    }
  }

  return { value: trimmed, type: 'text' };
}

function formatCellDisplay(cell: SheetCell | null, data: SheetRow[]): string {
  if (!cell || cell.value === null) return '';
  if (typeof cell.value === 'boolean') return cell.value ? '☑' : '☐';
  if (cell.type === 'formula' || (typeof cell.value === 'string' && cell.value.startsWith('='))) {
    const result = evaluateFormula(cell.formula || String(cell.value), data);
    if (typeof result === 'number') {
      return cell.format === 'currency' ? `$${result.toLocaleString()}` : result.toLocaleString();
    }
    return String(result ?? '');
  }
  if (cell.type === 'currency' && typeof cell.value === 'number') {
    return `$${cell.value.toLocaleString()}`;
  }
  if (cell.type === 'date' && typeof cell.value === 'string') {
    try { return new Date(cell.value).toLocaleDateString(); } catch { return cell.value; }
  }
  if (typeof cell.value === 'number') return cell.value.toLocaleString();
  return String(cell.value);
}

// ─── Types ───────────────────────────────────────────────────

export interface GoOSFile {
  id: string;
  type: 'sheet';
  title: string;
  content: string;
  status: PublishStatus;
  accessLevel?: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  parentFolderId?: string;
  position: { x: number; y: number };
}

interface GoOSSheetEditorProps {
  file: GoOSFile;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onUpdate: (file: Partial<GoOSFile>) => void;
  isActive?: boolean;
  zIndex?: number;
  isMaximized?: boolean;
}

interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bg?: string;
}

type UndoAction = {
  type: 'cell';
  col: number;
  row: number;
  oldCell: SheetCell | null;
  newCell: SheetCell | null;
};

const DEFAULT_COL_WIDTH = 120;
const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 30;
const ROW_NUM_WIDTH = 44;
const MIN_COL_WIDTH = 50;

// ─── Column Header Context Menu ──────────────────────────────

function ColumnContextMenu({
  colIndex,
  position,
  onClose,
  onSortAsc,
  onSortDesc,
  onInsertLeft,
  onInsertRight,
  onDelete,
  onHide,
  onFreeze,
  isFrozen,
}: {
  colIndex: number;
  position: { x: number; y: number };
  onClose: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onDelete: () => void;
  onHide: () => void;
  onFreeze: () => void;
  isFrozen: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items = [
    { label: 'Sort A → Z', icon: <ArrowUp size={13} />, action: onSortAsc },
    { label: 'Sort Z → A', icon: <ArrowDown size={13} />, action: onSortDesc },
    null, // divider
    { label: 'Insert column left', icon: <Plus size={13} />, action: onInsertLeft },
    { label: 'Insert column right', icon: <Plus size={13} />, action: onInsertRight },
    null,
    { label: isFrozen ? 'Unfreeze column' : 'Freeze column', icon: <Lock size={13} />, action: onFreeze },
    { label: 'Hide column', icon: <EyeOff size={13} />, action: onHide },
    null,
    { label: 'Delete column', icon: <Trash2 size={13} />, action: onDelete, danger: true },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: position.x, top: position.y, zIndex: 10000,
        background: 'var(--color-bg-elevated, #fff)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        padding: 4, minWidth: 180,
        fontFamily: 'var(--font-body)', fontSize: 12,
      }}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: 'var(--color-border-subtle)', margin: '4px 8px' }} />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 12px', background: 'transparent', border: 'none',
              cursor: 'pointer', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-body)',
              color: (item as any).danger ? '#dc2626' : 'var(--color-text-primary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ color: (item as any).danger ? '#dc2626' : 'var(--color-text-muted)', width: 16, display: 'flex' }}>{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ─── Row Context Menu ────────────────────────────────────────

function RowContextMenu({
  rowIndex,
  position,
  onClose,
  onInsertAbove,
  onInsertBelow,
  onDelete,
}: {
  rowIndex: number;
  position: { x: number; y: number };
  onClose: () => void;
  onInsertAbove: () => void;
  onInsertBelow: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: position.x, top: position.y, zIndex: 10000,
        background: 'var(--color-bg-elevated, #fff)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        padding: 4, minWidth: 180,
        fontFamily: 'var(--font-body)', fontSize: 12,
      }}
    >
      {[
        { label: 'Insert row above', icon: <ArrowUp size={13} />, action: onInsertAbove },
        { label: 'Insert row below', icon: <ArrowDown size={13} />, action: onInsertBelow },
        null,
        { label: 'Delete row', icon: <Trash2 size={13} />, action: onDelete, danger: true },
      ].map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: 'var(--color-border-subtle)', margin: '4px 8px' }} />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 12px', background: 'transparent', border: 'none',
              cursor: 'pointer', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-body)',
              color: (item as any).danger ? '#dc2626' : 'var(--color-text-primary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ color: (item as any).danger ? '#dc2626' : 'var(--color-text-muted)', width: 16, display: 'flex' }}>{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ─── Main Sheet Editor ───────────────────────────────────────

export function GoOSSheetEditor({
  file,
  onClose,
  onMinimize,
  onMaximize,
  onUpdate,
  isActive = true,
  zIndex = 100,
  isMaximized = false,
}: GoOSSheetEditorProps) {
  const parsedContent = useMemo(() => {
    try {
      if (file.content) return JSON.parse(file.content) as SheetContent;
    } catch { /* use default */ }
    return getDefaultSheetContent();
  }, [file.content]);

  const [title, setTitle] = useState(file.title);
  const [sheetContent, setSheetContent] = useState<SheetContent>(parsedContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(file.updatedAt);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ col: number; row: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ col: number; row: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<number>>(new Set());
  const [frozenColumns, setFrozenColumns] = useState(0);
  const [frozenRows, setFrozenRows] = useState(1); // Freeze header by default
  const [cellFormats, setCellFormats] = useState<Record<string, CellFormat>>({});
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);
  const [colContextMenu, setColContextMenu] = useState<{ col: number; x: number; y: number } | null>(null);
  const [rowContextMenu, setRowContextMenu] = useState<{ row: number; x: number; y: number } | null>(null);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [selectionRange, setSelectionRange] = useState<{ startCol: number; startRow: number; endCol: number; endRow: number } | null>(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  const numCols = useMemo(() => {
    let max = 10;
    for (const row of sheetContent.data) {
      if (row && row.length > max) max = row.length;
    }
    return max;
  }, [sheetContent.data]);

  const numRows = sheetContent.data.length;

  useEffect(() => { playSound('whoosh'); }, []);

  // Auto-save
  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({ title, content: JSON.stringify(sheetContent), updatedAt: new Date() });
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  }, [title, sheetContent, onUpdate]);

  useEffect(() => {
    const currentContent = JSON.stringify(sheetContent);
    if (currentContent !== file.content || title !== file.title) triggerSave();
  }, [sheetContent, title, file.content, file.title, triggerSave]);

  const handlePublishChange = (status: PublishStatus) => onUpdate({ status });

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) { titleInputRef.current.focus(); titleInputRef.current.select(); }
  }, [isEditingTitle]);

  useEffect(() => {
    if (editingCell && cellInputRef.current) { cellInputRef.current.focus(); }
  }, [editingCell]);

  const startDrag = (event: React.PointerEvent) => { if (!isMaximized) dragControls.start(event); };

  const getColWidth = (col: number) => columnWidths[col] || DEFAULT_COL_WIDTH;

  // ─── Cell Operations ──────────────────────────────────

  const getCellRawValue = (cell: SheetCell | null): string => {
    if (!cell || cell.value === null) return '';
    if (cell.formula) return cell.formula;
    if (typeof cell.value === 'boolean') return cell.value ? '[x]' : '[]';
    return String(cell.value);
  };

  const updateCell = useCallback((col: number, row: number, rawValue: string, pushUndo = true) => {
    setSheetContent((prev) => {
      const newData = [...prev.data];
      while (newData.length <= row) newData.push(Array(numCols).fill(null));
      const newRow = [...(newData[row] || [])];
      while (newRow.length <= col) newRow.push(null);

      const oldCell = newRow[col];

      if (rawValue.trim() === '') {
        newRow[col] = null;
      } else {
        const detected = detectCellType(rawValue);
        newRow[col] = {
          value: detected.value,
          type: detected.type,
          formula: detected.type === 'formula' ? rawValue : undefined,
        };
      }

      if (pushUndo) {
        setUndoStack((stack) => [...stack.slice(-50), { type: 'cell', col, row, oldCell, newCell: newRow[col] }]);
        setRedoStack([]);
      }

      newData[row] = newRow;
      return { ...prev, data: newData };
    });
  }, [numCols]);

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const action = stack[stack.length - 1];
      setSheetContent((prev) => {
        const newData = [...prev.data];
        const newRow = [...(newData[action.row] || [])];
        newRow[action.col] = action.oldCell;
        newData[action.row] = newRow;
        return { ...prev, data: newData };
      });
      setRedoStack((r) => [...r, action]);
      return stack.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const action = stack[stack.length - 1];
      setSheetContent((prev) => {
        const newData = [...prev.data];
        const newRow = [...(newData[action.row] || [])];
        newRow[action.col] = action.newCell;
        newData[action.row] = newRow;
        return { ...prev, data: newData };
      });
      setUndoStack((u) => [...u, action]);
      return stack.slice(0, -1);
    });
  }, []);

  // ─── Sort ─────────────────────────────────────────────

  const sortColumn = useCallback((col: number, ascending: boolean) => {
    setSheetContent((prev) => {
      // Keep first row if frozen (header)
      const headerRows = frozenRows > 0 ? prev.data.slice(0, frozenRows) : [];
      const dataRows = frozenRows > 0 ? [...prev.data.slice(frozenRows)] : [...prev.data];

      dataRows.sort((a, b) => {
        const aVal = getCellNumericValue(a[col] ?? null);
        const bVal = getCellNumericValue(b[col] ?? null);
        const aStr = String(a[col]?.value ?? '');
        const bStr = String(b[col]?.value ?? '');

        // Try numeric sort first
        if (aVal !== 0 || bVal !== 0) {
          return ascending ? aVal - bVal : bVal - aVal;
        }
        // Fall back to string sort
        return ascending ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });

      return { ...prev, data: [...headerRows, ...dataRows] };
    });
  }, [frozenRows]);

  // ─── Row/Column Operations ────────────────────────────

  const insertRow = useCallback((atIndex: number) => {
    setSheetContent((prev) => {
      const newData = [...prev.data];
      newData.splice(atIndex, 0, Array(numCols).fill(null));
      return { ...prev, data: newData };
    });
  }, [numCols]);

  const deleteRow = useCallback((rowIndex: number) => {
    if (sheetContent.data.length <= 1) return;
    setSheetContent((prev) => ({
      ...prev,
      data: prev.data.filter((_, i) => i !== rowIndex),
    }));
  }, [sheetContent.data.length]);

  const insertColumn = useCallback((atIndex: number) => {
    setSheetContent((prev) => ({
      ...prev,
      data: prev.data.map((row) => {
        const newRow = [...row];
        newRow.splice(atIndex, 0, null);
        return newRow;
      }),
    }));
  }, []);

  const deleteColumn = useCallback((colIndex: number) => {
    if (numCols <= 1) return;
    setSheetContent((prev) => ({
      ...prev,
      data: prev.data.map((row) => row.filter((_, i) => i !== colIndex)),
    }));
  }, [numCols]);

  const addRow = () => {
    setSheetContent((prev) => ({ ...prev, data: [...prev.data, Array(numCols).fill(null)] }));
  };

  const addColumn = () => {
    setSheetContent((prev) => ({ ...prev, data: prev.data.map((row) => [...row, null]) }));
  };

  // ─── CSV Export ───────────────────────────────────────

  const exportCSV = useCallback(() => {
    const lines = sheetContent.data.map((row) =>
      row.map((cell) => {
        if (!cell || cell.value === null) return '';
        const val = String(cell.value);
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'sheet'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sheetContent.data, title]);

  // ─── Cell Formatting ──────────────────────────────────

  const toggleFormat = (key: 'bold' | 'italic') => {
    if (!selectedCell) return;
    const cellKey = `${selectedCell.col}-${selectedCell.row}`;
    setCellFormats((prev) => ({
      ...prev,
      [cellKey]: { ...prev[cellKey], [key]: !prev[cellKey]?.[key] },
    }));
  };

  // ─── Column Resize ────────────────────────────────────

  const startResize = (e: React.MouseEvent, col: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(col);
    setResizeStartX(e.clientX);
    setResizeStartWidth(getColWidth(col));
  };

  useEffect(() => {
    if (resizingCol === null) return;
    const handleMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(MIN_COL_WIDTH, resizeStartWidth + diff);
      setColumnWidths((prev) => ({ ...prev, [resizingCol]: newWidth }));
    };
    const handleUp = () => setResizingCol(null);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => { document.removeEventListener('mousemove', handleMove); document.removeEventListener('mouseup', handleUp); };
  }, [resizingCol, resizeStartX, resizeStartWidth]);

  // ─── Selection ────────────────────────────────────────

  const handleCellMouseDown = (col: number, row: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelectedCell({ col, row });
    setSelectionRange({ startCol: col, startRow: row, endCol: col, endRow: row });
    setIsDraggingSelection(true);
    if (editingCell && (editingCell.col !== col || editingCell.row !== row)) {
      saveCellEdit();
    }
  };

  const handleCellMouseEnter = (col: number, row: number) => {
    if (!isDraggingSelection || !selectionRange) return;
    setSelectionRange((prev) => prev ? { ...prev, endCol: col, endRow: row } : null);
  };

  useEffect(() => {
    if (!isDraggingSelection) return;
    const handleUp = () => setIsDraggingSelection(false);
    document.addEventListener('mouseup', handleUp);
    return () => document.removeEventListener('mouseup', handleUp);
  }, [isDraggingSelection]);

  const isInSelection = (col: number, row: number) => {
    if (!selectionRange) return false;
    const minCol = Math.min(selectionRange.startCol, selectionRange.endCol);
    const maxCol = Math.max(selectionRange.startCol, selectionRange.endCol);
    const minRow = Math.min(selectionRange.startRow, selectionRange.endRow);
    const maxRow = Math.max(selectionRange.startRow, selectionRange.endRow);
    return col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;
  };

  // ─── Edit / Navigation ────────────────────────────────

  const handleCellDoubleClick = (col: number, row: number) => {
    const cell = sheetContent.data[row]?.[col] ?? null;
    setEditingCell({ col, row });
    setEditValue(getCellRawValue(cell));
  };

  const saveCellEdit = () => {
    if (editingCell) {
      updateCell(editingCell.col, editingCell.row, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Undo/Redo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
      return;
    }

    if (!selectedCell) return;

    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveCellEdit();
        setSelectedCell({ col: editingCell.col, row: Math.min(editingCell.row + 1, numRows - 1) });
      } else if (e.key === 'Escape') {
        setEditingCell(null);
        setEditValue('');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        saveCellEdit();
        const nextCol = e.shiftKey ? Math.max(0, editingCell.col - 1) : Math.min(editingCell.col + 1, numCols - 1);
        setSelectedCell({ col: nextCol, row: editingCell.row });
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); setSelectedCell({ col: selectedCell.col, row: Math.max(0, selectedCell.row - 1) }); break;
      case 'ArrowDown': e.preventDefault(); setSelectedCell({ col: selectedCell.col, row: Math.min(numRows - 1, selectedCell.row + 1) }); break;
      case 'ArrowLeft': e.preventDefault(); setSelectedCell({ col: Math.max(0, selectedCell.col - 1), row: selectedCell.row }); break;
      case 'ArrowRight': e.preventDefault(); setSelectedCell({ col: Math.min(numCols - 1, selectedCell.col + 1), row: selectedCell.row }); break;
      case 'Enter': case 'F2': e.preventDefault(); handleCellDoubleClick(selectedCell.col, selectedCell.row); break;
      case 'Delete': case 'Backspace': e.preventDefault(); updateCell(selectedCell.col, selectedCell.row, ''); break;
      case 'Tab':
        e.preventDefault();
        const next = e.shiftKey ? Math.max(0, selectedCell.col - 1) : Math.min(numCols - 1, selectedCell.col + 1);
        setSelectedCell({ col: next, row: selectedCell.row });
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setEditingCell(selectedCell);
          setEditValue(e.key);
        }
    }
  };

  // ─── Render ───────────────────────────────────────────

  const visibleCols = useMemo(() =>
    Array.from({ length: numCols }, (_, i) => i).filter((i) => !hiddenColumns.has(i)),
  [numCols, hiddenColumns]);

  return (
    <motion.div
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={false}
      dragElastic={0}
      dragMomentum={false}
      initial={prefersReducedMotion ? ANIMATION.reducedInitial : ANIMATION.initial}
      animate={prefersReducedMotion ? ANIMATION.reducedAnimate : ANIMATION.animate}
      exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
      transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
      style={{
        position: 'fixed',
        top: isMaximized ? 'var(--menubar-height, 40px)' : '5%',
        left: isMaximized ? 0 : '50%',
        x: isMaximized ? 0 : '-50%',
        width: isMaximized ? '100%' : 'min(1100px, 95vw)',
        height: isMaximized
          ? 'calc(100vh - var(--menubar-height, 40px) - var(--zen-dock-offset, 80px))'
          : 'min(80vh, 700px)',
        minWidth: 500,
        background: WINDOW.background,
        border: isMaximized ? WINDOW.borderMaximized : WINDOW.border,
        borderRadius: isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius,
        boxShadow: isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Title Bar */}
      <div
        onPointerDown={startDrag}
        style={{
          display: 'flex', alignItems: 'center',
          padding: `0 ${TITLE_BAR.paddingX}px`, height: TITLE_BAR.height,
          background: TITLE_BAR.background, borderBottom: TITLE_BAR.borderBottom,
          gap: 12, cursor: isMaximized ? 'default' : 'grab',
          flexShrink: 0, touchAction: 'none',
        }}
      >
        <TrafficLights onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} isMaximized={isMaximized} variant="macos" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 16 }}>📊</span>
          {isEditingTitle ? (
            <input ref={titleInputRef} value={title} onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingTitle(false); }}
              style={{ flex: 1, padding: '4px 8px', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)', background: 'var(--color-bg-base)', border: '1.5px solid var(--color-accent-primary)', borderRadius: 6, outline: 'none' }}
            />
          ) : (
            <span onClick={() => setIsEditingTitle(true)}
              style={{ fontSize: TITLE_BAR.titleFontSize, fontWeight: TITLE_BAR.titleFontWeight, fontFamily: 'var(--font-body)', color: TITLE_BAR.titleColor, opacity: TITLE_BAR.titleOpacityActive, cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title="Click to edit title">{title || 'Untitled Sheet'}</span>
          )}
          <GoOSPublishBadge status={file.status} />
        </div>
        <GoOSAutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
        <GoOSPublishToggle status={file.status} onChange={handlePublishChange} />
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, padding: '6px 12px',
        borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-subtle)',
        flexShrink: 0,
      }}>
        <button onClick={undo} disabled={undoStack.length === 0} title="Undo (Cmd+Z)"
          style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: undoStack.length ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', opacity: undoStack.length ? 1 : 0.4 }}>
          <Undo2 size={15} />
        </button>
        <button onClick={redo} disabled={redoStack.length === 0} title="Redo (Cmd+Shift+Z)"
          style={{ padding: '4px 6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: redoStack.length ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', opacity: redoStack.length ? 1 : 0.4 }}>
          <Redo2 size={15} />
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--color-border-default)', margin: '0 6px' }} />

        <button onClick={() => toggleFormat('bold')} title="Bold"
          style={{ padding: '4px 6px', background: selectedCell && cellFormats[`${selectedCell.col}-${selectedCell.row}`]?.bold ? 'var(--color-bg-base)' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--color-text-secondary)' }}>
          <Bold size={15} />
        </button>
        <button onClick={() => toggleFormat('italic')} title="Italic"
          style={{ padding: '4px 6px', background: selectedCell && cellFormats[`${selectedCell.col}-${selectedCell.row}`]?.italic ? 'var(--color-bg-base)' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--color-text-secondary)' }}>
          <Italic size={15} />
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--color-border-default)', margin: '0 6px' }} />

        <button onClick={exportCSV} title="Export CSV"
          style={{ padding: '4px 8px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-body)' }}>
          <Download size={13} />
          CSV
        </button>

        {/* Formula bar */}
        <div style={{ flex: 1 }} />
        {selectedCell && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            <span style={{ fontWeight: 600, background: 'var(--color-bg-base)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
              {getColumnLabel(selectedCell.col)}{selectedCell.row + 1}
            </span>
            <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>
              {getCellRawValue(sheetContent.data[selectedCell.row]?.[selectedCell.col] ?? null)}
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div ref={gridRef} style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-base)', cursor: resizingCol !== null ? 'col-resize' : 'default' }}>
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', fontFamily: 'var(--font-body)', fontSize: 13, minWidth: '100%' }}>
          <thead>
            <tr>
              {/* Top-left corner */}
              <th style={{
                width: ROW_NUM_WIDTH, minWidth: ROW_NUM_WIDTH, height: HEADER_HEIGHT,
                background: 'var(--color-bg-subtle)', borderBottom: '2px solid var(--color-border-default)',
                borderRight: '1px solid var(--color-border-default)',
                position: 'sticky', top: 0, left: 0, zIndex: 4,
              }} />
              {/* Column headers */}
              {visibleCols.map((colIndex) => (
                <th key={colIndex} style={{
                  width: getColWidth(colIndex), minWidth: getColWidth(colIndex), height: HEADER_HEIGHT,
                  background: 'var(--color-bg-subtle)', borderBottom: '2px solid var(--color-border-default)',
                  borderRight: '1px solid var(--color-border-subtle)',
                  fontWeight: 600, fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center',
                  position: 'sticky', top: 0, zIndex: 3, userSelect: 'none', padding: 0,
                  cursor: 'pointer',
                }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setColContextMenu({ col: colIndex, x: e.clientX, y: e.clientY });
                  }}
                  onClick={() => {
                    // Select entire column
                    setSelectedCell({ col: colIndex, row: 0 });
                    setSelectionRange({ startCol: colIndex, startRow: 0, endCol: colIndex, endRow: numRows - 1 });
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
                    {getColumnLabel(colIndex)}
                    {colIndex < frozenColumns && (
                      <Lock size={9} style={{ marginLeft: 4, opacity: 0.5 }} />
                    )}
                    {/* Resize handle */}
                    <div
                      onMouseDown={(e) => startResize(e, colIndex)}
                      style={{
                        position: 'absolute', right: -2, top: 0, width: 5, height: '100%',
                        cursor: 'col-resize', background: 'transparent',
                      }}
                      onDoubleClick={() => {
                        // Auto-fit: find widest content
                        let maxW = 60;
                        for (const row of sheetContent.data) {
                          const cell = row[colIndex];
                          if (cell?.value) {
                            const len = String(cell.value).length * 8 + 24;
                            if (len > maxW) maxW = len;
                          }
                        }
                        setColumnWidths((prev) => ({ ...prev, [colIndex]: Math.min(300, maxW) }));
                      }}
                    />
                  </div>
                </th>
              ))}
              <th style={{ width: 36, minWidth: 36, height: HEADER_HEIGHT, background: 'var(--color-bg-subtle)', borderBottom: '2px solid var(--color-border-default)', position: 'sticky', top: 0, zIndex: 3 }}>
                <button onClick={addColumn} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }} title="Add column">
                  <Plus size={14} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sheetContent.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* Row number */}
                <td
                  style={{
                    width: ROW_NUM_WIDTH, minWidth: ROW_NUM_WIDTH, height: ROW_HEIGHT,
                    background: rowIndex < frozenRows ? 'var(--color-bg-subtle)' : 'var(--color-bg-subtle)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    borderRight: '1px solid var(--color-border-default)',
                    fontWeight: 500, fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center',
                    position: 'sticky', left: 0, zIndex: 2, userSelect: 'none', cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedCell({ col: 0, row: rowIndex });
                    setSelectionRange({ startCol: 0, startRow: rowIndex, endCol: numCols - 1, endRow: rowIndex });
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setRowContextMenu({ row: rowIndex, x: e.clientX, y: e.clientY });
                  }}
                >
                  {rowIndex + 1}
                </td>
                {/* Data cells */}
                {visibleCols.map((colIndex) => {
                  const cell = row[colIndex] ?? null;
                  const isSelected = selectedCell?.col === colIndex && selectedCell?.row === rowIndex;
                  const inRange = isInSelection(colIndex, rowIndex);
                  const isEditing = editingCell?.col === colIndex && editingCell?.row === rowIndex;
                  const fmt = cellFormats[`${colIndex}-${rowIndex}`];
                  const isCheckbox = cell?.type === 'checkbox';

                  return (
                    <td key={colIndex}
                      onMouseDown={(e) => handleCellMouseDown(colIndex, rowIndex, e)}
                      onMouseEnter={() => handleCellMouseEnter(colIndex, rowIndex)}
                      onDoubleClick={() => {
                        if (isCheckbox) {
                          // Toggle checkbox
                          updateCell(colIndex, rowIndex, cell?.value ? '[]' : '[x]');
                        } else {
                          handleCellDoubleClick(colIndex, rowIndex);
                        }
                      }}
                      style={{
                        width: getColWidth(colIndex), minWidth: getColWidth(colIndex), height: ROW_HEIGHT,
                        borderBottom: '1px solid var(--color-border-subtle)',
                        borderRight: '1px solid var(--color-border-subtle)',
                        padding: 0,
                        background: isSelected
                          ? 'rgba(59,130,246,0.08)'
                          : inRange
                          ? 'rgba(59,130,246,0.04)'
                          : fmt?.bg || 'var(--color-bg-base)',
                        outline: isSelected ? '2px solid rgba(59,130,246,0.6)' : 'none',
                        outlineOffset: -1,
                        cursor: isCheckbox ? 'pointer' : 'cell',
                        position: 'relative',
                      }}
                    >
                      {isEditing ? (
                        <input
                          ref={cellInputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveCellEdit}
                          style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            padding: '0 8px', border: '2px solid rgba(59,130,246,0.6)',
                            outline: 'none', fontSize: 13, fontFamily: 'var(--font-body)',
                            background: 'var(--color-bg-base)', borderRadius: 0,
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '0 8px', height: '100%',
                          display: 'flex', alignItems: 'center', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontWeight: fmt?.bold ? 700 : 400,
                          fontStyle: fmt?.italic ? 'italic' : 'normal',
                          color: fmt?.color || (
                            cell?.type === 'formula' ? 'var(--color-accent-primary)'
                            : cell?.type === 'currency' ? '#16a34a'
                            : cell?.type === 'date' ? '#7c3aed'
                            : 'var(--color-text-primary)'
                          ),
                          justifyContent: (cell?.type === 'number' || cell?.type === 'currency') ? 'flex-end' : 'flex-start',
                          fontSize: 13,
                        }}>
                          {formatCellDisplay(cell, sheetContent.data)}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td style={{ width: 36, minWidth: 36, height: ROW_HEIGHT, borderBottom: '1px solid var(--color-border-subtle)' }} />
              </tr>
            ))}
            {/* Add row button */}
            <tr>
              <td colSpan={visibleCols.length + 2} style={{ height: ROW_HEIGHT, padding: 0 }}>
                <button onClick={addRow} style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 12, fontFamily: 'var(--font-body)' }}>
                  <Plus size={14} /> Add row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderTop: '1px solid rgba(23, 20, 18, 0.06)',
        background: 'rgba(23, 20, 18, 0.02)', fontSize: 10,
        fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <span>{numRows} rows</span>
          <span>{numCols} columns</span>
          {selectedCell && <span>{getColumnLabel(selectedCell.col)}{selectedCell.row + 1}</span>}
          {selectionRange && selectionRange.startCol !== selectionRange.endCol || selectionRange && selectionRange.startRow !== selectionRange.endRow ? (
            <span>Range: {Math.abs((selectionRange?.endRow ?? 0) - (selectionRange?.startRow ?? 0)) + 1} × {Math.abs((selectionRange?.endCol ?? 0) - (selectionRange?.startCol ?? 0)) + 1}</span>
          ) : null}
        </div>
        <span style={{ fontSize: 11, opacity: 0.6 }}>goOS Sheet</span>
      </div>

      {/* Context menus */}
      {colContextMenu && (
        <ColumnContextMenu
          colIndex={colContextMenu.col}
          position={{ x: colContextMenu.x, y: colContextMenu.y }}
          onClose={() => setColContextMenu(null)}
          onSortAsc={() => sortColumn(colContextMenu.col, true)}
          onSortDesc={() => sortColumn(colContextMenu.col, false)}
          onInsertLeft={() => insertColumn(colContextMenu.col)}
          onInsertRight={() => insertColumn(colContextMenu.col + 1)}
          onDelete={() => deleteColumn(colContextMenu.col)}
          onHide={() => setHiddenColumns((prev) => new Set([...prev, colContextMenu.col]))}
          onFreeze={() => setFrozenColumns((prev) => prev === colContextMenu.col + 1 ? 0 : colContextMenu.col + 1)}
          isFrozen={frozenColumns > colContextMenu.col}
        />
      )}
      {rowContextMenu && (
        <RowContextMenu
          rowIndex={rowContextMenu.row}
          position={{ x: rowContextMenu.x, y: rowContextMenu.y }}
          onClose={() => setRowContextMenu(null)}
          onInsertAbove={() => insertRow(rowContextMenu.row)}
          onInsertBelow={() => insertRow(rowContextMenu.row + 1)}
          onDelete={() => deleteRow(rowContextMenu.row)}
        />
      )}
    </motion.div>
  );
}

export default GoOSSheetEditor;
