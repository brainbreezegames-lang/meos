'use client';

import React from 'react';

// ============================================================================
// DESIGN SYSTEM PREVIEW PAGE
// Visual reference for all design tokens
// ============================================================================

export default function DesignSystemPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-body)',
        padding: '48px',
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 64 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: 'var(--letter-spacing-tight)',
          }}
        >
          goOS Design System
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: 600,
          }}
        >
          Visual reference for all design tokens. Warm creative studio aesthetic.
        </p>
      </header>

      {/* Colors Section */}
      <Section title="Colors">
        {/* Backgrounds */}
        <Subsection title="Backgrounds">
          <ColorGrid>
            <ColorSwatch name="bg-base" color="var(--color-bg-base)" hex="#fbf9ef" />
            <ColorSwatch name="bg-elevated" color="var(--color-bg-elevated)" hex="rgba(255,255,255,0.85)" />
            <ColorSwatch name="bg-subtle" color="var(--color-bg-subtle)" hex="#f2f0e7" />
            <ColorSwatch name="bg-subtle-hover" color="var(--color-bg-subtle-hover)" hex="#ebe9df" />
            <ColorSwatch name="bg-inverse" color="var(--color-bg-inverse)" hex="#171412" dark />
            <ColorSwatch name="bg-white" color="var(--color-bg-white)" hex="#ffffff" />
          </ColorGrid>
        </Subsection>

        {/* Text Colors */}
        <Subsection title="Text">
          <ColorGrid>
            <ColorSwatch name="text-primary" color="var(--color-text-primary)" hex="#171412" dark />
            <ColorSwatch name="text-secondary" color="var(--color-text-secondary)" hex="#4a4744" dark />
            <ColorSwatch name="text-muted" color="var(--color-text-muted)" hex="#8e827c" />
            <ColorSwatch name="text-inverse" color="var(--color-text-inverse)" hex="#ffffff" border />
          </ColorGrid>
        </Subsection>

        {/* Accent Colors */}
        <Subsection title="Accent - Primary (Orange)">
          <ColorGrid>
            <ColorSwatch name="accent-primary" color="var(--color-accent-primary)" hex="#ff7722" />
            <ColorSwatch name="accent-primary-hover" color="var(--color-accent-primary-hover)" hex="#e5691e" />
            <ColorSwatch name="accent-primary-active" color="var(--color-accent-primary-active)" hex="#cc5d1a" />
            <ColorSwatch name="accent-primary-subtle" color="var(--color-accent-primary-subtle)" hex="rgba(255,119,34,0.1)" />
            <ColorSwatch name="accent-primary-glow" color="var(--color-accent-primary-glow)" hex="rgba(255,119,34,0.4)" />
          </ColorGrid>
        </Subsection>

        <Subsection title="Accent - Secondary (Purple)">
          <ColorGrid>
            <ColorSwatch name="accent-secondary" color="var(--color-accent-secondary)" hex="#3d2fa9" dark />
            <ColorSwatch name="accent-secondary-hover" color="var(--color-accent-secondary-hover)" hex="#352994" dark />
            <ColorSwatch name="accent-secondary-subtle" color="var(--color-accent-secondary-subtle)" hex="rgba(61,47,169,0.1)" />
          </ColorGrid>
        </Subsection>

        {/* Semantic Colors */}
        <Subsection title="Semantic">
          <ColorGrid>
            <ColorSwatch name="success" color="var(--color-success)" hex="#22c55e" />
            <ColorSwatch name="success-subtle" color="var(--color-success-subtle)" hex="rgba(34,197,94,0.15)" />
            <ColorSwatch name="warning" color="var(--color-warning)" hex="#ffc765" />
            <ColorSwatch name="warning-subtle" color="var(--color-warning-subtle)" hex="rgba(255,199,101,0.2)" />
            <ColorSwatch name="error" color="var(--color-error)" hex="#ff3c34" />
            <ColorSwatch name="error-subtle" color="var(--color-error-subtle)" hex="rgba(255,60,52,0.1)" />
          </ColorGrid>
        </Subsection>

        {/* Traffic Lights */}
        <Subsection title="Traffic Lights (Window Controls)">
          <ColorGrid>
            <ColorSwatch name="traffic-close" color="var(--color-traffic-close)" hex="#ff5f57" />
            <ColorSwatch name="traffic-minimize" color="var(--color-traffic-minimize)" hex="#ffbd2e" />
            <ColorSwatch name="traffic-maximize" color="var(--color-traffic-maximize)" hex="#28c840" />
            <ColorSwatch name="traffic-inactive" color="var(--color-traffic-inactive)" hex="rgba(23,20,18,0.15)" />
          </ColorGrid>
        </Subsection>

        {/* Borders */}
        <Subsection title="Borders">
          <ColorGrid>
            <ColorSwatch name="border-default" color="var(--color-border-default)" hex="rgba(23,20,18,0.08)" />
            <ColorSwatch name="border-subtle" color="var(--color-border-subtle)" hex="rgba(23,20,18,0.05)" />
            <ColorSwatch name="border-strong" color="var(--color-border-strong)" hex="rgba(23,20,18,0.15)" />
          </ColorGrid>
        </Subsection>
      </Section>

      {/* Typography Section */}
      <Section title="Typography">
        <Subsection title="Font Families">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Display / Headings
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>
                Averia Serif Libre
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Body / UI
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 32 }}>
                Instrument Sans
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Monospace
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 32 }}>
                SF Mono / Cascadia
              </p>
            </div>
          </div>
        </Subsection>

        <Subsection title="Type Scale (Major Third 1.25)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TypeSample name="5xl" size="var(--font-size-5xl)" desc="48-72px Display" />
            <TypeSample name="4xl" size="var(--font-size-4xl)" desc="40-56px H1" />
            <TypeSample name="3xl" size="var(--font-size-3xl)" desc="30-40px H2" />
            <TypeSample name="2xl" size="var(--font-size-2xl)" desc="24-30px H3" />
            <TypeSample name="xl" size="var(--font-size-xl)" desc="20-24px H4" />
            <TypeSample name="lg" size="var(--font-size-lg)" desc="18-20px Large" />
            <TypeSample name="md" size="var(--font-size-md)" desc="16-18px Medium" />
            <TypeSample name="base" size="var(--font-size-base)" desc="14-16px Body" />
            <TypeSample name="sm" size="var(--font-size-sm)" desc="12-14px Small" />
            <TypeSample name="xs" size="var(--font-size-xs)" desc="10-12px Caption" />
          </div>
        </Subsection>

        <Subsection title="Font Weights">
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 400 }}>400 Normal</span>
            <span style={{ fontWeight: 500 }}>500 Medium</span>
            <span style={{ fontWeight: 600 }}>600 Semibold</span>
            <span style={{ fontWeight: 700 }}>700 Bold</span>
          </div>
        </Subsection>
      </Section>

      {/* Spacing Section */}
      <Section title="Spacing Scale (8-point grid)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SpacingSample name="space-1" value="4px" />
          <SpacingSample name="space-2" value="8px" />
          <SpacingSample name="space-3" value="12px" />
          <SpacingSample name="space-4" value="16px" />
          <SpacingSample name="space-5" value="20px" />
          <SpacingSample name="space-6" value="24px" />
          <SpacingSample name="space-8" value="32px" />
          <SpacingSample name="space-10" value="40px" />
          <SpacingSample name="space-12" value="48px" />
          <SpacingSample name="space-16" value="64px" />
          <SpacingSample name="space-20" value="80px" />
          <SpacingSample name="space-24" value="96px" />
        </div>
      </Section>

      {/* Border Radius Section */}
      <Section title="Border Radius">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <RadiusSample name="xs" value="4px" />
          <RadiusSample name="sm" value="6px" />
          <RadiusSample name="md" value="10px" />
          <RadiusSample name="lg" value="12px" />
          <RadiusSample name="xl" value="14px" />
          <RadiusSample name="xxl" value="16px" />
          <RadiusSample name="dock" value="20px" />
          <RadiusSample name="full" value="9999px" />
        </div>
      </Section>

      {/* Shadows Section */}
      <Section title="Shadows">
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <ShadowSample name="sm" shadow="var(--shadow-sm)" />
          <ShadowSample name="md" shadow="var(--shadow-md)" />
          <ShadowSample name="lg" shadow="var(--shadow-lg)" />
          <ShadowSample name="xl" shadow="var(--shadow-xl)" />
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <ShadowSample name="window" shadow="var(--shadow-window)" />
          <ShadowSample name="dock" shadow="var(--shadow-dock)" />
          <ShadowSample name="dropdown" shadow="var(--shadow-dropdown)" />
        </div>
      </Section>

      {/* Blur / Glassmorphism */}
      <Section title="Blur / Glassmorphism">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <BlurSample name="subtle" value="12px" />
          <BlurSample name="medium" value="20px" />
          <BlurSample name="heavy" value="24px" />
        </div>
      </Section>

      {/* Interactive States */}
      <Section title="Interactive States">
        <Subsection title="Focus Ring">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <button
              style={{
                padding: '12px 24px',
                background: 'var(--color-accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                boxShadow: 'var(--focus-ring)',
              }}
            >
              Focused Button
            </button>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              2px orange ring with 2px offset
            </span>
          </div>
        </Subsection>

        <Subsection title="Opacity States">
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <OpacitySample name="disabled" value="0.5" />
            <OpacitySample name="hover" value="0.9" />
            <OpacitySample name="loading" value="0.7" />
            <OpacitySample name="placeholder" value="0.5" />
          </div>
        </Subsection>
      </Section>

      {/* Transitions */}
      <Section title="Transitions">
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <TransitionSample name="fast" value="150ms" />
          <TransitionSample name="medium" value="200ms" />
          <TransitionSample name="slow" value="300ms" />
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 600,
          marginBottom: 24,
          paddingBottom: 12,
          borderBottom: '2px solid var(--color-border-default)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 16,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ColorGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}

