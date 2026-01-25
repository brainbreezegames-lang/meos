'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '@/styles/design-system.css';

// ============================================================================
// DESIGN SYSTEM - VISUAL REFERENCE
// Complete visual reference for goOS design tokens and components
// ============================================================================

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'components'>('colors');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fbf9ef',
        color: '#171412',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '32px 48px',
          borderBottom: '1px solid rgba(23, 20, 18, 0.08)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
            color: '#171412',
          }}
        >
          goOS Design System
        </h1>
        <p style={{ fontSize: 16, color: '#4a4744', marginBottom: 24 }}>
          Visual reference for all design tokens and components
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['colors', 'typography', 'spacing', 'components'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                background: activeTab === tab ? '#ff7722' : 'rgba(23, 20, 18, 0.05)',
                color: activeTab === tab ? '#ffffff' : '#171412',
                transition: 'all 150ms ease',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: '48px' }}>
        {activeTab === 'colors' && <ColorsSection />}
        {activeTab === 'typography' && <TypographySection />}
        {activeTab === 'spacing' && <SpacingSection />}
        {activeTab === 'components' && <ComponentsSection />}
      </main>
    </div>
  );
}

// ============================================================================
// COLORS SECTION
// ============================================================================

function ColorsSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Backgrounds */}
      <ColorGroup title="Backgrounds">
        <ColorSwatch name="bg-base" color="#fbf9ef" />
        <ColorSwatch name="bg-elevated" color="rgba(255, 255, 255, 0.85)" border />
        <ColorSwatch name="bg-subtle" color="#f2f0e7" />
        <ColorSwatch name="bg-subtle-hover" color="#ebe9df" />
        <ColorSwatch name="bg-inverse" color="#171412" dark />
        <ColorSwatch name="bg-white" color="#ffffff" border />
      </ColorGroup>

      {/* Text */}
      <ColorGroup title="Text Colors">
        <ColorSwatch name="text-primary" color="#171412" dark />
        <ColorSwatch name="text-secondary" color="#4a4744" dark />
        <ColorSwatch name="text-muted" color="#8e827c" />
        <ColorSwatch name="text-inverse" color="#ffffff" border />
      </ColorGroup>

      {/* Accent Primary */}
      <ColorGroup title="Accent - Primary (Orange)">
        <ColorSwatch name="accent-primary" color="#ff7722" />
        <ColorSwatch name="accent-primary-hover" color="#e5691e" />
        <ColorSwatch name="accent-primary-active" color="#cc5d1a" />
        <ColorSwatch name="accent-primary-subtle" color="rgba(255, 119, 34, 0.1)" border />
        <ColorSwatch name="accent-primary-glow" color="rgba(255, 119, 34, 0.4)" />
      </ColorGroup>

      {/* Accent Secondary */}
      <ColorGroup title="Accent - Secondary (Purple)">
        <ColorSwatch name="accent-secondary" color="#3d2fa9" dark />
        <ColorSwatch name="accent-secondary-hover" color="#352994" dark />
        <ColorSwatch name="accent-secondary-subtle" color="rgba(61, 47, 169, 0.1)" border />
      </ColorGroup>

      {/* Semantic */}
      <ColorGroup title="Semantic Colors">
        <ColorSwatch name="success" color="#22c55e" />
        <ColorSwatch name="success-subtle" color="rgba(34, 197, 94, 0.15)" border />
        <ColorSwatch name="warning" color="#ffc765" />
        <ColorSwatch name="warning-subtle" color="rgba(255, 199, 101, 0.2)" border />
        <ColorSwatch name="error" color="#ff3c34" />
        <ColorSwatch name="error-subtle" color="rgba(255, 60, 52, 0.1)" border />
      </ColorGroup>

      {/* Traffic Lights */}
      <ColorGroup title="Traffic Lights (Window Controls)">
        <ColorSwatch name="close" color="#ff5f57" size="small" />
        <ColorSwatch name="minimize" color="#ffbd2e" size="small" />
        <ColorSwatch name="maximize" color="#28c840" size="small" />
        <ColorSwatch name="inactive" color="rgba(23, 20, 18, 0.15)" size="small" border />
      </ColorGroup>

      {/* Borders */}
      <ColorGroup title="Borders">
        <ColorSwatch name="border-default" color="rgba(23, 20, 18, 0.08)" border />
        <ColorSwatch name="border-subtle" color="rgba(23, 20, 18, 0.05)" border />
        <ColorSwatch name="border-strong" color="rgba(23, 20, 18, 0.15)" border />
      </ColorGroup>
    </div>
  );
}

