import React from 'react';
import { X, Minus, Square } from 'lucide-react';

interface SketchWindowProps {
    title: string;
    children: React.ReactNode;
    width?: string;
    height?: string;
    top?: string;
    left?: string;
    onClose?: () => void;
}

export default function SketchWindow({
    title,
    children,
    width = '400px',
    height = '300px',
    top = '20%',
    left = '20%',
    onClose
}: SketchWindowProps) {
    return (
        <div
            className="absolute flex flex-col bg-[#FFFCF0] border-2 border-[#1a1a1a] shadow-[5px_5px_0px_0px_rgba(26,26,26,0.3)] font-sans"
            style={{ width, height, top, left }}
        >
            {/* Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[#1a1a1a] bg-[#F2F0E4] select-none">
                <div className="font-bold text-xl text-[#1a1a1a] tracking-wide">{title}</div>
                <div className="flex gap-2">
                    <button className="p-0.5 hover:bg-black/10 rounded transition-colors border border-transparent hover:border-[#1a1a1a]">
                        <Minus size={18} color="#1a1a1a" strokeWidth={2.5} />
                    </button>
                    <button className="p-0.5 hover:bg-black/10 rounded transition-colors border border-transparent hover:border-[#1a1a1a]">
                        <Square size={14} color="#1a1a1a" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-0.5 hover:bg-red-100 rounded transition-colors border border-transparent hover:border-[#1a1a1a]"
                    >
                        <X size={18} color="#1a1a1a" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 text-[#1a1a1a] bg-[#FFFCF0]">
                {children}
            </div>
        </div>
    );
}
