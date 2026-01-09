'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { validateUsername } from '@/lib/utils';

export function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Validate username in real-time
    if (field === 'username') {
      const validation = validateUsername(value.toLowerCase());
      if (!validation.valid && value.length > 0) {
        setErrors((prev) => ({ ...prev, username: validation.error || '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate
    const usernameValidation = validateUsername(formData.username.toLowerCase());
    if (!usernameValidation.valid) {
      setErrors({ username: usernameValidation.error || '' });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          username: formData.username.toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.error.code === 'EMAIL_EXISTS') {
          setErrors({ email: data.error.message });
        } else if (data.error.code === 'USERNAME_EXISTS') {
          setErrors({ username: data.error.message });
        } else {
          setErrors({ general: data.error.message });
        }
        setIsLoading(false);
        return;
      }

      // Sign in after successful signup
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      router.push('/edit');
      router.refresh();
    } catch {
      setErrors({ general: 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/edit' });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="Name (optional)"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Your name"
        />

        <Input
          id="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
          required
        />

        <Input
          id="username"
          type="text"
          label="Username"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
          placeholder="yourname"
          error={errors.username}
          required
        />
        <p className="text-[11px] -mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Your desktop will be at meos.io/{formData.username || 'yourname'}
        </p>

        <Input
          id="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="••••••••"
          error={errors.password}
          required
        />

        {errors.general && (
          <p className="text-[12px] text-center" style={{ color: 'var(--accent-danger)' }}>
            {errors.general}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create account
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: '1px solid var(--border-light)' }} />
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="px-3" style={{ background: 'var(--bg-solid)', color: 'var(--text-tertiary)' }}>
            or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </Button>

      <p className="mt-6 text-center text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--accent-primary)' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
