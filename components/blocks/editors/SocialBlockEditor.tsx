'use client';

type SocialPlatform = 'twitter' | 'linkedin' | 'github' | 'instagram' | 'dribbble' | 'behance' | 'youtube' | 'tiktok' | 'facebook' | 'email' | 'website';

interface SocialProfile {
  platform: SocialPlatform;
  url: string;
}

interface SocialBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const platforms: { value: SocialPlatform; label: string }[] = [
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
];

export default function SocialBlockEditor({ data, onChange }: SocialBlockEditorProps) {
  const profiles = (data.profiles as SocialProfile[]) || [];

  const addProfile = () => {
    onChange({ ...data, profiles: [...profiles, { platform: 'twitter', url: '' }] });
  };

  const updateProfile = (index: number, field: keyof SocialProfile, value: string) => {
    const newProfiles = profiles.map((profile, i) =>
      i === index ? { ...profile, [field]: value } : profile
    );
    onChange({ ...data, profiles: newProfiles });
  };

  const removeProfile = (index: number) => {
    onChange({ ...data, profiles: profiles.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {profiles.map((profile, index) => (
        <div key={index} className="flex gap-2">
          <select
            value={profile.platform}
            onChange={(e) => updateProfile(index, 'platform', e.target.value)}
            className="w-32 px-3 py-2 rounded-lg text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          >
            {platforms.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={profile.url}
            onChange={(e) => updateProfile(index, 'url', e.target.value)}
            placeholder={profile.platform === 'email' ? 'email@example.com' : 'URL'}
            className="flex-1 px-3 py-2 rounded-lg text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="button"
            onClick={() => removeProfile(index)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addProfile}
        className="w-full py-2 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--bg-glass)',
          color: 'var(--accent-primary)',
          border: '1px dashed var(--border-medium)',
        }}
      >
        + Add social profile
      </button>
    </div>
  );
}
