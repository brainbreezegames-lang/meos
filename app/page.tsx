import TopNav from '@/components/layout/TopNav';
import { DesktopIconsLeft, DesktopIconsRight } from '@/components/desktop/DesktopIcons';
import Window from '@/components/window/Window';
import SoftwareBox from '@/components/features/SoftwareBox';
import VisitorCounter from '@/components/features/VisitorCounter';
import CTAButton from '@/components/ui/CTAButton';
import WindowToolbar from '@/components/window/WindowToolbar';
import ProductGrid from '@/components/features/ProductGrid';
import { Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="desktop-bg min-h-screen flex flex-col font-sans">
      <TopNav />

      <div className="page-layout">
        <aside>
          <DesktopIconsLeft />
        </aside>

        <main className="flex flex-col min-h-0 h-full p-2 md:p-0">
          <Window title="home.mdx" toolbar={<WindowToolbar />} className="h-[calc(100vh-80px)]">
            <div className="max-w-[1000px] mx-auto">

              {/* Hero Section */}
              <div className="flex flex-col md:flex-row items-center gap-12 py-12">

                {/* Left: Software Box */}
                <div className="flex-1 w-full flex justify-center md:justify-end">
                  <SoftwareBox />
                </div>

                {/* Right: Content */}
                <div className="flex-1 w-full text-center md:text-left space-y-6">
                  <span className="inline-block px-3 py-1 bg-[#FDFDF8] border border-[#BFC1B7] rounded-full text-xs font-mono text-[#73756B] mb-2">
                    Digital download*
                  </span>

                  <div>
                    <h2 className="text-[32px] md:text-[48px] font-bold text-[#23251D] leading-[1.1] mb-2">
                      Starts at: <span className="line-through text-[#73756B] text-[0.8em]">$1,000,000</span> <span className="text-[#6AA84F]">FREE</span>
                    </h2>
                    <p className="text-[#F54E00] font-mono text-sm font-medium">
                      {'>'}1 left at this price!!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    <CTAButton href="/signup" size="large">
                      Get started
                    </CTAButton>
                    <CTAButton href="/demo" variant="secondary" size="large">
                      Watch demo
                    </CTAButton>
                  </div>

                  {/* Urgency Banner */}
                  <div className="bg-[#FDFDF8] border border-[#E5E7E0] rounded p-4 flex items-start gap-3 text-left max-w-sm mx-auto md:mx-0">
                    <Zap className="text-[#EB9D2A] shrink-0 mt-0.5" size={20} />
                    <p className="text-[14px] text-[#4D4F46] leading-snug">
                      <strong className="text-[#23251D]">Hurry:</strong> <span className="font-mono bg-[#E5E7E0] px-1 rounded">2728</span> companies signed up <span className="text-[#EB9D2A] font-bold">today</span>.
                      Act now and get $0 off your first order.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E5E7E0] my-12"></div>

              {/* Products Grid */}
              <div className="text-center mb-12">
                <h3 className="text-xl font-bold mb-6">Explore the Product OS</h3>
                <ProductGrid />
              </div>

              <VisitorCounter />

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
