import React from 'react';

export default function Wallpaper() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#FAFAF9]">
            {/* Warm glowing orb top left */}
            <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-orange-100/40 via-rose-100/30 to-transparent blur-[120px]"></div>
            {/* Cool calming orb bottom right */}
            <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-stone-200/40 via-indigo-50/20 to-transparent blur-[100px]"></div>
            {/* Center highlight */}
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-white/60 blur-[80px]"></div>
        </div>
    );
}
