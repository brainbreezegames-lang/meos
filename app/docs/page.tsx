import TopNav from '@/components/layout/TopNav';
import { DesktopIconsLeft, DesktopIconsRight } from '@/components/desktop/DesktopIcons';
import Window from '@/components/window/Window';
import WindowToolbar from '@/components/window/WindowToolbar';
import { Search, Sparkles, Book, Code, Terminal, Settings } from 'lucide-react';
import Link from 'next/link';

const DocCard = ({ title, icon: Icon, description }: { title: string, icon: any, description: string }) => (
    <Link href="#" className="flex gap-4 p-4 border border-[#BFC1B7] rounded-lg hover:border-[#EB9D2A] hover:bg-[#FDFDF8] transition-all group">
        <div className="w-10 h-10 bg-[#E5E7E0] rounded flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Icon size={20} className="text-[#4D4F46]" />
        </div>
        <div>
            <h3 className="font-bold text-[#23251D] mb-1">{title}</h3>
            <p className="text-sm text-[#73756B]">{description}</p>
        </div>
    </Link>
);

export default function DocsPage() {
    return (
        <div className="desktop-bg min-h-screen flex flex-col font-sans">
            <TopNav />

            <div className="page-layout">
                <aside>
                    <DesktopIconsLeft />
                </aside>

                <main className="flex flex-col min-h-0 h-full p-2 md:p-0">
                    <Window title="documentation.mdx" toolbar={<WindowToolbar />} className="h-[calc(100vh-80px)]">
                        <div className="flex h-full flex-col">

                            {/* Docs Hero / Search */}
                            <div className="bg-[#EEEFE9] border-b border-[#E5E7E0] p-8 md:p-12 text-center">
                                <h1 className="text-3xl font-bold text-[#23251D] mb-6">Documentation</h1>

                                <div className="max-w-2xl mx-auto flex gap-2">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EA096]" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search the docs..."
                                            className="w-full h-10 pl-10 pr-4 rounded border border-[#BFC1B7] focus:outline-none focus:border-[#EB9D2A] focus:ring-1 focus:ring-[#EB9D2A]"
                                        />
                                    </div>
                                    <button className="h-10 px-4 bg-white border border-[#BFC1B7] rounded font-medium text-[#23251D] flex items-center gap-2 hover:bg-[#FDFDF8]">
                                        <Sparkles size={16} className="text-[#B62AD9]" />
                                        <span>Ask AI</span>
                                    </button>
                                </div>
                            </div>

                            {/* Docs Content */}
                            <div className="flex-1 overflow-y-auto p-8 bg-white">
                                <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DocCard
                                        title="Getting Started"
                                        icon={Book}
                                        description="Installation, configuration, and your first event."
                                    />
                                    <DocCard
                                        title="SDKs & API"
                                        icon={Code}
                                        description="Libraries for JS, Python, Go, Ruby, and more."
                                    />
                                    <DocCard
                                        title="Data Warehouse"
                                        icon={Terminal}
                                        description="Connect your data sources in minutes."
                                    />
                                    <DocCard
                                        title="Self-hosting"
                                        icon={Settings}
                                        description="Deploy PostHog on your own infrastructure."
                                    />
                                    {/* Add more cards as needed */}
                                </div>

                                <div className="mt-12 p-6 bg-[#FDFDF8] rounded border border-[#E5E7E0]">
                                    <h3 className="font-bold mb-4">Popular Topics</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Session Replay', 'Feature Flags', 'Group Analytics', 'HogQL', 'Events', 'Toolbar'].map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-white border border-[#BFC1B7] rounded text-sm text-[#4D4F46] hover:border-[#2F80FA] cursor-pointer">
                                                {tag}
                                            </span>
                                        ))}
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