// ============================================================================
// TYPOGRAPHY SECTION
// ============================================================================

function TypographySection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Font Families */}
      <div>
        <SectionTitle>Font Families</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
          <div
            style={{
              padding: 24,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid rgba(23, 20, 18, 0.08)',
            }}
          >
            <p style={{ fontSize: 12, color: '#8e827c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Display / Headings
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#171412' }}>
              Averia Serif Libre
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#4a4744', marginTop: 8 }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>

          <div
            style={{
              padding: 24,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid rgba(23, 20, 18, 0.08)',
            }}
          >
            <p style={{ fontSize: 12, color: '#8e827c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Body / UI
            </p>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 36, color: '#171412' }}>
              Instrument Sans
            </p>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 18, color: '#4a4744', marginTop: 8 }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>

          <div
            style={{
              padding: 24,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid rgba(23, 20, 18, 0.08)',
            }}
          >
            <p style={{ fontSize: 12, color: '#8e827c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monospace
            </p>
            <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 36, color: '#171412' }}>
              SF Mono
            </p>
            <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 18, color: '#4a4744', marginTop: 8 }}>
              const goOS = &quot;awesome&quot;;
            </p>
          </div>
        </div>
      </div>

      {/* Type Scale */}
      <div>
        <SectionTitle>Type Scale (Major Third 1.25)</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid rgba(23, 20, 18, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <TypeRow name="5xl" size={48} desc="Display" />
          <TypeRow name="4xl" size={40} desc="H1" />
          <TypeRow name="3xl" size={32} desc="H2" />
          <TypeRow name="2xl" size={24} desc="H3" />
          <TypeRow name="xl" size={20} desc="H4" />
          <TypeRow name="lg" size={18} desc="Large" />
          <TypeRow name="md" size={16} desc="Medium" />
          <TypeRow name="base" size={14} desc="Body" />
          <TypeRow name="sm" size={12} desc="Small" />
          <TypeRow name="xs" size={10} desc="Caption" />
        </div>
      </div>

      {/* Font Weights */}
      <div>
        <SectionTitle>Font Weights</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid rgba(23, 20, 18, 0.08)',
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 400 }}>400 Normal</span>
          <span style={{ fontSize: 24, fontWeight: 500 }}>500 Medium</span>
          <span style={{ fontSize: 24, fontWeight: 600 }}>600 Semibold</span>
          <span style={{ fontSize: 24, fontWeight: 700 }}>700 Bold</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SPACING SECTION
// ============================================================================

function SpacingSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Spacing Scale */}
      <div>
        <SectionTitle>Spacing Scale (8-point grid)</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid rgba(23, 20, 18, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <SpaceRow name="space-1" value={4} desc="Tight: icon padding" />
          <SpaceRow name="space-2" value={8} desc="Compact: button padding" />
          <SpaceRow name="space-3" value={12} desc="Default: card padding" />
          <SpaceRow name="space-4" value={16} desc="Comfortable: section gaps" />
          <SpaceRow name="space-5" value={20} desc="Relaxed: card margins" />
          <SpaceRow name="space-6" value={24} desc="Spacious: section padding" />
          <SpaceRow name="space-8" value={32} desc="Large: major section gaps" />
          <SpaceRow name="space-10" value={40} desc="Extra large: page margins" />
          <SpaceRow name="space-12" value={48} desc="Hero sections" />
          <SpaceRow name="space-16" value={64} desc="Major page sections" />
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <SectionTitle>Border Radius</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid rgba(23, 20, 18, 0.08)',
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <RadiusBox name="xs" value={4} />
          <RadiusBox name="sm" value={6} />
          <RadiusBox name="md" value={10} />
          <RadiusBox name="lg" value={12} />
          <RadiusBox name="xl" value={14} />
          <RadiusBox name="xxl" value={16} />
          <RadiusBox name="dock" value={20} />
          <RadiusBox name="full" value={9999} />
        </div>
      </div>

      {/* Shadows */}
      <div>
        <SectionTitle>Shadows</SectionTitle>
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
          }}
        >
          <ShadowBox name="sm" shadow="0 2px 8px rgba(23, 20, 18, 0.06)" />
          <ShadowBox name="md" shadow="0 4px 20px rgba(23, 20, 18, 0.08)" />
          <ShadowBox name="lg" shadow="0 8px 32px rgba(23, 20, 18, 0.12)" />
          <ShadowBox name="xl" shadow="0 16px 48px rgba(23, 20, 18, 0.15)" />
          <ShadowBox
            name="window"
            shadow="0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12)"
          />
          <ShadowBox name="dock" shadow="0 8px 32px rgba(23, 20, 18, 0.12)" />
        </div>
      </div>

      {/* Blur */}
      <div>
        <SectionTitle>Blur / Glassmorphism</SectionTitle>
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 24,
            padding: 24,
            background: 'linear-gradient(135deg, #ff7722 0%, #3d2fa9 100%)',
            borderRadius: 12,
          }}
        >
          <BlurBox name="subtle" value={12} />
          <BlurBox name="medium" value={20} />
          <BlurBox name="heavy" value={24} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTS SECTION
// ============================================================================

