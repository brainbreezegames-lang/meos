export default function VisitorCounter() {
    const count = "008294992"; // Hardcoded for 'retro' feel

    return (
        <div className="text-center p-6 bg-[#EEEFE9] border-t border-[#BFC1B7] mt-8">
            <p className="text-[14px] text-[#4D4F46] mb-2 font-mono">Thanks for being visitor number</p>
            <div className="inline-flex gap-[2px] p-2 bg-[#23251D] rounded shadow-inner">
                {count.split('').map((digit, i) => (
                    <div
                        key={i}
                        className="w-7 h-9 bg-gradient-to-b from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-[#00FF00] font-mono text-2xl font-bold flex items-center justify-center border border-[#333] rounded-[2px]"
                    >
                        {digit}
                    </div>
                ))}
            </div>
        </div>
    );
}
