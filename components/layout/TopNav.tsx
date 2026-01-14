import Link from 'next/link';
import { Search, User } from 'lucide-react';

export default function TopNav() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-12 bg-[#E5E7E0]/75 backdrop-blur-[8px] border-b border-[#BFC1B7] flex items-center justify-between px-4 z-[1000]">
            {/* Left Side */}
            <div className="flex items-center gap-1">
                <Link href="/" className="mr-2">
                    {/* Logo Placeholder - Hedgehog SVG would go here */}
                    <div className="w-8 h-8 bg-[#23251D] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        PH
                    </div>
                </Link>

                <button className="text-[13px] font-medium text-[#23251D] px-2 py-0.5 rounded hover:bg-[#E5E7E0]/50 transition-colors">
                    Product OS
                </button>
                <Link href="/pricing" className="text-[13px] font-medium text-[#23251D] px-2 py-0.5 rounded hover:bg-[#E5E7E0]/50 transition-colors">
                    Pricing
                </Link>
                <Link href="/docs" className="text-[13px] font-medium text-[#23251D] px-2 py-0.5 rounded hover:bg-[#E5E7E0]/50 transition-colors">
                    Docs
                </Link>
                <Link href="#" className="text-[13px] font-medium text-[#23251D] px-2 py-0.5 rounded hover:bg-[#E5E7E0]/50 transition-colors">
                    Community
                </Link>
                <Link href="#" className="text-[13px] font-medium text-[#23251D] px-2 py-0.5 rounded hover:bg-[#E5E7E0]/50 transition-colors">
                    Company
                </Link>
                <button className="text-[13px] font-medium text-[#23251D] px-2 py-0.5 rounded hover:bg-[#E5E7E0]/50 transition-colors">
                    More
                </button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
                <Link
                    href="/signup"
                    className="bg-[#EB9D2A] text-white text-[13px] font-semibold px-3 py-1.5 rounded hover:bg-[#CD8407] active:bg-[#B17506] transition-colors"
                >
                    Get started – free
                </Link>

                <button className="p-1.5 rounded text-[#23251D] hover:bg-[#E5E7E0]/50 transition-colors">
                    <Search size={16} />
                </button>
                <button className="p-1.5 rounded text-[#23251D] hover:bg-[#E5E7E0]/50 transition-colors">
                    <User size={16} />
                </button>
            </div>
        </nav>
    );
}
