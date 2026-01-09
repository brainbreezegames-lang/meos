import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export const RESERVED_USERNAMES = [
  'edit',
  'settings',
  'api',
  'login',
  'signup',
  'admin',
  'dashboard',
  'help',
  'support',
  'about',
  'privacy',
  'terms',
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' };
  }
  if (!/^[a-z][a-z0-9-]*$/.test(username)) {
    return { valid: false, error: 'Username must start with a letter and contain only lowercase letters, numbers, and hyphens' };
  }
  if (/--/.test(username)) {
    return { valid: false, error: 'Username cannot contain consecutive hyphens' };
  }
  if (username.endsWith('-')) {
    return { valid: false, error: 'Username cannot end with a hyphen' };
  }
  if (RESERVED_USERNAMES.includes(username)) {
    return { valid: false, error: 'This username is reserved' };
  }
  return { valid: true };
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
