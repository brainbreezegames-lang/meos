import React from 'react';
import Image from 'next/image';

export default function Wallpaper() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <Image
                src="/landing-bg.png"
                alt="Background"
                fill
                priority
                quality={100}
                className="object-cover object-center"
                sizes="100vw"
            />
        </div>
    );
}
