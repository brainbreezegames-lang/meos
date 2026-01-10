'use client';

interface TableBlockData {
  headers: string[];
  rows: string[][];
  striped?: boolean;
  compact?: boolean;
}

interface TableBlockRendererProps {
  data: Record<string, unknown>;
}

export default function TableBlockRenderer({ data }: TableBlockRendererProps) {
  const { headers = [], rows = [], striped = true, compact = false } = data as unknown as TableBlockData;

  if (!headers.length && !rows.length) return null;

  return (
    <div className="px-5 py-3">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: '1px solid var(--border-light)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <table className="w-full border-collapse">
          {headers.length > 0 && (
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.05) 100%)',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`text-left text-[11px] font-semibold uppercase tracking-wide ${
                      compact ? 'px-3 py-2' : 'px-4 py-3'
                    }`}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  background: striped && rowIndex % 2 === 1
                    ? 'rgba(0,0,0,0.02)'
                    : 'transparent',
                  borderBottom: rowIndex < rows.length - 1
                    ? '1px solid var(--border-light)'
                    : 'none',
                }}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`text-[13px] ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
                    style={{
                      color: cellIndex === 0
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      fontWeight: cellIndex === 0 ? 500 : 400,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
