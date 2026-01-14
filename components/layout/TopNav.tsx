'use client';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TopNav() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Close on Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);
    return (
        <nav className="fixed top-0 left-0 right-0 h-14 bg-[var(--bg-glass-heavy)] backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between px-6 z-[1000]">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                <Link href="/" className="mr-2 group">
                    {/* Logo Placeholder */}
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                        PH
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {['Product OS', 'Pricing', 'Docs', 'Community', 'Company'].map((item) => (
                        <Link
                            key={item}
                            href="#"
                            className="text-[13px] font-medium text-[var(--text-secondary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-highlight)] hover:text-[var(--text-primary)] transition-all"
                        >
                            {item}
                        </Link>
                    ))}
                    <button className="text-[13px] font-medium text-[var(--text-secondary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-highlight)] hover:text-[var(--text-primary)] transition-all">
                        More
                    </button>
                </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
                <Link
                    href="/signup"
                    className="bg-[var(--text-primary)] text-[var(--bg-app)] text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity active:scale-95"
                >
                    Get started
                </Link>

                <div className="hidden md:flex relative group">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] w-48 hover:border-[var(--border-medium)] transition-colors text-[13px]"
                    >
                        <Search size={14} />
                        <span>Search docs...</span>
                        <span className="ml-auto text-[10px] opacity-60">⌘K</span>
                    </button>
                </div>

                {isSearchOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[20vh] px-4">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
                        <div className="relative w-full max-w-lg bg-[var(--bg-app)] rounded-xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-2">
                            <div className="flex items-center gap-3 px-3 py-2 border-b border-[var(--border-light)] mb-2">
                                <Search size={16} className="text-[var(--text-tertiary)]" />
                                <input
                                    autoFocus
                                    placeholder="Search..."
                                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                                />
                                <button onClick={() => setIsSearchOpen(false)} className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-light)] text-[var(--text-tertiary)]">ESC</button>
                            </div>
                            <div className="space-y-1">
                                {['Documentation', 'Getting Started', 'Components', 'API Reference'].map((item, i) => (
                                    <button key={i} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-highlight)] text-left group">
                                        <div className="p-1 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] group-hover:bg-white group-hover:text-[var(--brand-primary)] transition-colors">
                                            <Search size={14} />
                                        </div>
                                        <span className="text-[13px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-6 w-[1px] bg-[var(--border-light)] mx-1" />

                <button className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text-primary)] transition-colors">
                    <Search size={18} />
                </button>
                <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text-primary)] transition-colors">
                    <User size={18} />
                </button>
            </div>
        </nav>
    );
}
