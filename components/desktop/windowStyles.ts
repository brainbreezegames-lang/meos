/**
 * UNIFIED WINDOW STYLES - Single source of truth
 * ALL windows in the app MUST use these exact values
 * NO hardcoded values allowed in individual window components
 */

// Window container styles
export const WINDOW_STYLES = {
  // Border - 2px solid dark (dock app style)
  border: '2px solid var(--color-text-primary, #171412)',
  borderMaximized: 'none',

  // Border radius - consistent everywhere
  borderRadius: '12px',
  borderRadiusMaximized: '0',

  // Background
  background: 'var(--color-bg-base, #fbf9ef)',

  // Shadows
  shadowActive: 'var(--shadow-window, 0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12), 0 24px 60px rgba(23, 20, 18, 0.08))',
  shadowInactive: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',

  // Opacity
  opacityActive: 1,
  opacityInactive: 0.96,
} as const;

// Title bar styles
export const TITLE_BAR_STYLES = {
  height: '52px',
  background: 'var(--color-bg-base, #fbf9ef)',
  borderBottom: '2px solid var(--color-text-primary, #171412)',
  paddingX: '16px', // px-4
} as const;

// Traffic light styles - EXACTLY like macOS
export const TRAFFIC_LIGHT_STYLES = {
  size: '12px',
  gap: '8px',

  // Colors
  close: 'var(--color-traffic-close, #ff5f57)',
  minimize: 'var(--color-traffic-minimize, #ffbd2e)',
  maximize: 'var(--color-traffic-maximize, #28c840)',

  // Icon colors (shown on hover)
  closeIcon: 'rgba(77, 0, 0, 0.7)',
  minimizeIcon: 'rgba(100, 65, 0, 0.7)',
  maximizeIcon: 'rgba(0, 70, 0, 0.7)',

  // Common button style
  buttonStyle: {
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
} as const;

// Helper function to get window container styles
export function getWindowContainerStyle(isMaximized: boolean, isActive: boolean): React.CSSProperties {
  return {
    borderRadius: isMaximized ? WINDOW_STYLES.borderRadiusMaximized : WINDOW_STYLES.borderRadius,
    background: WINDOW_STYLES.background,
    border: isMaximized ? WINDOW_STYLES.borderMaximized : WINDOW_STYLES.border,
    boxShadow: isActive ? WINDOW_STYLES.shadowActive : WINDOW_STYLES.shadowInactive,
    opacity: isActive ? WINDOW_STYLES.opacityActive : WINDOW_STYLES.opacityInactive,
  };
}

// Helper function to get title bar styles
export function getTitleBarStyle(isMaximized: boolean): React.CSSProperties {
  return {
    height: TITLE_BAR_STYLES.height,
    background: TITLE_BAR_STYLES.background,
    borderBottom: TITLE_BAR_STYLES.borderBottom,
    cursor: isMaximized ? 'default' : 'grab',
  };
}

// Helper function to get traffic light button style
export function getTrafficLightStyle(color: string): React.CSSProperties {
  return {
    width: TRAFFIC_LIGHT_STYLES.size,
    height: TRAFFIC_LIGHT_STYLES.size,
    background: color,
    ...TRAFFIC_LIGHT_STYLES.buttonStyle,
  };
}
