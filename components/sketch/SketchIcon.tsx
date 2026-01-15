import React from 'react';

interface SketchIconProps {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

export default function SketchIcon({ label, icon, onClick }: SketchIconProps) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center gap-2 cursor-pointer group w-24 p-2 transition-all hover:bg-black/5 rounded-lg active:scale-95"
        >
            <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:-translate-y-1 relative">
                {/* Shadow blob */}
                <div className="absolute bottom-0 w-12 h-3 bg-black/10 rounded-[100%] blur-sm group-hover:scale-90 transition-transform" />
                <div className="relative z-10 drop-shadow-md">
                    {icon}
                </div>
            </div>
            <span className="text-[#1a1a1a] font-sans text-xl font-bold text-center leading-tight bg-[#FFFCF0]/60 px-2 py-0.5 rounded border border-transparent group-hover:border-[#1a1a1a]/10">
                {label}
            </span>
        </div>
    );
}
