'use client';

interface LogoItem {
  image: string;
  name: string;
  url?: string;
}

interface LogosBlockData {
  title?: string;
  logos: LogoItem[];
  style: 'grid' | 'row';
  grayscale?: boolean;
}

interface LogosBlockRendererProps {
  data: Record<string, unknown>;
}

export default function LogosBlockRenderer({ data }: LogosBlockRendererProps) {
  const { title, logos = [], style = 'grid', grayscale = false } = data as unknown as LogosBlockData;

  if (!logos.length) return null;

  const LogoImage = ({ logo }: { logo: LogoItem }) => (
    <img
      src={logo.image}
      alt={logo.name}
      className={`max-h-8 w-auto object-contain transition-all ${
        grayscale ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : ''
      }`}
    />
  );

  return (
    <div className="px-5 py-3">
      {title && (
        <div
          className="text-[11px] font-medium uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {title}
        </div>
      )}

      {style === 'row' ? (
        <div className="flex flex-wrap items-center gap-6">
          {logos.map((logo, index) => (
            logo.url ? (
              <a
                key={index}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                title={logo.name}
              >
                <LogoImage logo={logo} />
              </a>
            ) : (
              <div key={index} title={logo.name}>
                <LogoImage logo={logo} />
              </div>
            )
          ))}
        </div>
      ) : (
        <div
          className="grid items-center justify-items-center gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(logos.length, 4)}, 1fr)`
          }}
        >
          {logos.map((logo, index) => (
            logo.url ? (
              <a
                key={index}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg hover:bg-[var(--bg-glass)] transition-all"
                title={logo.name}
              >
                <LogoImage logo={logo} />
              </a>
            ) : (
              <div key={index} className="p-3" title={logo.name}>
                <LogoImage logo={logo} />
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
