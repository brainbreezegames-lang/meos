'use client';

import dynamic from 'next/dynamic';

const StadiumViewer = dynamic(() => import('@/components/kickdom/StadiumViewer'), {
  ssr: false,
  loading: () => <div className="h-[100dvh] w-screen bg-[#0d1024]" />,
});

export default function KickdomArenaPage() {
  return <StadiumViewer />;
}