function ColorSwatch({
  name,
  color,
  hex,
  dark,
  border,
}: {
  name: string;
  color: string;
  hex: string;
  dark?: boolean;
  border?: boolean;
}) {
  return (
    <div style={{ width: 140 }}>
      <div
        style={{
          width: '100%',
          height: 80,
          background: color,
          borderRadius: 'var(--radius-lg)',
          marginBottom: 8,
          border: border ? '1px solid var(--color-border-default)' : 'none',
          boxShadow: 'var(--shadow-sm)',
        }}
      />
      <p style={{ fontSize: 13, fontWeight: 500, color: dark ? color : 'var(--color-text-primary)' }}>
        {name}
      </p>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {hex}
      </p>
    </div>
  );
}

function TypeSample({ name, size, desc }: { name: string; size: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
      <span
        style={{
          width: 60,
          fontSize: 12,
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {name}
      </span>
      <span style={{ fontSize: size, fontWeight: 500 }}>
        The quick brown fox
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
        {desc}
      </span>
    </div>
  );
}

function SpacingSample({ name, value }: { name: string; value: string }) {
  const numValue = parseInt(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span
        style={{
          width: 100,
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
        }}
      >
        {name}
      </span>
      <div
        style={{
          width: numValue,
          height: 24,
          background: 'var(--color-accent-primary)',
          borderRadius: 4,
        }}
      />
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{value}</span>
    </div>
  );
}

function RadiusSample({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 64,
          background: 'var(--color-accent-primary-subtle)',
          border: '2px solid var(--color-accent-primary)',
          borderRadius: value,
          marginBottom: 8,
        }}
      />
      <p style={{ fontSize: 12, fontWeight: 500 }}>{name}</p>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
    </div>
  );
}

