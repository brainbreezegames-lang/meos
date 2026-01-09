import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LoginForm } from '@/components/auth';

export const metadata = {
  title: 'Login - MeOS',
  description: 'Sign in to your MeOS account',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/edit');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-solid)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-[28px] font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Welcome back
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            Sign in to edit your desktop
          </p>
        </div>

        <div
          className="p-8 rounded-2xl"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
          }}
        >
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
