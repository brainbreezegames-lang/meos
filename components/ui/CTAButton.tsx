import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils'; // Assuming cn exists, if not I'll just use template literals but usually it handles className merging

interface CTAButtonProps {
    href?: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
    className?: string;
    onClick?: () => void;
}

export default function CTAButton({
    href,
    children,
    variant = 'primary',
    size = 'medium',
    className = '',
    onClick
}: CTAButtonProps) {

    const baseStyles = "inline-flex items-center justify-center rounded font-semibold transition-all duration-150 active:scale-95";

    const variants = {
        primary: "bg-[#EB9D2A] text-white hover:bg-[#CD8407] active:bg-[#B17506]",
        secondary: "bg-transparent text-[#23251D] border border-[#BFC1B7] hover:bg-[#E5E7E0] hover:border-[#9EA096]"
    };

    const sizes = {
        small: "text-[13px] px-3 py-1.5",
        medium: "text-[14px] px-4 py-2",
        large: "text-[16px] px-6 py-3 rounded-md"
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={combinedClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={combinedClassName}>
            {children}
        </button>
    );
}
