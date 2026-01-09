import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignupForm } from '@/components/auth';

export const metadata = {
  title: 'Sign Up - MeOS',
  description: 'Create your MeOS account',
};

export default async function SignupPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/edit');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-solid)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-[28px] font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Create your desktop
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            Build your personal web OS in minutes
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
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
