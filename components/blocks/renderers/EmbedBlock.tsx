'use client';

interface EmbedBlockData {
  embedType: 'figma' | 'youtube' | 'vimeo' | 'spotify' | 'soundcloud' | 'codepen' | 'twitter' | 'instagram' | 'custom';
  url: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  height?: number;
}

interface EmbedBlockRendererProps {
  data: Record<string, unknown>;
}

function getFigmaEmbedUrl(url: string): string {
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
}

function getSpotifyEmbedUrl(url: string): string | null {
  // https://open.spotify.com/track/xxx -> https://open.spotify.com/embed/track/xxx
  const match = url.match(/spotify\.com\/(track|album|playlist|episode|show)\/([^?]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  }
  return null;
}

function getCodePenEmbedUrl(url: string): string | null {
  // https://codepen.io/username/pen/penId
  const match = url.match(/codepen\.io\/([^/]+)\/pen\/([^/?]+)/);
  if (match) {
    return `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result`;
  }
  return null;
}

export default function EmbedBlockRenderer({ data }: EmbedBlockRendererProps) {
  const { embedType, url, aspectRatio = '16:9', height } = data as unknown as EmbedBlockData;

  if (!url) return null;

  const getAspectClass = () => {
    if (height) return '';
    const aspectClasses = {
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '1:1': 'aspect-square',
      'auto': 'aspect-video',
    };
    return aspectClasses[aspectRatio];
  };

  const getEmbedUrl = (): string | null => {
    switch (embedType) {
      case 'figma':
        return getFigmaEmbedUrl(url);
      case 'spotify':
        return getSpotifyEmbedUrl(url);
      case 'codepen':
        return getCodePenEmbedUrl(url);
      case 'soundcloud':
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23007AFF&auto_play=false`;
      default:
        return url;
    }
  };

  const embedUrl = getEmbedUrl();
  if (!embedUrl) return null;

  // Spotify has special height
  if (embedType === 'spotify') {
    return (
      <div className="px-5 py-3">
        <iframe
          src={embedUrl}
          className="w-full rounded-lg"
          style={{ height: height || 152 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    );
  }

  // SoundCloud has special height
  if (embedType === 'soundcloud') {
    return (
      <div className="px-5 py-3">
        <iframe
          src={embedUrl}
          className="w-full rounded-lg"
          style={{ height: height || 166 }}
          allow="autoplay"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-3">
      <div
        className={`relative rounded-lg overflow-hidden ${getAspectClass()}`}
        style={height ? { height } : undefined}
      >
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
