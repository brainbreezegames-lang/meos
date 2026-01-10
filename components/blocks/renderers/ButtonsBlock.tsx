'use client';

interface ButtonItem {
  label: string;
  url: string;
  style: 'primary' | 'secondary' | 'ghost';
  icon?: string;
  newTab?: boolean;
}

interface ButtonsBlockData {
  buttons: ButtonItem[];
}

interface ButtonsBlockRendererProps {
  data: Record<string, unknown>;
}

export default function ButtonsBlockRenderer({ data }: ButtonsBlockRendererProps) {
  const { buttons = [] } = data as unknown as ButtonsBlockData;

  if (!buttons.length) return null;

  const getButtonStyles = (style: ButtonItem['style']) => {
    switch (style) {
      case 'primary':
        return {
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
        };
      case 'secondary':
        return {
          background: 'rgba(0, 122, 255, 0.1)',
          color: 'var(--accent-primary)',
          border: '1px solid rgba(0, 122, 255, 0.2)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)',
        };
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-window-padding)' }}>
      <div className="flex flex-wrap" style={{ gap: 'var(--spacing-button-gap)' }}>
        {buttons.map((button, index) => (
          <a
            key={index}
            href={button.url}
            target={button.newTab ? '_blank' : undefined}
            rel={button.newTab ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center transition-all hover:opacity-80 active:scale-[0.98]"
            style={{
              ...getButtonStyles(button.style),
              gap: 'var(--spacing-inline-gap)',
              padding: 'var(--spacing-button-padding)',
              borderRadius: 'var(--radius-button)',
              fontSize: 'var(--font-size-button)',
              fontFamily: 'var(--font-body)',
              fontWeight: 'var(--font-weight-medium)',
              letterSpacing: 'var(--letter-spacing-button)',
              textTransform: 'var(--text-transform-button)' as React.CSSProperties['textTransform'],
            }}
          >
            {button.icon && <span style={{ fontSize: 'var(--font-size-button-icon)' }}>{button.icon}</span>}
            {button.label}
            {button.newTab && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" opacity="0.5">
                <path d="M3.5 3a.5.5 0 0 0 0 1h3.793L3.146 8.146a.5.5 0 1 0 .708.708L8 4.707V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5Z"/>
              </svg>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
