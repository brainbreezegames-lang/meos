'use client';

interface DownloadBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string>;
}

export default function DownloadBlockEditor({ data, onChange, onUpload }: DownloadBlockEditorProps) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await onUpload(file);
    onChange({
      ...data,
      url,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: file.name.split('.').pop()?.toUpperCase(),
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <div
        className="p-4 rounded-lg text-center cursor-pointer hover:bg-black/5 transition-colors"
        style={{
          border: '2px dashed var(--border-medium)',
        }}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          {data.fileName ? `Selected: ${data.fileName}` : 'Click to upload file'}
        </p>
      </div>

      <input
        type="text"
        value={(data.fileName as string) || ''}
        onChange={(e) => onChange({ ...data, fileName: e.target.value })}
        placeholder="File name"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={(data.fileSize as string) || ''}
          onChange={(e) => onChange({ ...data, fileSize: e.target.value })}
          placeholder="File size"
          className="px-3 py-2 rounded-lg text-[13px]"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        />
        <input
          type="text"
          value={(data.fileType as string) || ''}
          onChange={(e) => onChange({ ...data, fileType: e.target.value })}
          placeholder="File type"
          className="px-3 py-2 rounded-lg text-[13px]"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <input
        type="url"
        value={(data.url as string) || ''}
        onChange={(e) => onChange({ ...data, url: e.target.value })}
        placeholder="Or enter URL directly"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}
