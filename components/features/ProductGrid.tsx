'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Database, BarChart2, Flag, Split, Activity, MousePointer2, MessageSquare, ChevronRight, HardDrive } from 'lucide-react';

interface ProductItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    color: string;
}

interface ProductSectionProps {
    title: string;
    count: number;
    items: ProductItem[];
}

const ProductIcon = ({ item }: { item: ProductItem }) => (
    <Link
        href={item.href}
        className="flex flex-col items-center text-center p-3 rounded hover:bg-[#E5E7E0]/50 transition-colors group cursor-pointer"
    >
        <div className={`w-12 h-12 mb-2 flex items-center justify-center rounded-lg bg-white shadow-sm border border-[#BFC1B7] group-hover:scale-105 transition-transform ${item.color}`}>
            {item.icon}
        </div>
        <span className="font-mono text-[11px] text-[#4D4F46] leading-tight max-w-[90px]">
            {item.label}
        </span>
    </Link>
);

const ProductSection = ({ title, count, items }: ProductSectionProps) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-6">
            <div
                className="flex items-center gap-2 py-2 border-b border-[#E5E7E0] mb-4 cursor-pointer select-none group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <button className="text-[#73756B] group-hover:text-[#23251D] transition-colors">
                    <ChevronRight size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                <h3 className="text-[15px] font-bold text-[#23251D]">
                    {title} <span className="text-[#9EA096] font-normal">({count})</span>
                </h3>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {items.map((item, idx) => (
                    <ProductIcon key={idx} item={item} />
                ))}
            </div>
        </div>
    );
};

export default function ProductGrid() {
    const mainProjects: ProductItem[] = [
        { label: 'Design System 2.0', href: '#', icon: <Database size={24} />, color: 'text-[#23251D]' },
        { label: 'E-commerce UI Kit', href: '#', icon: <BarChart2 size={24} />, color: 'text-[#30ABC6]' },
        { label: 'SaaS Dashboard', href: '#', icon: <HardDrive size={24} />, color: 'text-[#EB9D2A]' },
        { label: 'Mobile Banking App', href: '#', icon: <Activity size={24} />, color: 'text-[#6AA84F]' },
    ];

    const experiments: ProductItem[] = [
        { label: 'AI Image Gen', href: '#', icon: <Split size={24} />, color: 'text-[#2F80FA]' },
        { label: 'WebGL Earth', href: '#', icon: <MousePointer2 size={24} />, color: 'text-[#B62AD9]' },
        { label: 'Retro Game Engine', href: '#', icon: <Flag size={24} />, color: 'text-[#F54E00]' },
        { label: 'Chat Interface', href: '#', icon: <MessageSquare size={24} />, color: 'text-[#2F80FA]' },
    ];

    return (
        <div className="w-full">
            <ProductSection title="Core Projects" count={4} items={mainProjects} />
            <ProductSection title="Experiments & Prototypes" count={4} items={experiments} />
        </div>
    );
}

const FileTextIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);
