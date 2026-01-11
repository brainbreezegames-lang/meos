'use client';

import { useState } from 'react';
import { LANDING_PAGE_ICONS, USE_IMAGE_ICONS } from '@/lib/icons/config';
import {
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  MessagesIcon,
  NotesIcon,
} from '@/lib/icons';

export default function IconMapPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopied(path);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Icon Map</h1>
        <p className="text-stone-500 mb-8">
          Drop your PNG/SVG files in <code className="bg-stone-200 px-2 py-0.5 rounded">public/icons/</code> with these exact names.
          <br />
          Currently using: <strong>{USE_IMAGE_ICONS ? 'Image files' : 'Built-in SVG icons'}</strong>
        </p>

        {/* DOCK ICONS */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            Dock Icons (bottom bar)
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { name: 'Finder', Icon: FinderIcon, path: LANDING_PAGE_ICONS.dock.finder, opens: 'Welcome window' },
                { name: 'Safari', Icon: SafariIcon, path: LANDING_PAGE_ICONS.dock.safari, opens: 'Features window' },
                { name: 'Photos', Icon: PhotosIcon, path: LANDING_PAGE_ICONS.dock.photos, opens: 'Showcase window' },
                { name: 'Notes', Icon: NotesIcon, path: LANDING_PAGE_ICONS.dock.notes, opens: 'Pricing window' },
                { name: 'Mail', Icon: MailIcon, path: LANDING_PAGE_ICONS.dock.mail, opens: '(decorative)' },
                { name: 'Messages', Icon: MessagesIcon, path: LANDING_PAGE_ICONS.dock.messages, opens: '(decorative)' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                    <item.Icon size={48} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-900">{item.name}</div>
                    <div className="text-xs text-stone-400 mb-1">Opens: {item.opens}</div>
                    <button
                      onClick={() => copyPath(item.path)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-mono truncate block w-full text-left"
                    >
                      {copied === item.path ? '✓ Copied!' : item.path}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DESKTOP ICONS */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            Desktop Icons (top-left grid)
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-stone-500 mb-4">
              These currently use Lucide icons. To use custom images, edit <code className="bg-stone-200 px-1 rounded">app/page.tsx</code>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Start Here', path: LANDING_PAGE_ICONS.desktop.startHere },
                { name: 'Features', path: LANDING_PAGE_ICONS.desktop.features },
                { name: 'Showcase', path: LANDING_PAGE_ICONS.desktop.showcase },
                { name: 'Pricing', path: LANDING_PAGE_ICONS.desktop.pricing },
              ].map((item) => (
                <div key={item.name} className="p-4 bg-stone-50 rounded-lg text-center">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400">
                    ?
                  </div>
                  <div className="font-medium text-stone-900 text-sm">{item.name}</div>
                  <button
                    onClick={() => copyPath(item.path)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-mono"
                  >
                    {copied === item.path ? '✓ Copied!' : 'Copy path'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSTRUCTIONS */}
        <section className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-orange-900 mb-3">Quick Setup</h2>
          <ol className="list-decimal list-inside space-y-2 text-orange-800">
            <li>Drop your icon files in <code className="bg-orange-100 px-1 rounded">public/icons/dock/</code></li>
            <li>Name them exactly: <code className="bg-orange-100 px-1 rounded">finder.png</code>, <code className="bg-orange-100 px-1 rounded">safari.png</code>, etc.</li>
            <li>Open <code className="bg-orange-100 px-1 rounded">lib/icons/config.ts</code></li>
            <li>Change <code className="bg-orange-100 px-1 rounded">USE_IMAGE_ICONS</code> to <code className="bg-orange-100 px-1 rounded">true</code></li>
            <li>Done!</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
