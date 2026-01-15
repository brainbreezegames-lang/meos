'use client';

import React, { useState, useEffect } from 'react';
import {
    Folder,
    Terminal,
    HardDrive,
    MessageCircle,
    Mail,
    StickyNote,
    Battery,
    Wifi,
    Camera,
    Gamepad2,
    FileText,
    Heart,
    Calendar,
    X,
    Minus,
    Square,
    Music,
    Image as ImageIcon
} from 'lucide-react';

// ============================================
// SKETCH WINDOW COMPONENT
// ============================================
interface SketchWindowProps {
    title: string;
    children: React.ReactNode;
    width?: string;
    height?: string;
    top?: string;
    left?: string;
    onClose?: () => void;
    icon?: React.ReactNode;
    zIndex?: number;
}

function SketchWindow({
    title,
    children,
    width = '400px',
    height = '300px',
    top = '20%',
    left = '20%',
    onClose,
    icon,
    zIndex = 10
}: SketchWindowProps) {
    return (
        <div
            className="absolute flex flex-col bg-[#FFFCF0] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,0.25)] font-sans transition-all duration-200 hover:shadow-[6px_6px_0px_0px_rgba(26,26,26,0.3)]"
            style={{ width, height, top, left, zIndex }}
        >
            {/* Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[#1a1a1a] bg-[#F2F0E4] select-none cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-bold text-lg text-[#1a1a1a] tracking-wide">{title}</span>
                </div>
                <div className="flex gap-1.5">
                    <button className="w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded transition-colors border border-transparent hover:border-[#1a1a1a]/30">
                        <Minus size={12} color="#1a1a1a" strokeWidth={2.5} />
                    </button>
                    <button className="w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded transition-colors border border-transparent hover:border-[#1a1a1a]/30">
                        <Square size={10} color="#1a1a1a" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-5 h-5 flex items-center justify-center hover:bg-red-100 rounded transition-colors border border-transparent hover:border-red-300"
                    >
                        <X size={12} color="#1a1a1a" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto text-[#1a1a1a] bg-[#FFFCF0]">
                {children}
            </div>
        </div>
    );
}

// ============================================
// SKETCH ICON COMPONENT
// ============================================
interface SketchIconProps {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    badge?: string;
}

function SketchIcon({ label, icon, onClick, badge }: SketchIconProps) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center gap-1.5 cursor-pointer group w-20 p-2 transition-all hover:bg-black/5 rounded-lg active:scale-95 relative"
        >
            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:-translate-y-1 relative">
                {/* Shadow blob */}
                <div className="absolute bottom-0 w-10 h-2 bg-black/10 rounded-[100%] blur-sm group-hover:scale-90 transition-transform" />
                <div className="relative z-10 drop-shadow-sm">
                    {icon}
                </div>
                {badge && (
                    <div className="absolute -top-1 -right-1 bg-orange-400 text-white text-[10px] font-bold px-1 rounded-full border border-[#1a1a1a]">
                        {badge}
                    </div>
                )}
            </div>
            <span className="text-[#1a1a1a] font-bold text-sm text-center leading-tight">
                {label}
            </span>
        </div>
    );
}

// ============================================
// STICKY NOTE COMPONENT
// ============================================
interface StickyNoteProps {
    children: React.ReactNode;
    color?: string;
    rotation?: number;
    className?: string;
}

