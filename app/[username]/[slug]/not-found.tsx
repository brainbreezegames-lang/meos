import Link from 'next/link';

export default function NoteNotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F9FE',
        padding: '24px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '48px',
          background: '#FFFFFF',
          border: '2px solid #2B4AE2',
          borderRadius: '8px',
          boxShadow: '4px 4px 0 #2B4AE2',
          maxWidth: '400px',
        }}
      >
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#2B4AE2',
            marginBottom: '8px',
            fontFamily: '"SF Pro Display", -apple-system, sans-serif',
          }}
        >
          Note not found
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#6B7FE8',
            marginBottom: '24px',
            fontFamily: '"SF Pro Text", -apple-system, sans-serif',
          }}
        >
          This note doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            borderRadius: '6px',
            background: '#2B4AE2',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: '"SF Pro Display", -apple-system, sans-serif',
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
