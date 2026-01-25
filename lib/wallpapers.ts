// ============================================================================
// WALLPAPERS CONFIG
// ============================================================================
//
// TO ADD NEW WALLPAPERS:
// 1. Drop your new bg files in /public (e.g., bg36.png, bg37.png)
// 2. Update WALLPAPER_COUNT below to match the highest number
// 3. Done! They'll appear automatically.
//
// ============================================================================

export const WALLPAPER_COUNT = 35;

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
