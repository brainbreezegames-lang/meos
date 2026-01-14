import Link from 'next/link';

export default function SoftwareBox() {
    return (
        <div className="relative max-w-[400px] mx-auto py-8">
            {/* Endorsement Badge */}
            <div className="absolute top-0 right-[-10px] w-24 h-24 bg-[#EB9D2A] flex flex-col items-center justify-center text-center text-[10px] font-bold text-white z-10 rotate-[15deg] shadow-lg"
                style={{
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                }}>
                <span>ENDORSED</span>
                <span>BY KIM K*</span>
            </div>

            {/* Software Box Image Placeholder */}
            <div className="w-full aspect-[4/5] bg-gradient-to-br from-[#EEEFE9] to-[#E5E7E0] border border-[#BFC1B7] rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="text-center p-8">
                    <h3 className="text-2xl font-bold text-[#23251D] mb-2">PostHog 3000</h3>
                    <p className="font-mono text-sm text-[#73756B]">Professional Edition</p>
                </div>
                {/* Mock box side depth */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-[#B6B7AF] skew-y-[45deg] origin-top-right opacity-50"></div>
            </div>

            {/* G2 Badge Placeholder */}
            <div className="absolute bottom-20 -left-6 w-20 h-20 bg-white rounded-full border-2 border-[#D0D1C9] flex items-center justify-center shadow-md rotate-[-10deg]">
                <span className="text-[10px] font-bold text-[#23251D] text-center leading-tight">G2<br />Leader<br />2026</span>
            </div>

            {/* Disclaimer */}
            <p className="text-[12px] text-[#73756B] text-center mt-6 italic">
                *PostHog is a web product and cannot be installed by CD.
                We <Link href="#" className="text-[#2F80FA] hover:underline">did</Link> once send some customers a floppy disk but it was a Rickroll.
            </p>
        </div>
    );
}
