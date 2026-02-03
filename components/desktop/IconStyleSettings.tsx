'use client';

import { motion } from 'framer-motion';
import {
  useIconStyle,
  VISUAL_DIRECTIONS,
  RENDER_STYLES,
  type IconVisualDirection,
  type IconRenderStyle,
} from '@/contexts/IconStyleContext';
import { IconTile } from '@/components/ui/IconTile';

// Sample icons for preview
const PREVIEW_ICONS = ['📁', '⚙️', '🎨', '📝'];

function DirectionPreview({
  direction,
  renderStyle,
  isActive,
  onClick,
}: {
  direction: IconVisualDirection;
  renderStyle: IconRenderStyle;
  isActive: boolean;
  onClick: () => void;
}) {
  const info = VISUAL_DIRECTIONS[direction];

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-xl p-3 transition-all"
      style={{
        background: isActive ? 'var(--color-bg-subtle)' : 'transparent',
        boxShadow: isActive ? '0 0 0 2px var(--color-accent-primary)' : 'none',
      }}
    >
      {/* Icon grid preview */}
      <div
        className="grid grid-cols-2 gap-1.5 p-2 rounded-lg transition-transform"
        style={{
          background: info.palette.surface,
          border: `1px solid ${info.palette.primary}15`,
          transform: isActive ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {PREVIEW_ICONS.map((icon, i) => (
          <IconTile
            key={i}
            icon={icon}
            size="dock"
            customSize={32}
            direction={direction}
            style={renderStyle}
            interactive={false}
          />
        ))}
      </div>

      {/* Label */}
      <div className="text-center">
        <div
          className="text-[12px] font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {info.name}
        </div>
        <div
          className="text-[10px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {info.description}
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-accent-primary)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </button>
  );
}

function StyleToggle({
  isActive,
  onClick,
  style,
  currentDirection,
}: {
  isActive: boolean;
  onClick: () => void;
  style: IconRenderStyle;
  currentDirection: IconVisualDirection;
}) {
  const info = RENDER_STYLES[style];

  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center gap-3 p-3 rounded-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: isActive ? 'var(--color-bg-subtle)' : 'transparent',
        border: isActive ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)',
      }}
    >
      {/* Single icon preview */}
      <IconTile
        icon="🎯"
        customSize={40}
        direction={currentDirection}
        style={style}
        interactive={false}
      />

      <div className="text-left">
        <div
          className="text-[13px] font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {info.name}
        </div>
        <div
          className="text-[11px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {info.description}
        </div>
      </div>

      {/* Radio indicator */}
      <div
        className="ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
        style={{
          borderColor: isActive ? 'var(--color-accent-primary)' : 'var(--color-border-strong)',
        }}
      >
        {isActive && (
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: 'var(--color-accent-primary)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          />
        )}
      </div>
    </button>
  );
}

export function IconStyleSettings() {
  const {
    config,
    setVisualDirection,
    setRenderStyle,
    availableDirections,
    availableStyles,
  } = useIconStyle();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3
          className="text-[13px] font-medium uppercase tracking-wide mb-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Icon Style
        </h3>
        <p
          className="text-[12px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Customize the look and feel of app icons
        </p>
      </div>

      {/* Visual Direction */}
      <div>
        <label
          className="text-[13px] font-medium mb-3 block"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Visual Direction
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableDirections.map((direction) => (
            <DirectionPreview
              key={direction.id}
              direction={direction.id}
              renderStyle={config.renderStyle}
              isActive={config.visualDirection === direction.id}
              onClick={() => setVisualDirection(direction.id)}
            />
          ))}
        </div>
      </div>

      {/* Render Style */}
      <div>
        <label
          className="text-[13px] font-medium mb-3 block"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Icon Depth
        </label>
        <div className="flex gap-2">
          {availableStyles.map((style) => (
            <StyleToggle
              key={style.id}
              style={style.id}
              isActive={config.renderStyle === style.id}
              onClick={() => setRenderStyle(style.id)}
              currentDirection={config.visualDirection}
            />
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <label
          className="text-[13px] font-medium mb-3 block"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Preview
        </label>
        <div
          className="p-4 rounded-xl flex items-center justify-center gap-3"
          style={{
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <IconTile icon="📁" size="desktop" />
          <IconTile icon="⚙️" size="desktop" />
          <IconTile icon="🎨" size="desktop" />
          <IconTile icon="📝" size="desktop" />
          <IconTile icon="🌐" size="desktop" />
        </div>
      </div>
    </div>
  );
}
