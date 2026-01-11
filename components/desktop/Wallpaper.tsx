'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function Wallpaper() {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Solid background color shown immediately */}
            <div
                className="absolute inset-0"
                style={{ background: 'var(--bg-solid)' }}
            />

            {/* Image fades in only when fully loaded */}
            <Image
                src="/landing-bg.png"
                alt=""
                fill
                priority
                quality={100}
                unoptimized
                className="object-cover object-center transition-opacity duration-500"
                style={{ opacity: loaded ? 1 : 0 }}
                sizes="100vw"
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
}
