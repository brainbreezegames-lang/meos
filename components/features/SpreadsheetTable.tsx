'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, User } from 'lucide-react';

export default function SpreadsheetTable() {
    const posts = [
        {
            date: 'Jan 8, 2026',
            title: 'Building a Design System from Scratch',
            category: 'Design',
            author: 'Demo User',
            avatar: '/images/avatars/user.jpg',
            tags: ['UI/UX', 'System']
        },
        {
            date: 'Jan 5, 2026',
            title: 'Optimizing React Rendering Performance',
            category: 'Engineering',
            author: 'Demo User',
            avatar: '/images/avatars/user.jpg',
            tags: ['React', 'Performance']
        },
        {
            date: 'Dec 28, 2025',
            title: 'The Future of Web Operating Systems',
            category: 'Thoughts',
            author: 'Demo User',
            avatar: '/images/avatars/user.jpg',
            tags: ['WebOS', 'Concept']
        },
        {
            date: 'Dec 15, 2025',
            title: 'Why I Switched from VS Code to Zed',
            category: 'Tools',
            author: 'Demo User',
            avatar: '/images/avatars/user.jpg',
            tags: ['Editor', 'productivity']
        }
    ];

    return (
        <div className="w-full bg-white text-[13px]">

            {/* Spreadsheet Title (File Name) */}
            <div className="px-6 py-4 border-b border-[#E5E7E0]">
                <h1 className="font-mono text-xl md:text-2xl text-[#23251D]">
                    <span className="font-bold">articles</span><span className="opacity-50">.csv</span>
                </h1>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 px-6 py-2 bg-[#FDFDF8] border-b border-[#E5E7E0] overflow-x-auto">
                <span className="text-[#73756B]">where</span>
                <strong className="text-[#23251D] font-medium">category</strong>
                <span className="text-[#73756B]">eq</span>
                <select className="h-7 px-2 border border-[#BFC1B7] rounded bg-white text-[#23251D] focus:outline-none focus:border-[#EB9D2A]">
                    <option>All</option>
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Culture</option>
                </select>
                <span className="text-[#73756B] ml-2">and</span>
                <strong className="text-[#23251D] font-medium">author</strong>
                <span className="text-[#73756B]">includes</span>
                <select className="h-7 px-2 border border-[#BFC1B7] rounded bg-white text-[#23251D] focus:outline-none focus:border-[#EB9D2A]">
                    <option>All</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-[#FDFDF8] text-[#73756B] text-left border-b border-[#E5E7E0]">
                            <th className="w-8 py-2 px-3 font-medium"></th>
                            <th className="py-2 px-3 font-medium w-32 border-l border-[#E5E7E0]">Date</th>
                            <th className="py-2 px-3 font-medium border-l border-[#E5E7E0]">Title</th>
                            <th className="py-2 px-3 font-medium w-40 border-l border-[#E5E7E0]">Tags</th>
                            <th className="py-2 px-3 font-medium w-48 border-l border-[#E5E7E0]">Author</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post, i) => (
                            <tr key={i} className="group hover:bg-[#EEEFE9]/30 border-b border-[#E5E7E0]">
                                <td className="py-3 px-3">
                                    <button className="text-[#9EA096] hover:text-[#23251D]">
                                        <ChevronRight size={12} />
                                    </button>
                                </td>
                                <td className="py-3 px-3 text-[#4D4F46] font-mono text-xs border-l border-[#E5E7E0]">
                                    {post.date}
                                </td>
                                <td className="py-3 px-3 border-l border-[#E5E7E0]">
                                    <Link href="#" className="text-[#23251D] font-medium hover:text-[#2F80FA] text-[14px]">
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="py-3 px-3 border-l border-[#E5E7E0]">
                                    <div className="flex gap-2">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="text-[#2F80FA] hover:underline cursor-pointer">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-3 px-3 border-l border-[#E5E7E0]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-[#E5E7E0] flex items-center justify-center overflow-hidden">
                                            <User size={12} className="text-[#73756B]" />
                                        </div>
                                        <span className="text-[#4D4F46]">{post.author}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
