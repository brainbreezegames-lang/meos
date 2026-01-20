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
            className="absolute flex flex-col bg-[#FFFFFF] border-[1.5px] border-[#4A6CF7] shadow-[6px_6px_0px_0px_#4A6CF7] font-sans rounded-xl"
            style={{ width, height, top, left }}
        >
            {/* Title Bar */}
            <div className="flex items-center px-4 py-3 border-b-[1.5px] border-[#4A6CF7] bg-[#FFFFFF] select-none rounded-t-xl gap-4">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A6CF7]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A6CF7]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A6CF7]" />
                </div>
                <div className="font-medium text-[13px] text-[#4A6CF7] flex-1 text-center">{title}</div>
                <div className="w-12" /> {/* Spacer for balance */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 text-[#4A6CF7] bg-[#FFFFFF] rounded-b-xl">
                {children}
            </div>
        </div>
    );
}
