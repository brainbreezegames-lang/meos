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

const socialIcons: Record<SocialPlatform, { icon: string; colorVar: string; label: string }> = {
  twitter: { icon: '𝕏', colorVar: 'var(--color-social-twitter)', label: 'Twitter' },
  linkedin: { icon: 'in', colorVar: 'var(--color-social-linkedin)', label: 'LinkedIn' },
  github: { icon: 'gh', colorVar: 'var(--color-social-github)', label: 'GitHub' },
  instagram: { icon: '📷', colorVar: 'var(--color-social-instagram)', label: 'Instagram' },
  dribbble: { icon: '🏀', colorVar: 'var(--color-social-dribbble)', label: 'Dribbble' },
  behance: { icon: 'Bē', colorVar: 'var(--color-social-behance)', label: 'Behance' },
  youtube: { icon: '▶', colorVar: 'var(--color-social-youtube)', label: 'YouTube' },
  tiktok: { icon: '♪', colorVar: 'var(--color-social-tiktok)', label: 'TikTok' },
  facebook: { icon: 'f', colorVar: 'var(--color-social-facebook)', label: 'Facebook' },
  email: { icon: '✉', colorVar: 'var(--color-social-email)', label: 'Email' },
  website: { icon: '🌐', colorVar: 'var(--color-social-website)', label: 'Website' },
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
                background: `color-mix(in srgb, ${social.colorVar} 9%, transparent)`,
                color: social.colorVar,
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
