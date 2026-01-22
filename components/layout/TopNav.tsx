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
        <nav
            className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-5 z-[1000]"
            style={{
                background: 'rgba(251, 249, 239, 0.72)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(23, 20, 18, 0.04)',
            }}
        >
            {/* Left Side */}
            <div className="flex items-center gap-5">
                <Link href="/" className="group">
                    {/* Minimal Logo */}
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all duration-200"
                        style={{
                            background: 'rgba(23, 20, 18, 0.06)',
                            color: 'var(--color-text-secondary, #706a63)',
                        }}
                    >
                        me
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-0.5">
                    {['Features', 'Pricing', 'Docs'].map((item) => (
                        <Link
                            key={item}
                            href="#"
                            className="text-[13px] text-[var(--color-text-tertiary,#9a938a)] px-2.5 py-1 rounded-md hover:text-[var(--color-text-primary,#171412)] transition-colors duration-150"
                        >
                            {item}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
                <div className="hidden md:flex">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[var(--color-text-tertiary,#9a938a)] hover:text-[var(--color-text-secondary,#706a63)] transition-colors duration-150 text-[13px]"
                    >
                        <Search size={14} strokeWidth={1.5} />
                        <span className="text-[11px] opacity-60">⌘K</span>
                    </button>
                </div>

                {isSearchOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[20vh] px-4">
                        <div
                            className="absolute inset-0"
                            style={{ background: 'rgba(251, 249, 239, 0.6)', backdropFilter: 'blur(8px)' }}
                            onClick={() => setIsSearchOpen(false)}
                        />
                        <div
                            className="relative w-full max-w-md overflow-hidden p-1.5"
                            style={{
                                background: 'rgba(251, 249, 239, 0.95)',
                                backdropFilter: 'blur(24px) saturate(180%)',
                                borderRadius: '16px',
                                border: '1px solid rgba(23, 20, 18, 0.06)',
                                boxShadow: '0 24px 48px -12px rgba(23, 20, 18, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
                            }}
                        >
                            <div className="flex items-center gap-2.5 px-3 py-2">
                                <Search size={15} strokeWidth={1.5} className="text-[var(--color-text-tertiary,#9a938a)]" />
                                <input
                                    autoFocus
                                    placeholder="Search..."
                                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--color-text-primary,#171412)] placeholder:text-[var(--color-text-tertiary,#9a938a)]"
                                />
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-[10px] px-1.5 py-0.5 rounded text-[var(--color-text-tertiary,#9a938a)]"
                                    style={{ background: 'rgba(23, 20, 18, 0.04)' }}
                                >
                                    esc
                                </button>
                            </div>
                            <div
                                className="mx-3 mb-2"
                                style={{ height: '1px', background: 'rgba(23, 20, 18, 0.04)' }}
                            />
                            <div className="space-y-0.5 px-1.5 pb-1">
                                {['Documentation', 'Getting Started', 'Components'].map((item, i) => (
                                    <button
                                        key={i}
                                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors duration-150"
                                        style={{ background: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(23, 20, 18, 0.03)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Search size={13} strokeWidth={1.5} className="text-[var(--color-text-tertiary,#9a938a)]" />
                                        <span className="text-[13px] text-[var(--color-text-secondary,#706a63)]">{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <button className="md:hidden p-1.5 rounded-md text-[var(--color-text-tertiary,#9a938a)] hover:text-[var(--color-text-secondary,#706a63)] transition-colors duration-150">
                    <Search size={16} strokeWidth={1.5} />
                </button>

                <button className="p-1.5 rounded-md text-[var(--color-text-tertiary,#9a938a)] hover:text-[var(--color-text-secondary,#706a63)] transition-colors duration-150">
                    <User size={16} strokeWidth={1.5} />
                </button>

                <Link
                    href="/signup"
                    className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-[0.98]"
                    style={{
                        background: 'rgba(23, 20, 18, 0.06)',
                        color: 'var(--color-text-primary, #171412)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(23, 20, 18, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(23, 20, 18, 0.06)'}
                >
                    Sign in
                </Link>
            </div>
        </nav>
    );
}
