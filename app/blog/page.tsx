import TopNav from '@/components/layout/TopNav';
import { DesktopIconsLeft, DesktopIconsRight } from '@/components/desktop/DesktopIcons';
import Window from '@/components/window/Window';
import WindowToolbar from '@/components/window/WindowToolbar';
import SpreadsheetTable from '@/components/features/SpreadsheetTable';

export default function BlogPage() {
    return (
        <div className="desktop-bg min-h-screen flex flex-col font-sans">
            <TopNav />
            {/* Background is handled by global CSS class 'desktop-bg' */}

            <div className="page-layout">
                <aside>
                    <DesktopIconsLeft />
                </aside>

                <main className="flex flex-col min-h-0 h-full p-2 md:p-0">
                    <Window title="posts.psheet" toolbar={<WindowToolbar />} className="h-[calc(100vh-80px)]">
                        {/* The spreadsheet component takes up full width/height naturally */}
                        <div className="min-h-full">
                            <SpreadsheetTable />
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
