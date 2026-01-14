import Link from 'next/link';
import { Search, User } from 'lucide-react';

export default function TopNav() {
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

                <div className="h-6 w-[1px] bg-[var(--border-light)] mx-1" />

                <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text-primary)] transition-colors">
                    <Search size={18} />
                </button>
                <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text-primary)] transition-colors">
                    <User size={18} />
                </button>
            </div>
        </nav>
    );
}