function StickyNoteCard({ children, color = '#FFB347', rotation = -2, className = '' }: StickyNoteProps) {
    return (
        <div
            className={`relative cursor-pointer hover:scale-105 transition-transform ${className}`}
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div
                className="w-28 min-h-[80px] p-3 border-2 border-[#1a1a1a]/60 shadow-md flex flex-col justify-center"
                style={{ backgroundColor: color }}
            >
                {children}
            </div>
            {/* Tape */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-[#e8e8e8]/90 border border-[#1a1a1a]/20 rotate-1" />
        </div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function GoOSPage() {
    const [time, setTime] = useState('14:17');
    const [windows, setWindows] = useState({
        goOS: true,
        quackmail: true,
        notes: false,
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const toggleWindow = (name: keyof typeof windows) => {
        setWindows(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <div className="theme-sketch min-h-screen w-full relative overflow-hidden font-sans cursor-default selection:bg-orange-200 selection:text-black">

            {/* ====================
                MENU BAR 
                ==================== */}
            <div className="h-9 flex items-center justify-between px-4 bg-[#F2F0E4] border-b-2 border-[#1a1a1a] z-50 relative shadow-sm">
                <div className="flex items-center gap-6">
                    <span className="font-bold text-xl tracking-tight">goOS</span>
                    <div className="flex gap-5 text-base">
                        <span className="hover:underline cursor-pointer hover:text-orange-600 transition-colors">File</span>
                        <span className="hover:underline cursor-pointer hover:text-orange-600 transition-colors">Edit</span>
                        <span className="hover:underline cursor-pointer hover:text-orange-600 transition-colors">View</span>
                        <span className="hover:underline cursor-pointer hover:text-orange-600 transition-colors">Help</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Battery size={18} className="text-[#1a1a1a]" />
                        <span className="text-xs">87%</span>
                    </div>
                    <Wifi size={18} className="text-[#1a1a1a]" />
                    <span className="font-bold text-base tabular-nums">{time}</span>
                </div>
            </div>

            {/* ====================
                DESKTOP ICONS - LEFT
                ==================== */}
            <div className="absolute top-14 left-6 flex flex-col gap-4 items-start z-0">
                {/* Nest Sticky Note */}
                <StickyNoteCard color="#FFB347" rotation={-3}>
                    <span className="font-bold text-lg">Nest:</span>
                </StickyNoteCard>

                {/* Todo Sticky Note */}
                <StickyNoteCard color="#FFFACD" rotation={4} className="ml-4">
                    <span className="font-bold text-sm">todo:</span>
                    <span className="text-lg font-bold text-orange-600 mt-1">honk!</span>
                </StickyNoteCard>

                <div className="mt-4 flex flex-col gap-2">
                    <SketchIcon label="Nest" icon={<Folder size={36} fill="#FFB347" strokeWidth={2} className="text-[#1a1a1a]" />} />
                    <SketchIcon label="Shell" icon={<Terminal size={36} className="text-[#1a1a1a]" />} badge="250+" />
                    <SketchIcon label="Migration" icon={<HardDrive size={36} className="text-[#1a1a1a]" />} />

                    {/* Honk App with Detective Duck */}
                    <div className="flex flex-col items-center gap-1 cursor-pointer group w-20 p-2 hover:bg-black/5 rounded-lg">
                        <div className="w-16 h-16 relative">
                            <img src="/assets/sketch/duck-detective.png" alt="Honk" className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-sm font-bold">Honk<span className="text-orange-500">🔥</span></span>
                    </div>
                </div>
            </div>

            {/* ====================
                RIGHT SIDE WIDGETS
                ==================== */}
            <div className="absolute top-14 right-6 flex flex-col gap-6 items-end z-0">
                <SketchIcon label="Mail" icon={<Mail size={36} className="text-[#1a1a1a]" />} badge="3" />
                <SketchIcon label="Chat" icon={<MessageCircle size={36} className="text-[#1a1a1a]" />} />

                {/* Notes widget */}
                <div
                    onClick={() => toggleWindow('notes')}
                    className="flex flex-col items-center gap-1 cursor-pointer group hover:bg-black/5 rounded-lg p-2"
                >
                    <div className="w-12 h-14 bg-[#FFFACD] border-2 border-[#1a1a1a]/60 p-1.5 text-[8px] leading-tight shadow-sm group-hover:scale-105 transition-transform">
                        <div className="w-full h-0.5 bg-[#1a1a1a]/30 mb-0.5" />
                        <div className="w-3/4 h-0.5 bg-[#1a1a1a]/30 mb-0.5" />
                        <div className="w-full h-0.5 bg-[#1a1a1a]/30 mb-0.5" />
                        <div className="text-red-500 font-bold">?!</div>
                    </div>
                    <span className="font-bold text-sm">Notes</span>
                </div>

                {/* Plant decoration */}
                <div className="mt-4">
                    <img src="/assets/sketch/plant-pot.png" alt="Plant" className="w-16 h-20 object-contain opacity-80" />
                </div>

                {/* Coffee decoration */}
                <img src="/assets/sketch/coffee-cup.png" alt="Coffee" className="w-14 h-14 object-contain opacity-80" />
            </div>

            {/* ====================
                WINDOWS 
                ==================== */}

            {/* Main Image Viewer */}
            {windows.goOS && (
                <SketchWindow
                    title="goOS"
                    width="480px"
                    height="380px"
                    left="28%"
                    top="12%"
                    onClose={() => toggleWindow('goOS')}
                    icon={<ImageIcon size={16} className="text-[#1a1a1a]" />}
                    zIndex={20}
                >
                    <div className="w-full h-full flex flex-col">
                        <div className="relative flex-1 bg-white border border-[#1a1a1a]/50 m-3 overflow-hidden">
                            <img
                                src="/assets/sketch/duck-water.png"
                                alt="Duck"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-white/80 px-2 py-0.5 rounded border border-[#1a1a1a]/30">
                                Bookmark cut <span className="text-red-500">♦</span>
                            </div>
                        </div>
                        <div className="h-10 flex items-center justify-between px-4 bg-[#F2F0E4] border-t border-[#1a1a1a]/30">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">Migration In</span>
                                <div className="flex gap-0.5 text-orange-500">
                                    <span>▶</span><span>▶</span><span>▶</span><span>▶</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-xs px-2 py-1 bg-white border border-[#1a1a1a]/30 rounded hover:bg-black/5">◀ Prev</button>
                                <button className="text-xs px-2 py-1 bg-white border border-[#1a1a1a]/30 rounded hover:bg-black/5">Next ▶</button>
                            </div>
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* Quackmail */}
            {windows.quackmail && (
                <SketchWindow
                    title="Quackmail"
                    width="380px"
                    height="240px"
                    left="52%"
                    top="48%"
                    onClose={() => toggleWindow('quackmail')}
                    icon={<Mail size={16} />}
                    zIndex={15}
                >
                    <div className="flex flex-col h-full p-4">
                        <div className="flex items-center justify-between border-b border-dashed border-[#1a1a1a]/50 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">From</span>
                                <span className="font-bold">David ▼</span>
                                <span className="text-xs text-gray-400">12:05 PM</span>
                            </div>
                            <div className="text-sm">
                                | Fienb<Heart size={12} className="inline text-red-400 fill-red-400" />
                            </div>
                        </div>
                        <div className="flex-1 text-lg leading-relaxed">
                            <p className="font-bold">How's good!!</p>
                            <p className="mt-2">How's the migration going?</p>
                        </div>
                        <div className="mt-auto pt-2 border-t border-[#1a1a1a]/30 flex justify-end gap-3">
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#1a1a1a]/40 rounded hover:bg-black/5 text-sm font-medium transition-colors">
                                ↩ Reply
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#1a1a1a]/40 rounded hover:bg-black/5 text-sm font-medium transition-colors">
                                → Forward
                            </button>
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* Notes Window */}
            {windows.notes && (
                <SketchWindow
                    title="Notes"
                    width="320px"
                    height="280px"
                    left="15%"
                    top="35%"
                    onClose={() => toggleWindow('notes')}
                    icon={<StickyNote size={16} fill="#FFB347" />}
                    zIndex={25}
                >
                    <div className="p-4 h-full bg-[#FFFACD] leading-relaxed">
                        <div className="border-b border-[#1a1a1a]/20 pb-2 mb-3">
                            <span className="font-bold">📝 Important Notes</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <input type="checkbox" className="mt-1" />
                                <span>Finish the migration</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <input type="checkbox" checked readOnly className="mt-1" />
                                <span className="line-through text-gray-500">Reply to David</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <input type="checkbox" className="mt-1" />
                                <span className="text-orange-600 font-bold">HONK!!!</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <input type="checkbox" className="mt-1" />
                                <span>Feed the ducks 🦆</span>
                            </li>
                        </ul>
                    </div>
                </SketchWindow>
            )}

            {/* ====================
                DOCK 
                ==================== */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                <div className="relative bg-[#F2F0E4] border-2 border-[#1a1a1a] px-5 py-3 rounded-2xl shadow-[0px_6px_0px_0px_rgba(26,26,26,0.2)] flex items-center gap-3">
                    {/* Dock Items */}
                    <button className="w-11 h-11 flex items-center justify-center hover:-translate-y-2 transition-transform duration-200">
                        <img src="/assets/sketch/rubber-duck.png" className="w-9 h-9 rounded-lg" alt="Duck" />
                    </button>
                    <button className="w-11 h-11 flex items-center justify-center hover:-translate-y-2 transition-transform duration-200">
                        <Folder size={28} fill="#FFB347" className="text-[#1a1a1a]" />
                    </button>
                    <button className="w-11 h-11 flex items-center justify-center hover:-translate-y-2 transition-transform duration-200">
                        <div className="w-8 h-8 bg-white border-2 border-[#1a1a1a] rounded flex items-center justify-center font-bold text-lg">
                            23
                        </div>
                    </button>
                    <button className="w-11 h-11 flex items-center justify-center hover:-translate-y-2 transition-transform duration-200 relative">
                        <Mail size={28} className="text-[#1a1a1a]" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#1a1a1a]">3</span>
                    </button>
                    <button className="w-11 h-11 flex items-center justify-center hover:-translate-y-2 transition-transform duration-200">
                        <Camera size={28} className="text-[#1a1a1a]" />
                    </button>
                    <button className="w-11 h-11 flex items-center justify-center hover:-translate-y-2 transition-transform duration-200">
                        <FileText size={28} className="text-[#1a1a1a]" />
                    </button>

                    {/* Separator */}
                    <div className="w-0.5 h-10 bg-[#1a1a1a]/20 mx-1" />

                    <button className="w-11 h-11 flex items-center justify-center hover:-translate-y-2 transition-transform duration-200">
                        <Gamepad2 size={28} className="text-[#1a1a1a]" />
                    </button>
                    <button className="w-11 h-11 flex items-center justify-center hover:-translate-y-2 transition-transform duration-200">
                        <Music size={28} className="text-[#1a1a1a]" />
                    </button>

                    {/* Honk Notification Bubble */}
                    <div className="absolute -right-4 -top-12 bg-[#F2F0E4] border-2 border-[#1a1a1a] px-3 py-1.5 rounded-lg shadow-md animate-bounce">
                        <span className="font-bold whitespace-nowrap text-sm">⚠ Honk</span>
                        <div className="absolute -bottom-2 right-4 w-3 h-3 bg-[#F2F0E4] border-b-2 border-r-2 border-[#1a1a1a] rotate-45" />
                    </div>
                </div>
            </div>

            {/* ====================
                FLOATING ELEMENTS
                ==================== */}

            {/* Open Nest Button */}
            <div className="absolute bottom-36 left-28 z-10">
                <div className="relative">
                    <button className="bg-[#FFFCF0] border-2 border-[#1a1a1a] px-5 py-3 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-xl hover:bg-orange-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all">
                        Open Nest
                    </button>
                    {/* Coffee decoration */}
                    <img
                        src="/assets/sketch/coffee-cup.png"
                        alt="Coffee"
                        className="absolute -left-20 -bottom-4 w-16 h-16 object-contain opacity-90 -rotate-6"
                    />
                </div>
            </div>

            {/* Scattered sticky notes decoration */}
            <div className="absolute top-1/3 right-1/4 z-0 opacity-60">
                <div className="w-16 h-16 bg-[#FFFACD] border border-[#1a1a1a]/30 transform rotate-12 shadow-sm" />
            </div>
            <div className="absolute bottom-1/4 left-1/3 z-0 opacity-40">
                <div className="w-12 h-14 bg-[#FFB347] border border-[#1a1a1a]/30 transform -rotate-6 shadow-sm" />
            </div>

        </div>
    );
}
