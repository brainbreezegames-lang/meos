"use client";

import dynamic from 'next/dynamic';

const ColliderEditor = dynamic(
  () => import('@/components/desktop/ColliderEditor'),
  { ssr: false }
);

export default function ColliderEditorPage() {
  return <ColliderEditor />;
}
