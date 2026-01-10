'use client';

interface CalloutBlockData {
  icon?: string;
  text: string;
  style?: 'info' | 'warning' | 'success' | 'note';
}

interface CalloutBlockRendererProps {
  data: Record<string, unknown>;
}

export default function CalloutBlockRenderer({ data }: CalloutBlockRendererProps) {
  const { icon, text, style = 'info' } = data as unknown as CalloutBlockData;

  if (!text) return null;

  const styles = {
    info: { bg: 'rgba(0, 122, 255, 0.08)', border: 'rgba(0, 122, 255, 0.2)', icon: 'ℹ️' },
    warning: { bg: 'rgba(255, 149, 0, 0.08)', border: 'rgba(255, 149, 0, 0.2)', icon: '⚠️' },
    success: { bg: 'rgba(52, 199, 89, 0.08)', border: 'rgba(52, 199, 89, 0.2)', icon: '✓' },
    note: { bg: 'rgba(142, 142, 147, 0.08)', border: 'rgba(142, 142, 147, 0.2)', icon: '📝' },
  };

  const currentStyle = styles[style];
  const displayIcon = icon || currentStyle.icon;

  return (
    <div className="px-5 py-3">
      <div
        className="flex gap-3 p-3 rounded-lg"
        style={{
          background: currentStyle.bg,
          border: `1px solid ${currentStyle.border}`
        }}
      >
        <span className="text-[14px] flex-shrink-0">{displayIcon}</span>
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
