'use client';
import { Minus, Square, X, ChevronDown, FileText } from 'lucide-react';
import React from 'react';

interface WindowProps {
    title: string;
    children: React.ReactNode;
    toolbar?: React.ReactNode;
    className?: string;
}

export default function Window({ title, children, toolbar, className = '' }: WindowProps) {
    return (
        <div className={`flex flex-col bg-white rounded-md shadow-2xl overflow-hidden min-h-0 flex-1 max-w-[1200px] mx-4 my-4 border border-[#BFC1B7] ${className} animate-window-open`}>
            {/* Title Bar */}
            <div className="h-10 min-h-[40px] bg-[#E5E7E0] border-b border-[#BFC1B7] flex items-center justify-between px-3 select-none">

                {/* Left: File Menu */}
                <div className="flex items-center min-w-[80px]">
                    <button className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-black/5 text-[#4D4F46]">
                        <FileText size={14} />
                        <ChevronDown size={10} />
                    </button>
                </div>

                {/* Center: Title */}
                <div className="flex items-center gap-1 justify-center">
                    <span className="text-[13px] font-medium text-[#23251D]">{title}</span>
                    <ChevronDown size={12} className="text-[#73756B]" />
                </div>

                {/* Right: Window Controls */}
                <div className="flex items-center justify-end gap-1 min-w-[80px]">
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/10 text-[#73756B]">
                        <Minus size={12} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/10 text-[#73756B]">
                        <Square size={10} strokeWidth={2} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F54E00] hover:text-white text-[#73756B] transition-colors">
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* Optional Toolbar */}
            {toolbar && (
                <div className="bg-[#FDFDF8] border-b border-[#E5E7E0]">
                    {toolbar}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white p-6">
                {children}
            </div>
        </div>
    );
}
