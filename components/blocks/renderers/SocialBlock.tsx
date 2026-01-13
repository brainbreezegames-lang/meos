'use client';

type SocialPlatform = 'twitter' | 'linkedin' | 'github' | 'instagram' | 'dribbble' | 'behance' | 'youtube' | 'tiktok' | 'facebook' | 'email' | 'website';

interface SocialProfile {
  platform: SocialPlatform;
  url: string;
}

interface SocialBlockData {
  profiles: SocialProfile[];
}

interface SocialBlockRendererProps {
  data: Record<string, unknown>;
}

const socialIcons: Record<SocialPlatform, { icon: string; color: string; label: string }> = {
  twitter: { icon: '𝕏', color: '#0a0a0a', label: 'Twitter' },
  linkedin: { icon: 'in', color: '#0A66C2', label: 'LinkedIn' },
  github: { icon: 'gh', color: '#181717', label: 'GitHub' },
  instagram: { icon: '📷', color: '#E4405F', label: 'Instagram' },
  dribbble: { icon: '🏀', color: '#EA4C89', label: 'Dribbble' },
  behance: { icon: 'Bē', color: '#1769FF', label: 'Behance' },
  youtube: { icon: '▶', color: '#FF0000', label: 'YouTube' },
  tiktok: { icon: '♪', color: '#0a0a0a', label: 'TikTok' },
  facebook: { icon: 'f', color: '#1877F2', label: 'Facebook' },
  email: { icon: '✉', color: '#007AFF', label: 'Email' },
  website: { icon: '🌐', color: '#007AFF', label: 'Website' },
};

export default function SocialBlockRenderer({ data }: SocialBlockRendererProps) {
  const { profiles = [] } = data as unknown as SocialBlockData;

  if (!profiles.length) return null;

  return (
    <div style={{ padding: 'var(--spacing-window-padding)' }}>
      <div className="flex flex-wrap" style={{ gap: 'var(--spacing-social-gap)' }}>
        {profiles.map((profile, index) => {
          const social = socialIcons[profile.platform] || socialIcons.website;
          const href = profile.platform === 'email'
            ? `mailto:${profile.url.replace('mailto:', '')}`
            : profile.url;

          return (
            <a
              key={index}
              href={href}
              target={profile.platform !== 'email' ? '_blank' : undefined}
              rel={profile.platform !== 'email' ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-center font-bold transition-all hover:scale-110"
              style={{
                width: 'var(--social-button-size)',
                height: 'var(--social-button-size)',
                borderRadius: 'var(--radius-social)',
                fontSize: 'var(--font-size-social-icon)',
                fontFamily: 'var(--font-body)',
                background: `${social.color}15`,
                color: social.color,
                border: 'var(--border-social)',
              }}
              title={social.label}
            >
              {social.icon}
            </a>
          );
        })}
      </div>
    </div>
  );
}
