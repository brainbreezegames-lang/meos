import Link from 'next/link';
import {
    FileText,
    Folder,
    Calculator,
    Users,
    Video,
    Mail,
    HelpCircle,
    Clock,
    Book,
    ShoppingBag,
    Briefcase,
    Trash
} from 'lucide-react';
import React from 'react';

interface DesktopIconProps {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ label, href, icon }) => {
    return (
        <Link
            href={href}
            className="flex flex-col items-center text-center p-2 rounded hover:bg-[#E5E7E0]/50 w-[72px] transition-colors group"
        >
            <div className="w-12 h-12 mb-1 flex items-center justify-center text-[#4D4F46] group-hover:text-[#23251D]">
                {icon}
            </div>
            <span className="font-mono text-[11px] text-[#23251D] leading-tight break-words max-w-full bg-white/50 px-1 rounded">
                {label}
            </span>
        </Link>
    );
};

export const DesktopIconsLeft = () => {
    return (
        <div className="flex flex-col gap-1 p-4 w-[80px] items-start hidden md:flex">
            <DesktopIcon
                href="/"
                label="home.mdx"
                icon={<FileText size={40} strokeWidth={1.5} className="text-[#2F80FA]" />}
            />
            <DesktopIcon
                href="/products"
                label="Product OS"
                icon={<Folder size={40} strokeWidth={1.5} className="text-[#EB9D2A] fill-[#EB9D2A]/20" />}
            />
            <DesktopIcon
                href="/pricing"
                label="Pricing"
                icon={<Calculator size={40} strokeWidth={1.5} className="text-[#6AA84F]" />}
            />
            <DesktopIcon
                href="/customers"
                label="customers.mdx"
                icon={<Users size={40} strokeWidth={1.5} className="text-[#B62AD9]" />}
            />
            <DesktopIcon
                href="/demo"
                label="demo.mov"
                icon={<Video size={40} strokeWidth={1.5} className="text-[#30ABC6]" />}
            />
            <DesktopIcon
                href="/docs"
                label="Docs"
                icon={<Book size={40} strokeWidth={1.5} className="text-[#F54E00]" />}
            />
            <DesktopIcon
                href="/contact"
                label="Talk to a human"
                icon={<Mail size={40} strokeWidth={1.5} className="text-[#23251D]" />}
            />
        </div>
    );
};

export const DesktopIconsRight = () => {
    return (
        <div className="flex flex-col gap-1 p-4 w-[80px] items-end hidden lg:flex mt-auto">
            <DesktopIcon
                href="/about"
                label="Why PostHog?"
                icon={<HelpCircle size={40} strokeWidth={1.5} className="text-[#2F80FA]" />}
            />
            <DesktopIcon
                href="/changelog"
                label="Changelog"
                icon={<Clock size={40} strokeWidth={1.5} className="text-[#EB9D2A]" />}
            />
            <DesktopIcon
                href="/handbook"
                label="Company handbook"
                icon={<Book size={40} strokeWidth={1.5} className="text-[#6AA84F]" />}
            />
            <DesktopIcon
                href="/merch"
                label="Store"
                icon={<ShoppingBag size={40} strokeWidth={1.5} className="text-[#B62AD9]" />}
            />
            <DesktopIcon
                href="/careers"
                label="Work here"
                icon={<Briefcase size={40} strokeWidth={1.5} className="text-[#30ABC6]" />}
            />
            <DesktopIcon
                href="/trash"
                label="Trash"
                icon={<Trash size={40} strokeWidth={1.5} className="text-[#73756B]" />}
            />
        </div>
    );
};
