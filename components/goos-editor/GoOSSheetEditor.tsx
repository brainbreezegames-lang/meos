'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { GoOSAutoSaveIndicator, SaveStatus } from './GoOSAutoSaveIndicator';
import { GoOSPublishToggle, GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../desktop/windowStyles';
import { AccessLevel } from '@/contexts/GoOSContext';
import { playSound } from '@/lib/sounds';
import type { SheetContent, SheetCell, SheetRow } from '@/lib/validations/goos';
import { getDefaultSheetContent } from '@/lib/validations/goos';

// Column labels (A, B, C, ... Z, AA, AB, ...)
function getColumnLabel(index: number): string {
  let label = '';
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

// Parse cell reference like "A1" to { col: 0, row: 0 }
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

// Parse a range like "A1:B3" to array of cell references
function parseRange(range: string): Array<{ col: number; row: number }> {
  const parts = range.split(':');
  if (parts.length !== 2) return [];
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return [];

  const cells: Array<{ col: number; row: number }> = [];
  for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
    for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
      cells.push({ col, row });
    }
  }
  return cells;
}

// Get numeric value from a cell
function getCellNumericValue(cell: SheetCell | null): number {
  if (!cell) return 0;
  if (typeof cell.value === 'number') return cell.value;
  if (typeof cell.value === 'string') {
    const num = parseFloat(cell.value);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

// Evaluate a formula
function evaluateFormula(
  formula: string,
  data: SheetRow[],
  currentCol: number,
  currentRow: number
): string | number | boolean | null {
  const upperFormula = formula.toUpperCase().trim();

  // SUM function
  const sumMatch = upperFormula.match(/^=SUM\(([^)]+)\)$/);
  if (sumMatch) {
    const cells = parseRange(sumMatch[1]);
    let sum = 0;
    for (const { col, row } of cells) {
      if (data[row] && data[row][col]) {
        sum += getCellNumericValue(data[row][col]);
      }
    }
    return sum;
  }

  // AVG/AVERAGE function
  const avgMatch = upperFormula.match(/^=(?:AVG|AVERAGE)\(([^)]+)\)$/);
  if (avgMatch) {
    const cells = parseRange(avgMatch[1]);
    let sum = 0;
    let count = 0;
    for (const { col, row } of cells) {
      if (data[row] && data[row][col]) {
        sum += getCellNumericValue(data[row][col]);
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  }

  // MIN function
  const minMatch = upperFormula.match(/^=MIN\(([^)]+)\)$/);
  if (minMatch) {
    const cells = parseRange(minMatch[1]);
    let min = Infinity;
    for (const { col, row } of cells) {
      if (data[row] && data[row][col]) {
        const val = getCellNumericValue(data[row][col]);
        if (val < min) min = val;
      }
    }
    return min === Infinity ? 0 : min;
  }

  // MAX function
  const maxMatch = upperFormula.match(/^=MAX\(([^)]+)\)$/);
  if (maxMatch) {
    const cells = parseRange(maxMatch[1]);
    let max = -Infinity;
    for (const { col, row } of cells) {
      if (data[row] && data[row][col]) {
        const val = getCellNumericValue(data[row][col]);
        if (val > max) max = val;
      }
    }
    return max === -Infinity ? 0 : max;
  }

  // COUNT function
  const countMatch = upperFormula.match(/^=COUNT\(([^)]+)\)$/);
  if (countMatch) {
    const cells = parseRange(countMatch[1]);
    let count = 0;
    for (const { col, row } of cells) {
      if (data[row] && data[row][col] && data[row][col]!.value !== null) {
        count++;
      }
    }
    return count;
  }

  // Simple cell reference like =A1
  const refMatch = upperFormula.match(/^=([A-Z]+\d+)$/);
  if (refMatch) {
    const ref = parseCellRef(refMatch[1]);
    if (ref && data[ref.row] && data[ref.row][ref.col]) {
      return data[ref.row][ref.col]!.value;
    }
    return 0;
  }

  // Simple arithmetic: =A1+B1, =A1*2, etc.
  if (upperFormula.startsWith('=')) {
    try {
      let expr = upperFormula.slice(1);
      // Replace cell references with values
      expr = expr.replace(/([A-Z]+\d+)/gi, (match) => {
        const ref = parseCellRef(match);
        if (ref && data[ref.row] && data[ref.row][ref.col]) {
          return String(getCellNumericValue(data[ref.row][ref.col]));
        }
        return '0';
      });
      // Evaluate simple math expression (only numbers and basic operators)
      if (/^[\d\s+\-*/().]+$/.test(expr)) {
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${expr}`)();
        return typeof result === 'number' && !isNaN(result) ? result : '#ERROR';
      }
    } catch {
      return '#ERROR';
    }
  }

  return '#ERROR';
}

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

// Default column width
const DEFAULT_COL_WIDTH = 100;
const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 28;

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
  // Parse sheet content from JSON or use default
  const parsedContent = useMemo(() => {
    try {
      if (file.content) {
        return JSON.parse(file.content) as SheetContent;
      }
    } catch {
      // Invalid JSON, use default
    }
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
  const titleInputRef = useRef<HTMLInputElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  // Get number of columns (find max in any row)
  const numCols = useMemo(() => {
    let max = 10;
    for (const row of sheetContent.data) {
      if (row.length > max) max = row.length;
    }
    return max;
  }, [sheetContent.data]);

  const numRows = sheetContent.data.length;

  // Play window open sound on mount
  useEffect(() => {
    playSound('whoosh');
  }, []);

  // Auto-save with debounce
  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({
        title,
        content: JSON.stringify(sheetContent),
        updatedAt: new Date(),
      });
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  }, [title, sheetContent, onUpdate]);

  // Trigger save on content change
  useEffect(() => {
    const currentContent = JSON.stringify(sheetContent);
    if (currentContent !== file.content || title !== file.title) {
      triggerSave();
    }
  }, [sheetContent, title, file.content, file.title, triggerSave]);

  // Handle publish status change
  const handlePublishChange = (status: PublishStatus) => {
    onUpdate({ status });
  };

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Focus cell input when editing
  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
      cellInputRef.current.select();
    }
  }, [editingCell]);

  // Start drag from title bar
  const startDrag = (event: React.PointerEvent) => {
    if (!isMaximized) {
      dragControls.start(event);
    }
  };

  // Get cell value for display (evaluate formulas)
  const getCellDisplayValue = useCallback(
    (cell: SheetCell | null, col: number, row: number): string => {
      if (!cell || cell.value === null) return '';
      if (typeof cell.value === 'boolean') return cell.value ? '✓' : '';
      if (cell.formula || (typeof cell.value === 'string' && cell.value.startsWith('='))) {
        const result = evaluateFormula(
          cell.formula || (cell.value as string),
          sheetContent.data,
          col,
          row
        );
        if (typeof result === 'number') {
          return result.toLocaleString();
        }
        return String(result);
      }
      if (typeof cell.value === 'number') {
        return cell.value.toLocaleString();
      }
      return String(cell.value);
    },
    [sheetContent.data]
  );

  // Get raw cell value for editing
  const getCellRawValue = (cell: SheetCell | null): string => {
    if (!cell || cell.value === null) return '';
    if (cell.formula) return cell.formula;
    return String(cell.value);
  };

  // Update a cell
  const updateCell = (col: number, row: number, value: string) => {
    setSheetContent((prev) => {
      const newData = [...prev.data];

      // Ensure row exists
      while (newData.length <= row) {
        newData.push(Array(numCols).fill(null));
      }

      // Ensure columns exist in row
      const newRow = [...newData[row]];
      while (newRow.length <= col) {
        newRow.push(null);
      }

      // Parse the value
      let cellValue: SheetCell['value'] = value;
      let cellType: SheetCell['type'] = 'text';
      let formula: string | undefined;

      if (value.startsWith('=')) {
        formula = value;
        cellType = 'formula';
        cellValue = value;
      } else if (value === 'true' || value === 'false') {
        cellValue = value === 'true';
        cellType = 'checkbox';
      } else if (!isNaN(Number(value)) && value.trim() !== '') {
        cellValue = Number(value);
        cellType = 'number';
      }

      newRow[col] = value.trim() === '' ? null : { value: cellValue, type: cellType, formula };
      newData[row] = newRow;

      return { ...prev, data: newData };
    });
  };

  // Handle cell click
  const handleCellClick = (col: number, row: number) => {
    setSelectedCell({ col, row });
  };

  // Handle cell double-click to edit
  const handleCellDoubleClick = (col: number, row: number) => {
    const cell = sheetContent.data[row]?.[col] || null;
    setEditingCell({ col, row });
    setEditValue(getCellRawValue(cell));
  };

  // Save cell edit
  const saveCellEdit = () => {
    if (editingCell) {
      updateCell(editingCell.col, editingCell.row, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Cancel cell edit
  const cancelCellEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    if (editingCell) {
      if (e.key === 'Enter') {
        saveCellEdit();
        // Move to next row
        setSelectedCell({ col: editingCell.col, row: Math.min(editingCell.row + 1, numRows - 1) });
      } else if (e.key === 'Escape') {
        cancelCellEdit();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        saveCellEdit();
        // Move to next column
        setSelectedCell({ col: Math.min(editingCell.col + 1, numCols - 1), row: editingCell.row });
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCell({ col: selectedCell.col, row: Math.max(0, selectedCell.row - 1) });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCell({ col: selectedCell.col, row: Math.min(numRows - 1, selectedCell.row + 1) });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedCell({ col: Math.max(0, selectedCell.col - 1), row: selectedCell.row });
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedCell({ col: Math.min(numCols - 1, selectedCell.col + 1), row: selectedCell.row });
        break;
      case 'Enter':
      case 'F2':
        e.preventDefault();
        handleCellDoubleClick(selectedCell.col, selectedCell.row);
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        updateCell(selectedCell.col, selectedCell.row, '');
        break;
      default:
        // Start editing with the typed character
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setEditingCell(selectedCell);
          setEditValue(e.key);
        }
    }
  };

  // Add row
  const addRow = () => {
    setSheetContent((prev) => ({
      ...prev,
      data: [...prev.data, Array(numCols).fill(null)],
    }));
  };

  // Add column
  const addColumn = () => {
    setSheetContent((prev) => ({
      ...prev,
      data: prev.data.map((row) => [...row, null]),
    }));
  };

  // Delete row
  const deleteRow = (rowIndex: number) => {
    if (sheetContent.data.length <= 1) return;
    setSheetContent((prev) => ({
      ...prev,
      data: prev.data.filter((_, i) => i !== rowIndex),
    }));
    if (selectedCell?.row === rowIndex) {
      setSelectedCell(null);
    }
  };

  // Delete column
  const deleteColumn = (colIndex: number) => {
    if (numCols <= 1) return;
    setSheetContent((prev) => ({
      ...prev,
      data: prev.data.map((row) => row.filter((_, i) => i !== colIndex)),
    }));
    if (selectedCell?.col === colIndex) {
      setSelectedCell(null);
    }
  };

  // Get column width
  const getColWidth = (col: number) => {
    return columnWidths[col] || sheetContent.columnMeta?.[col]?.width || DEFAULT_COL_WIDTH;
  };

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
        width: isMaximized ? '100%' : 'min(1000px, 95vw)',
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
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${TITLE_BAR.paddingX}px`,
          height: TITLE_BAR.height,
          background: TITLE_BAR.background,
          borderBottom: TITLE_BAR.borderBottom,
          gap: 12,
          cursor: isMaximized ? 'default' : 'grab',
          flexShrink: 0,
          touchAction: 'none',
        }}
      >
        <TrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isMaximized={isMaximized}
          variant="macos"
        />

        {/* Sheet Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 16 }}>📊</span>

          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  setIsEditingTitle(false);
                }
              }}
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: 'var(--font-size-md, 14px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-base)',
                border: '1.5px solid var(--color-accent-primary)',
                borderRadius: 'var(--radius-sm, 6px)',
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              style={{
                fontSize: TITLE_BAR.titleFontSize,
                fontWeight: TITLE_BAR.titleFontWeight,
                fontFamily: 'var(--font-body)',
                color: TITLE_BAR.titleColor,
                opacity: TITLE_BAR.titleOpacityActive,
                cursor: 'text',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title="Click to edit title"
            >
              {title || 'Untitled Sheet'}
            </span>
          )}

          <GoOSPublishBadge status={file.status} />
        </div>

        <GoOSAutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
        <GoOSPublishToggle status={file.status} onChange={handlePublishChange} />
      </div>

      {/* Formula bar */}
      {selectedCell && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderBottom: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-subtle)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              minWidth: 40,
            }}
          >
            {getColumnLabel(selectedCell.col)}
            {selectedCell.row + 1}
          </span>
          <span style={{ color: 'var(--color-border-default)' }}>|</span>
          <span style={{ color: 'var(--color-text-primary)', flex: 1 }}>
            {getCellRawValue(sheetContent.data[selectedCell.row]?.[selectedCell.col] || null)}
          </span>
        </div>
      )}

      {/* Sheet Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: 'var(--color-bg-base)',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
          }}
        >
          {/* Column headers */}
          <thead>
            <tr>
              {/* Row number header */}
              <th
                style={{
                  width: 40,
                  minWidth: 40,
                  height: HEADER_HEIGHT,
                  background: 'var(--color-bg-subtle)',
                  borderBottom: '1px solid var(--color-border-default)',
                  borderRight: '1px solid var(--color-border-default)',
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  zIndex: 3,
                }}
              />
              {Array.from({ length: numCols }).map((_, colIndex) => (
                <th
                  key={colIndex}
                  style={{
                    width: getColWidth(colIndex),
                    minWidth: getColWidth(colIndex),
                    height: HEADER_HEIGHT,
                    background: 'var(--color-bg-subtle)',
                    borderBottom: '1px solid var(--color-border-default)',
                    borderRight: '1px solid var(--color-border-subtle)',
                    fontWeight: 600,
                    fontSize: 11,
                    color: 'var(--color-text-secondary)',
                    textAlign: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    {getColumnLabel(colIndex)}
                    <button
                      onClick={() => deleteColumn(colIndex)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        padding: 2,
                        opacity: 0.5,
                        fontSize: 10,
                      }}
                      title="Delete column"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
              {/* Add column button */}
              <th
                style={{
                  width: 32,
                  minWidth: 32,
                  height: HEADER_HEIGHT,
                  background: 'var(--color-bg-subtle)',
                  borderBottom: '1px solid var(--color-border-default)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}
              >
                <button
                  onClick={addColumn}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: 4,
                  }}
                  title="Add column"
                >
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
                    width: 40,
                    minWidth: 40,
                    height: ROW_HEIGHT,
                    background: 'var(--color-bg-subtle)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    borderRight: '1px solid var(--color-border-default)',
                    fontWeight: 600,
                    fontSize: 11,
                    color: 'var(--color-text-secondary)',
                    textAlign: 'center',
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    {rowIndex + 1}
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        padding: 2,
                        opacity: 0.5,
                        fontSize: 10,
                      }}
                      title="Delete row"
                    >
                      ×
                    </button>
                  </div>
                </td>
                {/* Cells */}
                {Array.from({ length: numCols }).map((_, colIndex) => {
                  const cell = row[colIndex] || null;
                  const isSelected =
                    selectedCell?.col === colIndex && selectedCell?.row === rowIndex;
                  const isEditing =
                    editingCell?.col === colIndex && editingCell?.row === rowIndex;

                  return (
                    <td
                      key={colIndex}
                      onClick={() => handleCellClick(colIndex, rowIndex)}
                      onDoubleClick={() => handleCellDoubleClick(colIndex, rowIndex)}
                      style={{
                        width: getColWidth(colIndex),
                        minWidth: getColWidth(colIndex),
                        height: ROW_HEIGHT,
                        borderBottom: '1px solid var(--color-border-subtle)',
                        borderRight: '1px solid var(--color-border-subtle)',
                        padding: 0,
                        background: isSelected
                          ? 'var(--color-accent-primary-subtle)'
                          : 'var(--color-bg-base)',
                        outline: isSelected
                          ? '2px solid var(--color-accent-primary)'
                          : 'none',
                        outlineOffset: -1,
                        cursor: 'cell',
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
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            padding: '0 8px',
                            border: 'none',
                            outline: 'none',
                            fontSize: 13,
                            fontFamily: 'var(--font-body)',
                            background: 'var(--color-bg-base)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            padding: '0 8px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color:
                              cell?.type === 'formula' ||
                              (typeof cell?.value === 'string' && cell.value.startsWith('='))
                                ? 'var(--color-accent-primary)'
                                : typeof cell?.value === 'number'
                                ? 'var(--color-text-primary)'
                                : 'var(--color-text-secondary)',
                            justifyContent:
                              typeof cell?.value === 'number' ? 'flex-end' : 'flex-start',
                          }}
                        >
                          {getCellDisplayValue(cell, colIndex, rowIndex)}
                        </div>
                      )}
                    </td>
                  );
                })}
                {/* Empty cell for add column */}
                <td
                  style={{
                    width: 32,
                    minWidth: 32,
                    height: ROW_HEIGHT,
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}
                />
              </tr>
            ))}
            {/* Add row */}
            <tr>
              <td
                colSpan={numCols + 2}
                style={{
                  height: ROW_HEIGHT,
                  padding: 0,
                }}
              >
                <button
                  onClick={addRow}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: 'var(--color-text-muted)',
                    fontSize: 12,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <Plus size={14} />
                  Add row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderTop: '1px solid rgba(23, 20, 18, 0.06)',
          background: 'rgba(23, 20, 18, 0.02)',
          fontSize: 'var(--font-size-xs, 10px)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 20 }}>
          <span>{numRows} rows</span>
          <span>{numCols} columns</span>
          {selectedCell && (
            <span>
              Selected: {getColumnLabel(selectedCell.col)}
              {selectedCell.row + 1}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, opacity: 0.6 }}>goOS Sheet</span>
      </div>
    </motion.div>
  );
}

export default GoOSSheetEditor;
