#!/usr/bin/env node
/**
 * Auto-counts wallpaper files and updates lib/wallpapers.ts
 * Runs automatically before build
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const wallpapersFile = path.join(__dirname, '..', 'lib', 'wallpapers.ts');

// Count bg*.png files
const files = fs.readdirSync(publicDir);
const bgFiles = files.filter(f => /^bg\d+\.png$/.test(f));
const count = bgFiles.length;

console.log(`Found ${count} wallpapers`);

// Update the wallpapers.ts file
const content = `// ============================================================================
// WALLPAPERS CONFIG - AUTO-GENERATED, DO NOT EDIT
// ============================================================================
// Just drop new bg files (bg36.png, bg37.png, etc.) in /public and push.
// This file updates automatically during build.
// ============================================================================

export const WALLPAPER_COUNT = ${count};

// Generate wallpaper array automatically
export const WALLPAPERS = [
  { id: null, label: 'None', preview: null },
  ...Array.from({ length: WALLPAPER_COUNT }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: \`bg\${num}\`,
      label: \`Gradient \${i + 1}\`,
      preview: \`/bg\${num}.png\`,
    };
  }),
];
`;

fs.writeFileSync(wallpapersFile, content);
console.log(`Updated lib/wallpapers.ts with WALLPAPER_COUNT = ${count}`);