function ComponentsSection() {
  const [buttonHover, setButtonHover] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Buttons */}
      <div>
        <SectionTitle>Buttons</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid rgba(23, 20, 18, 0.08)',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              background: '#ff7722',
              color: '#ffffff',
            }}
          >
            Primary Button
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              border: '1px solid rgba(23, 20, 18, 0.15)',
              borderRadius: 10,
              cursor: 'pointer',
              background: 'transparent',
              color: '#171412',
            }}
          >
            Secondary Button
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              background: '#3d2fa9',
              color: '#ffffff',
            }}
          >
            Purple Button
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              background: 'rgba(23, 20, 18, 0.05)',
              color: '#171412',
            }}
          >
            Ghost Button
          </motion.button>

          <button
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              borderRadius: 10,
              cursor: 'not-allowed',
              background: '#ff7722',
              color: '#ffffff',
              opacity: 0.5,
            }}
          >
            Disabled
          </button>
        </div>
      </div>

      {/* Traffic Lights */}
      <div>
        <SectionTitle>Window Traffic Lights</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid rgba(23, 20, 18, 0.08)',
            display: 'flex',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.div
              whileHover={{ scale: 1.15 }}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#ff5f57',
                cursor: 'pointer',
              }}
            />
            <motion.div
              whileHover={{ scale: 1.15 }}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#ffbd2e',
                cursor: 'pointer',
              }}
            />
            <motion.div
              whileHover={{ scale: 1.15 }}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#28c840',
                cursor: 'pointer',
              }}
            />
          </div>
          <span style={{ color: '#8e827c', fontSize: 14 }}>Active state</span>

          <div style={{ display: 'flex', gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'rgba(23, 20, 18, 0.15)',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'rgba(23, 20, 18, 0.15)',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'rgba(23, 20, 18, 0.15)',
              }}
            />
          </div>
          <span style={{ color: '#8e827c', fontSize: 14 }}>Inactive state</span>
        </div>
      </div>

      {/* Window */}
      <div>
        <SectionTitle>Window</SectionTitle>
        <div style={{ marginTop: 16 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%',
              maxWidth: 500,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              borderRadius: 12,
              boxShadow: '0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12), 0 24px 60px rgba(23, 20, 18, 0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderBottom: '1px solid rgba(23, 20, 18, 0.05)',
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#171412' }}>
                Window Title
              </span>
              <div style={{ width: 52 }} />
            </div>
            {/* Content */}
            <div style={{ padding: 24 }}>
              <p style={{ color: '#4a4744', lineHeight: 1.6 }}>
                This is a sample window component with the goOS design system applied.
                It features glassmorphism, warm shadows, and traffic light controls.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dock */}
      <div>
        <SectionTitle>Dock</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 32,
            background: 'linear-gradient(180deg, #f2f0e7 0%, #e8e5db 100%)',
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <motion.div
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 8px 32px rgba(23, 20, 18, 0.12)',
            }}
          >
            {['📁', '📝', '🖼️', '🔗', '⚙️'].map((icon, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.15 }}
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                {icon}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Desktop Icon */}
      <div>
        <SectionTitle>Desktop Icons</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 32,
            background: 'linear-gradient(180deg, #f2f0e7 0%, #e8e5db 100%)',
            borderRadius: 12,
            display: 'flex',
            gap: 32,
          }}
        >
          {[
            { icon: '📁', name: 'Projects' },
            { icon: '📝', name: 'About Me' },
            { icon: '🖼️', name: 'Gallery' },
            { icon: '🔗', name: 'Links' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px rgba(23, 20, 18, 0.06)',
                }}
              >
                {item.icon}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#171412',
                  textAlign: 'center',
                  maxWidth: 80,
                }}
              >
                {item.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div>
        <SectionTitle>Cards</SectionTitle>
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24,
          }}
        >
          <motion.div
            whileHover={{ y: -4 }}
            style={{
              padding: 24,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid rgba(23, 20, 18, 0.08)',
              boxShadow: '0 2px 8px rgba(23, 20, 18, 0.06)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Basic Card</h3>
            <p style={{ fontSize: 14, color: '#4a4744', lineHeight: 1.5 }}>
              A simple card with subtle shadow and border.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            style={{
              padding: 24,
              background: 'linear-gradient(135deg, #ff7722 0%, #e5691e 100%)',
              borderRadius: 12,
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(255, 119, 34, 0.3)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Accent Card</h3>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5 }}>
              A card with the primary accent color gradient.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            style={{
              padding: 24,
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 20px rgba(23, 20, 18, 0.08)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Glass Card</h3>
            <p style={{ fontSize: 14, color: '#4a4744', lineHeight: 1.5 }}>
              A card with glassmorphism effect.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Inputs */}
      <div>
        <SectionTitle>Inputs</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid rgba(23, 20, 18, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxWidth: 400,
          }}
        >
          <input
            type="text"
            placeholder="Default input"
            style={{
              padding: '12px 16px',
              fontSize: 14,
              border: '1px solid rgba(23, 20, 18, 0.15)',
              borderRadius: 10,
              outline: 'none',
              background: '#ffffff',
            }}
          />
          <input
            type="text"
            placeholder="Focused input (click me)"
            style={{
              padding: '12px 16px',
              fontSize: 14,
              border: '2px solid #ff7722',
              borderRadius: 10,
              outline: 'none',
              background: '#ffffff',
            }}
          />
          <input
            type="text"
            placeholder="Disabled input"
            disabled
            style={{
              padding: '12px 16px',
              fontSize: 14,
              border: '1px solid rgba(23, 20, 18, 0.08)',
              borderRadius: 10,
              outline: 'none',
              background: '#f2f0e7',
              opacity: 0.5,
              cursor: 'not-allowed',
            }}
          />
        </div>
      </div>

      {/* Badges */}
      <div>
        <SectionTitle>Badges & Tags</SectionTitle>
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid rgba(23, 20, 18, 0.08)',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              background: '#ff7722',
              color: '#ffffff',
              borderRadius: 9999,
            }}
          >
            Primary
          </span>
          <span
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              background: 'rgba(255, 119, 34, 0.1)',
              color: '#ff7722',
              borderRadius: 9999,
            }}
          >
            Primary Subtle
          </span>
          <span
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              background: '#22c55e',
              color: '#ffffff',
              borderRadius: 9999,
            }}
          >
            Success
          </span>
          <span
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              background: '#ffc765',
              color: '#171412',
              borderRadius: 9999,
            }}
          >
            Warning
          </span>
          <span
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              background: '#ff3c34',
              color: '#ffffff',
              borderRadius: 9999,
            }}
          >
            Error
          </span>
          <span
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              background: 'rgba(23, 20, 18, 0.05)',
              color: '#4a4744',
              borderRadius: 9999,
            }}
          >
            Neutral
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 600,
        color: '#171412',
        paddingBottom: 12,
        borderBottom: '2px solid rgba(23, 20, 18, 0.08)',
      }}
    >
      {children}
    </h2>
  );
}

function ColorGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#8e827c',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 16,
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function ColorSwatch({
  name,
  color,
  dark,
  border,
  size = 'normal',
}: {
  name: string;
  color: string;
  dark?: boolean;
  border?: boolean;
  size?: 'normal' | 'small';
}) {
  const boxSize = size === 'small' ? 48 : 100;
  return (
    <div style={{ width: size === 'small' ? 80 : 120 }}>
      <div
        style={{
          width: boxSize,
          height: boxSize,
          background: color,
          borderRadius: 12,
          marginBottom: 8,
          border: border ? '1px solid rgba(23, 20, 18, 0.15)' : 'none',
          boxShadow: '0 2px 8px rgba(23, 20, 18, 0.06)',
        }}
      />
      <p style={{ fontSize: 13, fontWeight: 500, color: '#171412' }}>{name}</p>
      <p style={{ fontSize: 11, color: '#8e827c', fontFamily: 'ui-monospace, monospace' }}>
        {color.length > 20 ? color.slice(0, 20) + '...' : color}
      </p>
    </div>
  );
}

function TypeRow({ name, size, desc }: { name: string; size: number; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
      <span
        style={{
          width: 50,
          fontSize: 12,
          color: '#8e827c',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {name}
      </span>
      <span style={{ fontSize: size, fontWeight: 500, color: '#171412', flex: 1 }}>
        The quick brown fox
      </span>
      <span style={{ fontSize: 12, color: '#8e827c' }}>{size}px - {desc}</span>
    </div>
  );
}

function SpaceRow({ name, value, desc }: { name: string; value: number; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span
        style={{
          width: 80,
          fontSize: 12,
          color: '#8e827c',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {name}
      </span>
      <div
        style={{
          width: value,
          height: 24,
          background: '#ff7722',
          borderRadius: 4,
        }}
      />
      <span style={{ fontSize: 13, color: '#4a4744', minWidth: 40 }}>{value}px</span>
      <span style={{ fontSize: 12, color: '#8e827c' }}>{desc}</span>
    </div>
  );
}

function RadiusBox({ name, value }: { name: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 64,
          background: 'rgba(255, 119, 34, 0.1)',
          border: '2px solid #ff7722',
          borderRadius: value,
          marginBottom: 8,
        }}
      />
      <p style={{ fontSize: 12, fontWeight: 500, color: '#171412' }}>{name}</p>
      <p style={{ fontSize: 11, color: '#8e827c', fontFamily: 'ui-monospace, monospace' }}>
        {value === 9999 ? 'full' : value + 'px'}
      </p>
    </div>
  );
}

function ShadowBox({ name, shadow }: { name: string; shadow: string }) {
  return (
    <div
      style={{
        padding: 24,
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: shadow,
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 500, color: '#171412' }}>shadow-{name}</p>
    </div>
  );
}

function BlurBox({ name, value }: { name: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 120,
          height: 80,
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: `blur(${value}px)`,
          WebkitBackdropFilter: `blur(${value}px)`,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 500,
          fontSize: 14,
        }}
      >
        Glass
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#ffffff' }}>{name}</p>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'ui-monospace, monospace' }}>
        {value}px
      </p>
    </div>
  );
}
