'use client';

import { useState, useEffect } from 'react';

type LandingIcons = Record<string, string>;

export function useLandingIcons() {
  const [icons, setIcons] = useState<LandingIcons>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const res = await fetch('/api/landing-icons');
        if (res.ok) {
          const data = await res.json();
          setIcons(data.icons || {});
        }
      } catch (error) {
        console.error('Failed to fetch landing icons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIcons();
  }, []);

  // Helper to get icon URL with fallback
  const getIconUrl = (iconId: string): string | null => {
    return icons[iconId] || null;
  };

  return { icons, loading, getIconUrl };
}
