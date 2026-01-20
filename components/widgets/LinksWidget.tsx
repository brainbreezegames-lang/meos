'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ExternalLink, ChevronDown, Twitter, Github, Linkedin, Instagram, Youtube, Globe } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface LinkItem {
  name: string;
  url: string;
  icon?: string;
}

interface LinksWidgetConfig {
  links: LinkItem[];
}

interface LinksWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onPositionChange?: (x: number, y: number) => void;
}

const DEFAULT_CONFIG: LinksWidgetConfig = {
  links: [],
};

// Map icon names to Lucide icons
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
  link: Link2,
};

function getIcon(iconName?: string) {
  if (!iconName) return ExternalLink;
  const lowerName = iconName.toLowerCase();
  return ICON_MAP[lowerName] || ExternalLink;
}

export function LinksWidget({ widget, isOwner, onEdit, onPositionChange }: LinksWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config: LinksWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<LinksWidgetConfig>) };

  const hasLinks = config.links && config.links.length > 0;

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onPositionChange={onPositionChange}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            onClick={() => setIsExpanded(true)}
            className="relative"
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {/* Glass background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--bg-glass-elevated, rgba(255,255,255,0.92))',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              }}
            />

            {/* Content */}
            <div
              className="relative flex items-center gap-2"
              style={{
                padding: '10px 14px',
              }}
            >
              <Link2
                size={16}
                style={{ color: 'var(--text-secondary, #666)' }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary, #1a1a1a)',
                  fontFamily: 'var(--font-body, system-ui)',
                  whiteSpace: 'nowrap',
                }}
              >
                {widget.title || 'Links'}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  size={14}
                  style={{ color: 'var(--text-tertiary, #888)' }}
                />
              </motion.div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            className="relative"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              minWidth: '160px',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Glass background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--bg-glass-elevated, rgba(255,255,255,0.95))',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              }}
            />

            {/* Content */}
            <div className="relative">
              {/* Header */}
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full flex items-center justify-between"
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-light, rgba(0,0,0,0.06))',
                }}
              >
                <div className="flex items-center gap-2">
                  <Link2
                    size={14}
                    style={{ color: 'var(--text-secondary, #666)' }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #1a1a1a)',
                      fontFamily: 'var(--font-body, system-ui)',
                    }}
                  >
                    {widget.title || 'Links'}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    size={14}
                    style={{ color: 'var(--text-tertiary, #888)' }}
                  />
                </motion.div>
              </button>

              {/* Links list */}
              <div style={{ padding: '6px' }}>
                {!hasLinks ? (
                  <div
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: 'var(--text-tertiary, #888)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-body, system-ui)',
                    }}
                  >
                    No links added yet
                  </div>
                ) : (
                  config.links.map((link, index) => {
                    const IconComponent = getIcon(link.icon);
                    return (
                      <motion.a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3"
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                        }}
                        whileHover={{
                          backgroundColor: 'var(--bg-hover, rgba(0,0,0,0.04))',
                        }}
                      >
                        <IconComponent
                          size={16}
                          className="flex-shrink-0"
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--text-primary, #1a1a1a)',
                            fontFamily: 'var(--font-body, system-ui)',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {link.name}
                        </span>
                        <ExternalLink
                          size={12}
                          style={{ color: 'var(--text-tertiary, #888)', flexShrink: 0 }}
                        />
                      </motion.a>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as LINKS_WIDGET_DEFAULT_CONFIG };