function ShadowSample({ name, shadow }: { name: string; shadow: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 120,
          height: 80,
          background: 'var(--color-bg-white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: shadow,
          marginBottom: 12,
        }}
      />
      <p style={{ fontSize: 13, fontWeight: 500 }}>{name}</p>
    </div>
  );
}

function BlurSample({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 120,
          height: 80,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: `blur(${value})`,
          WebkitBackdropFilter: `blur(${value})`,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255,255,255,0.5)',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 12,
        }}
      >
        Glass
      </div>
      <p style={{ fontSize: 13, fontWeight: 500 }}>{name}</p>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
    </div>
  );
}

function OpacitySample({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 100,
          height: 48,
          background: 'var(--color-accent-primary)',
          borderRadius: 'var(--radius-md)',
          opacity: parseFloat(value),
          marginBottom: 8,
        }}
      />
      <p style={{ fontSize: 13, fontWeight: 500 }}>{name}</p>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
    </div>
  );
}

function TransitionSample({ name, value }: { name: string; value: string }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 100,
          height: 48,
          background: hovered ? 'var(--color-accent-primary)' : 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 8,
          cursor: 'pointer',
          transition: `all ${value} var(--ease-out)`,
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      <p style={{ fontSize: 13, fontWeight: 500 }}>{name}</p>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
    </div>
  );
}
