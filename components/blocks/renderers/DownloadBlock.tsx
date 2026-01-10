'use client';

interface DownloadFile {
  name: string;
  description?: string;
  url: string;
  size?: string;
  format?: string;
}

interface DownloadBlockData {
  files: DownloadFile[];
}

interface DownloadBlockRendererProps {
  data: Record<string, unknown>;
}

const formatStyles: Record<string, { icon: string; gradient: string }> = {
  pdf: { icon: 'PDF', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%)' },
  doc: { icon: 'DOC', gradient: 'linear-gradient(135deg, #4A90D9 0%, #357ABD 100%)' },
  docx: { icon: 'DOC', gradient: 'linear-gradient(135deg, #4A90D9 0%, #357ABD 100%)' },
  xls: { icon: 'XLS', gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' },
  xlsx: { icon: 'XLS', gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' },
  ppt: { icon: 'PPT', gradient: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' },
  pptx: { icon: 'PPT', gradient: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)' },
  zip: { icon: 'ZIP', gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)' },
  rar: { icon: 'RAR', gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)' },
  fig: { icon: 'FIG', gradient: 'linear-gradient(135deg, #A259FF 0%, #7B2FE0 100%)' },
  sketch: { icon: 'SKT', gradient: 'linear-gradient(135deg, #FDAD00 0%, #F7931E 100%)' },
  ai: { icon: 'AI', gradient: 'linear-gradient(135deg, #FF9A00 0%, #FF6D00 100%)' },
  psd: { icon: 'PSD', gradient: 'linear-gradient(135deg, #31A8FF 0%, #0066FF 100%)' },
  tex: { icon: 'TEX', gradient: 'linear-gradient(135deg, #3D8B3D 0%, #228B22 100%)' },
  md: { icon: 'MD', gradient: 'linear-gradient(135deg, #555 0%, #333 100%)' },
  default: { icon: 'FILE', gradient: 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)' },
};

export default function DownloadBlockRenderer({ data }: DownloadBlockRendererProps) {
  const { files = [] } = data as unknown as DownloadBlockData;

  if (!files.length) return null;

  return (
    <div className="px-5 py-3">
      <div className="flex flex-col gap-2">
        {files.map((file, index) => {
          const ext = file.format || file.name.split('.').pop()?.toLowerCase() || 'default';
          const format = formatStyles[ext] || formatStyles.default;

          return (
            <a
              key={index}
              href={file.url}
              download={file.name}
              className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-light)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {/* File type badge */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold tracking-tight text-white shadow-sm"
                style={{ background: format.gradient }}
              >
                {format.icon}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-medium truncate group-hover:text-[var(--accent-primary)] transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {file.name}
                </div>
                {file.description && (
                  <p
                    className="text-[11px] mt-0.5 truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {file.description}
                  </p>
                )}
                {file.size && (
                  <div
                    className="text-[10px] mt-1 uppercase tracking-wide font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {file.size}
                  </div>
                )}
              </div>

              {/* Download indicator */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 group-hover:bg-[var(--accent-primary)]"
                style={{
                  background: 'rgba(0, 122, 255, 0.1)',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-colors"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <path
                    d="M7 1v8.5M7 9.5l-3-3M7 9.5l3-3M2 12h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:stroke-white"
                  />
                </svg>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
