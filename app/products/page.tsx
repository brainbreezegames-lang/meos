import TopNav from '@/components/layout/TopNav';
import { DesktopIconsLeft, DesktopIconsRight } from '@/components/desktop/DesktopIcons';
import Window from '@/components/window/Window';
import WindowToolbar from '@/components/window/WindowToolbar';
import ProductGrid from '@/components/features/ProductGrid';
import CTAButton from '@/components/ui/CTAButton';

export default function ProductsPage() {
    return (
        <div className="desktop-bg min-h-screen flex flex-col font-sans">
            <TopNav />
            {/* Background is handled by global CSS class 'desktop-bg' */}

            <div className="page-layout">
                <aside>
                    <DesktopIconsLeft />
                </aside>

                <main className="flex flex-col min-h-0 h-full p-2 md:p-0">
                    <Window title="products.json" toolbar={<WindowToolbar />} className="h-[calc(100vh-80px)]">
                        <div className="flex h-full">

                            {/* Sidebar */}
                            <aside className="w-64 bg-[#FDFDF8] border-r border-[#E5E7E0] p-4 hidden md:block overflow-y-auto">
                                <div className="mb-8">
                                    <h3 className="font-bold text-[#23251D] mb-2">About Product OS</h3>
                                    <p className="text-sm text-[#73756B] mb-4">
                                        Our suite of tools are designed to help product engineers build and scale products.
                                    </p>
                                    <ul className="space-y-1 text-sm text-[#4D4F46]">
                                        <li className="cursor-pointer hover:text-[#2F80FA]">Product engineering tools</li>
                                        <li className="cursor-pointer hover:text-[#2F80FA]">Analytics/data viz</li>
                                        <li className="cursor-pointer hover:text-[#2F80FA]">Automation & AI</li>
                                        <li className="cursor-pointer hover:text-[#2F80FA]">PostHog data stack</li>
                                    </ul>
                                </div>

                                <div className="bg-[#EEEFE9] rounded p-4">
                                    <h3 className="font-bold text-[13px] mb-2">Ready to start?</h3>
                                    <CTAButton href="/signup" size="small" className="w-full">
                                        Get started free
                                    </CTAButton>
                                </div>
                            </aside>

                            {/* Main Content */}
                            <div className="flex-1 p-8 overflow-y-auto bg-white">
                                <div className="max-w-4xl">
                                    <h1 className="text-3xl font-bold mb-8">PostHog Products</h1>
                                    <ProductGrid />
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
