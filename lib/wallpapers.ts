// ============================================================================
// WALLPAPERS CONFIG - AUTO-GENERATED, DO NOT EDIT
// ============================================================================
// Just drop new bg files (bg36.png, bg37.png, etc.) in /public and push.
// This file updates automatically during build.
// ============================================================================

export const WALLPAPER_COUNT = 36;

// Generate wallpaper array automatically
export const WALLPAPERS = [
  { id: null, label: 'None', preview: null },
  ...Array.from({ length: WALLPAPER_COUNT }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: `bg${num}`,
      label: `Gradient ${i + 1}`,
      preview: `/bg${num}.png`,
    };
  }),
];
