'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Folder,
    Terminal,
    HardDrive,
    MessageCircle,
    Mail,
    StickyNote as StickyNoteIcon,
    Battery,
    Wifi,
    Camera,
    Gamepad2,
    FileText,
    Heart,
    X,
    Minus,
    Square,
    Music,
    Image as ImageIcon,
    Settings,
    Trash2
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface WindowState {
    id: string;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    zIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

// ============================================
// SKETCH WINDOW COMPONENT
// ============================================
interface SketchWindowProps {
    id: string;
    title: string;
    children: React.ReactNode;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    onClose: () => void;
    onMinimize: () => void;
    onFocus: () => void;
    icon?: React.ReactNode;
}

function SketchWindow({
    id,
    title,
    children,
    x,
    y,
    width,
    height,
    zIndex,
    onClose,
    onMinimize,
    onFocus,
    icon
}: SketchWindowProps) {
    return (
        <div
            className="absolute flex flex-col bg-[#FFFDF5] rounded-sm overflow-hidden"
            style={{
                left: x,
                top: y,
                width,
                height,
                zIndex,
                border: '2px solid #2a2a2a',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.15)',
                fontFamily: "'Patrick Hand', cursive"
            }}
            onMouseDown={onFocus}
        >
            {/* Title Bar */}
            <div
                className="h-8 flex items-center justify-between px-3 select-none cursor-move"
                style={{
                    background: '#F5F3E8',
                    borderBottom: '2px solid #2a2a2a'
                }}
            >
                <div className="flex items-center gap-2">
                    {icon && <span className="opacity-70">{icon}</span>}
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#2a2a2a' }}>
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                        className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-black/10 transition-colors"
                    >
                        <Minus size={12} strokeWidth={2.5} />
                    </button>
                    <button className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-black/10 transition-colors">
                        <Square size={10} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-red-100 transition-colors"
                    >
                        <X size={12} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto" style={{ background: '#FFFDF5' }}>
                {children}
            </div>
        </div>
    );
}

// ============================================
// DESKTOP ICON COMPONENT
// ============================================
interface DesktopIconProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    badge?: number;
    isActive?: boolean;
}

