'use client';
import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import { SPRING, buttonPress } from '@/lib/animations';

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

    const baseStyles = "inline-flex items-center justify-center rounded font-semibold transition-colors duration-150";

    const variants = {
        primary: "bg-[#2B4AE2] text-white hover:bg-[#1E3494]",
        secondary: "bg-transparent text-[#23251D] border border-[#BFC1B7] hover:bg-[#E8ECFB] hover:border-[#5B73E8]"
    };

    const sizes = {
        small: "text-[13px] px-3 py-1.5",
        medium: "text-[14px] px-4 py-2",
        large: "text-[16px] px-6 py-3 rounded-md"
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const animationProps = {
        whileHover: { scale: 1.05, y: -2 },
        whileTap: { scale: 0.9, y: 0 },
        transition: SPRING.snappy,
    };

    if (href) {
        // For Link, we need to wrap it since motion.link doesn't exist directly in older framer-motion versions or acts weirdly with Next.js Link
        // Better to use motion.create(Link) or just wrap a motion.div
        const MotionLink = motion(Link);
        return (
            <MotionLink
                href={href}
                className={combinedClassName}
                {...animationProps}
            >
                {children}
            </MotionLink>
        );
    }

    return (
        <motion.button
            onClick={onClick}
            className={combinedClassName}
            {...animationProps}
        >
            {children}
        </motion.button>
    );
}
