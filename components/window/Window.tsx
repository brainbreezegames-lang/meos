'use client';
import { Minus, Square, X, ChevronDown, FileText } from 'lucide-react';
import React from 'react';
import { WINDOW, TITLE_BAR, TRAFFIC, CONTENT } from '../desktop/windowStyles';

interface WindowProps {
    title: string;
    children: React.ReactNode;
    toolbar?: React.ReactNode;
    className?: string;
}

export default function Window({ title, children, toolbar, className = '' }: WindowProps) {
    return (
        <div
            className={`flex flex-col overflow-hidden min-h-0 flex-1 max-w-[1200px] mx-4 my-4 animate-window-open ${className}`}
            style={{
                background: WINDOW.background,
                borderRadius: WINDOW.borderRadius,
                border: WINDOW.border,
                boxShadow: WINDOW.shadow,
            }}
        >
            {/* Title Bar */}
            <div
                className="flex items-center justify-between px-3 select-none"
                style={{
                    height: TITLE_BAR.height,
                    minHeight: TITLE_BAR.height,
                    background: TITLE_BAR.background,
                    borderBottom: TITLE_BAR.borderBottom,
                }}
            >
                {/* Left: File Menu */}
                <div className="flex items-center min-w-[80px]">
                    <button
                        className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-black/5"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <FileText size={14} />
                        <ChevronDown size={10} />
                    </button>
                </div>

                {/* Center: Title */}
                <div className="flex items-center gap-1 justify-center">
                    <span
                        style={{
                            fontSize: TITLE_BAR.titleFontSize,
                            fontWeight: TITLE_BAR.titleFontWeight,
                            color: TITLE_BAR.titleColor,
                            letterSpacing: TITLE_BAR.titleLetterSpacing,
                        }}
                    >
                        {title}
                    </span>
                    <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
                </div>

                {/* Right: Window Controls */}
                <div className="flex items-center justify-end gap-1 min-w-[80px]">
                    <button
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/10"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        <Minus size={12} />
                    </button>
                    <button
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/10"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        <Square size={10} strokeWidth={2} />
                    </button>
                    <button
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-error)] hover:text-white transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* Optional Toolbar */}
            {toolbar && (
                <div
                    style={{
                        background: 'var(--color-bg-base)',
                        borderBottom: TITLE_BAR.borderBottom,
                    }}
                >
                    {toolbar}
                </div>
            )}

            {/* Content Area */}
            <div
                className="flex-1 overflow-y-auto"
                style={{
                    background: WINDOW.background,
                    padding: CONTENT.padding,
                }}
            >
                {children}
            </div>
        </div>
    );
}
