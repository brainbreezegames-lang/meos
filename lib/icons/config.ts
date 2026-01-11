// ========================================
// ICON CONFIGURATION
// Change the URLs here to swap icons
// ========================================

export const LANDING_PAGE_ICONS = {
  // DESKTOP ICONS (top-left grid on landing page)
  desktop: {
    startHere: '/icons/start-here.png',    // "Start Here" icon
    features: '/icons/features.png',        // "Features" icon
    showcase: '/icons/showcase.png',        // "Showcase" icon
    pricing: '/icons/pricing.png',          // "Pricing" icon
  },

  // DOCK ICONS (bottom bar)
  dock: {
    finder: '/icons/dock/finder.png',       // First dock icon (opens Welcome)
    safari: '/icons/dock/safari.png',       // Second dock icon (opens Features)
    photos: '/icons/dock/photos.png',       // Third dock icon (opens Showcase)
    notes: '/icons/dock/notes.png',         // Fourth dock icon (opens Pricing)
    mail: '/icons/dock/mail.png',           // Fifth dock icon (decorative)
    messages: '/icons/dock/messages.png',   // Sixth dock icon (decorative)
  },

  // WINDOW ICONS (in title bars)
  window: {
    welcome: '/icons/window/welcome.png',
    features: '/icons/window/features.png',
    showcase: '/icons/window/showcase.png',
    pricing: '/icons/window/pricing.png',
  },
};

// Set to true to use image files, false to use built-in SVG icons
export const USE_IMAGE_ICONS = false;
