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
            className="absolute flex flex-col bg-[#FFFFFF] border-2 border-[#2B4AE2] shadow-[6px_6px_0px_0px_#2B4AE2] font-sans"
            style={{ width, height, top, left }}
        >
            {/* Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[#2B4AE2] bg-[#FFFFFF] select-none">
                <div className="font-bold text-xl text-[#2B4AE2] tracking-wide">{title}</div>
                <div className="flex gap-2">
                    <button className="w-3.5 h-3.5 rounded-full flex items-center justify-center border-[1.5px] border-[#2B4AE2] bg-white group hover:bg-[#2B4AE2] transition-colors">
                        <Minus size={8} className="text-[#2B4AE2] group-hover:text-white" strokeWidth={3} />
                    </button>
                    <button className="w-3.5 h-3.5 rounded-full flex items-center justify-center border-[1.5px] border-[#2B4AE2] bg-white opacity-50">
                        <Square size={8} className="text-[#2B4AE2]" strokeWidth={3} />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center border-[1.5px] border-[#2B4AE2] bg-white group hover:bg-[#2B4AE2] transition-colors"
                    >
                        <X size={8} className="text-[#2B4AE2] group-hover:text-white" strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 text-[#2B4AE2] bg-[#FFFFFF]">
                {children}
            </div>
        </div>
    );
}
