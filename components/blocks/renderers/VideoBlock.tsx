'use client';

interface VideoBlockData {
  url: string;
  embedType?: 'youtube' | 'vimeo' | 'direct';
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

interface VideoBlockRendererProps {
  data: Record<string, unknown>;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export default function VideoBlockRenderer({ data }: VideoBlockRendererProps) {
  const { url, embedType, aspectRatio = '16:9' } = data as unknown as VideoBlockData;

  if (!url) return null;

  const aspectClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  }[aspectRatio];

  // Auto-detect embed type
  let type = embedType;
  if (!type) {
    if (url.includes('youtube') || url.includes('youtu.be')) type = 'youtube';
    else if (url.includes('vimeo')) type = 'vimeo';
    else type = 'direct';
  }

  if (type === 'youtube') {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;

    return (
      <div className="px-5 py-3">
        <div className={`relative ${aspectClass} rounded-lg overflow-hidden`}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (type === 'vimeo') {
    const videoId = getVimeoId(url);
    if (!videoId) return null;

    return (
      <div className="px-5 py-3">
        <div className={`relative ${aspectClass} rounded-lg overflow-hidden`}>
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Direct video
  return (
    <div className="px-5 py-3">
      <video
        src={url}
        controls
        className={`w-full rounded-lg ${aspectClass}`}
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
