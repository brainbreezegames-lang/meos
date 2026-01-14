import TopNav from '@/components/layout/TopNav';
import { DesktopIconsLeft, DesktopIconsRight } from '@/components/desktop/DesktopIcons';
import Window from '@/components/window/Window';
import WindowToolbar from '@/components/window/WindowToolbar';
import PricingCards from '@/components/features/PricingCards';

export default function PricingPage() {
    return (
        <div className="desktop-bg min-h-screen flex flex-col font-sans">
            <TopNav />
            {/* Background is handled by global CSS class 'desktop-bg' */}

            <div className="page-layout">
                <aside>
                    <DesktopIconsLeft />
                </aside>

                <main className="flex flex-col min-h-0 h-full p-2 md:p-0">
                    <Window title="pricing.html" toolbar={<WindowToolbar />} className="h-[calc(100vh-80px)]">
                        <div className="max-w-[1000px] mx-auto py-12 px-4">

                            <div className="text-center mb-12">
                                <h1 className="text-4xl md:text-5xl font-bold text-[#23251D] mb-4">
                                    Pricing that scales with you
                                </h1>
                                <p className="text-lg text-[#65675E] max-w-2xl mx-auto">
                                    Transparent, usage-based pricing. First 1 million events are free every month.
                                </p>
                            </div>

                            <PricingCards />

                            <div className="mt-16 text-center">
                                <h3 className="text-lg font-bold mb-4">Frequently Asked Questions</h3>
                                <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
                                    <div>
                                        <h4 className="font-bold mb-2">Do you offer a free trial?</h4>
                                        <p className="text-sm text-[#4D4F46]">Yes, the first 1 million events are free every month, forever. No credit card required to sign up.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">What happens if I go over?</h4>
                                        <p className="text-sm text-[#4D4F46]">You'll just pay for the extra events you use. We have volume discounts that kick in automatically.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Window>
                </main>

                <aside>
                    <DesktopIconsRight />
                </aside>
            </div>
        </div>
    );
}
