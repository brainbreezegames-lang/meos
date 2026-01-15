'use client';

import React, { useState } from 'react';
import {
    Folder,
    Terminal,
    HardDrive,
    MessageCircle,
    Mail,
    StickyNote,
    Battery,
    Wifi,
    Search,
    Camera,
    Gamepad2,
    Coffee,
    FileText,
    Image as ImageIcon
} from 'lucide-react';
import SketchWindow from '@/components/sketch/SketchWindow';
import SketchIcon from '@/components/sketch/SketchIcon';

export default function GoOSPage() {
    const [windows, setWindows] = useState({
        goOS: true,
        quackmail: true,
        nest: false,
    });

    const toggleWindow = (name: keyof typeof windows) => {
        setWindows(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <div className="theme-sketch min-h-screen w-full relative overflow-hidden font-sans cursor-default selection:bg-orange-200 selection:text-black">
            {/* Background Texture Overlay (Optional subtle noise if needed, handled by CSS) */}

            {/* ====================
          MENU BAR 
          ==================== */}
            <div className="h-8 flex items-center justify-between px-4 bg-[#F2F0E4] border-b-2 border-[#1a1a1a] z-50 relative">
                <div className="flex items-center gap-6">
                    <span className="font-bold text-xl tracking-tight">goOS</span>
                    <div className="flex gap-4 text-lg">
                        <span className="hover:underline cursor-pointer">File</span>
                        <span className="hover:underline cursor-pointer">Edit</span>
                        <span className="hover:underline cursor-pointer">View</span>
                        <span className="hover:underline cursor-pointer">Help</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Battery size={20} className="text-[#1a1a1a]" />
                    <Wifi size={20} className="text-[#1a1a1a]" />
                    <span className="font-bold text-lg">14:17</span>
                </div>
            </div>

            {/* ====================
          DESKTOP ICONS 
          ==================== */}
            <div className="absolute top-12 left-6 flex flex-col gap-6 items-start z-0">
                {/* Special Nest Note */}
                <div className="relative group cursor-pointer mb-4">
                    <div className="bg-[#FFB347] w-28 h-20 -rotate-2 border-2 border-[#1a1a1a] shadow-sm flex items-center justify-center">
                        <span className="font-bold text-xl">Nest:</span>
                    </div>
                    {/* Tape */}
                    <div className="absolute -top-2 left-8 w-8 h-3 bg-[#e0e0e0]/80 border border-[#1a1a1a]/20 rotate-1"></div>
                </div>

                <SketchIcon label="Nest" icon={<Folder size={40} fill="#FFB347" strokeWidth={2} className="text-[#1a1a1a]" />} />
                <SketchIcon label="Shell" icon={<Terminal size={40} className="text-[#1a1a1a]" />} />
                <SketchIcon label="Migration" icon={<HardDrive size={40} className="text-[#1a1a1a]" />} />

                {/* Honk App */}
                <div className="mt-2 flex flex-col items-center gap-1 cursor-pointer group w-24">
                    <div className="w-20 h-20 relative">
                        <img src="/assets/sketch/duck-detective.png" alt="Honk" className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-xl font-bold bg-[#FFFCF0]/80 px-1 rounded">Honk</span>
                </div>
            </div>

            {/* Right Side Widgets */}
            <div className="absolute top-12 right-6 flex flex-col gap-8 items-end z-0">
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                    <Mail size={40} className="text-[#1a1a1a]" />
                    <span className="font-bold">Mail</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                    <MessageCircle size={40} className="text-[#1a1a1a]" />
                    <span className="font-bold">Chat</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                    <StickyNote size={40} fill="#FFB347" className="text-[#1a1a1a]" />
                    <span className="font-bold">Notes</span>
                </div>
            </div>

            {/* ====================
          WINDOWS 
          ==================== */}

            {/* Main Image Viewer */}
            {windows.goOS && (
                <SketchWindow
                    title="goOS"
                    width="500px"
                    height="380px"
                    left="30%"
                    top="15%"
                    onClose={() => toggleWindow('goOS')}
                >
                    <div className="w-full h-full flex flex-col">
                        <div className="relative flex-1 bg-white border border-[#1a1a1a] p-2 m-2">
                            <img
                                src="/assets/sketch/duck-water.png"
                                alt="Duck"
                                className="w-full h-full object-cover grayscale-[0.2] contrast-125"
                            />
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-xs">
                                Bookmark cut ♦
                            </div>
                        </div>
                        <div className="h-8 flex items-center px-4 gap-2 text-[#1a1a1a]">
                            <span className="font-bold">Migration In</span>
                            <div className="flex gap-1">
                                <span>▶</span><span>▶</span><span>▶</span><span>▶</span>
                            </div>
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* Quackmail */}
            {windows.quackmail && (
                <SketchWindow
                    title="Quackmail"
                    width="400px"
                    height="250px"
                    left="55%"
                    top="45%"
                    onClose={() => toggleWindow('quackmail')}
                >
                    <div className="flex flex-col h-full">
                        <div className="border-b border-dashed border-[#1a1a1a] pb-2 mb-2 text-lg">
                            <span className="font-bold text-gray-500">From</span> <span className="font-bold">David</span> <span className="text-sm">12:05 PM</span>
                        </div>
                        <div className="flex-1 text-xl leading-relaxed">
                            <p>How's good!!</p>
                            <p className="mt-2">How's the migration going?</p>
                        </div>
                        <div className="mt-auto border-t border-[#1a1a1a] flex justify-end p-2 gap-4">
                            <button className="hover:bg-black/5 px-2 rounded">Reply ↵</button>
                            <button className="hover:bg-black/5 px-2 rounded">Forward →</button>
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* ====================
          DOCK 
          ==================== */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="bg-[#F2F0E4] border-2 border-[#1a1a1a] px-4 py-2 rounded-xl shadow-[0px_8px_0px_0px_rgba(26,26,26,0.2)] flex items-end gap-4 min-w-[500px] h-20 items-center justify-center">
                    <button className="hover:-translate-y-2 transition-transform duration-300 transform"><img src="/assets/sketch/duck-water.png" className="w-10 h-10 rounded border border-black" /></button>
                    <button className="hover:-translate-y-2 transition-transform duration-300 transform"><Folder size={32} fill="#FFB347" className="text-[#1a1a1a]" /></button>
                    <button className="hover:-translate-y-2 transition-transform duration-300 transform"><SketchIcon label="" icon={<span className="text-2xl font-bold bg-white border border-black px-1 rounded">23</span>} /></button>
                    <button className="hover:-translate-y-2 transition-transform duration-300 transform"><FileText size={32} className="text-[#1a1a1a]" /></button>
                    <button className="hover:-translate-y-2 transition-transform duration-300 transform"><Mail size={32} className="text-[#1a1a1a]" /></button>
                    <button className="hover:-translate-y-2 transition-transform duration-300 transform"><Camera size={32} className="text-[#1a1a1a]" /></button>
                    <div className="w-0.5 h-10 bg-[#1a1a1a]/20 mx-2"></div>
                    <button className="hover:-translate-y-2 transition-transform duration-300 transform"><Gamepad2 size={32} className="text-[#1a1a1a]" /></button>
                    <button className="hover:-translate-y-2 transition-transform duration-300 transform relative">
                        <Coffee size={32} className="text-[#1a1a1a]" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                    </button>

                    <div className="absolute -right-6 -top-10 bg-[#F2F0E4] border-2 border-[#1a1a1a] p-2 rounded-lg shadow-md animate-bounce">
                        <span className="font-bold whitespace-nowrap">⚠ Honk</span>
                        <div className="absolute -bottom-2 right-4 w-3 h-3 bg-[#F2F0E4] border-b-2 border-r-2 border-[#1a1a1a] rotate-45"></div>
                    </div>
                </div>
            </div>

            {/* Floating Elements / Decoration */}
            <div className="absolute bottom-32 left-32">
                <div className="bg-[#FFFCF0] border-2 border-[#1a1a1a] p-4 rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <button className="font-bold text-2xl hover:text-orange-600 transition-colors">Open Nest</button>
                </div>
                <Coffee size={48} className="absolute -left-16 bottom-0 text-[#1a1a1a]" />
            </div>

        </div>
    );
}
