'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Textarea, Toggle } from '@/components/ui';
import type { Desktop } from '@/types';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [desktop, setDesktop] = useState<Desktop | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDesktop();
    }
  }, [session?.user?.id]);

  const fetchDesktop = async () => {
    try {
      const res = await fetch('/api/desktop');
      const data = await res.json();
      if (data.success) {
        setDesktop(data.data);
        setFormData({
          title: data.data.title || '',
          description: data.data.description || '',
          isPublic: data.data.isPublic,
        });
      }
    } catch (error) {
      console.error('Failed to fetch desktop:', error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/desktop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || null,
          description: formData.description || null,
          isPublic: formData.isPublic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDesktop(data.data);
        setSaved(true);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || !desktop) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-solid)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: 'var(--border-medium)',
              borderTopColor: 'var(--accent-primary)',
            }}
          />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-solid)' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6"
        style={{
          background: 'var(--bg-glass-elevated)',
          backdropFilter: 'blur(40px) saturate(200%)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            MeOS
          </Link>
          <div className="h-4 w-px" style={{ background: 'var(--border-medium)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Settings
          </span>
        </div>
        <Link href="/edit">
          <Button variant="secondary" size="sm">
            Back to editor
          </Button>
        </Link>
      </header>

      {/* Content */}
      <div className="pt-14 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-2xl font-bold mb-8"
            style={{ color: 'var(--text-primary)' }}
          >
            Settings
          </h1>

          {/* SEO Section */}
          <section
            className="p-6 rounded-2xl mb-6"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              SEO & Sharing
            </h2>
            <p
              className="text-[13px] mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Customize how your desktop appears in search results and social media.
            </p>

            <div className="space-y-4">
              <Input
                id="title"
                label="Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={session?.user?.name || session?.user?.username || 'My Desktop'}
                maxLength={60}
              />
              <p
                className="text-[11px] -mt-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {formData.title.length}/60 characters
              </p>

              <Textarea
                id="description"
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="A brief description of your desktop"
                rows={3}
                maxLength={160}
              />
              <p
                className="text-[11px] -mt-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {formData.description.length}/160 characters
              </p>
            </div>
          </section>

          {/* Privacy Section */}
          <section
            className="p-6 rounded-2xl mb-6"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Privacy
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Public desktop
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Allow anyone with your link to view your desktop
                </p>
              </div>
              <Toggle
                checked={formData.isPublic}
                onChange={(checked) => handleChange('isPublic', checked)}
              />
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end mb-8">
            <Button onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
              {saved ? 'Saved!' : 'Save changes'}
            </Button>
          </div>

          {/* Account Section */}
          <section
            className="p-6 rounded-2xl mb-6"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Account
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Email
                </label>
                <p
                  className="text-[14px] mt-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {session?.user?.email}
                </p>
              </div>
              <div>
                <label
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Username
                </label>
                <p
                  className="text-[14px] mt-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  @{session?.user?.username}
                </p>
              </div>
              <div>
                <label
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Your desktop URL
                </label>
                <p
                  className="text-[14px] mt-1 font-mono"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}/{session?.user?.username}
                </p>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section
            className="p-6 rounded-2xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--accent-danger)' }}
            >
              Danger Zone
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Sign out
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Sign out of your account on this device
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