function DesktopIcon({ label, icon, onClick, badge, isActive }: DesktopIconProps) {
    return (
        <button
            onClick={onClick}
            onDoubleClick={onClick}
            className={`
                flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer
                transition-all duration-150 w-16
                ${isActive ? 'bg-orange-100/50' : 'hover:bg-black/5'}
                active:scale-95
            `}
            style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
            <div className="relative w-10 h-10 flex items-center justify-center">
                {icon}
                {badge !== undefined && badge > 0 && (
                    <span
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1"
                        style={{ background: '#E85D04', border: '1.5px solid #2a2a2a' }}
                    >
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </div>
            <span style={{ fontSize: '13px', color: '#2a2a2a', textAlign: 'center', lineHeight: 1.2 }}>
                {label}
            </span>
        </button>
    );
}

// ============================================
// DOCK ICON COMPONENT
// ============================================
interface DockIconProps {
    icon: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
    badge?: number;
    label?: string;
}

function DockIcon({ icon, onClick, isActive, badge, label }: DockIconProps) {
    return (
        <button
            onClick={onClick}
            className="relative group flex flex-col items-center"
            title={label}
        >
            <div
                className={`
                    w-10 h-10 flex items-center justify-center rounded-lg
                    transition-all duration-200 group-hover:-translate-y-1.5
                    ${isActive ? 'bg-orange-100' : 'hover:bg-black/5'}
                `}
                style={{ border: isActive ? '1.5px solid #2a2a2a' : 'none' }}
            >
                {icon}
                {badge !== undefined && badge > 0 && (
                    <span
                        className="absolute -top-1 -right-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-0.5"
                        style={{ background: '#E85D04' }}
                    >
                        {badge}
                    </span>
                )}
            </div>
            {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#2a2a2a] mt-0.5" />
            )}
        </button>
    );
}

// ============================================
// STICKY NOTE COMPONENT
// ============================================
function StickyNote({ children, color = '#FFB347', rotation = 0 }: {
    children: React.ReactNode;
    color?: string;
    rotation?: number;
}) {
    return (
        <div
            className="relative cursor-pointer hover:scale-105 transition-transform"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div
                className="p-3 shadow-md"
                style={{
                    backgroundColor: color,
                    border: '1.5px solid rgba(0,0,0,0.2)',
                    fontFamily: "'Patrick Hand', cursive",
                    minWidth: '100px'
                }}
            >
                {children}
            </div>
            {/* Tape */}
            <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2.5"
                style={{
                    background: 'rgba(200,200,200,0.6)',
                    border: '1px solid rgba(0,0,0,0.1)'
                }}
            />
        </div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function GoOSPage() {
    const [time, setTime] = useState('14:17');
    const [topZIndex, setTopZIndex] = useState(100);

    // Window states
    const [windows, setWindows] = useState<Record<string, WindowState>>({
        goOS: { id: 'goOS', title: 'goOS', isOpen: true, isMinimized: false, zIndex: 10, x: 280, y: 60, width: 420, height: 340 },
        quackmail: { id: 'quackmail', title: 'Quackmail', isOpen: true, isMinimized: false, zIndex: 11, x: 500, y: 280, width: 340, height: 220 },
        notes: { id: 'notes', title: 'Notes', isOpen: false, isMinimized: false, zIndex: 12, x: 150, y: 150, width: 280, height: 260 },
        shell: { id: 'shell', title: 'Shell', isOpen: false, isMinimized: false, zIndex: 13, x: 200, y: 100, width: 450, height: 300 },
        nest: { id: 'nest', title: 'Nest', isOpen: false, isMinimized: false, zIndex: 14, x: 100, y: 80, width: 400, height: 350 },
        chat: { id: 'chat', title: 'Chat', isOpen: false, isMinimized: false, zIndex: 15, x: 600, y: 100, width: 320, height: 400 },
        settings: { id: 'settings', title: 'Settings', isOpen: false, isMinimized: false, zIndex: 16, x: 350, y: 120, width: 360, height: 300 },
    });

    // Update time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Window operations
    const openWindow = useCallback((id: string) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: topZIndex + 1 }
        }));
        setTopZIndex(prev => prev + 1);
    }, [topZIndex]);

    const closeWindow = useCallback((id: string) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: false }
        }));
    }, []);

    const minimizeWindow = useCallback((id: string) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], isMinimized: true }
        }));
    }, []);

    const focusWindow = useCallback((id: string) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], zIndex: topZIndex + 1, isMinimized: false }
        }));
        setTopZIndex(prev => prev + 1);
    }, [topZIndex]);

    const toggleWindow = useCallback((id: string) => {
        const win = windows[id];
        if (!win.isOpen || win.isMinimized) {
            openWindow(id);
        } else {
            minimizeWindow(id);
        }
    }, [windows, openWindow, minimizeWindow]);

    return (
        <div
            className="min-h-screen w-full relative overflow-hidden cursor-default"
            style={{
                fontFamily: "'Patrick Hand', cursive",
                background: '#FAF8F0',
                backgroundImage: 'radial-gradient(#d8d8d8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}
        >
            {/* ====================
                MENU BAR 
                ==================== */}
            <div
                className="h-8 flex items-center justify-between px-4 relative z-[1000]"
                style={{
                    background: '#F0EDE0',
                    borderBottom: '2px solid #2a2a2a'
                }}
            >
                <div className="flex items-center gap-8">
                    <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>goOS</span>
                    <div className="flex gap-6" style={{ fontSize: '15px' }}>
                        {['File', 'Edit', 'View', 'Help'].map(item => (
                            <span key={item} className="cursor-pointer hover:underline">{item}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4" style={{ fontSize: '14px' }}>
                    <div className="flex items-center gap-1.5">
                        <Battery size={16} />
                        <span>87%</span>
                    </div>
                    <Wifi size={16} />
                    <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
                </div>
            </div>

            {/* ====================
                DESKTOP ICONS - LEFT
                ==================== */}
            <div className="absolute top-12 left-4 flex flex-col gap-1 z-10">
                {/* Sticky Notes */}
                <div className="mb-4 flex flex-col gap-3">
                    <StickyNote color="#FFB347" rotation={-3}>
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Nest:</span>
                    </StickyNote>
                    <StickyNote color="#FFF9C4" rotation={5}>
                        <span style={{ fontSize: '14px' }}>todo:</span>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#E85D04' }}>honk!</div>
                    </StickyNote>
                </div>

                <DesktopIcon
                    label="Nest"
                    icon={<Folder size={28} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} />}
                    onClick={() => toggleWindow('nest')}
                    isActive={windows.nest.isOpen && !windows.nest.isMinimized}
                />
                <DesktopIcon
                    label="Shell"
                    icon={<Terminal size={28} stroke="#2a2a2a" strokeWidth={1.5} />}
                    onClick={() => toggleWindow('shell')}
                    badge={250}
                    isActive={windows.shell.isOpen && !windows.shell.isMinimized}
                />
                <DesktopIcon
                    label="Migration"
                    icon={<HardDrive size={28} stroke="#2a2a2a" strokeWidth={1.5} />}
                    onClick={() => { }}
                />
                <DesktopIcon
                    label="Honk"
                    icon={<img src="/assets/sketch/duck-detective.png" alt="Honk" className="w-8 h-8 object-contain" />}
                    onClick={() => { }}
                />
            </div>

            {/* ====================
                DESKTOP ICONS - RIGHT
                ==================== */}
            <div className="absolute top-12 right-4 flex flex-col gap-1 z-10">
                <DesktopIcon
                    label="Mail"
                    icon={<Mail size={28} stroke="#2a2a2a" strokeWidth={1.5} />}
                    onClick={() => toggleWindow('quackmail')}
                    badge={3}
                    isActive={windows.quackmail.isOpen && !windows.quackmail.isMinimized}
                />
                <DesktopIcon
                    label="Chat"
                    icon={<MessageCircle size={28} stroke="#2a2a2a" strokeWidth={1.5} />}
                    onClick={() => toggleWindow('chat')}
                    isActive={windows.chat.isOpen && !windows.chat.isMinimized}
                />
                <DesktopIcon
                    label="Notes"
                    icon={<StickyNoteIcon size={28} fill="#FFF9C4" stroke="#2a2a2a" strokeWidth={1.5} />}
                    onClick={() => toggleWindow('notes')}
                    isActive={windows.notes.isOpen && !windows.notes.isMinimized}
                />

                {/* Decorative elements */}
                <div className="mt-8 opacity-70">
                    <img src="/assets/sketch/plant-pot.png" alt="" className="w-14 h-18 object-contain" />
                </div>
                <div className="mt-2 opacity-70">
                    <img src="/assets/sketch/coffee-cup.png" alt="" className="w-12 h-12 object-contain" />
                </div>
            </div>

            {/* ====================
                WINDOWS
                ==================== */}

            {/* goOS Image Viewer */}
            {windows.goOS.isOpen && !windows.goOS.isMinimized && (
                <SketchWindow
                    id="goOS"
                    title="goOS"
                    x={windows.goOS.x}
                    y={windows.goOS.y}
                    width={windows.goOS.width}
                    height={windows.goOS.height}
                    zIndex={windows.goOS.zIndex}
                    onClose={() => closeWindow('goOS')}
                    onMinimize={() => minimizeWindow('goOS')}
                    onFocus={() => focusWindow('goOS')}
                    icon={<ImageIcon size={14} />}
                >
                    <div className="h-full flex flex-col">
                        <div className="flex-1 m-2 relative" style={{ border: '1.5px solid #2a2a2a' }}>
                            <img
                                src="/assets/sketch/duck-water.png"
                                alt="Duck"
                                className="w-full h-full object-cover"
                            />
                            <div
                                className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs"
                                style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #ccc' }}
                            >
                                Bookmark cut <span style={{ color: '#E85D04' }}>♦</span>
                            </div>
                        </div>
                        <div
                            className="h-9 flex items-center justify-between px-3"
                            style={{ background: '#F0EDE0', borderTop: '1.5px solid #2a2a2a' }}
                        >
                            <div className="flex items-center gap-2">
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Migration In</span>
                                <span style={{ color: '#E85D04', letterSpacing: '2px' }}>▶▶▶▶</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="px-2 py-0.5 text-xs rounded hover:bg-black/10"
                                    style={{ border: '1.5px solid #2a2a2a', background: '#fff' }}
                                >
                                    ◀ Prev
                                </button>
                                <button
                                    className="px-2 py-0.5 text-xs rounded hover:bg-black/10"
                                    style={{ border: '1.5px solid #2a2a2a', background: '#fff' }}
                                >
                                    Next ▶
                                </button>
                            </div>
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* Quackmail */}
            {windows.quackmail.isOpen && !windows.quackmail.isMinimized && (
                <SketchWindow
                    id="quackmail"
                    title="Quackmail"
                    x={windows.quackmail.x}
                    y={windows.quackmail.y}
                    width={windows.quackmail.width}
                    height={windows.quackmail.height}
                    zIndex={windows.quackmail.zIndex}
                    onClose={() => closeWindow('quackmail')}
                    onMinimize={() => minimizeWindow('quackmail')}
                    onFocus={() => focusWindow('quackmail')}
                    icon={<Mail size={14} />}
                >
                    <div className="h-full flex flex-col p-3">
                        <div
                            className="flex items-center justify-between pb-2 mb-2"
                            style={{ borderBottom: '1.5px dashed #ccc' }}
                        >
                            <div className="flex items-center gap-2">
                                <span style={{ color: '#888', fontSize: '13px' }}>From</span>
                                <span style={{ fontWeight: 600, fontSize: '15px' }}>David ▼</span>
                                <span style={{ color: '#888', fontSize: '12px' }}>12:05 PM</span>
                            </div>
                            <span style={{ fontSize: '13px' }}>
                                | Fienb<Heart size={10} className="inline" fill="#E85D04" stroke="#E85D04" />
                            </span>
                        </div>
                        <div className="flex-1" style={{ fontSize: '16px', lineHeight: 1.5 }}>
                            <p style={{ fontWeight: 600 }}>How's good!!</p>
                            <p className="mt-2">How's the migration going?</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1.5px solid #ddd' }}>
                            <button
                                className="px-3 py-1 text-sm rounded hover:bg-black/5"
                                style={{ border: '1.5px solid #2a2a2a', background: '#fff' }}
                            >
                                → Reply
                            </button>
                            <button
                                className="px-3 py-1 text-sm rounded hover:bg-black/5"
                                style={{ border: '1.5px solid #2a2a2a', background: '#fff' }}
                            >
                                → Forward
                            </button>
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* Notes */}
            {windows.notes.isOpen && !windows.notes.isMinimized && (
                <SketchWindow
                    id="notes"
                    title="Notes"
                    x={windows.notes.x}
                    y={windows.notes.y}
                    width={windows.notes.width}
                    height={windows.notes.height}
                    zIndex={windows.notes.zIndex}
                    onClose={() => closeWindow('notes')}
                    onMinimize={() => minimizeWindow('notes')}
                    onFocus={() => focusWindow('notes')}
                    icon={<StickyNoteIcon size={14} />}
                >
                    <div className="h-full p-3" style={{ background: '#FFF9C4' }}>
                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                            📝 Todo List
                        </div>
                        <div className="space-y-2" style={{ fontSize: '15px' }}>
                            {[
                                { text: 'Finish the migration', done: false },
                                { text: 'Reply to David', done: true },
                                { text: 'HONK!!!', done: false, highlight: true },
                                { text: 'Feed the ducks 🦆', done: false },
                            ].map((item, i) => (
                                <label key={i} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked={item.done} className="w-4 h-4" />
                                    <span style={{
                                        textDecoration: item.done ? 'line-through' : 'none',
                                        color: item.done ? '#888' : item.highlight ? '#E85D04' : '#2a2a2a',
                                        fontWeight: item.highlight ? 600 : 400
                                    }}>
                                        {item.text}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* Shell */}
            {windows.shell.isOpen && !windows.shell.isMinimized && (
                <SketchWindow
                    id="shell"
                    title="Shell"
                    x={windows.shell.x}
                    y={windows.shell.y}
                    width={windows.shell.width}
                    height={windows.shell.height}
                    zIndex={windows.shell.zIndex}
                    onClose={() => closeWindow('shell')}
                    onMinimize={() => minimizeWindow('shell')}
                    onFocus={() => focusWindow('shell')}
                    icon={<Terminal size={14} />}
                >
                    <div className="h-full p-3" style={{ background: '#1a1a1a', color: '#0f0', fontFamily: 'monospace', fontSize: '13px' }}>
                        <div>$ duck --status</div>
                        <div className="mt-1 text-white">🦆 All systems quacking normally!</div>
                        <div className="mt-2">$ migration --progress</div>
                        <div className="mt-1 text-yellow-400">Migration: ████████░░ 80%</div>
                        <div className="mt-2 text-gray-500">$ _</div>
                    </div>
                </SketchWindow>
            )}

            {/* Nest */}
            {windows.nest.isOpen && !windows.nest.isMinimized && (
                <SketchWindow
                    id="nest"
                    title="Nest"
                    x={windows.nest.x}
                    y={windows.nest.y}
                    width={windows.nest.width}
                    height={windows.nest.height}
                    zIndex={windows.nest.zIndex}
                    onClose={() => closeWindow('nest')}
                    onMinimize={() => minimizeWindow('nest')}
                    onFocus={() => focusWindow('nest')}
                    icon={<Folder size={14} />}
                >
                    <div className="h-full p-4">
                        <div className="grid grid-cols-4 gap-4">
                            {['Documents', 'Pictures', 'Downloads', 'Music', 'Projects', 'Trash'].map(folder => (
                                <div key={folder} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-black/5 cursor-pointer">
                                    <Folder size={32} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} />
                                    <span style={{ fontSize: '12px' }}>{folder}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* Chat */}
            {windows.chat.isOpen && !windows.chat.isMinimized && (
                <SketchWindow
                    id="chat"
                    title="Chat"
                    x={windows.chat.x}
                    y={windows.chat.y}
                    width={windows.chat.width}
                    height={windows.chat.height}
                    zIndex={windows.chat.zIndex}
                    onClose={() => closeWindow('chat')}
                    onMinimize={() => minimizeWindow('chat')}
                    onFocus={() => focusWindow('chat')}
                    icon={<MessageCircle size={14} />}
                >
                    <div className="h-full flex flex-col">
                        <div className="flex-1 p-3 space-y-3 overflow-auto">
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-sm">🦆</div>
                                <div className="bg-gray-100 rounded-lg p-2 max-w-[200px]" style={{ fontSize: '14px' }}>
                                    Quack! Ready for migration?
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <div className="bg-orange-100 rounded-lg p-2 max-w-[200px]" style={{ fontSize: '14px' }}>
                                    Almost there! 80% done 🎉
                                </div>
                            </div>
                        </div>
                        <div className="p-2" style={{ borderTop: '1.5px solid #ddd' }}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="w-full px-3 py-2 rounded text-sm"
                                style={{ border: '1.5px solid #ccc', fontSize: '14px' }}
                            />
                        </div>
                    </div>
                </SketchWindow>
            )}

            {/* ====================
                FLOATING BUTTON
                ==================== */}
            <div className="absolute bottom-32 left-24 z-20">
                <button
                    onClick={() => openWindow('nest')}
                    className="px-4 py-2 rounded hover:bg-orange-50 active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    style={{
                        background: '#FFFDF5',
                        border: '2px solid #2a2a2a',
                        boxShadow: '3px 3px 0 #2a2a2a',
                        fontSize: '18px',
                        fontWeight: 600
                    }}
                >
                    Open Nest
                </button>
            </div>

            {/* Coffee decoration */}
            <div className="absolute bottom-28 left-6 z-10 opacity-80">
                <img src="/assets/sketch/coffee-cup.png" alt="" className="w-14 h-14 object-contain -rotate-6" />
            </div>

            {/* ====================
                DOCK
                ==================== */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500]">
                <div
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                    style={{
                        background: '#F0EDE0',
                        border: '2px solid #2a2a2a',
                        boxShadow: '0 4px 0 rgba(0,0,0,0.15)'
                    }}
                >
                    <DockIcon
                        icon={<img src="/assets/sketch/rubber-duck.png" alt="" className="w-7 h-7" />}
                        onClick={() => { }}
                        label="Duck"
                    />
                    <DockIcon
                        icon={<Folder size={24} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('nest')}
                        isActive={windows.nest.isOpen}
                        label="Nest"
                    />
                    <DockIcon
                        icon={<div className="w-7 h-7 flex items-center justify-center rounded bg-white text-sm font-bold" style={{ border: '1.5px solid #2a2a2a' }}>23</div>}
                        onClick={() => { }}
                        label="Calendar"
                    />
                    <DockIcon
                        icon={<Mail size={24} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('quackmail')}
                        isActive={windows.quackmail.isOpen}
                        badge={3}
                        label="Mail"
                    />
                    <DockIcon
                        icon={<Camera size={24} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('goOS')}
                        isActive={windows.goOS.isOpen}
                        label="Photos"
                    />
                    <DockIcon
                        icon={<FileText size={24} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('notes')}
                        isActive={windows.notes.isOpen}
                        label="Notes"
                    />

                    {/* Separator */}
                    <div className="w-px h-8 mx-1" style={{ background: 'rgba(0,0,0,0.15)' }} />

                    <DockIcon
                        icon={<Gamepad2 size={24} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => { }}
                        label="Games"
                    />
                    <DockIcon
                        icon={<Music size={24} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => { }}
                        label="Music"
                    />
                </div>
            </div>

        </div>
    );
}
