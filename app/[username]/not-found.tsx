import Link from 'next/link';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)' }}
    >
      <div
        className="text-center p-8 rounded-2xl max-w-md mx-4"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl"
          style={{ background: 'var(--bg-solid)' }}
        >
          404
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Desktop not found
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          This username doesn&apos;t exist or hasn&apos;t been set up yet.
        </p>
        <Link href="/">
          <Button>Go to homepage</Button>
        </Link>
      </div>
    </div>
  );
}
