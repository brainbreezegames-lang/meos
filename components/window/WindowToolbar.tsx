import {
    Undo,
    Redo,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Smile,
    Search,
    Settings
} from 'lucide-react';
import CTAButton from '@/components/ui/CTAButton';

export default function WindowToolbar() {
    return (
        <div className="h-11 min-h-[44px] bg-[#FDFDF8] border-b border-[#E5E7E0] flex items-center gap-1 px-3 overflow-x-auto scrollbar-hide">

            {/* Group 1: Undo/Redo */}
            <div className="flex items-center gap-0.5">
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <Undo size={14} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <Redo size={14} />
                </button>
            </div>

            <div className="w-[1px] h-6 bg-[#E5E7E0] mx-1 shrink-0" />

            {/* Group 2: Zoom */}
            <div className="flex items-center">
                <select className="h-7 pl-2 pr-6 rounded border border-[#BFC1B7] bg-white text-[13px] text-[#4D4F46] hover:border-[#9EA096] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#BFC1B7]">
                    <option>100%</option>
                    <option>75%</option>
                    <option>50%</option>
                </select>
            </div>

            <div className="w-[1px] h-6 bg-[#E5E7E0] mx-1 shrink-0" />

            {/* Group 3: Formatting */}
            <div className="flex items-center gap-0.5">
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <Bold size={14} strokeWidth={2.5} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <Italic size={14} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <Underline size={14} />
                </button>
            </div>

            <div className="w-[1px] h-6 bg-[#E5E7E0] mx-1 shrink-0" />

            {/* Group 4: Font */}
            <div className="hidden sm:flex items-center">
                <select className="h-7 w-24 pl-2 rounded border border-[#BFC1B7] bg-white text-[13px] text-[#4D4F46] hover:border-[#9EA096] cursor-pointer focus:outline-none">
                    <option>IBM Plex Sans</option>
                </select>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-[#E5E7E0] mx-1 shrink-0" />

            {/* Group 5: Alignment */}
            <div className="hidden sm:flex items-center gap-0.5">
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <AlignLeft size={14} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <AlignCenter size={14} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <AlignRight size={14} />
                </button>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-[#E5E7E0] mx-1 shrink-0" />

            {/* Group 6: Insert */}
            <div className="flex items-center gap-0.5">
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <LinkIcon size={14} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                    <Smile size={14} />
                </button>
            </div>

            <div className="flex-1" />

            {/* Right Group: Tools & CTA */}
            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-0.5">
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                        <Search size={14} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#E5E7E0] border border-transparent hover:border-[#BFC1B7] text-[#4D4F46]">
                        <Settings size={14} />
                    </button>
                </div>

                <CTAButton href="/signup" size="small">
                    Get started
                </CTAButton>
            </div>

        </div>
    );
}
